import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { getFirebase } from "@/lib/firebase";
import type { GlobalSettings } from "@/lib/types";

export const Route = createFileRoute("/_authenticated/admin/settings")({
  head: () => ({ meta: [{ title: "Settings — Admin" }, { name: "robots", content: "noindex" }] }),
  component: AdminSettings,
});

const defaults: GlobalSettings = {
  paymentAmount: 300,
  planDays: 30,
  planLabel: "১ মাস প্রিমিয়াম",
  bkashNumber: "",
  nagadNumber: "",
  instructions: "Send Money করে TrxID এখানে জমা দিন।",
};

function AdminSettings() {
  const [s, setS] = useState<GlobalSettings>(defaults);
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    (async () => {
      const { db } = getFirebase();
      const snap = await getDoc(doc(db, "settings", "global"));
      if (snap.exists()) setS({ ...defaults, ...(snap.data() as GlobalSettings) });
    })();
  }, []);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true); setSaved(false);
    const { db } = getFirebase();
    await setDoc(doc(db, "settings", "global"), s);
    setBusy(false); setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <div>
        <h1 className="text-3xl font-bold text-ink">Settings</h1>
        <p className="text-ink-soft">Payment amount, plan duration, bKash/Nagad নাম্বার আপডেট করুন।</p>
      </div>

      <form onSubmit={save} className="space-y-4 rounded-2xl bg-surface p-6 shadow">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-ink-soft">Amount (৳)</label>
            <input type="number" min={1} value={s.paymentAmount} onChange={(e) => setS({ ...s, paymentAmount: Number(e.target.value) })} className="w-full rounded-lg border-2 border-line bg-background px-3 py-2 num" />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-ink-soft">Plan Duration (দিন)</label>
            <input type="number" min={1} value={s.planDays} onChange={(e) => setS({ ...s, planDays: Number(e.target.value) })} className="w-full rounded-lg border-2 border-line bg-background px-3 py-2 num" />
          </div>
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-ink-soft">Plan Label</label>
          <input value={s.planLabel} onChange={(e) => setS({ ...s, planLabel: e.target.value })} className="w-full rounded-lg border-2 border-line bg-background px-3 py-2" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-ink-soft">bKash নাম্বার</label>
            <input value={s.bkashNumber} onChange={(e) => setS({ ...s, bkashNumber: e.target.value })} placeholder="01XXXXXXXXX" className="w-full rounded-lg border-2 border-line bg-background px-3 py-2 num" />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-ink-soft">Nagad নাম্বার</label>
            <input value={s.nagadNumber} onChange={(e) => setS({ ...s, nagadNumber: e.target.value })} placeholder="01XXXXXXXXX" className="w-full rounded-lg border-2 border-line bg-background px-3 py-2 num" />
          </div>
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-ink-soft">Payment Instructions</label>
          <textarea value={s.instructions} onChange={(e) => setS({ ...s, instructions: e.target.value })} rows={3} className="w-full rounded-lg border-2 border-line bg-background px-3 py-2" />
        </div>
        {saved && <div className="rounded-lg bg-mint/10 px-4 py-2 text-sm text-mint-dark">✓ সেভ হয়েছে</div>}
        <button type="submit" disabled={busy} className="btn-primary hover:btn-primary-hover w-full disabled:opacity-60">
          {busy ? "সেভ হচ্ছে…" : "সেভ করুন"}
        </button>
      </form>
    </div>
  );
}
