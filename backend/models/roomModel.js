const mongoose = require("mongoose");

const RoomSchema = new mongoose.Schema({
  hotel: {
    type: mongoose.Schema.ObjectId,
    ref: "Hotel",
    required: true,
  },
  roomNumber: {
    type: Number,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  capacities: {
    type: Number,
    required: true,
  },
  amenities: {
    type: [String],
    required: true,
  },
  facilities: {
    type: [String],
  },
  category: {
    type: String,
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

  bookings: [
    {
      startDate: {
        type: Date,
      },
      endDate: {
        type: Date,
      },
    },
  ],

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

module.exports = mongoose.model("Room", RoomSchema);
