# Отчёт о создании Telegram-бота "Напоминалка" #

Этот отчёт описывает все этапы разработки: от создания бота в @BotFather до настройки кода и его объяснения.

## 1. Создание бота в @BotFather ##

Открыть Telegram и найти @BotFather.

Создать нового бота:

Отправить команду /newbot.

Ввести имя бота (например, ReminderBot).

Получить уникальный API-токен (например, 7356261366:AAGxlIQXIoHp98UdaK8VHkkVBluLDu0mRio).

Пример ответа от BotFather:

Done! Use this token to access the HTTP API:

7356261366:AAGxlIQXIoHp98UdaK8VHkkVBluLDu0mRio

Настроить бота (опционально):

/setdescription — добавить описание.

/setcommands — зарегистрировать команды (/start, /remind, /list и т. д.).

## 2. Настройка проекта ##

### Структура файлов ###

my_tg_bot/  
├── .env                # Токен бота  
├── index.js            # Основной код  
├── package.json        # Зависимости  
└── node_modules/       # Установленные библиотеки  

### Установка зависимостей ###

bash

npm init -y # Инициализация проекта  

npm install axios dotenv node-schedule  # Установка библиотек 

Файл .env

env

TELEGRAM_TOKEN=7356261366:AAGxlIQXIoHp98UdaK8VHkkVBluLDu0mRio

## 3. Код бота и его объяснение ## 

### Основные компоненты ###
Библиотеки

axios — для HTTP-запросов к API Telegram.

dotenv — загрузка токена из .env.

node-schedule — планировщик напоминаний.

Логика работы

Бот использует Long Polling (постоянные запросы к серверу Telegram).
Напоминания хранятся в Map (в реальном проекте лучше использовать БД).


// Запуск бота
console.log('Бот запущен...');
pollUpdates();

## 4. Запуск и тестирование ##

### Запуск бота: ###

bash

node index.js

### Проверка команд: ###

/start — приветственное сообщение.

/remind 14:30 Позвонить маме — добавить напоминание.

/list — список активных напоминаний.

/cancel 123 — удалить напоминание.

### Автозапуск (через PM2) ###

bash

npm install -g pm2

pm2 start index.js --name "ReminderBot"

pm2 save

pm2 startup

## 5. Возможные улучшения ##

- База данных → SQLite/PostgreSQL для сохранения напоминаний.

- Вебхуки → HTTPS-сервер для мгновенных уведомлений.

- Интерфейс → Inline-кнопки (reply_markup).

- Повторяющиеся напоминания → node-schedule с rule.recurrence.

## 6. Итог ##
- Бот создан в @BotFather.
- Настроен проект с axios, dotenv и node-schedule.
- Реализованы команды: /remind, /list, /cancel.
- Бот работает 24/7 (с pm2).
