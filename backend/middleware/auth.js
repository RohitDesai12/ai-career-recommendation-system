const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
    // 1. Check HTTP-only cookie
    let token = req.cookies?.auth_token || req.cookies?.token;

    // 2. Fall back to header 'x-auth-token'
    if (!token) {
        token = req.header('x-auth-token');
    }

    // 3. Fall back to 'Authorization: Bearer <token>'
    if (!token) {
        const authHeader = req.header('Authorization') || req.header('authorization');
        if (authHeader && authHeader.startsWith('Bearer ')) {
            token = authHeader.split(' ')[1];
        } else if (authHeader) {
            token = authHeader;
        }
    }

    // Check if not token
    if (!token) {
        return res.status(401).json({ msg: 'No token, authorization denied' });
    }

    // Verify token
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'supersecretjwtkey_change_in_production');
        req.user = decoded.user || decoded;
        next();
    } catch (err) {
        res.status(401).json({ msg: 'Token is not valid' });
    }
};
