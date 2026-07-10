import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader, SiteFooter } from "@/components/site-chrome";

export const Route = createFileRoute("/")({
  component: LandingPage,
});

const SUBJECTS = [
  { name: "বাংলা", meta: "১২০+ প্রশ্ন", pct: 82 },
  { name: "ইংরেজি", meta: "১১০+ প্রশ্ন", pct: 74 },
  { name: "গণিত", meta: "৯০+ প্রশ্ন", pct: 68 },
  { name: "সাধারণ জ্ঞান", meta: "১৫০+ প্রশ্ন", pct: 88 },
  { name: "বিজ্ঞান", meta: "৮০+ প্রশ্ন", pct: 71 },
  { name: "কম্পিউটার", meta: "৬০+ প্রশ্ন", pct: 65 },
];

const FEATURES = [
  { title: "বিষয়ভিত্তিক প্র্যাকটিস", desc: "প্রতিটি বিষয়ে হাজারো MCQ, ব্যাখ্যা সহ। দুর্বল বিষয় চিহ্নিত করে অগ্রগতি ট্র্যাক করুন।", color: "bg-vital/10 text-vital" },
  { title: "প্রিলি মডেল টেস্ট", desc: "সময়সীমা সহ পূর্ণাঙ্গ মডেল পরীক্ষা। রিয়েল বিসিএস ধরনের প্রশ্নপত্রে অভ্যস্ত হোন।", color: "bg-mint/10 text-mint-dark" },
  { title: "লিখিত অনুশীলন", desc: "লিখিত টপিকে উত্তর জমা দিন। অ্যাডমিন থেকে ফিডব্যাক পান।", color: "bg-gold/15 text-gold-dark" },
  { title: "কাট মার্ক ট্র্যাকার", desc: "আপনার প্রতিটি পরীক্ষার স্কোর সংরক্ষিত থাকে — উন্নতির গ্রাফ দেখুন।", color: "bg-vital/10 text-vital" },
  { title: "মোবাইল-ফার্স্ট", desc: "যেকোনো ডিভাইসে — চলার পথেই প্র্যাকটিস করুন।", color: "bg-mint/10 text-mint-dark" },
  { title: "সাশ্রয়ী মূল্য", desc: "বিকাশ/নগদে সহজ পেমেন্ট। এক-ক্লিকে সাবস্ক্রাইব।", color: "bg-gold/15 text-gold-dark" },
];

function LandingPage() {
  return (
    <>
      <SiteHeader />

      {/* Hero */}
      <section className="relative overflow-hidden px-6 pb-24 pt-24">
        <div className="pointer-events-none absolute -right-40 -top-32 h-[520px] w-[520px] rounded-full opacity-40" style={{ background: "radial-gradient(circle, rgba(62,139,79,.35), transparent 70%)" }} />
        <div className="mx-auto grid max-w-[1180px] items-center gap-16 lg:grid-cols-[1.05fr_.95fr]">
          <div>
            <span className="eyebrow mb-5 bg-vital/10 text-vital-dark"><span className="h-1.5 w-1.5 rounded-full bg-vital shadow-[0_0_0_3px_rgba(185,28,44,.25)]" />বিসিএস প্রস্তুতির জন্য</span>
            <h1 className="mb-5 text-4xl font-extrabold leading-tight text-ink md:text-6xl">
              বিসিএস <em className="not-italic text-vital">ক্যাডার</em> হওয়ার<br />পথে সঙ্গী
            </h1>
            <p className="mb-8 max-w-lg text-lg text-ink-soft">
              বিষয়ভিত্তিক প্র্যাকটিস, প্রিলি মডেল টেস্ট, লিখিত অনুশীলন ও কাট মার্ক ট্র্যাকার — সব এক জায়গায়।
            </p>
            <div className="mb-10 flex flex-wrap items-center gap-4">
              <Link to="/auth" search={{ mode: "signup" }} className="btn-primary hover:btn-primary-hover">
                ফ্রি একাউন্ট খুলুন →
              </Link>
              <Link to="/pricing" className="rounded-xl border-2 border-line px-6 py-3 font-semibold text-ink hover:border-ink">
                প্রাইসিং দেখুন
              </Link>
            </div>
            <div className="grid grid-cols-3 overflow-hidden rounded-2xl border border-line bg-surface">
              {[
                { n: "৬১০+", l: "MCQ প্রশ্ন" },
                { n: "১২", l: "মডেল টেস্ট" },
                { n: "২৪/৭", l: "সাপোর্ট" },
              ].map((s, i) => (
                <div key={i} className={`px-4 py-5 ${i < 2 ? "border-r border-line" : ""}`}>
                  <div className="num text-2xl font-bold text-ink">{s.n}</div>
                  <div className="text-xs text-ink-faint">{s.l}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Monitor mockup */}
          <div className="relative rounded-3xl bg-navy-deep p-7 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex gap-1.5">
                {[0, 1, 2].map((i) => <span key={i} className="h-2 w-2 rounded-full bg-white/20" />)}
              </div>
              <span className="mono flex items-center gap-1.5 text-[11px] tracking-wide text-gold">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-gold" />LIVE PRACTICE
              </span>
            </div>
            <p className="mono mb-4 text-[11px] uppercase tracking-wider text-white/40">Model Test Result</p>
            <div className="mb-4 rounded-xl bg-white/5 p-5">
              <div className="mb-1 text-xs text-white/50">আপনার স্কোর</div>
              <div className="num text-4xl font-bold text-gold">৮২ <span className="text-lg text-white/40">/ ১০০</span></div>
              <div className="mt-2 text-xs text-mint">টপ ১৫% ✓</div>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[
                { l: "সঠিক", v: "৮২", c: "text-mint" },
                { l: "ভুল", v: "১৪", c: "text-vital" },
                { l: "স্কিপ", v: "৪", c: "text-gold" },
              ].map((r, i) => (
                <div key={i} className="rounded-lg border border-white/10 bg-white/5 p-3">
                  <div className="mono text-[10px] uppercase text-white/40">{r.l}</div>
                  <div className={`num text-xl font-semibold ${r.c}`}>{r.v}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Subjects */}
      <section className="bg-bg-alt px-6 py-20">
        <div className="mx-auto max-w-[1180px]">
          <div className="mb-12 max-w-2xl">
            <span className="eyebrow mb-4"><span className="h-1.5 w-1.5 rounded-full bg-mint" />বিষয়সমূহ</span>
            <h2 className="text-3xl font-bold text-ink md:text-4xl">প্রতিটি বিষয়ে গভীর প্রস্তুতি</h2>
            <p className="mt-3 text-ink-soft">সিলেবাস অনুযায়ী প্রশ্ন — ব্যাখ্যা সহ, নিজের গতিতে অনুশীলন করুন।</p>
          </div>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
            {SUBJECTS.map((s) => (
              <div key={s.name} className="rounded-2xl border border-line-soft bg-surface p-6 text-center transition hover:-translate-y-1 hover:shadow-lg">
                <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-full bg-mint/10 text-lg font-bold text-mint-dark num">{s.pct}%</div>
                <h4 className="mb-1 text-base font-bold text-ink">{s.name}</h4>
                <p className="mono text-[11px] text-ink-faint">{s.meta}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="px-6 py-24">
        <div className="mx-auto max-w-[1180px]">
          <div className="mb-14 max-w-2xl">
            <span className="eyebrow mb-4"><span className="h-1.5 w-1.5 rounded-full bg-mint" />ফিচার</span>
            <h2 className="text-3xl font-bold text-ink md:text-4xl">যা যা পাচ্ছেন</h2>
          </div>
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f, i) => (
              <div key={i} className="rounded-2xl border border-line-soft bg-surface p-7">
                <div className={`mb-4 grid h-11 w-11 place-items-center rounded-xl ${f.color} text-lg font-bold`}>{i + 1}</div>
                <h3 className="mb-2 text-lg font-bold text-ink">{f.title}</h3>
                <p className="text-sm text-ink-soft">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-bg-alt px-6 py-20">
        <div className="mx-auto max-w-3xl rounded-3xl bg-navy-deep p-10 text-center text-white shadow-2xl md:p-14">
          <span className="eyebrow mb-5 bg-white/10 text-white/70"><span className="h-1.5 w-1.5 rounded-full bg-gold" />শুরু করুন আজই</span>
          <h2 className="mb-4 text-3xl font-bold md:text-4xl">আপনার বিসিএস প্রস্তুতি শুরু হোক এখান থেকেই</h2>
          <p className="mx-auto mb-8 max-w-lg text-white/70">ফ্রি একাউন্টে সাইন আপ করুন। বিকাশ/নগদে সাবস্ক্রাইব করে সব ফিচার আনলক করুন।</p>
          <Link to="/auth" search={{ mode: "signup" }} className="inline-flex items-center gap-2 rounded-xl bg-gold px-8 py-4 font-bold text-white shadow-lg hover:bg-gold-dark">
            রেজিস্ট্রেশন করুন →
          </Link>
        </div>
      </section>

      <SiteFooter />
    </>
  );
}
