import React, { useEffect, useState } from 'react';
import {
    Users,
    BookOpen,
    ShoppingCart,
    TrendingUp,
    ArrowUpRight,
    ArrowDownRight,
    UserCheck,
    Package,
    Clock,
    ExternalLink,
    PlusCircle,
    Calendar,
    GraduationCap,
    Newspaper
} from 'lucide-react';
import { motion } from 'framer-motion';
import { getImageUrl } from '../../../utils/format';
import { Link } from 'react-router-dom';
import { usePermissions } from '../../../hooks/usePermissions';
import { getDashboardStats } from '../../../api/adminService';
import PremiumLoader from '../../../components/ui/PremiumLoader';

const AdminDashboard = () => {
    const { hasPermission, loading: permissionsLoading } = usePermissions();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const data = await getDashboardStats();
                setStats(data);
            } catch (error) {
                console.error("Failed to fetch stats:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1
        }
    };

    if (loading || permissionsLoading) {
        return <PremiumLoader text="Loading Dashboard..." />;
    }

    const allStats = [
        {
            label: 'Total Students',
            value: stats?.totalStudents || 0,
            icon: <Users className="text-blue-600" size={24} />,
            bg: 'bg-blue-50',
            change: '+12%',
            up: true,
            permission: 'users.view'
        },
        {
            label: 'Monthly Revenue',
            value: `$${(stats?.monthlyRevenue || 0).toLocaleString()}`,
            icon: <ArrowUpRight className="text-emerald-600" size={24} />,
            bg: 'bg-emerald-50',
            change: 'This Month',
            up: true,
            permission: 'orders.view'
        },
        {
            label: 'Yearly Revenue',
            value: `$${(stats?.yearlyRevenue || 0).toLocaleString()}`,
            icon: <TrendingUp className="text-blue-600" size={24} />,
            bg: 'bg-blue-50',
            change: 'This Year',
            up: true,
            permission: 'orders.view'
        },
        {
            label: 'Total Revenue',
            value: `$${(stats?.totalRevenue || 0).toLocaleString()}`,
            icon: <Package className="text-emerald-600" size={24} />,
            bg: 'bg-emerald-50',
            change: 'Lifetime',
            up: true,
            permission: 'orders.view'
        },
        {
            label: 'Total Instructors',
            value: stats?.totalInstructors || 0,
            icon: <GraduationCap className="text-purple-600" size={24} />,
            bg: 'bg-purple-50',
            change: 'Verified',
            up: true,
            permission: 'instructors.view'
        },
        {
            label: 'Active Courses',
            value: stats?.totalCourses || 0,
            icon: <BookOpen className="text-pink-600" size={24} />,
            bg: 'bg-pink-50',
            change: '+4%',
            up: true,
            permission: 'courses.view'
        },
        {
            label: 'Total Orders',
            value: stats?.totalOrders || 0,
            icon: <ShoppingCart className="text-orange-600" size={24} />,
            bg: 'bg-orange-50',
            change: '+22%',
            up: true,
            permission: 'orders.view'
        },
        {
            label: 'Total Blogs',
            value: stats?.totalBlogs || 0,
            icon: <Newspaper className="text-indigo-600" size={24} />,
            bg: 'bg-indigo-50',
            change: 'Published',
            up: true,
            permission: 'blogs.view'
        },
    ];

    const mainStats = allStats.filter(s => hasPermission(s.permission) || hasPermission('dashboard.view'));

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-8 pb-10"
        >
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Dashboard Overview</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-2">
                        <Calendar size={16} />
                        {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    {hasPermission('courses.create') && (
                        <Link
                            to="/admin/courses/create/new"
                            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl font-medium transition shadow-sm"
                        >
                            <PlusCircle size={18} />
                            New Course
                        </Link>
                    )}
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {mainStats.map((stat, idx) => (
                    <motion.div
                        key={idx}
                        variants={itemVariants}
                        className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-xl transition-all duration-300 group relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 p-8 transform translate-x-4 -translate-y-4 opacity-5 group-hover:scale-150 transition-transform duration-500">
                            {stat.icon}
                        </div>
                        <div className="flex items-center justify-between mb-4 relative z-10">
                            <div className={`p-4 rounded-2xl ${stat.bg} group-hover:scale-110 transition-transform duration-300`}>
                                {stat.icon}
                            </div>
                            <div className={`flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full ${stat.up ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'
                                }`}>
                                {stat.up ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                                {stat.change}
                            </div>
                        </div>
                        <p className="text-gray-500 dark:text-gray-400 text-sm font-semibold uppercase tracking-wider">{stat.label}</p>
                        <h3 className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{stat.value}</h3>
                    </motion.div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Recent Orders */}
                {(hasPermission('orders.view') || hasPermission('dashboard.view')) ? (
                    <motion.div
                        variants={itemVariants}
                        className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden"
                    >
                        <div className="p-6 border-b border-gray-50 dark:border-gray-700 flex items-center justify-between">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                <Package className="text-emerald-500" size={22} />
                                Recent Orders
                            </h3>
                            <Link to="/admin/orders" className="text-emerald-600 hover:text-emerald-700 text-sm font-bold flex items-center gap-1">
                                View All <ExternalLink size={14} />
                            </Link>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="bg-gray-50 dark:bg-slate-900/50 text-gray-500 dark:text-gray-400 text-[11px] uppercase tracking-widest font-bold">
                                        <th className="px-6 py-4">Course</th>
                                        <th className="px-6 py-4">Student</th>
                                        <th className="px-6 py-4">Amount</th>
                                        <th className="px-6 py-4">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {stats?.recentOrders?.map((order) => (
                                        <tr key={order._id} className="hover:bg-gray-50/50 dark:hover:bg-slate-700/50 transition-colors group">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <img
                                                        src={getImageUrl(order.courseDetails?.thumbnail || order.image)}
                                                        alt=""
                                                        className="w-10 h-10 rounded-lg object-cover shadow-sm"
                                                    />
                                                    <div>
                                                        <p className="text-sm font-bold text-gray-900 dark:text-white line-clamp-1">{order.courseTitle || order.courseDetails?.title}</p>
                                                        <p className="text-[10px] text-gray-400 dark:text-gray-500 font-medium">{new Date(order.createdAt).toLocaleDateString()}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    {/* Student Image or Initial */}
                                                    {(order.userDetails?.image || order.user?.image) ? (
                                                        <img
                                                            src={getImageUrl(order.userDetails?.image || order.user?.image)}
                                                            alt=""
                                                            className="w-8 h-8 rounded-full object-cover border border-gray-100 dark:border-gray-700 shadow-sm"
                                                        />
                                                    ) : (
                                                        <div className="w-8 h-8 bg-emerald-50 rounded-full flex items-center justify-center text-[10px] font-bold text-emerald-600 uppercase border border-emerald-100">
                                                            {order.userDetails?.firstName?.[0] || order.userName?.[0] || 'U'}
                                                        </div>
                                                    )}
                                                    <span className="text-sm text-gray-600 dark:text-gray-300 font-medium">{order.userName || `${order.userDetails?.firstName} ${order.userDetails?.lastName}`}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-sm font-bold text-gray-900 dark:text-white">${(order.finalPrice || order.totalToPay || 0).toLocaleString()}</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${order.status === 'active' ? 'bg-emerald-50 text-emerald-600' :
                                                    order.status === 'pending' ? 'bg-amber-50 text-amber-600' : 'bg-red-50 text-red-600'
                                                    }`}>
                                                    <span className={`w-1.5 h-1.5 rounded-full ${order.status === 'active' ? 'bg-emerald-500' :
                                                        order.status === 'pending' ? 'bg-amber-500' : 'bg-red-500'
                                                        }`}></span>
                                                    {order.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        {(stats?.recentOrders?.length === 0) && (
                            <div className="p-10 text-center">
                                <p className="text-gray-400 font-medium italic">No orders found.</p>
                            </div>
                        )}
                    </motion.div>
                ) : (
                    <div className="lg:col-span-2 bg-white rounded-3xl border border-dashed border-gray-200 p-20 flex flex-col items-center justify-center text-center">
                        <Package size={48} className="text-gray-200 mb-4" />
                        <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Sales activity Restricted</p>
                    </div>
                )}

                {/* New Students */}
                {(hasPermission('users.view') || hasPermission('dashboard.view')) ? (
                    <motion.div
                        variants={itemVariants}
                        className="bg-white dark:bg-slate-800 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden"
                    >
                        <div className="p-6 border-b border-gray-50 dark:border-gray-700">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                <UserCheck className="text-blue-500" size={22} />
                                New Students
                            </h3>
                        </div>
                        <div className="p-6 space-y-6">
                            {stats?.recentStudents?.map((student) => (
                                <div key={student._id} className="flex items-center justify-between group">
                                    <div className="flex items-center gap-3">
                                        <div className="relative">
                                            {student.image ? (
                                                <img
                                                    src={getImageUrl(student.image)}
                                                    alt=""
                                                    className="w-12 h-12 rounded-2xl object-cover border-2 border-white shadow-sm group-hover:scale-105 transition-transform"
                                                />
                                            ) : (
                                                <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-sm font-bold text-blue-600 border-2 border-white shadow-sm">
                                                    {student.firstName?.[0]}{student.lastName?.[0]}
                                                </div>
                                            )}
                                            <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full"></span>
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-bold text-gray-900 dark:text-white">{student.firstName} {student.lastName}</h4>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[120px]">{student.email}</p>
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end">
                                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider flex items-center gap-1">
                                            <Clock size={10} />
                                            Joined
                                        </p>
                                        <p className="text-[11px] font-bold text-gray-600 dark:text-gray-300">
                                            {new Date(student.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                        </p>
                                    </div>
                                </div>
                            ))}
                            {(stats?.recentStudents?.length === 0) && (
                                <p className="text-center text-gray-400 italic py-10">No new students recently.</p>
                            )}
                        </div>
                        <div className="p-6 pt-0 mt-4">
                            <div className="bg-gray-50 dark:bg-slate-700/30 rounded-2xl p-4 border border-dashed border-gray-200 dark:border-gray-700">
                                <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest text-center mb-1">Pending Approval</p>
                                <div className="text-2xl font-black text-amber-600 text-center">
                                    {stats?.pendingOrders || 0}
                                </div>
                                <p className="text-[10px] text-gray-400 dark:text-gray-500 text-center mt-1">Orders waiting for manual review</p>
                            </div>
                        </div>
                    </motion.div>
                ) : (
                    <div className="bg-white rounded-3xl border border-dashed border-gray-200 p-20 flex flex-col items-center justify-center text-center">
                        <Users size={48} className="text-gray-200 mb-4" />
                        <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">User Data Restricted</p>
                    </div>
                )}
            </div>
        </motion.div>
    );
};

export default AdminDashboard;
