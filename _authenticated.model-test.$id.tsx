import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  addDoc,
  collection,
  doc,
  documentId,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  where,
} from "firebase/firestore";
import { getFirebase } from "@/lib/firebase";
import { useAuth } from "@/lib/auth-context";
import type { ModelTest, Question } from "@/lib/types";

export const Route = createFileRoute("/_authenticated/model-test/$id")({
  head: () => ({ meta: [{ title: "মডেল টেস্ট — CadreAdmit" }, { name: "robots", content: "noindex" }] }),
  component: TestRunner,
});

function TestRunner() {
  const { id } = Route.useParams();
  const { user, hasActiveSubscription, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [test, setTest] = useState<ModelTest | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [started, setStarted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const locked = !hasActiveSubscription && !isAdmin;

  useEffect(() => {
    if (locked) return;
    (async () => {
      const { db } = getFirebase();
      const tSnap = await getDoc(doc(db, "modelTests", id));
      if (!tSnap.exists()) { setLoading(false); return; }
      const t = { id: tSnap.id, ...(tSnap.data() as Omit<ModelTest, "id">) };
      setTest(t);
      setTimeLeft(t.durationMin * 60);
      // Fetch questions in chunks of 10 (Firestore `in` limit)
      const chunks: string[][] = [];
      for (let i = 0; i < t.questionIds.length; i += 10) chunks.push(t.questionIds.slice(i, i + 10));
      const results: Question[] = [];
      for (const c of chunks) {
        const qs = await getDocs(query(collection(db, "questions"), where(documentId(), "in", c)));
        qs.forEach((d) => results.push({ id: d.id, ...(d.data() as Omit<Question, "id">) }));
      }
      // Preserve order
      const byId: Record<string, Question> = Object.fromEntries(results.map((r) => [r.id, r]));
      setQuestions(t.questionIds.map((qid) => byId[qid]).filter(Boolean));
      setLoading(false);
    })();
  }, [id, locked]);

  const score = useMemo(() => questions.reduce((s, q) => (answers[q.id] === q.answer ? s + 1 : s), 0), [questions, answers]);

  const handleSubmit = async () => {
    if (submitted) return;
    setSubmitted(true);
    if (timerRef.current) clearInterval(timerRef.current);
    if (!user || !test) return;
    try {
      const { db } = getFirebase();
      await addDoc(collection(db, "attempts"), {
        userId: user.uid,
        testId: test.id,
        score,
        total: questions.length,
        answers,
        createdAt: serverTimestamp(),
      });
    } catch (err) { console.warn("attempt save failed", err); }
  };

  useEffect(() => {
    if (!started || submitted) return;
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) { handleSubmit(); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [started, submitted]);

  if (locked) return (
    <div className="mx-auto max-w-lg rounded-2xl border-2 border-dashed border-gold/50 bg-gold/5 p-8 text-center">
      <div className="mb-2 text-2xl">🔒</div>
      <h2 className="mb-2 text-lg font-bold">প্রিমিয়াম সাবস্ক্রিপশন প্রয়োজন</h2>
      <Link to="/pricing" className="btn-primary hover:btn-primary-hover mt-3 inline-flex">সাবস্ক্রাইব করুন</Link>
    </div>
  );

  if (loading) return <div className="text-ink-soft">লোড হচ্ছে…</div>;
  if (!test) return <div className="text-ink-soft">টেস্ট পাওয়া যায়নি।</div>;

  if (!started) {
    return (
      <div className="mx-auto max-w-xl rounded-3xl bg-surface p-8 text-center shadow-lg">
        <h1 className="mb-2 text-2xl font-bold">{test.title}</h1>
        <p className="mb-6 text-ink-soft">{test.description}</p>
        <div className="mb-6 grid grid-cols-2 gap-3">
          <div className="rounded-xl bg-bg-alt p-4"><div className="text-xs text-ink-faint">সময়</div><div className="num text-2xl font-bold">{test.durationMin} মিনিট</div></div>
          <div className="rounded-xl bg-bg-alt p-4"><div className="text-xs text-ink-faint">প্রশ্ন</div><div className="num text-2xl font-bold">{questions.length}</div></div>
        </div>
        <button onClick={() => setStarted(true)} className="btn-primary hover:btn-primary-hover w-full">
          শুরু করুন →
        </button>
      </div>
    );
  }

  const mm = Math.floor(timeLeft / 60).toString().padStart(2, "0");
  const ss = (timeLeft % 60).toString().padStart(2, "0");

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="sticky top-16 z-20 flex items-center justify-between rounded-xl bg-navy-deep px-5 py-3 text-white shadow-lg">
        <div className="font-bold">{test.title}</div>
        <div className={`mono rounded-lg px-3 py-1.5 text-sm font-bold ${timeLeft < 60 ? "bg-vital" : "bg-white/10"}`}>
          ⏱ {mm}:{ss}
        </div>
      </div>
      <div className="space-y-4">
        {questions.map((q, i) => (
          <div key={q.id} className="rounded-2xl border border-line-soft bg-surface p-6">
            <div className="mb-3 flex items-start gap-3">
              <span className="mono flex-none rounded-lg bg-vital/10 px-2.5 py-1 text-xs font-bold text-vital">{i + 1}</span>
              <h3 className="font-semibold">{q.question}</h3>
            </div>
            <div className="space-y-2">
              {q.options.map((opt, idx) => {
                const chosen = answers[q.id] === idx;
                const isCorrect = submitted && idx === q.answer;
                const isWrong = submitted && chosen && idx !== q.answer;
                return (
                  <button
                    key={idx}
                    disabled={submitted}
                    onClick={() => setAnswers((a) => ({ ...a, [q.id]: idx }))}
                    className={`flex w-full items-center gap-3 rounded-lg border-2 px-4 py-2.5 text-left transition ${
                      isCorrect ? "border-mint bg-mint/10"
                        : isWrong ? "border-vital bg-vital/10"
                        : chosen ? "border-vital bg-vital/5"
                        : "border-line bg-background hover:border-ink-faint"
                    }`}
                  >
                    <span className={`grid h-6 w-6 flex-none place-items-center rounded-full text-xs font-bold ${chosen ? "bg-vital text-white" : "bg-line text-ink-soft"}`}>
                      {String.fromCharCode(0x0995 + idx)}
                    </span>
                    {opt}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {!submitted ? (
        <button onClick={handleSubmit} className="btn-primary hover:btn-primary-hover w-full">সাবমিট করুন</button>
      ) : (
        <div className="rounded-2xl bg-navy-deep p-8 text-center text-white">
          <div className="mb-2 text-white/60">আপনার স্কোর</div>
          <div className="num mb-2 text-5xl font-bold text-gold">{score}<span className="text-2xl text-white/50">/{questions.length}</span></div>
          <div className="text-sm text-white/70">{Math.round((score / Math.max(1, questions.length)) * 100)}% সঠিক</div>
          <div className="mt-6 flex justify-center gap-3">
            <Link to="/model-test" className="rounded-xl bg-white/10 px-5 py-2.5 text-sm font-semibold hover:bg-white/15">সব টেস্ট</Link>
            <Link to="/tracker" className="rounded-xl bg-gold px-5 py-2.5 text-sm font-bold hover:bg-gold-dark">ট্র্যাকার দেখুন</Link>
          </div>
        </div>
      )}
    </div>
  );
}
