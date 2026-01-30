import { useState, useEffect } from 'react';

/**
 * Custom hook to check user permissions for specific modules and actions.
 * @returns {Object} - contains canAccess function and user metadata
 */
export const usePermissions = () => {
    const [user, setUser] = useState(null);

    useEffect(() => {
        const storedUser = JSON.parse(localStorage.getItem('loggedInUser')) ||
            JSON.parse(localStorage.getItem('user'));
        setUser(storedUser);
    }, []);

    /**
     * Checks if the user has permission for a specific module and action.
     * @param {string} moduleId - e.g., 'certificates', 'courses'
     * @param {string} action - e.g., 'create', 'edit', 'delete', 'view'
     * @returns {boolean}
     */
    const canAccess = (moduleId, action) => {
        if (!user) return false;

        // Super Admin Bypass
        if (user.role === 'admin' || user.isSuperAdmin) return true;

        // Check granular permissions
        const permissionKey = `${moduleId}.${action}`;
        return user.permissions && user.permissions.includes(permissionKey);
    };

    return {
        canAccess,
        role: user?.role,
        isSuperAdmin: user?.role === 'admin' || user?.isSuperAdmin
    };
};
