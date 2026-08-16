// User se related database queries yahan hain
const pool = require('../config/db');

const UserModel = {
    // Naya user banao
    async create({ username, email, password_hash, full_name }) {
        const result = await pool.query(
            `INSERT INTO users (username, email, password_hash, full_name)
             VALUES ($1, $2, $3, $4)
             RETURNING id, username, email, full_name, bio, profile_picture_url, created_at`,
            [username, email, password_hash, full_name]
        );
        return result.rows[0];
    },

    // Email se user dhundo (login ke waqt)
    async findByEmail(email) {
        const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        return result.rows[0];
    },

    // Username se user dhundo (signup ke waqt duplicate check karne ke liye)
    async findByUsername(username) {
        const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
        return result.rows[0];
    },

    // ID se user dhundo (profile dikhane ke liye)
    async findById(id) {
        const result = await pool.query(
            `SELECT id, username, email, full_name, bio, profile_picture_url, created_at
             FROM users WHERE id = $1`,
            [id]
        );
        return result.rows[0];
    },

    // Username se search karo (Search screen ke liye)
    async search(query, excludeUserId) {
        const result = await pool.query(
            `SELECT id, username, full_name, profile_picture_url
             FROM users
             WHERE (username ILIKE $1 OR full_name ILIKE $1) AND id != $2
             LIMIT 20`,
            [`%${query}%`, excludeUserId]
        );
        return result.rows;
    },

    // Username ya naam se users search karo
    async search(query, excludeUserId) {
        const result = await pool.query(
            `SELECT id, username, full_name, profile_picture_url FROM users
             WHERE (username ILIKE $1 OR full_name ILIKE $1) AND id != $2
             LIMIT 20`,
            [`%${query}%`, excludeUserId]
        );
        return result.rows;
    },
};

module.exports = UserModel;
