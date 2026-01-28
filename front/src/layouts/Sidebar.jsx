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
    <aside className="hidden md:flex lg:flex fixed left-0 top-16 h-[calc(100vh-64px)] w-64 bg-white border-r border-gray-200 flex-col">
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
                  ? "bg-[#e5f9f3] text-emerald-500" // Active state
                  : "text-gray-700 hover:bg-gray-50 hover:text-emerald-600"
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
                  ? "bg-[#e5f9f3] text-emerald-500" // Active state
                  : "text-gray-700 hover:bg-gray-50 hover:text-emerald-600"
                }`
              }
            >
              <BookOpen size={18} />
              My Courses
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
                  ? "bg-[#e5f9f3] text-emerald-500" // Active state
                  : "text-gray-700 hover:bg-gray-50 hover:text-emerald-600"
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
                  ? "bg-[#e5f9f3] text-emerald-500" // Active state
                  : "text-gray-700 hover:bg-gray-50 hover:text-emerald-600"
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
