import { NextRequest, NextResponse } from "next/server";
import sql, { initializeDatabase } from "@/lib/db";

export async function GET() {
  await initializeDatabase();
  const items = await sql`SELECT * FROM bucket_items ORDER BY category, created_at ASC`;
  return NextResponse.json(items);
}

export async function POST(req: NextRequest) {
  await initializeDatabase();
  const { category, text, target_year, notes } = await req.json();
  const [item] = await sql`INSERT INTO bucket_items (category, text, target_year, notes) VALUES (${category}, ${text}, ${target_year ?? null}, ${notes ?? ""}) RETURNING *`;
  return NextResponse.json(item);
}

export async function PATCH(req: NextRequest) {
  const { id, completed, text, notes } = await req.json();
  if (text !== undefined) {
    const [item] = await sql`UPDATE bucket_items SET text=${text} WHERE id=${id} RETURNING *`;
    return NextResponse.json(item);
  }
  if (notes !== undefined) {
    const [item] = await sql`UPDATE bucket_items SET notes=${notes} WHERE id=${id} RETURNING *`;
    return NextResponse.json(item);
  }
  const [item] = await sql`UPDATE bucket_items SET completed=${completed} WHERE id=${id} RETURNING *`;
  return NextResponse.json(item);
}

export async function DELETE(req: NextRequest) {
  const { id } = await req.json();
  await sql`DELETE FROM bucket_items WHERE id=${id}`;
  return NextResponse.json({ success: true });
}
