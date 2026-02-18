const express = require('express');
const router = express.Router();

const {
  createBooking,
  listBookings,
  updateStatus
} = require('../controllers/bookingController');

router.post('/bookings', createBooking);
router.get('/bookings', listBookings);
router.put('/bookings/:id/status', updateStatus);

module.exports = router;
