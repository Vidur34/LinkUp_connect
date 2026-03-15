const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const {
    getAllBlogs, createBlog, getBlogById, updateBlog, toggleBlogVote, addBlogComment,
    getAllGuides, getCompanies, getGuidesByCompany, createGuide, toggleGuideVote,
    getMentors, endorseSkill, updateMentorSettings,
} = require('../controllers/growController');

const router = express.Router();

// Blogs
router.get('/blogs', getAllBlogs);
router.post('/blogs', authMiddleware, createBlog);
router.get('/blogs/:id', getBlogById);
router.put('/blogs/:id', authMiddleware, updateBlog);
router.post('/blogs/:id/vote', authMiddleware, toggleBlogVote);
router.post('/blogs/:id/comment', authMiddleware, addBlogComment);

// Internship Guides
router.get('/guides', getAllGuides);
router.get('/guides/companies', getCompanies);
router.get('/guides/company/:name', getGuidesByCompany);
router.post('/guides', authMiddleware, createGuide);
router.post('/guides/:id/vote', authMiddleware, toggleGuideVote);

// Mentors
router.get('/mentors', getMentors);
router.post('/mentors/endorse/:userId/:skill', authMiddleware, endorseSkill);
router.put('/mentors/settings', authMiddleware, updateMentorSettings);

module.exports = router;
