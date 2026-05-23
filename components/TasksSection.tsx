"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Plus, Trash2 } from "lucide-react";

interface Task { id: number; text: string; completed: boolean; }

function fireConfetti(x: number, y: number) {
  const colors = ["#f2cfc8","#e8a89e","#c9a96e","#7a8c72","#b8a8c4","#f7e0db","#d4857a","#c4898a"];
  const shapes = ["square","circle","rect"];
  for (let i = 0; i < 22; i++) {
    const el = document.createElement("div");
    el.className = "confetti-piece";
    const size = Math.random() * 8 + 5;
    const shape = shapes[Math.floor(Math.random() * shapes.length)];
    el.style.cssText = `
      left:${x + (Math.random() - 0.5) * 60}px;
      top:${y}px;
      width:${shape === "rect" ? size * 1.8 : size}px;
      height:${shape === "rect" ? size * 0.6 : size}px;
      background:${colors[Math.floor(Math.random() * colors.length)]};
      border-radius:${shape === "circle" ? "50%" : "2px"};
      animation-delay:${Math.random() * 0.3}s;
      animation-duration:${0.7 + Math.random() * 0.5}s;
    `;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 1400);
  }
}

export default function TasksSection({ weekKey }: { weekKey: string }) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/tasks?week=${weekKey}`).then(r => r.json()).then(d => { setTasks(d); setLoading(false); });
  }, [weekKey]);

  const addTask = async () => {
    if (!newTask.trim()) return;
    const res = await fetch("/api/tasks", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ week_key: weekKey, text: newTask.trim() }) });
    const task = await res.json();
    setTasks(prev => [...prev, task]);
    setNewTask("");
  };

  const toggleTask = async (id: number, completed: boolean, e: React.MouseEvent) => {
    if (!completed) {
      // Firing confetti on completion (not on un-completion)
      fireConfetti(e.clientX, e.clientY);
    }
    setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: !completed } : t));
    await fetch("/api/tasks", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, completed: !completed }) });
  };

  const deleteTask = async (id: number) => {
    setTasks(prev => prev.filter(t => t.id !== id));
    await fetch("/api/tasks", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
  };

  const done = tasks.filter(t => t.completed).length;
  const total = tasks.length;

  return (
    <div className="card h-full flex flex-col" style={{ minHeight: 320 }}>
      <div className="px-6 pt-6 pb-4">
        <div className="flex items-center justify-between mb-1">
          <p className="section-label">tasks</p>
          {total > 0 && <span className="font-mono" style={{ fontSize: "0.6rem", color: "var(--fog)" }}>{done}/{total}</span>}
        </div>
        <h2 className="font-display text-2xl" style={{ color: "var(--espresso)", fontWeight: 400 }}>This Week&apos;s Checklist</h2>
        {total > 0 && (
          <div className="mt-3 h-1 rounded-full overflow-hidden" style={{ background: "var(--sand)" }}>
            <div className="h-full rounded-full transition-all duration-700" style={{ width: `${(done/total)*100}%`, background: "linear-gradient(to right, var(--blush), var(--rose))" }} />
          </div>
        )}
      </div>
      <div className="divider mx-6" />
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-0.5">
        {loading ? [1,2,3].map(i => <div key={i} className="shimmer h-8 mb-2" />) :
         tasks.length === 0 ? <p className="font-mono text-center py-6" style={{ color: "var(--warm)", fontSize: "0.65rem", letterSpacing: "0.05em" }}>nothing here yet</p> :
         tasks.map(task => (
           <div key={task.id} className="flex items-center gap-3 group py-1.5 px-2 rounded-sm transition-colors" style={{ background: "transparent" }}
                onMouseEnter={e => (e.currentTarget.style.background = "var(--petal)")}
                onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
             <button onClick={e => toggleTask(task.id, task.completed, e)}
               className="custom-check flex-shrink-0"
               style={task.completed ? { background: "var(--rose)", borderColor: "var(--rose)" } : {}}>
               {task.completed && <svg width="8" height="6" viewBox="0 0 8 6" fill="none"><path d="M1 3L3 5L7 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
             </button>
             <span className="flex-1 text-sm" style={{ color: task.completed ? "var(--warm)" : "var(--bark)", textDecoration: task.completed ? "line-through" : "none", transition: "all 0.2s" }}>{task.text}</span>
             <button onClick={() => deleteTask(task.id)} className="opacity-0 group-hover:opacity-100 transition-opacity p-1" style={{ color: "var(--warm)" }}><Trash2 size={12} /></button>
           </div>
         ))}
      </div>
      <div className="divider mx-6" />
      <div className="px-6 py-4 flex gap-2">
        <input value={newTask} onChange={e => setNewTask(e.target.value)} onKeyDown={e => e.key === "Enter" && addTask()} placeholder="Add a task..." className="input-base flex-1" style={{ fontSize: "0.875rem" }} />
        <button onClick={addTask} style={{ color: "var(--rose)" }}><Plus size={16} /></button>
      </div>
    </div>
  );
}
