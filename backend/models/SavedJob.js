const mongoose = require('mongoose');

const SavedJobSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    job: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Job',
        required: true,
        index: true
    },
    notes: {
        type: String,
        default: '',
        trim: true
    },
    savedAt: {
        type: Date,
        default: Date.now
    }
});

// Ensure a student can only bookmark a job once
SavedJobSchema.index({ user: 1, job: 1 }, { unique: true });

module.exports = mongoose.model('SavedJob', SavedJobSchema);

