const cloudinary = require('cloudinary').v2;
const { Telegraf, Markup, session } = require('telegraf');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();
const BOT_TOKEN = process.env.BOT_TOKEN;
const MONGO_URI = process.env.MONGO_URI;
const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY;
const CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET;
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;
app.get('/', (req, res) => {
  res.send('Bot is alive and running!');
});

// 4. Запуск прослуховування порту
app.listen(PORT, () => {
  console.log(`Web server is listening on port ${PORT}`);
});
cloudinary.config({ 
        cloud_name: CLOUDINARY_CLOUD_NAME, 
        api_key: CLOUDINARY_API_KEY, 
        api_secret: CLOUDINARY_API_SECRET // Click 'View API Keys' above to copy your API secret
    });

// (async function() {

    // Configuration
    
    
    // Upload an image
    //  const uploadResult = await cloudinary.uploader
    //    .upload(
    //        'https://res.cloudinary.com/demo/image/upload/getting-started/shoes.jpg', {
    //            public_id: 'shoes',
    //        }
    //    )
    //    .catch((error) => {
    //        console.log(error);
    //    });
    
    // console.log(uploadResult);
    
    // Optimize delivery by resizing and applying auto-format and auto-quality
//     const optimizeUrl = cloudinary.url('shoes', {
//         fetch_format: 'auto',
//         quality: 'auto'
//     });
    
//     console.log(optimizeUrl);
    
//     // Transform the image: auto-crop to square aspect_ratio
//     const autoCropUrl = cloudinary.url('shoes', {
//         crop: 'auto',
//         gravity: 'auto',
//         width: 500,
//         height: 500,
//     });
    
//     console.log(autoCropUrl);    
// })();

// 1. Вставте сюди ваш токен, який ви отримали від @BotFather у Telegram
// Токен має бути в одинарних лапках!
const bot = new Telegraf(BOT_TOKEN);


mongoose.connect(MONGO_URI)
    .then(() => console.log('Підключення до MongoDB успішне!'))
    .catch((err) => console.error('Помилка підключення до MongoDB:', err));

    const projectSchema = new mongoose.Schema({
    type: String, // 'photo' або 'text'
    content: String, // URL для фото або текст для текстових повідомлень
    description: String, // Опис для фото (можна залишити порожнім для текстових повідомлень)
    link: String, // Додаткове поле для збереження посилання (якщо потрібно)
    date: { type: Date, default: Date.now } // Дата створення поста
});



const postSchema = new mongoose.Schema({
    type: String, // 'photo' або 'text'
    content: String, // URL для фото або текст для текстових повідомлень
    description: String, // Опис для фото (можна залишити порожнім для текстових повідомлень)
    date: { type: Date, default: Date.now } // Дата створення поста

});

const Post = mongoose.model('Post', postSchema);
const Project = mongoose.model('Project', projectSchema);

// 2. Реакція на команду /start

bot.use(session());



bot.start((ctx) => {
    ctx.reply('Привіт! Я твій новий бот на Telegraf 🚀',
        Markup.keyboard([
            ['Завантажити проект'],
            ['Завантажити пост'],
            ['Допомога']
        ]).resize());
});

bot.hears('Допомога', (ctx) => {
    ctx.reply('Ось список команд, які я підтримую:\n/start - Почати спілкування з ботом\n/help - Показати це повідомлення');
});


// 1. Обробка кнопок меню
bot.hears('Завантажити проект', (ctx) => {
    ctx.session = { isUploadingPhoto: true }; // Скидаємо сесію та ставимо прапорець
    ctx.reply('Відправте фото для ПРОЕКТУ:');
});

bot.hears('Завантажити пост', (ctx) => {
    ctx.session = { isUploadingPhotoPost: true }; // Скидаємо сесію та ставимо прапорець
    ctx.reply('Відправте фото для ПОСТУ:');
});

// 2. ЄДИНИЙ обробник фото
bot.on('photo', async (ctx) => {
    const isProject = ctx.session?.isUploadingPhoto;
    const isPost = ctx.session?.isUploadingPhotoPost;

    if (isProject || isPost) {
        const loadingMessage = await ctx.reply('⏳ Завантажую фото...');
        try {
            const photo = ctx.message.photo[ctx.message.photo.length - 1];
            const fileLink = await ctx.telegram.getFileLink(photo.file_id);
            const cloudResult = await cloudinary.uploader.upload(fileLink.href, { folder: 'portfolio_bot' });

            ctx.session.tempImageUrl = cloudResult.secure_url;
            await ctx.telegram.deleteMessage(ctx.chat.id, loadingMessage.message_id);

            if (isProject) {
                ctx.session.isUploadingPhoto = false;
                ctx.session.isWaitingForText = true;
                ctx.reply('✅ Фото проекту готове! Тепер надішліть ОПИС:');
            } else {
                ctx.session.isUploadingPhotoPost = false;
                ctx.session.isWaitingForTextPost = true;
                ctx.reply('✅ Фото посту готове! Тепер надішліть ТЕКСТ ПОСТУ:');
            }
        } catch (e) {
            ctx.reply('❌ Помилка завантаження.');
        }
    }
});

// 3. ЄДИНИЙ обробник тексту
bot.on('text', async (ctx) => {
    const session = ctx.session;
    if (!session) return;

    // ЛОГІКА ПРОЕКТУ: Крок 1 (Опис)
    if (session.isWaitingForText) {
        session.tempDescription = ctx.message.text;
        session.isWaitingForText = false;
        session.isWaitingForLink = true;
        return ctx.reply('Текст отримано! Тепер надішліть ПОСИЛАННЯ (або напишіть "Немає"):');
    }

    // ЛОГІКА ПРОЕКТУ: Крок 2 (Посилання + Збереження)
    if (session.isWaitingForLink) {
        try {
            const newProject = new Project({
                type: 'project',
                content: session.tempImageUrl,
                description: session.tempDescription,
                link: ctx.message.text
            });
            await newProject.save();
            ctx.session = null; // Очищення
            return ctx.reply('🎉 Проект успішно збережено!');
        } catch (e) {
            return ctx.reply('❌ Помилка БД.');
        }
    }

    // ЛОГІКА ПОСТУ: (Текст + Збереження)
    if (session.isWaitingForTextPost) {
        try {
            const newPost = new Post({
                type: 'post',
                content: session.tempImageUrl,
                description: ctx.message.text
            });
            await newPost.save();
            ctx.session = null; // Очищення
            return ctx.reply('🎉 Пост успішно збережено!');
        } catch (e) {
            return ctx.reply('❌ Помилка БД.');
        }
    }
});


// 4. Запуск бота
bot.launch();

console.log('Бот успішно запущений! Перейдіть у Telegram і напишіть йому /start');