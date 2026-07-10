import {
  createFileRoute,
  Outlet,
  Link,
  useNavigate,
  useRouterState,
} from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "@/lib/auth-context";

export const Route = createFileRoute("/_authenticated")({
  component: AuthenticatedLayout,
});

function AuthenticatedLayout() {
  const { user, profile, loading, isAdmin, hasActiveSubscription, signOut } = useAuth();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    if (!loading && !user) {
      navigate({ to: "/auth", search: { mode: "login" } });
    }
  }, [loading, user, navigate]);

  if (loading || !user) {
    return (
      <div className="grid min-h-screen place-items-center bg-background">
        <div className="text-ink-soft">লোড হচ্ছে…</div>
      </div>
    );
  }

  const navItems = [
    { to: "/dashboard", label: "ড্যাশবোর্ড", icon: "🏠" },
    { to: "/practice", label: "প্র্যাকটিস", icon: "📚" },
    { to: "/model-test", label: "মডেল টেস্ট", icon: "📝" },
    { to: "/written", label: "লিখিত", icon: "✍️" },
    { to: "/tracker", label: "ট্র্যাকার", icon: "📊" },
    { to: "/pricing", label: "সাবস্ক্রিপশন", icon: "💳" },
  ];

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="sticky top-0 hidden h-screen w-60 flex-none flex-col overflow-y-auto bg-navy-deep text-white/70 md:flex">
        <Link to="/" className="flex items-center gap-2 border-b border-white/10 px-5 py-5 font-display text-lg font-extrabold text-white">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-vital">C</span>
          CadreAdmit
        </Link>
        <nav className="flex-1 space-y-1 p-3">
          {navItems.map((it) => {
            const active = pathname === it.to || pathname.startsWith(it.to + "/");
            return (
              <Link
                key={it.to}
                to={it.to}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${active ? "bg-vital text-white" : "text-white/60 hover:bg-white/5 hover:text-white"}`}
              >
                <span>{it.icon}</span>
                <span>{it.label}</span>
              </Link>
            );
          })}
          {isAdmin && (
            <>
              <div className="mono px-3 pb-1 pt-4 text-[10px] uppercase tracking-wider text-white/30">ADMIN</div>
              {[
                { to: "/admin", label: "Dashboard", icon: "⚡" },
                { to: "/admin/payments", label: "Payments", icon: "💰" },
                { to: "/admin/questions", label: "Questions", icon: "❓" },
                { to: "/admin/tests", label: "Model Tests", icon: "🎯" },
                { to: "/admin/settings", label: "Settings", icon: "⚙️" },
              ].map((it) => {
                const active = pathname === it.to;
                return (
                  <Link
                    key={it.to}
                    to={it.to}
                    className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${active ? "bg-gold text-white" : "text-white/60 hover:bg-white/5 hover:text-white"}`}
                  >
                    <span>{it.icon}</span>
                    <span>{it.label}</span>
                  </Link>
                );
              })}
            </>
          )}
        </nav>
        <div className="border-t border-white/10 p-4">
          <div className="mb-2 rounded-xl bg-white/5 p-3">
            <div className="text-[11px] text-white/50">Plan</div>
            <div className="text-sm font-bold text-white">
              {isAdmin ? "Admin" : hasActiveSubscription ? "Premium ✓" : "Free"}
            </div>
          </div>
          <div className="mb-2 truncate text-xs text-white/50">{profile?.name || profile?.email}</div>
          <button
            onClick={() => signOut()}
            className="w-full rounded-lg px-3 py-2 text-left text-sm text-white/60 hover:bg-white/5 hover:text-white"
          >
            লগ আউট
          </button>
        </div>
      </aside>

      <main className="min-w-0 flex-1">
        <header className="sticky top-0 z-30 flex items-center justify-between gap-4 border-b border-line bg-background/85 px-5 py-3 backdrop-blur-md md:px-8">
          <div className="flex items-center gap-3 md:hidden">
            <Link to="/" className="font-display text-lg font-extrabold">CadreAdmit</Link>
          </div>
          <div className="ml-auto flex items-center gap-3">
            {!hasActiveSubscription && !isAdmin && (
              <Link to="/pricing" className="rounded-full bg-vital/10 px-3 py-1.5 text-xs font-semibold text-vital-dark hover:bg-vital/20">
                সাবস্ক্রাইব করুন →
              </Link>
            )}
            <div className="grid h-9 w-9 place-items-center rounded-full bg-mint font-bold text-white">
              {(profile?.name?.[0] || profile?.email?.[0] || "U").toUpperCase()}
            </div>
          </div>
        </header>
        <div className="p-5 md:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
