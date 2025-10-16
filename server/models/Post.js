
const mongoose = require('mongoose');

const ratingSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    value: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    }
}, { _id: false });

const postSchema = new mongoose.Schema({
    title: { type: String, required: true, trim: true },
    content: { type: String, required: true },
    category: { type: String, required: true },
    basis: {
        type: String,
        required: true,
        enum: ["My personal experience", "My professional knowledge", "A researched source", "My opinion/perspective", "Something else"]
    },
    tags: [{ type: String, trim: true }],
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    anonymous: { type: Boolean, default: false },
    ratings: [ratingSchema],
    // Denormalized fields for performance
    authorName: { type: String, required: true },
    authorAvgRating: { type: Number, default: 0 },
    authorPostCount: { type: Number, default: 0 },
}, {
    timestamps: { createdAt: true, updatedAt: false }, // Use createdAt, no updatedAt
});

// --- VIRTUALS ---
// These are calculated fields that are not stored in the database.

// Virtual for postRating (average rating)
postSchema.virtual('postRating').get(function() {
    if (!this.ratings || this.ratings.length === 0) return 0;
    const sum = this.ratings.reduce((acc, r) => acc + r.value, 0);
    return sum / this.ratings.length;
});

// Virtual for ratingCount
postSchema.virtual('ratingCount').get(function() {
    return this.ratings ? this.ratings.length : 0;
});

// Virtual for authorId
postSchema.virtual('authorId').get(function() {
    return this.author._id || this.author;
});

// --- INDEXES ---
// This creates a text index for efficient searching.
postSchema.index({ title: 'text', content: 'text', tags: 'text', authorName: 'text' });


// --- SCHEMA TRANSFORMATIONS ---
// This ensures the data sent to the frontend is in the correct format.
postSchema.set('toJSON', {
  virtuals: true, // IMPORTANT: includes virtuals in the output
  transform: (doc, ret) => {
    // Standard transformations
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    
    // Custom transformations
    if (ret.anonymous) {
        ret.authorName = 'Anonymous';
    }
    delete ret.ratings; // Don't send the full ratings array to the client

    return ret;
  }
});


const Post = mongoose.model('Post', postSchema);
module.exports = Post;
