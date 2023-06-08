const Booking = require("../models/bookingModel");
const Room = require("../models/roomModel");
const ErrorHandler = require("../utils/errorhandler.js");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");

exports.newBooking = catchAsyncErrors(async (req, res, next) => {
  const {
    hotelName,
    bookingId,
    roomNumber,
    buyerName,
    buyerPhoneNo,
    roomImg,
    category,
    startDate,
    endDate,
    totalPrice,
    stay,
    member,
    roomId,
    phoneNo,
    tnxId,
    paymentInfo,
  } = req.body;

  const booking = new Booking({
    userId: req.user._id,
    bookingId,
    hotelName,
    buyerName,
    buyerPhoneNo,
    roomId,
    roomImg,
    category,
    roomNumber,
    startDate,
    endDate,
    totalPrice,
    stay,
    member,
    phoneNo,
    tnxId,
    paymentInfo,
    paidAt: Date.now(),
  });

  await booking.save();

  res.status(201).json({
    success: true,
    booking,
  });
});

// Get single Booking
exports.getSingleBooking = catchAsyncErrors(async (req, res, next) => {
  const booking = await Booking.findById(req.params.id)
    .populate("user", "name email")
    .populate("room", "hotel");

  //   const bookingRoom = await Booking.findById(req.params.id).populate(
  //     "room",
  //     "roomNumber "
  //   );

  if (!booking) {
    return next(new ErrorHandler("Booking not found with this id", 404));
  }

  res.status(200).json({
    success: true,
    booking,
  });
});

// Get logged in user Booking
exports.myBookings = catchAsyncErrors(async (req, res, next) => {
  const bookings = await Booking.find({ userId: req.user._id });
  res.status(200).json({
    success: true,
    bookings,
  });
});

// Cancel Booking
exports.cancelBooking = catchAsyncErrors(async (req, res, next) => {
  const booking = await Booking.findById(req.params.id);

  if (!booking) {
    return res.status(404).json({ message: "Reservation not found" });
  }

  // Check if the user trying to cancel the booking is the same as the user who made the booking

  // if (booking.userId.toString() !== req.user._id.toString()) {
  //   return res
  //     .status(401)
  //     .json({ message: "You are not authorized to cancel this booking oh no" });
  // }

  // Remove the booking
  await booking.remove();

  res.status(200).json({
    success: true,
    message: "Reservation cancelled successfully",
  });
});

// Get ALL  Bookings
exports.getAllBookings = catchAsyncErrors(async (req, res, next) => {
  const bookings = await Booking.find();

  let totalPrice = 0;
  bookings.forEach((booking) => {
    totalPrice += booking.totalPrice;
  });

  res.status(200).json({
    success: true,
    totalPrice,
    bookings,
  });
});
