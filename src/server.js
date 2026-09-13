import express from 'express';
import cors from 'cors';
import multer from 'multer';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { extractAnswersFromBuffer, checkEssayFromBuffer, checkMathFromBuffer } from './vision.js';
import { gradeTest } from './grader.js';
import { bot } from './bot.js';

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

// Rasm va logolarni ishonchli uzatish
app.get('/muallim_logo.jpg', (req, res) => {
  const possiblePaths = [
    path.join(publicDir, 'muallim_logo.jpg'),
    path.join(process.cwd(), 'public', 'muallim_logo.jpg'),
    path.resolve('public/muallim_logo.jpg')
  ];
  for (const p of possiblePaths) {
    if (fs.existsSync(p)) {
      res.setHeader('Content-Type', 'image/jpeg');
      res.setHeader('Cache-Control', 'public, max-age=86400');
      return res.sendFile(path.resolve(p));
    }
  }
  res.status(404).send('Logo topilmadi');
});

app.get('/muallim_banner.jpg', (req, res) => {
  const possiblePaths = [
    path.join(publicDir, 'muallim_banner.jpg'),
    path.join(process.cwd(), 'public', 'muallim_banner.jpg'),
    path.resolve('public/muallim_banner.jpg')
  ];
  for (const p of possiblePaths) {
    if (fs.existsSync(p)) {
      res.setHeader('Content-Type', 'image/jpeg');
      res.setHeader('Cache-Control', 'public, max-age=86400');
      return res.sendFile(path.resolve(p));
    }
  }
  res.status(404).send('Banner topilmadi');
});

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

/**
 * Telegram Webhook Handler (Vercel Serverless uchun)
 * Kompyuteringiz o'chiq bo'lsa ham bot 24/7 ishlab turishi uchun
 */
app.post('/api/telegram-webhook', async (req, res) => {
  try {
    if (bot) {
      await bot.handleUpdate(req.body, res);
    } else {
      res.status(200).send('OK');
    }
  } catch (err) {
    console.error("Telegram Webhook xatosi:", err);
    res.status(200).send('OK');
  }
});

// Statik rasmlarni serverless orqali to'g'ridan-to'g'ri berish
app.get(['/muallim_logo.jpg', '/api/muallim_logo.jpg'], (req, res) => {
  res.sendFile(path.join(publicDir, 'muallim_logo.jpg'));
});
app.get(['/muallim_banner.jpg', '/api/muallim_banner.jpg'], (req, res) => {
  res.sendFile(path.join(publicDir, 'muallim_banner.jpg'));
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

export default app;
