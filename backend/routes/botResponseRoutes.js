import express from 'express';
import {
    getBotResponses,
    createBotResponse,
    updateBotResponse,
    deleteBotResponse,
} from '../controllers/botResponseController.js';
import { protect, admin } from '../middleware/authMiddleware.js';
import { checkPermission } from '../middleware/permissionMiddleware.js';

const router = express.Router();

router.route('/')
    .get(getBotResponses)
    .post(protect, checkPermission('bot.create'), createBotResponse);

router.route('/:id')
    .put(protect, checkPermission('bot.edit'), updateBotResponse)
    .delete(protect, checkPermission('bot.delete'), deleteBotResponse);

export default router;
