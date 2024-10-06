const express = require('express');
const router = express.Router();
const conversationController = require('../controllers/conversationController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

router.post('/', conversationController.createConversation);
router.get('/', conversationController.getConversations);
router.get('/:id', conversationController.getConversation);
router.post('/:id/messages', conversationController.addMessage);
router.delete('/:id', conversationController.deleteConversation);

module.exports = router;