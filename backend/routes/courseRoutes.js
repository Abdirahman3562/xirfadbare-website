import express from 'express';
import {
  getCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
} from '../controllers/courseController.js';
import { protect } from '../middleware/authMiddleware.js';
import { checkPermission } from '../middleware/permissionMiddleware.js';

const router = express.Router();

router.route('/').get(getCourses).post(protect, checkPermission('courses.create'), createCourse);
router
  .route('/:id')
  .get(getCourseById)
  .put(protect, checkPermission('courses.edit'), updateCourse)
  .delete(protect, checkPermission('courses.delete'), deleteCourse);

export default router;




