const Hotel = require("../models/hotelModel.js");
const Room = require("../models/roomModel.js");
const Booking = require("../models/bookingModel.js");
const ErrorHandler = require("../utils/errorhandler.js");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const ApiFeatures = require("../utils/apifeatures");
const cloudinary = require("cloudinary");

// Create Room --Admin
exports.createRoom = catchAsyncErrors(async (req, res, next) => {
  if (
    !req.body.roomNumber ||
    !req.body.description ||
    !req.body.price ||
    !req.body.amenities ||
    !req.body.category ||
    !req.body.capacities
  ) {
    return next(new ErrorHandler("Invalid inputs", 400));
  }

  function splitTrimFilter(input) {
    if (typeof input === "string") {
      return input
        .split(",")
        .map((item) => item.trim())
        .filter((item) => item !== "");
    }
    return input;
  }

  let facilities = splitTrimFilter(req.body.facilities);
  let amenities = splitTrimFilter(req.body.amenities);

  if (amenities.length == 0) {
    return next(new ErrorHandler("You must have at least one amenity", 404));
  }

  req.body.facilities = facilities;
  req.body.amenities = amenities;

  let images = [];
  if (typeof req.body.images === "string") {
    images.push(req.body.images);
  } else {
    images = req.body.images;
  }

  if (images === undefined) {
    return next(
      new ErrorHandler("You must have to upload at least one image", 404)
    );
  }

  const imagesLinks = [];

  for (let i = 0; i < images.length; i++) {
    const result = await cloudinary.v2.uploader.upload(images[i], {
      folder: "rooms",
    });

    imagesLinks.push({
      public_id: result.public_id,
      url: result.secure_url,
    });
  }

  req.body.images = imagesLinks;
  req.body.user = req.user.id;
  req.body.hotel = req.params.hotelId;

  const isHotel = await Hotel.findById(req.params.hotelId);

  if (!isHotel) {
    return next(new ErrorHandler("Hotel not found", 404));
  }

  const newRoom = await Room.create(req.body);

  // Add the new room ID to the corresponding hotel's rooms array
  await Hotel.findByIdAndUpdate(req.body.hotel, {
    $push: { rooms: newRoom._id },
  });

  res.status(201).json({
    success: true,
    room: newRoom,
  });
});

// Get All Rooms --Admin
exports.getAdminRoom = catchAsyncErrors(async (req, res) => {
  const roomCount = await Room.countDocuments();

  const rooms = await Room.find();

  res.status(200).json({
    success: true,
    roomCount,
    rooms,
  });
});

// Get Room details
exports.getRoomDetails = catchAsyncErrors(async (req, res, next) => {
  const room = await Room.findById(req.params.id).populate("hotel", "name ");

  if (!room) {
    return next(new ErrorHandler("Room not found", 404));
  }

  res.status(200).json({
    success: true,
    room,
  });
});

// Update Room --Admin
exports.updateRoom = catchAsyncErrors(async (req, res, next) => {
  let room = await Room.findById(req.params.id);

  if (!room) {
    return next(new ErrorHandler("Room not found", 404));
  }

  // Images Start Here

  let images = [];
  if (typeof req.body.images === "string") {
    images.push(req.body.images);
  } else {
    images = req.body.images;
  }

  if (images !== undefined) {
    const oldImages = room.images;
    const newImages = [];

    // Upload new images to Cloudinary
    for (let i = 0; i < images.length; i++) {
      const result = await cloudinary.v2.uploader.upload(images[i], {
        folder: "rooms",
      });

      newImages.push({
        public_id: result.public_id,
        url: result.secure_url,
      });
    }

    // Concatenate old and new images
    const updatedImages = oldImages.concat(newImages);
    req.body.images = updatedImages;
  }
  // End here

  // Split comma-separated string into array for facilities field
  function splitTrimFilter(input) {
    if (typeof input === "string") {
      return input
        .split(",")
        .map((item) => item.trim())
        .filter((item) => item !== "");
    }
    return input;
  }

  let facilities = splitTrimFilter(req.body.facilities);
  let amenities = splitTrimFilter(req.body.amenities);

  if (amenities.length == 0) {
    return next(
      new ErrorHandler("You must have to add at least one amenity", 404)
    );
  }

  req.body.facilities = facilities;
  req.body.amenities = amenities;

  room = await Room.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });

  res.status(200).json({
    success: true,
    room,
  });
});

// Delete Room --Admin
exports.deleteRoom = catchAsyncErrors(async (req, res, next) => {
  const room = await Room.findById(req.params.id);
  if (!room) {
    return next(new ErrorHandler("Room not found", 404));
  }
  // Deleting Images From Cloudinary
  for (let i = 0; i < room.images.length; i++) {
    await cloudinary.v2.uploader.destroy(room.images[i].public_id);
  }

  const hotelId = room.hotel;

  // Delete the room document from the database
  await Room.findByIdAndDelete(req.params.id);

  // Remove the room ID from the corresponding hotel's rooms array
  await Hotel.findByIdAndUpdate(hotelId, { $pull: { rooms: req.params.id } });

  res.status(200).json({
    success: true,
    message: "Room deleted successfully",
  });
});
