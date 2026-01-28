import express from 'express';
import { getStats } from '../controllers/statsController.js';

const router = express.Router();

// Public route - no authentication required
router.get('/', getStats);

export default router;
