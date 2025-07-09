const jwt = require('jsonwebtoken');

const JWT_SECRET = '12bd3380fc632edd26ebae6c8e60e5022ab36d7fcd798767e72bb814370d55e1'; 
const signToken = (payload, options = {}) => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '1d', ...options });
};

const verifyToken = (token) => {
  return jwt.verify(token, JWT_SECRET);
};

module.exports = { signToken, verifyToken };