// Profile aur Follow/Unfollow ka logic yahan hai
const pool = require('../config/db');
const UserModel = require('../models/userModel');
const FollowModel = require('../models/followModel');
const { uploadToCloudinary } = require('../config/cloudinary');

// ===== APNA PROFILE DEKHO =====
async function getMe(req, res) {
    try {
        const user = await UserModel.findById(req.userId);
        const counts = await FollowModel.getCounts(req.userId);
        res.json({ user: { ...user, ...counts } });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Profile load karne mein error aaya' });
    }
}

// ===== KISI AUR KA PROFILE DEKHO =====
async function getUserProfile(req, res) {
    try {
        const user = await UserModel.findById(req.params.userId);
        if (!user) return res.status(404).json({ error: 'User nahi mila' });

        const counts = await FollowModel.getCounts(req.params.userId);
        const isFollowing = await FollowModel.isFollowing(req.userId, req.params.userId);

        res.json({ user: { ...user, ...counts, isFollowing } });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Profile load karne mein error aaya' });
    }
}

// ===== PROFILE UPDATE KARO (bio, naam, photo) =====
async function updateProfile(req, res) {
    try {
        const { full_name, bio } = req.body;
        let profile_picture_url;

        if (req.file) {
            profile_picture_url = await uploadToCloudinary(req.file.buffer);
        }

        const result = await pool.query(
            `UPDATE users SET 
                full_name = COALESCE($1, full_name),
                bio = COALESCE($2, bio),
                profile_picture_url = COALESCE($3, profile_picture_url),
                updated_at = NOW()
             WHERE id = $4
             RETURNING id, username, email, full_name, bio, profile_picture_url`,
            [full_name, bio, profile_picture_url, req.userId]
        );

        res.json({ message: 'Profile update ho gaya', user: result.rows[0] });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Profile update karne mein error aaya' });
    }
}

// ===== FOLLOW / UNFOLLOW =====
async function followUser(req, res) {
    try {
        await FollowModel.follow(req.userId, req.params.userId);
        res.json({ message: 'Follow kar diya' });
    } catch (err) {
        res.status(400).json({ error: err.message || 'Follow karne mein error aaya' });
    }
}

async function unfollowUser(req, res) {
    try {
        await FollowModel.unfollow(req.userId, req.params.userId);
        res.json({ message: 'Unfollow kar diya' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error aaya' });
    }
}

async function getFollowers(req, res) {
    try {
        const followers = await FollowModel.getFollowers(req.params.userId);
        res.json({ followers });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error aaya' });
    }
}

async function getFollowing(req, res) {
    try {
        const following = await FollowModel.getFollowing(req.params.userId);
        res.json({ following });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error aaya' });
    }
}

// ===== USERS SEARCH KARO =====
async function searchUsers(req, res) {
    try {
        const query = req.query.q || '';
        if (!query.trim()) {
            return res.json({ users: [] });
        }
        const users = await UserModel.search(query, req.userId);
        res.json({ users });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Search karne mein error aaya' });
    }
}

module.exports = {
    getMe, getUserProfile, updateProfile, searchUsers,
    followUser, unfollowUser, getFollowers, getFollowing,
};
