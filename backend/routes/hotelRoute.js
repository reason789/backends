const express = require("express");
const {
  getAllHotels,
  deleteImage,
  createHotel,
  updateHotel,
  deleteHotel,
  getHotelDetails,
  getAdminHotels,
  createHotelReview,
  getHotelReviews,
  deleteReview,
} = require("../controllers/hotelController");
const { isAuthenticatedUser, authorizeRoles } = require("../middleware/auth");

const router = express.Router();

router.route("/hotels").get(getAllHotels);
router
  .route("/admin/hotels")
  .get(isAuthenticatedUser, authorizeRoles("admin"), getAdminHotels);

router
  .route("/admin/hotel/new")
  .post(isAuthenticatedUser, authorizeRoles("admin"), createHotel);

router
  .route("/admin/hotel/:id")
  .put(isAuthenticatedUser, authorizeRoles("admin"), updateHotel)
  .delete(isAuthenticatedUser, authorizeRoles("admin"), deleteHotel);

router.route("/hotel/:id").get(getHotelDetails);
router.route("/admin/hotel/:hotelId/:imageIndex").delete(deleteImage);

// Review
router.route("/hotel/review").put(isAuthenticatedUser, createHotelReview);

router
  .route("/hotel/reviews")
  .get(getHotelReviews)
  .delete(isAuthenticatedUser, authorizeRoles("admin"), deleteReview);

module.exports = router;
