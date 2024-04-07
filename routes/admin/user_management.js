const express = require("express");

const router = express.Router();
const adminLogoutChecker = require("../../middlewares/auth");
const userManagement = require("../../controllers/userManagement_controller");

router.get(
  "/user_management",
  adminLogoutChecker.adminLogoutCheck,
  userManagement.getUserManagement,
);

// block user
router.get("/block_user/:id", adminLogoutChecker.adminLogoutCheck, userManagement.blockUser);
// unBlock user
router.get("/unBlock_user/:id", adminLogoutChecker.adminLogoutCheck, userManagement.unBlockUser);

module.exports = router;
