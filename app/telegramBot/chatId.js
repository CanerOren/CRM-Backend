const TelegramBot = require('node-telegram-bot-api');
require('dotenv').config();

const token = process.env.TELEGRAM_BOT_API;
console.log(token);
const bot = new TelegramBot(token, { polling: true });

bot.on('message', (message) => {
  console.log('Chat ID:', message.chat.id);
});
