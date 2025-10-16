const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Post = require('../models/Post');
const Category = require('../models/Category');
const { protect, admin } = require('../middleware/auth');

// Protect all admin routes
router.use(protect, admin);

// @desc    Get admin statistics
// @route   GET /api/admin/stats
// @access  Private/Admin
router.get('/stats', async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const totalPosts = await Post.countDocuments();
        const anonymousPosts = await Post.countDocuments({ anonymous: true });

        const categoryPopularity = await Post.aggregate([
            { $group: { _id: '$category', count: { $sum: 1 } } },
            { $project: { name: '$_id', count: 1, _id: 0 } },
            { $sort: { count: -1 } }
        ]);
        
        const postsWithRatings = await Post.find({ 'ratings.0': { $exists: true } });
        let avgPlatformRating = 0;
        if(postsWithRatings.length > 0) {
            let totalRatingSum = 0;
            postsWithRatings.forEach(p => {
                const sum = p.ratings.reduce((acc, r) => acc + r.value, 0);
                totalRatingSum += sum / p.ratings.length;
            });
            avgPlatformRating = totalRatingSum / postsWithRatings.length;
        }

        res.json({
            totalUsers,
            totalPosts,
            anonymousPosts,
            categoryPopularity,
            avgPlatformRating
        });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
});

// --- User Management ---
router.get('/users', async (req, res) => {
    const users = await User.find({}).sort({ joinDate: -1 });
    res.json(users.map(u => u.toJSON()));
});

router.post('/users/:id/toggle-block', async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (user) {
            user.isBlocked = !user.isBlocked;
            await user.save();
            res.json({ success: true, isBlocked: user.isBlocked });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

router.delete('/users/:id', async (req, res) => {
    try {
        const userToDelete = await User.findById(req.params.id);
        if (userToDelete) {
            if (userToDelete.isAdmin) {
                return res.status(400).json({ message: 'Cannot delete an admin user.' });
            }
            
            // 1. Delete all posts by this user
            await Post.deleteMany({ author: userToDelete._id });

            // 2. Remove all ratings this user has given on other posts
            await Post.updateMany(
                { 'ratings.user': userToDelete._id },
                { $pull: { ratings: { user: userToDelete._id } } }
            );

            // 3. Delete the user document itself
            await User.deleteOne({ _id: userToDelete._id });

            res.json({ success: true, message: 'User and all associated data deleted.' });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ message: 'Server Error' });
    }
});


// --- Post Management ---
router.get('/posts', async (req, res) => {
    const posts = await Post.find({}).sort({ createdAt: -1 });
    res.json(posts.map(p => p.toJSON()));
});

router.put('/posts/:id', async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (post) {
            const { title, content, category, basis, tags, anonymous } = req.body;
            post.title = title ?? post.title;
            post.content = content ?? post.content;
            post.category = category ?? post.category;
            post.basis = basis ?? post.basis;
            post.tags = tags ?? post.tags;
            post.anonymous = anonymous !== undefined ? anonymous : post.anonymous;
            
            const updatedPost = await post.save();
            res.json(updatedPost.toJSON());
        } else {
            res.status(404).json({ message: 'Post not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

router.delete('/posts/:id', async (req, res) => {
    try {
        const postId = req.params.id;
        const post = await Post.findById(postId);
        if (post) {
            // Remove post from any user's savedPosts array
            await User.updateMany(
                { savedPosts: postId },
                { $pull: { savedPosts: postId } }
            );
            
            await Post.deleteOne({ _id: postId });
            res.json({ success: true, message: 'Post deleted successfully.' });
        } else {
            res.status(404).json({ message: 'Post not found' });
        }
    } catch (error) {
        console.error('Error deleting post:', error);
        res.status(500).json({ message: 'Server Error' });
    }
});


// --- Category Management ---
router.delete('/categories/:id', async (req, res) => {
     try {
        const category = await Category.findById(req.params.id);
        if (!category) {
            return res.status(404).json({ message: 'Category not found' });
        }
        
        const postsInCategory = await Post.countDocuments({ category: category.name });
        if (postsInCategory > 0) {
            return res.status(400).json({ message: 'Cannot delete category with existing posts. Please re-assign posts first.' });
        }

        await Category.deleteOne({ _id: req.params.id });
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

module.exports = router;
