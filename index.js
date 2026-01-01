const TelegramBot = require('node-telegram-bot-api');

const token = '8222313983:AAG_uffpSzujCLA4qp4LcD-b0FAVTtUGVVA';
const bot = new TelegramBot(token, { polling: true });

// команда /start
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, 'Привет! Я бот на JavaScript 🤖');
});

// любой текст
bot.on('message', (msg) => {
  const chatId = msg.chat.id;

  if (msg.text !== '/start') {
    bot.sendMessage(chatId, `Ты написал: ${msg.text}`);
  }
});

