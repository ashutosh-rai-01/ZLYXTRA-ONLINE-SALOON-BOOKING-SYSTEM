const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/mysql');

const Booking = sequelize.define('Booking', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    userId: {
        type: DataTypes.STRING, // Since user is in another service, we store their ID string
        allowNull: false
    },
    salonId: {
        type: DataTypes.STRING, // Since salon is in Mongo, we store its string ObjectId
        allowNull: false
    },
    stylistId: {
        type: DataTypes.STRING,
        allowNull: true
    },
    serviceName: {
        type: DataTypes.STRING,
        allowNull: false
    },
    servicePrice: {
        type: DataTypes.FLOAT,
        allowNull: false
    },
    serviceDuration: {
        type: DataTypes.INTEGER, // duration in minutes
        allowNull: false
    },
    date: {
        type: DataTypes.STRING, // e.g. "2023-10-25"
        allowNull: false
    },
    startTime: {
        type: DataTypes.STRING, // e.g. "14:30"
        allowNull: false
    },
    endTime: {
        type: DataTypes.STRING, // e.g. "15:00"
        allowNull: true
    },
    status: {
        type: DataTypes.ENUM('pending', 'confirmed', 'completed', 'cancelled', 'booked'),
        defaultValue: 'pending'
    },
    paymentStatus: {
        type: DataTypes.ENUM('pending', 'paid'),
        defaultValue: 'pending'
    }
}, {
    timestamps: true,
    indexes: [
        { fields: ['userId'] },
        { fields: ['salonId'] },
        { fields: ['startTime'] }
    ]
});

module.exports = Booking;
