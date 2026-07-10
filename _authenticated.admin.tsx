import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "@/lib/auth-context";

export const Route = createFileRoute("/_authenticated/admin")({
  component: AdminGate,
});

function AdminGate() {
  const { isAdmin, loading } = useAuth();
  const navigate = useNavigate();
  useEffect(() => {
    if (!loading && !isAdmin) navigate({ to: "/dashboard" });
  }, [loading, isAdmin, navigate]);
  if (loading || !isAdmin) return <div className="text-ink-soft">অনুমতি যাচাই হচ্ছে…</div>;
  return <Outlet />;
}
