import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, Link, useLocation } from 'react-router-dom';
import AdminSidebar from '../../../components/Admin/AdminSidebar';
import { Bell, Search, User, LogOut, Settings, ChevronDown, ShoppingCart, Clock, Menu } from 'lucide-react';

const AdminLayout = () => {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const [showProfileDropdown, setShowProfileDropdown] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    const [stats, setStats] = useState(null);
    const [user, setUser] = useState(JSON.parse(localStorage.getItem('loggedInUser') || '{}'));
    const navigate = useNavigate();
    const location = useLocation();

    // Close mobile sidebar on route change
    useEffect(() => {
        setIsMobileOpen(false);
    }, [location.pathname]);

    const fetchStats = async () => {
        try {
            const { getDashboardStats } = await import('../../../api/adminService');
            const data = await getDashboardStats();
            setStats(data);
        } catch (error) {
            console.error("Failed to fetch notification stats:", error);
        }
    };

    React.useEffect(() => {
        fetchStats();
        // Poll for new orders every 30 seconds
        const interval = setInterval(fetchStats, 30000);

        const syncUser = () => {
            const updatedUser = JSON.parse(localStorage.getItem('loggedInUser') || '{}');
            setUser(updatedUser);
        };

        window.addEventListener('userLogin', syncUser);
        window.addEventListener('refreshNotifications', fetchStats);

        return () => {
            window.removeEventListener('userLogin', syncUser);
            window.removeEventListener('refreshNotifications', fetchStats);
            clearInterval(interval);
        };
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('loggedInUser');
        localStorage.removeItem('token');
        navigate('/auth/login');
    };

    const getImageUrl = (image) => {
        if (!image) return null;
        if (image.startsWith('http')) return image;
        return `http://localhost:5000${image.startsWith('/') ? '' : '/'}${image}`;
    };

    const pendingCount = stats?.pendingOrders || 0;

    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* Mobile Overlay */}
            {isMobileOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 md:hidden"
                    onClick={() => setIsMobileOpen(false)}
                />
            )}

            {/* Sidebar */}
            <AdminSidebar
                isCollapsed={isCollapsed}
                isMobileOpen={isMobileOpen}
                toggleSidebar={() => setIsCollapsed(!isCollapsed)}
                closeMobileSidebar={() => setIsMobileOpen(false)}
            />

            {/* Main Content Area */}
            <div className={`flex-1 transition-all duration-300 ${isCollapsed ? 'md:ml-20' : 'md:ml-64'} ml-0 flex flex-col min-h-screen overflow-x-hidden`}>
                {/* Header */}
                <header className="h-20 bg-white border-b border-gray-100 flex items-center justify-between px-4 md:px-8 sticky top-0 z-40 gap-4 shrink-0">
                    {/* Mobile Menu Button */}
                    <button
                        onClick={() => setIsMobileOpen(true)}
                        className="p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-lg md:hidden"
                    >
                        <Menu size={24} />
                    </button>
                    <div className="hidden md:flex items-center gap-4 bg-gray-50 px-4 py-2 rounded-xl border border-gray-100 w-96">
                        <Search size={18} className="text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search anything..."
                            className="bg-transparent border-none outline-none text-sm w-full text-gray-600"
                        />
                    </div>

                    <div className="flex items-center gap-6">
                        {/* Notifications */}
                        <div className="relative">
                            <button
                                onClick={() => setShowNotifications(!showNotifications)}
                                className={`relative p-2.5 rounded-xl transition-all ${showNotifications ? 'bg-emerald-50 text-emerald-600' : 'text-gray-500 hover:bg-gray-50'}`}
                            >
                                <Bell size={22} className={pendingCount > 0 ? 'animate-bounce-subtle' : ''} />
                                {pendingCount > 0 && (
                                    <span className="absolute top-1.5 right-1.5 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full border-2 border-white flex items-center justify-center shadow-sm">
                                        {pendingCount > 9 ? '9+' : pendingCount}
                                    </span>
                                )}
                            </button>

                            {/* Notifications Dropdown */}
                            {showNotifications && (
                                <>
                                    <div className="fixed inset-0 z-10" onClick={() => setShowNotifications(false)}></div>
                                    <div className="absolute right-0 mt-3 w-80 bg-white rounded-3xl shadow-2xl border border-gray-50 py-2 z-20 animate-in fade-in slide-in-from-top-5 duration-300">
                                        <div className="px-5 py-3 border-b border-gray-50 flex items-center justify-between">
                                            <h3 className="font-bold text-gray-900">Notifications</h3>
                                            <span className="bg-emerald-50 text-emerald-600 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                                                {pendingCount} New
                                            </span>
                                        </div>
                                        <div className="max-h-[400px] overflow-y-auto scrollbar-hide">
                                            {stats?.pendingOrderDetails?.length > 0 ? (
                                                stats.pendingOrderDetails.map((order) => (
                                                    <div
                                                        key={order._id}
                                                        className="px-4 py-4 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0 group cursor-pointer"
                                                        onClick={() => {
                                                            navigate('/admin/orders');
                                                            setShowNotifications(false);
                                                        }}
                                                    >
                                                        <div className="flex items-start gap-3">
                                                            <div className="relative">
                                                                <img
                                                                    src={getImageUrl(order.userDetails?.image || order.user?.image)}
                                                                    alt=""
                                                                    className="w-10 h-10 rounded-xl object-cover border border-gray-100 shadow-sm"
                                                                />
                                                                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-amber-500 rounded-full border-2 border-white flex items-center justify-center">
                                                                    <ShoppingCart size={8} className="text-white" />
                                                                </div>
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <p className="text-xs font-bold text-gray-900 line-clamp-1">
                                                                    New order from {order.userName || `${order.userDetails?.firstName} ${order.userDetails?.lastName}`}
                                                                </p>
                                                                <p className="text-[10px] text-gray-500 font-medium truncate mt-0.5">
                                                                    Bought: {order.courseTitle || order.courseDetails?.title}
                                                                </p>
                                                                <div className="flex items-center justify-between mt-2">
                                                                    <span className="text-[10px] font-bold text-emerald-600">${order.finalPrice || order.totalToPay}</span>
                                                                    <span className="text-[9px] text-gray-400 font-medium flex items-center gap-1">
                                                                        <Clock size={10} />
                                                                        {new Date(order.createdAt).toLocaleDateString()}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="px-5 py-10 text-center">
                                                    <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
                                                        <Bell size={20} className="text-gray-300" />
                                                    </div>
                                                    <p className="text-sm text-gray-400 font-medium">No new notifications</p>
                                                </div>
                                            )}
                                        </div>
                                        <Link
                                            to="/admin/orders"
                                            onClick={() => setShowNotifications(false)}
                                            className="block text-center py-3 text-xs font-bold text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50/50 transition-colors mt-1"
                                        >
                                            View All Orders
                                        </Link>
                                    </div>
                                </>
                            )}
                        </div>

                        <div className="h-8 w-[1px] bg-gray-100 mx-2"></div>

                        {/* Profile Section */}
                        <div className="relative">
                            <button
                                onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                                className="flex items-center gap-3 p-1.5 hover:bg-gray-50 rounded-2xl transition-all group"
                            >
                                <div className="text-right hidden sm:block">
                                    <p className="text-sm font-bold text-gray-900 leading-tight">
                                        {user.firstName} {user.lastName}
                                    </p>
                                    <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">
                                        {user.role}
                                    </p>
                                </div>
                                <div className="relative">
                                    {user.image ? (
                                        <img
                                            src={getImageUrl(user.image)}
                                            alt="Profile"
                                            className="w-10 h-10 rounded-xl object-cover border-2 border-white shadow-sm"
                                        />
                                    ) : (
                                        <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600">
                                            <User size={20} />
                                        </div>
                                    )}
                                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-white rounded-full border border-gray-100 flex items-center justify-center shadow-sm">
                                        <ChevronDown size={10} className={`text-gray-400 transition-transform ${showProfileDropdown ? 'rotate-180' : ''}`} />
                                    </div>
                                </div>
                            </button>

                            {/* Dropdown Menu */}
                            {showProfileDropdown && (
                                <>
                                    <div
                                        className="fixed inset-0 z-10"
                                        onClick={() => setShowProfileDropdown(false)}
                                    ></div>
                                    <div className="absolute right-0 mt-3 w-56 bg-white rounded-2xl shadow-xl border border-gray-50 py-2 z-20 animate-in fade-in zoom-in-95 duration-200">
                                        <div className="px-4 py-3 border-b border-gray-50 mb-1">
                                            <p className="text-xs text-gray-400 font-medium">Logged in as</p>
                                            <p className="text-sm font-bold text-gray-900 truncate">{user.email}</p>
                                        </div>
                                        <Link
                                            to="/admin/profile"
                                            onClick={() => setShowProfileDropdown(false)}
                                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 hover:text-emerald-600 transition-colors"
                                        >
                                            <Settings size={18} />
                                            <span>Profile Settings</span>
                                        </Link>
                                        <button
                                            onClick={handleLogout}
                                            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors"
                                        >
                                            <LogOut size={18} />
                                            <span>Logout</span>
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </header>

                {/* Content Section */}
                <main className="flex-1 p-4 md:p-8 min-w-0">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;
