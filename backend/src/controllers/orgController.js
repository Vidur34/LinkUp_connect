const prisma = require('../utils/prismaClient');

// GET /api/orgs - all organisations
const getAllOrgs = async (req, res, next) => {
    try {
        const { category } = req.query;
        const where = {};
        if (category && category !== 'All') where.category = category;

        const orgs = await prisma.organisation.findMany({
            where,
            orderBy: { followers: 'desc' },
            select: {
                id: true, name: true, email: true, description: true, category: true,
                avatar: true, coverImage: true, followers: true, isVerified: true,
                instagramHandle: true, websiteUrl: true, createdAt: true,
            },
        });
        res.json({ success: true, data: orgs });
    } catch (err) {
        next(err);
    }
};

// GET /api/orgs/:id
const getOrgById = async (req, res, next) => {
    try {
        const org = await prisma.organisation.findUnique({
            where: { id: req.params.id },
            select: {
                id: true, name: true, email: true, description: true, category: true,
                avatar: true, coverImage: true, followers: true, isVerified: true,
                instagramHandle: true, websiteUrl: true, createdAt: true,
                events: {
                    orderBy: { startTime: 'asc' },
                    select: { id: true, name: true, description: true, venue: true, startTime: true, endTime: true, category: true },
                },
            },
        });
        if (!org) return res.status(404).json({ error: true, message: 'Organisation not found' });

        // Check if current user follows this org
        let isFollowing = false;
        if (req.user && req.user.accountType !== 'organisation') {
            const follow = await prisma.orgFollow.findUnique({
                where: { studentId_orgId: { studentId: req.user.id, orgId: org.id } },
            });
            isFollowing = !!follow;
        }

        res.json({ success: true, data: { ...org, isFollowing } });
    } catch (err) {
        next(err);
    }
};

// PUT /api/orgs/:id - update org profile (org account only)
const updateOrg = async (req, res, next) => {
    try {
        if (req.params.id !== req.user.id) {
            return res.status(403).json({ error: true, message: 'Forbidden' });
        }
        const { name, description, category, avatar, coverImage, instagramHandle, websiteUrl } = req.body;
        const updated = await prisma.organisation.update({
            where: { id: req.params.id },
            data: {
                ...(name && { name }),
                ...(description !== undefined && { description }),
                ...(category && { category }),
                ...(avatar !== undefined && { avatar }),
                ...(coverImage !== undefined && { coverImage }),
                ...(instagramHandle !== undefined && { instagramHandle }),
                ...(websiteUrl !== undefined && { websiteUrl }),
            },
        });
        const { password: _, ...safe } = updated;
        res.json({ success: true, data: safe });
    } catch (err) {
        next(err);
    }
};

// POST /api/orgs/:id/follow - student follows/unfollows an org
const toggleFollow = async (req, res, next) => {
    try {
        const orgId = req.params.id;
        const studentId = req.user.id;

        if (req.user.accountType === 'organisation') {
            return res.status(403).json({ error: true, message: 'Organisations cannot follow other organisations' });
        }

        const org = await prisma.organisation.findUnique({ where: { id: orgId } });
        if (!org) return res.status(404).json({ error: true, message: 'Organisation not found' });

        const existing = await prisma.orgFollow.findUnique({
            where: { studentId_orgId: { studentId, orgId } },
        });

        if (existing) {
            await prisma.orgFollow.delete({ where: { studentId_orgId: { studentId, orgId } } });
            const updatedOrg = await prisma.organisation.update({
                where: { id: orgId },
                data: { followers: { decrement: 1 } },
            });
            return res.json({ success: true, following: false, followers: updatedOrg.followers });
        }

        await prisma.orgFollow.create({ data: { studentId, orgId } });
        const updatedOrg = await prisma.organisation.update({
            where: { id: orgId },
            data: { followers: { increment: 1 } },
        });

        // Auto-verify when org reaches 100 followers
        if (updatedOrg.followers >= 100 && !updatedOrg.isVerified) {
            await prisma.organisation.update({
                where: { id: orgId },
                data: { isVerified: true },
            });
        }

        // Notify org
        await prisma.notification.create({
            data: {
                userId: orgId, // we store org notifs in Notification.userId (org id)
                type: 'org_followed',
                message: `${req.user.name} followed ${org.name}`,
            },
        });

        res.json({ success: true, following: true, followers: updatedOrg.followers });
    } catch (err) {
        next(err);
    }
};

// GET /api/orgs/:id/followers - list followers
const getOrgFollowers = async (req, res, next) => {
    try {
        const follows = await prisma.orgFollow.findMany({
            where: { orgId: req.params.id },
            include: { student: { select: { id: true, name: true, avatar: true, department: true } } },
        });
        res.json({ success: true, data: follows.map(f => f.student) });
    } catch (err) {
        next(err);
    }
};

// GET /api/orgs/followed - get orgs followed by current student
const getFollowedOrgs = async (req, res, next) => {
    try {
        if (req.user.accountType === 'organisation') {
            return res.json({ success: true, data: [] });
        }
        const follows = await prisma.orgFollow.findMany({
            where: { studentId: req.user.id },
            include: {
                org: {
                    select: {
                        id: true, name: true, description: true,category: true, avatar: true,
                        followers: true, isVerified: true,
                    },
                },
            },
            orderBy: { followedAt: 'desc' },
        });
        res.json({ success: true, data: follows.map(f => f.org) });
    } catch (err) {
        next(err);
    }
};

module.exports = { getAllOrgs, getOrgById, updateOrg, toggleFollow, getOrgFollowers, getFollowedOrgs };
