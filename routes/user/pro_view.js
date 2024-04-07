const express = require("express");

const router = express.Router();

const homePageController = require("../../controllers/userSideProduct_controller");
const { userLoginCheck } = require("../../middlewares/auth");
// Get product details
router.get("/view/:id", homePageController.productView);

// Wishlist management (add or remove)
router.post("/view/wishlist_management", userLoginCheck, homePageController.wishlistManage);
module.exports = router;
