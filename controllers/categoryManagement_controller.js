const multer = require("multer");
const Product = require("../models/product");
const Category = require("../models/category");
// eslint-disable-next-line import/no-extraneous-dependencies

// get category page
const getCategory = async (req, res) => {
  try {
    const page = req.query.page || 1;
    const limit = 3;
    const categories = await Category.find()
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .exec();
    const count = await Category.countDocuments();
    const totalPage = Math.ceil(count / limit);
    const pages = [];
    // eslint-disable-next-line no-plusplus
    for (let i = 1; i <= totalPage; i++) {
      pages.push(i);
    }
    res.render("create_category", { title: "Category", categories, pages });
  } catch (err) {
    console.error(err.message);
  }
};

// add new category
const addCategory = async (req, res) => {
  try {
    const { name } = req.body;
    const { file } = req;
    if (name && file) {
      // Use processed image paths from req.files
      const imagePath = file.path;

      const formData = {
        name: req.body.name,
        description: req.body.description ? req.body.description : null,
        image: req.file ? imagePath : null,
      };
      // check existing category
      const existingCategory = await Category.findOne({ name: formData.name });
      if (existingCategory) {
        console.log("category already exists");
        return res.status(400).json({ error: "Category already exists" });
      }

      // create new Category
      const newCategory = await new Category(formData).save();
      return res.status(200).json({
        message: "Category added successfully",
        category: newCategory,
      });
    }
    throw new Error("name or image file not received");
  } catch (err) {
    console.error("new Category adding error:", err);
    return res.status(500).json({ serverError: "Internal server error" });
  }
};

// Get Edit category page
const getEditCategory = async (req, res) => {
  try {
    if (req.params.id) {
      const categoryId = req.params.id;
      const category = await Category.findOne({ _id: categoryId });
      if (category) {
        res.render("edit_category", { title: "Edit Category", category });
      } else {
        throw new Error(
          "category not found in the database for passing to edit category page"
        );
      }
    } else {
      throw new Error("category _id not received to edit");
    }
  } catch (err) {
    console.error("getting edit category page error:", err.message);
  }
};

// edit category patch method

const updateCategory = async (req, res) => {
  try {
    const categoryId = req.params.id;
    const { name, description } = req.body;
    const { file } = req;
    if (name && categoryId) {
      let imagePath = null;
      if (file) {
        imagePath = req.file.path.replace(/public\\/, "/");
        console.log(imagePath);
      }
      const existingCategory = await Category.findById(categoryId);
      if (!existingCategory) {
        throw new Error("couldn't find existing category for editing");
      }
      // check existing name
      const existingCategoryName = await Category.find({ name });
      // eslint-disable-next-line no-underscore-dangle
      if (existingCategoryName && existingCategoryName._id !== categoryId) {
        return res
          .status(400)
          .json({ error: "This category name already exists" });
      }
      const updatedImage = file ? imagePath : existingCategory.image;
      const updatedData = {
        name,
        description: description || null,
        image: updatedImage,
      };
      // Update existing Category
      const updatedCategory = await Category.findOneAndUpdate(
        {
          _id: categoryId,
        },
        updatedData,
        { new: true }
      );

      return res.status(200).json({
        message: "Category updated successfully",
        category: updatedCategory,
      });
    }
    throw new Error("Name or category ID not received");
  } catch (err) {
    console.error("Category updating error:", err);
    return res.status(500).json({ serverError: "Internal server error" });
  }
};

// delete category
const deleteCategory = async (req, res) => {
  try {
    if (req.params.id) {
      const categoryId = req.params.id;
      const category = await Category.find({ _id: categoryId });
      if (!category) {
        throw new Error("Category not found in database for deleting");
      }
      const productsWithCategory = await Product.findOne({
        category: categoryId,
      });
      console.log("pro with this cate", productsWithCategory);
      if (productsWithCategory) {
        console.log("inside if")
        return res.redirect(
          "/category?msg=Cannot delete category. Products are associated with this category."
        );
      }
      console.log("out side of if")
      await Category.deleteOne({ _id: categoryId });
      return res.redirect("/category");
    }
  } catch (err) {
    console.error("category deleting error:", err);
  }
};

module.exports = {
  getCategory,
  addCategory,
  getEditCategory,
  updateCategory,
  deleteCategory,
};
