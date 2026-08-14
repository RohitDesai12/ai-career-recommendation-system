const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { getRoadmap, generateRoadmap, toggleSkill, resetRoadmap } = require('../controllers/roadmapController');

// @route   GET /api/roadmap
// @desc    Get active user roadmap
// @access  Private
router.get('/', auth, getRoadmap);

// @route   POST /api/roadmap
// @desc    Generate a new user roadmap
// @access  Private
router.post('/', auth, generateRoadmap);

// @route   PUT /api/roadmap/toggle-skill
// @desc    Toggle completion of a skill
// @access  Private
router.put('/toggle-skill', auth, toggleSkill);

// @route   DELETE /api/roadmap
// @desc    Reset / delete user roadmap
// @access  Private
router.delete('/', auth, resetRoadmap);

module.exports = router;
