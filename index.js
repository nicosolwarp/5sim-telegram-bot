require("dotenv").config();

const TelegramBot = require("node-telegram-bot-api");

const bot = new TelegramBot(process.env.BOT_TOKEN, {
  polling: true,
});

const ADMIN_ID = String(process.env.ADMIN_ID);

bot.on("message", (msg) => {
  if (String(msg.from.id) !== ADMIN_ID) {
    return bot.sendMessage(msg.chat.id, "⛔ Access Denied");
  }
});

bot.onText(/\/start/, (msg) => {
  if (String(msg.from.id) !== ADMIN_ID) return;

  bot.sendMessage(msg.chat.id, "🎉 Welcome to your 5SIM Bot!", {
    reply_markup: {
      keyboard: [
        ["💰 Balance", "📱 Buy Number"],
        ["📩 Check SMS", "📜 Orders"],
        ["❌ Cancel Order", "⚙️ Settings"]
      ],
      resize_keyboard: true,
    },
  });
});

bot.onText(/\/ping/, (msg) => {
  if (String(msg.from.id) !== ADMIN_ID) return;
  bot.sendMessage(msg.chat.id, "🏓 Pong! Bot is Online.");
});

console.log("✅ Bot Started...");
