const mongoose = require('mongoose');

const AssessmentAttemptSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    field: {
        type: String,
        required: true,
        default: 'All Fields'
    },
    interests: [{
        type: String
    }],
    scenarios: [{
        scenarioId: String,
        question: String,
        selectedOption: String,
        traitImpact: [String]
    }],
    challenges: [{
        challengeId: String,
        category: String,
        chosenOption: String,
        timeSpentSeconds: Number,
        isOptimal: Boolean
    }],
    workStyle: {
        collaboration: { type: String, default: 'Flexible' }, // Independent, Team, Flexible
        environment: { type: String, default: 'Hybrid' },     // Remote, Hybrid, Office
        structure: { type: String, default: 'Balanced' }       // Structured, Experimental, Balanced
    },
    careerValues: [{
        type: String
    }],
    tradeOffs: [{
        question: String,
        choice: String
    }],
    constraints: {
        educationLevel: { type: String, default: 'BTech / BE' },
        currentYear: { type: String, default: '3rd Year' },
        weeklyHours: { type: String, default: '5-10 hours' },
        careerGoal: { type: String, default: 'Job after graduation' },
        locationPreference: { type: String, default: 'Flexible' },
        workMode: { type: String, default: 'Hybrid' }
    },
    dimensions: {
        technicalInterest: { type: Number, default: 50 },
        analytical: { type: Number, default: 50 },
        problemSolving: { type: Number, default: 50 },
        creativity: { type: Number, default: 50 },
        peopleOrientation: { type: Number, default: 50 }
    },
    keyStrengths: [{
        title: String,
        description: String
    }],
    recommendedCareers: [{
        title: String,
        department: String,
        matchScore: Number,
        matchTier: {
            type: String,
            enum: ['Best Match', 'High Match', 'Good Match', 'Possible Path'],
            default: 'Good Match'
        },
        salaryRange: String,
        whyMatches: [String],
        areasToDevelop: [String],
        keySkills: [String]
    }],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('AssessmentAttempt', AssessmentAttemptSchema);
