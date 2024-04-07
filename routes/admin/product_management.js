const express = require("express");
const multer = require("multer");
const sharp = require("sharp");

const router = express.Router();
const { adminLogoutCheck } = require("../../middlewares/auth");
const productManagement = require("../../controllers/productManagement_controller");
const processImage = require("../../middlewares/imageProcessing");

const productStorage = multer.diskStorage({
  destination(req, file, cb) {
    return cb(null, "./public/uploads/products");
  },
  filename(req, file, cb) {
    return cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage: productStorage });

// getting product management page
router.get(
  "/product_management",
  adminLogoutCheck,
  productManagement.getProductManagement
);

// getting add product page router
router.get(
  "/product_management/add_product",
  adminLogoutCheck,
  productManagement.getAddProduct
);

// adding new product
router.post(
  "/product_management/add_product",
  adminLogoutCheck,
  upload.array("images", 5),
  processImage,
  productManagement.addProduct
);

// Get Edit product router
router.get(
  "/product_management/editProduct/:id",
  adminLogoutCheck,
  productManagement.getEditProduct
);

// update product details after editing
router.patch(
  "/product_management/editProduct/:id",
  adminLogoutCheck,
  upload.array("images", 5),
  processImage,
  productManagement.editProduct
);

// Delete product image from existing product data
router.delete(
  "/product_management/editProduct/:productId/deleteImage/:imageIndex",
  adminLogoutCheck,
  productManagement.deleteProductImage
);
// soft delete product (active / de-active)
router.get(
  "/product_management/softDelete/:id",
  adminLogoutCheck,
  productManagement.softDelete
);
// delete product router
router.get(
  "/deleteProduct/:id",
  adminLogoutCheck,
  productManagement.deleteProduct
);
module.exports = router;
