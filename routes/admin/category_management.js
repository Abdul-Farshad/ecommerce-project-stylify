const express = require("express");

const router = express.Router();
const sharp = require("sharp");
// eslint-disable-next-line import/no-extraneous-dependencies
const multer = require("multer");
const adminLogoutChecker = require("../../middlewares/auth");
const categoryController = require("../../controllers/categoryManagement_controller");
const processImage = require("../../middlewares/imageProcessing");

// setting destination for storing category image
const categoryStorage = multer.diskStorage({
  destination(req, file, cb) {
    return cb(null, "./public/uploads/categories");
  },
  filename(req, file, cb) {
    return cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage: categoryStorage });

router.get(
  "/category",
  adminLogoutChecker.adminLogoutCheck,
  categoryController.getCategory,
);

// add new category
router.post(
  "/addCategory",
  adminLogoutChecker.adminLogoutCheck,
  upload.single("image"),
  processImage,
  categoryController.addCategory,
);

// Get Edit category
router.get(
  "/category/edit_category/:id",
  adminLogoutChecker.adminLogoutCheck,
  categoryController.getEditCategory,
);

// patch Edit category
router.patch(
  "/category/edit_category/:id",
  upload.single("image"),
  processImage,
  adminLogoutChecker.adminLogoutCheck,
  categoryController.updateCategory,
);

// delete a category
router.get(
  "/deleteCategory/:id",
  adminLogoutChecker.adminLogoutCheck,
  categoryController.deleteCategory,
);
module.exports = router;
