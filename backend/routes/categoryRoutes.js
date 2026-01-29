import express from 'express';
import {
    getCategories,
    getCategoryById,
    createCategory,
    updateCategory,
    deleteCategory,
} from '../controllers/categoryController.js';
import { protect } from '../middleware/authMiddleware.js';
import { checkPermission } from '../middleware/permissionMiddleware.js';

const router = express.Router();

router.route('/').get(getCategories).post(protect, checkPermission('categories.create'), createCategory);
router
    .route('/:id')
    .get(getCategoryById)
    .put(protect, checkPermission('categories.edit'), updateCategory)
    .delete(protect, checkPermission('categories.delete'), deleteCategory);

export default router;
