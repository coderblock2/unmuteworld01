



const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Post = require('../models/Post');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { protect } = require('../middleware/auth');
const sendEmail = require('../utils/sendEmail');

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


const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// @desc    Register a new user
// @route   POST /api/auth/signup
// @access  Public
router.post('/signup', async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const user = await User.create({ name, email, password });

    if (user) {
      const token = generateToken(user._id);
      const stats = await calculateUserStats(user._id);
      const userJSON = user.toJSON();
      userJSON.postCount = stats.postCount;
      userJSON.avgRating = stats.avgRating;
      
      res.status(201).json({
        user: userJSON,
        token,
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
       if (user.isBlocked) {
         return res.status(403).json({ message: 'Your account has been blocked.' });
       }
      const token = generateToken(user._id);
      const stats = await calculateUserStats(user._id);
      const userJSON = user.toJSON();
      userJSON.postCount = stats.postCount;
      userJSON.avgRating = stats.avgRating;

      res.json({
        user: userJSON,
        token,
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Request password reset link
// @route   POST /api/auth/forgotpassword
// @access  Public
router.post('/forgotpassword', async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      // For security, don't reveal that the user does not exist. Respond with a generic success message.
      return res.status(200).json({ success: true, message: 'If a user with that email exists, a reset link has been sent.' });
    }

    // Get reset token from user model method
    const resetToken = user.getResetPasswordToken();
    await user.save({ validateBeforeSave: false });

    // Create reset URL for the frontend
    const frontendBaseUrl = (process.env.FRONTEND_URL || 'http://localhost:5173');
    const resetUrl = `${frontendBaseUrl}/#/reset-password/${resetToken}`;
    
    // Create HTML email body
    const message = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6;">
        <h1 style="color: #333;">Password Reset Request</h1>
        <p>You are receiving this email because you (or someone else) has requested to reset the password for your Unmute World account.</p>
        <p>Please click the button below to choose a new password. This link is valid for 15 minutes.</p>
        <div style="text-align: center; margin: 20px 0;">
          <a href="${resetUrl}" style="background-color: #708238; color: white; padding: 14px 25px; text-align: center; text-decoration: none; display: inline-block; border-radius: 8px; font-weight: bold;">Reset Your Password</a>
        </div>
        <p>If the button doesn't work, you can paste this link into your browser:</p>
        <p><a href="${resetUrl}">${resetUrl}</a></p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
        <p style="font-size: 0.9em; color: #555;">If you did not request this, please ignore this email and your password will remain unchanged.</p>
        <p style="font-size: 0.9em; color: #555;">Thank you,<br/>The Unmute World Team</p>
      </div>
    `;

    try {
      await sendEmail({
        email: user.email,
        subject: 'Unmute World - Password Reset Link',
        html: message,
      });
      // If email is sent successfully, send the generic response
      res.status(200).json({ success: true, message: 'If a user with that email exists, a reset link has been sent.' });
    } catch (emailError) {
      console.error('Email sending error:', emailError);
      // IMPORTANT: If email fails, clear the token from the DB to allow the user to try again later.
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save({ validateBeforeSave: false });

      // Pass the specific error message from the email utility to the frontend
      const errorMessage = emailError.message || 'There was an error sending the email. Please try again later.';
      return res.status(500).json({ message: errorMessage });
    }

  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: 'Server error while processing request.' });
  }
});


// @desc    Reset password with token
// @route   PUT /api/auth/resetpassword/:token
// @access  Public
router.put('/resetpassword/:token', async (req, res) => {
  try {
    // Get hashed token from URL
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(req.params.token)
      .digest('hex');
    
    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired token. Please try again.' });
    }

    // Set new password
    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();
    
    res.json({ success: true, message: 'Password has been reset successfully.' });

  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});


// @desc    Get user profile
// @route   GET /api/auth/me
// @access  Private
router.get('/me', protect, async (req, res) => {
    // req.user is populated by the 'protect' middleware
    const user = await User.findById(req.user.id).select('-password');
    if (user) {
        const stats = await calculateUserStats(user._id);
        const userJSON = user.toJSON();
        userJSON.postCount = stats.postCount;
        userJSON.avgRating = stats.avgRating;
        res.json(userJSON);
    } else {
        res.status(404).json({ message: 'User not found' });
    }
});

module.exports = router;