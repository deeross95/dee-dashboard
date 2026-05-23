"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, Check } from "lucide-react";

interface BucketItem { id: number; category: string; text: string; completed: boolean; target_year: number|null; notes: string; }

const CATEGORIES = [
  { id: "travel",     label: "Travel",      icon: "✈️", color: "#7ab8d4",  desc: "Places to go, horizons to chase" },
  { id: "experience", label: "Experience",  icon: "🎭", color: "#c4714a",  desc: "Moments that take your breath away" },
  { id: "career",     label: "Career",      icon: "🏆", color: "#c9a96e",  desc: "Professional milestones & achievements" },
  { id: "personal",   label: "Personal",    icon: "🌸", color: "#e8a89e",  desc: "Who you want to become" },
  { id: "health",     label: "Health",      icon: "💪", color: "#7a8c72",  desc: "Your body, your vitality" },
  { id: "creative",   label: "Creative",    icon: "🎨", color: "#9b8a9e",  desc: "Make, build, create, express" },
  { id: "financial",  label: "Financial",   icon: "💰", color: "#a07850",  desc: "Abundance and security" },
];

export default function BucketListSection() {
  const [items, setItems] = useState<BucketItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("travel");
  const [newText, setNewText] = useState("");
  const [newYear, setNewYear] = useState("");
  const [expandedId, setExpandedId] = useState<number|null>(null);

  useEffect(() => {
    fetch("/api/bucket-list").then(r => r.json()).then(d => { setItems(d); setLoading(false); });
  }, []);

  const add = async () => {
    if (!newText.trim()) return;
    const res = await fetch("/api/bucket-list", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ category: activeCategory, text: newText.trim(), target_year: newYear ? parseInt(newYear) : null }),
    });
    const item = await res.json();
    setItems(prev => [...prev, item]);
    setNewText(""); setNewYear("");
  };

  const toggle = async (id: number, completed: boolean) => {
    setItems(prev => prev.map(i => i.id === id ? {...i, completed: !completed} : i));
    await fetch("/api/bucket-list", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, completed: !completed }) });
  };

  const remove = async (id: number) => {
    setItems(prev => prev.filter(i => i.id !== id));
    await fetch("/api/bucket-list", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
  };

  const catItems = items.filter(i => i.category === activeCategory);
  const doneCount = catItems.filter(i => i.completed).length;
  const activeCat = CATEGORIES.find(c => c.id === activeCategory)!;
  const totalDone = items.filter(i => i.completed).length;
  const totalItems = items.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="fade-up">
        <p className="section-label mb-1">bucket list</p>
        <div className="flex items-end justify-between flex-wrap gap-4">
          <h1 className="font-display text-4xl" style={{ color: "var(--espresso)", fontWeight: 300, letterSpacing: "0.01em" }}>
            Life&apos;s Grand List
          </h1>
          {totalItems > 0 && (
            <div className="flex items-center gap-2">
              <span className="font-mono" style={{ fontSize: "0.65rem", color: "var(--fog)", letterSpacing: "0.08em" }}>{totalDone} of {totalItems} complete</span>
              <div className="w-32 h-1.5 rounded-full overflow-hidden" style={{ background: "var(--sand)" }}>
                <div className="h-full rounded-full transition-all duration-700" style={{ width: `${(totalDone/totalItems)*100}%`, background: "linear-gradient(to right, var(--blush), var(--rose))" }} />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Category nav */}
      <div className="flex gap-2 flex-wrap fade-up-delay-1">
        {CATEGORIES.map(cat => {
          const cnt = items.filter(i => i.category === cat.id).length;
          const doneCnt = items.filter(i => i.category === cat.id && i.completed).length;
          const isActive = activeCategory === cat.id;
          return (
            <button key={cat.id} onClick={() => setActiveCategory(cat.id)}
              className="flex items-center gap-2 px-4 py-2 rounded-full transition-all"
              style={{
                background: isActive ? cat.color : "white",
                color: isActive ? "white" : "var(--fog)",
                border: `1.5px solid ${isActive ? cat.color : "var(--sand)"}`,
                boxShadow: isActive ? `0 4px 12px ${cat.color}40` : "none",
              }}>
              <span className="text-sm">{cat.icon}</span>
              <span className="font-mono" style={{ fontSize: "0.65rem", letterSpacing: "0.08em" }}>{cat.label}</span>
              {cnt > 0 && (
                <span className="font-mono rounded-full px-1.5 py-0.5" style={{ fontSize: "0.55rem", background: isActive ? "rgba(255,255,255,0.3)" : "var(--sand)", color: isActive ? "white" : "var(--fog)" }}>
                  {doneCnt}/{cnt}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Main content area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 fade-up-delay-2">
        {/* List */}
        <div className="lg:col-span-2 card overflow-hidden">
          <div className="px-6 py-5 flex items-center gap-3 border-b" style={{ borderColor: "var(--sand)", background: `${activeCat.color}10` }}>
            <span className="text-3xl">{activeCat.icon}</span>
            <div>
              <h3 className="font-display text-2xl" style={{ color: "var(--espresso)", fontWeight: 400 }}>{activeCat.label}</h3>
              <p className="text-xs" style={{ color: "var(--fog)" }}>{activeCat.desc}</p>
            </div>
            {catItems.length > 0 && (
              <div className="ml-auto text-right">
                <p className="font-display text-2xl" style={{ color: activeCat.color, fontWeight: 400 }}>{doneCount}</p>
                <p className="font-mono" style={{ fontSize: "0.55rem", color: "var(--fog)", letterSpacing: "0.08em" }}>DONE</p>
              </div>
            )}
          </div>
          <div className="divide-y" style={{ borderColor: "var(--sand)" }}>
            {loading ? [1,2,3].map(i => <div key={i} className="shimmer h-12 mx-4 my-2" />) :
             catItems.length === 0 ? (
               <div className="px-6 py-10 text-center">
                 <p className="font-display text-xl mb-1" style={{ color: "var(--warm)", fontWeight: 300 }}>Dream big</p>
                 <p className="font-mono text-xs" style={{ color: "var(--warm)", letterSpacing: "0.05em" }}>Add your first {activeCat.label.toLowerCase()} bucket list item below</p>
               </div>
             ) :
             catItems.map(item => (
               <div key={item.id} className="group">
                 <div className="flex items-center gap-3 px-6 py-3 cursor-pointer hover:bg-petal transition-colors"
                   onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}>
                   <button
                     onClick={e => { e.stopPropagation(); toggle(item.id, item.completed); }}
                     className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 transition-all"
                     style={{ background: item.completed ? activeCat.color : "transparent", border: `1.5px solid ${item.completed ? activeCat.color : "var(--warm)"}` }}>
                     {item.completed && <Check size={10} color="white" />}
                   </button>
                   <span className="flex-1 text-sm" style={{ color: item.completed ? "var(--warm)" : "var(--bark)", textDecoration: item.completed ? "line-through" : "none" }}>{item.text}</span>
                   {item.target_year && (
                     <span className="font-mono px-2 py-0.5 rounded" style={{ fontSize: "0.55rem", background: `${activeCat.color}20`, color: activeCat.color, letterSpacing: "0.06em" }}>{item.target_year}</span>
                   )}
                   <button onClick={e => { e.stopPropagation(); remove(item.id); }} className="opacity-0 group-hover:opacity-60 transition-opacity" style={{ color: "var(--fog)" }}>
                     <Trash2 size={12} />
                   </button>
                 </div>
                 {expandedId === item.id && item.notes && (
                   <div className="px-14 pb-3">
                     <p className="text-xs italic" style={{ color: "var(--fog)" }}>{item.notes}</p>
                   </div>
                 )}
               </div>
             ))}
          </div>
          {/* Add form */}
          <div className="px-6 py-4 border-t flex gap-2" style={{ borderColor: "var(--sand)" }}>
            <input value={newText} onChange={e => setNewText(e.target.value)} onKeyDown={e => e.key === "Enter" && add()}
              placeholder={`Add to ${activeCat.label.toLowerCase()}...`} className="input-base text-sm flex-1" />
            <input value={newYear} onChange={e => setNewYear(e.target.value)} placeholder="Year"
              className="input-base font-mono text-xs" style={{ width: 60, color: "var(--fog)" }} />
            <button onClick={add} style={{ color: activeCat.color }}><Plus size={16} /></button>
          </div>
        </div>

        {/* Stats sidebar */}
        <div className="space-y-4">
          <div className="card p-5">
            <p className="section-label mb-3">by category</p>
            <div className="space-y-2.5">
              {CATEGORIES.map(cat => {
                const cnt = items.filter(i => i.category === cat.id).length;
                const done = items.filter(i => i.category === cat.id && i.completed).length;
                const pct = cnt > 0 ? (done/cnt)*100 : 0;
                return (
                  <div key={cat.id} className="cursor-pointer" onClick={() => setActiveCategory(cat.id)}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-1.5">
                        <span style={{ fontSize: "0.875rem" }}>{cat.icon}</span>
                        <span className="text-xs" style={{ color: "var(--bark)" }}>{cat.label}</span>
                      </div>
                      <span className="font-mono" style={{ fontSize: "0.6rem", color: "var(--fog)" }}>{done}/{cnt}</span>
                    </div>
                    <div className="h-1 rounded-full overflow-hidden" style={{ background: "var(--sand)" }}>
                      <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: cat.color }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Upcoming */}
          <div className="card p-5">
            <p className="section-label mb-3">coming up</p>
            {items.filter(i => i.target_year && !i.completed).sort((a,b) => (a.target_year||0)-(b.target_year||0)).slice(0,5).map(item => {
              const cat = CATEGORIES.find(c => c.id === item.category);
              return (
                <div key={item.id} className="flex items-center gap-2 mb-2">
                  <span>{cat?.icon}</span>
                  <span className="flex-1 text-xs truncate" style={{ color: "var(--bark)" }}>{item.text}</span>
                  <span className="font-mono" style={{ fontSize: "0.55rem", color: "var(--fog)" }}>{item.target_year}</span>
                </div>
              );
            })}
            {items.filter(i => i.target_year && !i.completed).length === 0 && (
              <p className="font-mono text-xs" style={{ color: "var(--warm)", letterSpacing: "0.05em" }}>add target years to see them here</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
