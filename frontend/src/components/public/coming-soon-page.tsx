import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { PUBLIC_ROUTES } from "@/constants/routes";
import { PublicFooter } from "@/features/landing/components/public-footer";
import { PublicNavbar } from "@/features/landing/components/public-navbar";

interface ComingSoonPageProps {
  title: string;
  description?: string;
}

export function ComingSoonPage({ title, description }: ComingSoonPageProps) {
  return (
    <>
      <PublicNavbar />

      <main
        id="main-content"
        className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center px-4 py-16"
      >
        <div className="glass-panel w-full max-w-lg rounded-2xl border border-border/60 p-8 text-center shadow-glass md:p-12">
          <p className="text-sm font-semibold uppercase tracking-widest text-primary">
            {title}
          </p>
          <h1 className="mt-4 font-display text-3xl font-bold text-primary-foreground md:text-4xl">
            Coming Soon
          </h1>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground md:text-base">
            {description ??
              "This page is under development. Check back soon for updates."}
          </p>
          <Link
            href={PUBLIC_ROUTES.HOME}
            className="mt-8 inline-flex items-center gap-2 rounded-lg border border-border bg-card/40 px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-all duration-200 hover:border-primary/50 hover:shadow-neon"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Back to Home
          </Link>
        </div>
      </main>

      <PublicFooter />
    </>
  );
}
