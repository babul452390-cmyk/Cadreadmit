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
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { getFirebase } from "@/lib/firebase";
import type { ModelTest, Question, Subject } from "@/lib/types";

export const Route = createFileRoute("/_authenticated/admin/tests")({
  head: () => ({ meta: [{ title: "Model Tests — Admin" }, { name: "robots", content: "noindex" }] }),
  component: AdminTests,
});

interface Draft {
  id?: string;
  title: string;
  description: string;
  durationMin: number;
  category: "preli" | "written";
  questionIds: string[];
}

const empty = (): Draft => ({
  title: "",
  description: "",
  durationMin: 30,
  category: "preli",
  questionIds: [],
});

function AdminTests() {
  const [tests, setTests] = useState<ModelTest[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [draft, setDraft] = useState<Draft | null>(null);

  const load = async () => {
    const { db } = getFirebase();
    const [t, q, s] = await Promise.all([
      getDocs(query(collection(db, "modelTests"), orderBy("createdAt", "desc"))),
      getDocs(collection(db, "questions")),
      getDocs(query(collection(db, "subjects"), orderBy("order"))),
    ]);
    setTests(t.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<ModelTest, "id">) })));
    setQuestions(q.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Question, "id">) })));
    setSubjects(s.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Subject, "id">) })));
  };

  useEffect(() => { load(); }, []);

  const save = async () => {
    if (!draft) return;
    const { db } = getFirebase();
    if (draft.id) {
      await updateDoc(doc(db, "modelTests", draft.id), {
        title: draft.title,
        description: draft.description,
        durationMin: draft.durationMin,
        category: draft.category,
        questionIds: draft.questionIds,
      });
    } else {
      const ref = await addDoc(collection(db, "modelTests"), {
        title: draft.title,
        description: draft.description,
        durationMin: draft.durationMin,
        category: draft.category,
        questionIds: draft.questionIds,
        createdAt: serverTimestamp(),
      });
      await updateDoc(ref, { id: ref.id });
    }
    setDraft(null); load();
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this test?")) return;
    const { db } = getFirebase();
    await deleteDoc(doc(db, "modelTests", id));
    load();
  };

  const toggleQ = (qid: string) => {
    if (!draft) return;
    setDraft({
      ...draft,
      questionIds: draft.questionIds.includes(qid)
        ? draft.questionIds.filter((x) => x !== qid)
        : [...draft.questionIds, qid],
    });
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-ink">Model Tests</h1>
          <p className="text-ink-soft">মডেল টেস্ট তৈরি ও ম্যানেজ।</p>
        </div>
        <button onClick={() => setDraft(empty())} className="btn-primary hover:btn-primary-hover">+ নতুন টেস্ট</button>
      </div>

      <div className="space-y-3">
        {tests.map((t) => (
          <div key={t.id} className="rounded-xl border border-line-soft bg-surface p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="font-bold">{t.title}</div>
                <div className="mono mt-1 text-xs text-ink-faint">
                  {t.category} · {t.durationMin} min · {t.questionIds.length} প্রশ্ন
                </div>
                <div className="mt-1 text-sm text-ink-soft">{t.description}</div>
              </div>
              <div className="flex flex-none gap-2">
                <button
                  onClick={() =>
                    setDraft({
                      id: t.id,
                      title: t.title,
                      description: t.description || "",
                      durationMin: t.durationMin,
                      category: t.category,
                      questionIds: [...t.questionIds],
                    })
                  }
                  className="rounded-lg bg-bg-alt px-3 py-1.5 text-xs font-semibold hover:bg-line"
                >
                  Edit
                </button>
                <button onClick={() => remove(t.id)} className="rounded-lg bg-vital/10 px-3 py-1.5 text-xs font-semibold text-vital-dark hover:bg-vital/20">Delete</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {draft && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setDraft(null)}>
          <div onClick={(e) => e.stopPropagation()} className="max-h-[92vh] w-full max-w-2xl space-y-3 overflow-y-auto rounded-2xl bg-surface p-6 shadow-xl">
            <h3 className="text-lg font-bold">{draft.id ? "Edit" : "New"} Test</h3>
            <input value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} placeholder="Title" className="w-full rounded-lg border-2 border-line bg-background px-3 py-2" />
            <textarea value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} rows={2} placeholder="Description" className="w-full rounded-lg border-2 border-line bg-background px-3 py-2" />
            <div className="grid grid-cols-2 gap-3">
              <input type="number" min={1} value={draft.durationMin} onChange={(e) => setDraft({ ...draft, durationMin: Number(e.target.value) })} placeholder="Duration (min)" className="rounded-lg border-2 border-line bg-background px-3 py-2 num" />
              <select value={draft.category} onChange={(e) => setDraft({ ...draft, category: e.target.value as "preli" | "written" })} className="rounded-lg border-2 border-line bg-background px-3 py-2">
                <option value="preli">Preli</option>
                <option value="written">Written</option>
              </select>
            </div>
            <div>
              <div className="mb-2 text-sm font-semibold">Questions ({draft.questionIds.length} selected)</div>
              <div className="max-h-64 space-y-1 overflow-y-auto rounded-lg border border-line-soft p-2">
                {subjects.map((s) => (
                  <div key={s.id}>
                    <div className="mono px-2 py-1 text-[10px] uppercase text-ink-faint">{s.name}</div>
                    {questions.filter((q) => q.subjectId === s.id).map((q) => (
                      <label key={q.id} className="flex cursor-pointer items-start gap-2 rounded p-1.5 text-sm hover:bg-bg-alt">
                        <input type="checkbox" checked={draft.questionIds.includes(q.id)} onChange={() => toggleQ(q.id)} className="mt-1" />
                        <span className="flex-1">{q.question}</span>
                      </label>
                    ))}
                  </div>
                ))}
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <button onClick={() => setDraft(null)} className="rounded-lg border border-line px-4 py-2 text-sm">বাতিল</button>
              <button onClick={save} disabled={!draft.title || draft.questionIds.length === 0} className="btn-primary hover:btn-primary-hover disabled:opacity-60">সেভ</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
