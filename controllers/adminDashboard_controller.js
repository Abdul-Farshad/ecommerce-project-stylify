const Order = require("../models/order");
const Product = require("../models/product");
const User = require("../models/user");
const { formateAmount } = require("./userAccount_controller");

const moment = require("moment");
// get admin panel page
const getAdminDashboard = async (req, res) => {
  try {
    console.log("reached at admin dashboard route");
    const filterValue = req.query.f;
    console.log(filterValue);

    let filter = {};
    if (filterValue === "all") {
      filter = {};
    } else if (filterValue === "t") {
      filter = {
        createdAt: {
          $gte: new Date(new Date().setHours(00, 00, 00)),
          $lt: new Date(new Date().setHours(23, 59, 59)),
        },
      };
    } else if (filterValue === "w") {
      const startOfWeek = new Date();
      startOfWeek.setHours(0, 0, 0, 0);
      startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(endOfWeek.getDate() + 6);
      endOfWeek.setHours(23, 59, 59, 999);
      filter = {
        createdAt: {
          $gte: startOfWeek,
          $lt: endOfWeek,
        },
      };
    } else if (filterValue === "m") {
      const startOfMonth = new Date();
      startOfMonth.setHours(0, 0, 0, 0);
      startOfMonth.setDate(1);
      const endOfMonth = new Date();
      endOfMonth.setHours(23, 59, 59, 999);
      endOfMonth.setDate(
        new Date(
          startOfMonth.getFullYear(),
          startOfMonth.getMonth() + 1,
          0
        ).getDate()
      );
      filter = {
        createdAt: {
          $gte: startOfMonth,
          $lt: endOfMonth,
        },
      };
    }

    // check total orders
    const orders = await Order.find(filter)
      .limit(5)
      .sort({ createdAt: -1 })
      .exec();
    let ordersCount = await Order.countDocuments(filter);
    if (ordersCount <= 0) {
      ordersCount = 0;
    }
    // check total sales
    const sales = await Order.aggregate([
      { $match: { status: "Delivered", ...filter } },
      {
        $group: { _id: null, totalAmount: { $sum: "$totalAmount" } },
      },
    ]);

    let totalSales = 0;
    if (sales.length !== 0) {
      // formate the amount
      totalSales = formateAmount(sales[0].totalAmount);
    }
    // check products
    const products = await Product.find({ isActive: true, stock: { $gt: 0 } });
    const productCount = products.length;

    // check number of customers
    const customers = await User.distinct("_id").countDocuments();
    res.render("admin_dashboard", {
      title: "admin dashboard",
      orders,
      ordersCount,
      totalSales,
      productCount,
      customers,
      filterValue,
    });
  } catch (err) {
    console.log("dashboard rendering error:", err);
  }
};

// get admin dashboard chart data
const getChartData = (req, res) => {
  try {
    console.log("reached at chart filter section");
    const filterValue = req.query.filter;
    console.log("filter value", filterValue);
    let startDate, endDate;

    // Calculate start and end dates based on the filter
    if (filterValue === "tw") {
      // This Week
      startDate = moment().startOf("week");
      endDate = moment().endOf("week");
    } else if (filterValue === "w") {
      // Weekly
      startDate = moment().startOf("week").subtract(1, "week");
      endDate = moment().endOf("week");
    } else if (filterValue === "m") {
      // Monthly
      const currentYear = moment().year();
      startDate = moment().year(currentYear).startOf("year");
      endDate = moment().year(currentYear).endOf("year");
    } else if (filterValue === "y") {
      // Yearly
      startDate = moment().startOf("year");
      endDate = moment().endOf("year");
    } else {
      // Invalid filter value
      return res.status(400).json({ error: "Invalid filter value" });
    }

    Order.find({
      createdAt: { $gte: startDate, $lte: endDate },
      status: "Delivered",
    })
      .then((orders) => {
        // Process the orders data to get total sales amount for the selected filter
        let salesData;
        if (filterValue === "tw") {
          salesData = Array(7).fill(0);
          orders.forEach((order) => {
            const dayOfWeek = moment(order.createdAt).day(); // Get the day of the week (0-6, where 0 is Sunday)
            salesData[dayOfWeek] += order.totalAmount; // Add the order's total amount to the corresponding day of the week
          });
        } else if (filterValue === "w") {
          // Calculate total sales amount for each week
          salesData = {}; // Initialize object to store total sales amount for each week
          orders.forEach((order) => {
            const weekOfYear = moment(order.createdAt).isoWeek(); // Get the ISO week number of the year
            if (!salesData[weekOfYear]) {
              salesData[weekOfYear] = 0;
            }
            salesData[weekOfYear] += order.totalAmount; // Add the order's total amount to the corresponding week
          });
        } else if (filterValue === "m") {
          // Calculate total sales amount for each month
          salesData = Array(12).fill(0); // Initialize array to store total sales amount for each month
          orders.forEach((order) => {
            const month = moment(order.createdAt).month(); // Get the month (0-11, where 0 is January)
            salesData[month] += order.totalAmount; // Add the order's total amount to the corresponding month
          });
        } else if (filterValue === "y") {
          // Calculate total sales amount for each year
          salesData = {}; // Initialize object to store total sales amount for each year
          orders.forEach((order) => {
            const year = moment(order.createdAt).year(); // Get the year
            if (!salesData[year]) {
              salesData[year] = 0;
            }
            salesData[year] += order.totalAmount; // Add the order's total amount to the corresponding year
          });
        }

        // Respond with the processed data
        res.status(200).json({
          salesData,
        });
      })
      .catch((error) => {
        console.error("Error fetching orders:", error);
        res.status(500).json({ error: "Failed to fetch orders" });
      });
  } catch (err) {
    console.error("dashboard chart data filter error", err);
  }
};

// get top selling products and categories
const getTopSellingItems = async (req, res) => {
  try {
    console.log("reached get top selling items route");
    // query top 10 selling products
    const topSellingProducts = await Order.aggregate([
      { $match: { status: "Delivered" } },
      { $unwind: "$products" },
      {
        $group: {
          _id: "$products.product",
          totalQuantity: { $sum: "$products.quantity" },
        },
      },
      { $sort: { totalQuantity: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: "products",
          localField: "_id",
          foreignField: "_id",
          as: "productDetails",
        },
      },
      {
        $project: {
          _id: 0,
          name: { $arrayElemAt: ["$productDetails.name", 0] },
          totalQuantity: 1,
        },
      },
    ]);

    // query top 10 selling categories
    const topSellingCategories = await Order.aggregate([
      { $match: { status: "Delivered" } },
      { $unwind: "$products" },
      {
        $lookup: {
          from: "products",
          localField: "products.product",
          foreignField: "_id",
          as: "productDetails",
        },
      },
      { $unwind: "$productDetails" },
      {
        $lookup: {
          from: "categories",
          localField: "productDetails.category",
          foreignField: "_id",
          as: "categoryDetails",
        },
      },
      { $unwind: "$categoryDetails" },
      {
        $group: {
          _id: "$categoryDetails.name",
          totalQuantity: { $sum: "$products.quantity" },
        },
      },
      {
        $project: {
          name: "$_id",
          totalQuantity: 1,
          _id: 0,
        },
      },
      { $sort: { totalQuantity: -1 } },
      { $limit: 10 },
    ]);

    res.status(200).json({ topSellingProducts, topSellingCategories });
  } catch (err) {
    console.error("querying top selling items error: ", err);
    res.status(500).json({ message: "Internal server error" });
  }
};
module.exports = {
  getAdminDashboard,
  getChartData,
  getTopSellingItems,
};
