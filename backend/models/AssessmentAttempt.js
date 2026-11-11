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
    direction: {
        primary: { type: String, default: '' },
        primaryTitle: { type: String, default: '' },
        secondary: [{ type: String }]
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
    academic: {
        branch: { type: String, default: 'Computer Science and Engineering' },
        specialization: { type: String, default: 'General' },
        currentYear: { type: String, default: '3rd Year' },
        cgpa: { type: Number },
        academicStrengths: [{ type: String }]
    },
    skillsData: {
        existingSkills: [{
            name: String,
            proficiency: { type: String, default: 'Intermediate' }
        }],
        desiredSkills: [{ type: String }],
        customSkills: [{ type: String }],
        programmingLanguages: { type: String, default: 'None / Basic Scripting' },
        technicalProficiency: { type: String, default: 'Intermediate' },
        certifications: [{ type: String }]
    },
    v8Profile: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    },
    v8Results: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
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
        compatibilityScore: Number,
        v8ModelScore: Number,
        matchTier: {
            type: String,
            enum: ['Best Match', 'High Match', 'Good Match', 'Possible Path'],
            default: 'Good Match'
        },
        salaryRange: String,
        whyMatches: [String],
        areasToDevelop: [String],
        keySkills: [String],
        componentScores: mongoose.Schema.Types.Mixed,
        skillGaps: mongoose.Schema.Types.Mixed,
        suggestedNextSteps: [String],
        recommendedCertifications: [String]
    }],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('AssessmentAttempt', AssessmentAttemptSchema);
