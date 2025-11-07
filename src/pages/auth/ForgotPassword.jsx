import { useState } from "react";
import { Link } from "react-router-dom";
import { FiMail } from "react-icons/fi";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!email.trim()) {
      setError("Please enter your email address");
      setMessage("");
      return;
    }

    // Simulate sending reset email
    setTimeout(() => {
      setMessage(
        "✅ Password reset instructions have been sent to your email address."
      );
      setError("");
      setEmail("");
    }, 1000);
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left side - Quote */}
      <div className="hidden lg:flex flex-col justify-center items-center bg-gray-50 px-12">
        <blockquote className="text-xl text-gray-700 italic mb-4 text-center max-w-md">
          "Xirfadbare has transformed how we deliver education, making it more
          accessible and engaging than ever before."
        </blockquote>
        <p className="text-gray-500 text-sm">
          <span className="font-medium text-gray-700">
            Abdirahman Mohamed
          </span>
          , CEO of Xirfadbare
        </p>
      </div>

      {/* Right side - Forgot form */}
      <div className="flex flex-col justify-center px-8 lg:px-16 py-12 bg-white">
        <Link
          to="/auth/login"
          className="text-sm text-emerald-600 hover:underline mb-6"
        >
          ← Back to login
        </Link>

        <h1 className="text-2xl font-semibold text-gray-800 mb-2">
          Forgot Password
        </h1>
        <p className="text-gray-500 text-sm mb-8">
          Enter your email address and we’ll send you instructions to reset your
          password.
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Email address
            </label>
            <div className="relative">
              <FiMail className="absolute left-3 top-3.5 text-gray-400" />
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="m@example.com"
                className="w-full border border-gray-300 rounded-lg pl-10 pr-3 py-2 focus:outline-none focus:border-emerald-400"
              />
            </div>
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}
          {message && <p className="text-emerald-600 text-sm">{message}</p>}

          <button
            type="submit"
            className="w-full bg-emerald-500 text-white font-medium py-2.5 rounded-lg hover:bg-emerald-600 transition"
          >
            Send Instructions →
          </button>
        </form>
      </div>
    </div>
  );
}

export default ForgotPassword;
