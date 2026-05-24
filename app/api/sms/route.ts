import { NextRequest, NextResponse } from "next/server";
import sql, { initializeDatabase } from "@/lib/db";

export async function GET() {
  await initializeDatabase();
  const [settings] = await sql`SELECT * FROM sms_settings LIMIT 1`;
  return NextResponse.json(settings ?? { phone_number: "", send_time: "07:00", enabled: false, prompt_style: "warm" });
}

export async function POST(req: NextRequest) {
  await initializeDatabase();
  const body = await req.json();

  if (body.action === "save_settings") {
    const { phone_number, send_time, enabled, prompt_style } = body;
    const existing = await sql`SELECT id FROM sms_settings LIMIT 1`;
    if (existing.length > 0) {
      const [row] = await sql`UPDATE sms_settings SET phone_number=${phone_number}, send_time=${send_time}, enabled=${enabled}, prompt_style=${prompt_style} WHERE id=${existing[0].id} RETURNING *`;
      return NextResponse.json(row);
    } else {
      const [row] = await sql`INSERT INTO sms_settings (phone_number, send_time, enabled, prompt_style) VALUES (${phone_number}, ${send_time}, ${enabled}, ${prompt_style}) RETURNING *`;
      return NextResponse.json(row);
    }
  }

  if (body.action === "send_now") {
    if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN || !process.env.TWILIO_PHONE_NUMBER) {
      return NextResponse.json({ error: "Twilio not configured. Add TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_PHONE_NUMBER to your environment variables." }, { status: 400 });
    }

    const { phone_number, prompt_style } = body;
    const prompts: Record<string, string[]> = {
      warm: [
        "Good morning, beautiful soul 🌸 What is one thing you are grateful for today? What intention will carry you through?",
        "Rise and shine, Dee 🌅 What does your body need today? How will you pour into yourself before pouring into others?",
        "Good morning 🤍 What would make today feel like a win? Name one thing — and go get it.",
        "Morning, love ✨ What energy do you want to bring into today? Speak it into existence.",
        "Good morning 🌺 You get to choose how today feels. What are you choosing?",
      ],
      clinical: [
        "Morning debrief 📋 What are your top 3 priorities today? Any clinical or school tasks that need to move?",
        "Good morning. Before the day starts: what needs your focus today — clinically, academically, personally?",
        "Morning check-in 🩺 How are your hours tracking? What patient encounters or learning moments are you carrying into today?",
      ],
      grounding: [
        "Good morning 🌿 Take one breath. What is true right now? What do you want to release, and what do you want to hold close today?",
        "Morning 🪨 Ground yourself: name something you can see, something you feel, and one thing you are proud of. Now go.",
        "Good morning, Dee. You are exactly where you need to be 🌙 What is asking for your attention today?",
      ],
    };

    const list = prompts[prompt_style] || prompts.warm;
    const message = list[Math.floor(Math.random() * list.length)];

    try {
      const twilio = require("twilio");
      const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
      await client.messages.create({
        body: message,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: phone_number,
      });
      return NextResponse.json({ success: true, message });
    } catch (err: any) {
      return NextResponse.json({ error: err.message || "Failed to send SMS" }, { status: 500 });
    }
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
