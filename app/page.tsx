"use client";

import { useState, useEffect } from "react";
import { getWeekKey, getWeekLabel, nextWeekKey, prevWeekKey } from "@/lib/weeks";
import { ChevronLeft, ChevronRight } from "lucide-react";
import TasksSection from "@/components/TasksSection";
import GymSection from "@/components/GymSection";
import FocusSection from "@/components/FocusSection";
import ReflectionsSection from "@/components/ReflectionsSection";
import ReadingSection from "@/components/ReadingSection";
import SchoolSection from "@/components/SchoolSection";

export default function Home() {
  const [weekKey, setWeekKey] = useState(() => getWeekKey(new Date()));

  const isCurrentWeek = weekKey === getWeekKey(new Date());

  return (
    <main className="min-h-screen" style={{ background: "var(--cream)" }}>
      {/* Header */}
      <header className="border-b fade-up" style={{ borderColor: "var(--sand)", background: "white" }}>
        <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
          <div>
            <p className="section-label mb-1">weekly dashboard</p>
            <h1
              className="font-display text-3xl"
              style={{ color: "var(--espresso)", fontWeight: 300, letterSpacing: "0.01em" }}
            >
              Dee&apos;s Command Center
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setWeekKey(prevWeekKey(weekKey))}
              className="p-2 rounded-full transition-colors hover:bg-sand"
              style={{ color: "var(--fog)" }}
            >
              <ChevronLeft size={18} />
            </button>
            <div className="text-center min-w-[180px]">
              <p
                className="font-mono text-xs"
                style={{ color: isCurrentWeek ? "var(--champagne)" : "var(--fog)", letterSpacing: "0.05em" }}
              >
                {isCurrentWeek ? "current week" : "past week"}
              </p>
              <p className="font-display text-lg" style={{ color: "var(--bark)", fontWeight: 400 }}>
                {getWeekLabel(weekKey)}
              </p>
            </div>
            <button
              onClick={() => setWeekKey(nextWeekKey(weekKey))}
              className="p-2 rounded-full transition-colors hover:bg-sand"
              style={{ color: "var(--fog)" }}
            >
              <ChevronRight size={18} />
            </button>
            {!isCurrentWeek && (
              <button
                onClick={() => setWeekKey(getWeekKey(new Date()))}
                className="font-mono text-xs px-3 py-1.5 rounded transition-colors"
                style={{
                  background: "var(--champagne)",
                  color: "white",
                  letterSpacing: "0.08em",
                  fontSize: "0.6rem",
                  textTransform: "uppercase",
                }}
              >
                today
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Dashboard Grid */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Top row: Focus + Gym */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-5">
          <div className="lg:col-span-2 fade-up-delay-1">
            <FocusSection weekKey={weekKey} />
          </div>
          <div className="fade-up-delay-2">
            <GymSection weekKey={weekKey} />
          </div>
        </div>

        {/* Middle row: Tasks + School */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
          <div className="fade-up-delay-3">
            <TasksSection weekKey={weekKey} />
          </div>
          <div className="fade-up-delay-4">
            <SchoolSection weekKey={weekKey} />
          </div>
        </div>

        {/* Bottom row: Reflections + Reading */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2 fade-up-delay-5">
            <ReflectionsSection weekKey={weekKey} />
          </div>
          <div className="fade-up-delay-6">
            <ReadingSection weekKey={weekKey} />
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="text-center py-8">
        <p className="font-mono" style={{ color: "var(--warm)", fontSize: "0.6rem", letterSpacing: "0.1em" }}>
          week of {weekKey}
        </p>
      </footer>
    </main>
  );
}
