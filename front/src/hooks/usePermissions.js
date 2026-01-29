import { useState, useEffect } from 'react';

export const usePermissions = () => {
    const [userPermissions, setUserPermissions] = useState([]);
    const [isSuperAdmin, setIsSuperAdmin] = useState(false);
    const [loading, setLoading] = useState(true);
    const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser') || '{}');
    const token = loggedInUser?.token;

    const fetchUserProfile = async () => {
        if (!token) {
            setLoading(false);
            return;
        }
        try {
            const response = await fetch("http://localhost:5000/api/users/profile", {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (response.ok) {
                setUserPermissions(data.permissions || []);
                setIsSuperAdmin(data.isSuperAdmin || data.role === 'admin');
            } else {
                // Fallback to localStorage if API fails but we have data
                setUserPermissions(loggedInUser.permissions || []);
                setIsSuperAdmin(loggedInUser.role === 'admin');
            }
        } catch (error) {
            console.error("Error fetching profile in hook:", error);
            // Fallback to localStorage
            setUserPermissions(loggedInUser.permissions || []);
            setIsSuperAdmin(loggedInUser.role === 'admin');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUserProfile();

        // Listen for login events to refresh
        const handleLogin = () => fetchUserProfile();
        window.addEventListener('userLogin', handleLogin);
        return () => window.removeEventListener('userLogin', handleLogin);
    }, [token]);

    const hasPermission = (permissionKey) => {
        if (isSuperAdmin) return true;
        return userPermissions.includes(permissionKey);
    };

    return { userPermissions, isSuperAdmin, hasPermission, loading };
};
