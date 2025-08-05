import fetch from 'node-fetch';

const testSignup = async () => {
    try {
        console.log('Testing signup endpoint...');
        
        const response = await fetch('http://localhost:3000/user/signup', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                firstName: 'Test',
                lastName: 'User',
                email: 'testuser@example.com',
                password: 'password123',
                confirmPassword: 'password123'
            })
        });

        const data = await response.json();
        
        console.log('Response status:', response.status);
        console.log('Response data:', data);
        
        if (response.ok) {
            console.log('✅ Signup endpoint is working correctly');
        } else {
            console.log('❌ Signup endpoint returned an error:', data.message);
        }
        
    } catch (error) {
        console.error('❌ Error testing signup:', error.message);
    }
};

testSignup();
