const mongoose = require('mongoose');

const StudentActivitySchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    action: {
        type: String,
        required: true
    },
    title: {
        type: String,
        default: ''
    },
    category: {
        type: String,
        enum: ['job', 'application', 'resume', 'interview', 'course', 'assessment', 'roadmap', 'profile'],
        default: 'job'
    },
    details: {
        type: String,
        default: ''
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('StudentActivity', StudentActivitySchema);
