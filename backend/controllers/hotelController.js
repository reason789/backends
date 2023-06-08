const Hotel = require("../models/hotelModel.js");
const Room = require("../models/roomModel.js");
const Booking = require("../models/bookingModel.js");
const ErrorHandler = require("../utils/errorhandler.js");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const ApiFeatures = require("../utils/apifeatures");
const cloudinary = require("cloudinary");

// Create Hotel --Admin
exports.createHotel = catchAsyncErrors(async (req, res, next) => {
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
    return next(new ErrorHandler("You must have at least one amenity", 404));
  }

  req.body.facilities = facilities;
  req.body.amenities = amenities;
  req.body.user = req.user.id;

  // convert stringify geolocation into object
  const strGeoLocation = req.body.geoLocation;
  req.body.geoLocation = JSON.parse(strGeoLocation);

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
      folder: "hotels",
    });

    imagesLinks.push({
      public_id: result.public_id,
      url: result.secure_url,
    });
  }
  req.body.images = imagesLinks;

  const hotel = await Hotel.create(req.body);

  res.status(201).json({
    success: true,
    hotel,
  });
});

// Get All Hotels
exports.getAllHotels = catchAsyncErrors(async (req, res) => {
  // const hotelCount = await Hotel.countDocuments();

  const allHotels = await Hotel.find();

  const apiFeatures = new ApiFeatures(Hotel.find(), req.query)
    .search()
    .filter();

  const hotels = await apiFeatures.query.populate("rooms", "capacities");

  const cap = Number(req.query.cap) || 1;
  const checkIn = req.query.startDate;
  const checkOut = req.query.endDate;
  const bookingsData = await Booking.find();

  const filteredHotels = hotels?.filter((hotel) => {
    const availableRooms = hotel.rooms.filter((room) => {
      // Find all bookings for this room
      const bookings = bookingsData.filter(
        (booking) => booking.roomId.toString() === room._id.toString()
      );

      // Extract the booking ranges
      const bookingRanges = bookings.map((booking) => {
        const startDate = new Date(booking.startDate);
        startDate.setDate(startDate.getDate() - 1);

        return {
          start: startDate,
          end: new Date(booking.endDate),
        };
      });

      const requestedRange = {
        start: new Date(checkIn),
        end: new Date(checkOut),
      };

      const hasOverlap = bookingRanges.some(
        (range) =>
          range.start < requestedRange.end && range.end > requestedRange.start
      );

      return !hasOverlap;
    });

    const hasCapacity =
      availableRooms.length > 0 &&
      availableRooms.some((room) => room.capacities >= cap);

    return hasCapacity;
  });

  /////// >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

  const hotelCount = filteredHotels.length;

  res.status(200).json({
    success: true,
    hotelCount,
    allHotels: allHotels,
    hotels: filteredHotels,
  });
});

// Get Hotel Details
exports.getHotelDetails = catchAsyncErrors(async (req, res, next) => {
  let hotel = await Hotel.findById(req.params.id).populate("rooms", "");

  if (!hotel) {
    return next(new ErrorHandler("Hotel not found", 404));
  }

  res.status(200).json({
    success: true,
    hotel,
  });
});

// Update Hotel --Admin
exports.updateHotel = catchAsyncErrors(async (req, res, next) => {
  let hotel = await Hotel.findById(req.params.id);
  if (!hotel) {
    return next(new ErrorHandler("Hotel not found", 404));
  }

  let images = [];
  if (typeof req.body.images === "string") {
    images.push(req.body.images);
  } else {
    images = req.body.images;
  }

  if (images !== undefined) {
    const oldImages = hotel.images;
    const newImages = [];

    // Upload new images to Cloudinary
    for (let i = 0; i < images.length; i++) {
      const result = await cloudinary.v2.uploader.upload(images[i], {
        folder: "hotels",
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

  // Update hotel document with other fields
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
  // req.body.images = updatedImages;

  // convert stringify geolocation into object
  const strGeoLocation = req.body.geoLocation;
  req.body.geoLocation = JSON.parse(strGeoLocation);

  hotel = await Hotel.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });

  res.status(200).json({
    success: true,
    hotel,
  });
});

// Delete Hotel --Admin
exports.deleteHotel = catchAsyncErrors(async (req, res, next) => {
  let hotel = await Hotel.findById(req.params.id);

  if (!hotel) {
    return next(new ErrorHandler("Hotel not found", 404));
  }

  // Deleting Images From Cloudinary
  for (let i = 0; i < hotel.images.length; i++) {
    await cloudinary.v2.uploader.destroy(hotel.images[i].public_id);
  }

  // Delete the hotel from the database
  await Hotel.findByIdAndDelete(req.params.id);

  // Delete all the rooms associated with the hotel from the database
  await Room.deleteMany({ hotel: req.params.id });

  // await hotel.remove();
  res.status(200).json({
    success: true,
    message: "Hotel deleted successfully",
  });
});

// Get All Hotel (Admin)
exports.getAdminHotels = catchAsyncErrors(async (req, res, next) => {
  const apiFeature = new ApiFeatures(Hotel.find(), req.query).search();

  const hotels = await apiFeature.query;

  res.status(200).json({
    success: true,
    hotels,
  });
});

///////////////////////////////////////////////////////////////////// Review

// Create New Review or Update the review
exports.createHotelReview = catchAsyncErrors(async (req, res, next) => {
  const { rating, comment, hotelId } = req.body;

  const hotel = await Hotel.findById(hotelId);

  const hotelName = hotel.name;
  const review = {
    userId: req.user._id,
    hotelId: hotelId,
    hotelName: hotelName,
    name: req.user.name,
    rating: Number(rating),
    comment,
  };

  const isReviewed = hotel.reviews.find(
    (rev) => rev.userId.toString() === req.user._id.toString()
  );

  if (isReviewed) {
    hotel.reviews.forEach((rev) => {
      if (rev.userId.toString() === req.user._id.toString())
        (rev.rating = rating), (rev.comment = comment);
    });
  } else {
    hotel.reviews.push(review);
    hotel.numOfReviews = hotel.reviews.length;
  }

  let avg = 0;

  hotel.reviews.forEach((rev) => {
    avg += rev.rating;
  });

  hotel.ratings = avg / hotel.reviews.length;

  await hotel.save({ validateBeforeSave: false });

  res.status(200).json({
    success: true,
  });
});

// Get All Reviews of a Hotel
exports.getHotelReviews = catchAsyncErrors(async (req, res, next) => {
  const hotel = await Hotel.findById(req.query.id);

  if (!hotel) {
    return next(new ErrorHandler("Hotel not found", 404));
  }

  res.status(200).json({
    success: true,
    reviews: hotel.reviews,
  });
});

// Delete Review
exports.deleteReview = catchAsyncErrors(async (req, res, next) => {
  const hotel = await Hotel.findById(req.query.hotelId);

  if (!hotel) {
    return next(new ErrorHandler("Hotel not found", 404));
  }

  const reviews = hotel.reviews.filter(
    (rev) => rev._id.toString() !== req.query.id.toString()
  );

  let avg = 0;

  reviews.forEach((rev) => {
    avg += rev.rating;
  });

  let ratings = 0;

  if (reviews.length === 0) {
    ratings = 0;
  } else {
    ratings = avg / reviews.length;
  }

  const numOfReviews = reviews.length;

  await Hotel.findByIdAndUpdate(
    req.query.hotelId,
    {
      reviews,
      ratings,
      numOfReviews,
    },
    {
      new: true,
      runValidators: true,
      useFindAndModify: false,
    }
  );

  res.status(200).json({
    success: true,
  });
});

// Delte Image
exports.deleteImage = catchAsyncErrors(async (req, res, next) => {
  const { hotelId, imageIndex } = req.params;

  const hotel = await Hotel.findById(hotelId);

  // Check if the hotel exists
  if (!hotel) {
    return next(new ErrorHandler("Hotel not found", 404));
  }

  const oldImages = hotel.images;

  // Check if the image index is valid
  if (imageIndex < 0 || imageIndex >= oldImages.length) {
    return next(new ErrorHandler("Invalid image index", 400));
  }

  const imageToDelete = oldImages[imageIndex];

  try {
    // Delete the image from Cloudinary
    await cloudinary.v2.uploader.destroy(imageToDelete.public_id);

    // Remove the image from the oldImages array
    oldImages.splice(imageIndex, 1);

    // Save the updated oldImages array for the hotel
    await hotel.save();

    res.status(200).json({
      success: true,
      message: "Image deleted successfully",
    });
  } catch (error) {
    return next(new ErrorHandler("Error deleting image", 500));
  }
});
