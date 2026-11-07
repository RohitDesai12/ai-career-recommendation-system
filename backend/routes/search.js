const express = require('express');
const router = express.Router();
const {
    getSearchSuggestions,
    performGlobalSearch,
    getLocationSuggestions
} = require('../controllers/searchController');

// @route   GET /api/search/suggestions
// @desc    Fast, relevance-ranked global search suggestions
// @access  Public
router.get('/suggestions', getSearchSuggestions);

// @route   GET /api/search/locations
// @desc    Get real location autocomplete suggestions
// @access  Public
router.get('/locations', getLocationSuggestions);

// @route   GET /api/search
// @desc    Full multi-category global search
// @access  Public
router.get('/', performGlobalSearch);

module.exports = router;
