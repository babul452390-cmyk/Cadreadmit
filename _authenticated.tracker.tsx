import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { collection, getDocs, orderBy, query, where } from "firebase/firestore";
import { getFirebase } from "@/lib/firebase";
import { useAuth } from "@/lib/auth-context";
import type { Attempt } from "@/lib/types";

export const Route = createFileRoute("/_authenticated/tracker")({
  head: () => ({ meta: [{ title: "ট্র্যাকার — CadreAdmit" }, { name: "robots", content: "noindex" }] }),
  component: Tracker,
});

function Tracker() {
  const { user } = useAuth();
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        const { db } = getFirebase();
        const snap = await getDocs(query(
          collection(db, "attempts"),
          where("userId", "==", user.uid),
          orderBy("createdAt", "desc"),
        ));
        setAttempts(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Attempt, "id">) })));
      } finally {
        setLoading(false);
      }
    })();
  }, [user]);

  if (loading) return <div className="text-ink-soft">লোড হচ্ছে…</div>;

  const total = attempts.length;
  const avg = total ? Math.round(attempts.reduce((s, a) => s + (a.score / a.total) * 100, 0) / total) : 0;
  const best = total ? Math.round(Math.max(...attempts.map((a) => (a.score / a.total) * 100))) : 0;
  const passed = attempts.filter((a) => a.score / a.total >= 0.5).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-ink md:text-3xl">ট্র্যাকার</h1>
        <p className="mt-1 text-ink-soft">আপনার সমস্ত এটেম্পট ও অগ্রগতি।</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-4">
        {[
          { l: "মোট এটেম্পট", v: total, tone: "" },
          { l: "গড় স্কোর", v: `${avg}%`, tone: "mint" },
          { l: "সর্বোচ্চ", v: `${best}%`, tone: "gold" },
          { l: "পাস (৫০%+)", v: passed, tone: "" },
        ].map((s, i) => (
          <div key={i} className="rounded-2xl border border-line-soft bg-surface p-5">
            <div className="text-xs text-ink-faint">{s.l}</div>
            <div className={`num mt-1 text-3xl font-bold ${s.tone === "mint" ? "text-mint-dark" : s.tone === "gold" ? "text-gold-dark" : "text-ink"}`}>{s.v}</div>
          </div>
        ))}
      </div>

      {attempts.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-line p-8 text-center text-ink-soft">
          এখনো কোনো এটেম্পট নেই।
        </div>
      ) : (
        <div className="rounded-2xl border border-line-soft bg-surface p-6">
          <h2 className="mb-4 text-lg font-bold">এটেম্পট হিস্টরি</h2>
          <div className="space-y-2">
            {attempts.map((a) => {
              const pct = Math.round((a.score / a.total) * 100);
              return (
                <div key={a.id} className="flex items-center gap-3 rounded-lg border border-line-soft p-3">
                  <div className="grid h-10 w-10 flex-none place-items-center rounded-lg bg-bg-alt font-bold">
                    {a.testId ? "🎯" : "📖"}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-semibold">{a.testId ? "মডেল টেস্ট" : `প্র্যাকটিস — ${a.subjectId}`}</div>
                    <div className="text-xs text-ink-faint">{a.createdAt?.toDate?.().toLocaleString?.("bn-BD") || ""}</div>
                  </div>
                  <div className="text-right">
                    <div className="num text-lg font-bold">{a.score}/{a.total}</div>
                    <div className={`text-xs font-semibold ${pct >= 70 ? "text-mint-dark" : pct >= 50 ? "text-gold-dark" : "text-vital"}`}>{pct}%</div>
                  </div>
                  <div className="hidden h-2 w-24 overflow-hidden rounded-full bg-line-soft sm:block">
                    <div className={`h-full ${pct >= 70 ? "bg-mint" : pct >= 50 ? "bg-gold" : "bg-vital"}`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
