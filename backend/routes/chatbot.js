const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { 
    chatMessage, 
    startInterview, 
    evaluateInterview,
    getSessions,
    getSessionById,
    createSession,
    deleteSession
} = require('../controllers/chatbotController');

// @route   POST /api/chatbot/message
// @desc    Standard chat message with Groq (study-restricted)
// @access  Private
router.post('/message', auth, chatMessage);

// @route   GET /api/chatbot/sessions
// @desc    Get user's chat sessions list
// @access  Private
router.get('/sessions', auth, getSessions);

// @route   POST /api/chatbot/sessions
// @desc    Create a new chat session
// @access  Private
router.post('/sessions', auth, createSession);

// @route   GET /api/chatbot/sessions/:id
// @desc    Get a specific chat session with full messages
// @access  Private
router.get('/sessions/:id', auth, getSessionById);

// @route   DELETE /api/chatbot/sessions/:id
// @desc    Delete a chat session
// @access  Private
router.delete('/sessions/:id', auth, deleteSession);

// @route   GET /api/chatbot/interview/start
// @desc    Generate mock interview questions based on active roadmap path
// @access  Private
router.get('/interview/start', auth, startInterview);

// @route   POST /api/chatbot/interview/evaluate
// @desc    Evaluate interview answers and return focus areas
// @access  Private
router.post('/interview/evaluate', auth, evaluateInterview);

module.exports = router;
