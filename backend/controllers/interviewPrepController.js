const axios = require('axios');
const InterviewPrep = require('../models/InterviewPrep');
const SavedPrep = require('../models/SavedPrep');

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

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

// Helper to make Groq API calls
const callGroq = async (messages, responseFormat = null) => {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
        throw new Error('GROQ_API_KEY is not set in backend env variables.');
    }

    const payload = {
        model: 'llama-3.3-70b-versatile',
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
            'Authorization': `Bearer ${apiKey}`
        }
    });

    return response.data.choices[0].message.content;
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
            // Find companies that provide a role matching query
            const results = [];
            
            // Search static seed
            Object.entries(SEED_COMPANIES).forEach(([company, roles]) => {
                roles.forEach(role => {
                    if (role.toLowerCase().includes(queryLower)) {
                        results.push({ company, role });
                    }
                });
            });

            // Also search database for cached guides matching the role
            const cachedPrep = await InterviewPrep.find({ role: { $regex: q, $options: 'i' } }).select('company role');
            cachedPrep.forEach(item => {
                const alreadyExists = results.some(r => r.company.toLowerCase() === item.company.toLowerCase() && r.role.toLowerCase() === item.role.toLowerCase());
                if (!alreadyExists) {
                    results.push({ company: item.company, role: item.role });
                }
            });

            res.json({ results });
        } else {
            // Default to company search
            const results = [];

            // Search static seed
            Object.entries(SEED_COMPANIES).forEach(([company, roles]) => {
                if (company.toLowerCase().includes(queryLower)) {
                    results.push({ company, roles });
                }
            });

            // Also search database for cached company names
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

            // If no match in seed or database, allow search on custom company name by offering default roles
            if (results.length === 0) {
                // Return custom company name as capitalised
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
        // Look up database first
        let prep = await InterviewPrep.findOne({ 
            company: { $regex: new RegExp(`^${company}$`, 'i') }, 
            role: { $regex: new RegExp(`^${role}$`, 'i') } 
        });

        if (prep) {
            return res.json(prep);
        }

        // Generate dynamically using Groq LLM
        const systemPrompt = `You are an expert career counselor and corporate interviewer.
Generate a comprehensive interview preparation guide for the role '${role}' at the company '${company}'.
Return your response strictly as a JSON object containing the following keys (do not wrap in markdown or include extra text):
- "salaryRange": string (estimated yearly/monthly range in local currency or USD, e.g. "₹6 - ₹10 LPA" or "$70,000 - $95,000")
- "requiredSkills": array of strings (top 5-6 technical skills required)
- "selectionProcess": string (a short summary of the interview rounds, e.g., "1. Online Test, 2. Technical Interview, 3. HR Round")
- "technicalTopics": array of strings (top 4-5 technical subjects to prepare, e.g., "SQL", "OOPs")
- "aptitudeTopics": array of strings (top 3-4 quantitative/logical reasoning topics)
- "codingTopics": array of strings (top 3-4 coding/algorithm topics, e.g., "Strings", "Trees")
- "hrQuestions": array of strings (3 standard HR questions for this company)
- "prepRoadmap": string (a concise preparation roadmap in markdown text)
- "interviewQuestions": array of objects representing different rounds of the interview process (typically 3 to 4 rounds depending on the company, e.g., "Online Assessment", "Technical Interview Round 1", "Technical Interview Round 2", "HR & Behavioral Round"). Each object must have:
  - "round": string (name of the round)
  - "questions": array of objects, each containing:
    - "question": string (common interview question for this round)
    - "answer": string (model professional answer for the question)
  Provide at least 2 common questions with model answers per round.

Do not include any extra text outside the JSON object. Ensure it is valid JSON.`;

        const messages = [
            { role: 'system', content: systemPrompt }
        ];

        let parsedResponse = null;
        try {
            const responseContent = await callGroq(messages, { type: 'json_object' });
            parsedResponse = JSON.parse(responseContent);
        } catch (groqErr) {
            console.error('Groq generation failed for prep detail, using fallback:', groqErr.message);
            // Construct fallback guide with round-grouped questions (increased questions)
            parsedResponse = {
                salaryRange: "Competitive Market Standard",
                requiredSkills: ["Problem Solving", "Core Language Proficiency", "Git"],
                selectionProcess: "1. Online Aptitude Test, 2. Technical Interview, 3. HR Evaluation",
                technicalTopics: ["Core Engineering Fundamentals", "Database Basics", "System Design"],
                aptitudeTopics: ["Quantitative Aptitude", "Logical Reasoning", "Verbal Ability"],
                codingTopics: ["Arrays & Strings", "Data Structures", "Algorithms"],
                hrQuestions: [
                    "Tell me about yourself.",
                    "Why do you want to join this company?",
                    "What are your strengths and weaknesses?"
                ],
                prepRoadmap: "### Preparation Roadmap\n\n1. **Weeks 1-2**: Revise Core Concepts and Data Structures.\n2. **Weeks 3-4**: Solve common coding questions and practice mock tests.\n3. **Week 5**: Prepare behavioral questions and review company profile.",
                interviewQuestions: [
                    {
                        round: "Technical Interview",
                        questions: [
                            {
                                question: "Explain the memory management model in your preferred programming language.",
                                answer: "Memory management varies by language. For example, Java/Python use automatic garbage collection to free unreferenced memory, whereas languages like C++ require manual memory management using new/delete. Understanding stack vs heap allocation is critical."
                            },
                            {
                                question: "Explain a technical challenge you faced in a project and how you resolved it.",
                                answer: "I worked on a web project where database query speeds were slow. I diagnosed the issue and solved it by implementing indexing and caching, improving response time by 40%."
                            },
                            {
                                question: "What is the difference between a SQL and NoSQL database, and when would you use each?",
                                answer: "SQL databases are relational, table-based, and have predefined schemas, making them ideal for complex queries and transactional consistency. NoSQL databases are non-relational, document-based, and have dynamic schemas, making them ideal for unstructured data and horizontal scaling."
                            }
                        ]
                    },
                    {
                        round: "HR & Behavioral Round",
                        questions: [
                            {
                                question: `Why do you think you are a good fit for the ${role} position at ${company}?`,
                                answer: "I have strong fundamental skills relevant to the role requirements and have completed projects demonstrating my abilities. I also align with the corporate values, work ethic, and culture of continuous improvement."
                            },
                            {
                                question: "Describe a time you had a conflict with a team member. How did you handle it?",
                                answer: "In a group project, we had different opinions on technology choices. I arranged a meeting, listed out the pros and cons of both approaches objectively, and we agreed on a hybrid solution, maintaining a positive team dynamic."
                            }
                        ]
                    }
                ]
            };
        }

        // Cache the result in MongoDB
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
Return your response strictly as a JSON object containing a single key "questions" which maps to an array of 3 strings. Do not include any explanations or markdown syntax, just the raw JSON.

Example:
{
  "questions": [
    "Question 1?",
    "Question 2?",
    "Question 3?"
  ]
}`;

        const messages = [
            { role: 'system', content: systemPrompt }
        ];

        const responseContent = await callGroq(messages, { type: 'json_object' });
        const parsedResponse = JSON.parse(responseContent);

        res.json({
            company,
            role,
            questions: parsedResponse.questions || []
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
    const { company, role, answers } = req.body; // answers: [{ question, answer }]

    if (!company || !role || !answers || !Array.isArray(answers) || answers.length === 0) {
        return res.status(400).json({ error: 'Company, role, and answers are required' });
    }

    try {
        let qaText = '';
        answers.forEach((item, index) => {
            qaText += `\nQuestion ${index + 1}: ${item.question}\nAnswer ${index + 1}: ${item.answer}\n`;
        });

        const systemPrompt = `You are an expert interviewer for '${company}'. Evaluate the candidate's responses for the mock interview for '${role}'.
Questions and Answers:
${qaText}

Grade their answers based on correctness, technical depth, and alignment with '${company}' standards.
Return your response strictly as a JSON object containing the following keys (do not include extra text or markdown syntax):
1. "overallScore": a numeric score from 0 to 100.
2. "feedback": a detailed markdown text summarizing their performance, strengths, and weaknesses.
3. "strongAreas": an array of strings representing concepts/skills they answered well.
4. "focusAreas": an array of strings representing concepts/skills they need to focus or study more.

Example output:
{
  "overallScore": 72,
  "feedback": "You answered the coding question well, but need more clarity on company-specific values...",
  "strongAreas": ["Data structures", "SQL fundamentals"],
  "focusAreas": ["Scale & distribution topics", "Behavioral answers alignment"]
}`;

        const messages = [
            { role: 'system', content: systemPrompt }
        ];

        const responseContent = await callGroq(messages, { type: 'json_object' });
        const parsedEvaluation = JSON.parse(responseContent);

        res.json(parsedEvaluation);
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

        // Check if already saved
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
        
        // Filter out any populated items that might be null (just in case)
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
