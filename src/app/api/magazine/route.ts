import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { dealAdaptiveMagazine, ensureSeeded } from "@/lib/rating";

export async function POST() {
  try {
    const profile = await ensureSeeded();
    const problems = await prisma.problem.findMany();
    const topicRatings = JSON.parse(profile.topicRatingsJson) as Record<string, number>;

    // Shuffle tie-breaking slightly so re-dealing gives fresh tactical hands
    const jittered = problems.map((p) => ({
      ...p,
      rating: p.rating + Math.round((Math.random() - 0.5) * 140),
    }));

    const newHand = dealAdaptiveMagazine(profile.overallRating, topicRatings, jittered);

    await prisma.learnerProfile.update({
      where: { id: "default-runner" },
      data: { magazineHandJson: JSON.stringify(newHand) },
    });

    return NextResponse.json({ magazineHand: newHand });
  } catch (err) {
    console.error("Magazine deal error:", err);
    return NextResponse.json({ error: "Failed to deal 5-Round Magazine" }, { status: 500 });
  }
}
