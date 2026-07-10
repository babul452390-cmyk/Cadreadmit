import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { getFirebase } from "@/lib/firebase";
import { useAuth } from "@/lib/auth-context";
import type { ModelTest } from "@/lib/types";

export const Route = createFileRoute("/_authenticated/model-test/")({
  head: () => ({ meta: [{ title: "মডেল টেস্ট — CadreAdmit" }, { name: "robots", content: "noindex" }] }),
  component: ModelTestList,
});

function ModelTestList() {
  const [tests, setTests] = useState<ModelTest[]>([]);
  const [loading, setLoading] = useState(true);
  const { hasActiveSubscription, isAdmin } = useAuth();
  const locked = !hasActiveSubscription && !isAdmin;

  useEffect(() => {
    (async () => {
      try {
        const { db } = getFirebase();
        const snap = await getDocs(query(collection(db, "modelTests"), orderBy("createdAt", "desc")));
        setTests(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<ModelTest, "id">) })));
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <div className="text-ink-soft">লোড হচ্ছে…</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-ink md:text-3xl">মডেল টেস্ট</h1>
        <p className="mt-1 text-ink-soft">সময়সীমা সহ পূর্ণাঙ্গ পরীক্ষা।</p>
      </div>

      {tests.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-line p-8 text-center text-ink-soft">
          কোনো মডেল টেস্ট নেই।
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {tests.map((t) => (
            <div key={t.id} className="rounded-2xl border border-line-soft bg-surface p-6">
              <div className="mb-2 flex items-center gap-2">
                <span className="mono rounded-full bg-vital/10 px-2.5 py-1 text-xs font-bold text-vital">{t.category === "preli" ? "প্রিলি" : "লিখিত"}</span>
                <span className="mono text-xs text-ink-faint">⏱ {t.durationMin} মিনিট</span>
                <span className="mono text-xs text-ink-faint">📝 {t.questionIds.length} প্রশ্ন</span>
              </div>
              <h3 className="mb-2 text-lg font-bold text-ink">{t.title}</h3>
              <p className="mb-4 text-sm text-ink-soft">{t.description}</p>
              {locked ? (
                <Link to="/pricing" className="inline-flex rounded-lg bg-vital/10 px-4 py-2 text-sm font-semibold text-vital-dark hover:bg-vital/20">
                  🔒 সাবস্ক্রাইব করুন
                </Link>
              ) : (
                <Link to="/model-test/$id" params={{ id: t.id }} className="btn-primary hover:btn-primary-hover">
                  শুরু করুন →
                </Link>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
