import { NextResponse } from "next/server";
import { generateText } from "ai";
import { ensureSeeded } from "@/lib/rating";
import { getActiveModel } from "@/lib/ai";

export async function POST(req: Request) {
  try {
    const profile = await ensureSeeded();
    const { message, currentPath } = (await req.json()) as {
      message: string;
      currentPath?: string;
    };

    if (!message?.trim()) {
      return NextResponse.json({ error: "Empty question" }, { status: 400 });
    }

    const active = getActiveModel();
    const dossierContext = `Codename: ${profile.codename} | Power Rating: ${profile.overallRating} | Target: ${profile.targetCompany}
Weaknesses: ${profile.weaknessesJson}
Strengths: ${profile.strengthsJson}
Directives: ${profile.senseiDirectives}
Current Page: ${currentPath || "/"}`;

    if (active) {
      try {
        const { text } = await generateText({
          model: active.model,
          system: `You are Sensei Reiko, an electrifying, deeply technical anime manga interview coach inside BUCKSHOT.
Keep answers punchy (3-5 sentences), technically accurate, and grounded in active learning (Vygotsky ZPD).
Reference the user's dossier naturally when relevant. Never write walls of fluff.\n\n${dossierContext}`,
          prompt: message.trim(),
        });
        return NextResponse.json({
          reply: text,
          expression: "fired-up",
          sfx: "ANSWER!",
          engineLabel: active.label,
        });
      } catch (err) {
        console.error("Ask Sensei live fallback:", err);
      }
    }

    // Smart Local Sensei Quick-Assistant
    const q = message.toLowerCase();
    let reply = "";
    let expression: "idle" | "thinking" | "fired-up" = "thinking";
    let sfx = "SENSEI!";

    if (q.includes("dp") || q.includes("dynamic programming")) {
      reply = `Don't memorize DP tables—define the STATE first! Ask: (1) What is the smallest subproblem index? (2) What exact invariant does dp[i] promise? (3) Does the transition depend only on strictly smaller subproblems? Try Vol. 02's "Weighted Event Arc Scheduler" to sharpen your DP + Binary Search jump.`;
      sfx = "DP STATE!";
    } else if (q.includes("system design") || q.includes("kafka") || q.includes("redis") || q.includes("scale")) {
      reply = `In System Design, ALWAYS state numbers before drawing boxes! Estimate read/write QPS, payload bytes, and hot-key skew first. If reads >> writes, propose Redis cache-aside; if burst writes choke Postgres, drop a Kafka event log in VOL. 04 Blueprint and test it with me!`;
      expression = "fired-up";
      sfx = "SCALE UP!";
    } else if (q.includes("concurrency") || q.includes("lock") || q.includes("atomic") || q.includes("thread")) {
      reply = `Lock-free thinking starts with ownership! Ask who writes each variable, what memory ordering publishes the payload (Acquire-Release vs SeqCst), and whether adjacent atomics share a 64-byte cache line (false sharing). Jump into VOL. 03 Ironworks' Ring Buffer to drill this live.`;
      sfx = "ATOMIC!";
    } else if (q.includes("ai") || q.includes("llm") || q.includes("rag") || q.includes("kv") || q.includes("mcp")) {
      reply = `Frontier AI interviews test SYSTEMS, not prompt tricks! Know why contiguous KV cache wastes VRAM (PagedAttention solves it via OS block tables), why hybrid BM25 + dense vector search uses Reciprocal Rank Fusion, and how to build deterministic eval harnesses.`;
      expression = "fired-up";
      sfx = "FRONTIER!";
    } else if (q.includes("study") || q.includes("plan") || q.includes("sprint") || q.includes("weak")) {
      reply = `According to your Dossier (${profile.codename}, PL ${profile.overallRating}, target: ${profile.targetCompany}), your fastest Elo jump is attacking your lowest radar axis via Round 02 in The Chamber, then proving invariants aloud in Shell Break before unlocking the editor!`;
      sfx = "TACTICS!";
    } else {
      reply = `Great question, ${profile.codename}! Break it into first principles: (1) What is the exact bottleneck or brute-force bound? (2) Which invariant eliminates redundant work? (3) What edge case breaks the naive proof? Tell me your initial hypothesis and I'll challenge it!`;
      sfx = "PROVE IT!";
    }

    return NextResponse.json({
      reply,
      expression,
      sfx,
      engineLabel: "BUCKSHOT Sensei Engine (Local Mode)",
    });
  } catch (err) {
    console.error("Ask Sensei error:", err);
    return NextResponse.json({ error: "Sensei Reiko couldn't respond" }, { status: 500 });
  }
}
