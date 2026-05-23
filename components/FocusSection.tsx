"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2 } from "lucide-react";

interface Goal {
  id: number;
  text: string;
  completed: boolean;
}

interface Focus {
  focus_statement: string;
}

export default function FocusSection({ weekKey }: { weekKey: string }) {
  const [focus, setFocus] = useState("");
  const [goals, setGoals] = useState<Goal[]>([]);
  const [newGoal, setNewGoal] = useState("");
  const [loading, setLoading] = useState(true);
  const [savingFocus, setSavingFocus] = useState(false);
  const [focusTimeout, setFocusTimeout] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/focus?week=${weekKey}`)
      .then((r) => r.json())
      .then(({ focus: f, goals: g }) => {
        setFocus(f?.focus_statement ?? "");
        setGoals(g ?? []);
        setLoading(false);
      });
  }, [weekKey]);

  const updateFocus = (value: string) => {
    setFocus(value);
    if (focusTimeout) clearTimeout(focusTimeout);
    const t = setTimeout(async () => {
      setSavingFocus(true);
      await fetch("/api/focus", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ week_key: weekKey, focus_statement: value }),
      });
      setSavingFocus(false);
    }, 800);
    setFocusTimeout(t);
  };

  const addGoal = async () => {
    if (!newGoal.trim()) return;
    const res = await fetch("/api/focus", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ week_key: weekKey, text: newGoal.trim() }),
    });
    const goal = await res.json();
    setGoals((prev) => [...prev, goal]);
    setNewGoal("");
  };

  const toggleGoal = async (id: number, completed: boolean) => {
    setGoals((prev) => prev.map((g) => (g.id === id ? { ...g, completed: !completed } : g)));
    await fetch("/api/focus", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, completed: !completed }),
    });
  };

  const deleteGoal = async (id: number) => {
    setGoals((prev) => prev.filter((g) => g.id !== id));
    await fetch("/api/focus", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
  };

  return (
    <div className="card h-full flex flex-col" style={{ minHeight: 320 }}>
      <div className="px-6 pt-6 pb-4">
        <p className="section-label mb-1">intention</p>
        <h2 className="font-display text-2xl" style={{ color: "var(--espresso)", fontWeight: 400 }}>
          Weekly Focus &amp; Goals
        </h2>
      </div>

      <div className="divider mx-6" />

      <div className="flex-1 px-6 py-5 flex gap-6">
        {/* Focus statement */}
        <div className="flex-1 border-r pr-6" style={{ borderColor: "var(--sand)" }}>
          <div className="flex items-center justify-between mb-3">
            <p className="section-label">this week i&apos;m focused on</p>
            {savingFocus && (
              <span className="font-mono" style={{ fontSize: "0.55rem", color: "var(--warm)", letterSpacing: "0.08em" }}>
                saving...
              </span>
            )}
          </div>
          {loading ? (
            <div className="h-24 rounded animate-pulse" style={{ background: "var(--sand)" }} />
          ) : (
            <textarea
              value={focus}
              onChange={(e) => updateFocus(e.target.value)}
              placeholder="What's the one thing that matters most this week?"
              className="input-base"
              rows={5}
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: "1.125rem",
                fontWeight: 400,
                fontStyle: focus ? "normal" : "italic",
                lineHeight: 1.5,
                color: focus ? "var(--espresso)" : "var(--warm)",
              }}
            />
          )}
        </div>

        {/* Goals */}
        <div className="flex-1 flex flex-col">
          <p className="section-label mb-3">specific goals</p>
          <div className="flex-1 space-y-1 overflow-y-auto">
            {loading ? (
              <div className="space-y-2">
                {[1, 2].map((i) => (
                  <div key={i} className="h-7 rounded animate-pulse" style={{ background: "var(--sand)" }} />
                ))}
              </div>
            ) : goals.length === 0 ? (
              <p className="font-mono text-xs" style={{ color: "var(--warm)", fontSize: "0.65rem", letterSpacing: "0.05em" }}>
                add your goals below
              </p>
            ) : (
              goals.map((goal) => (
                <div key={goal.id} className="flex items-center gap-2 group py-1">
                  <button
                    onClick={() => toggleGoal(goal.id, goal.completed)}
                    className="custom-check"
                    style={
                      goal.completed
                        ? { background: "var(--dusty)", borderColor: "var(--dusty)" }
                        : {}
                    }
                  >
                    {goal.completed && (
                      <svg width="8" height="6" viewBox="0 0 8 6" fill="none">
                        <path d="M1 3L3 5L7 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </button>
                  <span
                    className="flex-1 text-sm"
                    style={{
                      color: goal.completed ? "var(--warm)" : "var(--bark)",
                      textDecoration: goal.completed ? "line-through" : "none",
                    }}
                  >
                    {goal.text}
                  </span>
                  <button
                    onClick={() => deleteGoal(goal.id)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{ color: "var(--warm)" }}
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              ))
            )}
          </div>
          <div className="mt-3 flex gap-2">
            <input
              value={newGoal}
              onChange={(e) => setNewGoal(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addGoal()}
              placeholder="Add a goal..."
              className="input-base text-sm flex-1"
              style={{ fontSize: "0.8125rem" }}
            />
            <button onClick={addGoal} style={{ color: "var(--dusty)" }}>
              <Plus size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
