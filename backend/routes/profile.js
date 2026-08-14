const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { getMyProfile, updateProfile } = require('../controllers/profileController');

router.get('/me', auth, getMyProfile);
router.put('/', auth, updateProfile);

module.exports = router;
