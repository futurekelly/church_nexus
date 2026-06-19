"use client";

import { useState, useMemo, useCallback } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, MapPin, Clock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import type { Event, EventType } from "../types/event.types";

interface EventCalendarViewProps {
  events: Event[];
}

const TYPE_DOTS: Record<EventType, string> = {
  "Sunday Service": "bg-indigo-400 shadow-[0_0_6px_rgba(99,102,241,0.5)]",
  "Bible Study": "bg-emerald-400 shadow-[0_0_6px_rgba(16,185,129,0.5)]",
  "Prayer Meeting": "bg-purple-400 shadow-[0_0_6px_rgba(192,132,252,0.5)]",
  "Youth Meeting": "bg-orange-400 shadow-[0_0_6px_rgba(251,146,60,0.5)]",
  "Conference": "bg-blue-400 shadow-[0_0_6px_rgba(96,165,250,0.5)]",
  "Seminar": "bg-rose-400 shadow-[0_0_6px_rgba(244,63,94,0.5)]",
  "Outreach": "bg-amber-400 shadow-[0_0_6px_rgba(245,158,11,0.5)]",
  "Livestream Event": "bg-cyan-400 shadow-[0_0_6px_rgba(34,211,238,0.5)]",
  "Special Event": "bg-teal-400 shadow-[0_0_6px_rgba(20,184,166,0.5)]",
};

export function EventCalendarView({ events }: EventCalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [viewMode, setViewMode] = useState<"month" | "week" | "agenda">("month");

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Get month statistics & details
  const monthData = useMemo(() => {
    const firstDayIndex = new Date(year, month, 1).getDay(); // 0 is Sunday
    const totalDays = new Date(year, month + 1, 0).getDate();
    const prevMonthTotalDays = new Date(year, month, 0).getDate();

    const days = [];

    // Prev month padding days
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      days.push({
        day: prevMonthTotalDays - i,
        date: new Date(year, month - 1, prevMonthTotalDays - i),
        isCurrentMonth: false,
      });
    }

    // Current month days
    for (let i = 1; i <= totalDays; i++) {
      days.push({
        day: i,
        date: new Date(year, month, i),
        isCurrentMonth: true,
      });
    }

    // Next month padding days
    const remainingCells = 42 - days.length; // 6 rows of 7 days
    for (let i = 1; i <= remainingCells; i++) {
      days.push({
        day: i,
        date: new Date(year, month + 1, i),
        isCurrentMonth: false,
      });
    }

    return days;
  }, [year, month]);

  // Navigate handlers
  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handlePrevWeek = () => {
    const prevWeek = new Date(currentDate);
    prevWeek.setDate(prevWeek.getDate() - 7);
    setCurrentDate(prevWeek);
  };

  const handleNextWeek = () => {
    const nextWeek = new Date(currentDate);
    nextWeek.setDate(nextWeek.getDate() + 7);
    setCurrentDate(nextWeek);
  };

  // Get events on a specific day
  const getEventsForDay = useCallback(
    (date: Date) => {
      return events.filter((e) => {
        const start = new Date(e.start_date);
        return (
          start.getFullYear() === date.getFullYear() &&
          start.getMonth() === date.getMonth() &&
          start.getDate() === date.getDate() &&
          e.status !== "Cancelled" &&
          e.status !== "Archived"
        );
      });
    },
    [events]
  );

  const selectedDayEvents = useMemo(() => {
    if (!selectedDate) return [];
    return getEventsForDay(selectedDate);
  }, [selectedDate, getEventsForDay]);

  const monthLabel = currentDate.toLocaleString("default", {
    month: "long",
    year: "numeric",
  });

  const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  // Week View calculation
  const weekDaysData = useMemo(() => {
    const startOfWeek = new Date(currentDate);
    const day = startOfWeek.getDay();
    startOfWeek.setDate(startOfWeek.getDate() - day); // Set to Sunday

    return [...Array(7)].map((_, i) => {
      const d = new Date(startOfWeek);
      d.setDate(d.getDate() + i);
      return d;
    });
  }, [currentDate]);

  // Agenda View sorting (chronological, non-cancelled/non-archived)
  const agendaEvents = useMemo(() => {
    return events
      .filter((e) => e.status !== "Cancelled" && e.status !== "Archived")
      .sort((a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime());
  }, [events]);

  return (
    <div className="space-y-6">
      {/* View Mode Selectors Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-card/40 border border-border/30 p-4 rounded-2xl backdrop-blur-glass">
        <div className="flex items-center gap-1.5 bg-slate-900/60 p-1 rounded-xl border border-border/20 self-start">
          <button
            onClick={() => setViewMode("month")}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-semibold transition-all",
              viewMode === "month"
                ? "bg-indigo-500 text-white shadow-neon"
                : "text-muted-foreground hover:text-primary-foreground"
            )}
          >
            Month View
          </button>
          <button
            onClick={() => setViewMode("week")}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-semibold transition-all",
              viewMode === "week"
                ? "bg-indigo-500 text-white shadow-neon"
                : "text-muted-foreground hover:text-primary-foreground"
            )}
          >
            Week View
          </button>
          <button
            onClick={() => setViewMode("agenda")}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-semibold transition-all",
              viewMode === "agenda"
                ? "bg-indigo-500 text-white shadow-neon"
                : "text-muted-foreground hover:text-primary-foreground"
            )}
          >
            Agenda View
          </button>
        </div>

        {/* Date Navigator Label */}
        {viewMode !== "agenda" && (
          <div className="flex items-center gap-3">
            <h3 className="text-sm font-bold text-primary-foreground font-mono">
              {viewMode === "month" ? monthLabel : `Week of ${weekDaysData[0].toLocaleDateString("en-US", { month: "short", day: "numeric" })}`}
            </h3>
            <div className="flex items-center gap-1.5">
              <button
                onClick={viewMode === "month" ? handlePrevMonth : handlePrevWeek}
                className="rounded-lg border border-border/40 bg-slate-900/50 p-1.5 text-slate-400 hover:text-white"
                aria-label="Previous"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={viewMode === "month" ? handleNextMonth : handleNextWeek}
                className="rounded-lg border border-border/40 bg-slate-900/50 p-1.5 text-slate-400 hover:text-white"
                aria-label="Next"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* RENDER MODES */}
      {viewMode === "month" && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Calendar Grid card */}
          <div className="rounded-2xl border border-border/50 bg-card/60 p-5 backdrop-blur-[16px] shadow-glass lg:col-span-2">
            {/* Weekday headers */}
            <div className="grid grid-cols-7 text-center text-xs font-semibold text-muted-foreground border-b border-border/20 pb-2">
              {weekdays.map((d) => (
                <div key={d}>{d}</div>
              ))}
            </div>

            {/* Calendar days grid */}
            <div className="mt-2 grid grid-cols-7 gap-1">
              {monthData.map((cell, index) => {
                const dayEvents = getEventsForDay(cell.date);
                const isToday = cell.date.toDateString() === new Date().toDateString();
                const isSelected = selectedDate && cell.date.toDateString() === selectedDate.toDateString();

                return (
                  <button
                    key={index}
                    onClick={() => setSelectedDate(cell.date)}
                    className={cn(
                      "relative flex min-h-[50px] md:min-h-[75px] flex-col justify-between rounded-xl p-1.5 transition-all text-left border border-transparent",
                      cell.isCurrentMonth ? "text-primary-foreground" : "text-muted-foreground/35",
                      isSelected
                        ? "border-indigo-500/50 bg-indigo-500/10 shadow-[0_0_12px_rgba(99,102,241,0.15)]"
                        : cell.isCurrentMonth
                        ? "hover:bg-card/40 hover:border-border/30"
                        : "hover:bg-card/20",
                      isToday && !isSelected && "border-primary/40 bg-primary/5"
                    )}
                  >
                    <span
                      className={cn(
                        "flex h-6 w-6 items-center justify-center text-xs font-semibold rounded-md",
                        isToday && "bg-indigo-500 text-white font-bold"
                      )}
                    >
                      {cell.day}
                    </span>

                    {/* Day events visual indicators */}
                    <div className="mt-1 space-y-1 w-full overflow-hidden">
                      <div className="hidden md:block space-y-1">
                        {dayEvents.slice(0, 2).map((ev: Event) => (
                          <div
                            key={ev.id}
                            className="truncate rounded px-1 py-0.5 text-[9px] font-medium leading-none border border-border/20 text-white/90 bg-slate-900/60"
                          >
                            <span className={cn("inline-block h-1.5 w-1.5 rounded-full mr-1", TYPE_DOTS[ev.event_type])} />
                            {ev.title}
                          </div>
                        ))}
                        {dayEvents.length > 2 && (
                          <div className="pl-1 text-[8px] text-muted-foreground font-semibold">
                            +{dayEvents.length - 2} more
                          </div>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-1 justify-center md:hidden mt-0.5">
                        {dayEvents.map((ev: Event) => (
                          <span key={ev.id} className={cn("h-1.5 w-1.5 rounded-full", TYPE_DOTS[ev.event_type])} />
                        ))}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Selected day panel */}
          <div className="rounded-2xl border border-border/50 bg-card/60 p-5 backdrop-blur-[16px] shadow-glass flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-bold text-primary-foreground border-b border-border/30 pb-3">
                Events on {selectedDate?.toLocaleDateString("default", { day: "numeric", month: "short", year: "numeric" })}
              </h3>

              <div className="mt-4 space-y-4 max-h-[350px] overflow-y-auto pr-1">
                {selectedDayEvents.length === 0 ? (
                  <p className="text-center text-xs text-muted-foreground py-8">No events scheduled for this day.</p>
                ) : (
                  selectedDayEvents.map((ev: Event) => (
                    <div key={ev.id} className="group rounded-xl border border-border/40 bg-card/40 p-3 hover:border-indigo-500/40 transition-all duration-300">
                      <Link href={`/dashboard/events/${ev.id}`} className="block">
                        <div className="flex items-center justify-between gap-1.5">
                          <span className="rounded-full px-2 py-0.5 text-[9px] font-semibold border border-border/30 bg-card text-muted-foreground">
                            {ev.event_type}
                          </span>
                          <span className="text-[10px] text-muted-foreground group-hover:text-indigo-400 font-medium">Details &rarr;</span>
                        </div>
                        <h4 className="mt-2 text-xs font-bold text-primary-foreground group-hover:text-indigo-400 transition-colors">{ev.title}</h4>
                        <div className="mt-2.5 space-y-1 text-[11px] text-muted-foreground">
                          <div className="flex items-center gap-1.5">
                            <Clock className="h-3.5 w-3.5 text-indigo-400" />
                            <span>{new Date(ev.start_date).toLocaleTimeString("default", { hour: "2-digit", minute: "2-digit" })}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <MapPin className="h-3.5 w-3.5 text-indigo-400" />
                            <span className="truncate">{ev.location}</span>
                          </div>
                        </div>
                      </Link>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-border/20 text-[9px] text-muted-foreground flex flex-wrap gap-x-3 gap-y-1 justify-center">
              {Object.entries(TYPE_DOTS).map(([type, dotClass]) => (
                <div key={type} className="flex items-center gap-1">
                  <span className={cn("h-1.5 w-1.5 rounded-full", dotClass)} />
                  <span>{type}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Week View Columns */}
      {viewMode === "week" && (
        <div className="grid gap-3 grid-cols-7 overflow-x-auto min-w-[800px]">
          {weekDaysData.map((wDate, idx) => {
            const dayEvents = getEventsForDay(wDate);
            const isToday = wDate.toDateString() === new Date().toDateString();

            return (
              <div
                key={idx}
                className={cn(
                  "rounded-2xl border bg-card/60 p-4 min-h-[400px] flex flex-col space-y-4",
                  isToday ? "border-indigo-500/50 bg-indigo-500/5" : "border-border/40"
                )}
              >
                {/* Column header */}
                <div className="border-b border-border/30 pb-2 text-center">
                  <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">{weekdays[idx]}</p>
                  <p className={cn("text-lg font-bold mt-0.5 font-mono", isToday && "text-indigo-400")}>{wDate.getDate()}</p>
                </div>

                {/* Day events column */}
                <div className="flex-1 flex flex-col gap-3 overflow-y-auto">
                  {dayEvents.length > 0 ? (
                    dayEvents.map((ev: Event) => (
                      <div
                        key={ev.id}
                        className="p-2.5 rounded-xl border border-border/30 bg-slate-900/40 hover:border-indigo-500/30 transition-all text-left"
                      >
                        <span className={cn("h-1.5 w-1.5 rounded-full inline-block mb-1", TYPE_DOTS[ev.event_type])} />
                        <h4 className="text-[11px] font-bold text-primary-foreground line-clamp-2 leading-tight">{ev.title}</h4>
                        <p className="text-[9px] text-muted-foreground mt-1.5 flex items-center gap-0.5 font-mono">
                          <Clock className="h-3 w-3" />
                          <span>{new Date(ev.start_date).toLocaleTimeString("default", { hour: "2-digit", minute: "2-digit" })}</span>
                        </p>
                        <Link href={`/dashboard/events/${ev.id}`} className="text-[9px] text-indigo-400 hover:text-indigo-300 font-semibold block mt-2 text-right">
                          Open &rarr;
                        </Link>
                      </div>
                    ))
                  ) : (
                    <p className="text-[10px] text-center text-muted-foreground/45 mt-8 select-none">No events</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Agenda View Chronological List */}
      {viewMode === "agenda" && (
        <div className="glass-panel p-6 rounded-2xl border border-border/40 space-y-6">
          <div className="border-b border-border/20 pb-3 flex items-center justify-between">
            <h3 className="text-sm font-bold text-primary-foreground">Chronological Bulletin</h3>
            <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded-lg border border-border/20">{agendaEvents.length} active announcements</span>
          </div>

          <div className="divide-y divide-border/20 space-y-4">
            {agendaEvents.length > 0 ? (
              agendaEvents.map((ev: Event) => {
                const dateLabel = new Date(ev.start_date).toLocaleDateString("en-US", {
                  weekday: "long",
                  month: "short",
                  day: "numeric",
                  year: "numeric"
                });

                return (
                  <div key={ev.id} className="pt-4 flex flex-col md:flex-row md:items-start md:justify-between gap-4 group">
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs text-indigo-400 font-bold font-mono">{dateLabel}</span>
                        <span className="rounded bg-slate-900 border border-border/30 text-[9px] font-bold text-slate-400 px-2 py-0.5">
                          {ev.event_type}
                        </span>
                        {ev.is_recurring && (
                          <span className="rounded bg-emerald-500/10 border border-emerald-500/20 text-[8px] font-bold text-emerald-400 px-1.5 py-0.25">
                            Recurring ({ev.recurrence_pattern})
                          </span>
                        )}
                      </div>
                      <h4 className="text-sm font-bold text-primary-foreground group-hover:text-indigo-400 transition-colors">{ev.title}</h4>
                      <p className="text-xs text-muted-foreground leading-relaxed max-w-2xl">{ev.description}</p>
                    </div>

                    <div className="flex flex-col items-start md:items-end gap-2 shrink-0">
                      <div className="text-[11px] text-slate-400 space-y-1 font-mono">
                        <div className="flex items-center gap-1 justify-end">
                          <Clock className="h-3.5 w-3.5" />
                          <span>
                            {new Date(ev.start_date).toLocaleTimeString("default", { hour: "2-digit", minute: "2-digit" })} -{" "}
                            {new Date(ev.end_date).toLocaleTimeString("default", { hour: "2-digit", minute: "2-digit" })}
                          </span>
                        </div>
                        <p className="truncate max-w-[200px]" title={ev.location}>{ev.location}</p>
                      </div>

                      <Link
                        href={`/dashboard/events/${ev.id}`}
                        className="inline-flex h-7 items-center rounded-lg border border-border/40 bg-card px-3 text-[10px] font-semibold text-slate-300 hover:bg-slate-900"
                      >
                        RSVP Details
                      </Link>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-xs text-center text-muted-foreground py-10">No events currently scheduled in the library catalog.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
