const express = require('express');
const cors = require('cors');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();

app.use(cors());

// Define Microservice Targets
const SERVICES = {
    auth: 'http://localhost:5001',
    salon: 'http://localhost:5002',
    booking: 'http://localhost:5003',
    location: 'http://localhost:5004',
    notification: 'http://localhost:5005',
    admin: 'http://localhost:5006',
};

// Route to Services
app.use('/api/auth', createProxyMiddleware({ target: SERVICES.auth, changeOrigin: true }));
app.use('/api/salon', createProxyMiddleware({ target: SERVICES.salon, changeOrigin: true }));
app.use('/api/bookings', createProxyMiddleware({ target: SERVICES.booking, changeOrigin: true }));
app.use('/api/availability', createProxyMiddleware({ target: SERVICES.booking, changeOrigin: true }));
app.use('/api/admin', createProxyMiddleware({ target: SERVICES.admin, changeOrigin: true }));
app.use('/api/location', createProxyMiddleware({ target: SERVICES.location, changeOrigin: true }));
app.use('/api/notifications', createProxyMiddleware({ target: SERVICES.notification, changeOrigin: true }));

const PORT = 5000;
app.listen(PORT, () => {
    console.log(`🚀 API Gateway running on port ${PORT}`);
    console.log(`Routes mapping:`);
    console.log(`  -> /api/auth       ==> ${SERVICES.auth}`);
    console.log(`  -> /api/salon      ==> ${SERVICES.salon}`);
    console.log(`  -> /api/bookings   ==> ${SERVICES.booking}`);
});
