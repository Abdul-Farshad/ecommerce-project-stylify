const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    require: true,
    set(value) {
      return value.charAt(0).toUpperCase() + value.slice(1);
    },
  },
  description: {
    type: String,
    default: null,
  },
  image: {
    type: String,
  },
}, { timestamps: true });

const Category = mongoose.model("Category", categorySchema);

module.exports = Category;
