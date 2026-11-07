const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { registerUser, loginUser, logoutUser, getMe, changePassword, updateAccount } = require('../controllers/authController');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/logout', logoutUser);
router.get('/me', auth, getMe);
router.put('/change-password', auth, changePassword);
router.put('/update-account', auth, updateAccount);

module.exports = router;
