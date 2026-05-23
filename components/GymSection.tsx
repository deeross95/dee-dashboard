"use client";

import { useState, useEffect } from "react";
import { DAYS } from "@/lib/weeks";
import { Dumbbell } from "lucide-react";

interface GymSession {
  id: number;
  day_of_week: number;
  completed: boolean;
  notes: string;
}

export default function GymSection({ weekKey }: { weekKey: string }) {
  const [sessions, setSessions] = useState<Record<number, GymSession>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/gym?week=${weekKey}`)
      .then((r) => r.json())
      .then((data: GymSession[]) => {
        const map: Record<number, GymSession> = {};
        data.forEach((s) => (map[s.day_of_week] = s));
        setSessions(map);
        setLoading(false);
      });
  }, [weekKey]);

  const toggleDay = async (dayIndex: number) => {
    const current = sessions[dayIndex];
    const newCompleted = !current?.completed;

    setSessions((prev) => ({
      ...prev,
      [dayIndex]: { ...(prev[dayIndex] || { id: 0, notes: "" }), day_of_week: dayIndex, completed: newCompleted },
    }));

    const res = await fetch("/api/gym", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ week_key: weekKey, day_of_week: dayIndex, completed: newCompleted }),
    });
    const session = await res.json();
    setSessions((prev) => ({ ...prev, [dayIndex]: session }));
  };

  const completedCount = Object.values(sessions).filter((s) => s.completed).length;

  return (
    <div className="card h-full flex flex-col" style={{ minHeight: 320 }}>
      <div className="px-6 pt-6 pb-4">
        <div className="flex items-center justify-between mb-1">
          <p className="section-label">fitness</p>
          <span className="font-mono text-xs" style={{ color: "var(--sage)", fontSize: "0.65rem" }}>
            {completedCount} sessions
          </span>
        </div>
        <h2 className="font-display text-2xl" style={{ color: "var(--espresso)", fontWeight: 400 }}>
          Gym Tracker
        </h2>
      </div>

      <div className="divider mx-6" />

      <div className="flex-1 px-6 py-5">
        {loading ? (
          <div className="grid grid-cols-7 gap-2">
            {DAYS.map((_, i) => (
              <div key={i} className="h-16 rounded animate-pulse" style={{ background: "var(--sand)" }} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-7 gap-2">
            {DAYS.map((day, i) => {
              const session = sessions[i];
              const done = session?.completed;
              return (
                <button
                  key={day}
                  onClick={() => toggleDay(i)}
                  className="flex flex-col items-center gap-2 py-3 rounded-sm transition-all duration-200 group"
                  style={{
                    background: done ? "var(--sage)" : "var(--cream)",
                    border: `1px solid ${done ? "var(--sage)" : "var(--sand)"}`,
                    color: done ? "white" : "var(--fog)",
                  }}
                >
                  <Dumbbell
                    size={14}
                    style={{
                      opacity: done ? 1 : 0.4,
                      color: done ? "white" : "var(--sage)",
                      transition: "all 0.2s",
                    }}
                  />
                  <span
                    className="font-mono"
                    style={{
                      fontSize: "0.55rem",
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                      fontWeight: done ? 400 : 300,
                    }}
                  >
                    {day}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        <div className="mt-5">
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5, 6, 7].map((n) => (
              <div
                key={n}
                className="h-1.5 flex-1 rounded-full transition-all duration-300"
                style={{
                  background: n <= completedCount ? "var(--sage)" : "var(--sand)",
                }}
              />
            ))}
          </div>
          <p className="font-mono text-xs mt-2 text-center" style={{ color: "var(--fog)", fontSize: "0.6rem", letterSpacing: "0.05em" }}>
            {completedCount === 0
              ? "no sessions logged yet"
              : completedCount === 7
              ? "full week — incredible"
              : `${7 - completedCount} day${7 - completedCount !== 1 ? "s" : ""} remaining`}
          </p>
        </div>
      </div>
    </div>
  );
}
