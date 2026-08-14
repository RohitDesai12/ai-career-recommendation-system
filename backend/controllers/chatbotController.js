const axios = require('axios');
const Roadmap = require('../models/Roadmap');
const Profile = require('../models/Profile');
const ChatSession = require('../models/ChatSession');

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

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
        max_tokens: 1024,
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
        const roadmap = await Roadmap.findOne({ user: req.user.id });
        const field = roadmap ? roadmap.field : 'General study';
        const department = roadmap ? roadmap.department : 'General';

        // Retrieve or create ChatSession
        let session = null;
        if (sessionId) {
            session = await ChatSession.findOne({ _id: sessionId, user: req.user.id });
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
        const systemPrompt = `You are Antigravity Career & Study Mentor AI, an elite career guide and tutor.
Your mission is to help the user learn and advance in their studies and career goals.

CRITICAL RULE: You MUST strictly only answer study-related, academic, or career-development questions. 
If the user asks questions about anything else (e.g. gossip, sports, general knowledge unrelated to their career/studies, jokes, cooking, recipes, movies, personal relationships, general coding help that is purely for entertainment), you must politely but firmly decline and explain that you can only answer study-related or career-related questions, then prompt them to ask a career or learning question.
Do not break character. Do not fulfill requests that are off-topic.

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

        const reply = await callGroq(messages);

        // Save to session database
        session.messages.push({ role: 'user', content: message });
        session.messages.push({ role: 'ai', content: reply });
        session.updatedAt = Date.now();
        await session.save();

        res.json({ reply, sessionId: session._id });
    } catch (err) {
        console.error('Error in chatMessage:', err.message);
        if (err.message.includes('GROQ_API_KEY')) {
            return res.status(400).json({ 
                reply: "⚠️ Groq API key is missing. Please add `GROQ_API_KEY` to your backend `.env` file to start using the mentor.", 
                error: err.message 
            });
        }
        res.status(500).json({ 
            reply: "I'm having trouble connecting to my brain right now. Please try again later.",
            error: err.message 
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
        const roadmap = await Roadmap.findOne({ user: req.user.id });
        if (!roadmap) {
            return res.status(404).json({ 
                error: 'No active roadmap found. Please generate a roadmap first to enable interviews!' 
            });
        }

        const field = roadmap.field;
        
        // Find active stage
        let activeStage = roadmap.stages.find(stage => stage.status === 'In progress');
        if (!activeStage && roadmap.stages.length > 0) {
            activeStage = roadmap.stages[0];
        }

        const stageTitle = activeStage ? activeStage.title : 'Stage 1';
        const skillsList = activeStage ? activeStage.skills.map(s => s.name).join(', ') : 'General skills';

        const systemPrompt = `You are an expert interviewer conducting a career path readiness mock interview.
Generate exactly 3 professional interview questions (both technical and situational/behavioral) for a candidate pursuing a career in '${field}' at the stage '${stageTitle}' focusing on the following skills: ${skillsList}.
Return your response strictly as a JSON object containing a single key "questions" which maps to an array of 3 strings. Do not include any explanations or markdown syntax (e.g. no \`\`\`json blocks), just the raw JSON.

Example:
{
  "questions": [
    "Explain the difference between a list and a tuple in Python, and when you would use each?",
    "How do you design a scalable data pipeline for real-time recommendations?",
    "Describe a time you had to explain a complex technical concept to a non-technical stakeholder."
  ]
}`;

        const messages = [
            { role: 'system', content: systemPrompt }
        ];

        const responseContent = await callGroq(messages, { type: 'json_object' });
        const parsedResponse = JSON.parse(responseContent);

        res.json({
            field,
            stageTitle,
            questions: parsedResponse.questions || []
        });
    } catch (err) {
        console.error('Error in startInterview:', err.message);
        if (err.message.includes('GROQ_API_KEY')) {
            return res.status(400).json({ 
                error: 'GROQ_API_KEY is not set on the server.' 
            });
        }
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
    const { answers } = req.body; // Array of { question: string, answer: string }

    if (!answers || !Array.isArray(answers) || answers.length === 0) {
        return res.status(400).json({ error: 'Answers are required' });
    }

    try {
        const roadmap = await Roadmap.findOne({ user: req.user.id });
        const field = roadmap ? roadmap.field : 'General';
        
        let activeStage = roadmap ? roadmap.stages.find(stage => stage.status === 'In progress') : null;
        if (!activeStage && roadmap && roadmap.stages.length > 0) {
            activeStage = roadmap.stages[0];
        }
        const stageTitle = activeStage ? activeStage.title : 'Stage 1';
        const skillsList = activeStage ? activeStage.skills.map(s => s.name).join(', ') : 'General skills';

        let qaText = '';
        answers.forEach((item, index) => {
            qaText += `\nQuestion ${index + 1}: ${item.question}\nAnswer ${index + 1}: ${item.answer}\n`;
        });

        const systemPrompt = `You are an expert interviewer. The candidate is interviewing for the career field '${field}' at the stage '${stageTitle}' covering skills: ${skillsList}.
Evaluate their answers to the following questions:
${qaText}

Grade their answers based on correctness, technical depth, and overall communication.
Return your response strictly as a JSON object containing the following keys:
1. "overallScore": a numeric score from 0 to 100.
2. "feedback": a detailed markdown text summarizing their performance, strengths, and weaknesses.
3. "strongAreas": an array of strings representing concepts/skills they answered well.
4. "focusAreas": an array of strings representing concepts/skills they need to focus or study more.

Do not include any extra text or markdown formatting outside the JSON object.

Example output:
{
  "overallScore": 75,
  "feedback": "Overall, you did well in explaining Python differences, but struggle with scalability designs...",
  "strongAreas": ["Python loops", "Git workflows"],
  "focusAreas": ["SQL indexing", "Stakeholder communications"]
}`;

        const messages = [
            { role: 'system', content: systemPrompt }
        ];

        const responseContent = await callGroq(messages, { type: 'json_object' });
        const parsedEvaluation = JSON.parse(responseContent);

        res.json(parsedEvaluation);
    } catch (err) {
        console.error('Error in evaluateInterview:', err.message);
        if (err.message.includes('GROQ_API_KEY')) {
            return res.status(400).json({ 
                error: 'GROQ_API_KEY is not set on the server.' 
            });
        }
        res.status(500).json({ 
            error: 'Failed to evaluate interview answers. Please try again.',
            details: err.message
        });
    }
};
