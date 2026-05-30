const mongoose = require('mongoose');

const adminLogSchema = new mongoose.Schema({
    adminId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    action: {
        type: String,
        required: true // e.g. "APPROVE_SALON", "DELETE_SALON", "BLOCK_USER"
    },
    targetType: {
        type: String,
        enum: ['salon', 'user', 'booking', 'report', 'stylist'],
        required: true
    },
    targetId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    message: {
        type: String
    }
}, { timestamps: true });

module.exports = mongoose.model('AdminLog', adminLogSchema);
