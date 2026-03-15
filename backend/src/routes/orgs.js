const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const isOrganisation = require('../middleware/isOrganisation');
const { getAllOrgs, getOrgById, updateOrg, toggleFollow, getOrgFollowers, getFollowedOrgs } = require('../controllers/orgController');

const router = express.Router();

router.get('/', getAllOrgs);
router.get('/followed', authMiddleware, getFollowedOrgs);
router.get('/:id', authMiddleware, getOrgById);
router.put('/:id', authMiddleware, isOrganisation, updateOrg);
router.post('/:id/follow', authMiddleware, toggleFollow);
router.get('/:id/followers', authMiddleware, getOrgFollowers);

module.exports = router;
