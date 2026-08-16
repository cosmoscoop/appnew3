// Ye main file hai — server yahan se start hota hai
require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();

// Middleware - request ko samajhne ke liye
app.use(cors());
app.use(express.json());

// Health check route - test karne ke liye ki server chal raha hai ya nahi
app.get('/', (req, res) => {
    res.json({ message: '🚀 Instagram-clone backend chal raha hai!' });
});

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/posts', require('./routes/postRoutes'));
app.use('/api/users', require('./routes/userRoutes'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`✅ Server chal raha hai: http://localhost:${PORT}`);
});
