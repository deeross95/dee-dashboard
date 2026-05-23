import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

export default sql;

export async function initializeDatabase() {
  await sql`
    CREATE TABLE IF NOT EXISTS tasks (
      id SERIAL PRIMARY KEY,
      week_key TEXT NOT NULL,
      text TEXT NOT NULL,
      completed BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS gym_sessions (
      id SERIAL PRIMARY KEY,
      week_key TEXT NOT NULL,
      day_of_week INTEGER NOT NULL,
      completed BOOLEAN DEFAULT FALSE,
      notes TEXT DEFAULT '',
      created_at TIMESTAMP DEFAULT NOW(),
      UNIQUE(week_key, day_of_week)
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS weekly_focus (
      id SERIAL PRIMARY KEY,
      week_key TEXT UNIQUE NOT NULL,
      focus_statement TEXT DEFAULT '',
      created_at TIMESTAMP DEFAULT NOW()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS goals (
      id SERIAL PRIMARY KEY,
      week_key TEXT NOT NULL,
      text TEXT NOT NULL,
      completed BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS reflections (
      id SERIAL PRIMARY KEY,
      week_key TEXT UNIQUE NOT NULL,
      wins TEXT DEFAULT '',
      improvements TEXT DEFAULT '',
      gratitude TEXT DEFAULT '',
      created_at TIMESTAMP DEFAULT NOW()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS reading (
      id SERIAL PRIMARY KEY,
      week_key TEXT UNIQUE NOT NULL,
      title TEXT DEFAULT '',
      author TEXT DEFAULT '',
      progress TEXT DEFAULT '',
      notes TEXT DEFAULT '',
      created_at TIMESTAMP DEFAULT NOW()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS school_items (
      id SERIAL PRIMARY KEY,
      week_key TEXT NOT NULL,
      type TEXT NOT NULL,
      text TEXT NOT NULL,
      completed BOOLEAN DEFAULT FALSE,
      due_date TEXT DEFAULT '',
      created_at TIMESTAMP DEFAULT NOW()
    )
  `;
}
