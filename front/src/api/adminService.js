import { API_BASE_URL } from '../config';

// ==========================
// Dashboard Stats
// ==========================

// Get Dashboard Stats
export async function getDashboardStats() {
    try {
        const user = JSON.parse(localStorage.getItem('loggedInUser'));
        const response = await fetch(`${API_BASE_URL}/admin/stats`, { // Make sure this endpoint exists in backend
            headers: {
                'Authorization': `Bearer ${user.token}`,
            },
        });
        if (!response.ok) throw new Error('Failed to fetch stats');
        return await response.json();
    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        // Return dummy data if backend endpoint is not ready yet, to prevent frontend crash
        return {
            totalRevenue: 0,
            activeStudents: 0,
            totalCourses: 0,
            totalInstructors: 0
        };
    }
}

// ==========================
// User Management API
// ==========================

// Get all users
export async function getAllUsers() {
    try {
        const user = JSON.parse(localStorage.getItem('loggedInUser'));
        const response = await fetch(`${API_BASE_URL}/users`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${user.token}`,
            },
        });
        if (!response.ok) throw new Error('Failed to fetch users');
        return await response.json();
    } catch (error) {
        console.error('Error fetching users:', error);
        throw error;
    }
}

// Create user (Admin only)
export async function createUser(userData) {
    try {
        const user = JSON.parse(localStorage.getItem('loggedInUser'));
        const response = await fetch(`${API_BASE_URL}/users`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${user.token}`,
            },
            body: JSON.stringify(userData),
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to create user');
        }
        return await response.json();
    } catch (error) {
        console.error('Error creating user:', error);
        throw error;
    }
}

// Update user (Admin only)
export async function updateUser(userId, userData) {
    try {
        const user = JSON.parse(localStorage.getItem('loggedInUser'));
        const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${user.token}`,
            },
            body: JSON.stringify(userData),
        });
        if (!response.ok) throw new Error('Failed to update user');
        return await response.json();
    } catch (error) {
        console.error('Error updating user:', error);
        throw error;
    }
}

// Delete user (Admin only)
export async function deleteUser(userId) {
    try {
        const user = JSON.parse(localStorage.getItem('loggedInUser'));
        const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${user.token}`,
            },
        });
        if (!response.ok) throw new Error('Failed to delete user');
        return await response.json();
    } catch (error) {
        console.error('Error deleting user:', error);
        throw error;
    }
}


// ==========================
// Testimonials Management
// ==========================

// Get all testimonials (admin view - should ideally return pending ones too if backend supports)
export async function getTestimonials() {
    try {
        const user = JSON.parse(localStorage.getItem('loggedInUser'));
        const response = await fetch(`${API_BASE_URL}/testimonials`, { // Assuming public endpoint returns all for now, or use admin specific one
            headers: {
                'Authorization': `Bearer ${user.token}`,
            },
        });
        if (!response.ok) throw new Error('Failed to fetch testimonials');
        return await response.json();
    } catch (error) {
        console.error('Error fetching testimonials:', error);
        throw error;
    }
}

export async function createTestimonial(data) {
    try {
        const user = JSON.parse(localStorage.getItem('loggedInUser'));
        const response = await fetch(`${API_BASE_URL}/testimonials`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${user.token}`,
            },
            body: JSON.stringify(data),
        });
        if (!response.ok) throw new Error('Failed to create testimonial');
        return await response.json();
    } catch (error) {
        console.error('Error creating testimonial:', error);
        throw error;
    }
}

export async function updateTestimonial(id, data) {
    try {
        const user = JSON.parse(localStorage.getItem('loggedInUser'));
        const response = await fetch(`${API_BASE_URL}/testimonials/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${user.token}`,
            },
            body: JSON.stringify(data),
        });
        if (!response.ok) throw new Error('Failed to update testimonial');
        return await response.json();
    } catch (error) {
        console.error('Error updating testimonial:', error);
        throw error;
    }
}

export async function deleteTestimonial(id) {
    try {
        const user = JSON.parse(localStorage.getItem('loggedInUser'));
        const response = await fetch(`${API_BASE_URL}/testimonials/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${user.token}`,
            },
        });
        if (!response.ok) throw new Error('Failed to delete testimonial');
        return await response.json();
    } catch (error) {
        console.error('Error deleting testimonial:', error);
        throw error;
    }
}

// ==========================
// FAQ Management
// ==========================

// Get all FAQs (admin view)
export async function getFAQs() {
    try {
        const user = JSON.parse(localStorage.getItem('loggedInUser'));
        const response = await fetch(`${API_BASE_URL}/faqs`, {
            headers: {
                'Authorization': `Bearer ${user.token}`,
            },
        });
        if (!response.ok) throw new Error('Failed to fetch FAQs');
        return await response.json();
    } catch (error) {
        console.error('Error fetching FAQs:', error);
        throw error;
    }
}

// Create FAQ
export async function createFAQ(data) {
    try {
        const user = JSON.parse(localStorage.getItem('loggedInUser'));
        const response = await fetch(`${API_BASE_URL}/faqs`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${user.token}`,
            },
            body: JSON.stringify(data),
        });
        if (!response.ok) throw new Error('Failed to create FAQ');
        return await response.json();
    } catch (error) {
        console.error('Error creating FAQ:', error);
        throw error;
    }
}

// Update FAQ
export async function updateFAQ(id, data) {
    try {
        const user = JSON.parse(localStorage.getItem('loggedInUser'));
        const response = await fetch(`${API_BASE_URL}/faqs/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${user.token}`,
            },
            body: JSON.stringify(data),
        });
        if (!response.ok) throw new Error('Failed to update FAQ');
        return await response.json();
    } catch (error) {
        console.error('Error updating FAQ:', error);
        throw error;
    }
}

// Delete FAQ
export async function deleteFAQ(id) {
    try {
        const user = JSON.parse(localStorage.getItem('loggedInUser'));
        const response = await fetch(`${API_BASE_URL}/faqs/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${user.token}`,
            },
        });
        if (!response.ok) throw new Error('Failed to delete FAQ');
        return await response.json();
    } catch (error) {
        console.error('Error deleting FAQ:', error);
        throw error;
    }
}
