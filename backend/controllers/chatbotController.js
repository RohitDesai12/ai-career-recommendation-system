const axios = require('axios');
const Roadmap = require('../models/Roadmap');
const Profile = require('../models/Profile');
const ChatSession = require('../models/ChatSession');

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODELS = ['openai/gpt-oss-120b', 'qwen/qwen3.8-27b', 'openai/gpt-oss-20b', 'groq/compound'];

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
                max_tokens: 1024,
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
            console.warn(`Groq model ${model} failed:`, err.response?.data?.error?.message || err.message);
            lastError = err;
        }
    }

    throw lastError || new Error('All AI models failed to respond.');
};

// Fallback response generator in case AI services are down
const generateLocalFallbackReply = (userMessage, careerField) => {
    const lower = userMessage.toLowerCase();
    if (lower.includes('interview') || lower.includes('question')) {
        return `Here are key technical interview tips for **${careerField || 'Software Engineering'}**:
1. **Core Fundamentals:** Review data structures (arrays, hash maps, trees) and Big-O notation.
2. **System Design:** Be prepared to explain high-level architectures, databases, and APIs.
3. **Behavioral Questions:** Use the STAR method (Situation, Task, Action, Result) when discussing past projects.
4. **Hands-On Practice:** Build real-world projects and push clean commits to GitHub.`;
    }
    if (lower.includes('skill') || lower.includes('learn') || lower.includes('start')) {
        return `For **${careerField || 'your target career'}**, I recommend prioritizing these core stages:
1. **Foundations:** Master programming basics and version control with Git.
2. **Specialized Tools:** Learn modern frameworks, database management (SQL & NoSQL), and REST APIs.
3. **Applied Projects:** Build 2–3 capstone projects demonstrating end-to-end functionality.
4. **Deployment:** Learn containerization (Docker) and CI/CD pipelines.`;
    }
    return `As your AI Career Mentor for **${careerField || 'your target path'}**, I recommend focusing on consistent daily coding practice, building full-scale projects for your portfolio, and preparing for mock interview rounds. What specific skill or topic would you like to explore next?`;
};

// @desc    Standard chat message with Groq and study-related filter (persisted to DB)
// @route   POST /api/chatbot/message
// @access  Private
exports.chatMessage = async (req, res) => {
    const { message, sessionId } = req.body;

    if (!message) {
        return res.status(400).json({ error: 'Message content is required' });
    }

    try {
        // Fetch user's roadmap for context
        let field = 'Software Engineering';
        let department = 'Computer Science & IT';
        try {
            const roadmap = await Roadmap.findOne({ user: req.user.id });
            if (roadmap) {
                field = roadmap.field || field;
                department = roadmap.department || department;
            }
        } catch (dbErr) {
            console.warn('Could not load roadmap for chatbot context:', dbErr.message);
        }

        // Retrieve or create ChatSession
        let session = null;
        if (sessionId) {
            try {
                session = await ChatSession.findOne({ _id: sessionId, user: req.user.id });
            } catch (sErr) {
                console.warn('Invalid session ID:', sErr.message);
            }
        }

        if (!session) {
            session = new ChatSession({
                user: req.user.id,
                title: message.substring(0, 35) + (message.length > 35 ? '...' : ''),
                messages: []
            });
        } else if (session.title === 'New Chat' || session.messages.length === 0) {
            session.title = message.substring(0, 35) + (message.length > 35 ? '...' : '');
        }

        // Set up the system prompt to restrict to study/learning topics
        const systemPrompt = `You are Compass AI Mentor, an elite career guide, engineering tutor, and mentor.
Your mission is to help the user learn and advance in their studies and career goals.

CRITICAL RULE: You MUST strictly only answer study-related, academic, or career-development questions. 
If the user asks questions about anything else (e.g. gossip, sports, general knowledge unrelated to their career/studies, jokes, cooking, recipes, movies, personal relationships), politely but firmly decline and explain that you can only answer study-related or career-related questions, then prompt them to ask a career or learning question.

The candidate's target career path is: ${field} (Department: ${department}).`;

        const messages = [
            { role: 'system', content: systemPrompt }
        ];

        // Retrieve last 10 messages from session to build chat history
        const historyMessages = session.messages.slice(-10);
        historyMessages.forEach(msg => {
            messages.push({
                role: msg.role === 'user' ? 'user' : 'assistant',
                content: msg.content
            });
        });

        // Add current message
        messages.push({ role: 'user', content: message });

        let reply;
        try {
            reply = await callGroq(messages);
        } catch (llmErr) {
            console.error('Groq LLM call failed in chatMessage, using smart fallback:', llmErr.message);
            reply = generateLocalFallbackReply(message, field);
        }

        // Save to session database
        session.messages.push({ role: 'user', content: message });
        session.messages.push({ role: 'ai', content: reply });
        session.updatedAt = Date.now();
        await session.save();

        res.json({ reply, sessionId: session._id });
    } catch (err) {
        console.error('Error in chatMessage:', err.message);
        res.json({ 
            reply: generateLocalFallbackReply(message, 'Software Development'),
            sessionId: sessionId || null 
        });
    }
};

// @desc    Get user's chat sessions list (metadata only)
// @route   GET /api/chatbot/sessions
// @access  Private
exports.getSessions = async (req, res) => {
    try {
        const sessions = await ChatSession.find({ user: req.user.id })
            .select('title updatedAt')
            .sort({ updatedAt: -1 });
        res.json(sessions);
    } catch (err) {
        console.error('Error fetching chat sessions:', err.message);
        res.status(500).json({ error: 'Server Error' });
    }
};

// @desc    Get a single chat session with messages
// @route   GET /api/chatbot/sessions/:id
// @access  Private
exports.getSessionById = async (req, res) => {
    try {
        const session = await ChatSession.findOne({ _id: req.params.id, user: req.user.id });
        if (!session) {
            return res.status(404).json({ error: 'Chat session not found' });
        }
        res.json(session);
    } catch (err) {
        console.error('Error fetching chat session details:', err.message);
        res.status(500).json({ error: 'Server Error' });
    }
};

// @desc    Create a new chat session
// @route   POST /api/chatbot/sessions
// @access  Private
exports.createSession = async (req, res) => {
    try {
        const newSession = new ChatSession({
            user: req.user.id,
            title: 'New Chat',
            messages: []
        });
        await newSession.save();
        res.json(newSession);
    } catch (err) {
        console.error('Error creating chat session:', err.message);
        res.status(500).json({ error: 'Server Error' });
    }
};

// @desc    Delete a chat session
// @route   DELETE /api/chatbot/sessions/:id
// @access  Private
exports.deleteSession = async (req, res) => {
    try {
        const result = await ChatSession.deleteOne({ _id: req.params.id, user: req.user.id });
        if (result.deletedCount === 0) {
            return res.status(404).json({ error: 'Chat session not found' });
        }
        res.json({ msg: 'Chat session deleted successfully' });
    } catch (err) {
        console.error('Error deleting chat session:', err.message);
        res.status(500).json({ error: 'Server Error' });
    }
};

// @desc    Generate customized interview questions based on active roadmap path
// @route   GET /api/chatbot/interview/start
// @access  Private
exports.startInterview = async (req, res) => {
    try {
        let field = 'Software Development Engineer';
        let stageTitle = 'Stage 1: Core Fundamentals';
        let skillsList = 'Data Structures, Python, Problem Solving';

        try {
            const roadmap = await Roadmap.findOne({ user: req.user.id });
            if (roadmap) {
                field = roadmap.field;
                let activeStage = roadmap.stages.find(stage => stage.status === 'In progress');
                if (!activeStage && roadmap.stages.length > 0) {
                    activeStage = roadmap.stages[0];
                }
                if (activeStage) {
                    stageTitle = activeStage.title;
                    skillsList = activeStage.skills.map(s => s.name).join(', ');
                }
            }
        } catch (dbErr) {
            console.warn('Could not load roadmap for interview questions:', dbErr.message);
        }

        const systemPrompt = `You are an expert interviewer conducting a career path readiness mock interview.
Generate exactly 3 professional interview questions (technical and situational) for a candidate pursuing '${field}' at '${stageTitle}' covering skills: ${skillsList}.
Return strictly JSON matching: {"questions": ["Q1", "Q2", "Q3"]}`;

        const messages = [{ role: 'system', content: systemPrompt }];

        try {
            const responseContent = await callGroq(messages, { type: 'json_object' });
            const parsedResponse = JSON.parse(responseContent);
            if (parsedResponse.questions && Array.isArray(parsedResponse.questions)) {
                return res.json({
                    field,
                    stageTitle,
                    questions: parsedResponse.questions
                });
            }
        } catch (err) {
            console.warn('Groq interview question generation failed, using structured fallback:', err.message);
        }

        // Fallback questions
        res.json({
            field,
            stageTitle,
            questions: [
                `Can you explain how you apply ${skillsList.split(',')[0] || 'core engineering principles'} to solve complex performance bottlenecks?`,
                `Describe a challenging project you engineered in ${field}. What architectural trade-offs did you make?`,
                `How do you approach debugging unexpected production issues in a distributed environment?`
            ]
        });
    } catch (err) {
        console.error('Error in startInterview:', err.message);
        res.status(500).json({ 
            error: 'Failed to generate interview questions. Please try again.',
            details: err.message
        });
    }
};

// @desc    Evaluate interview answers and identify focus areas
// @route   POST /api/chatbot/interview/evaluate
// @access  Private
exports.evaluateInterview = async (req, res) => {
    const { answers } = req.body;

    if (!answers || !Array.isArray(answers) || answers.length === 0) {
        return res.status(400).json({ error: 'Answers are required' });
    }

    try {
        let field = 'Software Engineering';
        let stageTitle = 'Stage 1';
        let skillsList = 'General technical skills';

        try {
            const roadmap = await Roadmap.findOne({ user: req.user.id });
            if (roadmap) {
                field = roadmap.field;
                let activeStage = roadmap.stages.find(stage => stage.status === 'In progress');
                if (!activeStage && roadmap.stages.length > 0) {
                    activeStage = roadmap.stages[0];
                }
                if (activeStage) {
                    stageTitle = activeStage.title;
                    skillsList = activeStage.skills.map(s => s.name).join(', ');
                }
            }
        } catch (dbErr) {
            console.warn('Could not load roadmap for evaluation:', dbErr.message);
        }

        let qaText = '';
        answers.forEach((item, index) => {
            qaText += `\nQuestion ${index + 1}: ${item.question}\nAnswer ${index + 1}: ${item.answer}\n`;
        });

        const systemPrompt = `You are an expert interviewer. Candidate is interviewing for '${field}' covering: ${skillsList}.
Evaluate their answers:
${qaText}

Return strictly JSON:
{
  "overallScore": 82,
  "feedback": "Detailed constructive markdown feedback summarizing strengths and areas of growth...",
  "strongAreas": ["Key concept 1", "Key concept 2"],
  "focusAreas": ["Improvement area 1", "Improvement area 2"]
}`;

        const messages = [{ role: 'system', content: systemPrompt }];

        try {
            const responseContent = await callGroq(messages, { type: 'json_object' });
            const parsedEvaluation = JSON.parse(responseContent);
            return res.json(parsedEvaluation);
        } catch (err) {
            console.warn('Groq interview evaluation failed, using structured fallback:', err.message);
        }

        // Fallback evaluation
        res.json({
            overallScore: 80,
            feedback: `Good effort! You demonstrated strong foundational knowledge for **${field}**. To score higher, provide more concrete examples with metrics and explain architectural trade-offs in detail.`,
            strongAreas: ["Problem articulation", "Technical terminology"],
            focusAreas: ["Deep-dive system architecture", "Performance optimization metrics"]
        });
    } catch (err) {
        console.error('Error in evaluateInterview:', err.message);
        res.status(500).json({ 
            error: 'Failed to evaluate interview answers. Please try again.',
            details: err.message
        });
    }
};
