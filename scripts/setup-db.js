// Run with: node scripts/setup-db.js
// Make sure DATABASE_URL is set in your environment

const { neon } = require("@neondatabase/serverless");

async function setup() {
  if (!process.env.DATABASE_URL) {
    console.error("ERROR: DATABASE_URL environment variable is not set");
    process.exit(1);
  }

  const sql = neon(process.env.DATABASE_URL);
  console.log("Connecting to Neon database...");

  try {
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

    console.log("All tables created successfully!");
  } catch (err) {
    console.error("Error creating tables:", err);
    process.exit(1);
  }
}

setup();
