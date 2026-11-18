import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ensureSeeded, getRankFromRating } from "@/lib/rating";
import { getActiveModel } from "@/lib/ai";

export async function GET() {
  try {
    const profile = await ensureSeeded();
    const problems = await prisma.problem.findMany({ orderBy: { volumeNumber: "asc" } });
    const attempts = await prisma.shellBreakAttempt.findMany();
    const attemptMap = Object.fromEntries(attempts.map((a) => [a.problemSlug, a]));

    const topicRatings = JSON.parse(profile.topicRatingsJson) as Record<string, number>;
    const rank = getRankFromRating(profile.overallRating);
    const activeModel = getActiveModel();

    return NextResponse.json({
      profile: {
        ...profile,
        topicRatings,
        strengths: JSON.parse(profile.strengthsJson) as string[],
        weaknesses: JSON.parse(profile.weaknessesJson) as string[],
        magazineHand: JSON.parse(profile.magazineHandJson),
        sprintAgenda: JSON.parse(profile.sprintAgendaJson),
        rank,
      },
      aiStatus: activeModel ? activeModel.label : "Local Interactive Sensei (Add API key in .env for Live LLM)",
      problems: problems.map((p) => {
        const att = attemptMap[p.slug];
        const cruxes = JSON.parse(p.cruxPanelsJson);
        const unlocked = att ? (JSON.parse(att.unlockedPanelIds) as string[]) : [];
        return {
          slug: p.slug,
          title: p.title,
          volumeNumber: p.volumeNumber,
          volumeName: p.volumeName,
          topic: p.topic,
          sourceTag: p.sourceTag,
          rating: p.rating,
          accentColor: p.accentColor,
          brief: p.brief,
          constraints: p.constraints,
          totalPanels: cruxes.length,
          unlockedCount: unlocked.length,
          reasoningScore: att?.reasoningScore ?? 0,
          solved: att?.solved ?? false,
        };
      }),
    });
  } catch (err) {
    console.error("Bootstrap error:", err);
    return NextResponse.json({ error: "Failed to bootstrap BUCKSHOT" }, { status: 500 });
  }
}
