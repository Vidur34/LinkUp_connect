require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const { errorHandler } = require('./middleware/errorHandler');
const socketHandler = require('./socket/socketHandler');

// Routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const eventRoutes = require('./routes/events');
const teamRoutes = require('./routes/teams');
const chatRoutes = require('./routes/chat');
const matchRoutes = require('./routes/match');
const marketplaceRoutes = require('./routes/marketplace');
const growRoutes = require('./routes/grow');
const orgRoutes = require('./routes/orgs');
const aiRoutes = require('./routes/ai');

const app = express();
const httpServer = http.createServer(app);

// Socket.io setup
const io = new Server(httpServer, {
    cors: {
        origin: process.env.FRONTEND_URL || 'http://localhost:5173',
        methods: ['GET', 'POST'],
        credentials: true,
    },
});

// Make io accessible in routes via req.io
app.use((req, _res, next) => {
    req.io = io;
    next();
});

// Middleware
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/match', matchRoutes);
app.use('/api/marketplace', marketplaceRoutes);
app.use('/api/grow', growRoutes);
app.use('/api/orgs', orgRoutes);
app.use('/api/ai', aiRoutes);

// 404 handler
app.use((_req, res) => {
    res.status(404).json({ error: true, message: 'Route not found' });
});

// Error handler
app.use(errorHandler);

// Socket handler
socketHandler(io);

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
    console.log(`🚀 LinkUp v2.0 server running on port ${PORT}`);
    console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = { app, httpServer, io };
