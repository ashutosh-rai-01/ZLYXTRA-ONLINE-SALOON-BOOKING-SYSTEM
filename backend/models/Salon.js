const mongoose = require('mongoose');

const salonSchema = new mongoose.Schema({
    ownerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true // One user = One salon for now
    },
    name: {
        type: String,
        required: [true, 'Please add a salon name']
    },
    address: {
        type: String,
        required: [true, 'Please add an address']
    },
    location: {
        type: {
            type: String,
            enum: ['Point'],
            default: 'Point'
        },
        coordinates: {
            type: [Number], // [longitude, latitude]
            default: [0, 0]
        }
    },
    services: [{
        name: { type: String, required: true },
        price: { type: Number, required: true },
        duration: { type: Number, required: true }
    }],
    workingHours: {
        open: { type: String, default: "09:00" },
        close: { type: String, default: "21:00" },
        daysOpen: { type: [String], default: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] }
    },
    images: {
        type: [String], // Array of image URLs
        default: []
    },
    isApproved: {
        type: Boolean,
        default: false // Admin must approve before going live
    },
    isRejected: {
        type: Boolean,
        default: false
    },
    rejectionReason: {
        type: String,
        default: ""
    },
    isActive: {
        type: Boolean,
        default: true
    },
    rating: {
        type: Number,
        default: 0
    },
    totalReviews: {
        type: Number,
        default: 0
    }
}, { timestamps: true });

salonSchema.index({ location: "2dsphere" });

module.exports = mongoose.model('Salon', salonSchema);
