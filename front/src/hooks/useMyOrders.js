import { useState, useEffect } from 'react';
import { API_BASE_URL } from '../config';

// 🚀 Singleton cache to share between all cards/instances
let ordersCache = null;
let fetchPromise = null;

// Helper to get initial data from localStorage if available
const getSavedEnrolledData = () => {
    try {
        const saved = localStorage.getItem('enrolled_data');
        return saved ? JSON.parse(saved) : { courses: [], bundles: [] };
    } catch (e) {
        return { courses: [], bundles: [] };
    }
};

export function useMyOrders(user) {
    const [orders, setOrders] = useState(ordersCache || []);
    const [loading, setLoading] = useState(!ordersCache);
    const [version, setVersion] = useState(0);

    // Use saved data for instant availability on first load
    const savedData = getSavedEnrolledData();
    const [enrolledCourseIds, setEnrolledCourseIds] = useState(new Set(savedData.courses));
    const [enrolledBundleIds, setEnrolledBundleIds] = useState(new Set(savedData.bundles));

    useEffect(() => {
        if (!user) {
            setOrders([]);
            setEnrolledCourseIds(new Set());
            setEnrolledBundleIds(new Set());
            setLoading(false);
            ordersCache = null;
            fetchPromise = null;
            localStorage.removeItem('enrolled_data');
            return;
        }

        // ... logic for fetchPromise and ordersCache ...

        const fetchOrders = async () => {
            try {
                fetchPromise = (async () => {
                    const response = await fetch(`${API_BASE_URL}/orders/myorders`, {
                        headers: { Authorization: `Bearer ${user.token}` },
                    });

                    if (response.ok) {
                        return await response.json();
                    }
                    return null;
                })();

                const data = await fetchPromise;
                if (data) {
                    ordersCache = data;
                    updateState(data);
                }
            } catch (error) {
                console.error("Failed to fetch orders:", error);
            } finally {
                setLoading(false);
            }
        };

        const updateState = (data) => {
            setOrders(data);

            const courses = new Set();
            const bundles = new Set();

            data.forEach(order => {
                if (order.status === 'active' || order.status === 'completed') {
                    if (order.isBundle && order.bundle) {
                        bundles.add(String(order.bundle));
                    } else if (order.course) {
                        courses.add(String(order.course));
                    }
                }
            });

            setEnrolledCourseIds(courses);
            setEnrolledBundleIds(bundles);

            // Save to localStorage for instant load next time
            localStorage.setItem('enrolled_data', JSON.stringify({
                courses: Array.from(courses),
                bundles: Array.from(bundles)
            }));
        };

        // If we already have a promise in flight, just wait for it
        if (fetchPromise) {
            fetchPromise.then(data => {
                if (data) updateState(data);
            });
            // We still want to let it run once if it's the first time
        }

        // If we have cache, use it and don't fetch (unless we want to re-validate)
        if (ordersCache && version === 0) {
            updateState(ordersCache);
            setLoading(false);
            return;
        }

        fetchOrders();
    }, [user?.token, version]); // Added version to dependency array

    const isEnrolledInCourse = (courseId) => enrolledCourseIds.has(String(courseId));
    const isEnrolledInBundle = (bundleId) => enrolledBundleIds.has(String(bundleId));

    const refreshOrders = () => {
        ordersCache = null;
        fetchPromise = null;
        setVersion(v => v + 1);
    };

    return {
        orders,
        loading,
        isEnrolledInCourse,
        isEnrolledInBundle,
        refreshOrders
    };
}
