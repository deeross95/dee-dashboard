"use client";

import { useState, useEffect, useRef } from "react";

interface Reflection {
  wins: string;
  improvements: string;
  gratitude: string;
}

const fields: { key: keyof Reflection; label: string; placeholder: string; accent: string }[] = [
  {
    key: "wins",
    label: "wins this week",
    placeholder: "What went well? What are you proud of?",
    accent: "var(--champagne)",
  },
  {
    key: "improvements",
    label: "room to grow",
    placeholder: "What would you do differently? What needs attention?",
    accent: "var(--dusty)",
  },
  {
    key: "gratitude",
    label: "gratitude",
    placeholder: "What are you thankful for this week?",
    accent: "var(--sage)",
  },
];

export default function ReflectionsSection({ weekKey }: { weekKey: string }) {
  const [data, setData] = useState<Reflection>({ wins: "", improvements: "", gratitude: "" });
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const timeouts = useRef<Record<string, NodeJS.Timeout>>({});

  useEffect(() => {
    setLoading(true);
    fetch(`/api/reflections?week=${weekKey}`)
      .then((r) => r.json())
      .then((d) => {
        setData({
          wins: d?.wins ?? "",
          improvements: d?.improvements ?? "",
          gratitude: d?.gratitude ?? "",
        });
        setLoading(false);
      });
  }, [weekKey]);

  const updateField = (field: keyof Reflection, value: string) => {
    const updated = { ...data, [field]: value };
    setData(updated);

    if (timeouts.current[field]) clearTimeout(timeouts.current[field]);
    timeouts.current[field] = setTimeout(async () => {
      setSaving(true);
      await fetch("/api/reflections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ week_key: weekKey, [field]: value }),
      });
      setSaving(false);
    }, 900);
  };

  return (
    <div className="card h-full flex flex-col">
      <div className="px-6 pt-6 pb-4">
        <div className="flex items-center justify-between mb-1">
          <p className="section-label">reflection</p>
          {saving && (
            <span className="font-mono" style={{ fontSize: "0.55rem", color: "var(--warm)", letterSpacing: "0.08em" }}>
              saving...
            </span>
          )}
        </div>
        <h2 className="font-display text-2xl" style={{ color: "var(--espresso)", fontWeight: 400 }}>
          Weekly Reflection
        </h2>
      </div>

      <div className="divider mx-6" />

      <div className="flex-1 grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x" style={{ borderColor: "var(--sand)" }}>
        {fields.map(({ key, label, placeholder, accent }) => (
          <div key={key} className="p-6 flex flex-col">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-1 h-4 rounded-full flex-shrink-0" style={{ background: accent }} />
              <p className="section-label">{label}</p>
            </div>
            {loading ? (
              <div className="flex-1 rounded animate-pulse" style={{ background: "var(--sand)", minHeight: 80 }} />
            ) : (
              <textarea
                value={data[key]}
                onChange={(e) => updateField(key, e.target.value)}
                placeholder={placeholder}
                className="input-base flex-1"
                style={{ fontSize: "0.8125rem", lineHeight: 1.7, minHeight: 100 }}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
