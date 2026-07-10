import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { collection, getCountFromServer, getDocs, query, where } from "firebase/firestore";
import { getFirebase } from "@/lib/firebase";
import { isSeeded, seedAll } from "@/lib/seed";

export const Route = createFileRoute("/_authenticated/admin/")({
  head: () => ({ meta: [{ title: "Admin — CadreAdmit" }, { name: "robots", content: "noindex" }] }),
  component: AdminDashboard,
});

function AdminDashboard() {
  const [counts, setCounts] = useState({ users: 0, questions: 0, tests: 0, pending: 0 });
  const [seeded, setSeeded] = useState<boolean | null>(null);
  const [seeding, setSeeding] = useState(false);
  const [seedResult, setSeedResult] = useState<string | null>(null);

  const refresh = async () => {
    const { db } = getFirebase();
    try {
      const [u, q, t, p, s] = await Promise.all([
        getCountFromServer(collection(db, "users")),
        getCountFromServer(collection(db, "questions")),
        getCountFromServer(collection(db, "modelTests")),
        getCountFromServer(query(collection(db, "payments"), where("status", "==", "pending"))),
        isSeeded(),
      ]);
      setCounts({
        users: u.data().count,
        questions: q.data().count,
        tests: t.data().count,
        pending: p.data().count,
      });
      setSeeded(s);
    } catch (err) {
      console.warn(err);
    }
  };

  useEffect(() => { refresh(); }, []);

  const runSeed = async () => {
    if (!confirm("Sample data seed করা হবে (subjects/questions/model tests/settings)। চালিয়ে যাবেন?")) return;
    setSeeding(true);
    try {
      const r = await seedAll();
      setSeedResult(`Seeded ${r.subjects} subjects, ${r.questions} questions, ${r.tests} model tests.`);
      refresh();
    } catch (err: unknown) {
      setSeedResult("Failed: " + (err instanceof Error ? err.message : String(err)));
    } finally {
      setSeeding(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-ink">Admin Dashboard</h1>
        <p className="mt-1 text-ink-soft">সব কিছু এক নজরে ম্যানেজ করুন।</p>
      </div>

      {seeded === false && (
        <div className="rounded-2xl border-2 border-dashed border-vital/50 bg-vital/5 p-6">
          <h3 className="mb-1 font-bold text-vital-dark">শুরুতেই এই কাজটি করুন</h3>
          <p className="mb-3 text-sm text-ink-soft">Firestore এখনো seed হয়নি। sample subjects, questions, model tests, ও default settings লোড করুন।</p>
          <button onClick={runSeed} disabled={seeding} className="btn-primary hover:btn-primary-hover">
            {seeding ? "Seeding…" : "🌱 Seed Sample Data"}
          </button>
          {seedResult && <div className="mt-3 rounded bg-mint/10 p-3 text-sm text-mint-dark">{seedResult}</div>}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { l: "মোট ইউজার", v: counts.users, tone: "" },
          { l: "প্রশ্ন", v: counts.questions, tone: "" },
          { l: "মডেল টেস্ট", v: counts.tests, tone: "" },
          { l: "পেন্ডিং পেমেন্ট", v: counts.pending, tone: counts.pending > 0 ? "vital" : "" },
        ].map((s, i) => (
          <div key={i} className="rounded-2xl border border-line-soft bg-surface p-5">
            <div className="text-xs text-ink-faint">{s.l}</div>
            <div className={`num mt-1 text-3xl font-bold ${s.tone === "vital" ? "text-vital" : "text-ink"}`}>{s.v}</div>
          </div>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <AdminCard to="/admin/payments" title="Payments" desc={`${counts.pending} পেন্ডিং যাচাইয়ের অপেক্ষায়`} accent="vital" />
        <AdminCard to="/admin/questions" title="Questions" desc="MCQ যোগ/সম্পাদনা" accent="mint" />
        <AdminCard to="/admin/tests" title="Model Tests" desc="মডেল টেস্ট গঠন" accent="gold" />
        <AdminCard to="/admin/settings" title="Settings" desc="Payment amount, plan, bKash/Nagad number" accent="ink" />
      </div>
    </div>
  );
}

function AdminCard({ to, title, desc, accent }: { to: string; title: string; desc: string; accent: string }) {
  const map: Record<string, string> = {
    vital: "border-vital text-vital",
    mint: "border-mint text-mint-dark",
    gold: "border-gold text-gold-dark",
    ink: "border-ink text-ink",
  };
  return (
    <Link to={to} className={`group rounded-2xl border-l-4 bg-surface p-6 shadow-sm transition hover:shadow-lg ${map[accent]}`}>
      <h3 className="text-lg font-bold text-ink group-hover:underline">{title}</h3>
      <p className="mt-1 text-sm text-ink-soft">{desc}</p>
    </Link>
  );
}
