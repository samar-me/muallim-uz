# 🎓 "Muallim.uz" — Telegram WebApp (Mini App)

O‘qituvchilar va repetitorlar uchun test javoblari varaqalarini sun'iy intellekt (Multimodal Vision AI) yordamida tezkor tekshiruvchi va baholovchi **Telegram WebApp (Mini App)**.

---

## 🌟 Asosiy Imkoniyatlar (Ultra-sodda vizual interfeys)

1. **1-sahifa (Moslashuvchan Kalit Kiritish):**
   - **Savollar sonini tanlash:** `[10]` `[15]` `[20]` `[25]` `[30]` ta tezkor presetlar hamda `[-]` va `[+]` tugmalari (5 dan 50 tagacha).
   - Har bir qatorda `[A]`, `[B]`, `[C]`, `[D]` tugmalari — tanlanganda yashil rangda ajralib turadi.
   - Pastda katta **"Tekshirishga o'tish"** tugmasi.

2. **2-sahifa (Kamera va Batch rejim):**
   - `<input type="file" id="bulkUpload" multiple accept="image/*">` va to'g'ridan-to'g'ri kamera tugmasi.
   - Rasm olingach ketma-ket **"➕ Yana suratga olish"** yoki **"Galereyadan qo'shish"** orqali butun sinf daftarlarini bitta ro'yxatga jamlash imkoniyati.
   - Har bir rasmni o'chirish (✕) yoki tozalash.
   - Real-vaqtli **Progress bar**: `"X / Y ta daftar tekshirildi (Z%)"`.

3. **3-sahifa (Guruh natijalari, Ism aniqlash va CSV):**
   - **O'quvchi ismini aniqlash (OCR):** AI varaqaning yuqorisidagi o'quvchi ism-familiyasini (masalan: *"Aliyev Vali"*) avtomatik o'qiydi.
   - **Natijalar jadvali (Table):** O'quvchi ismi, To'g'ri, Xato, Ball va Baho.
   - **Tafsilot (Modal):** O'sha o'quvchining savolma-savol yashil/qizil tahlili.
   - **Natijalarni CSV yuklab olish:** O'quvchilar ismi bilan birga Excel'ga to'liq eksport.

---

## 📂 Fayllar Tuzilmasi

```text
muallim-uz/
├── public/                 # Telegram WebApp Frontend (statik)
│   ├── index.html          # HTML5 + TailwindCSS + Telegram WebApp SDK
│   └── app.js              # 3 sahifali State Machine va kamera bilan ishlash logikasi
├── src/
│   ├── server.js           # Express veb-server va /api/check-answers API
│   ├── vision.js           # Multimodal Vision AI integratsiyasi (Gemini / OpenAI)
│   └── grader.js           # 5 ballik baholash va tahlil mantig'i
├── test/
│   ├── test_grader.js      # Grader testlari
│   └── test_vision_parsing.js # AI JSON parser testlari
├── .env.example            # Sozlamalar namunasi
├── .env                    # Kalitlar
├── package.json
└── README.md
```

---

## 🛠️ O'rnatish va Ishga Tushirish

### 1. Bog'liqliklarni o'rnatish
```bash
npm install
```

### 2. `.env` faylini sozlash
`.env` faylini oching:
```env
PORT=3000

# Telegram Bot token (@BotFather dan olingan)
BOT_TOKEN=your_telegram_bot_token_here

# WebApp URL (Mahalliy sinov uchun localhost, ishlab chiqarishda HTTPS domen yoki ngrok)
WEBAPP_URL=http://localhost:3000

# AI Provayderi: "gemini" yoki "openai"
AI_PROVIDER=gemini

# AI API kaliti:
# - Google AI Studio (Gemini): https://aistudio.google.com/app/apikey
# - OpenAI (GPT-4o-mini): https://platform.openai.com/api-keys
AI_API_KEY=your_gemini_or_openai_api_key_here
```

### 3. Serverni ishga tushirish
Ishlab chiqish rejimida:
```bash
npm run dev
```

Standart rejimda:
```bash
npm start
```

Brauzerda ochish: `http://localhost:3000`

---

## 📱 Telegram'da Mini App Sifatida Ulash

Telegram Mini App'lari xavfsizlik talablariga ko'ra **HTTPS** protokoli orqali ishlashi kerak.

1. Mahalliy sinov uchun bepul **ngrok** yoki **localtunnel** orqali HTTPS havola oling:
   ```bash
   npx localtunnel --port 3000
   ```
   yoki
   ```bash
   ngrok http 3000
   ```
2. Olingan `https://xxxx.loca.lt` manzilini `.env` ichidagi `WEBAPP_URL` ga yozing.
3. Telegram'da [@BotFather](https://t.me/BotFather) ga kiring:
   - `/mybots` -> Botingizni tanlang -> `Bot Settings` -> `Menu Button` -> `Configure menu button`
   - O'zingizning HTTPS havolangizni yuboring va tugma nomini kiriting (masalan: `Test tekshirish 🚀`).
4. Endi foydalanuvchi botingizga kirishi bilanoq pastdagi menyu tugmasi orqali to'liq ekranli Mini App'dan foydalana oladi!
