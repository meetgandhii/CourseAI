const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true, select: false },
  username: { type: String, required: true, unique: true },
  fullName: { type: String, required: true },
  profilePicture: { type: String },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  subscriptionTier: { type: String, enum: ['free', 'premium', 'enterprise'], default: 'free' },
  apiUsage: {
    count: { type: Number, default: 0 },
    lastReset: { type: Date, default: Date.now }
  },
  preferences: {
    theme: { type: String, default: 'light' },
    language: { type: String, default: 'en' }
  },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);