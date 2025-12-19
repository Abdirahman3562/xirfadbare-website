import { API_BASE_URL } from '../config';

// Get all comments for a blog
export async function getCommentsByBlog(blogId) {
  try {
    const response = await fetch(`${API_BASE_URL}/comments/${blogId}`);
    if (!response.ok) throw new Error('Failed to fetch comments');
    const comments = await response.json();
    return comments;
  } catch (error) {
    console.error('Error fetching comments:', error);
    return [];
  }
}

// Create a new comment
export async function createComment(content, blogId, parentCommentId = null) {
  try {
    const user = JSON.parse(localStorage.getItem('loggedInUser')) ||
                  JSON.parse(localStorage.getItem('user'));
    if (!user || !user.token) {
      throw new Error('User not authenticated');
    }

    const response = await fetch(`${API_BASE_URL}/comments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${user.token}`,
      },
      body: JSON.stringify({ content, blogId, parentCommentId }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to create comment');
    }

    const comment = await response.json();
    return comment;
  } catch (error) {
    console.error('Error creating comment:', error);
    throw error;
  }
}

// Update a comment
export async function updateComment(commentId, content) {
  try {
    const user = JSON.parse(localStorage.getItem('loggedInUser')) ||
                  JSON.parse(localStorage.getItem('user'));
    if (!user || !user.token) {
      throw new Error('User not authenticated');
    }

    const response = await fetch(`${API_BASE_URL}/comments/${commentId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${user.token}`,
      },
      body: JSON.stringify({ content }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to update comment');
    }

    const comment = await response.json();
    return comment;
  } catch (error) {
    console.error('Error updating comment:', error);
    throw error;
  }
}

// Delete a comment
export async function deleteComment(commentId) {
  try {
    const user = JSON.parse(localStorage.getItem('loggedInUser')) ||
                  JSON.parse(localStorage.getItem('user'));
    if (!user || !user.token) {
      throw new Error('User not authenticated');
    }

    const response = await fetch(`${API_BASE_URL}/comments/${commentId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${user.token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to delete comment');
    }

    return true;
  } catch (error) {
    console.error('Error deleting comment:', error);
    throw error;
  }
}
