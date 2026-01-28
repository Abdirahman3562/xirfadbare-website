import { API_BASE_URL } from '../config';

// ✅ Get system settings
export async function getSystemSettings() {
    try {
        const response = await fetch(`${API_BASE_URL}/settings`);
        if (!response.ok) throw new Error('Failed to fetch settings');
        return await response.json();
    } catch (error) {
        console.error('Error fetching settings:', error);
        return null;
    }
}

// ✅ Update system settings
export async function updateSystemSettings(settingsData) {
    try {
        const response = await fetch(`${API_BASE_URL}/settings`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(settingsData),
        });
        if (!response.ok) throw new Error('Failed to update settings');
        return await response.json();
    } catch (error) {
        console.error('Error updating settings:', error);
        return null;
    }
}
