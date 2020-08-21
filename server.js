const express = require("express");
const parser = require("body-parser");
const cors = require("cors");

const dotenv = require("dotenv");
dotenv.config();

const { placeOrder } = require("./binance");
const { sendText } = require("./nodemailer");

const PORT = process.env.PORT;

const app = express();

app.use(cors());
app.use(parser.json());
app.use(
  parser.urlencoded({
    extended: true,
  })
);

app.post("/trade", async (req, res) => {
  const { tradingPair, coinOne, coinTwo, orderType } = req.body;
  let status = undefined;

  // Send order recieved text
  sendText(`🤖 An order to ${orderType} ${coinOne} was sent to Binance Bot.`);

  console.log(
    `🤖 An order to ${orderType} ${coinOne} was sent to Binance Bot.`
  );

  // Place the order if variables are not undefined, else log warning
  if (
    tradingPair !== undefined &&
    coinOne !== undefined &&
    coinTwo !== undefined &&
    orderType !== undefined
  ) {
    status = await placeOrder(tradingPair, coinOne, coinTwo, orderType);
  } else {
    console.log("❗ One of the variables was undefined");
  }

  res.status(200).json(status);
});

app.listen(PORT, () => {
  console.log("App is listening on PORT: ", PORT);
});
