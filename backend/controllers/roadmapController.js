const fs = require('fs');
const path = require('path');
const Roadmap = require('../models/Roadmap');
const Resource = require('../models/Resource');
const Profile = require('../models/Profile');
const Job = require('../models/Job');
const StudentActivity = require('../models/StudentActivity');

// Helper to log student activities
async function logActivity(userId, action, title, category, details) {
    try {
        await StudentActivity.create({
            user: userId,
            action,
            title: title || '',
            category: category || 'roadmap',
            details: details || '',
            createdAt: new Date()
        });
    } catch (err) {
        console.error('Error logging student activity:', err);
    }
}

// Helper to load JSON taxonomy safely
const loadJsonData = () => {
    try {
        const requiredSkillsPath = path.join(__dirname, '../../ml-service/required_skills.json');
        const skillResourcesPath = path.join(__dirname, '../../ml-service/skill_resources.json');
        
        let requiredSkills = {};
        let skillResources = {};

        if (fs.existsSync(requiredSkillsPath)) {
            requiredSkills = JSON.parse(fs.readFileSync(requiredSkillsPath, 'utf8'));
        }
        if (fs.existsSync(skillResourcesPath)) {
            skillResources = JSON.parse(fs.readFileSync(skillResourcesPath, 'utf8'));
        }

        return { requiredSkills, skillResources };
    } catch (err) {
        console.error('Error loading roadmap JSON data:', err);
        return { requiredSkills: {}, skillResources: {} };
    }
};

// Stage 1-4 Skill Categorization Heuristics
const assignSkillToStage = (name, skillInfo) => {
    const category = (skillInfo.category || '').toLowerCase();
    const nameLower = name.toLowerCase();
    const words = nameLower.split(/[\s\-_\/]+/);

    // Foundation
    const foundationSkills = ['git', 'github', 'html', 'css', 'python', 'c++', 'c', 'java', 'javascript', 'js', 'programming', 'mathematics', 'statistics', 'data structures', 'algorithms', 'linux', 'bash'];
    if (words.some(word => foundationSkills.includes(word)) || foundationSkills.includes(nameLower)) {
        return 0; // Stage 1: Foundation
    }

    // Deployment / Specialty
    const devopsSkills = ['docker', 'kubernetes', 'ci/cd', 'aws', 'cloud', 'devops', 'mlops', 'deployment', 'ansible', 'terraform', 'jenkins', 'monitoring', 'security', 'penetration testing'];
    if (words.some(word => devopsSkills.includes(word)) || devopsSkills.includes(nameLower)) {
        return 3; // Stage 4: Deployment & Career Prep
    }

    // Frontend / Core Frameworks
    const stage2Cats = ['frontend', 'framework', 'library', 'design', 'visualization', 'hdl', 'eda tool', 'cad', 'cfd', 'fea', 'machine learning'];
    if (stage2Cats.includes(category)) return 1; // Stage 2: Core Development

    // Backend / Database / Architecture
    const stage3Cats = ['backend', 'database', 'platform', 'protocol', 'security', 'architecture', 'software', 'gis', 'bim', 'technology', 'deep learning'];
    if (stage3Cats.includes(category)) return 2; // Stage 3: Advanced & Integration

    if (skillInfo.required >= 80) return 1;
    return 2;
};

// Practical Stage Projects Generator based on Career Domain
const getProjectsForCareer = (career, stages) => {
    const careerLower = career.toLowerCase();

    if (careerLower.includes('web') || careerLower.includes('full stack') || careerLower.includes('frontend') || careerLower.includes('software')) {
        return [
            {
                title: 'Responsive Modern Portfolio Website',
                description: 'Build and deploy a semantic, responsive personal developer portfolio with dark mode and smooth animations.',
                difficulty: 'Beginner',
                duration: '1-2 Weeks',
                skills: ['HTML', 'CSS', 'JavaScript', 'Git'],
                requirements: [
                    'Mobile-first responsive layout with CSS Grid & Flexbox',
                    'Interactive navigation, contact form validation, and theme switcher',
                    'Deployed publicly via GitHub Pages, Vercel, or Netlify'
                ],
                suggestedTechnologies: ['HTML5', 'Tailwind CSS', 'JavaScript ES6+', 'Git'],
                status: 'Not Started'
            },
            {
                title: 'Interactive Full-Stack Web Application',
                description: 'Architect a modular React or frontend application with rich state management and real-time user feedback.',
                difficulty: 'Intermediate',
                duration: '2-3 Weeks',
                skills: ['React', 'TypeScript', 'State Management', 'REST APIs'],
                requirements: [
                    'Component-driven architecture with custom hooks',
                    'Dynamic search, filter, and pagination over external REST APIs',
                    'Persistent client storage and error boundary handling'
                ],
                suggestedTechnologies: ['React', 'TypeScript', 'TailwindCSS', 'Vite'],
                status: 'Not Started'
            },
            {
                title: 'Production Backend API with Database & Auth',
                description: 'Build a secure RESTful or GraphQL API with JWT authentication, relational/NoSQL database modeling, and role-based access.',
                difficulty: 'Intermediate',
                duration: '2-3 Weeks',
                skills: ['Node.js', 'Express', 'MongoDB/PostgreSQL', 'JWT Auth'],
                requirements: [
                    'CRUD operations with input schema validation & error handling',
                    'Encrypted authentication with refresh tokens and bcrypt',
                    'Relational joins/aggregations and indexed queries'
                ],
                suggestedTechnologies: ['Node.js', 'Express', 'PostgreSQL / MongoDB', 'JWT'],
                status: 'Not Started'
            },
            {
                title: 'Full-Stack Scalable SaaS Platform with CI/CD',
                description: 'Complete production-grade SaaS capstone featuring containerization, automated testing, and cloud deployment.',
                difficulty: 'Advanced',
                duration: '3-4 Weeks',
                skills: ['Docker', 'CI/CD', 'Cloud Deployment', 'Automated Testing'],
                requirements: [
                    'Docker containerization with multi-stage production builds',
                    'Automated GitHub Actions CI/CD pipeline running unit & integration tests',
                    'Production deployment with health monitoring and SSL'
                ],
                suggestedTechnologies: ['Docker', 'GitHub Actions', 'AWS / Vercel', 'PostgreSQL'],
                status: 'Not Started'
            }
        ];
    } else if (careerLower.includes('data') || careerLower.includes('analyst') || careerLower.includes('scientist')) {
        return [
            {
                title: 'Exploratory Data Analysis & Interactive Dashboard',
                description: 'Clean, preprocess, and visualize real-world financial or demographic datasets with statistical insights.',
                difficulty: 'Beginner',
                duration: '1-2 Weeks',
                skills: ['Python', 'Pandas', 'Matplotlib', 'Seaborn', 'SQL'],
                requirements: [
                    'Data cleaning, missing value imputation, and anomaly detection',
                    'Interactive visualization plots explaining key metric distributions',
                    'Comprehensive Jupyter notebook with executive summary'
                ],
                suggestedTechnologies: ['Python', 'Pandas', 'Seaborn', 'Power BI / Tableau'],
                status: 'Not Started'
            },
            {
                title: 'Automated ETL Data Pipeline with SQL Warehousing',
                description: 'Extract raw API data, transform business metrics, and load into a normalized SQL database schema.',
                difficulty: 'Intermediate',
                duration: '2-3 Weeks',
                skills: ['SQL', 'Python', 'ETL', 'PostgreSQL', 'Database Design'],
                requirements: [
                    'Automated extraction scripts consuming external public APIs',
                    'Normalized 3NF relational schema with indexed lookup tables',
                    'Automated summary views and aggregated reporting metrics'
                ],
                suggestedTechnologies: ['Python', 'PostgreSQL', 'SQLAlchemy', 'Airflow'],
                status: 'Not Started'
            },
            {
                title: 'Predictive Machine Learning Classification Engine',
                description: 'Train, evaluate, and tune machine learning models for customer churn or credit risk prediction.',
                difficulty: 'Intermediate',
                duration: '2-3 Weeks',
                skills: ['Scikit-Learn', 'Feature Engineering', 'Model Evaluation', 'Python'],
                requirements: [
                    'Feature scaling, categorical encoding, and cross-validation',
                    'Hyperparameter tuning with ROC-AUC & F1-score optimization',
                    'Explainability analysis using SHAP/permutation importance'
                ],
                suggestedTechnologies: ['Scikit-Learn', 'XGBoost', 'Optuna', 'Streamlit'],
                status: 'Not Started'
            },
            {
                title: 'Production ML API & Real-Time Analytics Dashboard',
                description: 'Deploy trained ML models via FastAPI microservice with interactive dashboard monitoring.',
                difficulty: 'Advanced',
                duration: '3-4 Weeks',
                skills: ['FastAPI', 'Docker', 'MLOps', 'Streamlit', 'Cloud Hosting'],
                requirements: [
                    'REST endpoint accepting batch/single inference requests with validation',
                    'Dockerized container deployed with automated latency logging',
                    'Interactive web dashboard for non-technical stakeholders'
                ],
                suggestedTechnologies: ['FastAPI', 'Docker', 'Streamlit', 'AWS / Render'],
                status: 'Not Started'
            }
        ];
    } else {
        // Generic / Systems & Engineering
        return [
            {
                title: 'Core Fundamentals & Engineering Simulation Project',
                description: 'Build an initial computational model, circuit simulation, or modular software utility.',
                difficulty: 'Beginner',
                duration: '1-2 Weeks',
                skills: ['Core Concepts', 'Git', 'Programming'],
                requirements: ['Documented setup and test cases', 'Version controlled on GitHub'],
                suggestedTechnologies: ['Git', 'Core Tools', 'Python/C++'],
                status: 'Not Started'
            },
            {
                title: 'Functional Prototype Application / Hardware Module',
                description: 'Design and validate a functional subsystem with automated inputs and outputs.',
                difficulty: 'Intermediate',
                duration: '2-3 Weeks',
                skills: ['Modular Design', 'Testing', 'Integration'],
                requirements: ['System architecture diagram', 'Reproducible demo video/documentation'],
                suggestedTechnologies: ['Engineering Software', 'APIs'],
                status: 'Not Started'
            },
            {
                title: 'Integrated Optimization & Subsystem Architecture',
                description: 'Optimize throughput, thermal dissipation, memory constraints, or concurrent workloads.',
                difficulty: 'Intermediate',
                duration: '2-3 Weeks',
                skills: ['Optimization', 'System Architecture', 'Security'],
                requirements: ['Benchmark metrics comparing baseline vs optimized solution'],
                suggestedTechnologies: ['Profiling Tools', 'Frameworks'],
                status: 'Not Started'
            },
            {
                title: 'Capstone Production Deployment & Portfolio Case Study',
                description: 'Complete capstone engineering project with comprehensive documentation, tests, and demo presentation.',
                difficulty: 'Advanced',
                duration: '3-4 Weeks',
                skills: ['Deployment', 'Documentation', 'Portfolio'],
                requirements: ['Live or recorded demo with technical case study report'],
                suggestedTechnologies: ['Docker', 'Cloud', 'Git'],
                status: 'Not Started'
            }
        ];
    }
};

// Helper to recalculate stage progress, skills count, and overall progress
const recalculateRoadmapMetrics = (roadmap) => {
    let totalSkills = 0;
    let completedSkills = 0;
    let totalProjects = 0;
    let completedProjects = 0;
    let totalResources = 0;
    let completedResources = 0;
    let completedStages = 0;
    let totalWeeks = 0;

    roadmap.stages.forEach((stage, idx) => {
        totalWeeks += (stage.weeks || 4);

        // Skills
        const stageTotalSkills = stage.skills.length;
        const stageCompletedSkills = stage.skills.filter(s => s.completed || s.status === 'Completed' || s.status === 'Advanced').length;
        totalSkills += stageTotalSkills;
        completedSkills += stageCompletedSkills;

        // Projects
        const stageTotalProjects = stage.projects ? stage.projects.length : 0;
        const stageCompletedProjects = stage.projects ? stage.projects.filter(p => p.status === 'Completed').length : 0;
        totalProjects += stageTotalProjects;
        completedProjects += stageCompletedProjects;

        // Resources
        const stageTotalResources = stage.resources ? stage.resources.length : 0;
        const stageCompletedResources = stage.resources ? stage.resources.filter(r => r.completed).length : 0;
        totalResources += stageTotalResources;
        completedResources += stageCompletedResources;

        // Calculate Stage progress percentage
        let stageWeight = 0;
        if (stageTotalSkills > 0) {
            stageWeight += (stageCompletedSkills / stageTotalSkills) * 60;
        } else {
            stageWeight += 60;
        }
        if (stageTotalProjects > 0) {
            stageWeight += (stageCompletedProjects / stageTotalProjects) * 25;
        } else {
            stageWeight += 25;
        }
        if (stageTotalResources > 0) {
            stageWeight += (stageCompletedResources / stageTotalResources) * 15;
        } else {
            stageWeight += 15;
        }

        stage.progressPercent = Math.min(100, Math.round(stageWeight));

        // Update Stage status
        if (stage.progressPercent === 100) {
            stage.status = 'Completed';
            completedStages += 1;
        } else if (stage.progressPercent > 0 || idx === 0) {
            stage.status = 'In Progress';
        } else {
            stage.status = (idx > 0 && roadmap.stages[idx - 1].status === 'Completed') ? 'In Progress' : 'Locked';
        }
    });

    roadmap.totalSkillsCount = totalSkills;
    roadmap.completedSkillsCount = completedSkills;
    roadmap.totalProjectsCount = totalProjects;
    roadmap.completedProjectsCount = completedProjects;
    roadmap.totalResourcesCount = totalResources;
    roadmap.stagesComplete = completedStages;
    roadmap.totalStages = roadmap.stages.length;

    // Overall Progress: Skills (50%) + Projects (35%) + Resources (15%)
    let overallProgress = 0;
    if (totalSkills > 0) overallProgress += (completedSkills / totalSkills) * 50;
    if (totalProjects > 0) overallProgress += (completedProjects / totalProjects) * 35;
    if (totalResources > 0) overallProgress += (completedResources / totalResources) * 15;
    roadmap.percentComplete = Math.min(100, Math.round(overallProgress));

    // Update Roadmap Status based on completion
    if (roadmap.percentComplete === 100 && completedStages === roadmap.totalStages) {
        roadmap.status = 'Completed';
        if (!roadmap.completedAt) roadmap.completedAt = new Date();
    } else if (roadmap.status !== 'Paused' && roadmap.status !== 'Archived' && roadmap.status !== 'Completed') {
        roadmap.status = roadmap.percentComplete > 0 ? 'In Progress' : 'Not Started';
    }

    // Estimated duration based on pace
    const hoursPerWeek = roadmap.learningPaceHoursPerWeek || 10;
    const paceFactor = 10 / hoursPerWeek;
    const effectiveWeeks = Math.round(totalWeeks * paceFactor);
    const months = Math.max(1, Math.round(effectiveWeeks / 4.2));
    roadmap.estimatedMonths = `~${months} Month${months > 1 ? 's' : ''}`;

    // Career Readiness
    roadmap.careerReadinessScore = Math.min(99, Math.max(15, Math.round((roadmap.percentComplete * 0.5) + (completedProjects * 10) + 15)));

    // Generate upcoming milestones
    let accumulatedWeeks = 0;
    const milestones = [];

    roadmap.stages.forEach((stage, idx) => {
        accumulatedWeeks += Math.round((stage.weeks || 4) * paceFactor);
        milestones.push({
            title: `Complete ${stage.title.split(':').slice(-1)[0].trim()}`,
            stageNumber: idx + 1,
            durationWeeks: accumulatedWeeks,
            targetTimeframe: stage.status === 'Completed' ? 'Completed' : `In ~${accumulatedWeeks} week${accumulatedWeeks > 1 ? 's' : ''}`,
            completed: stage.status === 'Completed'
        });
        if (stage.projects && stage.projects.length > 0) {
            milestones.push({
                title: `Build ${stage.projects[0].title}`,
                stageNumber: idx + 1,
                durationWeeks: Math.max(1, accumulatedWeeks - 1),
                targetTimeframe: stage.projects[0].status === 'Completed' ? 'Completed' : `In ~${Math.max(1, accumulatedWeeks - 1)} weeks`,
                completed: stage.projects[0].status === 'Completed'
            });
        }
    });

    roadmap.milestones = milestones.slice(0, 5);

    // Active AI Tip
    const activeStage = roadmap.stages.find(s => s.status === 'In Progress') || roadmap.stages[0];
    if (activeStage) {
        const uncompletedSkills = activeStage.skills.filter(s => !s.completed).map(s => s.name);
        const nextSkill = uncompletedSkills[0] || 'your core concepts';
        roadmap.stages.forEach(st => {
            if (st.status === 'In Progress') {
                st.aiTip = `Focus on hands-on practice this week. Build modular exercises with ${nextSkill} to accelerate your progress toward Stage ${st.stageNumber} completion.`;
            } else {
                st.aiTip = `Prepare your prerequisite foundations before advancing to ${st.title}.`;
            }
        });
    }

    roadmap.updatedAt = new Date();
};

// @desc    Get all user roadmaps grouped by status & primary designation
// @route   GET /api/roadmap/my-roadmaps
// @access  Private
exports.getMyRoadmaps = async (req, res) => {
    try {
        const roadmaps = await Roadmap.find({ user: req.user.id }).sort({ isPrimary: -1, lastAccessedAt: -1, createdAt: -1 });

        // Recalculate display metrics in memory for response
        for (const rm of roadmaps) {
            recalculateRoadmapMetrics(rm);
        }

        // Identify primary roadmap
        let primaryRoadmap = roadmaps.find(r => r.isPrimary && r.status !== 'Archived') || null;
        if (!primaryRoadmap && roadmaps.length > 0) {
            primaryRoadmap = roadmaps.find(r => r.status !== 'Archived') || roadmaps[0];
        }

        const activeRoadmaps = roadmaps.filter(r => (r.status === 'In Progress' || r.status === 'Not Started') && r.status !== 'Archived');
        const pausedRoadmaps = roadmaps.filter(r => r.status === 'Paused');
        const completedRoadmaps = roadmaps.filter(r => r.status === 'Completed');
        const archivedRoadmaps = roadmaps.filter(r => r.status === 'Archived');

        res.json({
            primaryRoadmap,
            activeRoadmaps,
            pausedRoadmaps,
            completedRoadmaps,
            archivedRoadmaps,
            allRoadmaps: roadmaps,
            totalRoadmaps: roadmaps.length
        });
    } catch (err) {
        console.error('Error in getMyRoadmaps:', err);
        res.status(500).json({ msg: 'Server error retrieving roadmaps' });
    }
};

// @desc    Get single active or selected user roadmap
// @route   GET /api/roadmap
// @access  Private
exports.getRoadmap = async (req, res) => {
    try {
        const { id } = req.query;
        let roadmap = null;

        if (id) {
            roadmap = await Roadmap.findOne({ _id: id, user: req.user.id });
        } else {
            // Find primary roadmap or most recently accessed active roadmap
            roadmap = await Roadmap.findOne({ user: req.user.id, isPrimary: true, status: { $ne: 'Archived' } });
            if (!roadmap) {
                roadmap = await Roadmap.findOne({ user: req.user.id, status: { $ne: 'Archived' } }).sort({ lastAccessedAt: -1 });
            }
        }

        if (!roadmap) {
            console.log(`[ROADMAP LOAD] No active roadmap found for user=${req.user.id} queryId=${id || 'none'}`);
            return res.status(404).json({ msg: 'No active roadmap found. Please generate or select a career goal.' });
        }

        recalculateRoadmapMetrics(roadmap);
        console.log(`[ROADMAP LOAD] Loaded roadmap id=${roadmap._id} career="${roadmap.field}" for user=${req.user.id}`);
        res.json(roadmap);
    } catch (err) {
        console.error('Error fetching roadmap:', err);
        res.status(500).json({ msg: 'Server Error fetching roadmap' });
    }
};

// @desc    Check if active roadmap exists for target career
// @route   POST /api/roadmap/check-existing
// @access  Private
exports.checkExistingRoadmap = async (req, res) => {
    try {
        const { careerTitle } = req.body;
        if (!careerTitle) {
            return res.status(400).json({ msg: 'Career title is required' });
        }

        const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const existing = await Roadmap.findOne({
            user: req.user.id,
            field: { $regex: new RegExp('^' + escapeRegex(careerTitle.trim()) + '$', 'i') },
            status: { $ne: 'Archived' }
        }).sort({ createdAt: -1 });

        if (existing) {
            return res.json({
                exists: true,
                hasExisting: true,
                roadmap: existing
            });
        }

        res.json({
            exists: false,
            hasExisting: false,
            roadmap: null
        });
    } catch (err) {
        console.error('Error checking existing roadmap:', err);
        res.status(500).json({ msg: 'Server error checking roadmap' });
    }
};

// @desc    Generate a new personalized user roadmap (preserves other roadmaps!)
// @route   POST /api/roadmap/generate
// @access  Private
exports.generateRoadmap = async (req, res) => {
    const {
        department,
        field,
        targetCareer,
        learningPaceHoursPerWeek = 10,
        preferredLearningStyle = 'Mixed',
        knownSkills = [],
        createNewVersion = false,
        forceNew = false
    } = req.body;

    const careerGoal = field || targetCareer;
    const shouldCreateNew = createNewVersion || forceNew;

    if (!careerGoal) {
        return res.status(400).json({ msg: 'Please provide career field/target' });
    }

    let finalDept = department;
    if (!finalDept) {
        // Infer from career goal or default
        const goalLower = careerGoal.toLowerCase();
        if (goalLower.includes('vlsi') || goalLower.includes('embedded') || goalLower.includes('iot') || goalLower.includes('telecom') || goalLower.includes('rf')) {
            finalDept = 'Electronics & Communication';
        } else if (goalLower.includes('power') || goalLower.includes('smart grid') || goalLower.includes('ev powertrain') || goalLower.includes('electrical')) {
            finalDept = 'Electrical & Power';
        } else if (goalLower.includes('cad') || goalLower.includes('automotive') || goalLower.includes('mechanical') || goalLower.includes('thermal') || goalLower.includes('aerospace')) {
            finalDept = 'Mechanical & Manufacturing';
        } else if (goalLower.includes('civil') || goalLower.includes('structural') || goalLower.includes('construction') || goalLower.includes('geotechnical')) {
            finalDept = 'Civil & Infrastructure';
        } else {
            finalDept = 'Computer Science & IT';
        }
    }

    try {
        const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

        // Check if an active roadmap for this career already exists
        const existing = await Roadmap.findOne({
            user: req.user.id,
            field: { $regex: new RegExp('^' + escapeRegex(careerGoal.trim()) + '$', 'i') },
            status: { $ne: 'Archived' }
        }).sort({ version: -1, createdAt: -1 });

        let newVersion = 1;
        if (existing) {
            if (!shouldCreateNew) {
                // Return existing active roadmap
                existing.lastAccessedAt = new Date();
                recalculateRoadmapMetrics(existing);
                await existing.save();
                return res.json(existing);
            }
            // User requested a new version: archive/pause previous
            newVersion = (existing.version || 1) + 1;
            existing.status = 'Paused';
            existing.isPrimary = false;
            await existing.save();
        }

        const { requiredSkills, skillResources } = loadJsonData();
        const profile = await Profile.findOne({ user: req.user.id });

        // Update profile target career
        if (profile) {
            profile.targetCareer = careerGoal;
            if (!profile.department) profile.department = finalDept;
            await profile.save();
        }

        // Match career key in taxonomy
        let careerKey = Object.keys(requiredSkills).find(key => key.toLowerCase() === careerGoal.toLowerCase());
        if (!careerKey) {
            careerKey = Object.keys(requiredSkills).find(key => key.toLowerCase().includes(careerGoal.toLowerCase()));
        }
        if (!careerKey) {
            careerKey = careerGoal;
        }

        const skillsData = requiredSkills[careerKey] || {
            "Fundamentals": { required: 85, category: "programming" },
            "Core Framework": { required: 80, category: "frontend" },
            "Databases & APIs": { required: 75, category: "backend" },
            "Deployment": { required: 70, category: "devops" }
        };

        const skillEntries = Object.entries(skillsData);

        // Define 4 Dynamic Stages
        const stages = [
            {
                stageNumber: 1,
                title: 'Stage 1: Foundation & Core Concepts',
                description: 'Essential fundamentals, tools, version control, and core principles to start your path.',
                weeks: 4,
                status: 'In Progress',
                progressPercent: 0,
                skills: [],
                resources: [],
                projects: []
            },
            {
                stageNumber: 2,
                title: 'Stage 2: Core Development & Frameworks',
                description: 'Deep dive into industry-standard frameworks, libraries, design patterns, and state architecture.',
                weeks: 6,
                status: 'Locked',
                progressPercent: 0,
                skills: [],
                resources: [],
                projects: []
            },
            {
                stageNumber: 3,
                title: 'Stage 3: Advanced Architectures & Systems',
                description: 'Advanced methodologies, databases, security, performance optimization, and system design.',
                weeks: 8,
                status: 'Locked',
                progressPercent: 0,
                skills: [],
                resources: [],
                projects: []
            },
            {
                stageNumber: 4,
                title: 'Stage 4: Projects, Deployment & Job Prep',
                description: 'Cloud deployment, containerization, portfolio projects, ATS resume tailoring, and mock interviews.',
                weeks: 4,
                status: 'Locked',
                progressPercent: 0,
                skills: [],
                resources: [],
                projects: []
            }
        ];

        // 1. Assign skills to stages
        const assignedSkills = [[], [], [], []];
        const studentProfileSkills = profile?.skills || [];

        skillEntries.forEach(([skillName, skillInfo]) => {
            const stageIndex = assignSkillToStage(skillName, skillInfo);

            const isKnown = knownSkills.some(ks => ks.toLowerCase() === skillName.toLowerCase()) ||
                studentProfileSkills.some(ps => ps.toLowerCase() === skillName.toLowerCase());

            let initialStatus = isKnown ? 'Intermediate' : 'Not Started';
            let initialCompleted = isKnown;

            assignedSkills[stageIndex].push({
                name: skillName,
                status: initialStatus,
                completed: initialCompleted,
                required: skillInfo.required || 75,
                category: skillInfo.category || 'Technical'
            });
        });

        // Ensure no empty stages by balanced distribution
        const hasEmptyStage = assignedSkills.some(list => list.length === 0);
        if (hasEmptyStage) {
            const allSkills = skillEntries.map(([skillName, skillInfo]) => {
                const isKnown = knownSkills.some(ks => ks.toLowerCase() === skillName.toLowerCase()) ||
                    studentProfileSkills.some(ps => ps.toLowerCase() === skillName.toLowerCase());
                return {
                    name: skillName,
                    status: isKnown ? 'Intermediate' : 'Not Started',
                    completed: isKnown,
                    required: skillInfo.required || 75,
                    category: skillInfo.category || 'Technical'
                };
            }).sort((a, b) => b.required - a.required);

            assignedSkills[0] = [];
            assignedSkills[1] = [];
            assignedSkills[2] = [];
            assignedSkills[3] = [];

            allSkills.forEach((sk, idx) => {
                const stageTarget = idx % 4;
                assignedSkills[stageTarget].push(sk);
            });
        }

        // Practical projects for this career
        const careerProjects = getProjectsForCareer(careerGoal, stages);

        // Populate each stage
        for (let idx = 0; idx < stages.length; idx++) {
            const stage = stages[idx];
            stage.skills = assignedSkills[idx] || [];
            stage.projects = [careerProjects[idx]];

            const uniqueResourceUrls = new Set();
            const stageResources = [];

            for (const skill of stage.skills) {
                const skillName = skill.name;

                // Query DB for verified resources
                const escapedSkill = skillName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                const dbResources = await Resource.find({
                    skill: { $regex: new RegExp('^' + escapedSkill + '$', 'i') },
                    isActive: true
                }).limit(3);

                if (dbResources.length > 0) {
                    dbResources.forEach(res => {
                        if (!uniqueResourceUrls.has(res.url)) {
                            uniqueResourceUrls.add(res.url);
                            stageResources.push({
                                resourceId: res._id,
                                name: res.title,
                                provider: res.provider,
                                url: res.url,
                                type: res.resourceType,
                                duration: res.duration || '3 Hours',
                                isFree: res.isFree,
                                rating: res.rating || 4.8,
                                completed: false,
                                isCustom: false
                            });
                        }
                    });
                } else {
                    // Fallback to skill_resources.json or official docs
                    const fallbackList = skillResources[skillName] || [];
                    if (fallbackList.length > 0) {
                        fallbackList.forEach(fb => {
                            if (!uniqueResourceUrls.has(fb.url)) {
                                uniqueResourceUrls.add(fb.url);
                                stageResources.push({
                                    name: fb.title || `${skillName} Practical Course`,
                                    provider: fb.provider || 'Coursera / edX',
                                    url: fb.url || `https://www.google.com/search?q=${encodeURIComponent(skillName + ' tutorial')}`,
                                    type: fb.type || 'Course',
                                    duration: fb.duration || '4 Hours',
                                    isFree: fb.isFree !== undefined ? fb.isFree : true,
                                    rating: fb.rating || 4.7,
                                    completed: false,
                                    isCustom: false
                                });
                            }
                        });
                    } else {
                        // Standard verified docs
                        stageResources.push({
                            name: `${skillName} Official Documentation & Guides`,
                            provider: 'Official Docs / MDN',
                            url: `https://developer.mozilla.org/en-US/search?q=${encodeURIComponent(skillName)}`,
                            type: 'Doc',
                            duration: '2 Hours',
                            isFree: true,
                            rating: 4.9,
                            completed: false,
                            isCustom: false
                        });
                        stageResources.push({
                            name: `${skillName} Interactive Free Tutorial`,
                            provider: 'freeCodeCamp / Web Dev',
                            url: `https://www.freecodecamp.org/news/search/?query=${encodeURIComponent(skillName)}`,
                            type: 'Course',
                            duration: '6 Hours',
                            isFree: true,
                            rating: 4.8,
                            completed: false,
                            isCustom: false
                        });
                    }
                }
            }

            stage.resources = stageResources.slice(0, 6);
        }

        // Check if user already has a primary roadmap
        const hasPrimary = await Roadmap.exists({ user: req.user.id, isPrimary: true, status: { $ne: 'Archived' } });

        const newRoadmap = new Roadmap({
            user: req.user.id,
            department: finalDept,
            field: careerKey,
            targetCareer: careerGoal,
            isPrimary: !hasPrimary,
            status: 'In Progress',
            version: newVersion,
            learningPaceHoursPerWeek: Number(learningPaceHoursPerWeek) || 10,
            preferredLearningStyle,
            stages,
            lastAccessedAt: new Date()
        });

        recalculateRoadmapMetrics(newRoadmap);
        await newRoadmap.save();

        await logActivity(
            req.user.id,
            'Roadmap generated',
            `Personalized Roadmap for ${careerGoal}`,
            'roadmap',
            `${department} · ${newRoadmap.totalStages} Stages · ${newRoadmap.totalSkillsCount} Skills`
        );

        console.log(`[ROADMAP CREATE] Successfully created roadmap id=${newRoadmap._id} career="${newRoadmap.field}" v${newRoadmap.version} stages=${newRoadmap.stages.length} for user=${req.user.id}`);
        res.status(201).json(newRoadmap);

    } catch (err) {
        console.error('Error generating roadmap:', err);
        res.status(500).json({ msg: 'Server error generating roadmap' });
    }
};

// @desc    Set chosen roadmap as primary
// @route   PUT /api/roadmap/:id/primary
// @access  Private
exports.setPrimaryRoadmap = async (req, res) => {
    try {
        const { id } = req.params;

        // Verify roadmap belongs to authenticated user
        const target = await Roadmap.findOne({ _id: id, user: req.user.id });
        if (!target) {
            return res.status(404).json({ msg: 'Roadmap not found or unauthorized' });
        }

        // Clear primary on other roadmaps for this user
        await Roadmap.updateMany({ user: req.user.id }, { $set: { isPrimary: false } });

        // Update selected roadmap as primary
        target.isPrimary = true;
        target.lastAccessedAt = new Date();
        if (target.status === 'Archived') {
            target.status = 'In Progress';
            target.archivedAt = null;
        }

        recalculateRoadmapMetrics(target);
        await target.save();

        // Sync targetCareer to profile
        await Profile.findOneAndUpdate(
            { user: req.user.id },
            { $set: { targetCareer: target.field, department: target.department } }
        );

        res.json({ msg: 'Primary roadmap updated', roadmap: target });
    } catch (err) {
        console.error('Error setting primary roadmap:', err);
        res.status(500).json({ msg: 'Server error setting primary roadmap' });
    }
};

// @desc    Update roadmap status (In Progress, Paused, Completed, Archived)
// @route   PUT /api/roadmap/:id/status
// @access  Private
exports.updateRoadmapStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const roadmap = await Roadmap.findOne({ _id: id, user: req.user.id });
        if (!roadmap) return res.status(404).json({ msg: 'Roadmap not found or unauthorized' });

        roadmap.status = status;
        roadmap.updatedAt = new Date();
        if (status === 'Completed') roadmap.completedAt = new Date();
        if (status === 'Archived') {
            roadmap.archivedAt = new Date();
            if (roadmap.isPrimary) {
                roadmap.isPrimary = false;
                // Assign next available active roadmap as primary
                const nextActive = await Roadmap.findOne({ user: req.user.id, _id: { $ne: id }, status: { $nin: ['Archived'] } });
                if (nextActive) {
                    nextActive.isPrimary = true;
                    await nextActive.save();
                }
            }
        }
        if (status === 'In Progress' && roadmap.archivedAt) {
            roadmap.archivedAt = null;
        }

        recalculateRoadmapMetrics(roadmap);
        await roadmap.save();
        res.json({ msg: `Roadmap status updated to ${status}`, roadmap });
    } catch (err) {
        console.error('Error updating roadmap status:', err);
        res.status(500).json({ msg: 'Server error updating roadmap status' });
    }
};

// @desc    Delete a roadmap
// @route   DELETE /api/roadmap/:id
// @access  Private
exports.deleteRoadmap = async (req, res) => {
    try {
        const { id } = req.params;
        const roadmap = await Roadmap.findOneAndDelete({ _id: id, user: req.user.id });
        if (!roadmap) return res.status(404).json({ msg: 'Roadmap not found or unauthorized' });

        if (roadmap.isPrimary) {
            const nextActive = await Roadmap.findOne({ user: req.user.id, status: { $nin: ['Archived'] } });
            if (nextActive) {
                nextActive.isPrimary = true;
                await nextActive.save();
            }
        }

        res.json({ msg: 'Roadmap deleted successfully' });
    } catch (err) {
        console.error('Error deleting roadmap:', err);
        res.status(500).json({ msg: 'Server error deleting roadmap' });
    }
};

// @desc    Update Skill Completion & Proficiency Status
// @route   PUT /api/roadmap/skill-progress or /api/roadmap/skill-proficiency
// @access  Private
exports.updateSkillProgress = async (req, res) => {
    const { stageIndex, skillName, status, completed, roadmapId } = req.body;

    if (stageIndex === undefined || !skillName) {
        return res.status(400).json({ msg: 'stageIndex and skillName are required' });
    }

    try {
        let query = { user: req.user.id };
        if (roadmapId) query._id = roadmapId;
        else query.isPrimary = true;

        let roadmap = await Roadmap.findOne(query);
        if (!roadmap) {
            roadmap = await Roadmap.findOne({ user: req.user.id, status: { $ne: 'Archived' } }).sort({ lastAccessedAt: -1 });
        }
        if (!roadmap) {
            return res.status(404).json({ msg: 'Roadmap not found' });
        }

        const stage = roadmap.stages[stageIndex];
        if (!stage) {
            return res.status(400).json({ msg: 'Invalid stage index' });
        }

        const skill = stage.skills.find(s => s.name.toLowerCase() === skillName.toLowerCase());
        if (!skill) {
            return res.status(404).json({ msg: `Skill '${skillName}' not found in stage ${stageIndex + 1}` });
        }

        // Set status and completed state
        if (status) {
            skill.status = status;
            skill.completed = (status === 'Completed' || status === 'Advanced');
        } else if (completed !== undefined) {
            skill.completed = Boolean(completed);
            skill.status = skill.completed ? 'Completed' : 'Not Started';
        } else {
            skill.completed = !skill.completed;
            skill.status = skill.completed ? 'Completed' : 'Not Started';
        }

        // Sync skill to student profile if completed
        if (skill.completed) {
            const profile = await Profile.findOne({ user: req.user.id });
            if (profile && !profile.skills.includes(skill.name)) {
                profile.skills.push(skill.name);
                await profile.save();
            }
        }

        roadmap.lastAccessedAt = new Date();
        recalculateRoadmapMetrics(roadmap);
        await roadmap.save();

        res.json(roadmap);
    } catch (err) {
        console.error('Error updating skill progress:', err);
        res.status(500).json({ msg: 'Server error updating skill' });
    }
};

// @desc    Update Resource Completion Status
// @route   PUT /api/roadmap/resource-progress
// @access  Private
exports.updateResourceProgress = async (req, res) => {
    const { stageIndex, resourceUrl, completed, roadmapId } = req.body;

    try {
        let query = { user: req.user.id };
        if (roadmapId) query._id = roadmapId;
        else query.isPrimary = true;

        let roadmap = await Roadmap.findOne(query);
        if (!roadmap) {
            roadmap = await Roadmap.findOne({ user: req.user.id, status: { $ne: 'Archived' } }).sort({ lastAccessedAt: -1 });
        }
        if (!roadmap) return res.status(404).json({ msg: 'Roadmap not found' });

        const stage = roadmap.stages[stageIndex];
        if (!stage) return res.status(400).json({ msg: 'Invalid stage index' });

        const resource = stage.resources.find(r => r.url === resourceUrl);
        if (resource) {
            resource.completed = completed !== undefined ? Boolean(completed) : !resource.completed;
        }

        roadmap.lastAccessedAt = new Date();
        recalculateRoadmapMetrics(roadmap);
        await roadmap.save();

        res.json(roadmap);
    } catch (err) {
        console.error('Error updating resource progress:', err);
        res.status(500).json({ msg: 'Server error updating resource progress' });
    }
};

// @desc    Update Project Progress & Links
// @route   PUT /api/roadmap/project-progress
// @access  Private
exports.updateProjectProgress = async (req, res) => {
    const { stageIndex, projectIndex = 0, status, githubUrl, liveDemoUrl, notes, roadmapId } = req.body;

    try {
        let query = { user: req.user.id };
        if (roadmapId) query._id = roadmapId;
        else query.isPrimary = true;

        let roadmap = await Roadmap.findOne(query);
        if (!roadmap) {
            roadmap = await Roadmap.findOne({ user: req.user.id, status: { $ne: 'Archived' } }).sort({ lastAccessedAt: -1 });
        }
        if (!roadmap) return res.status(404).json({ msg: 'Roadmap not found' });

        const stage = roadmap.stages[stageIndex];
        if (!stage || !stage.projects || !stage.projects[projectIndex]) {
            return res.status(400).json({ msg: 'Project not found in stage' });
        }

        const project = stage.projects[projectIndex];
        if (status) project.status = status;
        if (githubUrl !== undefined) project.githubUrl = githubUrl;
        if (liveDemoUrl !== undefined) project.liveDemoUrl = liveDemoUrl;
        if (notes !== undefined) project.notes = notes;
        if (status === 'Completed') {
            project.completedAt = new Date();

            // Sync project to student Profile
            const profile = await Profile.findOne({ user: req.user.id });
            if (profile) {
                const existingIndex = (profile.projects || []).findIndex(p => p.title.toLowerCase() === project.title.toLowerCase());
                const projectRecord = {
                    title: project.title,
                    description: project.description || '',
                    techStack: project.skills || [],
                    link: liveDemoUrl || '',
                    github: githubUrl || ''
                };

                if (existingIndex >= 0) {
                    profile.projects[existingIndex] = projectRecord;
                } else {
                    profile.projects.push(projectRecord);
                }
                await profile.save();
            }
        }

        roadmap.lastAccessedAt = new Date();
        recalculateRoadmapMetrics(roadmap);
        await roadmap.save();

        res.json(roadmap);
    } catch (err) {
        console.error('Error updating project progress:', err);
        res.status(500).json({ msg: 'Server error updating project progress' });
    }
};

// @desc    Add Custom Resource to Stage
// @route   POST /api/roadmap/custom-resource
// @access  Private
exports.addCustomResource = async (req, res) => {
    const { stageIndex, name, provider, url, type = 'Course', duration = '3 Hours', isFree = true, roadmapId } = req.body;

    if (stageIndex === undefined || !name || !url) {
        return res.status(400).json({ msg: 'stageIndex, name, and url are required' });
    }

    try {
        let query = { user: req.user.id };
        if (roadmapId) query._id = roadmapId;
        else query.isPrimary = true;

        let roadmap = await Roadmap.findOne(query);
        if (!roadmap) {
            roadmap = await Roadmap.findOne({ user: req.user.id, status: { $ne: 'Archived' } }).sort({ lastAccessedAt: -1 });
        }
        if (!roadmap) return res.status(404).json({ msg: 'Roadmap not found' });

        const stage = roadmap.stages[stageIndex];
        if (!stage) return res.status(400).json({ msg: 'Invalid stage index' });

        stage.resources.push({
            name,
            provider: provider || 'Custom Resource',
            url,
            type,
            duration,
            isFree: Boolean(isFree),
            rating: 5.0,
            completed: false,
            isCustom: true
        });

        roadmap.lastAccessedAt = new Date();
        recalculateRoadmapMetrics(roadmap);
        await roadmap.save();

        res.status(201).json(roadmap);
    } catch (err) {
        console.error('Error adding custom resource:', err);
        res.status(500).json({ msg: 'Server error adding custom resource' });
    }
};

// @desc    Adjust Learning Path (Pace / Duration / Weekly hours)
// @route   PUT /api/roadmap/adjust-path
// @access  Private
exports.adjustLearningPath = async (req, res) => {
    const { learningPaceHoursPerWeek, preferredLearningStyle, roadmapId } = req.body;

    try {
        let query = { user: req.user.id };
        if (roadmapId) query._id = roadmapId;
        else query.isPrimary = true;

        let roadmap = await Roadmap.findOne(query);
        if (!roadmap) {
            roadmap = await Roadmap.findOne({ user: req.user.id, status: { $ne: 'Archived' } }).sort({ lastAccessedAt: -1 });
        }
        if (!roadmap) return res.status(404).json({ msg: 'Roadmap not found' });

        if (learningPaceHoursPerWeek) {
            roadmap.learningPaceHoursPerWeek = Number(learningPaceHoursPerWeek);
        }
        if (preferredLearningStyle) {
            roadmap.preferredLearningStyle = preferredLearningStyle;
        }

        roadmap.lastAccessedAt = new Date();
        recalculateRoadmapMetrics(roadmap);
        await roadmap.save();

        res.json(roadmap);
    } catch (err) {
        console.error('Error adjusting learning path:', err);
        res.status(500).json({ msg: 'Server error adjusting learning path' });
    }
};

// @desc    Get Verified Learning Resources from platform Catalog
// @route   GET /api/roadmap/resources
// @access  Private
exports.getVerifiedResources = async (req, res) => {
    try {
        const { skill, career, difficulty, isFree, search } = req.query;
        const query = { isActive: true };

        const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

        if (skill) query.skill = { $regex: new RegExp(escapeRegex(skill), 'i') };
        if (career) query.career = { $regex: new RegExp(escapeRegex(career), 'i') };
        if (difficulty && difficulty !== 'All') query.difficulty = difficulty;
        if (isFree !== undefined && isFree !== 'all') query.isFree = isFree === 'true';
        if (search) {
            const escapedSearch = escapeRegex(search);
            query.$or = [
                { title: { $regex: new RegExp(escapedSearch, 'i') } },
                { provider: { $regex: new RegExp(escapedSearch, 'i') } },
                { skill: { $regex: new RegExp(escapedSearch, 'i') } }
            ];
        }

        const resources = await Resource.find(query).sort({ rating: -1, createdAt: -1 });
        res.json({ resources });
    } catch (err) {
        console.error('Error fetching verified resources:', err);
        res.status(500).json({ msg: 'Server error fetching resources' });
    }
};
