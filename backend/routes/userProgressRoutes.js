import express from 'express';
import {
  getUserProgress,
  updateUserProgress,
  getUserAllProgress,
  deleteUserProgress,
} from '../controllers/userProgressController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(protect, getUserAllProgress);

router.route('/:courseId')
  .get(protect, getUserProgress)
  .put(protect, updateUserProgress)
  .delete(protect, deleteUserProgress);

export default router;



