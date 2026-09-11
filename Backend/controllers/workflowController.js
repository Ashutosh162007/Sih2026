const mongoose = require('mongoose');
const Project = require('../models/Project');
const WorkflowWhiteboard = require('../models/WorkflowWhiteboard');
const BusinessSuggestion = require('../models/BusinessSuggestion');

// ---------------------------------------------------------------------------
// Access helpers (enforced server-side — never rely on the UI to hide data)
// ---------------------------------------------------------------------------
const orgName = (user) => user?.org || user?.name || '';

// University: full control of the workflow whiteboard.
// Business (industry): view the canvas + submit suggestions only.
// Govt/Admin: view only.
// Everyone else (citizens): no access.
function accessFor(project, user) {
  const access = { canView: false, canEdit: false, canSuggest: false, canManageSuggestions: false };

  if (!user || !project) return access;

  if (user.role === 'admin') {
    access.canView = true;
    return access;
  }

  const isOwnerUni =
    user.role === 'university' &&
    (String(project.universityId || '') === String(user._id) ||
      (orgName(user) && project.university === orgName(user)));

  const isInvolvedBusiness =
    user.role === 'industry' &&
    (String(project.industryId || '') === String(user._id) ||
      (orgName(user) && project.industry === orgName(user)));

  if (user.role === 'university' && isOwnerUni) {
    access.canView = true;
    access.canEdit = true;
    access.canManageSuggestions = true;
  } else if (user.role === 'industry' && isInvolvedBusiness) {
    access.canView = true;
    access.canSuggest = true;
  }
  return access;
}

async function findProject(ref) {
  if (!ref) return null;
  if (mongoose.isValidObjectId(ref)) {
    const byId = await Project.findById(ref);
    if (byId) return byId;
  }
  return await Project.findOne({ issueId: ref });
}

const deny = (res, msg = 'You are not authorized to access this workflow') =>
  res.status(403).json({ success: false, message: msg });

const KINDS = ['stroke', 'rect', 'ellipse', 'arrow', 'text'];

function sanitizeObjects(payload) {
  if (!Array.isArray(payload)) return [];
  return payload
    .filter((o) => o && KINDS.includes(o.kind))
    .map((o) => ({
      id: String(o.id || `obj-${Math.random()}`).slice(0, 80),
      kind: o.kind,
      x: Number.isFinite(Number(o.x)) ? Number(o.x) : 0,
      y: Number.isFinite(Number(o.y)) ? Number(o.y) : 0,
      w: Number.isFinite(Number(o.w)) ? Number(o.w) : 0,
      h: Number.isFinite(Number(o.h)) ? Number(o.h) : 0,
      x2: Number.isFinite(Number(o.x2)) ? Number(o.x2) : 0,
      y2: Number.isFinite(Number(o.y2)) ? Number(o.y2) : 0,
      points: Array.isArray(o.points)
        ? o.points
            .slice(0, 4000)
            .map((p) => ({
              x: Number.isFinite(Number(p?.x)) ? Number(p.x) : 0,
              y: Number.isFinite(Number(p?.y)) ? Number(p.y) : 0,
            }))
        : [],
      text: String(o.text || '').slice(0, 500),
      fontSize: Number.isFinite(Number(o.fontSize)) ? Number(o.fontSize) : 20,
      color: /^#[0-9a-fA-F]{6}$/.test(String(o.color)) ? String(o.color) : '#0E4B4C',
      strokeWidth: Number.isFinite(Number(o.strokeWidth)) ? Number(o.strokeWidth) : 3,
    }));
}

const formatCanvas = (wb) =>
  wb
    ? { objects: (wb.objects || []).map((o) => o.toObject?.() || o), updatedAt: wb.updatedAt }
    : { objects: [], updatedAt: null };

const formatSuggestion = (s) => ({
  id: s._id,
  _id: s._id,
  projectId: s.projectId,
  businessId: s.business || s.businessName || null,
  businessName: s.businessName || '',
  message: s.message,
  status: s.status,
  statusUpdatedAt: s.statusUpdatedAt || null,
  createdAt: s.createdAt,
  updatedAt: s.updatedAt,
});

// ---------------------------------------------------------------------------
// @desc    List projects the current user may access in the Workflow area
// @route   GET /api/workflow/projects
// @access  Private (University | Industry | Admin)
// ---------------------------------------------------------------------------
const listWorkflowProjects = async (req, res, next) => {
  try {
    const user = req.user;
    if (!['university', 'industry', 'admin'].includes(user?.role)) {
      return deny(res, 'Workflow is private to universities, industry partners and admin only');
    }

    let filter = {};
    if (user.role === 'university' && orgName(user)) {
      filter = { $or: [{ universityId: user._id }, { university: orgName(user) }] };
    } else if (user.role === 'industry' && orgName(user)) {
      filter = { $or: [{ industryId: user._id }, { industry: orgName(user) }] };
    } else {
      filter = user.role === 'university' ? { universityId: user._id } : { industryId: user._id };
    }

    const projects = await Project.find(filter).sort({ updatedAt: -1 });
    const projectIds = projects.map((p) => p._id);

    const boards = await WorkflowWhiteboard.find({ project: { $in: projectIds } });
    const objectCounts = Object.fromEntries(
      boards.map((b) => [String(b.project), (b.objects || []).length])
    );
    const sugCounts = await BusinessSuggestion.aggregate([
      { $match: { project: { $in: projectIds } } },
      { $group: { _id: '$project', count: { $sum: 1 } } },
    ]);
    const sugMap = Object.fromEntries(sugCounts.map((s) => [String(s._id), s.count]));

    res.json(
      projects.map((p) => {
        const ac = accessFor(p, user);
        return {
          id: p._id,
          _id: p._id,
          issueId: p.issueId,
          title: p.title,
          university: p.university,
          industry: p.industry,
          status: p.status,
          funded: p.funded,
          fundingAmount: p.fundingAmount,
          deadline: p.deadline,
          canvasBuilt: Boolean(objectCounts[String(p._id)]),
          objectCount: objectCounts[String(p._id)] || 0,
          suggestionCount: sugMap[String(p._id)] || 0,
          canEdit: ac.canEdit,
          canSuggest: ac.canSuggest,
          canManageSuggestions: ac.canManageSuggestions,
        };
      })
    );
  } catch (err) {
    next(err);
  }
};

// ---------------------------------------------------------------------------
// @desc    Get one project with its workflow whiteboard + suggestions
// @route   GET /api/workflow/projects/:projectId
// @access  Private (University | Industry | Admin)
// ---------------------------------------------------------------------------
const getWorkflowProject = async (req, res, next) => {
  try {
    const project = await findProject(req.params.projectId);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }
    const access = accessFor(project, req.user);
    if (!access.canView) {
      return deny(res);
    }

    const [board, suggestions] = await Promise.all([
      WorkflowWhiteboard.findOne({ project: project._id }),
      BusinessSuggestion.find({ project: project._id }).sort({ createdAt: -1 }),
    ]);

    res.json({
      project: {
        id: project._id,
        _id: project._id,
        issueId: project.issueId,
        title: project.title,
        university: project.university,
        industry: project.industry,
        status: project.status,
        funded: project.funded,
        fundingAmount: project.fundingAmount,
        deadline: project.deadline,
      },
      access,
      canvas: formatCanvas(board),
      suggestions: suggestions.map(formatSuggestion),
    });
  } catch (err) {
    next(err);
  }
};

// ---------------------------------------------------------------------------
// @desc    University saves the whole whiteboard (upsert)
// @route   PUT /api/workflow/projects/:projectId/canvas
// @access  Private (Owning University)
// ---------------------------------------------------------------------------
const saveWorkflowCanvas = async (req, res, next) => {
  try {
    const project = await findProject(req.params.projectId);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }
    const access = accessFor(project, req.user);
    if (!access.canEdit) {
      return deny(res, 'Only the owning university can edit the workflow canvas');
    }

    const objects = sanitizeObjects(req.body?.objects);

    const board = await WorkflowWhiteboard.findOneAndUpdate(
      { project: project._id },
      {
        $set: {
          project: project._id,
          projectId: String(project._id),
          university: req.user._id,
          universityName: orgName(req.user),
          objects,
        },
      },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    res.json({ success: true, canvas: formatCanvas(board) });
  } catch (err) {
    next(err);
  }
};

// ---------------------------------------------------------------------------
// @desc    Business submits a suggestion on a project's workflow
// @route   POST /api/workflow/projects/:projectId/suggestions
// @access  Private (Industry involved in project)
// ---------------------------------------------------------------------------
const createSuggestion = async (req, res, next) => {
  try {
    const { message } = req.body || {};
    if (!message || !String(message).trim()) {
      return res.status(400).json({ success: false, message: 'Suggestion message is required' });
    }

    const project = await findProject(req.params.projectId);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }
    const access = accessFor(project, req.user);
    if (!access.canSuggest) {
      return deny(res, 'Only businesses involved in this project can submit suggestions');
    }

    const suggestion = await BusinessSuggestion.create({
      project: project._id,
      projectId: String(project._id),
      university: project.universityId || null,
      universityId: String(project.universityId || ''),
      universityName: project.university || '',
      business: req.user._id,
      businessName: orgName(req.user),
      message: String(message).trim(),
      status: 'Pending',
    });

    res.status(201).json({ success: true, suggestion: formatSuggestion(suggestion) });
  } catch (err) {
    next(err);
  }
};

// ---------------------------------------------------------------------------
// @desc    University updates decision status on a suggestion
// @route   PATCH /api/workflow/suggestions/:suggestionId
// @access  Private (Owning University)
// ---------------------------------------------------------------------------
const updateSuggestionStatus = async (req, res, next) => {
  try {
    const allowed = ['Pending', 'Reviewed', 'Accepted', 'Rejected'];
    const { status } = req.body || {};
    if (!allowed.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Allowed: ${allowed.join(', ')}`,
      });
    }

    const suggestion = await BusinessSuggestion.findById(req.params.suggestionId);
    if (!suggestion) {
      return res.status(404).json({ success: false, message: 'Suggestion not found' });
    }

    const project = await Project.findById(suggestion.project);
    const access = accessFor(project, req.user);
    if (!access.canManageSuggestions) {
      return deny(res, 'Only the owning university can manage suggestion status');
    }

    suggestion.status = status;
    suggestion.statusUpdatedAt = new Date();
    await suggestion.save();

    res.json({ success: true, suggestion: formatSuggestion(suggestion) });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  listWorkflowProjects,
  getWorkflowProject,
  saveWorkflowCanvas,
  createSuggestion,
  updateSuggestionStatus,
};