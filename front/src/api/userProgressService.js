import { API_BASE_URL } from '../config';

// ✅ Get user progress for a specific course
export async function getUserProgress(courseId) {
  try {
    const loggedUser = JSON.parse(localStorage.getItem('loggedInUser')) ||
      JSON.parse(localStorage.getItem('user'));
    const token = loggedUser?.token;
    if (!token) throw new Error('No authentication token found');

    const response = await fetch(`${API_BASE_URL}/progress/${courseId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) throw new Error('Failed to fetch user progress');
    const progress = await response.json();
    return progress;
  } catch (error) {
    console.error('Error fetching user progress:', error);
    return null;
  }
}

// ✅ Update user progress for a course
export async function updateUserProgress(courseId, progressData) {
  try {
    const loggedUser = JSON.parse(localStorage.getItem('loggedInUser')) ||
      JSON.parse(localStorage.getItem('user'));
    const token = loggedUser?.token;
    if (!token) throw new Error('No authentication token found');

    const response = await fetch(`${API_BASE_URL}/progress/${courseId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(progressData),
    });

    if (!response.ok) throw new Error('Failed to update user progress');
    const progress = await response.json();
    return progress;
  } catch (error) {
    console.error('Error updating user progress:', error);
    return null;
  }
}

// ✅ Get all user progress records with caching
export async function getAllUserProgress() {
  // Try to return cached data immediately if we're not wanting to wait
  const cached = localStorage.getItem('user_progress_cache');
  let cachedData = null;
  if (cached) {
    try {
      cachedData = JSON.parse(cached);
    } catch (e) {
      console.error('❌ Failed to parse progress cache:', e);
    }
  }

  try {
    const loggedUser = JSON.parse(localStorage.getItem('loggedInUser')) ||
      JSON.parse(localStorage.getItem('user'));
    const token = loggedUser?.token;
    if (!token) throw new Error('No authentication token found');

    const response = await fetch(`${API_BASE_URL}/progress`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) throw new Error('Failed to fetch user progress');
    const progressRecords = await response.json();

    // Save to cache for next time
    localStorage.setItem('user_progress_cache', JSON.stringify(progressRecords));

    return progressRecords;
  } catch (error) {
    console.error('Error fetching all user progress:', error);
    // Return cached data as fallback if server fails
    return cachedData || [];
  }
}

// ✅ Delete user progress for a course
export async function deleteUserProgress(courseId) {
  try {
    const loggedUser = JSON.parse(localStorage.getItem('loggedInUser')) ||
      JSON.parse(localStorage.getItem('user'));
    const token = loggedUser?.token;
    if (!token) throw new Error('No authentication token found');

    const response = await fetch(`${API_BASE_URL}/progress/${courseId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) throw new Error('Failed to delete user progress');
    return true;
  } catch (error) {
    console.error('Error deleting user progress:', error);
    return false;
  }
}
// ✅ Save quiz result for a lesson
export async function saveQuizResult(courseId, quizData) {
  try {
    const loggedUser = JSON.parse(localStorage.getItem('loggedInUser')) ||
      JSON.parse(localStorage.getItem('user'));
    const token = loggedUser?.token;
    if (!token) throw new Error('No authentication token found');

    const response = await fetch(`${API_BASE_URL}/progress/${courseId}/quiz`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(quizData),
    });

    if (!response.ok) throw new Error('Failed to save quiz result');
    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error saving quiz result:', error);
    return null;
  }
}
