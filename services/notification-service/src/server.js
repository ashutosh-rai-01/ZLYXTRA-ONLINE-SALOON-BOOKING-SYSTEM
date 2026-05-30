require('dotenv').config({ path: '../.env' });
const express = require('express');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

app.post('/send', (req, res) => {
    // Implement Twilio / Nodemailer logic here
    console.log('Notification requested:', req.body);
    res.json({ success: true, message: 'Notification sent!' });
});

const PORT = 5005;
app.listen(PORT, () => console.log(`🔔 Notification Service running on port ${PORT}`));
