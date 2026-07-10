import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
} from "firebase/auth";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { z } from "zod";
import { getFirebase, ADMIN_EMAIL } from "@/lib/firebase";
import { useAuth } from "@/lib/auth-context";

const searchSchema = z.object({
  mode: z.enum(["login", "signup"]).catch("login"),
});

export const Route = createFileRoute("/auth")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "লগইন / রেজিস্ট্রেশন — CadreAdmit" },
      { name: "description", content: "CadreAdmit-এ লগইন করুন বা নতুন একাউন্ট খুলুন।" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const { mode } = Route.useSearch();
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  useEffect(() => {
    if (!loading && user) navigate({ to: "/dashboard" });
  }, [loading, user, navigate]);

  const isSignup = mode === "signup";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const { auth, db } = getFirebase();
      if (isSignup) {
        const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
        const isAdmin = cred.user.email?.toLowerCase() === ADMIN_EMAIL;
        await setDoc(doc(db, "users", cred.user.uid), {
          email: cred.user.email,
          name: name.trim() || cred.user.email?.split("@")[0] || "User",
          role: isAdmin ? "admin" : "user",
          subscription: { status: "inactive" },
          createdAt: serverTimestamp(),
        });
      } else {
        const cred = await signInWithEmailAndPassword(auth, email.trim(), password);
        // Backfill admin role if the admin email logs in without a profile
        const ref = doc(db, "users", cred.user.uid);
        const snap = await getDoc(ref);
        if (!snap.exists()) {
          const isAdmin = cred.user.email?.toLowerCase() === ADMIN_EMAIL;
          await setDoc(ref, {
            email: cred.user.email,
            name: cred.user.email?.split("@")[0] || "User",
            role: isAdmin ? "admin" : "user",
            subscription: { status: "inactive" },
            createdAt: serverTimestamp(),
          });
        } else if (cred.user.email?.toLowerCase() === ADMIN_EMAIL && snap.data().role !== "admin") {
          await setDoc(ref, { ...snap.data(), role: "admin" });
        }
      }
      navigate({ to: "/dashboard" });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "কিছু একটা ভুল হয়েছে";
      setError(prettyFirebaseError(msg));
    } finally {
      setBusy(false);
    }
  };

  const handleReset = async () => {
    if (!email.trim()) {
      setError("প্রথমে ইমেইল লিখুন");
      return;
    }
    try {
      const { auth } = getFirebase();
      await sendPasswordResetEmail(auth, email.trim());
      setResetSent(true);
      setError(null);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "রিসেট পাঠাতে ব্যর্থ";
      setError(prettyFirebaseError(msg));
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-md rounded-3xl bg-surface p-8 shadow-xl md:p-10">
        <Link to="/" className="mb-6 flex items-center gap-2 font-display text-lg font-extrabold text-ink">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-vital text-white">C</span>
          CadreAdmit
        </Link>
        <h1 className="mb-2 text-2xl font-bold text-ink">{isSignup ? "নতুন একাউন্ট" : "লগইন"}</h1>
        <p className="mb-6 text-sm text-ink-soft">
          {isSignup ? "সাইন আপ করে প্র্যাকটিস শুরু করুন।" : "আপনার একাউন্টে ফিরে আসুন।"}
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignup && (
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-ink-soft">নাম</label>
              <input value={name} onChange={(e) => setName(e.target.value)} required className="w-full rounded-lg border-2 border-line bg-background px-4 py-2.5 focus:border-mint focus:bg-surface focus:outline-none" placeholder="আপনার নাম" />
            </div>
          )}
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-ink-soft">ইমেইল</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full rounded-lg border-2 border-line bg-background px-4 py-2.5 focus:border-mint focus:bg-surface focus:outline-none" placeholder="you@example.com" />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-ink-soft">পাসওয়ার্ড</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} className="w-full rounded-lg border-2 border-line bg-background px-4 py-2.5 focus:border-mint focus:bg-surface focus:outline-none" placeholder="কমপক্ষে ৬ অক্ষর" />
          </div>
          {error && <div className="rounded-lg bg-vital/10 px-4 py-2 text-sm text-vital-dark">{error}</div>}
          {resetSent && <div className="rounded-lg bg-mint/10 px-4 py-2 text-sm text-mint-dark">পাসওয়ার্ড রিসেট লিঙ্ক পাঠানো হয়েছে — ইমেইল চেক করুন।</div>}
          <button type="submit" disabled={busy} className="btn-primary hover:btn-primary-hover w-full disabled:opacity-60">
            {busy ? "অপেক্ষা করুন..." : isSignup ? "রেজিস্টার করুন" : "লগইন করুন"}
          </button>
        </form>
        <div className="mt-5 flex flex-col items-center gap-2 text-sm text-ink-soft">
          {!isSignup && (
            <button type="button" onClick={handleReset} className="text-vital hover:underline">
              পাসওয়ার্ড ভুলে গেছেন?
            </button>
          )}
          <div>
            {isSignup ? "একাউন্ট আছে? " : "একাউন্ট নেই? "}
            <Link to="/auth" search={{ mode: isSignup ? "login" : "signup" }} className="font-semibold text-vital hover:underline">
              {isSignup ? "লগইন করুন" : "সাইন আপ করুন"}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function prettyFirebaseError(msg: string): string {
  if (msg.includes("email-already-in-use")) return "এই ইমেইলে ইতিমধ্যেই একাউন্ট আছে";
  if (msg.includes("invalid-credential") || msg.includes("wrong-password")) return "ইমেইল বা পাসওয়ার্ড ভুল";
  if (msg.includes("user-not-found")) return "এই ইমেইলে কোনো একাউন্ট নেই";
  if (msg.includes("weak-password")) return "পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে";
  if (msg.includes("network")) return "ইন্টারনেট সংযোগ পরীক্ষা করুন";
  if (msg.includes("configuration") || msg.includes("api-key")) return "Firebase configuration সমস্যা — অ্যাডমিনকে জানান";
  return msg.replace(/^Firebase:\s*/, "").replace(/\s*\([\w/-]+\)\.?$/, "");
}
