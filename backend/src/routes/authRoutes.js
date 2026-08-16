// Ye file batati hai ki kaunsa URL hit hone pe kaunsa function chalega
const express = require('express');
const router = express.Router();
const { signup, login } = require('../controllers/authController');

// POST /api/auth/signup -> naya account banao
router.post('/signup', signup);

// POST /api/auth/login -> login karo
router.post('/login', login);

module.exports = router;
