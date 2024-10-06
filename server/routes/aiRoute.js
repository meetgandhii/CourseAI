const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

router.post('/generate', aiController.generateResponse);
router.post('/edit-resource', aiController.editResource);
router.get('/model-info', aiController.getModelInfo);
router.get('/usage', aiController.getApiUsage);

module.exports = router;