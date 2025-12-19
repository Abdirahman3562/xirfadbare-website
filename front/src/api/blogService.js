import { API_BASE_URL } from '../config';

// ✅ Get all blogs with author details
export async function getAllBlogs() {
  try {
    const response = await fetch(`${API_BASE_URL}/blogs`);
    if (!response.ok) throw new Error('Failed to fetch blogs');
    const blogs = await response.json();
    return blogs;
  } catch (error) {
    console.error('Error fetching blogs:', error);
    return [];
  }
}

// ✅ Get single blog by ID
export async function getBlogById(id) {
  try {
    const response = await fetch(`${API_BASE_URL}/blogs/${id}`);
    if (!response.ok) throw new Error('Failed to fetch blog');
    const blog = await response.json();
    return blog;
  } catch (error) {
    console.error('Error fetching blog:', error);
    return null;
  }
}

// ✅ Get blogs by author ID
export async function getBlogsByAuthorId(authorId) {
  try {
    const response = await fetch(`${API_BASE_URL}/blogs/author/${authorId}`);
    if (!response.ok) throw new Error('Failed to fetch author blogs');
    const blogs = await response.json();
    return blogs;
  } catch (error) {
    console.error('Error fetching author blogs:', error);
    return [];
  }
}

// ✅ Update blog comments (POST method - saves to blog collection)
export async function updateBlogComments(blogId, comments) {
  try {
    console.log(`💬 Updating blog comments: ${blogId}`);
    console.log('📋 Comments data:', comments);
    console.log('🔢 Number of comments:', comments.length);

    const requestBody = { comments };
    console.log('📤 Request body:', JSON.stringify(requestBody, null, 2));

    const response = await fetch(`${API_BASE_URL}/blogs/${blogId}/comments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    console.log('📡 Response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Error response:', errorText);
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch (e) {
        errorData = { message: errorText };
      }
      throw new Error(errorData.message || 'Failed to update blog comments');
    }

    const result = await response.json();
    console.log('✅ Blog comments updated successfully');
    console.log('📊 Response data:', result);

    return result.success ? result.data : null;
  } catch (error) {
    console.error('❌ Error updating blog comments:', error);
    throw error;
  }
}

// ✅ Update entire blog (PUT method - for other updates)
export async function updateBlog(blogId, updateData) {
  try {
    console.log(`📝 Updating blog: ${blogId}`);
    console.log('📋 Update data:', updateData);

    const response = await fetch(`${API_BASE_URL}/blogs/${blogId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updateData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to update blog');
    }

    const result = await response.json();
    console.log('✅ Blog updated successfully');

    return result.success ? result.data : null;
  } catch (error) {
    console.error('❌ Error updating blog:', error);
    throw error;
  }
}

