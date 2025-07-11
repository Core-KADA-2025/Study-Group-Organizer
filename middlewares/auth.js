const { verifyToken } = require('../utils/jwt');
const User = require('../models/User');
const Group = require('../models/Group');

const authenticate = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    } 

    else if (req.cookies?.token) {
      token = req.cookies.token;
    }

    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: 'No token provided' 
      });
    }

    const decoded = verifyToken(token);
    
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: 'User not found or has been removed' 
      });
    }

    if (!user.isVerified) {
      return res.status(403).json({ 
        success: false, 
        message: 'Email not verified' 
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        success: false, 
        message: 'Token expired' 
      });
    }
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid token' 
      });
    }

    return res.status(401).json({ 
      success: false, 
      message: 'Authentication failed' 
    });
  }
};

const authorizeGroupAccess = async (req, res, next) => {
  try {
    const groupId = req.body.group || req.params.groupId;

    if (!groupId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Group ID is required' 
      });
    }

    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ 
        success: false, 
        message: 'Group not found' 
      });
    }

    const isMember = group.members.some(member => 
      member.toString() === req.user._id.toString()
    );
    
    if (!isMember) {
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied: Not a group member' 
      });
    }

    req.group = group;
    next();
  } catch (error) {
    console.error('Group authorization error:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Authorization failed', 
      error: error.message 
    });
  }
};

module.exports = {
  authenticate,
  authorizeGroupAccess,
  // Keep old names for backward compatibility
  verify: authenticate,
  protect: authenticate,
};