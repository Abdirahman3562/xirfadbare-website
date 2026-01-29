import express from 'express';
import {
  createBlog,
  getBlogs,
  getBlogById,
  updateBlog,
  deleteBlog,
  getBlogsByAuthor,
} from '../controllers/blogController.js';
import { protect, admin } from '../middleware/authMiddleware.js';
import { checkPermission } from '../middleware/permissionMiddleware.js';

const router = express.Router();

router.route('/')
  .post(protect, checkPermission('blogs.create'), createBlog)
  .get(getBlogs);

router.route('/author/:authorId')
  .get(getBlogsByAuthor);

router.route('/:id')
  .get(getBlogById)
  .put(protect, checkPermission('blogs.edit'), updateBlog)
  .delete(protect, checkPermission('blogs.delete'), deleteBlog);

export default router;
