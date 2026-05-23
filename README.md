# Dee's Weekly Productivity Dashboard

A personal weekly dashboard built with Next.js App Router, deployed on Vercel, with a Neon Postgres database for full persistence.

## Features

- **Weekly Checklist** — tasks with progress bar and completion tracking
- **Gym Tracker** — log sessions by day, visual progress bar
- **Weekly Focus** — intention statement + specific goals
- **Reflections** — wins, room to grow, and gratitude prompts
- **Reading Log** — current book, author, progress, and notes
- **School & Clinical** — assignments, exams, clinical hours with type tagging and due dates
- **Week Navigation** — browse any past or future week, all data persisted per week

---

## Setup & Deployment

### 1. Create a Neon Database

1. Go to [neon.tech](https://neon.tech) and sign up (free tier is plenty)
2. Create a new project
3. From the dashboard, copy your **connection string** — it looks like:
   ```
   postgresql://username:password@ep-something.us-east-2.aws.neon.tech/neondb?sslmode=require
   ```

### 2. Deploy to Vercel

1. Push this project to a GitHub repo
2. Go to [vercel.com](https://vercel.com) and import the repo
3. During setup, add an **Environment Variable**:
   - Key: `DATABASE_URL`
   - Value: your Neon connection string
4. Deploy

Vercel will auto-detect Next.js and build correctly. Tables are created automatically on first request (via `initializeDatabase()` in `lib/db.ts`).

### 3. Run Locally

```bash
# Install dependencies
npm install

# Create .env.local
cp .env.example .env.local
# Edit .env.local and paste your DATABASE_URL

# (Optional) manually run DB setup
npm run db:setup

# Start dev server
npm run dev
```

Visit `http://localhost:3000`

---

## Tech Stack

- **Framework**: Next.js 14 App Router
- **Database**: Neon Postgres (serverless)
- **ORM**: `@neondatabase/serverless` (native tagged-template SQL)
- **Styling**: Tailwind CSS + custom CSS variables
- **Fonts**: Cormorant Garamond (display), Jost (body), DM Mono (labels)
- **Icons**: Lucide React
- **Deployment**: Vercel

---

## Database Schema

| Table | Purpose |
|---|---|
| `tasks` | Weekly checklist items |
| `gym_sessions` | Day-by-day gym tracking, one row per day per week |
| `weekly_focus` | Weekly intention statement |
| `goals` | Specific goals under the focus |
| `reflections` | Wins, improvements, gratitude |
| `reading` | Current book details and notes |
| `school_items` | Assignments, exams, clinical hours |

All tables include a `week_key` column (format: `YYYY-MM-DD`, Monday of the week) for weekly scoping.

---

## Customization

- Colors are defined as CSS variables in `app/globals.css` — change them to match your vibe
- Tailwind config in `tailwind.config.ts` extends the palette
- Add more school item types in `components/SchoolSection.tsx` under the `TYPES` array
