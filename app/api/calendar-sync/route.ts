import { NextRequest, NextResponse } from "next/server";

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID!;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET!;
const REDIRECT_URI = process.env.NEXT_PUBLIC_APP_URL
  ? `${process.env.NEXT_PUBLIC_APP_URL}/api/calendar-sync/callback`
  : "http://localhost:3000/api/calendar-sync/callback";

export async function GET(req: NextRequest) {
  const action = req.nextUrl.searchParams.get("action");

  if (action === "auth-url") {
    if (!GOOGLE_CLIENT_ID) {
      return NextResponse.json({ error: "Google Calendar not configured. Add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET to your environment." });
    }
    const params = new URLSearchParams({
      client_id: GOOGLE_CLIENT_ID,
      redirect_uri: REDIRECT_URI,
      response_type: "code",
      scope: "https://www.googleapis.com/auth/calendar.readonly",
      access_type: "offline",
      prompt: "consent",
    });
    return NextResponse.json({ url: `https://accounts.google.com/o/oauth2/v2/auth?${params}` });
  }

  if (action === "events") {
    const weekKey = req.nextUrl.searchParams.get("week");
    const accessToken = req.nextUrl.searchParams.get("token");
    if (!accessToken) return NextResponse.json({ events: [] });

    try {
      const weekStart = new Date(weekKey + "T00:00:00");
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 7);

      const params = new URLSearchParams({
        timeMin: weekStart.toISOString(),
        timeMax: weekEnd.toISOString(),
        singleEvents: "true",
        orderBy: "startTime",
        maxResults: "50",
      });

      const res = await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events?${params}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      if (!res.ok) {
        return NextResponse.json({ events: [], error: "Token expired" });
      }

      const data = await res.json();
      return NextResponse.json({ events: data.items || [] });
    } catch {
      return NextResponse.json({ events: [] });
    }
  }

  return NextResponse.json({ error: "Unknown action" });
}

export async function POST(req: NextRequest) {
  const { code } = await req.json();
  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
    return NextResponse.json({ error: "Google Calendar not configured" }, { status: 400 });
  }

  try {
    const res = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        redirect_uri: REDIRECT_URI,
        grant_type: "authorization_code",
        code,
      }),
    });
    const data = await res.json();
    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
