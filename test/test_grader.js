import { parseAnswerKey, gradeTest, formatReport } from '../src/grader.js';

console.log("=== Grader testlari boshlandi ===");

// 1. Ketma-ket harflar testi
const key1 = parseAnswerKey("ABCDA");
console.log("1. Ketma-ket ABCDA:", JSON.stringify(key1));
if (JSON.stringify(key1) !== JSON.stringify({"1": "A", "2": "B", "3": "C", "4": "D", "5": "A"})) {
  throw new Error("Test 1 xato!");
}

// 2. Probelli / vergulli harflar
const key2 = parseAnswerKey("A, B, c, d, A");
console.log("2. Vergulli:", JSON.stringify(key2));
if (key2["3"] !== "C") throw new Error("Test 2 xato!");

// 3. Raqamlangan format
const key3 = parseAnswerKey("1-A, 2-B, 3-C, 4-D, 5-A");
console.log("3. Raqamlangan:", JSON.stringify(key3));
if (key3["5"] !== "A") throw new Error("Test 3 xato!");

// 4. Nuqtali va yangi qatorli format
const key4 = parseAnswerKey("1.A\n2.b\n3.C\n4.D");
console.log("4. Nuqtali va yangi qatorli:", JSON.stringify(key4));
if (key4["2"] !== "B") throw new Error("Test 4 xato!");

// 5. Baholash va hisobot testi
const masterKey = { "1": "A", "2": "B", "3": "C", "4": "D", "5": "A" };
const studentAnswers = { "1": "A", "2": "B", "3": "B", "4": "D", "5": null };

const gradeRes = gradeTest(masterKey, studentAnswers);
console.log("Baholash natijasi:", gradeRes);

if (gradeRes.total !== 5 || gradeRes.correct !== 3 || gradeRes.incorrect !== 2) {
  throw new Error("Grade calculation xato!");
}

const report = formatReport(gradeRes);
console.log("\nHisobot:\n" + report);

console.log("\n✅ Barcha testlar muvaffaqiyatli o'tdi!");
