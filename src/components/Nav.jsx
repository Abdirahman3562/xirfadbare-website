import { useState, useEffect, useRef } from "react";
import { Link, NavLink, useNavigate, useLocation } from "react-router-dom";
import {
  Menu,
  X,
  Sun,
  Moon,
  LogIn,
  Rocket,
  Bell,
  User as UserIcon,
  LayoutDashboard,
  LogOut,
  Loader2,
  BookOpen,
  FileText,
  User,
  Settings,
  Phone,
  Info,
  Home,
} from "lucide-react";
import logo from "../assets/logo.png";

function Nav() {
  const [open, setOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [user, setUser] = useState(null);
  const [openProfile, setOpenProfile] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loadingUser, setLoadingUser] = useState(true);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  // 🌓 Dark mode
  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

  // 🔐 Load user
  useEffect(() => {
    const timer = setTimeout(() => {
      const u = localStorage.getItem("loggedInUser");
      setUser(u ? JSON.parse(u) : null);
      setLoadingUser(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  // 🚫 Redirect if already logged in
  useEffect(() => {
    const u = localStorage.getItem("loggedInUser");
    if (u && location.pathname.startsWith("/auth/")) {
      navigate("/dashboard/student", { replace: true });
    }
  }, [location, navigate]);

  // 🔁 Listen login/logout
  useEffect(() => {
    const refreshUser = () => {
      const u = localStorage.getItem("loggedInUser");
      setUser(u ? JSON.parse(u) : null);
    };
    window.addEventListener("userLogin", refreshUser);
    window.addEventListener("userLogout", refreshUser);
    return () => {
      window.removeEventListener("userLogin", refreshUser);
      window.removeEventListener("userLogout", refreshUser);
    };
  }, []);

  // ✋ Outside click close
  useEffect(() => {
    const handler = (e) => {
      if (!dropdownRef.current?.contains(e.target)) {
        setOpenProfile(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // 🚪 Logout
  const handleLogout = () => {
    // alert("Clicked logout ✅"); // test confirmation
    localStorage.removeItem("loggedInUser");
    window.dispatchEvent(new Event("userLogout"));
    setUser(null);
    setOpenProfile(false);
    setSidebarOpen(false);
    setOpen(false);
    navigate("/auth/login", { replace: true });
  };

  const initials = (user?.firstName?.[0] || "") + (user?.lastName?.[0] || "");
  const avatarInitials = (initials || "U").toUpperCase();

  const linkClass = ({ isActive }) =>
    `relative px-3 py-2 font-medium transition-all duration-200 ease-in-out ${
      isActive
        ? "text-emerald-600 after:content-[''] after:absolute after:left-0 after:bottom-0 after:w-full after:h-[2px] after:bg-emerald-500"
        : "text-gray-600 hover:text-emerald-600 after:content-[''] after:absolute after:left-0 after:bottom-0 after:w-0 after:h-[2px] after:bg-emerald-400 hover:after:w-full after:transition-all after:duration-300"
    }`;

  return (
    <nav className="bg-[#f0f7f8] shadow-sm fixed w-full top-0 z-50 border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* ✅ Logo */}
          <NavLink to="/" className="flex items-center">
            <img
              src={logo}
              alt="Logo"
              className="lg:w-[20rem] md:w-[20rem] w-[500px] mb-4 h-auto object-contain"
            />
          </NavLink>

          {/* ✅ Links - Desktop */}
          <div className="hidden md:flex items-center gap-6">
            <NavLink to="/" className={linkClass}>
              Home
            </NavLink>
            <NavLink to="/courses" className={linkClass}>
              Courses
            </NavLink>
            <NavLink to="/about" className={linkClass}>
              About
            </NavLink>
            <NavLink to="/contact" className={linkClass}>
              Contact
            </NavLink>
          </div>

          {/* ✅ Right Section */}
          <div className="hidden md:flex items-center gap-3">
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-full border border-gray-300 hover:bg-gray-100"
            >
              {darkMode ? (
                <Sun className="w-5 h-5 text-yellow-400" />
              ) : (
                <Moon className="w-5 h-5 text-emerald-600" />
              )}
            </button>

            {/* User Area */}
            {loadingUser ? (
              <div className="flex items-center gap-2 text-gray-500 text-sm">
                <Loader2 className="w-4 h-4 animate-spin text-emerald-500" />
                <span>Loading...</span>
              </div>
            ) : !user ? (
              <>
                <Link
                  to="/auth/login"
                  className="flex items-center gap-2 border border-gray-300 px-4 py-1.5 rounded-full font-medium text-emerald-600 hover:bg-gray-100"
                >
                  <LogIn className="w-4 h-4" /> Sign In
                </Link>
                <Link
                  to="/courses"
                  className="flex items-center gap-2 bg-emerald-500 text-white px-4 py-1.5 rounded-full font-medium hover:bg-emerald-600"
                >
                  <Rocket className="w-4 h-4" /> Get Started
                </Link>
              </>
            ) : (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setOpenProfile(!openProfile)}
                  className="flex items-center gap-2"
                >
                  <div className="h-8 w-8 flex  cursor-pointer items-center justify-center bg-emerald-100 rounded-full text-emerald-700 font-bold">
                    {avatarInitials}
                  </div>
                </button>
                {openProfile && (
                  <div className="absolute right-0 mt-2 w-64 bg-[#edf4f5] border border-gray-200  rounded-xl shadow-lg   p-3 z-50">
                    <div className="px-3 py-2 bg-emerald-50 text-emerald-700 mb-2 rounded">
                      <div className="font-semibold">
                        {user.firstName} {user.lastName}
                      </div>
                      <div className="text-sm text-emerald-900/70 truncate">
                        {user.email}
                      </div>
                    </div>
                    <div className="h-px  bg-gray-200 my-2 m" />
                    <Link
                      to="/dashboard/student"
                        onClick={() => setOpenProfile(false)}  // ✅ sax

                      className=" cursor-pointer w-full text-left flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-50 text-emerald-600 font-medium"
                    >
                      <LayoutDashboard size={18} />
                      Dashboard
                    </Link>

                    <button
                      onClick={handleLogout}
                      className="mt-2 cursor-pointer w-full text-left flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-50 text-emerald-600 font-medium"
                    >
                      <LogOut className="w-4 h-4" /> Log out
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ✅ Mobile */}
          <div className="md:hidden flex items-center gap-2">
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-full border border-gray-300 hover:bg-gray-100"
            >
              {darkMode ? (
                <Sun className="w-5 h-5 text-yellow-400" />
              ) : (
                <Moon className="w-5 h-5 text-emerald-600" />
              )}
            </button>

            {user ? (
              <>
                <button
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="h-8 w-8 flex items-center justify-center bg-emerald-100 rounded-full text-emerald-700 font-bold"
                >
                  {avatarInitials}
                </button>
              </>
            ) : (
              <button
                onClick={() => navigate("/auth/login")}
                className="flex items-center gap-1 px-3 py-1.5 border border-gray-300 rounded-full text-sm text-emerald-600 hover:bg-gray-100"
              >
                <LogIn size={16} /> Login
              </button>
            )}

            <button
              onClick={() => setOpen(!open)}
              className="text-emerald-600 p-2 rounded-lg hover:bg-gray-100"
            >
              {open ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="lg:hidden md:hidden fixed top-0 bottom-0 left-0 w-[300px] bg-white z-[9999] border-r border-gray-100 p-6 shadow-lg">
          {/* ✅ Mobile Menu Links */}
          <NavLink
            to="/"
            onClick={() => setOpen(false)}
            className={({ isActive }) =>
              `w-full text-left flex items-center gap-2 px-3 py-2 rounded-lg font-medium transition-all duration-200 ${
                isActive
                  ? "bg-[#e5f9f3] text-emerald-500" // Active state
                  : "text-gray-700 hover:bg-gray-50 hover:text-emerald-600"
              }`
            }
          >
            <Home size={18} />
            Home
          </NavLink>
          <NavLink
            to="/courses"
            onClick={() => setOpen(false)}
            className={({ isActive }) =>
              `w-full text-left flex items-center gap-2 px-3 py-2 rounded-lg font-medium transition-all duration-200 ${
                isActive
                  ? "bg-[#e5f9f3] text-emerald-500"
                  : "text-gray-700 hover:bg-gray-50 hover:text-emerald-600"
              }`
            }
          >
            <BookOpen size={18} />
            Courses
          </NavLink>
          <NavLink
            to="/about"
            onClick={() => setOpen(false)}
            className={({ isActive }) =>
              `w-full text-left flex items-center gap-2 px-3 py-2 rounded-lg font-medium transition-all duration-200 ${
                isActive
                  ? "bg-[#e5f9f3] text-emerald-500"
                  : "text-gray-700 hover:bg-gray-50 hover:text-emerald-600"
              }`
            }
          >
            <Info size={18} />
            About
          </NavLink>
          <NavLink
            to="/contact"
            onClick={() => setOpen(false)}
            className={({ isActive }) =>
              `w-full text-left flex items-center gap-2 px-3 py-2 rounded-lg font-medium transition-all duration-200 ${
                isActive
                  ? "bg-[#e5f9f3] text-emerald-500"
                  : "text-gray-700 hover:bg-gray-50 hover:text-emerald-600"
              }`
            }
          >
            <Phone size={18} />
            Contact
          </NavLink>
          <div className="mt-5">
            <Link
              to="/courses"
              onClick={() => setOpen(false)}
              className="flex items-center justify-center gap-2 bg-emerald-500 text-white px-4 py-2 rounded-full font-medium hover:bg-emerald-600 transition"
            >
              <Rocket className="w-4 h-4" /> Get Started
            </Link>
          </div>
        </div>
      )}

      {/* Sidebar */}
      {sidebarOpen && (
        <aside className="fixed left-0 top-0 h-screen w-64 bg-white border-r border-gray-200 z-[1000] flex flex-col">
          <div className="flex-1 overflow-y-auto py-20">
            <nav className="px-4 text-sm">
              {/* OVERVIEW */}
              <div className="mt-2">
                <p className="text-[11px] font-semibold text-gray-400 px-3 mb-1 uppercase tracking-wider">
                  Overview
                </p>
                <button className="w-full text-left flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-50 text-emerald-600 font-medium">
                  <LayoutDashboard size={18} />
                  Dashboard
                </button>
              </div>

              {/* LEARNING */}
              <div className="mt-3">
                <p className="text-[11px] font-semibold text-gray-400 px-3 mb-1 uppercase tracking-wider">
                  Learning
                </p>
                <button className="w-full text-left flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-50 text-gray-700 transition">
                  <BookOpen size={18} />
                  My Courses
                </button>
              </div>

              {/* PAYMENTS */}
              <div className="mt-3">
                <p className="text-[11px] font-semibold text-gray-400 px-3 mb-1 uppercase tracking-wider">
                  Payments
                </p>
                <button className="w-full text-left flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-50 text-gray-700 transition">
                  <FileText size={18} />
                  Orders
                </button>
              </div>

              {/* ACCOUNT */}
              <div className="mt-3">
                <p className="text-[11px] font-semibold text-gray-400 px-3 mb-1 uppercase tracking-wider">
                  Account
                </p>
                <button className="w-full text-left flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-50 text-gray-700 transition">
                  <User size={18} />
                  Profile
                </button>
                <button className="w-full text-left flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-50 text-gray-700 transition">
                  <Settings size={18} />
                  Settings
                </button>
              </div>
            </nav>
          </div>

          <div className="p-4 border-t border-gray-200">
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 bg-red-500 text-white px-4 py-1.5 rounded-md hover:bg-red-600 transition w-full"
            >
              <LogOut className="w-4 h-4" /> Logout
            </button>
          </div>
        </aside>
      )}
    </nav>
  );
}

export default Nav;
