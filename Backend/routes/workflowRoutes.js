const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
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
} = require('../controllers/workflowController');

router.get('/notes', protect, getNotes);
router.get('/notes/:id', protect, getNoteById);
router.post('/notes', protect, createNote);
router.put('/notes/:id', protect, updateNote);
router.delete('/notes/:id', protect, deleteNote);

router.get('/suggestions', protect, getSuggestions);
router.post('/suggestions', protect, createSuggestion);
router.patch('/suggestions/:id/status', protect, updateSuggestionStatus);

router.get('/projects/:id/canvas', protect, getCanvas);
router.put('/projects/:id/canvas', protect, saveCanvas);

module.exports = router;
