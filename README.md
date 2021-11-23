# binance-bot

## Description

A binance trading bot that can buy or sell tokens based on TradingView webhook triggers

## Technologies

- Express
- Binance API
- Nodemailer

## Install

Clone this repository into your computer

```
git clone https://github.com/bhavman2/binance-bot.git
```

Install dependencies.

```
npm install
```

Configure .env file.

```
PORT = 3000
API_KEY = %% Binance API Key %%
API_SECRET = %% Binance API Secret %%
GMAIL_USER = %% Gmail email address %%
GMAIL_PWD = %% Gmail password %%
TEXT_ADDR = %% Email to SMS address xxxxxxxxxx@vzwpix.com or email address%%
```

Run your local node server.

```
npm start
```

## Creating an Order

Send a POST request to localhost:3000/trade with the following data object:

```
{
	"tradingPair" : "TRXUSDT",
	"coinOne" : "TRX",
	"coinTwo" : "USDT",
	"orderType" : "SELL"
}
```
