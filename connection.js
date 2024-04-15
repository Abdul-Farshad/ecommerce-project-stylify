// eslint-disable-next-line import/no-extraneous-dependencies
require("dotenv").config();
const mongoose = require("mongoose");

function connectDatabase(url) {
  mongoose
    .connect(url)
    .then(() => console.log("database connected"))
    .catch((err) => console.error("Database connection error:", err));
}

module.exports = connectDatabase;
