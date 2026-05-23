import { NextRequest, NextResponse } from "next/server";
import sql, { initializeDatabase } from "@/lib/db";

export async function GET(req: NextRequest) {
  await initializeDatabase();
  const week = req.nextUrl.searchParams.get("week");
  const items = await sql`SELECT * FROM school_items WHERE week_key = ${week} ORDER BY created_at ASC`;
  return NextResponse.json(items);
}

export async function POST(req: NextRequest) {
  await initializeDatabase();
  const { week_key, type, text, due_date } = await req.json();
  const [item] = await sql`
    INSERT INTO school_items (week_key, type, text, due_date)
    VALUES (${week_key}, ${type}, ${text}, ${due_date ?? ""})
    RETURNING *
  `;
  return NextResponse.json(item);
}

export async function PATCH(req: NextRequest) {
  const { id, completed, text } = await req.json();
  if (text !== undefined) {
    const [item] = await sql`UPDATE school_items SET text = ${text} WHERE id = ${id} RETURNING *`;
    return NextResponse.json(item);
  }
  const [item] = await sql`UPDATE school_items SET completed = ${completed} WHERE id = ${id} RETURNING *`;
  return NextResponse.json(item);
}

export async function DELETE(req: NextRequest) {
  const { id } = await req.json();
  await sql`DELETE FROM school_items WHERE id = ${id}`;
  return NextResponse.json({ success: true });
}
