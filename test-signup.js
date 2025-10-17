const axios = require('axios');

async function testSignup() {
  const testUser = {
    firstName: 'Test',
    lastName: 'User',
    email: 'test@example.com',
    password: 'TestPassword123',
    phone: '1234567890'
  };

  try {
    console.log('Testing signup with data:', testUser);
    
    const response = await axios.post('http://localhost:5001/api/auth/signup', testUser, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    console.log('Signup successful!');
    console.log('Status:', response.status);
    console.log('Response data:', response.data);
  } catch (error) {
    console.error('Signup failed!');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Error data:', error.response.data);
    } else if (error.request) {
      console.error('No response received:', error.request);
    } else {
      console.error('Error:', error.message);
    }
  }
}

testSignup();