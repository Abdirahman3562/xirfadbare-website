import { API_BASE_URL } from '../config';

// Get user profile
export const getUserProfile = async (token) => {
  try {
    const response = await fetch(`${API_BASE_URL}/users/profile`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Failed to fetch profile');
    return data;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    throw error;
  }
};

// Update user profile
export const updateUserProfile = async (userData, token) => {
  try {
    const response = await fetch(`${API_BASE_URL}/users/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(userData),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Failed to update profile');
    }

    return data;
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
};

// Get all users (Admin only)
export const getUsers = async (token) => {
  try {
    const response = await fetch(`${API_BASE_URL}/users`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Failed to fetch users');
    return data;
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
};

// Create user by Admin
export const adminCreateUser = async (userData, token) => {
  try {
    const response = await fetch(`${API_BASE_URL}/users/admin-create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(userData),
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Failed to create user');
    return data;
  } catch (error) {
    console.error('Error creating user by admin:', error);
    throw error;
  }
};

// Delete user (Admin only)
export const deleteUser = async (userId, token) => {
  try {
    const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Failed to delete user');
    return data;
  } catch (error) {
    console.error('Error deleting user:', error);
    throw error;
  }
};

// Update user role (Admin only)
export const updateUserRole = async (userId, role, token) => {
  try {
    const response = await fetch(`${API_BASE_URL}/users/${userId}/role`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ role }),
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Failed to update user role');
    return data;
  } catch (error) {
    console.error('Error updating user role:', error);
    throw error;
  }
};

// Toggle user status (Admin only)
export const toggleUserStatus = async (userId, token) => {
  try {
    const response = await fetch(`${API_BASE_URL}/users/${userId}/status`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Failed to toggle status');
    return data;
  } catch (error) {
    console.error('Error toggling user status:', error);
    throw error;
  }
};

// Verify 2FA code
export const verify2FA = async (email, code) => {
  try {
    const response = await fetch(`${API_BASE_URL}/users/verify-2fa`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, code }),
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Invalid or expired code');
    return data;
  } catch (error) {
    console.error('Error verifying 2FA:', error);
    throw error;
  }
};

// Update user by Admin
export const adminUpdateUser = async (userId, userData, token) => {
  try {
    const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(userData),
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Failed to update user');
    return data;
  } catch (error) {
    console.error('Error updating user by admin:', error);
    throw error;
  }
};

// Upload image
export const uploadImage = async (formData, token) => {
  try {
    const response = await fetch(`${API_BASE_URL}/upload`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to upload image');
    }

    return await response.text();
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
};
