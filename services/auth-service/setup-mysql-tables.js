const { Sequelize } = require('sequelize');

async function run() {
    console.log("Starting MySQL Database and Table Setup (Auth-Service)...");
    
    // Setup and Sync auth-service User model in 'saloon_auth'
    console.log("\nSyncing User tables in saloon_auth...");
    const authSequelize = new Sequelize('mysql://root:abcd1234@localhost:3306/saloon_auth', {
        dialect: 'mysql',
        logging: false
    });

    try {
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

    console.log("\n🎉 MySQL Auth Databases and Tables Setup successfully completed!");
    process.exit(0);
}

run();
