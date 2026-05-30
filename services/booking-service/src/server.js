require('dotenv').config({ path: '../.env' });
const express = require('express');
const cors = require('cors');
const { connectMySQL } = require('./config/mysql');

// Connect to MySQL database
connectMySQL();

const app = express();
app.use(express.json());
app.use(cors());

// Booking routes
const bookingRoutes = require('./routes/bookingRoutes');
const availabilityRoutes = require('./routes/availabilityRoutes');
app.use('/', bookingRoutes); // Gateway maps /api/bookings to /
// Note: You may want to configure Gateway to map /api/availability to /availability instead

const PORT = 5003;
app.listen(PORT, () => console.log(`📅 Booking Service running on port ${PORT}`));
