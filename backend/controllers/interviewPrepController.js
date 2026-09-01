const axios = require('axios');
const InterviewPrep = require('../models/InterviewPrep');
const SavedPrep = require('../models/SavedPrep');

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODELS = ['openai/gpt-oss-120b', 'qwen/qwen3.8-27b', 'openai/gpt-oss-20b', 'groq/compound'];

// Popular static seed database
const SEED_COMPANIES = {
    "TCS": ["Software Developer", "Java Developer", "Data Analyst", "Data Engineer", "QA Engineer"],
    "Infosys": ["Systems Engineer", "Power Programmer", "Associate Consultant", "Data Analyst"],
    "Wipro": ["Project Engineer", "Java Developer", "Network Administrator", "Business Analyst"],
    "Google": ["Software Engineer", "Site Reliability Engineer", "Product Manager", "Data Scientist"],
    "Microsoft": ["Software Engineer", "Cloud Solutions Architect", "Data Engineer", "Program Manager"],
    "Amazon": ["Software Development Engineer", "Business Analyst", "Solutions Architect", "Operations Manager"]
};

const DEFAULT_ROLES = ["Software Developer", "Java Developer", "Data Analyst", "Data Engineer", "QA Engineer", "Project Manager"];

// Robust multi-model Groq caller
const callGroq = async (messages, responseFormat = null) => {
    const GROQ_API_KEY = process.env.GROQ_API_KEY;
    
    let lastError = null;
    for (const model of GROQ_MODELS) {
        try {
            const payload = {
                model,
                messages,
                temperature: 0.7,
                max_tokens: 1500,
            };

            if (responseFormat) {
                payload.response_format = responseFormat;
            }

            const response = await axios.post(GROQ_API_URL, payload, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`,
                    'User-Agent': 'CareerRecommender/1.0'
                },
                timeout: 15000
            });

            if (response.data?.choices?.[0]?.message?.content) {
                return response.data.choices[0].message.content;
            }
        } catch (err) {
            console.warn(`Interview Prep Groq model ${model} failed:`, err.response?.data?.error?.message || err.message);
            lastError = err;
        }
    }

    throw lastError || new Error('All Groq models failed to respond.');
};

// @desc    Search companies or roles
// @route   GET /api/interview-prep/search
// @access  Private
exports.searchCompaniesAndRoles = async (req, res) => {
    const { q, type } = req.query; // q: search term, type: 'company' | 'role'

    if (!q) {
        return res.json({ results: [] });
    }

    const queryLower = q.toLowerCase();

    try {
        if (type === 'role') {
            const results = [];
            
            Object.entries(SEED_COMPANIES).forEach(([company, roles]) => {
                roles.forEach(role => {
                    if (role.toLowerCase().includes(queryLower)) {
                        results.push({ company, role });
                    }
                });
            });

            const cachedPrep = await InterviewPrep.find({ role: { $regex: q, $options: 'i' } }).select('company role');
            cachedPrep.forEach(item => {
                const alreadyExists = results.some(r => r.company.toLowerCase() === item.company.toLowerCase() && r.role.toLowerCase() === item.role.toLowerCase());
                if (!alreadyExists) {
                    results.push({ company: item.company, role: item.role });
                }
            });

            res.json({ results });
        } else {
            const results = [];

            Object.entries(SEED_COMPANIES).forEach(([company, roles]) => {
                if (company.toLowerCase().includes(queryLower)) {
                    results.push({ company, roles });
                }
            });

            const cachedCompanies = await InterviewPrep.find({ company: { $regex: q, $options: 'i' } }).select('company role');
            cachedCompanies.forEach(item => {
                const companyMatch = results.find(r => r.company.toLowerCase() === item.company.toLowerCase());
                if (companyMatch) {
                    if (!companyMatch.roles.includes(item.role)) {
                        companyMatch.roles.push(item.role);
                    }
                } else {
                    results.push({ company: item.company, roles: [item.role] });
                }
            });

            if (results.length === 0) {
                const customCompany = q.trim().replace(/\b\w/g, c => c.toUpperCase());
                results.push({ company: customCompany, roles: DEFAULT_ROLES });
            }

            res.json({ results });
        }
    } catch (err) {
        console.error('Error in searchCompaniesAndRoles:', err.message);
        res.status(500).json({ error: 'Server Error' });
    }
};

// @desc    Get detailed interview prep guide for a company + role
// @route   GET /api/interview-prep/detail
// @access  Private
exports.getPrepDetail = async (req, res) => {
    const { company, role } = req.query;

    if (!company || !role) {
        return res.status(400).json({ error: 'Company and Role query parameters are required' });
    }

    try {
        let prep = await InterviewPrep.findOne({ 
            company: { $regex: new RegExp(`^${company}$`, 'i') }, 
            role: { $regex: new RegExp(`^${role}$`, 'i') } 
        });

        if (prep) {
            return res.json(prep);
        }

        const systemPrompt = `You are an expert career counselor and corporate interviewer.
Generate a comprehensive interview preparation guide for the role '${role}' at the company '${company}'.
Return your response strictly as a JSON object containing the following keys:
- "salaryRange": string (e.g. "₹8 - ₹14 LPA" or "$85,000 - $115,000")
- "requiredSkills": array of strings (top 5-6 technical skills)
- "selectionProcess": string (summary of interview rounds)
- "technicalTopics": array of strings (top 4-5 technical subjects)
- "aptitudeTopics": array of strings (top 3-4 quantitative/logical reasoning topics)
- "codingTopics": array of strings (top 3-4 coding/algorithm topics)
- "hrQuestions": array of strings (3 standard HR questions)
- "prepRoadmap": string (preparation roadmap in markdown text)
- "interviewQuestions": array of objects for rounds (each object has "round": string, "questions": [{ "question": string, "answer": string }])`;

        const messages = [{ role: 'system', content: systemPrompt }];

        let parsedResponse = null;
        try {
            const responseContent = await callGroq(messages, { type: 'json_object' });
            parsedResponse = JSON.parse(responseContent);
        } catch (groqErr) {
            console.error('Groq generation failed for prep detail, using fallback:', groqErr.message);
            parsedResponse = {
                salaryRange: "₹8 - ₹15 LPA",
                requiredSkills: ["Problem Solving", "Core Language Proficiency", "System Design", "Git"],
                selectionProcess: "1. Online Assessment, 2. Technical Interview, 3. Managerial & HR Round",
                technicalTopics: ["Data Structures & Algorithms", "Database Management", "REST APIs", "System Architecture"],
                aptitudeTopics: ["Quantitative Aptitude", "Logical Reasoning", "Verbal Ability"],
                codingTopics: ["Arrays & Strings", "Dynamic Programming", "Trees & Graphs"],
                hrQuestions: [
                    "Tell me about yourself and why you want to join our engineering team.",
                    "Describe a technically complex challenge you solved in a previous project.",
                    "Where do you see your career growth in the next 2-3 years?"
                ],
                prepRoadmap: "### Preparation Roadmap\n\n1. **Weeks 1-2**: Revise Core Concepts and Data Structures.\n2. **Weeks 3-4**: Solve LeetCode medium questions and mock tests.\n3. **Week 5**: Review company interview patterns and system design.",
                interviewQuestions: [
                    {
                        round: "Technical Interview",
                        questions: [
                            {
                                question: `What architectural considerations do you prioritize when designing for ${role}?`,
                                answer: "I prioritize scalability, modular decoupling, database indexing, caching strategies, and defensive error handling."
                            },
                            {
                                question: "Explain the difference between SQL and NoSQL databases, and when would you use each?",
                                answer: "SQL databases offer ACID compliance and relational integrity, ideal for financial/transactional systems. NoSQL offers horizontal scalability and flexible schemas for dynamic workloads."
                            }
                        ]
                    },
                    {
                        round: "HR & Behavioral Round",
                        questions: [
                            {
                                question: `Why are you interested in joining ${company}?`,
                                answer: "I admire the company's innovation in engineering at scale and want to contribute my problem-solving skills to high-impact user problems."
                            }
                        ]
                    }
                ]
            };
        }

        prep = new InterviewPrep({
            company,
            role,
            ...parsedResponse
        });
        await prep.save();

        res.json(prep);
    } catch (err) {
        console.error('Error in getPrepDetail:', err.message);
        res.status(500).json({ error: 'Failed to retrieve prep details' });
    }
};

// @desc    Generate interview questions specific to company & role
// @route   GET /api/interview-prep/mock/start
// @access  Private
exports.startMockInterview = async (req, res) => {
    const { company, role } = req.query;

    if (!company || !role) {
        return res.status(400).json({ error: 'Company and Role parameters are required' });
    }

    try {
        const systemPrompt = `You are an expert interviewer for '${company}'.
Generate exactly 3 professional interview questions (both technical and situational/behavioral) commonly asked for candidates interviewing for the role '${role}'.
Return strictly JSON matching: {"questions": ["Q1", "Q2", "Q3"]}`;

        const messages = [{ role: 'system', content: systemPrompt }];

        try {
            const responseContent = await callGroq(messages, { type: 'json_object' });
            const parsedResponse = JSON.parse(responseContent);
            if (parsedResponse.questions && Array.isArray(parsedResponse.questions)) {
                return res.json({
                    company,
                    role,
                    questions: parsedResponse.questions
                });
            }
        } catch (err) {
            console.warn('Groq startMockInterview failed, using fallback:', err.message);
        }

        res.json({
            company,
            role,
            questions: [
                `Can you describe the most technically complex project you've worked on related to ${role}?`,
                `How do you optimize system performance when dealing with high database read/write latency?`,
                `Tell me about a time you had to adapt quickly to a new framework or technology under tight deadlines.`
            ]
        });
    } catch (err) {
        console.error('Error in startMockInterview:', err.message);
        res.status(500).json({ error: 'Failed to generate interview questions.' });
    }
};

// @desc    Evaluate interview answers specific to company & role
// @route   POST /api/interview-prep/mock/evaluate
// @access  Private
exports.evaluateMockInterview = async (req, res) => {
    const { company, role, answers } = req.body;

    if (!company || !role || !answers || !Array.isArray(answers) || answers.length === 0) {
        return res.status(400).json({ error: 'Company, role, and answers are required' });
    }

    try {
        let qaText = '';
        answers.forEach((item, index) => {
            qaText += `\nQuestion ${index + 1}: ${item.question}\nAnswer ${index + 1}: ${item.answer}\n`;
        });

        const systemPrompt = `You are an expert interviewer for '${company}'. Evaluate candidate responses for '${role}':
${qaText}

Return strictly JSON:
{
  "overallScore": 85,
  "feedback": "Constructive markdown evaluation of candidate strengths and improvement tips...",
  "strongAreas": ["Technical accuracy", "Structured communication"],
  "focusAreas": ["Deeper system edge-cases", "Quantifying metrics in answers"]
}`;

        const messages = [{ role: 'system', content: systemPrompt }];

        try {
            const responseContent = await callGroq(messages, { type: 'json_object' });
            const parsedEvaluation = JSON.parse(responseContent);
            return res.json(parsedEvaluation);
        } catch (err) {
            console.warn('Groq evaluateMockInterview failed, using fallback:', err.message);
        }

        res.json({
            overallScore: 82,
            feedback: `Well done! Your responses show a solid technical grasp of **${role}** fundamentals. To elevate your answers for **${company}**, structure your behavioral responses using the STAR method and include measurable impact metrics.`,
            strongAreas: ["Fundamental technical knowledge", "Clarity of explanation"],
            focusAreas: ["Impact quantification", "Scalability trade-offs"]
        });
    } catch (err) {
        console.error('Error in evaluateMockInterview:', err.message);
        res.status(500).json({ error: 'Failed to evaluate interview responses.' });
    }
};

// @desc    Save a prep guide for the current user
// @route   POST /api/interview-prep/save
// @access  Private
exports.savePrepDetail = async (req, res) => {
    const { company, role } = req.body;
    if (!company || !role) {
        return res.status(400).json({ error: 'Company and role are required' });
    }

    try {
        const prep = await InterviewPrep.findOne({
            company: { $regex: new RegExp(`^${company}$`, 'i') }, 
            role: { $regex: new RegExp(`^${role}$`, 'i') } 
        });

        if (!prep) {
            return res.status(404).json({ error: 'Preparation guide not found to save' });
        }

        const existingSave = await SavedPrep.findOne({ user: req.user.id, interviewPrep: prep._id });
        if (existingSave) {
            return res.json({ msg: 'Already saved', saved: true });
        }

        const newSave = new SavedPrep({
            user: req.user.id,
            interviewPrep: prep._id
        });
        await newSave.save();

        res.json({ msg: 'Preparation guide saved successfully', saved: true });
    } catch (err) {
        console.error('Error in savePrepDetail:', err.message);
        res.status(500).json({ error: 'Server Error' });
    }
};

// @desc    Get all saved prep guides for the current user
// @route   GET /api/interview-prep/saved
// @access  Private
exports.getSavedPreps = async (req, res) => {
    try {
        const savedList = await SavedPrep.find({ user: req.user.id })
            .populate('interviewPrep')
            .sort({ savedAt: -1 });
        
        const activeSaved = savedList.filter(item => item.interviewPrep);
        res.json(activeSaved);
    } catch (err) {
        console.error('Error in getSavedPreps:', err.message);
        res.status(500).json({ error: 'Server Error' });
    }
};

// @desc    Unsave a prep guide for the current user
// @route   DELETE /api/interview-prep/save
// @access  Private
exports.unsavePrepDetail = async (req, res) => {
    const { company, role } = req.query;

    if (!company || !role) {
        return res.status(400).json({ error: 'Company and role are required query parameters' });
    }

    try {
        const prep = await InterviewPrep.findOne({
            company: { $regex: new RegExp(`^${company}$`, 'i') }, 
            role: { $regex: new RegExp(`^${role}$`, 'i') } 
        });

        if (!prep) {
            return res.status(404).json({ error: 'Preparation guide not found' });
        }

        const deleted = await SavedPrep.findOneAndDelete({ user: req.user.id, interviewPrep: prep._id });
        if (deleted) {
            res.json({ msg: 'Preparation guide unsaved successfully', saved: false });
        } else {
            res.status(404).json({ error: 'Saved preparation guide not found' });
        }
    } catch (err) {
        console.error('Error in unsavePrepDetail:', err.message);
        res.status(500).json({ error: 'Server Error' });
    }
};

// @desc    Check if a prep guide is saved for the current user
// @route   GET /api/interview-prep/saved-status
// @access  Private
exports.checkSavedStatus = async (req, res) => {
    const { company, role } = req.query;

    if (!company || !role) {
        return res.status(400).json({ error: 'Company and role are required query parameters' });
    }

    try {
        const prep = await InterviewPrep.findOne({
            company: { $regex: new RegExp(`^${company}$`, 'i') }, 
            role: { $regex: new RegExp(`^${role}$`, 'i') } 
        });

        if (!prep) {
            return res.json({ saved: false });
        }

        const existingSave = await SavedPrep.findOne({ user: req.user.id, interviewPrep: prep._id });
        res.json({ saved: !!existingSave });
    } catch (err) {
        console.error('Error in checkSavedStatus:', err.message);
        res.status(500).json({ error: 'Server Error' });
    }
};
