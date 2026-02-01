import express from 'express';
import {
    getBundles,
    getBundleById,
    createBundle,
    updateBundle,
    deleteBundle
} from '../controllers/bundleController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
    .get(getBundles)
    .post(protect, admin, createBundle);

router.route('/:id')
    .get(getBundleById)
    .put(protect, admin, updateBundle)
    .delete(protect, admin, deleteBundle);

export default router;
