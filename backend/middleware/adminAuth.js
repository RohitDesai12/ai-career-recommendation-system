const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { getJwtSecret } = require('../config/jwt');

module.exports = async function (req, res, next) {
    let token = req.header('x-auth-token');
    
    if (!token) {
        const authHeader = req.header('Authorization') || req.header('authorization');
        if (authHeader && authHeader.startsWith('Bearer ')) {
            token = authHeader.split(' ')[1];
        } else if (authHeader) {
            token = authHeader;
        }
    }

    if (!token) {
        return res.status(401).json({ msg: 'No token, authorization denied' });
    }

    try {
        const secret = getJwtSecret();
        const decoded = jwt.verify(token, secret);
        const userObj = decoded.user || decoded;

        // Verify in DB for security
        const dbUser = await User.findById(userObj.id);
        if (!dbUser) {
            return res.status(401).json({ msg: 'User not found' });
        }

        if (dbUser.role !== 'admin') {
            return res.status(403).json({ msg: 'Access forbidden: Admin authorization required' });
        }

        req.user = {
            id: dbUser._id.toString(),
            name: dbUser.name,
            email: dbUser.email,
            role: dbUser.role
        };

        next();
    } catch (err) {
        if (err.message && err.message.startsWith('FATAL SECURITY ERROR')) {
            console.error('[AdminAuthMiddleware] Security configuration failure:', err.message);
            return res.status(500).json({ msg: 'Authentication configuration error' });
        }
        return res.status(401).json({ msg: 'Token is invalid or expired' });
    }
};
