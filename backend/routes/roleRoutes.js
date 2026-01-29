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
import { checkPermission } from '../middleware/permissionMiddleware.js';

router.get('/ping', (req, res) => res.json({ message: 'pong' }));

router.route('/')
    .get(protect, checkPermission('roles.view'), getRoles)
    .post(protect, checkPermission('roles.create'), createRole);

router.route('/:id')
    .get(protect, checkPermission('roles.view'), getRoleById)
    .put(protect, checkPermission('roles.edit'), updateRole)
    .delete(protect, checkPermission('roles.delete'), deleteRole);

export default router;
