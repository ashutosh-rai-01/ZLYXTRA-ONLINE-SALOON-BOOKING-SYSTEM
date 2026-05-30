const { Sequelize } = require('sequelize');

async function run() {
    console.log("Starting MySQL Database and Table Setup...");
    
    // 1. Connect without database to create databases if they don't exist
    const baseUri = 'mysql://root:abcd1234@localhost:3306';
    const baseSequelize = new Sequelize(baseUri, {
        dialect: 'mysql',
        logging: false
    });

    try {
        await baseSequelize.authenticate();
        console.log("✅ Successfully connected to MySQL server!");

        // Create databases
        await baseSequelize.query("CREATE DATABASE IF NOT EXISTS saloon_booking;");
        console.log("✅ Database 'saloon_booking' verified/created.");

        await baseSequelize.query("CREATE DATABASE IF NOT EXISTS saloon_auth;");
        console.log("✅ Database 'saloon_auth' verified/created.");
        
        await baseSequelize.close();
    } catch (err) {
        console.error("❌ Failed to connect to MySQL server or create databases:", err.message);
        process.exit(1);
    }

    // 2. Setup and Sync auth-service User model in 'saloon_auth'
    console.log("\nSyncing User tables in saloon_auth...");
    const authSequelize = new Sequelize('mysql://root:abcd1234@localhost:3306/saloon_auth', {
        dialect: 'mysql',
        logging: false
    });

    try {
        // Require User model relative to auth-service
        const { DataTypes } = require('sequelize');
        const bcrypt = require('bcryptjs');

        const User = authSequelize.define('User', {
            id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
            name: { type: DataTypes.STRING, defaultValue: 'New User' },
            phone: { type: DataTypes.STRING, allowNull: false, unique: true },
            password: { type: DataTypes.STRING, allowNull: false },
            email: { type: DataTypes.STRING, allowNull: true, unique: true },
            role: { type: DataTypes.ENUM('user', 'owner', 'admin'), defaultValue: 'user' },
            isBlocked: { type: DataTypes.BOOLEAN, defaultValue: false },
            isVerified: { type: DataTypes.BOOLEAN, defaultValue: true },
            status: { type: DataTypes.ENUM('active', 'banned'), defaultValue: 'active' }
        }, {
            timestamps: true,
            tableName: 'Users',
            hooks: {
                beforeSave: async (user) => {
                    if (user.changed('password')) {
                        const salt = await bcrypt.genSalt(10);
                        user.password = await bcrypt.hash(user.password, salt);
                    }
                }
            }
        });

        await authSequelize.sync({ force: false, alter: true });
        console.log("✅ User table successfully created/synchronized in saloon_auth!");
        await authSequelize.close();
    } catch (err) {
        console.error("❌ Failed to sync User table in saloon_auth:", err.message);
    }

    // 3. Setup and Sync booking-service models in 'saloon_booking'
    console.log("\nSyncing Booking and Availability tables in saloon_booking...");
    const bookingSequelize = new Sequelize('mysql://root:abcd1234@localhost:3306/saloon_booking', {
        dialect: 'mysql',
        logging: false
    });

    try {
        const { DataTypes } = require('sequelize');

        const Booking = bookingSequelize.define('Booking', {
            id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
            userId: { type: DataTypes.STRING, allowNull: false },
            salonId: { type: DataTypes.STRING, allowNull: false },
            stylistId: { type: DataTypes.STRING, allowNull: true },
            serviceName: { type: DataTypes.STRING, allowNull: false },
            servicePrice: { type: DataTypes.FLOAT, allowNull: false },
            serviceDuration: { type: DataTypes.INTEGER, allowNull: false },
            date: { type: DataTypes.STRING, allowNull: false },
            startTime: { type: DataTypes.STRING, allowNull: false },
            endTime: { type: DataTypes.STRING, allowNull: true },
            status: { type: DataTypes.ENUM('pending', 'confirmed', 'completed', 'cancelled', 'booked', 'rejected'), defaultValue: 'pending' },
            paymentStatus: { type: DataTypes.ENUM('pending', 'paid'), defaultValue: 'pending' }
        }, {
            timestamps: true,
            tableName: 'Bookings'
        });

        const Availability = bookingSequelize.define('Availability', {
            id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
            salonId: { type: DataTypes.STRING, allowNull: false },
            date: { type: DataTypes.STRING, allowNull: false },
            slots: { type: DataTypes.JSON, defaultValue: [] }
        }, {
            timestamps: true,
            tableName: 'Availabilities'
        });

        await bookingSequelize.sync({ force: false, alter: true });
        console.log("✅ Booking & Availability tables successfully created/synchronized in saloon_booking!");
        await bookingSequelize.close();
    } catch (err) {
        console.error("❌ Failed to sync Booking/Availability tables in saloon_booking:", err.message);
    }

    console.log("\n🎉 MySQL Databases and Tables Setup successfully completed!");
    process.exit(0);
}

run();
