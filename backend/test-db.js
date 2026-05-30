require('dotenv').config();
const mongoose = require('mongoose');

console.log("URI from .env:", process.env.MONGO_URI);

mongoose.connect(process.env.MONGO_URI)
    .then(conn => {
        console.log("SUCCESS! Connected to MongoDB host:", conn.connection.host);
        process.exit(0);
    })
    .catch(err => {
        console.error("ERROR connecting to MongoDB:", err.message);
        process.exit(1);
    });
