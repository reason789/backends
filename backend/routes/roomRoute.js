const express = require("express");
const {
  getAdminRoom,
  createRoom,
  updateRoom,
  deleteRoom,
  getRoomDetails,
  // getAvailableRooms,
} = require("../controllers/roomController");
const { isAuthenticatedUser, authorizeRoles } = require("../middleware/auth");

const router = express.Router();

// router.route("/rooms").get(getAvailableRooms);
router.route("/room/:id").get(getRoomDetails);

router
  .route("/admin/:hotelId/room/new")
  .post(isAuthenticatedUser, authorizeRoles("admin"), createRoom);

router
  .route("/admin/room/:id")
  .delete(isAuthenticatedUser, authorizeRoles("admin"), deleteRoom)
  .put(isAuthenticatedUser, authorizeRoles("admin"), updateRoom);

router
  .route("/admin/rooms")
  .get(isAuthenticatedUser, authorizeRoles("admin"), getAdminRoom);

module.exports = router;
