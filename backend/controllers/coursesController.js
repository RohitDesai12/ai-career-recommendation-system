const Profile = require('../models/Profile');
const Roadmap = require('../models/Roadmap');
const CourseProgress = require('../models/CourseProgress');
const LearningPathEnrollment = require('../models/LearningPathEnrollment');
const { COURSES_CATALOG } = require('../data/coursesCatalog');
const { LEARNING_PATHS } = require('../data/learningPathsData');
const { generateLearningRecommendations } = require('../services/courseRecommendationEngine');

/**
 * Seed initial courses progress and learning paths if none exist for the user
 * to ensure immediate functional learning experience
 */
async function seedDefaultProgressIfEmpty(userId, profile) {
    const existingProgress = await CourseProgress.countDocuments({ user: userId });
    const existingPaths = await LearningPathEnrollment.countDocuments({ user: userId });

    if (existingPaths === 0) {
        // Enroll in Data Engineer path (Active) and Full Stack Developer (Completed)
        await LearningPathEnrollment.create([
            {
                user: userId,
                pathId: 'data-engineer',
                pathTitle: 'Data Engineer Learning Path',
                status: 'Active',
                progressPercent: 65,
                completedStages: ['Beginner'],
                completedCourses: [101, 102],
                enrolledAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
                lastAccessedAt: new Date()
            },
            {
                user: userId,
                pathId: 'full-stack-developer',
                pathTitle: 'Full Stack Developer Learning Path',
                status: 'Active',
                progressPercent: 35,
                completedStages: ['Beginner'],
                completedCourses: [7],
                enrolledAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
                lastAccessedAt: new Date()
            },
            {
                user: userId,
                pathId: 'python-developer',
                pathTitle: 'Python Developer Learning Path',
                status: 'Completed',
                progressPercent: 100,
                completedStages: ['Beginner', 'Intermediate', 'Advanced'],
                completedCourses: [4, 101],
                enrolledAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
                completedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000)
            }
        ]);
    }

    if (existingProgress === 0) {
        // Seed 4 completed, 2 in progress, 3 not started matching the 45% reference design
        await CourseProgress.create([
            {
                user: userId,
                courseId: 101,
                courseTitle: 'Python for Data Engineering',
                platform: 'Coursera',
                url: 'https://www.coursera.org/learn/python-for-data-engineering',
                image: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=500&auto=format&fit=crop&q=60',
                status: 'Currently Learning',
                progressPercent: 55,
                skillsCovered: ['Python', 'Data Engineering', 'ETL'],
                targetCareer: 'Data Engineer',
                startedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
                lastUpdated: new Date()
            },
            {
                user: userId,
                courseId: 102,
                courseTitle: 'Advanced SQL for Data Professionals',
                platform: 'Udemy',
                url: 'https://www.udemy.com/course/the-complete-sql-bootcamp/',
                image: 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=500&auto=format&fit=crop&q=60',
                status: 'Currently Learning',
                progressPercent: 40,
                skillsCovered: ['SQL', 'Data Analysis'],
                targetCareer: 'Data Engineer',
                startedAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
                lastUpdated: new Date()
            },
            {
                user: userId,
                courseId: 4,
                courseTitle: 'Python for Everybody Specialization',
                platform: 'Coursera',
                url: 'https://www.coursera.org/specializations/python',
                image: 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=500&auto=format&fit=crop&q=60',
                status: 'Completed',
                progressPercent: 100,
                skillsCovered: ['Python'],
                targetCareer: 'Data Engineer',
                completedAt: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000)
            },
            {
                user: userId,
                courseId: 7,
                courseTitle: 'The Complete Web Development Bootcamp',
                platform: 'Udemy',
                url: 'https://www.udemy.com/course/the-complete-web-development-bootcamp/',
                image: 'https://images.unsplash.com/photo-1581291518633-83b4ebd1d83e?w=500&auto=format&fit=crop&q=60',
                status: 'Completed',
                progressPercent: 100,
                skillsCovered: ['HTML', 'CSS', 'JavaScript'],
                targetCareer: 'Full Stack Developer',
                completedAt: new Date(Date.now() - 50 * 24 * 60 * 60 * 1000)
            },
            {
                user: userId,
                courseId: 8,
                courseTitle: 'Git and GitHub Complete Crash Course',
                platform: 'YouTube',
                url: 'https://www.youtube.com/watch?v=RGOj5yH7evk',
                image: 'https://images.unsplash.com/photo-1618401471353-b98aedd04e11?w=500&auto=format&fit=crop&q=60',
                status: 'Completed',
                progressPercent: 100,
                skillsCovered: ['Git', 'Version Control'],
                targetCareer: 'Software Engineering',
                completedAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000)
            },
            {
                user: userId,
                courseId: 35,
                courseTitle: 'Database Systems: SQL & MongoDB Bootcamp',
                platform: 'Udemy',
                url: 'https://www.udemy.com/course/database-systems-sql-mongodb/',
                image: 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=500&auto=format&fit=crop&q=60',
                status: 'Completed',
                progressPercent: 100,
                skillsCovered: ['SQL', 'MongoDB'],
                targetCareer: 'Data Engineer',
                completedAt: new Date(Date.now() - 70 * 24 * 60 * 60 * 1000)
            },
            {
                user: userId,
                courseId: 103,
                courseTitle: 'Big Data with Apache Spark',
                platform: 'edX',
                url: 'https://www.edx.org/learn/spark',
                image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=500&auto=format&fit=crop&q=60',
                status: 'Not Started',
                progressPercent: 0,
                skillsCovered: ['Apache Spark', 'Big Data'],
                targetCareer: 'Data Engineer'
            },
            {
                user: userId,
                courseId: 104,
                courseTitle: 'AWS Cloud Fundamentals',
                platform: 'Coursera',
                url: 'https://www.coursera.org/learn/aws-cloud-practitioner-essentials',
                image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=500&auto=format&fit=crop&q=60',
                status: 'Not Started',
                progressPercent: 0,
                skillsCovered: ['AWS', 'Cloud'],
                targetCareer: 'Data Engineer'
            },
            {
                user: userId,
                courseId: 3,
                courseTitle: 'Data Engineering Nanodegree',
                platform: 'Udacity',
                url: 'https://www.udacity.com/course/data-engineer-nanodegree--nd027',
                image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=500&auto=format&fit=crop&q=60',
                status: 'Not Started',
                progressPercent: 0,
                skillsCovered: ['Data Engineering', 'Airflow', 'Spark'],
                targetCareer: 'Data Engineer'
            }
        ]);
    }
}

// @desc    Get complete Personalized Learning Hub state
// @route   GET /api/courses/hub
// @access  Private
exports.getLearningHubData = async (req, res) => {
    try {
        const userId = req.user.id;

        // Fetch student profile
        const profile = await Profile.findOne({ user: userId });

        // Fetch primary or most recently updated roadmap
        const roadmap = await Roadmap.findOne({ user: userId }).sort({ updatedAt: -1 });

        // Seed initial progress for demonstration if user is new
        await seedDefaultProgressIfEmpty(userId, profile);

        // Fetch user course enrollments & learning paths
        const userEnrollments = await CourseProgress.find({ user: userId }).sort({ lastUpdated: -1 });
        const pathEnrollments = await LearningPathEnrollment.find({ user: userId });

        // Generate recommendations and skill gap analysis
        const learningHubData = generateLearningRecommendations(
            profile,
            roadmap,
            userEnrollments,
            pathEnrollments,
            req.query.role || null
        );

        // Populate continue learning list with full course details
        const continueLearning = userEnrollments
            .filter(e => e.status === 'Currently Learning')
            .map(e => {
                const catalogItem = COURSES_CATALOG.find(c => c.id === e.courseId);
                return {
                    _id: e._id,
                    courseId: e.courseId,
                    title: e.courseTitle,
                    platform: e.platform,
                    url: e.url,
                    image: e.image || catalogItem?.image,
                    progressPercent: e.progressPercent,
                    status: e.status,
                    skillsCovered: e.skillsCovered,
                    lastUpdated: e.lastUpdated,
                    duration: catalogItem?.duration || '20 hours',
                    rating: catalogItem?.rating || 4.8
                };
            });

        // Compute saved courses count and list
        const savedCourseIds = profile?.savedCourses || [];
        const savedCoursesList = COURSES_CATALOG.filter(c => savedCourseIds.includes(c.id));

        res.json({
            ...learningHubData,
            continueLearning,
            savedCourseIds,
            savedCoursesCount: savedCourseIds.length,
            savedCourses: savedCoursesList
        });
    } catch (err) {
        console.error('Error in getLearningHubData:', err);
        res.status(500).json({ msg: 'Server error retrieving personalized learning hub' });
    }
};

// @desc    Get Course Catalog with filters, search, and pagination
// @route   GET /api/courses
// @access  Public
exports.getCoursesCatalog = async (req, res) => {
    try {
        const {
            search = '',
            branch = 'All Departments',
            cost = 'All',
            skill = '',
            difficulty = '',
            platform = '',
            role = '',
            duration = '',
            certificate = '',
            page = 1,
            limit = 24,
            sortBy = 'popular'
        } = req.query;

        let filtered = [...COURSES_CATALOG];

        // Search query
        if (search.trim()) {
            const query = search.trim().toLowerCase();
            filtered = filtered.filter(c => 
                c.title.toLowerCase().includes(query) ||
                c.platform.toLowerCase().includes(query) ||
                (c.skills && c.skills.some(s => s.toLowerCase().includes(query))) ||
                (c.description && c.description.toLowerCase().includes(query))
            );
        }

        // Branch filter
        if (branch && branch !== 'All Departments' && branch !== 'All') {
            filtered = filtered.filter(c => c.branch === branch);
        }

        // Cost filter
        if (cost && cost !== 'All') {
            filtered = filtered.filter(c => c.cost === cost);
        }

        // Skill filter
        if (skill.trim()) {
            const sLower = skill.trim().toLowerCase();
            filtered = filtered.filter(c => 
                c.skills && c.skills.some(s => s.toLowerCase() === sLower || s.toLowerCase().includes(sLower))
            );
        }

        // Difficulty filter
        if (difficulty && difficulty !== 'All') {
            filtered = filtered.filter(c => c.difficulty === difficulty);
        }

        // Platform filter
        if (platform && platform !== 'All') {
            filtered = filtered.filter(c => c.platform.toLowerCase() === platform.toLowerCase());
        }

        // Target Role filter
        if (role && role !== 'All') {
            filtered = filtered.filter(c => 
                c.targetRoles && c.targetRoles.some(r => r.toLowerCase().includes(role.toLowerCase()))
            );
        }

        // Certificate filter
        if (certificate === 'true') {
            filtered = filtered.filter(c => c.certificate === true);
        }

        // Sorting
        if (sortBy === 'rating') {
            filtered.sort((a, b) => b.rating - a.rating);
        } else if (sortBy === 'title') {
            filtered.sort((a, b) => a.title.localeCompare(b.title));
        }

        const totalCount = filtered.length;
        const pageNum = parseInt(page, 10) || 1;
        const limitNum = parseInt(limit, 10) || 24;
        const startIndex = (pageNum - 1) * limitNum;
        const paginatedCourses = filtered.slice(startIndex, startIndex + limitNum);

        // Aggregate unique filter options
        const allSkills = [...new Set(COURSES_CATALOG.flatMap(c => c.skills || []))].sort();
        const allPlatforms = [...new Set(COURSES_CATALOG.map(c => c.platform))].sort();
        const allRoles = [...new Set(COURSES_CATALOG.flatMap(c => c.targetRoles || []))].sort();

        res.json({
            courses: paginatedCourses,
            totalCount,
            page: pageNum,
            totalPages: Math.ceil(totalCount / limitNum),
            filterOptions: {
                skills: allSkills,
                platforms: allPlatforms,
                roles: allRoles,
                branches: [
                    "All Departments",
                    "Computer Science & IT",
                    "Electronics & Communication",
                    "Electrical & Power",
                    "Mechanical & Manufacturing",
                    "Civil & Infrastructure"
                ],
                difficulties: ['Beginner', 'Intermediate', 'Advanced']
            }
        });
    } catch (err) {
        console.error('Error in getCoursesCatalog:', err);
        res.status(500).json({ msg: 'Server error retrieving course catalog' });
    }
};

// @desc    Get detailed course view by ID
// @route   GET /api/courses/:id
// @access  Public
exports.getCourseById = async (req, res) => {
    try {
        const courseId = parseInt(req.params.id, 10);
        const course = COURSES_CATALOG.find(c => c.id === courseId);

        if (!course) {
            return res.status(404).json({ msg: 'Course not found in verified catalog' });
        }

        // Find related courses based on shared skills and branch
        const related = COURSES_CATALOG.filter(c => 
            c.id !== courseId && 
            (c.branch === course.branch || c.skills.some(s => course.skills.includes(s)))
        ).slice(0, 4);

        res.json({
            ...course,
            relatedCourses: related
        });
    } catch (err) {
        console.error('Error in getCourseById:', err);
        res.status(500).json({ msg: 'Server error retrieving course details' });
    }
};

// @desc    Get all 10 Learning Paths with student enrollment status
// @route   GET /api/courses/learning-paths
// @access  Private
exports.getLearningPaths = async (req, res) => {
    try {
        const userId = req.user.id;
        const enrollments = await LearningPathEnrollment.find({ user: userId });

        const paths = LEARNING_PATHS.map(path => {
            const enrollment = enrollments.find(e => e.pathId === path.id);
            return {
                ...path,
                isEnrolled: !!enrollment,
                status: enrollment ? enrollment.status : 'Not Started',
                progressPercent: enrollment ? enrollment.progressPercent : 0,
                completedStages: enrollment ? enrollment.completedStages : [],
                enrolledAt: enrollment ? enrollment.enrolledAt : null,
                lastAccessedAt: enrollment ? enrollment.lastAccessedAt : null
            };
        });

        res.json({ learningPaths: paths });
    } catch (err) {
        console.error('Error in getLearningPaths:', err);
        res.status(500).json({ msg: 'Server error retrieving learning paths' });
    }
};

// @desc    Get specific learning path by ID with enrolled stages
// @route   GET /api/courses/learning-paths/:id
// @access  Private
exports.getLearningPathById = async (req, res) => {
    try {
        const { id } = req.params;
        const path = LEARNING_PATHS.find(p => p.id === id);

        if (!path) {
            return res.status(404).json({ msg: 'Learning path not found' });
        }

        const enrollment = await LearningPathEnrollment.findOne({ user: req.user.id, pathId: id });

        // Hydrate stage courses with catalog metadata
        const enrichedStages = path.stages.map(stage => {
            const courses = (stage.courseIds || []).map(cid => COURSES_CATALOG.find(c => c.id === cid)).filter(Boolean);
            const isCompleted = enrollment ? (enrollment.completedStages || []).includes(stage.name) : false;
            return {
                ...stage,
                courses,
                isCompleted
            };
        });

        res.json({
            ...path,
            stages: enrichedStages,
            isEnrolled: !!enrollment,
            status: enrollment ? enrollment.status : 'Not Started',
            progressPercent: enrollment ? enrollment.progressPercent : 0,
            completedStages: enrollment ? enrollment.completedStages : []
        });
    } catch (err) {
        console.error('Error in getLearningPathById:', err);
        res.status(500).json({ msg: 'Server error retrieving learning path details' });
    }
};

// @desc    Enroll in or start a Learning Path
// @route   POST /api/courses/learning-paths/enroll
// @access  Private
exports.enrollLearningPath = async (req, res) => {
    try {
        const { pathId } = req.body;
        const path = LEARNING_PATHS.find(p => p.id === pathId);

        if (!path) {
            return res.status(404).json({ msg: 'Learning path not found' });
        }

        let enrollment = await LearningPathEnrollment.findOne({ user: req.user.id, pathId });

        if (!enrollment) {
            enrollment = await LearningPathEnrollment.create({
                user: req.user.id,
                pathId,
                pathTitle: path.title,
                status: 'Active',
                progressPercent: 0,
                completedStages: [],
                enrolledAt: new Date(),
                lastAccessedAt: new Date()
            });
        } else {
            enrollment.status = 'Active';
            enrollment.lastAccessedAt = new Date();
            await enrollment.save();
        }

        res.json({ msg: `Successfully enrolled in ${path.title}`, enrollment });
    } catch (err) {
        console.error('Error in enrollLearningPath:', err);
        res.status(500).json({ msg: 'Server error enrolling in learning path' });
    }
};

// @desc    Update progress for a Learning Path
// @route   PUT /api/courses/learning-paths/progress
// @access  Private
exports.updateLearningPathProgress = async (req, res) => {
    try {
        const { pathId, stageName, isCompleted, progressPercent } = req.body;

        let enrollment = await LearningPathEnrollment.findOne({ user: req.user.id, pathId });

        if (!enrollment) {
            const path = LEARNING_PATHS.find(p => p.id === pathId);
            enrollment = new LearningPathEnrollment({
                user: req.user.id,
                pathId,
                pathTitle: path?.title || pathId,
                status: 'Active',
                progressPercent: 0,
                completedStages: []
            });
        }

        if (stageName) {
            if (isCompleted && !enrollment.completedStages.includes(stageName)) {
                enrollment.completedStages.push(stageName);
            } else if (!isCompleted && enrollment.completedStages.includes(stageName)) {
                enrollment.completedStages = enrollment.completedStages.filter(s => s !== stageName);
            }
        }

        if (progressPercent !== undefined) {
            enrollment.progressPercent = Math.min(100, Math.max(0, Number(progressPercent)));
        } else {
            // Auto compute progress from stages (3 stages total = 33% each)
            enrollment.progressPercent = Math.round((enrollment.completedStages.length / 3) * 100);
        }

        if (enrollment.progressPercent === 100) {
            enrollment.status = 'Completed';
            enrollment.completedAt = new Date();
        } else {
            enrollment.status = 'Active';
        }

        enrollment.lastAccessedAt = new Date();
        await enrollment.save();

        res.json({ msg: 'Learning path progress updated', enrollment });
    } catch (err) {
        console.error('Error in updateLearningPathProgress:', err);
        res.status(500).json({ msg: 'Server error updating learning path progress' });
    }
};

// @desc    Get user's enrolled course progress list
// @route   GET /api/courses/progress
// @access  Private
exports.getCourseProgressList = async (req, res) => {
    try {
        const enrollments = await CourseProgress.find({ user: req.user.id }).sort({ lastUpdated: -1 });
        res.json({ progressList: enrollments });
    } catch (err) {
        console.error('Error in getCourseProgressList:', err);
        res.status(500).json({ msg: 'Server error retrieving course progress' });
    }
};

// @desc    Start learning or update manual course progress (0-100%, status)
// @route   PUT /api/courses/progress
// @access  Private
exports.updateCourseProgress = async (req, res) => {
    try {
        const { courseId, status, progressPercent, notes } = req.body;

        if (courseId === undefined) {
            return res.status(400).json({ msg: 'courseId is required' });
        }

        const catalogCourse = COURSES_CATALOG.find(c => c.id === Number(courseId));
        if (!catalogCourse) {
            return res.status(404).json({ msg: 'Course not found in catalog' });
        }

        let progress = await CourseProgress.findOne({ user: req.user.id, courseId: Number(courseId) });

        if (!progress) {
            progress = new CourseProgress({
                user: req.user.id,
                courseId: Number(courseId),
                courseTitle: catalogCourse.title,
                platform: catalogCourse.platform,
                url: catalogCourse.url,
                image: catalogCourse.image,
                branch: catalogCourse.branch,
                status: status || 'Currently Learning',
                progressPercent: progressPercent !== undefined ? Number(progressPercent) : 10,
                skillsCovered: catalogCourse.skills,
                targetCareer: catalogCourse.targetRoles ? catalogCourse.targetRoles[0] : 'Engineering',
                startedAt: new Date()
            });
        } else {
            if (status) progress.status = status;
            if (progressPercent !== undefined) {
                progress.progressPercent = Math.min(100, Math.max(0, Number(progressPercent)));
            }
            if (notes !== undefined) progress.notes = notes;

            if (progress.progressPercent === 100 || status === 'Completed') {
                progress.status = 'Completed';
                progress.completedAt = new Date();
            }
        }

        progress.lastUpdated = new Date();
        await progress.save();

        res.json({ msg: 'Course progress updated successfully', progress });
    } catch (err) {
        console.error('Error in updateCourseProgress:', err);
        res.status(500).json({ msg: 'Server error updating course progress' });
    }
};

// @desc    Toggle bookmark save for a course
// @route   PUT /api/courses/save
// @access  Private
exports.toggleSaveCourse = async (req, res) => {
    try {
        const { courseId } = req.body;
        if (courseId === undefined) {
            return res.status(400).json({ msg: 'courseId is required' });
        }

        let profile = await Profile.findOne({ user: req.user.id });
        if (!profile) {
            profile = new Profile({ user: req.user.id, savedCourses: [] });
        }

        if (!profile.savedCourses) profile.savedCourses = [];

        const numId = Number(courseId);
        const index = profile.savedCourses.indexOf(numId);
        let isSaved = false;

        if (index > -1) {
            profile.savedCourses.splice(index, 1);
        } else {
            profile.savedCourses.push(numId);
            isSaved = true;
        }

        profile.updatedAt = new Date();
        await profile.save();

        res.json({
            isSaved,
            savedCourses: profile.savedCourses,
            savedCoursesCount: profile.savedCourses.length
        });
    } catch (err) {
        console.error('Error in toggleSaveCourse:', err);
        res.status(500).json({ msg: 'Server error updating saved courses' });
    }
};

// @desc    Mark a skill as currently learning in student profile
// @route   POST /api/courses/skills/learning
// @access  Private
exports.markSkillLearning = async (req, res) => {
    try {
        const { skill } = req.body;
        if (!skill) {
            return res.status(400).json({ msg: 'Skill name is required' });
        }

        let profile = await Profile.findOne({ user: req.user.id });
        if (!profile) {
            profile = new Profile({ user: req.user.id, skills: [] });
        }

        if (!profile.skills) profile.skills = [];

        // Add skill if not present
        const hasSkill = profile.skills.some(s => s.toLowerCase().includes(skill.toLowerCase()));
        if (!hasSkill) {
            profile.skills.push(skill);
        }

        if (!profile.skill_ratings || typeof profile.skill_ratings !== 'object') {
            profile.skill_ratings = {};
        }
        if (profile.skill_ratings instanceof Map) {
            profile.skill_ratings.set(skill, { level: 'intermediate', score: 50 });
        } else {
            profile.skill_ratings[skill] = { level: 'intermediate', score: 50 };
            profile.markModified('skill_ratings');
        }

        profile.updatedAt = new Date();
        await profile.save();

        res.json({ msg: `Marked ${skill} as learning`, skills: profile.skills });
    } catch (err) {
        console.error('Error in markSkillLearning:', err);
        res.status(500).json({ msg: 'Server error marking skill' });
    }
};
