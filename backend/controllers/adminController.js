import User from '../models/User.js';
import Course from '../models/Course.js';
import Order from '../models/Order.js';
import Blog from '../models/Blog.js';
import Instructor from '../models/Instructor.js';

// @desc    Get dashboard stats
// @route   GET /api/admin/stats
// @access  Private/Admin
const getDashboardStats = async (req, res) => {
    try {
        // 1. Total Revenue (from active/approved orders)
        const activeOrders = await Order.find({ status: 'active' });
        const totalRevenue = activeOrders.reduce((acc, order) => acc + (order.finalPrice || order.totalToPay || 0), 0);

        // 1b. Monthly Revenue
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);

        const monthlyOrders = await Order.find({
            status: 'active',
            createdAt: { $gte: startOfMonth }
        });
        const monthlyRevenue = monthlyOrders.reduce((acc, order) => acc + (order.finalPrice || order.totalToPay || 0), 0);

        // 1c. Yearly Revenue
        const startOfYear = new Date();
        startOfYear.setMonth(0, 1);
        startOfYear.setHours(0, 0, 0, 0);

        const yearlyOrders = await Order.find({
            status: 'active',
            createdAt: { $gte: startOfYear }
        });
        const yearlyRevenue = yearlyOrders.reduce((acc, order) => acc + (order.finalPrice || order.totalToPay || 0), 0);

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

        const pendingOrderDetails = await Order.find({ status: 'pending' })
            .sort({ createdAt: -1 })
            .limit(5)
            .populate('user', 'firstName lastName email image')
            .populate('course', 'title thumbnail');

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
        const totalInstructors = await Instructor.countDocuments({});

        // 9. Total Blogs
        const totalBlogs = await Blog.countDocuments({});

        res.json({
            totalRevenue,
            monthlyRevenue,
            yearlyRevenue,
            totalStudents,
            activeStudents,
            totalCourses,
            totalOrders,
            pendingOrders,
            pendingOrderDetails,
            recentOrders,
            recentStudents,
            totalInstructors,
            totalBlogs
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

export {
    getDashboardStats
};
