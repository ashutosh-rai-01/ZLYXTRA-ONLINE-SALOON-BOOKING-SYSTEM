const jwt = require('jsonwebtoken');

const JWT_SECRET = 'super_secret_jwt_key_12345';
const token = jwt.sign({ id: 'some_mock_user_id' }, JWT_SECRET, { expiresIn: '30d' });

console.log('Using JWT Token:', token);

const updateProfile = async () => {
    try {
        const res = await fetch('http://localhost:5000/api/auth/profile', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                name: 'Guest User',
                phone: '6306726421',
                email: 'abcd@gmail.com',
                gender: 'male',
                birthDate: ''
            })
        });
        const status = res.status;
        const data = await res.json();
        console.log('SUCCESS RESP:', status, data);
    } catch (err) {
        console.error('ERROR RESP:', err.message);
    }
};

updateProfile();
