import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { getFirebase } from "@/lib/firebase";
import { useAuth } from "@/lib/auth-context";
import type { Subject } from "@/lib/types";

export const Route = createFileRoute("/_authenticated/practice/")({
  head: () => ({ meta: [{ title: "প্র্যাকটিস — CadreAdmit" }, { name: "robots", content: "noindex" }] }),
  component: PracticeList,
});

function PracticeList() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const { hasActiveSubscription, isAdmin } = useAuth();
  const locked = !hasActiveSubscription && !isAdmin;

  useEffect(() => {
    (async () => {
      try {
        const { db } = getFirebase();
        const snap = await getDocs(query(collection(db, "subjects"), orderBy("order", "asc")));
        setSubjects(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Subject, "id">) })));
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <div className="text-ink-soft">লোড হচ্ছে…</div>;

  if (subjects.length === 0) {
    return (
      <div className="rounded-2xl border-2 border-dashed border-line p-8 text-center">
        <p className="text-ink-soft">এখনো কোনো বিষয় নেই। Admin থেকে seed করুন।</p>
        <Link to="/admin" className="mt-3 inline-flex text-vital hover:underline">Admin →</Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-ink md:text-3xl">বিষয়ভিত্তিক প্র্যাকটিস</h1>
        <p className="mt-1 text-ink-soft">যেকোনো বিষয় বেছে নিয়ে অনুশীলন শুরু করুন।</p>
      </div>
      {locked && (
        <div className="rounded-xl bg-gold/10 p-4 text-sm text-gold-dark">
          🔒 প্রিমিয়ামে আপগ্রেড করে সব প্রশ্ন আনলক করুন। <Link to="/pricing" className="font-semibold underline">সাবস্ক্রাইব করুন</Link>
        </div>
      )}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {subjects.map((s) => (
          <Link
            key={s.id}
            to="/practice/$slug"
            params={{ slug: s.slug }}
            className="group rounded-2xl border border-line-soft bg-surface p-6 transition hover:border-vital hover:shadow-lg"
          >
            <div className="mb-3 text-2xl">📖</div>
            <h3 className="mb-1 text-lg font-bold text-ink group-hover:text-vital">{s.name}</h3>
            <p className="text-sm text-ink-soft">{s.description}</p>
            <div className="mt-4 text-sm font-semibold text-vital">প্র্যাকটিস শুরু →</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
