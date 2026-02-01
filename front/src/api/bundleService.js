import { API_BASE_URL } from '../config';

// ✅ Get all bundles
export const getAllBundles = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/bundles`);
        if (!response.ok) throw new Error('Failed to fetch bundles');
        return await response.json();
    } catch (error) {
        console.error('Error in getAllBundles:', error);
        throw error;
    }
};

// ✅ Get single bundle
export const getBundleById = async (id) => {
    try {
        const response = await fetch(`${API_BASE_URL}/bundles/${id}`);
        if (!response.ok) throw new Error('Failed to fetch bundle');
        return await response.json();
    } catch (error) {
        console.error('Error in getBundleById:', error);
        throw error;
    }
};

// ✅ Create bundle
export const createBundle = async (bundleData) => {
    try {
        const loggedUser = JSON.parse(localStorage.getItem('loggedInUser')) || JSON.parse(localStorage.getItem('user'));
        const token = loggedUser?.token;

        const response = await fetch(`${API_BASE_URL}/bundles`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(bundleData),
        });
        if (!response.ok) throw new Error('Failed to create bundle');
        return await response.json();
    } catch (error) {
        console.error('Error in createBundle:', error);
        throw error;
    }
};

// ✅ Update bundle
export const updateBundle = async (id, bundleData) => {
    try {
        const loggedUser = JSON.parse(localStorage.getItem('loggedInUser')) || JSON.parse(localStorage.getItem('user'));
        const token = loggedUser?.token;

        const response = await fetch(`${API_BASE_URL}/bundles/${id}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(bundleData),
        });
        if (!response.ok) throw new Error('Failed to update bundle');
        return await response.json();
    } catch (error) {
        console.error('Error in updateBundle:', error);
        throw error;
    }
};

// ✅ Delete bundle
export const deleteBundle = async (id) => {
    try {
        const loggedUser = JSON.parse(localStorage.getItem('loggedInUser')) || JSON.parse(localStorage.getItem('user'));
        const token = loggedUser?.token;

        const response = await fetch(`${API_BASE_URL}/bundles/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });
        if (!response.ok) throw new Error('Failed to delete bundle');
        return await response.json();
    } catch (error) {
        console.error('Error in deleteBundle:', error);
        throw error;
    }
};
