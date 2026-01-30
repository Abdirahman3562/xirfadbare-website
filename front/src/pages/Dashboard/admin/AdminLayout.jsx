import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, Link, useLocation } from 'react-router-dom';
import AdminSidebar from '../../../components/Admin/AdminSidebar';
import { useTheme } from '../../../contexts/ThemeContext';
import { Bell, Search, User, LogOut, Settings, ChevronDown, ShoppingCart, Clock, Menu, Sun, Moon, Monitor } from 'lucide-react';


const AdminLayout = () => {
    const { theme, setTheme } = useTheme();
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const [showProfileDropdown, setShowProfileDropdown] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    const [userPermissions, setUserPermissions] = useState([]);
    const [isSuperAdmin, setIsSuperAdmin] = useState(false);
    const [stats, setStats] = useState(null);
    const [user, setUser] = useState(JSON.parse(localStorage.getItem('loggedInUser') || '{}'));
    // const [theme, setTheme] = useState(localStorage.getItem("theme") || "light"); // Removed local state
    const [openTheme, setOpenTheme] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    // Permission Map
    const PERMISSION_MAP = {
        '/admin/users': 'users.view',
        '/admin/instructors': 'instructors.view',
        '/admin/authors': 'authors.view',
        '/admin/orders': 'orders.view',
        '/admin/roles': 'roles.view',
        '/admin/roles/create': 'roles.create',
        '/admin/roles/edit/:id': 'roles.edit',
        '/admin/courses': 'courses.view',
        '/admin/blogs': 'blogs.view',
        '/admin/contacts': 'contacts.view',
        '/admin/live-chat': 'chat.view',
        '/admin/bot-responses': 'bot.view',
        '/admin/categories': 'categories.view',
        '/admin/testimonials': 'testimonials.view',
        '/admin/faqs': 'faqs.view',
        '/admin/payments': 'payments.view',
        '/admin/system-settings': 'settings.view',
    };

    const fetchStats = async () => {
        try {
            const { getDashboardStats } = await import('../../../api/adminService');
            const data = await getDashboardStats();
            setStats(data);
        } catch (error) {
            console.error("Failed to fetch notification stats:", error);
        }
    };

    const fetchUserProfile = async () => {
        const token = user?.token;
        if (!token) return;
        try {
            const response = await fetch("http://localhost:5000/api/users/profile", {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            setUserPermissions(data.permissions || []);
            setIsSuperAdmin(data.isSuperAdmin || data.role === 'admin');
        } catch (error) {
            console.error("Error fetching profile:", error);
        }
    };

    useEffect(() => {
        fetchStats();
        fetchUserProfile();

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

    // 🌓 Theme handling (Removed - handled by Context)

    // Route Protection
    useEffect(() => {
        if (isSuperAdmin) return;

        const currentPath = location.pathname;

        // Find if current path matches any pattern in PERMISSION_MAP
        let requiredPermission = null;

        // 1. Exact match
        if (PERMISSION_MAP[currentPath]) {
            requiredPermission = PERMISSION_MAP[currentPath];
        } else {
            // 2. Pattern match (e.g., /admin/roles/edit/:id)
            Object.keys(PERMISSION_MAP).forEach(pattern => {
                const regexPattern = pattern.replace(/:\w+/g, '[^/]+');
                const regex = new RegExp(`^${regexPattern}$`);
                if (regex.test(currentPath)) {
                    requiredPermission = PERMISSION_MAP[pattern];
                }
            });
        }

        if (requiredPermission && !userPermissions.includes(requiredPermission)) {
            // Redirect to dashboard if they don't have access
            // Skip redirect if already on dashboard or profile
            if (currentPath !== '/admin/dashboard' && currentPath !== '/admin/profile') {
                navigate('/admin/dashboard');
            }
        }
    }, [location.pathname, userPermissions, isSuperAdmin]);

    // Close mobile sidebar on route change
    useEffect(() => {
        setIsMobileOpen(false);
    }, [location.pathname]);

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
        <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex transition-colors duration-300">
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
                userPermissions={userPermissions}
                isSuperAdmin={isSuperAdmin}
                toggleSidebar={() => setIsCollapsed(!isCollapsed)}
                closeMobileSidebar={() => setIsMobileOpen(false)}
            />

            {/* Main Content Area */}
            <div className={`flex-1 transition-all duration-300 ${isCollapsed ? 'md:ml-20' : 'md:ml-64'} ml-0 flex flex-col min-h-screen overflow-x-hidden`}>
                {/* Header */}
                <header className="h-20 bg-white dark:bg-slate-900 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between px-4 md:px-8 sticky top-0 z-40 gap-4 shrink-0 transition-colors duration-300">
                    {/* Mobile Menu Button */}
                    <button
                        onClick={() => setIsMobileOpen(true)}
                        className="p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-lg md:hidden"
                    >
                        <Menu size={24} />
                    </button>
                    <div className="hidden md:flex items-center gap-4 bg-gray-50 dark:bg-slate-800 px-4 py-2 rounded-xl border border-gray-100 dark:border-gray-700 w-96 transition-colors duration-300">
                        <Search size={18} className="text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search anything..."
                            className="bg-transparent border-none outline-none text-sm w-full text-gray-600 dark:text-gray-300 placeholder-gray-400"
                        />
                    </div>

                    <div className="flex items-center gap-4 md:gap-6">
                        {/* Theme Toggle */}
                        <div className="relative">
                            <button
                                onClick={() => setOpenTheme(!openTheme)}
                                className="p-2.5 rounded-xl text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors"
                            >
                                {theme === "light" && <Sun className="w-5 h-5 text-emerald-600" />}
                                {theme === "dark" && <Moon className="w-5 h-5 text-emerald-400" />}
                                {theme === "system" && <Monitor className="w-5 h-5 text-blue-500" />}
                            </button>

                            {openTheme && (
                                <>
                                    <div className="fixed inset-0 z-10" onClick={() => setOpenTheme(false)}></div>
                                    <div className="absolute right-0 mt-3 w-40 bg-white dark:bg-slate-900 border border-gray-100 dark:border-gray-800 rounded-2xl shadow-2xl p-2 z-20 animate-in fade-in zoom-in slide-in-from-top-2 duration-300">
                                        <button
                                            onClick={() => { setTheme("light"); setOpenTheme(false); }}
                                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${theme === "light" ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400" : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-800"}`}
                                        >
                                            <Sun size={18} />
                                            Light
                                        </button>
                                        <button
                                            onClick={() => { setTheme("dark"); setOpenTheme(false); }}
                                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${theme === "dark" ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400" : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-800"}`}
                                        >
                                            <Moon size={18} />
                                            Dark
                                        </button>
                                        <button
                                            onClick={() => { setTheme("system"); setOpenTheme(false); }}
                                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${theme === "system" ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400" : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-800"}`}
                                        >
                                            <Monitor size={18} />
                                            System
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Notifications */}
                        <div className="relative">
                            <button
                                onClick={() => setShowNotifications(!showNotifications)}
                                className={`relative p-2.5 rounded-xl transition-all ${showNotifications ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-800'}`}
                            >
                                <Bell size={22} className={pendingCount > 0 ? 'animate-bounce-subtle' : ''} />
                                {pendingCount > 0 && (
                                    <span className="absolute top-1.5 right-1.5 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full border-2 border-white dark:border-slate-900 flex items-center justify-center shadow-sm">
                                        {pendingCount > 9 ? '9+' : pendingCount}
                                    </span>
                                )}
                            </button>

                            {/* Notifications Dropdown */}
                            {showNotifications && (
                                <>
                                    <div className="fixed inset-0 z-10" onClick={() => setShowNotifications(false)}></div>
                                    <div className="fixed top-22 left-4 right-4 sm:absolute sm:top-full sm:right-0 sm:left-auto sm:w-80 bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-gray-50 dark:border-gray-800 py-2 z-50 animate-in fade-in slide-in-from-top-5 duration-300">
                                        <div className="px-5 py-3 border-b border-gray-50 dark:border-gray-800 flex items-center justify-between">
                                            <h3 className="font-bold text-gray-900 dark:text-white">Notifications</h3>
                                            <span className="bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                                                {pendingCount} New
                                            </span>
                                        </div>
                                        <div className="max-h-[400px] overflow-y-auto scrollbar-hide">
                                            {stats?.pendingOrderDetails?.length > 0 ? (
                                                stats.pendingOrderDetails.map((order) => (
                                                    <div
                                                        key={order._id}
                                                        className="px-4 py-4 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors border-b border-gray-50 dark:border-gray-800 last:border-0 group cursor-pointer"
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
                                                                <p className="text-xs font-bold text-gray-900 dark:text-white line-clamp-1">
                                                                    New order from {order.userName || `${order.userDetails?.firstName} ${order.userDetails?.lastName}`}
                                                                </p>
                                                                <p className="text-[10px] text-gray-500 dark:text-gray-400 font-medium truncate mt-0.5">
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

                        <div className="h-8 w-[1px] bg-gray-100 dark:bg-gray-800 mx-2"></div>

                        {/* Profile Section */}
                        <div className="relative">
                            <button
                                onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                                className="flex items-center gap-3 p-1.5 hover:bg-gray-50 dark:hover:bg-slate-800 rounded-2xl transition-all group"
                            >
                                <div className="text-right hidden sm:block">
                                    <p className="text-sm font-bold text-gray-900 dark:text-white leading-tight">
                                        {user.firstName} {user.lastName}
                                    </p>
                                    <p className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
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
                                    <div className="absolute right-0 mt-3 w-56 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-gray-50 dark:border-gray-800 py-2 z-20 animate-in fade-in zoom-in-95 duration-200">
                                        <div className="px-4 py-3 border-b border-gray-50 dark:border-gray-800 mb-1">
                                            <p className="text-xs text-gray-400 dark:text-gray-500 font-medium">Logged in as</p>
                                            <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{user.email}</p>
                                        </div>
                                        <Link
                                            to="/admin/profile"
                                            onClick={() => setShowProfileDropdown(false)}
                                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                                        >
                                            <Settings size={18} />
                                            <span>Profile Settings</span>
                                        </Link>
                                        <button
                                            onClick={handleLogout}
                                            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
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
