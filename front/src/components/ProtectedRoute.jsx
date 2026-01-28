import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

const ProtectedRoute = ({ children, role }) => {
    const location = useLocation();
    const userStr = localStorage.getItem('loggedInUser');
    const user = userStr ? JSON.parse(userStr) : null;

    if (!user || !user.token) {
        // Redirect them to the /login page, but save the current location they were
        // trying to go to when they were redirected. This allows us to send them
        // along to that page after they login, which is a nicer user experience.
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (role && user.role !== role) {
        // If user has wrong role, redirect to their allowed dashboard or home
        if (user.role === 'admin') return <Navigate to="/admin/dashboard" replace />;
        if (user.role === 'instructor') return <Navigate to="/instructor/dashboard" replace />;
        if (user.role === 'student') return <Navigate to="/student/dashboard" replace />;
        return <Navigate to="/" replace />;
    }

    return children;
};

export default ProtectedRoute;
