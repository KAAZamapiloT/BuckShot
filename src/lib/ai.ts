import { generateObject } from "ai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createOpenAI } from "@ai-sdk/openai";
import { createAnthropic } from "@ai-sdk/anthropic";
import { z } from "zod";
import type { CruxPanel } from "./seed-data";

export function getActiveModel() {
  const provider = (process.env.AI_PROVIDER || "auto").toLowerCase();

  if ((provider === "gemini" || provider === "auto") && process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
    const google = createGoogleGenerativeAI({
      apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
    });
    return { model: google("gemini-2.5-flash"), label: "Gemini 2.5 Flash (Live)" };
  }

  if ((provider === "openai" || provider === "auto") && process.env.OPENAI_API_KEY) {
    const openai = createOpenAI({ apiKey: process.env.OPENAI_API_KEY });
    return { model: openai("gpt-4o-mini"), label: "OpenAI GPT-4o-mini (Live)" };
  }

  if ((provider === "anthropic" || provider === "auto") && process.env.ANTHROPIC_API_KEY) {
    const anthropic = createAnthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    return { model: anthropic("claude-3-5-haiku-latest"), label: "Anthropic Claude 3.5 Haiku (Live)" };
  }

  return null;
}

const ShellBreakResponseSchema = z.object({
  newlyUnlockedIds: z.array(z.string()),
  reasoningScore: z.number().min(0).max(100),
  expression: z.enum(["idle", "thinking", "fired-up"]),
  sfx: z.string(),
  reply: z.string(),
  memoryNote: z.string().optional(),
});

export type ShellBreakCoachResult = z.infer<typeof ShellBreakResponseSchema> & {
  engineLabel: string;
};

export async function runShellBreakCoach(params: {
  problemTitle: string;
  problemBrief: string;
  cruxPanels: CruxPanel[];
  alreadyUnlocked: string[];
  currentScore: number;
  userMessage: string;
  dossierContext: string;
  history: Array<{ role: string; text: string }>;
}): Promise<ShellBreakCoachResult> {
  const active = getActiveModel();
  const remaining = params.cruxPanels.filter((c) => !params.alreadyUnlocked.includes(c.id));

  if (active) {
    try {
      const { object } = await generateObject({
        model: active.model,
        schema: ShellBreakResponseSchema,
        system: `You are Sensei Reiko, an electrifying, sharp-minded anime manga coding coach inside BUCKSHOT.
PEDAGOGY (Vygotsky ZPD):
- NEVER dump full solution code while panels remain locked.
- Give razor-sharp, concise Socratic nudges (2-4 sentences) with subtle manga mentor flair.
- Evaluate the user's latest message against the remaining Breakthrough Panels below.
- Unlock a panel ONLY if the user genuinely articulated its core idea/invariant (not a vague guess).
- Set expression to "fired-up" if they unlocked >=1 panel, "thinking" if probing/correcting, "idle" if steady.
- Provide a short comic SFX like "FLASH!", "SHATTER!", "THINK...", "BREAKTHROUGH!", or "OVERDRIVE!".

LEARNER DOSSIER MEMORY:
${params.dossierContext}

PROBLEM: ${params.problemTitle}
${params.problemBrief}

ALREADY UNLOCKED PANELS: ${JSON.stringify(params.alreadyUnlocked)}
REMAINING LOCKED PANELS:
${JSON.stringify(
  remaining.map((r) => ({ id: r.id, title: r.title, criteria: r.criteria })),
  null,
  2
)}`,
        prompt: `Recent chat:\n${params.history
          .slice(-6)
          .map((h) => `${h.role.toUpperCase()}: ${h.text}`)
          .join("\n")}\n\nUSER LATEST MESSAGE:\n${params.userMessage}`,
      });

      return { ...object, engineLabel: active.label };
    } catch (err) {
      console.error("Live AI fallback triggered:", err);
    }
  }

  // Smart Local Sensei Fallback Engine (zero-key interactive mode!)
  const lower = params.userMessage.toLowerCase();
  const wantsHint = lower.includes("hint") || lower.includes("stuck") || lower.includes("help") || lower.includes("clue");
  const newlyUnlocked: string[] = [];

  for (const panel of remaining) {
    const matchedHits = panel.keywords.filter((kw) => lower.includes(kw.toLowerCase()));
    if (matchedHits.length >= 2 || (matchedHits.length === 1 && lower.length > 38)) {
      newlyUnlocked.push(panel.id);
    }
  }

  const totalUnlocked = params.alreadyUnlocked.length + newlyUnlocked.length;
  const ratio = totalUnlocked / Math.max(1, params.cruxPanels.length);
  const nextScore = Math.min(100, Math.max(params.currentScore, Math.round(ratio * 92 + (newlyUnlocked.length > 0 ? 8 : 4))));

  if (newlyUnlocked.length > 0) {
    const unlockedNames = params.cruxPanels
      .filter((p) => newlyUnlocked.includes(p.id))
      .map((p) => `"${p.title}"`)
      .join(" & ");
    const nextLocked = params.cruxPanels.find(
      (p) => !params.alreadyUnlocked.includes(p.id) && !newlyUnlocked.includes(p.id)
    );

    const reply = nextLocked
      ? `DIRECT HIT!! You just shattered ${unlockedNames}—watch the color flood into that panel! Now lock onto ${nextLocked.panelNo} (${nextLocked.title}): ${nextLocked.hint}`
      : `ALL BREAKTHROUGH PANELS SHATTERED!! Your logic is airtight and the Code Seal is officially BROKEN. Step into the editor on the right and fire your implementation!`;

    return {
      newlyUnlockedIds: newlyUnlocked,
      reasoningScore: totalUnlocked === params.cruxPanels.length ? Math.max(nextScore, 95) : nextScore,
      expression: "fired-up",
      sfx: totalUnlocked === params.cruxPanels.length ? "SEAL BROKEN!!" : "CRUX HIT!",
      reply,
      engineLabel: "BUCKSHOT Sensei Engine (Local Mode — add API key in .env for Live LLM)",
    };
  }

  const target = remaining[0];
  if (!target) {
    return {
      newlyUnlockedIds: [],
      reasoningScore: Math.max(params.currentScore, 95),
      expression: "idle",
      sfx: "READY!",
      reply: "Every panel is already colored and unlocked! Run your code against the test suite on the right—or ask me to critique your edge cases.",
      engineLabel: "BUCKSHOT Sensei Engine (Local Mode)",
    };
  }

  const reply = wantsHint
    ? `ZPD Nudge for ${target.panelNo} (${target.title}): ${target.hint} Tell me the exact invariant in your own words—don't guess, prove it!`
    : `Interesting angle, but you haven't nailed ${target.panelNo} (${target.title}) yet. Push deeper: ${target.hint}`;

  return {
    newlyUnlockedIds: [],
    reasoningScore: Math.min(90, params.currentScore + 3),
    expression: "thinking",
    sfx: "HMM...",
    reply,
    engineLabel: "BUCKSHOT Sensei Engine (Local Mode — add API key in .env for Live LLM)",
  };
}

export interface BlueprintProposal {
  id: string;
  label: string;
  color: string;
  connectFrom: string;
  edgeLabel: string;
  rationale: string;
}

const BlueprintResponseSchema = z.object({
  reply: z.string(),
  expression: z.enum(["idle", "thinking", "fired-up"]),
  proposals: z.array(
    z.object({
      id: z.string(),
      label: z.string(),
      color: z.string(),
      connectFrom: z.string(),
      edgeLabel: z.string(),
      rationale: z.string(),
    })
  ),
  rubric: z.object({
    keyIdeas: z.number().min(0).max(100),
    conceptChecks: z.number().min(0).max(100),
    architecture: z.number().min(0).max(100),
    communication: z.number().min(0).max(100),
    summary: z.string(),
  }),
});

export async function runBlueprintCoach(params: {
  userMessage: string;
  existingNodes: Array<{ id: string; label: string }>;
  dossierContext: string;
}) {
  const active = getActiveModel();
  if (active) {
    try {
      const { object } = await generateObject({
        model: active.model,
        schema: BlueprintResponseSchema,
        system: `You are Sensei Reiko running a Voice-to-Board System Design session in BUCKSHOT (VOL. 04 BLUEPRINT).
Propose 1-2 concrete architecture nodes ONLY if the user discusses scaling/caching/queues/CDN/sharding/replicas/observability.
Connect each proposal from an existing node ID (${params.existingNodes.map((n) => n.id).join(", ")}).
Use vibrant manga hex colors (#00C2FF, #FFC82C, #00C875, #7C4DFF, #FF3358).
Grade the 4 interview rubric pillars honestly based on architecture depth so far.
Learner Dossier:\n${params.dossierContext}`,
        prompt: `Current board nodes: ${JSON.stringify(params.existingNodes)}\nUser says: ${params.userMessage}`,
      });
      return { ...object, engineLabel: active.label };
    } catch (err) {
      console.error("Blueprint AI fallback:", err);
    }
  }

  const lower = params.userMessage.toLowerCase();
  const proposals: BlueprintProposal[] = [];

  if (lower.includes("cache") || lower.includes("redis") || lower.includes("read") || lower.includes("latency")) {
    proposals.push({
      id: `redis-${Date.now()}`,
      label: "⚡ Redis Cluster (Hot Chapter Cache)",
      color: "#FFC82C",
      connectFrom: "service",
      edgeLabel: "cache-aside (<2ms)",
      rationale: "Absorbs 95%+ hot manga chapter reads before hitting Primary PostgreSQL.",
    });
  }
  if (lower.includes("queue") || lower.includes("kafka") || lower.includes("async") || lower.includes("event") || lower.includes("write")) {
    proposals.push({
      id: `kafka-${Date.now() + 1}`,
      label: "📨 Kafka Event Bus (Fanout)",
      color: "#7C4DFF",
      connectFrom: "service",
      edgeLabel: "async publish",
      rationale: "Decouples spike writes (likes, bookmarks, view counts) and prevents DB lock storms.",
    });
  }
  if (lower.includes("cdn") || lower.includes("image") || lower.includes("s3") || lower.includes("media") || lower.includes("manga")) {
    proposals.push({
      id: `cdn-${Date.now() + 2}`,
      label: "🌐 Edge CDN + Object Storage",
      color: "#00C875",
      connectFrom: "client",
      edgeLabel: "static panel WebP",
      rationale: "Serves heavy colored manga spread images from edge PoPs near readers.",
    });
  }
  if (lower.includes("replica") || lower.includes("shard") || lower.includes("db") || lower.includes("postgres")) {
    proposals.push({
      id: `replica-${Date.now() + 3}`,
      label: "🗄️ Read Replicas (Sharded)",
      color: "#00C2FF",
      connectFrom: "db",
      edgeLabel: "WAL replication",
      rationale: "Splits heavy catalog queries away from primary write leader.",
    });
  }
  if (proposals.length === 0) {
    proposals.push({
      id: `rate-${Date.now()}`,
      label: "🛡️ Distributed Rate Limiter",
      color: "#FF3358",
      connectFrom: "gateway",
      edgeLabel: "token bucket",
      rationale: "Protects upstream services against traffic surges when new manga chapters drop.",
    });
  }

  const nodeCount = params.existingNodes.length + proposals.length;
  const baseScore = Math.min(94, 52 + nodeCount * 7);

  return {
    reply: `Sharp call! I sketched ${proposals.length} proposed component${proposals.length > 1 ? "s" : ""} on the Blueprint spread. Inspect the dashed cyan ghost box${proposals.length > 1 ? "es" : ""} and hit APPROVE if you stand behind the tradeoff—or REJECT and defend another path!`,
    expression: "fired-up" as const,
    proposals,
    rubric: {
      keyIdeas: Math.min(96, baseScore + 4),
      conceptChecks: Math.min(92, baseScore - 2),
      architecture: Math.min(95, baseScore + 2),
      communication: Math.min(94, baseScore),
      summary:
        "Good instinct identifying bottlenecks proactively. Next, quantify peak QPS during a viral chapter release and define cache invalidation / failover strategy.",
    },
    engineLabel: "BUCKSHOT Sensei Engine (Local Mode)",
  };
}
