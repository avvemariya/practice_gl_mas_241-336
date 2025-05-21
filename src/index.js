require('dotenv').config();
const axios = require('axios');
const schedule = require('node-schedule');

const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN;
const API_URL = `https://api.telegram.org/bot${TELEGRAM_TOKEN}`;

// Хранилище напоминаний (в реальном проекте используйте базу данных)
const reminders = new Map();

// Формат: /remind 15:30 Сделать домашку
async function handleMessage(message) {
  const chatId = message.chat.id;
  const text = message.text;

  if (text === '/start') {
    return sendMessage(chatId, 
      `⏰ Бот-напоминалка\n\n` +
      `Доступные команды:\n` +
      `/remind HH:MM Текст - Добавить напоминание\n` +
      `/list - Показать все напоминания\n` +
      `/cancel ID - Удалить напоминание`
    );
  }

  if (text === '/list') {
    const userReminders = Array.from(reminders.entries())
      .filter(([_, reminder]) => reminder.chatId === chatId)
      .map(([id, reminder]) => `${id}: ${reminder.time} - ${reminder.text}`);
    
    return sendMessage(chatId, 
      userReminders.length ? 
      `📝 Ваши напоминания:\n${userReminders.join('\n')}` : 
      'У вас нет активных напоминаний'
    );
  }

  if (text.startsWith('/remind')) {
    const parts = text.split(' ');
    if (parts.length < 3) {
      return sendMessage(chatId, 'Неправильный формат. Используйте: /remind HH:MM Текст');
    }

    const time = parts[1];
    const reminderText = parts.slice(2).join(' ');
    const [hours, minutes] = time.split(':').map(Number);

    if (isNaN(hours) || isNaN(minutes) || hours > 23 || minutes > 59) {
      return sendMessage(chatId, 'Некорректное время. Формат: HH:MM (например, 15:30)');
    }

    const reminderId = Date.now();
    const job = schedule.scheduleJob({ hour: hours, minute: minutes }, () => {
      sendMessage(chatId, `🔔 Напоминание: ${reminderText}`);
      reminders.delete(reminderId);
    });

    reminders.set(reminderId, {
      chatId,
      time,
      text: reminderText,
      job
    });

    return sendMessage(chatId, `Напоминание добавлено на ${time} (ID: ${reminderId})`);
  }

  if (text.startsWith('/cancel')) {
    const reminderId = parseInt(text.split(' ')[1]);
    if (!reminders.has(reminderId)) {
      return sendMessage(chatId, 'Напоминание не найдено');
    }

    reminders.get(reminderId).job.cancel();
    reminders.delete(reminderId);
    return sendMessage(chatId, 'Напоминание удалено');
  }

  return sendMessage(chatId, 'Неизвестная команда. Напишите /start для списка команд');
}

// Отправка сообщений
async function sendMessage(chatId, text) {
  try {
    await axios.post(`${API_URL}/sendMessage`, {
      chat_id: chatId,
      text: text
    });
  } catch (err) {
    console.error('Ошибка отправки:', err.response?.data);
  }
}

// Long Polling
let lastUpdateId = 0;
async function pollUpdates() {
  try {
    const response = await axios.get(`${API_URL}/getUpdates`, {
      params: { offset: lastUpdateId + 1, timeout: 30 }
    });

    const updates = response.data.result;
    if (updates.length > 0) {
      for (const update of updates) {
        if (update.message) {
          await handleMessage(update.message);
          lastUpdateId = update.update_id;
        }
      }
    }
  } catch (err) {
    console.error('Ошибка:', err.message);
  } finally {
    setTimeout(pollUpdates, 1000);
  }
}

// Установка зависимостей
console.log('Установите зависимости, если не сделали этого ранее:');
console.log('npm install axios dotenv node-schedule');

// Запуск
console.log('⏰ Бот-напоминалка запущен...');
pollUpdates();