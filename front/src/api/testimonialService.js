import { API_BASE_URL } from '../config';

// ✅ Get all testimonials
export async function getTestimonials() {
  try {
    const response = await fetch(`${API_BASE_URL}/testimonials`);
    if (!response.ok) throw new Error('Failed to fetch testimonials');
    const testimonials = await response.json();
    return testimonials;
  } catch (error) {
    console.error('Error fetching testimonials:', error);
    return [];
  }
}

// ✅ Get single testimonial by ID
export async function getTestimonialById(id) {
  try {
    const response = await fetch(`${API_BASE_URL}/testimonials/${id}`);
    if (!response.ok) throw new Error('Failed to fetch testimonial');
    const testimonial = await response.json();
    return testimonial;
  } catch (error) {
    console.error('Error fetching testimonial:', error);
    return null;
  }
}


