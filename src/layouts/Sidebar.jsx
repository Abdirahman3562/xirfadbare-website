import { Link } from "react-router-dom";
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
    <aside className="hidden md:flex lg:flex fixed left-0 top-0 h-screen w-64 bg-white border-r border-gray-200 flex-col">
      <div className="flex-1 overflow-y-auto">
        {/* Brand */}
        <div className="p-6 font-bold text-emerald-600 text-2xl flex items-center gap-2">
          <GraduationCap className="w-6 h-6 text-emerald-600" />
          Xirfadbare
        </div>

        {/* Navigation */}
        <nav className="px-4 text-sm">
          {/* Overview */}
          <div className="mt-2">
            <p className="text-[11px] font-semibold text-gray-400 px-3 mb-1 uppercase tracking-wider">
              Overview
            </p>
            <Link
              to="/dashboard/student"
              className="w-full text-left flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-50 text-emerald-600 font-medium"
            >
              <LayoutDashboard size={18} />
              Dashboard
            </Link>
          </div>

          {/* Learning */}
          <div className="mt-3">
            <p className="text-[11px] font-semibold text-gray-400 px-3 mb-1 uppercase tracking-wider">
              Learning
            </p>
            <Link
              to="/dashboard/courses"
              className="w-full text-left flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-50 text-gray-700 transition"
            >
              <BookOpen size={18} />
              My Courses
            </Link>
          </div>

          {/* Payments */}
          <div className="mt-3">
            <p className="text-[11px] font-semibold text-gray-400 px-3 mb-1 uppercase tracking-wider">
              Payments
            </p>
            <Link
              to="/dashboard/orders"

            className="w-full text-left flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-50 text-gray-700 transition">
              <FileText size={18} />
              Orders
            </Link>
          </div>

          {/* Account */}
          <div className="mt-3">
            <p className="text-[11px] font-semibold text-gray-400 px-3 mb-1 uppercase tracking-wider">
              Account
            </p>
            <Link
              to="/dashboard/profile"
              className="w-full text-left flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-50 text-gray-700 transition"
            >
              <User size={18} />
              Profile
            </Link>
           
          </div>
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;
