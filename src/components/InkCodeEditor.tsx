"use client";

import React, { useState } from "react";
import { Lock, Play, Unlock, CheckCircle2, XCircle, Zap, RotateCcw, Copy, Check, Clock } from "lucide-react";
import { playSfx } from "@/lib/sound";

interface TestResult {
  label: string;
  passed: boolean;
  expected: string;
  actual: string;
}

export function InkCodeEditor({
  slug,
  starterCode,
  initialCode,
  sealBroken,
  onForceBreakSeal,
  onSolved,
}: {
  slug: string;
  starterCode: Record<string, string>;
  initialCode: string;
  sealBroken: boolean;
  onForceBreakSeal: () => void;
  onSolved: () => void;
}) {
  const [language, setLanguage] = useState<"typescript" | "python" | "cpp" | "rust">("typescript");
  const [code, setCode] = useState(initialCode || starterCode.typescript);
  const [running, setRunning] = useState(false);
  const [results, setResults] = useState<TestResult[] | null>(null);
  const [passedAll, setPassedAll] = useState(false);
  const [note, setNote] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [execTime, setExecTime] = useState<number | null>(null);

  const handleLangChange = (next: "typescript" | "python" | "cpp" | "rust") => {
    playSfx("click");
    setLanguage(next);
    setCode(starterCode[next] || "");
    setResults(null);
    setNote(null);
  };

  const resetCode = () => {
    playSfx("click");
    setCode(starterCode[language] || "");
    setResults(null);
    setNote(null);
  };

  const copyCode = () => {
    playSfx("click");
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const runCode = async () => {
    playSfx("click");
    setRunning(true);
    setNote(null);
    const start = performance.now();
    try {
      const res = await fetch("/api/run-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, code, language }),
      });
      const data = await res.json();
      const duration = Math.round(performance.now() - start);
      setExecTime(duration);
      setResults(data.results || []);
      setPassedAll(Boolean(data.passedAll));
      if (data.note) setNote(data.note);
      if (data.passedAll) {
        playSfx("seal-broken");
        onSolved();
      } else {
        playSfx("guess");
      }
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="manga-panel overflow-hidden flex flex-col relative border-[3px] border-[var(--border-ink)] bg-[var(--card-bg)]">
      {/* Editor Header Bar */}
      <div className="bg-[#121218] text-white px-3.5 py-2.5 flex flex-wrap items-center justify-between gap-2 border-b-[3px] border-[var(--border-ink)]">
        <div className="flex items-center gap-2">
          {sealBroken ? (
            <Unlock className="w-4 h-4 text-[#00C875]" />
          ) : (
            <Lock className="w-4 h-4 text-[#FFC82C]" />
          )}
          <span className="font-manga text-lg tracking-wider text-[#FFC82C]">
            IMPLEMENTATION TRIGGER
          </span>
          {sealBroken && (
            <span className="bg-[#00C875] text-[#121218] text-[9px] font-black uppercase px-1.5 py-0.5 rounded-xs">
              UNSEALED
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Action Tools: Reset & Copy */}
          <button
            onClick={resetCode}
            title="Reset to Starter Code"
            className="p-1 bg-white/10 hover:bg-white/20 text-white border border-white/20 text-[10px] font-black uppercase flex items-center gap-1"
          >
            <RotateCcw className="w-3 h-3" />
            <span className="hidden sm:inline">RESET</span>
          </button>
          <button
            onClick={copyCode}
            title="Copy Solution Code"
            className="p-1 bg-white/10 hover:bg-white/20 text-white border border-white/20 text-[10px] font-black uppercase flex items-center gap-1"
          >
            {copied ? <Check className="w-3 h-3 text-[#00C875]" /> : <Copy className="w-3 h-3" />}
            <span className="hidden sm:inline">{copied ? "COPIED!" : "COPY"}</span>
          </button>

          {/* Language Selector */}
          <div className="flex items-center gap-1 ml-1">
            {(["typescript", "python", "cpp", "rust"] as const).map((lang) => (
              <button
                key={lang}
                onClick={() => handleLangChange(lang)}
                className={`px-2 py-0.5 text-[11px] font-black uppercase border border-white/30 transition-colors ${
                  language === lang
                    ? "bg-[#00C2FF] text-[#121218] border-[#00C2FF]"
                    : "bg-white/10 text-white hover:bg-white/20"
                }`}
              >
                {lang === "typescript" ? "TS / JS" : lang.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Code Area with Sealed Talisman Overlay */}
      <div className="relative bg-[#10101C] text-[#F8F4E8]">
        <textarea
          value={code}
          onChange={(e) => setCode(e.target.value)}
          disabled={!sealBroken}
          spellCheck={false}
          rows={14}
          className="w-full p-4 font-mono text-xs sm:text-sm leading-relaxed bg-transparent text-[#F8F4E8] focus:outline-none resize-y selection:bg-[#00C2FF] selection:text-[#121218]"
        />

        {!sealBroken && (
          <div className="absolute inset-0 bg-[#0C0C14]/85 backdrop-blur-[2.5px] flex flex-col items-center justify-center p-6 text-center z-10">
            <div className="bg-[#FFC82C] text-[#121218] border-[3px] border-[#121218] shadow-[6px_6px_0px_#FF3358] px-6 py-4 -rotate-1 max-w-sm">
              <div className="font-manga text-3xl tracking-wider text-[#FF3358]">
                SEALED — PROOF FIRST!!
              </div>
              <p className="text-xs font-bold mt-1.5 leading-snug">
                No blind trial-and-error coding! Explain every Breakthrough Panel to{" "}
                <span className="underline">Sensei Reiko</span> on the left page so the manga panels
                flood with color and shatter this seal.
              </p>
              <button
                onClick={() => {
                  playSfx("seal-broken");
                  onForceBreakSeal();
                }}
                className="mt-3 text-[11px] font-black uppercase underline text-[#121218]/85 hover:text-[#121218] block w-full"
              >
                Or Break Seal Early (Bypass Proof Gate)
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Run Toolbar */}
      <div className="bg-[var(--subpanel-bg,#FAF4E6)] px-3.5 py-2.5 border-t-[3px] border-[var(--border-ink)] flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-[11px] font-bold text-[var(--ink-secondary,#4A4A5A)]">
          <span>
            {language === "typescript"
              ? "Instant Sandbox Execution (Client VM)"
              : "TS/JS runs in instant sandbox · Multi-language hook ready"}
          </span>
          {execTime !== null && (
            <span className="font-mono text-[#00C2FF] flex items-center gap-1 font-bold">
              <Clock className="w-3 h-3" /> {execTime}ms
            </span>
          )}
        </div>
        <button
          disabled={!sealBroken || running}
          onClick={runCode}
          className="manga-btn bg-[#00C875] text-[#121218] px-5 py-2 text-xs flex items-center gap-1.5 disabled:opacity-40"
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          {running ? "FIRING TESTS..." : "FIRE TESTS"}
        </button>
      </div>

      {/* Test Results Output */}
      {results && (
        <div className="p-3.5 border-t-[3px] border-[var(--border-ink)] bg-[var(--card-bg)] text-[var(--ink)] space-y-2">
          {passedAll && (
            <div className="bg-[#00C875] text-[#121218] border-2 border-[#121218] shadow-[3px_3px_0px_#121218] px-3 py-2 flex items-center justify-between">
              <span className="font-manga text-xl tracking-wider flex items-center gap-1.5">
                <Zap className="w-5 h-5 fill-current" /> DIRECT HIT — ALL TESTS PASSED!! (+150 XP)
              </span>
            </div>
          )}
          {note && (
            <div className="bg-[#FFC82C]/30 border-2 border-[var(--border-ink)] px-3 py-1.5 text-xs font-bold text-[var(--ink)]">
              {note}
            </div>
          )}
          <div className="space-y-1.5">
            {results.map((r, i) => (
              <div
                key={i}
                className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono border-2 border-[var(--border-ink)] px-2.5 py-1.5 bg-[var(--subpanel-bg)] text-[var(--ink)]"
              >
                <span className="font-bold flex items-center gap-1.5">
                  {r.passed ? (
                    <CheckCircle2 className="w-4 h-4 text-[#00C875]" />
                  ) : (
                    <XCircle className="w-4 h-4 text-[#FF3358]" />
                  )}
                  {r.label}
                </span>
                <span className="text-[11px] text-[var(--ink-secondary)]">
                  exp: <strong className="text-[var(--ink)]">{r.expected}</strong> | got:{" "}
                  <strong className={r.passed ? "text-[#00C875]" : "text-[#FF3358]"}>
                    {r.actual}
                  </strong>
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
