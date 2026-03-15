const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const prisma = require('../utils/prismaClient');

const generateToken = (id, accountType) => {
    return jwt.sign({ userId: id, accountType }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

// POST /api/auth/register
const register = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ error: true, message: errors.array()[0].msg });
        }

        const { name, email, password, department, year, skills, interests, bio, accountType,
            orgCategory, description, instagramHandle, websiteUrl } = req.body;

        const type = accountType === 'organisation' ? 'organisation' : 'student';

        if (type === 'organisation') {
            // Check both tables for email uniqueness
            const existingUser = await prisma.user.findUnique({ where: { email } });
            const existingOrg = await prisma.organisation.findUnique({ where: { email } });
            if (existingUser || existingOrg) {
                return res.status(409).json({ error: true, message: 'Email already registered' });
            }

            const hashed = await bcrypt.hash(password, 10);
            const org = await prisma.organisation.create({
                data: {
                    name,
                    email,
                    password: hashed,
                    category: orgCategory || 'Technical',
                    description: description || null,
                    instagramHandle: instagramHandle || null,
                    websiteUrl: websiteUrl || null,
                },
            });

            const token = generateToken(org.id, 'organisation');
            const { password: _, ...safeOrg } = org;
            return res.status(201).json({ success: true, data: { user: { ...safeOrg, accountType: 'organisation' }, token } });
        }

        // Student registration
        const existing = await prisma.user.findUnique({ where: { email } });
        if (existing) {
            return res.status(409).json({ error: true, message: 'Email already registered' });
        }

        const hashed = await bcrypt.hash(password, 10);
        const user = await prisma.user.create({
            data: {
                name,
                email,
                password: hashed,
                accountType: 'student',
                department: department || '',
                year: year ? parseInt(year) : 1,
                skills: skills || [],
                interests: interests || [],
                bio: bio || null,
            },
            select: {
                id: true, name: true, email: true, department: true, accountType: true,
                year: true, skills: true, interests: true, bio: true,
                avatar: true, networkingScore: true, createdAt: true,
            },
        });

        const token = generateToken(user.id, 'student');
        res.status(201).json({ success: true, data: { user, token } });
    } catch (err) {
        next(err);
    }
};

// POST /api/auth/login
const login = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ error: true, message: errors.array()[0].msg });
        }

        const { email, password, accountType } = req.body;
        const type = accountType === 'organisation' ? 'organisation' : 'student';

        if (type === 'organisation') {
            const org = await prisma.organisation.findUnique({ where: { email } });
            if (!org) {
                return res.status(401).json({ error: true, message: 'Invalid credentials' });
            }
            const valid = await bcrypt.compare(password, org.password);
            if (!valid) {
                return res.status(401).json({ error: true, message: 'Invalid credentials' });
            }
            const { password: _, ...safeOrg } = org;
            const token = generateToken(org.id, 'organisation');
            return res.json({ success: true, data: { user: { ...safeOrg, accountType: 'organisation' }, token } });
        }

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            return res.status(401).json({ error: true, message: 'Invalid credentials' });
        }

        const valid = await bcrypt.compare(password, user.password);
        if (!valid) {
            return res.status(401).json({ error: true, message: 'Invalid credentials' });
        }

        const { password: _, ...safeUser } = user;
        const token = generateToken(user.id, 'student');
        res.json({ success: true, data: { user: safeUser, token } });
    } catch (err) {
        next(err);
    }
};

// GET /api/auth/me
const getMe = async (req, res) => {
    res.json({ success: true, data: req.user });
};

// POST /api/auth/logout
const logout = (_req, res) => {
    res.json({ success: true, message: 'Logged out' });
};

module.exports = { register, login, getMe, logout };
