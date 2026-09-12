// Muallim.uz — 3 Tilli To'liq Lug'at (i18n)
// uz: O'zbekcha (Lotin), uz_cyrl: Ўзбекча (Кирилл), ru: Русский

const I18N = {
  uz: {
    langName: "O'zbekcha",
    langCode: "uz",
    flag: "🇺🇿",

    // Header
    appName: "Muallim.uz",
    appSubtitleTest: "Testlarni tezkor tekshiruvchi",
    appSubtitleEssay: "Insho va Diktant tekshiruvchi",
    appSubtitleMath: "Matematika va Aniq fanlar",
    guideBtn: "Qo'llanma",
    langBtn: "O'zbekcha",

    // Tabs
    tabTest: "Test",
    tabEssay: "Insho",
    tabMath: "Matematika",

    // Step Badges
    stepKey: "1-qadam: Kalit",
    stepSheets: "2-qadam: Daftarlar",
    stepResults: "3-qadam: Natijalar",
    stepEssay: "Insho tahlili",
    stepMath: "Misol yechimi",

    // Screen 1: Key
    questionCountTitle: "Savollar soni",
    questionCountSub: "Nechta savollik test?",
    questionCountUnit: "ta",
    autoKeyBanner: "Kalitni avtomatik kiritish",
    btnKeyFromImage: "Rasmdan (AI)",
    btnKeyFromText: "Matndan joylashtir",
    correctAnswersTitle: "To'g'ri javoblar",
    correctAnswersSub: "Har bir savolning to'g'ri javobini tanlang:",
    keyProgressText: "{filled} / {total} belgilandi",
    btnProceedToSheets: "Daftarlarni tekshirishga o'tish →",

    // Screen 2: Sheets
    btnBackToKey: "← Kalitni tahrirlash",
    uploadTitle: "Daftarlarni yuklang",
    uploadDesc: "Bitta yoki bir vaqtda butun sinf daftarlarini (10–30 ta) tanlashingiz mumkin",
    btnUploadBig: "YUKLASH",
    btnCamera: "Kamera",
    btnOr: "yoki",
    btnGallery: "Galereyadan",
    uploadTip: "💡 Bir nechta daftar rasmini bir vaqtda tanlashingiz va barchasini bittada tekshirishingiz mumkin",
    selectedCountText: "{count} ta rasm tanlandi",
    selectedSheetsLabel: "Tanlangan javob varaqlari:",
    btnClearAll: "Tozalash",
    btnCheckAll: "Hammasini tekshirish ({count} ta)",
    btnAddMoreCamera: "Yana rasm",
    btnAddMoreGallery: "Yana fayl",
    addMoreTile: "Qo'shish",

    // O'qituvchi buyrug'i (Teacher Instruction)
    teacherInstructionTitle: "O'qituvchi buyrug'i (ixtiyoriy):",
    teacherInstructionSub: "Rasmdagi boshqa mashqlarni tekshirib yubormasligi uchun",
    teacherInstructionPlaceholder: "Masalan: Faqat 2-variantni tekshir yoki Faqat 5-mashqni tekshir",
    teacherInstructionTip: "💡 Agar daftarda boshqa mashqlar ham yozilgan bo'lsa, AI faqat keraklisini tekshirishi uchun shu yerga yozing.",
    chipVar1: "Faqat 1-variant",
    chipVar2: "Faqat 2-variant",
    chipLastEx: "Oxirgi mashq",
    chipRedPen: "Qizil ruchkalisi",
    chipBottomDictation: "Pastdagi diktant",
    chipEssayOnly: "Faqat insho qismi",
    chipMathEx1: "Faqat 1-misol",
    chipMathExLast: "Oxirgi tenglama",

    // Stepper & Jurnal Filter
    stepperKey: "Kalit",
    stepperSheets: "Daftarlar",
    stepperResults: "Jurnal",
    searchStudentPlaceholder: "O'quvchini qidirish...",
    filterAll: "Barchasi",
    filter5: "5 baho",
    filter4: "4 baho",
    filter3: "3 baho",
    filter2: "2 baho",
    // Loading
    loadingTitle: "Tahlil qilinmoqda...",
    loadingCounter: "{current} / {total} ta",
    loadingWait: "Iltimos, kuting...",
    loadingSingle: "AI daftarni tahlil qilmoqda...",

    // Screen 3: Results
    resultsComplete: "✅ Tekshiruv yakunlandi",
    batchTotalCount: "Jami: {count} ta",
    batchAvgScore: "O'rtacha: {score}%",
    gradeBadge5: "5 baho: {count} ta",
    gradeBadge4: "4 baho: {count} ta",
    gradeBadge3: "3 baho: {count} ta",
    gradeBadge2: "2 baho: {count} ta",
    btnExportCsv: "Excel (CSV) ko'rinishida yuklab olish",
    btnSendToTelegram: "Telegramga yuborish ✈️",
    telegramSentSuccess: "Natijalar Telegram botga muvaffaqiyatli yuborildi! ✅",
    tableCardTitle: "📊 Daftarlar ro'yxati",
    tableCardSub: "Batafsil uchun bosing",
    thStudent: "O'quvchi",
    thCorrect: "✓",
    thIncorrect: "✕",
    thScore: "Ball",
    thMark: "Baho",
    thAction: "Amal",
    btnView: "Ko'rish",
    btnEdit: "✏️",
    btnNextStudent: "Keyingi daftarlar",
    btnResetAll: "Yangi test (kalitni o'zgartirish)",
    sheetDefaultName: "#{number}-daftar",
    markSuffix: "baho",
    itemsCountUnit: "ta",

    // Essay Section
    essayCardTitle: "Insho / Bayon / Diktant",
    essayCardSub: "O'quvchi daftaridan AI tahlil",
    essayTopicLabel: "Mavzu yoki sarlavha (ixtiyoriy):",
    essayTopicPlaceholder: "Masalan: Vatanim — mening faxrim...",
    essayTopicTip: "Mavzuni kiritsangiz AI aniqroq baholaydi",
    btnEssayCamera: "Rasmga olish",
    btnEssayGallery: "Galereyadan",
    essayCriteriaTitle: "Baholash mezonlari (10 ballik):",
    critContent: "Mavzu",
    critGrammar: "Grammatika",
    critLogic: "Mantiq",
    essayErrorsTitle: "Imlo va xatolar",
    essayErrorsCount: "{count} ta xato",
    essayFeedbackTitle: "💡 O'qituvchi xulosasi:",
    essayTransSummary: "📄 Daftardan o'qilgan matn",
    btnNextEssay: "Keyingi insho",
    wordsCountUnit: "ta so'z",

    // Math Section
    mathCardTitle: "Matematika va Aniq fanlar",
    mathCardSub: "Misol va masalalarni bosqichma-bosqich",
    mathPromptLabel: "Masala yoki misol sharti (ixtiyoriy):",
    mathPromptPlaceholder: "Masalan: 2x + 5 = 15 tenglamani yeching",
    mathAnswerLabel: "Kutilgan yakuniy javob (ixtiyoriy):",
    mathAnswerPlaceholder: "Masalan: x = 5",
    mathTip: "💡 Kiritmasa ham AI o'zi hisoblab aniqlaydi",
    btnMathCameraSingle: "Bitta rasm",
    btnMathGalleryBatch: "Ko'p daftar (Sinf)",
    mathBatchTitle: "Sinf natijalari — Matematika",
    mathBatchAvg: "O'rtacha: {score}%",
    thMathResult: "Natija",
    btnExportMathCsv: "Excel (CSV)",
    btnNextMathBatch: "Yangi daftarlar",
    btnNextMathSingle: "Keyingi misol",
    mathStepsTitle: "📐 Yechish bosqichlari:",
    mathFeedbackTitle: "💡 O'qituvchi xulosasi:",
    statusCorrect: "To'g'ri ✅",
    statusIncorrect: "Noto'g'ri ❌",
    studentAnswerLabel: "O'quvchi javobi:",
    expectedAnswerLabel: "To'g'ri javob:",

    // Text Key Modal
    textKeyModalTitle: "Matndan kalit yuklash",
    textKeyModalDesc: "To'g'ri javoblarni matn shaklida kiriting yoki nusxalab qo'ying:",
    textKeyPlaceholder: "Masalan: ABCDACBDA yoki\n1-A, 2-B, 3-C, 4-D...",
    textKeyFormats: "💡 Qo'llab-quvvatlanadi: ABCD... yoki 1-A, 2-B, 3-C",
    btnCancel: "Bekor qilish",
    btnApply: "Qo'llash",

    // Edit Modal
    editModalTitle: "O'quvchi natijasini tahrirlash",
    editStudentNameLabel: "O'quvchi F.I.Sh:",
    editStudentNamePlaceholder: "Ism familiya",
    editMarkLabel: "Baho:",
    editScorePercentLabel: "Ball foizi (%):",
    btnSave: "Saqlash",

    // Details Modal
    detailsModalTitle: "Daftar tafsiloti",
    btnClose: "Yopish",
    detailsCorrectBadge: "To'g'ri",
    detailsIncorrectBadge: "Xato",
    detailsStudentLabel: "Javob:",
    detailsCorrectLabel: "To'g'ri:",

    // Language Modal
    langModalTitle: "Tilni tanlang",
    langModalSub: "Dasturdan qaysi tilda foydalanmoqchisiz?",
    btnConfirmLang: "Tanlash va davom etish →",

    // Interactive On-Screen Spotlight Tour
    tourStepCount: "{current} / {total}-qadam",
    tourBtnNext: "Keyingisi →",
    tourBtnPrev: "Orqaga",
    tourBtnFinish: "Tushundim, boshlash!",
    tourBtnSkip: "O'tkazib yuborish",
    tourSteps: [
      {
        title: "3 xil tekshirish yo'nalishi",
        desc: "Bu yerdan kerakli bo'limni tanlaysiz: oddiy <b>Test</b>, ona tili bo'yicha <b>Insho/Diktant</b> yoki <b>Matematika</b> misollari.",
        hint: "Bosib rejimni o'zgartirib ko'rishingiz mumkin!"
      },
      {
        title: "Savollar soni va tezkor tugmalar",
        desc: "Test nechta savoldan iboratligini <b>+</b> va <b>-</b> orqali yoki tezkor <b>10, 15, 20, 25, 30</b> tugmalarini bosib bir zumda belgilaysiz.",
        hint: "Har bir bosish savollar sonini avtomatik sozlaydi."
      },
      {
        title: "Kalitni avtomatik yuklash",
        desc: "To'g'ri javoblarni birma-bir kiritish shart emas! <b>📷 Rasmdan</b> tugmasi bilan to'g'ri javoblar varaqasini rasmga oling yoki <b>📋 Matndan</b> orqali nusxalab qo'ying.",
        hint: "Sun'iy intellekt javoblarni o'zi to'ldirib beradi."
      },
      {
        title: "To'g'ri javoblar (A, B, C, D)",
        desc: "Bu yerda har bir savolning to'g'ri javobini bitta bosish bilan tanlaysiz yoki o'zgartirasiz. Tanlangan harf yashil rangda ajralib turadi.",
        hint: "Qo'lda kiritish ham juda oson va tezkor."
      },
      {
        title: "Tekshirishga o'tish tugmasi",
        desc: "Kalitlar kiritib bo'lingach, ushbu katta yashil tugmani bosing va o'quvchilar daftarlarini tekshirish bosqichiga o'ting.",
        hint: "Kalit tayyor bo'lgach bosing."
      },
      {
        title: "Daftarlarni yuklash (Butun sinf)",
        desc: "Bu yerda bir vaqtning o'zida butun sinfning <b>10 tadan 30 tagacha</b> daftarini galereyadan bittada tanlashingiz yoki ketma-ket rasmga olishingiz mumkin!",
        hint: "AI daftarlardan o'quvchi ismini ham avtomatik o'qiydi."
      },
      {
        title: "Qo'llanma va Til tugmalari",
        desc: "Istalgan paytda ushbu tushuntirishlarni qayta ko'rish uchun <b>❓ Qo'llanma</b> tugmasini, tilni almashtirish uchun esa <b>🌐 Til</b> tugmasini bosing.",
        hint: "Siz endi tizimdan bemalol foydalana olasiz! Omad, ustoz!"
      }
    ]
  },

  uz_cyrl: {
    langName: "Ўзбекча",
    langCode: "uz_cyrl",
    flag: "🇺🇿",

    // Header
    appName: "Muallim.uz",
    appSubtitleTest: "Тестларни тезкор текширувчи",
    appSubtitleEssay: "Иншо ва Диктант текширувчи",
    appSubtitleMath: "Математика ва Аниқ фанлар",
    guideBtn: "Қўлланма",
    langBtn: "Ўзбекча",

    // Tabs
    tabTest: "Тест",
    tabEssay: "Иншо",
    tabMath: "Математика",

    // Step Badges
    stepKey: "1-қадам: Калит",
    stepSheets: "2-қадам: Дафтарлар",
    stepResults: "3-қадам: Натижалар",
    stepEssay: "Иншо таҳлили",
    stepMath: "Мисол ечими",

    // Screen 1: Key
    questionCountTitle: "Саволлар сони",
    questionCountSub: "Нечта саволлик тест?",
    questionCountUnit: "та",
    autoKeyBanner: "Калитни автоматик киритиш",
    btnKeyFromImage: "Расмдан (AI)",
    btnKeyFromText: "Матндан жойлаштир",
    correctAnswersTitle: "Тўғри жавоблар",
    correctAnswersSub: "Ҳар бир саволнинг тўғри жавобини танланг:",
    keyProgressText: "{filled} / {total} белгиланди",
    btnProceedToSheets: "Дафтарларни текширишга ўтиш →",

    // Screen 2: Sheets
    btnBackToKey: "← Калитни таҳрирлаш",
    uploadTitle: "Дафтарларни юкланг",
    uploadDesc: "Битта ёки бир вақтда бутун синф дафтарларини (10–30 та) танлашингиз мумкин",
    btnUploadBig: "ЮКЛАШ",
    btnCamera: "Камера",
    btnOr: "ёки",
    btnGallery: "Галереядан",
    uploadTip: "💡 Бир нечта дафтар расмини бир вақтда танлашингиз ва барчасини биттада текширишингиз мумкин",
    selectedCountText: "{count} та расм танланди",
    selectedSheetsLabel: "Танланган жавоб варақлари:",
    btnClearAll: "Тозалаш",
    btnCheckAll: "Ҳаммасини текшириш ({count} та)",
    btnAddMoreCamera: "Яна расм",
    btnAddMoreGallery: "Яна файл",
    addMoreTile: "Қўшиш",

    // Ўқитувчи буйруғи (Teacher Instruction)
    teacherInstructionTitle: "Ўқитувчи буйруғи (ихтиёрий):",
    teacherInstructionSub: "Расмдаги бошқа машқларни текшириб юбормаслиги учун",
    teacherInstructionPlaceholder: "Масалан: Фақат 2-вариантни текшир ёки Фақат 5-машқни текшир",
    teacherInstructionTip: "💡 Агар дафтарда бошқа машқлар ҳам ёзилган бўлса, AI фақат кераклисини текшириши учун шу ерга ёзинг.",
    chipVar1: "Фақат 1-вариант",
    chipVar2: "Фақат 2-вариант",
    chipLastEx: "Охирги машқ",
    chipRedPen: "Қизил ручкалиси",
    chipBottomDictation: "Пастдаги диктант",
    chipEssayOnly: "Фақат иншо қисми",
    chipMathEx1: "Фақат 1-мисол",
    chipMathExLast: "Охирги тенглама",

    // Stepper & Jurnal Filter
    stepperKey: "Калит",
    stepperSheets: "Дафтарлар",
    stepperResults: "Журнал",
    searchStudentPlaceholder: "Ўқувчини қидириш...",
    filterAll: "Барчаси",
    filter5: "5 баҳо",
    filter4: "4 баҳо",
    filter3: "3 баҳо",
    filter2: "2 баҳо",
    // Loading
    loadingTitle: "Таҳлил қилинмоқда...",
    loadingCounter: "{current} / {total} та",
    loadingWait: "Илтимос, кутинг...",
    loadingSingle: "AI дафтарни таҳлил қилмоқда...",

    // Screen 3: Results
    resultsComplete: "✅ Текширув якунланди",
    batchTotalCount: "Жами: {count} та",
    batchAvgScore: "Ўртача: {score}%",
    gradeBadge5: "5 баҳо: {count} та",
    gradeBadge4: "4 баҳо: {count} та",
    gradeBadge3: "3 баҳо: {count} та",
    gradeBadge2: "2 баҳо: {count} та",
    btnExportCsv: "Excel (CSV) кўринишида юклаб олиш",
    btnSendToTelegram: "Telegram'га юбориш ✈️",
    telegramSentSuccess: "Натижалар Telegram ботга муваффақиятли юборилди! ✅",
    tableCardTitle: "📊 Дафтарлар рўйхати",
    tableCardSub: "Батафсил учун босинг",
    thStudent: "Ўқувчи",
    thCorrect: "✓",
    thIncorrect: "✕",
    thScore: "Балл",
    thMark: "Баҳо",
    thAction: "Амал",
    btnView: "Кўриш",
    btnEdit: "✏️",
    btnNextStudent: "Кейинги дафтарлар",
    btnResetAll: "Янги тест (калитни ўзгартириш)",
    sheetDefaultName: "#{number}-дафтар",
    markSuffix: "баҳо",
    itemsCountUnit: "та",

    // Essay Section
    essayCardTitle: "Иншо / Баён / Диктант",
    essayCardSub: "Ўқувчи дафтаридан AI таҳлил",
    essayTopicLabel: "Мавзу ёки сарлавҳа (ихтиёрий):",
    essayTopicPlaceholder: "Масалан: Ватаним — менинг фахрим...",
    essayTopicTip: "Мавзуни киритсангиз AI аниқроқ баҳолайди",
    btnEssayCamera: "Расмга олиш",
    btnEssayGallery: "Галереядан",
    essayCriteriaTitle: "Баҳолаш мезонлари (10 баллик):",
    critContent: "Мавзу",
    critGrammar: "Грамматика",
    critLogic: "Мантиқ",
    essayErrorsTitle: "Имло ва хатолар",
    essayErrorsCount: "{count} та хато",
    essayFeedbackTitle: "💡 Ўқитувчи хулосаси:",
    essayTransSummary: "📄 Дафтардан ўқилган матн",
    btnNextEssay: "Кейинги иншо",
    wordsCountUnit: "та сўз",

    // Math Section
    mathCardTitle: "Математика ва Аниқ фанлар",
    mathCardSub: "Мисол ва масалаларни босқичма-босқич",
    mathPromptLabel: "Масала ёки мисол шарти (ихтиёрий):",
    mathPromptPlaceholder: "Масалан: 2x + 5 = 15 тенгламани ечинг",
    mathAnswerLabel: "Кутилган якуний жавоб (ихтиёрий):",
    mathAnswerPlaceholder: "Масалан: x = 5",
    mathTip: "💡 Киритмаса ҳам AI ўзи ҳисоблаб аниқлайди",
    btnMathCameraSingle: "Битта расм",
    btnMathGalleryBatch: "Кўп дафтар (Синф)",
    mathBatchTitle: "Синф натижалари — Математика",
    mathBatchAvg: "Ўртача: {score}%",
    thMathResult: "Натижа",
    btnExportMathCsv: "📥 Excel (CSV)",
    btnNextMathBatch: "Янги дафтарлар",
    btnNextMathSingle: "Кейинги мисол",
    mathStepsTitle: "📐 Ечиш босқичлари:",
    mathFeedbackTitle: "💡 Ўқитувчи хулосаси:",
    statusCorrect: "Тўғри ✅",
    statusIncorrect: "Нотўғри ❌",
    studentAnswerLabel: "Ўқувчи жавоби:",
    expectedAnswerLabel: "Тўғри жавоб:",

    // Text Key Modal
    textKeyModalTitle: "Матндан калит юклаш",
    textKeyModalDesc: "Тўғри жавобларни матн шаклида киритинг ёки нусхалаб қўйинг:",
    textKeyPlaceholder: "Масалан: ABCDACBDA ёки\n1-A, 2-B, 3-C, 4-D...",
    textKeyFormats: "💡 Қўллаб-қувватланади: ABCD... ёки 1-A, 2-B, 3-C",
    btnCancel: "Бекор қилиш",
    btnApply: "Қўллаш",

    // Edit Modal
    editModalTitle: "Ўқувчи натижасини таҳрирлаш",
    editStudentNameLabel: "Ўқувчи Ф.И.Ш:",
    editStudentNamePlaceholder: "Исм фамилия",
    editMarkLabel: "Баҳо:",
    editScorePercentLabel: "Балл фоизи (%):",
    btnSave: "Сақлаш",

    // Details Modal
    detailsModalTitle: "Дафтар тафсилоти",
    btnClose: "Ёпиш",
    detailsCorrectBadge: "Тўғри",
    detailsIncorrectBadge: "Хато",
    detailsStudentLabel: "Жавоб:",
    detailsCorrectLabel: "Тўғри:",

    // Language Modal
    langModalTitle: "Тилни танланг",
    langModalSub: "Дастурдан қайси тилда фойдаланмоқчисиз?",
    btnConfirmLang: "Танлаш ва давом этиш →",

    // Interactive On-Screen Spotlight Tour
    tourStepCount: "{current} / {total}-қадам",
    tourBtnNext: "Кейингиси →",
    tourBtnPrev: "Орқага",
    tourBtnFinish: "Тушундим, бошлаш!",
    tourBtnSkip: "Ўтказиб юбориш",
    tourSteps: [
      {
        title: "3 хил текшириш йўналиши",
        desc: "Бу ердан керакли бўлимни танлайсиз: оддий <b>Тест</b>, она тили бўйича <b>Иншо/Диктант</b> ёки <b>Математика</b> мисоллари.",
        hint: "Босиб режимни ўзгартириб кўришингиз мумкин!"
      },
      {
        title: "Саволлар сони ва тезкор тугмалар",
        desc: "Тест нечта саволдан иборатлигини <b>+</b> ва <b>-</b> орқали ёки тезкор <b>10, 15, 20, 25, 30</b> тугмаларини босиб бир зумда белгилайсиз.",
        hint: "Ҳар бир босиш саволлар сонини автоматик созлайди."
      },
      {
        title: "Калитни автоматик юклаш",
        desc: "Тўғри жавобларни бирма-бир киритиш шарт эмас! <b>📷 Расмдан</b> тугмаси билан тўғри жавоблар варақасини расмга олинг ёки <b>📋 Матндан</b> орқали нусхалаб қўйинг.",
        hint: "Сунъий интеллект жавобларни ўзи тўлдириб беради."
      },
      {
        title: "Тўғри жавоблар (A, B, C, D)",
        desc: "Бу ерда ҳар бир саволнинг тўғри жавобини битта босиш билан танлайсиз ёки ўзгартирасиз. Танланган ҳарф яшил рангда ажралиб туради.",
        hint: "Қўлда киритиш ҳам жуда осон ва тезкор."
      },
      {
        title: "Текширишга ўтиш тугмаси",
        desc: "Калитлар киритиб бўлингач, ушбу катта яшил тугмани босинг ва ўқувчилар дафтарларини текшириш босқичига ўтинг.",
        hint: "Калит тайёр бўлгач босинг."
      },
      {
        title: "Дафтарларни юклаш (Бутун синф)",
        desc: "Бу ерда бир вақтнинг ўзида бутун синфнинг <b>10 тадан 30 тагача</b> дафтарини галереядан биттада танлашингиз ёки кетма-кет расмга олишингиз мумкин!",
        hint: "AI дафтарлардан ўқувчи исмини ҳам автоматик ўқийди."
      },
      {
        title: "Қўлланма ва Тил тугмалари",
        desc: "Исталган пайтда ушбу тушунтиришларни қайта кўриш учун <b>❓ Қўлланма</b> тугмасини, тилни алмаштириш учун эса <b>🌐 Тил</b> тугмасини босинг.",
        hint: "Сиз энди тизимдан бемалол фойдалана оласиз! Омад, устоз!"
      }
    ]
  },

  ru: {
    langName: "Русский",
    langCode: "ru",
    flag: "🇷🇺",

    // Header
    appName: "Muallim.uz",
    appSubtitleTest: "Быстрая проверка тестов",
    appSubtitleEssay: "Проверка сочинений и диктантов",
    appSubtitleMath: "Математика и точные науки",
    guideBtn: "Инструкция",
    langBtn: "Русский",

    // Tabs
    tabTest: "Тест",
    tabEssay: "Сочинение",
    tabMath: "Математика",

    // Step Badges
    stepKey: "Шаг 1: Ключ",
    stepSheets: "Шаг 2: Работы",
    stepResults: "Шаг 3: Результаты",
    stepEssay: "Анализ сочинения",
    stepMath: "Решение задач",

    // Screen 1: Key
    questionCountTitle: "Количество вопросов",
    questionCountSub: "Сколько вопросов в тесте?",
    questionCountUnit: "вопр.",
    autoKeyBanner: "Автоматический ввод ключа",
    btnKeyFromImage: "По фото (AI)",
    btnKeyFromText: "Вставить текст",
    correctAnswersTitle: "Правильные ответы",
    correctAnswersSub: "Выберите правильный ответ для каждого вопроса:",
    keyProgressText: "Отмечено {filled} из {total}",
    btnProceedToSheets: "Перейти к проверке работ →",

    // Screen 2: Sheets
    btnBackToKey: "← Изменить ключ",
    uploadTitle: "Загрузите работы",
    uploadDesc: "Вы можете выбрать работы одного или сразу всего класса (10–30 тетрадей)",
    btnUploadBig: "ЗАГРУЗИТЬ",
    btnCamera: "📷 Камера",
    btnOr: "или",
    btnGallery: "Из галереи",
    uploadTip: "💡 Вы можете выбрать сразу несколько фото тетрадей и проверить их одновременно",
    selectedCountText: "Выбрано фото: {count}",
    selectedSheetsLabel: "Выбранные бланки ответов:",
    btnClearAll: "Очистить",
    btnCheckAll: "Проверить все ({count} шт.)",
    btnAddMoreCamera: "Ещё фото",
    btnAddMoreGallery: "Ещё из галереи",
    addMoreTile: "Добавить",

    // Указание учителя (Teacher Instruction)
    teacherInstructionTitle: "Указание учителя (необязательно):",
    teacherInstructionSub: "Чтобы AI не проверял другие записи на странице",
    teacherInstructionPlaceholder: "Например: Проверить только 2-й вариант или только упр. 5",
    teacherInstructionTip: "💡 Если в тетради написаны и другие упражнения, укажите здесь, какую именно часть проверять.",
    chipVar1: "Только 1-й вариант",
    chipVar2: "Только 2-й вариант",
    chipLastEx: "Последнее упр.",
    chipRedPen: "Красной ручкой",
    chipBottomDictation: "Диктант внизу",
    chipEssayOnly: "Только сочинение",
    chipMathEx1: "Только 1-й пример",
    chipMathExLast: "Последнее уравнение",

    // Stepper & Jurnal Filter
    stepperKey: "Ключ",
    stepperSheets: "Работы",
    stepperResults: "Журнал",
    searchStudentPlaceholder: "Поиск по имени...",
    filterAll: "Все",
    filter5: "Оценка 5",
    filter4: "Оценка 4",
    filter3: "Оценка 3",
    filter2: "Оценка 2",
    // Loading
    loadingTitle: "Идёт проверка...",
    loadingCounter: "{current} из {total}",
    loadingWait: "Пожалуйста, подождите...",
    loadingSingle: "AI проверяет работу...",

    // Screen 3: Results
    resultsComplete: "✅ Проверка завершена",
    batchTotalCount: "Всего: {count} шт.",
    batchAvgScore: "Средний балл: {score}%",
    gradeBadge5: "Оценка 5: {count} шт.",
    gradeBadge4: "Оценка 4: {count} шт.",
    gradeBadge3: "Оценка 3: {count} шт.",
    gradeBadge2: "Оценка 2: {count} шт.",
    btnExportCsv: "Скачать в формате Excel (CSV)",
    btnSendToTelegram: "Отправить в Telegram ✈️",
    telegramSentSuccess: "Результаты успешно отправлены боту в Telegram! ✅",
    tableCardTitle: "📊 Список проверенных работ",
    tableCardSub: "Нажмите для просмотра подробностей",
    thStudent: "Ученик",
    thCorrect: "✓",
    thIncorrect: "✕",
    thScore: "Балл",
    thMark: "Оценка",
    thAction: "Действие",
    btnView: "Просмотр",
    btnEdit: "✏️",
    btnNextStudent: "Следующие работы",
    btnResetAll: "Новый тест (изменить ключ)",
    sheetDefaultName: "Работа #{number}",
    markSuffix: "",
    itemsCountUnit: "шт.",

    // Essay Section
    essayCardTitle: "Сочинение / Изложение / Диктант",
    essayCardSub: "AI-проверка рукописного текста",
    essayTopicLabel: "Тема или заголовок (необязательно):",
    essayTopicPlaceholder: "Например: Моя Родина — моя гордость...",
    essayTopicTip: "Если указать тему, AI оценит точнее",
    btnEssayCamera: "Сфотографировать",
    btnEssayGallery: "Из галереи",
    essayCriteriaTitle: "Критерии оценки (по 10-балльной шкале):",
    critContent: "Тема",
    critGrammar: "Грамотность",
    critLogic: "Логика",
    essayErrorsTitle: "Ошибки и правописание",
    essayErrorsCount: "Ошибок: {count}",
    essayFeedbackTitle: "💡 Заключение учителя:",
    essayTransSummary: "📄 Распознанный текст с фото",
    btnNextEssay: "Следующее сочинение",
    wordsCountUnit: "слов",

    // Math Section
    mathCardTitle: "Математика и точные науки",
    mathCardSub: "Пошаговая проверка решений и формул",
    mathPromptLabel: "Условие задачи или примера (необязательно):",
    mathPromptPlaceholder: "Например: Решить уравнение 2x + 5 = 15",
    mathAnswerLabel: "Ожидаемый правильный ответ (необязательно):",
    mathAnswerPlaceholder: "Например: x = 5",
    mathTip: "💡 Если не указывать, AI вычислит ответ сам",
    btnMathCameraSingle: "Одно фото",
    btnMathGalleryBatch: "Весь класс",
    mathBatchTitle: "Результаты класса — Математика",
    mathBatchAvg: "Средний балл: {score}%",
    thMathResult: "Итог",
    btnExportMathCsv: "📥 Excel (CSV)",
    btnNextMathBatch: "Новые тетради",
    btnNextMathSingle: "Следующий пример",
    mathStepsTitle: "📐 Этапы решения:",
    mathFeedbackTitle: "💡 Заключение учителя:",
    statusCorrect: "Верно ✅",
    statusIncorrect: "Неверно ❌",
    studentAnswerLabel: "Ответ ученика:",
    expectedAnswerLabel: "Правильный ответ:",

    // Text Key Modal
    textKeyModalTitle: "Загрузка ключа из текста",
    textKeyModalDesc: "Введите или вставьте правильные ответы текстом:",
    textKeyPlaceholder: "Например: ABCDACBDA или\n1-A, 2-B, 3-C, 4-D...",
    textKeyFormats: "💡 Поддерживаются: ABCD... или 1-A, 2-B, 3-C",
    btnCancel: "Отмена",
    btnApply: "Применить",

    // Edit Modal
    editModalTitle: "Редактирование результата",
    editStudentNameLabel: "Ф.И.О. ученика:",
    editStudentNamePlaceholder: "Имя Фамилия",
    editMarkLabel: "Оценка:",
    editScorePercentLabel: "Процент баллов (%):",
    btnSave: "Сохранить",

    // Details Modal
    detailsModalTitle: "Детали работы",
    btnClose: "Закрыть",
    detailsCorrectBadge: "Верно",
    detailsIncorrectBadge: "Ошибка",
    detailsStudentLabel: "Ответ:",
    detailsCorrectLabel: "Правильно:",

    // Language Modal
    langModalTitle: "Выберите язык",
    langModalSub: "На каком языке вам удобнее работать?",
    btnConfirmLang: "Выбрать и продолжить →",

    // Interactive On-Screen Spotlight Tour
    tourStepCount: "Шаг {current} из {total}",
    tourBtnNext: "Далее →",
    tourBtnPrev: "Назад",
    tourBtnFinish: "Понятно, начать работу!",
    tourBtnSkip: "Пропустить",
    tourSteps: [
      {
        title: "3 режима проверки",
        desc: "Здесь вы выбираете нужный предмет: проверка вариантов <b>Тест</b>, рукописное <b>Сочинение / Диктант</b> или пошаговая <b>Математика</b>.",
        hint: "Вы можете переключать вкладки в любое время!"
      },
      {
        title: "Количество вопросов и быстрые кнопки",
        desc: "Укажите количество вопросов кнопками <b>+</b> и <b>-</b> или выберите быстрый вариант <b>10, 15, 20, 25, 30</b> в одно касание.",
        hint: "Каждое нажатие сразу обновляет форму."
      },
      {
        title: "Автоматический ввод ключа",
        desc: "Не нужно вводить всё вручную! Нажмите <b>📷 По фото</b> и сфотографируйте бланк с ответами, либо <b>📋 Вставить текст</b> для быстрой вставки ключа.",
        hint: "Искусственный интеллект заполнит ключ сам."
      },
      {
        title: "Правильные ответы (A, B, C, D)",
        desc: "Здесь вы можете в один клик выбрать или исправить правильный ответ на каждый вопрос. Выбранный вариант подсвечивается зелёным цветом.",
        hint: "Ручной выбор работает быстро и удобно."
      },
      {
        title: "Кнопка перехода к проверке",
        desc: "Когда ключ заполнен, нажмите эту большую зелёную кнопку, чтобы перейти к загрузке и проверке тетрадей учеников.",
        hint: "Нажмите, когда ключ готов."
      },
      {
        title: "Загрузка работ (весь класс сразу)",
        desc: "Здесь вы можете выбрать из галереи сразу <b>от 10 до 30 работ</b> всего класса или сфотографировать их одну за другой!",
        hint: "AI автоматически распознает имя ученика с тетради."
      },
      {
        title: "Кнопки инструкции и выбора языка",
        desc: "В любой момент вы можете нажать <b>❓ Инструкция</b> для повтора подсказок или <b>🌐 Язык</b> для смены языка приложения.",
        hint: "Теперь всё готово к работе! Приятного использования!"
      }
    ]
  }
};

// Global accessor
if (typeof window !== 'undefined') {
  window.I18N = I18N;
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = I18N;
}
