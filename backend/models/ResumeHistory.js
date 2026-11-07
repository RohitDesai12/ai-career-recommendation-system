const mongoose = require('mongoose');

const ResumeHistorySchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    resumeTitle: {
        type: String,
        default: 'Primary Resume'
    },
    role: {
        type: String,
        default: 'Software Development'
    },
    atsScore: {
        type: Number,
        required: true
    },
    shortlistChance: {
        type: Number,
        default: 70
    },
    keywordScore: {
        type: Number,
        default: 70
    },
    contentQuality: {
        type: Number,
        default: 80
    },
    structureScore: {
        type: Number,
        default: 85
    },
    skillsMatch: {
        type: Number,
        default: 75
    },
    matchedKeywords: [{
        type: String
    }],
    missingKeywords: [{
        type: String
    }],
    analyzedAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('ResumeHistory', ResumeHistorySchema);
