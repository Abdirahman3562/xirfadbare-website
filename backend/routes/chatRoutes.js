import express from 'express';
import { getChatHistory, sendMessage, saveBotMessage } from '../controllers/chatController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
    .get(protect, getChatHistory)
    .post(protect, sendMessage);

router.post('/bot', protect, saveBotMessage);

import { admin } from '../middleware/authMiddleware.js';
import { checkPermission } from '../middleware/permissionMiddleware.js';
import { getConversations, getMessagesByUser, sendAdminMessage, takeOverChat, getTotalUnreadMessages } from '../controllers/chatController.js';

router.get('/unread-count', protect, checkPermission('chat.view'), getTotalUnreadMessages);
router.get('/conversations', protect, checkPermission('chat.view'), getConversations);
router.get('/admin/:userId', protect, checkPermission('chat.view'), getMessagesByUser);
router.post('/admin', protect, checkPermission('chat.manage'), sendAdminMessage);
router.put('/take-over/:userId', protect, checkPermission('chat.manage'), takeOverChat);

export default router;
