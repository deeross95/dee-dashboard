import { NextRequest, NextResponse } from "next/server";
import sql, { initializeDatabase } from "@/lib/db";

export async function GET(req: NextRequest) {
  await initializeDatabase();
  const week = req.nextUrl.searchParams.get("week");
  const [book] = await sql`SELECT * FROM reading WHERE week_key = ${week}`;
  return NextResponse.json(book ?? null);
}

export async function POST(req: NextRequest) {
  await initializeDatabase();
  const { week_key, title, author, progress, notes } = await req.json();
  const [book] = await sql`
    INSERT INTO reading (week_key, title, author, progress, notes)
    VALUES (${week_key}, ${title ?? ""}, ${author ?? ""}, ${progress ?? ""}, ${notes ?? ""})
    ON CONFLICT (week_key) DO UPDATE
    SET title = COALESCE(NULLIF(${title}, ''), reading.title),
        author = COALESCE(NULLIF(${author}, ''), reading.author),
        progress = COALESCE(NULLIF(${progress}, ''), reading.progress),
        notes = COALESCE(NULLIF(${notes}, ''), reading.notes)
    RETURNING *
  `;
  return NextResponse.json(book);
}
