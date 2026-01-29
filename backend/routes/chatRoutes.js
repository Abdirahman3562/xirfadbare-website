import express from 'express';
import { getChatHistory, sendMessage, saveBotMessage } from '../controllers/chatController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
    .get(protect, getChatHistory)
    .post(protect, sendMessage);

router.post('/bot', protect, saveBotMessage);

import { admin } from '../middleware/authMiddleware.js';
import { getConversations, getMessagesByUser, sendAdminMessage, takeOverChat, getTotalUnreadMessages } from '../controllers/chatController.js';

router.get('/unread-count', protect, admin, getTotalUnreadMessages);
router.get('/conversations', protect, admin, getConversations);
router.get('/admin/:userId', protect, admin, getMessagesByUser);
router.post('/admin', protect, admin, sendAdminMessage);
router.put('/take-over/:userId', protect, admin, takeOverChat);

export default router;
