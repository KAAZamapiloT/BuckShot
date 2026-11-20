"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  GitBranch,
  Sparkles,
  Zap,
  ArrowRight,
  RotateCcw,
  Code2,
  Check,
  Flame,
  Layers,
  Compass,
} from "lucide-react";
import { JUTSU_NODES, type JutsuNode } from "@/lib/intel-data";
import { playSfx } from "@/lib/sound";

interface QuestionOption {
  id: string;
  label: string;
  sub: string;
  badge: string;
}

const QUESTION_1_OPTIONS: QuestionOption[] = [
  {
    id: "sorted",
    label: "SORTED / MONOTONIC SEQUENCE",
    sub: "Input is already sorted, or answer space is monotonic (False...False, True...True).",
    badge: "O(log N)",
  },
  {
    id: "unsorted",
    label: "UNSORTED ARRAY / STREAM",
    sub: "Arbitrary sequence of numbers, sliding window of elements, or continuous real-time feed.",
    badge: "O(N) / O(N log N)",
  },
  {
    id: "systems_memory",
    label: "SYSTEMS MEMORY / CONCURRENCY",
    sub: "High-throughput stream, shared memory pages, or distributed cluster node ring.",
    badge: "HARDWARE / ATOMIC",
  },
];

const QUESTION_2_OPTIONS: Record<string, QuestionOption[]> = {
  sorted: [
    {
      id: "search_answer",
      label: "Find Min/Max Feasible Speed or Threshold",
      sub: "Optimizing throughput, bandwidth, capacity, or finding lower/upper bounds.",
      badge: "OPTIMIZATION",
    },
    {
      id: "two_sum_sorted",
      label: "Find Pairs or Triplet Combinations",
      sub: "Pair targets with monotonic shrinking pointers from opposite ends.",
      badge: "TWO POINTERS",
    },
  ],
  unsorted: [
    {
      id: "nearest_boundary",
      label: "Find Nearest Greater / Smaller Boundary",
      sub: "Histogram area, next warmer day, stock spans, boundary expansion.",
      badge: "EXTREMUM",
    },
    {
      id: "contiguous_window",
      label: "Contiguous Subarray or Substring Target",
      sub: "Subarray sum equals K, longest substring without repeats, window max.",
      badge: "RANGE TARGET",
    },
  ],
  systems_memory: [
    {
      id: "lock_free_stream",
      label: "Inter-Thread Queue with Zero Mutexes",
      sub: "Sub-microsecond producer/consumer streaming on hot path.",
      badge: "WAIT-FREE",
    },
    {
      id: "paged_memory",
      label: "Eliminate Contiguous Memory Fragmentation",
      sub: "Dynamic on-demand token allocation for LLM serving VRAM.",
      badge: "OS PAGING",
    },
    {
      id: "distributed_sharding",
      label: "Hash Ring Load Distribution with Minimal Moves",
      sub: "Map keys to servers so adding/removing a node reshuffles minimal keys.",
      badge: "CONSISTENT HASH",
    },
  ],
};

const QUESTION_3_OPTIONS: QuestionOption[] = [
  {
    id: "scale_linear",
    label: "N <= 10^5 (Must be strictly O(N) or O(N log N))",
    sub: "Standard FAANG / competitive programming constraint. Quadratic O(N^2) times out!",
    badge: "O(N) SLA",
  },
  {
    id: "scale_log",
    label: "N <= 10^9 or Unbounded Stream (Must be O(log N) or O(1))",
    sub: "Massive search space or streaming arrival where full storage is impossible.",
    badge: "SUB-LINEAR",
  },
  {
    id: "scale_constant",
    label: "Microsecond Hardware SLA (Zero-Allocation O(1))",
    sub: "Trading engine, kernel driver, or high-throughput real-time pipeline.",
    badge: "ZERO-JITTER",
  },
];

export default function JutsuTreePage() {
  const [q1, setQ1] = useState<string | null>(null);
  const [q2, setQ2] = useState<string | null>(null);
  const [q3, setQ3] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Derive target jutsu
  let targetJutsuKey: string | null = null;
  if (q1 === "unsorted" && q2 === "nearest_boundary") {
    targetJutsuKey = "monotonic-stack";
  } else if (q1 === "unsorted" && q2 === "contiguous_window") {
    targetJutsuKey = "sliding-window";
  } else if (q1 === "sorted" && q2 === "search_answer") {
    targetJutsuKey = "binary-search-answer";
  } else if (q1 === "sorted" && q2 === "two_sum_sorted") {
    targetJutsuKey = "sliding-window";
  } else if (q1 === "systems_memory" && q2 === "lock_free_stream") {
    targetJutsuKey = "lock-free-ring";
  } else if (q1 === "systems_memory" && q2 === "paged_memory") {
    targetJutsuKey = "paged-attention";
  } else if (q1 === "systems_memory" && q2 === "distributed_sharding") {
    targetJutsuKey = "consistent-hash";
  } else if (q1 && q2 && q3) {
    targetJutsuKey = "monotonic-stack";
  }

  const jutsu: JutsuNode | null = targetJutsuKey ? JUTSU_NODES[targetJutsuKey] || null : null;

  const handleReset = () => {
    playSfx("click");
    setQ1(null);
    setQ2(null);
    setQ3(null);
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    playSfx("click");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Top Banner */}
      <div className="manga-panel bg-[var(--card-bg)] text-[var(--ink)] p-5 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-full bg-gradient-to-l from-[#00C2FF]/15 to-transparent pointer-events-none" />
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="bg-[#00C2FF] text-[#121218] font-black text-[10px] tracking-widest px-2 py-0.5 uppercase border border-[#121218]">
                PATTERN SELECTION ENGINE
              </span>
              <span className="text-[11px] font-mono font-bold text-[var(--ink-muted)]">
                ALGO-MONSTER &times; BUCKSHOT
              </span>
            </div>
            <h1 className="font-manga text-3xl sm:text-4xl tracking-wider text-[var(--ink)]">
              THE JUTSU DECISION TREE
            </h1>
            <p className="text-xs sm:text-sm font-medium text-[var(--ink-secondary)] max-w-2xl mt-1">
              Never grind LeetCode blind. Answer 3 rapid questions about your problem traits to trace the
              lightning path and reveal the exact optimal algorithmic invariant in under 30 seconds.
            </p>
          </div>

          <button
            onClick={handleReset}
            className="px-3.5 py-2 bg-[var(--subpanel-bg)] hover:bg-[#FF3358] hover:text-white text-[var(--ink)] font-black text-xs uppercase flex items-center gap-1.5 border-2 border-[var(--border-ink)] shadow-[2px_2px_0px_var(--shadow-ink)] transition-colors shrink-0"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            RESET TREE
          </button>
        </div>
      </div>

      {/* 3-Step Interactive Decision Flow */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Question 1 */}
        <div className="manga-panel bg-[var(--card-bg)] p-4 space-y-3">
          <div className="flex items-center justify-between border-b-2 border-[var(--border-ink)] pb-2">
            <span className="font-manga text-lg text-[#FFC82C] flex items-center gap-1.5">
              <Compass className="w-4 h-4 text-[#FFC82C]" />
              STEP 1: INPUT TRAIT
            </span>
            <span className="text-[10px] font-black px-1.5 py-0.5 bg-[#121218] text-[#FFC82C]">
              {q1 ? "SELECTED" : "PENDING"}
            </span>
          </div>
          <p className="text-[11px] font-bold text-[var(--ink-secondary)]">
            What is the nature of the incoming data or search space?
          </p>
          <div className="space-y-2">
            {QUESTION_1_OPTIONS.map((opt) => {
              const active = q1 === opt.id;
              return (
                <button
                  key={opt.id}
                  onClick={() => {
                    playSfx("click");
                    setQ1(opt.id);
                    setQ2(null);
                  }}
                  className={`w-full text-left p-3 border-2 transition-all ${
                    active
                      ? "bg-[#00C2FF] text-[#121218] border-[#121218] shadow-[3px_3px_0px_#121218] font-black"
                      : "bg-[var(--subpanel-bg)] hover:bg-[var(--card-bg)] text-[var(--ink)] border-[var(--border-ink)]"
                  }`}
                >
                  <div className="flex items-center justify-between text-[11px] font-black mb-0.5">
                    <span>{opt.label}</span>
                    <span className="text-[9px] px-1 bg-black/15 font-mono">{opt.badge}</span>
                  </div>
                  <p className="text-[10px] leading-tight opacity-80">{opt.sub}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Question 2 */}
        <div
          className={`manga-panel bg-[var(--card-bg)] p-4 space-y-3 transition-opacity ${
            !q1 ? "opacity-40 pointer-events-none" : "opacity-100"
          }`}
        >
          <div className="flex items-center justify-between border-b-2 border-[var(--border-ink)] pb-2">
            <span className="font-manga text-lg text-[#00C2FF] flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-[#00C2FF]" />
              STEP 2: INVARIANT GOAL
            </span>
            <span className="text-[10px] font-black px-1.5 py-0.5 bg-[#121218] text-[#00C2FF]">
              {q2 ? "SELECTED" : "PENDING"}
            </span>
          </div>
          <p className="text-[11px] font-bold text-[var(--ink-secondary)]">
            What are you trying to compute, maintain, or bound?
          </p>
          <div className="space-y-2">
            {q1 &&
              QUESTION_2_OPTIONS[q1]?.map((opt) => {
                const active = q2 === opt.id;
                return (
                  <button
                    key={opt.id}
                    onClick={() => {
                      playSfx("click");
                      setQ2(opt.id);
                    }}
                    className={`w-full text-left p-3 border-2 transition-all ${
                      active
                        ? "bg-[#00C2FF] text-[#121218] border-[#121218] shadow-[3px_3px_0px_#121218] font-black"
                        : "bg-[var(--subpanel-bg)] hover:bg-[var(--card-bg)] text-[var(--ink)] border-[var(--border-ink)]"
                    }`}
                  >
                    <div className="flex items-center justify-between text-[11px] font-black mb-0.5">
                      <span>{opt.label}</span>
                      <span className="text-[9px] px-1 bg-black/15 font-mono">{opt.badge}</span>
                    </div>
                    <p className="text-[10px] leading-tight opacity-80">{opt.sub}</p>
                  </button>
                );
              })}
          </div>
        </div>

        {/* Question 3 */}
        <div
          className={`manga-panel bg-[var(--card-bg)] p-4 space-y-3 transition-opacity ${
            !q2 ? "opacity-40 pointer-events-none" : "opacity-100"
          }`}
        >
          <div className="flex items-center justify-between border-b-2 border-[var(--border-ink)] pb-2">
            <span className="font-manga text-lg text-[#FF3358] flex items-center gap-1.5">
              <Flame className="w-4 h-4 text-[#FF3358]" />
              STEP 3: SCALE & SLA
            </span>
            <span className="text-[10px] font-black px-1.5 py-0.5 bg-[#121218] text-[#FF3358]">
              {q3 ? "LOCKED" : "SELECT"}
            </span>
          </div>
          <p className="text-[11px] font-bold text-[var(--ink-secondary)]">
            What is the constraint upper bound on operations?
          </p>
          <div className="space-y-2">
            {QUESTION_3_OPTIONS.map((opt) => {
              const active = q3 === opt.id;
              return (
                <button
                  key={opt.id}
                  onClick={() => {
                    playSfx("unlock");
                    setQ3(opt.id);
                  }}
                  className={`w-full text-left p-3 border-2 transition-all ${
                    active
                      ? "bg-[#FF3358] text-white border-[#121218] shadow-[3px_3px_0px_#121218] font-black"
                      : "bg-[var(--subpanel-bg)] hover:bg-[var(--card-bg)] text-[var(--ink)] border-[var(--border-ink)]"
                  }`}
                >
                  <div className="flex items-center justify-between text-[11px] font-black mb-0.5">
                    <span>{opt.label}</span>
                    <span className="text-[9px] px-1 bg-black/15 font-mono">{opt.badge}</span>
                  </div>
                  <p className="text-[10px] leading-tight opacity-80">{opt.sub}</p>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Dynamic Lightning Revealed Jutsu Scroll */}
      {jutsu && (
        <div className="manga-panel bg-[var(--card-bg)] text-[var(--ink)] p-5 border-4 border-[#00C2FF] shadow-[8px_8px_0px_var(--shadow-ink)] relative overflow-hidden transition-all duration-300">
          <div className="flex items-center justify-between flex-wrap gap-2 border-b-2 border-[var(--border-ink)] pb-3 mb-4">
            <div className="flex items-center gap-2">
              <span className="bg-[#00C2FF] text-[#121218] font-black text-xs px-2.5 py-0.5 uppercase tracking-widest border border-[#121218]">
                REVEALED JUTSU PATTERN
              </span>
              <span className="bg-[#121218] text-[#FFC82C] font-mono text-xs font-black px-2 py-0.5 border border-[#121218]">
                {jutsu.rank}
              </span>
            </div>
            <span className="font-manga text-xl tracking-wider text-[var(--ink-muted)]">
              {jutsu.kanji}
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left 2 Cols: Invariant & Details */}
            <div className="lg:col-span-2 space-y-4">
              <div>
                <h2 className="font-manga text-3xl tracking-wide text-[var(--ink)] mb-1">
                  {jutsu.patternName}
                </h2>
                <p className="text-xs sm:text-sm font-medium text-[var(--ink-secondary)] leading-relaxed">
                  {jutsu.explanation}
                </p>
              </div>

              {/* Invariant Formula Foil Box */}
              <div className="p-3.5 bg-[var(--subpanel-bg)] border-2 border-[var(--border-ink)] shadow-[2px_2px_0px_var(--shadow-ink)]">
                <span className="text-[10px] font-black tracking-widest uppercase text-[#FF3358] block mb-1">
                  CORE INVARIANT FORMULA:
                </span>
                <code className="font-mono text-xs sm:text-sm font-black text-[var(--ink)] block">
                  {jutsu.invariantFormula}
                </code>
              </div>

              {/* Complexity Badges */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-2.5 bg-[var(--subpanel-bg)] border border-[var(--border-ink)]">
                  <span className="text-[10px] font-black text-[var(--ink-muted)] uppercase block">
                    TIME BOUND
                  </span>
                  <span className="font-mono text-xs font-black text-[#00C875]">
                    {jutsu.timeComplexity}
                  </span>
                </div>
                <div className="p-2.5 bg-[var(--subpanel-bg)] border border-[var(--border-ink)]">
                  <span className="text-[10px] font-black text-[var(--ink-muted)] uppercase block">
                    SPACE BOUND
                  </span>
                  <span className="font-mono text-xs font-black text-[#7C4DFF]">
                    {jutsu.spaceComplexity}
                  </span>
                </div>
              </div>

              {/* Tags & Related Chambers */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-black text-[var(--ink-muted)] uppercase">
                  COMMON SIGNALS:
                </span>
                {jutsu.tags.map((t) => (
                  <span
                    key={t}
                    className="text-[10px] font-bold px-2 py-0.5 bg-[var(--subpanel-bg)] border border-[var(--border-ink)] text-[var(--ink)]"
                  >
                    #{t}
                  </span>
                ))}
              </div>

              {/* CTA to Chamber */}
              {jutsu.relatedSlugs[0] && (
                <div className="pt-2">
                  <Link
                    href={`/shell-break/${jutsu.relatedSlugs[0]}`}
                    onClick={() => playSfx("deal")}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#FFC82C] hover:bg-[#ffe17d] text-[#121218] font-black text-xs uppercase border-2 border-[#121218] shadow-[4px_4px_0px_#121218] transition-all hover:-translate-y-0.5"
                  >
                    <Flame className="w-4 h-4 text-[#FF3358] fill-current" />
                    CHALLENGE IN THE CHAMBER ({jutsu.relatedSlugs[0]})
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              )}
            </div>

            {/* Right Col: Code Blueprint */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-black">
                <span className="flex items-center gap-1.5 uppercase text-[var(--ink)]">
                  <Code2 className="w-3.5 h-3.5 text-[#00C2FF]" />
                  JUTSU CODE BLUEPRINT
                </span>
                <button
                  onClick={() => copyCode(jutsu.codeSnippet)}
                  className="px-2 py-0.5 bg-[var(--subpanel-bg)] hover:bg-[var(--card-bg)] border border-[var(--border-ink)] text-[10px] font-black flex items-center gap-1"
                >
                  {copied ? <Check className="w-3 h-3 text-[#00C875]" /> : null}
                  {copied ? "COPIED" : "COPY CODE"}
                </button>
              </div>

              <pre className="p-3 bg-[#121218] text-[#FAF4E6] font-mono text-[11px] leading-relaxed overflow-x-auto border-2 border-[var(--border-ink)] shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)] max-h-72">
                <code>{jutsu.codeSnippet}</code>
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
