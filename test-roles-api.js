import fetch from 'node-fetch';

const testApi = async () => {
    try {
        const response = await fetch('http://localhost:5000/api/roles');
        const text = await response.text();
        console.log('Status:', response.status);
        console.log('Content-Type:', response.headers.get('content-type'));
        console.log('Body start:', text.substring(0, 100));
        try {
            const json = JSON.parse(text);
            console.log('JSON successful');
        } catch (e) {
            console.log('JSON failed to parse');
        }
    } catch (error) {
        console.error('Fetch failed:', error.message);
    }
};

testApi();
