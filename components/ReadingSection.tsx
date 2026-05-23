"use client";

import { useState, useEffect, useRef } from "react";
import { BookOpen } from "lucide-react";

interface Book {
  title: string;
  author: string;
  progress: string;
  notes: string;
}

export default function ReadingSection({ weekKey }: { weekKey: string }) {
  const [book, setBook] = useState<Book>({ title: "", author: "", progress: "", notes: "" });
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const saveTimeout = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/reading?week=${weekKey}`)
      .then((r) => r.json())
      .then((d) => {
        setBook({
          title: d?.title ?? "",
          author: d?.author ?? "",
          progress: d?.progress ?? "",
          notes: d?.notes ?? "",
        });
        setLoading(false);
      });
  }, [weekKey]);

  const updateBook = (field: keyof Book, value: string) => {
    const updated = { ...book, [field]: value };
    setBook(updated);

    if (saveTimeout.current) clearTimeout(saveTimeout.current);
    saveTimeout.current = setTimeout(async () => {
      setSaving(true);
      await fetch("/api/reading", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ week_key: weekKey, [field]: value }),
      });
      setSaving(false);
    }, 800);
  };

  const progressPct = (() => {
    const match = book.progress.match(/(\d+)/);
    if (!match) return 0;
    const n = parseInt(match[1]);
    if (book.progress.includes("%")) return Math.min(n, 100);
    return 0;
  })();

  return (
    <div className="card h-full flex flex-col">
      <div className="px-6 pt-6 pb-4">
        <div className="flex items-center justify-between mb-1">
          <p className="section-label">currently reading</p>
          {saving && (
            <span className="font-mono" style={{ fontSize: "0.55rem", color: "var(--warm)", letterSpacing: "0.08em" }}>
              saving...
            </span>
          )}
        </div>
        <h2 className="font-display text-2xl" style={{ color: "var(--espresso)", fontWeight: 400 }}>
          Reading Log
        </h2>
      </div>

      <div className="divider mx-6" />

      <div className="flex-1 px-6 py-5 flex flex-col gap-4">
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-8 rounded animate-pulse" style={{ background: "var(--sand)" }} />
            ))}
          </div>
        ) : (
          <>
            <div
              className="flex items-center justify-center py-6 rounded-sm"
              style={{ background: "var(--cream)", border: "1px solid var(--sand)" }}
            >
              <BookOpen size={32} style={{ color: "var(--warm)" }} />
            </div>

            <div>
              <p className="section-label mb-1.5">title</p>
              <input
                value={book.title}
                onChange={(e) => updateBook("title", e.target.value)}
                placeholder="Book title"
                className="input-base"
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: "1rem",
                  fontWeight: 500,
                  fontStyle: book.title ? "normal" : "italic",
                  color: book.title ? "var(--espresso)" : "var(--warm)",
                }}
              />
            </div>

            <div>
              <p className="section-label mb-1.5">author</p>
              <input
                value={book.author}
                onChange={(e) => updateBook("author", e.target.value)}
                placeholder="Author name"
                className="input-base text-sm"
                style={{ color: "var(--bark)" }}
              />
            </div>

            <div>
              <p className="section-label mb-1.5">progress</p>
              <input
                value={book.progress}
                onChange={(e) => updateBook("progress", e.target.value)}
                placeholder="e.g. 45%, ch. 7, page 120"
                className="input-base"
                style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.8125rem", color: "var(--fog)" }}
              />
              {progressPct > 0 && (
                <div className="mt-2 h-1 rounded-full overflow-hidden" style={{ background: "var(--sand)" }}>
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${progressPct}%`, background: "var(--bronze)" }}
                  />
                </div>
              )}
            </div>

            <div className="flex-1">
              <p className="section-label mb-1.5">notes</p>
              <textarea
                value={book.notes}
                onChange={(e) => updateBook("notes", e.target.value)}
                placeholder="Thoughts, quotes, reactions..."
                className="input-base"
                rows={3}
                style={{ fontSize: "0.8125rem", lineHeight: 1.7 }}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
