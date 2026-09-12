import { cleanAndParseJson } from '../src/vision.js';

console.log("=== Vision JSON parser testlari boshlandi ===");

// 1. Standart toza JSON (faqat javoblar)
const sample1 = '{"1": "A", "2": "B", "3": null}';
const res1 = cleanAndParseJson(sample1);
console.log("1. Toza JSON:", res1);
if (res1.answers["1"] !== "A" || res1.answers["2"] !== "B" || res1.answers["3"] !== null) {
  throw new Error("Test 1 muvaffaqiyatsiz!");
}

// 2. Markdown blokli JSON (```json ... ```)
const sample2 = '```json\n{"1": "c", "2": "d", "3": "null"}\n```';
const res2 = cleanAndParseJson(sample2);
console.log("2. Markdown bilan:", res2);
if (res2.answers["1"] !== "C" || res2.answers["2"] !== "D" || res2.answers["3"] !== null) {
  throw new Error("Test 2 muvaffaqiyatsiz!");
}

// 3. studentName va answers kalitlari bilan
const sample3 = '{"studentName": "Aliyev Vali", "answers": {"1": "A", "2": "B"}}';
const res3 = cleanAndParseJson(sample3);
console.log("3. Ism bilan:", res3);
if (res3.studentName !== "Aliyev Vali" || res3.answers["1"] !== "A" || res3.answers["2"] !== "B") {
  throw new Error("Test 3 muvaffaqiyatsiz!");
}

// 4. Matn ichiga o'ralgan JSON
const sample4 = 'Natijalar: {"studentName": "Karimova Zilola", "answers": {"1": "C", "2": "D"}} Shu tartibda.';
const res4 = cleanAndParseJson(sample4);
console.log("4. Matn ichida:", res4);
if (res4.studentName !== "Karimova Zilola" || res4.answers["1"] !== "C") {
  throw new Error("Test 4 muvaffaqiyatsiz!");
}

console.log("\n✅ Vision JSON parsing testlari muvaffaqiyatli yakunlandi!");
