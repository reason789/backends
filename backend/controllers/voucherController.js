const Voucher = require("../models/voucherModel.js");
const ErrorHandler = require("../utils/errorhandler.js");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");

// Create Voucher --Admin
exports.createVoucher = catchAsyncErrors(async (req, res, next) => {
  if (
    !req.body.name ||
    !req.body.code ||
    !req.body.amount ||
    !req.body.expireTime
  ) {
    return next(new ErrorHandler("Invalid inputs", 400));
  }

  const voucherCodeRegex = new RegExp(`^${req.body.code}$`, "i");

  const existingVoucher = await Voucher.findOne({ code: voucherCodeRegex });
  if (existingVoucher) {
    return next(new ErrorHandler("Voucher code already exists", 400));
  }

  req.body.user = req.user.id;

  if (!req.body.used.trim()) req.body.used = 0;

  const voucher = await Voucher.create(req.body);

  res.status(201).json({
    success: true,
    voucher,
  });
});

// Get All Rooms --Admin
exports.getAdminVouchers = catchAsyncErrors(async (req, res) => {
  const voucherCount = await Voucher.countDocuments();

  const vouchers = await Voucher.find();

  res.status(200).json({
    success: true,
    voucherCount,
    vouchers,
  });
});

// Get Avilable voucher
exports.getAvailableVouchers = catchAsyncErrors(async (req, res) => {
  const currentDate = new Date();

  const vouchers = await Voucher.find({
    expireTime: { $gte: currentDate.toISOString() },
  });

  const availableVouchers = vouchers.filter((voucher) => {
    const expireTime = new Date(voucher.expireTime);
    return expireTime >= currentDate;
  });

  res.status(200).json({
    success: true,
    vouchers: availableVouchers,
  });
});

// Delete Room --Admin
exports.deleteVoucher = catchAsyncErrors(async (req, res, next) => {
  const room = await Voucher.findById(req.params.id);
  if (!room) {
    return next(new ErrorHandler("Voucher not found", 404));
  }

  await Voucher.findByIdAndDelete(req.params.id);

  res.status(200).json({
    success: true,
    message: "Voucher deleted successfully",
  });
});

// Create Voucher --Admin
exports.applyVoucher = catchAsyncErrors(async (req, res, next) => {
  if (!req.body.code) {
    return next(new ErrorHandler("Invalid inputs", 400));
  }

  const { code } = req.body;

  const voucher = await Voucher.findOne({ code });
  if (!voucher) {
    return next(new ErrorHandler("Promo code not found", 400));
  }

  const currentDate = new Date();
  if (new Date(voucher.expireTime) < currentDate) {
    return next(new ErrorHandler("Promo code has expired", 400));
  }

  res.status(201).json({
    success: true,
    voucher,
  });
});
