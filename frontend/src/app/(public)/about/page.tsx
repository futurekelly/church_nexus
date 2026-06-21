"use client";

import { PublicNavbar } from "@/features/landing/components/public-navbar";
import { PublicFooter } from "@/features/landing/components/public-footer";
import { Heart, Target, Eye, Shield, Users, BookOpen } from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";


const LEADERS = [
  {
    name: "Rev. Dr. Kelvin Mbise",
    role: "Senior Pastor",
    bio: "Serving with a passion for spiritual growth, fellowship, and community transformation.",
    image: "/images/kelvin_mbise.png",
  },
  {
    name: "Pastor Sarah Koech",
    role: "Associate Pastor",
    bio: "Dedicated to youth empowerment, discipleship, and prayer administration.",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&fit=crop&q=80",
  },
  {
    name: "Deacon John Kamau",
    role: "Head of Operations",
    bio: "Managing church logistics and community outreach programs with excellence.",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&fit=crop&q=80",
  },
];

const VALUES = [
  {
    icon: Heart,
    title: "Faith & Love",
    desc: "Growing together in our love for God and expressing it in service to one another.",
  },
  {
    icon: Users,
    title: "Community",
    desc: "Fostering a welcoming, inclusive space for fellowship and mutual support.",
  },
  {
    icon: BookOpen,
    title: "Discipleship",
    desc: "Equipping individuals with biblical truth to grow and lead in their daily lives.",
  },
  {
    icon: Shield,
    title: "Integrity",
    desc: "Upholding values of transparency, accountability, and stewardship in all we do.",
  },
];

export default function AboutPage() {
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
              {t("public.about.title")}
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              Church Nexus connects local congregations under a unified digital space to foster deep fellowship, coordinate outreach, and manage resources efficiently.
            </p>
          </div>
        </section>

        {/* Mission & Vision Section */}
        <section className="py-16">
          <div className="mx-auto max-w-7xl px-4 lg:px-8">
            <div className="grid gap-8 md:grid-cols-2">
              <div className="glass-panel rounded-2xl border border-border/50 p-8 shadow-glass transition-all hover:border-primary/30">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Target className="h-6 w-6" />
                </div>
                <h2 className="mt-6 font-display text-2xl font-bold text-primary-foreground">{t("public.about.mission")}</h2>
                <p className="mt-4 leading-relaxed text-muted-foreground">
                  To empower local congregations with modern tools that streamline administrative operations, enhance member care, and amplify community outreach. We seek to bring technology and faith together to serve the body of Christ.
                </p>
              </div>

              <div className="glass-panel rounded-2xl border border-border/50 p-8 shadow-glass transition-all hover:border-primary/30">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Eye className="h-6 w-6" />
                </div>
                <h2 className="mt-6 font-display text-2xl font-bold text-primary-foreground">{t("public.about.vision")}</h2>
                <p className="mt-4 leading-relaxed text-muted-foreground">
                  To be the global digital infrastructure for local church congregations, enabling seamless connection, transparency in resource stewardship, and vibrant, active participation in the ministry of faith and fellowship.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Core Values Section */}
        <section className="py-16 bg-card/20 border-y border-border/40">
          <div className="mx-auto max-w-7xl px-4 lg:px-8">
            <div className="text-center">
              <h2 className="font-display text-3xl font-bold text-primary-foreground">Our Core Values</h2>
              <p className="mt-4 text-muted-foreground">The foundational pillars that guide our service and fellowship.</p>
            </div>

            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {VALUES.map((val) => {
                const Icon = val.icon;
                return (
                  <div key={val.title} className="glass-panel rounded-xl border border-border/40 p-6 text-center transition-all hover:-translate-y-1 hover:border-primary/40">
                    <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="mt-4 font-display font-bold text-primary-foreground">{val.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{val.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Leadership Section */}
        <section className="py-20">
          <div className="mx-auto max-w-7xl px-4 lg:px-8">
            <div className="text-center">
              <h2 className="font-display text-3xl font-bold text-primary-foreground sm:text-4xl">Meet Our Leadership</h2>
              <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
                Dedicated pastors and leaders committed to serving the spiritual and operational needs of our church branches.
              </p>
            </div>

            <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {LEADERS.map((leader) => (
                <div key={leader.name} className="glass-panel overflow-hidden rounded-2xl border border-border/50 shadow-glass transition-all hover:border-primary/30">
                  <div className="relative h-64 w-full">
                    <img
                      src={leader.image}
                      alt={leader.name}
                      className="h-full w-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />
                  </div>
                  <div className="p-6">
                    <h3 className="font-display text-xl font-bold text-primary-foreground">{leader.name}</h3>
                    <p className="text-sm font-medium text-primary">{leader.role}</p>
                    <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{leader.bio}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
