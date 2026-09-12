import { Telegraf } from 'telegraf';
import dotenv from 'dotenv';
import { getSession, setUserState, setMasterKey, clearSession, BotStates } from './state.js';
import { parseAnswerKey, gradeTest, formatReport } from './grader.js';
import { extractAnswersFromImage } from './vision.js';

dotenv.config();

const token = process.env.BOT_TOKEN;
let bot = null;
if (token && token !== 'your_telegram_bot_token_here') {
  bot = new Telegraf(token);
} else {
  console.warn("DIQQAT: BOT_TOKEN ko'rsatilmagan.");
}
const webAppUrl = process.env.WEBAPP_URL || 'https://muallim-uz-one.vercel.app';

if (bot) {
  // Xatoliklarni global ushlash
  bot.catch((err, ctx) => {
    console.error(`Bot xatoligi (${ctx.updateType}):`, err);
    try {
      ctx.reply("⚠️ Kutilmagan texnik xatolik yuz berdi. Iltimos, keyinroq qayta urinib ko'ring.");
    } catch (replyErr) {
      console.error("Xatolik xabarini yuborishda muammo:", replyErr);
    }
  });

  // /start komandasi (Mini App va Bot buyruqlari)
  bot.start(async (ctx) => {
    const userId = ctx.from.id;
    clearSession(userId);

    // Pastki doimiy "Menu Button"ni Mini App ga o'rnatish
    try {
      if (webAppUrl.startsWith('https://')) {
        await ctx.telegram.setChatMenuButton({
          chat_id: ctx.chat.id,
          menu_button: {
            type: 'web_app',
            text: '🚀 Muallim AI',
            web_app: { url: webAppUrl },
          },
        });
      }
    } catch (e) {
      // Menu button qo'yishda muammo bo'lsa xabar berish shart emas
    }

    const welcomeMessage =
      `👋 <b>Assalomu alaykum, ${ctx.from.first_name || "Hurmatli O'qituvchi"}!</b>\n\n` +
      `🤖 <b>"Muallim.uz"</b> — Sun'iy intellekt (Vision AI) asosidagi aqlli o'qituvchi yordamchisiga xush kelibsiz!\n\n` +
      `💡 <b>Sizda 2 xil qulay usul bor:</b>\n` +
      `1️⃣ <b>Mini App orqali (Tavsiya etiladi):</b> Pastdagi tugma orqali ilovani to'g'ridan-to'g'ri Telegram ichida ochib, ` +
      `bir vaqtda butun sinf daftarlarini (10-30 ta) tekshiring, Excel yuklang yoki natijalarni Telegramga yuboring!\n\n` +
      `2️⃣ <b>Oddiy Bot chatida:</b> /new_test buyrug'i orqali kalit kiritib, daftarlar rasmini bittalab shu chatga yuboring.`;

    const inlineKeyboard = [];
    if (webAppUrl.startsWith('https://')) {
      inlineKeyboard.push([
        {
          text: "🚀 Muallim AI Mini App (Ochish)",
          web_app: { url: webAppUrl },
        },
      ]);
    }
    inlineKeyboard.push([
      {
        text: "📝 Chatda tekshirish (/new_test)",
        callback_data: "cmd_new_test",
      },
    ]);

    await ctx.reply(welcomeMessage, {
      parse_mode: 'HTML',
      reply_markup: {
        inline_keyboard: inlineKeyboard,
      },
    });
  });

// Inline tugma bosilganda /new_test chaqirish
bot.action('cmd_new_test', (ctx) => {
  ctx.answerCbQuery();
  const userId = ctx.from.id;
  setUserState(userId, BotStates.AWAITING_KEY);

  const promptText =
    `📝 <b>To'g'ri javoblar kalitini kiriting:</b>\n\n` +
    `Kalitni quyidagi usullardan birida yuborishingiz mumkin:\n` +
    `• Ketma-ket: <code>ABCDACBD...</code>\n` +
    `• Raqamlangan: <code>1-A, 2-B, 3-C, 4-D...</code>\n` +
    `• Vergul yoki bo'sh joy bilan: <code>A, B, C, D, A</code>\n\n` +
    `<i>Bekor qilish uchun: /cancel</i>`;

  ctx.reply(promptText, { parse_mode: 'HTML' });
});

// /help komandasi
bot.help((ctx) => {
  const helpText =
    `📖 <b>Foydalanish bo'yicha qo'llanma:</b>\n\n` +
    `• /new_test — Yangi test kalitini kiritish\n` +
    `• /cancel — Joriy amalni bekor qilish\n` +
    `• /help — Yordam va ko'rsatmalar\n\n` +
    `💡 <b>Kalit kiritish namunalari:</b>\n` +
    `1. Ketma-ket: <code>ABCDACBD</code>\n` +
    `2. Raqamlangan: <code>1-A, 2-B, 3-C, 4-D</code>\n\n` +
    `📸 <b>Rasm yuborishda:</b>\n` +
    `Varaqa yaxshi yoritilgan, tekis va harflar aniq ko'ringan bo'lishi tavsiya etiladi.`;

  ctx.reply(helpText, { parse_mode: 'HTML' });
});

// /cancel komandasi
bot.command('cancel', (ctx) => {
  const userId = ctx.from.id;
  clearSession(userId);
  ctx.reply("🛑 Jarayon bekor qilindi. Yangi test boshlash uchun /new_test buyrug'ini bosing.");
});

// /new_test komandasi
bot.command('new_test', (ctx) => {
  const userId = ctx.from.id;
  setUserState(userId, BotStates.AWAITING_KEY);

  const promptText =
    `📝 <b>To'g'ri javoblar kalitini kiriting:</b>\n\n` +
    `Kalitni quyidagi usullardan birida yuborishingiz mumkin:\n` +
    `• Ketma-ket: <code>ABCDACBD...</code>\n` +
    `• Raqamlangan: <code>1-A, 2-B, 3-C, 4-D...</code>\n` +
    `• Vergul yoki bo'sh joy bilan: <code>A, B, C, D, A</code>\n\n` +
    `<i>Bekor qilish uchun: /cancel</i>`;

  ctx.reply(promptText, { parse_mode: 'HTML' });
});

// Matnli xabarlarni qayta ishlash
bot.on('text', (ctx) => {
  const userId = ctx.from.id;
  const session = getSession(userId);
  const text = ctx.message.text?.trim();

  // Buyruqlarni e'tiborsiz qoldirish (chunki ular yuqorida ushlangan)
  if (text.startsWith('/')) {
    return;
  }

  // Agar foydalanuvchi kalit kiritish bosqichida bo'lsa
  if (session.state === BotStates.AWAITING_KEY) {
    try {
      const masterKey = parseAnswerKey(text);
      const totalQuestions = Object.keys(masterKey).length;

      setMasterKey(userId, masterKey);

      let preview = '';
      const keys = Object.keys(masterKey).sort((a, b) => Number(a) - Number(b));
      if (keys.length <= 10) {
        preview = keys.map(k => `${k}:${masterKey[k]}`).join(', ');
      } else {
        const head = keys.slice(0, 5).map(k => `${k}:${masterKey[k]}`).join(', ');
        const tail = keys.slice(-3).map(k => `${k}:${masterKey[k]}`).join(', ');
        preview = `${head} ... ${tail}`;
      }

      const successMessage =
        `✅ <b>Kalit muvaffaqiyatli saqlandi!</b>\n` +
        `Jami savollar: <b>${totalQuestions} ta</b>\n` +
        `Kalit: <code>${preview}</code>\n\n` +
        `📸 <b>Endi o'quvchining javoblar varaqasi rasmini yuboring.</b>`;

      ctx.reply(successMessage, { parse_mode: 'HTML' });
    } catch (err) {
      ctx.reply(
        `⚠️ <b>Kalitni qabul qilib bo'lmadi:</b>\n${err.message}\n\n` +
        `Iltimos, namunaga qarab qaytadan kiriting (masalan: <code>ABCDA</code> yoki <code>1-A, 2-B, 3-C</code>).`,
        { parse_mode: 'HTML' }
      );
    }
    return;
  }

  // Agar foydalanuvchi allaqachon kalit kiritgan bo'lsa va rasm kutilyotgan bo'lsa
  if (session.state === BotStates.AWAITING_PHOTO) {
    ctx.reply(
      `📌 Siz test kalitini kiritgansiz (${Object.keys(session.masterKey || {}).length} ta savol).\n\n` +
      `Iltimos, o'quvchining javoblar varaqasi <b>rasmini</b> yuboring 📸.\n` +
      `Yangi test boshlash uchun /new_test buyrug'ini bosing.`,
      { parse_mode: 'HTML' }
    );
    return;
  }

  // Aks holda (IDLE holatida)
  ctx.reply(
    `Test tekshirishni boshlash uchun /new_test buyrug'ini bering yoki yordam uchun /help deb yozing.`
  );
});

// Rasmli xabarlarni qayta ishlash (Photo message)
bot.on('photo', async (ctx) => {
  const userId = ctx.from.id;
  const session = getSession(userId);

  // Kalit mavjudligini tekshirish
  if (session.state !== BotStates.AWAITING_PHOTO || !session.masterKey) {
    ctx.reply(
      `⚠️ <b>To'g'ri javoblar kaliti belgilanmagan!</b>\n\n` +
      `Iltimos, avval /new_test buyrug'i orqali to'g'ri javoblar kalitini kiriting, ` +
      `so'ngra rasmni yuboring.`,
      { parse_mode: 'HTML' }
    );
    return;
  }

  // Eng yuqori sifatdagi rasmni tanlash (Telegram massivning oxirgi elementiga eng kattasini qo'yadi)
  const photos = ctx.message.photo;
  const highestPhoto = photos[photos.length - 1];

  let processingMsg;
  try {
    processingMsg = await ctx.reply(
      "🔍 <i>Rasm qabul qilindi. AI javoblar varaqasini tahlil qilmoqda, iltimos kuting...</i>",
      { parse_mode: 'HTML' }
    );

    // Telegram API'dan rasmning to'liq yuklab olish URL'ini olish
    const fileLink = await ctx.telegram.getFileLink(highestPhoto.file_id);

    // Vision API orqali rasmdan javoblarni va o'quvchi ismini o'qib olish
    const visionResult = await extractAnswersFromImage(fileLink.href);
    const studentAnswers = visionResult?.answers || visionResult || {};
    const studentName = visionResult?.studentName || null;

    // O'quvchi javoblarini etalon kalit bilan solishtirish
    const gradeResult = gradeTest(session.masterKey, studentAnswers, studentName);

    // Natija hisobotini shakllantirish
    const reportText = formatReport(gradeResult);

    // Jarayon xabarini o'chirib, hisobotni yuboramiz
    try {
      await ctx.telegram.deleteMessage(ctx.chat.id, processingMsg.message_id);
    } catch (_) {
      // Xabarni o'chirish imkoni bo'lmasa zarari yo'q
    }

    await ctx.reply(reportText, { parse_mode: 'HTML' });

    // Keyingi qadam bo'yicha qisqa yo'riqnoma
    await ctx.reply(
      "👉 <i>Ushbu test bo'yicha navbatdagi o'quvchi varaqasi rasmini yuborishingiz mumkin.\n" +
      "Yangi kalit kiritish uchun /new_test buyrug'ini bosing.</i>",
      { parse_mode: 'HTML' }
    );
  } catch (err) {
    console.error("Rasm tekshirishda xatolik:", err);

    // Jarayon xabarini o'chirishga harakat qilamiz
    if (processingMsg) {
      try {
        await ctx.telegram.deleteMessage(ctx.chat.id, processingMsg.message_id);
      } catch (_) {}
    }

    const errorMessage =
      `❌ <b>Rasmni tekshirishda xatolik yuz berdi:</b>\n` +
      `<i>${err.message}</i>\n\n` +
      `ℹ️ <i>Tavsiya: Rasm tiniq, yaxshi yoritilgan va test raqamlari yaqqol ko'rinadigan bo'lsin. Iltimos, qaytadan yuborib ko'ring.</i>`;

    ctx.reply(errorMessage, { parse_mode: 'HTML' });
  }
});

// Fayl (hujjat/document) ko'rinishida rasm yuborilganda
bot.on('document', async (ctx) => {
  const mimeType = ctx.message.document?.mime_type || '';
  if (mimeType.startsWith('image/')) {
    ctx.reply(
      "💡 <i>Eslatma: Rasmni fayl (hujjat) emas, oddiy rasm (siqilgan) holatida yuborsangiz tahlil tezroq va qulayroq amalga oshiriladi.</i>",
      { parse_mode: 'HTML' }
    );
  } else {
    ctx.reply("Iltimos, o'quvchining test varaqasi rasmini yuboring.");
  }
});

// Telegram Mini App'dan yuborilgan ma'lumotlarni qabul qilish (tg.sendData)
bot.on('message', async (ctx, next) => {
  const webAppData = ctx.message?.web_app_data;
  if (!webAppData?.data) {
    return next();
  }

  try {
    const payload = JSON.parse(webAppData.data);
    if (payload.type === 'test_batch_results') {
      const { totalCount, validCount, avgScore, students = [] } = payload;

      let msg = `📊 <b>Muallim AI: Sinf test natijalari</b>\n\n`;
      msg += `📁 Jami daftarlar: <b>${totalCount} ta</b>\n`;
      msg += `✅ Muvaffaqiyatli tekshirildi: <b>${validCount} ta</b>\n`;
      msg += `📈 O'rtacha ko'rsatkich: <b>${avgScore}%</b>\n\n`;
      msg += `<b>O'quvchilar ro'yxati:</b>\n`;

      students.forEach((st, idx) => {
        if (st.success) {
          const markEmoji = st.mark === 5 ? '🟢 5' : st.mark === 4 ? '🔵 4' : st.mark === 3 ? '🟡 3' : '🔴 2';
          msg += `${idx + 1}. <b>${st.name}</b> — ${st.correct} ta to'g'ri (${st.scorePercent}%) | Baho: <b>${markEmoji}</b>\n`;
        } else {
          msg += `${idx + 1}. <b>${st.name}</b> — ❌ Tekshirib bo'lmadi\n`;
        }
      });

      msg += `\n💡 <i>Hisobot Muallim.uz Mini App orqali yuborildi.</i>`;

      await ctx.reply(msg, { parse_mode: 'HTML' });
      return;
    }
  } catch (err) {
    console.error("web_app_data tahlil xatosi:", err);
  }
  return next();
});
}

// Botni ishga tushirish (Faqat Vercel bo'lmagan standalone rejimda polling qiladi)
if (bot && !process.env.VERCEL) {
  bot.launch().then(() => {
    console.log("=========================================");
    console.log("🚀 'Muallim.uz' Telegram boti ishga tushdi!");
    console.log(`🤖 AI Provayder: ${process.env.AI_PROVIDER || 'gemini (avtomatik)'}`);
    console.log("=========================================");
  }).catch((err) => {
    console.error("Botni ishga tushirishda xatolik:", err);
  });

  // Jarayonni toza to'xtatish (Graceful shutdown)
  process.once('SIGINT', () => bot.stop('SIGINT'));
  process.once('SIGTERM', () => bot.stop('SIGTERM'));
}

export { bot };
