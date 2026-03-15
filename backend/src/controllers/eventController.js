const prisma = require('../utils/prismaClient');

const eventSelect = {
    id: true, name: true, description: true, venue: true,
    startTime: true, endTime: true, category: true,
    maxCapacity: true, createdAt: true,
};

// GET /api/events
const getAllEvents = async (req, res, next) => {
    try {
        const { category } = req.query;
        const events = await prisma.event.findMany({
            where: category && category !== 'All' ? { category } : {},
            orderBy: { startTime: 'asc' },
            include: {
                joins: {
                    include: { user: { select: { id: true, name: true, avatar: true } } },
                },
                _count: { select: { joins: true } },
            },
        });
        res.json({ success: true, data: events });
    } catch (err) {
        next(err);
    }
};

// POST /api/events
const createEvent = async (req, res, next) => {
    try {
        const { name, description, venue, startTime, endTime, category, maxCapacity } = req.body;
        const event = await prisma.event.create({
            data: {
                name, description, venue, category,
                startTime: new Date(startTime),
                endTime: new Date(endTime),
                maxCapacity: maxCapacity ? parseInt(maxCapacity) : null,
            },
        });
        res.status(201).json({ success: true, data: event });
    } catch (err) {
        next(err);
    }
};

// GET /api/events/:id
const getEventById = async (req, res, next) => {
    try {
        const event = await prisma.event.findUnique({
            where: { id: req.params.id },
            include: {
                joins: {
                    include: { user: { select: { id: true, name: true, avatar: true, department: true } } },
                },
            },
        });
        if (!event) return res.status(404).json({ error: true, message: 'Event not found' });
        res.json({ success: true, data: event });
    } catch (err) {
        next(err);
    }
};

// POST /api/events/:id/join
const joinEvent = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const eventId = req.params.id;

        const event = await prisma.event.findUnique({ where: { id: eventId }, include: { _count: { select: { joins: true } } } });
        if (!event) return res.status(404).json({ error: true, message: 'Event not found' });

        if (event.maxCapacity && event._count.joins >= event.maxCapacity) {
            return res.status(400).json({ error: true, message: 'Event is at full capacity' });
        }

        const join = await prisma.eventJoin.create({ data: { userId, eventId } });

        // Award networking score
        await prisma.user.update({
            where: { id: userId },
            data: { networkingScore: { increment: 15 } },
        });

        res.status(201).json({ success: true, data: join });
    } catch (err) {
        if (err.code === 'P2002') {
            return res.status(409).json({ error: true, message: 'Already joined this event' });
        }
        next(err);
    }
};

// DELETE /api/events/:id/leave
const leaveEvent = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const eventId = req.params.id;

        const join = await prisma.eventJoin.findUnique({ where: { userId_eventId: { userId, eventId } } });
        if (!join) return res.status(404).json({ error: true, message: 'Not joined this event' });

        await prisma.eventJoin.delete({ where: { userId_eventId: { userId, eventId } } });

        // Remove score
        await prisma.user.update({
            where: { id: userId },
            data: { networkingScore: { decrement: 15 } },
        });

        res.json({ success: true, message: 'Left event' });
    } catch (err) {
        next(err);
    }
};

module.exports = { getAllEvents, createEvent, getEventById, joinEvent, leaveEvent };
