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
function makeText(id, x, y, text, color = "#0E4B4C", fontSize = 22) {
  return { id, kind: "text", x, y, w: 0, h: 0, x2: 0, y2: 0, points: [], text, fontSize, color, strokeWidth: 0 };
}
function makeRect(id, x, y, w, h, color = "#0E4B4C") {
  return { id, kind: "rect", x, y, w, h, x2: 0, y2: 0, points: [], text: "", fontSize: 20, color, strokeWidth: 3 };
}
function makeEllipse(id, x, y, rx, ry, color = "#0891B2") {
  return { id, kind: "ellipse", x, y, w: rx, h: ry, x2: 0, y2: 0, points: [], text: "", fontSize: 20, color, strokeWidth: 3 };
}
function makeArrow(id, x1, y1, x2, y2, color = "#059669") {
  return { id, kind: "arrow", x: x1, y: y1, w: 0, h: 0, x2, y2, points: [], text: "", fontSize: 20, color, strokeWidth: 3 };
}
function makeStroke(id, points, color = "#1f2937", strokeWidth = 4) {
  return { id, kind: "stroke", x: 0, y: 0, w: 0, h: 0, x2: 0, y2: 0, points, text: "", fontSize: 20, color, strokeWidth };
}

const seedWorkflowCanvases = [
  {
    projectId: "prj-201",
    universityName: "Birla Institute of Technology (BIT) Mesra",
    objects: [
      makeText("w-201-1", 320, 60, "Fluoride Water Safe-Drink Pipeline", "#0E4B4C", 30),
      makeRect("w-201-2", 140, 140, 260, 70, "#0E4B4C"),
      makeText("w-201-3", 165, 164, "Step 1: Baseline water sampling", "#0E4B4C", 16),
      makeArrow("w-201-4", 400, 175, 590, 175, "#059669"),
      makeRect("w-201-5", 590, 140, 260, 70, "#0891B2"),
      makeText("w-201-6", 618, 164, "Step 2: Biochar filter assembly", "#0E4B4C", 16),
      makeArrow("w-201-7", 850, 175, 1040, 175, "#059669"),
      makeRect("w-201-8", 1040, 140, 280, 70, "#D97706"),
      makeText("w-201-9", 1075, 164, "Step 3: IoT telemetry on", "#111827", 16),
      makeArrow("w-201-10", 1180, 210, 1180, 320, "#059669"),
      makeEllipse("w-201-11", 1120, 320, 210, 70, "#7C3AED"),
      makeText("w-201-12", 1145, 346, "Ground deployment + training", "#0E4B4C", 15),
      makeStroke("w-201-13", [
        { x: 300, y: 300 }, { x: 330, y: 322 }, { x: 380, y: 306 }, { x: 430, y: 330 },
        { x: 480, y: 314 }, { x: 530, y: 340 }, { x: 580, y: 322 }, { x: 630, y: 348 },
        { x: 690, y: 330 }, { x: 720, y: 352 },
      ], "#1f2937", 4),
      makeText("w-201-14", 700, 380, "pH trending ↓ after 60-day run", "#6b7280", 14),
    ],
    createdAt: new Date(Date.now() - 12 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 5 * 86400000).toISOString(),
  },
  {
    projectId: "prj-101",
    universityName: "Birla Institute of Technology (BIT) Mesra",
    objects: [
      makeText("w-101-1", 380, 50, "Drainage Grate Handover Flow", "#0E4B4C", 28),
      makeRect("w-101-2", 160, 140, 240, 64, "#0E4B4C"),
      makeText("w-101-3", 190, 164, "Fabricate 4 bypass units", "#0E4B4C", 15),
      makeArrow("w-101-4", 400, 172, 560, 172, "#059669"),
      makeRect("w-101-5", 560, 140, 240, 64, "#059669"),
      makeText("w-101-6", 592, 164, "Civil installation", "#ffffff", 15),
      makeArrow("w-101-7", 800, 172, 960, 172, "#059669"),
      makeRect("w-101-8", 960, 140, 250, 64, "#D97706"),
      makeText("w-101-9", 1005, 164, "RMC handover", "#111827", 15),
    ],
    createdAt: new Date(Date.now() - 40 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 25 * 86400000).toISOString(),
  },
  {
    projectId: "prj-103",
    universityName: "Birla Institute of Technology (BIT) Mesra",
    objects: [
      makeText("w-103-1", 420, 60, "Cold Storage Post-Harvest Plan", "#0E4B4C", 28),
      makeEllipse("w-103-2", 200, 160, 240, 70, "#0891B2"),
      makeText("w-103-3", 245, 190, "Evaporative chamber", "#0E4B4C", 15),
      makeArrow("w-103-4", 440, 195, 600, 195, "#059669"),
      makeEllipse("w-103-5", 600, 160, 240, 70, "#059669"),
      makeText("w-103-6", 655, 190, "Shelf-life testing", "#ffffff", 15),
      makeArrow("w-103-7", 840, 195, 1000, 195, "#059669"),
      makeEllipse("w-103-8", 1000, 160, 250, 70, "#D97706"),
      makeText("w-103-9", 1055, 190, "FPO farmer training", "#111827", 15),
    ],
    createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 6 * 86400000).toISOString(),
  },
];

const seedWorkflowSuggestions = [
  {
    id: "wf-sug-201a",
    projectId: "prj-201",
    universityId: null,
    businessName: "Tata Steel CSR & Sustainability",
    message:
      "Please include geo-tagged field progress photos in the next monthly CSR report so the ESG dashboard can log on-ground milestones accurately.",
    status: "Reviewed",
    statusUpdatedAt: new Date(Date.now() - 10 * 86400000).toISOString(),
    createdAt: new Date(Date.now() - 11 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 10 * 86400000).toISOString(),
  },
  {
    id: "wf-sug-201b",
    projectId: "prj-201",
    universityId: null,
    businessName: "Tata Steel CSR & Sustainability",
    message:
      "Requesting weekly fluoride telemetry calibration records from the IoT dashboard. Also suggest adding a village health worker operator on the deployment roster.",
    status: "Pending",
    statusUpdatedAt: null,
    createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 3 * 86400000).toISOString(),
  },
  {
    id: "wf-sug-101a",
    projectId: "prj-101",
    universityId: null,
    businessName: "Tata Steel CSR & Sustainability",
    message:
      "Please share the maintenance SOP as an annexure to the impact certificate file for our compliance audit.",
    status: "Accepted",
    statusUpdatedAt: new Date(Date.now() - 22 * 86400000).toISOString(),
    createdAt: new Date(Date.now() - 24 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 22 * 86400000).toISOString(),
  },
];

let supportTickets = load("sahayog_support_tickets", []);
let workflowCanvases = load("sahayog_workflow_canvases", seedWorkflowCanvases);
let workflowSuggestions = load("sahayog_workflow_suggestions", seedWorkflowSuggestions);
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
  save("sahayog_workflow_canvases", workflowCanvases);
  save("sahayog_workflow_suggestions", workflowSuggestions);
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
      upwardsCount: 0,
      upwardsUsers: [],
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
    // Enrich with upwardsCount and hasUpwarded
    const enriched = list.map((i) => ({
      ...i,
      upwardsCount: i.upwardsCount || 0,
      hasUpwarded: auth ? (i.upwardsUsers || []).includes(auth.id) : false,
    }));
    return json(config, enriched);
  }

  // Issues: Get detail
  if ((m = match(config, "get", "/api/issues/:id"))) {
    const issue = issues.find((i) => i.id === m.params.id || i._id === m.params.id);
    if (!issue) error("Issue not found", 404);
    return json(config, {
      ...issue,
      upwardsCount: issue.upwardsCount || 0,
      hasUpwarded: auth ? (issue.upwardsUsers || []).includes(auth.id) : false,
    });
  }

  // Issues: Upward (POST /api/issues/:id/upward) — idempotent add
  if ((m = match(config, "post", "/api/issues/:id/upward"))) {
    const issue = issues.find((i) => i.id === m.params.id || i._id === m.params.id);
    if (!issue) error("Issue not found", 404);
    const userId = auth?.id || "anonymous-guest";
    issue.upwardsUsers = issue.upwardsUsers || [];
    let hasUpwarded = issue.upwardsUsers.includes(userId);

    if (!hasUpwarded) {
      issue.upwardsUsers.push(userId);
      issue.upwardsCount = (issue.upwardsCount || 0) + 1;
      hasUpwarded = true;
    }
    persist();
    return json(config, { success: true, upwardsCount: issue.upwardsCount, hasUpwarded });
  }

  // Issues: Remove Upward (DELETE /api/issues/:id/upward) — idempotent remove
  if ((m = match(config, "delete", "/api/issues/:id/upward"))) {
    const issue = issues.find((i) => i.id === m.params.id || i._id === m.params.id);
    if (!issue) error("Issue not found", 404);
    const userId = auth?.id || "anonymous-guest";
    issue.upwardsUsers = issue.upwardsUsers || [];
    if (issue.upwardsUsers.includes(userId)) {
      issue.upwardsUsers = issue.upwardsUsers.filter((id) => id !== userId);
      issue.upwardsCount = Math.max(0, issue.upwardsCount - 1);
    }
    persist();
    return json(config, { success: true, upwardsCount: issue.upwardsCount || 0, hasUpwarded: false });
  }

  // Issues: Get upwards status (GET /api/issues/:id/upwards)
  if ((m = match(config, "get", "/api/issues/:id/upwards"))) {
    const issue = issues.find((i) => i.id === m.params.id || i._id === m.params.id);
    if (!issue) error("Issue not found", 404);
    return json(config, {
      success: true,
      upwardsCount: issue.upwardsCount || 0,
      hasUpwarded: auth ? (issue.upwardsUsers || []).includes(auth.id) : false,
    });
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

  // ---------------------------------------------------------------------------
  // Workflow module
  // ---------------------------------------------------------------------------
  const findWorkflowProject = (ref) =>
    projects.find(
      (p) =>
        String(p.id) === String(ref) ||
        String(p._id) === String(ref) ||
        String(p.issueId) === String(ref)
    );

  const workflowAccess = (project, user) => {
    const access = { canView: false, canEdit: false, canSuggest: false, canManageSuggestions: false };
    if (!user || !project) return access;
    if (user.role === "admin") {
      access.canView = true;
    } else if (user.role === "university" && project.university === user.org) {
      access.canView = true;
      access.canEdit = true;
      access.canManageSuggestions = true;
    } else if (user.role === "industry" && project.industry === user.org) {
      access.canView = true;
      access.canSuggest = true;
    }
    return access;
  };

  const formatMockCanvas = (wb) => ({
    objects: (wb?.objects || []).map((o) => ({ ...o })),
    updatedAt: wb?.updatedAt || null,
  });

  const formatMockSuggestion = (s) => ({
    id: s.id,
    _id: s.id,
    projectId: s.projectId,
    universityId: s.universityId || null,
    businessId: s.businessId || null,
    businessName: s.businessName || "",
    message: s.message,
    status: s.status,
    statusUpdatedAt: s.statusUpdatedAt || null,
    createdAt: s.createdAt,
    updatedAt: s.updatedAt,
  });

  // Workflow: List accessible projects
  if ((m = match(config, "get", "/api/workflow/projects"))) {
    if (!auth) error("Unauthorized", 401);
    if (!["university", "industry", "admin"].includes(auth.role)) {
      error("Workflow is private to universities, industry partners and admin only", 403);
    }
    const visible = projects.filter((p) => {
      if (auth.role === "admin") return true;
      if (auth.role === "university") return p.university === auth.org;
      return p.industry === auth.org;
    });
    return json(
      config,
      visible.map((p) => {
        const ac = workflowAccess(p, auth);
        const wb = workflowCanvases.find((c) => c.projectId === p.id);
        return {
          id: p.id,
          _id: p.id,
          issueId: p.issueId,
          title: p.title,
          university: p.university,
          industry: p.industry,
          status: p.status,
          funded: p.funded,
          fundingAmount: p.fundingAmount,
          deadline: p.deadline,
          canvasBuilt: Boolean(wb && (wb.objects || []).length > 0),
          objectCount: (wb?.objects || []).length,
          suggestionCount: workflowSuggestions.filter((s) => s.projectId === p.id).length,
          canEdit: ac.canEdit,
          canSuggest: ac.canSuggest,
          canManageSuggestions: ac.canManageSuggestions,
        };
      })
    );
  }

  // Workflow: Project detail with whiteboard + suggestions
  if ((m = match(config, "get", "/api/workflow/projects/:projectId"))) {
    if (!auth) error("Unauthorized", 401);
    const project = findWorkflowProject(m.params.projectId);
    if (!project) error("Project not found", 404);
    const ac = workflowAccess(project, auth);
    if (!ac.canView) error("You are not authorized to access this workflow", 403);

    const wb = workflowCanvases.find((c) => c.projectId === project.id);
    const suggestions = workflowSuggestions
      .filter((s) => s.projectId === project.id)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return json(config, {
      project: {
        id: project.id,
        _id: project.id,
        issueId: project.issueId,
        title: project.title,
        university: project.university,
        industry: project.industry,
        status: project.status,
        funded: project.funded,
        fundingAmount: project.fundingAmount,
        deadline: project.deadline,
      },
      access: ac,
      canvas: formatMockCanvas(wb),
      suggestions: suggestions.map(formatMockSuggestion),
    });
  }

  // Workflow: University saves the whole whiteboard
  if ((m = match(config, "put", "/api/workflow/projects/:projectId/canvas"))) {
    if (!auth) error("Unauthorized", 401);
    const project = findWorkflowProject(m.params.projectId);
    if (!project) error("Project not found", 404);
    const ac = workflowAccess(project, auth);
    if (!ac.canEdit) error("Only the owning university can edit the workflow canvas", 403);

    const safe = (obj, fallback) =>
      obj !== undefined && obj !== null ? obj : fallback;
    const sanitized = Array.isArray(body.objects)
      ? body.objects
          .filter((o) => o && ["stroke", "rect", "ellipse", "arrow", "text"].includes(o.kind))
          .map((o) => ({
            id: String(o.id || `obj-${Math.random()}`).slice(0, 80),
            kind: o.kind,
            x: Number(safe(o.x, 0)) || 0,
            y: Number(safe(o.y, 0)) || 0,
            w: Number(safe(o.w, 0)) || 0,
            h: Number(safe(o.h, 0)) || 0,
            x2: Number(safe(o.x2, 0)) || 0,
            y2: Number(safe(o.y2, 0)) || 0,
            points: Array.isArray(o.points)
              ? o.points.slice(0, 4000).map((p) => ({ x: Number(p?.x) || 0, y: Number(p?.y) || 0 }))
              : [],
            text: String(o.text || "").slice(0, 500),
            fontSize: Number(safe(o.fontSize, 20)) || 20,
            color: /^#[0-9a-fA-F]{6}$/.test(String(o.color)) ? String(o.color) : "#0E4B4C",
            strokeWidth: Number(safe(o.strokeWidth, 3)) || 3,
          }))
      : [];

    let wb = workflowCanvases.find((c) => c.projectId === project.id);
    if (!wb) {
      wb = {
        projectId: project.id,
        universityName: auth.org || auth.name || "",
        objects: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      workflowCanvases.push(wb);
    }
    wb.objects = sanitized;
    wb.universityName = auth.org || auth.name || "";
    wb.updatedAt = new Date().toISOString();
    persist();
    return json(config, { success: true, canvas: formatMockCanvas(wb) });
  }

  // Workflow: Business submits a suggestion on the project
  if ((m = match(config, "post", "/api/workflow/projects/:projectId/suggestions"))) {
    if (!auth) error("Unauthorized", 401);
    const project = findWorkflowProject(m.params.projectId);
    if (!project) error("Project not found", 404);
    const ac = workflowAccess(project, auth);
    if (!ac.canSuggest) error("Only businesses involved in this project can submit suggestions", 403);
    const message = body.message || body.content;
    if (!message || !String(message).trim()) error("Suggestion message is required", 400);

    const suggestion = {
      id: `wf-sug-${Date.now()}`,
      projectId: project.id,
      universityId: null,
      universityName: project.university || "",
      businessId: auth.id,
      businessName: auth.org || auth.name || "",
      message: String(message).trim(),
      status: "Pending",
      statusUpdatedAt: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    workflowSuggestions.unshift(suggestion);
    persist();
    return json(config, { success: true, suggestion: formatMockSuggestion(suggestion) }, 201);
  }

  // Workflow: University updates suggestion status
  if ((m = match(config, "patch", "/api/workflow/suggestions/:suggestionId"))) {
    if (!auth) error("Unauthorized", 401);
    const allowed = ["Pending", "Reviewed", "Accepted", "Rejected"];
    if (!allowed.includes(body.status)) {
      error(`Invalid status. Allowed: ${allowed.join(", ")}`, 400);
    }
    const suggestion = workflowSuggestions.find(
      (s) => s.id === m.params.suggestionId || s._id === m.params.suggestionId
    );
    if (!suggestion) error("Suggestion not found", 404);
    const project = findWorkflowProject(suggestion.projectId);
    const ac = workflowAccess(project, auth);
    if (!ac.canManageSuggestions) error("Only the owning university can manage suggestion status", 403);

    suggestion.status = body.status;
    suggestion.statusUpdatedAt = new Date().toISOString();
    suggestion.updatedAt = new Date().toISOString();
    persist();
    return json(config, { success: true, suggestion: formatMockSuggestion(suggestion) });
  }

  error(`No mock for ${config.method} ${config.url}`, 404);
}
