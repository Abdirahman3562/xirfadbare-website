import express from 'express';
import {
  authUser,
  verify2FA,
  registerUser,
  getUserProfile,
  getUsers,
  updateUserProfile,
  createUserByAdmin,
  deleteUser,
  updateUserRole,
  toggleUserStatus,
  updateUserByAdmin,
  getUserByUsername
} from '../controllers/userController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(protect, admin, getUsers)
  .post(registerUser);

router.post('/login', authUser);
router.post('/verify-2fa', verify2FA);
router.post('/admin-create', protect, admin, createUserByAdmin);

router.get('/profile', protect, getUserProfile);
router.put('/profile', protect, updateUserProfile);

router.route('/:id')
  .delete(protect, admin, deleteUser)
  .put(protect, admin, updateUserByAdmin);

router.route('/:id/role')
  .put(protect, admin, updateUserRole);

router.route('/:id/status')
  .put(protect, admin, toggleUserStatus);

router.get('/public/:username', getUserByUsername);

export default router;


