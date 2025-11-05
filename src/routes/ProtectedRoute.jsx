// src/routes/ProtectedRoute.jsx
import { Navigate, Outlet } from "react-router-dom";

export default function ProtectedRoute({ requireVerified = false }) {
  const user = JSON.parse(localStorage.getItem("loggedInUser") || "null");

  if (!user) return <Navigate to="/auth/login" replace />;

  if (requireVerified && !user.verified) {
    return <Navigate to="/auth/verify" replace state={{ email: user.email }} />;
  }

  return <Outlet />;
}
