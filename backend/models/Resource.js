const mongoose = require('mongoose');

const ResourceSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    provider: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        default: ''
    },
    url: {
        type: String,
        required: true,
        trim: true
    },
    resourceType: {
        type: String,
        enum: ['Doc', 'Course', 'Video', 'Tutorial', 'Practice', 'Project', 'Article', 'Book'],
        default: 'Course'
    },
    skill: {
        type: String,
        required: true,
        index: true
    },
    career: {
        type: String,
        default: 'General'
    },
    department: {
        type: String,
        default: 'Computer Science & IT'
    },
    difficulty: {
        type: String,
        enum: ['Beginner', 'Intermediate', 'Advanced', 'All Levels'],
        default: 'Beginner'
    },
    duration: {
        type: String,
        default: '4 Weeks'
    },
    isFree: {
        type: Boolean,
        default: true
    },
    rating: {
        type: Number,
        default: 4.8
    },
    thumbnail: {
        type: String,
        default: ''
    },
    isVerified: {
        type: Boolean,
        default: true
    },
    isActive: {
        type: Boolean,
        default: true
    },
    savedBy: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Resource', ResourceSchema);
