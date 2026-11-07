const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
    getLearningHubData,
    getCoursesCatalog,
    getCourseById,
    getLearningPaths,
    getLearningPathById,
    enrollLearningPath,
    updateLearningPathProgress,
    getCourseProgressList,
    updateCourseProgress,
    toggleSaveCourse,
    markSkillLearning
} = require('../controllers/coursesController');

// 1. Personalized Learning Hub state (Overview, Recommendations, Skill Gap, Continue Learning)
router.get('/hub', auth, getLearningHubData);

// 2. Learning Paths endpoints
router.get('/learning-paths', auth, getLearningPaths);
router.get('/learning-paths/:id', auth, getLearningPathById);
router.post('/learning-paths/enroll', auth, enrollLearningPath);
router.put('/learning-paths/progress', auth, updateLearningPathProgress);

// 3. Course Progress Tracking (External courses manual tracking)
router.get('/progress', auth, getCourseProgressList);
router.put('/progress', auth, updateCourseProgress);

// 4. Bookmark / Saved courses
router.put('/save', auth, toggleSaveCourse);

// 5. Skill Gap to Learning
router.post('/skills/learning', auth, markSkillLearning);

// 6. Course Catalog & Details (Public/Authenticated)
router.get('/', getCoursesCatalog);
router.get('/:id', getCourseById);

module.exports = router;

