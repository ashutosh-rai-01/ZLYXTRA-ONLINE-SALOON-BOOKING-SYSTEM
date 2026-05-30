const { Sequelize } = require('sequelize');

console.log("Checking MySQL on default credentials...");
const uri = 'mysql://root:abcd1234@localhost:3306'; // check server connection without DB first

const sequelize = new Sequelize(uri, {
    dialect: 'mysql',
    logging: false
});

sequelize.authenticate()
    .then(async () => {
        console.log("✅ MySQL Server is RUNNING at localhost:3306!");
        
        // Let's check if we can create the saloon_booking database
        try {
            await sequelize.query("CREATE DATABASE IF NOT EXISTS saloon_booking;");
            console.log("✅ Database 'saloon_booking' created or verified!");
            process.exit(0);
        } catch (dbErr) {
            console.error("❌ Failed to create database 'saloon_booking':", dbErr.message);
            process.exit(1);
        }
    })
    .catch(err => {
        console.error("❌ MySQL Connection failed:", err.message);
        process.exit(1);
    });
