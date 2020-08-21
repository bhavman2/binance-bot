var nodemailer = require("nodemailer");

const GMAIL_USER = process.env.GMAIL_USER;
const GMAIL_PWD = process.env.GMAIL_PWD;
const TEXT_ADDR = process.env.TEXT_ADDR;

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: GMAIL_USER,
    pass: GMAIL_PWD,
  },
});

module.exports = {
  sendText: (message) => {
    const mailOptions = {
      from: GMAIL_USER,
      to: TEXT_ADDR,
      text: message,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        return { status: "failed", error: error };
      } else {
        return { status: "success" };
      }
    });
  },
};
