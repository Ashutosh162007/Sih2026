const WorkflowNote = require('../models/WorkflowNote');
const WorkflowSuggestion = require('../models/WorkflowSuggestion');
const Project = require('../models/Project');

function isProjectOwner(project, user) {
  if (!project || !user) return false;
  const uid = String(user._id || user.id);
  return String(project.universityId) === uid;
}

function isProjectBusiness(project, user) {
  if (!project || !user) return false;
  const uid = String(user._id || user.id);
  return String(project.industryId) === uid;
}

// ─────────────────────── NOTES ───────────────────────

const getNotes = async (req, res, next) => {
  try {
    const { projectId } = req.query;
    if (!projectId) {
      return res.status(400).json({ success: false, message: 'projectId is required' });
    }

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    const user = req.user;
    const role = user.role;

    if (role === 'citizen') {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }
    if (role === 'university' && !isProjectOwner(project, user)) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }
    if (role === 'industry' && !isProjectBusiness(project, user)) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const notes = await WorkflowNote.find({ projectId })
      .sort({ createdAt: -1 })
      .populate('universityId', 'name org')
      .populate('createdBy', 'name');

    res.json(notes);
  } catch (err) {
    next(err);
  }
};

const getNoteById = async (req, res, next) => {
  try {
    const note = await WorkflowNote.findById(req.params.id)
      .populate('universityId', 'name org')
      .populate('createdBy', 'name');

    if (!note) {
      return res.status(404).json({ success: false, message: 'Note not found' });
    }

    const project = await Project.findById(note.projectId);
    const user = req.user;
    const role = user.role;

    if (role === 'citizen') {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }
    if (role === 'university' && !isProjectOwner(project, user)) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }
    if (role === 'industry' && !isProjectBusiness(project, user)) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    res.json(note);
  } catch (err) {
    next(err);
  }
};

const createNote = async (req, res, next) => {
  try {
    const { title, content, projectId } = req.body;
    const user = req.user;

    if (user.role !== 'university' && user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Only university users can create notes' });
    }

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    if (user.role === 'university' && !isProjectOwner(project, user)) {
      return res.status(403).json({ success: false, message: 'You can only create notes for your own projects' });
    }

    const note = await WorkflowNote.create({
      title,
      content,
      projectId,
      universityId: project.universityId,
      createdBy: user._id,
      createdByName: user.name || '',
    });

    res.status(201).json(note);
  } catch (err) {
    next(err);
  }
};

const updateNote = async (req, res, next) => {
  try {
    const { title, content } = req.body;
    const user = req.user;

    if (user.role !== 'university' && user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Only university users can edit notes' });
    }

    const note = await WorkflowNote.findById(req.params.id);
    if (!note) {
      return res.status(404).json({ success: false, message: 'Note not found' });
    }

    const project = await Project.findById(note.projectId);
    if (user.role === 'university' && !isProjectOwner(project, user)) {
      return res.status(403).json({ success: false, message: 'You can only edit notes for your own projects' });
    }

    if (title !== undefined) note.title = title;
    if (content !== undefined) note.content = content;
    await note.save();

    res.json(note);
  } catch (err) {
    next(err);
  }
};

const deleteNote = async (req, res, next) => {
  try {
    const user = req.user;

    if (user.role !== 'university' && user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Only university users can delete notes' });
    }

    const note = await WorkflowNote.findById(req.params.id);
    if (!note) {
      return res.status(404).json({ success: false, message: 'Note not found' });
    }

    const project = await Project.findById(note.projectId);
    if (user.role === 'university' && !isProjectOwner(project, user)) {
      return res.status(403).json({ success: false, message: 'You can only delete notes for your own projects' });
    }

    await WorkflowNote.findByIdAndDelete(req.params.id);
    await WorkflowSuggestion.deleteMany({ noteId: req.params.id });

    res.json({ success: true, message: 'Note deleted' });
  } catch (err) {
    next(err);
  }
};

// ─────────────────────── SUGGESTIONS ───────────────────────

const getSuggestions = async (req, res, next) => {
  try {
    const { projectId, noteId } = req.query;
    const user = req.user;

    if (user.role === 'citizen') {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const filter = {};
    if (projectId) filter.projectId = projectId;
    if (noteId) filter.noteId = noteId;

    if (user.role === 'industry') {
      filter.businessId = user._id;
    }

    if (user.role === 'university') {
      const projectIds = (await Project.find({ universityId: user._id })).map((p) => p._id);
      filter.projectId = { $in: projectIds };
    }

    const suggestions = await WorkflowSuggestion.find(filter)
      .sort({ createdAt: -1 })
      .populate('noteId', 'title')
      .populate('businessId', 'name org')
      .populate('universityId', 'name org');

    res.json(suggestions);
  } catch (err) {
    next(err);
  }
};

const createSuggestion = async (req, res, next) => {
  try {
    const { noteId, message } = req.body;
    const user = req.user;

    if (user.role !== 'industry') {
      return res.status(403).json({ success: false, message: 'Only industry users can submit suggestions' });
    }

    const note = await WorkflowNote.findById(noteId);
    if (!note) {
      return res.status(404).json({ success: false, message: 'Note not found' });
    }

    const project = await Project.findById(note.projectId);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    const suggestion = await WorkflowSuggestion.create({
      projectId: note.projectId,
      noteId,
      universityId: note.universityId,
      businessId: user._id,
      businessName: user.name || user.org || '',
      message,
      status: 'Pending',
    });

    res.status(201).json(suggestion);
  } catch (err) {
    next(err);
  }
};

const updateSuggestionStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const user = req.user;

    if (user.role !== 'university' && user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Only university users can update suggestion status' });
    }

    if (!['Reviewed', 'Accepted', 'Rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const suggestion = await WorkflowSuggestion.findById(req.params.id);
    if (!suggestion) {
      return res.status(404).json({ success: false, message: 'Suggestion not found' });
    }

    const project = await Project.findById(suggestion.projectId);
    if (user.role === 'university' && !isProjectOwner(project, user)) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    suggestion.status = status;
    await suggestion.save();

    res.json(suggestion);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getNotes,
  getNoteById,
  createNote,
  updateNote,
  deleteNote,
  getSuggestions,
  createSuggestion,
  updateSuggestionStatus,
};
