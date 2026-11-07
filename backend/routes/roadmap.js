const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
    getMyRoadmaps,
    getRoadmap,
    checkExistingRoadmap,
    generateRoadmap,
    setPrimaryRoadmap,
    updateRoadmapStatus,
    deleteRoadmap,
    updateSkillProgress,
    updateResourceProgress,
    updateProjectProgress,
    addCustomResource,
    adjustLearningPath,
    getVerifiedResources
} = require('../controllers/roadmapController');

// All roadmap routes are protected by auth middleware
router.get('/my-roadmaps', auth, getMyRoadmaps);
router.get('/', auth, getRoadmap);
router.post('/check-existing', auth, checkExistingRoadmap);
router.post('/', auth, generateRoadmap);
router.post('/generate', auth, generateRoadmap);

router.put('/:id/primary', auth, setPrimaryRoadmap);
router.patch('/:id/primary', auth, setPrimaryRoadmap);
router.put('/:id/status', auth, updateRoadmapStatus);
router.patch('/:id/status', auth, updateRoadmapStatus);
router.delete('/:id', auth, deleteRoadmap);

router.put('/skill-proficiency', auth, updateSkillProgress);
router.put('/skill-progress', auth, updateSkillProgress);
router.put('/toggle-skill', auth, updateSkillProgress);

router.put('/resource-progress', auth, updateResourceProgress);
router.put('/project-progress', auth, updateProjectProgress);
router.post('/custom-resource', auth, addCustomResource);

router.put('/adjust-path', auth, adjustLearningPath);
router.post('/adjust-path', auth, adjustLearningPath);

router.get('/resources', auth, getVerifiedResources);

module.exports = router;
