const { verifyAccessToken } = require('../utils/jwtUtils');
const { sendErrorResponse } = require('../utils/responseHandler');

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return sendErrorResponse(res, 401, 'Access token required');
  }

  const verification = verifyAccessToken(token);
  if (!verification.valid) {
    return sendErrorResponse(res, 401, 'Invalid or expired access token');
  }

  req.user = verification.decoded;
  next();
};

const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    return sendErrorResponse(res, 403, 'Admin access required');
  }
};

module.exports = {
  authenticateToken,
  isAdmin,
};
