const mongoose = require('mongoose');

const favoriteSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    salonId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Salon',
        required: true
    }
}, { timestamps: true });

// Ensure a user can only favorite a salon once
favoriteSchema.index({ userId: 1, salonId: 1 }, { unique: true });

module.exports = mongoose.model('Favorite', favoriteSchema);
