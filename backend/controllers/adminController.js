import User from '../models/User.js';
import Course from '../models/Course.js';
import Order from '../models/Order.js';

// @desc    Get dashboard stats
// @route   GET /api/admin/stats
// @access  Private/Admin
const getDashboardStats = async (req, res) => {
    try {
        // 1. Total Revenue (from paid orders)
        // Assuming 'paid' status orders contribute to revenue. 
        // You might need to adjust this logic based on your Order model/payment status.
        const paidOrders = await Order.find({ isPaid: true });
        const totalRevenue = paidOrders.reduce((acc, order) => acc + (order.totalPrice || 0), 0);

        // 2. Active Students (Count users with role 'student')
        const activeStudents = await User.countDocuments({ role: 'student' });

        // 3. Total Courses
        const totalCourses = await Course.countDocuments({});

        // 4. Total Instructors
        const totalInstructors = await User.countDocuments({ role: 'instructor' });

        res.json({
            totalRevenue,
            activeStudents,
            totalCourses,
            totalInstructors
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

export {
    getDashboardStats
};
