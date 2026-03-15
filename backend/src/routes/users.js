const express = require('express');
const {
    getAllUsers, getUserById, updateUser, getUserConnections,
    sendConnectionRequest, acceptConnection, rejectConnection, getLeaderboard,
} = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.use(authMiddleware);

router.get('/leaderboard', getLeaderboard);
router.get('/', getAllUsers);
router.get('/:id', getUserById);
router.put('/:id', updateUser);
router.get('/:id/connections', getUserConnections);
router.post('/connect/:id', sendConnectionRequest);
router.put('/connect/:id/accept', acceptConnection);
router.put('/connect/:id/reject', rejectConnection);

module.exports = router;
