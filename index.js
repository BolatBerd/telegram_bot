const TelegramBot = require('node-telegram-bot-api');
require('dotenv').config(); // Загружаем переменные окружения

const token = process.env.BOT_TOKEN; // Токен из .env
const bot = new TelegramBot(token, { polling: true });

// Обработка ошибок polling
bot.on('polling_error', (error) => {
  console.error('Ошибка polling:', error);
});

// Функция для отправки сообщений с обработкой ошибок
function sendMessage(chatId, text) {
  return bot.sendMessage(chatId, text).catch((error) => {
    console.error('Ошибка отправки:', error);
  });
}

// команда /start
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  sendMessage(chatId, 'Привет! Я бот на JavaScript 🤖\nИспользуй /help для команд.');
});

// команда /help
bot.onText(/\/help/, (msg) => {
  const chatId = msg.chat.id;
  sendMessage(chatId, 'Доступные команды:\n/start - Приветствие\n/help - Список команд\n/echo <текст> - Повторить текст');
});

// команда /echo
bot.onText(/\/echo (.+)/, (msg, match) => {
  const chatId = msg.chat.id;
  const text = match[1]; // Текст после /echo
  sendMessage(chatId, `Эхо: ${text}`);
});

// любой текст (кроме команд)
bot.on('message', (msg) => {
  const chatId = msg.chat.id;

  if (msg.text && !msg.text.startsWith('/')) {
    console.log(`Сообщение от ${msg.from.username || msg.from.id}: ${msg.text}`);
    sendMessage(chatId, `Ты написал: ${msg.text}`);
  }
});

