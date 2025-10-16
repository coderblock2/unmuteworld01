const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true, trim: true },
    description: { type: String, required: true, trim: true },
    color: { type: String, required: true, default: '#808080' }
}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Schema transformation for frontend compatibility
categorySchema.set('toJSON', {
    transform: (doc, ret) => {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        return ret;
    }
});


const Category = mongoose.model('Category', categorySchema);
module.exports = Category;
