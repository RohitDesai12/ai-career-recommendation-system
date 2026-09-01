const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { getMyProfile, updateProfile, toggleSaveCourse } = require('../controllers/profileController');

router.get('/me', auth, getMyProfile);
router.put('/', auth, updateProfile);
router.put('/save-course', auth, toggleSaveCourse);

module.exports = router;
