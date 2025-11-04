import { useState } from "react";
import { NavLink } from "react-router-dom";
import { Menu, X } from "lucide-react";
import logo from "../assets/logo.png"
function Nav() {
  const [open, setOpen] = useState(false);

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
              className="w-[20rem]  mb-4  h-auto object-contain"
            />
          </NavLink>

          {/* ✅ Desktop Links */}
          <div className="hidden md:flex items-center gap-6">
            <NavLink to="/" className={linkClass}>
              Home
            </NavLink>
            <NavLink to="/courses" className={linkClass}>
              Courses
            </NavLink>
            <NavLink to="/add-course" className={linkClass}>
              Add Course
            </NavLink>
            <NavLink to="/about" className={linkClass}>
              About
            </NavLink>
            <NavLink to="/contact" className={linkClass}>
              Contact
            </NavLink>
          </div>

          {/* ✅ Right Buttons */}
          <div className="hidden md:flex items-center gap-3">
            <button className="border border-gray-300 px-4 py-1.5 rounded-full font-medium text-gray-700 hover:bg-gray-100 transition">
              Sign In
            </button>
            <button className="bg-emerald-500 text-white px-4 py-1.5 rounded-full font-medium hover:bg-emerald-600 transition">
              Get Started
            </button>
          </div>

          {/* ✅ Mobile Menu Toggle */}
          <button
            onClick={() => setOpen(!open)}
            className="md:hidden text-gray-800 p-2 rounded-lg hover:bg-gray-100"
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* ✅ Mobile Dropdown */}
      {open && (
        <div className="md:hidden bg-[#f0f7f8] border-t border-gray-200 px-4 py-4 space-y-2 shadow-md animate-fadeIn">
          <NavLink
            to="/"
            className="block text-gray-700 hover:text-emerald-600 font-medium"
            onClick={() => setOpen(false)}
          >
            Home
          </NavLink>
          <NavLink
            to="/courses"
            className="block text-gray-700 hover:text-emerald-600 font-medium"
            onClick={() => setOpen(false)}
          >
            Courses
          </NavLink>
          <NavLink
            to="/add-course"
            className="block text-gray-700 hover:text-emerald-600 font-medium"
            onClick={() => setOpen(false)}
          >
            Add Course
          </NavLink>
          <NavLink
            to="/about"
            className="block text-gray-700 hover:text-emerald-600 font-medium"
            onClick={() => setOpen(false)}
          >
            About
          </NavLink>
          <NavLink
            to="/contact"
            className="block text-gray-700 hover:text-emerald-600 font-medium"
            onClick={() => setOpen(false)}
          >
            Contact
          </NavLink>

          <div className="flex gap-3 pt-3 border-t border-gray-100">
            <button className="border border-gray-300 px-4 py-1.5 rounded-full font-medium text-gray-700 hover:bg-gray-100 transition w-1/2">
              Sign In
            </button>
            <button className="bg-emerald-500 text-white px-4 py-1.5 rounded-full font-medium hover:bg-emerald-600 transition w-1/2">
              Get Started
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}

export default Nav;
