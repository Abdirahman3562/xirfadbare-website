import express from 'express';
import PaymentMethod from '../models/PaymentMethod.js';
import { protect } from '../middleware/authMiddleware.js';
import { checkPermission } from '../middleware/permissionMiddleware.js';

const router = express.Router();

// @desc    Fetch active payment methods
// @route   GET /api/payment-methods
// @access  Public
router.get('/', async (req, res) => {
    try {
        const methods = await PaymentMethod.find({ isActive: true });
        res.json(methods);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Fetch all payment methods (Admin)
// @route   GET /api/payment-methods/admin
// @access  Private/Permission
router.get('/admin', protect, checkPermission('payments.view'), async (req, res) => {
    try {
        const methods = await PaymentMethod.find({}).sort({ createdAt: -1 });
        res.json(methods);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Create a payment method
// @route   POST /api/payment-methods
// @access  Private/Permission
router.post('/', protect, checkPermission('payments.create'), async (req, res) => {
    const { name, instruction, icon, isActive, type } = req.body;

    try {
        const methodExists = await PaymentMethod.findOne({ name });

        if (methodExists) {
            return res.status(400).json({ message: 'Payment method already exists' });
        }

        const method = await PaymentMethod.create({
            name,
            instruction,
            type,
            icon,
            isActive
        });

        if (method) {
            res.status(201).json(method);
        } else {
            res.status(400).json({ message: 'Invalid payment method data' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Update a payment method
// @route   PUT /api/payment-methods/:id
// @access  Private/Permission
router.put('/:id', protect, checkPermission('payments.edit'), async (req, res) => {
    try {
        const method = await PaymentMethod.findById(req.params.id);

        if (method) {
            method.name = req.body.name || method.name;
            method.instruction = req.body.instruction || method.instruction;
            method.type = req.body.type || method.type;
            method.icon = req.body.icon || method.icon;
            method.isActive = req.body.isActive !== undefined ? req.body.isActive : method.isActive;

            const updatedMethod = await method.save();
            res.json(updatedMethod);
        } else {
            res.status(404).json({ message: 'Payment method not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Delete a payment method
// @route   DELETE /api/payment-methods/:id
// @access  Private/Permission
router.delete('/:id', protect, checkPermission('payments.delete'), async (req, res) => {
    try {
        const method = await PaymentMethod.findById(req.params.id);

        if (method) {
            await method.deleteOne();
            res.json({ message: 'Payment method removed' });
        } else {
            res.status(404).json({ message: 'Payment method not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router;
