const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getWorkflowProjects,
  getNotes,
  getNoteById,
  createNote,
  updateNote,
  deleteNote,
  getSuggestions,
  createSuggestion,
  updateSuggestionStatus,
  getCanvas,
  saveCanvas,
  getChecklist,
  createChecklistItem,
  updateChecklistItem,
  deleteChecklistItem,
  provideChecklistItem,
} = require('../controllers/workflowController');

router.get('/notes', protect, getNotes);
router.get('/notes/:id', protect, getNoteById);
router.post('/notes', protect, createNote);
router.put('/notes/:id', protect, updateNote);
router.delete('/notes/:id', protect, deleteNote);

router.get('/projects', protect, getWorkflowProjects);

router.get('/suggestions', protect, getSuggestions);
router.post('/suggestions', protect, createSuggestion);
router.patch('/suggestions/:id/status', protect, updateSuggestionStatus);

router.get('/projects/:id/canvas', protect, getCanvas);
router.put('/projects/:id/canvas', protect, saveCanvas);

router.get('/projects/:id/checklist', protect, getChecklist);
router.post('/projects/:id/checklist', protect, createChecklistItem);
router.put('/checklist/:id', protect, updateChecklistItem);
router.delete('/checklist/:id', protect, deleteChecklistItem);
router.patch('/checklist/:id/provide', protect, provideChecklistItem);

module.exports = router;
