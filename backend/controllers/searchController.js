const Job = require('../models/Job');
const Resource = require('../models/Resource');
const Employer = require('../models/Employer');
const fs = require('fs');
const path = require('path');

// Department & Field Taxonomies for Career Roles
const DEPARTMENT_FIELDS = {
    "Computer Science & IT": [
        "Full Stack Web Developer",
        "Software Development Engineer",
        "ML Engineer / AI Researcher",
        "Data Scientist",
        "Data Engineer",
        "Data Analyst",
        "Cybersecurity Analyst",
        "Cloud Architect / DevOps Engineer",
        "Blockchain Developer",
        "Mobile App Developer",
        "Game Developer",
        "Database Administrator",
        "Network Engineer",
        "IT Security Analyst",
        "QA / Automation Test Engineer",
        "SAP / ERP Consultant",
        "Business / Data Analyst",
        "Quantitative / Risk Analyst"
    ],
    "Electronics & Communication": [
        "VLSI Design Engineer",
        "Embedded Systems Engineer",
        "IoT Solutions Developer",
        "RF / Telecom Engineer",
        "Robotics Engineer"
    ],
    "Electrical & Power": [
        "Power Systems Engineer",
        "PLC / SCADA Automation Engineer",
        "Renewable Energy Engineer",
        "Smart Grid Engineer",
        "EV Powertrain Engineer"
    ],
    "Mechanical & Manufacturing": [
        "Automotive Design Engineer",
        "Manufacturing / Production Engineer",
        "Industrial Robotics Engineer",
        "CAD/CAM Design Engineer",
        "Thermal / HVAC Engineer",
        "Aerodynamics / CFD Engineer",
        "Propulsion / Rocket Engineer",
        "Spacecraft / Satellite Engineer",
        "Avionics Engineer"
    ],
    "Civil & Infrastructure": [
        "Structural Design Engineer",
        "Construction Project Manager",
        "Geotechnical Engineer",
        "Urban / City Planner"
    ]
};

// Helper: Levenshtein distance for typo-tolerance
function levenshteinDistance(s1, s2) {
    s1 = s1.toLowerCase();
    s2 = s2.toLowerCase();
    const costs = [];
    for (let i = 0; i <= s1.length; i++) {
        let lastValue = i;
        for (let j = 0; j <= s2.length; j++) {
            if (i === 0) {
                costs[j] = j;
            } else if (j > 0) {
                let newValue = costs[j - 1];
                if (s1.charAt(i - 1) !== s2.charAt(j - 1)) {
                    newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1;
                }
                costs[j - 1] = lastValue;
                lastValue = newValue;
            }
        }
        if (i > 0) costs[s2.length] = lastValue;
    }
    return costs[s2.length];
}

// Helper: Calculate text relevance score (0 - 100)
function calculateScore(targetText, query, tokens) {
    if (!targetText || !query) return 0;
    const text = targetText.toLowerCase().trim();
    const q = query.toLowerCase().trim();

    // 1. Exact match
    if (text === q) return 100;

    // 2. Starts with query
    if (text.startsWith(q)) return 90;

    // 3. Word boundary starts with (e.g. "Data Engineer" for "eng")
    const words = text.split(/[\s\-_\/]+/);
    if (words.some(w => w.startsWith(q))) return 80;

    // 4. Substring containment
    if (text.includes(q)) return 70;

    // 5. Multi-token match (all query words present in target)
    if (tokens.length > 1) {
        const allTokensPresent = tokens.every(tok => text.includes(tok));
        if (allTokensPresent) return 65;
        const someTokensPresent = tokens.filter(tok => text.includes(tok)).length;
        if (someTokensPresent > 0) return 40 + (someTokensPresent / tokens.length) * 20;
    }

    // 6. Typo / Fuzzy match for short tokens
    if (q.length >= 3) {
        for (const w of words) {
            if (Math.abs(w.length - q.length) <= 2) {
                const dist = levenshteinDistance(w, q);
                if (dist === 1) return 55;
                if (dist === 2 && q.length >= 5) return 45;
            }
        }
    }

    return 0;
}

// Load Skills Taxonomy Safely
let cachedSkills = null;
function getTaxonomySkills() {
    if (cachedSkills) return cachedSkills;
    const skillsSet = new Map();
    try {
        const requiredSkillsPath = path.join(__dirname, '../../ml-service/required_skills.json');
        if (fs.existsSync(requiredSkillsPath)) {
            const data = JSON.parse(fs.readFileSync(requiredSkillsPath, 'utf8'));
            for (const [career, skillsObj] of Object.entries(data)) {
                for (const [skillName, meta] of Object.entries(skillsObj)) {
                    if (!skillsSet.has(skillName.toLowerCase())) {
                        skillsSet.set(skillName.toLowerCase(), {
                            name: skillName,
                            category: meta.category || 'Core Skill',
                            career: career
                        });
                    }
                }
            }
        }
    } catch (e) {
        console.error('Error loading taxonomy skills:', e);
    }
    cachedSkills = Array.from(skillsSet.values());
    return cachedSkills;
}

// @desc    Fast, relevance-ranked global search suggestions (Dropdown API)
// @route   GET /api/search/suggestions?q=...
// @access  Public
exports.getSearchSuggestions = async (req, res) => {
    try {
        const query = (req.query.q || req.query.query || '').trim();
        if (!query || query.length === 0) {
            return res.json({
                query: '',
                totalResults: 0,
                categories: {
                    careers: [],
                    jobs: [],
                    skills: [],
                    courses: [],
                    companies: []
                }
            });
        }

        const tokens = query.toLowerCase().split(/\s+/).filter(Boolean);
        const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const searchRegex = new RegExp(escapeRegex(query), 'i');

        // 1. Search Career Roles (from taxonomy)
        const careerMatches = [];
        for (const [dept, roles] of Object.entries(DEPARTMENT_FIELDS)) {
            for (const role of roles) {
                const score = calculateScore(role, query, tokens);
                if (score > 0) {
                    careerMatches.push({
                        title: role,
                        department: dept,
                        type: 'career',
                        url: `/roadmap?field=${encodeURIComponent(role)}`,
                        score
                    });
                }
            }
        }
        careerMatches.sort((a, b) => b.score - a.score);

        // 2. Search Active Public Jobs (from DB)
        const dbJobs = await Job.find({
            status: 'Active',
            $or: [
                { title: searchRegex },
                { companyName: searchRegex },
                { skills: searchRegex },
                { department: searchRegex },
                { location: searchRegex }
            ]
        })
            .select('title companyName location salary type workMode skills department')
            .limit(20);

        const jobMatches = dbJobs.map(job => {
            const titleScore = calculateScore(job.title, query, tokens);
            const companyScore = calculateScore(job.companyName, query, tokens);
            const skillScore = Math.max(...(job.skills || []).map(s => calculateScore(s, query, tokens)), 0);
            const maxScore = Math.max(titleScore * 1.0, companyScore * 0.9, skillScore * 0.85);

            return {
                id: job._id,
                title: job.title,
                companyName: job.companyName,
                location: job.location,
                salary: job.salary,
                type: job.type,
                workMode: job.workMode,
                skills: job.skills.slice(0, 4),
                department: job.department,
                url: `/jobs?search=${encodeURIComponent(job.title)}`,
                score: maxScore
            };
        }).filter(j => j.score > 0);
        jobMatches.sort((a, b) => b.score - a.score);

        // 3. Search Verified Courses / Learning Resources (from DB)
        const dbResources = await Resource.find({
            $or: [
                { title: searchRegex },
                { skill: searchRegex },
                { provider: searchRegex },
                { career: searchRegex },
                { department: searchRegex }
            ]
        })
            .select('title provider skill resourceType duration isFree rating url')
            .limit(20);

        const courseMatches = dbResources.map(resItem => {
            const titleScore = calculateScore(resItem.title, query, tokens);
            const skillScore = calculateScore(resItem.skill, query, tokens);
            const providerScore = calculateScore(resItem.provider, query, tokens);
            const maxScore = Math.max(titleScore * 1.0, skillScore * 0.9, providerScore * 0.7);

            return {
                id: resItem._id,
                title: resItem.title,
                provider: resItem.provider,
                skill: resItem.skill,
                resourceType: resItem.resourceType,
                duration: resItem.duration,
                isFree: resItem.isFree,
                rating: resItem.rating,
                url: `/courses?search=${encodeURIComponent(resItem.title)}`,
                score: maxScore
            };
        }).filter(c => c.score > 0);
        courseMatches.sort((a, b) => b.score - a.score);

        // 4. Search Distinct Skills (from DB + Taxonomy)
        const taxonomySkills = getTaxonomySkills();
        const skillMatches = [];
        const seenSkillNames = new Set();

        for (const sk of taxonomySkills) {
            const score = calculateScore(sk.name, query, tokens);
            if (score > 0 && !seenSkillNames.has(sk.name.toLowerCase())) {
                seenSkillNames.add(sk.name.toLowerCase());
                skillMatches.push({
                    name: sk.name,
                    category: sk.category,
                    careerContext: sk.career,
                    url: `/courses?skill=${encodeURIComponent(sk.name)}`,
                    score
                });
            }
        }
        skillMatches.sort((a, b) => b.score - a.score);

        // 5. Search Real Companies (from Employers + Active Jobs)
        const dbEmployers = await Employer.find({
            companyName: searchRegex
        }).select('companyName industry companySize location companyWebsite').limit(10);

        const distinctJobCompanies = await Job.distinct('companyName', {
            status: 'Active',
            companyName: searchRegex
        });

        const companyMatches = [];
        const seenCompanyNames = new Set();

        for (const emp of dbEmployers) {
            if (emp.companyName && !seenCompanyNames.has(emp.companyName.toLowerCase())) {
                seenCompanyNames.add(emp.companyName.toLowerCase());
                const score = calculateScore(emp.companyName, query, tokens);
                companyMatches.push({
                    name: emp.companyName,
                    industry: emp.industry,
                    size: emp.companySize,
                    url: `/jobs?search=${encodeURIComponent(emp.companyName)}`,
                    score
                });
            }
        }

        for (const compName of distinctJobCompanies) {
            if (compName && !seenCompanyNames.has(compName.toLowerCase())) {
                seenCompanyNames.add(compName.toLowerCase());
                const score = calculateScore(compName, query, tokens);
                companyMatches.push({
                    name: compName,
                    industry: 'Technology & Services',
                    url: `/jobs?search=${encodeURIComponent(compName)}`,
                    score
                });
            }
        }
        companyMatches.sort((a, b) => b.score - a.score);

        const totalResults =
            careerMatches.length +
            jobMatches.length +
            courseMatches.length +
            skillMatches.length +
            companyMatches.length;

        res.json({
            query,
            totalResults,
            categories: {
                careers: careerMatches.slice(0, 3),
                jobs: jobMatches.slice(0, 4),
                skills: skillMatches.slice(0, 4),
                courses: courseMatches.slice(0, 3),
                companies: companyMatches.slice(0, 3)
            }
        });
    } catch (err) {
        console.error('Error in getSearchSuggestions:', err);
        res.status(500).json({ msg: 'Server error generating suggestions' });
    }
};

// @desc    Full multi-category global search with filtering and pagination
// @route   GET /api/search
// @access  Public
exports.performGlobalSearch = async (req, res) => {
    try {
        const {
            q = '',
            category = 'all',
            location = '',
            workMode = '',
            type = '',
            experience = '',
            department = '',
            page = 1,
            limit = 20
        } = req.query;

        const query = q.trim();
        const tokens = query.toLowerCase().split(/\s+/).filter(Boolean);
        const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const searchRegex = query ? new RegExp(escapeRegex(query), 'i') : /.*/;

        const results = {
            query,
            category,
            total: 0,
            jobs: [],
            courses: [],
            skills: [],
            companies: [],
            careers: [],
            counts: {
                all: 0,
                jobs: 0,
                courses: 0,
                skills: 0,
                companies: 0,
                careers: 0
            }
        };

        // 1. Search Jobs
        if (category === 'all' || category === 'jobs') {
            const jobFilter = { status: 'Active' };
            if (query) {
                jobFilter.$or = [
                    { title: searchRegex },
                    { companyName: searchRegex },
                    { skills: searchRegex },
                    { department: searchRegex },
                    { description: searchRegex }
                ];
            }
            if (location) jobFilter.location = new RegExp(escapeRegex(location), 'i');
            if (workMode && workMode !== 'All') jobFilter.workMode = new RegExp(escapeRegex(workMode), 'i');
            if (type && type !== 'All') jobFilter.type = new RegExp(escapeRegex(type), 'i');
            if (experience && experience !== 'All') jobFilter.experience = new RegExp(escapeRegex(experience), 'i');
            if (department && department !== 'All') jobFilter.department = new RegExp(escapeRegex(department), 'i');

            const allMatchingJobs = await Job.find(jobFilter).sort({ createdAt: -1 });
            const scoredJobs = allMatchingJobs.map(job => {
                const score = query ? calculateScore(job.title, query, tokens) : 50;
                return {
                    _id: job._id,
                    title: job.title,
                    companyName: job.companyName,
                    department: job.department,
                    location: job.location,
                    type: job.type,
                    workMode: job.workMode,
                    experience: job.experience,
                    salary: job.salary,
                    skills: job.skills,
                    description: job.description,
                    responsibilities: job.responsibilities,
                    benefits: job.benefits,
                    isUrgent: job.isUrgent,
                    createdAt: job.createdAt,
                    score
                };
            });
            if (query) scoredJobs.sort((a, b) => b.score - a.score);
            results.jobs = scoredJobs;
            results.counts.jobs = scoredJobs.length;
        }

        // 2. Search Courses / Resources
        if (category === 'all' || category === 'courses') {
            const resourceFilter = {};
            if (query) {
                resourceFilter.$or = [
                    { title: searchRegex },
                    { skill: searchRegex },
                    { provider: searchRegex },
                    { career: searchRegex },
                    { department: searchRegex },
                    { description: searchRegex }
                ];
            }
            const allMatchingResources = await Resource.find(resourceFilter);
            const scoredCourses = allMatchingResources.map(resItem => {
                const score = query ? calculateScore(resItem.title, query, tokens) : 50;
                return {
                    _id: resItem._id,
                    title: resItem.title,
                    provider: resItem.provider,
                    description: resItem.description,
                    url: resItem.url,
                    resourceType: resItem.resourceType,
                    skill: resItem.skill,
                    career: resItem.career,
                    department: resItem.department,
                    difficulty: resItem.difficulty,
                    duration: resItem.duration,
                    isFree: resItem.isFree,
                    rating: resItem.rating,
                    score
                };
            });
            if (query) scoredCourses.sort((a, b) => b.score - a.score);
            results.courses = scoredCourses;
            results.counts.courses = scoredCourses.length;
        }

        // 3. Search Skills
        if (category === 'all' || category === 'skills') {
            const taxonomySkills = getTaxonomySkills();
            const scoredSkills = [];
            for (const sk of taxonomySkills) {
                const score = query ? calculateScore(sk.name, query, tokens) : 50;
                if (!query || score > 0) {
                    scoredSkills.push({
                        name: sk.name,
                        category: sk.category,
                        careerContext: sk.career,
                        score
                    });
                }
            }
            if (query) scoredSkills.sort((a, b) => b.score - a.score);
            results.skills = scoredSkills;
            results.counts.skills = scoredSkills.length;
        }

        // 4. Search Companies
        if (category === 'all' || category === 'companies') {
            const employerFilter = query ? { companyName: searchRegex } : {};
            const dbEmployers = await Employer.find(employerFilter).select('companyName industry companySize location companyWebsite aboutCompany');
            const distinctJobCompanies = await Job.distinct('companyName', { status: 'Active', ...(query ? { companyName: searchRegex } : {}) });

            const seen = new Set();
            const companyList = [];

            for (const emp of dbEmployers) {
                if (emp.companyName && !seen.has(emp.companyName.toLowerCase())) {
                    seen.add(emp.companyName.toLowerCase());
                    const activeJobsCount = await Job.countDocuments({ companyName: emp.companyName, status: 'Active' });
                    const score = query ? calculateScore(emp.companyName, query, tokens) : 50;
                    companyList.push({
                        _id: emp._id,
                        name: emp.companyName,
                        industry: emp.industry || 'Information Technology',
                        size: emp.companySize || '100+',
                        location: emp.location || 'India',
                        website: emp.companyWebsite || emp.website,
                        description: emp.aboutCompany || emp.description,
                        activeJobsCount,
                        score
                    });
                }
            }

            for (const compName of distinctJobCompanies) {
                if (compName && !seen.has(compName.toLowerCase())) {
                    seen.add(compName.toLowerCase());
                    const activeJobsCount = await Job.countDocuments({ companyName: compName, status: 'Active' });
                    const score = query ? calculateScore(compName, query, tokens) : 50;
                    companyList.push({
                        name: compName,
                        industry: 'Technology & Software',
                        size: '500+',
                        location: 'Multiple Locations',
                        activeJobsCount,
                        score
                    });
                }
            }

            if (query) companyList.sort((a, b) => b.score - a.score);
            results.companies = companyList;
            results.counts.companies = companyList.length;
        }

        // 5. Search Career Roles
        if (category === 'all' || category === 'careers') {
            const scoredCareers = [];
            for (const [dept, roles] of Object.entries(DEPARTMENT_FIELDS)) {
                for (const role of roles) {
                    const score = query ? calculateScore(role, query, tokens) : 50;
                    if (!query || score > 0) {
                        scoredCareers.push({
                            title: role,
                            department: dept,
                            score
                        });
                    }
                }
            }
            if (query) scoredCareers.sort((a, b) => b.score - a.score);
            results.careers = scoredCareers;
            results.counts.careers = scoredCareers.length;
        }

        results.counts.all =
            results.counts.jobs +
            results.counts.courses +
            results.counts.skills +
            results.counts.companies +
            results.counts.careers;

        results.total = results.counts.all;
        res.json(results);
    } catch (err) {
        console.error('Error in performGlobalSearch:', err);
        res.status(500).json({ msg: 'Server error performing global search' });
    }
};

// @desc    Get real location autocomplete suggestions from active jobs
// @route   GET /api/search/locations?q=...
// @access  Public
exports.getLocationSuggestions = async (req, res) => {
    try {
        const q = (req.query.q || req.query.query || '').trim();
        const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const filter = { status: 'Active' };
        if (q) {
            filter.location = new RegExp(escapeRegex(q), 'i');
        }

        const distinctLocations = await Job.distinct('location', filter);
        const popularLocations = [
            'Bangalore, Karnataka',
            'Hyderabad, Telangana',
            'Mumbai, Maharashtra',
            'Pune, Maharashtra',
            'Gurgaon, Haryana',
            'Delhi NCR',
            'Chennai, Tamil Nadu',
            'Remote',
            'Hybrid'
        ];

        // Combine DB locations with popular locations uniquely
        const allLocations = Array.from(new Set([...distinctLocations, ...popularLocations]));
        const filtered = q
            ? allLocations.filter(loc => loc.toLowerCase().includes(q.toLowerCase()))
            : allLocations;

        res.json({ locations: filtered.slice(0, 10) });
    } catch (err) {
        console.error('Error in getLocationSuggestions:', err);
        res.status(500).json({ msg: 'Server error retrieving locations' });
    }
};
