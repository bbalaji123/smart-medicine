const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    // Get token from header
    let token = req.header('Authorization');
    
    // Check if token exists
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token, authorization denied'
      });
    }

    // Remove Bearer from string
    if (token.startsWith('Bearer ')) {
      token = token.slice(7, token.length);
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
      
      // Find user
      const user = await User.findById(decoded.userId);
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Token is not valid - user not found'
        });
      }

      // Check if user is active
      if (!user.isActive) {
        return res.status(401).json({
          success: false,
          message: 'User account is deactivated'
        });
      }

      // Add user to request object
      req.user = {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName
      };

      next();
    } catch (error) {
      console.error('Token verification error:', error);
      return res.status(401).json({
        success: false,
        message: 'Token is not valid'
      });
    }

  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error in authentication'
    });
  }
};

module.exports = auth;