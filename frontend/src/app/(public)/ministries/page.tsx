"use client";

import { PublicNavbar } from "@/features/landing/components/public-navbar";
import { PublicFooter } from "@/features/landing/components/public-footer";
import { 
  Camera, 
  HandHeart, 
  Mic2, 
  UserRound, 
  Users, 
  UsersRound, 
  Calendar, 
  ArrowRight 
} from "lucide-react";
import Link from "next/link";
import { mockMinistries } from "@/features/landing/data/mock-data";
import { useTranslation } from "@/hooks/use-translation";


const MINISTRY_ICONS = {
  youth: UsersRound,
  choir: Mic2,
  ushers: HandHeart,
  media: Camera,
  womens: Users,
  mens: UserRound,
} as const;

export default function MinistriesPage() {
  const { t } = useTranslation();
  return (
    <div className="min-h-screen bg-background text-primary-foreground">
      <PublicNavbar />

      <main id="main-content">
        {/* Hero Section */}
        <section className="relative overflow-hidden py-20 lg:py-28">
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background" />
          <div className="mx-auto max-w-7xl px-4 text-center lg:px-8">
            <h1 className="font-display text-4xl font-extrabold tracking-tight text-primary-foreground sm:text-5xl lg:text-6xl">
              {t("public.ministries.title")}
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              {t("public.ministries.subtitle")}
            </p>
          </div>
        </section>

        {/* Directory Section */}
        <section className="py-16">
          <div className="mx-auto max-w-7xl px-4 lg:px-8">
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {mockMinistries.map((ministry) => {
                const Icon = MINISTRY_ICONS[ministry.icon as keyof typeof MINISTRY_ICONS] ?? Users;

                return (
                  <article
                    key={ministry.id}
                    className="glass-panel group flex flex-col justify-between rounded-2xl border border-border/50 p-8 shadow-glass transition-all duration-200 hover:border-primary/30 hover:shadow-neon hover:-translate-y-1"
                  >
                    <div>
                      <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary/20">
                        <Icon className="h-6 w-6" aria-hidden="true" />
                      </div>
                      <h3 className="font-display text-xl font-bold text-primary-foreground">
                        {ministry.name}
                      </h3>
                      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                        {ministry.description}
                      </p>
                    </div>

                    <div className="mt-8 border-t border-border/30 pt-4 flex items-center justify-between">
                      <span className="text-xs font-semibold text-primary">
                        {ministry.member_count} serving
                      </span>
                      <Link
                        href="/register"
                        className="inline-flex items-center gap-1 text-xs font-bold text-emerald-400 hover:text-emerald-300 transition-colors"
                      >
                        <span>{t("public.ministries.join_btn")}</span>
                        <ArrowRight className="h-3 w-3" />
                      </Link>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="py-20 border-t border-border/40">
          <div className="mx-auto max-w-4xl px-4 text-center lg:px-8">
            <h2 className="font-display text-3xl font-bold text-primary-foreground">Not Sure Where to Start?</h2>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              Our pastoral and volunteer teams are ready to help you discover your spiritual gifts and guide you to the ministry that best fits your call. Reach out to us today.
            </p>
            <div className="mt-8 flex justify-center gap-4">
              <Link
                href="/contact"
                className="rounded-xl border border-border/50 bg-card/40 hover:bg-slate-900 px-6 py-3 text-xs font-semibold text-muted-foreground hover:text-primary-foreground transition-all"
              >
                Contact Pastoral Team
              </Link>
              <Link
                href="/register"
                className="rounded-xl bg-primary px-6 py-3 text-xs font-semibold text-white hover:bg-primary/95 transition-all shadow-neon"
              >
                Sign Up as Volunteer
              </Link>
            </div>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
