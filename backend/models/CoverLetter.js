const mongoose = require('mongoose');

const CoverLetterSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    resume: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Resume',
        default: null
    },
    title: {
        type: String,
        required: true,
        trim: true,
        default: 'Cover Letter'
    },
    targetRole: {
        type: String,
        required: true,
        trim: true
    },
    targetCompany: {
        type: String,
        default: '',
        trim: true
    },
    jobDescription: {
        type: String,
        default: ''
    },
    tone: {
        type: String,
        enum: [
            'Professional',
            'Confident',
            'Concise',
            'Enthusiastic',
            'Technical',
            'Conversational',
            'Executive',
            'Startup',
            'Academic',
            'Custom'
        ],
        default: 'Professional'
    },
    content: {
        type: String,
        required: true
    },
    jobAlignment: {
        matchScore: { type: Number, default: 80 },
        matchedSkills: [{ type: String }],
        missingKeywords: [{ type: String }],
        relevantExperiences: [{ type: String }]
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

CoverLetterSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('CoverLetter', CoverLetterSchema);
