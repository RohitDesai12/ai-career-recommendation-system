const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
    chat,
    getSessions,
    getSessionById,
    deleteSession
} = require('../controllers/assistantController');

// @route   POST /api/assistant/chat
// @desc    Chat with Career Compass Assistant (RAG + Authenticated User Context)
// @access  Private
router.post('/chat', auth, chat);

// @route   GET /api/assistant/sessions
// @desc    Get user's assistant chat sessions
// @access  Private
router.get('/sessions', auth, getSessions);

// @route   GET /api/assistant/sessions/:id
// @desc    Get details for a specific session
// @access  Private
router.get('/sessions/:id', auth, getSessionById);

// @route   DELETE /api/assistant/sessions/:id
// @desc    Delete/clear a session
// @access  Private
router.delete('/sessions/:id', auth, deleteSession);

module.exports = router;
