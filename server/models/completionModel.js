const mongoose = require('mongoose');

const completionSchema = new mongoose.Schema({
  conversationId: {
    type: String,
    required: true,
    index: true
  },
  completedItems: [{
    type: mongoose.Schema.Types.Mixed,
    required: true
  }],
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Completion', completionSchema);;
