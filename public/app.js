// ==================== TIL (i18n) INTEGRATSIYASI ====================
let currentLang = localStorage.getItem('muallim_lang') || 'uz';

function t(key, params = {}) {
  const dict = window.I18N?.[currentLang] || window.I18N?.['uz'] || {};
  let str = dict[key] || window.I18N?.['uz']?.[key] || key;
  if (params && typeof params === 'object') {
    Object.keys(params).forEach(p => {
      str = str.replace(new RegExp(`\\{${p}\\}`, 'g'), params[p]);
    });
  }
  return str;
}

// Barcha statik matnlarni tanlangan tilga yangilash
function updateAllTranslations() {
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const k = el.getAttribute('data-i18n');
    el.textContent = t(k);
  });

  // Placeholders
  const essayTopicInput = document.getElementById('essayTopicInput');
  if (essayTopicInput) essayTopicInput.placeholder = t('essayTopicPlaceholder');
  const mathTaskPrompt = document.getElementById('mathTaskPrompt');
  if (mathTaskPrompt) mathTaskPrompt.placeholder = t('mathPromptPlaceholder');
  const mathExpectedAnswer = document.getElementById('mathExpectedAnswer');
  if (mathExpectedAnswer) mathExpectedAnswer.placeholder = t('mathAnswerPlaceholder');
  const textKeyInput = document.getElementById('textKeyInput');
  if (textKeyInput) textKeyInput.placeholder = t('textKeyPlaceholder');
  const editStudentName = document.getElementById('editStudentName');
  if (editStudentName) editStudentName.placeholder = t('editStudentNamePlaceholder');
  const testInstructionInput = document.getElementById('testInstructionInput');
  if (testInstructionInput) testInstructionInput.placeholder = t('teacherInstructionPlaceholder');
  const essayInstructionInput = document.getElementById('essayInstructionInput');
  if (essayInstructionInput) essayInstructionInput.placeholder = t('teacherInstructionPlaceholder');
  const studentSearchInput = document.getElementById('studentSearchInput');
  if (studentSearchInput) studentSearchInput.placeholder = t('searchStudentPlaceholder');

  // Header language badge
  const currentLangLabel = document.getElementById('currentLangLabel');
  if (currentLangLabel) currentLangLabel.textContent = t('langName');

  // Header subtitle
  const headerSubtitle = document.getElementById('headerSubtitle');
  if (headerSubtitle) {
    if (typeof currentAppMode !== 'undefined') {
      if (currentAppMode === 'test') headerSubtitle.textContent = t('appSubtitleTest');
      else if (currentAppMode === 'essay') headerSubtitle.textContent = t('appSubtitleEssay');
      else if (currentAppMode === 'math') headerSubtitle.textContent = t('appSubtitleMath');
    }
  }

  // Language modal active card
  document.querySelectorAll('.lang-card').forEach(card => {
    const l = card.dataset.lang;
    const check = card.querySelector('.check-icon');
    if (l === currentLang) {
      card.classList.add('active');
      if (check) check.classList.remove('hidden');
    } else {
      card.classList.remove('active');
      if (check) check.classList.add('hidden');
    }
  });

  // Savollar soni
  if (typeof totalQuestions !== 'undefined') {
    const questionCountDisplay = document.getElementById('questionCountDisplay');
    if (questionCountDisplay) questionCountDisplay.textContent = `${totalQuestions} ${t('questionCountUnit')}`;
  }

  if (typeof updateProgress === 'function') updateProgress();
  if (typeof renderSelectedFilesView === 'function') renderSelectedFilesView();
  if (typeof renderSelectedMathFilesView === 'function') renderSelectedMathFilesView();
  if (typeof showScreen === 'function' && typeof currentScreenNum !== 'undefined') showScreen(currentScreenNum);
  if (typeof batchResults !== 'undefined' && batchResults.length > 0 && typeof renderBatchResultsTable === 'function') {
    renderBatchResultsTable(batchResults);
  }
  if (typeof batchMathResults !== 'undefined' && batchMathResults.length > 0 && typeof renderBatchMathResultsTable === 'function') {
    renderBatchMathResultsTable(batchMathResults);
  }
}

function setLanguage(lang, autoStartTour = false) {
  currentLang = lang;
  try {
    localStorage.setItem('muallim_lang', lang);
  } catch {}
  updateAllTranslations();
  closeLanguageModal();
  if (autoStartTour) {
    setTimeout(() => {
      startSpotlightTour();
    }, 300);
  }
}

// Telegram WebApp integratsiyasi
const tg = window.Telegram?.WebApp;
if (tg) {
  tg.ready();
  tg.expand();
}

// Holat (State)
let totalQuestions = 10;
let currentScreenNum = 1;
const OPTIONS = ['A', 'B', 'C', 'D'];

let masterKey = {};
let selectedFiles = [];
let batchResults = [];

// Xavfsiz HTML matn yaratish yordamchisi (XSS va matn xatolariga qarshi)
function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// DOM Elementlari
const screen1 = document.getElementById('screen1');
const screen2 = document.getElementById('screen2');
const screen3 = document.getElementById('screen3');
const stepBadge = document.getElementById('stepBadge');

// Screen 1 elementlari
const questionCountDisplay = document.getElementById('questionCountDisplay');
const btnDecreaseQuestions = document.getElementById('btnDecreaseQuestions');
const btnIncreaseQuestions = document.getElementById('btnIncreaseQuestions');
const presetButtons = document.querySelectorAll('.btn-preset');
const questionsContainer = document.getElementById('questionsContainer');
const keyProgress = document.getElementById('keyProgress');
const btnProceedToCamera = document.getElementById('btnProceedToCamera');
const btnUploadKeyImage = document.getElementById('btnUploadKeyImage');
const keyImageUpload = document.getElementById('keyImageUpload');
const btnOpenTextKeyModal = document.getElementById('btnOpenTextKeyModal');
const textKeyModal = document.getElementById('textKeyModal');
const textKeyInput = document.getElementById('textKeyInput');
const btnCloseTextKeyModal = document.getElementById('btnCloseTextKeyModal');
const btnCancelTextKey = document.getElementById('btnCancelTextKey');
const btnApplyTextKey = document.getElementById('btnApplyTextKey');

// Screen 2 elementlari
const btnBackToKey = document.getElementById('btnBackToKey');
const bulkUpload = document.getElementById('bulkUpload');
const cameraDirectInput = document.getElementById('cameraDirectInput');
const initialUploadArea = document.getElementById('initialUploadArea');
const btnTriggerCamera = document.getElementById('btnTriggerCamera');
const btnTriggerGallery = document.getElementById('btnTriggerGallery');
const selectedFilesCard = document.getElementById('selectedFilesCard');
const selectedCountText = document.getElementById('selectedCountText');
const previewThumbnails = document.getElementById('previewThumbnails');
const btnStartBatchCheck = document.getElementById('btnStartBatchCheck');
const btnAddMoreCamera = document.getElementById('btnAddMoreCamera');
const btnAddMoreFiles = document.getElementById('btnAddMoreFiles');
const btnClearAllFiles = document.getElementById('btnClearAllFiles');

// Progress / Loading elementlari
const loadingOverlay = document.getElementById('loadingOverlay');
const progressTitle = document.getElementById('progressTitle');
const progressCounter = document.getElementById('progressCounter');
const progressBar = document.getElementById('progressBar');
const progressStatus = document.getElementById('progressStatus');

// Screen 3 elementlari
const batchTotalCount = document.getElementById('batchTotalCount');
const batchAvgScore = document.getElementById('batchAvgScore');
const gradeStatsBadges = document.getElementById('gradeStatsBadges');
const btnExportCsv = document.getElementById('btnExportCsv');
const btnSendTgResults = document.getElementById('btnSendTgResults');
const resultsTableBody = document.getElementById('resultsTableBody');
const btnNextStudent = document.getElementById('btnNextStudent');
const btnResetAll = document.getElementById('btnResetAll');

// Modal elementlari
const detailsModal = document.getElementById('detailsModal');
const modalSheetTitle = document.getElementById('modalSheetTitle');
const modalQuestionsList = document.getElementById('modalQuestionsList');
const btnCloseModal = document.getElementById('btnCloseModal');
const btnModalCloseBottom = document.getElementById('btnModalCloseBottom');

/**
 * Tebranish / Haptic feedback (Telegram WebApp uchun)
 */
function haptic(type = 'light') {
  if (tg?.HapticFeedback) {
    if (['light', 'medium', 'heavy'].includes(type)) {
      tg.HapticFeedback.impactOccurred(type);
    } else if (['success', 'error', 'warning'].includes(type)) {
      tg.HapticFeedback.notificationOccurred(type);
    }
  }
}

/**
 * Sahifalar navigatsiyasi
 */
function showScreen(screenNum) {
  currentScreenNum = screenNum;
  if (screen1) screen1.classList.add('hidden');
  if (screen2) screen2.classList.add('hidden');
  if (screen3) screen3.classList.add('hidden');

  // Stepper UI yangilash
  const s1 = document.getElementById('stepperStep1');
  const s2 = document.getElementById('stepperStep2');
  const s3 = document.getElementById('stepperStep3');
  [s1, s2, s3].forEach((s, idx) => {
    if (s) {
      if (idx + 1 === screenNum) {
        s.classList.add('active');
      } else {
        s.classList.remove('active');
      }
    }
  });

  if (screenNum === 1) {
    if (screen1) screen1.classList.remove('hidden');
    if (stepBadge) { stepBadge.style.display = 'none'; }
  } else if (screenNum === 2) {
    if (screen2) screen2.classList.remove('hidden');
    if (stepBadge) { stepBadge.style.display = 'none'; }
  } else if (screenNum === 3) {
    if (screen3) screen3.classList.remove('hidden');
    if (stepBadge) { stepBadge.style.display = 'none'; }
  }
}

// Stepper navigatsiyasi
const stepperStep1 = document.getElementById('stepperStep1');
const stepperStep2 = document.getElementById('stepperStep2');
const stepperStep3 = document.getElementById('stepperStep3');

if (stepperStep1) {
  stepperStep1.addEventListener('click', () => {
    haptic('light');
    showScreen(1);
  });
}
if (stepperStep2) {
  stepperStep2.addEventListener('click', () => {
    haptic('light');
    showScreen(2);
  });
}
if (stepperStep3) {
  stepperStep3.addEventListener('click', () => {
    haptic('light');
    if (batchResults && batchResults.length > 0) {
      showScreen(3);
    } else {
      alert(t('uploadTip') || "Avval daftarlarni tekshiring");
    }
  });
}


function setQuestionCount(count) {
  const newCount = Math.max(5, Math.min(50, count));
  totalQuestions = newCount;
  questionCountDisplay.textContent = `${totalQuestions} ${t('questionCountUnit')}`;

  // Preset tugmalarini faollashtirish
  presetButtons.forEach(btn => {
    const btnCount = parseInt(btn.dataset.count, 10);
    if (btnCount === totalQuestions) {
      btn.className = 'btn-preset py-2 rounded-xl text-xs font-black transition-all text-center bg-emerald-600 text-white shadow-md border-transparent scale-105';
    } else {
      btn.className = 'btn-preset py-2 rounded-xl text-xs font-bold border border-slate-200 bg-white text-slate-600 transition-all hover:border-emerald-400 hover:text-emerald-700 active:scale-95';
    }
  });

  // Yangi chegaradan oshib ketgan kalitlarni tozalash
  Object.keys(masterKey).forEach(k => {
    if (Number(k) > totalQuestions) {
      delete masterKey[k];
    }
  });

  initQuestions();
}

btnDecreaseQuestions.addEventListener('click', () => {
  haptic('light');
  setQuestionCount(totalQuestions - 1);
});

btnIncreaseQuestions.addEventListener('click', () => {
  haptic('light');
  setQuestionCount(totalQuestions + 1);
});

presetButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    haptic('medium');
    setQuestionCount(parseInt(btn.dataset.count, 10));
  });
});

/**
 * 1-Sahifa: savol qatorlarini dinamik yaratish
 */
function initQuestions() {
  questionsContainer.innerHTML = '';

  for (let i = 1; i <= totalQuestions; i++) {
    const row = document.createElement('div');
    row.className = 'flex items-center justify-between p-2 rounded-xl bg-slate-50/80 border border-slate-200/80 hover:border-emerald-300 hover:bg-white transition-all shadow-2xs';

    const label = document.createElement('span');
    label.className = 'font-black text-slate-700 text-xs w-6 text-center tabular-nums';
    label.textContent = `${i}.`;

    const optionsContainer = document.createElement('div');
    optionsContainer.className = 'flex items-center gap-1 sm:gap-1.5 flex-1 justify-end';

    OPTIONS.forEach(opt => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.dataset.question = i;
      btn.dataset.option = opt;
      btn.textContent = opt;
      btn.className = getOptionButtonClass(masterKey[String(i)] === opt);

      btn.addEventListener('click', () => {
        haptic('light');
        if (masterKey[String(i)] === opt) {
          delete masterKey[String(i)];
        } else {
          masterKey[String(i)] = opt;
        }
        updateQuestionRow(i);
        updateProgress();
      });

      optionsContainer.appendChild(btn);
    });

    row.appendChild(label);
    row.appendChild(optionsContainer);
    questionsContainer.appendChild(row);
  }

  updateProgress();
}

function getOptionButtonClass(isSelected) {
  if (isSelected) {
    return 'opt-btn selected';
  }
  return 'opt-btn';
}

function updateQuestionRow(questionNum) {
  const buttons = questionsContainer.querySelectorAll(`button[data-question="${questionNum}"]`);
  const currentVal = masterKey[String(questionNum)];
  buttons.forEach(btn => {
    btn.className = getOptionButtonClass(btn.dataset.option === currentVal);
  });
}

function updateProgress() {
  const count = Object.keys(masterKey).length;
  keyProgress.textContent = t('keyProgressText', { filled: count, total: totalQuestions });
}

// ----------------- KALITNI YUKLASH (RASM VA MATN) -----------------

// 1. Rasmdan AI orqali kalitni aniqlash
btnUploadKeyImage.addEventListener('click', () => {
  haptic('light');
  keyImageUpload.click();
});

keyImageUpload.addEventListener('change', async (e) => {
  const file = e.target.files?.[0];
  if (!file) return;

  // Fayl tanlangach inputni bo'shatamiz, qayta tanlash imkoni bo'lishi uchun
  keyImageUpload.value = '';

  loadingOverlay.classList.remove('hidden');
  progressTitle.textContent = "Kalit tahlil qilinmoqda...";
  progressCounter.textContent = "AI javoblarni o'qimoqda 🔍";
  progressBar.style.width = '70%';
  progressStatus.textContent = "Iltimos, kuting...";

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000);

  try {
    const formData = new FormData();
    formData.append('image', file);

    const response = await fetch('/api/extract-key', {
      method: 'POST',
      body: formData,
      signal: controller.signal,
    });

    let data;
    try {
      data = await response.json();
    } catch {
      throw new Error(`Server xatolik qaytardi (Status: ${response.status})`);
    }

    if (!data.success) {
      throw new Error(data.message || data.error || "Kalitni aniqlab bo'lmadi");
    }

    // Kelgan kalitni o'rnatish
    masterKey = { ...data.masterKey };
    const detectedTotal = data.total || Object.keys(masterKey).length || 10;
    setQuestionCount(detectedTotal);

    haptic('success');
    alert(`Muvaffaqiyatli! ${Object.keys(masterKey).length} ta to'g'ri javob kaliti avtomatik kiritildi.`);
  } catch (err) {
    console.error("Kalit yuklash xatosi:", err);
    haptic('error');
    if (err.name === 'AbortError') {
      alert("Tahlil vaqti tugadi (server band yoki internet sekin). Iltimos, qayta urinib ko'ring.");
    } else {
      alert("Xatolik yuz berdi: " + (err.message || "Rasmdan kalitni o'qib bo'lmadi"));
    }
  } finally {
    clearTimeout(timeoutId);
    loadingOverlay.classList.add('hidden');
    progressBar.style.width = '0%';
  }
});

// 2. Matndan kalit kiritish modali
btnOpenTextKeyModal.addEventListener('click', () => {
  haptic('light');
  textKeyInput.value = '';
  textKeyModal.classList.remove('hidden');
  textKeyModal.classList.add('flex');
  setTimeout(() => textKeyInput.focus(), 100);
});

function closeTextKeyModal() {
  textKeyModal.classList.add('hidden');
  textKeyModal.classList.remove('flex');
}

btnCloseTextKeyModal.addEventListener('click', closeTextKeyModal);
btnCancelTextKey.addEventListener('click', closeTextKeyModal);

btnApplyTextKey.addEventListener('click', () => {
  const text = textKeyInput.value.trim();
  if (!text) {
    alert("Iltimos, kalit matnini kiriting!");
    return;
  }

  const parsed = parseTextKey(text);
  const keys = Object.keys(parsed);
  if (keys.length === 0) {
    alert("Matndan birorta ham to'g'ri kalit (A, B, C, D) topilmadi. Qayta tekshirib ko'ring.");
    return;
  }

  // Eng katta savol raqamini aniqlaymiz
  const maxQuestion = Math.max(...keys.map(Number));
  masterKey = parsed;
  setQuestionCount(maxQuestion);

  closeTextKeyModal();
  haptic('success');
  alert(`${keys.length} ta savol kaliti muvaffaqiyatli o'rnatildi!`);
});

/**
 * Matn shaklidagi kalitni tahlil qilish
 * Qo'llab-quvvatlaydi:
 * - "1-A, 2-B, 3.C"
 * - "1A 2B 3C"
 * - "ABCDABCD"
 */
function parseTextKey(rawText) {
  const result = {};

  // Agar 1-A, 1.B, 1:C, 1) D yoki 1 A kabi raqamlangan bo'lsa
  const numberedPattern = /(\d+)\s*[-.:=)\s]?\s*([A-Da-d])/g;
  let match;
  let count = 0;

  while ((match = numberedPattern.exec(rawText)) !== null) {
    const qNum = match[1];
    const ans = match[2].toUpperCase();
    result[qNum] = ans;
    count++;
  }

  // Agar raqamlangan format topilmasa, ketma-ket harflar deb qaraymiz (ABCD...)
  if (count === 0) {
    const letters = rawText.replace(/[^A-Da-d]/g, '').toUpperCase();
    for (let i = 0; i < letters.length; i++) {
      result[String(i + 1)] = letters[i];
    }
  }

  return result;
}

// 1-sahifadan 2-sahifaga o'tish
btnProceedToCamera.addEventListener('click', () => {
  const count = Object.keys(masterKey).length;
  if (count === 0) {
    alert("Iltimos, kamida bitta to'g'ri javobni belgilang.");
    return;
  }
  if (count < totalQuestions) {
    const ok = confirm(`Siz faqat ${count} ta savol kalitini kiritdingiz (jami ${totalQuestions} ta). Davom etaverasizmi?`);
    if (!ok) return;
  }
  haptic('medium');
  showScreen(2);
});

// 2-sahifadan 1-sahifaga qaytish
btnBackToKey.addEventListener('click', () => {
  haptic('light');
  showScreen(1);
});

// ==================== 2-SAHIFA: BATCH FAYLLARNI TANLASH VA YANA QO'SHISH ====================

function appendFiles(newFiles) {
  if (!newFiles || newFiles.length === 0) return;
  selectedFiles = [...selectedFiles, ...Array.from(newFiles)];
  renderSelectedFilesView();
  haptic('medium');
}

function removeFile(index) {
  haptic('light');
  selectedFiles.splice(index, 1);
  renderSelectedFilesView();
}

// Boshlang'ich tugmalar
btnTriggerCamera.addEventListener('click', () => cameraDirectInput.click());
btnTriggerGallery.addEventListener('click', () => bulkUpload.click());

// Yana rasm qo'shish tugmalari
btnAddMoreCamera.addEventListener('click', () => cameraDirectInput.click());
btnAddMoreFiles.addEventListener('click', () => bulkUpload.click());

// Hammasini tozalash
btnClearAllFiles.addEventListener('click', () => {
  haptic('light');
  selectedFiles = [];
  bulkUpload.value = '';
  cameraDirectInput.value = '';
  renderSelectedFilesView();
});

// Kamera orqali yangi rasm olinganda
cameraDirectInput.addEventListener('change', (e) => {
  appendFiles(e.target.files);
  cameraDirectInput.value = '';
});

// Galereyadan yangi rasm(lar) tanlanganda
bulkUpload.addEventListener('change', (e) => {
  appendFiles(e.target.files);
  bulkUpload.value = '';
});

function renderSelectedFilesView() {
  if (selectedFiles.length === 0) {
    selectedFilesCard.classList.add('hidden');
    initialUploadArea.classList.remove('hidden');
    return;
  }

  initialUploadArea.classList.add('hidden');
  selectedFilesCard.classList.remove('hidden');

  // Soni ko'rsatish: "X ta rasm tanlandi"
  selectedCountText.textContent = t('selectedCountText', { count: selectedFiles.length });
  btnStartBatchCheck.querySelector('span').textContent = t('btnCheckAll', { count: selectedFiles.length });

  // Kichik rasmlar oldindan ko'rinishi (Preview Thumbnails)
  previewThumbnails.innerHTML = '';

  selectedFiles.forEach((file, index) => {
    const thumb = document.createElement('div');
    thumb.className = 'relative w-14 h-14 rounded-xl border border-slate-200 overflow-hidden shrink-0 bg-slate-100 shadow-xs group';

    const img = document.createElement('img');
    img.src = URL.createObjectURL(file);
    img.className = 'w-full h-full object-cover';
    thumb.appendChild(img);

    // Varaq raqami badji
    const badge = document.createElement('span');
    badge.className = 'absolute bottom-0 left-0 bg-slate-900/80 text-white font-bold text-[9px] px-1 rounded-tr';
    badge.textContent = `#${index + 1}`;
    thumb.appendChild(badge);

    // O'chirish tugmasi (✕)
    const btnRemove = document.createElement('button');
    btnRemove.type = 'button';
    btnRemove.className = 'absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-rose-500 hover:bg-rose-600 text-white font-bold text-[9px] flex items-center justify-center shadow-sm';
    btnRemove.textContent = '✕';
    btnRemove.title = "O'chirish";
    btnRemove.addEventListener('click', (ev) => {
      ev.stopPropagation();
      removeFile(index);
    });
    thumb.appendChild(btnRemove);

    previewThumbnails.appendChild(thumb);
  });

  // Oxiriga yana qo'shish uchun "+ Qo'shish" katakchasi
  const addMoreTile = document.createElement('button');
  addMoreTile.type = 'button';
  addMoreTile.className = 'w-14 h-14 rounded-xl border-2 border-dashed border-emerald-400 hover:border-emerald-600 bg-emerald-50 hover:bg-emerald-100/70 flex flex-col items-center justify-center text-emerald-700 font-bold shrink-0 transition-all';
  addMoreTile.innerHTML = `<span class="text-base leading-none">＋</span><span class="text-[9px] mt-0.5 font-semibold">${t('addMoreTile')}</span>`;
  addMoreTile.addEventListener('click', () => {
    cameraDirectInput.click();
  });
  previewThumbnails.appendChild(addMoreTile);
}

// ==================== BATCH TEKSHIRISH (QUEUE / BATCH RUNNER) ====================

btnStartBatchCheck.addEventListener('click', async () => {
  if (selectedFiles.length === 0) return;

  haptic('medium');
  loadingOverlay.classList.remove('hidden');
  loadingOverlay.classList.add('flex');

  const total = selectedFiles.length;
  let completed = 0;
  batchResults = new Array(total);

  updateProgressUi(completed, total, "Tekshiruv boshlanmoqda...");

  // Server va AI API limitlarini buzmaslik uchun kichik guruhlarda (2 tadan) navbat bilan jo'natamiz
  const CONCURRENCY = 2;
  let fileIndex = 0;

  async function worker() {
    while (fileIndex < selectedFiles.length) {
      const currentIndex = fileIndex++;
      const file = selectedFiles[currentIndex];
      const sheetNumber = currentIndex + 1;

      updateProgressUi(completed, total, `${sheetNumber}-daftar tahlil qilinmoqda...`);

      const ctrl = new AbortController();
      const tId = setTimeout(() => ctrl.abort(), 30000);

      try {
        const formData = new FormData();
        formData.append('image', file);
        formData.append('masterKey', JSON.stringify(masterKey));
        const testInstruction = document.getElementById('testInstructionInput')?.value.trim() || '';
        if (testInstruction) {
          formData.append('instruction', testInstruction);
        }

        const response = await fetch('/api/check-answers', {
          method: 'POST',
          body: formData,
          signal: ctrl.signal,
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.message || "Tahlil qilib bo'lmadi.");
        }

        batchResults[currentIndex] = {
          sheetNumber,
          success: true,
          fileName: file.name,
          ...data,
        };
      } catch (err) {
        const errMsg = err.name === 'AbortError' ? "Vaqt tugadi (server band)" : (err.message || "Rasm sifatsiz yoki tahlil xatosi");
        console.warn(`${sheetNumber}-daftarda xatolik:`, errMsg);
        batchResults[currentIndex] = {
          sheetNumber,
          success: false,
          fileName: file.name,
          error: errMsg,
        };
      } finally {
        clearTimeout(tId);
      }

      completed++;
      updateProgressUi(completed, total, `${sheetNumber}-daftar yakunlandi`);

      // Google Free Tier RPM limitiga tushib qolmaslik uchun so'rovlar orasida ozgina tanaffus
      if (fileIndex < selectedFiles.length) {
        await new Promise(r => setTimeout(r, 600));
      }
    }
  }

  const workers = [];
  for (let i = 0; i < Math.min(CONCURRENCY, total); i++) {
    workers.push(worker());
  }

  await Promise.all(workers);

  // Jarayon tugadi
  loadingOverlay.classList.add('hidden');
  loadingOverlay.classList.remove('flex');
  haptic('success');

  renderBatchResultsTable(batchResults);
  showScreen(3);
});

function updateProgressUi(completed, total, statusText) {
  const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
  progressCounter.textContent = `${completed} / ${total} ta daftar tekshirildi (${percent}%)`;
  progressBar.style.width = `${percent}%`;
  progressStatus.textContent = statusText;
}

// ==================== 3-SAHIFA: JADVAL VA STATISTIKANI RENDER QILISH ====================


let currentGradeFilter = 'all';
let currentSearchQuery = '';

function initResultsFilters() {
  const studentSearchInput = document.getElementById('studentSearchInput');
  if (studentSearchInput && !studentSearchInput.dataset.filterBound) {
    studentSearchInput.dataset.filterBound = 'true';
    studentSearchInput.addEventListener('input', (e) => {
      currentSearchQuery = e.target.value.toLowerCase().trim();
      if (batchResults && batchResults.length > 0) {
        renderBatchResultsTable(batchResults);
      }
    });
  }

  document.querySelectorAll('.btn-grade-filter').forEach(btn => {
    if (!btn.dataset.filterBound) {
      btn.dataset.filterBound = 'true';
      btn.addEventListener('click', () => {
        haptic('light');
        currentGradeFilter = btn.dataset.grade || 'all';
        document.querySelectorAll('.btn-grade-filter').forEach(b => {
          if (b.dataset.grade === currentGradeFilter) {
            b.className = 'btn-grade-filter px-2.5 py-1 rounded-lg text-xs font-bold bg-brand-600 text-white shadow-2xs transition-all';
          } else {
            b.className = 'btn-grade-filter px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-100 text-slate-600 hover:bg-slate-200 transition-all';
          }
        });
        if (batchResults && batchResults.length > 0) {
          renderBatchResultsTable(batchResults);
        }
      });
    }
  });
}

function renderBatchResultsTable(results) {
  initResultsFilters();
  resultsTableBody.innerHTML = '';
  gradeStatsBadges.innerHTML = '';

  const validResults = results.filter(r => r.success);
  const totalCount = results.length;

  batchTotalCount.textContent = t('batchTotalCount', { count: totalCount });

  // O'rtacha ballni hisoblash
  let avgScore = 0;
  const gradeCounts = { 5: 0, 4: 0, 3: 0, 2: 0 };

  if (validResults.length > 0) {
    const totalScore = validResults.reduce((sum, r) => sum + Number(r.scorePercent || 0), 0);
    avgScore = Math.round(totalScore / validResults.length);

    validResults.forEach(r => {
      const mark = r.mark || 2;
      gradeCounts[mark] = (gradeCounts[mark] || 0) + 1;
    });
  }

  batchAvgScore.textContent = t('batchAvgScore', { score: avgScore });

  // Baholar statistikasi badjlari
  gradeStatsBadges.innerHTML = `
    <span class="bg-white/20 text-white px-2.5 py-1 rounded-full font-bold text-[10px]">${t('gradeBadge5', { count: gradeCounts[5] })}</span>
    <span class="bg-white/20 text-white px-2.5 py-1 rounded-full font-bold text-[10px]">${t('gradeBadge4', { count: gradeCounts[4] })}</span>
    <span class="bg-white/20 text-white px-2.5 py-1 rounded-full font-bold text-[10px]">${t('gradeBadge3', { count: gradeCounts[3] })}</span>
    <span class="bg-white/20 text-white px-2.5 py-1 rounded-full font-bold text-[10px]">${t('gradeBadge2', { count: gradeCounts[2] })}</span>
  `;

  // Filtrlangan natijalar
  const displayResults = results.filter(res => {
    if (currentGradeFilter !== 'all') {
      if (!res.success) return false;
      if (String(res.mark) !== currentGradeFilter) return false;
    }
    if (currentSearchQuery) {
      const name = (res.studentName || '').toLowerCase();
      const sheet = String(res.sheetNumber || '');
      if (!name.includes(currentSearchQuery) && !sheet.includes(currentSearchQuery)) return false;
    }
    return true;
  });

  if (displayResults.length === 0) {
    const tr = document.createElement('tr');
    tr.innerHTML = `<td colspan="6" class="py-8 text-center text-xs font-medium text-slate-400">Hech qanday o'quvchi topilmadi</td>`;
    resultsTableBody.appendChild(tr);
    return;
  }

  // Jadval qatorlarini to'ldirish
  displayResults.forEach((res) => {
    const origIndex = results.indexOf(res);
    const tr = document.createElement('tr');
    tr.className = 'tbl-row transition-colors cursor-pointer border-b border-slate-100/80';

    const studentLabel = res.studentName
      ? `<div class="flex flex-col">
           <span class="font-black text-slate-800 text-xs">${escapeHtml(res.studentName)}</span>
           <span class="text-[10px] text-slate-400 font-medium">${t('sheetDefaultName', { number: res.sheetNumber })}</span>
         </div>`
      : `<span class="font-bold text-slate-800 text-xs">${t('sheetDefaultName', { number: res.sheetNumber })}</span>`;

    if (res.success) {
      const markColor = getMarkBadgeClass(res.mark);

      tr.innerHTML = `
        <td class="py-2.5 px-3">${studentLabel}</td>
        <td class="py-2.5 px-2 font-bold text-emerald-600">${res.correct} ${t('itemsCountUnit')}</td>
        <td class="py-2.5 px-2 font-bold text-rose-500">${res.incorrect} ${t('itemsCountUnit')}</td>
        <td class="py-2.5 px-2 font-black text-slate-800">${res.scorePercent}%</td>
        <td class="py-2.5 px-2"><span class="${markColor}">${res.mark} ${t('markSuffix')}</span></td>
        <td class="py-2.5 px-2 text-center">
          <div class="flex items-center justify-center gap-1.5">
            <button type="button" class="btn-view-test text-xs bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-700 px-2.5 py-1.5 rounded-xl font-bold transition-all active:scale-95 border border-slate-200" title="Ko'rish">
              ${t('btnView')}
            </button>
            <button type="button" class="btn-edit-test text-xs bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 px-2.5 py-1.5 rounded-xl font-bold transition-all active:scale-95 shadow-2xs" title="Tahrirlash">
              ✏️
            </button>
          </div>
        </td>
      `;

      tr.querySelector('.btn-view-test').addEventListener('click', (e) => {
        e.stopPropagation();
        openDetailsModal(res, origIndex);
      });

      tr.querySelector('.btn-edit-test').addEventListener('click', (e) => {
        e.stopPropagation();
        openEditModal('test', origIndex);
      });

      tr.addEventListener('click', () => {
        openDetailsModal(res, origIndex);
      });
    } else {
      tr.innerHTML = `
        <td class="py-2.5 px-3">${studentLabel}</td>
        <td colspan="4" class="py-2.5 px-2 text-rose-500 text-xs italic font-medium">
          ⚠️ Xato: ${escapeHtml(res.error)}
        </td>
        <td class="py-2.5 px-2 text-center">
          <span class="text-rose-400 text-xs font-bold">✕</span>
        </td>
      `;
    }

    resultsTableBody.appendChild(tr);
  });
}

function getMarkBadgeClass(mark) {
  if (mark === 5) return 'bg-emerald-100 text-emerald-800 font-black px-2.5 py-1 rounded-full text-[11px] shadow-2xs inline-block';
  if (mark === 4) return 'bg-teal-100 text-teal-800 font-black px-2.5 py-1 rounded-full text-[11px] shadow-2xs inline-block';
  if (mark === 3) return 'bg-amber-100 text-amber-800 font-black px-2.5 py-1 rounded-full text-[11px] shadow-2xs inline-block';
  return 'bg-rose-100 text-rose-800 font-black px-2.5 py-1 rounded-full text-[11px] shadow-2xs inline-block';
}

// ==================== MODAL: AYRIM DAFTAR TAFSILOTI ====================

function openDetailsModal(sheetData, index) {
  const title = sheetData.studentName
    ? `👤 ${sheetData.studentName} (#${sheetData.sheetNumber}-daftar)`
    : `${sheetData.sheetNumber}-daftar: ${sheetData.summaryText || ''}`;
  modalSheetTitle.textContent = title;
  modalQuestionsList.innerHTML = '';

  const details = sheetData.details || [];
  details.forEach(item => {
    const div = document.createElement('div');
    if (item.isCorrect) {
      div.className = 'flex items-center justify-between p-3 rounded-2xl bg-emerald-50/80 border border-emerald-200 text-emerald-900 shadow-2xs';
      div.innerHTML = `
        <div class="flex items-center gap-2.5">
          <span class="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center font-black text-[11px] shadow-sm">✓</span>
          <span class="font-black text-xs">${item.question}-savol:</span>
          <span class="font-mono font-bold text-xs bg-emerald-200/60 text-emerald-900 px-2 py-0.5 rounded-lg">[${item.correctAnswer}]</span>
        </div>
        <span class="text-[10px] font-black text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-full">To'g'ri</span>
      `;
    } else {
      div.className = 'flex items-center justify-between p-3 rounded-2xl bg-rose-50/80 border border-rose-200 text-rose-900 shadow-2xs';
      const studentText = item.studentAnswer ? `[${item.studentAnswer}]` : 'Belgilanmagan';
      div.innerHTML = `
        <div class="flex items-center gap-2.5">
          <span class="w-6 h-6 rounded-full bg-rose-500 text-white flex items-center justify-center font-black text-[11px] shadow-sm">✕</span>
          <div class="flex flex-col">
            <span class="font-black text-xs">${item.question}-savol</span>
            <span class="text-[11px] text-rose-800">Javob: <b class="font-mono">${studentText}</b> | To'g'ri: <b class="font-mono text-emerald-700">[${item.correctAnswer}]</b></span>
          </div>
        </div>
        <span class="text-[10px] font-black text-rose-700 bg-rose-100 px-2.5 py-1 rounded-full">Xato</span>
      `;
    }
    modalQuestionsList.appendChild(div);
  });

  detailsModal.classList.remove('hidden');
  detailsModal.classList.add('flex');
}

function closeDetailsModal() {
  detailsModal.classList.add('hidden');
  detailsModal.classList.remove('flex');
}

btnCloseModal.addEventListener('click', closeDetailsModal);
btnModalCloseBottom.addEventListener('click', closeDetailsModal);

// ==================== CSV YUKLAB OLISH (EXCEL COMPATIBLE) ====================

btnExportCsv.addEventListener('click', () => {
  if (batchResults.length === 0) return;

  haptic('medium');

  // CSV sarlavhalari
  let csv = `"O'quvchi / Daftar","To'g'ri javoblar","Noto'g'ri javoblar","Ball (%)","Baho","Holat"\r\n`;

  batchResults.forEach(r => {
    const nameCol = r.studentName ? `${r.studentName} (#${r.sheetNumber})` : `${r.sheetNumber}-daftar`;
    if (r.success) {
      csv += `"${nameCol}",${r.correct},${r.incorrect},"${r.scorePercent}%",${r.mark},"Muvaffaqiyatli"\r\n`;
    } else {
      csv += `"${nameCol}",0,0,"0%",2,"Xato: ${r.error || ''}"\r\n`;
    }
  });

  // UTF-8 BOM (\uFEFF) qo'shiladi, shunda Excel barcha o'zbek harflarini to'g'ri ochadi
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `test_natijalari_${dateStr}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
});

// Telegramga natijalarni yuborish (Telegram WebApp sendData)
if (btnSendTgResults) {
  btnSendTgResults.addEventListener('click', () => {
    if (!batchResults || batchResults.length === 0) return;
    haptic('medium');

    const validResults = batchResults.filter(r => r.success);
    const totalCount = batchResults.length;
    let avgScore = 0;
    if (validResults.length > 0) {
      const totalScore = validResults.reduce((sum, r) => sum + Number(r.scorePercent || 0), 0);
      avgScore = Math.round(totalScore / validResults.length);
    }

    const payload = {
      type: 'test_batch_results',
      totalCount,
      validCount: validResults.length,
      avgScore,
      students: batchResults.map(r => ({
        name: r.studentName || `${r.sheetNumber}-daftar`,
        correct: r.correct || 0,
        incorrect: r.incorrect || 0,
        scorePercent: r.scorePercent || 0,
        mark: r.mark || 2,
        success: !!r.success,
      })),
    };

    if (tg && typeof tg.sendData === 'function') {
      try {
        tg.sendData(JSON.stringify(payload));
        haptic('success');
      } catch (err) {
        console.error("tg.sendData xatosi:", err);
        alert(t('telegramSentSuccess') || "Natijalar Telegram botga yuborildi!");
      }
    } else {
      alert(t('telegramSentSuccess') || "Natijalar Telegram botga yuborildi!");
    }
  });
}

// Keyingi daftarlarni tekshirish (Kalitni saqlab qolgan holda 2-sahifaga qaytish)
btnNextStudent.addEventListener('click', () => {
  haptic('medium');
  selectedFiles = [];
  bulkUpload.value = '';
  cameraDirectInput.value = '';
  renderSelectedFilesView();
  showScreen(2);
});

// Yangi test boshlash (Kalitni tozalash va 1-sahifaga qaytish)
btnResetAll.addEventListener('click', () => {
  if (!confirm("Rostdan ham yangi test boshlamoqchimisiz? Kalit tozalanadi.")) return;
  masterKey = {};
  selectedFiles = [];
  bulkUpload.value = '';
  cameraDirectInput.value = '';
  initQuestions();
  showScreen(1);
});

// ==================== INSHO / DIKTANT MODULI BOSHQARUVI ====================

// DOM elementlari
const tabModeTest = document.getElementById('tabModeTest');
const tabModeEssay = document.getElementById('tabModeEssay');
const tabModeMath = document.getElementById('tabModeMath');
const headerSubtitle = document.getElementById('headerSubtitle');
const essaySection = document.getElementById('essaySection');
const essayInputCard = document.getElementById('essayInputCard');
const essayResultCard = document.getElementById('essayResultCard');
const essayTopicInput = document.getElementById('essayTopicInput');
const essayCameraInput = document.getElementById('essayCameraInput');
const essayGalleryInput = document.getElementById('essayGalleryInput');
const btnEssayCamera = document.getElementById('btnEssayCamera');
const btnEssayGallery = document.getElementById('btnEssayGallery');
const btnNextEssay = document.getElementById('btnNextEssay');

// Natija maydonlari
const essayStudentName = document.getElementById('essayStudentName');
const essayTopicDisplay = document.getElementById('essayTopicDisplay');
const essayWordCount = document.getElementById('essayWordCount');
const essayMarkBadge = document.getElementById('essayMarkBadge');
const essayScorePercent = document.getElementById('essayScorePercent');
const scoreContent = document.getElementById('scoreContent');
const scoreGrammar = document.getElementById('scoreGrammar');
const scoreLogic = document.getElementById('scoreLogic');
const essayErrorsCount = document.getElementById('essayErrorsCount');
const essayErrorsList = document.getElementById('essayErrorsList');
const essayTeacherFeedback = document.getElementById('essayTeacherFeedback');
const essayTranscription = document.getElementById('essayTranscription');

let currentAppMode = 'test'; // 'test', 'essay', 'math'

function switchAppMode(mode) {
  currentAppMode = mode;
  haptic('medium');

  [tabModeTest, tabModeEssay, tabModeMath].forEach(tab => {
    if (tab) {
      tab.classList.remove('tab-active');
      tab.classList.add('text-slate-500');
    }
  });

  const stepperContainer = document.getElementById('stepperContainer');

  // Barcha bo'limlarni yashirish
  if (screen1) screen1.classList.add('hidden');
  if (screen2) screen2.classList.add('hidden');
  if (screen3) screen3.classList.add('hidden');
  if (essaySection) essaySection.classList.add('hidden');
  if (mathSection) mathSection.classList.add('hidden');

  if (mode === 'test') {
    if (tabModeTest) {
      tabModeTest.classList.add('tab-active');
      tabModeTest.classList.remove('text-slate-500');
    }
    if (stepperContainer) stepperContainer.classList.remove('hidden');
    if (headerSubtitle) headerSubtitle.textContent = t("appSubtitleTest");
    if (stepBadge) stepBadge.style.display = 'none';
    showScreen(currentScreenNum || 1);
  } else if (mode === 'essay') {
    if (tabModeEssay) {
      tabModeEssay.classList.add('tab-active');
      tabModeEssay.classList.remove('text-slate-500');
    }
    if (stepperContainer) stepperContainer.classList.add('hidden');
    if (headerSubtitle) headerSubtitle.textContent = t("appSubtitleEssay");
    if (stepBadge) { stepBadge.style.display = 'none'; }
    if (essaySection) essaySection.classList.remove('hidden');
  } else if (mode === 'math') {
    if (tabModeMath) {
      tabModeMath.classList.add('tab-active');
      tabModeMath.classList.remove('text-slate-500');
    }
    if (stepperContainer) stepperContainer.classList.add('hidden');
    if (headerSubtitle) headerSubtitle.textContent = t("appSubtitleMath");
    if (stepBadge) { stepBadge.style.display = 'none'; }
    if (mathSection) mathSection.classList.remove('hidden');
  }
}

tabModeTest.addEventListener('click', () => switchAppMode('test'));
tabModeEssay.addEventListener('click', () => switchAppMode('essay'));
tabModeMath.addEventListener('click', () => switchAppMode('math'));

// Insho rasm tanlash tugmalari
btnEssayCamera.addEventListener('click', () => essayCameraInput.click());
btnEssayGallery.addEventListener('click', () => essayGalleryInput.click());

essayCameraInput.addEventListener('change', (e) => {
  const file = e.target.files?.[0];
  if (file) handleEssayUpload(file);
  essayCameraInput.value = '';
});

essayGalleryInput.addEventListener('change', (e) => {
  const file = e.target.files?.[0];
  if (file) handleEssayUpload(file);
  essayGalleryInput.value = '';
});

async function handleEssayUpload(file) {
  haptic('medium');
  loadingOverlay.classList.remove('hidden');
  loadingOverlay.classList.add('flex');

  progressTitle.textContent = "Insho tahlil qilinmoqda...";
  progressCounter.textContent = "Qo'lyozma o'qilmoqda va tekshirilmoqda ✍️";
  progressBar.style.width = '65%';
  progressStatus.textContent = "Imlo va grammatika tekshirilmoqda...";

  const topic = essayTopicInput.value.trim();
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 35000);

  try {
    const formData = new FormData();
    formData.append('image', file);
    if (topic) formData.append('topic', topic);
    const essayInstruction = document.getElementById('essayInstructionInput')?.value.trim() || '';
    if (essayInstruction) formData.append('instruction', essayInstruction);

    const res = await fetch('/api/check-essay', {
      method: 'POST',
      body: formData,
      signal: controller.signal,
    });

    let data;
    try {
      data = await res.json();
    } catch {
      throw new Error(`Server xatolik qaytardi (Status: ${res.status})`);
    }

    if (!res.ok || !data.success) {
      throw new Error(data.message || "Inshoni tahlil qilib bo'lmadi");
    }

    renderEssayResult(data);
    haptic('success');
  } catch (err) {
    console.error("Insho tahlil xatosi:", err);
    haptic('error');
    if (err.name === 'AbortError') {
      alert("Tahlil vaqti tugadi (server band yoki internet sekin). Iltimos, qayta urinib ko'ring.");
    } else {
      alert("Xatolik yuz berdi: " + err.message);
    }
  } finally {
    clearTimeout(timeoutId);
    loadingOverlay.classList.add('hidden');
    progressBar.style.width = '0%';
  }
}

function renderEssayResult(data) {
  essayInputCard.classList.add('hidden');
  essayResultCard.classList.remove('hidden');
  essayResultCard.classList.add('flex');

  essayStudentName.textContent = data.studentName || "—";
  essayTopicDisplay.textContent = data.topic ? `${t('critContent')}: ${data.topic}` : "";
  essayWordCount.textContent = `${data.wordCount || 0} ${t('wordsCountUnit')}`;

  // Baho
  const mark = data.mark || 3;
  essayMarkBadge.textContent = `${mark} ${t('markSuffix')}`.trim();
  essayMarkBadge.className = mark >= 4 
    ? 'text-lg font-black bg-emerald-100 text-emerald-800 px-3 py-1 rounded-xl shadow-xs inline-block'
    : 'text-lg font-black bg-rose-100 text-rose-800 px-3 py-1 rounded-xl shadow-xs inline-block';
  essayScorePercent.textContent = `${data.overallScore || 0}%`;

  // Mezonlar
  scoreContent.textContent = `${data.criteria?.content ?? '-'}/10`;
  scoreGrammar.textContent = `${data.criteria?.grammar ?? '-'}/10`;
  scoreLogic.textContent = `${data.criteria?.logic ?? '-'}/10`;

  // Xatolar
  const errors = data.spellingErrors || [];
  essayErrorsCount.textContent = t('essayErrorsCount', { count: errors.length });
  essayErrorsList.innerHTML = '';

  if (errors.length === 0) {
    essayErrorsList.innerHTML = `<div class="text-emerald-600 bg-emerald-50 p-2 rounded-xl text-center font-medium">Qo'pol imlo xatolari topilmadi! Barakalla 🎉</div>`;
  } else {
    errors.forEach((err, idx) => {
      const errItem = document.createElement('div');
      errItem.className = 'p-2 rounded-xl bg-rose-50 border border-rose-100 flex items-start justify-between gap-2';
      errItem.innerHTML = `
        <div class="flex-1">
          <span class="text-rose-700 font-bold line-through">${escapeHtml(err.original || '')}</span>
          <span class="text-slate-400 mx-1">➜</span>
          <span class="text-emerald-700 font-bold">${escapeHtml(err.correction || '')}</span>
        </div>
        <span class="text-[9px] bg-rose-200/60 text-rose-800 px-1.5 py-0.5 rounded font-medium">${escapeHtml(err.type || 'imlo')}</span>
      `;
      essayErrorsList.appendChild(errItem);
    });
  }

  // O'qituvchi xulosasi
  essayTeacherFeedback.textContent = data.teacherFeedback || "Insho tahlil qilindi.";

  // Transkripsiya
  essayTranscription.textContent = data.transcription || "Matn o'qilmadi.";
}

btnNextEssay.addEventListener('click', () => {
  haptic('light');
  essayResultCard.classList.add('hidden');
  essayResultCard.classList.remove('flex');
  essayInputCard.classList.remove('hidden');
});

// ==================== MATEMATIKA MODULI BOSHQARUVI ====================

let selectedMathFiles = [];
let batchMathResults = [];

const mathSection = document.getElementById('mathSection');
const mathInputCard = document.getElementById('mathInputCard');
const mathResultCard = document.getElementById('mathResultCard');
const mathBatchResultCard = document.getElementById('mathBatchResultCard');

const mathTaskPrompt = document.getElementById('mathTaskPrompt');
const mathExpectedAnswer = document.getElementById('mathExpectedAnswer');
const mathCameraInput = document.getElementById('mathCameraInput');
const mathGalleryInput = document.getElementById('mathGalleryInput');

const mathInitialUploadArea = document.getElementById('mathInitialUploadArea');
const btnMathCamera = document.getElementById('btnMathCamera');
const btnMathGallery = document.getElementById('btnMathGallery');

const mathSelectedFilesCard = document.getElementById('mathSelectedFilesCard');
const mathSelectedCountText = document.getElementById('mathSelectedCountText');
const mathPreviewThumbnails = document.getElementById('mathPreviewThumbnails');
const btnClearAllMathFiles = document.getElementById('btnClearAllMathFiles');
const btnAddMoreMathCamera = document.getElementById('btnAddMoreMathCamera');
const btnAddMoreMathGallery = document.getElementById('btnAddMoreMathGallery');
const btnStartMathBatchCheck = document.getElementById('btnStartMathBatchCheck');

// Yagona natija maydonlari (1 ta daftar uchun)
const mathStudentName = document.getElementById('mathStudentName');
const mathProblemDisplay = document.getElementById('mathProblemDisplay');
const mathAnswerStatusBadge = document.getElementById('mathAnswerStatusBadge');
const mathMarkBadge = document.getElementById('mathMarkBadge');
const mathScorePercent = document.getElementById('mathScorePercent');
const mathStudentAnswer = document.getElementById('mathStudentAnswer');
const mathCorrectAnswer = document.getElementById('mathCorrectAnswer');
const mathStepsList = document.getElementById('mathStepsList');
const mathTeacherFeedback = document.getElementById('mathTeacherFeedback');
const btnNextMath = document.getElementById('btnNextMath');

// Ommaviy natijalar jadvali maydonlari
const mathBatchTotalCount = document.getElementById('mathBatchTotalCount');
const mathBatchAvgScore = document.getElementById('mathBatchAvgScore');
const mathGradeStatsBadges = document.getElementById('mathGradeStatsBadges');
const mathResultsTableBody = document.getElementById('mathResultsTableBody');
const btnExportMathCsv = document.getElementById('btnExportMathCsv');
const btnNextMathBatch = document.getElementById('btnNextMathBatch');

// Ayrim matematika daftari tafsiloti modali
const mathDetailsModal = document.getElementById('mathDetailsModal');
const modalMathStudentTitle = document.getElementById('modalMathStudentTitle');
const modalMathProblemSub = document.getElementById('modalMathProblemSub');
const btnCloseMathModal = document.getElementById('btnCloseMathModal');
const btnModalMathCloseBottom = document.getElementById('btnModalMathCloseBottom');
const modalMathStatusBadge = document.getElementById('modalMathStatusBadge');
const modalMathMarkBadge = document.getElementById('modalMathMarkBadge');
const modalMathScorePercent = document.getElementById('modalMathScorePercent');
const modalMathStudentAnswer = document.getElementById('modalMathStudentAnswer');
const modalMathCorrectAnswer = document.getElementById('modalMathCorrectAnswer');
const modalMathStepsList = document.getElementById('modalMathStepsList');
const modalMathFeedback = document.getElementById('modalMathFeedback');

// Kamera va Galereya tugmalari
btnMathCamera.addEventListener('click', () => mathCameraInput.click());
btnMathGallery.addEventListener('click', () => mathGalleryInput.click());
btnAddMoreMathCamera.addEventListener('click', () => mathCameraInput.click());
btnAddMoreMathGallery.addEventListener('click', () => mathGalleryInput.click());

mathCameraInput.addEventListener('change', (e) => {
  appendMathFiles(e.target.files);
  mathCameraInput.value = '';
});

mathGalleryInput.addEventListener('change', (e) => {
  appendMathFiles(e.target.files);
  mathGalleryInput.value = '';
});

btnClearAllMathFiles.addEventListener('click', () => {
  haptic('light');
  selectedMathFiles = [];
  mathCameraInput.value = '';
  mathGalleryInput.value = '';
  renderSelectedMathFilesView();
});

function appendMathFiles(files) {
  if (!files || files.length === 0) return;
  haptic('medium');

  for (const f of files) {
    if (f.type.startsWith('image/')) {
      selectedMathFiles.push(f);
    }
  }

  renderSelectedMathFilesView();
}

function removeMathFile(index) {
  haptic('light');
  selectedMathFiles.splice(index, 1);
  renderSelectedMathFilesView();
}

function renderSelectedMathFilesView() {
  if (selectedMathFiles.length === 0) {
    mathSelectedFilesCard.classList.add('hidden');
    mathSelectedFilesCard.classList.remove('flex');
    mathInitialUploadArea.classList.remove('hidden');
    return;
  }

  mathInitialUploadArea.classList.add('hidden');
  mathSelectedFilesCard.classList.remove('hidden');
  mathSelectedFilesCard.classList.add('flex');

  mathSelectedCountText.textContent = `${selectedMathFiles.length} ta daftar tanlandi`;
  btnStartMathBatchCheck.querySelector('span').textContent = selectedMathFiles.length === 1
    ? `Daftarni tekshirish (1 ta) 🚀`
    : `Hammasini tekshirish (${selectedMathFiles.length} ta) 🚀`;

  mathPreviewThumbnails.innerHTML = '';

  selectedMathFiles.forEach((file, index) => {
    const thumb = document.createElement('div');
    thumb.className = 'relative w-14 h-14 rounded-xl border border-slate-200 overflow-hidden shrink-0 bg-slate-100 shadow-xs';

    const img = document.createElement('img');
    img.src = URL.createObjectURL(file);
    img.className = 'w-full h-full object-cover';
    thumb.appendChild(img);

    const badge = document.createElement('span');
    badge.className = 'absolute bottom-0 left-0 bg-slate-900/80 text-white font-bold text-[9px] px-1 rounded-tr';
    badge.textContent = `#${index + 1}`;
    thumb.appendChild(badge);

    const btnRemove = document.createElement('button');
    btnRemove.type = 'button';
    btnRemove.className = 'absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-rose-500 hover:bg-rose-600 text-white font-bold text-[9px] flex items-center justify-center shadow-sm';
    btnRemove.textContent = '✕';
    btnRemove.title = "O'chirish";
    btnRemove.addEventListener('click', (ev) => {
      ev.stopPropagation();
      removeMathFile(index);
    });
    thumb.appendChild(btnRemove);

    mathPreviewThumbnails.appendChild(thumb);
  });
}

// Tekshirish tugmasi bosilganda
btnStartMathBatchCheck.addEventListener('click', async () => {
  if (selectedMathFiles.length === 0) {
    alert("Iltimos, avval daftar rasmini yuklang.");
    return;
  }

  if (selectedMathFiles.length === 1) {
    await handleMathUploadSingle(selectedMathFiles[0]);
  } else {
    await processMathBatchSheets();
  }
});

// Yagona daftarni tekshirish funksiyasi
async function handleMathUploadSingle(file) {
  haptic('medium');
  loadingOverlay.classList.remove('hidden');
  loadingOverlay.classList.add('flex');

  progressTitle.textContent = "Misol tahlil qilinmoqda...";
  progressCounter.textContent = "Yechim bosqichlari tekshirilmoqda 📐";
  progressBar.style.width = '70%';
  progressStatus.textContent = "Formulalar va hisob-kitob tahlil qilinmoqda...";

  const taskPrompt = mathTaskPrompt.value.trim();
  const expectedAnswer = mathExpectedAnswer.value.trim();
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 35000);

  try {
    const formData = new FormData();
    formData.append('image', file);
    if (taskPrompt) {
      formData.append('taskPrompt', taskPrompt);
      formData.append('instruction', taskPrompt);
    }
    if (expectedAnswer) formData.append('expectedAnswer', expectedAnswer);

    const res = await fetch('/api/check-math', {
      method: 'POST',
      body: formData,
      signal: controller.signal,
    });

    let data;
    try {
      data = await res.json();
    } catch {
      throw new Error(`Server xatolik qaytardi (Status: ${res.status})`);
    }

    if (!res.ok || !data.success) {
      throw new Error(data.message || "Misolni tahlil qilib bo'lmadi");
    }

    renderMathResult(data);
    haptic('success');
  } catch (err) {
    console.error("Matematika tahlil xatosi:", err);
    haptic('error');
    if (err.name === 'AbortError') {
      alert("Tahlil vaqti tugadi (server band yoki internet sekin). Iltimos, qayta urinib ko'ring.");
    } else {
      alert("Xatolik yuz berdi: " + err.message);
    }
  } finally {
    clearTimeout(timeoutId);
    loadingOverlay.classList.add('hidden');
    progressBar.style.width = '0%';
  }
}

// Butun sinf (ommaviy) daftarlarini navbat bilan tekshirish
async function processMathBatchSheets() {
  haptic('medium');
  loadingOverlay.classList.remove('hidden');
  loadingOverlay.classList.add('flex');

  const total = selectedMathFiles.length;
  let completed = 0;
  batchMathResults = new Array(total);

  progressTitle.textContent = "Sinf daftarlari tekshirilmoqda...";
  progressCounter.textContent = `0 / ${total} ta daftar tekshirildi (0%)`;
  progressBar.style.width = '0%';
  progressStatus.textContent = "1-daftar tahlil qilinmoqda...";

  const taskPrompt = mathTaskPrompt.value.trim();
  const expectedAnswer = mathExpectedAnswer.value.trim();

  for (let i = 0; i < total; i++) {
    const file = selectedMathFiles[i];
    const sheetNumber = i + 1;

    const percent = Math.round((completed / total) * 100);
    progressCounter.textContent = `${completed} / ${total} ta daftar tekshirildi (${percent}%)`;
    progressBar.style.width = `${percent}%`;
    progressStatus.textContent = `${sheetNumber}-daftar tahlil qilinmoqda... 📐`;

    const controller = new AbortController();
    const tId = setTimeout(() => controller.abort(), 35000);

    try {
      const formData = new FormData();
      formData.append('image', file);
      if (taskPrompt) {
        formData.append('taskPrompt', taskPrompt);
        formData.append('instruction', taskPrompt);
      }
      if (expectedAnswer) formData.append('expectedAnswer', expectedAnswer);

      const res = await fetch('/api/check-math', {
        method: 'POST',
        body: formData,
        signal: controller.signal,
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Tahlil xatosi");
      }

      batchMathResults[i] = {
        sheetNumber,
        success: true,
        fileName: file.name,
        ...data,
      };
    } catch (err) {
      const errMsg = err.name === 'AbortError' ? "Vaqt tugadi (server band)" : (err.message || "Tahlil xatosi");
      console.warn(`Math ${sheetNumber}-daftarda xato:`, errMsg);
      batchMathResults[i] = {
        sheetNumber,
        success: false,
        fileName: file.name,
        error: errMsg,
      };
    } finally {
      clearTimeout(tId);
    }

    completed++;
    const finalPercent = Math.round((completed / total) * 100);
    progressCounter.textContent = `${completed} / ${total} ta daftar tekshirildi (${finalPercent}%)`;
    progressBar.style.width = `${finalPercent}%`;

    // API kvotasi va limitiga moslashish uchun ozgina tanaffus
    if (i < total - 1) {
      await new Promise(r => setTimeout(r, 600));
    }
  }

  // Tahlil yakunlandi
  loadingOverlay.classList.add('hidden');
  progressBar.style.width = '0%';
  haptic('success');

  renderBatchMathResultsTable(batchMathResults);
}

function renderMathResult(data) {
  mathInputCard.classList.add('hidden');
  mathResultCard.classList.remove('hidden');
  mathResultCard.classList.add('flex');

  mathStudentName.textContent = data.studentName || "O'quvchi ismi ko'rsatilmagan";
  mathProblemDisplay.textContent = data.problemStatement || "Masala sharti";

  // Yakuniy javob statusi
  if (data.isFinalCorrect) {
    mathAnswerStatusBadge.textContent = "Yakuniy javob: To'g'ri ✅";
    mathAnswerStatusBadge.className = "mt-1 text-[10px] font-bold px-2 py-0.5 rounded-full inline-block bg-emerald-100 text-emerald-800";
  } else {
    mathAnswerStatusBadge.textContent = t('statusIncorrect');
    mathAnswerStatusBadge.className = "mt-1 text-[10px] font-bold px-2 py-0.5 rounded-full inline-block bg-rose-100 text-rose-800";
  }

  // Baho
  const mark = data.mark || 3;
  mathMarkBadge.textContent = `${mark} ${t('markSuffix')}`.trim();
  mathMarkBadge.className = mark >= 4
    ? 'text-lg font-black bg-emerald-100 text-emerald-800 px-3 py-1 rounded-xl shadow-xs inline-block'
    : 'text-lg font-black bg-rose-100 text-rose-800 px-3 py-1 rounded-xl shadow-xs inline-block';
  mathScorePercent.textContent = `${data.scorePercent || 0}%`;

  // Javoblar taqqoslashi
  mathStudentAnswer.textContent = data.finalAnswer || "-";
  mathCorrectAnswer.textContent = data.expectedAnswer || "-";

  // Bosqichlar
  const steps = data.stepsAnalysis || [];
  mathStepsList.innerHTML = '';

  if (steps.length === 0) {
    mathStepsList.innerHTML = `<div class="text-slate-500 bg-slate-50 p-2 rounded-xl text-center">Yechish bosqichlari to'g'ridan-to'g'ri bajarilgan.</div>`;
  } else {
    steps.forEach((st) => {
      const stepItem = document.createElement('div');
      const isCorrect = st.status === 'correct';
      const isWarning = st.status === 'warning';

      let borderClass = 'bg-emerald-50 border-emerald-200 text-emerald-950';
      let icon = '✓';
      let badge = `<span class="text-[9px] font-bold bg-emerald-200 text-emerald-800 px-1.5 py-0.5 rounded">To'g'ri</span>`;

      if (isWarning) {
        borderClass = 'bg-amber-50 border-amber-200 text-amber-950';
        icon = '⚠️';
        badge = `<span class="text-[9px] font-bold bg-amber-200 text-amber-800 px-1.5 py-0.5 rounded">Diqqat</span>`;
      } else if (!isCorrect) {
        borderClass = 'bg-rose-50 border-rose-200 text-rose-950';
        icon = '✕';
        badge = `<span class="text-[9px] font-bold bg-rose-200 text-rose-800 px-1.5 py-0.5 rounded">Xato</span>`;
      }

      stepItem.className = `p-2.5 rounded-xl border ${borderClass} space-y-1`;
      stepItem.innerHTML = `
        <div class="flex items-center justify-between">
          <span class="font-bold text-xs">${icon} ${escapeHtml(st.step || 'Qadam')}</span>
          ${badge}
        </div>
        <div class="font-mono text-xs bg-white/70 px-2 py-1 rounded border border-black/5 font-semibold">
          ${escapeHtml(st.formula || '')}
        </div>
        ${st.comment ? `<p class="text-[11px] opacity-90 leading-tight">${escapeHtml(st.comment)}</p>` : ''}
      `;
      mathStepsList.appendChild(stepItem);
    });
  }

  // O'qituvchi xulosasi
  mathTeacherFeedback.textContent = data.teacherFeedback || "Misol tekshirildi.";
}

btnNextMath.addEventListener('click', () => {
  haptic('light');
  mathResultCard.classList.add('hidden');
  mathResultCard.classList.remove('flex');
  selectedMathFiles = [];
  renderSelectedMathFilesView();
  mathInputCard.classList.remove('hidden');
});

// ==================== MATEMATIKA OMMAVIY NATIJALAR JADVALI ====================

function renderBatchMathResultsTable(results) {
  mathInputCard.classList.add('hidden');
  mathBatchResultCard.classList.remove('hidden');
  mathBatchResultCard.classList.add('flex');

  mathResultsTableBody.innerHTML = '';
  mathGradeStatsBadges.innerHTML = '';

  const validResults = results.filter(r => r.success);
  const totalCount = results.length;

  mathBatchTotalCount.textContent = `Jami: ${totalCount} ta daftar`;

  let avgScore = 0;
  const gradeCounts = { 5: 0, 4: 0, 3: 0, 2: 0 };

  if (validResults.length > 0) {
    const totalScore = validResults.reduce((sum, r) => sum + Number(r.scorePercent || 0), 0);
    avgScore = Math.round(totalScore / validResults.length);

    validResults.forEach(r => {
      const mark = r.mark || 2;
      gradeCounts[mark] = (gradeCounts[mark] || 0) + 1;
    });
  }

  mathBatchAvgScore.textContent = `O'rtacha: ${avgScore}%`;

  // Baholar badjlari
  mathGradeStatsBadges.innerHTML = `
    <span class="bg-white/20 text-white px-2.5 py-1 rounded-full font-bold text-[10px]">5 baho: ${gradeCounts[5]} ta</span>
    <span class="bg-white/20 text-white px-2.5 py-1 rounded-full font-bold text-[10px]">4 baho: ${gradeCounts[4]} ta</span>
    <span class="bg-white/20 text-white px-2.5 py-1 rounded-full font-bold text-[10px]">3 baho: ${gradeCounts[3]} ta</span>
    <span class="bg-white/20 text-white px-2.5 py-1 rounded-full font-bold text-[10px]">2 baho: ${gradeCounts[2]} ta</span>
  `;

  // Jadval qatorlari
  results.forEach((res, index) => {
    const tr = document.createElement('tr');
    tr.className = 'tbl-row transition-colors cursor-pointer border-b border-slate-100/80';

    const studentLabel = res.studentName
      ? `<div class="flex flex-col">
           <span class="font-black text-slate-800 text-xs">${escapeHtml(res.studentName)}</span>
           <span class="text-[10px] text-slate-400 font-medium">#${res.sheetNumber}-daftar</span>
         </div>`
      : `<span class="font-bold text-slate-800 text-xs">${res.sheetNumber}-daftar</span>`;

    if (res.success) {
      const isCorrect = res.isFinalCorrect;
      const statusBadge = isCorrect
        ? `<span class="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-full">To'g'ri ✅</span>`
        : `<span class="text-[10px] font-bold text-rose-700 bg-rose-100 px-2.5 py-1 rounded-full">Noto'g'ri ❌</span>`;

      const markColor = getMarkBadgeClass(res.mark);

      tr.innerHTML = `
        <td class="py-2.5 px-3">${studentLabel}</td>
        <td class="py-2.5 px-2">${statusBadge}</td>
        <td class="py-2.5 px-2 font-black text-slate-800">${res.scorePercent}%</td>
        <td class="py-2.5 px-2"><span class="${markColor}">${res.mark} baho</span></td>
        <td class="py-2.5 px-2 text-center">
          <div class="flex items-center justify-center gap-1.5">
            <button type="button" class="btn-view-math text-xs bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 px-2.5 py-1.5 rounded-xl font-bold transition-all active:scale-95" title="Ko'rish">
              Ko'rish 👁️
            </button>
            <button type="button" class="btn-edit-math text-xs bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 px-2.5 py-1.5 rounded-xl font-bold transition-all active:scale-95 shadow-2xs" title="Tahrirlash">
              ✏️
            </button>
          </div>
        </td>
      `;

      tr.querySelector('.btn-view-math').addEventListener('click', (e) => {
        e.stopPropagation();
        openMathDetailsModal(res, index);
      });

      tr.querySelector('.btn-edit-math').addEventListener('click', (e) => {
        e.stopPropagation();
        openEditModal('math', index);
      });

      tr.addEventListener('click', () => openMathDetailsModal(res, index));
    } else {
      tr.innerHTML = `
        <td class="py-2.5 px-3">${studentLabel}</td>
        <td colspan="3" class="py-2.5 px-2 text-rose-500 text-xs italic">
          ⚠️ Xato: ${escapeHtml(res.error)}
        </td>
        <td class="py-2.5 px-2 text-center">
          <span class="text-rose-400 text-xs">✕</span>
        </td>
      `;
    }

    mathResultsTableBody.appendChild(tr);
  });
}

// ==================== MATEMATIKA MODAL TAFSILOTI ====================

function openMathDetailsModal(res, index) {
  modalMathStudentTitle.textContent = res.studentName
    ? `👤 ${res.studentName} (#${res.sheetNumber}-daftar)`
    : `${res.sheetNumber}-daftar tahlili`;

  modalMathProblemSub.textContent = res.problemStatement || "Masala sharti";

  // Yakuniy javob
  if (res.isFinalCorrect) {
    modalMathStatusBadge.textContent = "To'g'ri ✅";
    modalMathStatusBadge.className = "text-xs font-bold px-2 py-0.5 rounded-full inline-block mt-0.5 bg-emerald-100 text-emerald-800";
  } else {
    modalMathStatusBadge.textContent = "Noto'g'ri ❌";
    modalMathStatusBadge.className = "text-xs font-bold px-2 py-0.5 rounded-full inline-block mt-0.5 bg-rose-100 text-rose-800";
  }

  // Baho
  const mark = res.mark || 3;
  modalMathMarkBadge.textContent = `${mark} baho`;
  modalMathMarkBadge.className = mark >= 4
    ? 'text-sm font-black px-3 py-1.5 rounded-xl bg-emerald-100 text-emerald-800 inline-block shadow-2xs'
    : 'text-sm font-black px-3 py-1.5 rounded-xl bg-rose-100 text-rose-800 inline-block shadow-2xs';

  modalMathScorePercent.textContent = `${res.scorePercent || 0}%`;
  modalMathStudentAnswer.textContent = res.finalAnswer || "-";
  modalMathCorrectAnswer.textContent = res.expectedAnswer || "-";

  // Bosqichlar
  const steps = res.stepsAnalysis || [];
  modalMathStepsList.innerHTML = '';

  if (steps.length === 0) {
    modalMathStepsList.innerHTML = `<div class="text-slate-500 bg-slate-50 p-3 rounded-2xl text-center text-xs font-medium">Yechish bosqichlari to'g'ridan-to'g'ri bajarilgan.</div>`;
  } else {
    steps.forEach(st => {
      const isCorrect = st.status === 'correct';
      const isWarning = st.status === 'warning';

      let borderClass = 'bg-emerald-50/80 border-emerald-200 text-emerald-950';
      let icon = '✓';
      let badge = `<span class="text-[9px] font-black bg-emerald-200 text-emerald-800 px-2 py-0.5 rounded-full">To'g'ri</span>`;

      if (isWarning) {
        borderClass = 'bg-amber-50/80 border-amber-200 text-amber-950';
        icon = '⚠️';
        badge = `<span class="text-[9px] font-black bg-amber-200 text-amber-800 px-2 py-0.5 rounded-full">Diqqat</span>`;
      } else if (!isCorrect) {
        borderClass = 'bg-rose-50/80 border-rose-200 text-rose-950';
        icon = '✕';
        badge = `<span class="text-[9px] font-black bg-rose-200 text-rose-800 px-2 py-0.5 rounded-full">Xato</span>`;
      }

      const item = document.createElement('div');
      item.className = `p-2.5 rounded-2xl border ${borderClass} space-y-1.5 shadow-2xs`;
      item.innerHTML = `
        <div class="flex items-center justify-between">
          <span class="font-bold text-xs">${icon} ${escapeHtml(st.step || 'Qadam')}</span>
          ${badge}
        </div>
        <div class="font-mono text-xs bg-white/70 px-2 py-0.5 rounded font-semibold">
          ${escapeHtml(st.formula || '')}
        </div>
        ${st.comment ? `<p class="text-[11px] opacity-90 leading-tight">${escapeHtml(st.comment)}</p>` : ''}
      `;
      modalMathStepsList.appendChild(item);
    });
  }

  // AI tavsiyasi
  modalMathFeedback.textContent = res.teacherFeedback || "Masala tahlil qilindi.";

  mathDetailsModal.classList.remove('hidden');
  mathDetailsModal.classList.add('flex');
}

function closeMathDetailsModal() {
  mathDetailsModal.classList.add('hidden');
  mathDetailsModal.classList.remove('flex');
}

btnCloseMathModal.addEventListener('click', closeMathDetailsModal);
btnModalMathCloseBottom.addEventListener('click', closeMathDetailsModal);

// ==================== CSV EKSPORT (MATEMATIKA) ====================

btnExportMathCsv.addEventListener('click', () => {
  if (batchMathResults.length === 0) return;
  haptic('medium');

  let csv = `"O'quvchi / Daftar","Masala","O'quvchi javobi","To'g'ri javob","Yakuniy natija","Ball (%)","Baho","Izoh"\r\n`;

  batchMathResults.forEach(r => {
    const nameCol = r.studentName ? `${r.studentName} (#${r.sheetNumber})` : `${r.sheetNumber}-daftar`;
    if (r.success) {
      const statusText = r.isFinalCorrect ? "To'g'ri" : "Noto'g'ri";
      csv += `"${nameCol}","${(r.problemStatement || '').replace(/"/g, '""')}","${(r.finalAnswer || '').replace(/"/g, '""')}","${(r.expectedAnswer || '').replace(/"/g, '""')}","${statusText}","${r.scorePercent}%",${r.mark},"${(r.teacherFeedback || '').replace(/"/g, '""')}"\r\n`;
    } else {
      csv += `"${nameCol}","-","-","-","Xato","0%",2,"${(r.error || '').replace(/"/g, '""')}"\r\n`;
    }
  });

  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `matematika_natijalari_${dateStr}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
});

btnNextMathBatch.addEventListener('click', () => {
  haptic('light');
  mathBatchResultCard.classList.add('hidden');
  mathBatchResultCard.classList.remove('flex');
  selectedMathFiles = [];
  renderSelectedMathFilesView();
  mathInputCard.classList.remove('hidden');
});

// ==================== QO'LDA TAHRIRLASH (MANUAL / INLINE EDIT) ====================

let currentEditType = null; // 'test' yoki 'math'
let currentEditIndex = -1;
let currentEditMark = 3;

const editResultModal = document.getElementById('editResultModal');
const editStudentName = document.getElementById('editStudentName');
const editScorePercent = document.getElementById('editScorePercent');
const btnCloseEditModal = document.getElementById('btnCloseEditModal');
const btnCancelEdit = document.getElementById('btnCancelEdit');
const btnSaveEdit = document.getElementById('btnSaveEdit');
const editMarkButtons = document.querySelectorAll('.btn-edit-mark');

function selectEditMark(mark) {
  currentEditMark = Number(mark);

  editMarkButtons.forEach(btn => {
    const btnMark = Number(btn.dataset.mark);
    if (btnMark === currentEditMark) {
      if (btnMark === 5) btn.className = 'btn-edit-mark py-2 rounded-xl font-bold bg-emerald-600 text-white shadow-sm flex items-center justify-center gap-1 scale-105 transition-all';
      else if (btnMark === 4) btn.className = 'btn-edit-mark py-2 rounded-xl font-bold bg-teal-600 text-white shadow-sm flex items-center justify-center gap-1 scale-105 transition-all';
      else if (btnMark === 3) btn.className = 'btn-edit-mark py-2 rounded-xl font-bold bg-amber-500 text-white shadow-sm flex items-center justify-center gap-1 scale-105 transition-all';
      else btn.className = 'btn-edit-mark py-2 rounded-xl font-bold bg-rose-600 text-white shadow-sm flex items-center justify-center gap-1 scale-105 transition-all';
    } else {
      btn.className = 'btn-edit-mark py-2 rounded-xl font-bold border border-slate-200 text-slate-700 bg-white hover:bg-slate-50 transition-all flex items-center justify-center gap-1';
    }
  });
}

editMarkButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    haptic('light');
    const mark = Number(btn.dataset.mark);
    selectEditMark(mark);

    // Bahoga mos default ball foizini taklif qilish (agar kerak bo'lsa)
    const currentScore = Number(editScorePercent.value) || 0;
    if (mark === 5 && currentScore < 85) editScorePercent.value = 90;
    else if (mark === 4 && (currentScore < 70 || currentScore >= 85)) editScorePercent.value = 75;
    else if (mark === 3 && (currentScore < 50 || currentScore >= 70)) editScorePercent.value = 60;
    else if (mark === 2 && currentScore >= 50) editScorePercent.value = 40;
  });
});

function openEditModal(type, index) {
  haptic('medium');
  currentEditType = type;
  currentEditIndex = index;

  let item = null;
  if (type === 'test') {
    item = batchResults[index];
  } else if (type === 'math') {
    item = batchMathResults[index];
  }

  if (!item) return;

  editStudentName.value = item.studentName || '';
  editScorePercent.value = item.scorePercent || 0;
  selectEditMark(item.mark || 3);

  editResultModal.classList.remove('hidden');
  editResultModal.classList.add('flex');
  editStudentName.focus();
}

function closeEditModal() {
  editResultModal.classList.add('hidden');
  editResultModal.classList.remove('flex');
}

btnCloseEditModal.addEventListener('click', closeEditModal);
btnCancelEdit.addEventListener('click', closeEditModal);

btnSaveEdit.addEventListener('click', () => {
  haptic('success');
  const newName = editStudentName.value.trim();
  const newScore = Math.max(0, Math.min(100, Number(editScorePercent.value) || 0));
  const newMark = currentEditMark;

  if (currentEditType === 'test' && batchResults[currentEditIndex]) {
    batchResults[currentEditIndex].studentName = newName || null;
    batchResults[currentEditIndex].scorePercent = newScore;
    batchResults[currentEditIndex].mark = newMark;
    // Scroll pozitsiyasini saqlash
    const tableContainer = resultsTableBody?.closest('.overflow-y-auto');
    const savedScroll = tableContainer ? tableContainer.scrollTop : 0;
    renderBatchResultsTable(batchResults);
    if (tableContainer) tableContainer.scrollTop = savedScroll;
  } else if (currentEditType === 'math' && batchMathResults[currentEditIndex]) {
    batchMathResults[currentEditIndex].studentName = newName || null;
    batchMathResults[currentEditIndex].scorePercent = newScore;
    batchMathResults[currentEditIndex].mark = newMark;
    // Scroll pozitsiyasini saqlash
    const mathTableContainer = mathResultsTableBody?.closest('.overflow-x-auto');
    const savedMathScroll = mathTableContainer ? mathTableContainer.scrollTop : 0;
    renderBatchMathResultsTable(batchMathResults);
    if (mathTableContainer) mathTableContainer.scrollTop = savedMathScroll;
  }

  closeEditModal();
});

// ==================== INTERAKTIV O'RGATISH QO'LLANMASI (ONBOARDING) ====================


// ==================== TIL TANLASH MODALI ====================
const languageModal = document.getElementById('languageModal');
const btnChangeLang = document.getElementById('btnChangeLang');
const btnConfirmLanguage = document.getElementById('btnConfirmLanguage');
let tempSelectedLang = currentLang;

function openLanguageModal(isFirstTime = false) {
  haptic('light');
  tempSelectedLang = currentLang;
  document.querySelectorAll('.lang-card').forEach(card => {
    const l = card.dataset.lang;
    const check = card.querySelector('.check-icon');
    if (l === tempSelectedLang) {
      card.classList.add('active');
      if (check) check.classList.remove('hidden');
    } else {
      card.classList.remove('active');
      if (check) check.classList.add('hidden');
    }
  });

  languageModal.classList.remove('hidden');
  languageModal.classList.add('flex');
}

function closeLanguageModal() {
  languageModal.classList.add('hidden');
  languageModal.classList.remove('flex');
}

document.querySelectorAll('.lang-card').forEach(card => {
  card.addEventListener('click', () => {
    haptic('light');
    tempSelectedLang = card.dataset.lang;
    document.querySelectorAll('.lang-card').forEach(c => {
      const isSel = c.dataset.lang === tempSelectedLang;
      c.classList.toggle('active', isSel);
      const ch = c.querySelector('.check-icon');
      if (ch) ch.classList.toggle('hidden', !isSel);
    });
  });
});

btnConfirmLanguage.addEventListener('click', () => {
  haptic('success');
  const isFirstTime = !localStorage.getItem('muallim_lang');
  setLanguage(tempSelectedLang, isFirstTime);
});

if (btnChangeLang) {
  btnChangeLang.addEventListener('click', () => openLanguageModal(false));
}

// ==================== INTERAKTIV SPOTLIGHT TOUR ====================
const tourOverlay = document.getElementById('tourOverlay');
const tourBackdrop = document.getElementById('tourBackdrop');
const tourSpotlightBox = document.getElementById('tourSpotlightBox');
const tourTooltip = document.getElementById('tourTooltip');
const tourStepBadge = document.getElementById('tourStepBadge');
const tourStepTitle = document.getElementById('tourStepTitle');
const tourStepDesc = document.getElementById('tourStepDesc');
const tourStepHintText = document.getElementById('tourStepHintText');
const btnTourPrev = document.getElementById('btnTourPrev');
const btnTourNext = document.getElementById('btnTourNext');
const tourNextBtnText = document.getElementById('tourNextBtnText');
const btnTourSkip = document.getElementById('btnTourSkip');
const btnOpenGuide = document.getElementById('btnOpenGuide');

let currentTourIndex = 0;

const TOUR_TARGETS = [
  {
    target: '#headerTabsContainer',
    align: 'bottom',
    screen: 1,
  },
  {
    target: '#tourStepQuestionsCard',
    align: 'bottom',
    screen: 1,
  },
  {
    target: '#tourStepAutoKeyCard',
    align: 'bottom',
    screen: 1,
  },
  {
    target: '#tourStepQuestionsList',
    align: 'top',
    screen: 1,
  },
  {
    target: '#btnProceedToCamera',
    align: 'top',
    screen: 1,
  },
  {
    target: '#initialUploadArea',
    align: 'bottom',
    screen: 2,
  },
  {
    target: '#btnOpenGuide',
    align: 'bottom',
    screen: 1,
  }
];

function renderTourStep(index) {
  currentTourIndex = index;
  const stepConfig = TOUR_TARGETS[index];
  const langSteps = window.I18N?.[currentLang]?.tourSteps || window.I18N?.['uz']?.tourSteps || [];
  const stepData = langSteps[index] || {};

  // Kerakli ekranga o'tkazish
  if (stepConfig.screen && typeof showScreen === 'function') {
    showScreen(stepConfig.screen);
  }

  // Elementni topish
  const targetEl = document.querySelector(stepConfig.target);
  if (!targetEl) {
    if (index < TOUR_TARGETS.length - 1) {
      renderTourStep(index + 1);
    } else {
      closeTour();
    }
    return;
  }

  // Elementni ekranning markaziga silliq olib kelish
  targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' });

  // 150ms kutiladi (scroll boshlanib koordinatalar to'g'ri olinishi uchun)
  setTimeout(() => {
    const rect = targetEl.getBoundingClientRect();

    // Spotlight nurli ramkasini target element ustiga o'rnatish
    const pad = 6;
    tourSpotlightBox.style.display = 'block';
    tourSpotlightBox.style.top = Math.max(0, rect.top - pad) + 'px';
    tourSpotlightBox.style.left = Math.max(4, rect.left - pad) + 'px';
    tourSpotlightBox.style.width = (rect.width + pad * 2) + 'px';
    tourSpotlightBox.style.height = (rect.height + pad * 2) + 'px';

    // Tooltip matnlarini yangilash
    tourStepBadge.textContent = t('tourStepCount', { current: index + 1, total: TOUR_TARGETS.length });
    tourStepTitle.innerHTML = stepData.title || '';
    tourStepDesc.innerHTML = stepData.desc || '';
    tourStepHintText.innerHTML = stepData.hint || '';

    // Tugmalar
    btnTourPrev.classList.toggle('hidden', index === 0);
    btnTourPrev.textContent = t('tourBtnPrev');
    btnTourSkip.textContent = t('tourBtnSkip');

    if (index === TOUR_TARGETS.length - 1) {
      tourNextBtnText.textContent = t('tourBtnFinish');
    } else {
      tourNextBtnText.textContent = t('tourBtnNext');
    }

    // Tooltip joylashuvi (yuqori yoki pastki)
    tourTooltip.style.display = 'block';
    const tooltipHeight = 220;
    const windowH = window.innerHeight;

    let tooltipTop;
    if (stepConfig.align === 'top') {
      tooltipTop = rect.top - tooltipHeight - 16;
      if (tooltipTop < 60) {
        tooltipTop = rect.bottom + 16;
      }
    } else {
      tooltipTop = rect.bottom + 16;
      if (tooltipTop + tooltipHeight > windowH) {
        tooltipTop = Math.max(60, rect.top - tooltipHeight - 16);
      }
    }

    tourTooltip.style.top = Math.max(10, Math.min(windowH - tooltipHeight - 10, tooltipTop)) + 'px';
    tourTooltip.style.left = '50%';
    tourTooltip.style.transform = 'translateX(-50%)';
  }, 120);
}

function startSpotlightTour() {
  haptic('medium');
  currentTourIndex = 0;
  tourOverlay.classList.remove('hidden');
  renderTourStep(0);
}

function closeTour() {
  haptic('light');
  tourOverlay.classList.add('hidden');
  tourSpotlightBox.style.display = 'none';
  tourTooltip.style.display = 'none';
  if (typeof showScreen === 'function') {
    showScreen(1);
  }
  try {
    localStorage.setItem('muallim_tour_completed', 'true');
  } catch {}
}

btnTourSkip.addEventListener('click', closeTour);
tourBackdrop.addEventListener('click', (e) => {
  // Fon bosilganda keyingisiga o'tish
  if (currentTourIndex < TOUR_TARGETS.length - 1) {
    haptic('light');
    renderTourStep(currentTourIndex + 1);
  } else {
    closeTour();
  }
});

btnTourPrev.addEventListener('click', () => {
  haptic('light');
  if (currentTourIndex > 0) {
    renderTourStep(currentTourIndex - 1);
  }
});

btnTourNext.addEventListener('click', () => {
  haptic('medium');
  if (currentTourIndex < TOUR_TARGETS.length - 1) {
    renderTourStep(currentTourIndex + 1);
  } else {
    closeTour();
  }
});

if (btnOpenGuide) {
  btnOpenGuide.addEventListener('click', () => {
    startSpotlightTour();
  });
}

// O'qituvchi buyrug'i chip tugmalari (Tezkor tanlov)
document.addEventListener('click', (e) => {
  const chip = e.target.closest('.btn-instruction-chip');
  if (chip) {
    haptic('light');
    const targetId = chip.dataset.target;
    const targetInput = document.getElementById(targetId);
    if (targetInput) {
      targetInput.value = chip.dataset.val || chip.textContent.trim();
      targetInput.focus();
    }
  }
});

// ==================== ILOVANI ISHGA TUSHIRISH ====================
initQuestions();
showScreen(1);
updateAllTranslations();

// Birinchi marta kirgan foydalanuvchiga:
try {
  const savedLang = localStorage.getItem('muallim_lang');
  if (!savedLang) {
    // Ilk bor kirganda til tanlash modalini ko'rsatish
    setTimeout(() => {
      openLanguageModal(true);
    }, 400);
  } else {
    setLanguage(savedLang, false);
    // Agar qo'llanma hali ko'rilmagan bo'lsa
    if (!localStorage.getItem('muallim_tour_completed')) {
      setTimeout(() => {
        startSpotlightTour();
      }, 500);
    }
  }
} catch {
  openLanguageModal(true);
}
