const express = require("express");
const {
  newBooking,
  getSingleBooking,
  myBookings,
  getAllBookings,
  cancelBooking,
} = require("../controllers/bookingController");
const router = express.Router();
const { isAuthenticatedUser, authorizeRoles } = require("../middleware/auth");

router.route("/booking/new").post(isAuthenticatedUser, newBooking);

router.route("/booking/:id").get(isAuthenticatedUser, getSingleBooking);

router.route("/bookings/me").get(isAuthenticatedUser, myBookings);

router
  .route("/booking/cancel/:id")
  .delete(isAuthenticatedUser, authorizeRoles("admin"), cancelBooking);

//  Admin Route
router.route("/admin/bookings").get(getAllBookings);

module.exports = router;
