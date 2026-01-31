import express from 'express';
import {
  getUserProgress,
  updateUserProgress,
  getUserAllProgress,
  deleteUserProgress,
  saveQuizResult,
} from '../controllers/userProgressController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(protect, getUserAllProgress);

router.route('/:courseId')
  .get(protect, getUserProgress)
  .put(protect, updateUserProgress)
  .delete(protect, deleteUserProgress);

router.route('/:courseId/quiz')
  .post(protect, saveQuizResult);

export default router;



