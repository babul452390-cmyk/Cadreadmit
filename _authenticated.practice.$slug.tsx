import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  addDoc,
  collection,
  getDocs,
  query,
  serverTimestamp,
  where,
} from "firebase/firestore";
import { getFirebase } from "@/lib/firebase";
import { useAuth } from "@/lib/auth-context";
import type { Question, Subject } from "@/lib/types";

export const Route = createFileRoute("/_authenticated/practice/$slug")({
  head: () => ({ meta: [{ title: "প্র্যাকটিস — CadreAdmit" }, { name: "robots", content: "noindex" }] }),
  component: PracticeSession,
});

function PracticeSession() {
  const { slug } = Route.useParams();
  const { user, hasActiveSubscription, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [subject, setSubject] = useState<Subject | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);
  const locked = !hasActiveSubscription && !isAdmin;

  useEffect(() => {
    (async () => {
      const { db } = getFirebase();
      const subSnap = await getDocs(query(collection(db, "subjects"), where("slug", "==", slug)));
      const sub = subSnap.docs[0]
        ? ({ id: subSnap.docs[0].id, ...(subSnap.docs[0].data() as Omit<Subject, "id">) })
        : null;
      setSubject(sub);
      if (sub) {
        const qSnap = await getDocs(query(collection(db, "questions"), where("subjectId", "==", sub.id)));
        // Non-premium users: limit to first 3 questions preview
        const all = qSnap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Question, "id">) }));
        setQuestions(locked ? all.slice(0, 3) : all);
      }
      setLoading(false);
    })();
  }, [slug, locked]);

  const score = useMemo(() => {
    if (!submitted) return 0;
    return questions.reduce((s, q) => (answers[q.id] === q.answer ? s + 1 : s), 0);
  }, [submitted, questions, answers]);

  const handleSubmit = async () => {
    setSubmitted(true);
    if (!user || !subject) return;
    try {
      const { db } = getFirebase();
      const s = questions.reduce((s, q) => (answers[q.id] === q.answer ? s + 1 : s), 0);
      await addDoc(collection(db, "attempts"), {
        userId: user.uid,
        subjectId: subject.id,
        score: s,
        total: questions.length,
        answers,
        createdAt: serverTimestamp(),
      });
    } catch (err) {
      console.warn("attempt save failed", err);
    }
  };

  if (loading) return <div className="text-ink-soft">লোড হচ্ছে…</div>;
  if (!subject) return <div className="text-ink-soft">বিষয় পাওয়া যায়নি। <Link to="/practice" className="text-vital underline">ফিরুন</Link></div>;
  if (questions.length === 0) return <div className="text-ink-soft">এই বিষয়ে কোনো প্রশ্ন নেই।</div>;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link to="/practice" className="text-sm text-ink-soft hover:text-ink">← সকল বিষয়</Link>
          <h1 className="mt-1 text-2xl font-bold text-ink md:text-3xl">{subject.name}</h1>
        </div>
        <div className="mono rounded-full bg-mint/10 px-3 py-1.5 text-xs font-semibold text-mint-dark">
          {questions.length} প্রশ্ন
        </div>
      </div>

      {locked && (
        <div className="rounded-xl bg-vital/10 p-4 text-sm text-vital-dark">
          🔒 আপনি প্রথম ৩টি প্রশ্ন দেখতে পারছেন। বাকি প্রশ্ন আনলক করতে <Link to="/pricing" className="font-semibold underline">সাবস্ক্রাইব করুন</Link>।
        </div>
      )}

      <div className="space-y-4">
        {questions.map((q, i) => (
          <div key={q.id} className="rounded-2xl border border-line-soft bg-surface p-6">
            <div className="mb-3 flex items-start gap-3">
              <span className="mono flex-none rounded-lg bg-vital/10 px-2.5 py-1 text-xs font-bold text-vital">{i + 1}</span>
              <h3 className="font-semibold text-ink">{q.question}</h3>
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
                      isCorrect ? "border-mint bg-mint/10 text-mint-dark"
                        : isWrong ? "border-vital bg-vital/10 text-vital-dark"
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
            {submitted && q.explanation && (
              <div className="mt-3 rounded-lg bg-bg-alt p-3 text-sm text-ink-soft">
                💡 {q.explanation}
              </div>
            )}
          </div>
        ))}
      </div>

      {!submitted ? (
        <button
          onClick={handleSubmit}
          className="btn-primary hover:btn-primary-hover w-full"
          disabled={Object.keys(answers).length !== questions.length}
        >
          {Object.keys(answers).length !== questions.length ? `${questions.length - Object.keys(answers).length}টি প্রশ্ন বাকি` : "সাবমিট করুন"}
        </button>
      ) : (
        <div className="rounded-2xl bg-navy-deep p-6 text-center text-white">
          <div className="mb-2 text-white/60">আপনার স্কোর</div>
          <div className="num mb-2 text-5xl font-bold text-gold">{score}<span className="text-2xl text-white/50">/{questions.length}</span></div>
          <div className="text-sm text-white/70">{Math.round((score / questions.length) * 100)}% সঠিক</div>
          <div className="mt-5 flex justify-center gap-3">
            <Link to="/practice" className="rounded-xl bg-white/10 px-5 py-2.5 text-sm font-semibold hover:bg-white/15">← ফিরুন</Link>
            <button onClick={() => { setAnswers({}); setSubmitted(false); }} className="rounded-xl bg-gold px-5 py-2.5 text-sm font-bold hover:bg-gold-dark">
              আবার চেষ্টা করুন
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
