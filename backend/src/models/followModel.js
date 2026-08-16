// Follow/Unfollow se related database queries
const pool = require('../config/db');

const FollowModel = {
    async follow(followerId, followingId) {
        if (followerId === followingId) {
            throw new Error('Khud ko follow nahi kar sakte');
        }
        await pool.query(
            `INSERT INTO followers (follower_id, following_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
            [followerId, followingId]
        );
    },

    async unfollow(followerId, followingId) {
        await pool.query(
            'DELETE FROM followers WHERE follower_id = $1 AND following_id = $2',
            [followerId, followingId]
        );
    },

    // Kisi user ke followers ki list
    async getFollowers(userId) {
        const result = await pool.query(
            `SELECT u.id, u.username, u.full_name, u.profile_picture_url
             FROM followers f JOIN users u ON u.id = f.follower_id
             WHERE f.following_id = $1`,
            [userId]
        );
        return result.rows;
    },

    // Kisi user ko kaun follow karta hai (following list)
    async getFollowing(userId) {
        const result = await pool.query(
            `SELECT u.id, u.username, u.full_name, u.profile_picture_url
             FROM followers f JOIN users u ON u.id = f.following_id
             WHERE f.follower_id = $1`,
            [userId]
        );
        return result.rows;
    },

    // Counts (profile page ke liye — followers/following/posts ki ginti)
    async getCounts(userId) {
        const result = await pool.query(
            `SELECT 
                (SELECT COUNT(*) FROM followers WHERE following_id = $1) AS followers_count,
                (SELECT COUNT(*) FROM followers WHERE follower_id = $1) AS following_count,
                (SELECT COUNT(*) FROM posts WHERE user_id = $1) AS posts_count`,
            [userId]
        );
        return result.rows[0];
    },

    async isFollowing(followerId, followingId) {
        const result = await pool.query(
            'SELECT 1 FROM followers WHERE follower_id = $1 AND following_id = $2',
            [followerId, followingId]
        );
        return result.rowCount > 0;
    },
};

module.exports = FollowModel;
