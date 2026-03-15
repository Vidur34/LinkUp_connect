const jwt = require('jsonwebtoken');
const prisma = require('../utils/prismaClient');

const authMiddleware = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: true, message: 'No token provided' });
        }

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const { userId, accountType } = decoded;

        if (accountType === 'organisation') {
            const org = await prisma.organisation.findUnique({
                where: { id: userId },
                select: {
                    id: true, name: true, email: true, description: true, category: true,
                    avatar: true, coverImage: true, followers: true, isVerified: true,
                    instagramHandle: true, websiteUrl: true, createdAt: true,
                },
            });
            if (!org) {
                return res.status(401).json({ error: true, message: 'Organisation not found' });
            }
            req.user = { ...org, accountType: 'organisation' };
        } else {
            const user = await prisma.user.findUnique({
                where: { id: userId },
                select: {
                    id: true, name: true, email: true, department: true, accountType: true,
                    year: true, skills: true, interests: true, bio: true,
                    avatar: true, networkingScore: true, isOpenToMentor: true,
                    mentorSkills: true, mentorBio: true, createdAt: true,
                },
            });
            if (!user) {
                return res.status(401).json({ error: true, message: 'User not found' });
            }
            req.user = user;
        }

        next();
    } catch (err) {
        if (err.name === 'JsonWebTokenError') {
            return res.status(401).json({ error: true, message: 'Invalid token' });
        }
        if (err.name === 'TokenExpiredError') {
            return res.status(401).json({ error: true, message: 'Token expired' });
        }
        next(err);
    }
};

module.exports = authMiddleware;
