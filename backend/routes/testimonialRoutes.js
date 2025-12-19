import express from 'express';
import {
  getTestimonials,
  getTestimonialById,
  createTestimonial,
  updateTestimonial,
  deleteTestimonial,
} from '../controllers/testimonialController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(getTestimonials)
  .post(protect, createTestimonial);

router.route('/:id')
  .get(getTestimonialById)
  .put(protect, updateTestimonial)
  .delete(protect, deleteTestimonial);

export default router;


