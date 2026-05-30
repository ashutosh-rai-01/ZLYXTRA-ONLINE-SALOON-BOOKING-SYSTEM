const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    userId: {
        type: String, // Storing MySQL UUID
        required: true
    },
    salonId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Salon',
        required: true
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    comment: {
        type: String
    }
}, { timestamps: true });

module.exports = mongoose.model('Review', reviewSchema);
