import { API_BASE_URL } from '../config';

// ✅ Get all FAQs
export async function getFAQs() {
  try {
    const response = await fetch(`${API_BASE_URL}/faqs`);
    if (!response.ok) throw new Error('Failed to fetch FAQs');
    const faqs = await response.json();
    return faqs;
  } catch (error) {
    console.error('Error fetching FAQs:', error);
    return [];
  }
}

// ✅ Get FAQ by ID
export async function getFAQById(id) {
  try {
    const response = await fetch(`${API_BASE_URL}/faqs/${id}`);
    if (!response.ok) throw new Error('Failed to fetch FAQ');
    const faq = await response.json();
    return faq;
  } catch (error) {
    console.error('Error fetching FAQ:', error);
    return null;
  }
}


