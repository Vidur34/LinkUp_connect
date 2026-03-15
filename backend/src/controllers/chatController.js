const prisma = require('../utils/prismaClient');

const userSelect = { id: true, name: true, avatar: true, department: true };

// GET /api/chat/conversations
const getConversations = async (req, res, next) => {
    try {
        const userId = req.user.id;

        // Get all unique users this user has talked with
        const messages = await prisma.message.findMany({
            where: {
                OR: [{ senderId: userId }, { receiverId: userId }],
            },
            orderBy: { createdAt: 'desc' },
            include: {
                sender: { select: userSelect },
                receiver: { select: userSelect },
            },
        });

        // Build conversation list
        const convMap = new Map();
        messages.forEach(msg => {
            const other = msg.senderId === userId ? msg.receiver : msg.sender;
            if (!convMap.has(other.id)) {
                convMap.set(other.id, {
                    user: other,
                    lastMessage: msg.content,
                    lastMessageAt: msg.createdAt,
                    unreadCount: 0,
                });
            }
            if (!msg.read && msg.receiverId === userId) {
                const conv = convMap.get(other.id);
                conv.unreadCount += 1;
            }
        });

        res.json({ success: true, data: Array.from(convMap.values()) });
    } catch (err) {
        next(err);
    }
};

// GET /api/chat/messages/:userId
const getMessages = async (req, res, next) => {
    try {
        const currentUserId = req.user.id;
        const otherUserId = req.params.userId;

        const messages = await prisma.message.findMany({
            where: {
                OR: [
                    { senderId: currentUserId, receiverId: otherUserId },
                    { senderId: otherUserId, receiverId: currentUserId },
                ],
            },
            orderBy: { createdAt: 'asc' },
            include: {
                sender: { select: userSelect },
                receiver: { select: userSelect },
            },
        });

        // Mark as read
        await prisma.message.updateMany({
            where: { senderId: otherUserId, receiverId: currentUserId, read: false },
            data: { read: true },
        });

        res.json({ success: true, data: messages });
    } catch (err) {
        next(err);
    }
};

// POST /api/chat/messages/:userId
const sendMessage = async (req, res, next) => {
    try {
        const senderId = req.user.id;
        const receiverId = req.params.userId;
        const { content } = req.body;

        if (!content?.trim()) {
            return res.status(400).json({ error: true, message: 'Message content required' });
        }

        const message = await prisma.message.create({
            data: { senderId, receiverId, content: content.trim() },
            include: {
                sender: { select: userSelect },
                receiver: { select: userSelect },
            },
        });

        // Award score (capped per day logic simplified here)
        await prisma.user.update({
            where: { id: senderId },
            data: { networkingScore: { increment: 2 } },
        });

        // Emit to receiver
        req.io?.to(receiverId).emit('new_message', { message });

        res.status(201).json({ success: true, data: message });
    } catch (err) {
        next(err);
    }
};

module.exports = { getConversations, getMessages, sendMessage };
