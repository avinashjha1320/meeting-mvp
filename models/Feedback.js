const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    message: {
        type: String,
        required: true,
        trim: true
    }
}, {
    timestamps: true
})

module.exports = Feedback = mongoose.model('feedback', feedbackSchema);