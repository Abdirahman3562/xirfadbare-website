import express from 'express';
import {
  authUser,
  verify2FA,
  verifyEmail,
  registerUser,
  getUserProfile,
  getUsers,
  updateUserProfile,
  deleteUser,
  updateUserRole,
  createUserByAdmin,
  toggleUserStatus,
  updateUserByAdmin,
  getUserByUsername,
  forgotPassword,
  resetPassword,
} from '../controllers/userController.js';
import { protect, admin } from '../middleware/authMiddleware.js';
import { checkPermission } from '../middleware/permissionMiddleware.js';

const router = express.Router();

router.route('/')
  .get(protect, checkPermission('users.view'), getUsers)
  .post(registerUser);

router.post('/login', authUser);
router.post('/verify-2fa', verify2FA);
router.post('/verify-email', verifyEmail);
router.post('/forgot-password', forgotPassword);
router.put('/reset-password/:resetToken', resetPassword);
router.post('/admin-create', protect, checkPermission('users.create'), createUserByAdmin);

router.get('/profile', protect, getUserProfile);
router.put('/profile', protect, updateUserProfile);

router.route('/:id')
  .delete(protect, checkPermission('users.delete'), deleteUser)
  .put(protect, checkPermission('users.edit'), updateUserByAdmin);

router.route('/:id/role')
  .put(protect, checkPermission('users.edit'), updateUserRole);

router.route('/:id/status')
  .put(protect, checkPermission('users.status'), toggleUserStatus);

router.get('/public/:username', getUserByUsername);

export default router;


