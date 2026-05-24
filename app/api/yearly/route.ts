import { NextRequest, NextResponse } from "next/server";
import sql, { initializeDatabase } from "@/lib/db";

export async function GET(req: NextRequest) {
  await initializeDatabase();
  const year = req.nextUrl.searchParams.get("year") || new Date().getFullYear().toString();
  const [vision] = await sql`SELECT * FROM yearly_vision WHERE year = ${parseInt(year)}`;
  const goals = await sql`SELECT * FROM yearly_goals WHERE year = ${parseInt(year)} ORDER BY category, created_at`;
  return NextResponse.json({ vision: vision ?? null, goals });
}

export async function POST(req: NextRequest) {
  await initializeDatabase();
  const { year, vision, nonnegotiables, focus, change, theme_word, theme_description } = await req.json();
  const [row] = await sql`
    INSERT INTO yearly_vision (year, vision, nonnegotiables, focus, change, theme_word, theme_description)
    VALUES (${year}, ${vision??""}, ${nonnegotiables??""}, ${focus??""}, ${change??""}, ${theme_word??""}, ${theme_description??""})
    ON CONFLICT (year) DO UPDATE SET
      vision = COALESCE(NULLIF(${vision??""}, ''), yearly_vision.vision),
      nonnegotiables = COALESCE(NULLIF(${nonnegotiables??""}, ''), yearly_vision.nonnegotiables),
      focus = COALESCE(NULLIF(${focus??""}, ''), yearly_vision.focus),
      change = COALESCE(NULLIF(${change??""}, ''), yearly_vision.change),
      theme_word = COALESCE(NULLIF(${theme_word??""}, ''), yearly_vision.theme_word),
      theme_description = COALESCE(NULLIF(${theme_description??""}, ''), yearly_vision.theme_description)
    RETURNING *
  `;
  return NextResponse.json(row);
}

export async function PUT(req: NextRequest) {
  await initializeDatabase();
  const { year, category, text } = await req.json();
  const [goal] = await sql`INSERT INTO yearly_goals (year, category, text) VALUES (${year}, ${category}, ${text}) RETURNING *`;
  return NextResponse.json(goal);
}

export async function PATCH(req: NextRequest) {
  const { id, completed } = await req.json();
  const [goal] = await sql`UPDATE yearly_goals SET completed=${completed} WHERE id=${id} RETURNING *`;
  return NextResponse.json(goal);
}

export async function DELETE(req: NextRequest) {
  const { id } = await req.json();
  await sql`DELETE FROM yearly_goals WHERE id=${id}`;
  return NextResponse.json({ success: true });
}
