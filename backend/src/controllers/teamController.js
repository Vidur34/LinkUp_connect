const prisma = require('../utils/prismaClient');

const userSelect = { id: true, name: true, avatar: true, department: true, skills: true };

// GET /api/teams
const getAllTeams = async (req, res, next) => {
    try {
        const teams = await prisma.team.findMany({
            orderBy: { createdAt: 'desc' },
            include: {
                creator: { select: userSelect },
                members: { include: { user: { select: userSelect } } },
                _count: { select: { members: true } },
            },
        });
        res.json({ success: true, data: teams });
    } catch (err) {
        next(err);
    }
};

// POST /api/teams
const createTeam = async (req, res, next) => {
    try {
        const { name, description, rolesNeeded, maxSize } = req.body;
        const team = await prisma.team.create({
            data: {
                name, description,
                rolesNeeded: rolesNeeded || [],
                maxSize: parseInt(maxSize),
                creatorId: req.user.id,
            },
            include: {
                creator: { select: userSelect },
                members: true,
            },
        });

        // Creator auto-joins as lead
        await prisma.teamMember.create({
            data: { teamId: team.id, userId: req.user.id, role: 'Lead' },
        });

        // Award score for posting a team
        await prisma.user.update({
            where: { id: req.user.id },
            data: { networkingScore: { increment: 25 } },
        });

        res.status(201).json({ success: true, data: team });
    } catch (err) {
        next(err);
    }
};

// GET /api/teams/:id
const getTeamById = async (req, res, next) => {
    try {
        const team = await prisma.team.findUnique({
            where: { id: req.params.id },
            include: {
                creator: { select: userSelect },
                members: { include: { user: { select: userSelect } } },
            },
        });
        if (!team) return res.status(404).json({ error: true, message: 'Team not found' });
        res.json({ success: true, data: team });
    } catch (err) {
        next(err);
    }
};

// POST /api/teams/:id/join
const joinTeam = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const teamId = req.params.id;
        const { role } = req.body;

        const team = await prisma.team.findUnique({
            where: { id: teamId },
            include: { _count: { select: { members: true } } },
        });
        if (!team) return res.status(404).json({ error: true, message: 'Team not found' });

        if (team._count.members >= team.maxSize) {
            return res.status(400).json({ error: true, message: 'Team is full' });
        }

        const member = await prisma.teamMember.create({
            data: { teamId, userId, role: role || 'Member' },
        });

        // Award score
        await prisma.user.update({
            where: { id: userId },
            data: { networkingScore: { increment: 20 } },
        });

        // Notify team creator
        const notification = await prisma.notification.create({
            data: {
                userId: team.creatorId,
                type: 'team_join',
                message: `${req.user.name} joined your team "${team.name}"`,
            },
        });
        req.io?.to(team.creatorId).emit('notification', notification);

        res.status(201).json({ success: true, data: member });
    } catch (err) {
        if (err.code === 'P2002') {
            return res.status(409).json({ error: true, message: 'Already in this team' });
        }
        next(err);
    }
};

// DELETE /api/teams/:id/leave
const leaveTeam = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const teamId = req.params.id;

        const member = await prisma.teamMember.findUnique({
            where: { teamId_userId: { teamId, userId } },
        });
        if (!member) return res.status(404).json({ error: true, message: 'Not a member of this team' });

        await prisma.teamMember.delete({ where: { teamId_userId: { teamId, userId } } });

        await prisma.user.update({
            where: { id: userId },
            data: { networkingScore: { decrement: 20 } },
        });

        res.json({ success: true, message: 'Left team' });
    } catch (err) {
        next(err);
    }
};

// GET /api/teams/suggestions
const getTeamSuggestions = async (req, res, next) => {
    try {
        const userSkills = req.user.skills || [];
        const teams = await prisma.team.findMany({
            include: {
                creator: { select: userSelect },
                members: { include: { user: { select: userSelect } } },
                _count: { select: { members: true } },
            },
        });

        // Score teams by matching roles/needed skills with user's skills
        const scored = teams
            .filter(t => !t.members.some(m => m.userId === req.user.id))
            .filter(t => t._count.members < t.maxSize)
            .map(t => {
                const matchCount = t.rolesNeeded.filter(r =>
                    userSkills.some(s => r.toLowerCase().includes(s.toLowerCase()) || s.toLowerCase().includes(r.toLowerCase()))
                ).length;
                return { ...t, matchScore: matchCount };
            })
            .sort((a, b) => b.matchScore - a.matchScore)
            .slice(0, 10);

        res.json({ success: true, data: scored });
    } catch (err) {
        next(err);
    }
};

module.exports = { getAllTeams, createTeam, getTeamById, joinTeam, leaveTeam, getTeamSuggestions };
