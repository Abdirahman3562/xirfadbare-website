import express from 'express';
import {
  getFAQs,
  getFAQById,
  createFAQ,
  updateFAQ,
  deleteFAQ,
} from '../controllers/faqController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(getFAQs)
  .post(protect, createFAQ);

router.route('/:id')
  .get(getFAQById)
  .put(protect, updateFAQ)
  .delete(protect, deleteFAQ);

export default router;


