const prisma = require('../utils/prismaClient');

// GET /api/marketplace
const getAllListings = async (req, res, next) => {
    try {
        const { category, type, search, minPrice, maxPrice } = req.query;
        const where = { isAvailable: true };
        if (category && category !== 'All') where.category = category;
        if (type && type !== 'All') where.type = type;
        if (search) where.title = { contains: search, mode: 'insensitive' };
        if (minPrice || maxPrice) {
            where.price = {};
            if (minPrice) where.price.gte = parseFloat(minPrice);
            if (maxPrice) where.price.lte = parseFloat(maxPrice);
        }

        const listings = await prisma.marketplaceListing.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            include: {
                seller: {
                    select: { id: true, name: true, avatar: true, department: true, year: true, email: true },
                },
            },
        });
        res.json({ success: true, data: listings });
    } catch (err) {
        next(err);
    }
};

// POST /api/marketplace
const createListing = async (req, res, next) => {
    try {
        const { title, description, price, type, rentPerDay, category, images, condition } = req.body;
        const listing = await prisma.marketplaceListing.create({
            data: {
                title, description,
                price: parseFloat(price) || 0,
                type: type || 'sell',
                rentPerDay: rentPerDay ? parseFloat(rentPerDay) : null,
                category: category || 'Other',
                images: images || [],
                condition: condition || 'Good',
                sellerId: req.user.id,
            },
            include: { seller: { select: { id: true, name: true, avatar: true, department: true, year: true, email: true } } },
        });
        res.status(201).json({ success: true, data: listing });
    } catch (err) {
        next(err);
    }
};

// GET /api/marketplace/:id
const getListingById = async (req, res, next) => {
    try {
        const listing = await prisma.marketplaceListing.findUnique({
            where: { id: req.params.id },
            include: {
                seller: {
                    select: { id: true, name: true, avatar: true, department: true, year: true, email: true },
                },
            },
        });
        if (!listing) return res.status(404).json({ error: true, message: 'Listing not found' });

        // Increment views
        await prisma.marketplaceListing.update({
            where: { id: req.params.id },
            data: { views: { increment: 1 } },
        });

        // Fetch seller's other active listings
        const sellerOtherListings = await prisma.marketplaceListing.findMany({
            where: { sellerId: listing.sellerId, id: { not: listing.id }, isAvailable: true },
            take: 4,
            orderBy: { createdAt: 'desc' },
        });

        res.json({ success: true, data: { ...listing, sellerOtherListings } });
    } catch (err) {
        next(err);
    }
};

// PUT /api/marketplace/:id
const updateListing = async (req, res, next) => {
    try {
        const listing = await prisma.marketplaceListing.findUnique({ where: { id: req.params.id } });
        if (!listing) return res.status(404).json({ error: true, message: 'Listing not found' });
        if (listing.sellerId !== req.user.id) return res.status(403).json({ error: true, message: 'Forbidden' });

        const { title, description, price, type, rentPerDay, category, images, condition } = req.body;
        const updated = await prisma.marketplaceListing.update({
            where: { id: req.params.id },
            data: {
                ...(title && { title }),
                ...(description && { description }),
                ...(price !== undefined && { price: parseFloat(price) }),
                ...(type && { type }),
                ...(rentPerDay !== undefined && { rentPerDay: rentPerDay ? parseFloat(rentPerDay) : null }),
                ...(category && { category }),
                ...(images && { images }),
                ...(condition && { condition }),
            },
        });
        res.json({ success: true, data: updated });
    } catch (err) {
        next(err);
    }
};

// DELETE /api/marketplace/:id
const deleteListing = async (req, res, next) => {
    try {
        const listing = await prisma.marketplaceListing.findUnique({ where: { id: req.params.id } });
        if (!listing) return res.status(404).json({ error: true, message: 'Listing not found' });
        if (listing.sellerId !== req.user.id) return res.status(403).json({ error: true, message: 'Forbidden' });

        await prisma.marketplaceListing.delete({ where: { id: req.params.id } });
        res.json({ success: true, message: 'Listing deleted' });
    } catch (err) {
        next(err);
    }
};

// PUT /api/marketplace/:id/sold
const markAsSold = async (req, res, next) => {
    try {
        const listing = await prisma.marketplaceListing.findUnique({ where: { id: req.params.id } });
        if (!listing) return res.status(404).json({ error: true, message: 'Listing not found' });
        if (listing.sellerId !== req.user.id) return res.status(403).json({ error: true, message: 'Forbidden' });

        const updated = await prisma.marketplaceListing.update({
            where: { id: req.params.id },
            data: { isAvailable: false },
        });
        res.json({ success: true, data: updated });
    } catch (err) {
        next(err);
    }
};

// POST /api/marketplace/:id/chat - initiate chat with seller
const initiateChat = async (req, res, next) => {
    try {
        const listing = await prisma.marketplaceListing.findUnique({
            where: { id: req.params.id },
            include: { seller: { select: { id: true, name: true } } },
        });
        if (!listing) return res.status(404).json({ error: true, message: 'Listing not found' });
        if (listing.sellerId === req.user.id) {
            return res.status(400).json({ error: true, message: 'Cannot chat with yourself' });
        }

        const openingMessage = `Hi, I'm interested in "${listing.title}"`;
        const message = await prisma.message.create({
            data: {
                senderId: req.user.id,
                receiverId: listing.sellerId,
                content: openingMessage,
            },
            include: {
                sender: { select: { id: true, name: true, avatar: true } },
                receiver: { select: { id: true, name: true, avatar: true } },
            },
        });

        req.io?.to(listing.sellerId).emit('marketplace_inquiry', {
            from: req.user.name,
            item: listing.title,
        });

        await prisma.notification.create({
            data: {
                userId: listing.sellerId,
                type: 'marketplace_inquiry',
                message: `${req.user.name} is interested in your listing "${listing.title}"`,
            },
        });

        res.json({ success: true, data: { message, sellerId: listing.sellerId } });
    } catch (err) {
        next(err);
    }
};

// GET /api/marketplace/my - current user's listings
const getMyListings = async (req, res, next) => {
    try {
        const listings = await prisma.marketplaceListing.findMany({
            where: { sellerId: req.user.id },
            orderBy: { createdAt: 'desc' },
        });
        res.json({ success: true, data: listings });
    } catch (err) {
        next(err);
    }
};

module.exports = { getAllListings, createListing, getListingById, updateListing, deleteListing, markAsSold, initiateChat, getMyListings };
