// nodemailerConfig.js
// eslint-disable-next-line import/no-extraneous-dependencies
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.AUTH_EMAIL,
    pass: process.env.AUTH_PASSWORD,
  },
});

module.exports = transporter;
