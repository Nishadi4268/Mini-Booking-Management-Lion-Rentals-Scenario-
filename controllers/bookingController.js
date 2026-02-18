const bookingService = require('../services/bookingService');

exports.createBooking = async (req, res) => {
  try {
    const result = await bookingService.createBooking(req.body);
    res.status(201).json(result);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.listBookings = async (req, res) => {
  try {
    const result = await bookingService.listBookings(req.query);
    res.json(result);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.updateStatus = async (req, res) => {
  try {
    const result = await bookingService.updateStatus(req.params.id, req.body.status);
    res.json(result);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
