const express = require("express");

const router = express.Router();
const nocache = require("nocache");

const adminLoginCheck = require("../../middlewares/auth"); // login checing middleware
const adminsignin = require("../../controllers/adminSignin_controller");

// Get home page (product listing page)
router.get("/admin_signin", adminLoginCheck.adminLoginCheck, nocache(), adminsignin.getAdminLogin);
router.post("/admin_login", adminsignin.AdminLoginLoginvalidation);
module.exports = router;
