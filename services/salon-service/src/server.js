require('dotenv').config({ path: '../.env' });
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

// Connect to database
connectDB();

const app = express();
app.use(express.json());
app.use(cors());

// Salon routes
const salonRoutes = require('./routes/salonRoutes');
app.use('/', salonRoutes); // Gateway maps /api/salon to /

const PORT = 5002;
app.listen(PORT, () => console.log(`💈 Salon Service running on port ${PORT}`));
