import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ensureSeeded } from "@/lib/rating";

export async function GET(req: Request) {
  await ensureSeeded();
  const { searchParams } = new URL(req.url);
  const slug = searchParams.get("slug");

  if (slug) {
    const problem = await prisma.problem.findUnique({ where: { slug } });
    if (!problem) {
      return NextResponse.json({ error: "Problem not found" }, { status: 404 });
    }
    let attempt = await prisma.shellBreakAttempt.findUnique({ where: { problemSlug: slug } });
    if (!attempt) {
      const cruxes = JSON.parse(problem.cruxPanelsJson);
      attempt = await prisma.shellBreakAttempt.create({
        data: {
          problemSlug: slug,
          unlockedPanelIds: "[]",
          messagesJson: JSON.stringify([
            {
              role: "sensei",
              expression: "idle",
              sfx: "DRAW!",
              text: `Welcome to SHELL BREAK: "${problem.title}". Before I unseal the code editor, prove the ${cruxes.length} Breakthrough Panels on the left page. Start with PANEL 01 (${cruxes[0]?.title}): ${cruxes[0]?.hint}`,
            },
          ]),
          submittedCode: JSON.parse(problem.starterCodeJson).typescript,
        },
      });
    }

    return NextResponse.json({
      problem: {
        ...problem,
        cruxPanels: JSON.parse(problem.cruxPanelsJson),
        starterCode: JSON.parse(problem.starterCodeJson),
        testCases: JSON.parse(problem.testCasesJson),
      },
      attempt: {
        ...attempt,
        unlockedPanelIds: JSON.parse(attempt.unlockedPanelIds),
        messages: JSON.parse(attempt.messagesJson),
      },
    });
  }

  const problems = await prisma.problem.findMany({ orderBy: { volumeNumber: "asc" } });
  const attempts = await prisma.shellBreakAttempt.findMany();
  const map = Object.fromEntries(attempts.map((a) => [a.problemSlug, a]));

  return NextResponse.json({
    problems: problems.map((p) => {
      const att = map[p.slug];
      const cruxes = JSON.parse(p.cruxPanelsJson);
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
        totalPanels: cruxes.length,
        unlockedCount: att ? JSON.parse(att.unlockedPanelIds).length : 0,
        solved: att?.solved ?? false,
      };
    }),
  });
}
