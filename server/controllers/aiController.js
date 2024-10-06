const axios = require('axios');
const User = require('../models/userModel');
const Conversation = require('../models/conversationModel');
const config = require('../config/config');

const aiController = {
  getModelInfo: async (req, res) => {
    try {
      // This is a placeholder. Replace with actual API call if available.
      const modelInfo = {
        name: "Pasken-LLM",
        version: "1.0",
        capabilities: ["Natural language processing", "Question answering", "Text generation"]
      };
      res.json(modelInfo);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
  editResource: async (req, res) => {
    try {
      const { resource, timeSlot, weekNum, dayNum, contentId, resourceId, conversationId } = req.body;
      console.log(req.body);

      // Fetch the conversation
      const conversation = await Conversation.findOne({ _id: conversationId, user: req.userId });
      if (!conversation) return res.status(404).json({ error: 'Conversation not found' });

      // Call AI API to edit resource
      const editedResource = await callAiEditResourceApi(resource, timeSlot, weekNum, dayNum, resourceId, conversation.messages);
      console.log(editedResource);

      // Update the conversation with the new resource
      const updatedMessages = updateConversationMessages(conversation.messages, weekNum, dayNum, timeSlot, contentId, resourceId, editedResource);
      // conversation.messages.push({ role: 'user', content: `I want to change the resource number ${resourceId} to a ${resource} resource at Week ${weekNum} Day ${dayNum} Time ${timeSlot}` });
      // conversation.messages.push({ role: 'assistant', content: JSON.stringify(updatedMessages) });
      conversation.messages = updatedMessages;
      conversation.updatedAt = Date.now();
      await conversation.save();

      res.json(editedResource);
    } catch (error) {
      console.error('Error in editResource:', error);
      res.status(500).json({ error: error.message });
    }
  },

  getApiUsage: async (req, res) => {
    try {
      const user = await User.findById(req.userId);
      if (!user) return res.status(404).json({ error: 'User not found' });

      const apiUsage = {
        count: user.apiUsage.count,
        lastReset: user.apiUsage.lastReset,
        limit: getApiLimit(user.subscriptionTier)
      };

      res.json(apiUsage);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
  generateResponse: async (req, res) => {
    console.log("Lets create a schedule");
    
    try {
      const { conversationId, topic, level, time_period } = req.body;
      const conversation = await Conversation.findOne({ _id: conversationId, user: req.userId });
      if (!conversation) return res.status(404).json({ error: 'Conversation not found' });
  
      // Check API usage limits
      const user = await User.findById(req.userId);
      if (user.apiUsage.count >= getApiLimit(user.subscriptionTier)) {
        return res.status(429).json({ error: 'API limit reached' });
      }
  
      // Call AI API
      const aiResponse = await callAiApi(topic, level, time_period);
  
      // Update conversation
      conversation.messages.push({ role: 'user', content: `Generate a course schedule for ${topic} at ${level} level for ${time_period}` });
      conversation.messages.push({ role: 'assistant', content: JSON.stringify(aiResponse.final_data) });
      conversation.updatedAt = Date.now();
      await conversation.save();
  
      // Update API usage
      user.apiUsage.count += 1;
      await user.save();
  
      res.json({ response: aiResponse });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};

function getApiLimit(tier) {
  const limits = { free: 100, premium: 1000, enterprise: Infinity };
  return limits[tier] || limits.free;
}

async function callAiEditResourceApi(resource, timeSlot, weekNum, dayNum, resourceId, conversationHistory) {
  try {
    const response = await axios.post('https://courseai-helper-backend.onrender.com/api/edit-resource', {
      resource,
      timeSlot,
      weekNum,
      dayNum,
      resourceId,
      conversationHistory
    });
    console.log(response.data);

    return response.data;
  } catch (error) {
    console.error('Error calling AI Edit Resource API:', error);
    throw new Error('Failed to get response from AI Edit Resource API');
  }
}

function updateConversationMessages(messages, weekNum, dayNum, timeSlot, contentId, resourceId, newResource) {
  return messages.map(message => {
    if (message.role === 'assistant') {
      try {
        let content = JSON.parse(message.content);
        content = updateResourceInContent(content, weekNum, dayNum, timeSlot, contentId, resourceId, newResource);
        message.content = JSON.stringify(content);
      } catch (error) {
        console.error('Error updating conversation messages:', error);
      }
    }
    return message;
  });
}

function updateResourceInContent(content, weekNum, dayNum, timeSlot, contentId, resourceId, newResource) {
  return {
    ...content,
    weeks: content.weeks.map(week =>
      week.weekNumber === weekNum
        ? {
          ...week,
          days: week.days.map(day =>
            day.dayNumber === dayNum
              ? {
                ...day,
                timeSlots: day.timeSlots.map(slot =>
                  slot.time === timeSlot
                    ? {
                      ...slot,
                      contents: slot.contents.map(content =>
                        content.id === contentId
                          ? {
                            ...content,
                            resources: content.resources.map(resource =>
                              resource.id === resourceId
                                ? { ...resource, link: newResource.link, description: newResource.description }
                                : resource
                            )
                          }
                          : content
                      )
                    }
                    : slot
                )
              }
              : day
          )
        }
        : week
    )
  };
}

async function callAiApi(topic, level, time_period) {
  try {
    const response = await axios.post('https://courseai-50fx.onrender.com/start', {
      topic,
      level,
      time_period
    }, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 3600000 
    });

    return response.data; 
  } catch (error) {
    console.error('Error calling AI API:', error);
    throw new Error('Failed to get response from AI API');
  }
}

module.exports = aiController;