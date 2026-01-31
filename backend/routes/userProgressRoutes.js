import express from 'express';
import {
  getUserProgress,
  updateUserProgress,
  getUserAllProgress,
  deleteUserProgress,
  saveQuizResult,
  verifyCertificate,
} from '../controllers/userProgressController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/verify/:certificateId').get(verifyCertificate);

router.route('/')
  .get(protect, getUserAllProgress);

router.route('/:courseId')
  .get(protect, getUserProgress)
  .put(protect, updateUserProgress)
  .delete(protect, deleteUserProgress);

router.route('/:courseId/quiz')
  .post(protect, saveQuizResult);

export default router;
