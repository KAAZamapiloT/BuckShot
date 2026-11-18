import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { resumeText } = (await req.json()) as { resumeText: string };
    const text = (resumeText || "").trim();
    if (text.length < 25) {
      return NextResponse.json({ error: "Paste at least a few bullet points from your resume." }, { status: 400 });
    }

    const hasMetrics = /\d+%|\d+x|\d+ms|\$\d+|\d+k|\d+m/i.test(text);
    const hasSystems = /(redis|kafka|postgres|distributed|cache|latency|kubernetes|rust|c\+\+|llm|rag|concurrency|throughput)/i.test(text);
    const hasOwnership = /(architected|designed|built|reduced|led|scaled|eliminated|migrated)/i.test(text);

    const score = Math.min(
      96,
      54 + (hasMetrics ? 16 : 0) + (hasSystems ? 14 : 0) + (hasOwnership ? 10 : 0)
    );

    return NextResponse.json({
      score,
      grade: score >= 88 ? "S" : score >= 76 ? "A" : score >= 64 ? "B" : "C",
      verdict:
        score >= 85
          ? "High-signal engineering impact! Recruiters & Staff interviewers will immediately probe your architecture claims."
          : "Solid foundation, but too many bullets read like task descriptions instead of measurable engineering breakthroughs.",
      highlights: [
        hasMetrics
          ? "Strong quantified latency / scale metrics detected."
          : "Missing hard numbers (p99 latency, QPS, cost saved, memory reduced). Add quantified deltas to top 3 bullets.",
        hasSystems
          ? "Modern systems / AI engineering keywords present (passes Staff & Frontier AI filters)."
          : "Inject concrete systems depth: state storage engines, concurrency primitives, or bottlenecks solved.",
        hasOwnership
          ? "Strong action verbs demonstrating technical ownership."
          : "Replace passive phrasing ('helped with', 'worked on') with decisive ownership verbs ('Architected', 'Cut p99 from 420ms -> 38ms').",
      ],
      rewrittenExample:
        "Architected a lock-free ingestion pipeline handling 48K events/sec, cutting p99 tail latency by 64% (310ms → 112ms) and eliminating Redis hot-key stalls.",
    });
  } catch (err) {
    console.error("Resume Forge error:", err);
    return NextResponse.json({ error: "Resume analysis failed" }, { status: 500 });
  }
}
