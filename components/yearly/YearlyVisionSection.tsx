"use client";

import { useState, useEffect, useRef } from "react";
import { Plus, Trash2, Check } from "lucide-react";

interface YearlyGoal { id: number; category: string; text: string; completed: boolean; }
interface Vision { vision: string; nonnegotiables: string; focus: string; change: string; theme_word: string; theme_description: string; }

const YEAR = new Date().getFullYear();

const GOAL_CATEGORIES = [
  { id: "health",     label: "Health & Body",    icon: "💪", color: "#7a8c72" },
  { id: "career",     label: "Career & School",  icon: "🏆", color: "#c9a96e" },
  { id: "faith",      label: "Faith & Spirit",   icon: "🙏", color: "#b8a8c4" },
  { id: "love",       label: "Love & Relationships", icon: "❤️", color: "#e8a89e" },
  { id: "finances",   label: "Finances",         icon: "💰", color: "#a07850" },
  { id: "adventures", label: "Adventures & Travel", icon: "✈️", color: "#7ab8d4" },
  { id: "growth",     label: "Personal Growth",  icon: "🌱", color: "#7a8c72" },
  { id: "joy",        label: "Fun & Joy",        icon: "🌸", color: "#d4857a" },
];

const REFLECTION_PROMPTS = [
  { key: "vision" as keyof Vision,          label: "My Vision",           icon: "🔮", placeholder: "When I imagine the best version of my life a year from now, I see..." },
  { key: "nonnegotiables" as keyof Vision,  label: "Non-Negotiables",     icon: "🪨", placeholder: "The things I will protect no matter what — my non-negotiables are..." },
  { key: "focus" as keyof Vision,           label: "My Focus",            icon: "🎯", placeholder: "This year, I am putting my energy into..." },
  { key: "change" as keyof Vision,          label: "What I Want to Change", icon: "🦋", placeholder: "I am ready to let go of... and step into..." },
];

export default function YearlyVisionSection() {
  const [vision, setVision] = useState<Vision>({ vision: "", nonnegotiables: "", focus: "", change: "", theme_word: "", theme_description: "" });
  const [goals, setGoals] = useState<YearlyGoal[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeGoalCat, setActiveGoalCat] = useState("health");
  const [newGoalText, setNewGoalText] = useState("");
  const timeouts = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  useEffect(() => {
    fetch(`/api/yearly?year=${YEAR}`).then(r => r.json()).then(({ vision: v, goals: g }) => {
      if (v) setVision(v);
      setGoals(g || []);
      setLoading(false);
    });
  }, []);

  const updateVision = (field: keyof Vision, value: string) => {
    const updated = { ...vision, [field]: value };
    setVision(updated);
    if (timeouts.current[field]) clearTimeout(timeouts.current[field]);
    timeouts.current[field] = setTimeout(async () => {
      setSaving(true);
      await fetch("/api/yearly", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ year: YEAR, [field]: value }) });
      setSaving(false);
    }, 900);
  };

  const addGoal = async () => {
    if (!newGoalText.trim()) return;
    const res = await fetch("/api/yearly", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ year: YEAR, category: activeGoalCat, text: newGoalText.trim() }) });
    const goal = await res.json();
    setGoals(prev => [...prev, goal]);
    setNewGoalText("");
  };

  const toggleGoal = async (id: number, completed: boolean) => {
    setGoals(prev => prev.map(g => g.id === id ? {...g, completed: !completed} : g));
    await fetch("/api/yearly", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, completed: !completed }) });
  };

  const deleteGoal = async (id: number) => {
    setGoals(prev => prev.filter(g => g.id !== id));
    await fetch("/api/yearly", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
  };

  const totalGoals = goals.length;
  const doneGoals = goals.filter(g => g.completed).length;

  return (
    <div className="space-y-8">
      {/* Hero manifesto header */}
      <div className="relative overflow-hidden rounded-sm px-8 py-10 fade-up"
        style={{ background: "linear-gradient(135deg, #fdf0ec 0%, #f5ede3 30%, #f0e8df 60%, #ede3d8 100%)", border: "1px solid var(--blush)" }}>
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-20" style={{ background: "radial-gradient(circle, var(--rose) 0%, transparent 70%)", transform: "translate(30%, -30%)" }} />
        <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full opacity-10" style={{ background: "radial-gradient(circle, var(--champagne) 0%, transparent 70%)", transform: "translate(-30%, 30%)" }} />

        <div className="relative text-center">
          <p className="section-label mb-3" style={{ color: "var(--rose)" }}>year in focus</p>
          <h1 className="font-display mb-2" style={{ fontSize: "clamp(2.5rem, 5vw, 4rem)", color: "var(--espresso)", fontWeight: 300, letterSpacing: "0.02em", lineHeight: 1.1 }}>
            {YEAR} Vision
          </h1>
          {vision.theme_word ? (
            <div className="mt-4">
              <p className="font-display text-2xl italic" style={{ color: "var(--rose)", fontWeight: 400 }}>&ldquo;{vision.theme_word}&rdquo;</p>
              {vision.theme_description && <p className="text-sm mt-1" style={{ color: "var(--fog)" }}>{vision.theme_description}</p>}
            </div>
          ) : (
            <p className="text-sm mt-2" style={{ color: "var(--warm)" }}>Set your theme word below</p>
          )}

          {saving && <p className="font-mono mt-3" style={{ fontSize: "0.55rem", color: "var(--warm)", letterSpacing: "0.1em" }}>saving...</p>}
        </div>

        {totalGoals > 0 && (
          <div className="relative flex justify-center mt-6 gap-8">
            <div className="text-center">
              <p className="font-display text-3xl" style={{ color: "var(--espresso)", fontWeight: 300 }}>{doneGoals}</p>
              <p className="font-mono" style={{ fontSize: "0.55rem", color: "var(--fog)", letterSpacing: "0.1em" }}>COMPLETE</p>
            </div>
            <div className="w-px" style={{ background: "var(--warm)" }} />
            <div className="text-center">
              <p className="font-display text-3xl" style={{ color: "var(--espresso)", fontWeight: 300 }}>{totalGoals - doneGoals}</p>
              <p className="font-mono" style={{ fontSize: "0.55rem", color: "var(--fog)", letterSpacing: "0.1em" }}>IN PROGRESS</p>
            </div>
            <div className="w-px" style={{ background: "var(--warm)" }} />
            <div className="text-center">
              <p className="font-display text-3xl" style={{ color: "var(--rose)", fontWeight: 300 }}>{totalGoals > 0 ? Math.round((doneGoals/totalGoals)*100) : 0}%</p>
              <p className="font-mono" style={{ fontSize: "0.55rem", color: "var(--fog)", letterSpacing: "0.1em" }}>ACHIEVED</p>
            </div>
          </div>
        )}
      </div>

      {/* Theme word + Year theme */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 fade-up-delay-1">
        <div className="card p-6">
          <p className="section-label mb-1">theme word</p>
          <p className="font-display text-xl mb-3" style={{ color: "var(--espresso)", fontWeight: 400 }}>My Word for {YEAR}</p>
          <input value={vision.theme_word} onChange={e => updateVision("theme_word", e.target.value)}
            placeholder="One word that guides your year..."
            className="input-base mb-3"
            style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.5rem", fontWeight: 400, color: vision.theme_word ? "var(--rose)" : "var(--warm)", borderBottom: "1px solid var(--sand)", paddingBottom: 8 }} />
          <textarea value={vision.theme_description} onChange={e => updateVision("theme_description", e.target.value)}
            placeholder="What this word means to you..."
            className="input-base" rows={3} style={{ fontSize: "0.875rem", lineHeight: 1.7 }} />
        </div>
        <div className="card p-6" style={{ background: "linear-gradient(135deg, var(--petal) 0%, white 100%)" }}>
          <p className="section-label mb-1">annual progress</p>
          <p className="font-display text-xl mb-4" style={{ color: "var(--espresso)", fontWeight: 400 }}>Goals Overview</p>
          <div className="space-y-2">
            {GOAL_CATEGORIES.map(cat => {
              const catGoals = goals.filter(g => g.category === cat.id);
              const catDone = catGoals.filter(g => g.completed).length;
              const pct = catGoals.length ? (catDone/catGoals.length)*100 : 0;
              if (catGoals.length === 0) return null;
              return (
                <div key={cat.id} className="flex items-center gap-3">
                  <span style={{ fontSize: "0.875rem" }}>{cat.icon}</span>
                  <div className="flex-1">
                    <div className="flex justify-between mb-0.5">
                      <span className="text-xs" style={{ color: "var(--bark)" }}>{cat.label}</span>
                      <span className="font-mono" style={{ fontSize: "0.55rem", color: "var(--fog)" }}>{catDone}/{catGoals.length}</span>
                    </div>
                    <div className="h-1 rounded-full overflow-hidden" style={{ background: "var(--sand)" }}>
                      <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: cat.color }} />
                    </div>
                  </div>
                </div>
              );
            })}
            {goals.length === 0 && <p className="font-mono text-xs" style={{ color: "var(--warm)", letterSpacing: "0.05em" }}>add goals below to track progress</p>}
          </div>
        </div>
      </div>

      {/* Four reflection prompts */}
      <div className="fade-up-delay-2">
        <div className="mb-4">
          <p className="section-label mb-1">personal manifesto</p>
          <h2 className="font-display text-2xl" style={{ color: "var(--espresso)", fontWeight: 400 }}>Vision &amp; Intentions</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {REFLECTION_PROMPTS.map(({ key, label, icon, placeholder }) => (
            <div key={key} className="card p-6 flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xl">{icon}</span>
                <div>
                  <p className="section-label-neutral">{YEAR} reflection</p>
                  <h3 className="font-display text-xl" style={{ color: "var(--espresso)", fontWeight: 400 }}>{label}</h3>
                </div>
              </div>
              <div className="h-px" style={{ background: "var(--sand)" }} />
              {loading ? <div className="shimmer h-24" /> : (
                <textarea value={vision[key]} onChange={e => updateVision(key, e.target.value)}
                  placeholder={placeholder} className="input-base flex-1"
                  rows={5}
                  style={{ fontSize: "0.875rem", lineHeight: 1.8, fontStyle: vision[key] ? "normal" : "italic", color: vision[key] ? "var(--espresso)" : "var(--warm)" }} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Goals by category */}
      <div className="fade-up-delay-3">
        <div className="mb-4">
          <p className="section-label mb-1">yearly goals</p>
          <h2 className="font-display text-2xl" style={{ color: "var(--espresso)", fontWeight: 400 }}>Goals by Category</h2>
        </div>

        {/* Category tabs */}
        <div className="flex gap-2 flex-wrap mb-4">
          {GOAL_CATEGORIES.map(cat => {
            const cnt = goals.filter(g => g.category === cat.id).length;
            const done = goals.filter(g => g.category === cat.id && g.completed).length;
            const isActive = activeGoalCat === cat.id;
            return (
              <button key={cat.id} onClick={() => setActiveGoalCat(cat.id)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all font-mono"
                style={{
                  fontSize: "0.6rem", letterSpacing: "0.08em",
                  background: isActive ? cat.color : "white",
                  color: isActive ? "white" : "var(--fog)",
                  border: `1.5px solid ${isActive ? cat.color : "var(--sand)"}`,
                }}>
                <span>{cat.icon}</span>
                {cat.label}
                {cnt > 0 && <span style={{ opacity: 0.8 }}>{done}/{cnt}</span>}
              </button>
            );
          })}
        </div>

        <div className="card overflow-hidden">
          {(() => {
            const cat = GOAL_CATEGORIES.find(c => c.id === activeGoalCat)!;
            const catGoals = goals.filter(g => g.category === activeGoalCat);
            return (
              <>
                <div className="px-6 py-4 flex items-center gap-3 border-b" style={{ borderColor: "var(--sand)", background: `${cat.color}10` }}>
                  <span className="text-2xl">{cat.icon}</span>
                  <h3 className="font-display text-xl" style={{ color: "var(--espresso)", fontWeight: 400 }}>{cat.label}</h3>
                  <span className="font-mono ml-auto" style={{ fontSize: "0.6rem", color: cat.color, letterSpacing: "0.08em" }}>
                    {catGoals.filter(g => g.completed).length}/{catGoals.length} done
                  </span>
                </div>
                <div className="divide-y" style={{ borderColor: "var(--sand)" }}>
                  {catGoals.length === 0 ? (
                    <p className="px-6 py-8 font-mono text-center" style={{ fontSize: "0.65rem", color: "var(--warm)", letterSpacing: "0.05em" }}>no goals yet for {cat.label.toLowerCase()}</p>
                  ) : catGoals.map(goal => (
                    <div key={goal.id} className="flex items-center gap-3 px-6 py-3 group transition-colors hover:bg-petal">
                      <button onClick={() => toggleGoal(goal.id, goal.completed)}
                        className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 transition-all"
                        style={{ background: goal.completed ? cat.color : "transparent", border: `1.5px solid ${goal.completed ? cat.color : "var(--warm)"}` }}>
                        {goal.completed && <Check size={10} color="white" />}
                      </button>
                      <span className="flex-1 text-sm" style={{ color: goal.completed ? "var(--warm)" : "var(--bark)", textDecoration: goal.completed ? "line-through" : "none" }}>{goal.text}</span>
                      <button onClick={() => deleteGoal(goal.id)} className="opacity-0 group-hover:opacity-60 transition-opacity" style={{ color: "var(--fog)" }}><Trash2 size={12} /></button>
                    </div>
                  ))}
                </div>
                <div className="px-6 py-3 border-t flex gap-2" style={{ borderColor: "var(--sand)" }}>
                  <input value={newGoalText} onChange={e => setNewGoalText(e.target.value)} onKeyDown={e => e.key === "Enter" && addGoal()}
                    placeholder={`Add a ${cat.label.toLowerCase()} goal...`} className="input-base text-sm flex-1" />
                  <button onClick={addGoal} style={{ color: cat.color }}><Plus size={16} /></button>
                </div>
              </>
            );
          })()}
        </div>
      </div>

      {/* SMS debrief setup */}
      <SMSSettings />
    </div>
  );
}

function SMSSettings() {
  const [settings, setSettings] = useState({ phone_number: "", send_time: "07:00", enabled: false, prompt_style: "warm" });
  const [saving, setSaving] = useState(false);
  const [sendStatus, setSendStatus] = useState<string|null>(null);
  const [lastMessage, setLastMessage] = useState<string|null>(null);

  useEffect(() => {
    fetch("/api/sms").then(r => r.json()).then(d => { if (d) setSettings({ phone_number: d.phone_number||"", send_time: d.send_time||"07:00", enabled: !!d.enabled, prompt_style: d.prompt_style||"warm" }); });
  }, []);

  const save = async () => {
    setSaving(true);
    await fetch("/api/sms", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "save_settings", ...settings }) });
    setSaving(false);
    setSendStatus("Saved!");
    setTimeout(() => setSendStatus(null), 2000);
  };

  const sendNow = async () => {
    setSendStatus("Sending...");
    const res = await fetch("/api/sms", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "send_now", phone_number: settings.phone_number, prompt_style: settings.prompt_style }) });
    const data = await res.json();
    if (data.success) {
      setSendStatus("Sent!");
      setLastMessage(data.message);
    } else {
      setSendStatus(data.error || "Failed");
    }
    setTimeout(() => setSendStatus(null), 4000);
  };

  return (
    <div className="card p-6 fade-up-delay-4">
      <div className="flex items-center gap-3 mb-4">
        <span className="text-2xl">📱</span>
        <div>
          <p className="section-label mb-0.5">daily ritual</p>
          <h3 className="font-display text-xl" style={{ color: "var(--espresso)", fontWeight: 400 }}>Morning Debrief via SMS</h3>
        </div>
      </div>
      <p className="text-sm mb-5" style={{ color: "var(--fog)" }}>Receive a warm, grounding morning prompt delivered to your phone. Requires Twilio — add <code className="font-mono text-xs px-1 py-0.5 rounded" style={{ background: "var(--sand)" }}>TWILIO_ACCOUNT_SID</code>, <code className="font-mono text-xs px-1 py-0.5 rounded" style={{ background: "var(--sand)" }}>TWILIO_AUTH_TOKEN</code>, and <code className="font-mono text-xs px-1 py-0.5 rounded" style={{ background: "var(--sand)" }}>TWILIO_PHONE_NUMBER</code> to your Vercel env vars.</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div>
          <p className="section-label-neutral mb-1.5">phone number</p>
          <input value={settings.phone_number} onChange={e => setSettings(p => ({...p, phone_number: e.target.value}))}
            placeholder="+1 713 555 0000" className="input-base text-sm" style={{ border: "1px solid var(--sand)", borderRadius: 2, padding: "6px 8px", fontFamily: "'DM Mono', monospace" }} />
        </div>
        <div>
          <p className="section-label-neutral mb-1.5">tone</p>
          <select value={settings.prompt_style} onChange={e => setSettings(p => ({...p, prompt_style: e.target.value}))}
            className="input-base text-sm w-full" style={{ border: "1px solid var(--sand)", borderRadius: 2, padding: "6px 8px", cursor: "pointer" }}>
            <option value="warm">Warm & Encouraging</option>
            <option value="grounding">Grounding & Still</option>
            <option value="clinical">Clinical & Focused</option>
          </select>
        </div>
        <div>
          <p className="section-label-neutral mb-1.5">send time (set via Vercel cron)</p>
          <input type="time" value={settings.send_time} onChange={e => setSettings(p => ({...p, send_time: e.target.value}))}
            className="input-base text-sm" style={{ border: "1px solid var(--sand)", borderRadius: 2, padding: "6px 8px", fontFamily: "'DM Mono', monospace" }} />
        </div>
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <button onClick={save} className="font-mono px-4 py-2 rounded transition-colors" style={{ background: "var(--blush)", color: "var(--dusty-rose)", fontSize: "0.65rem", letterSpacing: "0.08em" }}>
          {saving ? "saving..." : "save settings"}
        </button>
        <button onClick={sendNow} className="font-mono px-4 py-2 rounded transition-colors" style={{ background: "var(--rose)", color: "white", fontSize: "0.65rem", letterSpacing: "0.08em" }}>
          send now (test)
        </button>
        {sendStatus && <span className="font-mono text-xs" style={{ color: "var(--sage)" }}>{sendStatus}</span>}
      </div>

      {lastMessage && (
        <div className="mt-4 p-3 rounded" style={{ background: "var(--petal)", border: "1px solid var(--blush)" }}>
          <p className="section-label-neutral mb-1">preview sent</p>
          <p className="text-sm italic" style={{ color: "var(--bark)" }}>{lastMessage}</p>
        </div>
      )}
    </div>
  );
}
