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
      <div className="min-h-screen flex items-center justify-center bg-gray-50/50 dark:bg-slate-950 px-4 relative overflow-hidden">
        {/* Decorative Background Blobs */}
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl" />
          <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />
        </div>

        <div className="bg-white/10 border border-gray-300 dark:bg-slate-900/50 backdrop-blur-xl p-10 rounded-[2.5rem] shadow-2xl max-w-md w-full text-center relative z-10 overflow-hidden">
          <div className="flex flex-col items-center">
            <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-500/20 rounded-full flex items-center justify-center mb-6">
              <CheckCircle className="w-12 h-12 text-emerald-500" />
            </div>
            <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-2">Check Your Email</h2>
            <p className="text-gray-500 dark:text-gray-400 mb-8 leading-relaxed">
              We've sent a verification link to <strong className="text-emerald-600">{formData.email}</strong>.
              Please click the link to activate your account.
            </p>
            <Link
              to="/auth/login"
              className="w-full bg-emerald-600 text-white py-4 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-lg text-center"
            >
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-10 flex flex-col md:flex-row items-center justify-center bg-gray-50/50 dark:bg-slate-950 font-[Inter] relative overflow-hidden">
      {/* Decorative Background Blobs */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto max-w-6xl flex flex-col md:flex-row items-center justify-center relative z-10">
        {/* ✅ Left side */}
        <div className="hidden md:flex flex-col items-start justify-center w-1/2 px-16 space-y-6">
          <blockquote className="text-gray-600 dark:text-gray-400 text-lg italic leading-relaxed">
            "Xirfadbare has transformed how we deliver education, making it more
            accessible and engaging than ever before."
          </blockquote>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-500/20 rounded-full flex items-center justify-center text-emerald-600 dark:text-emerald-400 font-bold">
              AM
            </div>
            <div>
              <p className="text-gray-900 dark:text-gray-100 font-bold text-sm">Abdirahmaan Mohamed</p>
              <p className="text-gray-500 dark:text-gray-400 text-xs">CEO of Xirfadbare</p>
            </div>
          </div>
        </div>

        {/* ✅ Right side */}
        <div className="w-full md:w-1/2 flex flex-col items-center justify-center p-6 md:p-12">
          <div className="w-full max-w-md bg-white/10 border border-gray-300 dark:bg-slate-900/50 backdrop-blur-xl p-8 md:p-10 rounded-[2.5rem] shadow-2xl relative overflow-hidden">
            <Link
              to="/"
              className="text-xs font-bold text-gray-400 hover:text-emerald-600 mb-8 inline-block flex items-center gap-2 uppercase tracking-widest transition-colors"
            >
              ← Back to home
            </Link>

            <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-2 tracking-tight">
              Create an account
            </h2>
            <p className="text-gray-500 dark:text-gray-400 mb-8 text-sm leading-relaxed">
              Enter your details below to create your account
            </p>

            {/* Signup Form */}
            <form className="space-y-5" onSubmit={handleSubmit}>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                    First name
                  </label>
                  <div className="relative group">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-emerald-600" size={16} />
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      placeholder="Kadija"
                      required
                      className="w-full pl-9 pr-3 py-2.5 bg-white/10 border border-gray-200 dark:border-slate-800 rounded-xl outline-none focus:border-emerald-500 transition-all text-gray-900 dark:text-white placeholder-gray-400"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                    Last name
                  </label>
                  <div className="relative group">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-emerald-600" size={16} />
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      placeholder="Mohamed"
                      required
                      className="w-full pl-9 pr-3 py-2.5 bg-white/10 border border-gray-200 dark:border-slate-800 rounded-xl outline-none focus:border-emerald-500 transition-all text-gray-900 dark:text-white placeholder-gray-400"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                  Email address
                </label>
                <div className="relative group">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-emerald-600" size={16} />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="m@example.com"
                    required
                    className="w-full pl-9 pr-3 py-2.5 bg-white/10 border border-gray-200 dark:border-slate-800 rounded-xl outline-none focus:border-emerald-500 transition-all text-gray-900 dark:text-white placeholder-gray-400"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                  Phone number
                </label>
                <div className="relative group">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-emerald-600" size={16} />
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+252 61 234 5678"
                    required
                    className="w-full pl-9 pr-3 py-2.5 bg-white/10 border border-gray-200 dark:border-slate-800 rounded-xl outline-none focus:border-emerald-500 transition-all text-gray-900 dark:text-white placeholder-gray-400"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                  Password
                </label>
                <div className="relative group">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-emerald-600" size={16} />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    required
                    className="w-full pl-9 pr-10 py-2.5 bg-white/10 border border-gray-200 dark:border-slate-800 rounded-xl outline-none focus:border-emerald-500 transition-all text-gray-900 dark:text-white placeholder-gray-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                  Confirm password
                </label>
                <div className="relative group">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-emerald-600" size={16} />
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="••••••••"
                    required
                    className="w-full pl-9 pr-10 py-2.5 bg-white/10 border border-gray-200 dark:border-slate-800 rounded-xl outline-none focus:border-emerald-500 transition-all text-gray-900 dark:text-white placeholder-gray-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="flex items-start gap-2 py-2">
                <input
                  id="terms"
                  type="checkbox"
                  required
                  className="h-4 w-4 bg-white/10 border border-gray-300 rounded text-emerald-600 focus:ring-emerald-500"
                />
                <label htmlFor="terms" className="text-[10px] text-gray-500 font-medium leading-tight text-left">
                  I accept the <Link to="#" className="text-emerald-600 hover:underline px-1">Terms</Link> and <Link to="#" className="text-emerald-600 hover:underline px-1">Privacy Policy</Link>
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-emerald-600 text-white py-4 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Creating account...
                  </>
                ) : (
                  "Create account →"
                )}
              </button>
            </form>

            <div className="text-center mt-8">
              <p className="text-sm text-gray-500 font-medium">
                Already have an account?{" "}
                <Link to="/auth/login" className="text-emerald-600 font-bold hover:underline px-1">
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
