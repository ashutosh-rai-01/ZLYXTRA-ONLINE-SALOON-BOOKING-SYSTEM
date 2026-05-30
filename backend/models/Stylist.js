const mongoose = require('mongoose');

const stylistSchema = new mongoose.Schema({
    salonId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Salon',
        required: true
    },
    name: {
        type: String,
        required: true
    },
    skills: {
        type: [String],
        default: []
    },
    workingHours: {
        start: { type: String, default: "09:00" },
        end: { type: String, default: "18:00" }
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

module.exports = mongoose.model('Stylist', stylistSchema);
