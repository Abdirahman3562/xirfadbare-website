import { useState, useEffect, useRef } from "react";
import { Link, NavLink, useNavigate, useLocation } from "react-router-dom";
import {
  Menu, X, Sun, Moon, LogIn, Rocket, Bell, User as UserIcon, LayoutDashboard, LogOut, Loader2, BookOpen, FileText, User, Settings, Phone, Info, Home, Monitor, Award, Layers
} from "lucide-react";
import defaultLogo from "../assets/logo.png";
import { useData } from "../contexts/DataContext";
import { useTheme } from "../contexts/ThemeContext";
import { getImageUrl } from "../utils/format";
import { API_BASE_URL, SERVER_URL } from "../config";


function Nav() {
  const { theme, setTheme } = useTheme();
  const { settings } = useData();
  const [open, setOpen] = useState(false);
  const [openTheme, setOpenTheme] = useState(false);
  const [user, setUser] = useState(null);
  const [openProfile, setOpenProfile] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loadingUser, setLoadingUser] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const dropdownRef = useRef(null);
  const themeRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  // 🎨 Scroll animation
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // 🔐 Load user
  useEffect(() => {
    const u = localStorage.getItem("loggedInUser");
    if (u) {
      setUser(JSON.parse(u));
    }
    setLoadingUser(false);
  }, []);

  // 🚫 Redirect if already logged in
  useEffect(() => {
    const u = localStorage.getItem("loggedInUser");
    if (u && location.pathname.startsWith("/auth/")) {
      const parsedUser = JSON.parse(u);
      const isStaff = parsedUser.role === "admin" || (parsedUser.permissions && parsedUser.permissions.length > 0);

      if (isStaff) {
        if (parsedUser.role === 'instructor') {
          navigate("/instructor/dashboard", { replace: true });
        } else {
          navigate("/admin/dashboard", { replace: true });
        }
      } else {
        navigate("/dashboard/student", { replace: true });
      }
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
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpenProfile(false);
      }
      if (themeRef.current && !themeRef.current.contains(e.target)) {
        setOpenTheme(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // 🚪 Logout
  const handleLogout = () => {
    // alert("Clicked logout ✅"); // test confirmation
    localStorage.removeItem("loggedInUser");
    localStorage.removeItem("samafale_data_cache");
    localStorage.removeItem("user_profile_cache");
    localStorage.removeItem("enrolled_data");

    window.dispatchEvent(new Event("userLogout"));
    setUser(null);
    setOpenProfile(false);
    setSidebarOpen(false);
    setOpen(false);
    setTheme("light");
    navigate("/auth/login", { replace: true });
  };

  const initials = (user?.firstName?.[0] || "") + (user?.lastName?.[0] || "");

  // ✅ Optimized Logo Source: Use context, fallback to direct cache, then default
  const logoSrc = getImageUrl(settings?.logo) ||
    getImageUrl(JSON.parse(localStorage.getItem('samafale_data_cache') || '{}')?.settings?.logo) ||
    defaultLogo;

  const avatar = getImageUrl(user?.image || localStorage.getItem("profileImage"));

  const linkClass = ({ isActive }) =>
    `relative px-3 py-2 font-medium transition-all duration-200 ease-in-out ${isActive
      ? "text-emerald-600 dark:text-emerald-400 after:content-[''] after:absolute after:left-0 after:bottom-0 after:w-full after:h-[2px] after:bg-emerald-500"
      : "text-gray-600 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 after:content-[''] after:absolute after:left-0 after:bottom-0 after:w-0 after:h-[2px] after:bg-emerald-400 hover:after:w-full after:transition-all after:duration-300"
    }`;

  const isStaff = user?.role === "admin" || (user?.permissions && user?.permissions.length > 0);
  const dashboardLink = isStaff
    ? (user?.role === 'instructor' ? "/instructor/dashboard" : "/admin/dashboard")
    : "/dashboard/student";

  return (
    <nav
      style={{ top: "var(--top-banner-height, 0px)" }}
      className={`bg-[#f0f7f8] dark:bg-slate-900 shadow-sm fixed w-full left-0 z-50 border-b border-gray-100 dark:border-gray-800 transition-all duration-300 ${scrolled ? "py-2 shadow-lg dark:shadow-emerald-950/20" : "py-0"
        }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`flex justify-between items-center transition-all duration-300 ${scrolled ? "h-14" : "h-16"
          }`}>
          {/* ✅ Logo */}
          <NavLink to="/" className="flex items-center gap-2 ml-[40px] mt-4">
            <img
              src={logoSrc}
              alt={settings.websiteTitle}
              className={`object-contain transition-all duration-300 ${scrolled ? "h-10 w-auto" : "h-12 w-auto"
                }`}
            />
            {/* Tagline removed */}
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
            <NavLink to="/blog" className={linkClass}>
              Blog
            </NavLink>
            <NavLink to="/contact" className={linkClass}>
              Contact
            </NavLink>
          </div>

          {/* ✅ Right Section */}
          <div className="hidden md:flex items-center gap-3">
            {/* Theme Switcher Dropdown */}
            <div className="relative" ref={themeRef}>
              <button
                onClick={() => setOpenTheme(!openTheme)}
                className="p-2 rounded-full cursor-pointer border border-gray-300 hover:bg-gray-100 transition-colors text-emerald-600 dark:text-emerald-400 dark:border-gray-600 dark:hover:bg-gray-800"
              >
                {theme === "light" && <Sun className="w-5 h-5" />}
                {theme === "dark" && <Moon className="w-5 h-5" />}
                {theme === "system" && <Monitor className="w-5 h-5" />}
              </button>

              {openTheme && (
                <div className="absolute right-0 mt-2 w-40 bg-white/10 border border-gray-300 dark:bg-slate-900/50 backdrop-blur-xl rounded-2xl shadow-2xl p-2 z-[60] animate-in fade-in zoom-in slide-in-from-top-2 duration-300">
                  <button
                    onClick={() => { setTheme("light"); setOpenTheme(false); }}
                    className={`w-full flex items-center cursor-pointer gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${theme === "light" ? "bg-emerald-50/50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400" : "text-gray-600 dark:text-gray-400 hover:bg-white/10 dark:hover:bg-gray-800"}`}
                  >
                    <Sun size={18} />
                    Light
                  </button>
                  <button
                    onClick={() => { setTheme("dark"); setOpenTheme(false); }}
                    className={`w-full flex items-center cursor-pointer gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${theme === "dark" ? "bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400" : "text-gray-600 dark:text-gray-400 hover:bg-white/10 dark:hover:bg-gray-800"}`}
                  >
                    <Moon size={18} />
                    Dark
                  </button>
                  <button
                    onClick={() => { setTheme("system"); setOpenTheme(false); }}
                    className={`w-full flex items-center cursor-pointer gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${theme === "system" ? "bg-emerald-50/50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400" : "text-gray-600 dark:text-gray-400 hover:bg-white/10 dark:hover:bg-gray-800"}`}
                  >
                    <Monitor size={18} />
                    System
                  </button>
                </div>
              )}
            </div>

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
                  {avatar ? (
                    <img
                      src={avatar}
                      alt="User avatar"
                      className="h-8 w-8 cursor-pointer rounded-full object-cover border border-emerald-300"
                    />
                  ) : (
                    <div className="h-8 w-8 flex items-center justify-center bg-emerald-100 rounded-full text-emerald-700 font-bold">
                      {initials}
                    </div>
                  )}
                </button>
                {openProfile && (
                  <div className="absolute right-0 mt-2 w-64 bg-[#edf4f5] dark:bg-slate-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-lg p-3 z-50">
                    <div className="px-3 py-2 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 mb-2 rounded">
                      <div className="font-semibold">
                        {user.firstName} {user.lastName}
                      </div>
                      <div className="text-sm text-emerald-900/70 dark:text-emerald-400/70 truncate">
                        {user.email}
                      </div>
                    </div>
                    <div className="h-px bg-gray-200 dark:bg-gray-800 my-2" />
                    <Link
                      to={dashboardLink}
                      onClick={() => setOpenProfile(false)}
                      className="cursor-pointer w-full text-left flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-medium hover:bg-emerald-100 dark:hover:bg-emerald-500/20"
                    >
                      <LayoutDashboard size={18} />
                      Dashboard
                    </Link>

                    <button
                      onClick={handleLogout}
                      className="mt-2 cursor-pointer w-full text-left flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-medium hover:bg-emerald-100 dark:hover:bg-emerald-500/20"
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
              onClick={() => {
                const themes = ['light', 'dark', 'system'];
                const next = themes[(themes.indexOf(theme) + 1) % themes.length];
                setTheme(next);
              }}
              className="p-2 rounded-full border border-gray-300 hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-800 text-emerald-600 dark:text-emerald-400"
            >
              {theme === "light" && <Sun className="w-5 h-5" />}
              {theme === "dark" && <Moon className="w-5 h-5" />}
              {theme === "system" && <Monitor className="w-5 h-5" />}
            </button>

            {user ? (
              <>
                <button
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  {avatar &&
                    avatar !== "null" &&
                    avatar !== "undefined" &&
                    avatar.trim() !== "" ? (
                    <img
                      src={avatar}
                      alt="User avatar"
                      className="h-8 w-8 rounded-full object-cover border border-emerald-300"
                    />
                  ) : (
                    <div className="h-8 w-8 flex items-center justify-center bg-emerald-100 rounded-full text-emerald-700 font-bold border border-emerald-300">
                      {initials || "U"}
                    </div>
                  )}
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
        <div
          style={{
            top: "calc(var(--top-banner-height, 0px))",
            height: "calc(100vh - var(--top-banner-height, 0px))"
          }}
          className="lg:hidden md:hidden fixed left-0 w-[300px] bg-white dark:bg-slate-900 z-[9999] border-r border-gray-100 dark:border-slate-800 p-6 shadow-lg overflow-y-auto"
        >
          {/* ✅ Mobile Menu Links */}
          <NavLink
            to="/"
            onClick={() => setOpen(false)}
            className={({ isActive }) =>
              `w-full text-left flex items-center gap-2 px-3 py-2 rounded-lg font-medium transition-all duration-200 ${isActive
                ? "bg-[#e5f9f3] dark:bg-slate-800 text-emerald-500 dark:text-emerald-400"
                : "text-gray-700 dark:text-white hover:bg-gray-50 dark:hover:bg-slate-800 hover:text-emerald-600 dark:hover:text-emerald-400"
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
              `w-full text-left flex items-center gap-2 px-3 py-2 rounded-lg font-medium transition-all duration-200 ${isActive
                ? "bg-[#e5f9f3] dark:bg-slate-800 text-emerald-500 dark:text-emerald-400"
                : "text-gray-700 dark:text-white hover:bg-gray-50 dark:hover:bg-slate-800 hover:text-emerald-600 dark:hover:text-emerald-400"
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
              `w-full text-left flex items-center gap-2 px-3 py-2 rounded-lg font-medium transition-all duration-200 ${isActive
                ? "bg-[#e5f9f3] dark:bg-slate-800 text-emerald-500 dark:text-emerald-400"
                : "text-gray-700 dark:text-white hover:bg-gray-50 dark:hover:bg-slate-800 hover:text-emerald-600 dark:hover:text-emerald-400"
              }`
            }
          >
            <Info size={18} />
            About
          </NavLink>
          <NavLink
            to="/blog"
            onClick={() => setOpen(false)}
            className={({ isActive }) =>
              `w-full text-left flex items-center gap-2 px-3 py-2 rounded-lg font-medium transition-all duration-200 ${isActive
                ? "bg-[#e5f9f3] dark:bg-slate-800 text-emerald-500 dark:text-emerald-400"
                : "text-gray-700 dark:text-white hover:bg-gray-50 dark:hover:bg-slate-800 hover:text-emerald-600 dark:hover:text-emerald-400"
              }`
            }
          >
            <Layers size={18} />
            Blog
          </NavLink>
          <NavLink
            to="/contact"
            onClick={() => setOpen(false)}
            className={({ isActive }) =>
              `w-full text-left flex items-center gap-2 px-3 py-2 rounded-lg font-medium transition-all duration-200 ${isActive
                ? "bg-[#e5f9f3] dark:bg-slate-800 text-emerald-500 dark:text-emerald-400"
                : "text-gray-700 dark:text-white hover:bg-gray-50 dark:hover:bg-slate-800 hover:text-emerald-600 dark:hover:text-emerald-400"
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
              className="flex items-center justify-center gap-2 bg-emerald-500 dark:bg-emerald-500/10 text-white dark:text-emerald-400 px-4 py-2 rounded-full font-medium hover:bg-emerald-600 dark:hover:bg-emerald-500/20 transition"
            >
              <Rocket className="w-4 h-4" /> Get Started
            </Link>
          </div>
        </div>
      )}

      {/* Sidebar Overlay (Mobile) */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[999] lg:hidden md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar (Mobile) */}
      {sidebarOpen && (
        <aside
          style={{
            top: "calc(var(--top-banner-height, 0px))",
            height: "calc(100vh - var(--top-banner-height, 0px))"
          }}
          className="fixed lg:hidden md:hidden left-0 w-[280px] bg-white dark:bg-slate-900 z-[1000] flex flex-col shadow-2xl animate-in slide-in-from-left duration-300"
        >
          <div className="flex-1 overflow-y-auto py-10">
            <nav className="px-4 space-y-1">
              {/* Overview */}
              <div className="mb-4">
                <p className="text-[10px] font-black text-gray-400 px-3 mb-2 uppercase tracking-[0.2em]">
                  Overview
                </p>
                <NavLink
                  to={dashboardLink}
                  onClick={() => setSidebarOpen(false)}
                  className={({ isActive }) =>
                    `w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-xl font-semibold transition-all duration-200 ${isActive
                      ? "bg-emerald-50 dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-sm border border-emerald-100 dark:border-slate-800"
                      : "text-gray-600 dark:text-white hover:bg-gray-50 dark:hover:bg-slate-800 hover:text-emerald-600 dark:hover:text-emerald-400"
                    }`
                  }
                >
                  <LayoutDashboard size={20} />
                  Dashboard
                </NavLink>
              </div>

              {/* Learning */}
              <div className="mb-4">
                <p className="text-[10px] font-black text-gray-400 px-3 mb-2 uppercase tracking-[0.2em]">
                  Learning
                </p>
                <NavLink
                  to="/dashboard/courses"
                  onClick={() => setSidebarOpen(false)}
                  className={({ isActive }) =>
                    `w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-xl font-semibold transition-all duration-200 ${isActive
                      ? "bg-emerald-50 dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-sm border border-emerald-100 dark:border-slate-800"
                      : "text-gray-600 dark:text-white hover:bg-gray-50 dark:hover:bg-slate-800 hover:text-emerald-600 dark:hover:text-emerald-400"
                    }`
                  }
                >
                  <BookOpen size={20} />
                  My Courses
                </NavLink>
                <NavLink
                  to="/dashboard/quizzes"
                  onClick={() => setSidebarOpen(false)}
                  className={({ isActive }) =>
                    `w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-xl font-semibold transition-all duration-200 ${isActive
                      ? "bg-emerald-50 dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-sm border border-emerald-100 dark:border-slate-800"
                      : "text-gray-600 dark:text-white hover:bg-gray-50 dark:hover:bg-slate-800 hover:text-emerald-600 dark:hover:text-emerald-400"
                    }`
                  }
                >
                  <Layers size={20} />
                  Quizzes
                </NavLink>
                <NavLink
                  to="/dashboard/certificates"
                  onClick={() => setSidebarOpen(false)}
                  className={({ isActive }) =>
                    `w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-xl font-semibold transition-all duration-200 ${isActive
                      ? "bg-emerald-50 dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-sm border border-emerald-100 dark:border-slate-800"
                      : "text-gray-600 dark:text-white hover:bg-gray-50 dark:hover:bg-slate-800 hover:text-emerald-600 dark:hover:text-emerald-400"
                    }`
                  }
                >
                  <Award size={20} />
                  Certificates
                </NavLink>
              </div>

              {/* Payments */}
              <div className="mb-4">
                <p className="text-[10px] font-black text-gray-400 px-3 mb-2 uppercase tracking-[0.2em]">
                  Payments
                </p>
                <NavLink
                  to="/dashboard/orders"
                  onClick={() => setSidebarOpen(false)}
                  className={({ isActive }) =>
                    `w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-xl font-semibold transition-all duration-200 ${isActive
                      ? "bg-emerald-50 dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-sm border border-emerald-100 dark:border-slate-800"
                      : "text-gray-600 dark:text-white hover:bg-gray-50 dark:hover:bg-slate-800 hover:text-emerald-600 dark:hover:text-emerald-400"
                    }`
                  }
                >
                  <FileText size={20} />
                  Orders
                </NavLink>
              </div>

              {/* Account */}
              <div className="mb-4">
                <p className="text-[10px] font-black text-gray-400 px-3 mb-2 uppercase tracking-[0.2em]">
                  Account
                </p>
                <NavLink
                  to="/dashboard/profile"
                  onClick={() => setSidebarOpen(false)}
                  className={({ isActive }) =>
                    `w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-xl font-semibold transition-all duration-200 ${isActive
                      ? "bg-emerald-50 dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-sm border border-emerald-100 dark:border-slate-800"
                      : "text-gray-600 dark:text-white hover:bg-gray-50 dark:hover:bg-slate-800 hover:text-emerald-600 dark:hover:text-emerald-400"
                    }`
                  }
                >
                  <UserIcon size={20} />
                  Profile
                </NavLink>
              </div>
            </nav>
          </div>

          <div className="p-4 border-t border-gray-100 dark:border-gray-800">
            <button
              onClick={() => {
                handleLogout();
                setSidebarOpen(false);
              }}
              className="flex items-center justify-center gap-2 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 px-4 py-3 rounded-xl hover:bg-red-100 dark:hover:bg-red-500/20 transition-colors w-full font-bold text-sm"
            >
              <LogOut size={18} /> Logout Account
            </button>
          </div>
        </aside>
      )}
    </nav>
  );
}

export default Nav;
