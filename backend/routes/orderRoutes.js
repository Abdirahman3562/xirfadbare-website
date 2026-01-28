import express from 'express';
import {
  addOrderItems,
  getOrderById,
  updateOrderToActive,
  updateOrderToRejected,
  getMyOrders,
  getOrders,
  deleteOrder,
} from '../controllers/orderController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/').post(protect, addOrderItems).get(protect, getOrders);
router.route('/myorders').get(protect, getMyOrders);
router.route('/:id').get(protect, getOrderById).delete(protect, deleteOrder);
router.route('/:id/approve').put(protect, updateOrderToActive);
router.route('/:id/reject').put(protect, updateOrderToRejected);

export default router;




