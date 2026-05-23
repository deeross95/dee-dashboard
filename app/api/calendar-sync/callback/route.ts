import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");
  if (!code) return NextResponse.redirect(new URL("/?calendar_error=1", req.url));
  return NextResponse.redirect(new URL(`/?calendar_code=${code}`, req.url));
}
