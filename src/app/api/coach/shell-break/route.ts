import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ensureSeeded } from "@/lib/rating";
import { runShellBreakCoach } from "@/lib/ai";
import type { CruxPanel } from "@/lib/seed-data";

export async function POST(req: Request) {
  try {
    const profile = await ensureSeeded();
    const body = await req.json();
    const { slug, message, forceBreakSeal } = body as {
      slug: string;
      message?: string;
      forceBreakSeal?: boolean;
    };

    const problem = await prisma.problem.findUnique({ where: { slug } });
    if (!problem) {
      return NextResponse.json({ error: "Problem not found" }, { status: 404 });
    }

    const cruxPanels = JSON.parse(problem.cruxPanelsJson) as CruxPanel[];
    let attempt = await prisma.shellBreakAttempt.findUnique({ where: { problemSlug: slug } });

    if (!attempt) {
      attempt = await prisma.shellBreakAttempt.create({
        data: {
          problemSlug: slug,
          submittedCode: JSON.parse(problem.starterCodeJson).typescript,
        },
      });
    }

    if (forceBreakSeal) {
      const updated = await prisma.shellBreakAttempt.update({
        where: { problemSlug: slug },
        data: { sealBroken: true },
      });
      return NextResponse.json({
        attempt: {
          ...updated,
          unlockedPanelIds: JSON.parse(updated.unlockedPanelIds),
          messages: JSON.parse(updated.messagesJson),
        },
      });
    }

    if (!message || !message.trim()) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    const alreadyUnlocked = JSON.parse(attempt.unlockedPanelIds) as string[];
    const history = JSON.parse(attempt.messagesJson) as Array<{
      role: string;
      text: string;
      expression?: string;
      sfx?: string;
    }>;

    const dossierContext = `Codename: ${profile.codename} | Rating: ${profile.overallRating} | Target: ${profile.targetCompany}
Weaknesses: ${profile.weaknessesJson}
Strengths: ${profile.strengthsJson}
Directives: ${profile.senseiDirectives}`;

    const coach = await runShellBreakCoach({
      problemTitle: problem.title,
      problemBrief: problem.brief,
      cruxPanels,
      alreadyUnlocked,
      currentScore: attempt.reasoningScore,
      userMessage: message.trim(),
      dossierContext,
      history,
    });

    const validNewIds = coach.newlyUnlockedIds.filter(
      (id) => cruxPanels.some((c) => c.id === id) && !alreadyUnlocked.includes(id)
    );
    const mergedUnlocked = [...alreadyUnlocked, ...validNewIds];
    const allUnlocked = mergedUnlocked.length >= cruxPanels.length;

    const nextMessages = [
      ...history,
      { role: "user", text: message.trim() },
      {
        role: "sensei",
        text: coach.reply,
        expression: coach.expression,
        sfx: coach.sfx,
      },
    ];

    const updated = await prisma.shellBreakAttempt.update({
      where: { problemSlug: slug },
      data: {
        unlockedPanelIds: JSON.stringify(mergedUnlocked),
        reasoningScore: Math.max(attempt.reasoningScore, coach.reasoningScore),
        sealBroken: attempt.sealBroken || allUnlocked,
        messagesJson: JSON.stringify(nextMessages),
      },
    });

    // Reward XP + slight Elo bump whenever a Breakthrough Panel floods with color!
    if (validNewIds.length > 0) {
      const topicRatings = JSON.parse(profile.topicRatingsJson) as Record<string, number>;
      topicRatings[problem.topic] = Math.min(3500, (topicRatings[problem.topic] ?? 1400) + validNewIds.length * 14);
      const vals = Object.values(topicRatings);
      const avg = Math.round(vals.reduce((a, b) => a + b, 0) / vals.length);

      await prisma.learnerProfile.update({
        where: { id: "default-runner" },
        data: {
          xp: profile.xp + validNewIds.length * 80,
          overallRating: avg,
          topicRatingsJson: JSON.stringify(topicRatings),
        },
      });
    }

    return NextResponse.json({
      newlyUnlockedIds: validNewIds,
      engineLabel: coach.engineLabel,
      attempt: {
        ...updated,
        unlockedPanelIds: mergedUnlocked,
        messages: nextMessages,
      },
    });
  } catch (err) {
    console.error("Shell Break coach error:", err);
    return NextResponse.json({ error: "Sensei Reiko hit a snag" }, { status: 500 });
  }
}
