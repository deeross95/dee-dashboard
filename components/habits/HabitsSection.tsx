"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, Settings, ChevronLeft, ChevronRight } from "lucide-react";
import { getWeekKey, prevWeekKey, nextWeekKey } from "@/lib/weeks";
import { format, startOfQuarter, addWeeks, subWeeks } from "date-fns";

interface Habit { id: number; name: string; icon: string; color: string; section: string; weekly_goal: number; }
interface Completion { habit_id: number; week_key: string; day_of_week: number; completed: boolean; }

const DAYS_SHORT = ["M","T","W","T","F","S","S"];
const DAYS_FULL = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];

const DEFAULT_HABITS = [
  { name: "Water (8 cups)", icon: "💧", color: "#7ab8d4", section: "daily", weekly_goal: 7 },
  { name: "Move / Exercise", icon: "🏃", color: "#7a8c72", section: "daily", weekly_goal: 5 },
  { name: "Protein goal", icon: "🥩", color: "#c4714a", section: "daily", weekly_goal: 7 },
  { name: "Skincare routine", icon: "✨", color: "#e8a89e", section: "daily", weekly_goal: 7 },
  { name: "Sleep 7+ hrs", icon: "🌙", color: "#9b8a9e", section: "daily", weekly_goal: 6 },
  { name: "No phone AM", icon: "🌅", color: "#c9a96e", section: "daily", weekly_goal: 5 },
  { name: "Scripture / Prayer", icon: "📖", color: "#b8a8c4", section: "devotional", weekly_goal: 7 },
  { name: "Journaling", icon: "✍️", color: "#f2cfc8", section: "devotional", weekly_goal: 5 },
  { name: "Gratitude", icon: "🌸", color: "#d4857a", section: "devotional", weekly_goal: 7 },
  { name: "Intentional stillness", icon: "🕊️", color: "#7a8c72", section: "devotional", weekly_goal: 5 },
];

const ICON_OPTIONS = ["💧","🏃","🥩","✨","🌙","🌅","📖","✍️","🌸","🕊️","💪","🧘","🎯","📚","🍵","🥗","💆","🏋️","🧴","💊","🫀","🌿","🔔","⭐","🙏","❤️","🎶","🧠","👟","🥦"];
const COLOR_OPTIONS = ["#e8a89e","#f2cfc8","#d4857a","#c4898a","#7a8c72","#c9a96e","#9b8a9e","#b8a8c4","#c4714a","#7ab8d4","#a0c4a8","#e8c49e","#8b7d6b","#b8c4a8","#d4c4b0"];

export default function HabitsSection({ weekKey }: { weekKey: string }) {
  const [view, setView] = useState<"week"|"quarter">("week");
  const [habits, setHabits] = useState<Habit[]>([]);
  const [completions, setCompletions] = useState<Completion[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [newHabit, setNewHabit] = useState({ name: "", icon: "✨", color: "#e8a89e", section: "daily", weekly_goal: 7 });
  const [quarterWeeks, setQuarterWeeks] = useState<string[]>([]);
  const [quarterCompletions, setQuarterCompletions] = useState<Completion[]>([]);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/habits?week=${weekKey}`).then(r => r.json()).then(({ habits: h, completions: c }) => {
      setHabits(h);
      setCompletions(c);
      setLoading(false);
    });
  }, [weekKey]);

  useEffect(() => {
    if (view === "quarter") {
      const now = new Date(weekKey + "T12:00:00");
      const qStart = startOfQuarter(now);
      const weeks: string[] = [];
      let cur = qStart;
      while (cur <= now) {
        weeks.push(getWeekKey(cur));
        cur = addWeeks(cur, 1);
      }
      setQuarterWeeks(weeks);
      fetch(`/api/habits?view=quarter&start=${getWeekKey(qStart)}`).then(r => r.json()).then(({ habits: h, completions: c }) => {
        setHabits(h);
        setQuarterCompletions(c);
      });
    }
  }, [view, weekKey]);

  const isCompleted = (habitId: number, day: number) =>
    completions.some(c => c.habit_id === habitId && c.day_of_week === day && c.completed);

  const toggle = async (habitId: number, day: number) => {
    const current = isCompleted(habitId, day);
    const newVal = !current;
    setCompletions(prev => {
      const filtered = prev.filter(c => !(c.habit_id === habitId && c.day_of_week === day));
      return [...filtered, { habit_id: habitId, week_key: weekKey, day_of_week: day, completed: newVal }];
    });
    await fetch("/api/habits", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "toggle", habit_id: habitId, week_key: weekKey, day_of_week: day, completed: newVal }),
    });
  };

  const addHabit = async () => {
    if (!newHabit.name.trim()) return;
    const res = await fetch("/api/habits", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "create", ...newHabit }),
    });
    const habit = await res.json();
    setHabits(prev => [...prev, habit]);
    setNewHabit({ name: "", icon: "✨", color: "#e8a89e", section: "daily", weekly_goal: 7 });
    setShowAdd(false);
  };

  const deleteHabit = async (id: number) => {
    setHabits(prev => prev.filter(h => h.id !== id));
    await fetch("/api/habits", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "delete", id }) });
  };

  const seedDefaults = async () => {
    for (const h of DEFAULT_HABITS) {
      const res = await fetch("/api/habits", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "create", ...h }) });
      const habit = await res.json();
      setHabits(prev => [...prev, habit]);
    }
  };

  // Score calculation
  const totalPossible = habits.reduce((acc, h) => acc + h.weekly_goal, 0);
  const totalDone = habits.reduce((acc, h) => {
    const done = [0,1,2,3,4,5,6].filter(d => isCompleted(h.id, d)).length;
    return acc + Math.min(done, h.weekly_goal);
  }, 0);
  const scorePercent = totalPossible > 0 ? Math.round((totalDone / totalPossible) * 100) : 0;

  const daily = habits.filter(h => h.section === "daily");
  const devotional = habits.filter(h => h.section === "devotional");

  // Quarter stats per habit per week
  const getQuarterCellCount = (habitId: number, wk: string) =>
    quarterCompletions.filter(c => c.habit_id === habitId && c.week_key === wk && c.completed).length;

  return (
    <div className="space-y-5">
      {/* Header card */}
      <div className="card px-6 py-5">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <p className="section-label mb-1">habit tracker</p>
            <h2 className="font-display text-3xl" style={{ color: "var(--espresso)", fontWeight: 400 }}>Habits &amp; Rituals</h2>
          </div>
          <div className="flex items-center gap-4">
            {/* Score ring */}
            <div className="relative flex items-center justify-center" style={{ width: 72, height: 72 }}>
              <svg width="72" height="72" viewBox="0 0 72 72">
                <circle cx="36" cy="36" r="30" fill="none" stroke="var(--sand)" strokeWidth="5" />
                <circle cx="36" cy="36" r="30" fill="none" stroke="var(--rose)" strokeWidth="5"
                  strokeDasharray="188.5"
                  strokeDashoffset={188.5 - (188.5 * scorePercent / 100)}
                  strokeLinecap="round"
                  transform="rotate(-90 36 36)"
                  style={{ transition: "stroke-dashoffset 0.8s ease" }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="font-display text-xl" style={{ color: "var(--espresso)", fontWeight: 500, lineHeight: 1 }}>{scorePercent}%</span>
                <span className="font-mono" style={{ fontSize: "0.45rem", color: "var(--fog)", letterSpacing: "0.08em" }}>WEEKLY</span>
              </div>
            </div>
            {/* View toggle */}
            <div className="flex rounded overflow-hidden" style={{ border: "1px solid var(--sand)" }}>
              {(["week","quarter"] as const).map(v => (
                <button key={v} onClick={() => setView(v)}
                  className="px-3 py-1.5 font-mono transition-colors"
                  style={{ fontSize: "0.6rem", letterSpacing: "0.08em", textTransform: "uppercase",
                    background: view === v ? "var(--rose)" : "white",
                    color: view === v ? "white" : "var(--fog)" }}>
                  {v}
                </button>
              ))}
            </div>
            <button onClick={() => setShowAdd(s => !s)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded font-mono transition-colors"
              style={{ background: "var(--petal)", color: "var(--dusty-rose)", fontSize: "0.6rem", letterSpacing: "0.08em" }}>
              <Plus size={12} /> add habit
            </button>
          </div>
        </div>

        {/* Add habit form */}
        {showAdd && (
          <div className="mt-5 pt-5 border-t" style={{ borderColor: "var(--sand)" }}>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div>
                <p className="section-label-neutral mb-1.5">name</p>
                <input value={newHabit.name} onChange={e => setNewHabit(p => ({...p, name: e.target.value}))}
                  placeholder="Habit name" className="input-base text-sm" style={{ border: "1px solid var(--sand)", borderRadius: 2, padding: "6px 8px" }} />
              </div>
              <div>
                <p className="section-label-neutral mb-1.5">section</p>
                <select value={newHabit.section} onChange={e => setNewHabit(p => ({...p, section: e.target.value}))}
                  className="input-base text-sm w-full" style={{ border: "1px solid var(--sand)", borderRadius: 2, padding: "6px 8px", cursor: "pointer" }}>
                  <option value="daily">Daily</option>
                  <option value="devotional">Devotional</option>
                </select>
              </div>
              <div>
                <p className="section-label-neutral mb-1.5">weekly goal (days)</p>
                <input type="number" min={1} max={7} value={newHabit.weekly_goal}
                  onChange={e => setNewHabit(p => ({...p, weekly_goal: parseInt(e.target.value)||7}))}
                  className="input-base text-sm" style={{ border: "1px solid var(--sand)", borderRadius: 2, padding: "6px 8px" }} />
              </div>
              <div className="flex gap-2 items-end">
                <button onClick={addHabit}
                  className="flex-1 py-1.5 rounded font-mono text-xs transition-colors"
                  style={{ background: "var(--rose)", color: "white", letterSpacing: "0.05em" }}>
                  Save
                </button>
                <button onClick={() => setShowAdd(false)} className="flex-1 py-1.5 rounded font-mono text-xs" style={{ background: "var(--sand)", color: "var(--fog)", letterSpacing: "0.05em" }}>Cancel</button>
              </div>
            </div>
            <div className="mt-3">
              <p className="section-label-neutral mb-2">icon</p>
              <div className="flex flex-wrap gap-1">
                {ICON_OPTIONS.map(ic => (
                  <button key={ic} onClick={() => setNewHabit(p => ({...p, icon: ic}))}
                    className="w-8 h-8 rounded text-lg flex items-center justify-center transition-all"
                    style={{ background: newHabit.icon === ic ? "var(--blush)" : "var(--cream)", border: newHabit.icon === ic ? "1.5px solid var(--rose)" : "1.5px solid transparent", transform: newHabit.icon === ic ? "scale(1.2)" : "scale(1)" }}>
                    {ic}
                  </button>
                ))}
              </div>
            </div>
            <div className="mt-3">
              <p className="section-label-neutral mb-2">color</p>
              <div className="flex flex-wrap gap-1.5">
                {COLOR_OPTIONS.map(c => (
                  <button key={c} onClick={() => setNewHabit(p => ({...p, color: c}))}
                    className="w-6 h-6 rounded-full transition-all"
                    style={{ background: c, border: newHabit.color === c ? "2px solid var(--espresso)" : "2px solid transparent", transform: newHabit.color === c ? "scale(1.3)" : "scale(1)" }} />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Weekly or Quarterly view */}
      {view === "week" ? (
        <WeekGrid habits={habits} daily={daily} devotional={devotional} isCompleted={isCompleted} toggle={toggle} deleteHabit={deleteHabit} loading={loading} habits_empty_callback={seedDefaults} />
      ) : (
        <QuarterView habits={habits} quarterWeeks={quarterWeeks} getCount={getQuarterCellCount} />
      )}

      {/* Summary cards */}
      {view === "week" && habits.length > 0 && (
        <SummaryCards habits={habits} isCompleted={isCompleted} />
      )}
    </div>
  );
}

function WeekGrid({ habits, daily, devotional, isCompleted, toggle, deleteHabit, loading, habits_empty_callback }: any) {
  if (loading) return <div className="card p-6"><div className="shimmer h-64" /></div>;

  if (habits.length === 0) {
    return (
      <div className="card p-12 text-center">
        <p className="font-display text-2xl mb-2" style={{ color: "var(--espresso)", fontWeight: 300 }}>No habits yet</p>
        <p className="text-sm mb-6" style={{ color: "var(--fog)" }}>Add your first habit above, or load a curated starter set.</p>
        <button onClick={habits_empty_callback} className="font-mono px-4 py-2 rounded" style={{ background: "var(--blush)", color: "var(--dusty-rose)", fontSize: "0.7rem", letterSpacing: "0.08em" }}>
          Load starter habits
        </button>
      </div>
    );
  }

  const renderSection = (section: string, items: any[]) => (
    <div>
      <div className="px-4 py-2" style={{ background: "var(--parchment)", borderBottom: "1px solid var(--sand)" }}>
        <span className="font-mono" style={{ fontSize: "0.6rem", letterSpacing: "0.14em", textTransform: "uppercase", color: section === "daily" ? "var(--champagne)" : "var(--lavender)" }}>
          {section === "daily" ? "✦ Daily Habits" : "✿ Devotional"}
        </span>
      </div>
      {items.map(habit => {
        const doneDays = [0,1,2,3,4,5,6].filter(d => isCompleted(habit.id, d)).length;
        const metGoal = doneDays >= habit.weekly_goal;
        return (
          <div key={habit.id} className="flex items-center group border-b" style={{ borderColor: "var(--sand)" }}>
            {/* Habit info */}
            <div className="flex items-center gap-2 px-4 py-2.5 flex-shrink-0" style={{ width: 220 }}>
              <span className="text-lg">{habit.icon}</span>
              <div className="min-w-0">
                <p className="text-sm truncate" style={{ color: "var(--bark)", fontWeight: 400 }}>{habit.name}</p>
                <p className="font-mono" style={{ fontSize: "0.55rem", color: metGoal ? habit.color : "var(--fog)", letterSpacing: "0.06em" }}>
                  {doneDays}/{habit.weekly_goal} {metGoal ? "✓ goal met" : "days"}
                </p>
              </div>
              <button onClick={() => deleteHabit(habit.id)} className="ml-auto opacity-0 group-hover:opacity-60 transition-opacity" style={{ color: "var(--fog)" }}>
                <Trash2 size={11} />
              </button>
            </div>
            {/* Day cells */}
            {[0,1,2,3,4,5,6].map(day => {
              const done = isCompleted(habit.id, day);
              return (
                <div key={day} className="flex-1 flex items-center justify-center py-2">
                  <button
                    onClick={() => toggle(habit.id, day)}
                    className="habit-cell"
                    style={{
                      background: done ? habit.color : "var(--cream)",
                      borderColor: done ? habit.color : "var(--sand)",
                      opacity: done ? 1 : 0.7,
                      boxShadow: done ? `0 2px 8px ${habit.color}60` : "none",
                    }}
                  >
                    {done && <svg width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 4L4 7L9 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                  </button>
                </div>
              );
            })}
            {/* Mini bar */}
            <div className="px-3 flex-shrink-0" style={{ width: 60 }}>
              <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "var(--sand)" }}>
                <div className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(doneDays / habit.weekly_goal, 1) * 100}%`, background: habit.color }} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );

  return (
    <div className="card overflow-hidden">
      {/* Day header */}
      <div className="flex border-b" style={{ borderColor: "var(--sand)" }}>
        <div style={{ width: 220, flexShrink: 0 }} className="px-4 py-3">
          <span className="section-label-neutral">habit</span>
        </div>
        {DAYS_FULL.map((d, i) => (
          <div key={d} className="flex-1 flex flex-col items-center py-2">
            <span className="font-mono" style={{ fontSize: "0.55rem", color: "var(--fog)", letterSpacing: "0.08em" }}>{d}</span>
          </div>
        ))}
        <div style={{ width: 60, flexShrink: 0 }} />
      </div>
      {daily.length > 0 && renderSection("daily", daily)}
      {devotional.length > 0 && renderSection("devotional", devotional)}
    </div>
  );
}

function QuarterView({ habits, quarterWeeks, getCount }: any) {
  if (!quarterWeeks.length) return <div className="card p-8 text-center shimmer h-40" />;
  return (
    <div className="card overflow-auto">
      <div className="p-4 border-b" style={{ borderColor: "var(--sand)" }}>
        <p className="section-label">quarterly overview</p>
        <p className="font-display text-xl mt-1" style={{ color: "var(--espresso)", fontWeight: 400 }}>
          {format(new Date(quarterWeeks[0] + "T12:00:00"), "MMMM")} — {format(new Date(quarterWeeks[quarterWeeks.length-1] + "T12:00:00"), "MMMM yyyy")}
        </p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full" style={{ minWidth: 600 }}>
          <thead>
            <tr>
              <th className="text-left px-4 py-2 font-mono" style={{ fontSize: "0.6rem", color: "var(--fog)", letterSpacing: "0.08em", fontWeight: 400, width: 200 }}>HABIT</th>
              {quarterWeeks.map((wk: string) => (
                <th key={wk} className="text-center px-1 py-2 font-mono" style={{ fontSize: "0.55rem", color: "var(--fog)", letterSpacing: "0.06em", fontWeight: 400 }}>
                  {format(new Date(wk + "T12:00:00"), "MMM d")}
                </th>
              ))}
              <th className="text-center px-2 font-mono" style={{ fontSize: "0.55rem", color: "var(--fog)", letterSpacing: "0.06em", fontWeight: 400 }}>AVG</th>
            </tr>
          </thead>
          <tbody>
            {habits.map((habit: Habit) => {
              const weekCounts = quarterWeeks.map((wk: string) => getCount(habit.id, wk));
              const avg = quarterWeeks.length ? Math.round(weekCounts.reduce((a: number, b: number) => a+b, 0) / quarterWeeks.length * 10) / 10 : 0;
              return (
                <tr key={habit.id} className="border-t" style={{ borderColor: "var(--sand)" }}>
                  <td className="px-4 py-2">
                    <div className="flex items-center gap-2">
                      <span>{habit.icon}</span>
                      <span className="text-sm" style={{ color: "var(--bark)" }}>{habit.name}</span>
                    </div>
                  </td>
                  {quarterWeeks.map((wk: string) => {
                    const count = getCount(habit.id, wk);
                    const pct = count / 7;
                    const bg = pct >= 1 ? habit.color : pct >= 0.6 ? `${habit.color}aa` : pct >= 0.3 ? `${habit.color}55` : "var(--cream)";
                    return (
                      <td key={wk} className="text-center px-1 py-2">
                        <div className="w-8 h-8 rounded mx-auto flex items-center justify-center font-mono"
                          style={{ background: bg, fontSize: "0.6rem", color: pct > 0.5 ? "white" : "var(--fog)" }}>
                          {count > 0 ? count : ""}
                        </div>
                      </td>
                    );
                  })}
                  <td className="text-center px-2">
                    <span className="font-mono" style={{ fontSize: "0.65rem", color: habit.color, fontWeight: 400 }}>{avg}</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function SummaryCards({ habits, isCompleted }: any) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
      {habits.map((habit: Habit) => {
        const done = [0,1,2,3,4,5,6].filter(d => isCompleted(habit.id, d)).length;
        const pct = Math.round((Math.min(done, habit.weekly_goal) / habit.weekly_goal) * 100);
        const met = done >= habit.weekly_goal;
        return (
          <div key={habit.id} className="card px-4 py-3 flex flex-col gap-2" style={{ borderLeft: `3px solid ${habit.color}` }}>
            <div className="flex items-center gap-2">
              <span className="text-xl">{habit.icon}</span>
              <div>
                <p className="text-xs font-medium truncate" style={{ color: "var(--bark)" }}>{habit.name}</p>
                <p className="font-mono" style={{ fontSize: "0.55rem", color: met ? habit.color : "var(--fog)", letterSpacing: "0.05em" }}>
                  {done}/{habit.weekly_goal} {met ? "✓" : ""}
                </p>
              </div>
            </div>
            <div className="h-1 rounded-full overflow-hidden" style={{ background: "var(--sand)" }}>
              <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: habit.color }} />
            </div>
            <p className="font-mono text-right" style={{ fontSize: "0.6rem", color: met ? habit.color : "var(--fog)" }}>{pct}%</p>
          </div>
        );
      })}
    </div>
  );
}
