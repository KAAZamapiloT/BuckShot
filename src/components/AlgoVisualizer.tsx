"use client";

import React, { useEffect, useState } from "react";
import { Play, Pause, SkipBack, SkipForward, RotateCcw, Film } from "lucide-react";

interface VizFrame {
  sfx: string;
  caption: string;
  bars?: Array<{ label: string; value: number; state?: "idle" | "active" | "stack" | "best" }>;
  cells?: Array<{ label: string; value: string; color?: string; badge?: string }>;
  meta?: string;
}

const FRAMES_BY_SLUG: Record<string, VizFrame[]> = {
  "monotonic-stack-skyline": [
    {
      sfx: "FRAME 01",
      caption: "Push bar 0 (h=2). Stack holds increasing heights: [idx 0].",
      bars: [
        { label: "0", value: 2, state: "stack" },
        { label: "1", value: 1, state: "idle" },
        { label: "2", value: 5, state: "idle" },
        { label: "3", value: 6, state: "idle" },
        { label: "4", value: 2, state: "idle" },
        { label: "5", value: 3, state: "idle" },
      ],
      meta: "Stack: [0(h=2)] | Best Area: 0",
    },
    {
      sfx: "POP!!",
      caption: "Bar 1 (h=1) < h=2! Pop bar 0: width=1, area = 2×1 = 2. Push bar 1.",
      bars: [
        { label: "0", value: 2, state: "best" },
        { label: "1", value: 1, state: "active" },
        { label: "2", value: 5, state: "idle" },
        { label: "3", value: 6, state: "idle" },
        { label: "4", value: 2, state: "idle" },
        { label: "5", value: 3, state: "idle" },
      ],
      meta: "Stack: [1(h=1)] | Best Area: 2",
    },
    {
      sfx: "CLIMB!",
      caption: "Bars 2 (h=5) and 3 (h=6) are strictly taller — push both onto monotonic stack.",
      bars: [
        { label: "0", value: 2, state: "idle" },
        { label: "1", value: 1, state: "stack" },
        { label: "2", value: 5, state: "stack" },
        { label: "3", value: 6, state: "stack" },
        { label: "4", value: 2, state: "idle" },
        { label: "5", value: 3, state: "idle" },
      ],
      meta: "Stack: [1(h=1), 2(h=5), 3(h=6)] | Best Area: 2",
    },
    {
      sfx: "SLASH!!",
      caption: "Bar 4 (h=2) triggers cascade! Pop h=6 (area 6×1=6), then pop h=5 (left=1, right=4 => width=2, area=10!!).",
      bars: [
        { label: "0", value: 2, state: "idle" },
        { label: "1", value: 1, state: "stack" },
        { label: "2", value: 5, state: "best" },
        { label: "3", value: 6, state: "best" },
        { label: "4", value: 2, state: "active" },
        { label: "5", value: 3, state: "idle" },
      ],
      meta: "Stack: [1(h=1), 4(h=2)] | NEW BEST AREA: 10!",
    },
    {
      sfx: "FLUSH!",
      caption: "Trailing 0-sentinel flushes remaining bars cleanly in O(N) total operations. Final answer = 10!",
      bars: [
        { label: "0", value: 2, state: "idle" },
        { label: "1", value: 1, state: "idle" },
        { label: "2", value: 5, state: "best" },
        { label: "3", value: 6, state: "best" },
        { label: "4", value: 2, state: "idle" },
        { label: "5", value: 3, state: "idle" },
      ],
      meta: "Each bar pushed once & popped once => Strict O(N)!",
    },
  ],
  "ring-buffer-lockfree": [
    {
      sfx: "INIT",
      caption: "Capacity=4 (power of 2). Producer owns TAIL (64B padded); Consumer owns HEAD (64B padded).",
      cells: [
        { label: "SLOT 0", value: "EMPTY", badge: "HEAD · TAIL", color: "#FFC82C" },
        { label: "SLOT 1", value: "EMPTY" },
        { label: "SLOT 2", value: "EMPTY" },
        { label: "SLOT 3", value: "EMPTY" },
      ],
      meta: "mask = cap - 1 = 3 | Zero mutexes!",
    },
    {
      sfx: "RELEASE!",
      caption: "Producer writes 42 into slot 0, then release-stores tail = (0+1) & 3 = 1.",
      cells: [
        { label: "SLOT 0", value: "42", badge: "HEAD", color: "#00C2FF" },
        { label: "SLOT 1", value: "EMPTY", badge: "TAIL", color: "#FF3358" },
        { label: "SLOT 2", value: "EMPTY" },
        { label: "SLOT 3", value: "EMPTY" },
      ],
      meta: "tail.store(1, Release) publishes payload 42 safely",
    },
    {
      sfx: "WRAP!",
      caption: "Producer fills slots 1 & 2 -> tail wraps with bitmask & 3 (zero modulo division!).",
      cells: [
        { label: "SLOT 0", value: "42", badge: "HEAD", color: "#00C2FF" },
        { label: "SLOT 1", value: "77", color: "#00C875" },
        { label: "SLOT 2", value: "99", color: "#00C875" },
        { label: "SLOT 3", value: "EMPTY", badge: "TAIL", color: "#FF3358" },
      ],
      meta: "No cache-line ping-pong thanks to alignas(64) padding!",
    },
    {
      sfx: "ACQUIRE!",
      caption: "Consumer acquire-loads tail, reads 42 cleanly, and advances head -> 1.",
      cells: [
        { label: "SLOT 0", value: "READ ✓", color: "#E5E0D5" },
        { label: "SLOT 1", value: "77", badge: "HEAD", color: "#00C2FF" },
        { label: "SLOT 2", value: "99", color: "#00C875" },
        { label: "SLOT 3", value: "EMPTY", badge: "TAIL", color: "#FF3358" },
      ],
      meta: "Wait-free O(1) throughput on hot path!",
    },
  ],
  "kv-cache-paged-attention": [
    {
      sfx: "PROBLEM",
      caption: "Contiguous allocation reserves max_seq_len per prompt — wasting 70% GPU VRAM!",
      cells: [
        { label: "BLK 0", value: "SYS PROMPT", color: "#7C4DFF", badge: "REF=2" },
        { label: "BLK 1", value: "REQ A T1..16", color: "#00C2FF" },
        { label: "BLK 2", value: "FREE", color: "#FAF4E6" },
        { label: "BLK 3", value: "REQ B T1..16", color: "#FFC82C" },
      ],
      meta: "Logical Block Tables map non-contiguous VRAM blocks seamlessly",
    },
    {
      sfx: "CoW SHARE!",
      caption: "Req A & Req B share physical Block 0 (System Prompt) via RefCount=2 — zero duplicate VRAM!",
      cells: [
        { label: "BLK 0", value: "SYS PROMPT", color: "#7C4DFF", badge: "SHARED x2" },
        { label: "BLK 1", value: "REQ A T1..16", color: "#00C2FF" },
        { label: "BLK 2", value: "REQ A T17..32", color: "#00C2FF", badge: "NEW!" },
        { label: "BLK 3", value: "REQ B T1..16", color: "#FFC82C" },
      ],
      meta: "Dynamic on-demand block growth caps waste to < 1 block!",
    },
    {
      sfx: "RECLAIM!",
      caption: "Req A finishes -> Blocks 1 & 2 immediately return to O(1) free list; Block 0 stays alive (Ref=1).",
      cells: [
        { label: "BLK 0", value: "SYS PROMPT", color: "#7C4DFF", badge: "REF=1" },
        { label: "BLK 1", value: "FREE ✓", color: "#00C875" },
        { label: "BLK 2", value: "FREE ✓", color: "#00C875" },
        { label: "BLK 3", value: "REQ B T1..16", color: "#FFC82C" },
      ],
      meta: "3x–4x larger concurrent LLM serving batch size!",
    },
  ],
};

function getFallbackFrames(slug: string): VizFrame[] {
  if (FRAMES_BY_SLUG[slug]) return FRAMES_BY_SLUG[slug];
  return [
    {
      sfx: "STEP 01",
      caption: "Identify the brute-force bottleneck first — never optimize blind!",
      cells: [
        { label: "INPUT", value: "STREAM / ARRAY", color: "#FFC82C", badge: "SCAN" },
        { label: "BOTTLENECK", value: "NAIVE O(N²)", color: "#FF3358" },
        { label: "GOAL", value: "INVARIANT", color: "#00C2FF" },
      ],
      meta: "Prove what redundant work can be eliminated",
    },
    {
      sfx: "STEP 02",
      caption: "Maintain the core data structure invariant at every index or event arrival.",
      cells: [
        { label: "STATE", value: "MAP / HEAP / RING", color: "#00C2FF", badge: "ACTIVE" },
        { label: "LOOKUP", value: "O(1) / O(log N)", color: "#00C875" },
        { label: "EDGE CASE", value: "GUARDED ✓", color: "#FFC82C" },
      ],
      meta: "Break all panels above to verify your proof with Sensei Reiko",
    },
    {
      sfx: "FINISH!",
      caption: "Finalize complexity proof, break the editor seal, and fire the live test suite!",
      cells: [
        { label: "TIME", value: "OPTIMAL ✓", color: "#00C875", badge: "PROVED" },
        { label: "SPACE", value: "BOUNDED ✓", color: "#7C4DFF" },
        { label: "STATUS", value: "READY TO FIRE", color: "#FF3358" },
      ],
      meta: "Active synthesis beats passive memorization every single time!",
    },
  ];
}

export function AlgoVisualizer({ slug }: { slug: string }) {
  const frames = getFallbackFrames(slug);
  const [idx, setIdx] = useState(0);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    setIdx(0);
    setPlaying(false);
  }, [slug]);

  useEffect(() => {
    if (!playing) return;
    const t = setInterval(() => {
      setIdx((prev) => {
        if (prev >= frames.length - 1) {
          setPlaying(false);
          return prev;
        }
        return prev + 1;
      });
    }, 1600);
    return () => clearInterval(t);
  }, [playing, frames.length]);

  const frame = frames[idx] || frames[0];

  return (
    <div className="manga-panel bg-[#FFFDF7] text-[#121218] overflow-hidden">
      <div className="bg-[#121218] text-white px-3.5 py-2 flex items-center justify-between gap-2">
        <span className="font-manga text-lg tracking-wider text-[#00C2FF] flex items-center gap-1.5">
          <Film className="w-4 h-4" />
          MANGA ACTION REPLAY ({idx + 1}/{frames.length})
        </span>
        <div className="flex items-center gap-1">
          <button
            onClick={() => {
              setPlaying(false);
              setIdx(0);
            }}
            className="p-1 bg-white/10 hover:bg-white/25 border border-white/25"
            title="Reset"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => {
              setPlaying(false);
              setIdx((p) => Math.max(0, p - 1));
            }}
            className="p-1 bg-white/10 hover:bg-white/25 border border-white/25"
            title="Prev Frame"
          >
            <SkipBack className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => {
              if (idx >= frames.length - 1) setIdx(0);
              setPlaying((p) => !p);
            }}
            className="px-2 py-1 bg-[#FFC82C] text-[#121218] font-black text-[10px] uppercase flex items-center gap-1"
          >
            {playing ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3 fill-current" />}
            {playing ? "PAUSE" : "PLAY"}
          </button>
          <button
            onClick={() => {
              setPlaying(false);
              setIdx((p) => Math.min(frames.length - 1, p + 1));
            }}
            className="p-1 bg-white/10 hover:bg-white/25 border border-white/25"
            title="Next Frame"
          >
            <SkipForward className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="p-4 bg-[#FAF4E6] halftone-dots space-y-3">
        <div className="flex items-start justify-between gap-2">
          <p className="text-xs font-bold leading-snug text-[#121218]">{frame.caption}</p>
          <span className="bg-[#FF3358] text-white font-manga text-base px-2 py-0.5 border-2 border-[#121218] shadow-[2px_2px_0px_#121218] shrink-0 rotate-2">
            {frame.sfx}
          </span>
        </div>

        {/* Histogram Bars Visual */}
        {frame.bars && (
          <div className="h-32 flex items-end justify-center gap-2.5 pt-4 px-2 bg-[#FFFDF7] border-2 border-[#121218]">
            {frame.bars.map((b) => {
              const bg =
                b.state === "best"
                  ? "#00C875"
                  : b.state === "active"
                  ? "#FF3358"
                  : b.state === "stack"
                  ? "#00C2FF"
                  : "#E5E0D5";
              return (
                <div key={b.label} className="flex flex-col items-center gap-1 flex-1 max-w-[46px]">
                  <span className="text-[10px] font-black">{b.value}</span>
                  <div
                    style={{ height: `${b.value * 14}px`, backgroundColor: bg }}
                    className="w-full border-2 border-[#121218] transition-all duration-300"
                  />
                  <span className="text-[9px] font-mono font-bold text-[#4A4A5A]">i={b.label}</span>
                </div>
              );
            })}
          </div>
        )}

        {/* Memory / Ring / System Cells Visual */}
        {frame.cells && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {frame.cells.map((c) => (
              <div
                key={c.label}
                style={{ backgroundColor: c.color || "#FFFDF7" }}
                className="border-2 border-[#121218] shadow-[2px_2px_0px_#121218] p-2.5 text-center transition-all duration-300"
              >
                <div className="text-[9px] font-black uppercase opacity-75">{c.label}</div>
                <div className="font-mono text-xs font-black mt-0.5">{c.value}</div>
                {c.badge && (
                  <span className="inline-block mt-1 bg-[#121218] text-[#FFC82C] text-[9px] font-black px-1.5 py-0.5">
                    {c.badge}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}

        {frame.meta && (
          <div className="font-mono text-[11px] font-bold bg-[#121218] text-[#FFC82C] px-2.5 py-1.5">
            {frame.meta}
          </div>
        )}
      </div>
    </div>
  );
}
