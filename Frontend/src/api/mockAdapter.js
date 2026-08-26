import { mockAnalytics, mockUsers, seedIssues, seedProjects } from "./mockData";
import { ROLES } from "../lib/constants";

const delay = (ms = 280) => new Promise((r) => setTimeout(r, ms));

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

let users = load("cp_users", mockUsers);
let issues = load("cp_issues", seedIssues);
let projects = load("cp_projects", seedProjects);

function persist() {
  save("cp_users", users);
  save("cp_issues", issues);
  save("cp_projects", projects);
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

export async function handleMockRequest(config) {
  await delay();
  const body = typeof config.data === "string" ? JSON.parse(config.data || "{}") : config.data || {};
  const auth = userFromAuth(config);

  let m;

  if ((m = match(config, "post", "/api/auth/login"))) {
    const user = users.find((u) => u.email === body.email && u.password === body.password);
    if (!user) error("Invalid email or password", 401);
    return json(config, { token: tokenFor(user), user: publicUser(user) });
  }

  if ((m = match(config, "post", "/api/auth/register"))) {
    if (users.some((u) => u.email === body.email)) error("Email already registered", 409);
    const pendingRoles = [ROLES.UNIVERSITY, ROLES.INDUSTRY];
    const user = {
      id: `u-${Date.now()}`,
      name: body.name,
      email: body.email,
      password: body.password,
      role: body.role,
      status: pendingRoles.includes(body.role) ? "pending" : "active",
      org: body.org || "",
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
    const issue = {
      id: `iss-${Date.now()}`,
      title: body.title,
      description: body.description,
      category: body.category,
      status: "New",
      priority: body.priority || "Medium",
      reporterId: auth.id,
      reporterName: auth.name,
      district: body.district,
      block: body.block,
      landmark: body.landmark,
      lat: body.lat,
      lng: body.lng,
      createdAt: new Date().toISOString(),
      images: body.evidence || [],
      severity: {
        flooding: Math.round(20 + Math.random() * 70),
        publicRisk: Math.round(30 + Math.random() * 60),
        urgency: Math.round(25 + Math.random() * 70),
      },
      assignee: null,
      timeline: [{ at: new Date().toISOString(), label: "Reported by Community Reporter" }],
    };
    issues.unshift(issue);
    persist();
    return json(config, issue, 201);
  }

  if ((m = match(config, "get", "/api/issues"))) {
    let list = [...issues];
    const { reporterId, status, lat, lng } = m.query;
    if (reporterId) list = list.filter((i) => i.reporterId === reporterId);
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
    const issue = issues.find((i) => i.id === m.params.id);
    if (!issue) error("Issue not found", 404);
    return json(config, issue);
  }

  if ((m = match(config, "patch", "/api/issues/:id/status"))) {
    const issue = issues.find((i) => i.id === m.params.id);
    if (!issue) error("Issue not found", 404);
    issue.status = body.status;
    issue.timeline.push({ at: new Date().toISOString(), label: `Status updated to ${body.status}` });
    persist();
    return json(config, issue);
  }

  if ((m = match(config, "get", "/api/university/queue"))) {
    const list = issues.filter((i) => ["New", "Under review", "Assigned"].includes(i.status));
    return json(config, list);
  }

  if ((m = match(config, "post", "/api/projects/:issueId/teams"))) {
    let project = projects.find((p) => p.issueId === m.params.issueId);
    if (!project) {
      const issue = issues.find((i) => i.id === m.params.issueId);
      project = {
        id: `prj-${Date.now()}`,
        issueId: m.params.issueId,
        title: issue ? `Solution for ${issue.title}` : "New project",
        university: auth?.org || "University",
        industry: null,
        status: "Team forming",
        funded: false,
        team: body.team || [],
        proposal: "",
        milestones: [],
      };
      projects.push(project);
    } else {
      project.team = body.team || [];
    }
    persist();
    return json(config, project);
  }

  if ((m = match(config, "post", "/api/projects/:issueId/proposals"))) {
    let project = projects.find((p) => p.issueId === m.params.issueId);
    if (!project) {
      project = {
        id: `prj-${Date.now()}`,
        issueId: m.params.issueId,
        title: body.title,
        university: auth?.org || "University",
        industry: null,
        status: "Awaiting funding",
        funded: false,
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
      issue.assignee = auth?.org || issue.assignee;
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
    project.funded = true;
    project.status = "Funded";
    project.industry = auth?.org || "Industry partner";
    persist();
    return json(config, project);
  }

  if ((m = match(config, "patch", "/api/projects/:projectId/milestones"))) {
    const project = projects.find((p) => p.id === m.params.projectId);
    if (!project) error("Project not found", 404);
    project.milestones = body.milestones || project.milestones;
    persist();
    return json(config, project);
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
