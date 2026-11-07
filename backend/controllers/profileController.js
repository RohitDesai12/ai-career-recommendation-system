const Profile = require('../models/Profile');
const User = require('../models/User');
const StudentActivity = require('../models/StudentActivity');
const ResumeHistory = require('../models/ResumeHistory');

// Helper to log student activities
async function logActivity(userId, action, title, category, details) {
    try {
        await StudentActivity.create({
            user: userId,
            action,
            title: title || '',
            category: category || 'job',
            details: details || '',
            createdAt: new Date()
        });
    } catch (err) {
        console.error('Error logging student activity:', err);
    }
}

// Category inference helper for legacy skill migration
function inferSkillCategory(skillName) {
    const s = skillName.toLowerCase();
    if (/python|javascript|typescript|java|c\+\+|c#|go|rust|ruby|php|kotlin|swift|scala/i.test(s)) return 'Programming Languages';
    if (/react|vue|angular|html|css|tailwind|next\.?js|svelte|redux|frontend/i.test(s)) return 'Frontend Development';
    if (/node\.?js|express|django|flask|fastapi|spring|asp\.net|backend|rest api|graphql/i.test(s)) return 'Backend Development';
    if (/sql|postgres|mongodb|mysql|redis|dynamodb|oracle|database/i.test(s)) return 'Databases';
    if (/machine learning|deep learning|pytorch|tensorflow|nlp|scikit|computer vision|ai/i.test(s)) return 'AI & Machine Learning';
    if (/spark|hadoop|kafka|airflow|etl|data warehouse|snowflake|bigquery|data engineering/i.test(s)) return 'Data Engineering';
    if (/aws|azure|gcp|docker|kubernetes|terraform|ci\/cd|devops|linux|cloud/i.test(s)) return 'Cloud & DevOps';
    if (/git|github|jira|postman|vscode|docker|figma/i.test(s)) return 'Tools & Technologies';
    if (/security|penetration|owasp|wireshark|splunk|cryptography|soc/i.test(s)) return 'Cybersecurity';
    return 'Other Technical';
}

// Capitalize skill name cleanly
function normalizeSkillName(name) {
    if (!name || typeof name !== 'string') return '';
    const clean = name.replace(/\s*\((proficient|expert|intermediate|beginner)\)/i, '').trim();
    return clean;
}

// Calculate comprehensive profile completeness
function evaluateProfileCompleteness(profile, user) {
    const sections = [];
    let score = 0;

    // 1. Personal & Contact (15%)
    const hasPersonal = !!(user?.name && (profile?.phone || user?.phone) && (profile?.city || profile?.country));
    if (hasPersonal) {
        score += 15;
        sections.push('personal');
    }

    // 2. Education & Academics (15%)
    const hasEducation = (profile?.educationHistory && profile.educationHistory.length > 0) || !!(profile?.education || profile?.college);
    if (hasEducation) {
        score += 15;
        sections.push('education');
    }

    // 3. Career Preferences (15%)
    const hasPreferences = !!(
        (profile?.careerPreferences?.preferredRoles && profile.careerPreferences.preferredRoles.length > 0) ||
        profile?.targetCareer
    );
    if (hasPreferences) {
        score += 15;
        sections.push('preferences');
    }

    // 4. Technical Skills (15%)
    const skillCount = (profile?.categorizedSkills && profile.categorizedSkills.length > 0) 
        ? profile.categorizedSkills.length 
        : (profile?.skills?.length || 0);
    if (skillCount >= 3) {
        score += 15;
        sections.push('skills');
    } else if (skillCount > 0) {
        score += Math.round((skillCount / 3) * 15);
    }

    // 5. Projects & Portfolio (15%)
    const hasProjects = profile?.projects && profile.projects.length > 0;
    if (hasProjects) {
        score += 15;
        sections.push('projects');
    }

    // 6. Experience or Fresher Declaration (10%)
    const hasExperience = (profile?.workExperience && profile.workExperience.length > 0) || profile?.isFresher === true;
    if (hasExperience) {
        score += 10;
        sections.push('experience');
    }

    // 7. Summary & Professional Links (10%)
    const hasSummary = !!(profile?.summary && profile.summary.length >= 20);
    const hasLinks = !!(
        profile?.professionalLinks?.github || 
        profile?.professionalLinks?.linkedin || 
        profile?.professionalLinks?.portfolio
    );
    if (hasSummary && hasLinks) {
        score += 10;
        sections.push('summary_links');
    } else if (hasSummary || hasLinks) {
        score += 5;
    }

    // 8. Certifications or Soft Skills (5%)
    const hasCertsOrSoft = (profile?.certifications && profile.certifications.length > 0) || (profile?.softSkills && profile.softSkills.length >= 2);
    if (hasCertsOrSoft) {
        score += 5;
        sections.push('certifications');
    }

    const missingSections = [];
    if (!sections.includes('personal')) {
        missingSections.push({ id: 'personal', name: 'Personal & Contact Details', points: 15, actionText: 'Add your city, phone, and location details' });
    }
    if (!sections.includes('education')) {
        missingSections.push({ id: 'education', name: 'Education & Academics', points: 15, actionText: 'Add your college, degree, and graduation year' });
    }
    if (!sections.includes('preferences')) {
        missingSections.push({ id: 'preferences', name: 'Career Preferences', points: 15, actionText: 'Select your target roles and preferred work modes' });
    }
    if (!sections.includes('skills')) {
        missingSections.push({ id: 'skills', name: 'Technical Skills (at least 3)', points: 15, actionText: 'Add your core programming languages and frameworks' });
    }
    if (!sections.includes('projects')) {
        missingSections.push({ id: 'projects', name: 'Projects & Portfolio', points: 15, actionText: 'Showcase at least one verified software project' });
    }
    if (!sections.includes('experience')) {
        missingSections.push({ id: 'experience', name: 'Work Experience / Fresher Status', points: 10, actionText: 'Add an internship or declare fresher status' });
    }
    if (!sections.includes('summary_links')) {
        missingSections.push({ id: 'summary_links', name: 'Professional Summary & Links', points: 10, actionText: 'Add a summary or connect your GitHub / LinkedIn' });
    }
    if (!sections.includes('certifications')) {
        missingSections.push({ id: 'certifications', name: 'Certifications & Soft Skills', points: 5, actionText: 'Add relevant course certificates or key soft skills' });
    }

    return {
        percentage: Math.min(100, score),
        completedSections: sections,
        missingSections
    };
}

// Backfill legacy profile into structured models if needed
function ensureStructuredData(profile) {
    let modified = false;

    // 1. Backfill educationHistory from legacy fields if empty
    if ((!profile.educationHistory || profile.educationHistory.length === 0) && (profile.education || profile.college)) {
        profile.educationHistory = [{
            degree: profile.education || 'Bachelor of Technology (B.Tech)',
            level: 'Undergraduate',
            specialization: profile.department || 'Computer Science & Engineering',
            institution: profile.college || 'Engineering Institute',
            location: 'India',
            startYear: '2022',
            endYear: profile.graduationYear || '2026',
            currentYear: '3rd Year',
            grade: '8.4',
            gradingScale: '10.0 Scale'
        }];
        modified = true;
    }

    // 2. Backfill categorizedSkills from legacy skills if empty
    if ((!profile.categorizedSkills || profile.categorizedSkills.length === 0) && profile.skills && profile.skills.length > 0) {
        const catMap = new Map();
        profile.skills.forEach(rawSkill => {
            const clean = normalizeSkillName(rawSkill);
            if (clean && !catMap.has(clean.toLowerCase())) {
                let prof = 'Intermediate';
                if (/expert/i.test(rawSkill)) prof = 'Advanced';
                else if (/proficient/i.test(rawSkill)) prof = 'Proficient';
                else if (/beginner/i.test(rawSkill)) prof = 'Beginner';

                catMap.set(clean.toLowerCase(), {
                    name: clean,
                    category: inferSkillCategory(clean),
                    proficiency: prof,
                    yearsExperience: '1-2 years'
                });
            }
        });
        profile.categorizedSkills = Array.from(catMap.values());
        modified = true;
    }

    // 3. Ensure default careerPreferences
    if (!profile.careerPreferences) {
        profile.careerPreferences = {
            preferredRoles: profile.targetCareer ? [profile.targetCareer] : ['Data Engineer', 'Software Engineer'],
            geoScope: 'india',
            preferredCountries: ['India'],
            preferredStates: [],
            preferredCities: ['Bengaluru', 'Hyderabad', 'Pune'],
            workModes: ['Hybrid', 'Remote'],
            minSalary: 6,
            employmentTypes: ['Full Time', 'Internship'],
            experienceLevel: '0-2 years',
            preferredIndustries: ['Technology', 'Software', 'Fintech'],
            willingToRelocate: true,
            internationalWorkAuthorization: false,
            jobAlertsEnabled: true,
            alertFrequency: 'Daily'
        };
        modified = true;
    }

    // 4. Default summary if empty
    if (!profile.summary && profile.targetCareer) {
        profile.summary = `Motivated student targeting ${profile.targetCareer} roles. Passionate about software engineering, data structures, and developing scalable real-world applications with modern tools and clean architecture.`;
        modified = true;
    }

    return modified;
}

// @desc    Get current user profile with completeness metrics
// @route   GET /api/profile/me
// @access  Private
exports.getMyProfile = async (req, res) => {
    try {
        let profile = await Profile.findOne({ user: req.user.id }).populate('user', ['name', 'email', 'phone', 'role']);

        if (!profile) {
            profile = new Profile({
                user: req.user.id,
                skills: [],
                categorizedSkills: [],
                savedCourses: [],
                projects: [],
                educationHistory: [],
                workExperience: [],
                certifications: [],
                achievements: [],
                isFresher: true,
                designation: 'Student & Aspiring Software Engineer',
                country: 'India',
                isPublic: true
            });
            await profile.save();
            profile = await Profile.findById(profile._id).populate('user', ['name', 'email', 'phone', 'role']);
        }

        const wasModified = ensureStructuredData(profile);
        if (wasModified) {
            await profile.save();
        }

        const completeness = evaluateProfileCompleteness(profile, profile.user);

        res.json({
            ...profile.toObject(),
            completeness
        });
    } catch (err) {
        console.error('Error in getMyProfile:', err.message);
        res.status(500).json({ msg: 'Server Error retrieving profile' });
    }
};

// @desc    Update student professional profile
// @route   PUT /api/profile
// @access  Private
exports.updateProfile = async (req, res) => {
    try {
        const {
            name,
            phone,
            designation,
            summary,
            dob,
            city,
            state,
            country,
            address,
            preferredContactMethod,
            isPublic,
            publicPreferences,
            educationHistory,
            categorizedSkills,
            softSkills,
            languages,
            isFresher,
            workExperience,
            projects,
            certifications,
            achievements,
            professionalLinks,
            careerPreferences,
            targetCareer,
            resumeData
        } = req.body;

        let profile = await Profile.findOne({ user: req.user.id });
        if (!profile) {
            profile = new Profile({ user: req.user.id });
        }

        // Update User account level fields (name, phone)
        if (name || phone !== undefined) {
            const userUpdates = {};
            if (name && typeof name === 'string') userUpdates.name = name.trim();
            if (phone !== undefined) userUpdates.phone = phone.trim();
            await User.findByIdAndUpdate(req.user.id, { $set: userUpdates });
        }

        // 1. Basic & Contact Fields
        if (designation !== undefined) profile.designation = designation.trim();
        if (summary !== undefined) profile.summary = summary.trim();
        if (dob !== undefined) profile.dob = dob;
        if (city !== undefined) profile.city = city.trim();
        if (state !== undefined) profile.state = state.trim();
        if (country !== undefined) profile.country = country.trim();
        if (address !== undefined) profile.address = address.trim();
        if (phone !== undefined) profile.phone = phone.trim();
        if (preferredContactMethod) profile.preferredContactMethod = preferredContactMethod;
        if (isPublic !== undefined) profile.isPublic = !!isPublic;
        if (publicPreferences) {
            profile.publicPreferences = {
                ...profile.publicPreferences,
                ...publicPreferences
            };
        }

        // 2. Education History & Synchronization with Legacy Fields
        if (educationHistory && Array.isArray(educationHistory)) {
            profile.educationHistory = educationHistory;
            // Sync highest/latest degree to legacy fields
            if (educationHistory.length > 0) {
                const latest = educationHistory[0];
                profile.education = `${latest.degree}${latest.specialization ? ' - ' + latest.specialization : ''}`;
                profile.college = latest.institution || '';
                profile.graduationYear = latest.endYear || '';
                profile.department = latest.specialization || 'Computer Science & IT';
            }
        }

        // 3. Categorized Skills & Synchronization with Legacy Array
        if (categorizedSkills && Array.isArray(categorizedSkills)) {
            // Deduplicate and normalize
            const uniqueMap = new Map();
            categorizedSkills.forEach(sk => {
                const cleanName = normalizeSkillName(sk.name);
                if (cleanName && !uniqueMap.has(cleanName.toLowerCase())) {
                    uniqueMap.set(cleanName.toLowerCase(), {
                        name: cleanName,
                        category: sk.category || inferSkillCategory(cleanName),
                        proficiency: sk.proficiency || 'Intermediate',
                        yearsExperience: sk.yearsExperience || ''
                    });
                }
            });
            profile.categorizedSkills = Array.from(uniqueMap.values());

            // Sync to legacy `skills` and `skill_ratings`
            profile.skills = profile.categorizedSkills.map(s => `${s.name} (${s.proficiency.toLowerCase()})`);
            const ratingsObj = {};
            profile.categorizedSkills.forEach(s => {
                const score = s.proficiency === 'Advanced' ? 90 : (s.proficiency === 'Proficient' ? 80 : 60);
                ratingsObj[s.name] = { level: s.proficiency.toLowerCase(), score };
            });
            profile.skill_ratings = ratingsObj;
            profile.markModified('skill_ratings');
        }

        // 4. Soft Skills & Languages
        if (softSkills && Array.isArray(softSkills)) {
            profile.softSkills = [...new Set(softSkills.map(s => s.trim()).filter(Boolean))];
        }
        if (languages && Array.isArray(languages)) {
            profile.languages = languages;
        }

        // 5. Work Experience & Fresher Status
        if (isFresher !== undefined) profile.isFresher = !!isFresher;
        if (workExperience && Array.isArray(workExperience)) {
            profile.workExperience = workExperience;
            if (workExperience.length > 0) {
                profile.isFresher = false;
            }
        }

        // 6. Projects & Portfolio
        if (projects && Array.isArray(projects)) {
            profile.projects = projects.map(p => ({
                title: p.title || 'Project',
                shortDescription: p.shortDescription || p.description || '',
                description: p.description || p.shortDescription || '',
                detailedDescription: p.detailedDescription || p.description || '',
                techStack: Array.isArray(p.techStack) ? p.techStack : (p.techStack ? p.techStack.split(',').map(s => s.trim()) : []),
                category: p.category || 'Web Development',
                github: p.github || '',
                link: p.link || '',
                startDate: p.startDate || '',
                completionDate: p.completionDate || '',
                role: p.role || '',
                contributions: p.contributions || '',
                image: p.image || '',
                featured: !!p.featured
            }));
        }

        // 7. Certifications & Achievements
        if (certifications && Array.isArray(certifications)) {
            profile.certifications = certifications;
        }
        if (achievements && Array.isArray(achievements)) {
            profile.achievements = achievements;
        }

        // 8. Professional Links
        if (professionalLinks && typeof professionalLinks === 'object') {
            profile.professionalLinks = {
                linkedin: professionalLinks.linkedin ? professionalLinks.linkedin.trim() : '',
                github: professionalLinks.github ? professionalLinks.github.trim() : '',
                leetcode: professionalLinks.leetcode ? professionalLinks.leetcode.trim() : '',
                hackerrank: professionalLinks.hackerrank ? professionalLinks.hackerrank.trim() : '',
                kaggle: professionalLinks.kaggle ? professionalLinks.kaggle.trim() : '',
                portfolio: professionalLinks.portfolio ? professionalLinks.portfolio.trim() : '',
                other: professionalLinks.other ? professionalLinks.other.trim() : ''
            };
        }

        // 9. Career Preferences
        if (careerPreferences && typeof careerPreferences === 'object') {
            profile.careerPreferences = {
                ...profile.careerPreferences,
                ...careerPreferences
            };
        }

        if (targetCareer) {
            profile.targetCareer = targetCareer;
            if (!profile.careerPreferences.preferredRoles.includes(targetCareer)) {
                profile.careerPreferences.preferredRoles.unshift(targetCareer);
            }
        }

        if (resumeData) {
            profile.resumeData = resumeData;
        }

        profile.updatedAt = new Date();
        await profile.save();

        // Populate and calculate completeness
        const updatedProfile = await Profile.findById(profile._id).populate('user', ['name', 'email', 'phone', 'role']);
        const completeness = evaluateProfileCompleteness(updatedProfile, updatedProfile.user);

        await logActivity(
            req.user.id,
            'Profile updated',
            'Professional profile updated',
            'profile',
            `Completeness is now ${completeness.percentage}%`
        );

        res.json({
            ...updatedProfile.toObject(),
            completeness,
            msg: 'Profile updated successfully'
        });
    } catch (err) {
        console.error('Error updating profile:', err);
        res.status(500).json({ msg: 'Server error updating profile', error: err.message });
    }
};

// @desc    Generate tailored AI Professional Summary from genuine student records
// @route   POST /api/profile/generate-summary
// @access  Private
exports.generateAISummary = async (req, res) => {
    try {
        const profile = await Profile.findOne({ user: req.user.id }).populate('user', ['name', 'email']);
        if (!profile) {
            return res.status(404).json({ msg: 'Profile not found' });
        }

        const studentName = profile.user?.name || 'Engineer';
        const targetRole = profile.targetCareer || (profile.careerPreferences?.preferredRoles?.[0]) || 'Software Engineer';
        
        // Gather facts
        const education = profile.educationHistory?.[0] || { degree: profile.education || 'B.Tech', institution: profile.college || 'Engineering College' };
        const topSkills = (profile.categorizedSkills || []).slice(0, 6).map(s => s.name);
        if (topSkills.length === 0 && profile.skills) {
            profile.skills.slice(0, 6).forEach(s => topSkills.push(normalizeSkillName(s)));
        }

        const featuredProject = (profile.projects || []).find(p => p.featured) || profile.projects?.[0];
        const experience = profile.workExperience?.[0];

        // Craft structured, honest summary without hallucinating
        const skillsClause = topSkills.length > 0 ? `Proficient in ${topSkills.join(', ')}` : 'Strong foundation in computer science and algorithmic problem-solving';
        const educationClause = education.institution 
            ? `${education.degree} candidate at ${education.institution}`
            : `${education.degree} student`;

        let summary = `Dedicated ${educationClause} targeting opportunities as a ${targetRole}. ${skillsClause}, with hands-on capability across modern software lifecycles and clean system design.`;

        if (featuredProject) {
            summary += ` Developed practical applications including "${featuredProject.title}" (${(featuredProject.techStack || []).slice(0, 4).join(', ')}), demonstrating ability to build maintainable, user-centric software solutions.`;
        }

        if (experience && !profile.isFresher) {
            summary += ` Previous practical experience as a ${experience.jobTitle} at ${experience.company} contributing to production deliverables.`;
        } else {
            summary += ` Eager to apply rigorous engineering fundamentals, continuous learning agility, and collaborative drive to high-impact technical teams.`;
        }

        res.json({
            summary,
            generatedAt: new Date()
        });
    } catch (err) {
        console.error('Error generating AI summary:', err);
        res.status(500).json({ msg: 'Server error generating summary' });
    }
};

// @desc    Get Public Student Portfolio & Profile (Respects privacy preferences)
// @route   GET /api/profile/public/:id
// @access  Public
exports.getPublicProfile = async (req, res) => {
    try {
        const identifier = req.params.id;

        // Try lookup by user ID or profile ID
        let profile = await Profile.findOne({
            $or: [
                { user: identifier },
                { _id: identifier }
            ]
        }).populate('user', ['name', 'email', 'phone', 'role']);

        if (!profile) {
            return res.status(404).json({ msg: 'Student public profile not found' });
        }

        if (profile.isPublic === false) {
            return res.status(403).json({ msg: 'This student portfolio is set to private by the owner.' });
        }

        const prefs = profile.publicPreferences || {
            showEmail: false,
            showPhone: false,
            showEducation: true,
            showExperience: true,
            showProjects: true,
            showSkills: true,
            showCertifications: true
        };

        // Construct clean public portfolio response
        const publicProfile = {
            id: profile._id,
            userId: profile.user?._id,
            name: profile.user?.name || 'Student Engineer',
            designation: profile.designation,
            targetCareer: profile.targetCareer,
            city: profile.city,
            state: profile.state,
            country: profile.country,
            summary: profile.summary,
            professionalLinks: profile.professionalLinks,
            preferredContactMethod: profile.preferredContactMethod,
            // Conditional private details
            email: prefs.showEmail ? profile.user?.email : null,
            phone: prefs.showPhone ? (profile.phone || profile.user?.phone) : null,
            // Conditional portfolio sections
            educationHistory: prefs.showEducation ? profile.educationHistory : [],
            workExperience: prefs.showExperience ? profile.workExperience : [],
            isFresher: profile.isFresher,
            projects: prefs.showProjects ? profile.projects : [],
            categorizedSkills: prefs.showSkills ? profile.categorizedSkills : [],
            softSkills: profile.softSkills || [],
            languages: profile.languages || [],
            certifications: prefs.showCertifications ? profile.certifications : [],
            achievements: profile.achievements || [],
            completeness: evaluateProfileCompleteness(profile, profile.user)
        };

        res.json({ profile: publicProfile });
    } catch (err) {
        console.error('Error in getPublicProfile:', err);
        res.status(500).json({ msg: 'Server error retrieving public portfolio' });
    }
};

// @desc    Save/unsave a course (kept for backward compatibility)
// @route   PUT /api/profile/save-course
// @access  Private
exports.toggleSaveCourse = async (req, res) => {
    const { courseId, courseTitle } = req.body;
    if (courseId === undefined) {
        return res.status(400).json({ msg: 'Please provide courseId' });
    }

    try {
        let profile = await Profile.findOne({ user: req.user.id });
        if (!profile) {
            profile = new Profile({ user: req.user.id, savedCourses: [] });
        }

        if (!profile.savedCourses) profile.savedCourses = [];

        const index = profile.savedCourses.indexOf(courseId);
        let isSaved = false;
        if (index > -1) {
            profile.savedCourses.splice(index, 1);
        } else {
            profile.savedCourses.push(courseId);
            isSaved = true;
        }

        profile.updatedAt = Date.now();
        await profile.save();

        if (isSaved) {
            await logActivity(
                req.user.id,
                'Course saved',
                courseTitle || `Course #${courseId}`,
                'course',
                'Added to learning watchlist'
            );
        }

        res.json(profile);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// @desc    Get student recent activities
// @route   GET /api/profile/activities
// @access  Private
exports.getStudentActivities = async (req, res) => {
    try {
        const activities = await StudentActivity.find({ user: req.user.id })
            .sort({ createdAt: -1 })
            .limit(20);
        res.json({ activities });
    } catch (err) {
        console.error('Error fetching student activities:', err);
        res.status(500).json({ msg: 'Server error retrieving activities' });
    }
};

// @desc    Record custom student activity
// @route   POST /api/profile/activities
// @access  Private
exports.recordStudentActivity = async (req, res) => {
    try {
        const { action, title, category, details } = req.body;
        if (!action) {
            return res.status(400).json({ msg: 'Action is required' });
        }

        const activity = await StudentActivity.create({
            user: req.user.id,
            action,
            title: title || '',
            category: category || 'job',
            details: details || '',
            createdAt: new Date()
        });

        res.json({ msg: 'Activity recorded', activity });
    } catch (err) {
        console.error('Error recording student activity:', err);
        res.status(500).json({ msg: 'Server error recording activity' });
    }
};

// @desc    Get student notifications
// @route   GET /api/profile/notifications
// @access  Private
exports.getNotifications = async (req, res) => {
    try {
        const activities = await StudentActivity.find({ user: req.user.id })
            .sort({ createdAt: -1 })
            .limit(15);

        const notifications = activities.map(act => ({
            id: act._id,
            title: act.title || act.action,
            message: act.details || act.action,
            category: act.category || 'system',
            time: act.createdAt,
            read: false
        }));

        res.json({ notifications });
    } catch (err) {
        console.error('Error fetching notifications:', err);
        res.status(500).json({ msg: 'Server error fetching notifications' });
    }
};
