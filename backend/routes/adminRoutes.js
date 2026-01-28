import express from 'express';
import { getDashboardStats } from '../controllers/adminController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// @desc    Get dashboard statistics
// @route   GET /api/admin/stats
// @access  Private/Admin
router.route('/stats').get(protect, admin, getDashboardStats);

export default router;
