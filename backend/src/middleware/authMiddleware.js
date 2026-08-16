// Ye middleware check karta hai ki request bhejne wala login hai ya nahi
const jwt = require('jsonwebtoken');

function authMiddleware(req, res, next) {
    const authHeader = req.headers.authorization; // Format: "Bearer <token>"

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Login zaroori hai. Token nahi mila.' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.userId = decoded.userId; // Aage ke routes mein ye userId use hoga
        next();
    } catch (err) {
        return res.status(401).json({ error: 'Token invalid ya expire ho gaya hai. Dobara login karo.' });
    }
}

module.exports = authMiddleware;
