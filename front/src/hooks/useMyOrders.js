import { useState, useEffect } from 'react';
import { API_BASE_URL } from '../config';

// Helper to get initial data from localStorage if available
const getSavedStore = () => {
    try {
        const saved = localStorage.getItem('enrolled_data');
        const orders = localStorage.getItem('orders_cache');
        return {
            ids: saved ? JSON.parse(saved) : { courses: [], bundles: [] },
            orders: orders ? JSON.parse(orders) : null
        };
    } catch (e) {
        return { ids: { courses: [], bundles: [] }, orders: null };
    }
};

const initialStore = getSavedStore();
let ordersCache = initialStore.orders;
let fetchPromise = null;

export function useMyOrders(user) {
    const [orders, setOrders] = useState(ordersCache || []);
    const [loading, setLoading] = useState(!ordersCache);
    const [version, setVersion] = useState(0);

    const [enrolledCourseIds, setEnrolledCourseIds] = useState(new Set(initialStore.ids.courses));
    const [enrolledBundleIds, setEnrolledBundleIds] = useState(new Set(initialStore.ids.bundles));

    useEffect(() => {
        if (!user) {
            setOrders([]);
            setEnrolledCourseIds(new Set());
            setEnrolledBundleIds(new Set());
            setLoading(false);
            ordersCache = null;
            fetchPromise = null;
            localStorage.removeItem('enrolled_data');
            localStorage.removeItem('orders_cache');
            return;
        }

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
            localStorage.setItem('orders_cache', JSON.stringify(data));
        };

        // If we already have a promise in flight, just wait for it
        if (fetchPromise) {
            fetchPromise.then(data => {
                if (data) updateState(data);
            });
        }

        // If we have cache, use it and only re-validate if version changes
        if (ordersCache && version === 0) {
            updateState(ordersCache);
            setLoading(false);
            return;
        }

        fetchOrders();
    }, [user?.token, version]);

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
