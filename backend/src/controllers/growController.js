const prisma = require('../utils/prismaClient');

// ==================== BLOGS ====================

// GET /api/grow/blogs
const getAllBlogs = async (req, res, next) => {
    try {
        const { category, search } = req.query;
        const where = { isPublished: true };
        if (category && category !== 'All') where.category = category;
        if (search) where.title = { contains: search, mode: 'insensitive' };

        const blogs = await prisma.blog.findMany({
            where,
            orderBy: { upvotes: 'desc' },
            include: {
                author: { select: { id: true, name: true, avatar: true, year: true, department: true } },
                _count: { select: { votes: true, comments: true } },
            },
        });
        res.json({ success: true, data: blogs });
    } catch (err) {
        next(err);
    }
};

// POST /api/grow/blogs
const createBlog = async (req, res, next) => {
    try {
        const { title, content, tags, category } = req.body;
        const blog = await prisma.blog.create({
            data: {
                authorId: req.user.id,
                title,
                content,
                tags: tags || [],
                category: category || 'College Life',
            },
            include: {
                author: { select: { id: true, name: true, avatar: true, year: true, department: true } },
            },
        });
        res.status(201).json({ success: true, data: blog });
    } catch (err) {
        next(err);
    }
};

// GET /api/grow/blogs/:id
const getBlogById = async (req, res, next) => {
    try {
        const blog = await prisma.blog.findUnique({
            where: { id: req.params.id },
            include: {
                author: { select: { id: true, name: true, avatar: true, year: true, department: true, bio: true } },
                comments: {
                    include: { author: { select: { id: true, name: true, avatar: true } } },
                    orderBy: { createdAt: 'asc' },
                },
                _count: { select: { votes: true, comments: true } },
            },
        });
        if (!blog) return res.status(404).json({ error: true, message: 'Blog not found' });
        res.json({ success: true, data: blog });
    } catch (err) {
        next(err);
    }
};

// PUT /api/grow/blogs/:id
const updateBlog = async (req, res, next) => {
    try {
        const blog = await prisma.blog.findUnique({ where: { id: req.params.id } });
        if (!blog) return res.status(404).json({ error: true, message: 'Blog not found' });
        if (blog.authorId !== req.user.id) return res.status(403).json({ error: true, message: 'Forbidden' });

        const { title, content, tags, category } = req.body;
        const updated = await prisma.blog.update({
            where: { id: req.params.id },
            data: {
                ...(title && { title }),
                ...(content && { content }),
                ...(tags && { tags }),
                ...(category && { category }),
            },
        });
        res.json({ success: true, data: updated });
    } catch (err) {
        next(err);
    }
};

// POST /api/grow/blogs/:id/vote - toggle upvote
const toggleBlogVote = async (req, res, next) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const existing = await prisma.blogVote.findUnique({
            where: { blogId_userId: { blogId: id, userId } },
        });

        if (existing) {
            await prisma.blogVote.delete({ where: { blogId_userId: { blogId: id, userId } } });
            await prisma.blog.update({ where: { id }, data: { upvotes: { decrement: 1 } } });
            return res.json({ success: true, voted: false });
        }

        await prisma.blogVote.create({ data: { blogId: id, userId } });
        const blog = await prisma.blog.update({ where: { id }, data: { upvotes: { increment: 1 } } });

        // Notify author
        if (blog.authorId !== userId) {
            await prisma.notification.create({
                data: {
                    userId: blog.authorId,
                    type: 'blog_upvoted',
                    message: `${req.user.name} upvoted your blog "${blog.title}"`,
                },
            });
        }
        res.json({ success: true, voted: true });
    } catch (err) {
        next(err);
    }
};

// POST /api/grow/blogs/:id/comment
const addBlogComment = async (req, res, next) => {
    try {
        const { content } = req.body;
        const comment = await prisma.blogComment.create({
            data: { blogId: req.params.id, authorId: req.user.id, content },
            include: { author: { select: { id: true, name: true, avatar: true } } },
        });
        res.status(201).json({ success: true, data: comment });
    } catch (err) {
        next(err);
    }
};

// ==================== INTERNSHIP GUIDES ====================

// GET /api/grow/guides
const getAllGuides = async (req, res, next) => {
    try {
        const { company, difficulty, year } = req.query;
        const where = {};
        if (company) where.company = { contains: company, mode: 'insensitive' };
        if (difficulty) where.difficulty = difficulty;
        if (year) where.year = parseInt(year);

        const guides = await prisma.internshipGuide.findMany({
            where,
            orderBy: { upvotes: 'desc' },
            include: {
                author: { select: { id: true, name: true, avatar: true, year: true, department: true } },
                _count: { select: { votes: true } },
            },
        });
        res.json({ success: true, data: guides });
    } catch (err) {
        next(err);
    }
};

// GET /api/grow/guides/companies
const getCompanies = async (req, res, next) => {
    try {
        const companies = await prisma.internshipGuide.groupBy({
            by: ['company'],
            _count: { company: true },
            orderBy: { _count: { company: 'desc' } },
        });
        res.json({ success: true, data: companies.map(c => ({ company: c.company, count: c._count.company })) });
    } catch (err) {
        next(err);
    }
};

// GET /api/grow/guides/company/:name
const getGuidesByCompany = async (req, res, next) => {
    try {
        const guides = await prisma.internshipGuide.findMany({
            where: { company: { equals: req.params.name, mode: 'insensitive' } },
            orderBy: { upvotes: 'desc' },
            include: {
                author: { select: { id: true, name: true, avatar: true, year: true, department: true } },
            },
        });
        res.json({ success: true, data: guides });
    } catch (err) {
        next(err);
    }
};

// POST /api/grow/guides
const createGuide = async (req, res, next) => {
    try {
        const { company, role, year, stipend, duration, difficulty, resumeTips, applicationProcess, interviewRounds, resourceLinks, timeline, companyLogo } = req.body;
        const guide = await prisma.internshipGuide.create({
            data: {
                company, role, year: parseInt(year), stipend, duration, difficulty,
                resumeTips, applicationProcess,
                interviewRounds: interviewRounds || [],
                resourceLinks: resourceLinks || [],
                timeline,
                companyLogo: companyLogo || null,
                authorId: req.user.id,
            },
            include: { author: { select: { id: true, name: true, avatar: true, year: true, department: true } } },
        });
        res.status(201).json({ success: true, data: guide });
    } catch (err) {
        if (err.code === 'P2002') {
            return res.status(409).json({ error: true, message: 'You already submitted a guide for this company' });
        }
        next(err);
    }
};

// POST /api/grow/guides/:id/vote
const toggleGuideVote = async (req, res, next) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const existing = await prisma.guideVote.findUnique({
            where: { guideId_userId: { guideId: id, userId } },
        });

        if (existing) {
            await prisma.guideVote.delete({ where: { guideId_userId: { guideId: id, userId } } });
            await prisma.internshipGuide.update({ where: { id }, data: { upvotes: { decrement: 1 } } });
            return res.json({ success: true, voted: false });
        }

        await prisma.guideVote.create({ data: { guideId: id, userId } });
        await prisma.internshipGuide.update({ where: { id }, data: { upvotes: { increment: 1 } } });
        res.json({ success: true, voted: true });
    } catch (err) {
        next(err);
    }
};

// ==================== MENTORS ====================

// GET /api/grow/mentors
const getMentors = async (req, res, next) => {
    try {
        const { skill } = req.query;
        const mentors = await prisma.user.findMany({
            where: { isOpenToMentor: true },
            select: {
                id: true, name: true, avatar: true, year: true, department: true,
                mentorSkills: true, mentorBio: true, email: true,
                mentorEndorsements: {
                    select: { skill: true, endorserId: true },
                },
            },
        });

        // Apply skill filter & sort by total endorsements
        let result = mentors.map(m => ({
            ...m,
            totalEndorsements: m.mentorEndorsements.length,
            skillEndorsements: m.mentorSkills.map(sk => ({
                skill: sk,
                count: m.mentorEndorsements.filter(e => e.skill === sk).length,
            })),
        }));

        if (skill) {
            result = result.filter(m => m.mentorSkills.some(s => s.toLowerCase().includes(skill.toLowerCase())));
        }

        result.sort((a, b) => b.totalEndorsements - a.totalEndorsements);
        res.json({ success: true, data: result });
    } catch (err) {
        next(err);
    }
};

// POST /api/grow/mentors/endorse/:userId/:skill
const endorseSkill = async (req, res, next) => {
    try {
        const { userId, skill } = req.params;
        const endorserId = req.user.id;

        if (userId === endorserId) {
            return res.status(400).json({ error: true, message: 'Cannot endorse yourself' });
        }

        const existing = await prisma.skillEndorsement.findUnique({
            where: { mentorId_endorserId_skill: { mentorId: userId, endorserId, skill } },
        });

        if (existing) {
            await prisma.skillEndorsement.delete({
                where: { mentorId_endorserId_skill: { mentorId: userId, endorserId, skill } },
            });
            return res.json({ success: true, endorsed: false });
        }

        await prisma.skillEndorsement.create({ data: { mentorId: userId, endorserId, skill } });

        await prisma.notification.create({
            data: {
                userId,
                type: 'skill_endorsed',
                message: `${req.user.name} endorsed your "${skill}" skill`,
            },
        });

        res.json({ success: true, endorsed: true });
    } catch (err) {
        next(err);
    }
};

// PUT /api/grow/mentors/settings
const updateMentorSettings = async (req, res, next) => {
    try {
        const { isOpenToMentor, mentorSkills, mentorBio } = req.body;
        const updated = await prisma.user.update({
            where: { id: req.user.id },
            data: {
                ...(isOpenToMentor !== undefined && { isOpenToMentor }),
                ...(mentorSkills && { mentorSkills }),
                ...(mentorBio !== undefined && { mentorBio }),
            },
            select: { id: true, isOpenToMentor: true, mentorSkills: true, mentorBio: true },
        });
        res.json({ success: true, data: updated });
    } catch (err) {
        next(err);
    }
};

module.exports = {
    getAllBlogs, createBlog, getBlogById, updateBlog, toggleBlogVote, addBlogComment,
    getAllGuides, getCompanies, getGuidesByCompany, createGuide, toggleGuideVote,
    getMentors, endorseSkill, updateMentorSettings,
};
