const Completion = require('../models/completionModel');

const completionController = {
    getCompletion: async (req, res) => {
        try {
            const { conversationId } = req.query;
            console.log('Received conversationId:', conversationId);
            
            if (!conversationId) {
                return res.status(400).json({ error: 'conversationId is required' });
            }

            const status = await Completion.findOne({ conversationId });
            console.log('Found status:', status);
            
            res.json(status || { completedItems: [] });
        } catch (error) {
            console.error('Error in getCompletion:', error);
            res.status(500).json({ error: 'Failed to fetch completion status' });
        }
    },

    updateCompletion: async (req, res) => {
        
        try {
            const { completedItems, conversationId } = req.body;
            
            const status = await Completion.findOneAndUpdate(
                { conversationId },
                {
                    $set: {
                        completedItems,
                        updatedAt: new Date()
                    }
                },
                { upsert: true, new: true }
            );
            res.json({ status: 'success', completedItems: status.completedItems });
        } catch (error) {
            console.error('Error updating completion status:', error);
            res.status(500).json({ error: 'Failed to update completion status' });
        }
    }
};

module.exports = completionController;