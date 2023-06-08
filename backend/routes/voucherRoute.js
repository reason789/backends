const express = require("express");
const {
  createVoucher,
  getAdminVouchers,
  getAvailableVouchers,
  deleteVoucher,
  applyVoucher,
} = require("../controllers/voucherController");
const { isAuthenticatedUser, authorizeRoles } = require("../middleware/auth");

const router = express.Router();

router
  .route("/admin/vouchers")
  .get(isAuthenticatedUser, authorizeRoles("admin"), getAdminVouchers);
router.route("/avialable-vouchers").get(getAvailableVouchers);
router.route("/apply-voucher").post(applyVoucher);

router
  .route("/admin/voucher/new")
  .post(isAuthenticatedUser, authorizeRoles("admin"), createVoucher);

router
  .route("/admin/voucher/:id")
  .delete(isAuthenticatedUser, authorizeRoles("admin"), deleteVoucher);

module.exports = router;
