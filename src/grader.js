/**
 * Test javoblar kalitini tahlil qilish va o'quvchi javoblari bilan solishtirish (Grader)
 */

/**
 * Foiz asosida 5 ballik bahoni hisoblash (O'zbekiston maktab tizimi):
 * 86% - 100% -> 5 baho
 * 71% - 85%  -> 4 baho
 * 56% - 70%  -> 3 baho
 * 0% - 55%   -> 2 baho
 * @param {number} percent 
 * @returns {number}
 */
export function calculateGradeMark(percent) {
  if (percent >= 86) return 5;
  if (percent >= 71) return 4;
  if (percent >= 56) return 3;
  return 2;
}

/**
 * Matnli kalitni Record<string, string> ga aylantirish
 * @param {string} rawInput 
 * @returns {Record<string, string>}
 */
export function parseAnswerKey(rawInput) {
  if (!rawInput || typeof rawInput !== 'string') {
    throw new Error("Kalit matni bo'sh bo'lishi mumkin emas.");
  }

  const cleaned = rawInput.trim();
  const result = {};

  const numberedPattern = /(\d{1,3})\s*[-.:=)\s]\s*([A-Za-z])/g;
  let match;
  let hasNumberedMatches = false;

  while ((match = numberedPattern.exec(cleaned)) !== null) {
    hasNumberedMatches = true;
    const qNum = parseInt(match[1], 10);
    const answer = match[2].toUpperCase();
    result[String(qNum)] = answer;
  }

  if (hasNumberedMatches && Object.keys(result).length > 0) {
    return result;
  }

  const letters = cleaned.match(/[A-Za-z]/g);
  if (letters && letters.length > 0) {
    letters.forEach((char, index) => {
      result[String(index + 1)] = char.toUpperCase();
    });
    return result;
  }

  throw new Error("Kalit formati noto'g'ri. Iltimos, 'ABCDA' yoki '1-A, 2-B, 3-C' formatida kiriting.");
}

/**
 * O'quvchi javoblarini etalon kalit bilan solishtirish
 * @param {Record<string, string>} masterKey 
 * @param {Record<string, string|null>} studentAnswers 
 * @returns {object}
 */
export function gradeTest(masterKey, studentAnswers = {}, studentName = null) {
  if (!masterKey || Object.keys(masterKey).length === 0) {
    throw new Error("Etalon javoblar kaliti mavjud emas.");
  }

  const questionNumbers = Object.keys(masterKey).sort((a, b) => Number(a) - Number(b));
  const total = questionNumbers.length;
  let correct = 0;
  const errors = [];
  const details = [];

  for (const num of questionNumbers) {
    const correctAnswer = masterKey[num]?.toUpperCase();
    
    let studentVal = studentAnswers[num] ?? studentAnswers[String(num)] ?? studentAnswers[Number(num)] ?? null;
    let studentAnswer = null;
    if (studentVal !== null && studentVal !== undefined) {
      const strVal = String(studentVal).trim().toUpperCase();
      if (strVal && strVal !== 'NULL' && strVal !== 'NONE' && strVal !== '-') {
        studentAnswer = strVal;
      }
    }

    const isCorrect = (studentAnswer === correctAnswer);
    if (isCorrect) {
      correct++;
    } else {
      const studentDesc = studentAnswer ? `O'quvchi javobi [${studentAnswer}]` : "Belgilanmagan";
      errors.push({
        question: num,
        studentDesc,
        correctAnswer: `[${correctAnswer}]`,
      });
    }

    details.push({
      question: Number(num),
      correctAnswer,
      studentAnswer: studentAnswer || null,
      isCorrect,
    });
  }

  const incorrect = total - correct;
  const rawPercent = total > 0 ? (correct / total) * 100 : 0;
  const scorePercent = Number.isInteger(rawPercent) ? rawPercent : Math.round(rawPercent);
  const mark = calculateGradeMark(scorePercent);
  const summaryText = studentName 
    ? `${studentName}: ${correct} / ${total} (${mark} baho)`
    : `Jami ball: ${correct} / ${total} (${mark} baho)`;

  return {
    studentName: studentName || null,
    total,
    correct,
    incorrect,
    scorePercent,
    mark,
    summaryText,
    errors,
    details,
  };
}

/**
 * Matnli hisobot yaratish (Telegram bot yoki konsol uchun)
 * @param {object} gradeResult 
 * @returns {string}
 */
export function formatReport(gradeResult) {
  const { studentName, total, correct, incorrect, scorePercent, mark, summaryText, errors } = gradeResult;

  let report = `📊 <b>Natija:</b>\n`;
  if (studentName) {
    report += `👤 <b>O'quvchi:</b> ${studentName}\n`;
  }
  report += `<b>${summaryText}</b>\n` +
    `To'g'ri: ${correct} ta\n` +
    `Noto'g'ri: ${incorrect} ta\n` +
    `Foiz: ${scorePercent}%\n`;

  if (errors.length > 0) {
    report += `\n❌ <b>Xatolar:</b>\n`;
    for (const err of errors) {
      report += `- ${err.question}-savol: ${err.studentDesc}, To'g'ri javob ${err.correctAnswer}\n`;
    }
  } else {
    report += `\n🎉 <b>Ajoyib natija!</b> Barcha javoblar to'g'ri!`;
  }

  return report;
}
