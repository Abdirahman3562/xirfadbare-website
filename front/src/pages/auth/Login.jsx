import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const navigate = useNavigate();

  // ✅ Handle input change
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  // ✅ Handle submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch(
        `http://localhost:5000/users?email=${formData.email}`
      );
      const data = await res.json();

      if (data.length === 0) {
        toast.error(" No account found with this email!");
        return;
      }

      const user = data[0];

     if (user.password === formData.password) {
  localStorage.setItem("loggedInUser", JSON.stringify(user));
  window.dispatchEvent(new Event("userLogin")); // 🔥 isla markiiba
  toast.success(`Welcome back, ${user.firstName}!`);
  navigate("/dashboard/student");
}
 else {
        toast.error(" Incorrect password!");
      }
    } catch (err) {
      console.error(err);
      toast.error(" Server error — is JSON server running?");
    }
  };

  return (
    <div className="min-h-screen  py-20 flex flex-col md:flex-row items-center justify-center bg-white">
      <ToastContainer position="top-right" autoClose={2000} />

      {/* ✅ Left section */}
      <div className="hidden md:flex flex-col items-start justify-center w-1/2 px-16 space-y-6">
        <blockquote className="text-gray-600 text-lg italic">
          "Xirfadbare has transformed how we deliver education, making it more
          accessible and engaging than ever before."
        </blockquote>
        <p className="text-gray-500">Abdirahman Mohamed, CEO of Xirfadbare</p>
      </div>

      {/* ✅ Right section */}
      <div className="w-full md:w-1/2 flex flex-col items-center justify-center p-10 md:p-12">
        <div className="w-full max-w-md">
          <Link
            to="/"
            className="text-sm text-gray-500 hover:text-emerald-600 mb-4 inline-block"
          >
            ← Back to home
          </Link>

          <h2 className="text-2xl font-semibold text-gray-800 mb-2">
            Welcome back
          </h2>
          <p className="text-gray-500 mb-6">
            Enter your credentials to sign in to your account
          </p>

          {/* ✅ Login Form */}
          <form className="space-y-5" onSubmit={handleSubmit}>
            {/* Email */}
            <div className="relative">
              <label
                htmlFor="email"
                className="block text-gray-700 mb-1 font-medium"
              >
                Email address
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-gray-400">
                  <Mail size={18} />
                </span>
                <input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-300 rounded-lg pl-10 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
                />
              </div>
            </div>

            {/* Password */}
            <div className="relative">
              <label
                htmlFor="password"
                className="block text-gray-700 mb-1 font-medium"
              >
                Password
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-gray-400">
                  <Lock size={18} />
                </span>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-300 rounded-lg pl-10 pr-10 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              <div className="flex justify-end mt-2">
                <Link
                  to="/auth/forgot-password"
                  className="text-sm text-emerald-600 hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
            </div>

            {/* Remember me */}
            <div className="flex items-center">
              <input
                id="remember"
                type="checkbox"
                className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
              />
              <label
                htmlFor="remember"
                className="ml-2 block text-sm text-gray-700"
              >
                Remember me
              </label>
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="w-full bg-emerald-500 text-white py-2 rounded-full font-medium hover:bg-emerald-600 transition cursor-pointer"
            >
              Sign in →
            </button>
          </form>

          {/* Footer */}
          <div className="text-center mt-6">
            <p className="text-sm text-gray-500">
              New to Xirfadbare?{" "}
              <Link to="/auth/signup" className="text-emerald-600 hover:underline">
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
