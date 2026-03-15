const jwt = require('jsonwebtoken');
const prisma = require('../utils/prismaClient');

// Track online users: userId -> socketId
const onlineUsers = new Map();

const socketHandler = (io) => {
    // Middleware to authenticate socket
    io.use((socket, next) => {
        const token = socket.handshake.auth.token;
        if (!token) return next(new Error('Authentication error'));
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            socket.userId = decoded.userId;
            next();
        } catch {
            next(new Error('Invalid token'));
        }
    });

    io.on('connection', (socket) => {
        const userId = socket.userId;
        console.log(`🔌 User connected: ${userId}`);

        // Join personal room
        socket.join(userId);
        onlineUsers.set(userId, socket.id);

        // Broadcast online status to connections
        socket.broadcast.emit('user_online', { userId });

        // CLIENT → SERVER: join_room (explicit)
        socket.on('join_room', (data) => {
            socket.join(data.roomId || userId);
        });

        // CLIENT → SERVER: send_message
        socket.on('send_message', async ({ receiverId, content }) => {
            try {
                const message = await prisma.message.create({
                    data: { senderId: userId, receiverId, content },
                    include: {
                        sender: { select: { id: true, name: true, avatar: true } },
                        receiver: { select: { id: true, name: true, avatar: true } },
                    },
                });

                // Emit to receiver
                io.to(receiverId).emit('new_message', { message });
                // Emit back to sender for confirmation
                socket.emit('new_message', { message });
            } catch (err) {
                socket.emit('error', { message: 'Failed to send message' });
            }
        });

        // CLIENT → SERVER: typing
        socket.on('typing', ({ receiverId }) => {
            io.to(receiverId).emit('typing_indicator', {
                userId,
                name: socket.userName || '',
            });
        });

        // CLIENT → SERVER: stop_typing
        socket.on('stop_typing', ({ receiverId }) => {
            io.to(receiverId).emit('stop_typing', { userId });
        });

        // CLIENT → SERVER: mark_read
        socket.on('mark_read', async ({ senderId }) => {
            try {
                await prisma.message.updateMany({
                    where: { senderId, receiverId: userId, read: false },
                    data: { read: true },
                });
                io.to(senderId).emit('messages_read', { by: userId });
            } catch (err) {
                console.error('mark_read error:', err);
            }
        });

        // Disconnect
        socket.on('disconnect', () => {
            console.log(`❌ User disconnected: ${userId}`);
            onlineUsers.delete(userId);
            socket.broadcast.emit('user_offline', { userId });
        });
    });
};

module.exports = socketHandler;
module.exports.onlineUsers = onlineUsers;
