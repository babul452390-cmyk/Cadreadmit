import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  updateDoc,
} from "firebase/firestore";
import { getFirebase } from "@/lib/firebase";
import type { Question, Subject } from "@/lib/types";

export const Route = createFileRoute("/_authenticated/admin/questions")({
  head: () => ({ meta: [{ title: "Questions — Admin" }, { name: "robots", content: "noindex" }] }),
  component: AdminQuestions,
});

interface Draft {
  id?: string;
  subjectId: string;
  question: string;
  options: string[];
  answer: number;
  explanation?: string;
}

const empty = (subjectId: string): Draft => ({
  subjectId,
  question: "",
  options: ["", "", "", ""],
  answer: 0,
  explanation: "",
});

function AdminQuestions() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [filter, setFilter] = useState<string>("all");
  const [draft, setDraft] = useState<Draft | null>(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const { db } = getFirebase();
    const [sSnap, qSnap] = await Promise.all([
      getDocs(query(collection(db, "subjects"), orderBy("order"))),
      getDocs(collection(db, "questions")),
    ]);
    setSubjects(sSnap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Subject, "id">) })));
    setQuestions(qSnap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Question, "id">) })));
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const save = async () => {
    if (!draft) return;
    const { db } = getFirebase();
    const payload = {
      subjectId: draft.subjectId,
      question: draft.question.trim(),
      options: draft.options.map((o) => o.trim()),
      answer: draft.answer,
      explanation: draft.explanation?.trim() || "",
    };
    if (draft.id) {
      await updateDoc(doc(db, "questions", draft.id), payload);
    } else {
      const ref = await addDoc(collection(db, "questions"), payload);
      await updateDoc(ref, { id: ref.id });
    }
    setDraft(null);
    load();
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this question?")) return;
    const { db } = getFirebase();
    await deleteDoc(doc(db, "questions", id));
    load();
  };

  const visible = questions.filter((q) => filter === "all" || q.subjectId === filter);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-ink">Questions</h1>
          <p className="text-ink-soft">MCQ প্রশ্ন যোগ, সম্পাদনা, মুছুন।</p>
        </div>
        <button
          onClick={() => setDraft(empty(subjects[0]?.id || ""))}
          disabled={!subjects.length}
          className="btn-primary hover:btn-primary-hover"
        >
          + নতুন প্রশ্ন
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        <button onClick={() => setFilter("all")} className={`rounded-full px-3 py-1.5 text-xs font-semibold ${filter === "all" ? "bg-ink text-white" : "bg-bg-alt"}`}>All ({questions.length})</button>
        {subjects.map((s) => (
          <button key={s.id} onClick={() => setFilter(s.id)} className={`rounded-full px-3 py-1.5 text-xs font-semibold ${filter === s.id ? "bg-ink text-white" : "bg-bg-alt"}`}>
            {s.name} ({questions.filter((q) => q.subjectId === s.id).length})
          </button>
        ))}
      </div>

      {loading ? <div className="text-ink-soft">লোড হচ্ছে…</div> : (
        <div className="space-y-2">
          {visible.map((q) => (
            <div key={q.id} className="rounded-xl border border-line-soft bg-surface p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="mono text-xs text-ink-faint">{subjects.find((s) => s.id === q.subjectId)?.name}</div>
                  <div className="font-semibold">{q.question}</div>
                  <div className="mt-1 text-xs text-mint-dark">সঠিক: {q.options[q.answer]}</div>
                </div>
                <div className="flex flex-none gap-2">
                  <button onClick={() => setDraft({ ...q })} className="rounded-lg bg-bg-alt px-3 py-1.5 text-xs font-semibold hover:bg-line">Edit</button>
                  <button onClick={() => remove(q.id)} className="rounded-lg bg-vital/10 px-3 py-1.5 text-xs font-semibold text-vital-dark hover:bg-vital/20">Delete</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {draft && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setDraft(null)}>
          <div onClick={(e) => e.stopPropagation()} className="w-full max-w-xl space-y-3 rounded-2xl bg-surface p-6 shadow-xl">
            <h3 className="text-lg font-bold">{draft.id ? "Edit" : "New"} Question</h3>
            <select value={draft.subjectId} onChange={(e) => setDraft({ ...draft, subjectId: e.target.value })} className="w-full rounded-lg border-2 border-line bg-background px-3 py-2">
              {subjects.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
            <textarea value={draft.question} onChange={(e) => setDraft({ ...draft, question: e.target.value })} rows={2} placeholder="প্রশ্ন" className="w-full rounded-lg border-2 border-line bg-background px-3 py-2" />
            {draft.options.map((o, i) => (
              <div key={i} className="flex items-center gap-2">
                <button onClick={() => setDraft({ ...draft, answer: i })} className={`grid h-8 w-8 flex-none place-items-center rounded-full text-xs font-bold ${draft.answer === i ? "bg-mint text-white" : "bg-bg-alt"}`}>{String.fromCharCode(0x0995 + i)}</button>
                <input value={o} onChange={(e) => setDraft({ ...draft, options: draft.options.map((x, xi) => xi === i ? e.target.value : x) })} placeholder={`Option ${i + 1}`} className="flex-1 rounded-lg border-2 border-line bg-background px-3 py-2" />
              </div>
            ))}
            <textarea value={draft.explanation} onChange={(e) => setDraft({ ...draft, explanation: e.target.value })} rows={2} placeholder="ব্যাখ্যা (ঐচ্ছিক)" className="w-full rounded-lg border-2 border-line bg-background px-3 py-2" />
            <div className="flex justify-end gap-2">
              <button onClick={() => setDraft(null)} className="rounded-lg border border-line px-4 py-2 text-sm">বাতিল</button>
              <button onClick={save} className="btn-primary hover:btn-primary-hover">সেভ</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
