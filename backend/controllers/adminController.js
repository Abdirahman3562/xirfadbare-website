import User from '../models/User.js';
import Course from '../models/Course.js';
import Order from '../models/Order.js';

// @desc    Get dashboard stats
// @route   GET /api/admin/stats
// @access  Private/Admin
const getDashboardStats = async (req, res) => {
    try {
        // 1. Total Revenue (from active/approved orders)
        // Using 'active' status as proxy for paid since isPaid isn't in schema shown
        const activeOrders = await Order.find({ status: 'active' });
        const totalRevenue = activeOrders.reduce((acc, order) => acc + (order.finalPrice || order.totalToPay || 0), 0);

        // 2. Total Students
        const totalStudents = await User.countDocuments({ role: 'student' });

        // 2b. Active Students (isActive: true)
        const activeStudents = await User.countDocuments({ role: 'student', isActive: true });

        // 3. Total Courses
        const totalCourses = await Course.countDocuments({});

        // 4. Total Orders
        const totalOrders = await Order.countDocuments({});

        // 5. Pending Orders
        const pendingOrders = await Order.countDocuments({ status: 'pending' });

        // 6. Recent Orders (last 5)
        const recentOrders = await Order.find({})
            .sort({ createdAt: -1 })
            .limit(5)
            .populate('user', 'firstName lastName email image')
            .populate('course', 'title thumbnail');

        // 7. Recent Students (last 5)
        const recentStudents = await User.find({ role: 'student' })
            .sort({ createdAt: -1 })
            .limit(5)
            .select('firstName lastName email image createdAt');

        // 8. Total Instructors
        const totalInstructors = await User.countDocuments({ role: 'instructor' });

        res.json({
            totalRevenue,
            totalStudents,
            activeStudents,
            totalCourses,
            totalOrders,
            pendingOrders,
            recentOrders,
            recentStudents,
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
