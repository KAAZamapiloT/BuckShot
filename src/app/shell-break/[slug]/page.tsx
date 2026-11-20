"use client";

import React, { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Send, Sparkles, Lightbulb, CheckCircle2, Lock, Flame, AlertTriangle, ShieldCheck, Skull } from "lucide-react";
import { SenseiAvatar, type SenseiExpression } from "@/components/SenseiAvatar";
import { InkCodeEditor } from "@/components/InkCodeEditor";
import { AlgoVisualizer } from "@/components/AlgoVisualizer";
import { playSfx } from "@/lib/sound";
import { PHASE_2_BOSS_TWISTS, type Phase2BossTwist } from "@/lib/intel-data";
import { avengeDefeat, hasUnresolvedDefeat, logDefeat, type DefeatRecord } from "@/lib/grimoire";
import type { CruxPanel } from "@/lib/seed-data";

interface ChatTurn {
  role: "user" | "sensei";
  text: string;
  expression?: SenseiExpression;
  sfx?: string;
}

interface ArenaPayload {
  problem: {
    slug: string;
    title: string;
    volumeName: string;
    topic: string;
    sourceTag: string;
    rating: number;
    brief: string;
    constraints: string;
    cruxPanels: CruxPanel[];
    starterCode: Record<string, string>;
  };
  attempt: {
    unlockedPanelIds: string[];
    reasoningScore: number;
    sealBroken: boolean;
    solved: boolean;
    messages: ChatTurn[];
    submittedCode: string;
  };
}

export default function ShellBreakArenaPage() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;

  const [data, setData] = useState<ArenaPayload | null>(null);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [engineLabel, setEngineLabel] = useState<string>("");
  const [phase2Active, setPhase2Active] = useState(false);
  const [phase2Solved, setPhase2Solved] = useState(false);
  const [activeDefeat, setActiveDefeat] = useState<DefeatRecord | null>(null);
  const [logDefeatOpen, setLogDefeatOpen] = useState(false);
  const [defeatCategory, setDefeatCategory] = useState<"OFF_BY_ONE" | "MEMORY_BLOWUP" | "RACE_CONDITION" | "SUBOPTIMAL_TIME" | "EDGE_CASE">("EDGE_CASE");
  const [defeatNotes, setDefeatNotes] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);

  const phase2Data: Phase2BossTwist | undefined = PHASE_2_BOSS_TWISTS[slug];

  const loadProblem = async () => {
    const res = await fetch(`/api/problems?slug=${encodeURIComponent(slug)}`);
    const json = await res.json();
    setData(json);
    setActiveDefeat(hasUnresolvedDefeat(slug));
  };

  useEffect(() => {
    if (slug) loadProblem();
  }, [slug]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [data?.attempt.messages.length]);

  const sendMessage = async (overrideText?: string) => {
    const text = (overrideText ?? input).trim();
    if (!text || sending || !data) return;
    setSending(true);
    if (!overrideText) setInput("");
    playSfx("click");

    try {
      const res = await fetch("/api/coach/shell-break", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, message: text }),
      });
      const json = await res.json();
      if (json.engineLabel) setEngineLabel(json.engineLabel);
      if (json.newlyUnlockedIds && json.newlyUnlockedIds.length > 0) {
        playSfx("unlock");
      }
      if (json.attempt) {
        if (json.attempt.sealBroken && !data.attempt.sealBroken) {
          playSfx("seal-broken");
        }
        setData((prev) => (prev ? { ...prev, attempt: json.attempt } : prev));
      }
    } finally {
      setSending(false);
    }
  };

  const forceBreakSeal = async () => {
    playSfx("seal-broken");
    const res = await fetch("/api/coach/shell-break", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug, forceBreakSeal: true }),
    });
    const json = await res.json();
    if (json.attempt) {
      setData((prev) => (prev ? { ...prev, attempt: json.attempt } : prev));
    }
  };

  if (!data) {
    return (
      <div className="manga-panel p-12 text-center font-manga text-3xl">
        OPENING MANGA SPREAD...
      </div>
    );
  }

  const { problem, attempt } = data;
  const lastSensei = [...attempt.messages].reverse().find((m) => m.role === "sensei");
  const currentExpression: SenseiExpression = sending
    ? "thinking"
    : attempt.solved
    ? "victory"
    : lastSensei?.expression || "idle";

  const nextLockedPanel = problem.cruxPanels.find((p) => !attempt.unlockedPanelIds.includes(p.id));

  return (
    <div className="space-y-5">
      {/* Top Chapter Breadcrumb & Score Strip */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/shell-break"
          onClick={() => playSfx("click")}
          className="manga-btn bg-[var(--panel-bg)] text-[var(--ink)] px-3 py-1.5 text-xs flex items-center gap-1.5"
        >
          <ArrowLeft className="w-4 h-4" /> ALL BATTLE CARDS
        </Link>

        <div className="flex flex-wrap items-center gap-2">
          {activeDefeat && (
            <span className="bg-[#FF3358] text-white font-black text-xs px-2.5 py-1 flex items-center gap-1 border-2 border-[#121218] animate-pulse shadow-[2px_2px_0px_#121218]">
              <Flame className="w-3.5 h-3.5 fill-current" />
              REVENGE MISSION ({activeDefeat.failedCount}X DEFEATED)
            </span>
          )}
          <span className="bg-[#121218] text-[#FFC82C] font-manga text-lg px-3 py-0.5 tracking-wider border border-[var(--border-ink)]">
            {problem.volumeName} · PL {problem.rating}
          </span>
          <span className="bg-[#00C2FF] text-[#121218] border-2 border-[var(--border-ink)] font-black text-xs px-3 py-1">
            REASONING SCORE: {attempt.reasoningScore} / 100
          </span>
          {attempt.solved && (
            <span className="bg-[#00C875] text-[#121218] border-2 border-[var(--border-ink)] font-black text-xs px-3 py-1 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> SOLVED
            </span>
          )}
          {phase2Solved && (
            <span className="bg-[#7C4DFF] text-white border-2 border-[var(--border-ink)] font-black text-xs px-3 py-1 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> PHASE 2 CONQUERED
            </span>
          )}
        </div>
      </div>

      {/* ACTIVE REVENGE BANNER FROM GRIMOIRE */}
      {activeDefeat && (
        <div className="p-3.5 bg-[#FF3358]/15 border-2 border-[#FF3358] text-[var(--ink)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-[4px_4px_0px_#FF3358]">
          <div className="flex items-start gap-2.5">
            <Skull className="w-5 h-5 text-[#FF3358] shrink-0 mt-0.5" />
            <div>
              <div className="text-[11px] font-black uppercase text-[#FF3358] tracking-wider">
                GRIMOIRE DEFECT RECORD · {activeDefeat.flawLabel}
              </div>
              <p className="text-xs font-bold leading-snug mt-0.5">
                Past Mistake: &quot;{activeDefeat.mistakeNotes}&quot; &mdash;{" "}
                <span className="text-[#00C2FF]">Remediation: {activeDefeat.senseiRemediation}</span>
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              playSfx("victory");
              avengeDefeat(slug);
              setActiveDefeat(null);
            }}
            className="px-2.5 py-1 bg-[#FF3358] hover:bg-[#ff4d6e] text-white text-[10px] font-black uppercase shrink-0 border border-[#121218]"
          >
            MARK AVENGED ✓
          </button>
        </div>
      )}

      {/* PHASE 2 BOSS TWIST ALERT BANNER */}
      {phase2Data && (
        <div
          className={`manga-panel p-4 transition-all duration-300 ${
            phase2Active
              ? "bg-[#121218] text-white border-4 border-[#FF3358] shadow-[6px_6px_0px_#FF3358]"
              : "bg-[var(--card-bg)] text-[var(--ink)] border-2 border-dashed border-[#FF3358]/50"
          }`}
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="bg-[#FF3358] text-white text-[10px] font-black px-2 py-0.5 uppercase tracking-widest flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  {phase2Active ? "BOSS PHASE 2 ACTIVE" : "OPTIONAL BOSS TWIST"}
                </span>
                <span className="text-xs font-mono font-bold text-[#FFC82C]">
                  +{phase2Data.xpReward} XP
                </span>
              </div>
              <h3 className="font-manga text-xl text-[#00C2FF]">{phase2Data.bossTitle}</h3>
              <p className="text-xs font-medium text-white/80 max-w-3xl">
                {phase2Data.twistConstraint}
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {!phase2Active ? (
                <button
                  onClick={() => {
                    playSfx("seal-broken");
                    setPhase2Active(true);
                  }}
                  className="px-3.5 py-2 bg-[#FF3358] hover:bg-[#ff4d6e] text-white font-black text-xs uppercase border-2 border-white/40 shadow-[3px_3px_0px_rgba(0,0,0,0.5)] transition-all flex items-center gap-1.5"
                >
                  <Flame className="w-4 h-4 fill-current" />
                  ENGAGE PHASE 2 TWIST
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      sendMessage(`Phase 2 Challenge: ${phase2Data.senseiInterrogation}`);
                    }}
                    className="px-3 py-1.5 bg-[#00C2FF] hover:bg-[#5cd7ff] text-[#121218] font-black text-xs uppercase border border-[#121218]"
                  >
                    DISCUSS PROOF WITH SENSEI
                  </button>
                  <button
                    onClick={() => {
                      playSfx("victory");
                      setPhase2Solved(true);
                    }}
                    className="px-3 py-1.5 bg-[#00C875] text-[#121218] font-black text-xs uppercase border border-[#121218]"
                  >
                    CLAIM PHASE 2 VICTORY ✓
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 2-PAGE OPEN MANGA SPREAD */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start relative">
        {/* LEFT PAGE: PROBLEM BRIEF + ACTION REPLAY + INK-TO-COLOR BREAKTHROUGH PANELS */}
        <div className="xl:col-span-5 space-y-5">
          {/* Problem Brief Panel */}
          <div className="manga-panel p-5 bg-[var(--card-bg)] text-[var(--ink)] halftone-dots">
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="bg-[#FF3358] text-white text-[10px] font-black px-2 py-0.5 uppercase border border-[var(--border-ink)]">
                {problem.sourceTag} · {problem.topic}
              </span>
              <span className="text-[11px] font-black text-[var(--ink-muted)]">PAGE L-01</span>
            </div>
            <h1 className="font-manga text-3xl sm:text-4xl tracking-wide leading-tight mb-3">
              {problem.title}
            </h1>
            <p className="text-sm font-medium leading-relaxed text-[var(--ink-secondary)] mb-3">
              {problem.brief}
            </p>
            <div className="bg-[var(--subpanel-bg)] border-2 border-[var(--border-ink)] px-3 py-2 font-mono text-xs font-bold text-[var(--ink)]">
              {problem.constraints}
            </div>
          </div>

          {/* MANGA ACTION REPLAY STEP-THROUGH VISUALIZER */}
          <AlgoVisualizer slug={problem.slug} />

          {/* INK-TO-COLOR BREAKTHROUGH PANELS */}
          <div className="manga-panel p-5 bg-[var(--card-bg)] text-[var(--ink)] space-y-4">
            <div className="flex items-center justify-between border-b-[3px] border-[var(--border-ink)] pb-2">
              <h2 className="font-manga text-2xl tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-5 h-5 text-[#FF3358]" />
                BREAKTHROUGH PANELS ({attempt.unlockedPanelIds.length}/{problem.cruxPanels.length})
              </h2>
              <span className="text-[10px] font-black uppercase text-[var(--ink-muted)]">
                INK → FULL COLOR
              </span>
            </div>

            <div className="space-y-3.5">
              {problem.cruxPanels.map((panel) => {
                const isUnlocked = attempt.unlockedPanelIds.includes(panel.id);
                return (
                  <div
                    key={panel.id}
                    style={{
                      backgroundColor: isUnlocked ? panel.colorHex : undefined,
                    }}
                    className={`border-[3px] border-[var(--border-ink)] shadow-[4px_4px_0px_var(--shadow-ink)] p-4 relative overflow-hidden transition-all duration-300 ${
                      isUnlocked
                        ? "crux-panel-unlocked manga-unlocked-pop speed-lines text-[#121218]"
                        : "crux-panel-locked text-[var(--ink)]"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <span className="bg-[#121218] text-white text-[10px] font-black px-2 py-0.5 uppercase tracking-widest">
                        {panel.panelNo}
                      </span>
                      {isUnlocked ? (
                        <span className="bg-[#FFFDF7] text-[#121218] border-2 border-[#121218] font-manga text-base px-2 py-0 rotate-2 shadow-[2px_2px_0px_#121218] flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#00C875]" />
                          {panel.sfx}
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-[10px] font-black uppercase bg-[var(--subpanel-bg)] text-[var(--ink)] border border-[var(--border-ink)] px-2 py-0.5">
                          <Lock className="w-3 h-3 text-[#FFC82C]" /> B&amp;W INK (LOCKED)
                        </span>
                      )}
                    </div>

                    <h3 className="font-manga text-2xl tracking-wide leading-tight">
                      {panel.title}
                    </h3>

                    <div className="mt-2 bg-[var(--card-bg)]/95 border-2 border-[var(--border-ink)] p-2.5 text-xs font-bold leading-snug">
                      {isUnlocked ? (
                        <span className="text-[var(--ink)]">✓ PROVED: {panel.unlockedInsight}</span>
                      ) : (
                        <span className="text-[var(--ink-secondary)]">
                          Challenge: Explain this invariant to Sensei Reiko in chat to colorize this
                          panel!
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* RIGHT PAGE: SENSEI REIKO SPEECH-BUBBLE COACH + SEALED CODE EDITOR */}
        <div className="xl:col-span-7 space-y-5">
          {/* Sensei Reiko Coaching Panel */}
          <div className="manga-panel overflow-hidden flex flex-col bg-[var(--card-bg)] text-[var(--ink)] border-[3px] border-[var(--border-ink)]">
            <div className="bg-[#FFC82C] text-[#121218] px-4 py-3 border-b-[3px] border-[var(--border-ink)] flex flex-wrap items-center justify-between gap-3 speed-lines">
              <div className="flex items-center gap-3">
                <SenseiAvatar
                  expression={currentExpression}
                  sfx={lastSensei?.sfx}
                  size="sm"
                />
                <div>
                  <div className="font-manga text-2xl leading-none tracking-wider">
                    SENSEI REIKO · SOCRATIC SHELL BREAK
                  </div>
                  <div className="text-[11px] font-black text-[#121218]/85">
                    {engineLabel || "Vygotsky ZPD Scaffolding · Reads Your Editable Dossier"}
                  </div>
                </div>
              </div>

              <button
                onClick={() => sendMessage("Give me a minimal ZPD hint for the next locked panel!")}
                disabled={sending}
                className="manga-btn bg-white text-[#121218] px-3 py-1.5 text-[11px] flex items-center gap-1"
              >
                <Lightbulb className="w-3.5 h-3.5 text-[#FF3358]" />
                MINIMAL HINT
              </button>
            </div>

            {/* Quick Socratic Prompt Suggestions */}
            {nextLockedPanel && (
              <div className="px-3.5 py-2 bg-[var(--subpanel-bg)] border-b border-[var(--border-ink)]/20 flex flex-wrap gap-1.5 items-center">
                <span className="text-[10px] font-black uppercase text-[var(--ink-muted)]">QUICK PROMPT:</span>
                <button
                  onClick={() => sendMessage(`How do I prove ${nextLockedPanel.title}?`)}
                  className="text-[10px] font-black bg-[var(--card-bg)] text-[var(--ink)] border border-[var(--border-ink)] px-2 py-0.5 hover:bg-[#00C2FF]/20"
                >
                  💡 Prove {nextLockedPanel.panelNo}
                </button>
                <button
                  onClick={() => sendMessage("What invariant prevents redundant re-computation here?")}
                  className="text-[10px] font-black bg-[var(--card-bg)] text-[var(--ink)] border border-[var(--border-ink)] px-2 py-0.5 hover:bg-[#00C2FF]/20"
                >
                  🔍 Invariant Check
                </button>
                <button
                  onClick={() => sendMessage("What edge cases should I guard before coding?")}
                  className="text-[10px] font-black bg-[var(--card-bg)] text-[var(--ink)] border border-[var(--border-ink)] px-2 py-0.5 hover:bg-[#00C2FF]/20"
                >
                  🛡️ Edge Cases
                </button>
              </div>
            )}

            {/* Speech Bubble Chat Feed */}
            <div className="p-4 space-y-3 max-h-[340px] overflow-y-auto bg-[var(--subpanel-bg)] halftone-dots">
              {attempt.messages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[88%] border-[2.5px] border-[var(--border-ink)] px-3.5 py-2.5 text-xs sm:text-sm font-bold leading-snug ${
                      msg.role === "user"
                        ? "bg-[#00C2FF] text-[#121218] shadow-[3px_3px_0px_var(--shadow-ink)]"
                        : "bg-[var(--card-bg)] text-[var(--ink)] shadow-[4px_4px_0px_#FF3358]"
                    }`}
                  >
                    <div className="text-[10px] font-black uppercase opacity-75 mb-1 flex items-center justify-between gap-2">
                      <span>{msg.role === "user" ? "YOU (PROOF)" : "SENSEI REIKO"}</span>
                      {msg.sfx && (
                        <span className="bg-[#FF3358] text-white px-1.5 py-0 font-manga text-xs tracking-wider">
                          {msg.sfx}
                        </span>
                      )}
                    </div>
                    <div className="whitespace-pre-line">{msg.text}</div>
                  </div>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>

            {/* Input Composer */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                sendMessage();
              }}
              className="p-3 bg-[var(--card-bg)] border-t-[3px] border-[var(--border-ink)] flex gap-2"
            >
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Explain your invariant, counterexample, or complexity proof to colorize the panels..."
                className="flex-1 border-[2.5px] border-[var(--border-ink)] bg-[var(--input-bg)] text-[var(--ink)] px-3 py-2 text-xs sm:text-sm font-bold focus:outline-none"
              />
              <button
                type="submit"
                disabled={sending || !input.trim()}
                className="manga-btn bg-[#FF3358] text-white px-5 py-2 text-xs flex items-center gap-1.5 disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                {sending ? "CHECKING..." : "PROVE"}
              </button>
            </form>
          </div>

          {/* SEALED CODE EDITOR */}
          <InkCodeEditor
            slug={problem.slug}
            starterCode={problem.starterCode}
            initialCode={attempt.submittedCode}
            sealBroken={attempt.sealBroken}
            onForceBreakSeal={forceBreakSeal}
            onSolved={() => {
              playSfx("victory");
              avengeDefeat(problem.slug);
              setActiveDefeat(null);
              setData((prev) =>
                prev ? { ...prev, attempt: { ...prev.attempt, solved: true } } : prev
              );
            }}
          />

          {/* Log Flaw to Grimoire Bar */}
          <div className="flex items-center justify-between p-3 bg-[var(--subpanel-bg)] border-2 border-[var(--border-ink)] text-xs font-bold">
            <span className="text-[var(--ink-secondary)] flex items-center gap-1.5">
              <Skull className="w-4 h-4 text-[#FF3358]" />
              Stuck or hit an unhandled edge case / timeout?
            </span>
            <button
              onClick={() => {
                playSfx("click");
                setLogDefeatOpen(true);
              }}
              className="px-2.5 py-1 bg-[var(--card-bg)] hover:bg-[#FF3358] hover:text-white text-[var(--ink)] border border-[var(--border-ink)] text-[10px] font-black uppercase transition-colors"
            >
              LOG FLAW IN GRIMOIRE +
            </button>
          </div>

          {/* Grimoire Defeat Modal */}
          {logDefeatOpen && (
            <div className="p-4 bg-[var(--card-bg)] border-4 border-[#FF3358] shadow-[6px_6px_0px_#FF3358] space-y-3">
              <div className="flex items-center justify-between border-b-2 border-[var(--border-ink)] pb-2">
                <span className="font-manga text-xl text-[#FF3358] flex items-center gap-1.5">
                  <Skull className="w-5 h-5 text-[#FF3358]" />
                  DOCUMENT FLAW IN THE GRIMOIRE OF DEFEATS
                </span>
                <button
                  onClick={() => setLogDefeatOpen(false)}
                  className="text-xs font-black px-2 py-0.5 bg-[#121218] text-white"
                >
                  CANCEL
                </button>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-[var(--ink-muted)] block">
                  FLAW CATEGORY:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {(
                    [
                      ["EDGE_CASE", "Unhandled Edge Case"],
                      ["OFF_BY_ONE", "Off-by-One Boundary"],
                      ["RACE_CONDITION", "Race Condition / Memory Barrier"],
                      ["SUBOPTIMAL_TIME", "Suboptimal Quadratic O(N²)"],
                      ["MEMORY_BLOWUP", "Memory / Heap Blowup"],
                    ] as const
                  ).map(([cat, label]) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setDefeatCategory(cat)}
                      className={`p-2 text-left text-[10px] font-black border transition-all ${
                        defeatCategory === cat
                          ? "bg-[#FF3358] text-white border-[#121218] shadow-[2px_2px_0px_#121218]"
                          : "bg-[var(--subpanel-bg)] text-[var(--ink)] border-[var(--border-ink)]"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>

                <label className="text-[10px] font-black uppercase text-[var(--ink-muted)] block mt-2">
                  WHAT BROKE? (MISTAKE NOTES):
                </label>
                <textarea
                  rows={2}
                  value={defeatNotes}
                  onChange={(e) => setDefeatNotes(e.target.value)}
                  placeholder="e.g. Forgot empty prefix seed {0: 1}; loop caused off-by-one index error on N=1..."
                  className="w-full border-2 border-[var(--border-ink)] bg-[var(--input-bg)] text-[var(--ink)] p-2 text-xs font-bold"
                />

                <button
                  onClick={() => {
                    if (!defeatNotes.trim()) return;
                    playSfx("unlock");
                    logDefeat(
                      problem.slug,
                      problem.title,
                      problem.topic,
                      defeatCategory,
                      defeatNotes.trim()
                    );
                    setActiveDefeat(hasUnresolvedDefeat(problem.slug));
                    setLogDefeatOpen(false);
                    setDefeatNotes("");
                  }}
                  className="w-full py-2 bg-[#FF3358] hover:bg-[#ff4d6e] text-white font-black text-xs uppercase border-2 border-[#121218] shadow-[3px_3px_0px_#121218]"
                >
                  SAVE DEFEAT RECORD (TAG PROBLEM FOR REVENGE)
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
