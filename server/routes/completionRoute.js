const express = require('express');
const router = express.Router();
const completionController = require('../controllers/completionController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

router.get('/completion-status', completionController.getCompletion);
router.post('/completion-status', completionController.updateCompletion);

module.exports = router;