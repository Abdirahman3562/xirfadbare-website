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
        // Special logic for admin dashboard: allow any staff role with permissions
        const isStaff = user.role === 'admin' || (user.permissions && user.permissions.length > 0);

        if (role === 'admin' && isStaff) {
            return children;
        }

        // If user has wrong role, redirect to their allowed dashboard
        if (isStaff) {
            if (user.role === 'instructor') return <Navigate to="/instructor/dashboard" replace />;
            return <Navigate to="/admin/dashboard" replace />;
        }

        if (user.role === 'student') return <Navigate to="/dashboard/student" replace />;
        return <Navigate to="/" replace />;
    }

    return children;
};

export default ProtectedRoute;
