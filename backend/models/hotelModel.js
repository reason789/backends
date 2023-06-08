const mongoose = require("mongoose");

const HotelSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please enter hotel name bro"],
    trim: true,
  },
  description: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  city: {
    type: String,
    required: true,
  },
  geoLocation: {
    latitude: { type: Number, decimal: true },
    longitude: { type: Number, decimal: true },
  },
  minPrice: {
    type: Number,
    required: true,
  },
  hotelType: {
    type: String,
    required: [true, "Please enter hotel type"],
  },
  amenities: {
    type: [String],
    required: true,
  },
  facilities: {
    type: [String],
    default: [],
    // required: true,
  },
  images: [
    {
      public_id: {
        type: String,
        required: true,
      },
      url: {
        type: String,
        required: true,
      },
    },
  ],

  ratings: {
    type: Number,
    decimal: true,
    default: 0,
  },
  fetured: {
    type: Boolean,
    reuired: true,
    default: false,
  },
  rooms: [
    {
      type: mongoose.Schema.ObjectId,
      ref: "Room",
    },
  ],
  reviews: [
    {
      userId: {
        type: mongoose.Schema.ObjectId,
        ref: "User",
        required: true,
      },
      hotelId: {
        type: mongoose.Schema.ObjectId,
        ref: "Hotel",
        required: true,
      },
      hotelName: {
        type: String,
        required: true,
      },
      name: {
        type: String,
        required: true,
      },
      rating: {
        type: Number,
        required: true,
      },
      comment: {
        type: String,
        required: true,
      },
    },
  ],
  numOfReviews: {
    type: Number,
    default: 0,
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Hotel", HotelSchema);
