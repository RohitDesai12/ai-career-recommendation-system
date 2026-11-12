const User = require('../models/User');
const Profile = require('../models/Profile');
const PrivacyConsent = require('../models/PrivacyConsent');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { getJwtSecret } = require('../config/jwt');

const getCookieOptions = () => ({
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: '/'
});

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.registerUser = async (req, res) => {
    const { name, email, password, role, consent, termsAccepted, privacyAccepted, consentVersion } = req.body;

    if (role === 'employer' || role === 'recruiter') {
        return res.status(400).json({ msg: 'Recruiter registration has been discontinued.' });
    }

    try {
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ msg: 'User already exists' });
        }

        const hasConsent = Boolean(termsAccepted || consent?.termsAccepted);

        user = new User({
            name,
            email,
            password,
            role: role === 'admin' ? 'admin' : 'student',
            consent: {
                termsAccepted: hasConsent,
                privacyAccepted: hasConsent,
                version: consentVersion || consent?.version || 'v1.0',
                acceptedAt: hasConsent ? new Date() : null
            }
        });

        await user.save();

        if (hasConsent) {
            try {
                await PrivacyConsent.create({
                    user: user._id,
                    userEmail: user.email,
                    consentType: 'registration',
                    documentVersion: consentVersion || consent?.version || 'v1.0',
                    termsAccepted: true,
                    privacyAccepted: true,
                    preferences: {
                        essential: true,
                        functional: Boolean(consent?.functional || req.body.functionalCookies),
                        analytics: Boolean(consent?.analytics || req.body.analyticsCookies),
                        marketing: Boolean(consent?.marketing || req.body.marketingCookies)
                    },
                    ipAddress: req.ip || req.connection?.remoteAddress || '',
                    userAgent: req.headers['user-agent'] || '',
                    recordedAt: new Date()
                });
            } catch (consentErr) {
                console.error('Failed to log registration consent:', consentErr);
            }
        }

        // Create an empty profile for the student
        if (user.role === 'student') {
            const profile = new Profile({ user: user._id });
            await profile.save();
        }

        const payload = {
            user: {
                id: user.id,
                role: user.role
            }
        };

        jwt.sign(
            payload,
            getJwtSecret(),
            { expiresIn: '7d' },
            (err, token) => {
                if (err) throw err;
                res.cookie('auth_token', token, getCookieOptions());
                res.json({ token, user: { id: user.id, name: user.name, role: user.role } });
            }
        );
    } catch (err) {
        console.error(err.message);
        res.status(500).send(err.message);
    }
};

// @desc    Get authenticated user info
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }
        res.json({
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (err) {
        console.error('Error fetching authenticated user:', err.message);
        res.status(500).json({ msg: 'Server error fetching user profile' });
    }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
exports.loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        const cleanEmail = (email || '').trim().toLowerCase();
        let user = await User.findOne({ email: { $regex: new RegExp(`^${cleanEmail.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') } });
        if (!user) {
            return res.status(400).json({ msg: 'Invalid Credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ msg: 'Invalid Credentials' });
        }

        if (user.role === 'employer' || user.role === 'recruiter') {
            return res.status(403).json({ msg: 'The Recruiter Portal has been discontinued.' });
        }

        const payload = {
            user: {
                id: user.id,
                role: user.role
            }
        };

        jwt.sign(
            payload,
            getJwtSecret(),
            { expiresIn: '7d' },
            (err, token) => {
                if (err) throw err;
                res.cookie('auth_token', token, getCookieOptions());
                res.json({
                    token,
                    user: { id: user.id, name: user.name, email: user.email, role: user.role }
                });
            }
        );
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

// @desc    Change user password
// @route   PUT /api/auth/change-password
// @access  Private
exports.changePassword = async (req, res) => {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
        return res.status(400).json({ msg: 'Please provide both current and new password' });
    }

    if (newPassword.length < 6) {
        return res.status(400).json({ msg: 'New password must be at least 6 characters' });
    }

    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ msg: 'Current password does not match' });
        }

        user.password = newPassword;
        await user.save();

        res.json({ msg: 'Password changed successfully' });
    } catch (err) {
        console.error('Error changing password:', err.message);
        res.status(500).json({ msg: 'Server error changing password' });
    }
};

// @desc    Update user account information (name, phone)
// @route   PUT /api/auth/update-account
// @access  Private
exports.updateAccount = async (req, res) => {
    const { name, phone } = req.body;

    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

        if (name) user.name = name;
        if (phone !== undefined) user.phone = phone;

        await user.save();

        res.json({
            msg: 'Account updated successfully',
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                phone: user.phone || '',
                role: user.role
            }
        });
    } catch (err) {
        console.error('Error updating account:', err.message);
        res.status(500).json({ msg: 'Server error updating account' });
    }
};

// @desc    Logout user & clear auth cookie
// @route   POST /api/auth/logout
// @access  Public
exports.logoutUser = (req, res) => {
    res.clearCookie('auth_token', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/'
    });
    res.json({ msg: 'Logged out successfully' });
};
