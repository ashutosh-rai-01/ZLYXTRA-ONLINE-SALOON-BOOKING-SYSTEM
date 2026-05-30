require('dotenv').config({ path: '../.env' });
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

// Connect to database
connectDB();

const app = express();
app.use(express.json());
app.use(cors());

// Admin routes
const adminRoutes = require('./routes/adminRoutes');
app.use('/', adminRoutes); // Gateway maps /api/admin to /

const PORT = 5006;
app.listen(PORT, () => console.log(`🛠️ Admin Service running on port ${PORT}`));
