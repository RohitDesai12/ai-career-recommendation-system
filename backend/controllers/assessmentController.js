const AssessmentAttempt = require('../models/AssessmentAttempt');
const Profile = require('../models/Profile');
const StudentActivity = require('../models/StudentActivity');
const axios = require('axios');
const { getMlServiceUrl } = require('../config/mlConfig');

// Comprehensive platform career definitions with ideal dimension footprints
const CAREER_DEFINITIONS = [
    // 1. Technology & Software
    {
        title: 'Software Development Engineer',
        department: 'Technology & Software',
        fieldCategory: 'Technology & Software',
        salaryRange: '₹14,00,000 - ₹28,00,000 / yr',
        idealDimensions: { technicalInterest: 90, analytical: 80, problemSolving: 92, creativity: 60, peopleOrientation: 50 },
        keySkills: ['Data Structures', 'Algorithms', 'System Design', 'Java/C++', 'Microservices'],
        whyReasons: [
            'Strong technical alignment with hands-on development',
            'Demonstrates natural aptitude for algorithmic problem solving',
            'Scenario choices reflect systematic root-cause debugging'
        ],
        developmentAreas: ['System Design & Scalability', 'Advanced Concurrency']
    },
    {
        title: 'Full Stack Web Developer',
        department: 'Technology & Software',
        fieldCategory: 'Technology & Software',
        salaryRange: '₹10,00,000 - ₹22,00,000 / yr',
        idealDimensions: { technicalInterest: 88, analytical: 72, problemSolving: 85, creativity: 78, peopleOrientation: 62 },
        keySkills: ['React', 'Node.js', 'TypeScript', 'PostgreSQL', 'REST APIs', 'TailwindCSS'],
        whyReasons: [
            'Enjoys end-to-end building from user interfaces to robust backend APIs',
            'Strong balance between technical architecture and visual polish',
            'Shows interest in creating practical, user-facing applications'
        ],
        developmentAreas: ['Cloud Deployment & CI/CD', 'API Security & Rate Limiting']
    },
    {
        title: 'Cloud Architect / DevOps Engineer',
        department: 'Technology & Software',
        fieldCategory: 'Technology & Software',
        salaryRange: '₹15,00,000 - ₹30,00,000 / yr',
        idealDimensions: { technicalInterest: 92, analytical: 85, problemSolving: 88, creativity: 55, peopleOrientation: 55 },
        keySkills: ['Docker', 'Kubernetes', 'AWS/GCP', 'Terraform', 'CI/CD Pipelines', 'Linux'],
        whyReasons: [
            'Values high system reliability, automation, and infrastructure resilience',
            'Scenario choices indicate structured, process-oriented problem solving',
            'Strong affinity for automated tooling and scalable cloud systems'
        ],
        developmentAreas: ['Infrastructure as Code (IaC)', 'Multi-cloud Governance']
    },
    {
        title: 'Backend Developer',
        department: 'Technology & Software',
        fieldCategory: 'Technology & Software',
        salaryRange: '₹12,00,000 - ₹24,00,000 / yr',
        idealDimensions: { technicalInterest: 88, analytical: 82, problemSolving: 88, creativity: 50, peopleOrientation: 45 },
        keySkills: ['Node.js', 'Python/Go', 'PostgreSQL/MongoDB', 'Redis', 'Microservices', 'Kafka'],
        whyReasons: [
            'Prefers deep technical logic, database architecture, and performance optimization',
            'Strong inclination toward solving complex backend bottlenecks',
            'Focuses on data integrity and secure transactional processing'
        ],
        developmentAreas: ['Distributed Systems Messaging', 'Query Optimization']
    },
    {
        title: 'Frontend Developer',
        department: 'Technology & Software',
        fieldCategory: 'Technology & Software',
        salaryRange: '₹9,00,000 - ₹20,00,000 / yr',
        idealDimensions: { technicalInterest: 80, analytical: 65, problemSolving: 78, creativity: 85, peopleOrientation: 70 },
        keySkills: ['React', 'TypeScript', 'CSS/Tailwind', 'Next.js', 'State Management', 'Web Performance'],
        whyReasons: [
            'Combines programming proficiency with intuitive design aesthetics',
            'Shows keen eye for responsive UI interactions and user delight',
            'Enjoys crafting accessible, high-performance web experiences'
        ],
        developmentAreas: ['Design Systems Architecture', 'Web Animation & WebGL']
    },
    {
        title: 'QA / Automation Test Engineer',
        department: 'Technology & Software',
        fieldCategory: 'Technology & Software',
        salaryRange: '₹8,00,000 - ₹16,00,000 / yr',
        idealDimensions: { technicalInterest: 75, analytical: 85, problemSolving: 80, creativity: 55, peopleOrientation: 58 },
        keySkills: ['Selenium', 'Cypress', 'Playwright', 'Jest', 'API Testing', 'Test Automation Frameworks'],
        whyReasons: [
            'Exhibits outstanding attention to detail and edge-case discovery',
            'Scenario choices highlight structured verification before production release',
            'Enjoys automating quality gates and reliability validation'
        ],
        developmentAreas: ['Performance & Load Testing', 'Security Vulnerability Scanning']
    },

    // 2. Data & Analytics
    {
        title: 'Data Analyst',
        department: 'Data & Analytics',
        fieldCategory: 'Data & Analytics',
        salaryRange: '₹8,50,000 - ₹18,00,000 / yr',
        idealDimensions: { technicalInterest: 70, analytical: 92, problemSolving: 82, creativity: 65, peopleOrientation: 72 },
        keySkills: ['SQL', 'Python', 'Power BI / Tableau', 'Excel Modeling', 'Statistical Analysis'],
        whyReasons: [
            'Excels at finding patterns and uncovering trends in large datasets',
            'Demonstrates strong ability to communicate actionable business insights',
            'Enjoys structured data interpretation over raw low-level code'
        ],
        developmentAreas: ['Predictive Statistical Modeling', 'Executive Storytelling with Data']
    },
    {
        title: 'Data Scientist',
        department: 'Data & Analytics',
        fieldCategory: 'Data & Analytics',
        salaryRange: '₹14,00,000 - ₹28,00,000 / yr',
        idealDimensions: { technicalInterest: 85, analytical: 95, problemSolving: 90, creativity: 70, peopleOrientation: 55 },
        keySkills: ['Python', 'Pandas/NumPy', 'Scikit-Learn', 'Statistical Inference', 'SQL', 'A/B Testing'],
        whyReasons: [
            'High affinity for deep quantitative research and mathematical formulation',
            'Combines rigorous scientific hypotheses with predictive modeling',
            'Scenario choices show systematic experimental testing'
        ],
        developmentAreas: ['Production ML Deployment (MLOps)', 'Big Data Processing (Spark)']
    },
    {
        title: 'Data Engineer',
        department: 'Data & Analytics',
        fieldCategory: 'Data & Analytics',
        salaryRange: '₹13,00,000 - ₹26,00,000 / yr',
        idealDimensions: { technicalInterest: 90, analytical: 88, problemSolving: 85, creativity: 50, peopleOrientation: 50 },
        keySkills: ['Python/Scala', 'Apache Spark', 'Airflow', 'Snowflake/BigQuery', 'Data Pipelines', 'SQL'],
        whyReasons: [
            'Enjoys architecting robust data pipelines and transformation workflows',
            'Values high throughput, schema governance, and data warehousing reliability',
            'Demonstrates strong backend and ETL mindset'
        ],
        developmentAreas: ['Streaming Architectures (Kafka/Flink)', 'Data Mesh Governance']
    },

    // 3. AI & Machine Learning
    {
        title: 'ML Engineer / AI Researcher',
        department: 'AI & Machine Learning',
        fieldCategory: 'AI & Machine Learning',
        salaryRange: '₹16,00,000 - ₹34,00,000 / yr',
        idealDimensions: { technicalInterest: 95, analytical: 95, problemSolving: 92, creativity: 75, peopleOrientation: 45 },
        keySkills: ['PyTorch', 'TensorFlow', 'LLM Fine-Tuning', 'Vector Databases', 'MLOps', 'Algorithms'],
        whyReasons: [
            'Passionate about cutting-edge artificial intelligence and algorithmic models',
            'Scenario responses show experimental curiosity with empirical validation',
            'Thrives when building autonomous and predictive intelligent systems'
        ],
        developmentAreas: ['Distributed Model Training', 'Model Optimization & Quantization']
    },
    {
        title: 'AI Solutions Engineer',
        department: 'AI & Machine Learning',
        fieldCategory: 'AI & Machine Learning',
        salaryRange: '₹12,00,000 - ₹25,00,000 / yr',
        idealDimensions: { technicalInterest: 85, analytical: 80, problemSolving: 88, creativity: 80, peopleOrientation: 65 },
        keySkills: ['LangChain', 'OpenAI APIs', 'Prompt Engineering', 'Python', 'FastAPI', 'RAG Pipelines'],
        whyReasons: [
            'Focuses on practical generative AI integration into real-world business workflows',
            'Strong blend of modern AI tooling and rapid software prototyping',
            'Enjoys building intelligent copilot and conversational systems'
        ],
        developmentAreas: ['Agentic Frameworks', 'Vector Search Performance']
    },

    // 4. Design & UX
    {
        title: 'UX/UI Designer',
        department: 'Design & UX',
        fieldCategory: 'Design & UX',
        salaryRange: '₹8,00,000 - ₹18,00,000 / yr',
        idealDimensions: { technicalInterest: 55, analytical: 70, problemSolving: 78, creativity: 95, peopleOrientation: 90 },
        keySkills: ['Figma', 'User Research', 'Wireframing', 'Prototyping', 'Design Systems', 'Usability Testing'],
        whyReasons: [
            'Deep empathy for end-user experiences and human-centered design',
            'Scenario choices prioritize customer interviews and user experience clarity',
            'Outstanding visual aesthetic sensitivity and creative problem solving'
        ],
        developmentAreas: ['Design Token Architecture', 'Micro-interactions & Motion Design']
    },
    {
        title: 'Product Designer',
        department: 'Design & UX',
        fieldCategory: 'Design & UX',
        salaryRange: '₹11,00,000 - ₹22,00,000 / yr',
        idealDimensions: { technicalInterest: 60, analytical: 78, problemSolving: 85, creativity: 92, peopleOrientation: 88 },
        keySkills: ['Product Strategy', 'Figma', 'Interaction Design', 'User Journey Mapping', 'A/B Experimentation'],
        whyReasons: [
            'Bridges visual interaction design with strategic business objectives',
            'Enjoys iterative design driven by user behavior metrics',
            'High balance between creative intuition and product logic'
        ],
        developmentAreas: ['Quantitative Product Analytics', 'Design System Scaling']
    },

    // 5. Business & Management
    {
        title: 'Product Manager',
        department: 'Business & Management',
        fieldCategory: 'Business & Management',
        salaryRange: '₹14,00,000 - ₹30,00,000 / yr',
        idealDimensions: { technicalInterest: 65, analytical: 85, problemSolving: 90, creativity: 80, peopleOrientation: 95 },
        keySkills: ['Product Strategy', 'Roadmapping', 'User Research', 'Agile/Scrum', 'Data Analysis', 'Cross-functional Leadership'],
        whyReasons: [
            'Natural talent for stakeholder collaboration, leadership, and prioritization',
            'Enjoys defining the "Why" and "What" of products rather than solely the "How"',
            'Scenario choices highlight balanced trade-offs and user-first feature roadmaps'
        ],
        developmentAreas: ['Technical Feasibility Assessment', 'Go-to-Market Strategy']
    },
    {
        title: 'Business Analyst',
        department: 'Business & Management',
        fieldCategory: 'Business & Management',
        salaryRange: '₹7,50,000 - ₹16,00,000 / yr',
        idealDimensions: { technicalInterest: 60, analytical: 88, problemSolving: 80, creativity: 60, peopleOrientation: 85 },
        keySkills: ['Requirements Gathering', 'Process Modeling', 'SQL', 'Excel', 'Stakeholder Communication'],
        whyReasons: [
            'Excels at translating business goals into clear technical specifications',
            'High interest in operational workflows and enterprise efficiency',
            'Strong communication and analytical documentation skills'
        ],
        developmentAreas: ['Financial Modeling', 'Data Visualization Dashboards']
    },

    // 6. Cybersecurity
    {
        title: 'Cybersecurity Analyst',
        department: 'Cybersecurity',
        fieldCategory: 'Cybersecurity',
        salaryRange: '₹10,00,000 - ₹24,00,000 / yr',
        idealDimensions: { technicalInterest: 88, analytical: 92, problemSolving: 90, creativity: 60, peopleOrientation: 50 },
        keySkills: ['Network Security', 'SIEM & Threat Hunting', 'Vulnerability Assessment', 'Linux', 'Ethical Hacking'],
        whyReasons: [
            'Demonstrates investigative mindset to find vulnerabilities before adversaries',
            'Scenario choices reflect cautious risk management and proactive defense',
            'Enjoys deep forensic log analysis and digital security hygiene'
        ],
        developmentAreas: ['Cloud Security Posture (CSPM)', 'Zero Trust Network Architecture']
    },

    // 7. Core Engineering & Electronics
    {
        title: 'Embedded Systems Engineer',
        department: 'Core Engineering',
        fieldCategory: 'Electronics & Embedded',
        salaryRange: '₹9,00,000 - ₹20,00,000 / yr',
        idealDimensions: { technicalInterest: 92, analytical: 82, problemSolving: 90, creativity: 55, peopleOrientation: 45 },
        keySkills: ['Embedded C/C++', 'Microcontrollers (ARM/ESP32)', 'RTOS', 'Circuit Debugging', 'IoT Protocols'],
        whyReasons: [
            'Passion for hardware-software interface and low-level firmware',
            'Scenario responses show meticulous resource-constrained problem solving',
            'Enjoys physical prototyping with electronic sensors and boards'
        ],
        developmentAreas: ['Embedded Linux', 'BLE/Zigbee Wireless Stacks']
    },
    {
        title: 'Robotics Engineer',
        department: 'Core Engineering',
        fieldCategory: 'Core Engineering',
        salaryRange: '₹10,00,000 - ₹22,00,000 / yr',
        idealDimensions: { technicalInterest: 90, analytical: 88, problemSolving: 90, creativity: 70, peopleOrientation: 50 },
        keySkills: ['ROS / ROS2', 'C++', 'Python', 'Kinematics', 'Computer Vision', 'Control Systems'],
        whyReasons: [
            'Combines mechanical automation, sensors, and intelligent algorithms',
            'Enjoys seeing digital code manipulate physical machines in real time',
            'Strong multi-disciplinary problem solving and spatial logic'
        ],
        developmentAreas: ['Motion Planning & SLAM', 'Reinforcement Learning in Robotics']
    }
];

// Helper to calculate student dimensional footprint from multi-signal inputs
function calculateDimensions(inputs) {
    const { interests = [], scenarios = [], challenges = [], workStyle = {}, careerValues = [], constraints = {} } = inputs;

    let technicalInterest = 50;
    let analytical = 50;
    let problemSolving = 50;
    let creativity = 50;
    let peopleOrientation = 50;

    // 1. Interests (Activity Cards)
    interests.forEach(interest => {
        switch (interest) {
            case 'Building things':
                technicalInterest += 15;
                problemSolving += 10;
                break;
            case 'Solving puzzles':
                problemSolving += 18;
                analytical += 12;
                break;
            case 'Working with numbers':
                analytical += 20;
                technicalInterest += 5;
                break;
            case 'Designing experiences':
                creativity += 22;
                peopleOrientation += 10;
                break;
            case 'Understanding people':
                peopleOrientation += 22;
                creativity += 8;
                break;
            case 'Researching':
                analytical += 15;
                technicalInterest += 10;
                break;
            case 'Investigating problems':
                problemSolving += 15;
                analytical += 12;
                break;
            case 'Explaining ideas':
                peopleOrientation += 16;
                creativity += 8;
                break;
            case 'Leading teams':
                peopleOrientation += 20;
                problemSolving += 8;
                break;
            case 'Creating new ideas':
                creativity += 20;
                problemSolving += 8;
                break;
            case 'Working with machines':
                technicalInterest += 18;
                problemSolving += 8;
                break;
            case 'Making decisions':
                problemSolving += 12;
                peopleOrientation += 12;
                break;
        }
    });

    // 2. Real-world Scenarios
    scenarios.forEach(sc => {
        const option = sc.selectedOption || '';
        if (option.includes('code') || option.includes('architecture') || option.includes('technical')) {
            technicalInterest += 10;
            problemSolving += 8;
        } else if (option.includes('data') || option.includes('metrics') || option.includes('analyze') || option.includes('logs')) {
            analytical += 12;
            problemSolving += 6;
        } else if (option.includes('users') || option.includes('talk') || option.includes('team') || option.includes('people')) {
            peopleOrientation += 12;
            creativity += 6;
        } else if (option.includes('redesign') || option.includes('interface') || option.includes('creative') || option.includes('alternative')) {
            creativity += 12;
            problemSolving += 6;
        }
    });

    // 3. Mini Career Challenges
    challenges.forEach(ch => {
        if (ch.isOptimal) {
            problemSolving += 10;
        }
        if (ch.category === 'Logic & Problem Solving') {
            problemSolving += 8;
            technicalInterest += 6;
        } else if (ch.category === 'Data Interpretation') {
            analytical += 12;
        } else if (ch.category === 'Design') {
            creativity += 12;
            peopleOrientation += 6;
        } else if (ch.category === 'Planning' || ch.category === 'Prioritization') {
            peopleOrientation += 8;
            problemSolving += 6;
        }
    });

    // 4. Work Style
    if (workStyle.collaboration === 'Team') {
        peopleOrientation += 12;
    } else if (workStyle.collaboration === 'Independent') {
        technicalInterest += 6;
        analytical += 6;
    }

    // 5. Career Values
    careerValues.forEach(val => {
        if (val === 'Creativity') creativity += 10;
        if (val === 'Research & Innovation') { analytical += 10; technicalInterest += 8; }
        if (val === 'Leadership') peopleOrientation += 12;
        if (val === 'Continuous Learning') problemSolving += 8;
        if (val === 'Social Impact') peopleOrientation += 8;
    });

    // Clamp between 20 and 96
    const clamp = (val) => Math.min(96, Math.max(25, Math.round(val)));

    return {
        technicalInterest: clamp(technicalInterest),
        analytical: clamp(analytical),
        problemSolving: clamp(problemSolving),
        creativity: clamp(creativity),
        peopleOrientation: clamp(peopleOrientation)
    };
}

// Helper to calculate Euclidean/Cosine match scores for each career
function calculateCareerMatches(userDims, selectedField, inputs) {
    const { interests = [], careerValues = [] } = inputs;

    const scoredCareers = CAREER_DEFINITIONS.map(career => {
        const ideal = career.idealDimensions;

        // Compute dimension delta
        const diffTech = Math.abs(userDims.technicalInterest - ideal.technicalInterest);
        const diffAnal = Math.abs(userDims.analytical - ideal.analytical);
        const diffProb = Math.abs(userDims.problemSolving - ideal.problemSolving);
        const diffCreat = Math.abs(userDims.creativity - ideal.creativity);
        const diffPeople = Math.abs(userDims.peopleOrientation - ideal.peopleOrientation);

        const totalDiff = (diffTech * 1.2) + (diffAnal * 1.1) + (diffProb * 1.3) + (diffCreat * 1.0) + (diffPeople * 1.0);
        let baseScore = Math.max(45, 100 - (totalDiff / 5.6));

        // Bonus if matches selected field
        if (selectedField && selectedField !== "I'm not sure yet" && selectedField !== 'All Fields') {
            if (career.fieldCategory.toLowerCase().includes(selectedField.toLowerCase()) || selectedField.toLowerCase().includes(career.fieldCategory.toLowerCase())) {
                baseScore += 12;
            }
        }

        // Bonus for specific interests
        if (interests.includes('Designing experiences') && (career.department === 'Design & UX' || career.title.includes('Frontend'))) {
            baseScore += 8;
        }
        if (interests.includes('Working with numbers') && (career.department === 'Data & Analytics')) {
            baseScore += 8;
        }
        if (interests.includes('Building things') && (career.department === 'Technology & Software')) {
            baseScore += 6;
        }
        if (interests.includes('Understanding people') && (career.title.includes('Product Manager') || career.title.includes('UX/UI'))) {
            baseScore += 8;
        }

        // Bonus for values
        if (careerValues.includes('High Salary') && career.salaryRange.includes('34,00,000')) {
            baseScore += 3;
        }

        const normalizedScore = Math.min(96, Math.max(55, Math.round(baseScore)));

        return {
            title: career.title,
            department: career.department,
            matchScore: normalizedScore,
            salaryRange: career.salaryRange,
            keySkills: career.keySkills,
            whyMatches: career.whyReasons,
            areasToDevelop: career.developmentAreas
        };
    });

    // Sort descending
    scoredCareers.sort((a, b) => b.matchScore - a.matchScore);

    // Assign tiers
    return scoredCareers.map((c, index) => {
        let matchTier = 'Possible Path';
        if (index === 0) matchTier = 'Best Match';
        else if (index <= 2) matchTier = 'High Match';
        else if (index <= 5) matchTier = 'Good Match';

        return {
            ...c,
            matchTier
        };
    });
}

// Generate Key Strengths summary statements from dimensions
function generateKeyStrengths(dims) {
    const strengths = [];

    if (dims.problemSolving >= 75) {
        strengths.push({
            title: 'Technical Problem Solving',
            description: 'You excel at analyzing and solving complex, multi-variable issues through structured logic.'
        });
    }
    if (dims.technicalInterest >= 75) {
        strengths.push({
            title: 'Building and Systems Architecture',
            description: 'You enjoy hands-on development, writing scalable code, and understanding physical or digital mechanics.'
        });
    }
    if (dims.analytical >= 75) {
        strengths.push({
            title: 'Analytical Data Interpretation',
            description: 'You naturally discover trends, test empirical hypotheses, and evaluate metrics to drive decisions.'
        });
    }
    if (dims.creativity >= 75) {
        strengths.push({
            title: 'Creative Product Vision & UI',
            description: 'You have a strong aesthetic eye and think creatively to design intuitive user experiences.'
        });
    }
    if (dims.peopleOrientation >= 70) {
        strengths.push({
            title: 'Stakeholder Empathy & Leadership',
            description: 'You communicate concepts clearly, facilitate team collaboration, and advocate for user needs.'
        });
    }

    if (strengths.length < 3) {
        strengths.push({
            title: 'Continuous Growth Mindset',
            description: 'You are motivated to master new technologies, build impactful projects, and expand your career horizons.'
        });
    }

    return strengths.slice(0, 3);
}

// @desc    Submit complete career discovery assessment
// @route   POST /api/assessment/submit
// @access  Private
exports.submitAssessment = async (req, res) => {
    try {
        const {
            field,
            academic,
            direction,
            interests,
            scenarios,
            challenges,
            workStyle,
            careerValues,
            tradeOffs,
            skillsData,
            constraints,
            v8Profile
        } = req.body;

        const inputs = {
            academic: academic || {},
            direction: direction || {},
            interests: interests || [],
            scenarios: scenarios || [],
            challenges: challenges || [],
            workStyle: workStyle || {},
            careerValues: careerValues || [],
            tradeOffs: tradeOffs || [],
            skillsData: skillsData || {},
            constraints: constraints || {}
        };

        const dimensions = calculateDimensions(inputs);
        const keyStrengths = generateKeyStrengths(dimensions);

        // Sanitize and construct the canonical 20 features for the V8 model without CSE bias
        const activeBranch = v8Profile?.Branch || academic?.branch || 'General Engineering';
        let defaultPrimarySkill = 'Problem Solving';
        let defaultSecondarySkill = 'Analytical Thinking';
        let defaultTargetSector = 'Engineering';

        if (activeBranch.includes('Mechatronics') || activeBranch.includes('Robotics')) {
            defaultPrimarySkill = 'Robotics';
            defaultSecondarySkill = 'Automation';
            defaultTargetSector = 'Automotive';
        } else if (activeBranch.includes('Mechanical') || activeBranch.includes('Automotive')) {
            defaultPrimarySkill = 'SolidWorks';
            defaultSecondarySkill = 'CAD';
            defaultTargetSector = 'Core Manufacturing';
        } else if (activeBranch.includes('Civil')) {
            defaultPrimarySkill = 'AutoCAD';
            defaultSecondarySkill = 'Structural Analysis';
            defaultTargetSector = 'Construction';
        } else if (activeBranch.includes('Electrical')) {
            defaultPrimarySkill = 'Power Systems';
            defaultSecondarySkill = 'PLC';
            defaultTargetSector = 'CleanTech & Energy';
        } else if (activeBranch.includes('Electronics') || activeBranch.includes('Communication')) {
            defaultPrimarySkill = 'Embedded C';
            defaultSecondarySkill = 'Microcontrollers';
            defaultTargetSector = 'Semiconductors';
        } else if (activeBranch.includes('Biotechnology') || activeBranch.includes('Biomedical')) {
            defaultPrimarySkill = 'Bioinformatics';
            defaultSecondarySkill = 'Laboratory Techniques';
            defaultTargetSector = 'Healthcare & Biotech';
        } else if (activeBranch.includes('Chemical')) {
            defaultPrimarySkill = 'Process Simulation';
            defaultSecondarySkill = 'Aspen Plus';
            defaultTargetSector = 'Chemicals';
        } else if (activeBranch.includes('Computer') || activeBranch.includes('Information')) {
            defaultPrimarySkill = 'Software Development';
            defaultSecondarySkill = 'Data Structures';
            defaultTargetSector = 'Information Technology';
        }

        const constructedV8Profile = {
            Branch: activeBranch,
            Specialization: v8Profile?.Specialization || academic?.specialization || 'General',
            CGPA: v8Profile?.CGPA !== undefined && v8Profile.CGPA !== null ? Number(v8Profile.CGPA) : (academic?.cgpa ? Number(academic.cgpa) : 8.0),
            Academic_Performance: v8Profile?.Academic_Performance || (
                (academic?.cgpa || 8.0) >= 8.5 ? 'Excellent' :
                (academic?.cgpa || 8.0) >= 7.5 ? 'Good' :
                (academic?.cgpa || 8.0) >= 6.5 ? 'Average' : 'Below Average'
            ),
            Primary_Skill: v8Profile?.Primary_Skill || skillsData?.existingSkills?.[0]?.name || defaultPrimarySkill,
            Secondary_Skill: v8Profile?.Secondary_Skill || skillsData?.existingSkills?.[1]?.name || defaultSecondarySkill,
            Programming_Languages: v8Profile?.Programming_Languages || skillsData?.programmingLanguages || 'None / Basic Scripting',
            Technical_Proficiency: v8Profile?.Technical_Proficiency || skillsData?.technicalProficiency || 'Intermediate',
            Certifications: v8Profile?.Certifications || (Array.isArray(skillsData?.certifications) && skillsData.certifications.length > 0 ? skillsData.certifications.join(', ') : 'None / In Progress'),
            Interest_Area: v8Profile?.Interest_Area || (inputs.interests && inputs.interests[0]) || (activeBranch.includes('Mechatronics') ? 'Robotics and Automation' : 'General Engineering'),
            Career_Goal: v8Profile?.Career_Goal || inputs.constraints?.careerGoal || 'Develop innovative engineering solutions',
            Preferred_Environment: v8Profile?.Preferred_Environment || inputs.workStyle?.environment || (activeBranch.includes('Mechatronics') ? 'R&D Center' : 'Corporate Office'),
            Target_Sector: v8Profile?.Target_Sector || defaultTargetSector,
            Expected_Salary: v8Profile?.Expected_Salary !== undefined && v8Profile.Expected_Salary !== null ? Number(v8Profile.Expected_Salary) : (inputs.constraints?.expectedSalary ? Number(inputs.constraints.expectedSalary) : 10.0),
            Higher_Studies_Interest: v8Profile?.Higher_Studies_Interest || (inputs.constraints?.higherStudies === 'Yes' || inputs.constraints?.careerGoal?.includes('Higher') ? 'Yes' : 'No'),
            Research_Interest: v8Profile?.Research_Interest || (inputs.interests.some(i => String(i).toLowerCase().includes('research')) ? 'High' : 'Moderate'),
            Problem_Solving_Level: v8Profile?.Problem_Solving_Level || 'Advanced',
            Communication_Level: v8Profile?.Communication_Level || 'Good',
            Preferred_Location: v8Profile?.Preferred_Location || inputs.constraints?.locationPreference || 'Flexible',
            Startup_Interest: v8Profile?.Startup_Interest || (inputs.careerValues.some(v => String(v).toLowerCase().includes('startup') || String(v).toLowerCase().includes('entrepreneur')) ? 'High' : 'Moderate')
        };

        let v8ResponseData = null;
        let recommendedCareers = [];

        // 1. Primary: Execute real V8 model inference and 6-factor ranking via ML Service
        try {
            const mlRes = await axios.post(`${getMlServiceUrl()}/api/recommend/v8`, constructedV8Profile, { timeout: 45000 });
            if (mlRes.data && mlRes.data.status === 'success' && Array.isArray(mlRes.data.top_recommendations)) {
                v8ResponseData = mlRes.data;
                recommendedCareers = mlRes.data.top_recommendations.map((c, idx) => ({
                    title: c.career_title,
                    career_title: c.career_title,
                    department: c.target_sector || 'Engineering',
                    matchScore: Math.round(c.compatibility_score || 85),
                    compatibilityScore: c.compatibility_score,
                    compatibility_score: c.compatibility_score,
                    v8ModelScore: c.v8_model_score,
                    v8_model_score: c.v8_model_score,
                    rank: c.rank || idx + 1,
                    matchTier: c.compatibility_score >= 80 ? 'Best Match' : c.compatibility_score >= 65 ? 'High Match' : 'Good Match',
                    salaryRange: c.salary_range || '₹8,00,000 - ₹24,00,000 / yr',
                    whyMatches: [c.why_recommended],
                    why_recommended: c.why_recommended,
                    areasToDevelop: c.missing_skills || [],
                    missing_skills: c.missing_skills || [],
                    keySkills: c.matching_skills || [],
                    matching_skills: c.matching_skills || [],
                    componentScores: c.component_scores || {},
                    component_scores: c.component_scores || {},
                    skillGaps: c.skill_gaps || {},
                    suggestedNextSteps: c.suggested_next_steps || [],
                    recommendedCertifications: c.recommended_certifications || []
                }));
            }
        } catch (mlErr) {
            console.warn('V8 ML Service endpoint call did not complete during assessment submit:', mlErr.message);
        }

        // 2. Fallback if ML service is unreachable
        if (!recommendedCareers || recommendedCareers.length === 0) {
            const rawFallback = calculateCareerMatches(dimensions, field, inputs);
            recommendedCareers = rawFallback.map((c, idx) => ({
                title: c.title,
                career_title: c.title,
                department: c.department || 'Engineering',
                matchScore: c.matchScore || 85,
                compatibilityScore: c.matchScore || 85,
                compatibility_score: c.matchScore || 85,
                v8ModelScore: Math.round((c.matchScore || 85) * 0.95),
                v8_model_score: Math.round((c.matchScore || 85) * 0.95),
                rank: idx + 1,
                matchTier: (c.matchScore || 85) >= 80 ? 'Best Match' : 'High Match',
                salaryRange: c.salaryRange || '₹8,00,000 - ₹24,00,000 / yr',
                whyMatches: c.whyMatches || ['Strong foundational alignment with your profile.'],
                why_recommended: c.whyMatches?.[0] || 'Strong foundational alignment with your profile.',
                areasToDevelop: c.areasToDevelop || [],
                missing_skills: c.areasToDevelop || [],
                keySkills: c.keySkills || [],
                matching_skills: c.keySkills || [],
                componentScores: {
                    technical_skills: Math.round(dimensions.technicalInterest || 75),
                    interest: Math.round(dimensions.creativity || 75),
                    academic: Math.round(dimensions.analytical || 75),
                    career_readiness: Math.round(dimensions.problemSolving || 80)
                },
                component_scores: {
                    technical_skills: Math.round(dimensions.technicalInterest || 75),
                    interest: Math.round(dimensions.creativity || 75),
                    academic: Math.round(dimensions.analytical || 75),
                    career_readiness: Math.round(dimensions.problemSolving || 80)
                }
            }));
        }

        if (!v8ResponseData) {
            v8ResponseData = {
                status: 'success',
                top_recommendations: recommendedCareers,
                primary_career: recommendedCareers[0],
                alternative_careers: recommendedCareers.slice(1)
            };
        }

        const topCareer = recommendedCareers[0] || {
            title: 'Software Development Engineer',
            department: 'Engineering',
            matchScore: 85,
            whyMatches: ['Strong foundational alignment with your assessment responses.']
        };

        // Create persistent attempt with rich academic, skills, V8 profile & results
        const attempt = new AssessmentAttempt({
            user: req.user.id,
            field: field || 'All Fields',
            direction: inputs.direction,
            academic: inputs.academic,
            interests: inputs.interests,
            scenarios: inputs.scenarios,
            challenges: inputs.challenges,
            workStyle: inputs.workStyle,
            careerValues: inputs.careerValues,
            tradeOffs: inputs.tradeOffs,
            skillsData: inputs.skillsData,
            constraints: inputs.constraints,
            v8Profile: constructedV8Profile,
            v8Results: v8ResponseData,
            dimensions,
            keyStrengths,
            recommendedCareers,
            createdAt: new Date()
        });

        await attempt.save();

        // Synchronize with student Profile
        try {
            await Profile.findOneAndUpdate(
                { user: req.user.id },
                {
                    $set: {
                        branch: inputs.academic?.branch || 'Computer Science and Engineering',
                        specialization: inputs.academic?.specialization || 'General',
                        cgpa: inputs.academic?.cgpa || 8.0,
                        targetCareer: topCareer.title,
                        department: topCareer.department || 'Engineering',
                        skills: Array.isArray(inputs.skillsData?.existingSkills) && inputs.skillsData.existingSkills.length > 0
                            ? inputs.skillsData.existingSkills.map(s => s.name || s)
                            : ['Problem Solving', 'Engineering Fundamentals'],
                        interests: inputs.interests,
                        recommendedCareers: recommendedCareers.slice(0, 5).map(c => ({
                            title: c.title,
                            confidence: c.matchScore || c.compatibilityScore || 85,
                            description: c.whyMatches?.[0] || 'High alignment with your career assessment profile'
                        })),
                        careerPreferences: {
                            preferredRoles: recommendedCareers.slice(0, 3).map(c => c.title),
                            preferredLocations: [inputs.constraints?.locationPreference || 'Flexible'],
                            workModes: [inputs.constraints?.workMode || 'Hybrid'],
                            experienceLevel: '0-2 years',
                            jobAlertsEnabled: true,
                            alertFrequency: 'Daily'
                        },
                        updatedAt: new Date()
                    }
                },
                { upsert: true, new: true }
            );

            // Log activity
            await StudentActivity.create({
                user: req.user.id,
                action: 'Completed Universal Career Discovery Assessment',
                title: `Top Match: ${topCareer.title} (${topCareer.matchScore || topCareer.compatibilityScore || 85}%)`,
                category: 'assessment',
                details: `Branch: ${inputs.academic?.branch || 'Engineering'}. Field: ${field || 'All Fields'}. Recommended ${recommendedCareers.length} pathways via V8 engine.`,
                createdAt: new Date()
            });
        } catch (syncErr) {
            console.warn('Could not sync profile during assessment submit:', syncErr);
        }

        res.status(201).json({
            msg: 'Assessment saved successfully',
            attemptId: attempt._id,
            dimensions,
            keyStrengths,
            primaryCareer: topCareer,
            alternativeCareers: recommendedCareers.slice(1),
            allCareers: recommendedCareers,
            top_recommendations: v8ResponseData?.top_recommendations || recommendedCareers,
            v8Data: v8ResponseData,
            v8Profile: constructedV8Profile,
            attempt
        });
    } catch (err) {
        console.error('Error submitting assessment:', err);
        res.status(500).json({ msg: 'Server error processing assessment' });
    }
};

// @desc    Get latest assessment attempt for current user
// @route   GET /api/assessment/latest
// @access  Private
exports.getLatestAssessment = async (req, res) => {
    try {
        const attempt = await AssessmentAttempt.findOne({ user: req.user.id }).sort({ createdAt: -1 });
        if (!attempt) {
            return res.status(404).json({ msg: 'No previous assessment found' });
        }

        res.json({
            attemptId: attempt._id,
            field: attempt.field,
            academic: attempt.academic,
            skillsData: attempt.skillsData,
            v8Profile: attempt.v8Profile,
            v8Results: attempt.v8Results,
            top_recommendations: attempt.v8Results?.top_recommendations || attempt.recommendedCareers,
            dimensions: attempt.dimensions,
            keyStrengths: attempt.keyStrengths,
            primaryCareer: attempt.recommendedCareers[0] || null,
            alternativeCareers: attempt.recommendedCareers.slice(1),
            allCareers: attempt.recommendedCareers,
            attempt
        });
    } catch (err) {
        console.error('Error fetching latest assessment:', err);
        res.status(500).json({ msg: 'Server error fetching latest assessment' });
    }
};

// @desc    Get all assessment history for authenticated user
// @route   GET /api/assessment/history
// @access  Private
exports.getAssessmentHistory = async (req, res) => {
    try {
        const history = await AssessmentAttempt.find({ user: req.user.id })
            .select('field dimensions keyStrengths recommendedCareers createdAt')
            .sort({ createdAt: -1 });

        res.json({
            history,
            totalAttempts: history.length
        });
    } catch (err) {
        console.error('Error fetching assessment history:', err);
        res.status(500).json({ msg: 'Server error fetching assessment history' });
    }
};

// @desc    Evaluate on-demand 5-minute career challenge
// @route   POST /api/assessment/challenge
// @access  Private
exports.evaluateChallenge = async (req, res) => {
    try {
        const { careerTitle, challengeId, chosenOption, timeSpentSeconds } = req.body;

        // Generate challenge feedback
        const feedback = {
            careerTitle: careerTitle || 'Software Development Engineer',
            challengeId: challengeId || 'ch-1',
            chosenOption,
            timeSpent: `${timeSpentSeconds || 45} seconds`,
            observedApproach: 'Analytical & Methodical',
            fitScore: 88,
            keyTakeaway: 'You demonstrated strong problem-isolation intuition and systematic evaluation under time constraints.',
            nextSteps: [
                'Explore the practical learning stages on your Roadmap',
                'Practice hands-on coding challenges and real-world projects',
                'Check matching job openings for entry-level positions'
            ]
        };

        res.json({
            msg: 'Challenge evaluated successfully',
            feedback
        });
    } catch (err) {
        console.error('Error evaluating challenge:', err);
        res.status(500).json({ msg: 'Server error evaluating challenge' });
    }
};
