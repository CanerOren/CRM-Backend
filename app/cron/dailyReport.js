const cron = require('node-cron');
const { sendAllCustomerRequests } = require('../telegramBot/telegramNotifier');
async function dailyReportJob() {
  cron.schedule('0 9 * * *', async () => {
    console.log('⏰ Saatlik görüşme kontrolü başlatıldı...');
    await sendAllCustomerRequests();
  });
}

module.exports = dailyReportJob;
