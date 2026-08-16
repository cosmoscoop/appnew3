const express = require('express');
const router = express.Router();
const multer = require('multer');
const authMiddleware = require('../middleware/authMiddleware');
const {
    createPost, getFeed, getUserPosts, deletePost,
    likePost, unlikePost, addComment, getComments,
} = require('../controllers/postController');

// Photo upload ke liye multer setup (file ko memory mein rakhta hai, fir Cloudinary bhejta hai)
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } }); // max 10MB

// Ye sab routes login maangte hain (authMiddleware check karega)
router.post('/', authMiddleware, upload.single('media'), createPost);       // Naya post
router.get('/feed', authMiddleware, getFeed);                                // Feed
router.get('/user/:userId', authMiddleware, getUserPosts);                   // Kisi user ke posts
router.delete('/:postId', authMiddleware, deletePost);                       // Post delete

router.post('/:postId/like', authMiddleware, likePost);                      // Like
router.delete('/:postId/like', authMiddleware, unlikePost);                  // Unlike

router.post('/:postId/comments', authMiddleware, addComment);                // Comment karo
router.get('/:postId/comments', authMiddleware, getComments);                // Comments dekho

module.exports = router;
