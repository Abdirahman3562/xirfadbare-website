import { API_BASE_URL } from '../config';

export async function getTemplateById(id) {
    try {
        const loggedUser = JSON.parse(localStorage.getItem('loggedInUser')) ||
            JSON.parse(localStorage.getItem('user'));
        const token = loggedUser?.token;
        if (!token) throw new Error('No authentication token found');

        const response = await fetch(`${API_BASE_URL}/certificates/template/${id}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) throw new Error('Failed to fetch template');
        return await response.json();
    } catch (error) {
        console.error('Error fetching template:', error);
        return null;
    }
}
