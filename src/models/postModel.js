// Posts, likes, comments se related database queries yahan hain
const pool = require('../config/db');

const PostModel = {
    // Naya post banao
    async create({ user_id, media_url, caption }) {
        const result = await pool.query(
            `INSERT INTO posts (user_id, media_url, caption)
             VALUES ($1, $2, $3)
             RETURNING *`,
            [user_id, media_url, caption]
        );
        return result.rows[0];
    },

    // Feed ke liye posts lao — jinko user follow karta hai + khud ke bhi
    // Saath mein likes count, comments count, aur "maine like kiya hai ya nahi" bhi bata dega
    async getFeed(userId, limit = 20, offset = 0) {
        const result = await pool.query(
            `SELECT 
                p.id, p.media_url, p.caption, p.created_at,
                u.id AS user_id, u.username, u.profile_picture_url,
                COUNT(DISTINCT l.id) AS likes_count,
                COUNT(DISTINCT c.id) AS comments_count,
                EXISTS(SELECT 1 FROM likes WHERE post_id = p.id AND user_id = $1) AS liked_by_me
             FROM posts p
             JOIN users u ON u.id = p.user_id
             LEFT JOIN likes l ON l.post_id = p.id
             LEFT JOIN comments c ON c.post_id = p.id
             WHERE p.user_id = $1 
                OR p.user_id IN (SELECT following_id FROM followers WHERE follower_id = $1)
             GROUP BY p.id, u.id
             ORDER BY p.created_at DESC
             LIMIT $2 OFFSET $3`,
            [userId, limit, offset]
        );
        return result.rows;
    },

    // Kisi ek user ke saare posts (profile page ke liye)
    async getByUserId(userId) {
        const result = await pool.query(
            `SELECT id, media_url, caption, created_at FROM posts 
             WHERE user_id = $1 ORDER BY created_at DESC`,
            [userId]
        );
        return result.rows;
    },

    async findById(postId) {
        const result = await pool.query('SELECT * FROM posts WHERE id = $1', [postId]);
        return result.rows[0];
    },

    async delete(postId, userId) {
        const result = await pool.query(
            'DELETE FROM posts WHERE id = $1 AND user_id = $2 RETURNING id',
            [postId, userId]
        );
        return result.rows[0];
    },

    // ===== LIKES =====
    async likePost(userId, postId) {
        await pool.query(
            `INSERT INTO likes (user_id, post_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
            [userId, postId]
        );
    },

    async unlikePost(userId, postId) {
        await pool.query('DELETE FROM likes WHERE user_id = $1 AND post_id = $2', [userId, postId]);
    },

    // ===== COMMENTS =====
    async addComment(userId, postId, text) {
        const result = await pool.query(
            `INSERT INTO comments (user_id, post_id, text) VALUES ($1, $2, $3) RETURNING *`,
            [userId, postId, text]
        );
        return result.rows[0];
    },

    async getComments(postId) {
        const result = await pool.query(
            `SELECT c.id, c.text, c.created_at, u.id AS user_id, u.username, u.profile_picture_url
             FROM comments c JOIN users u ON u.id = c.user_id
             WHERE c.post_id = $1 ORDER BY c.created_at ASC`,
            [postId]
        );
        return result.rows;
    },
};

module.exports = PostModel;
