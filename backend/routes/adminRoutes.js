import express from 'express';
import { getDashboardStats } from '../controllers/adminController.js';
import { protect, staff } from '../middleware/authMiddleware.js';

const router = express.Router();

// @desc    Get dashboard statistics
// @route   GET /api/admin/stats
// @access  Private/Staff
router.route('/stats').get(protect, staff, getDashboardStats);

export default router;
