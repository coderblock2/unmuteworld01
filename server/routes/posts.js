
const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const User = require('../models/User');
const { protect } = require('../middleware/auth');
const mongoose = require('mongoose');

// Helper to calculate a single user's average rating from all their posts
const calculateUserAvgRating = async (userId) => {
    const posts = await Post.find({ author: userId }).select('ratings');
    if (posts.length === 0) return 0;
    
    let totalRatingSum = 0;
    let ratedPostsCount = 0;

    posts.forEach(post => {
        if (post.ratings && post.ratings.length > 0) {
            const postRatingSum = post.ratings.reduce((acc, r) => acc + r.value, 0);
            totalRatingSum += postRatingSum / post.ratings.length;
            ratedPostsCount++;
        }
    });
    return ratedPostsCount > 0 ? totalRatingSum / ratedPostsCount : 0;
};

// @desc    Get posts with filtering/sorting/searching
// @route   GET /api/posts
// @access  Public
router.get('/', async (req, res) => {
    const { limit, sort, category, tag, q } = req.query;
    
    let query;
    let sortOrder = { createdAt: -1 }; // Default: newest first

    if (q) {
        // --- Search Logic ---
        query = Post.find(
            { $text: { $search: q } },
            { score: { $meta: 'textScore' } } // Project a relevance score
        );
        sortOrder = { score: { $meta: 'textScore' } }; // Sort by relevance
    } else {
        // --- Filtering Logic ---
        const filter = {};
        if (category) {
            filter.category = category;
        }
        if (tag) {
            filter.tags = tag;
        }
        query = Post.find(filter);

        if (sort === 'oldest') {
             sortOrder = { createdAt: 1 };
        }
    }

    query = query.sort(sortOrder);

    if (limit) {
        query = query.limit(parseInt(limit));
    }

    try {
        const posts = await query;
        // The .toJSON() method is automatically called by res.json() on Mongoose documents
        res.json(posts); 
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

// @desc    Create a new post
// @route   POST /api/posts
// @access  Private
router.post('/', protect, async (req, res) => {
    const { title, content, category, basis, tags, anonymous } = req.body;
    try {
        const author = await User.findById(req.user.id);
        const postCount = await Post.countDocuments({ author: req.user.id });
        const authorAvgRating = await calculateUserAvgRating(req.user.id);

        const newPost = new Post({
            title,
            content,
            category,
            basis,
            tags,
            anonymous,
            author: req.user.id,
            // Denormalize author data for performance
            authorName: author.name,
            authorPostCount: postCount, // This is the count *before* this new post
            authorAvgRating: authorAvgRating,
        });
        const createdPost = await newPost.save();
        res.status(201).json(createdPost);
    } catch (error) {
        console.error(error);
        res.status(400).json({ message: 'Post creation failed' });
    }
});

// @desc    Get a single post by ID
// @route   GET /api/posts/:postId
// @access  Public
router.get('/:postId', async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.postId)) {
             return res.status(404).json({ message: 'Post not found' });
        }
        const post = await Post.findById(req.params.postId);
        if (post) {
            res.json(post);
        } else {
            res.status(404).json({ message: 'Post not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

// @desc    Rate a post
// @route   POST /api/posts/:postId/rate
// @access  Private
router.post('/:postId/rate', protect, async (req, res) => {
    const { rating } = req.body;
    try {
        const post = await Post.findById(req.params.postId);
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        if (post.author.toString() === req.user.id.toString()) {
            return res.status(400).json({ message: 'Cannot rate your own post' });
        }

        const existingRatingIndex = post.ratings.findIndex(r => r.user.toString() === req.user.id.toString());
        
        if (existingRatingIndex > -1) {
            // User is changing their rating
            post.ratings[existingRatingIndex].value = rating;
        } else {
            // New rating
            post.ratings.push({ user: req.user.id, value: rating });
        }

        await post.save();
        res.status(201).json({ success: true, message: "Rating submitted" });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});


// @desc    Save or unsave a post
// @route   POST /api/posts/:postId/save (save)
// @route   DELETE /api/posts/:postId/save (unsave)
// @access  Private
router.post('/:postId/save', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        const postId = req.params.postId;
        
        const alreadySaved = user.savedPosts.includes(postId);
        if (alreadySaved) {
            return res.status(400).json({ message: 'Post already saved' });
        }

        user.savedPosts.push(postId);
        await user.save();
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});
router.delete('/:postId/save', protect, async (req, res) => {
    try {
        await User.updateOne({ _id: req.user.id }, { $pull: { savedPosts: req.params.postId } });
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});


// @desc    Check if a post is saved by the user
// @route   GET /api/posts/:postId/issaved
// @access  Private
router.get('/:postId/issaved', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        const isSaved = user.savedPosts.includes(req.params.postId);
        res.json({ isSaved });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

module.exports = router;
