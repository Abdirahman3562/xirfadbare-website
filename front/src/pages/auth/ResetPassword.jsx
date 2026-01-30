import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { FiLock, FiEye, FiEyeOff } from "react-icons/fi";
import { Loader2 } from "lucide-react";
import { API_BASE_URL } from "../../config";

function ResetPassword() {
    const { token } = useParams();
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!password || !confirmPassword) {
            setError("Please fill in all fields");
            return;
        }

        if (password !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        if (password.length < 6) {
            setError("Password must be at least 6 characters");
            return;
        }

        setLoading(true);
        setError("");
        setMessage("");

        try {
            const res = await fetch(`${API_BASE_URL}/users/reset-password/${token}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ password }),
            });

            const data = await res.json();

            if (res.ok) {
                setMessage("✅ Password has been reset successfully. Redirecting to login...");
                setTimeout(() => {
                    navigate("/auth/login");
                }, 2000);
            } else {
                setError(data.message || "Failed to reset password. Link may be expired.");
            }
        } catch (err) {
            console.error(err);
            setError("Server error. Please try again later.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen grid lg:grid-cols-2">
            {/* Left side - Quote */}
            <div className="hidden lg:flex flex-col justify-center items-center bg-gray-50 px-12">
                <blockquote className="text-xl text-gray-700 italic mb-4 text-center max-w-md">
                    "Education is the passport to the future, for tomorrow belongs to those
                    who prepare for it today."
                </blockquote>
                <p className="text-gray-500 text-sm">
                    <span className="font-medium text-gray-700">
                        Malcolm X
                    </span>
                </p>
            </div>

            {/* Right side - Reset form */}
            <div className="flex flex-col justify-center px-8 lg:px-16 py-12 bg-white">
                <h1 className="text-2xl font-semibold text-gray-800 mb-2">
                    Reset Password
                </h1>
                <p className="text-gray-500 text-sm mb-8">
                    Enter your new password below.
                </p>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label
                            htmlFor="password"
                            className="block text-sm font-medium text-gray-700 mb-1"
                        >
                            New Password
                        </label>
                        <div className="relative">
                            <FiLock className="absolute left-3 top-3.5 text-gray-400" />
                            <input
                                type={showPassword ? "text" : "password"}
                                id="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                className="w-full border border-gray-300 rounded-lg pl-10 pr-10 py-2 focus:outline-none focus:border-emerald-400 text-gray-900 placeholder-gray-500"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600"
                            >
                                {showPassword ? <FiEyeOff /> : <FiEye />}
                            </button>
                        </div>
                    </div>

                    <div>
                        <label
                            htmlFor="confirmPassword"
                            className="block text-sm font-medium text-gray-700 mb-1"
                        >
                            Confirm Password
                        </label>
                        <div className="relative">
                            <FiLock className="absolute left-3 top-3.5 text-gray-400" />
                            <input
                                type={showPassword ? "text" : "password"}
                                id="confirmPassword"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="••••••••"
                                className="w-full border border-gray-300 rounded-lg pl-10 pr-3 py-2 focus:outline-none focus:border-emerald-400 text-gray-900 placeholder-gray-500"
                            />
                        </div>
                    </div>

                    {error && <p className="text-red-500 text-sm">{error}</p>}
                    {message && <p className="text-emerald-600 text-sm">{message}</p>}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-emerald-500 text-white font-medium py-2.5 rounded-lg hover:bg-emerald-600 transition disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {loading ? <Loader2 size={20} className="animate-spin" /> : "Reset Password"}
                    </button>

                    <div className="text-center mt-4">
                        <Link
                            to="/auth/login"
                            className="text-sm text-emerald-600 hover:underline"
                        >
                            ← Back to login
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default ResetPassword;
