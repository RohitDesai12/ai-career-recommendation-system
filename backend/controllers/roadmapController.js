const fs = require('fs');
const path = require('path');
const Roadmap = require('../models/Roadmap');

// Helper to load JSON files safely
const loadJsonData = () => {
    try {
        const requiredSkillsPath = path.join(__dirname, '../../ml-service/required_skills.json');
        const skillResourcesPath = path.join(__dirname, '../../ml-service/skill_resources.json');
        
        let requiredSkills = {};
        let skillResources = {};

        if (fs.existsSync(requiredSkillsPath)) {
            requiredSkills = JSON.parse(fs.readFileSync(requiredSkillsPath, 'utf8'));
        } else {
            console.error('required_skills.json not found at:', requiredSkillsPath);
        }

        if (fs.existsSync(skillResourcesPath)) {
            skillResources = JSON.parse(fs.readFileSync(skillResourcesPath, 'utf8'));
        } else {
            console.error('skill_resources.json not found at:', skillResourcesPath);
        }

        return { requiredSkills, skillResources };
    } catch (err) {
        console.error('Error loading roadmap JSON data:', err);
        return { requiredSkills: {}, skillResources: {} };
    }
};

// Helper to determine stage based on skill name / category / required score
const assignSkillToStage = (name, skillInfo) => {
    const category = (skillInfo.category || '').toLowerCase();
    const nameLower = name.toLowerCase();
    const words = nameLower.split(/[\s\-_\/]+/);

    // Stage 1 (Foundation) overrides
    const foundationSkills = ['git', 'github', 'python', 'html', 'css', 'c++', 'c', 'java', 'javascript', 'js', 'programming', 'mathematics', 'statistics', 'data structures', 'algorithms'];
    if (words.some(word => foundationSkills.includes(word)) || foundationSkills.includes(nameLower)) {
        return 0; // Stage 1
    }

    // Stage 4 (Deployment/DevOps) overrides
    const devopsSkills = ['docker', 'kubernetes', 'ci/cd', 'aws', 'cloud', 'devops', 'mlops', 'deployment', 'ansible', 'terraform', 'jenkins', 'monitoring'];
    if (words.some(word => devopsSkills.includes(word)) || devopsSkills.includes(nameLower)) {
        return 3; // Stage 4
    }

    // Category mapping
    const stage1Cats = ['os', 'standard', 'aptitude', 'soft skill', 'skill', 'programming', 'mathematics'];
    const stage2Cats = ['frontend', 'framework', 'library', 'design', 'visualization', 'hdl', 'eda tool', 'cad', 'cfd', 'fea'];
    const stage3Cats = ['backend', 'database', 'platform', 'protocol', 'security', 'architecture', 'software', 'gis', 'bim', 'technology', 'process', 'technical'];
    const stage4Cats = ['devops', 'deployment', 'cloud', 'iac', 'automation', 'certification', 'domain'];

    if (stage1Cats.includes(category)) return 0;
    if (stage2Cats.includes(category)) return 1;
    if (stage3Cats.includes(category)) return 2;
    if (stage4Cats.includes(category)) return 3;

    // Default based on required score (fundamental vs advanced)
    if (skillInfo.required >= 80) {
        return 1; // Core
    } else {
        return 2; // Advanced
    }
};

// @desc    Get active user roadmap
// @route   GET /api/roadmap
// @access  Private
exports.getRoadmap = async (req, res) => {
    try {
        const roadmap = await Roadmap.findOne({ user: req.user.id });
        if (!roadmap) {
            return res.status(404).json({ msg: 'No roadmap found for this user' });
        }
        res.json(roadmap);
    } catch (err) {
        console.error('Error fetching roadmap:', err.message);
        res.status(500).send('Server Error');
    }
};

// @desc    Generate a new user roadmap
// @route   POST /api/roadmap
// @access  Private
exports.generateRoadmap = async (req, res) => {
    const { department, field } = req.body;

    if (!department || !field) {
        return res.status(400).json({ msg: 'Please provide both department and field' });
    }

    try {
        // Delete any existing roadmap first
        await Roadmap.deleteMany({ user: req.user.id });

        const { requiredSkills, skillResources } = loadJsonData();

        // Find skills for the selected field
        // Match exact or case insensitive
        let careerKey = Object.keys(requiredSkills).find(key => key.toLowerCase() === field.toLowerCase());
        
        // Fallback search
        if (!careerKey) {
            careerKey = Object.keys(requiredSkills).find(key => key.toLowerCase().includes(field.toLowerCase()));
        }

        if (!careerKey) {
            return res.status(404).json({ msg: `Skills mapping for career '${field}' not found. Please choose another field.` });
        }

        const skillsData = requiredSkills[careerKey];
        const skillEntries = Object.entries(skillsData);

        // Pre-initialize 4 stages
        const stages = [
            {
                title: 'Stage 1: Foundation',
                description: 'Essential fundamentals, tools, and core concepts to start your path.',
                weeks: 4,
                status: 'In progress',
                skills: [],
                resources: []
            },
            {
                title: 'Stage 2: Core Development',
                description: 'Primary frameworks, libraries, and hands-on skill building.',
                weeks: 4,
                status: 'Locked',
                skills: [],
                resources: []
            },
            {
                title: 'Stage 3: Advanced & Integration',
                description: 'Advanced methodologies, databases, and system architectures.',
                weeks: 4,
                status: 'Locked',
                skills: [],
                resources: []
            },
            {
                title: 'Stage 4: Specialty & Professional Practice',
                description: 'Deployment, cloud workflows, testing, or advanced domain specialization.',
                weeks: 4,
                status: 'Locked',
                skills: [],
                resources: []
            }
        ];

        // 1. Initial assignment of skills to stages
        const assignedSkills = [[], [], [], []];
        
        skillEntries.forEach(([skillName, skillInfo]) => {
            const stageIndex = assignSkillToStage(skillName, skillInfo);
            assignedSkills[stageIndex].push({ name: skillName, completed: false, required: skillInfo.required });
        });

        // 2. Fallback: If any stage is empty, redistribute skills evenly by 'required' score (descending)
        const hasEmptyStage = assignedSkills.some(list => list.length === 0);
        if (hasEmptyStage) {
            // Flatten all and sort by importance (highest first)
            const allSkills = skillEntries.map(([skillName, skillInfo]) => ({
                name: skillName,
                completed: false,
                required: skillInfo.required
            })).sort((a, b) => b.required - a.required);

            // Clear previous lists
            assignedSkills[0] = [];
            assignedSkills[1] = [];
            assignedSkills[2] = [];
            assignedSkills[3] = [];

            // Split into 4 chunks
            const chunkSize = Math.ceil(allSkills.length / 4);
            allSkills.forEach((skill, index) => {
                const stageIndex = Math.min(3, Math.floor(index / chunkSize));
                assignedSkills[stageIndex].push(skill);
            });
        }

        // 3. For each stage, populate skills and resolve resources
        stages.forEach((stage, idx) => {
            stage.skills = assignedSkills[idx];

            // Resolve resources for all skills in this stage
            let stageWeeksSum = 0;
            const uniqueResourceUrls = new Set();

            stage.skills.forEach(skill => {
                const skillName = skill.name;
                
                // Lookup resources
                let resourcesList = skillResources[skillName];
                
                // Case insensitive fallback lookup
                if (!resourcesList) {
                    const foundKey = Object.keys(skillResources).find(k => k.toLowerCase() === skillName.toLowerCase());
                    if (foundKey) resourcesList = skillResources[foundKey];
                }

                if (resourcesList && resourcesList.length > 0) {
                    resourcesList.forEach(res => {
                        if (!uniqueResourceUrls.has(res.url)) {
                            uniqueResourceUrls.add(res.url);
                            stage.resources.push({
                                name: res.name,
                                url: res.url,
                                type: res.free ? 'Course' : 'Practice'
                            });
                            stageWeeksSum += (res.weeks || 3);
                        }
                    });
                } else {
                    // Fallback default resources so the roadmap is rich with links
                    const docsUrl = `https://www.google.com/search?q=${encodeURIComponent(skillName + ' official documentation tutorial')}`;
                    const courseUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(skillName + ' beginner tutorial course')}`;
                    
                    stage.resources.push({
                        name: `${skillName} Official Docs / Guides`,
                        url: docsUrl,
                        type: 'Doc'
                    });
                    stage.resources.push({
                        name: `${skillName} Beginner Video Course`,
                        url: courseUrl,
                        type: 'Course'
                    });
                    stageWeeksSum += 4;
                }
            });

            // Set reasonable stage weeks duration based on resources
            stage.weeks = Math.min(12, Math.max(4, Math.round(stageWeeksSum / Math.max(1, stage.skills.length))));
        });

        // Create database record
        const newRoadmap = new Roadmap({
            user: req.user.id,
            department,
            field: careerKey,
            stages,
            percentComplete: 0,
            stagesComplete: 0,
            totalStages: 4
        });

        await newRoadmap.save();
        res.json(newRoadmap);

    } catch (err) {
        console.error('Error generating roadmap:', err.message);
        res.status(500).send('Server Error');
    }
};

// @desc    Toggle completion of a specific skill in a stage
// @route   PUT /api/roadmap/toggle-skill
// @access  Private
exports.toggleSkill = async (req, res) => {
    const { stageIndex, skillName } = req.body;

    if (stageIndex === undefined || !skillName) {
        return res.status(400).json({ msg: 'Please provide stageIndex and skillName' });
    }

    try {
        const roadmap = await Roadmap.findOne({ user: req.user.id });
        if (!roadmap) {
            return res.status(404).json({ msg: 'Roadmap not found' });
        }

        // Access the specific stage
        const stage = roadmap.stages[stageIndex];
        if (!stage) {
            return res.status(400).json({ msg: 'Invalid stage index' });
        }

        // Find the skill and toggle it
        const skill = stage.skills.find(s => s.name === skillName);
        if (!skill) {
            return res.status(400).json({ msg: `Skill '${skillName}' not found in stage ${stageIndex}` });
        }

        skill.completed = !skill.completed;

        // Recalculate progress metrics
        let totalSkillsCount = 0;
        let completedSkillsCount = 0;

        roadmap.stages.forEach((s) => {
            totalSkillsCount += s.skills.length;
            s.skills.forEach(sk => {
                if (sk.completed) completedSkillsCount++;
            });
        });

        roadmap.percentComplete = totalSkillsCount > 0 ? Math.round((completedSkillsCount / totalSkillsCount) * 100) : 0;

        // Update stage statuses sequentially
        for (let i = 0; i < roadmap.stages.length; i++) {
            const currentStage = roadmap.stages[i];
            const totalStageSkills = currentStage.skills.length;
            const completedStageSkills = currentStage.skills.filter(s => s.completed).length;

            if (totalStageSkills === 0) {
                currentStage.status = 'Completed';
            } else if (completedStageSkills === totalStageSkills) {
                currentStage.status = 'Completed';
            } else if (completedStageSkills > 0) {
                currentStage.status = 'In progress';
            } else {
                // Completed === 0
                if (i === 0) {
                    currentStage.status = 'In progress';
                } else {
                    // Lock if the previous stage is not completed
                    const previousStage = roadmap.stages[i - 1];
                    if (previousStage.status === 'Completed') {
                        currentStage.status = 'In progress'; // Unlocked, ready to start
                    } else {
                        currentStage.status = 'Locked';
                    }
                }
            }
        }

        // Recalculate how many stages are fully completed
        roadmap.stagesComplete = roadmap.stages.filter(s => s.status === 'Completed').length;
        roadmap.updatedAt = Date.now();

        await roadmap.save();
        res.json(roadmap);

    } catch (err) {
        console.error('Error toggling skill status:', err.message);
        res.status(500).send('Server Error');
    }
};

// @desc    Reset / Delete user roadmap
// @route   DELETE /api/roadmap
// @access  Private
exports.resetRoadmap = async (req, res) => {
    try {
        await Roadmap.deleteOne({ user: req.user.id });
        res.json({ msg: 'Roadmap deleted successfully' });
    } catch (err) {
        console.error('Error deleting roadmap:', err.message);
        res.status(500).send('Server Error');
    }
};
