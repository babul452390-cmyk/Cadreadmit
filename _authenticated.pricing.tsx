import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  serverTimestamp,
} from "firebase/firestore";
import { getFirebase } from "@/lib/firebase";
import { useAuth } from "@/lib/auth-context";
import type { GlobalSettings } from "@/lib/types";

export const Route = createFileRoute("/_authenticated/pricing")({
  head: () => ({ meta: [{ title: "সাবস্ক্রিপশন — CadreAdmit" }, { name: "robots", content: "noindex" }] }),
  component: Pricing,
});

function Pricing() {
  const { user, profile, hasActiveSubscription, isAdmin } = useAuth();
  const [settings, setSettings] = useState<GlobalSettings | null>(null);
  const [method, setMethod] = useState<"bkash" | "nagad">("bkash");
  const [trxId, setTrxId] = useState("");
  const [senderNumber, setSenderNumber] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { db } = getFirebase();
      const snap = await getDoc(doc(db, "settings", "global"));
      if (snap.exists()) setSettings(snap.data() as GlobalSettings);
    })();
  }, []);

  const submitPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !settings) return;
    setBusy(true); setError(null);
    try {
      const { db } = getFirebase();
      await addDoc(collection(db, "payments"), {
        userId: user.uid,
        userEmail: profile?.email || user.email,
        userName: profile?.name || "",
        method,
        trxId: trxId.trim(),
        senderNumber: senderNumber.trim(),
        amount: settings.paymentAmount,
        planDays: settings.planDays,
        status: "pending",
        createdAt: serverTimestamp(),
      });
      setDone(true);
      setTrxId(""); setSenderNumber("");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "সাবমিট করা যায়নি");
    } finally {
      setBusy(false);
    }
  };

  if (!settings) return <div className="text-ink-soft">লোড হচ্ছে…</div>;

  if (hasActiveSubscription || isAdmin) {
    return (
      <div className="mx-auto max-w-xl rounded-3xl bg-surface p-8 text-center shadow-lg">
        <div className="mb-2 text-4xl">✅</div>
        <h1 className="mb-2 text-2xl font-bold">আপনি ইতিমধ্যেই প্রিমিয়াম</h1>
        <p className="text-ink-soft">
          {isAdmin ? "Admin হিসেবে সব ফিচারে অ্যাক্সেস আছে।" : "সব ফিচার আনলক করা আছে। শুভকামনা!"}
        </p>
      </div>
    );
  }

  const activeNumber = method === "bkash" ? settings.bkashNumber : settings.nagadNumber;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-ink">সাবস্ক্রিপশন</h1>
        <p className="mt-2 text-ink-soft">বিকাশ/নগদে সহজ পেমেন্ট, অ্যাডমিন যাচাই করে অ্যাক্সেস চালু করবে।</p>
      </div>

      <div className="rounded-3xl border-2 border-gold bg-surface p-8 shadow-lg">
        <div className="text-center">
          <div className="mono mb-1 text-xs uppercase tracking-wider text-gold-dark">CadreAdmit প্লান</div>
          <h2 className="mb-2 text-xl font-bold">{settings.planLabel}</h2>
          <div className="num mb-1 text-5xl font-bold text-vital">৳{settings.paymentAmount}</div>
          <div className="text-sm text-ink-faint">{settings.planDays} দিন মেয়াদ</div>
        </div>
        <hr className="my-6 border-dashed border-line" />
        <ul className="space-y-2 text-sm text-ink-soft">
          <li>✓ সব বিষয়ের সম্পূর্ণ MCQ ব্যাংক</li>
          <li>✓ প্রিলি মডেল টেস্ট (আনলিমিটেড)</li>
          <li>✓ লিখিত অনুশীলন + ফিডব্যাক</li>
          <li>✓ কাট মার্ক ট্র্যাকার</li>
        </ul>
      </div>

      {done ? (
        <div className="rounded-2xl bg-mint/10 p-6 text-center">
          <div className="mb-2 text-3xl">✅</div>
          <h3 className="mb-1 font-bold text-mint-dark">পেমেন্ট সাবমিট হয়েছে</h3>
          <p className="text-sm text-ink-soft">অ্যাডমিন ২৪ ঘণ্টার মধ্যে যাচাই করে সাবস্ক্রিপশন চালু করবে।</p>
        </div>
      ) : (
        <form onSubmit={submitPayment} className="space-y-4 rounded-2xl bg-surface p-6 shadow">
          <h3 className="text-lg font-bold">পেমেন্ট সাবমিট করুন</h3>

          <div className="flex gap-2">
            {(["bkash", "nagad"] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMethod(m)}
                className={`flex-1 rounded-lg border-2 px-4 py-3 font-semibold transition ${method === m ? "border-vital bg-vital/5 text-vital" : "border-line bg-background text-ink-soft"}`}
              >
                {m === "bkash" ? "বিকাশ" : "নগদ"}
              </button>
            ))}
          </div>

          <div className="rounded-lg bg-bg-alt p-4">
            <div className="text-xs text-ink-faint">Send Money করুন</div>
            <div className="num text-xl font-bold">{activeNumber}</div>
            <div className="mt-1 text-xs text-ink-soft">Amount: <span className="num font-semibold">৳{settings.paymentAmount}</span></div>
            <div className="mt-2 whitespace-pre-line text-xs text-ink-soft">{settings.instructions}</div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-ink-soft">Transaction ID (TrxID)</label>
            <input
              value={trxId}
              onChange={(e) => setTrxId(e.target.value)}
              required
              minLength={6}
              className="w-full rounded-lg border-2 border-line bg-background px-4 py-2.5 focus:border-mint focus:bg-surface focus:outline-none mono"
              placeholder="9AB1CD2EF3"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-ink-soft">আপনার {method === "bkash" ? "বিকাশ" : "নগদ"} নাম্বার</label>
            <input
              value={senderNumber}
              onChange={(e) => setSenderNumber(e.target.value)}
              required
              className="w-full rounded-lg border-2 border-line bg-background px-4 py-2.5 focus:border-mint focus:bg-surface focus:outline-none num"
              placeholder="01XXXXXXXXX"
            />
          </div>

          {error && <div className="rounded-lg bg-vital/10 px-4 py-2 text-sm text-vital-dark">{error}</div>}
          <button type="submit" disabled={busy} className="btn-primary hover:btn-primary-hover w-full disabled:opacity-60">
            {busy ? "সাবমিট হচ্ছে…" : "পেমেন্ট সাবমিট করুন"}
          </button>
        </form>
      )}
    </div>
  );
}
