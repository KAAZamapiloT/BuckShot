import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { repoUrl } = (await req.json()) as { repoUrl: string };
    const cleaned = (repoUrl || "").trim().replace(/^https?:\/\/github\.com\//i, "").replace(/\.git$/, "");
    const parts = cleaned.split("/").filter(Boolean);

    if (parts.length < 2) {
      return NextResponse.json({ error: "Enter a GitHub repo as `owner/repo` or full GitHub URL." }, { status: 400 });
    }

    const [owner, repo] = parts;
    let meta = {
      name: `${owner}/${repo}`,
      description: "Custom engineering repository synced for Staff-level project interrogation.",
      language: "TypeScript / Systems",
      stars: 0,
      files: ["src/core/engine.ts", "src/api/router.ts", "prisma/schema.prisma"],
    };

    try {
      const res = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
        headers: { "User-Agent": "BUCKSHOT-Coach" },
      });
      if (res.ok) {
        const json = await res.json();
        meta = {
          name: json.full_name || `${owner}/${repo}`,
          description: json.description || meta.description,
          language: json.language || meta.language,
          stars: json.stargazers_count || 0,
          files: meta.files,
        };
      }
    } catch {
      // Offline/sandbox friendly fallback
    }

    const questions = [
      {
        tag: "SCALING BOTTLENECK",
        accent: "#FF3358",
        question: `In ${meta.name}, if write traffic jumps 50x overnight, which single component or lock becomes your p99 latency cliff first—and how would you isolate it?`,
      },
      {
        tag: "FAILURE MODE",
        accent: "#00C2FF",
        question: `Walk Sensei Reiko through a partial failure in ${meta.name}: what happens if a downstream dependency times out halfway through a state mutation? Are your retries idempotent?`,
      },
      {
        tag: "DATA MODEL TRADEOFF",
        accent: "#FFC82C",
        question: `Why did you choose your primary storage & runtime stack (${meta.language}) for ${meta.name}, and what exact workload metric would force a rewrite or sharding migration?`,
      },
      {
        tag: "OBSERVABILITY & PROOF",
        accent: "#7C4DFF",
        question: `Suppose users report intermittent slowness on ${meta.name} every 10 minutes. Which 3 metrics, traces, or flamegraphs do you pull first to prove root cause within 5 minutes?`,
      },
    ];

    return NextResponse.json({ meta, questions });
  } catch (err) {
    console.error("GitHub sync error:", err);
    return NextResponse.json({ error: "Failed to generate project interrogation deck" }, { status: 500 });
  }
}
