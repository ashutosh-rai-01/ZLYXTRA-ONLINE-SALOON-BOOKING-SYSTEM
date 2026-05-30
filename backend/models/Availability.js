const mongoose = require('mongoose');

const availabilitySchema = new mongoose.Schema({
    salonId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Salon',
        required: true
    },
    date: {
        type: String, // e.g. "2023-10-25"
        required: true
    },
    blockedSlots: [{
        time: String, // e.g. "14:30"
        reason: String // e.g. "Lunch break", "Fully booked"
    }]
}, { timestamps: true });

// Ensure unique index per salon per date
availabilitySchema.index({ salonId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Availability', availabilitySchema);
