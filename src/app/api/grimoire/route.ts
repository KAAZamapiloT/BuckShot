import { NextResponse } from "next/server";
import { INITIAL_DEFEATS } from "@/lib/grimoire";

export async function GET() {
  return NextResponse.json({
    status: "ok",
    defeats: INITIAL_DEFEATS,
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    return NextResponse.json({
      status: "ok",
      received: body,
      timestamp: new Date().toISOString(),
    });
  } catch {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }
}
