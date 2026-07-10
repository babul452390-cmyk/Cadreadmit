import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  addDoc,
  collection,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  where,
} from "firebase/firestore";
import { getFirebase } from "@/lib/firebase";
import { useAuth } from "@/lib/auth-context";
import type { WrittenSubmission, WrittenTopic } from "@/lib/types";

export const Route = createFileRoute("/_authenticated/written")({
  head: () => ({ meta: [{ title: "লিখিত অনুশীলন — CadreAdmit" }, { name: "robots", content: "noindex" }] }),
  component: Written,
});

function Written() {
  const { user, hasActiveSubscription, isAdmin } = useAuth();
  const [topics, setTopics] = useState<WrittenTopic[]>([]);
  const [subs, setSubs] = useState<WrittenSubmission[]>([]);
  const [selected, setSelected] = useState<WrittenTopic | null>(null);
  const [answer, setAnswer] = useState("");
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);
  const locked = !hasActiveSubscription && !isAdmin;

  useEffect(() => {
    (async () => {
      const { db } = getFirebase();
      const t = await getDocs(collection(db, "writtenTopics"));
      setTopics(t.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<WrittenTopic, "id">) })));
      if (user) {
        const s = await getDocs(query(
          collection(db, "writtenSubmissions"),
          where("userId", "==", user.uid),
          orderBy("createdAt", "desc"),
        ));
        setSubs(s.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<WrittenSubmission, "id">) })));
      }
    })();
  }, [user, saved]);

  const submit = async () => {
    if (!user || !selected) return;
    setBusy(true);
    try {
      const { db } = getFirebase();
      await addDoc(collection(db, "writtenSubmissions"), {
        userId: user.uid,
        topicId: selected.id,
        answer: answer.trim(),
        createdAt: serverTimestamp(),
      });
      setSaved(true);
      setSelected(null);
      setAnswer("");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-ink md:text-3xl">লিখিত অনুশীলন</h1>
        <p className="mt-1 text-ink-soft">টপিক বেছে নিন, উত্তর লিখুন, অ্যাডমিন ফিডব্যাক দেবেন।</p>
      </div>

      {saved && <div className="rounded-xl bg-mint/10 px-4 py-3 text-sm text-mint-dark">✓ আপনার উত্তর জমা হয়েছে।</div>}

      <div className="grid gap-4 md:grid-cols-2">
        {topics.map((t) => (
          <div key={t.id} className="rounded-2xl border border-line-soft bg-surface p-5">
            <div className="mono mb-1 text-xs uppercase text-ink-faint">{t.subject}</div>
            <h3 className="mb-2 text-lg font-bold text-ink">{t.title}</h3>
            <p className="mb-4 text-sm text-ink-soft">{t.prompt}</p>
            {locked ? (
              <div className="text-sm text-vital">🔒 প্রিমিয়ামে আনলক হবে</div>
            ) : (
              <button
                onClick={() => { setSelected(t); setAnswer(""); }}
                className="rounded-lg bg-vital px-4 py-2 text-sm font-semibold text-white hover:bg-vital-dark"
              >
                উত্তর লিখুন →
              </button>
            )}
          </div>
        ))}
      </div>

      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setSelected(null)}>
          <div onClick={(e) => e.stopPropagation()} className="w-full max-w-2xl rounded-2xl bg-surface p-6 shadow-xl md:p-8">
            <h3 className="mb-2 text-lg font-bold">{selected.title}</h3>
            <p className="mb-4 text-sm text-ink-soft">{selected.prompt}</p>
            <textarea
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              rows={10}
              className="w-full rounded-lg border-2 border-line bg-background px-4 py-3 focus:border-mint focus:bg-surface focus:outline-none"
              placeholder="এখানে উত্তর লিখুন..."
            />
            <div className="mt-4 flex justify-end gap-2">
              <button onClick={() => setSelected(null)} className="rounded-lg border border-line px-4 py-2 text-sm">বাতিল</button>
              <button onClick={submit} disabled={!answer.trim() || busy} className="btn-primary hover:btn-primary-hover disabled:opacity-60">জমা দিন</button>
            </div>
          </div>
        </div>
      )}

      {subs.length > 0 && (
        <div className="rounded-2xl border border-line-soft bg-surface p-6">
          <h2 className="mb-3 text-lg font-bold">আপনার জমাসমূহ</h2>
          <div className="space-y-3">
            {subs.map((s) => {
              const topic = topics.find((t) => t.id === s.topicId);
              return (
                <div key={s.id} className="rounded-lg border border-line-soft p-4">
                  <div className="mb-1 font-semibold">{topic?.title || s.topicId}</div>
                  <div className="mb-2 text-sm text-ink-soft">{s.answer.slice(0, 200)}{s.answer.length > 200 ? "…" : ""}</div>
                  {s.feedback && <div className="rounded bg-mint/10 p-2 text-xs text-mint-dark">💬 ফিডব্যাক: {s.feedback}</div>}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
