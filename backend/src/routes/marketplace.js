const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const {
    getAllListings, createListing, getListingById,
    updateListing, deleteListing, markAsSold, initiateChat, getMyListings
} = require('../controllers/marketplaceController');

const router = express.Router();

router.get('/', getAllListings);
router.get('/my', authMiddleware, getMyListings);
router.get('/:id', getListingById);
router.post('/', authMiddleware, createListing);
router.put('/:id', authMiddleware, updateListing);
router.delete('/:id', authMiddleware, deleteListing);
router.post('/:id/chat', authMiddleware, initiateChat);
router.put('/:id/sold', authMiddleware, markAsSold);

module.exports = router;
