require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./db/db');

// Connect to database
connectDB();

const app = express();

// Body parser
app.use(express.json());

// Enable CORS
app.use(cors());

// Mount routers
const auth = require('./routes/auth');
const salonRoutes = require('./routes/salonRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const availabilityRoutes = require('./routes/availabilityRoutes');
const adminRoutes = require('./routes/adminRoutes');

app.use('/api/auth', auth);
app.use('/api/salon', salonRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/availability', availabilityRoutes);
app.use('/api/admin', adminRoutes);

// Example of a protected admin route
const { protect, authorize } = require('./middleware/authMiddleware');
app.get('/api/admin/dashboard', protect, authorize('admin'), (req, res) => {
    res.status(200).json({ success: true, message: 'Welcome to the admin dashboard!' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
