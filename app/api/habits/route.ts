import { NextRequest, NextResponse } from "next/server";
import sql, { initializeDatabase } from "@/lib/db";

export async function GET(req: NextRequest) {
  await initializeDatabase();
  const week = req.nextUrl.searchParams.get("week");
  const view = req.nextUrl.searchParams.get("view") || "week";

  if (view === "quarter") {
    const quarterStart = req.nextUrl.searchParams.get("start");
    const habits = await sql`SELECT * FROM habits WHERE active = TRUE ORDER BY section, sort_order, created_at`;
    const completions = await sql`
      SELECT hc.* FROM habit_completions hc
      WHERE hc.week_key >= ${quarterStart} AND hc.completed = TRUE
    `;
    return NextResponse.json({ habits, completions });
  }

  const habits = await sql`SELECT * FROM habits WHERE active = TRUE ORDER BY section, sort_order, created_at`;
  const completions = await sql`SELECT * FROM habit_completions WHERE week_key = ${week}`;
  return NextResponse.json({ habits, completions });
}

export async function POST(req: NextRequest) {
  await initializeDatabase();
  const body = await req.json();

  if (body.action === "toggle") {
    const { habit_id, week_key, day_of_week, completed } = body;
    const [row] = await sql`
      INSERT INTO habit_completions (habit_id, week_key, day_of_week, completed)
      VALUES (${habit_id}, ${week_key}, ${day_of_week}, ${completed})
      ON CONFLICT (habit_id, week_key, day_of_week) DO UPDATE SET completed = ${completed}
      RETURNING *
    `;
    return NextResponse.json(row);
  }

  if (body.action === "create") {
    const { name, icon, color, section, weekly_goal } = body;
    const [habit] = await sql`INSERT INTO habits (name, icon, color, section, weekly_goal) VALUES (${name}, ${icon}, ${color}, ${section}, ${weekly_goal}) RETURNING *`;
    return NextResponse.json(habit);
  }

  if (body.action === "delete") {
    await sql`DELETE FROM habits WHERE id = ${body.id}`;
    return NextResponse.json({ success: true });
  }

  if (body.action === "update") {
    const { id, name, icon, color, section, weekly_goal } = body;
    const [habit] = await sql`UPDATE habits SET name=${name}, icon=${icon}, color=${color}, section=${section}, weekly_goal=${weekly_goal} WHERE id=${id} RETURNING *`;
    return NextResponse.json(habit);
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
