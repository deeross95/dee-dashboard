"use client";

import { useState, useEffect, useRef } from "react";
import { Plus, Trash2, CheckSquare } from "lucide-react";

interface Task {
  id: number;
  text: string;
  completed: boolean;
}

export default function TasksSection({ weekKey }: { weekKey: string }) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState("");
  const [loading, setLoading] = useState(true);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/tasks?week=${weekKey}`)
      .then((r) => r.json())
      .then((data) => {
        setTasks(data);
        setLoading(false);
      });
  }, [weekKey]);

  const addTask = async () => {
    if (!newTask.trim()) return;
    const res = await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ week_key: weekKey, text: newTask.trim() }),
    });
    const task = await res.json();
    setTasks((prev) => [...prev, task]);
    setNewTask("");
  };

  const toggleTask = async (id: number, completed: boolean) => {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, completed: !completed } : t)));
    await fetch("/api/tasks", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, completed: !completed }),
    });
  };

  const deleteTask = async (id: number) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
    await fetch("/api/tasks", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
  };

  const done = tasks.filter((t) => t.completed).length;
  const total = tasks.length;

  return (
    <div className="card h-full flex flex-col" style={{ minHeight: 320 }}>
      <div className="px-6 pt-6 pb-4">
        <div className="flex items-center justify-between mb-1">
          <p className="section-label">tasks</p>
          {total > 0 && (
            <span className="font-mono text-xs" style={{ color: "var(--fog)", fontSize: "0.65rem" }}>
              {done}/{total}
            </span>
          )}
        </div>
        <h2 className="font-display text-2xl" style={{ color: "var(--espresso)", fontWeight: 400 }}>
          This Week&apos;s Checklist
        </h2>
        {total > 0 && (
          <div className="mt-3 h-1 rounded-full overflow-hidden" style={{ background: "var(--sand)" }}>
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${(done / total) * 100}%`,
                background: "linear-gradient(to right, var(--champagne), var(--bronze))",
              }}
            />
          </div>
        )}
      </div>

      <div className="divider mx-6" />

      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-1">
        {loading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-8 rounded animate-pulse" style={{ background: "var(--sand)" }} />
            ))}
          </div>
        ) : tasks.length === 0 ? (
          <p className="font-mono text-xs py-4 text-center" style={{ color: "var(--warm)", letterSpacing: "0.05em" }}>
            nothing here yet
          </p>
        ) : (
          tasks.map((task) => (
            <div
              key={task.id}
              className="flex items-center gap-3 group py-1.5 px-2 rounded-sm transition-colors hover:bg-cream"
            >
              <button
                onClick={() => toggleTask(task.id, task.completed)}
                className="custom-check flex-shrink-0"
                style={task.completed ? { background: "var(--champagne)", borderColor: "var(--champagne)" } : {}}
              >
                {task.completed && (
                  <svg width="8" height="6" viewBox="0 0 8 6" fill="none">
                    <path d="M1 3L3 5L7 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </button>
              <span
                className="flex-1 text-sm"
                style={{
                  color: task.completed ? "var(--warm)" : "var(--bark)",
                  textDecoration: task.completed ? "line-through" : "none",
                  transition: "all 0.2s",
                }}
              >
                {task.text}
              </span>
              <button
                onClick={() => deleteTask(task.id)}
                className="opacity-0 group-hover:opacity-100 transition-opacity p-1"
                style={{ color: "var(--warm)" }}
              >
                <Trash2 size={13} />
              </button>
            </div>
          ))
        )}
      </div>

      <div className="divider mx-6" />
      <div className="px-6 py-4 flex gap-2">
        <input
          ref={inputRef}
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addTask()}
          placeholder="Add a task..."
          className="input-base text-sm flex-1"
          style={{ fontSize: "0.875rem" }}
        />
        <button
          onClick={addTask}
          className="p-1.5 rounded transition-colors"
          style={{ color: "var(--champagne)" }}
        >
          <Plus size={16} />
        </button>
      </div>
    </div>
  );
}
