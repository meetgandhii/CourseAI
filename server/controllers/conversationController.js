const Conversation = require('../models/conversationModel');

const conversationController = {
  createConversation: async (req, res) => {
    try {
      const { title } = req.body;
      const conversation = new Conversation({ user: req.userId, title });
      await conversation.save();
      res.status(201).json(conversation);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  getConversations: async (req, res) => {
    try {
      const conversations = await Conversation.find({ user: req.userId }).sort({ updatedAt: -1 });
      res.json(conversations);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  getConversation: async (req, res) => {
    try {
      const conversation = await Conversation.findOne({ _id: req.params.id, user: req.userId });
      if (!conversation) return res.status(404).json({ error: 'Conversation not found' });
      res.json(conversation);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  addMessage: async (req, res) => {
    try {
      const { content } = req.body;
      const conversation = await Conversation.findOne({ _id: req.params.id, user: req.userId });
      if (!conversation) {
        return res.status(404).json({ error: 'Conversation not found' });
      }

      conversation.messages.push({ role: 'user', content });
      conversation.updatedAt = Date.now();
      await conversation.save();
      res.json(conversation);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  deleteConversation: async (req, res) => {
    try {
      const conversation = await Conversation.findOneAndDelete({ _id: req.params.id, user: req.userId });
      if (!conversation) return res.status(404).json({ error: 'Conversation not found' });
      res.json({ message: 'Conversation deleted successfully' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = conversationController;