const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/mysql');

const Availability = sequelize.define('Availability', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    salonId: {
        type: DataTypes.STRING,
        allowNull: false
    },
    date: {
        type: DataTypes.STRING, // e.g. "2023-10-25"
        allowNull: false
    },
    slots: {
        type: DataTypes.JSON, // Stores array of available times: ["10:00", "11:00", "14:00"]
        defaultValue: []
    }
}, {
    timestamps: true,
    indexes: [
        { fields: ['salonId'] },
        { fields: ['date'] }
    ]
});

module.exports = Availability;
