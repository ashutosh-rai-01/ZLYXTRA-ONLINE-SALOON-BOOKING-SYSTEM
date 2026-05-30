const jwt = require('jsonwebtoken');

// Protect routes statelessly for microservices
exports.protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        return res.status(401).json({ success: false, message: 'Not authorized to access this route' });
    }

    try {
        // Verify token statelessly using the secret
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');

        // Set user directly from the decoded token (stateless auth)
        // Ensure your auth service signs the role into the JWT payload!
        req.user = { id: decoded.id, role: decoded.role || 'admin' }; 
        
        next();
    } catch (err) {
        return res.status(401).json({ success: false, message: 'Not authorized to access this route' });
    }
};
