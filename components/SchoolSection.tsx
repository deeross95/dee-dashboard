"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, GraduationCap } from "lucide-react";

interface SchoolItem {
  id: number;
  type: string;
  text: string;
  completed: boolean;
  due_date: string;
}

const TYPES = [
  { value: "assignment", label: "Assignment", color: "var(--champagne)" },
  { value: "clinical", label: "Clinical", color: "var(--sage)" },
  { value: "exam", label: "Exam", color: "var(--dusty)" },
  { value: "reading", label: "Reading", color: "var(--bronze)" },
  { value: "other", label: "Other", color: "var(--fog)" },
];

export default function SchoolSection({ weekKey }: { weekKey: string }) {
  const [items, setItems] = useState<SchoolItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [newText, setNewText] = useState("");
  const [newType, setNewType] = useState("assignment");
  const [newDue, setNewDue] = useState("");

  useEffect(() => {
    setLoading(true);
    fetch(`/api/school?week=${weekKey}`)
      .then((r) => r.json())
      .then((data) => {
        setItems(data);
        setLoading(false);
      });
  }, [weekKey]);

  const addItem = async () => {
    if (!newText.trim()) return;
    const res = await fetch("/api/school", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ week_key: weekKey, type: newType, text: newText.trim(), due_date: newDue }),
    });
    const item = await res.json();
    setItems((prev) => [...prev, item]);
    setNewText("");
    setNewDue("");
  };

  const toggleItem = async (id: number, completed: boolean) => {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, completed: !completed } : i)));
    await fetch("/api/school", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, completed: !completed }),
    });
  };

  const deleteItem = async (id: number) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
    await fetch("/api/school", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
  };

  const grouped = TYPES.reduce<Record<string, SchoolItem[]>>((acc, t) => {
    acc[t.value] = items.filter((i) => i.type === t.value);
    return acc;
  }, {});

  const done = items.filter((i) => i.completed).length;
  const total = items.length;

  return (
    <div className="card h-full flex flex-col" style={{ minHeight: 320 }}>
      <div className="px-6 pt-6 pb-4">
        <div className="flex items-center justify-between mb-1">
          <p className="section-label">academics</p>
          {total > 0 && (
            <span className="font-mono text-xs" style={{ color: "var(--fog)", fontSize: "0.65rem" }}>
              {done}/{total} done
            </span>
          )}
        </div>
        <h2 className="font-display text-2xl" style={{ color: "var(--espresso)", fontWeight: 400 }}>
          School &amp; Clinical
        </h2>
        <div className="flex gap-1.5 mt-3 flex-wrap">
          {TYPES.map(({ value, label, color }) => {
            const count = grouped[value]?.length ?? 0;
            if (count === 0) return null;
            return (
              <span
                key={value}
                className="font-mono px-2 py-0.5 rounded-full"
                style={{
                  fontSize: "0.55rem",
                  letterSpacing: "0.08em",
                  background: `${color}18`,
                  color,
                  border: `1px solid ${color}40`,
                }}
              >
                {count} {label}
              </span>
            );
          })}
        </div>
      </div>

      <div className="divider mx-6" />

      <div className="flex-1 overflow-y-auto px-6 py-4">
        {loading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-8 rounded animate-pulse" style={{ background: "var(--sand)" }} />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 gap-2">
            <GraduationCap size={24} style={{ color: "var(--warm)" }} />
            <p className="font-mono text-xs text-center" style={{ color: "var(--warm)", fontSize: "0.65rem", letterSpacing: "0.05em" }}>
              no school items yet
            </p>
          </div>
        ) : (
          <div className="space-y-1">
            {items.map((item) => {
              const typeInfo = TYPES.find((t) => t.value === item.type);
              return (
                <div key={item.id} className="flex items-start gap-3 group py-1.5 px-2 rounded-sm hover:bg-cream transition-colors">
                  <button
                    onClick={() => toggleItem(item.id, item.completed)}
                    className="custom-check mt-0.5 flex-shrink-0"
                    style={
                      item.completed
                        ? { background: typeInfo?.color, borderColor: typeInfo?.color }
                        : {}
                    }
                  >
                    {item.completed && (
                      <svg width="8" height="6" viewBox="0 0 8 6" fill="none">
                        <path d="M1 3L3 5L7 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </button>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className="font-mono"
                        style={{
                          fontSize: "0.55rem",
                          letterSpacing: "0.08em",
                          color: typeInfo?.color,
                          textTransform: "uppercase",
                        }}
                      >
                        {item.type}
                      </span>
                      {item.due_date && (
                        <span className="font-mono" style={{ fontSize: "0.55rem", color: "var(--fog)" }}>
                          due {item.due_date}
                        </span>
                      )}
                    </div>
                    <span
                      className="text-sm block"
                      style={{
                        color: item.completed ? "var(--warm)" : "var(--bark)",
                        textDecoration: item.completed ? "line-through" : "none",
                      }}
                    >
                      {item.text}
                    </span>
                  </div>
                  <button
                    onClick={() => deleteItem(item.id)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity mt-0.5"
                    style={{ color: "var(--warm)" }}
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="divider mx-6" />
      <div className="px-6 py-4 space-y-2">
        <div className="flex gap-2">
          <select
            value={newType}
            onChange={(e) => setNewType(e.target.value)}
            className="input-base"
            style={{
              fontFamily: "'DM Mono', monospace",
              fontSize: "0.7rem",
              letterSpacing: "0.05em",
              color: "var(--fog)",
              width: "auto",
              cursor: "pointer",
              background: "var(--cream)",
              border: "1px solid var(--sand)",
              borderRadius: "2px",
              padding: "4px 6px",
            }}
          >
            {TYPES.map(({ value, label }) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
          <input
            value={newDue}
            onChange={(e) => setNewDue(e.target.value)}
            placeholder="Due date"
            className="input-base"
            style={{
              fontFamily: "'DM Mono', monospace",
              fontSize: "0.7rem",
              width: 90,
              color: "var(--fog)",
            }}
          />
        </div>
        <div className="flex gap-2">
          <input
            value={newText}
            onChange={(e) => setNewText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addItem()}
            placeholder="Add assignment, exam, clinical hours..."
            className="input-base text-sm flex-1"
            style={{ fontSize: "0.8125rem" }}
          />
          <button onClick={addItem} style={{ color: "var(--champagne)" }}>
            <Plus size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
