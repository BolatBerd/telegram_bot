const TelegramBot = require('node-telegram-bot-api');
require('dotenv').config();

const token = process.env.BOT_TOKEN;
const ADMIN_ID = Number(process.env.ADMIN_ID); // добавь в .env
const bot = new TelegramBot(token, { polling: true });

/* =======================
   ХРАНЕНИЕ ДАННЫХ (ПРОСТО)
======================= */
const users = new Map();       // userId -> данные
const userState = new Map();   // userId -> состояние

/* =======================
   ОБРАБОТКА ОШИБОК
======================= */
bot.on('polling_error', (error) => {
  console.error('Ошибка polling:', error);
});

function sendMessage(chatId, text, options = {}) {
  return bot.sendMessage(chatId, text, options).catch(err => {
    console.error('Ошибка отправки:', err.message);
  });
}

/* =======================
   МЕНЮ (REPLY КНОПКИ)
======================= */
function mainMenu(chatId) {
  sendMessage(chatId, 'Главное меню:', {
    reply_markup: {
      keyboard: [
        ['📄 Профиль', '⚙️ Настройки'],
        ['📨 Рассылка', '❓ Помощь']
      ],
      resize_keyboard: true
    }
  });
}

/* =======================
   /START
======================= */
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;

  if (!users.has(userId)) {
    users.set(userId, {
      id: userId,
      username: msg.from.username,
      first_name: msg.from.first_name
    });
  }

  sendMessage(chatId, 'Привет! 🤖');
  mainMenu(chatId);
});

/* =======================
   /HELP
======================= */
bot.onText(/\/help/, (msg) => {
  sendMessage(msg.chat.id,
    `/start — запуск
/help — помощь
/echo <текст> — повтор
/profile — профиль`
  );
});

/* =======================
   /ECHO
======================= */
bot.onText(/\/echo (.+)/, (msg, match) => {
  sendMessage(msg.chat.id, `Эхо: ${match[1]}`);
});

/* =======================
   /PROFILE
======================= */
bot.onText(/\/profile/, (msg) => {
  const user = users.get(msg.from.id);
  sendMessage(msg.chat.id,
    `👤 Профиль:
ID: ${user.id}
Username: ${user.username || '—'}`
  );
});

/* =======================
   INLINE КНОПКИ
======================= */
bot.onText(/\/confirm/, (msg) => {
  sendMessage(msg.chat.id, 'Подтвердить действие?', {
    reply_markup: {
      inline_keyboard: [
        [{ text: '✅ Да', callback_data: 'yes' }],
        [{ text: '❌ Нет', callback_data: 'no' }]
      ]
    }
  });
});

bot.on('callback_query', (query) => {
  const chatId = query.message.chat.id;

  if (query.data === 'yes') {
    sendMessage(chatId, 'Подтверждено ✅');
  }

  if (query.data === 'no') {
    sendMessage(chatId, 'Отменено ❌');
  }

  bot.answerCallbackQuery(query.id);
});

/* =======================
   ОБРАБОТКА ФОТО
======================= */
bot.on('photo', (msg) => {
  sendMessage(msg.chat.id, 'Фото получено 📸');
});

/* =======================
   ПРОСТОЕ СОСТОЯНИЕ (FSM)
======================= */
bot.onText(/\/form/, (msg) => {
  userState.set(msg.from.id, 'WAIT_NAME');
  sendMessage(msg.chat.id, 'Введите ваше имя:');
});

/* =======================
   РАССЫЛКА (АДМИН)
======================= */
bot.onText(/\/broadcast (.+)/, (msg, match) => {
  if (msg.from.id !== ADMIN_ID) {
    return sendMessage(msg.chat.id, '⛔ Нет доступа');
  }

  users.forEach(user => {
    sendMessage(user.id, `📢 ${match[1]}`);
  });
});

/* =======================
   ОБРАБОТКА ТЕКСТА
======================= */
bot.on('message', (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;

  if (!msg.text || msg.text.startsWith('/')) return;

  // FSM
  if (userState.get(userId) === 'WAIT_NAME') {
    userState.delete(userId);
    return sendMessage(chatId, `Имя сохранено: ${msg.text}`);
  }

  // меню
  switch (msg.text) {
    case '📄 Профиль':
      return sendMessage(chatId, 'Ваш профиль (/profile)');
    case '⚙️ Настройки':
      return sendMessage(chatId, 'Настройки в разработке');
    case '❓ Помощь':
      return sendMessage(chatId, 'Используйте /help');
  }

  // лог
  console.log(`Сообщение от ${userId}: ${msg.text}`);
  sendMessage(chatId, `Ты написал: ${msg.text}`);
});

/* =======================
   ДОБАВЛЕНИЕ В ГРУППУ
======================= */
bot.on('new_chat_members', (msg) => {
  const chatId = msg.chat.id;
  const GROUP_ID = Number(process.env.GROUP_ID); // добавь в .env ID группы

  if (chatId !== GROUP_ID) return; // привязка к определенной группе

  msg.new_chat_members.forEach((member) => {
    if (bot.botInfo && member.id === bot.botInfo.id) {
      bot.sendMessage(
        chatId,
        '👋 Привет! Спасибо, что добавили меня в группу.\nИспользуйте /help для команд.'
      );
    }
  });
});

// const schedule = require('node-schedule');

// schedule.scheduleJob('* * * * *', () => {
//   bot.sendMessage(GROUP_ID, '⏰ Сообщение каждую минуту');
// });
const GROUP = Number(process.env.GROUP_ID);

setInterval(() => {
  bot.sendMessage(GROUP, '⏰ Сообщение каждую минуту');
}, 60 * 1000);

