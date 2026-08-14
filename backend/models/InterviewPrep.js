const mongoose = require('mongoose');

const InterviewPrepSchema = new mongoose.Schema({
    company: {
        type: String,
        required: true
    },
    role: {
        type: String,
        required: true
    },
    salaryRange: {
        type: String
    },
    requiredSkills: {
        type: [String]
    },
    selectionProcess: {
        type: String
    },
    technicalTopics: {
        type: [String]
    },
    aptitudeTopics: {
        type: [String]
    },
    codingTopics: {
        type: [String]
    },
    hrQuestions: {
        type: [String]
    },
    prepRoadmap: {
        type: String
    },
    interviewQuestions: [{
        round: { type: String, required: true },
        questions: [{
            question: { type: String, required: true },
            answer: { type: String, required: true }
        }]
    }],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Enforce unique company + role pairing to make lookups fast and clean
InterviewPrepSchema.index({ company: 1, role: 1 }, { unique: true });

module.exports = mongoose.model('InterviewPrep', InterviewPrepSchema);
