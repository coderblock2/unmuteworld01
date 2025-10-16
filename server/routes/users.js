

const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Post = require('../models/Post');
const { protect } = require('../middleware/auth');
const mongoose = require('mongoose');

// Helper to calculate user stats
const calculateUserStats = async (userId) => {
    const postCount = await Post.countDocuments({ author: userId });
    
    const posts = await Post.find({ author: userId }).select('ratings');
    let totalRatingSum = 0;
    let ratedPostsCount = 0;

    posts.forEach(post => {
        if (post.ratings && post.ratings.length > 0) {
            const postRatingSum = post.ratings.reduce((acc, r) => acc + r.value, 0);
            totalRatingSum += postRatingSum / post.ratings.length;
            ratedPostsCount++;
        }
    });

    const avgRating = ratedPostsCount > 0 ? totalRatingSum / ratedPostsCount : 0;
    
    return { postCount, avgRating };
};

// @desc    Get user by ID (public profile)
// @route   GET /api/users/:userId
// @access  Public
router.get('/:userId', async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.userId)) {
             return res.status(404).json({ message: 'User not found' });
        }
        const user = await User.findById(req.params.userId).select('-password');
        if (user) {
            const stats = await calculateUserStats(user._id);
            const userJSON = user.toJSON();
            userJSON.postCount = stats.postCount;
            userJSON.avgRating = stats.avgRating;
            res.json(userJSON);
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// @desc    Update user profile
// @route   PUT /api/users/me
// @access  Private
router.put('/me', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (user) {
            user.name = req.body.name || user.name;
            user.bio = req.body.bio || user.bio;
            user.profilePic = req.body.profilePic || user.profilePic;
            
            const updatedUser = await user.save();

            const stats = await calculateUserStats(updatedUser._id);
            const userJSON = updatedUser.toJSON();
            userJSON.postCount = stats.postCount;
            userJSON.avgRating = stats.avgRating;

            res.json(userJSON);
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// @desc    Change user password
// @route   PUT /api/users/me/password
// @access  Private
router.put('/me/password', protect, async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    try {
        const user = await User.findById(req.user.id);

        if (user && (await user.matchPassword(currentPassword))) {
            user.password = newPassword; // The pre-save hook will hash it
            await user.save();
            res.json({ success: true, message: 'Password updated successfully.' });
        } else {
            res.status(401).json({ message: 'Invalid current password.' });
        }
    } catch (error) {
        console.error('Password change error:', error);
        res.status(500).json({ message: 'Server error while changing password.' });
    }
});


// @desc    Get posts by a specific user
// @route   GET /api/users/:userId/posts
// @access  Public
router.get('/:userId/posts', async (req, res) => {
    try {
        const query = { author: req.params.userId };
        // If it's a public view, only show non-anonymous posts
        if (req.query.public === 'true') {
            query.anonymous = false;
        }
        const posts = await Post.find(query).sort({ createdAt: -1 });
        res.json(posts.map(p => p.toJSON()));
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// @desc    Get saved posts for the logged-in user
// @route   GET /api/users/me/saved
// @access  Private
router.get('/me/saved', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).populate({
            path: 'savedPosts',
            options: { sort: { createdAt: -1 } }
        });

        if (user) {
            res.json(user.savedPosts.map(p => p.toJSON()));
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;