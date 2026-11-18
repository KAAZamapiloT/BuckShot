"use client";

import React, { useState } from "react";
import { Lock, Play, Unlock, CheckCircle2, XCircle, Zap } from "lucide-react";

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

  const handleLangChange = (next: "typescript" | "python" | "cpp" | "rust") => {
    setLanguage(next);
    setCode(starterCode[next] || "");
    setResults(null);
    setNote(null);
  };

  const runCode = async () => {
    setRunning(true);
    setNote(null);
    try {
      const res = await fetch("/api/run-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, code, language }),
      });
      const data = await res.json();
      setResults(data.results || []);
      setPassedAll(Boolean(data.passedAll));
      if (data.note) setNote(data.note);
      if (data.passedAll) onSolved();
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="manga-panel overflow-hidden flex flex-col relative">
      {/* Editor Header Bar */}
      <div className="bg-[#121218] text-white px-3.5 py-2 flex flex-wrap items-center justify-between gap-2 border-b-[3px] border-[#121218]">
        <div className="flex items-center gap-2">
          {sealBroken ? (
            <Unlock className="w-4 h-4 text-[#00C875]" />
          ) : (
            <Lock className="w-4 h-4 text-[#FFC82C]" />
          )}
          <span className="font-manga text-lg tracking-wider text-[#FFC82C]">
            IMPLEMENTATION TRIGGER
          </span>
        </div>

        <div className="flex items-center gap-1.5">
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

      {/* Code Area with Sealed Talisman Overlay */}
      <div className="relative bg-[#161622] text-[#F8F4E8]">
        <textarea
          value={code}
          onChange={(e) => setCode(e.target.value)}
          disabled={!sealBroken}
          spellCheck={false}
          rows={13}
          className="w-full p-4 font-mono text-xs sm:text-sm leading-relaxed bg-transparent text-[#F8F4E8] focus:outline-none resize-y"
        />

        {!sealBroken && (
          <div className="absolute inset-0 bg-[#121218]/80 backdrop-blur-[2px] flex flex-col items-center justify-center p-6 text-center z-10">
            <div className="bg-[#FFC82C] text-[#121218] border-[3px] border-[#121218] shadow-[6px_6px_0px_#FF3358] px-6 py-4 -rotate-2 max-w-sm">
              <div className="font-manga text-3xl tracking-wider text-[#FF3358]">
                SEALED — PROOF FIRST!!
              </div>
              <p className="text-xs font-bold mt-1.5 leading-snug">
                No blind trial-and-error coding! Explain every Breakthrough Panel to{" "}
                <span className="underline">Sensei Reiko</span> so the manga panels fill with color and break this seal.
              </p>
              <button
                onClick={onForceBreakSeal}
                className="mt-3 text-[11px] font-black uppercase underline text-[#121218]/75 hover:text-[#121218]"
              >
                Or Break Seal Early (Bypass Proof Gate)
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Run Toolbar */}
      <div className="bg-[#FAF4E6] px-3.5 py-2.5 border-t-[3px] border-[#121218] flex items-center justify-between gap-3">
        <span className="text-[11px] font-bold text-[#4A4A5A]">
          {language === "typescript"
            ? "Instant Sandbox Execution Ready"
            : "TS/JS runs locally · Rust Axum/Piston hookable for native judge"}
        </span>
        <button
          disabled={!sealBroken || running}
          onClick={runCode}
          className="manga-btn bg-[#00C875] text-[#121218] px-4 py-1.5 text-xs flex items-center gap-1.5 disabled:opacity-40"
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          {running ? "FIRING..." : "FIRE TESTS"}
        </button>
      </div>

      {/* Test Results Output */}
      {results && (
        <div className="p-3.5 border-t-[3px] border-[#121218] bg-[#FFFDF7] text-[#121218] space-y-2">
          {passedAll && (
            <div className="bg-[#00C875] border-2 border-[#121218] shadow-[3px_3px_0px_#121218] px-3 py-2 flex items-center justify-between">
              <span className="font-manga text-xl tracking-wider flex items-center gap-1.5">
                <Zap className="w-5 h-5 fill-current" /> DIRECT HIT — ALL TESTS PASSED!! (+150 XP)
              </span>
            </div>
          )}
          {note && (
            <div className="bg-[#FFC82C]/30 border-2 border-[#121218] px-3 py-1.5 text-xs font-bold">
              {note}
            </div>
          )}
          <div className="space-y-1.5">
            {results.map((r, i) => (
              <div
                key={i}
                className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono border-2 border-[#121218] px-2.5 py-1.5 bg-[#FAF4E6]"
              >
                <span className="font-bold flex items-center gap-1.5">
                  {r.passed ? (
                    <CheckCircle2 className="w-4 h-4 text-[#00C875]" />
                  ) : (
                    <XCircle className="w-4 h-4 text-[#FF3358]" />
                  )}
                  {r.label}
                </span>
                <span className="text-[11px]">
                  exp: <strong>{r.expected}</strong> | got: <strong>{r.actual}</strong>
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
