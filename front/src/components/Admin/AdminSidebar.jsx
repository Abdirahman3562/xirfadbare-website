import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import {
    LayoutDashboard,
    Users,
    ShieldCheck,
    BookOpen,
    LogOut,
    X,
    Settings,
    FileText,
    GraduationCap,
    ShoppingCart,
    MessageSquare,
    MessageSquareQuote,
    MessageCircleQuestion,
    Folder,
    Newspaper,
    Mail,
    Bot,
    CreditCard
} from 'lucide-react';

const AdminSidebar = ({ isMobileOpen, closeMobileSidebar, userPermissions = [], isSuperAdmin = false }) => {
    const [settings, setSettings] = useState({
        logo: "",
        websiteTitle: "Samafale Academy"
    });
    const [unreadCount, setUnreadCount] = useState(0);

    // Auth
    const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser") || "{}");
    const token = loggedInUser.token;

    // Fetch settings & unread count
    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const response = await fetch("http://localhost:5000/api/settings");
                const data = await response.json();
                setSettings({
                    logo: data.logo || "",
                    websiteTitle: data.websiteTitle || "Samafale Academy"
                });
            } catch (error) {
                console.error("Error fetching settings:", error);
            }
        };

        const fetchUnreadCount = async () => {
            if (!token) return;
            try {
                const response = await fetch("http://localhost:5000/api/chat/unread-count", {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const data = await response.json();
                setUnreadCount(data.count || 0);
            } catch (error) {
                console.error("Error fetching unread count:", error);
            }
        };

        fetchSettings();
        fetchUnreadCount();

        const interval = setInterval(fetchUnreadCount, 10000); // Poll every 10s
        return () => clearInterval(interval);
    }, [token]);

    const menuItems = [
        { title: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/admin/dashboard', permission: 'dashboard.view' },
        { title: 'Manage Users', icon: <Users size={20} />, path: '/admin/users', permission: 'users.view' },
        { title: 'Instructors', icon: <GraduationCap size={20} />, path: '/admin/instructors', permission: 'instructors.view' },
        { title: 'Authors', icon: <FileText size={20} />, path: '/admin/authors', permission: 'authors.view' },
        { title: 'Orders', icon: <ShoppingCart size={20} />, path: '/admin/orders', permission: 'orders.view' },
        { title: 'Roles', icon: <ShieldCheck size={20} />, path: '/admin/roles', permission: 'roles.view' },
        { title: 'Manage Courses', icon: <BookOpen size={20} />, path: '/admin/courses', permission: 'courses.view' },
        { title: 'Manage Blogs', icon: <Newspaper size={20} />, path: '/admin/blogs', permission: 'blogs.view' },
        { title: 'Manage Contacts', icon: <Mail size={20} />, path: '/admin/contacts', permission: 'contacts.view' },
        {
            title: "Live Chat",
            icon: <MessageSquare size={20} />,
            path: "/admin/live-chat",
            badge: unreadCount > 0 ? unreadCount : null,
            permission: 'chat.view'
        },
        { title: "Bot Answers", icon: <Bot size={20} />, path: "/admin/bot-responses", permission: 'bot.view' },
        { title: 'Categories', icon: <Folder size={20} />, path: '/admin/categories', permission: 'categories.view' },
        { title: 'Testimonials', icon: <MessageSquareQuote size={20} />, path: '/admin/testimonials', permission: 'testimonials.view' },
        { title: 'FAQs', icon: <MessageCircleQuestion size={20} />, path: '/admin/faqs', permission: 'faqs.view' },
        { title: 'Payment Methods', icon: <CreditCard size={20} />, path: '/admin/payments', permission: 'payments.view' },
        { title: 'System Settings', icon: <Settings size={20} />, path: '/admin/system-settings', permission: 'settings.view' },
    ];

    // Filter menu items based on permissions
    const filteredMenuItems = menuItems.filter(item => {
        // Super admin sees everything
        if (isSuperAdmin) return true;
        // Dashboard is always visible to any admin-panel user
        if (item.permission === 'dashboard.view') return true;
        // Check if user has explicit permission
        return userPermissions.includes(item.permission);
    });


    const sidebarContent = (
        <div className="h-full flex flex-col bg-white border-r border-gray-100 shadow-sm">
            {/* Logo Area */}
            <div className="p-6 flex items-center justify-center border-b border-gray-50 h-[80px]">
                {settings.logo ? (
                    <img
                        src={settings.logo}
                        alt={settings.websiteTitle}
                        className="h-[80px] mt-5 ml-[-80px] object-contain hover:scale-105 transition-transform duration-300"
                    />
                ) : (
                    <h1 className="text-2xl font-black text-emerald-600 tracking-tighter cursor-pointer hover:scale-105 transition-transform duration-300 font-[Outfit]">
                        Samafale<span className="text-gray-900">Academy</span>
                    </h1>
                )}
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-1">
                {filteredMenuItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        onClick={closeMobileSidebar}
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium group ${isActive
                                ? 'bg-emerald-50 text-emerald-600 shadow-sm'
                                : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                            }`
                        }
                    >
                        <span className="transition-transform group-hover:scale-110 duration-200">
                            {item.icon}
                        </span>
                        <span>{item.title}</span>
                        {item.badge && (
                            <span className="ml-auto bg-red-500 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full min-w-[20px] h-[20px] flex items-center justify-center shadow-lg border-2 border-white animate-bounce">
                                {item.badge}
                            </span>
                        )}
                    </NavLink>
                ))}
            </nav>

            {/* Logout Area */}
            <div className="p-4 border-t border-gray-50">
                <button
                    onClick={() => {
                        localStorage.removeItem('loggedInUser');
                        window.location.href = '/login';
                    }}
                    className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-red-500 hover:bg-red-50 hover:text-red-600 transition-all duration-200 font-medium group"
                >
                    <LogOut size={20} className="group-hover:-translate-x-1 transition-transform" />
                    <span>Logout</span>
                </button>
            </div>
        </div>
    );

    return (
        <>
            {/* Desktop Sidebar */}
            <div className="hidden lg:block w-64 fixed top-0 left-0 bottom-0 z-40 bg-white">
                {sidebarContent}
            </div>

            {/* Mobile Sidebar Overlay */}
            <div
                className={`fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300 ${isMobileOpen ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'
                    }`}
                onClick={closeMobileSidebar}
            />

            {/* Mobile Sidebar */}
            <div
                className={`fixed top-0 left-0 bottom-0 w-64 bg-white z-50 lg:hidden transform transition-transform duration-300 shadow-2xl ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'
                    }`}
            >
                <div className="relative h-full">
                    {/* Close Button for Mobile */}
                    <button
                        onClick={closeMobileSidebar}
                        className="absolute top-4 right-4 p-2 text-gray-400 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <X size={20} />
                    </button>
                    {sidebarContent}
                </div>
            </div>
        </>
    );
};

export default AdminSidebar;
