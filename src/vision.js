import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const SYSTEM_PROMPT = `Siz test tekshiruvchisiz. Rasmdan o'quvchining ism-familiyasi (agar varaqada yozilgan bo'lsa) va raqamlangan test javoblarini aniqlang.
Faqat toza JSON qaytaring:
{
  "studentName": "Aliyev Vali",
  "answers": {"1": "A", "2": "B"}
}
Agar o'quvchi ismi yozilmagan yoki topilmasa, "studentName": null qo'ying.
Agar biror savol belgilanmagan bo'lsa javobiga null qo'ying.`;

/**
 * Rasmni URL orqali yuklab olib, base64 formatiga o'tkazish
 * @param {string} fileUrl 
 * @returns {Promise<{base64: string, mimeType: string}>}
 */
export async function downloadImageAsBase64(fileUrl) {
  try {
    const response = await axios.get(fileUrl, {
      responseType: 'arraybuffer',
      timeout: 20000,
    });

    const base64 = Buffer.from(response.data).toString('base64');
    const mimeType = response.headers['content-type'] || 'image/jpeg';

    return { base64, mimeType };
  } catch (error) {
    throw new Error(`Rasmni yuklab olishda xatolik yuz berdi: ${error.message}`);
  }
}

/**
 * Gemini Vision API orqali rasmni tahlil qilish
 */
async function analyzeWithGemini(base64Data, mimeType, apiKey, preferredModel = 'gemini-flash-latest', instruction = '') {
  // Faqat API kalitga ruxsat etilgan, faol va eng tezkor multimodal modellar
  const candidateModels = [
    preferredModel,
    process.env.GEMINI_MODEL,
    'gemini-flash-latest',
    'gemini-3.1-flash-lite-preview',
    'gemini-3-flash-preview',
    'gemini-3.1-flash-lite',
    'gemini-3.5-flash',
  ];
  const modelsToTry = [...new Set(candidateModels.filter(Boolean))];

  let promptText = SYSTEM_PROMPT;
  if (instruction && instruction.trim()) {
    promptText += `\n\nMUHIM O'QITUVCHI BUYRUG'I / KO'RSATMASI:
"${instruction.trim()}"
QAT'IY QOIDA: Rasmdagi boshqa mashq, mavzu, qoralama yoki yozuvlarni TEKSHIRMANG! Faqat va faqat o'qituvchi aytgan ushbu topshiriq/variant/mashqqa tegishli test javoblarini aniqlang!`;
  }

  let lastError = null;

  for (const model of modelsToTry) {
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

        const requestBody = {
          contents: [
            {
              parts: [
                { text: promptText },
                {
                  inline_data: {
                    mime_type: mimeType || 'image/jpeg',
                    data: base64Data,
                  },
                },
              ],
            },
          ],
          generationConfig: {
            response_mime_type: 'application/json',
            temperature: 0.1,
          },
        };

        const response = await axios.post(endpoint, requestBody, {
          headers: { 'Content-Type': 'application/json' },
          timeout: 25000,
        });

        const candidates = response.data?.candidates;
        if (!candidates || candidates.length === 0) {
          throw new Error("AI rasmdan javoblarni aniqlay olmadi. Iltimos, sifatliroq va yorug'roq rasm oling.");
        }

        const rawText = candidates[0]?.content?.parts?.[0]?.text;
        if (!rawText) {
          throw new Error("AI javobi bo'sh qaytdi.");
        }

        return cleanAndParseJson(rawText);
      } catch (err) {
        lastError = err;
        const status = err.response?.status;

        // 404, 429, 503 yoki timeout bo'lsa darhol zaxiradagi keyingi modelga o'tish
        if (status === 404 || status === 429 || status === 503 || err.code === 'ECONNABORTED') {
          console.warn(`[Vision AI] Model '${model}' ${status || err.code}. Zudlik bilan keyingi modelga o'tilmoqda...`);
          break;
        }

        const isNetworkErr = err.code === 'ENOTFOUND' || err.code === 'ETIMEDOUT' || err.code === 'ECONNRESET' || !err.response;
        if (isNetworkErr) {
          const waitTime = attempt * 1000;
          console.warn(`[Vision AI] Model '${model}' internet xatosi (${err.code}). ${waitTime}ms kutilmoqda...`);
          await new Promise(r => setTimeout(r, waitTime));
          continue;
        }

        break;
      }
    }
  }

  if (lastError?.code === 'ENOTFOUND') {
    throw new Error("Internet bilan aloqa uzildi. Iltimos, internetingizni tekshirib qayta urinib ko'ring.");
  }
  throw lastError || new Error("Gemini AI modellari bilan bog'lanishda xatolik yuz berdi.");
}

const ESSAY_SYSTEM_PROMPT = `Siz ona tili va adabiyot bo'yicha professional o'qituvchisiz va insho/bayon tekshiruvchisiz.
Yuklangan qo'lyozma rasm(lar)idan o'quvchining yozgan matnini o'qing va har tomonlama tahlil qiling.
Natijani FAQAT toza JSON formatda qaytaring:
{
  "studentName": "O'quvchi ismi yoki null",
  "topic": "Insho mavzusi yoki aniqlangan sarlavha",
  "transcription": "Rasmdan o'qilgan to'liq matn (xatolari bilan birga)",
  "wordCount": 120,
  "spellingErrors": [
    {
      "original": "xato so'z yoki ibora",
      "correction": "to'g'ri shakli",
      "type": "imlo" // yoki "punktuatsiya", "uslubiy"
    }
  ],
  "criteria": {
    "content": 8, // Mavzuning yoritilishi (0-10)
    "grammar": 7, // Imlo va tinish belgilari (0-10)
    "logic": 8    // Mantiq va nutq ravonligi (0-10)
  },
  "overallScore": 77, // Umumiy foiz (0-100)
  "mark": 4, // Baho (2, 3, 4, 5)
  "teacherFeedback": "O'qituvchi xulosasi va o'quvchiga tavsiyalar (o'zbek tilida 2-3 gap)"
}`;

/**
 * Insho/Bayonni Gemini orqali tahlil qilish
 */
async function analyzeEssayWithGemini(base64Data, mimeType, apiKey, essayTopic = '', instruction = '') {
  const candidateModels = [
    process.env.GEMINI_MODEL,
    'gemini-flash-latest',
    'gemini-3.1-flash-lite-preview',
    'gemini-3-flash-preview',
    'gemini-3.1-flash-lite',
    'gemini-3.5-flash',
  ].filter(Boolean);
  const modelsToTry = [...new Set(candidateModels)];

  let lastError = null;

  for (const model of modelsToTry) {
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

        let promptText = essayTopic
          ? `${ESSAY_SYSTEM_PROMPT}\n\nKutilgan insho mavzusi: "${essayTopic}"`
          : ESSAY_SYSTEM_PROMPT;

        if (instruction && instruction.trim()) {
          promptText += `\n\nMUHIM O'QITUVCHI BUYRUG'I / KO'RSATMASI:
"${instruction.trim()}"
QAT'IY QOIDA: Daftardagi boshqa mashqlar, dars mavzulari, sanalar yoki eski yozuvlarga e'tibor bermang! Faqat va faqat o'qituvchi aytgan ushbu matn/diktant/inshoni tekshiring!`;
        }

        const requestBody = {
          contents: [
            {
              parts: [
                { text: promptText },
                {
                  inline_data: {
                    mime_type: mimeType || 'image/jpeg',
                    data: base64Data,
                  },
                },
              ],
            },
          ],
          generationConfig: {
            response_mime_type: 'application/json',
            temperature: 0.2,
          },
        };

        const response = await axios.post(endpoint, requestBody, {
          headers: { 'Content-Type': 'application/json' },
          timeout: 25000,
        });

        const candidates = response.data?.candidates;
        if (!candidates || candidates.length === 0) {
          throw new Error("AI insho matnini o'qiy olmadi. Iltimos, sifatliroq va aniqroq rasm yuklang.");
        }

        const rawText = candidates[0]?.content?.parts?.[0]?.text;
        if (!rawText) {
          throw new Error("AI javobi bo'sh qaytdi.");
        }

        return cleanAndParseEssayJson(rawText);
      } catch (err) {
        lastError = err;
        const status = err.response?.status;
        // 404, 429, 503 yoki timeout bo'lsa darhol zaxiradagi keyingi modelga o'tish
        if (status === 404 || status === 429 || status === 503 || err.code === 'ECONNABORTED') {
          console.warn(`[Vision AI Essay] Model '${model}' ${status || err.code}. Zudlik bilan keyingi modelga o'tilmoqda...`);
          break;
        }

        const isNetworkErr = err.code === 'ENOTFOUND' || err.code === 'ETIMEDOUT' || err.code === 'ECONNRESET' || !err.response;
        if (isNetworkErr) {
          const waitTime = attempt * 1000;
          console.warn(`[Vision AI Essay] Model '${model}' internet xatosi (${err.code}). ${waitTime}ms kutilmoqda...`);
          await new Promise(r => setTimeout(r, waitTime));
          continue;
        }
        break;
      }
    }
  }

  if (lastError?.code === 'ENOTFOUND') {
    throw new Error("Internet bilan aloqa uzildi. Iltimos, internetingizni tekshirib qayta urinib ko'ring.");
  }
  throw lastError || new Error("Gemini AI orqali inshoni tahlil qilishda xatolik yuz berdi.");
}

/**
 * Insho JSON natijasini tozalash va tekshirish
 */
export function cleanAndParseEssayJson(rawText) {
  let cleaned = rawText.trim();
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(?:json)?\n?/i, '').replace(/\n?```$/i, '').trim();
  }

  let parsed;
  try {
    parsed = JSON.parse(cleaned);
  } catch (err) {
    const firstBrace = cleaned.indexOf('{');
    const lastBrace = cleaned.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      parsed = JSON.parse(cleaned.substring(firstBrace, lastBrace + 1));
    } else {
      throw new Error(`Insho tahlili JSON formati noto'g'ri: ${err.message}`);
    }
  }

  // Baho hisoblash agar kiritilmagan bo'lsa
  let mark = parsed.mark || 3;
  const score = parsed.overallScore || 60;
  if (score >= 85) mark = 5;
  else if (score >= 70) mark = 4;
  else if (score >= 50) mark = 3;
  else mark = 2;

  return {
    studentName: parsed.studentName || null,
    topic: parsed.topic || "Mavzu ko'rsatilmagan",
    transcription: parsed.transcription || "",
    wordCount: parsed.wordCount || 0,
    spellingErrors: Array.isArray(parsed.spellingErrors) ? parsed.spellingErrors : [],
    criteria: parsed.criteria || { content: 5, grammar: 5, logic: 5 },
    overallScore: score,
    mark,
    teacherFeedback: parsed.teacherFeedback || "Insho o'qildi va baholandi.",
  };
}

/**
 * OpenAI Vision API (gpt-4o-mini) orqali rasmni tahlil qilish
 */
async function analyzeWithOpenAI(base64Data, mimeType, apiKey, model = 'gpt-4o-mini') {
  const endpoint = 'https://api.openai.com/v1/chat/completions';

  const requestBody = {
    model: model || 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: SYSTEM_PROMPT,
      },
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: "Rasmdagi o'quvchi belgilagan test javoblarini aniqlang va JSON formatida qaytaring.",
          },
          {
            type: 'image_url',
            image_url: {
              url: `data:${mimeType || 'image/jpeg'};base64,${base64Data}`,
            },
          },
        ],
      },
    ],
    response_format: { type: 'json_object' },
    temperature: 0.1,
  };

  const response = await axios.post(endpoint, requestBody, {
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    timeout: 45000,
  });

  const rawContent = response.data?.choices?.[0]?.message?.content;
  if (!rawContent) {
    throw new Error("AI javobi bo'sh qaytdi.");
  }

  return cleanAndParseJson(rawContent);
}

/**
 * AI qaytargan matndan JSON ni tozalab olish va normallashtirish
 * @param {string} rawText 
 * @returns {Record<string, string|null>}
 */
export function cleanAndParseJson(rawText) {
  let cleaned = rawText.trim();

  // Markdown ```json ... ``` teglarini olib tashlash
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(?:json)?\n?/i, '').replace(/\n?```$/i, '').trim();
  }

  let parsed;
  try {
    parsed = JSON.parse(cleaned);
  } catch (err) {
    const firstBrace = cleaned.indexOf('{');
    const lastBrace = cleaned.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      parsed = JSON.parse(cleaned.substring(firstBrace, lastBrace + 1));
    } else {
      throw new Error(`AI qaytargan JSON formati noto'g'ri: ${err.message}`);
    }
  }

  let studentName = null;
  let rawAnswers = parsed;

  if (parsed && typeof parsed === 'object') {
    if (parsed.studentName && typeof parsed.studentName === 'string') {
      const name = parsed.studentName.trim();
      if (name && name.toLowerCase() !== 'null' && name.toLowerCase() !== 'none') {
        studentName = name;
      }
    }

    if (parsed.answers && typeof parsed.answers === 'object') {
      rawAnswers = parsed.answers;
    } else if (parsed.results && typeof parsed.results === 'object') {
      rawAnswers = parsed.results;
    }
  }

  const normalized = {};
  for (const [key, val] of Object.entries(rawAnswers)) {
    if (key === 'studentName' || key === 'answers' || key === 'results') continue;
    if (val === null || val === undefined || String(val).toLowerCase() === 'null') {
      normalized[String(key)] = null;
    } else {
      normalized[String(key)] = String(val).trim().toUpperCase();
    }
  }

  return {
    studentName,
    answers: normalized,
  };
}

/**
 * Rasm Buffer'idan javoblarni tahlil qilish (Express yuklashlari uchun)
 * @param {Buffer} buffer 
 * @param {string} mimeType 
 * @returns {Promise<Record<string, string|null>>}
 */
export async function extractAnswersFromBuffer(buffer, mimeType = 'image/jpeg', instruction = '') {
  const apiKey = process.env.AI_API_KEY;
  if (!apiKey || apiKey === 'your_gemini_or_openai_api_key_here') {
    throw new Error("AI_API_KEY .env faylida sozlanmagan. Iltimos, administratorga xabar bering.");
  }

  let provider = (process.env.AI_PROVIDER || '').toLowerCase().trim();
  if (!provider) {
    provider = apiKey.startsWith('sk-') ? 'openai' : 'gemini';
  }

  const base64 = buffer.toString('base64');

  if (provider === 'openai') {
    const model = process.env.OPENAI_MODEL || 'gpt-4o-mini';
    return await analyzeWithOpenAI(base64, mimeType, apiKey, model);
  } else {
    const model = process.env.GEMINI_MODEL || 'gemini-flash-latest';
    return await analyzeWithGemini(base64, mimeType, apiKey, model, instruction);
  }
}

/**
 * Insho rasm Buffer'idan to'liq tahlil qilish
 * @param {Buffer} buffer 
 * @param {string} mimeType 
 * @param {string} topic 
 * @param {string} instruction
 */
export async function checkEssayFromBuffer(buffer, mimeType = 'image/jpeg', topic = '', instruction = '') {
  const apiKey = process.env.AI_API_KEY;
  if (!apiKey || apiKey === 'your_gemini_or_openai_api_key_here') {
    throw new Error("AI_API_KEY sozlanmagan.");
  }

  const base64 = buffer.toString('base64');
  return await analyzeEssayWithGemini(base64, mimeType, apiKey, topic, instruction);
}

// ==================== MATEMATIKA VA ANIQ FANLAR MODULI ====================

const MATH_SYSTEM_PROMPT = `Siz matematika, fizika va aniq fanlar bo'yicha ekspert o'qituvchisiz.
O'quvchi daftaridagi misol yoki masala yechimini bosqichma-bosqich tekshiring.
Har bir qator va amalni tahlil qiling:
1. Formulaning to'g'ri qo'llanilishi
2. Hisob-kitob amallarining aniqligi
3. Yakuniy javobning to'g'riligi

Natijani FAQAT toza JSON formatda qaytaring:
{
  "studentName": "O'quvchi ismi yoki null",
  "problemStatement": "Daftardan o'qilgan masala yoki misol sharti",
  "finalAnswer": "O'quvchining yakuniy javobi",
  "expectedAnswer": "To'g'ri yakuniy javob",
  "isFinalCorrect": true, // yoki false
  "stepsAnalysis": [
    {
      "step": "1-qadam / qator",
      "formula": "Qo'llangan ifoda yoki amal",
      "status": "correct", // "correct", "warning", "incorrect"
      "comment": "Izoh (agar xato bo'lsa qayerda adashgan)"
    }
  ],
  "scorePercent": 80, // Umumiy foiz (0-100)
  "mark": 4, // Baho (2, 3, 4, 5)
  "teacherFeedback": "O'qituvchi xulosasi va o'quvchiga tavsiya (o'zbek tilida 2-3 gap)"
}`;

/**
 * Matematika yechimini Gemini orqali tahlil qilish
 */
async function analyzeMathWithGemini(base64Data, mimeType, apiKey, taskPrompt = '', expectedAnswer = '', instruction = '') {
  const candidateModels = [
    process.env.GEMINI_MODEL,
    'gemini-flash-latest',
    'gemini-3.1-flash-lite-preview',
    'gemini-3-flash-preview',
    'gemini-3.1-flash-lite',
    'gemini-3.5-flash',
  ].filter(Boolean);
  const modelsToTry = [...new Set(candidateModels)];

  let lastError = null;

  for (const model of modelsToTry) {
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

        let promptText = MATH_SYSTEM_PROMPT;
        if (taskPrompt || expectedAnswer || instruction) {
          promptText += `\n\nO'qituvchi kiritgan ma'lumotlar:\n`;
          if (taskPrompt) promptText += `- Masala sharti: "${taskPrompt}"\n`;
          if (expectedAnswer) promptText += `- Kutilgan to'g'ri javob: "${expectedAnswer}"\n`;
          if (instruction && instruction.trim()) {
            promptText += `\nMUHIM O'QITUVCHI BUYRUG'I / KO'RSATMASI:
"${instruction.trim()}"
QAT'IY QOIDA: Daftardagi boshqa misol va masalalarni tekshirmang, FAQAT o'qituvchi aytgan ushbu misol/mashqni tekshiring!\n`;
          }
        }

        const requestBody = {
          contents: [
            {
              parts: [
                { text: promptText },
                {
                  inline_data: {
                    mime_type: mimeType || 'image/jpeg',
                    data: base64Data,
                  },
                },
              ],
            },
          ],
          generationConfig: {
            response_mime_type: 'application/json',
            temperature: 0.1,
          },
        };

        const response = await axios.post(endpoint, requestBody, {
          headers: { 'Content-Type': 'application/json' },
          timeout: 25000,
        });

        const candidates = response.data?.candidates;
        if (!candidates || candidates.length === 0) {
          throw new Error("AI matematika yechimini o'qiy olmadi. Iltimos, sifatliroq va aniqroq rasm yuklang.");
        }

        const rawText = candidates[0]?.content?.parts?.[0]?.text;
        if (!rawText) {
          throw new Error("AI javobi bo'sh qaytdi.");
        }

        return cleanAndParseMathJson(rawText);
      } catch (err) {
        lastError = err;
        const status = err.response?.status;
        // 404, 429, 503 yoki timeout bo'lsa darhol zaxiradagi keyingi modelga o'tish
        if (status === 404 || status === 429 || status === 503 || err.code === 'ECONNABORTED') {
          console.warn(`[Vision AI Math] Model '${model}' ${status || err.code}. Zudlik bilan keyingi modelga o'tilmoqda...`);
          break;
        }

        const isNetworkErr = err.code === 'ENOTFOUND' || err.code === 'ETIMEDOUT' || err.code === 'ECONNRESET' || !err.response;
        if (isNetworkErr) {
          const waitTime = attempt * 1000;
          console.warn(`[Vision AI Math] Model '${model}' internet xatosi (${err.code}). ${waitTime}ms kutilmoqda...`);
          await new Promise(r => setTimeout(r, waitTime));
          continue;
        }
        break;
      }
    }
  }

  if (lastError?.code === 'ENOTFOUND') {
    throw new Error("Internet bilan aloqa uzildi. Iltimos, internetingizni tekshirib qayta urinib ko'ring.");
  }
  throw lastError || new Error("Gemini AI orqali misolni tahlil qilishda xatolik yuz berdi.");
}

/**
 * Matematika JSON natijasini tozalash
 */
export function cleanAndParseMathJson(rawText) {
  let cleaned = rawText.trim();
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(?:json)?\n?/i, '').replace(/\n?```$/i, '').trim();
  }

  let parsed;
  try {
    parsed = JSON.parse(cleaned);
  } catch (err) {
    const firstBrace = cleaned.indexOf('{');
    const lastBrace = cleaned.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      parsed = JSON.parse(cleaned.substring(firstBrace, lastBrace + 1));
    } else {
      throw new Error(`Matematika tahlili JSON formati noto'g'ri: ${err.message}`);
    }
  }

  const score = typeof parsed.scorePercent === 'number' ? parsed.scorePercent : (parsed.isFinalCorrect ? 90 : 40);
  let mark = parsed.mark || 3;
  if (score >= 85) mark = 5;
  else if (score >= 70) mark = 4;
  else if (score >= 50) mark = 3;
  else mark = 2;

  return {
    studentName: parsed.studentName || null,
    problemStatement: parsed.problemStatement || "Masala sharti daftardan olindi",
    finalAnswer: parsed.finalAnswer || "-",
    expectedAnswer: parsed.expectedAnswer || "-",
    isFinalCorrect: Boolean(parsed.isFinalCorrect),
    stepsAnalysis: Array.isArray(parsed.stepsAnalysis) ? parsed.stepsAnalysis : [],
    scorePercent: score,
    mark,
    teacherFeedback: parsed.teacherFeedback || "Masala yechimi tahlil qilindi.",
  };
}

/**
 * Matematika yechimini tekshirish (Buffer)
 */
export async function checkMathFromBuffer(buffer, mimeType = 'image/jpeg', taskPrompt = '', expectedAnswer = '', instruction = '') {
  const apiKey = process.env.AI_API_KEY;
  if (!apiKey || apiKey === 'your_gemini_or_openai_api_key_here') {
    throw new Error("AI_API_KEY sozlanmagan.");
  }

  const base64 = buffer.toString('base64');
  return await analyzeMathWithGemini(base64, mimeType, apiKey, taskPrompt, expectedAnswer, instruction);
}

/**
 * Rasm URL'idan javoblarni tahlil qilish (Telegram bot xabarlari uchun)
 * @param {string} imageUrl 
 * @returns {Promise<Record<string, string|null>>}
 */
export async function extractAnswersFromImage(imageUrl) {
  const { base64, mimeType } = await downloadImageAsBase64(imageUrl);
  const buffer = Buffer.from(base64, 'base64');
  return await extractAnswersFromBuffer(buffer, mimeType);
}
