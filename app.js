const createError = require("http-errors");
const express = require("express");
require("dotenv").config();
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const hbs = require("hbs");
const session = require("express-session");
// const { v4: uuidv4 } = require("uuid");
const nocache = require("nocache");
// eslint-disable-next-line import/no-extraneous-dependencies
const multer = require("multer");
// eslint-disable-next-line import/no-extraneous-dependencies
const MongoStore = require("connect-mongo");

const connectDatabase = require("./connection");

// connect MongoDB
connectDatabase(process.env.DB_URL);
// cart quantity checking middleware
const { cartItemQtyCheck } = require("./middlewares/auth");

// const indexRouter = require("./routes/user/index");
const usersSigninRouter = require("./routes/user/users_signin");
const userRegistrationRouter = require("./routes/user/user_registration");
const homeRouter = require("./routes/user/home");
const proViewRouter = require("./routes/user/pro_view");
const adminSigninRouter = require("./routes/admin/admin_signin");
const adminDashboardRouter = require("./routes/admin/admin_panel");
const adminSignoutRouter = require("./routes/admin/admin_signout");
const userSignuotRouter = require("./routes/user/user_signout");
const userManagementRouter = require("./routes/admin/user_management"); // admin controller
const categoryRouter = require("./routes/admin/category_management");
const productManagementRouter = require("./routes/admin/product_management");
const userDeleteAccountRouter = require("./routes/user/user_deleteAccount");
const userAccountRouter = require("./routes/user/my_account");
const shoppingCartRouter = require("./routes/user/cart");
const adminOrdersRouter = require("./routes/admin/admin_orders");
const couponManagementRouter = require("./routes/admin/coupon_management");
const salesReportRouter = require("./routes/admin/sales_report");

const app = express();
app.use(nocache());

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "hbs");
hbs.registerPartials(path.join(__dirname, "views", "partials"));

// hbs page helper function
hbs.registerHelper("firstImage", (images) => images[0]);
hbs.registerHelper("eq", function (a, b, options) {
  return a === b ? options.fn(this) : options.inverse(this);
});

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

// session
const sessionSecret = "g6vD3^zR#8sL!pY";
app.use(
  session({
    secret: sessionSecret,
    resave: false,
    saveUninitialized: true,
    cookie: {
      maxAge: 24 * 60 * 60 * 1000, // for 1 day
    },
    store: MongoStore.create({
      mongoUrl: "mongodb://localhost:27017/stylifyDb",
      collectionName: "mySessions",
      ttl: 24 * 60 * 60, // (default is 14 days)
      autoRemove: "interval", // Automatically remove expired sessions (default is 'native')
      autoRemoveInterval: 10, // Interval in minutes to clear expired sessions (default is 10)
    }),
  }),
);

app.use(cartItemQtyCheck);
app.use("/", homeRouter);
app.use("/", usersSigninRouter);
app.use("/", userRegistrationRouter);
app.use("/home", homeRouter);
app.use("/", proViewRouter);
app.use("/", adminSigninRouter);
app.use("/", adminDashboardRouter);
app.use("/", adminSignoutRouter);
app.use("/", userSignuotRouter);
app.use("/", userManagementRouter);
app.use("/", categoryRouter);
app.use("/", productManagementRouter);
app.use("/", userDeleteAccountRouter);
app.use("/", userAccountRouter);
app.use("/", shoppingCartRouter);
app.use("/", adminOrdersRouter);
app.use("/", couponManagementRouter);
app.use("/", salesReportRouter);

// redirect to home page if path url is wrong
app.use("*", (req, res) => {
  res.redirect("/home");
});

// catch 404 and forward to error handler
app.use((req, res, next) => {
  next(createError(404));
});

// error handler
app.use((err, req, res) => {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
