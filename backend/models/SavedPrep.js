const mongoose = require('mongoose');

const SavedPrepSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    interviewPrep: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'InterviewPrep',
        required: true
    },
    savedAt: {
        type: Date,
        default: Date.now
    }
});

// Enforce unique save per user + prep guide
SavedPrepSchema.index({ user: 1, interviewPrep: 1 }, { unique: true });

module.exports = mongoose.model('SavedPrep', SavedPrepSchema);
