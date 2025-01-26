const TelegramBot = require('node-telegram-bot-api');
const ffmpeg = require('fluent-ffmpeg');
const fs = require('fs');
const path = require('path');
const ytSearch = require('yt-search');
const ytdl = require('ytdl-core-discord');
require('dotenv').config();

const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: true });
const youtubedl = require('youtube-dl-exec');

// bot.on('message', async (msg) => {
//   const chatId = msg.chat.id;
//   const query = msg.text;

//   try {
//     const outputFileName = `${Date.now()}_${query.replace(/[^a-zA-Z0-9]/g, '_')}.mp3`;
//     const outputPath = path.join(__dirname, outputFileName);

//     bot.sendMessage(chatId, `🔍 \"${query}\" qo'shig'ini izlayapman...`);

//     const searchResult = await ytSearch(query);
//     if (!searchResult.videos.length) {
//       return bot.sendMessage(chatId, '❌ Qo‘shiq topilmadi.');
//     }

//     const video = searchResult.videos[0];

//     bot.sendMessage(chatId, `🎵 Topildi: ${video.title}! Yuklab olinmoqda...`);

//     // Yuklab olish va MP3 formatga o‘tkazish
//     await youtubedl(video.url, {
//       extractAudio: true,
//       audioFormat: 'mp3',
//       output: outputPath,
//     });

//     bot.sendMessage(chatId, '✅ Yuklab olindi! MP3 formatda jo‘natmoqdaman...');
//     bot.sendAudio(chatId, outputPath).then(() => {
//       fs.unlinkSync(outputPath);
//     });
//   } catch (error) {
//     console.error('Xatolik:', error);
//     bot.sendMessage(chatId, '❌ Yuklashda xatolik yuz berdi.');
//   }
// });

bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const query = msg.text;

  try {
    const outputFileName = `${Date.now()}_${query.replace(/[^\w\s]/gi, '').replace(/\s+/g, '_')}.mp3`;
    const outputPath = path.join(__dirname, outputFileName);

    bot.sendMessage(chatId, `🔍 \"${query}\" qo'shig'ini izlayapman...`);

    const searchResult = await ytSearch(query);
    if (!searchResult || !searchResult.videos.length) {
      return bot.sendMessage(chatId, '❌ Qo‘shiq topilmadi.');
    }

    const video = searchResult.videos[0];
    bot.sendMessage(chatId, `🎵 Topildi: ${video.title}! Yuklab olinmoqda...`);

    // Cookie-fayldan foydalanib yuklab olish
    await youtubedl(video.url, {
      extractAudio: true,
      audioFormat: 'mp3',
      cookies: path.join(__dirname, 'cookies.txt'), // Cookies faylni ulash
      output: outputPath,
    });

    bot.sendMessage(chatId, '✅ Yuklab olindi! MP3 formatda jo‘natmoqdaman...');
    await bot.sendAudio(chatId, outputPath);

    // Faylni o‘chirish
    fs.unlink(outputPath, (err) => {
      if (err) console.error('Faylni o‘chirishda xatolik:', err);
    });
  } catch (error) {
    console.error('Xatolik:', error);
    bot.sendMessage(chatId, `❌ Yuklashda xatolik: ${error.message || 'Noma’lum xatolik'}`);
  }
});