const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const config = require('../config/config');

const userController = {
  register: async (req, res) => {
    try {
      console.log('Register endpoint hit', req.body);
      const { email, password, username, fullName } = req.body;
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = new User({ email, password: hashedPassword, username, fullName });
      console.log("line 13 passed");
      await user.save();
      console.log("line 15 passed");
      res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  login: async (req, res) => {
    try {
      const { email, password } = req.body;
      const user = await User.findOne({ email }).select('+password');
      if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }
      const token = jwt.sign({ userId: user._id }, config.jwtSecret, { expiresIn: '24h' });
      res.json({ token, user: { id: user._id, email: user.email, username: user.username } });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  getProfile: async (req, res) => {
    try {
      const user = await User.findById(req.userId).select('-password');
      if (!user) return res.status(404).json({ error: 'User not found' });
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  updateProfile: async (req, res) => {
    try {
      const { fullName, profilePicture } = req.body;
      const user = await User.findByIdAndUpdate(req.userId, { fullName, profilePicture }, { new: true }).select('-password');
      if (!user) return res.status(404).json({ error: 'User not found' });
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  updatePreferences: async (req, res) => {
    try {
      const { theme, language } = req.body;
      const user = await User.findByIdAndUpdate(req.userId, { preferences: { theme, language } }, { new: true }).select('-password');
      if (!user) return res.status(404).json({ error: 'User not found' });
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = userController;