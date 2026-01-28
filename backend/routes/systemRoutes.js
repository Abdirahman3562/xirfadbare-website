import express from 'express';
import SystemSetting from '../models/SystemSetting.js';

import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// ✅ Get system settings (Public)
router.get('/', async (req, res) => {
    try {
        let settings = await SystemSetting.findOne();
        if (!settings) {
            // Create default settings if none exist
            settings = await SystemSetting.create({});
        }
        res.json(settings);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// ✅ Update system settings (Admin Only)
router.patch('/', protect, admin, async (req, res) => {
    try {
        let settings = await SystemSetting.findOne();
        if (!settings) {
            settings = new SystemSetting(req.body);
        } else {
            Object.assign(settings, req.body);
        }
        const updatedSettings = await settings.save();
        res.json(updatedSettings);
    } catch (error) {
        console.error(error);
        res.status(400).json({ message: 'Update failed' });
    }
});

export default router;
