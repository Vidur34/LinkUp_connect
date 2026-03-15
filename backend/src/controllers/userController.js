const prisma = require('../utils/prismaClient');
const { calculateMatchScore } = require('../utils/matchAlgorithm');

const userSelect = {
    id: true, name: true, email: true, department: true,
    year: true, skills: true, interests: true, bio: true,
    avatar: true, networkingScore: true, createdAt: true,
};

// GET /api/users - all users with match scores
const getAllUsers = async (req, res, next) => {
    try {
        const currentUser = req.user;
        const [users, myConnections] = await Promise.all([
            prisma.user.findMany({
                where: { id: { not: currentUser.id } },
                select: {
                    ...userSelect,
                    eventJoins: { select: { eventId: true } },
                },
            }),
            prisma.connection.findMany({
                where: {
                    OR: [
                        { senderId: currentUser.id },
                        { receiverId: currentUser.id }
                    ]
                }
            })
        ]);

        const currentUserWithEvents = await prisma.user.findUnique({
            where: { id: currentUser.id },
            include: { eventJoins: { select: { eventId: true } } },
        });

        const currentEventIds = currentUserWithEvents.eventJoins.map(e => e.eventId);

        const usersWithScores = users.map(u => {
            const { eventJoins, ...userWithoutJoins } = u;
            const eventIds = eventJoins.map(e => e.eventId);
            const match = calculateMatchScore(currentUser, u, currentEventIds, eventIds);
            
            // Find connection status
            const conn = myConnections.find(c => 
                (c.senderId === currentUser.id && c.receiverId === u.id) ||
                (c.senderId === u.id && c.receiverId === currentUser.id)
            );
            
            let connectionStatus = 'none';
            if (conn) {
                connectionStatus = conn.status; // pending, accepted, rejected
            }

            return { 
                ...userWithoutJoins, 
                matchScore: match.score, 
                matchReasons: match.reasons, 
                sharedSkills: match.sharedSkills,
                connectionStatus 
            };
        });

        res.json({ success: true, data: usersWithScores });
    } catch (err) {
        next(err);
    }
};

// GET /api/users/:id
const getUserById = async (req, res, next) => {
    try {
        const currentUserId = req.user.id;
        const targetUserId = req.params.id;

        const [user, connection] = await Promise.all([
            prisma.user.findUnique({
                where: { id: targetUserId },
                select: {
                    ...userSelect,
                    _count: {
                        select: {
                            sentConnections: { where: { status: 'accepted' } },
                            receivedConnections: { where: { status: 'accepted' } },
                            eventJoins: true,
                            teamMemberships: true,
                        },
                    },
                },
            }),
            prisma.connection.findFirst({
                where: {
                    OR: [
                        { senderId: currentUserId, receiverId: targetUserId },
                        { senderId: targetUserId, receiverId: currentUserId }
                    ]
                }
            })
        ]);

        if (!user) {
            return res.status(404).json({ error: true, message: 'User not found' });
        }

        const data = {
            ...user,
            connectionStatus: connection ? connection.status : 'none'
        };

        res.json({ success: true, data });
    } catch (err) {
        next(err);
    }
};

// PUT /api/users/:id
const updateUser = async (req, res, next) => {
    try {
        if (req.params.id !== req.user.id) {
            return res.status(403).json({ error: true, message: 'Forbidden' });
        }
        const { name, department, year, bio, skills, interests, avatar } = req.body;
        const updated = await prisma.user.update({
            where: { id: req.params.id },
            data: {
                ...(name && { name }),
                ...(department && { department }),
                ...(year && { year: parseInt(year) }),
                ...(bio !== undefined && { bio }),
                ...(skills && { skills }),
                ...(interests && { interests }),
                ...(avatar !== undefined && { avatar }),
            },
            select: userSelect,
        });
        res.json({ success: true, data: updated });
    } catch (err) {
        next(err);
    }
};

// GET /api/users/:id/connections
const getUserConnections = async (req, res, next) => {
    try {
        const connections = await prisma.connection.findMany({
            where: {
                OR: [
                    { senderId: req.params.id, status: 'accepted' },
                    { receiverId: req.params.id, status: 'accepted' },
                ],
            },
            include: {
                sender: { select: userSelect },
                receiver: { select: userSelect },
            },
        });

        const friends = connections.map(c =>
            c.senderId === req.params.id ? c.receiver : c.sender
        );
        res.json({ success: true, data: friends });
    } catch (err) {
        next(err);
    }
};

// POST /api/users/connect/:id
const sendConnectionRequest = async (req, res, next) => {
    try {
        const senderId = req.user.id;
        const receiverId = req.params.id;

        if (senderId === receiverId) {
            return res.status(400).json({ error: true, message: 'Cannot connect with yourself' });
        }

        const existing = await prisma.connection.findFirst({
            where: {
                OR: [
                    { senderId, receiverId },
                    { senderId: receiverId, receiverId: senderId },
                ],
            },
        });
        if (existing) {
            return res.status(409).json({ error: true, message: 'Connection already exists' });
        }

        const connection = await prisma.connection.create({
            data: { senderId, receiverId, status: 'pending' },
            include: { sender: { select: userSelect }, receiver: { select: userSelect } },
        });

        // Notification
        await prisma.notification.create({
            data: {
                userId: receiverId,
                type: 'connection_request',
                message: `${req.user.name} sent you a connection request`,
            },
        });

        // Socket emit
        req.io?.to(receiverId).emit('connection_request', { from: req.user });

        res.status(201).json({ success: true, data: connection });
    } catch (err) {
        next(err);
    }
};

// PUT /api/users/connect/:id/accept
const acceptConnection = async (req, res, next) => {
    try {
        const receiverId = req.user.id;
        const senderId = req.params.id;

        const connection = await prisma.connection.findFirst({
            where: { senderId, receiverId, status: 'pending' },
        });
        if (!connection) {
            return res.status(404).json({ error: true, message: 'Connection request not found' });
        }

        const updated = await prisma.connection.update({
            where: { id: connection.id },
            data: { status: 'accepted' },
        });

        // Award networking score to both
        await prisma.user.updateMany({
            where: { id: { in: [senderId, receiverId] } },
            data: { networkingScore: { increment: 10 } },
        });

        // Notification to sender
        await prisma.notification.create({
            data: {
                userId: senderId,
                type: 'connection_accepted',
                message: `${req.user.name} accepted your connection request`,
            },
        });

        req.io?.to(senderId).emit('connection_accepted', { by: req.user });

        res.json({ success: true, data: updated });
    } catch (err) {
        next(err);
    }
};

// PUT /api/users/connect/:id/reject
const rejectConnection = async (req, res, next) => {
    try {
        const receiverId = req.user.id;
        const senderId = req.params.id;

        const connection = await prisma.connection.findFirst({
            where: { senderId, receiverId, status: 'pending' },
        });
        if (!connection) {
            return res.status(404).json({ error: true, message: 'Connection request not found' });
        }

        await prisma.connection.update({
            where: { id: connection.id },
            data: { status: 'rejected' },
        });

        res.json({ success: true, message: 'Connection rejected' });
    } catch (err) {
        next(err);
    }
};

// GET /api/users/leaderboard
const getLeaderboard = async (req, res, next) => {
    try {
        const users = await prisma.user.findMany({
            orderBy: { networkingScore: 'desc' },
            take: 20,
            select: { ...userSelect },
        });
        res.json({ success: true, data: users });
    } catch (err) {
        next(err);
    }
};

module.exports = {
    getAllUsers, getUserById, updateUser, getUserConnections,
    sendConnectionRequest, acceptConnection, rejectConnection, getLeaderboard,
};
