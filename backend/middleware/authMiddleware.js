const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Protect routes
exports.protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        return res.status(401).json({ success: false, message: 'Not authorized to access this route' });
    }

    try {
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const mongoose = require('mongoose');
        if (mongoose.connection.readyState !== 1 || !mongoose.Types.ObjectId.isValid(decoded.id)) {
            // DB Offline or Mock Session -> Mock the req.user
            req.user = { id: decoded.id, role: decoded.id === 'admin_mock_id' ? 'admin' : 'user' };
            return next();
        }

        // Set user on request
        req.user = await User.findById(decoded.id);
        
        if (!req.user) {
            const { mockUsers } = require('../db/mockStore');
            const mockUser = mockUsers.find(u => u._id === decoded.id);
            if (mockUser) {
                req.user = { id: decoded.id, role: mockUser.role || 'user' };
                return next();
            }
            return res.status(401).json({ success: false, message: 'User not found' });
        }

        next();
    } catch (err) {
        return res.status(401).json({ success: false, message: 'Not authorized to access this route' });
    }
};

// Grant access to specific roles
exports.authorize = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ 
                success: false, 
                message: `User role '${req.user.role}' is not authorized to access this route` 
            });
        }
        next();
    };
};
