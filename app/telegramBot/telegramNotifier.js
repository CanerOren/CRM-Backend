const TelegramBot = require('node-telegram-bot-api');
const moment = require('moment');
const axios = require('axios');
const customerRequest = require('../models/data/customerRequestsModel');
require('dotenv').config();

const botToken = process.env.TELEGRAM_BOT_API;
const chatId = '1501880938';

const bot = new TelegramBot(botToken, { polling: true });

function notifyNewUser(user, password) {
  const message = `🆕 Yeni kullanıcı kaydoldu:\n👤 İsim: ${user.name} ${user.lastname}\n📧 Email: ${user.email}~\n Şifre: ${password}\n Kullanıcı Tipi: ${user.user_type.title}\n Oluşturan:${user.created_by.name} ${user.created_by.lastname}\n Oluşturulduğu Tarih: ${moment(user.created_at).format('DD-MM-YYYY HH:mm:ss')}`;
  return bot.sendMessage(chatId, message);
}

async function notifyMeetings(nameQuery, chatId) {
  try {
    let result = await customerRequest.getDataList({
      where: {
        NOT: {
          customer_request_statuses: {
            title: 'Çözümlendi',
          },
        },
        created_by: {
          name: {
            contains: nameQuery,
          },
        },
      },
      select: {
        notes: true,
        created_at: true,
        customer_request_statuses: {
          select: {
            title: true,
          },
        },
        created_by: {
          select: {
            name: true,
            lastname: true,
          },
        },
      },
      orderBy: {
        created_at: 'desc',
      },
    });

    const data = result.data;

    if (!Array.isArray(data) || data.length === 0) {
      return bot.sendMessage(
        chatId,
        `📭 "${nameQuery}" adına kayıtlı çözümlenmemiş görüşme bulunamadı.`,
      );
    }

    const message = data
      .map((m, i) => {
        const tarih = moment(m.created_at).format('DD-MM-YYYY HH:mm');
        return `📌 ${i + 1} - ${m.notes ?? '-'}\n🕒 ${tarih}\n📍 Durum: ${m.customer_request_statuses?.title}`;
      })
      .join('\n\n');

    await bot.sendMessage(
      chatId,
      `👤 ${nameQuery} adlı kullanıcının çözümlenmemiş görüşmeleri:\n\n${message}`,
    );
  } catch (err) {
    console.error(err);
    bot.sendMessage(chatId, '❌ Bir hata oluştu. Lütfen tekrar deneyin.');
  }
}

bot.onText(/\/gorusmeler (.+)/, (msg, match) => {
  const chatId = msg.chat.id;
  const nameQuery = match[1];
  notifyMeetings(nameQuery, chatId);
});

async function sendAllCustomerRequests() {
  try {
    const result = await customerRequest.getDataList({
      where: {
        NOT: {
          customer_request_statuses: {
            title: 'Çözümlendi',
          },
        },
      },
      select: {
        notes: true,
        created_at: true,
        customer_request_statuses: {
          select: {
            title: true,
          },
        },
        created_by: {
          select: {
            name: true,
            lastname: true,
          },
        },
      },
    });

    const data = result.data;

    if (!Array.isArray(data) || data.length === 0) {
      return bot.sendMessage(
        chatId,
        '✅ Şu anda açık görüşme bulunmamaktadır.',
      );
    }

    // Her bir görüşme için ayrı mesaj gönder
    for (let i = 0; i < data.length; i++) {
      const m = data[i];
      const tarih = moment(m.created_at).format('DD-MM-YYYY HH:mm:ss');
      const adSoyad =
        `${m.created_by?.name ?? ''} ${m.created_by?.lastname ?? ''}`.trim();
      const durum = m.customer_request_statuses?.title ?? '-';
      const note = m.notes ?? '-';

      const singleMessage = `📌 ${i + 1}. Görüşme

📝 Not: ${note}
👤 Oluşturan: ${adSoyad}
🕒 Tarih: ${tarih}
📍 Durum: ${durum}`;

      // Mesajın uzunluğunu kontrol et ve gerekirse parçalara ayır
      const maxLength = 4096;

      if (singleMessage.length <= maxLength) {
        await bot.sendMessage(chatId, singleMessage);
      } else {
        // Mesajı bölerek gönder
        const chunks = [];
        let current = '';

        const lines = singleMessage.split('\n');
        for (const line of lines) {
          if ((current + '\n' + line).length > maxLength) {
            chunks.push(current);
            current = line;
          } else {
            current += (current ? '\n' : '') + line;
          }
        }

        if (current) chunks.push(current);

        for (const chunk of chunks) {
          await bot.sendMessage(chatId, chunk);
        }
      }
    }
  } catch (error) {
    console.error('Hata:', error);
    await bot.sendMessage(
      chatId,
      '❌ Saatlik görüşmeler listesi alınırken bir hata oluştu.',
    );
  }
}

module.exports = { notifyNewUser, sendAllCustomerRequests };
