import { useState, useEffect, useRef } from "react";
import { Link, NavLink, useNavigate, useLocation } from "react-router-dom";
import {
  Menu, X, Sun, Moon, LogIn, Rocket, Bell, User as UserIcon, LayoutDashboard, LogOut, Loader2, BookOpen, FileText, User, Settings, Phone, Info, Home
} from "lucide-react";
import defaultLogo from "../assets/logo.png";
import { useData } from "../contexts/DataContext";

function Nav() {
  const [settings, setSettings] = useState({
    logo: "",
    websiteTitle: "Samafale Academy"
  });
  const [open, setOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [user, setUser] = useState(null);
  const [openProfile, setOpenProfile] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loadingUser, setLoadingUser] = useState(true);
  const [scrolled, setScrolled] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  // 🎨 Fetch settings from API
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

    fetchSettings();
  }, []);

  // 🎨 Scroll animation
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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
      const parsedUser = JSON.parse(u);
      if (parsedUser.role === "admin") {
        navigate("/admin/dashboard", { replace: true });
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

  const getImageUrl = (img) => {
    if (!img) return null;
    return img.startsWith("/") ? `http://localhost:5000${img}` : img;
  };

  const logoSrc = settings.logo || defaultLogo;

  const avatar = getImageUrl(user?.image || localStorage.getItem("profileImage"));

  const linkClass = ({ isActive }) =>
    `relative px-3 py-2 font-medium transition-all duration-200 ease-in-out ${isActive
      ? "text-emerald-600 after:content-[''] after:absolute after:left-0 after:bottom-0 after:w-full after:h-[2px] after:bg-emerald-500"
      : "text-gray-600 hover:text-emerald-600 after:content-[''] after:absolute after:left-0 after:bottom-0 after:w-0 after:h-[2px] after:bg-emerald-400 hover:after:w-full after:transition-all after:duration-300"
    }`;

  const dashboardLink = user?.role === "admin" ? "/admin" : "/dashboard/student";

  return (
    <nav className={`bg-[#f0f7f8] shadow-sm fixed w-full top-0 z-50 border-b border-gray-100 transition-all duration-300 ${scrolled ? "py-2 shadow-lg" : "py-0"
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
                      to={dashboardLink}
                      onClick={() => setOpenProfile(false)}
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
        <div className="lg:hidden md:hidden fixed top-0 bottom-0 left-0 w-[300px] bg-white z-[9999] border-r border-gray-100 p-6 shadow-lg">
          {/* ✅ Mobile Menu Links */}
          <NavLink
            to="/"
            onClick={() => setOpen(false)}
            className={({ isActive }) =>
              `w-full text-left flex items-center gap-2 px-3 py-2 rounded-lg font-medium transition-all duration-200 ${isActive
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
              `w-full text-left flex items-center gap-2 px-3 py-2 rounded-lg font-medium transition-all duration-200 ${isActive
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
              `w-full text-left flex items-center gap-2 px-3 py-2 rounded-lg font-medium transition-all duration-200 ${isActive
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
              `w-full text-left flex items-center gap-2 px-3 py-2 rounded-lg font-medium transition-all duration-200 ${isActive
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

      {/* Sidebar Overlay (Mobile) */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[999] lg:hidden md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar (Mobile) */}
      {sidebarOpen && (
        <aside className="fixed lg:hidden md:hidden left-0 top-0 h-screen w-[280px] bg-white z-[1000] flex flex-col shadow-2xl animate-in slide-in-from-left duration-300">
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
                      ? "bg-emerald-50 text-emerald-600 shadow-sm border border-emerald-100"
                      : "text-gray-600 hover:bg-gray-50 hover:text-emerald-600"
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
                      ? "bg-emerald-50 text-emerald-600 shadow-sm border border-emerald-100"
                      : "text-gray-600 hover:bg-gray-50 hover:text-emerald-600"
                    }`
                  }
                >
                  <BookOpen size={20} />
                  My Courses
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
                      ? "bg-emerald-50 text-emerald-600 shadow-sm border border-emerald-100"
                      : "text-gray-600 hover:bg-gray-50 hover:text-emerald-600"
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
                      ? "bg-emerald-50 text-emerald-600 shadow-sm border border-emerald-100"
                      : "text-gray-600 hover:bg-gray-50 hover:text-emerald-600"
                    }`
                  }
                >
                  <UserIcon size={20} />
                  Profile
                </NavLink>
              </div>
            </nav>
          </div>

          <div className="p-4 border-t border-gray-100">
            <button
              onClick={() => {
                handleLogout();
                setSidebarOpen(false);
              }}
              className="flex items-center justify-center gap-2 bg-red-50 text-red-600 px-4 py-3 rounded-xl hover:bg-red-100 transition-colors w-full font-bold text-sm"
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
