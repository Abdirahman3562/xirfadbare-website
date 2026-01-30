import { Link, NavLink } from "react-router-dom";
import {
  BookOpen,
  LayoutDashboard,
  User,
  Settings,
  GraduationCap,
  FileText,
} from "lucide-react";

const Sidebar = () => {
  return (
    <aside
      style={{
        top: "calc(4rem + var(--top-banner-height, 0px))",
        height: "calc(100vh - 4rem - var(--top-banner-height, 0px))"
      }}
      className="hidden md:flex lg:flex fixed left-0 w-64 bg-white/10 dark:bg-slate-900 border-r-2 mt-6 border-gray-300 dark:border-slate-800 flex-col transition-all duration-300">
      <div className="flex-1 overflow-y-auto">
        {/* Navigation */}
        <nav className="px-4 text-sm">
          {/* Overview */}
          <div className="mt-2">
            <p className="text-[11px] font-semibold text-gray-400 px-3 mb-1 uppercase tracking-wider">
              Overview
            </p>
            <NavLink
              to="/dashboard/student"
              className={({ isActive }) =>
                `w-full text-left flex items-center gap-2 px-3 py-2 rounded-lg font-medium transition-all duration-200 ${isActive
                  ? "bg-[#e5f9f3] dark:bg-emerald-500/10 text-emerald-500" // Active state
                  : "text-gray-700 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-800 hover:text-emerald-600 dark:hover:text-emerald-400"
                }`
              }
            >
              <LayoutDashboard size={18} />
              Dashboard
            </NavLink>
          </div>

          {/* Learning */}
          <div className="mt-3">
            <p className="text-[11px] font-semibold text-gray-400 px-3 mb-1 uppercase tracking-wider">
              Learning
            </p>
            <NavLink
              to="/dashboard/courses"
              className={({ isActive }) =>
                `w-full text-left flex items-center gap-2 px-3 py-2 rounded-lg font-medium transition-all duration-200 ${isActive
                  ? "bg-[#e5f9f3] dark:bg-emerald-500/10 text-emerald-500" // Active state
                  : "text-gray-700 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-800 hover:text-emerald-600 dark:hover:text-emerald-400"
                }`
              }
            >
              <BookOpen size={18} />
              My Courses
            </NavLink>
            <NavLink
              to="/dashboard/certificates"
              className={({ isActive }) =>
                `w-full text-left flex items-center gap-2 px-3 py-2 rounded-lg font-medium transition-all duration-200 ${isActive
                  ? "bg-[#e5f9f3] dark:bg-emerald-500/10 text-emerald-500" // Active state
                  : "text-gray-700 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-800 hover:text-emerald-600 dark:hover:text-emerald-400"
                }`
              }
            >
              <GraduationCap size={18} />
              Certificates
            </NavLink>
          </div>

          {/* Payments */}
          <div className="mt-3">
            <p className="text-[11px] font-semibold text-gray-400 px-3 mb-1 uppercase tracking-wider">
              Payments
            </p>
            <NavLink
              to="/dashboard/orders"
              className={({ isActive }) =>
                `w-full text-left flex items-center gap-2 px-3 py-2 rounded-lg font-medium transition-all duration-200 ${isActive
                  ? "bg-[#e5f9f3] dark:bg-emerald-500/10 text-emerald-500" // Active state
                  : "text-gray-700 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-800 hover:text-emerald-600 dark:hover:text-emerald-400"
                }`
              }
            >
              <FileText size={18} />
              Orders
            </NavLink>
          </div>

          {/* Account */}
          <div className="mt-3">
            <p className="text-[11px] font-semibold text-gray-400 px-3 mb-1 uppercase tracking-wider">
              Account
            </p>
            <NavLink
              to="/dashboard/profile"
              className={({ isActive }) =>
                `w-full text-left flex items-center gap-2 px-3 py-2 rounded-lg font-medium transition-all duration-200 ${isActive
                  ? "bg-[#e5f9f3] dark:bg-emerald-500/10 text-emerald-500" // Active state
                  : "text-gray-700 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-800 hover:text-emerald-600 dark:hover:text-emerald-400"
                }`
              }
            >
              <User size={18} />
              Profile
            </NavLink>
          </div>
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;
