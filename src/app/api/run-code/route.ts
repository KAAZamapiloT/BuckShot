import { NextResponse } from "next/server";
import vm from "node:vm";
import { prisma } from "@/lib/prisma";
import { SEED_PROBLEMS } from "@/lib/seed-data";

export async function POST(req: Request) {
  try {
    const { slug, code, language } = (await req.json()) as {
      slug: string;
      code: string;
      language: string;
    };

    const seed = SEED_PROBLEMS.find((p) => p.slug === slug);
    if (!seed) {
      return NextResponse.json({ error: "Problem not found" }, { status: 404 });
    }

    if (language !== "typescript") {
      return NextResponse.json({
        passedAll: false,
        note: `Local instant sandbox executes TypeScript/JS directly. To judge ${language.toUpperCase()} natively, connect our optional Piston or Rust Axum Judge sidecar!`,
        results: seed.testCases.map((tc) => ({
          label: tc.label,
          passed: false,
          expected: JSON.stringify(tc.expected),
          actual: `Switch to TypeScript for instant in-app execution (or hook Piston/Rust judge)`,
        })),
      });
    }

    const results: Array<{ label: string; passed: boolean; expected: string; actual: string }> = [];

    for (const tc of seed.testCases) {
      try {
        const sandbox = { __args: tc.args, __result: undefined as unknown };
        const script = new vm.Script(
          `${code}\n; __result = ${seed.functionName}(...__args);`
        );
        script.runInNewContext(sandbox, { timeout: 1000 });
        const expectedStr = JSON.stringify(tc.expected);
        const actualStr = JSON.stringify(sandbox.__result);
        results.push({
          label: tc.label,
          passed: expectedStr === actualStr,
          expected: expectedStr,
          actual: actualStr ?? "undefined",
        });
      } catch (e: unknown) {
        results.push({
          label: tc.label,
          passed: false,
          expected: JSON.stringify(tc.expected),
          actual: `Error: ${e instanceof Error ? e.message : String(e)}`,
        });
      }
    }

    const passedAll = results.length > 0 && results.every((r) => r.passed);

    await prisma.shellBreakAttempt.upsert({
      where: { problemSlug: slug },
      update: {
        submittedCode: code,
        language,
        solved: passedAll ? true : undefined,
      },
      create: {
        problemSlug: slug,
        submittedCode: code,
        language,
        solved: passedAll,
      },
    });

    if (passedAll) {
      const profile = await prisma.learnerProfile.findUnique({ where: { id: "default-runner" } });
      if (profile) {
        await prisma.learnerProfile.update({
          where: { id: "default-runner" },
          data: { xp: profile.xp + 150 },
        });
      }
    }

    return NextResponse.json({ passedAll, results });
  } catch (err) {
    console.error("Run code error:", err);
    return NextResponse.json({ error: "Execution failed" }, { status: 500 });
  }
}
