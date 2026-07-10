import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { collection, getDocs, orderBy, query, limit, where } from "firebase/firestore";
import { getFirebase } from "@/lib/firebase";
import { useAuth } from "@/lib/auth-context";
import type { Attempt } from "@/lib/types";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({ meta: [{ title: "ড্যাশবোর্ড — CadreAdmit" }, { name: "robots", content: "noindex" }] }),
  component: Dashboard,
});

function Dashboard() {
  const { profile, hasActiveSubscription, isAdmin, user } = useAuth();
  const [recent, setRecent] = useState<Attempt[]>([]);
  const [stats, setStats] = useState({ attempts: 0, avg: 0, best: 0 });

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { db } = getFirebase();
      const q = query(
        collection(db, "attempts"),
        where("userId", "==", user.uid),
        orderBy("createdAt", "desc"),
        limit(5),
      );
      try {
        const snap = await getDocs(q);
        const items = snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Attempt, "id">) }));
        setRecent(items);
        if (items.length) {
          const pcts = items.map((a) => (a.score / Math.max(1, a.total)) * 100);
          setStats({
            attempts: items.length,
            avg: Math.round(pcts.reduce((s, v) => s + v, 0) / pcts.length),
            best: Math.round(Math.max(...pcts)),
          });
        }
      } catch (err) {
        console.warn("attempts fetch failed", err);
      }
    })();
  }, [user]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-ink md:text-3xl">স্বাগতম, {profile?.name || "শিক্ষার্থী"} 👋</h1>
        <p className="mt-1 text-ink-soft">
          {isAdmin ? "Admin দৃষ্টিতে আপনি সবকিছু ম্যানেজ করতে পারবেন।" : hasActiveSubscription ? "আপনার সাবস্ক্রিপশন সক্রিয়। শুরু করুন প্র্যাকটিস।" : "প্রিমিয়ামের সব ফিচার আনলক করতে সাবস্ক্রাইব করুন।"}
        </p>
      </div>

      {!hasActiveSubscription && !isAdmin && (
        <div className="rounded-2xl border-2 border-dashed border-gold/50 bg-gold/5 p-6">
          <div className="mb-2 font-bold text-gold-dark">🔒 প্রিমিয়াম আনলক করুন</div>
          <p className="mb-3 text-sm text-ink-soft">সব বিষয়, মডেল টেস্ট ও লিখিত অনুশীলন ব্যবহার করতে সাবস্ক্রাইব করুন।</p>
          <Link to="/pricing" className="inline-flex rounded-lg bg-gold px-5 py-2 text-sm font-bold text-white hover:bg-gold-dark">
            প্রাইসিং দেখুন →
          </Link>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="মোট এটেম্পট" value={stats.attempts.toString()} />
        <StatCard label="গড় স্কোর" value={`${stats.avg}%`} />
        <StatCard label="সর্বোচ্চ স্কোর" value={`${stats.best}%`} tone="mint" />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <QuickCard title="বিষয়ভিত্তিক প্র্যাকটিস" desc="নিজের গতিতে অনুশীলন" to="/practice" />
        <QuickCard title="মডেল টেস্ট" desc="সময়সীমা সহ পূর্ণাঙ্গ পরীক্ষা" to="/model-test" />
        <QuickCard title="লিখিত অনুশীলন" desc="টপিক-ভিত্তিক লিখিত" to="/written" />
        <QuickCard title="ট্র্যাকার" desc="আপনার অগ্রগতি বিশ্লেষণ" to="/tracker" />
      </div>

      {recent.length > 0 && (
        <div className="rounded-2xl border border-line-soft bg-surface p-6">
          <h2 className="mb-4 text-lg font-bold text-ink">সাম্প্রতিক পরীক্ষা</h2>
          <div className="space-y-2">
            {recent.map((a) => (
              <div key={a.id} className="flex items-center justify-between border-b border-line-soft pb-2 last:border-0">
                <div className="text-sm text-ink">{a.testId ? `Model Test` : `${a.subjectId} Practice`}</div>
                <div className="mono text-sm text-ink-soft">
                  {a.score}/{a.total} ({Math.round((a.score / Math.max(1, a.total)) * 100)}%)
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, tone }: { label: string; value: string; tone?: "mint" }) {
  return (
    <div className="rounded-2xl border border-line-soft bg-surface p-5">
      <div className="text-xs text-ink-faint">{label}</div>
      <div className={`num mt-1 text-3xl font-bold ${tone === "mint" ? "text-mint-dark" : "text-ink"}`}>{value}</div>
    </div>
  );
}

function QuickCard({ title, desc, to }: { title: string; desc: string; to: string }) {
  return (
    <Link to={to} className="group rounded-2xl border border-line-soft bg-surface p-6 transition hover:border-vital hover:shadow-lg">
      <h3 className="mb-1 text-lg font-bold text-ink group-hover:text-vital">{title}</h3>
      <p className="text-sm text-ink-soft">{desc}</p>
      <div className="mt-3 text-sm font-semibold text-vital">→ শুরু করুন</div>
    </Link>
  );
}
