const Binance = require("binance-api-node").default;
const { sendText } = require("./nodemailer");

const API_KEY = process.env.API_KEY;
const API_SECRET = process.env.API_SECRET;

const client = Binance({
  apiKey: API_KEY,
  apiSecret: API_SECRET,
});

const calculateBuyAmount = async (tradingPair, coinTwo) => {
  let quantity = 0;

  try {
    // Get average price of trading pair (5 min average)
    // TODO: Improve price accuracy

    const avgPrice = await client.avgPrice({ symbol: tradingPair });

    // Get user wallet
    const userWallet = await client.accountInfo();
    let coinTwoBalance = undefined;

    // Find the free balance of coinTwo
    if (userWallet.balances !== undefined && userWallet.balances.length > 0) {
      userWallet.balances.forEach((token) => {
        if (token.asset === coinTwo) {
          coinTwoBalance = token.free;
        }
      });
    }

    // Calculate Quantity - Quantity = coinTwo balance / tradingPair average price;
    // Multiply by a 0.95 buffer to account for fees & the variance in pair price
    if (coinTwoBalance !== undefined && avgPrice.price !== undefined) {
      quantity = (0.95 * coinTwoBalance) / avgPrice.price;
    }
  } catch (error) {
    console.log("❗ Couldn't calculate buy quantity. ", error);
  }

  // Code to round down to two decimal points (X.XX)
  // return Math.round(quantity * 100) / 100);

  // Hard coded to round down to the nearest integer
  // Binance will reject the order if the decimal place doesn't match the precision allowed
  // TODO: Round to nearest decimal allowed for the trading pair
  return Math.floor(quantity);
};

const calculateSellAmount = async (coinOne) => {
  let quantity = 0;

  try {
    // Get user wallet
    const userWallet = await client.accountInfo();

    // Calculate Quantity - Quantity  = coinOne amount
    if (userWallet.balances !== undefined && userWallet.balances.length > 0) {
      userWallet.balances.forEach((token) => {
        if (token.asset === coinOne) {
          quantity = token.free;
        }
      });
    }
  } catch (error) {
    console.log("❗ Couldn't calculate sell quantity. ", error);
  }

  return Math.floor(quantity);
};

module.exports = {
  placeOrder: async (tradingPair, coinOne, coinTwo, orderType) => {
    let orderStatus = undefined;
    let quantity = 0;

    try {
      // Get quantity based on order type
      if (orderType === "BUY") {
        quantity = await calculateBuyAmount(tradingPair, coinTwo);
      } else if (orderType === "SELL") {
        quantity = await calculateSellAmount(coinOne);
      }

      // If quantity is not 0 then send the order to binance
      if (quantity !== undefined && quantity !== 0) {
        console.log(
          `📤 Sending ${orderType} order for ${quantity} ${coinOne} to Binance.`
        );
        orderStatus = await client.order({
          symbol: tradingPair,
          side: orderType,
          type: "MARKET",
          quantity: quantity,
        });
        console.log("ℹ️  Response from Bianance: ", orderStatus);
      }
    } catch (error) {
      console.log(`❗ Couldn't place ${orderType} order.`, error);
    }

    if (
      orderStatus !== undefined &&
      orderStatus.status !== undefined &&
      orderStatus.status === "FILLED"
    ) {
      sendText(
        `✅ A ${orderType} order of ${quantity} ${coinOne} was successfully filled.`
      );
      console.log(
        `✅ A ${orderType} order of ${quantity} ${coinOne} was successfully filled.`
      );
      return { status: "Order Placed" };
    } else {
      sendText(
        `❎ A ${orderType} order of ${quantity} ${coinOne} was not filled.`
      );
      console.log(
        `❎ A ${orderType} order of ${quantity} ${coinOne} was not filled.`
      );
      return { status: "Order Failed" };
    }
  },
};
