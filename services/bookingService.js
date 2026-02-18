const Booking = require('../models/Booking');
const Log = require('../models/Log');

exports.createBooking = async (data) => {
  const { customerName, vehicleId, startDate, endDate, dailyRate } = data;

  if (!customerName || !vehicleId || !startDate || !endDate || !dailyRate) {
    throw new Error('Missing required fields');
  }

  if (dailyRate <= 0) {
    throw new Error('dailyRate must be positive');
  }

  const sDate = new Date(startDate);
  const eDate = new Date(endDate);

  if (eDate <= sDate) {
    throw new Error('endDate must be after startDate');
  }

  const overlap = await Booking.findOne({
    vehicleId,
    $or: [
      { startDate: { $lte: eDate }, endDate: { $gte: sDate } }
    ]
  });

  if (overlap) {
    throw new Error('Booking overlaps with existing booking');
  }

  const totalDays = Math.ceil((eDate - sDate) / (1000 * 60 * 60 * 24));
  const totalAmount = totalDays * dailyRate;

  const booking = await Booking.create({
    customerName,
    vehicleId,
    startDate: sDate,
    endDate: eDate,
    dailyRate,
    totalAmount
  });

  await Log.create({
    action: 'BOOKING_CREATED',
    bookingId: booking._id
  });

  return booking;
};

exports.listBookings = async (query) => {
  const { page = 1, limit = 10, vehicleId, status, fromDate, toDate } = query;

  const filter = {};

  if (vehicleId) filter.vehicleId = vehicleId;
  if (status) filter.status = status;

  if (fromDate || toDate) {
    filter.startDate = {};
    if (fromDate) filter.startDate.$gte = new Date(fromDate);
    if (toDate) filter.startDate.$lte = new Date(toDate);
  }

  const bookings = await Booking.find(filter)
    .skip((page - 1) * limit)
    .limit(Number(limit));

  return bookings;
};

exports.updateStatus = async (id, status) => {
  if (!['confirmed'].includes(status)) {
    throw new Error('Invalid status change');
  }

  const booking = await Booking.findById(id);

  if (!booking) {
    throw new Error('Booking not found');
  }

  if (booking.status === 'confirmed') {
    throw new Error('Already confirmed');
  }

  booking.status = 'confirmed';
  await booking.save();

  await Log.create({
    action: 'STATUS_UPDATED',
    bookingId: booking._id
  });

  return booking;
};
