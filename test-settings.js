
// ESM syntax
const BASE_URL = process.env.API_URL || 'https://xirfadbare-backend.onrender.com';
const API_URL = `${BASE_URL}/api/settings`;

console.log(`Testing ${API_URL}...`);

try {
    const response = await fetch(API_URL);
    console.log(`Status: ${response.status} ${response.statusText}`);
    const text = await response.text();

    if (response.ok) {
        try {
            const data = JSON.parse(text);
            console.log('✅ Success! Settings:', data);
        } catch (e) {
            console.log('⚠️ Success but not JSON:', text);
        }
    } else {
        console.error('❌ Failed!');
        console.error('Response:', text);
    }
} catch (err) {
    console.error('❌ Network or Server Error:', err.message);
}
