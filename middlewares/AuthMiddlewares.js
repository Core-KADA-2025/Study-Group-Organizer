const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Group = require('../models/Group');

// protect: cek login dari token
const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'SECRET');
      const user = await User.findById(decoded.id).select('-password');

      if (!user) {
        return res.status(403).json({ message: 'User not registered or removed' });
      }

      req.user = user;
      next();
    } catch (error) {
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  } else {
    return res.status(401).json({ message: 'No token, not authorized' });
  }
};

// authorizeGroupAccess: cek apakah user anggota grup
const authorizeGroupAccess = async (req, res, next) => {
  const groupId = req.body.group || req.params.groupId;

  if (!groupId) {
    return res.status(400).json({ message: 'Group ID is required' });
  }

  try {
    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ message: 'Group not found' });

    const isMember = group.members.some(member => member.equals(req.user._id));
    if (!isMember) {
      return res.status(403).json({ message: 'Access denied: Not a group member' });
    }

    req.group = group;
    next();
  } catch (err) {
    return res.status(500).json({ message: 'Authorization failed', error: err.message });
  }
};

module.exports = {
  protect,
  authorizeGroupAccess,
};
