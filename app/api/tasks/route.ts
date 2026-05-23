import { NextRequest, NextResponse } from "next/server";
import sql, { initializeDatabase } from "@/lib/db";

export async function GET(req: NextRequest) {
  await initializeDatabase();
  const week = req.nextUrl.searchParams.get("week");
  const tasks = await sql`SELECT * FROM tasks WHERE week_key = ${week} ORDER BY created_at ASC`;
  return NextResponse.json(tasks);
}

export async function POST(req: NextRequest) {
  await initializeDatabase();
  const { week_key, text } = await req.json();
  const [task] = await sql`INSERT INTO tasks (week_key, text) VALUES (${week_key}, ${text}) RETURNING *`;
  return NextResponse.json(task);
}

export async function PATCH(req: NextRequest) {
  const { id, completed, text } = await req.json();
  if (text !== undefined) {
    const [task] = await sql`UPDATE tasks SET text = ${text} WHERE id = ${id} RETURNING *`;
    return NextResponse.json(task);
  }
  const [task] = await sql`UPDATE tasks SET completed = ${completed} WHERE id = ${id} RETURNING *`;
  return NextResponse.json(task);
}

export async function DELETE(req: NextRequest) {
  const { id } = await req.json();
  await sql`DELETE FROM tasks WHERE id = ${id}`;
  return NextResponse.json({ success: true });
}
