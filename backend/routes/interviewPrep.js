const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { 
    searchCompaniesAndRoles, 
    getPrepDetail, 
    startMockInterview, 
    evaluateMockInterview,
    savePrepDetail,
    getSavedPreps,
    unsavePrepDetail,
    checkSavedStatus
} = require('../controllers/interviewPrepController');

// @route   GET /api/interview-prep/search
// @desc    Search companies or roles
// @access  Private
router.get('/search', auth, searchCompaniesAndRoles);

// @route   GET /api/interview-prep/detail
// @desc    Get detailed preparation guide for company + role
// @access  Private
router.get('/detail', auth, getPrepDetail);

// @route   GET /api/interview-prep/mock/start
// @desc    Start company-specific mock interview
// @access  Private
router.get('/mock/start', auth, startMockInterview);

// @route   POST /api/interview-prep/mock/evaluate
// @desc    Evaluate company-specific mock interview responses
// @access  Private
router.post('/mock/evaluate', auth, evaluateMockInterview);

// @route   POST /api/interview-prep/save
// @desc    Save company-specific prep guide for user
// @access  Private
router.post('/save', auth, savePrepDetail);

// @route   GET /api/interview-prep/saved
// @desc    Get all saved prep guides for user
// @access  Private
router.get('/saved', auth, getSavedPreps);

// @route   DELETE /api/interview-prep/save
// @desc    Unsave company-specific prep guide for user
// @access  Private
router.delete('/save', auth, unsavePrepDetail);

// @route   GET /api/interview-prep/saved-status
// @desc    Check if prep guide is saved for user
// @access  Private
router.get('/saved-status', auth, checkSavedStatus);

module.exports = router;
