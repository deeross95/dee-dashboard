"use client";

import { useState, useEffect } from "react";
import { getWeekKey, getWeekLabel, nextWeekKey, prevWeekKey } from "@/lib/weeks";
import { ChevronLeft, ChevronRight, LayoutGrid, CheckSquare, Star, Map, CalendarDays, BookMarked } from "lucide-react";
import TasksSection from "@/components/TasksSection";
import GymSection from "@/components/GymSection";
import FocusSection from "@/components/FocusSection";
import ReflectionsSection from "@/components/ReflectionsSection";
import ReadingSection from "@/components/ReadingSection";
import SchoolSection from "@/components/SchoolSection";
import HabitsSection from "@/components/habits/HabitsSection";
import BucketListSection from "@/components/bucket/BucketListSection";
import YearlyVisionSection from "@/components/yearly/YearlyVisionSection";
import CalendarSection from "@/components/calendar/CalendarSection";

const TABS = [
  { id: "weekly", label: "Weekly", icon: LayoutGrid },
  { id: "habits", label: "Habits", icon: CheckSquare },
  { id: "calendar", label: "Calendar", icon: CalendarDays },
  { id: "bucket", label: "Bucket List", icon: Map },
  { id: "yearly", label: "Year Vision", icon: Star },
];

export default function Home() {
  const [tab, setTab] = useState("weekly");
  const [weekKey, setWeekKey] = useState(() => getWeekKey(new Date()));
  const isCurrentWeek = weekKey === getWeekKey(new Date());

  return (
    <main className="min-h-screen" style={{ background: "var(--cream)" }}>
      {/* Header */}
      <header style={{ background: "white", borderBottom: "1px solid var(--sand)" }}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center gap-4">
              <div>
                <p className="section-label mb-0.5">personal dashboard</p>
                <h1 className="font-display text-2xl" style={{ color: "var(--espresso)", fontWeight: 400, letterSpacing: "0.01em" }}>
                  Dee&apos;s Command Center
                </h1>
              </div>
              {/* Soft pink decorative dot */}
              <div className="hidden md:flex items-center gap-1.5 ml-2">
                <div className="w-2 h-2 rounded-full pulse-dot" style={{ background: "var(--blush)" }} />
                <div className="w-1.5 h-1.5 rounded-full pulse-dot" style={{ background: "var(--rose)", animationDelay: "0.3s" }} />
                <div className="w-1 h-1 rounded-full pulse-dot" style={{ background: "var(--mauve)", animationDelay: "0.6s" }} />
              </div>
            </div>

            {/* Week nav ‚Äî only show on weekly/habits/calendar tabs */}
            {(tab === "weekly" || tab === "habits" || tab === "calendar") && (
              <div className="flex items-center gap-3">
                <button onClick={() => setWeekKey(prevWeekKey(weekKey))} className="p-1.5 rounded-full hover:bg-parchment transition-colors" style={{ color: "var(--fog)" }}>
                  <ChevronLeft size={16} />
                </button>
                <div className="text-center" style={{ minWidth: 160 }}>
                  <p className="font-mono" style={{ fontSize: "0.55rem", color: isCurrentWeek ? "var(--rose)" : "var(--fog)", letterSpacing: "0.08em", textTransform: "uppercase" }}>
                    {isCurrentWeek ? "this week" : "past week"}
                  </p>
                  <p className="font-display text-base" style={{ color: "var(--bark)", fontWeight: 400 }}>
                    {getWeekLabel(weekKey)}
                  </p>
                </div>
                <button onClick={() => setWeekKey(nextWeekKey(weekKey))} className="p-1.5 rounded-full hover:bg-parchment transition-colors" style={{ color: "var(--fog)" }}>
                  <ChevronRight size={16} />
                </button>
                {!isCurrentWeek && (
                  <button onClick={() => setWeekKey(getWeekKey(new Date()))} className="font-mono px-2.5 py-1 rounded transition-colors" style={{ background: "var(--blush)", color: "var(--dusty-rose)", fontSize: "0.55rem", letterSpacing: "0.1em", textTransform: "uppercase" }}>
                    today
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Tab bar */}
          <nav className="flex gap-1 -mb-px">
            {TABS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setTab(id)}
                className={`flex items-center gap-1.5 px-4 py-3 text-xs font-mono transition-all ${tab === id ? "tab-active" : ""}`}
                style={{
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  color: tab === id ? "var(--espresso)" : "var(--fog)",
                  borderBottom: tab === id ? "2px solid var(--rose)" : "2px solid transparent",
                }}
              >
                <Icon size={13} />
                {label}
              </button>
            ))}
          </nav>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-7">
        {tab === "weekly" && <WeeklyTab weekKey={weekKey} />}
        {tab === "habits" && <HabitsSection weekKey={weekKey} />}
        {tab === "calendar" && <CalendarSection weekKey={weekKey} />}
        {tab === "bucket" && <BucketListSection />}
        {tab === "yearly" && <YearlyVisionSection />}
      </div>

      <footer className="text-center py-6">
        <p className="font-mono" style={{ color: "var(--warm)", fontSize: "0.55rem", letterSpacing: "0.12em" }}>
          week of {weekKey} ¬∑ made with intention
        </p>
      </footer>
    </main>
  );
}

function WeeklyTab({ weekKey }: { weekKey: string }) {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 fade-up-delay-1"><FocusSection weekKey={weekKey} /></div>
        <div className="fade-up-delay-2"><GymSection weekKey={weekKey} /></div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="fade-up-delay-3"><TasksSection weekKey={weekKey} /></div>
        <div className="fade-up-delay-4"><SchoolSection weekKey={weekKey} /></div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 fade-up-delay-5"><ReflectionsSection weekKey={weekKey} /></div>
        <div className="fade-up-delay-6"><ReadingSection weekKey={weekKey} /></div>
      </div>
    </div>
  );
}

