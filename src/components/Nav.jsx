import { useState, useEffect } from "react";
import { Link, NavLink } from "react-router-dom";
import { Menu, X, Sun, Moon, LogIn, Rocket } from "lucide-react";
import logo from "../assets/logo.png";

function Nav() {
  const [open, setOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  // 🌓 Handle theme toggle
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  const linkClass = ({ isActive }) =>
    `relative px-3 py-2 font-medium transition-all duration-200 
     ${isActive
        ? "text-emerald-600 after:content-[''] after:absolute after:left-0 after:bottom-0 after:w-full after:h-[2px] after:bg-emerald-500"
        : "text-gray-700 hover:text-emerald-600 hover:after:content-[''] hover:after:absolute hover:after:left-0 hover:after:bottom-0 hover:after:w-full hover:after:h-[2px] hover:after:bg-emerald-400/70"
     }`;

  return (
    <nav className="bg-[#f0f7f8] shadow-sm fixed w-full top-0 z-50 border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* ✅ Logo */}
          <NavLink to="/" className="lg:ml-0 md:ml-0 ml-[-50px]">
            <img
              src={logo}
              alt="Yiksitech Logo"
              className="w-[20rem] mb-4 h-auto object-contain"
            />
          </NavLink>

          {/* ✅ Desktop Links */}
          <div className="hidden md:flex items-center gap-6">
            <NavLink to="/" className={linkClass}>Home</NavLink>
            <NavLink to="/courses" className={linkClass}>Courses</NavLink>
            <NavLink to="/about" className={linkClass}>About</NavLink>
            <NavLink to="/contact" className={linkClass}>Contact</NavLink>
          </div>

          {/* ✅ Right Section */}
          <div className="hidden md:flex items-center gap-3">
            {/* 🌗 Dark Mode Toggle */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-full border border-gray-300  hover:bg-gray-100 cursor-pointer transition"
            >
              {darkMode ? (
                <Sun className="w-5 h-5 text-yellow-400" />
              ) : (
                <Moon className="w-5 h-5 text-gray-700" />
              )}
            </button>

            {/* 👤 Sign In */}
            <button className="flex items-center cursor-pointer gap-2 border border-gray-300 px-4 py-1.5 rounded-full font-medium text-emerald-600  hover:bg-gray-100  transition">
              <LogIn className="w-4 h-4" />
              Sign In
            </button>

            {/* 🚀 Get Started */}
            <Link
          to={`/courses`}
            className="flex items-center gap-2 cursor-pointer bg-emerald-500 text-white px-4 py-1.5 rounded-full font-medium hover:bg-emerald-600 transition">
              <Rocket className="w-4 h-4" />
              Get Started
            </Link>
          </div>

          {/* ✅ Mobile Menu Toggle */}
          <button
            onClick={() => setOpen(!open)}
            className="md:hidden text-gray-800 dark:text-white p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700"
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* ✅ Mobile Dropdown */}
      {open && (
        <div className="md:hidden bg-[#f0f7f8] dark:bg-slate-900 border-t border-gray-200 dark:border-slate-700 px-4 py-4 space-y-2 shadow-md animate-fadeIn">
          <NavLink to="/" onClick={() => setOpen(false)} className="block text-gray-700 dark:text-white hover:text-emerald-600 font-medium">Home</NavLink>
          <NavLink to="/courses" onClick={() => setOpen(false)} className="block text-gray-700 dark:text-white hover:text-emerald-600 font-medium">Courses</NavLink>
          <NavLink to="/about" onClick={() => setOpen(false)} className="block text-gray-700 dark:text-white hover:text-emerald-600 font-medium">About</NavLink>
          <NavLink to="/contact" onClick={() => setOpen(false)} className="block text-gray-700 dark:text-white hover:text-emerald-600 font-medium">Contact</NavLink>

          {/* Mobile Buttons */}
          <div className="flex gap-3 pt-3 border-t border-gray-100 dark:border-slate-700">
            <button className="flex items-center gap-2 border border-gray-300 dark:border-slate-600 px-4 py-1.5 rounded-full font-medium text-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-slate-800 transition w-1/2">
              <LogIn className="w-4 h-4" /> Sign In
            </button>
            <button className="flex items-center gap-2 bg-emerald-500 text-white px-4 py-1.5 rounded-full font-medium hover:bg-emerald-600 transition w-1/2">
              <Rocket className="w-4 h-4" /> Get Started
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}

export default Nav;
