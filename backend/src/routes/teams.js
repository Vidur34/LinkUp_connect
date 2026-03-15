const express = require('express');
const { getAllTeams, createTeam, getTeamById, joinTeam, leaveTeam, getTeamSuggestions } = require('../controllers/teamController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();
router.use(authMiddleware);

router.get('/suggestions', getTeamSuggestions);
router.get('/', getAllTeams);
router.post('/', createTeam);
router.get('/:id', getTeamById);
router.post('/:id/join', joinTeam);
router.delete('/:id/leave', leaveTeam);

module.exports = router;
