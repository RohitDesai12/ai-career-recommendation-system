const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
    submitAssessment,
    getLatestAssessment,
    getAssessmentHistory,
    evaluateChallenge
} = require('../controllers/assessmentController');

// @route   POST /api/assessment/submit
// @desc    Submit 8-step career discovery assessment
// @access  Private
router.post('/submit', auth, submitAssessment);

// @route   GET /api/assessment/latest
// @desc    Get latest assessment for student
// @access  Private
router.get('/latest', auth, getLatestAssessment);

// @route   GET /api/assessment/history
// @desc    Get all previous assessment attempts
// @access  Private
router.get('/history', auth, getAssessmentHistory);

// @route   POST /api/assessment/challenge
// @desc    Evaluate on-demand 5-minute career challenge
// @access  Private
router.post('/challenge', auth, evaluateChallenge);

module.exports = router;
