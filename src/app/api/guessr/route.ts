import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ensureSeeded } from "@/lib/rating";

export async function POST(req: Request) {
  try {
    const profile = await ensureSeeded();
    const { xpDelta } = (await req.json()) as { xpDelta: number };
    const safeDelta = Math.max(0, Math.min(200, Math.round(xpDelta || 0)));

    const updated = await prisma.learnerProfile.update({
      where: { id: "default-runner" },
      data: {
        xp: profile.xp + safeDelta,
      },
    });

    return NextResponse.json({ xp: updated.xp });
  } catch (err) {
    console.error("Guessr XP update error:", err);
    return NextResponse.json({ error: "Failed to record Bounty Guessr XP" }, { status: 500 });
  }
}
