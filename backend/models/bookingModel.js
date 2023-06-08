const mongoose = require("mongoose");

const BookingSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: true,
  },
  bookingId: {
    type: String,
    required: true,
  },

  // hotelId: {
  //   type: mongoose.Schema.ObjectId,
  //   ref: "Hotel",
  //   required: true,
  // },
  roomId: {
    type: mongoose.Schema.ObjectId,
    ref: "Room",
    required: true,
  },
  hotelName: {
    type: String,
    // required: true,
  },
  buyerName: {
    type: String,
    required: true,
  },
  buyerPhoneNo: {
    type: String,
    required: true,
  },
  roomNumber: {
    type: Number,
    // required: true,
  },
  roomImg: {
    type: String,
    // required: true,
  },
  category: {
    type: String,
    // required: true,
  },
  stay: {
    type: Number,
    // required: true,
  },
  member: {
    type: Number,
    // required: true,
  },
  startDate: {
    type: Date,
    // required: true,
  },
  endDate: {
    type: Date,
    // required: true,
  },

  paymentInfo: {
    id: {
      type: String,
      // required: true,
    },
    status: {
      type: String,
      // required: true,
    },
  },
  paidAt: {
    type: Date,
    required: true,
  },

  totalPrice: {
    type: Number,
    required: true,
    default: 0,
  },

  phoneNo: {
    type: Number,
    // required: true,
  },

  tnxId: {
    type: String,
    // required: true,
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Booking", BookingSchema);
