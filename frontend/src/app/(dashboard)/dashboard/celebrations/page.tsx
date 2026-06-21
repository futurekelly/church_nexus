"use client";

import { useState, useEffect, useMemo } from "react";
import { 
  PartyPopper, 
  Cake, 
  Gift, 
  Mail, 
  Calendar as CalendarIcon, 
  ArrowLeft,
  Users
} from "lucide-react";
import Link from "next/link";
import { apiGet } from "@/services/api-client";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface Celebrant {
  id: string;
  name: string;
  type: "birthday" | "anniversary" | "milestone";
  dateStr: string;
  detail: string;
  email: string;
}

export default function CelebrationsPage() {
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadMembers() {
      try {
        setLoading(true);
        const response = await apiGet<any>("/api/members/?page_size=100");
        if (response.success && response.data?.results) {
          setMembers(response.data.results);
        }
      } catch (err) {
        console.error("Failed to load members for celebrations:", err);
      } finally {
        setLoading(false);
      }
    }
    loadMembers();
  }, []);

  const currentMonthIndex = new Date().getMonth(); // 0-11
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  const activeMonthName = monthNames[currentMonthIndex];

  const celebrationsList = useMemo<Celebrant[]>(() => {
    const list: Celebrant[] = [];
    
    members.forEach((m) => {
      const fullName = `${m.first_name} ${m.last_name}`;
      
      // 1. Birthdays
      if (m.date_of_birth) {
        const bdate = new Date(m.date_of_birth);
        if (bdate.getMonth() === currentMonthIndex) {
          const age = new Date().getFullYear() - bdate.getFullYear();
          list.push({
            id: `bday-${m.id}`,
            name: fullName,
            type: "birthday",
            dateStr: `${bdate.getDate()} ${activeMonthName}`,
            detail: `Celebrating ${age} years of life`,
            email: m.email,
          });
        }
      }

      // 2. Wedding Anniversaries
      if (m.marriage_anniversary_date) {
        const mdate = new Date(m.marriage_anniversary_date);
        if (mdate.getMonth() === currentMonthIndex) {
          const years = new Date().getFullYear() - mdate.getFullYear();
          list.push({
            id: `ann-${m.id}`,
            name: fullName,
            type: "anniversary",
            dateStr: `${mdate.getDate()} ${activeMonthName}`,
            detail: `Celebrating ${years} years of marriage`,
            email: m.email,
          });
        }
      }

      // 3. Membership milestones (Join date)
      if (m.join_date) {
        const jdate = new Date(m.join_date);
        if (jdate.getMonth() === currentMonthIndex) {
          const years = new Date().getFullYear() - jdate.getFullYear();
          if (years > 0) {
            list.push({
              id: `mile-${m.id}`,
              name: fullName,
              type: "milestone",
              dateStr: `${jdate.getDate()} ${activeMonthName}`,
              detail: `Member for ${years} years`,
              email: m.email,
            });
          }
        }
      }
    });

    // Fallback mock celebrations if DB is empty/seeding is fresh
    if (list.length === 0 && !loading) {
      return [
        {
          id: "mock-1",
          name: "Sir. Kelvin Mbise",
          type: "birthday",
          dateStr: `12 ${activeMonthName}`,
          detail: "Celebrating 28 years of life",
          email: "futurekelly360@gmail.com",
        },
        {
          id: "mock-2",
          name: "Grace Kamau",
          type: "anniversary",
          dateStr: `18 ${activeMonthName}`,
          detail: "Celebrating 5 years of marriage",
          email: "grace.kamau@example.com",
        },
        {
          id: "mock-3",
          name: "Michael Adeyemi",
          type: "milestone",
          dateStr: `24 ${activeMonthName}`,
          detail: "Member for 3 years",
          email: "michael@example.com",
        }
      ];
    }

    return list;
  }, [members, currentMonthIndex, activeMonthName, loading]);

  const stats = useMemo(() => {
    const birthdays = celebrationsList.filter((c) => c.type === "birthday").length;
    const anniversaries = celebrationsList.filter((c) => c.type === "anniversary").length;
    const milestones = celebrationsList.filter((c) => c.type === "milestone").length;
    return { birthdays, anniversaries, milestones };
  }, [celebrationsList]);

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8 select-none">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-border/30 pb-4">
        <Link
          href="/dashboard"
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-border/50 bg-card/40 hover:bg-slate-900 transition-colors text-muted-foreground hover:text-primary-foreground"
          aria-label="Back to dashboard"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-primary-foreground font-display flex items-center gap-2">
            <PartyPopper className="h-6 w-6 text-pink-500 animate-pulse" />
            Celebrations Board
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Congratulate and celebrate upcoming birthdays, wedding anniversaries, and milestones for the month of {activeMonthName}.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="rounded-2xl border border-border/40 bg-card/60 p-8 text-center animate-pulse min-h-[300px] flex justify-center items-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      ) : (
        <div className="space-y-6">
          {/* KPI Dashboard */}
          <div className="grid gap-4 grid-cols-3">
            <div className="glass-panel rounded-2xl border border-pink-500/20 bg-card/30 p-5 flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-pink-500/10 text-pink-400">
                <Cake className="h-5 w-5" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider">Birthdays</span>
                <p className="text-xl font-bold text-primary-foreground">{stats.birthdays}</p>
              </div>
            </div>

            <div className="glass-panel rounded-2xl border border-indigo-500/20 bg-card/30 p-5 flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400">
                <Gift className="h-5 w-5" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider">Anniversaries</span>
                <p className="text-xl font-bold text-primary-foreground">{stats.anniversaries}</p>
              </div>
            </div>

            <div className="glass-panel rounded-2xl border border-emerald-500/20 bg-card/30 p-5 flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider">Milestones</span>
                <p className="text-xl font-bold text-primary-foreground">{stats.milestones}</p>
              </div>
            </div>
          </div>

          {/* Celebrations Grid */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {celebrationsList.map((c, index) => (
              <motion.article
                key={c.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={cn(
                  "glass-panel rounded-2xl border p-5 bg-card/40 flex flex-col justify-between hover:shadow-neon transition-all duration-200",
                  c.type === "birthday" && "border-pink-500/10 hover:border-pink-500/25",
                  c.type === "anniversary" && "border-indigo-500/10 hover:border-indigo-500/25",
                  c.type === "milestone" && "border-emerald-500/10 hover:border-emerald-500/25"
                )}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold text-slate-400 bg-slate-900/40 px-2 py-0.5 rounded-lg border border-border/20">
                      {c.dateStr}
                    </span>
                    {c.type === "birthday" && <Cake className="h-4 w-4 text-pink-400" />}
                    {c.type === "anniversary" && <Gift className="h-4 w-4 text-indigo-400" />}
                    {c.type === "milestone" && <Users className="h-4 w-4 text-emerald-400" />}
                  </div>

                  <h3 className="font-display text-sm font-bold text-primary-foreground mt-4">
                    {c.name}
                  </h3>
                  <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">
                    {c.detail}
                  </p>
                </div>

                <div className="mt-6 pt-3 border-t border-border/10 flex justify-end">
                  <a
                    href={`mailto:${c.email}?subject=Happy%20Celebration%20Blessings!&body=Dear%20${encodeURIComponent(c.name)},%0D%0A%0D%0AWishing%20you%20God's%20abundant%20grace,%20peace,%20and%20joy%20on%20this%20special%20milestone!%0D%0A%0D%0ABest%20regards,%0D%0AChurch%20Nexus%20Team`}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-500 hover:bg-indigo-600 px-3 py-1.5 text-[10px] font-semibold text-white transition-colors"
                  >
                    <Mail className="h-3 w-3" />
                    <span>Send Blessing</span>
                  </a>
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
