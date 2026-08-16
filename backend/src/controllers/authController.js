// Signup aur Login ka logic yahan hai
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const UserModel = require('../models/userModel');

// Token banane ka helper function
function generateToken(userId) {
    return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '30d' });
}

// ===== SIGNUP =====
async function signup(req, res) {
    try {
        const { username, email, password, full_name } = req.body;

        // Basic validation
        if (!username || !email || !password) {
            return res.status(400).json({ error: 'Username, email aur password zaroori hai' });
        }
        if (password.length < 6) {
            return res.status(400).json({ error: 'Password kam se kam 6 characters ka hona chahiye' });
        }

        // Check karo ki email ya username pehle se hai ya nahi
        const existingEmail = await UserModel.findByEmail(email);
        if (existingEmail) {
            return res.status(409).json({ error: 'Ye email pehle se register hai' });
        }
        const existingUsername = await UserModel.findByUsername(username);
        if (existingUsername) {
            return res.status(409).json({ error: 'Ye username pehle se liya gaya hai' });
        }

        // Password ko hash karo (plain text kabhi save nahi karte)
        const password_hash = await bcrypt.hash(password, 10);

        // User database mein banao
        const newUser = await UserModel.create({ username, email, password_hash, full_name });

        // Login token bhi de do taaki signup ke baad seedha app use kar sake
        const token = generateToken(newUser.id);

        res.status(201).json({ message: 'Account ban gaya!', user: newUser, token });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Kuch galat ho gaya, dobara try karo' });
    }
}

// ===== LOGIN =====
async function login(req, res) {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email aur password zaroori hai' });
        }

        const user = await UserModel.findByEmail(email);
        if (!user) {
            return res.status(401).json({ error: 'Email ya password galat hai' });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password_hash);
        if (!isPasswordValid) {
            return res.status(401).json({ error: 'Email ya password galat hai' });
        }

        const token = generateToken(user.id);

        // Password hash user ke response mein wapas nahi bhejna
        delete user.password_hash;

        res.json({ message: 'Login ho gaya!', user, token });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Kuch galat ho gaya, dobara try karo' });
    }
}

module.exports = { signup, login };
