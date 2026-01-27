import { API_BASE_URL } from '../config';

// ✅ Get all instructors
export async function getAllInstructors() {
  try {
    const response = await fetch(`${API_BASE_URL}/instructors`);
    if (!response.ok) throw new Error('Failed to fetch instructors');
    const instructors = await response.json();
    return instructors;
  } catch (error) {
    console.error('Error fetching instructors:', error);
    return [];
  }
}

// ✅ Get single instructor by ID
export async function getInstructorById(id) {
  try {
    const response = await fetch(`${API_BASE_URL}/instructors/${id}`);
    if (!response.ok) throw new Error('Failed to fetch instructor');
    const instructor = await response.json();
    return instructor;
  } catch (error) {
    console.error('Error fetching instructor:', error);
    return null;
  }
}

// ✅ Get instructor by slug
export async function getInstructorBySlug(slug) {
  try {
    const response = await fetch(`${API_BASE_URL}/instructors/slug/${slug}`);
    if (!response.ok) throw new Error('Failed to fetch instructor');
    const instructor = await response.json();
    return instructor;
  } catch (error) {
    console.error('Error fetching instructor:', error);
    return null;
  }
}

// ✅ Update instructor
export async function updateInstructor(id, data) {
  try {
    const response = await fetch(`${API_BASE_URL}/instructors/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) throw new Error('Failed to update instructor');
    const instructor = await response.json();
    return instructor;
  } catch (error) {
    console.error('Error updating instructor:', error);
    return null;
  }
}



