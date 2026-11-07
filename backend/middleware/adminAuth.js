const jwt = require('jsonwebtoken');
const User = require('../models/User');

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
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'supersecretjwtkey_change_in_production');
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
        return res.status(401).json({ msg: 'Token is invalid or expired' });
    }
};
