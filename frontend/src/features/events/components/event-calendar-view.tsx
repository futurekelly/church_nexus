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

  // Get events on a specific day
  const getEventsForDay = useCallback(
    (date: Date) => {
      return events.filter((e) => {
        const start = new Date(e.start_date);
        return (
          start.getFullYear() === date.getFullYear() &&
          start.getMonth() === date.getMonth() &&
          start.getDate() === date.getDate() &&
          e.status !== "Cancelled"
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

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      {/* Calendar Grid card */}
      <div className="rounded-2xl border border-border/50 bg-card/60 p-5 backdrop-blur-[16px] shadow-glass lg:col-span-2">
        <div className="flex items-center justify-between border-b border-border/30 pb-4">
          <h3 className="text-lg font-bold text-primary-foreground flex items-center gap-2">
            <CalendarIcon className="h-5 w-5 text-indigo-400" />
            {monthLabel}
          </h3>
          <div className="flex items-center gap-1.5">
            <button
              onClick={handlePrevMonth}
              className="rounded-lg border border-border/50 bg-card/50 p-2 text-muted-foreground transition-all hover:bg-card hover:text-primary-foreground focus:ring-1 focus:ring-primary"
              aria-label="Previous month"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={handleNextMonth}
              className="rounded-lg border border-border/50 bg-card/50 p-2 text-muted-foreground transition-all hover:bg-card hover:text-primary-foreground focus:ring-1 focus:ring-primary"
              aria-label="Next month"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Weekday headers */}
        <div className="mt-4 grid grid-cols-7 text-center text-xs font-semibold text-muted-foreground">
          {weekdays.map((d) => (
            <div key={d} className="py-2">
              {d}
            </div>
          ))}
        </div>

        {/* Calendar days grid */}
        <div className="mt-1 grid grid-cols-7 gap-1 border-t border-border/10 pt-1">
          {monthData.map((cell, index) => {
            const dayEvents = getEventsForDay(cell.date);
            const isToday =
              cell.date.toDateString() === new Date().toDateString();
            const isSelected =
              selectedDate &&
              cell.date.toDateString() === selectedDate.toDateString();

            return (
              <button
                key={index}
                onClick={() => setSelectedDate(cell.date)}
                className={cn(
                  "relative flex min-h-[50px] md:min-h-[75px] flex-col justify-between rounded-xl p-1.5 transition-all text-left border border-transparent",
                  cell.isCurrentMonth
                    ? "text-primary-foreground"
                    : "text-muted-foreground/40",
                  isSelected
                    ? "border-indigo-500/50 bg-indigo-500/10 shadow-[0_0_12px_rgba(99,102,241,0.15)]"
                    : cell.isCurrentMonth
                    ? "hover:bg-card/40 hover:border-border/30"
                    : "hover:bg-card/20",
                  isToday && !isSelected && "border-primary/40 bg-primary/5"
                )}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={cn(
                      "flex h-6 w-6 items-center justify-center text-xs font-semibold rounded-md",
                      isToday && "bg-indigo-500 text-white font-bold"
                    )}
                  >
                    {cell.day}
                  </span>
                </div>

                {/* Day events visual indicators */}
                <div className="mt-1 space-y-1 w-full overflow-hidden">
                  {/* Desktop event pill list */}
                  <div className="hidden md:block space-y-1">
                    {dayEvents.slice(0, 2).map((ev: Event) => (
                      <div
                        key={ev.id}
                        className={cn(
                          "truncate rounded px-1 py-0.5 text-[10px] font-medium leading-none border border-border/20 text-white/90",
                          "bg-card/80 backdrop-blur-sm"
                        )}
                      >
                        <span
                          className={cn(
                            "inline-block h-1.5 w-1.5 rounded-full mr-1",
                            TYPE_DOTS[ev.event_type]
                          )}
                        />
                        {ev.title}
                      </div>
                    ))}
                    {dayEvents.length > 2 && (
                      <div className="pl-1 text-[9px] text-muted-foreground font-semibold">
                        +{dayEvents.length - 2} more
                      </div>
                    )}
                  </div>

                  {/* Mobile indicator dots */}
                  <div className="flex flex-wrap gap-1 justify-center md:hidden mt-0.5">
                    {dayEvents.map((ev: Event) => (
                      <span
                        key={ev.id}
                        className={cn("h-1.5 w-1.5 rounded-full", TYPE_DOTS[ev.event_type])}
                        title={ev.title}
                      />
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
          <h3 className="text-base font-bold text-primary-foreground border-b border-border/30 pb-3">
            Events on{" "}
            {selectedDate?.toLocaleDateString("default", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </h3>

          <div className="mt-4 space-y-4 max-h-[350px] overflow-y-auto pr-1">
            <AnimatePresence mode="popLayout">
              {selectedDayEvents.length === 0 ? (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-center text-sm text-muted-foreground py-8"
                >
                  No events scheduled for this day.
                </motion.p>
              ) : (
                selectedDayEvents.map((ev: Event, i: number) => (
                  <motion.div
                    key={ev.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className={cn(
                      "group rounded-xl border border-border/40 bg-card/40 p-3 hover:border-indigo-500/40",
                      "transition-all duration-300 hover:shadow-[0_0_12px_rgba(99,102,241,0.05)]"
                    )}
                  >
                    <Link href={`/dashboard/events/${ev.id}`} className="block">
                      <div className="flex items-center justify-between gap-1.5">
                        <span
                          className={cn(
                            "rounded-full px-2 py-0.5 text-[9px] font-semibold border border-border/30",
                            "bg-card text-muted-foreground"
                          )}
                        >
                          {ev.event_type}
                        </span>
                        <span className="text-[10px] text-muted-foreground group-hover:text-indigo-400 font-medium">
                          Details &rarr;
                        </span>
                      </div>
                      <h4 className="mt-2 text-sm font-bold text-primary-foreground group-hover:text-indigo-400 transition-colors">
                        {ev.title}
                      </h4>
                      <div className="mt-3 space-y-1.5 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1.5">
                          <Clock className="h-3.5 w-3.5 text-indigo-400" />
                          <span>
                            {new Date(ev.start_date).toLocaleTimeString("default", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <MapPin className="h-3.5 w-3.5 text-indigo-400" />
                          <span className="truncate">{ev.location}</span>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-border/30 text-[10px] text-muted-foreground flex flex-wrap gap-x-3 gap-y-1.5 justify-center">
          {Object.entries(TYPE_DOTS).map(([type, dotClass]) => (
            <div key={type} className="flex items-center gap-1">
              <span className={cn("h-1.5 w-1.5 rounded-full", dotClass)} />
              <span>{type}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
