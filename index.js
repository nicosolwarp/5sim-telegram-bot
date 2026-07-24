const http = require("http");
require("dotenv").config();

const TelegramBot = require("node-telegram-bot-api");
const axios = require("axios");

const BOT_TOKEN = process.env.BOT_TOKEN;
const API_KEY = process.env.API_KEY;
const ADMIN_ID = String(process.env.ADMIN_ID);

const bot = new TelegramBot(BOT_TOKEN, {
  polling: true,
});

// START
bot.onText(/\/start/, (msg) => {
  if (String(msg.from.id) !== ADMIN_ID) {
    return bot.sendMessage(msg.chat.id, "⛔ Access Denied");
  }

  bot.sendMessage(msg.chat.id, "👋 Welcome to 5SIM Bot", {
    reply_markup: {
      keyboard: [
        ["💰 Balance"],
        ["📱 Buy Number"],
        ["📩 Check SMS"],
        ["📜 Orders"],
        ["❌ Cancel Order"]
      ],
      resize_keyboard: true,
    },
  });
});

// BALANCE
bot.on("message", async (msg) => {
  if (String(msg.from.id) !== ADMIN_ID) return;

  if (msg.text === "💰 Balance") {
    try {
      const res = await axios.get(
        "https://5sim.net/v1/user/profile",
        {
          headers: {
            Authorization: `Bearer ${API_KEY}`,
            Accept: "application/json",
          },
        }
      );

      bot.sendMessage(
        msg.chat.id,
        `💰 Balance: ${res.data.balance} USD`
      );
    } catch (e) {
      console.log(e.response?.data || e.message);
      bot.sendMessage(msg.chat.id, "❌ Failed to load balance.");
    }
  }
});

// HTTP SERVER
const PORT = process.env.PORT || 10000;

http.createServer((req, res) => {
  res.writeHead(200, {
    "Content-Type": "text/plain",
  });
  res.end("5SIM Telegram Bot Running");
}).listen(PORT, () => {
  console.log(`HTTP Server running on ${PORT}`);
});

console.log("✅ Bot Started...");
