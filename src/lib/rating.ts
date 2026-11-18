import { prisma } from "./prisma";
import {
  DEFAULT_BLUEPRINT_EDGES,
  DEFAULT_BLUEPRINT_NODES,
  DEFAULT_SPRINT_AGENDA,
  DEFAULT_TOPIC_RATINGS,
  SEED_PROBLEMS,
} from "./seed-data";

export interface MagazineCardSlot {
  slotLabel: string;
  roleBadge: string;
  problemSlug: string;
  reason: string;
}

export function getRankFromRating(rating: number): { grade: string; title: string; color: string } {
  if (rating >= 2200) return { grade: "SS", title: "GRANDMASTER ARCHITECT", color: "#FF3358" };
  if (rating >= 1900) return { grade: "S", title: "S-RANK PHANTOM", color: "#7C4DFF" };
  if (rating >= 1650) return { grade: "A", title: "A-RANK STRIKER", color: "#00C2FF" };
  if (rating >= 1400) return { grade: "B", title: "B-RANK TACTICIAN", color: "#FFC82C" };
  if (rating >= 1150) return { grade: "C", title: "C-RANK CHALLENGER", color: "#00C875" };
  return { grade: "D", title: "D-RANK INITIATE", color: "#FF6FAE" };
}

export function dealAdaptiveMagazine(
  overallRating: number,
  topicRatings: Record<string, number>,
  problems: Array<{ slug: string; topic: string; rating: number; volumeNumber: number }>
): MagazineCardSlot[] {
  const used = new Set<string>();
  const weakestTopic = Object.entries(topicRatings).sort((a, b) => a[1] - b[1])[0]?.[0] ?? "Concurrency";

  const pickBest = (predicate: (p: (typeof problems)[number]) => number) => {
    const candidates = problems.filter((p) => !used.has(p.slug));
    if (!candidates.length) return problems[0];
    candidates.sort((a, b) => predicate(a) - predicate(b));
    const chosen = candidates[0];
    used.add(chosen.slug);
    return chosen;
  };

  const warmup = pickBest((p) => Math.abs(p.rating - (overallRating - 220)));
  const weakBoss = pickBest((p) => (p.topic === weakestTopic ? 0 : 500) + Math.abs(p.rating - overallRating));
  const coreTarget = pickBest((p) => Math.abs(p.rating - overallRating));
  const limitBreak = pickBest((p) => Math.abs(p.rating - (overallRating + 260)));
  const ironworks = pickBest((p) => (p.volumeNumber >= 3 ? 0 : 400) + Math.abs(p.rating - overallRating));

  return [
    {
      slotLabel: "ROUND 01",
      roleBadge: "WARM-UP",
      problemSlug: warmup.slug,
      reason: `Calibrated below your ${overallRating} PL to lock in speed & proofs.`,
    },
    {
      slotLabel: "ROUND 02",
      roleBadge: "WEAK-SPOT BOSS",
      problemSlug: weakBoss.slug,
      reason: `Targets your lowest radar stat (${weakestTopic}) for maximum Elo gain.`,
    },
    {
      slotLabel: "ROUND 03",
      roleBadge: "CORE ZONE",
      problemSlug: coreTarget.slug,
      reason: `Dead-center in your Vygotsky ZPD sweet spot (~${overallRating} PL).`,
    },
    {
      slotLabel: "ROUND 04",
      roleBadge: "LIMIT BREAK",
      problemSlug: limitBreak.slug,
      reason: `Stretch encounter (+250 PL) to force new invariant synthesis.`,
    },
    {
      slotLabel: "ROUND 05",
      roleBadge: "SYSTEMS WILDCARD",
      problemSlug: ironworks.slug,
      reason: `Real production engineering from Vol. 03–05 beyond standard puzzles.`,
    },
  ];
}

async function ensureSqliteTablesExist() {
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "LearnerProfile" (
      "id" TEXT NOT NULL PRIMARY KEY DEFAULT 'default-runner',
      "codename" TEXT NOT NULL DEFAULT 'SHADOW_DEV',
      "rankTitle" TEXT NOT NULL DEFAULT 'B-RANK TACTICIAN',
      "overallRating" INTEGER NOT NULL DEFAULT 1480,
      "streakDays" INTEGER NOT NULL DEFAULT 7,
      "xp" INTEGER NOT NULL DEFAULT 2450,
      "targetCompany" TEXT NOT NULL DEFAULT 'Frontier AI Lab / Staff Loop',
      "sprintWeeksLeft" INTEGER NOT NULL DEFAULT 5,
      "topicRatingsJson" TEXT NOT NULL,
      "strengthsJson" TEXT NOT NULL,
      "weaknessesJson" TEXT NOT NULL,
      "senseiDirectives" TEXT NOT NULL DEFAULT 'Challenge my invariants relentlessly. Never hand me full code before I prove complexity.',
      "magazineHandJson" TEXT NOT NULL,
      "sprintAgendaJson" TEXT NOT NULL,
      "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "Problem" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "slug" TEXT NOT NULL UNIQUE,
      "title" TEXT NOT NULL,
      "volumeNumber" INTEGER NOT NULL,
      "volumeName" TEXT NOT NULL,
      "topic" TEXT NOT NULL,
      "sourceTag" TEXT NOT NULL,
      "rating" INTEGER NOT NULL,
      "accentColor" TEXT NOT NULL,
      "brief" TEXT NOT NULL,
      "constraints" TEXT NOT NULL,
      "cruxPanelsJson" TEXT NOT NULL,
      "starterCodeJson" TEXT NOT NULL,
      "testCasesJson" TEXT NOT NULL
    );
  `);
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "ShellBreakAttempt" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "problemSlug" TEXT NOT NULL UNIQUE,
      "unlockedPanelIds" TEXT NOT NULL DEFAULT '[]',
      "reasoningScore" INTEGER NOT NULL DEFAULT 0,
      "sealBroken" BOOLEAN NOT NULL DEFAULT false,
      "solved" BOOLEAN NOT NULL DEFAULT false,
      "messagesJson" TEXT NOT NULL DEFAULT '[]',
      "submittedCode" TEXT NOT NULL DEFAULT '',
      "language" TEXT NOT NULL DEFAULT 'typescript',
      "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY ("problemSlug") REFERENCES "Problem" ("slug") ON DELETE CASCADE ON UPDATE CASCADE
    );
  `);
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "BlueprintSession" (
      "id" TEXT NOT NULL PRIMARY KEY DEFAULT 'default-blueprint',
      "scenarioTitle" TEXT NOT NULL DEFAULT 'Distributed Real-Time Manga Streaming & Low-Latency Feed',
      "nodesJson" TEXT NOT NULL,
      "edgesJson" TEXT NOT NULL,
      "messagesJson" TEXT NOT NULL DEFAULT '[]',
      "rubricJson" TEXT NOT NULL DEFAULT '{}',
      "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);
}

export async function ensureSeeded() {
  if (process.env.VERCEL) {
    await ensureSqliteTablesExist();
  }
  let problemCount = 0;
  try {
    problemCount = await prisma.problem.count();
  } catch {
    await ensureSqliteTablesExist();
    problemCount = await prisma.problem.count();
  }
  if (problemCount < SEED_PROBLEMS.length) {
    for (const p of SEED_PROBLEMS) {
      await prisma.problem.upsert({
        where: { slug: p.slug },
        update: {
          title: p.title,
          volumeNumber: p.volumeNumber,
          volumeName: p.volumeName,
          topic: p.topic,
          sourceTag: p.sourceTag,
          rating: p.rating,
          accentColor: p.accentColor,
          brief: p.brief,
          constraints: p.constraints,
          cruxPanelsJson: JSON.stringify(p.cruxPanels),
          starterCodeJson: JSON.stringify(p.starterCode),
          testCasesJson: JSON.stringify(p.testCases),
        },
        create: {
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
          cruxPanelsJson: JSON.stringify(p.cruxPanels),
          starterCodeJson: JSON.stringify(p.starterCode),
          testCasesJson: JSON.stringify(p.testCases),
        },
      });
    }
  }

  let profile = await prisma.learnerProfile.findUnique({ where: { id: "default-runner" } });
  if (!profile) {
    const allProblems = await prisma.problem.findMany();
    const initialHand = dealAdaptiveMagazine(1480, DEFAULT_TOPIC_RATINGS, allProblems);
    profile = await prisma.learnerProfile.create({
      data: {
        id: "default-runner",
        codename: "SHADOW_DEV",
        rankTitle: "B-RANK TACTICIAN",
        overallRating: 1480,
        streakDays: 7,
        xp: 2450,
        targetCompany: "Frontier AI Lab / Staff Loop",
        sprintWeeksLeft: 5,
        topicRatingsJson: JSON.stringify(DEFAULT_TOPIC_RATINGS),
        strengthsJson: JSON.stringify([
          "Fast complexity estimation & clean TypeScript implementations",
          "Strong intuition on LLM serving bottlenecks & RAG latency",
        ]),
        weaknessesJson: JSON.stringify([
          "Jumps to coding before proving greedy or monotonic invariants",
          "Needs deeper muscle memory on lock-free memory ordering & false sharing",
        ]),
        senseiDirectives:
          "Push me with sharp Socratic hints. Never leak code before I unlock every Breakthrough Panel!",
        magazineHandJson: JSON.stringify(initialHand),
        sprintAgendaJson: JSON.stringify(DEFAULT_SPRINT_AGENDA),
      },
    });
  }

  const bp = await prisma.blueprintSession.findUnique({ where: { id: "default-blueprint" } });
  if (!bp) {
    await prisma.blueprintSession.create({
      data: {
        id: "default-blueprint",
        nodesJson: JSON.stringify(DEFAULT_BLUEPRINT_NODES),
        edgesJson: JSON.stringify(DEFAULT_BLUEPRINT_EDGES),
        messagesJson: JSON.stringify([
          {
            role: "sensei",
            expression: "idle",
            text: "Welcome to VOL. 04 BLUEPRINT! Speak or type your architecture plan for our 5M DAU Manga Streaming Platform. I'll propose diagram blocks on the board—nothing lands until YOU stamp APPROVE.",
          },
        ]),
      },
    });
  }

  return profile;
}
