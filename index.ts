import TelegramBot from 'node-telegram-bot-api';
import mongoose from 'mongoose';


// DB
mongoose.connect(process.env.MONGO_DB_URL);

const messageSchema = new mongoose.Schema({
    userId: Number,
    message: String,
    date: { type: Date, default: Date.now }
});

const Message = mongoose.model('Message', messageSchema);



// BOT
const TOKEN = '7800631883:AAFlxxkhpZiIbjkEHWGVcMS-Zqgo_qByHQE';
const bot = new TelegramBot(TOKEN, { polling: true });

const startKeyboard = {
    reply_markup: {
        keyboard: [
            [{ text: '📜 Історія повідомлень' }]
        ],
        resize_keyboard: true,
        one_time_keyboard: true
    }
};

bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;
    if (text == '/start') return;
    if (text === '📜 Історія повідомлень') {
        return sendHistory(chatId);
    }

    const newMessage = new Message({
        userId: chatId,
        message: text
    });

    try {
        await newMessage.save();

        bot.sendMessage(chatId, 'Ваше повідомлення збережено!', startKeyboard);
    } catch (error) {
        bot.sendMessage(chatId, 'Виникла помилка при збереженні повідомлення.', startKeyboard);
        console.error(error);
    }
});

async function sendHistory(chatId) {
    try {
        const messages = await Message.find({ userId: chatId });

        if (messages.length === 0) {
            bot.sendMessage(chatId, 'У вас немає збережених повідомлень.');
        } else {
            let response = 'Ваші повідомлення:\n\n';
            messages.forEach((message, index) => {
                response += `${index + 1}. ${message.message} (Дата: ${message.date.toLocaleString()})\n`;
            });

            bot.sendMessage(chatId, response);
        }
    } catch (error) {
        bot.sendMessage(chatId, 'Виникла помилка при отриманні історії повідомлень.');
        console.error(error);
    }
}

bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;

    bot.sendMessage(chatId, 'Вітаємо! Виберіть опцію:', startKeyboard);
});