const urls = [
    'https://xirfadbare-backend.onrender.com/api/settings',
    'http://localhost:5000/api/settings',
    'http://127.0.0.1:5000/api/settings'
];

async function test() {
    for (const url of urls) {
        console.log(`Testing ${url}...`);
        try {
            const response = await fetch(url);
            console.log(`Status: ${response.status} ${response.statusText}`);
            if (response.ok) {
                const data = await response.json();
                console.log(`✅ Success! Logo path: ${data.logo}`);
                if (data.logo) {
                    const logoUrl = data.logo.startsWith('http') ? data.logo : `http://localhost:5000${data.logo.startsWith('/') ? '' : '/'}${data.logo}`;
                    console.log(`Testing image access: ${logoUrl}`);
                    const imgRes = await fetch(logoUrl, { method: 'HEAD' });
                    console.log(`Image Status: ${imgRes.status} ${imgRes.statusText}`);
                }
            }
        } catch (err) {
            console.error(`❌ Error with ${url}:`, err.message);
        }
        console.log('---');
    }
}

test();
