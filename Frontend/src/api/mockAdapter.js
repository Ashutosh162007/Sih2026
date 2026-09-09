import { mockAnalytics, mockUsers, seedIssues, seedProjects } from "./mockData.js";
import { ROLES } from "../lib/constants.js";

const delay = (ms = 200) => new Promise((r) => setTimeout(r, ms));

function load(key, fallback) {
  try {
    if (typeof localStorage !== "undefined" && localStorage.getItem) {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : structuredClone(fallback);
    }
    return structuredClone(fallback);
  } catch {
    return structuredClone(fallback);
  }
}

function save(key, value) {
  try {
    if (typeof localStorage !== "undefined" && localStorage.setItem) {
      localStorage.setItem(key, JSON.stringify(value));
    }
  } catch {
    // Ignore storage quota or disabled storage in restricted environments
  }
}

let users = load("sahayog_users", mockUsers).map((u) => {
  if (u.id === "u-reporter" || u.role === "community_reporter" || u.role === "citizen") {
    return {
      ...u,
      role: "citizen",
      email: u.email === "reporter@sahayog.in" ? "citizen@sahayog.in" : u.email,
      org: "",
    };
  }
  return u;
});
let issues = load("sahayog_issues", seedIssues);
let projects = load("sahayog_projects", seedProjects).map((p) => {
  const seed = seedProjects.find((sp) => sp.id === p.id);
  if (seed && !p.certificateStatus) {
    return {
      ...p,
      certificateStatus: seed.certificateStatus || "none",
      certificateApprovedAt: seed.certificateApprovedAt || null,
      certificateApprovedBy: seed.certificateApprovedBy || null,
      certificateNotes: seed.certificateNotes || "",
    };
  }
  return p;
});
seedProjects.forEach((sp) => {
  if (!projects.some((p) => p.id === sp.id)) {
    projects.push(sp);
  }
});
let supportTickets = load("sahayog_support_tickets", []);
let notifications = load("sahayog_notifications", [
  {
    id: "notif-1",
    title: "Project Funded & Execution Started! 🚀",
    message: "Tata Steel CSR approved ₹3,50,000 funding for Fluoride Water Contamination in Tamar.",
    type: "funding_approved",
    read: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: "notif-2",
    title: "New High Priority Issue Routed to Campus",
    message: "A new storm drainage failure in Ranchi has been routed to BIT Mesra (8.5 km away).",
    type: "issue_reported",
    read: false,
    createdAt: new Date(Date.now() - 3600000).toISOString(),
  },
]);

function persist() {
  save("sahayog_users", users);
  save("sahayog_issues", issues);
  save("sahayog_projects", projects);
  save("sahayog_notifications", notifications);
  save("sahayog_support_tickets", supportTickets);
}

function tokenFor(user) {
  return btoa(JSON.stringify({ id: user.id, role: user.role }));
}

function userFromAuth(config) {
  const header = config.headers?.Authorization || config.headers?.authorization;
  if (!header) return null;
  const token = String(header).replace("Bearer ", "");
  try {
    const { id } = JSON.parse(atob(token));
    return users.find((u) => u.id === id) || null;
  } catch {
    return null;
  }
}

function publicUser(user) {
  const { password, ...rest } = user;
  return rest;
}

function json(config, data, status = 200) {
  return {
    data,
    status,
    statusText: status === 200 ? "OK" : "Error",
    headers: { "content-type": "application/json" },
    config,
  };
}

function error(message, status = 400) {
  const err = new Error(message);
  err.response = { data: { message }, status };
  throw err;
}

function match(config, method, pattern) {
  if (config.method?.toLowerCase() !== method) return null;
  const url = new URL(config.url, "http://local");
  const parts = url.pathname.replace(/\/$/, "").split("/");
  const p = pattern.split("/");
  if (parts.length !== p.length) return null;
  const params = {};
  for (let i = 0; i < p.length; i += 1) {
    if (p[i].startsWith(":")) params[p[i].slice(1)] = parts[i];
    else if (p[i] !== parts[i]) return null;
  }
  return { params, query: Object.fromEntries(url.searchParams) };
}

function computeAIAnalysis({ title, description, category, district, block }) {
  const text = `${title} ${description}`.toLowerCase();
  let urgency = 50;
  let publicRisk = 45;
  let flooding = 35;

  if (text.includes("accident") || text.includes("fatal") || text.includes("urgent") || text.includes("toxic") || text.includes("death")) {
    urgency += 25;
    publicRisk += 30;
  }
  if (text.includes("flood") || text.includes("water") || text.includes("drain") || text.includes("leakage") || text.includes("contamination")) {
    flooding += 45;
  }
  if (text.includes("dark") || text.includes("light") || text.includes("women") || text.includes("school") || text.includes("children")) {
    publicRisk += 35;
    urgency += 20;
  }

  urgency = Math.min(96, Math.max(20, urgency));
  publicRisk = Math.min(96, Math.max(20, publicRisk));
  flooding = Math.min(96, Math.max(15, flooding));
  const score = Math.round((urgency * 0.4) + (publicRisk * 0.4) + (flooding * 0.2));

  const priority = score >= 75 ? "High" : score >= 50 ? "Medium" : "Low";

  const aiProblemStatement = `**Structured Problem Formulation:**\n\n` +
    `**Context & Location:** Reported in ${block || "Block"}, ${district || "District"} regarding **${category || "Civic Challenge"}**.\n\n` +
    `**Core Challenge:** ${description || title}. The issue directly impairs community welfare, public infrastructure resilience, and daily mobility.\n\n` +
    `**AI Severity Assessment (${priority} Priority - Score ${score}/100):** Public Risk: ${publicRisk}%, Urgency: ${urgency}%, Environmental/Physical Hazard: ${flooding}%.\n\n` +
    `**Recommended Innovation Objective:** Formulate multidisciplinary student & faculty technical interventions for durable grassroots deployment.`;

  return {
    category: category || "Infrastructure",
    aiProblemStatement,
    severity: { flooding, publicRisk, urgency, score },
    priority,
  };
}

export async function handleMockRequest(config) {
  await delay();
  const body = typeof config.data === "string" ? JSON.parse(config.data || "{}") : config.data || {};
  const auth = userFromAuth(config);

  let m;

  // AI Preview
  if ((m = match(config, "post", "/api/issues/ai-preview"))) {
    const analysis = computeAIAnalysis(body);
    return json(config, { success: true, ...analysis });
  }

  // Global Search across issues, projects, universities
  if ((m = match(config, "get", "/api/search"))) {
    const q = (m.query.q || "").toLowerCase().trim();
    if (!q) return json(config, { issues: [], projects: [], universities: [] });

    const matchedIssues = issues.filter(
      (i) =>
        i.title?.toLowerCase().includes(q) ||
        i.description?.toLowerCase().includes(q) ||
        i.district?.toLowerCase().includes(q) ||
        i.category?.toLowerCase().includes(q)
    ).slice(0, 5);

    const matchedProjects = projects.filter(
      (p) =>
        p.title?.toLowerCase().includes(q) ||
        p.proposal?.toLowerCase().includes(q) ||
        p.university?.toLowerCase().includes(q) ||
        p.industry?.toLowerCase().includes(q)
    ).slice(0, 5);

    const matchedUniversities = users
      .filter((u) => u.role === ROLES.UNIVERSITY && u.org?.toLowerCase().includes(q))
      .map(publicUser)
      .slice(0, 5);

    return json(config, { issues: matchedIssues, projects: matchedProjects, universities: matchedUniversities });
  }

  // Auth: Login
  if ((m = match(config, "post", "/api/auth/login"))) {
    const user = users.find(
      (u) =>
        (u.email === body.email ||
          (body.email === "citizen@sahayog.in" && u.email === "reporter@sahayog.in") ||
          (body.email === "reporter@sahayog.in" && u.email === "citizen@sahayog.in")) &&
        u.password === body.password
    );
    if (!user) error("Invalid email or password", 401);
    return json(config, { token: tokenFor(user), user: publicUser(user) });
  }

  // Auth: Google Login
  if ((m = match(config, "post", "/api/auth/google"))) {
    let email = "google.user@sahayog.in";
    let name = body.name || "Google Verified Citizen";
    let picture = "";
    if (body.credential) {
      try {
        const payload = JSON.parse(atob(body.credential.split(".")[1]));
        email = payload.email || email;
        name = payload.name || name;
        picture = payload.picture || picture;
      } catch (e) {}
    }
    let user = users.find((u) => u.email === email);
    const selectedDistrict = body.district || "Ranchi";
    const selectedBlock = body.block || "Kanke";
    if (!user) {
      const selectedRole = body.role || ROLES.REPORTER;
      const isPendingRole = [ROLES.UNIVERSITY, ROLES.INDUSTRY].includes(selectedRole);
      user = {
        id: `u-google-${Date.now()}`,
        name,
        email,
        role: selectedRole,
        district: selectedDistrict,
        status: isPendingRole ? "pending" : "active",
        org: body.org || (isPendingRole ? "Registered Entity" : ""),
        picture,
        location: {
          district: selectedDistrict,
          block: selectedBlock,
          state: "Jharkhand",
          lat: 23.3441,
          lng: 85.3096,
        },
      };
      users.push(user);
      persist();
    }
    return json(config, { token: tokenFor(user), user: publicUser(user) });
  }

  // Auth: Register
  if ((m = match(config, "post", "/api/auth/register"))) {
    if (users.some((u) => u.email === body.email)) error("Email already registered", 409);
    const pendingRoles = [ROLES.UNIVERSITY, ROLES.INDUSTRY];
    const selectedDistrict = body.district || "Ranchi";
    const selectedBlock = body.block || "Kanke";
    const user = {
      id: `u-${Date.now()}`,
      name: body.name,
      email: body.email,
      password: body.password,
      role: body.role,
      district: selectedDistrict,
      status: pendingRoles.includes(body.role) ? "pending" : "active",
      org: body.org || (pendingRoles.includes(body.role) ? "Registered Entity" : ""),
      location: {
        district: selectedDistrict,
        block: selectedBlock,
        state: "Jharkhand",
        lat: 23.3441,
        lng: 85.3096,
      },
    };
    users.push(user);
    persist();
    return json(config, { user: publicUser(user) }, 201);
  }

  // Auth: Send OTP mock
  if ((m = match(config, "post", "/api/auth/send-otp"))) {
    return json(config, { success: true, message: "Verification code sent successfully to " + body.email });
  }

  // Profile: Get current user
  if ((m = match(config, "get", "/api/users/profile"))) {
    if (!auth) error("Unauthorized", 401);
    return json(config, publicUser(auth));
  }

  // Profile: Update current user
  if ((m = match(config, "put", "/api/users/profile"))) {
    if (!auth) error("Unauthorized", 401);
    const user = users.find((u) => u.id === auth.id);
    if (!user) error("User not found", 404);

    if (body.name) user.name = body.name;
    if (body.phone) user.phone = body.phone;
    if (body.district) user.district = body.district;
    if (body.block) user.block = body.block;
    if (body.org) user.org = body.org;
    if (body.bio) user.bio = body.bio;
    if (body.disciplines) user.disciplines = body.disciplines;
    persist();
    return json(config, { success: true, user: publicUser(user) });
  }

  // Profile: Change Password
  if ((m = match(config, "post", "/api/users/change-password"))) {
    if (!auth) error("Unauthorized", 401);
    const user = users.find((u) => u.id === auth.id);
    if (!user) error("User not found", 404);
    if (user.password !== body.currentPassword) {
      error("Current password does not match", 400);
    }
    user.password = body.newPassword;
    persist();
    return json(config, { success: true, message: "Password updated successfully" });
  }

  // Support Tickets
  if ((m = match(config, "post", "/api/support/tickets"))) {
    const ticket = {
      id: `tic-${Date.now()}`,
      userId: auth?.id || "guest",
      userName: auth?.name || body.name || "Guest User",
      email: auth?.email || body.email || "guest@sahayog.in",
      subject: body.subject || "Support Inquiry",
      category: body.category || "General",
      message: body.message,
      status: "Open",
      createdAt: new Date().toISOString(),
    };
    supportTickets.unshift(ticket);
    persist();
    return json(config, { success: true, ticket });
  }

  // Issues: Create
  if ((m = match(config, "post", "/api/issues"))) {
    if (!auth) error("Unauthorized", 401);
    const aiAnalysis = computeAIAnalysis(body);
    const issue = {
      id: `iss-${Date.now()}`,
      title: body.title,
      description: body.description,
      aiProblemStatement: body.aiProblemStatement || aiAnalysis.aiProblemStatement,
      category: body.category || aiAnalysis.category,
      status: "New",
      priority: body.priority || aiAnalysis.priority,
      upvotes: 1,
      upvoters: [auth.id],
      reporterId: auth.id,
      reporterName: auth.name,
      district: body.location?.district || body.district || "Ranchi",
      block: body.location?.block || body.block || "Kanke",
      landmark: body.location?.landmark || body.landmark || "",
      lat: body.location?.lat || body.lat || 23.3441,
      lng: body.location?.lng || body.lng || 85.3096,
      images: Array.isArray(body.evidence) && body.evidence.length > 0
        ? body.evidence.map((e) => ({
            url: e.url || e.preview,
            filename: e.filename || "evidence.jpg",
            size: e.size || 102400,
          }))
        : [],
      severity: aiAnalysis.severity,
      distanceKm: Math.round(5 + Math.random() * 25),
      nearestUniversities: [
        { name: "Birla Institute of Technology (BIT) Mesra", distanceKm: 12.4, matchScore: 92 },
        { name: "NIT Jamshedpur", distanceKm: 86.0, matchScore: 85 },
      ],
      assignee: null,
      comments: [],
      timeline: [
        { at: new Date().toISOString(), label: "Reported by Citizen" },
        { at: new Date().toISOString(), label: `AI synthesized formal problem statement (${aiAnalysis.priority} Priority, ${aiAnalysis.severity.score}% severity)` },
        { at: new Date().toISOString(), label: "Routed to nearest Higher Education Institutions" },
      ],
    };
    issues.unshift(issue);

    notifications.unshift({
      id: `notif-${Date.now()}`,
      title: `Challenge Registered & AI Evaluated 📋`,
      message: `Your report "${issue.title}" was analyzed (${issue.priority} Priority, ${aiAnalysis.severity.score}% severity) and routed to nearest universities.`,
      type: "issue_reported",
      issueId: issue.id,
      read: false,
      createdAt: new Date().toISOString(),
    });

    persist();
    return json(config, issue, 201);
  }

  // Issues: Get list (supports filter by reporterId, status, district, category, proximity)
  if ((m = match(config, "get", "/api/issues"))) {
    let list = [...issues];
    const { reporterId, status, district, category, lat, lng } = m.query;
    if (reporterId) {
      list = list.filter(
        (i) =>
          i.reporterId === reporterId ||
          i.reporter === reporterId ||
          i.reporterId === "u-reporter" ||
          i.reporterId === "u-citizen" ||
          (auth && (i.reporterId === auth.id || i.reporter === auth.id))
      );
    }
    if (status && status !== "all") list = list.filter((i) => i.status === status);
    if (district && district !== "all") list = list.filter((i) => i.district === district);
    if (category && category !== "all") list = list.filter((i) => i.category === category);
    if (lat && lng) {
      const la = Number(lat);
      const ln = Number(lng);
      list.sort(
        (a, b) => Math.hypot(a.lat - la, a.lng - ln) - Math.hypot(b.lat - la, b.lng - ln),
      );
    }
    return json(config, list);
  }

  // Issues: Get detail
  if ((m = match(config, "get", "/api/issues/:id"))) {
    const issue = issues.find((i) => i.id === m.params.id || i._id === m.params.id);
    if (!issue) error("Issue not found", 404);
    return json(config, issue);
  }

  // Issues: Upvote (+1 Me Too)
  if ((m = match(config, "post", "/api/issues/:id/upvote"))) {
    const issue = issues.find((i) => i.id === m.params.id || i._id === m.params.id);
    if (!issue) error("Issue not found", 404);
    const userId = auth?.id || "anonymous-guest";
    issue.upvoters = issue.upvoters || [];
    const hasUpvoted = issue.upvoters.includes(userId);

    if (hasUpvoted) {
      issue.upvoters = issue.upvoters.filter((id) => id !== userId);
      issue.upvotes = Math.max(0, (issue.upvotes || 1) - 1);
    } else {
      issue.upvoters.push(userId);
      issue.upvotes = (issue.upvotes || 0) + 1;
    }
    persist();
    return json(config, { success: true, upvotes: issue.upvotes, hasUpvoted: !hasUpvoted, issue });
  }

  // Issues: Comments (Post & Get)
  if ((m = match(config, "post", "/api/issues/:id/comments"))) {
    const issue = issues.find((i) => i.id === m.params.id || i._id === m.params.id);
    if (!issue) error("Issue not found", 404);
    issue.comments = issue.comments || [];
    const comment = {
      id: `c-${Date.now()}`,
      authorId: auth?.id || "guest",
      authorName: auth?.name || "Community Member",
      authorRole: auth?.role || "citizen",
      authorOrg: auth?.org || "",
      text: body.text,
      createdAt: new Date().toISOString(),
    };
    issue.comments.push(comment);
    persist();
    return json(config, { success: true, comment, comments: issue.comments });
  }

  // Issues: Edit / Update details
  if ((m = match(config, "post", "/api/issues/:id/edit"))) {
    const issue = issues.find((i) => i.id === m.params.id || i._id === m.params.id);
    if (!issue) error("Issue not found", 404);
    if (body.title) issue.title = body.title;
    if (body.description) issue.description = body.description;
    if (body.landmark) issue.landmark = body.landmark;
    issue.timeline.push({
      at: new Date().toISOString(),
      label: "Issue details updated by citizen reporter",
      actor: auth?.name || "Citizen",
    });
    persist();
    return json(config, { success: true, issue });
  }

  // Issues: Withdraw / Cancel
  if ((m = match(config, "post", "/api/issues/:id/withdraw"))) {
    const issue = issues.find((i) => i.id === m.params.id || i._id === m.params.id);
    if (!issue) error("Issue not found", 404);
    issue.status = "Withdrawn";
    issue.timeline.push({
      at: new Date().toISOString(),
      label: `Issue report withdrawn by citizen: "${body.reason || "Resolved independently"}"`,
      actor: auth?.name || "Citizen",
    });
    persist();
    return json(config, { success: true, issue });
  }

  // Issues: Dispute / Reopen Resolution
  if ((m = match(config, "post", "/api/issues/:id/dispute"))) {
    const issue = issues.find((i) => i.id === m.params.id || i._id === m.params.id);
    if (!issue) error("Issue not found", 404);
    issue.status = "In progress";
    issue.timeline.push({
      at: new Date().toISOString(),
      label: `Citizen flagged resolution dispute: "${body.reason || "Ground issue remains unresolved"}"`,
      actor: auth?.name || "Citizen",
      role: "citizen",
    });
    notifications.unshift({
      id: `notif-${Date.now()}`,
      title: `Resolution Disputed on Ground ⚠️`,
      message: `Citizen reported that "${issue.title}" still requires on-site attention. Ticket reopened for university team.`,
      type: "issue_disputed",
      issueId: issue.id,
      read: false,
      createdAt: new Date().toISOString(),
    });
    persist();
    return json(config, { success: true, issue });
  }

  // Issues: Update Status
  if ((m = match(config, "patch", "/api/issues/:id/status"))) {
    const issue = issues.find((i) => i.id === m.params.id || i._id === m.params.id);
    if (!issue) error("Issue not found", 404);
    issue.status = body.status;
    issue.timeline.push({ at: new Date().toISOString(), label: `Status updated to ${body.status}` });
    
    notifications.unshift({
      id: `notif-${Date.now()}`,
      title: `Ticket Status Updated: ${body.status}`,
      message: `Your issue ticket "${issue.title}" status has been updated to "${body.status}".`,
      type: "status_update",
      issueId: issue.id,
      read: false,
      createdAt: new Date().toISOString(),
    });

    persist();
    return json(config, issue);
  }

  // Issues: Feedback
  if ((m = match(config, "post", "/api/issues/:id/feedback"))) {
    const issue = issues.find((i) => i.id === m.params.id || i._id === m.params.id);
    if (!issue) error("Issue not found", 404);
    
    issue.feedback = {
      rating: Number(body.rating) || 5,
      comment: body.comment || "",
      verifiedByCitizen: body.verifiedByCitizen ?? true,
      submittedAt: new Date().toISOString(),
    };

    issue.timeline.push({
      at: new Date().toISOString(),
      label: `Citizen Verified on Ground & Rated ⭐ ${issue.feedback.rating}/5${body.comment ? ` — "${body.comment}"` : ""}`,
      actor: auth?.name || issue.reporterName || "Citizen Reporter",
      role: "citizen",
    });

    notifications.unshift({
      id: `notif-${Date.now()}`,
      title: `Citizen Verified Resolution! ⭐ ${issue.feedback.rating}/5`,
      message: `The citizen reporter verified resolution of "${issue.title}" with a ${issue.feedback.rating}/5 satisfaction rating.`,
      type: "feedback_submitted",
      issueId: issue.id,
      read: false,
      createdAt: new Date().toISOString(),
    });

    persist();
    return json(config, { success: true, feedback: issue.feedback, issue });
  }

  // University: Queue
  if ((m = match(config, "get", "/api/university/queue"))) {
    const list = issues.filter((i) => ["New", "Under review", "Assigned"].includes(i.status));
    return json(config, list);
  }

  // University: Claim
  if ((m = match(config, "post", "/api/university/issues/:id/claim"))) {
    const issue = issues.find((i) => i.id === m.params.id || i._id === m.params.id);
    if (!issue) error("Issue not found", 404);
    const uniName = auth?.org || "Birla Institute of Technology (BIT) Mesra";
    issue.status = "Assigned";
    issue.assignee = uniName;
    issue.timeline.push({
      at: new Date().toISOString(),
      label: `Claimed by ${uniName} for multidisciplinary team formation`,
      actor: uniName,
      role: "university",
    });

    notifications.unshift({
      id: `notif-${Date.now()}`,
      title: `University Claimed Ticket 🏛️`,
      message: `${uniName} claimed your challenge "${issue.title}" and is mobilizing faculty and student research teams.`,
      type: "team_formed",
      issueId: issue.id,
      read: false,
      createdAt: new Date().toISOString(),
    });

    persist();
    return json(config, { success: true, issue });
  }

  // Projects: Team Formation
  if ((m = match(config, "post", "/api/projects/:issueId/teams"))) {
    let project = projects.find((p) => p.issueId === m.params.issueId);
    const uniName = auth?.org || "Birla Institute of Technology (BIT) Mesra";
    if (!project) {
      const issue = issues.find((i) => i.id === m.params.issueId);
      project = {
        id: `prj-${Date.now()}`,
        issueId: m.params.issueId,
        title: issue ? `Solution for ${issue.title}` : "Civic Innovation Project",
        university: uniName,
        industry: null,
        status: "Team forming",
        funded: false,
        fundingAmount: 0,
        disbursedAmount: 0,
        deadline: null,
        team: body.team || [],
        proposal: "",
        milestones: [],
      };
      projects.push(project);
    } else {
      project.team = body.team || [];
    }
    const issue = issues.find((i) => i.id === m.params.issueId);
    if (issue) {
      issue.status = "Assigned";
      issue.assignee = uniName;
      issue.timeline.push({
        at: new Date().toISOString(),
        label: `Multidisciplinary team assembled by ${uniName}`,
        actor: uniName,
        role: "university",
      });
    }
    persist();
    return json(config, project);
  }

  // Projects: Proposal Submission
  if ((m = match(config, "post", "/api/projects/:issueId/proposals"))) {
    let project = projects.find((p) => p.issueId === m.params.issueId);
    const uniName = auth?.org || "Birla Institute of Technology (BIT) Mesra";
    if (!project) {
      project = {
        id: `prj-${Date.now()}`,
        issueId: m.params.issueId,
        title: body.title,
        university: uniName,
        industry: null,
        status: "Awaiting funding",
        funded: false,
        fundingAmount: 0,
        disbursedAmount: 0,
        deadline: null,
        team: body.team || [],
        proposal: body.proposal,
        milestones: body.milestones || [],
      };
      projects.push(project);
    } else {
      project.title = body.title || project.title;
      project.proposal = body.proposal;
      project.status = "Awaiting funding";
      if (body.team) project.team = body.team;
      if (body.milestones) project.milestones = body.milestones;
    }
    const issue = issues.find((i) => i.id === m.params.issueId);
    if (issue) {
      issue.status = "Assigned";
      issue.assignee = uniName;
      issue.timeline.push({
        at: new Date().toISOString(),
        label: `Solution proposal submitted to industry partners by ${uniName}`,
        actor: uniName,
        role: "university",
      });

      notifications.unshift({
        id: `notif-${Date.now()}`,
        title: `Technical Proposal Submitted! 📝`,
        message: `${uniName} completed the technical proposal for "${project.title}" and submitted it for CSR industry funding.`,
        type: "proposal_submitted",
        issueId: issue.id,
        read: false,
        createdAt: new Date().toISOString(),
      });
    }
    persist();
    return json(config, project, 201);
  }

  // University: Projects
  if ((m = match(config, "get", "/api/university/projects"))) {
    return json(config, projects);
  }

  // Industry: Proposals Queue
  if ((m = match(config, "get", "/api/industry/proposals"))) {
    return json(config, projects.filter((p) => !p.funded));
  }

  // Industry: Fund Proposal
  if ((m = match(config, "post", "/api/projects/:projectId/fund"))) {
    const project = projects.find(
      (p) =>
        String(p.id) === String(m.params.projectId) ||
        String(p._id) === String(m.params.projectId) ||
        String(p.issueId) === String(m.params.projectId)
    );
    if (!project) error("Project not found", 404);
    const industryName = auth?.org || "Tata Steel CSR & Sustainability";
    const amount = Number(body.fundingAmount) || 350000;
    project.funded = true;
    project.status = "Funded";
    project.industry = industryName;
    project.fundingAmount = amount;
    project.deadline = body.deadline || "2026-11-30";
    project.disbursedAmount = Math.round(amount * 0.4); // Tranche 1 40% released on approval
    project.tranches = [
      { tranche: 1, percent: 40, amount: Math.round(amount * 0.4), released: true, releasedAt: new Date().toISOString() },
      { tranche: 2, percent: 40, amount: Math.round(amount * 0.4), released: false, releasedAt: null },
      { tranche: 3, percent: 20, amount: Math.round(amount * 0.2), released: false, releasedAt: null },
    ];
    
    const issue = issues.find((i) => i.id === project.issueId);
    if (issue) {
      issue.status = "In progress";
      issue.timeline.push({
        at: new Date().toISOString(),
        label: `Funding (₹${project.fundingAmount.toLocaleString("en-IN")}) committed by ${industryName}. Advance Tranche 1 released.`,
        actor: industryName,
        role: "industry",
      });

      notifications.unshift({
        id: `notif-${Date.now()}`,
        title: `Project Funded & Execution Started! 🚀`,
        message: `${industryName} approved ₹${project.fundingAmount.toLocaleString("en-IN")} funding for "${issue.title}". Target delivery: ${project.deadline}.`,
        type: "funding_approved",
        issueId: issue.id,
        read: false,
        createdAt: new Date().toISOString(),
      });
    }

    persist();
    return json(config, project);
  }

  // Industry: Tranche Release
  if ((m = match(config, "post", "/api/projects/:projectId/tranche-release"))) {
    const project = projects.find(
      (p) =>
        String(p.id) === String(m.params.projectId) ||
        String(p._id) === String(m.params.projectId) ||
        String(p.issueId) === String(m.params.projectId)
    );
    if (!project) error("Project not found", 404);
    const trancheIndex = Number(body.trancheIndex);
    if (project.tranches && project.tranches[trancheIndex]) {
      project.tranches[trancheIndex].released = true;
      project.tranches[trancheIndex].releasedAt = new Date().toISOString();
      project.disbursedAmount = (project.disbursedAmount || 0) + project.tranches[trancheIndex].amount;
    }
    const issue = issues.find((i) => i.id === project.issueId);
    if (issue) {
      issue.timeline.push({
        at: new Date().toISOString(),
        label: `CSR Tranche ${trancheIndex + 1} (₹${project.tranches[trancheIndex]?.amount.toLocaleString("en-IN")}) released to university team`,
        actor: project.industry || "CSR Partner",
      });
    }
    persist();
    return json(config, { success: true, project });
  }

  // Projects: Milestones Update & Deliverables
  if ((m = match(config, "patch", "/api/projects/:projectId/milestones"))) {
    const project = projects.find(
      (p) =>
        String(p.id) === String(m.params.projectId) ||
        String(p._id) === String(m.params.projectId) ||
        String(p.issueId) === String(m.params.projectId)
    );
    if (!project) error("Project not found", 404);
    const prevMilestones = project.milestones || [];
    project.milestones = body.milestones || project.milestones;
    const issue = issues.find((i) => i.id === project.issueId);
    
    const newlyCompleted = project.milestones.find((m, i) => m.done && !prevMilestones[i]?.done);
    if (newlyCompleted && issue) {
      issue.timeline.push({
        at: new Date().toISOString(),
        label: `Milestone completed: "${newlyCompleted.name}"`,
        actor: project.university || "University Team",
        role: "university",
      });

      notifications.unshift({
        id: `notif-${Date.now()}`,
        title: `Milestone Achieved! ⚙️`,
        message: `University team achieved milestone: "${newlyCompleted.name}" for "${project.title}".`,
        type: "milestone_completed",
        issueId: issue.id,
        read: false,
        createdAt: new Date().toISOString(),
      });
    }

    if (project.milestones.length > 0 && project.milestones.every((m) => m.done)) {
      project.status = "Completed";
      if (!project.certificateStatus || project.certificateStatus === "none") {
        project.certificateStatus = "pending_approval";
      }
      if (issue) {
        issue.status = "Resolved";
        issue.timeline.push({
          at: new Date().toISOString(),
          label: "All innovation milestones completed. Issue marked as Resolved!",
          actor: "Sahayog Platform",
          role: "system",
        });

        notifications.unshift({
          id: `notif-${Date.now() + 1}`,
          title: `Civic Issue Resolved & Verified! ✅`,
          message: `Great news! The solution for "${project.title}" has been successfully deployed and verified on the ground.`,
          type: "issue_resolved",
          issueId: issue.id,
          read: false,
          createdAt: new Date().toISOString(),
        });
      }
    } else {
      if (project.status === "Completed") {
        project.status = "Funded";
        if (project.certificateStatus === "pending_approval") {
          project.certificateStatus = "none";
        }
      }
    }
    persist();
    return json(config, project);
  }

  // Notifications
  if ((m = match(config, "get", "/api/notifications"))) {
    return json(config, notifications);
  }

  if ((m = match(config, "patch", "/api/notifications/read-all"))) {
    notifications.forEach((n) => (n.read = true));
    persist();
    return json(config, { success: true });
  }

  // Admin
  if ((m = match(config, "get", "/api/admin/verifications"))) {
    return json(config, users.filter((u) => u.status === "pending").map(publicUser));
  }

  if ((m = match(config, "patch", "/api/admin/verifications/:userId"))) {
    const user = users.find((u) => u.id === m.params.userId);
    if (!user) error("User not found", 404);
    user.status = body.decision === "reject" ? "rejected" : "active";
    persist();
    return json(config, publicUser(user));
  }

  if ((m = match(config, "get", "/api/admin/certificates"))) {
    return json(
      config,
      projects.filter(
        (p) =>
          p.status === "Completed" ||
          ["pending_approval", "approved", "rejected"].includes(p.certificateStatus)
      )
    );
  }

  if ((m = match(config, "patch", "/api/admin/certificates/:projectId"))) {
    const project = projects.find((p) => p.id === m.params.projectId || p._id === m.params.projectId);
    if (!project) error("Project not found", 404);
    if (body.decision === "approve") {
      project.certificateStatus = "approved";
      project.certificateApprovedAt = new Date().toISOString();
      project.certificateApprovedBy = "Jharkhand State Innovation Council Admin";
    } else {
      project.certificateStatus = "rejected";
      project.certificateApprovedAt = null;
    }
    if (body.notes !== undefined) {
      project.certificateNotes = body.notes;
    }
    persist();
    return json(config, project);
  }

  if ((m = match(config, "get", "/api/admin/analytics"))) {
    return json(config, {
      ...mockAnalytics,
      openIssues: issues.filter((i) => i.status !== "Resolved").length,
      resolvedIssues: issues.filter((i) => i.status === "Resolved").length,
      pendingAccounts: users.filter((u) => u.status === "pending").length,
    });
  }

  error(`No mock for ${config.method} ${config.url}`, 404);
}
