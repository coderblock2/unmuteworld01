const express = require('express');
const router = express.Router();
const Category = require('../models/Category');
const { protect, admin } = require('../middleware/auth');

// @desc    Get all categories
// @route   GET /api/categories
// @access  Public
router.get('/', async (req, res) => {
    try {
        const categories = await Category.find({});
        res.json(categories.map(c => c.toJSON()));
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// @desc    Create a new category
// @route   POST /api/categories
// @access  Private/Admin
router.post('/', protect, admin, async (req, res) => {
    const { name, description, color } = req.body;
    try {
        const categoryExists = await Category.findOne({ name });
        if (categoryExists) {
            return res.status(400).json({ message: 'Category with this name already exists.' });
        }
        
        const category = new Category({ name, description, color });
        const createdCategory = await category.save();
        res.status(201).json(createdCategory.toJSON());

    } catch (error) {
        res.status(400).json({ message: 'Category creation failed.' });
    }
});

module.exports = router;
