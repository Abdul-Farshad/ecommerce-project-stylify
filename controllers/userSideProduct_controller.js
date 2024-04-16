const Product = require("../models/product");
const Category = require("../models/category");
const Wishlist = require("../models/wishlist");
// get home page router
const getHomePage = async (req, res) => {
  const { isUser } = req.session;

  const page = req.query.page || 1;
  const limit = 12;
  const query = { status: "Active" };

  // filtering
  if (req.query.category) {
    query.category = req.query.category;
  }

  // Filtering by price range
  if (req.query.price) {
    const priceRange = req.query.price.split("-");
    if (priceRange.length === 1) {
      // Price is <500 or >2000
      const operator = priceRange[0][0] === "<" ? "$lt" : "$gt";
      query.price = { [operator]: parseInt(priceRange[0].slice(1), 10) };
    } else if (priceRange.length === 2) {
      // Price is between two values
      query.price = {
        $gte: parseInt(priceRange[0], 10),
        $lte: parseInt(priceRange[1], 10),
      };
    }
  }
  // sorting
  const sort = {};
  if (req.query.sort === "price_asc") {
    sort.price = 1;
  } else if (req.query.sort === "price_desc") {
    sort.price = -1;
  } else if (req.query.sort === "a-z") {
    sort.name = 1;
  } else if (req.query.sort === "z-a") {
    sort.name = -1;
  }

  // query products from database
  const products = await Product.find(query)
    .sort(sort)
    .skip((page - 1) * limit)
    .limit(limit)
    .exec();
  const count = await Product.countDocuments();

  // pass categories for displaying on filtering section
  const categories = await Category.find();

  const mainImgs = products.map((product) => product.images[0]);
  const totalPage = Math.ceil(count / limit);
  const pages = [];
  // eslint-disable-next-line no-plusplus
  for (let i = 1; i <= totalPage; i++) {
    pages.push(i);
  }
  res.render("home", {
    title: "Home",
    isUser,
    products,
    mainImgs,
    pages,
    categories,
    totalPage,
    currentPage: page,
  });
};

// product details page
const productView = async (req, res) => {
  try {
    const productId = req.params.id;
    const { isUser } = req.session;
    const product = await Product.findOne({ _id: productId });
    if (!productId) {
      throw new Error("couldn't find productId in params");
    } else if (!product) {
      throw new Error(
        "couldn't find a product in database with received product Id"
      );
    }
    // calculate discount % based on regular price and selling price
    const { regularPrice } = product;
    const sellingPrice = product.price;
    const discountPercentage =
      ((regularPrice - sellingPrice) / regularPrice) * 100;

    // check product exist in wishlist
    const checkInWishlist = await Wishlist.exists({
      userId: req.session.user_id,
      "product.productId": productId,
    });
    const itemInWishlist = !!checkInWishlist; // converting to boolean value

    res.render("product_view", {
      title: "view Item",
      product,
      isUser,
      itemInWishlist,
      discountPercentage: discountPercentage.toFixed(0),
    });
  } catch (err) {
    console.error("Product details page rendering error", err);
  }
};

// Product search
const productSearch = async (req, res) => {
  try {
    const searchWord = req.query.search;
    if (searchWord) {
      let products = await Product.aggregate([
        {
          $lookup: {
            from: "categories",
            localField: "category",
            foreignField: "_id",
            as: "category",
          },
        },
        {
          $match: {
            $or: [
              { name: { $regex: searchWord, $options: "i" } },
              { "category.name": { $regex: searchWord, $options: "i" } },
            ],
          },
        },
        {
          $match: { status: "Active" },
        },
      ]);
      if (!products || products.length === 0) {
        products = await Product.find({ status: "Active" });
      }

      const categories = await Category.find();
      if (!categories || categories.length === 0) {
        throw new Error("No categories found in the database.");
      }

      const mainImgs = products.map((product) => product.images[0]);
      const { isUser } = req.session;
      res.render("home", {
        title: "Home",
        isUser,
        products,
        mainImgs,
        categories,
      });
    } else {
      res.redirect("/");
      throw new Error("search word not received to back end");
    }
  } catch (err) {
    console.error("product search error:", err.message);
  }
};

// Wishlist items management (add or remove)
const wishlistManage = async (req, res) => {
  try {
    console.log("reached at wishlist update route");
    const userId = req.session.user_id;
    const { productId } = req.body;
    if (!userId) {
      throw new Error("couldn't find userId in session storage");
    }
    if (!productId) {
      throw new Error("couldn't find product id in body");
    }
    const wishlistItem = await Wishlist.findOneAndUpdate(
      { userId, "product.productId": productId },
      { $pull: { product: { productId } } },
      { new: true }
    );

    if (wishlistItem) {
      console.log("wishlist", wishlistItem);
      res.status(200).json({ message: "Product removed from wishlist" });
    } else {
      const newItems = {
        userId,
        productId,
      };
      console.log("new Items for wishlist", newItems);
      Wishlist.findOneAndUpdate(
        { userId },
        { $push: { product: { productId } } },
        { upsert: true, new: true }
      )
        .then(() => {
          console.log("new product added to wishlist");
          res.status(200).json({ message: "Product added to wishlist" });
        })
        .catch(() => res.status(400).json({ error: "Wishlist update failed" }));
    }
  } catch (err) {
    console.error("wishlist management error", err);
  }
};
module.exports = {
  getHomePage,
  productView,
  productSearch,
  wishlistManage,
};
