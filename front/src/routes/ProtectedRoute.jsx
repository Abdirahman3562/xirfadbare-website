// src/routes/ProtectedRoute.jsx
import { Navigate, Outlet } from "react-router-dom";

export default function ProtectedRoute({ requireVerified = false, adminOnly = false }) {
  const user = JSON.parse(localStorage.getItem("loggedInUser") || "null");

  if (!user) return <Navigate to="/auth/login" replace />;

  if (requireVerified && !user.verified) {
    return <Navigate to="/auth/verify" replace state={{ email: user.email }} />;
  }

  // ✅ Role-based protection for admin dashboard
  if (adminOnly && user.role !== 'admin') {
    return <Navigate to="/" replace />; // Redirect non-admins to home
  }

  return <Outlet />;
}
