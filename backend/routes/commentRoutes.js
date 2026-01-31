import express from 'express';
import {
  getCommentsByBlog,
  createComment,
  updateComment,
  deleteComment,
  getUnreadCommentCount,
  markCommentsAsRead
} from '../controllers/commentController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Get unread/pending comments count
router.get('/unread-count', protect, getUnreadCommentCount);

// Mark comments as read (approved) for a blog
router.put('/mark-read/:blogId', protect, markCommentsAsRead);

// Get all comments for a blog
router.get('/:blogId', getCommentsByBlog);

// Create a new comment (protected route)
router.post('/', protect, createComment);

// Update a comment (protected route)
router.put('/:id', protect, updateComment);

// Delete a comment (protected route)
router.delete('/:id', protect, deleteComment);

export default router;


