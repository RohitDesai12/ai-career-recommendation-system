const mongoose = require('mongoose');

const LearningPathEnrollmentSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    pathId: {
        type: String,
        required: true,
        trim: true
    },
    pathTitle: {
        type: String,
        required: true,
        trim: true
    },
    status: {
        type: String,
        enum: ['Active', 'Completed', 'Paused'],
        default: 'Active'
    },
    progressPercent: {
        type: Number,
        min: 0,
        max: 100,
        default: 0
    },
    completedStages: {
        type: [String], // e.g. ['Beginner', 'Intermediate']
        default: []
    },
    completedCourses: {
        type: [Number], // Course IDs completed within this path
        default: []
    },
    enrolledAt: {
        type: Date,
        default: Date.now
    },
    lastAccessedAt: {
        type: Date,
        default: Date.now
    },
    completedAt: {
        type: Date,
        default: null
    }
});

// Ensure a user has at most one record per learning path
LearningPathEnrollmentSchema.index({ user: 1, pathId: 1 }, { unique: true });

module.exports = mongoose.model('LearningPathEnrollment', LearningPathEnrollmentSchema);

