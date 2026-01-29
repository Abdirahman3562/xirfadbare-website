import express from 'express';
import {
    getBotResponses,
    createBotResponse,
    updateBotResponse,
    deleteBotResponse,
} from '../controllers/botResponseController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
    .get(getBotResponses)
    .post(protect, admin, createBotResponse);

router.route('/:id')
    .put(protect, admin, updateBotResponse)
    .delete(protect, admin, deleteBotResponse);

export default router;
