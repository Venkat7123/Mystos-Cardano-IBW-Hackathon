// backend/middleware/auth.js
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';

function requireAuth(req, res, next) {
  const token = req.cookies && req.cookies.sollenium_session;
  if (!token) return res.status(401).json({ error: 'not_logged_in' });
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = { id: payload.sub };
    next();
  } catch (e) {
    return res.status(401).json({ error: 'invalid_session' });
  }
}

module.exports = { requireAuth };
