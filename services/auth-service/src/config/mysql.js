const { Sequelize } = require('sequelize');

// Replace with actual MySQL credentials. We use an environment variable or fallback.
const sequelize = new Sequelize(process.env.MYSQL_AUTH_URI || 'mysql://root:abcd1234@localhost:3306/saloon_auth', {
    dialect: 'mysql',
    logging: false, // Set to console.log to see SQL queries
});

const connectMySQL = async () => {
    try {
        await sequelize.authenticate();
        console.log('✅ MySQL Connected: Auth Service Database');
        
        // Sync models (creates tables if they don't exist in dev)
        await sequelize.sync({ alter: true });
        console.log('✅ MySQL Auth Models Synchronized');
    } catch (error) {
        console.error('❌ MySQL Connection Error:', error.message);
        console.log("⚠️ WARNING: Server is running without MySQL database! Using Mock Mode.");
    }
};

module.exports = { sequelize, connectMySQL };
