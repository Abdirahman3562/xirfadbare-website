// Quick test script for testimonials API
const BASE_URL = process.env.API_URL || 'https://xirfadbare-backend.onrender.com';
fetch(`${BASE_URL}/api/testimonials`)
  .then(res => {
    if (res.ok) {
      return res.json();
    } else {
      throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    }
  })
  .then(data => {
    console.log('✅ Testimonials API working!');
    console.log('Data:', data);
  })
  .catch(err => {
    console.error('❌ Testimonials API error:', err.message);
  });



