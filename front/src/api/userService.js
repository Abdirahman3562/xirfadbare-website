import { API_BASE_URL } from '../config';

// Update user profile
export const updateUserProfile = async (userData, token) => {
  try {
    console.log('Making API call to:', `${API_BASE_URL}/users/profile`);
    console.log('With data:', userData);

    const response = await fetch(`${API_BASE_URL}/users/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(userData),
    });

    const data = await response.json();
    console.log('API response:', response.status, data);

    if (!response.ok) {
      throw new Error(data.message || 'Failed to update profile');
    }

    return data;
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
};
