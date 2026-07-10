import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  Timestamp,
  updateDoc,
} from "firebase/firestore";
import { getFirebase } from "@/lib/firebase";
import type { Payment } from "@/lib/types";

export const Route = createFileRoute("/_authenticated/admin/payments")({
  head: () => ({ meta: [{ title: "Payments — Admin" }, { name: "robots", content: "noindex" }] }),
  component: AdminPayments,
});

function AdminPayments() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "rejected">("pending");
  const [msg, setMsg] = useState<string | null>(null);

  const refresh = async () => {
    setLoading(true);
    const { db } = getFirebase();
    const snap = await getDocs(query(collection(db, "payments"), orderBy("createdAt", "desc")));
    setPayments(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Payment, "id">) })));
    setLoading(false);
  };

  useEffect(() => { refresh(); }, []);

  const approve = async (p: Payment) => {
    const { db } = getFirebase();
    const expires = Timestamp.fromMillis(Date.now() + p.planDays * 24 * 60 * 60 * 1000);
    try {
      await updateDoc(doc(db, "payments", p.id), { status: "approved", reviewedAt: serverTimestamp() });
      const userRef = doc(db, "users", p.userId);
      const cur = await getDoc(userRef);
      await updateDoc(userRef, {
        subscription: { status: "active", plan: p.planDays + "d", expiresAt: expires },
      });
      setMsg(`✅ ${p.userEmail}-এর সাবস্ক্রিপশন সক্রিয় করা হলো (${p.planDays} দিন)`);
      refresh();
    } catch (err: unknown) {
      setMsg("Approve failed: " + (err instanceof Error ? err.message : String(err)));
    }
  };

  const reject = async (p: Payment) => {
    const reason = prompt("Reject reason:") || "Invalid";
    const { db } = getFirebase();
    try {
      await updateDoc(doc(db, "payments", p.id), {
        status: "rejected",
        reason,
        reviewedAt: serverTimestamp(),
      });
      setMsg(`❌ ${p.userEmail}-এর পেমেন্ট reject করা হলো`);
      refresh();
    } catch (err: unknown) {
      setMsg("Reject failed: " + (err instanceof Error ? err.message : String(err)));
    }
  };

  const visible = payments.filter((p) => filter === "all" || p.status === filter);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-3xl font-bold text-ink">Payments</h1>
        <p className="mt-1 text-ink-soft">Manual bKash/Nagad পেমেন্ট যাচাই ও অনুমোদন।</p>
      </div>

      {msg && <div className="rounded-lg bg-mint/10 px-4 py-2 text-sm text-mint-dark">{msg}</div>}

      <div className="flex gap-2">
        {(["pending", "approved", "rejected", "all"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-full px-4 py-1.5 text-sm font-semibold ${filter === f ? "bg-ink text-white" : "bg-bg-alt text-ink-soft hover:bg-line"}`}
          >
            {f} {f === "pending" && payments.filter((p) => p.status === "pending").length > 0 && `(${payments.filter((p) => p.status === "pending").length})`}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-ink-soft">লোড হচ্ছে…</div>
      ) : visible.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-line p-8 text-center text-ink-soft">
          কোনো পেমেন্ট নেই ({filter})।
        </div>
      ) : (
        <div className="space-y-3">
          {visible.map((p) => (
            <div key={p.id} className="rounded-2xl border border-line-soft bg-surface p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="font-semibold">{p.userName || p.userEmail}</div>
                  <div className="text-xs text-ink-faint">{p.userEmail}</div>
                </div>
                <span className={`mono rounded-full px-3 py-1 text-xs font-bold ${p.status === "approved" ? "bg-mint/10 text-mint-dark" : p.status === "rejected" ? "bg-vital/10 text-vital-dark" : "bg-gold/15 text-gold-dark"}`}>
                  {p.status}
                </span>
              </div>
              <div className="mt-3 grid gap-3 text-sm sm:grid-cols-4">
                <div><div className="text-xs text-ink-faint">Method</div><div className="font-semibold uppercase">{p.method}</div></div>
                <div><div className="text-xs text-ink-faint">TrxID</div><div className="mono font-semibold">{p.trxId}</div></div>
                <div><div className="text-xs text-ink-faint">Sender</div><div className="num font-semibold">{p.senderNumber}</div></div>
                <div><div className="text-xs text-ink-faint">Amount / Plan</div><div className="num font-semibold">৳{p.amount} / {p.planDays}d</div></div>
              </div>
              {p.reason && <div className="mt-2 rounded bg-vital/5 p-2 text-xs text-vital-dark">Reason: {p.reason}</div>}
              {p.status === "pending" && (
                <div className="mt-4 flex gap-2">
                  <button onClick={() => approve(p)} className="rounded-lg bg-mint px-4 py-2 text-sm font-bold text-white hover:bg-mint-dark">✓ Approve</button>
                  <button onClick={() => reject(p)} className="rounded-lg bg-vital px-4 py-2 text-sm font-bold text-white hover:bg-vital-dark">✕ Reject</button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
