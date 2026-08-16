const express = require('express');
const router = express.Router();
const multer = require('multer');
const authMiddleware = require('../middleware/authMiddleware');
const {
    getMe, getUserProfile, updateProfile, searchUsers,
    followUser, unfollowUser, getFollowers, getFollowing,
} = require('../controllers/userController');

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

router.get('/me', authMiddleware, getMe);                                  // Apna profile
router.put('/me', authMiddleware, upload.single('profile_picture'), updateProfile); // Update karo
router.get('/search', authMiddleware, searchUsers);                        // Users search karo
router.get('/:userId', authMiddleware, getUserProfile);                    // Kisi aur ka profile

router.post('/:userId/follow', authMiddleware, followUser);                // Follow
router.delete('/:userId/follow', authMiddleware, unfollowUser);            // Unfollow
router.get('/:userId/followers', authMiddleware, getFollowers);            // Followers list
router.get('/:userId/following', authMiddleware, getFollowing);            // Following list

module.exports = router;
