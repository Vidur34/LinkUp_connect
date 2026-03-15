const express = require('express');
const { getConversations, getMessages, sendMessage } = require('../controllers/chatController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();
router.use(authMiddleware);

router.get('/conversations', getConversations);
router.get('/messages/:userId', getMessages);
router.post('/messages/:userId', sendMessage);

module.exports = router;
