import { API_BASE_URL } from '../config';

export const getRoleById = async (roleId, token) => {
    try {
        const response = await fetch(`${API_BASE_URL}/roles/${roleId}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            throw new Error('Failed to fetch role');
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching role:', error);
        throw error;
    }
};

export const getRoles = async (token) => {
    try {
        const response = await fetch(`${API_BASE_URL}/roles`, {
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            throw new Error('Failed to fetch roles');
        }

        const data = await response.json();
        console.log('Fetched roles:', data);
        return data;
    } catch (error) {
        console.error('Error fetching roles:', error);
        throw error;
    }
};

export const createRole = async (roleData, token) => {
    try {
        const response = await fetch(`${API_BASE_URL}/roles`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(roleData),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Failed to create role');
        return data;
    } catch (error) {
        console.error('Error creating role:', error);
        throw error;
    }
};

export const updateRole = async (roleId, roleData, token) => {
    try {
        const response = await fetch(`${API_BASE_URL}/roles/${roleId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(roleData),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Failed to update role');
        return data;
    } catch (error) {
        console.error('Error updating role:', error);
        throw error;
    }
};

export const deleteRole = async (roleId, token) => {
    try {
        const response = await fetch(`${API_BASE_URL}/roles/${roleId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Failed to delete role');
        return data;
    } catch (error) {
        console.error('Error deleting role:', error);
        throw error;
    }
};
