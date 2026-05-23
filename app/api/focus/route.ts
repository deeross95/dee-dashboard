import { NextRequest, NextResponse } from "next/server";
import sql, { initializeDatabase } from "@/lib/db";

export async function GET(req: NextRequest) {
  await initializeDatabase();
  const week = req.nextUrl.searchParams.get("week");
  const [focus] = await sql`SELECT * FROM weekly_focus WHERE week_key = ${week}`;
  const goals = await sql`SELECT * FROM goals WHERE week_key = ${week} ORDER BY created_at ASC`;
  return NextResponse.json({ focus: focus ?? null, goals });
}

export async function POST(req: NextRequest) {
  await initializeDatabase();
  const { week_key, focus_statement } = await req.json();
  const [focus] = await sql`
    INSERT INTO weekly_focus (week_key, focus_statement)
    VALUES (${week_key}, ${focus_statement})
    ON CONFLICT (week_key) DO UPDATE SET focus_statement = ${focus_statement}
    RETURNING *
  `;
  return NextResponse.json(focus);
}

export async function PUT(req: NextRequest) {
  await initializeDatabase();
  const { week_key, text } = await req.json();
  const [goal] = await sql`INSERT INTO goals (week_key, text) VALUES (${week_key}, ${text}) RETURNING *`;
  return NextResponse.json(goal);
}

export async function PATCH(req: NextRequest) {
  const { id, completed } = await req.json();
  const [goal] = await sql`UPDATE goals SET completed = ${completed} WHERE id = ${id} RETURNING *`;
  return NextResponse.json(goal);
}

export async function DELETE(req: NextRequest) {
  const { id } = await req.json();
  await sql`DELETE FROM goals WHERE id = ${id}`;
  return NextResponse.json({ success: true });
}
