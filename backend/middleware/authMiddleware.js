import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Role from '../models/Role.js';

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret_key_change_me_later');
      req.user = await User.findById(decoded.id).select('-password');

      if (req.user) {
        // Fetch role permissions (case-insensitive lookup)
        const roleData = await Role.findOne({ name: { $regex: new RegExp(`^${req.user.role}$`, 'i') } });
        req.user.permissions = roleData ? roleData.permissions : [];

        // Super admin bypass
        if (req.user.role === 'admin') {
          req.user.isSuperAdmin = true;
        }
      }

      next();
    } catch (error) {
      console.error(error);
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};

const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Not authorized as an admin' });
  }
};

const staff = (req, res, next) => {
  if (req.user && req.user.role !== 'student') {
    next();
  } else {
    res.status(403).json({ message: 'Access denied: Staff only' });
  }
};

export { protect, admin, staff };




