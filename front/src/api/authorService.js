import { API_BASE_URL } from '../config';

// ✅ Get all authors
export async function getAllAuthors() {
  try {
    const response = await fetch(`${API_BASE_URL}/authors`);
    if (!response.ok) throw new Error('Failed to fetch authors');
    const authors = await response.json();
    return authors;
  } catch (error) {
    console.error('Error fetching authors:', error);
    return [];
  }
}

// ✅ Get single author by ID
export async function getAuthorById(id) {
  try {
    const response = await fetch(`${API_BASE_URL}/authors/${id}`);
    if (!response.ok) throw new Error('Failed to fetch author');
    const author = await response.json();
    return author;
  } catch (error) {
    console.error('Error fetching author:', error);
    return null;
  }
}

// ✅ Get author by username
export async function getAuthorByUsername(username) {
  try {
    const response = await fetch(`${API_BASE_URL}/authors/username/${username}`);
    if (!response.ok) throw new Error('Failed to fetch author');
    const author = await response.json();
    return author;
  } catch (error) {
    console.error('Error fetching author:', error);
    return null;
  }
}

// ✅ Create a new author
export async function createAuthor(authorData) {
  try {
    const response = await fetch(`${API_BASE_URL}/authors`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(authorData),
    });
    if (!response.ok) throw new Error('Failed to create author');
    return await response.json();
  } catch (error) {
    console.error('Error creating author:', error);
    return null;
  }
}

// ✅ Update an author
export async function updateAuthor(id, authorData) {
  try {
    const response = await fetch(`${API_BASE_URL}/authors/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(authorData),
    });
    if (!response.ok) throw new Error('Failed to update author');
    return await response.json();
  } catch (error) {
    console.error('Error updating author:', error);
    return null;
  }
}

// ✅ Delete an author
export async function deleteAuthor(id) {
  try {
    const response = await fetch(`${API_BASE_URL}/authors/${id}`, {
      method: "DELETE",
    });
    if (!response.ok) throw new Error('Failed to delete author');
    return true;
  } catch (error) {
    console.error('Error deleting author:', error);
    return false;
  }
}
