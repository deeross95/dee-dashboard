import { NextRequest, NextResponse } from "next/server";
import sql, { initializeDatabase } from "@/lib/db";

export async function GET(req: NextRequest) {
  await initializeDatabase();
  const week = req.nextUrl.searchParams.get("week");
  const sessions = await sql`SELECT * FROM gym_sessions WHERE week_key = ${week} ORDER BY day_of_week ASC`;
  return NextResponse.json(sessions);
}

export async function POST(req: NextRequest) {
  await initializeDatabase();
  const { week_key, day_of_week, completed, notes } = await req.json();
  const [session] = await sql`
    INSERT INTO gym_sessions (week_key, day_of_week, completed, notes)
    VALUES (${week_key}, ${day_of_week}, ${completed}, ${notes ?? ""})
    ON CONFLICT (week_key, day_of_week)
    DO UPDATE SET completed = ${completed}, notes = COALESCE(${notes}, gym_sessions.notes)
    RETURNING *
  `;
  return NextResponse.json(session);
}
