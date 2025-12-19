// Test script to check dashboard API endpoints
const testAPIs = async () => {
  const baseUrl = 'http://localhost:5000/api';

  console.log('🔍 TESTING DASHBOARD API ENDPOINTS\n');

  const endpoints = [
    { name: 'Users', url: `${baseUrl}/users` },
    { name: 'Courses', url: `${baseUrl}/courses` },
    { name: 'Orders', url: `${baseUrl}/orders` },
    { name: 'Testimonials', url: `${baseUrl}/testimonials` },
    { name: 'Contacts', url: `${baseUrl}/contacts` }
  ];

  for (const endpoint of endpoints) {
    try {
      console.log(`📡 Testing ${endpoint.name} endpoint: ${endpoint.url}`);

      // First try without auth (for public endpoints)
      let response = await fetch(endpoint.url);
      let data = [];

      if (response.ok) {
        data = await response.json();
        console.log(`✅ ${endpoint.name}: ${Array.isArray(data) ? data.length : 'N/A'} items`);
        if (Array.isArray(data) && data.length > 0) {
          console.log(`   Sample:`, JSON.stringify(data[0], null, 2).substring(0, 200) + '...');
        }
      } else {
        console.log(`❌ ${endpoint.name} failed without auth: ${response.status} ${response.statusText}`);

        // Try with auth header (for protected endpoints)
        // Using test admin token
        console.log(`   Note: ${endpoint.name} might require authentication`);
      }

      console.log('');
    } catch (error) {
      console.log(`❌ ${endpoint.name} error:`, error.message);
      console.log('');
    }
  }

  console.log('🎯 DASHBOARD API TEST COMPLETE');
};

testAPIs();