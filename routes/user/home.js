const express = require("express");

const router = express.Router();
const homePageController = require("../../controllers/userSideProduct_controller");

// Get home page (product listing page)
router.get("/", homePageController.getHomePage);

// search product
router.get("/searchProduct", homePageController.productSearch);

module.exports = router;
