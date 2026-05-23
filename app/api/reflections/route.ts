import { NextRequest, NextResponse } from "next/server";
import sql, { initializeDatabase } from "@/lib/db";

export async function GET(req: NextRequest) {
  await initializeDatabase();
  const week = req.nextUrl.searchParams.get("week");
  const [reflection] = await sql`SELECT * FROM reflections WHERE week_key = ${week}`;
  return NextResponse.json(reflection ?? null);
}

export async function POST(req: NextRequest) {
  await initializeDatabase();
  const { week_key, wins, improvements, gratitude } = await req.json();
  const [reflection] = await sql`
    INSERT INTO reflections (week_key, wins, improvements, gratitude)
    VALUES (${week_key}, ${wins ?? ""}, ${improvements ?? ""}, ${gratitude ?? ""})
    ON CONFLICT (week_key) DO UPDATE
    SET wins = COALESCE(NULLIF(${wins}, ''), reflections.wins),
        improvements = COALESCE(NULLIF(${improvements}, ''), reflections.improvements),
        gratitude = COALESCE(NULLIF(${gratitude}, ''), reflections.gratitude)
    RETURNING *
  `;
  return NextResponse.json(reflection);
}
