const prisma = require('../utils/prismaClient');

// Middleware: only allows verified organisations (followers >= 100)
const isVerifiedOrg = async (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ error: true, message: 'Unauthorized' });
    }
    if (req.user.accountType !== 'organisation') {
        return res.status(403).json({ error: true, message: 'Organisation account required' });
    }
    const org = await prisma.organisation.findUnique({ where: { id: req.user.id } });
    if (!org || !org.isVerified) {
        return res.status(403).json({ error: true, message: 'Only verified organisations (100+ followers) can perform this action' });
    }
    next();
};

module.exports = isVerifiedOrg;
