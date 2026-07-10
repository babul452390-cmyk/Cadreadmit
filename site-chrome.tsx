import { Link } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth-context";

export function SiteHeader() {
  const { user, isAdmin, hasActiveSubscription } = useAuth();
  return (
    <header className="sticky top-0 z-40 border-b border-transparent bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-[1180px] items-center justify-between gap-6 px-6 py-4">
        <Link to="/" className="flex items-center gap-2 font-display text-xl font-extrabold text-ink">
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-vital text-white shadow-md">C</span>
          CadreAdmit
        </Link>
        <nav className="hidden items-center gap-7 text-sm font-semibold text-ink-soft md:flex">
          <Link to="/" className="hover:text-ink">হোম</Link>
          <Link to="/practice" className="hover:text-ink">প্র্যাকটিস</Link>
          <Link to="/model-test" className="hover:text-ink">মডেল টেস্ট</Link>
          <Link to="/tracker" className="hover:text-ink">ট্র্যাকার</Link>
          <Link to="/pricing" className="hover:text-ink">প্রাইসিং</Link>
        </nav>
        <div className="flex items-center gap-2">
          {user ? (
            <>
              {isAdmin && (
                <Link to="/admin" className="hidden rounded-lg bg-gold px-3 py-1.5 text-xs font-bold text-white md:inline-flex">
                  Admin
                </Link>
              )}
              <Link to="/dashboard" className="btn-primary hover:btn-primary-hover">
                Dashboard{!hasActiveSubscription && !isAdmin ? " →" : ""}
              </Link>
            </>
          ) : (
            <>
              <Link to="/auth" search={{ mode: "login" }} className="rounded-lg border border-line px-4 py-2 text-sm font-semibold hover:border-ink">
                লগইন
              </Link>
              <Link to="/auth" search={{ mode: "signup" }} className="btn-primary hover:btn-primary-hover">
                শুরু করুন
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="bg-navy-deep py-14 text-white/70">
      <div className="mx-auto max-w-[1180px] px-6">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          <div>
            <div className="mb-3 flex items-center gap-2 font-display text-lg font-extrabold text-white">
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-vital">C</span>
              CadreAdmit
            </div>
            <p className="text-sm">বিসিএস প্রার্থীদের জন্য প্র্যাকটিস, মডেল টেস্ট ও লিখিত অনুশীলনের একটি প্ল্যাটফর্ম।</p>
          </div>
          <div>
            <h5 className="mb-3 text-sm font-bold text-white">প্রস্তুতি</h5>
            <ul className="space-y-2 text-sm">
              <li><Link to="/practice" className="hover:text-white">প্র্যাকটিস</Link></li>
              <li><Link to="/model-test" className="hover:text-white">মডেল টেস্ট</Link></li>
              <li><Link to="/written" className="hover:text-white">লিখিত অনুশীলন</Link></li>
              <li><Link to="/tracker" className="hover:text-white">ট্র্যাকার</Link></li>
            </ul>
          </div>
          <div>
            <h5 className="mb-3 text-sm font-bold text-white">অ্যাকাউন্ট</h5>
            <ul className="space-y-2 text-sm">
              <li><Link to="/auth" search={{ mode: "login" }} className="hover:text-white">লগইন</Link></li>
              <li><Link to="/auth" search={{ mode: "signup" }} className="hover:text-white">রেজিস্ট্রেশন</Link></li>
              <li><Link to="/pricing" className="hover:text-white">সাবস্ক্রিপশন</Link></li>
            </ul>
          </div>
          <div>
            <h5 className="mb-3 text-sm font-bold text-white">যোগাযোগ</h5>
            <ul className="space-y-2 text-sm">
              <li>Email: support@cadreadmit.com</li>
              <li>বাংলাদেশ</li>
            </ul>
          </div>
        </div>
        <div className="mt-10 border-t border-white/10 pt-5 text-xs text-white/40">
          © {new Date().getFullYear()} CadreAdmit. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
