import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff, ShieldCheck, ArrowLeft, Loader2 } from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { API_BASE_URL } from "../../config";

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [require2FA, setRequire2FA] = useState(false);
  const [otp, setOtp] = useState(new Array(6).fill(""));
  const [loginEmail, setLoginEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(0);

  const navigate = useNavigate();

  // ✅ Timer logic
  React.useEffect(() => {
    let interval;
    if (require2FA && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else if (timer === 0) {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [require2FA, timer]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const startTimer = () => setTimer(600); // 10 minutes

  // ✅ Handle input change
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const loginSuccess = (data) => {
    localStorage.setItem("loggedInUser", JSON.stringify(data));
    window.dispatchEvent(new Event("userLogin"));
    toast.success(`Welcome back, ${data.firstName}!`);

    // Redirect based on role and permissions
    const isStaff = data.role === 'admin' || (data.permissions && data.permissions.length > 0);

    if (isStaff) {
      if (data.role === 'instructor') {
        navigate("/instructor/dashboard");
      } else {
        navigate("/admin/dashboard");
      }
    } else {
      navigate("/dashboard/student");
    }
  };

  // ✅ Handle submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/users/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || "Invalid credentials!");
        setLoading(false);
        return;
      }

      if (data.require2FA) {
        setRequire2FA(true);
        setLoginEmail(data.email);
        startTimer();
        toast.info("Verification code sent to your email!");
        setLoading(false);
        return;
      }

      loginSuccess(data);
    } catch (err) {
      console.error(err);
      toast.error("Server error — is the backend running?");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Handle 2FA Verification
  const handleVerify2FA = async (e) => {
    e.preventDefault();
    const fullOtp = otp.join("");
    if (fullOtp.length !== 6) {
      toast.error("Please enter the full 6-digit code");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/users/verify-2fa`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: loginEmail, code: fullOtp }),
      });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || "Invalid or expired code!");
        setLoading(false);
        return;
      }

      loginSuccess(data);
    } catch (err) {
      toast.error("Verification failed");
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (element, index) => {
    const value = element.value.slice(-1);
    if (isNaN(value)) return false;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Focus next input
    if (value !== "" && element.nextSibling) {
      element.nextSibling.focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace") {
      if (otp[index] === "" && e.target.previousSibling) {
        e.target.previousSibling.focus();
      }
    }
  };

  const handlePaste = (e) => {
    const data = e.clipboardData.getData("text").slice(0, 6);
    if (!/^\d+$/.test(data)) return;

    const newOtp = [...otp];
    data.split("").forEach((char, index) => {
      newOtp[index] = char;
    });
    setOtp(newOtp);

    // Focus the last filled input or the next empty one
    const nextIndex = Math.min(data.length, 5);
    const inputs = e.target.parentElement.querySelectorAll("input");
    if (inputs[nextIndex]) inputs[nextIndex].focus();
  };

  return (
    <div className="min-h-screen py-20 flex flex-col md:flex-row items-center justify-center bg-white font-[Inter]">

      {/* ✅ Left section */}
      <div className="hidden md:flex flex-col items-start justify-center w-1/2 px-16 space-y-6">
        <blockquote className="text-gray-600 text-lg italic leading-relaxed">
          "Xirfadbare has transformed how we deliver education, making it more
          accessible and engaging than ever before."
        </blockquote>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 font-bold">AM</div>
          <div>
            <p className="text-gray-900 font-bold text-sm">Abdirahman Mohamed</p>
            <p className="text-gray-500 text-xs">CEO of Xirfadbare</p>
          </div>
        </div>
      </div>

      {/* ✅ Right section */}
      <div className="w-full md:w-1/2 flex flex-col items-center justify-center p-10 md:p-12">
        <div className="w-full max-w-md">
          <Link
            to="/"
            className="text-xs font-bold text-gray-400 hover:text-emerald-600 mb-8 inline-block flex items-center gap-2 uppercase tracking-widest transition-colors"
          >
            <div className="flex items-center gap-2">
              <ArrowLeft size={14} />
              <span> Back to home</span>
            </div>

          </Link>

          <h2 className="text-4xl font-black text-gray-900 mb-3 tracking-tight">
            {require2FA ? "Security Shield" : "Welcome back"}
          </h2>
          <p className="text-gray-500 mb-10 text-sm leading-relaxed">
            {require2FA
              ? `We sent a 6-digit verification code to ${loginEmail}. Please enter it below to continue.`
              : "Enter your credentials to sign in to your account"}
          </p>

          {require2FA ? (
            /* ✅ 2FA Form - Professional 6-Digit Layout */
            <form className="space-y-8" onSubmit={handleVerify2FA}>
              <div className="space-y-4">
                <div className="flex justify-between gap-3">
                  {otp.map((data, index) => (
                    <input
                      key={index}
                      type="text"
                      name="otp"
                      maxLength="1"
                      value={data}
                      onFocus={(e) => e.target.select()}
                      onPaste={handlePaste}
                      onChange={(e) => handleOtpChange(e.target, index)}
                      onKeyDown={(e) => handleKeyDown(e, index)}
                      className="w-14 h-16 text-center text-2xl font-black bg-gray-50 border-2 border-gray-100 rounded-2xl outline-none focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-50 transition-all text-gray-900"
                    />
                  ))}
                </div>
                <p className="text-center text-[11px] font-bold text-gray-400 uppercase tracking-widest">
                  Enter 6-digit verification code
                </p>
                <div className="flex items-center justify-center gap-2 py-2">
                  <div className={`text-xs font-black px-3 py-1.5 rounded-full ${timer > 60 ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600 animate-pulse'}`}>
                    Expires in {formatTime(timer)}
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || timer === 0}
                className="w-full bg-emerald-600 text-white py-5 rounded-[2rem] font-bold hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-100 flex items-center justify-center gap-3 group disabled:opacity-70 active:scale-[0.98]"
              >
                {loading ? <Loader2 className="animate-spin" size={20} /> : <ShieldCheck size={20} className="group-hover:scale-110 transition-transform" />}
                <span className="uppercase tracking-widest text-xs">Verify & Continue</span>
              </button>

              <div className="text-center space-y-4">
                {timer === 0 ? (
                  <button
                    type="button"
                    onClick={handleSubmit}
                    className="text-[11px] font-black text-emerald-600 hover:text-emerald-700 transition uppercase tracking-[0.2em] bg-emerald-50 px-6 py-2 rounded-full"
                  >
                    Resend Code
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setRequire2FA(false);
                      setTimer(0);
                    }}
                    className="text-[11px] font-black text-gray-400 hover:text-gray-600 transition uppercase tracking-[0.2em]"
                  >
                    Return to login
                  </button>
                )}
              </div>
            </form>
          ) : (
            /* ✅ Login Form */
            <form className="space-y-5" onSubmit={handleSubmit}>
              {/* Email */}
              <div className="space-y-2">
                <label
                  htmlFor="email"
                  className="block text-sm font-bold text-gray-700 uppercase tracking-wider ml-1"
                >
                  Email address
                </label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-emerald-600 transition-colors" size={18} />
                  <input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-50/50 transition-all"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-2">
                <label
                  htmlFor="password"
                  className="block text-sm font-bold text-gray-700 uppercase tracking-wider ml-1"
                >
                  Password
                </label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-emerald-600 transition-colors" size={18} />
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    className="w-full pl-12 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-50/50 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>

                <div className="flex justify-end mt-2">
                  <Link
                    to="/auth/forgot-password"
                    className="text-xs font-bold text-emerald-600 hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>
              </div>

              {/* Remember me */}
              <div className="flex items-center px-1">
                <input
                  id="remember"
                  type="checkbox"
                  className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded cursor-pointer"
                />
                <label
                  htmlFor="remember"
                  className="ml-2 block text-sm text-gray-500 font-medium cursor-pointer"
                >
                  Stay signed in
                </label>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-emerald-500 text-white py-4 rounded-xl font-bold hover:bg-emerald-600 transition shadow-lg shadow-emerald-100 flex items-center justify-center gap-2 group disabled:opacity-70"
              >
                {loading ? <Loader2 className="animate-spin" size={20} /> : <span>Sign in now</span>}
                {!loading && <span className="group-hover:translate-x-1 transition-transform">→</span>}
              </button>
            </form>
          )}

          {/* Footer */}
          {!require2FA && (
            <div className="text-center mt-8">
              <p className="text-sm text-gray-500 font-medium">
                New to Xirfadbare?{" "}
                <Link to="/auth/signup" className="text-emerald-600 font-bold hover:underline">
                  Create account
                </Link>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;
