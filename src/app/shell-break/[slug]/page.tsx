"use client";

import React, { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Send, Sparkles, Lightbulb, CheckCircle2, Lock } from "lucide-react";
import { SenseiAvatar, type SenseiExpression } from "@/components/SenseiAvatar";
import { InkCodeEditor } from "@/components/InkCodeEditor";
import { AlgoVisualizer } from "@/components/AlgoVisualizer";
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
  const chatEndRef = useRef<HTMLDivElement>(null);

  const loadProblem = async () => {
    const res = await fetch(`/api/problems?slug=${encodeURIComponent(slug)}`);
    const json = await res.json();
    setData(json);
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

    try {
      const res = await fetch("/api/coach/shell-break", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, message: text }),
      });
      const json = await res.json();
      if (json.engineLabel) setEngineLabel(json.engineLabel);
      if (json.attempt) {
        setData((prev) => (prev ? { ...prev, attempt: json.attempt } : prev));
      }
    } finally {
      setSending(false);
    }
  };

  const forceBreakSeal = async () => {
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

  return (
    <div className="space-y-5">
      {/* Top Chapter Breadcrumb & Score Strip */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/shell-break"
          className="manga-btn bg-[#FFFDF7] text-[#121218] px-3 py-1.5 text-xs flex items-center gap-1.5"
        >
          <ArrowLeft className="w-4 h-4" /> ALL BATTLE CARDS
        </Link>

        <div className="flex flex-wrap items-center gap-2">
          <span className="bg-[#121218] text-[#FFC82C] font-manga text-lg px-3 py-0.5 tracking-wider">
            {problem.volumeName} · PL {problem.rating}
          </span>
          <span className="bg-[#00C2FF] text-[#121218] border-2 border-[#121218] font-black text-xs px-3 py-1">
            REASONING SCORE: {attempt.reasoningScore} / 100
          </span>
          {attempt.solved && (
            <span className="bg-[#00C875] text-[#121218] border-2 border-[#121218] font-black text-xs px-3 py-1">
              ✓ SOLVED
            </span>
          )}
        </div>
      </div>

      {/* 2-PAGE OPEN MANGA SPREAD */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start relative">
        {/* LEFT PAGE: PROBLEM BRIEF + INK-TO-COLOR BREAKTHROUGH PANELS */}
        <div className="xl:col-span-5 space-y-5">
          {/* Problem Brief Panel */}
          <div className="manga-panel p-5 bg-[#FFFDF7] text-[#121218] halftone-dots">
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="bg-[#FF3358] text-white text-[10px] font-black px-2 py-0.5 uppercase">
                {problem.sourceTag} · {problem.topic}
              </span>
              <span className="text-[11px] font-black text-[#4A4A5A]">PAGE L-01</span>
            </div>
            <h1 className="font-manga text-3xl sm:text-4xl tracking-wide leading-tight mb-3">
              {problem.title}
            </h1>
            <p className="text-sm font-medium leading-relaxed text-[#22222E] mb-3">
              {problem.brief}
            </p>
            <div className="bg-[#FAF4E6] border-2 border-[#121218] px-3 py-2 font-mono text-xs font-bold">
              {problem.constraints}
            </div>
          </div>

          {/* MANGA ACTION REPLAY STEP-THROUGH VISUALIZER */}
          <AlgoVisualizer slug={problem.slug} />

          {/* INK-TO-COLOR BREAKTHROUGH PANELS (Crux Constellation reimagined as Manga Coloring Panels!) */}
          <div className="manga-panel p-5 bg-[#FFFDF7] text-[#121218] space-y-4">
            <div className="flex items-center justify-between border-b-[3px] border-[#121218] pb-2">
              <h2 className="font-manga text-2xl tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-5 h-5 text-[#FF3358]" />
                BREAKTHROUGH PANELS ({attempt.unlockedPanelIds.length}/{problem.cruxPanels.length})
              </h2>
              <span className="text-[10px] font-black uppercase text-[#4A4A5A]">
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
                    className={`border-[3px] border-[#121218] shadow-[4px_4px_0px_#121218] p-4 relative overflow-hidden ${
                      isUnlocked
                        ? "crux-panel-unlocked manga-unlocked-pop speed-lines text-[#121218]"
                        : "crux-panel-locked text-[#121218]"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <span className="bg-[#121218] text-white text-[10px] font-black px-2 py-0.5 uppercase tracking-widest">
                        {panel.panelNo}
                      </span>
                      {isUnlocked ? (
                        <span className="bg-[#FFFDF7] border-2 border-[#121218] font-manga text-base px-2 py-0 rotate-2 shadow-[2px_2px_0px_#121218] flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#00C875]" />
                          {panel.sfx}
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-[10px] font-black uppercase bg-white/80 border border-[#121218] px-2 py-0.5">
                          <Lock className="w-3 h-3" /> B&amp;W INK (LOCKED)
                        </span>
                      )}
                    </div>

                    <h3 className="font-manga text-2xl tracking-wide leading-tight">
                      {panel.title}
                    </h3>

                    <div className="mt-2 bg-[#FFFDF7]/95 border-2 border-[#121218] p-2.5 text-xs font-bold leading-snug">
                      {isUnlocked ? (
                        <span className="text-[#121218]">✓ PROVED: {panel.unlockedInsight}</span>
                      ) : (
                        <span className="text-[#4A4A5A]">
                          Challenge: Explain this concept to Sensei Reiko in chat to colorize this
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
          <div className="manga-panel overflow-hidden flex flex-col bg-[#FFFDF7] text-[#121218]">
            <div className="bg-[#FFC82C] px-4 py-3 border-b-[3px] border-[#121218] flex flex-wrap items-center justify-between gap-3 speed-lines">
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
                  <div className="text-[11px] font-black text-[#121218]/80">
                    {engineLabel || "Vygotsky ZPD Scaffolding · Reads Your Editable Dossier"}
                  </div>
                </div>
              </div>

              <button
                onClick={() => sendMessage("Give me a minimal ZPD hint for the next locked panel!")}
                disabled={sending}
                className="manga-btn bg-[#FFFDF7] text-[#121218] px-3 py-1.5 text-[11px] flex items-center gap-1"
              >
                <Lightbulb className="w-3.5 h-3.5 text-[#FF3358]" />
                MINIMAL HINT
              </button>
            </div>

            {/* Speech Bubble Chat Feed */}
            <div className="p-4 space-y-3 max-h-[340px] overflow-y-auto bg-[#FAF4E6] halftone-dots">
              {attempt.messages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[88%] border-[2.5px] border-[#121218] px-3.5 py-2.5 text-xs sm:text-sm font-bold leading-snug ${
                      msg.role === "user"
                        ? "bg-[#00C2FF] text-[#121218] shadow-[3px_3px_0px_#121218]"
                        : "bg-[#FFFDF7] text-[#121218] shadow-[4px_4px_0px_#FF3358]"
                    }`}
                  >
                    <div className="text-[10px] font-black uppercase opacity-70 mb-1 flex items-center justify-between gap-2">
                      <span>{msg.role === "user" ? "YOU (PROOF)" : "SENSEI REIKO"}</span>
                      {msg.sfx && (
                        <span className="bg-[#FF3358] text-white px-1.5 py-0 font-manga text-xs tracking-wider">
                          {msg.sfx}
                        </span>
                      )}
                    </div>
                    {msg.text}
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
              className="p-3 bg-[#FFFDF7] border-t-[3px] border-[#121218] flex gap-2"
            >
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Explain your invariant, counterexample, or complexity proof to colorize the panels..."
                className="flex-1 border-[2.5px] border-[#121218] bg-[#FAF4E6] px-3 py-2 text-xs sm:text-sm font-bold focus:outline-none focus:bg-white"
              />
              <button
                type="submit"
                disabled={sending || !input.trim()}
                className="manga-btn bg-[#FF3358] text-white px-4 py-2 text-xs flex items-center gap-1.5 disabled:opacity-50"
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
            onSolved={() =>
              setData((prev) =>
                prev ? { ...prev, attempt: { ...prev.attempt, solved: true } } : prev
              )
            }
          />
        </div>
      </div>
    </div>
  );
}
