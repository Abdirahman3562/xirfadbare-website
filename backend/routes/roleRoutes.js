import express from 'express';
const router = express.Router();
import {
    getRoles,
    getRoleById,
    createRole,
    updateRole,
    deleteRole
} from '../controllers/roleController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

router.get('/ping', (req, res) => res.json({ message: 'pong' }));

router.route('/')
    .get(protect, admin, getRoles)
    .post(protect, admin, createRole);

router.route('/:id')
    .get(protect, admin, getRoleById)
    .put(protect, admin, updateRole)
    .delete(protect, admin, deleteRole);

export default router;
