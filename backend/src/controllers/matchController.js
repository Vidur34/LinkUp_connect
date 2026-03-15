const prisma = require('../utils/prismaClient');
const { calculateMatchScore } = require('../utils/matchAlgorithm');

// GET /api/match/suggestions
const getMatchSuggestions = async (req, res, next) => {
    try {
        const currentUser = req.user;

        const currentUserFull = await prisma.user.findUnique({
            where: { id: currentUser.id },
            include: { eventJoins: { select: { eventId: true } } },
        });
        const currentEventIds = currentUserFull.eventJoins.map(e => e.eventId);

        // Get already-connected user IDs
        const connections = await prisma.connection.findMany({
            where: {
                OR: [{ senderId: currentUser.id }, { receiverId: currentUser.id }],
                status: { in: ['accepted', 'pending'] },
            },
        });
        const excludedIds = new Set([
            currentUser.id,
            ...connections.map(c => c.senderId === currentUser.id ? c.receiverId : c.senderId),
        ]);

        const users = await prisma.user.findMany({
            where: { id: { notIn: Array.from(excludedIds) } },
            include: { eventJoins: { select: { eventId: true } } },
        });

        const scored = users.map(u => {
            const eventIds = u.eventJoins.map(e => e.eventId);
            const match = calculateMatchScore(currentUser, u, currentEventIds, eventIds);
            const { password, eventJoins, ...safe } = u;
            return { ...safe, matchScore: match.score, matchReasons: match.reasons, sharedSkills: match.sharedSkills, sharedInterests: match.sharedInterests };
        })
            .filter(u => u.matchScore > 0)
            .sort((a, b) => b.matchScore - a.matchScore)
            .slice(0, 20);

        res.json({ success: true, data: scored });
    } catch (err) {
        next(err);
    }
};

// GET /api/match/score/:userId
const getMatchScore = async (req, res, next) => {
    try {
        const currentUser = req.user;
        const otherUser = await prisma.user.findUnique({
            where: { id: req.params.userId },
            include: { eventJoins: { select: { eventId: true } } },
        });
        if (!otherUser) return res.status(404).json({ error: true, message: 'User not found' });

        const currentUserFull = await prisma.user.findUnique({
            where: { id: currentUser.id },
            include: { eventJoins: { select: { eventId: true } } },
        });
        const currentEventIds = currentUserFull.eventJoins.map(e => e.eventId);
        const otherEventIds = otherUser.eventJoins.map(e => e.eventId);

        const match = calculateMatchScore(currentUser, otherUser, currentEventIds, otherEventIds);
        res.json({ success: true, data: match });
    } catch (err) {
        next(err);
    }
};

module.exports = { getMatchSuggestions, getMatchScore };
