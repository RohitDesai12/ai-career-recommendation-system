const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');
const Profile = require('../models/Profile');

// @desc    Get dashboard stats and users (Admin only)
// @route   GET /api/admin/dashboard
// @access  Private (Admin)
router.get('/dashboard', auth, async (req, res) => {
    try {
        // Check role manually for prototype
        const requestUser = await User.findById(req.user.id);
        if (!requestUser || requestUser.role !== 'admin') {
            return res.status(403).json({ msg: 'Not authorized as admin' });
        }

        const students = await User.find({ role: 'student' }).select('-password');
        const profiles = await Profile.find().populate('user', ['name', 'email']);

        res.json({
            totalStudents: students.length,
            recentProfiles: profiles.slice(0, 10) // Mocking recent 10 for dashboard
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
