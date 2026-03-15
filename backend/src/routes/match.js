const express = require('express');
const { getMatchSuggestions, getMatchScore } = require('../controllers/matchController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();
router.use(authMiddleware);

router.get('/suggestions', getMatchSuggestions);
router.get('/score/:userId', getMatchScore);

module.exports = router;
