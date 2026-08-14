const mongoose = require('mongoose');

const ProfileSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    education: {
        type: String,
        default: null
    },
    skills: [String],
    skill_ratings: {
        type: Map,
        of: mongoose.Schema.Types.Mixed,
        default: {}
    },
    interests: [String],
    aptitudeScore: {
        type: Number,
        default: null
    },
    recommendedCareers: [{
        title: String,
        confidence: Number,
        description: String
    }],
    resumeUrl: {
        type: String,
        default: null
    },
    resumeData: {
        atsScore: { type: Number, default: null },
        shortlistChance: { type: Number, default: null },
        keywordScore: { type: Number, default: null },
        role: { type: String, default: null },
        analyzedAt: { type: Date, default: null }
    },
    targetCareer: {
        type: String,
        default: null
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Profile', ProfileSchema);
