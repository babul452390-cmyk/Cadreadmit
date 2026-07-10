import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { AuthProvider } from "../lib/auth-context";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-ink">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-ink">পাতাটি পাওয়া যায়নি</h2>
        <p className="mt-2 text-sm text-ink-soft">
          খুঁজে পাচ্ছেন না — লিংকটি সরানো হতে পারে।
        </p>
        <div className="mt-6">
          <Link to="/" className="btn-primary hover:btn-primary-hover">
            হোমে ফিরে যান
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold text-ink">পাতাটি লোড হয়নি</h1>
        <p className="mt-2 text-sm text-ink-soft">
          কিছু একটা ভুল হয়েছে। আবার চেষ্টা করুন।
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="btn-primary hover:btn-primary-hover"
          >
            আবার চেষ্টা করুন
          </button>
          <a href="/" className="inline-flex items-center rounded-xl border border-line px-4 py-2 text-sm font-medium text-ink hover:bg-bg-alt">
            হোমে ফিরুন
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "CadreAdmit — বিসিএস প্রিলি ও লিখিত প্রস্তুতি প্ল্যাটফর্ম" },
      { name: "description", content: "বিসিএস (BCS) পরীক্ষার সম্পূর্ণ প্রস্তুতি — বিষয়ভিত্তিক MCQ প্র্যাকটিস, মডেল টেস্ট, কাট মার্ক ট্র্যাকার ও লিখিত অনুশীলন। বাংলাদেশের বিসিএস প্রার্থীদের জন্য।" },
      { name: "author", content: "CadreAdmit" },
      { property: "og:title", content: "CadreAdmit — বিসিএস প্রস্তুতি প্ল্যাটফর্ম" },
      { property: "og:description", content: "বিসিএস প্রিলিমিনারি ও লিখিত প্রস্তুতির জন্য বিষয়ভিত্তিক অনুশীলন, মডেল টেস্ট ও ট্র্যাকিং।" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: "/favicon.ico", type: "image/x-icon" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Anek+Bangla:wght@600;700;800&family=Hind+Siliguri:wght@400;500;600;700&family=Public+Sans:wght@500;600;700&family=Roboto+Mono:wght@400;500;600&display=swap",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="bn">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Outlet />
      </AuthProvider>
    </QueryClientProvider>
  );
}
