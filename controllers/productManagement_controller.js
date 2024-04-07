const sharp = require("sharp");
const Product = require("../models/product");
const Category = require("../models/category");

// Get products management page
const getProductManagement = async (req, res) => {
  try {
    const page = req.query.page || 1;
    const limit = 5;
    const products = await Product.find()
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .exec();
    const count = await Product.countDocuments();
    const pages = [];
    const totalPage = Math.ceil(count / limit);
    // eslint-disable-next-line no-plusplus
    for (let i = 1; i <= totalPage; i++) {
      pages.push(i);
    }
    const dpImages = products.map((product) => product.images[0]);

    res.render("product_management", {
      title: "Product management",
      products,
      dpImages,
      pages,
    });
  } catch (err) {
    console.error("rendering product management Error:", err);
  }
};

const getAddProduct = async (req, res) => {
  try {
    // passing categories for select when add new product
    const categories = await Category.find();
    res.render("add_product", { title: "Add product", categories });
  } catch (err) {
    console.err("rendering add product page error:", err);
  }
};

// add new product
const addProduct = async (req, res) => {
  try {
    console.log("reached in back end addProduct router");
    console.log("forData", req.body);
    console.log(req.files);

    const formData = JSON.parse(req.body.formData);
    const {
      name,
      category,
      regularPrice,
      price,
      discountAmount,
      discountPercentage,
      description,
      stock,
    } = formData;

    // Use processed image paths from req.files
    const imagePaths = req.files.map((file) => file.path);

    // Construct the product object
    const data = {
      category,
      name,
      description: formData.description || null,
      images: imagePaths,
      regularPrice: formData.regularPrice || null,
      price,
      discount: discountAmount || 0,
      stock,
    };

    // Check for existing product
    const existingProduct = await Product.findOne({ name: data.name });
    if (existingProduct) {
      console.log("Product already exists with this name");
      return res.status(400).json({ error: "Product already exists" });
    }

    // Create new product
    const newProduct = await Product.create(data);
    return res
      .status(200)
      .json({ message: "Product added successfully", product: newProduct });
  } catch (err) {
    console.error("New product uploading error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// Get Edit product page
const getEditProduct = async (req, res) => {
  try {
    if (req.params.id) {
      const proId = req.params.id;
      const product = await Product.findOne({ _id: proId }).populate(
        "category",
        "name"
      );
      const categories = await Category.find({}, { name: 1 }).lean();
      if (product) {
        res.render("edit_product", {
          title: "Edit Product",
          product,
          categories,
        });
      } else {
        throw new Error("product not found in database for editing");
      }
    } else {
      throw new Error("product id not received for editing");
    }
  } catch (err) {
    console.error("product editing error:", err.message);
  }
};

// Delete existing product image
const deleteProductImage = async (req, res) => {
  console.log("reached delete product image route");
  const { productId, imageIndex } = req.params;
  try {
    if (!productId) {
      return res.status(404).json({ error: "couldn't find product Id" });
    }
    if (!imageIndex) {
      return res.status(404).json({ error: "couldn't find image index" });
    }
    console.log("pro Id ", productId);
    console.log("img index", imageIndex);
    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    // Remove the image at the specified index from the images array
    product.images.splice(imageIndex, 1);
    await product.save();
    console.log("success");
    return res.status(200).json({ message: "Image deleted successfully" });
  } catch (err) {
    console.error("existing product image deletion error: ", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};
// Update product after edit product details
const editProduct = async (req, res) => {
  try {
    console.log("reached at product update router");
    console.log("forData", req.body);
    console.log(req.files);

    const proId = req.params.id;
    const formData = JSON.parse(req.body.formData);

    const {
      name,
      category,
      regularPrice,
      price,
      discountAmount,
      description,
      stock,
    } = formData;

    // Use processed image paths from req.files
    const imagePaths = req.files.map((file) => file.path);

    // Construct the product object
    const updatedData = {
      category,
      name,
      description,
      images: imagePaths,
      regularPrice,
      price,
      discount: discountAmount,
      stock,
    };
    console.log("this is the data for update ", updatedData);

    const existingProduct = await Product.findById({ _id: proId });
    if (existingProduct) {
      const { images, ...otherData } = updatedData;
      Object.assign(existingProduct, otherData);

      // pushing image to existing images array if there is new image
      if (images) {
        existingProduct.images.push(...images);
      }
      // saving update
      await existingProduct.save();
      console.log("product updated successfully");
      return res.status(200).json({ message: "Product updated successfully" });
    }
    console.error("couldn't find the product for update the edit with the _id");
    res.status(400).json({ error: "product not found for update the edit" });
  } catch (err) {
    console.error("Edited product details updating error: ", err.message);
  }
};

// Soft delete product
const softDelete = async (req, res) => {
  try {
    const proId = req.params.id;
    if (!proId) {
      throw new Error("product id not received for product soft deletion");
    }
    const product = await Product.findById(proId);
    if (!product) {
      throw new Error("product not found in database for soft delete");
    }
    // toggle the status
    product.isActive = !product.isActive;
    console.log(product.isActive);
    await product.save();
    res.redirect("/product_management");
  } catch (err) {
    console.log("product soft delete error: ", err.message);
  }
};
// Delete product
// eslint-disable-next-line consistent-return
const deleteProduct = async (req, res) => {
  try {
    console.log("deleting a product");
    console.log(req.params.id);
    if (req.params.id) {
      const productId = req.params.id;

      const product = await Product.findOne({ _id: productId });
      if (product) {
        console.log(product);

        // Delete the product
        await Product.deleteOne({ _id: productId });

        console.log("product deleted");
        return res.redirect("/product_management");
      }
      throw new Error("Product not found in database for deleting");
    } else {
      throw new Error("No product ID provided for deletion");
    }
  } catch (err) {
    console.error("Product deleting error:", err);
    res.status(500).send(`Error deleting product: ${err.message}`);
  }
};

module.exports = {
  getProductManagement,
  getAddProduct,
  addProduct,
  getEditProduct,
  deleteProductImage,
  editProduct,
  softDelete,
  deleteProduct,
};
