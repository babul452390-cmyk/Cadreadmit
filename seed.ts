// One-time Firestore seed helper. Runs from the admin dashboard button.
import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
  writeBatch,
} from "firebase/firestore";
import { getFirebase } from "./firebase";

const SUBJECTS = [
  { id: "bangla", name: "বাংলা", slug: "bangla", category: "preli" as const, order: 1, description: "ব্যাকরণ, সাহিত্য ও শব্দভাণ্ডার" },
  { id: "english", name: "ইংরেজি", slug: "english", category: "preli" as const, order: 2, description: "Grammar, Literature, Vocabulary" },
  { id: "math", name: "গণিত", slug: "math", category: "preli" as const, order: 3, description: "পাটিগণিত, বীজগণিত ও জ্যামিতি" },
  { id: "gk", name: "সাধারণ জ্ঞান", slug: "gk", category: "preli" as const, order: 4, description: "বাংলাদেশ ও আন্তর্জাতিক বিষয়াবলি" },
  { id: "science", name: "বিজ্ঞান", slug: "science", category: "preli" as const, order: 5, description: "সাধারণ বিজ্ঞান ও প্রযুক্তি" },
  { id: "computer", name: "কম্পিউটার", slug: "computer", category: "preli" as const, order: 6, description: "কম্পিউটার ও তথ্যপ্রযুক্তি" },
];

const QUESTIONS = [
  // বাংলা
  { subjectId: "bangla", question: "‘গৌরচন্দ্রিকা’ শব্দের অর্থ কী?", options: ["ভূমিকা", "উপসংহার", "মধ্যপর্ব", "সমাপ্তি"], answer: 0, explanation: "গৌরচন্দ্রিকা মানে ভূমিকা বা প্রস্তাবনা।" },
  { subjectId: "bangla", question: "‘সন্ধি’ কত প্রকার?", options: ["২", "৩", "৪", "৫"], answer: 1, explanation: "সন্ধি ৩ প্রকার — স্বরসন্ধি, ব্যঞ্জনসন্ধি ও বিসর্গসন্ধি।" },
  { subjectId: "bangla", question: "‘পথের পাঁচালী’ উপন্যাসের রচয়িতা কে?", options: ["রবীন্দ্রনাথ ঠাকুর", "বিভূতিভূষণ বন্দ্যোপাধ্যায়", "শরৎচন্দ্র চট্টোপাধ্যায়", "মানিক বন্দ্যোপাধ্যায়"], answer: 1 },
  { subjectId: "bangla", question: "‘অহি-নকুল’ কোন সমাস?", options: ["দ্বন্দ্ব", "কর্মধারয়", "তৎপুরুষ", "বহুব্রীহি"], answer: 3, explanation: "শত্রুতার সম্পর্ক বোঝাতে বহুব্রীহি সমাস।" },
  { subjectId: "bangla", question: "‘চর্যাপদ’ আবিষ্কৃত হয় কত সালে?", options: ["১৯০৫", "১৯০৭", "১৯০৯", "১৯১৬"], answer: 1 },
  // English
  { subjectId: "english", question: "Choose the correct spelling:", options: ["Accommodate", "Accomodate", "Acommodate", "Acomodate"], answer: 0 },
  { subjectId: "english", question: "The antonym of 'benevolent' is:", options: ["Kind", "Malevolent", "Generous", "Helpful"], answer: 1 },
  { subjectId: "english", question: "He _____ to Dhaka last week.", options: ["go", "gone", "went", "going"], answer: 2 },
  { subjectId: "english", question: "Identify the noun: 'Honesty is the best policy.'", options: ["is", "the", "Honesty", "best"], answer: 2 },
  { subjectId: "english", question: "'A stitch in time saves nine' means:", options: ["Sew early", "Timely action prevents loss", "Nine friends", "Save money"], answer: 1 },
  // Math
  { subjectId: "math", question: "১ থেকে ১০০ পর্যন্ত সংখ্যাগুলোর যোগফল কত?", options: ["৪৯৫০", "৫০৫০", "৫১০০", "৫০০০"], answer: 1, explanation: "n(n+1)/2 = 100×101/2 = 5050" },
  { subjectId: "math", question: "একটি ত্রিভুজের তিন কোণের সমষ্টি:", options: ["৯০°", "১৮০°", "২৭০°", "৩৬০°"], answer: 1 },
  { subjectId: "math", question: "৩৬০-এর ৩৫% কত?", options: ["১২৪", "১২৬", "১২৮", "১৩০"], answer: 1 },
  { subjectId: "math", question: "৫, ৮, ১১, ১৪, ... ধারাটির ১০ম পদ কত?", options: ["২৯", "৩২", "৩৫", "৩৮"], answer: 1, explanation: "a + (n-1)d = 5 + 9×3 = 32" },
  { subjectId: "math", question: "√১৪৪ + √৮১ = ?", options: ["২১", "২০", "২৩", "২৫"], answer: 0, explanation: "12 + 9 = 21" },
  // GK
  { subjectId: "gk", question: "বাংলাদেশের সংবিধান কার্যকর হয় কবে?", options: ["১৬ ডিসেম্বর ১৯৭২", "২৬ মার্চ ১৯৭২", "১৪ ডিসেম্বর ১৯৭২", "৪ নভেম্বর ১৯৭২"], answer: 0 },
  { subjectId: "gk", question: "জাতিসংঘের সদর দপ্তর কোথায়?", options: ["জেনেভা", "নিউইয়র্ক", "প্যারিস", "লন্ডন"], answer: 1 },
  { subjectId: "gk", question: "বাংলাদেশের জাতীয় ফুল কোনটি?", options: ["গোলাপ", "শাপলা", "পদ্ম", "বেলি"], answer: 1 },
  { subjectId: "gk", question: "SAARC-এর সদর দপ্তর কোথায়?", options: ["ঢাকা", "কাঠমান্ডু", "কলম্বো", "ইসলামাবাদ"], answer: 1 },
  { subjectId: "gk", question: "বাংলাদেশের সর্বোচ্চ পর্বতশৃঙ্গ কোনটি?", options: ["কেওক্রাডং", "তাজিংডং", "চিম্বুক", "সাকা হাফং"], answer: 3 },
  // Science
  { subjectId: "science", question: "পানির রাসায়নিক সংকেত:", options: ["H2O", "HO2", "H2O2", "OH"], answer: 0 },
  { subjectId: "science", question: "আলোর গতি প্রায়:", options: ["৩ × ১০⁵ km/s", "৩ × ১০⁸ m/s", "৩ × ১০⁶ m/s", "৩ × ১০⁴ km/s"], answer: 1 },
  { subjectId: "science", question: "মানবদেহে হাড়ের সংখ্যা:", options: ["২০০", "২০৬", "২১০", "১৯৮"], answer: 1 },
  { subjectId: "science", question: "সালোকসংশ্লেষণে ব্যবহৃত গ্যাস:", options: ["অক্সিজেন", "কার্বন ডাই অক্সাইড", "নাইট্রোজেন", "হাইড্রোজেন"], answer: 1 },
  { subjectId: "science", question: "ভিটামিন ‘সি’-এর রাসায়নিক নাম:", options: ["অ্যাসকরবিক এসিড", "সাইট্রিক এসিড", "ল্যাকটিক এসিড", "অক্সালিক এসিড"], answer: 0 },
  // Computer
  { subjectId: "computer", question: "CPU-এর পূর্ণরূপ:", options: ["Central Process Unit", "Central Processing Unit", "Computer Personal Unit", "Central Program Unit"], answer: 1 },
  { subjectId: "computer", question: "১ কিলোবাইট =", options: ["১০০০ বাইট", "১০২৪ বাইট", "৫১২ বাইট", "২০৪৮ বাইট"], answer: 1 },
  { subjectId: "computer", question: "HTML-এর পূর্ণরূপ:", options: ["Hyper Text Markup Language", "High Text Machine Language", "Hyper Transfer Markup Language", "Home Tool Markup Language"], answer: 0 },
  { subjectId: "computer", question: "কম্পিউটারের মস্তিষ্ক বলা হয়:", options: ["RAM", "ROM", "CPU", "HDD"], answer: 2 },
  { subjectId: "computer", question: "IP-এর পূর্ণরূপ:", options: ["Internet Provider", "Internet Protocol", "Internal Process", "Information Path"], answer: 1 },
];

const MODEL_TESTS = [
  {
    id: "mt-preli-1",
    title: "প্রিলি মডেল টেস্ট — ১",
    description: "সকল বিষয় থেকে সমন্বিত প্রশ্ন। সময়: ৩০ মিনিট।",
    durationMin: 30,
    category: "preli" as const,
    subjectSample: true,
  },
  {
    id: "mt-preli-2",
    title: "প্রিলি মডেল টেস্ট — ২",
    description: "চ্যালেঞ্জিং লেভেল। সময়: ৩০ মিনিট।",
    durationMin: 30,
    category: "preli" as const,
    subjectSample: true,
  },
];

const WRITTEN_TOPICS = [
  { id: "w-1", title: "বাংলাদেশের ডিজিটাল রূপান্তর", prompt: "‘ডিজিটাল বাংলাদেশ’ ধারণাটি বিশ্লেষণ করে বর্তমান বাস্তবতা ও ভবিষ্যৎ সম্ভাবনা আলোচনা করুন। (৩০০ শব্দ)", subject: "বাংলা রচনা" },
  { id: "w-2", title: "Climate Change and Bangladesh", prompt: "Discuss the impact of climate change on Bangladesh and suggest possible mitigation strategies. (300 words)", subject: "English Essay" },
  { id: "w-3", title: "সুশাসন ও উন্নয়ন", prompt: "সুশাসনের সঙ্গে টেকসই উন্নয়নের সম্পর্ক ব্যাখ্যা করুন।", subject: "প্রবন্ধ" },
];

export async function isSeeded(): Promise<boolean> {
  const { db } = getFirebase();
  const s = await getDoc(doc(db, "settings", "global"));
  return s.exists();
}

export async function seedAll(): Promise<{ questions: number; subjects: number; tests: number }> {
  const { db } = getFirebase();
  const batch = writeBatch(db);

  // settings
  batch.set(doc(db, "settings", "global"), {
    paymentAmount: 300,
    planDays: 30,
    planLabel: "১ মাস প্রিমিয়াম",
    bkashNumber: "01XXXXXXXXX",
    nagadNumber: "01XXXXXXXXX",
    instructions:
      "Send Money করে TrxID এখানে জমা দিন। অ্যাডমিন যাচাই করে ২৪ ঘণ্টার মধ্যে সাবস্ক্রিপশন সক্রিয় করবে।",
  });

  SUBJECTS.forEach((s) => {
    batch.set(doc(db, "subjects", s.id), s);
  });

  const perSubjectIds: Record<string, string[]> = {};
  QUESTIONS.forEach((q, idx) => {
    const id = `q-${idx + 1}`;
    batch.set(doc(db, "questions", id), { ...q, id });
    perSubjectIds[q.subjectId] = perSubjectIds[q.subjectId] || [];
    perSubjectIds[q.subjectId].push(id);
  });

  MODEL_TESTS.forEach((mt) => {
    // Pick 2 questions from each subject → 12 total
    const questionIds: string[] = [];
    Object.values(perSubjectIds).forEach((ids) => {
      const shuffled = [...ids].sort(() => Math.random() - 0.5);
      questionIds.push(...shuffled.slice(0, 2));
    });
    batch.set(doc(db, "modelTests", mt.id), {
      id: mt.id,
      title: mt.title,
      description: mt.description,
      durationMin: mt.durationMin,
      category: mt.category,
      questionIds,
      createdAt: serverTimestamp(),
    });
  });

  WRITTEN_TOPICS.forEach((t) => {
    batch.set(doc(db, "writtenTopics", t.id), t);
  });

  await batch.commit();

  // Mark seeded
  await setDoc(doc(db, "settings", "meta"), { seededAt: serverTimestamp() });

  return {
    questions: QUESTIONS.length,
    subjects: SUBJECTS.length,
    tests: MODEL_TESTS.length,
  };
}
