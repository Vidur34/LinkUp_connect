const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');
const { 
    generateBio, generateBlogOutline, generateCoverLetter, generateTeamDescription, 
    festbotChat, explainMatch, generateInterviewPrep, generateProjectIdeas, summarizeEventReviews,
    parseResumeToProfile, generateIcebreakers, generateMarketplaceListing
} = require('../controllers/aiController');

const router = express.Router();

router.post('/generate-bio', authMiddleware, generateBio);
router.post('/blog-outline', authMiddleware, generateBlogOutline);
router.post('/cover-letter', authMiddleware, generateCoverLetter);
router.post('/team-description', authMiddleware, generateTeamDescription);
router.post('/chat', authMiddleware, festbotChat);
router.post('/match-explain', authMiddleware, explainMatch);
router.post('/interview-prep', authMiddleware, generateInterviewPrep);
router.post('/project-ideas', authMiddleware, generateProjectIdeas);
router.post('/event-summary', authMiddleware, summarizeEventReviews);
router.post('/parse-resume', authMiddleware, upload.single('resume'), parseResumeToProfile);
router.post('/generate-icebreakers', authMiddleware, generateIcebreakers);
router.post('/marketplace-listing', authMiddleware, generateMarketplaceListing);

module.exports = router;
