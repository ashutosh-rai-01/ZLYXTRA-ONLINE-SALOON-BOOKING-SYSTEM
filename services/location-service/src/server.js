require('dotenv').config({ path: '../.env' });
const express = require('express');
const cors = require('cors');
// const connectDB = require('./config/db');

// connectDB(); // Activate when schemas are moved here

const app = express();
app.use(express.json());
app.use(cors());

app.get('/', (req, res) => {
    res.json({ success: true, message: 'Location Service is live. Geospatial queries go here.' });
});

const PORT = 5004;
app.listen(PORT, () => console.log(`📍 Location Service running on port ${PORT}`));
