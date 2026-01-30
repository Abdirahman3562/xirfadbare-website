import React, { useState } from "react";
import { Link } from "react-router-dom";
import { User, Mail, Phone, Lock, Eye, EyeOff, CheckCircle, Loader2 } from "lucide-react";
import { toast } from "react-toastify";
import { API_BASE_URL } from "../../config";

const Signup = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    image: ""
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error("❌ Passwords do not match!");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          password: formData.password,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success("Signup successful! Please check your email.");
        setIsSubmitted(true);
      } else {
        toast.error(data.message || "Error saving user!");
      }
    } catch (err) {
      console.error(err);
      toast.error("Server error — make sure the backend is running!");
    } finally {
      setLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="bg-white p-8 rounded-2xl shadow-lg max-w-md w-full text-center">
          <div className="flex flex-col items-center">
            <CheckCircle className="w-16 h-16 text-emerald-500 mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Check Your Email</h2>
            <p className="text-gray-600 mb-6">
              We've sent a verification link to <strong>{formData.email}</strong>.
              Please click the link to activate your account.
            </p>
            <Link
              to="/auth/login"
              className="px-6 py-2.5 bg-emerald-500 text-white font-medium rounded-lg hover:bg-emerald-600 transition w-full block"
            >
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row items-center justify-center py-10 bg-white">


      {/* ✅ Left side */}
      <div className="hidden md:flex flex-col items-start justify-center w-1/2 px-16 space-y-6">
        <blockquote className="text-gray-600 text-lg italic">
          "Xirfadbare has transformed how we deliver education, making it more
          accessible and engaging than ever before."
        </blockquote>
        <p className="text-gray-500">Abdirahmaan Mohamed, CEO of Xirfadbare</p>
      </div>

      {/* ✅ Right side */}
      <div className="w-full md:w-1/2 flex flex-col items-center justify-center p-10 md:p-12">
        <div className="w-full max-w-md">
          <Link
            to="/"
            className="text-sm text-gray-500 hover:text-emerald-600 mb-4 inline-block"
          >
            ← Back to home
          </Link>

          <h2 className="text-2xl font-semibold text-gray-800 mb-2">
            Create an account
          </h2>
          <p className="text-gray-500 mb-6">
            Enter your details below to create your account
          </p>

          {/* Signup Form */}
          <form className="space-y-5" onSubmit={handleSubmit}>
            {/* Name fields */}
            <div className="grid grid-cols-2 gap-4">
              <div className="relative">
                <label className="block text-gray-700 mb-1 font-medium">
                  First name
                </label>
                <span className="absolute left-3 top-10 text-gray-400">
                  <User size={18} />
                </span>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  placeholder="Kadija"
                  required
                  className="w-full border border-gray-300 rounded-lg pl-10 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition text-gray-900 placeholder-gray-500"
                />
              </div>

              <div className="relative">
                <label className="block text-gray-700 mb-1 font-medium">
                  Last name
                </label>
                <span className="absolute left-3 top-10 text-gray-400">
                  <User size={18} />
                </span>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  placeholder="Mohamed"
                  required
                  className="w-full border border-gray-300 rounded-lg pl-10 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition text-gray-900 placeholder-gray-500"
                />
              </div>
            </div>

            {/* Email */}
            <div className="relative">
              <label className="block text-gray-700 mb-1 font-medium">
                Email address
              </label>
              <span className="absolute left-3 top-10 text-gray-400">
                <Mail size={18} />
              </span>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="m@example.com"
                required
                className="w-full border border-gray-300 rounded-lg pl-10 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition text-gray-900 placeholder-gray-500"
              />
            </div>

            {/* Phone */}
            <div className="relative">
              <label className="block text-gray-700 mb-1 font-medium">
                Phone number
              </label>
              <span className="absolute left-3 top-10 text-gray-400">
                <Phone size={18} />
              </span>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+252 61 234 5678"
                required
                className="w-full border border-gray-300 rounded-lg pl-10 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition text-gray-900 placeholder-gray-500"
              />
            </div>

            {/* Password */}
            <div className="relative">
              <label className="block text-gray-700 mb-1 font-medium">
                Password
              </label>
              <span className="absolute left-3 top-10 text-gray-400">
                <Lock size={18} />
              </span>
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                required
                className="w-full border border-gray-300 rounded-lg pl-10 pr-10 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition text-gray-900 placeholder-gray-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-10 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {/* Confirm Password */}
            <div className="relative">
              <label className="block text-gray-700 mb-1 font-medium">
                Confirm password
              </label>
              <span className="absolute left-3 top-10 text-gray-400">
                <Lock size={18} />
              </span>
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="••••••••"
                required
                className="w-full border border-gray-300 rounded-lg pl-10 pr-10 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition text-gray-900 placeholder-gray-500"
              />
              <button
                type="button"
                onClick={() =>
                  setShowConfirmPassword(!showConfirmPassword)
                }
                className="absolute right-3 top-10 text-gray-400 hover:text-gray-600"
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {/* Terms */}
            <div className="flex items-start gap-2">
              <input
                id="terms"
                type="checkbox"
                required
                className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
              />
              <label htmlFor="terms" className="text-sm text-gray-600">
                I accept the{" "}
                <Link to="#" className="text-emerald-600 hover:underline">
                  Terms and Conditions
                </Link>{" "}
                and{" "}
                <Link to="#" className="text-emerald-600 hover:underline">
                  Privacy Policy
                </Link>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-500 text-white py-2 rounded-full font-medium hover:bg-emerald-600 transition cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  Creating account...
                </>
              ) : (
                "Create account →"
              )}
            </button>
          </form>

          <div className="text-center mt-6">
            <p className="text-sm text-gray-500">
              Already have an account?{" "}
              <Link
                to="/auth/login"
                className="text-emerald-600 hover:underline"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
