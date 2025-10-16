const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const Post = require('./Post');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, trim: true, lowercase: true },
  password: { type: String, required: true },
  profilePic: { type: String, default: 'https://picsum.photos/seed/default-avatar/200' },
  bio: { type: String, default: '', maxLength: 300 },
  isAdmin: { type: Boolean, default: false },
  isBlocked: { type: Boolean, default: false },
  savedPosts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Post' }],
  resetPasswordToken: String,
  resetPasswordExpire: Date,
}, {
  timestamps: { createdAt: 'joinDate' }, // Use 'joinDate' alias for createdAt
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for postCount
userSchema.virtual('postCount', {
  ref: 'Post',
  localField: '_id',
  foreignField: 'author',
  count: true
});

// Virtual for avgRating
userSchema.virtual('avgRating').get(function() {
  // This is a placeholder. Calculating this dynamically is complex.
  // We will calculate it on-the-fly in the route handler instead.
  return 0;
});


// --- Schema Transformations for Frontend Compatibility ---
userSchema.methods.toJSON = function() {
  const userObject = this.toObject();
  userObject.id = userObject._id;
  delete userObject._id;
  delete userObject.password;
  delete userObject.__v;
  delete userObject.savedPosts; // Don't send savedPosts by default
  delete userObject.resetPasswordToken;
  delete userObject.resetPasswordExpire;
  return userObject;
};

// --- Password Hashing Middleware ---
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// --- Password Comparison Method ---
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// --- Method to generate and hash password reset token ---
userSchema.methods.getResetPasswordToken = function() {
  // Generate token
  const resetToken = crypto.randomBytes(20).toString('hex');

  // Hash token and set to resetPasswordToken field
  this.resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  
  // Set expire time (e.g., 15 minutes)
  this.resetPasswordExpire = Date.now() + 15 * 60 * 1000;

  return resetToken; // Return the unhashed token to be sent in the email
};

const User = mongoose.model('User', userSchema);

module.exports = User;