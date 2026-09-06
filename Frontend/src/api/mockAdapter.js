import { mockAnalytics, mockUsers, seedIssues, seedProjects } from "./mockData.js";
import { ROLES } from "../lib/constants.js";

const delay = (ms = 250) => new Promise((r) => setTimeout(r, ms));

function load(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : structuredClone(fallback);
  } catch {
    return structuredClone(fallback);
  }
}

function save(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
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
mockUsers.forEach((fresh) => {
  if (fresh.role === "university" && fresh.status === "active" && !users.some((u) => u.email === fresh.email)) {
    users.push(structuredClone(fresh));
  }
});
save("sahayog_users", users);
let issues = load("sahayog_issues", seedIssues).map((iss) => {
  if (Array.isArray(iss.images)) {
    iss.images = iss.images.filter((img) => {
      const src = typeof img === "string" ? img : img?.url;
      return src && !src.includes("photo-1486325212027-8081e485255e");
    });
  }
  return iss;
});
let projects = load("sahayog_projects", seedProjects);
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
    message: "A new storm drainage failure in Ranchi has been routed to BIT Mesra (12.4 km away).",
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

  if (text.includes("accident") || text.includes("fatal") || text.includes("urgent") || text.includes("toxic")) {
    urgency += 25;
    publicRisk += 30;
  }
  if (text.includes("flood") || text.includes("water") || text.includes("drain") || text.includes("leakage")) {
    flooding += 45;
  }
  if (text.includes("dark") || text.includes("light") || text.includes("women") || text.includes("school")) {
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
    `**Core Challenge:** ${description || title}. The issue directly impairs community welfare and public utility services.\n\n` +
    `**AI Severity Assessment (${priority} Priority - Score ${score}/100):** Public Risk: ${publicRisk}%, Urgency: ${urgency}%, Physical/Environmental Risk: ${flooding}%.\n\n` +
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
    } else {
      if (body.district) {
        user.district = body.district;
        user.location = user.location || {};
        user.location.district = body.district;
        persist();
      }
    }
    return json(config, { token: tokenFor(user), user: publicUser(user) });
  }

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

  if ((m = match(config, "get", "/api/users/profile"))) {
    if (!auth) error("Unauthorized", 401);
    return json(config, publicUser(auth));
  }

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
      reporterId: auth.id,
      reporterName: auth.name,
      district: body.district || "Ranchi",
      block: body.block || "Kanke",
      landmark: body.landmark || "",
      lat: body.lat || 23.3441,
      lng: body.lng || 85.3096,
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

  if ((m = match(config, "get", "/api/issues"))) {
    let list = [...issues];
    const { reporterId, status, lat, lng } = m.query;
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
    if (status) list = list.filter((i) => i.status === status);
    if (lat && lng) {
      const la = Number(lat);
      const ln = Number(lng);
      list.sort(
        (a, b) =>
          Math.hypot(a.lat - la, a.lng - ln) - Math.hypot(b.lat - la, b.lng - ln),
      );
    }
    return json(config, list);
  }

  if ((m = match(config, "get", "/api/issues/:id"))) {
    const issue = issues.find((i) => i.id === m.params.id || i._id === m.params.id);
    if (!issue) error("Issue not found", 404);
    return json(config, issue);
  }

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

  if ((m = match(config, "get", "/api/university/queue"))) {
    const list = issues.filter((i) => ["New", "Under review", "Assigned"].includes(i.status));
    return json(config, list);
  }

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

      notifications.unshift({
        id: `notif-${Date.now()}`,
        title: `University Team Assembled! 🎓`,
        message: `${uniName} formed a student-faculty team for "${issue.title}" and is drafting the solution proposal.`,
        type: "team_formed",
        issueId: issue.id,
        read: false,
        createdAt: new Date().toISOString(),
      });
    }
    persist();
    return json(config, project);
  }

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

  if ((m = match(config, "get", "/api/university/projects"))) {
    return json(config, projects);
  }

  if ((m = match(config, "get", "/api/industry/proposals"))) {
    return json(config, projects.filter((p) => !p.funded));
  }

  if ((m = match(config, "post", "/api/projects/:projectId/fund"))) {
    const project = projects.find((p) => p.id === m.params.projectId);
    if (!project) error("Project not found", 404);
    const industryName = auth?.org || "Tata Steel CSR & Sustainability";
    project.funded = true;
    project.status = "Funded";
    project.industry = industryName;
    project.fundingAmount = Number(body.fundingAmount) || 350000;
    project.deadline = body.deadline || "2026-11-30";
    
    const issue = issues.find((i) => i.id === project.issueId);
    if (issue) {
      issue.status = "In progress";
      issue.timeline.push({
        at: new Date().toISOString(),
        label: `Funding (₹${project.fundingAmount.toLocaleString("en-IN")}) approved by ${industryName}. Target completion: ${project.deadline}`,
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

  if ((m = match(config, "patch", "/api/projects/:projectId/milestones"))) {
    const project = projects.find((p) => p.id === m.params.projectId);
    if (!project) error("Project not found", 404);
    const prevMilestones = project.milestones || [];
    project.milestones = body.milestones || project.milestones;
    const issue = issues.find((i) => i.id === project.issueId);
    
    // Check if any milestone was newly completed
    const newlyCompleted = project.milestones.find((m, i) => m.done && !prevMilestones[i]?.done);
    if (newlyCompleted && issue) {
      issue.timeline.push({
        at: new Date().toISOString(),
        label: `Milestone completed: ${newlyCompleted.name}`,
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

    // If all milestones completed, resolve issue and notify reporter
    if (project.milestones.length > 0 && project.milestones.every((m) => m.done)) {
      project.status = "Completed";
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
    }
    persist();
    return json(config, project);
  }

  if ((m = match(config, "get", "/api/notifications"))) {
    return json(config, notifications);
  }

  if ((m = match(config, "patch", "/api/notifications/read-all"))) {
    notifications.forEach((n) => (n.read = true));
    persist();
    return json(config, { success: true });
  }

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

  if ((m = match(config, "get", "/api/admin/analytics"))) {
    return json(config, {
      ...mockAnalytics,
      openIssues: issues.filter((i) => i.status !== "Resolved").length,
      pendingAccounts: users.filter((u) => u.status === "pending").length,
    });
  }

  error(`No mock for ${config.method} ${config.url}`, 404);
}
