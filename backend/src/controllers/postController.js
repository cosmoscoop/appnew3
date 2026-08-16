// Posts, likes, comments ka actual logic yahan hai
const PostModel = require('../models/postModel');
const { uploadToCloudinary } = require('../config/cloudinary');

// ===== NAYA POST BANAO =====
async function createPost(req, res) {
    try {
        const { caption } = req.body;

        if (!req.file) {
            return res.status(400).json({ error: 'Photo/video zaroori hai' });
        }

        // Photo ko Cloudinary pe upload karo
        const media_url = await uploadToCloudinary(req.file.buffer);

        // Database mein post save karo
        const post = await PostModel.create({
            user_id: req.userId,
            media_url,
            caption: caption || '',
        });

        res.status(201).json({ message: 'Post ho gaya!', post });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Post banane mein error aaya' });
    }
}

// ===== FEED DIKHAO =====
async function getFeed(req, res) {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 20;
        const offset = (page - 1) * limit;

        const posts = await PostModel.getFeed(req.userId, limit, offset);
        res.json({ posts });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Feed load karne mein error aaya' });
    }
}

// ===== KISI USER KE POSTS (PROFILE PAGE) =====
async function getUserPosts(req, res) {
    try {
        const posts = await PostModel.getByUserId(req.params.userId);
        res.json({ posts });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Posts load karne mein error aaya' });
    }
}

// ===== POST DELETE KARO =====
async function deletePost(req, res) {
    try {
        const deleted = await PostModel.delete(req.params.postId, req.userId);
        if (!deleted) {
            return res.status(404).json({ error: 'Post nahi mila ya aapka nahi hai' });
        }
        res.json({ message: 'Post delete ho gaya' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Delete karne mein error aaya' });
    }
}

// ===== LIKE / UNLIKE =====
async function likePost(req, res) {
    try {
        await PostModel.likePost(req.userId, req.params.postId);
        res.json({ message: 'Like ho gaya' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Like karne mein error aaya' });
    }
}

async function unlikePost(req, res) {
    try {
        await PostModel.unlikePost(req.userId, req.params.postId);
        res.json({ message: 'Like hata diya' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error aaya' });
    }
}

// ===== COMMENT =====
async function addComment(req, res) {
    try {
        const { text } = req.body;
        if (!text || !text.trim()) {
            return res.status(400).json({ error: 'Comment khali nahi ho sakta' });
        }
        const comment = await PostModel.addComment(req.userId, req.params.postId, text);
        res.status(201).json({ comment });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Comment karne mein error aaya' });
    }
}

async function getComments(req, res) {
    try {
        const comments = await PostModel.getComments(req.params.postId);
        res.json({ comments });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Comments load karne mein error aaya' });
    }
}

module.exports = {
    createPost, getFeed, getUserPosts, deletePost,
    likePost, unlikePost, addComment, getComments,
};
