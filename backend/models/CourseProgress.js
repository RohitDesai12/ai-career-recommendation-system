const mongoose = require('mongoose');

const CourseProgressSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    courseId: {
        type: Number,
        required: true,
        index: true
    },
    courseTitle: {
        type: String,
        required: true,
        trim: true
    },
    platform: {
        type: String,
        default: 'Coursera'
    },
    url: {
        type: String,
        required: true
    },
    image: {
        type: String,
        default: ''
    },
    branch: {
        type: String,
        default: 'Computer Science & IT'
    },
    status: {
        type: String,
        enum: ['Not Started', 'Currently Learning', 'Completed', 'Paused'],
        default: 'Currently Learning'
    },
    progressPercent: {
        type: Number,
        min: 0,
        max: 100,
        default: 0
    },
    skillsCovered: {
        type: [String],
        default: []
    },
    targetCareer: {
        type: String,
        default: ''
    },
    notes: {
        type: String,
        default: ''
    },
    startedAt: {
        type: Date,
        default: Date.now
    },
    lastUpdated: {
        type: Date,
        default: Date.now
    },
    completedAt: {
        type: Date,
        default: null
    }
});

// Ensure a user can only have one progress record per course
CourseProgressSchema.index({ user: 1, courseId: 1 }, { unique: true });

module.exports = mongoose.model('CourseProgress', CourseProgressSchema);

