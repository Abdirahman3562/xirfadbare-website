// Simple script to check if backend is running
const checkBackend = async () => {
  const baseUrl = process.env.API_URL || 'https://xirfadbare-backend.onrender.com';

  console.log('🔍 Checking Backend Connectivity...\n');

  try {
    console.log(`📡 Testing connection to: ${baseUrl}`);
    const response = await fetch(baseUrl);

    if (response.ok) {
      const text = await response.text();
      console.log('✅ Backend is RUNNING');
      console.log('Response:', text.substring(0, 100));
    } else {
      console.log('❌ Backend responded but with error:', response.status);
    }
  } catch (error) {
    console.log('❌ Backend is NOT RUNNING or not reachable');
    console.log('Error:', error.message);
    console.log('\n💡 To start the backend:');
    console.log('1. Open a new terminal');
    console.log('2. Navigate to the backend folder: cd backend');
    console.log('3. Run: npm run dev');
  }
};

checkBackend();

