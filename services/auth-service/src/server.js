require('dotenv').config({ path: '../.env' });
const express = require('express');
const cors = require('cors');
const { connectMySQL } = require('./config/mysql');

// Connect to MySQL database
connectMySQL();

const app = express();
app.use(express.json());
app.use(cors());

// Auth routes
const authRoutes = require('./routes/authRoutes');
app.use('/', authRoutes); // Gateway maps /api/auth to /

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`🔐 Auth Service running on port ${PORT}`));
