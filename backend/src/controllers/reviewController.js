const prisma = require('../utils/prismaClient');

// GET /api/events/:id/reviews
const getEventReviews = async (req, res, next) => {
    try {
        const eventId = req.params.id;
        const event = await prisma.event.findUnique({ where: { id: eventId } });
        if (!event) return res.status(404).json({ error: true, message: 'Event not found' });

        const reviews = await prisma.eventReview.findMany({
            where: { eventId },
            include: { user: { select: { id: true, name: true, avatar: true, department: true, year: true } } },
            orderBy: { helpful: 'desc' },
        });

        // Past editions reviews (if recurring)
        let pastEditions = [];
        if (event.isRecurring && event.eventSlug) {
            pastEditions = await prisma.pastEventEdition.findMany({
                where: { eventSlug: event.eventSlug },
                orderBy: { year: 'desc' },
            });
        }

        // Calculate summary
        const avgRating = reviews.length ? (reviews.reduce((a, b) => a + b.rating, 0) / reviews.length) : 0;
        const distribution = [5, 4, 3, 2, 1].map(star => ({
            star,
            count: reviews.filter(r => r.rating === star).length,
        }));

        res.json({ success: true, data: { reviews, avgRating: Math.round(avgRating * 10) / 10, distribution, pastEditions } });
    } catch (err) {
        next(err);
    }
};

// POST /api/events/:id/reviews
const submitReview = async (req, res, next) => {
    try {
        const eventId = req.params.id;
        const userId = req.user.id;

        // Must have joined the event
        const join = await prisma.eventJoin.findUnique({ where: { userId_eventId: { userId, eventId } } });
        if (!join) return res.status(403).json({ error: true, message: 'You must have joined the event to review it' });

        const { rating, content } = req.body;
        const year = new Date().getFullYear();

        const review = await prisma.eventReview.create({
            data: { eventId, userId, rating: parseInt(rating), content, year },
            include: { user: { select: { id: true, name: true, avatar: true, department: true, year: true } } },
        });
        res.status(201).json({ success: true, data: review });
    } catch (err) {
        if (err.code === 'P2002') {
            return res.status(409).json({ error: true, message: 'You already reviewed this event' });
        }
        next(err);
    }
};

// PUT /api/events/:id/reviews/:reviewId
const updateReview = async (req, res, next) => {
    try {
        const review = await prisma.eventReview.findUnique({ where: { id: req.params.reviewId } });
        if (!review) return res.status(404).json({ error: true, message: 'Review not found' });
        if (review.userId !== req.user.id) return res.status(403).json({ error: true, message: 'Forbidden' });

        const { rating, content } = req.body;
        const updated = await prisma.eventReview.update({
            where: { id: req.params.reviewId },
            data: { ...(rating && { rating: parseInt(rating) }), ...(content && { content }) },
            include: { user: { select: { id: true, name: true, avatar: true } } },
        });
        res.json({ success: true, data: updated });
    } catch (err) {
        next(err);
    }
};

// DELETE /api/events/:id/reviews/:reviewId
const deleteReview = async (req, res, next) => {
    try {
        const review = await prisma.eventReview.findUnique({ where: { id: req.params.reviewId } });
        if (!review) return res.status(404).json({ error: true, message: 'Review not found' });
        if (review.userId !== req.user.id) return res.status(403).json({ error: true, message: 'Forbidden' });

        await prisma.eventReview.delete({ where: { id: req.params.reviewId } });
        res.json({ success: true, message: 'Review deleted' });
    } catch (err) {
        next(err);
    }
};

// POST /api/events/:id/reviews/:reviewId/helpful
const markHelpful = async (req, res, next) => {
    try {
        const review = await prisma.eventReview.update({
            where: { id: req.params.reviewId },
            data: { helpful: { increment: 1 } },
        });

        if (review.userId !== req.user.id) {
            await prisma.notification.create({
                data: {
                    userId: review.userId,
                    type: 'review_helpful',
                    message: `${req.user.name} found your review helpful`,
                },
            });
        }
        res.json({ success: true, data: review });
    } catch (err) {
        next(err);
    }
};

module.exports = { getEventReviews, submitReview, updateReview, deleteReview, markHelpful };
