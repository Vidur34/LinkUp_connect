const express = require('express');
const { getAllEvents, createEvent, getEventById, joinEvent, leaveEvent } = require('../controllers/eventController');
const { getEventReviews, submitReview, updateReview, deleteReview, markHelpful } = require('../controllers/reviewController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();
router.use(authMiddleware);

router.get('/', getAllEvents);
router.post('/', createEvent);
router.get('/:id', getEventById);
router.post('/:id/join', joinEvent);
router.delete('/:id/leave', leaveEvent);

// Reviews
router.get('/:id/reviews', getEventReviews);
router.post('/:id/reviews', submitReview);
router.put('/:id/reviews/:reviewId', updateReview);
router.delete('/:id/reviews/:reviewId', deleteReview);
router.post('/:id/reviews/:reviewId/helpful', markHelpful);

module.exports = router;
