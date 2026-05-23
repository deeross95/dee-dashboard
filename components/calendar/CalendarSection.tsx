"use client";

import { useState, useEffect } from "react";
import { format, parseISO, addDays } from "date-fns";
import { CalendarDays, ExternalLink, RefreshCw } from "lucide-react";
import { DAYS } from "@/lib/weeks";

interface CalEvent {
  id: string;
  summary: string;
  start: { dateTime?: string; date?: string };
  end: { dateTime?: string; date?: string };
  colorId?: string;
  htmlLink?: string;
}

const GOOGLE_COLORS: Record<string, string> = {
  "1": "#7986cb", "2": "#33b679", "3": "#8e24aa", "4": "#e67c73",
  "5": "#f6bf26", "6": "#f4511e", "7": "#039be5", "8": "#616161",
  "9": "#3f51b5", "10": "#0b8043", "11": "#d50000",
};

export default function CalendarSection({ weekKey }: { weekKey: string }) {
  const [token, setToken] = useState<string|null>(null);
  const [events, setEvents] = useState<CalEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string|null>(null);
  const [connected, setConnected] = useState(false);

  // Check for OAuth callback code in URL
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const code = params.get("calendar_code");
    const err = params.get("calendar_error");
    if (err) { setError("Google authorization failed. Please try again."); return; }
    if (code) {
      // Exchange code for token
      fetch("/api/calendar-sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      }).then(r => r.json()).then(data => {
        if (data.access_token) {
          setToken(data.access_token);
          setConnected(true);
          localStorage.setItem("gcal_token", data.access_token);
          // Clean URL
          window.history.replaceState({}, document.title, window.location.pathname);
        }
      });
    }
    // Check localStorage
    const saved = localStorage.getItem("gcal_token");
    if (saved) { setToken(saved); setConnected(true); }
  }, []);

  useEffect(() => {
    if (!token || !weekKey) return;
    setLoading(true);
    fetch(`/api/calendar-sync?action=events&week=${weekKey}&token=${encodeURIComponent(token)}`)
      .then(r => r.json())
      .then(data => {
        if (data.error === "Token expired") {
          setToken(null);
          setConnected(false);
          localStorage.removeItem("gcal_token");
          setError("Session expired. Please reconnect your calendar.");
        } else {
          setEvents(data.events || []);
          setError(null);
        }
        setLoading(false);
      }).catch(() => setLoading(false));
  }, [token, weekKey]);

  const connect = async () => {
    const res = await fetch("/api/calendar-sync?action=auth-url");
    const data = await res.json();
    if (data.error) { setError(data.error); return; }
    if (data.url) window.location.href = data.url;
  };

  const disconnect = () => {
    setToken(null); setConnected(false); setEvents([]);
    localStorage.removeItem("gcal_token");
  };

  // Build week days
  const weekStart = new Date(weekKey + "T00:00:00");
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const getEventsForDay = (date: Date) => {
    const dateStr = format(date, "yyyy-MM-dd");
    return events.filter(ev => {
      const evDate = ev.start.dateTime ? format(parseISO(ev.start.dateTime), "yyyy-MM-dd") : ev.start.date;
      return evDate === dateStr;
    });
  };

  const formatEventTime = (ev: CalEvent) => {
    if (ev.start.date && !ev.start.dateTime) return "All day";
    if (ev.start.dateTime) return format(parseISO(ev.start.dateTime), "h:mm a");
    return "";
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="card px-6 py-5">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <p className="section-label mb-1">google calendar</p>
            <h2 className="font-display text-3xl" style={{ color: "var(--espresso)", fontWeight: 400 }}>Weekly Schedule</h2>
          </div>
          <div className="flex items-center gap-3">
            {connected ? (
              <>
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full" style={{ background: "var(--sage)" }} />
                  <span className="font-mono" style={{ fontSize: "0.6rem", color: "var(--sage)", letterSpacing: "0.08em" }}>connected</span>
                </div>
                <button onClick={() => { setLoading(true); setEvents([]); setTimeout(() => setLoading(false), 100); }}
                  className="p-1.5 rounded transition-colors hover:bg-parchment" style={{ color: "var(--fog)" }}>
                  <RefreshCw size={14} />
                </button>
                <button onClick={disconnect} className="font-mono px-3 py-1.5 rounded transition-colors" style={{ background: "var(--sand)", color: "var(--fog)", fontSize: "0.6rem", letterSpacing: "0.08em" }}>
                  disconnect
                </button>
              </>
            ) : (
              <button onClick={connect}
                className="flex items-center gap-2 font-mono px-4 py-2 rounded transition-colors"
                style={{ background: "var(--blush)", color: "var(--dusty-rose)", fontSize: "0.65rem", letterSpacing: "0.08em" }}>
                <CalendarDays size={13} />
                connect google calendar
              </button>
            )}
          </div>
        </div>
        {error && <p className="mt-3 text-xs font-mono" style={{ color: "var(--terracotta)" }}>{error}</p>}
      </div>

      {!connected ? (
        <div className="card p-10 text-center">
          <CalendarDays size={36} className="mx-auto mb-4" style={{ color: "var(--blush)" }} />
          <h3 className="font-display text-2xl mb-2" style={{ color: "var(--espresso)", fontWeight: 300 }}>Connect Your Calendar</h3>
          <p className="text-sm mb-6 max-w-md mx-auto" style={{ color: "var(--fog)" }}>
            Sync your Google Calendar to see all your events in the weekly view. Requires setting up Google OAuth credentials in your Vercel environment.
          </p>
          <div className="text-left max-w-sm mx-auto mb-6 p-4 rounded" style={{ background: "var(--parchment)", border: "1px solid var(--sand)" }}>
            <p className="font-mono mb-2" style={{ fontSize: "0.6rem", color: "var(--fog)", letterSpacing: "0.1em" }}>REQUIRED ENV VARS</p>
            {["GOOGLE_CLIENT_ID", "GOOGLE_CLIENT_SECRET", "NEXT_PUBLIC_APP_URL"].map(v => (
              <p key={v} className="font-mono text-xs mb-1" style={{ color: "var(--bark)" }}>{v}</p>
            ))}
          </div>
          <button onClick={connect} className="font-mono px-5 py-2 rounded" style={{ background: "var(--rose)", color: "white", fontSize: "0.65rem", letterSpacing: "0.08em" }}>
            Connect Google Calendar
          </button>
        </div>
      ) : (
        <div className="card overflow-hidden">
          {/* Day columns header */}
          <div className="grid border-b" style={{ gridTemplateColumns: "80px repeat(7, 1fr)", borderColor: "var(--sand)" }}>
            <div className="p-3" />
            {weekDays.map((day, i) => {
              const isToday = format(day, "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd");
              return (
                <div key={i} className="p-3 text-center border-l" style={{ borderColor: "var(--sand)" }}>
                  <p className="font-mono" style={{ fontSize: "0.55rem", letterSpacing: "0.08em", color: "var(--fog)", textTransform: "uppercase" }}>{DAYS[i]}</p>
                  <p className={`font-display text-lg mt-0.5`} style={{
                    color: isToday ? "white" : "var(--bark)",
                    background: isToday ? "var(--rose)" : "transparent",
                    borderRadius: isToday ? "50%" : 0,
                    width: isToday ? 28 : "auto",
                    height: isToday ? 28 : "auto",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    margin: "0 auto",
                    fontWeight: 400,
                  }}>
                    {format(day, "d")}
                  </p>
                  <p className="font-mono" style={{ fontSize: "0.5rem", color: "var(--warm)", letterSpacing: "0.04em" }}>{format(day, "MMM")}</p>
                </div>
              );
            })}
          </div>

          {/* Events grid */}
          <div className="grid" style={{ gridTemplateColumns: "80px repeat(7, 1fr)" }}>
            <div className="py-4 flex flex-col gap-2 px-2" style={{ borderRight: "1px solid var(--sand)" }}>
              {["All day","AM","Midday","PM","Evening"].map(t => (
                <div key={t} className="font-mono text-right" style={{ fontSize: "0.5rem", color: "var(--warm)", letterSpacing: "0.04em", paddingTop: t === "All day" ? 8 : 24 }}>{t}</div>
              ))}
            </div>
            {weekDays.map((day, i) => {
              const dayEvents = getEventsForDay(day);
              return (
                <div key={i} className="border-l min-h-48 p-2" style={{ borderColor: "var(--sand)" }}>
                  {loading ? (
                    <div className="shimmer h-8 mb-2" />
                  ) : dayEvents.length === 0 ? null : (
                    dayEvents.map(ev => {
                      const color = ev.colorId ? GOOGLE_COLORS[ev.colorId] : "var(--rose)";
                      return (
                        <div key={ev.id} className="mb-1.5 px-2 py-1.5 rounded-sm group cursor-pointer transition-all hover:opacity-80"
                          style={{ background: `${color}20`, borderLeft: `2.5px solid ${color}` }}>
                          <p className="text-xs font-medium truncate" style={{ color: "var(--bark)", lineHeight: 1.3 }}>{ev.summary}</p>
                          <p className="font-mono" style={{ fontSize: "0.5rem", color: "var(--fog)", letterSpacing: "0.04em" }}>{formatEventTime(ev)}</p>
                          {ev.htmlLink && (
                            <a href={ev.htmlLink} target="_blank" rel="noopener noreferrer"
                              className="opacity-0 group-hover:opacity-100 transition-opacity" onClick={e => e.stopPropagation()}>
                              <ExternalLink size={9} style={{ color: "var(--fog)" }} />
                            </a>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              );
            })}
          </div>

          {events.length === 0 && !loading && (
            <div className="text-center py-8">
              <p className="font-mono" style={{ fontSize: "0.65rem", color: "var(--warm)", letterSpacing: "0.05em" }}>no events this week</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
