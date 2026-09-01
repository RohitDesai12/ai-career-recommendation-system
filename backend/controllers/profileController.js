const Profile = require('../models/Profile');
const User = require('../models/User');

// @desc    Get current user profile
// @route   GET /api/profile/me
// @access  Private
exports.getMyProfile = async (req, res) => {
    try {
        const profile = await Profile.findOne({ user: req.user.id }).populate('user', ['name', 'email']);

        if (!profile) {
            return res.status(400).json({ msg: 'There is no profile for this user' });
        }

        res.json(profile);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// @desc    Update user profile
// @route   PUT /api/profile
// @access  Private
exports.updateProfile = async (req, res) => {
    const { education, skills, interests, recommendedCareers, skill_ratings, targetCareer, resumeData } = req.body;

    // Build profile object
    const profileFields = {};
    if (education) profileFields.education = education;
    if (skills) {
        profileFields.skills = Array.isArray(skills) ? skills : skills.split(',').map(skill => skill.trim());
    }
    if (interests) {
        profileFields.interests = Array.isArray(interests) ? interests : interests.split(',').map(interest => interest.trim());
    }
    if (recommendedCareers) {
        profileFields.recommendedCareers = recommendedCareers;
    }
    if (skill_ratings) {
        profileFields.skill_ratings = skill_ratings;
    }
    if (targetCareer) {
        profileFields.targetCareer = targetCareer;
    }
    if (resumeData) {
        profileFields.resumeData = resumeData;
    }
    profileFields.updatedAt = Date.now();

    try {
        let profile = await Profile.findOne({ user: req.user.id });

        if (profile) {
            // Update
            profile = await Profile.findOneAndUpdate(
                { user: req.user.id },
                { $set: profileFields },
                { new: true }
            );
            return res.json(profile);
        }

        // Create
        profileFields.user = req.user.id;
        profile = new Profile(profileFields);
        await profile.save();
        res.json(profile);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// @desc    Save/unsave a course
// @route   PUT /api/profile/save-course
// @access  Private
exports.toggleSaveCourse = async (req, res) => {
    const { courseId } = req.body;

    if (courseId === undefined) {
        return res.status(400).json({ msg: 'Please provide courseId' });
    }

    try {
        let profile = await Profile.findOne({ user: req.user.id });

        if (!profile) {
            profile = new Profile({ user: req.user.id, savedCourses: [] });
        }

        if (!profile.savedCourses) {
            profile.savedCourses = [];
        }

        const index = profile.savedCourses.indexOf(courseId);
        if (index > -1) {
            // Unsave
            profile.savedCourses.splice(index, 1);
        } else {
            // Save
            profile.savedCourses.push(courseId);
        }

        profile.updatedAt = Date.now();
        await profile.save();
        res.json(profile);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};
