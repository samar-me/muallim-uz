import express from 'express';
import cors from 'cors';
import multer from 'multer';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { Telegraf } from 'telegraf';
import { extractAnswersFromBuffer, checkEssayFromBuffer, checkMathFromBuffer } from './vision.js';
import { gradeTest } from './grader.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const publicDir = path.join(__dirname, '..', 'public');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Statik frontend fayllarini tarqatish (public papka)
app.use(express.static(publicDir));

// Xotirada fayllarni ushlab turish uchun Multer sozlamasi (maksimal 15 MB)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 15 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error("Faqat rasm fayllari (JPEG, PNG va h.k.) qabul qilinadi."));
    }
  },
});

// Salomatlik tekshiruvi (Health check)
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'Muallim.uz Mini App Backend' });
});

/**
 * POST /api/check-answers
 * Rasm va etalon kalitni qabul qilib, Vision AI orqali tekshirish va baholash
 */
app.post('/api/check-answers', upload.single('image'), async (req, res) => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({
        success: false,
        message: "O'quvchining test varaqasi rasmi yuklanmadi.",
      });
    }

    let masterKey = req.body.masterKey;
    if (!masterKey) {
      return res.status(400).json({
        success: false,
        message: "To'g'ri javoblar kaliti ko'rsatilmadi.",
      });
    }

    if (typeof masterKey === 'string') {
      try {
        masterKey = JSON.parse(masterKey);
      } catch (e) {
        return res.status(400).json({
          success: false,
          message: "masterKey formati noto'g'ri (JSON bo'lishi kerak).",
        });
      }
    }

    if (Object.keys(masterKey).length === 0) {
      return res.status(400).json({
        success: false,
        message: "Kalitda hech qanday savol javobi belgilanmagan.",
      });
    }

    const instruction = req.body.instruction || '';

    // Vision API orqali rasmdan javoblarni va o'quvchi ismini o'qib olish
    const visionResult = await extractAnswersFromBuffer(file.buffer, file.mimetype, instruction);
    const studentAnswers = visionResult?.answers || visionResult || {};
    const studentName = visionResult?.studentName || null;

    // Baholash
    const gradeResult = gradeTest(masterKey, studentAnswers, studentName);

    return res.json({
      success: true,
      ...gradeResult,
    });
  } catch (error) {
    console.error("API /api/check-answers xatosi:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Rasmni tekshirishda xatolik yuz berdi.",
    });
  }
});

/**
 * POST /api/extract-key
 * To'g'ri javoblar kaliti rasmini qabul qilib, Vision AI orqali etalon kalitni aniqlash
 */
app.post('/api/extract-key', upload.single('image'), async (req, res) => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({
        success: false,
        message: "Kalit varaqasi rasmi yuklanmadi.",
      });
    }

    const visionResult = await extractAnswersFromBuffer(file.buffer, file.mimetype);
    const answers = visionResult?.answers || visionResult || {};

    const validAnswers = {};
    for (const [k, v] of Object.entries(answers)) {
      if (v && typeof v === 'string' && v.trim()) {
        validAnswers[String(k)] = v.trim().toUpperCase();
      }
    }

    const total = Object.keys(validAnswers).length;
    if (total === 0) {
      return res.status(400).json({
        success: false,
        message: "Rasmdan test javoblar kaliti aniqlanmadi. Iltimos, sifatliroq rasm yuklang yoki matn orqali kiriting.",
      });
    }

    return res.json({
      success: true,
      masterKey: validAnswers,
      total,
    });
  } catch (error) {
    console.error("API /api/extract-key xatosi:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Kalit rasmini tahlil qilishda xatolik yuz berdi.",
    });
  }
});

/**
 * POST /api/check-essay
 * Insho/Bayon rasmini qabul qilib, AI orqali imlo, grammatika, mazmun tahlili va baholash
 */
app.post('/api/check-essay', upload.single('image'), async (req, res) => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({
        success: false,
        message: "Insho qo'lyozmasi rasmi yuklanmadi.",
      });
    }

    const topic = req.body.topic || '';
    const instruction = req.body.instruction || '';
    const result = await checkEssayFromBuffer(file.buffer, file.mimetype, topic, instruction);

    return res.json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error("API /api/check-essay xatosi:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Inshoni tahlil qilishda xatolik yuz berdi.",
    });
  }
});

/**
 * POST /api/check-math
 * Misol yoki masala yechilgan daftar rasmini qabul qilib, bosqichma-bosqich tekshirish
 */
app.post('/api/check-math', upload.single('image'), async (req, res) => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({
        success: false,
        message: "Masala yechilgan daftar rasmi yuklanmadi.",
      });
    }

    const taskPrompt = req.body.taskPrompt || '';
    const expectedAnswer = req.body.expectedAnswer || '';
    const instruction = req.body.instruction || '';
    const result = await checkMathFromBuffer(file.buffer, file.mimetype, taskPrompt, expectedAnswer, instruction);

    return res.json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error("API /api/check-math xatosi:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Misolni tahlil qilishda xatolik yuz berdi.",
    });
  }
});

// Bosh sahifa (index.html)
app.get('/', (req, res) => {
  res.sendFile(path.join(publicDir, 'index.html'));
});

// Serverni ishga tushirish (Vercel serverless muhitida listen shart emas)
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log("=========================================");
    console.log(`🌐 Muallim.uz WebApp Server ishga tushdi!`);
    console.log(`🔗 URL: http://localhost:${PORT}`);
    console.log(`🤖 AI Provayder: ${process.env.AI_PROVIDER || 'gemini'}`);
    console.log("=========================================");
  });
}

// Agar BOT_TOKEN berilgan bo'lsa va Vercel serverless bo'lmasa, Telegram botini ishga tushiramiz
const botToken = process.env.BOT_TOKEN;
if (!process.env.VERCEL && botToken && botToken !== 'your_telegram_bot_token_here') {
  const webAppUrl = process.env.WEBAPP_URL || `http://localhost:${PORT}`;
  const bot = new Telegraf(botToken);

  // Xatoliklarni global ushlash (server to'xtab qolmasligi uchun)
  bot.catch((err) => {
    console.error("Telegram bot xatoligi:", err.message);
  });

  bot.start(async (ctx) => {
    try {
      const isHttps = webAppUrl.startsWith('https://');

      if (isHttps) {
        await ctx.reply(
          `👋 <b>Assalomu alaykum, ${ctx.from.first_name || "O'qituvchi"}!</b>\n\n` +
          `"Muallim.uz" tizimining qulay va sodda vizual ilovasi orqali testlarni tekshirish uchun pastdagi tugmani bosing:`,
          {
            parse_mode: 'HTML',
            reply_markup: {
              inline_keyboard: [
                [
                  {
                    text: "🚀 Testni tekshirish (Mini App)",
                    web_app: { url: webAppUrl },
                  },
                ],
              ],
            },
          }
        );
      } else {
        await ctx.reply(
          `👋 <b>Assalomu alaykum, ${ctx.from.first_name || "O'qituvchi"}!</b>\n\n` +
          `⚠️ <b>Eslatma:</b> Telegram WebApp tugmasi faqat <b>HTTPS</b> manzillar bilan ishlaydi (hozir: <code>${webAppUrl}</code>).\n\n` +
          `💻 <b>Brauzerda ochib tekshirish uchun bosing:</b>\n` +
          `<a href="${webAppUrl}">${webAppUrl}</a>\n\n` +
          `📱 <b>Telegram ichida ochiladigan qilish uchun:</b>\n` +
          `1. Bepul HTTPS tunnel oching (masalan, yangi terminalda):\n` +
          `<code>npx localtunnel --port ${PORT}</code>\n` +
          `2. Chiqqan <i>https://...loca.lt</i> havolani <code>.env</code> faylidagi <code>WEBAPP_URL</code> ga qo'ying.`,
          { parse_mode: 'HTML', disable_web_page_preview: true }
        );
      }
    } catch (err) {
      console.error("Bot start xabari yuborishda xatolik:", err.message);
    }
  });

  bot.launch().then(() => {
    console.log("📱 Telegram Mini App bot faollashtirildi.");
    if (!webAppUrl.startsWith('https://')) {
      console.log(`ℹ️  Eslatma: Telegram WebApp tugmasi uchun HTTPS kerak. Hozirgi URL: ${webAppUrl}`);
      console.log(`💡 HTTPS olish uchun: npx localtunnel --port ${PORT}`);
    }
  }).catch((err) => {
    console.warn("Telegram botni ishga tushirishda xatolik (WebApp veb-server ishlashda davom etadi):", err.message);
  });

  process.once('SIGINT', () => bot.stop('SIGINT'));
  process.once('SIGTERM', () => bot.stop('SIGTERM'));
}

export default app;
