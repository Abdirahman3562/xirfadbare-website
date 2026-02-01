import Bundle from '../models/Bundle.js';
import Order from '../models/Order.js';
import User from '../models/User.js';
import Course from '../models/Course.js';
import sendEmail from '../utils/sendEmail.js';
import { bundleAnnouncementTemplate } from '../utils/emailTemplates.js';

// @desc    Get all bundles
// @route   GET /api/bundles
// @access  Public
const getBundles = async (req, res) => {
    try {
        const bundles = await Bundle.find({}).populate('courses', 'title price thumbnail curriculum hasCertificate accessType level technology').lean();

        const bundlesWithEnrolled = await Promise.all(bundles.map(async (bundle) => {
            const enrolledCount = await Order.countDocuments({
                bundle: bundle._id,
                status: 'active'
            });
            return { ...bundle, enrolledCount };
        }));

        res.json(bundlesWithEnrolled);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get single bundle
// @route   GET /api/bundles/:id
// @access  Public
const getBundleById = async (req, res) => {
    try {
        const bundle = await Bundle.findById(req.params.id).populate('courses').lean();
        if (bundle) {
            const enrolledCount = await Order.countDocuments({
                bundle: bundle._id,
                status: 'active'
            });
            res.json({ ...bundle, enrolledCount });
        } else {
            res.status(404).json({ message: 'Bundle not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Create bundle
// @route   POST /api/bundles
// @access  Private/Admin
const createBundle = async (req, res) => {
    try {
        const { title, description, price, courses, thumbnail } = req.body;
        const bundle = new Bundle({
            title,
            description,
            price,
            courses,
            thumbnail
        });
        const createdBundle = await bundle.save();

        // 🔹 Send automated announcement email to all students
        try {
            const students = await User.find({ role: 'student', isActive: true });

            if (students.length > 0) {
                // Get populated courses for the email template
                const populatedCourses = await Course.find({ _id: { $in: courses } }).select('title');

                // We'll send emails in background to not block the response
                students.forEach(student => {
                    sendEmail({
                        email: student.email,
                        subject: `🎁 New Bundle Alert: ${title}`,
                        html: bundleAnnouncementTemplate(createdBundle, populatedCourses, student.firstName)
                    }).catch(err => console.error(`Failed to send bundle email to ${student.email}:`, err));
                });
            }
        } catch (emailError) {
            console.error('Error in bundle announcement email flow:', emailError);
            // We don't fail the request if emails fail
        }

        res.status(201).json(createdBundle);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Update bundle
// @route   PUT /api/bundles/:id
// @access  Private/Admin
const updateBundle = async (req, res) => {
    try {
        const { title, description, price, courses, thumbnail, isActive } = req.body;
        const bundle = await Bundle.findById(req.params.id);

        if (bundle) {
            bundle.title = title || bundle.title;
            bundle.description = description || bundle.description;
            bundle.price = price !== undefined ? price : bundle.price;
            bundle.courses = courses || bundle.courses;
            bundle.thumbnail = thumbnail || bundle.thumbnail;
            bundle.isActive = isActive !== undefined ? isActive : bundle.isActive;

            const updatedBundle = await bundle.save();
            res.json(updatedBundle);
        } else {
            res.status(404).json({ message: 'Bundle not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Delete bundle
// @route   DELETE /api/bundles/:id
// @access  Private/Admin
const deleteBundle = async (req, res) => {
    try {
        const bundle = await Bundle.findById(req.params.id);
        if (bundle) {
            await bundle.deleteOne();
            res.json({ message: 'Bundle removed' });
        } else {
            res.status(404).json({ message: 'Bundle not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

export {
    getBundles,
    getBundleById,
    createBundle,
    updateBundle,
    deleteBundle
};
