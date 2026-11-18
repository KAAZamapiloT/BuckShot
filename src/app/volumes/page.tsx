"use client";

import React, { useState } from "react";
import Link from "next/link";
import { GitBranch, FileCheck2, ShieldAlert, ArrowRight, Sparkles } from "lucide-react";
import { COMPANY_INTEL_FILES, MANGA_VOLUMES } from "@/lib/seed-data";

export default function VolumesPage() {
  const [repoUrl, setRepoUrl] = useState("vercel/next.js");
  const [ghResult, setGhResult] = useState<{
    meta: { name: string; description: string; language: string; stars: number };
    questions: Array<{ tag: string; accent: string; question: string }>;
  } | null>(null);
  const [ghLoading, setGhLoading] = useState(false);

  const [resumeText, setResumeText] = useState(
    "Built real-time analytics ingestion service in Rust and Redis processing 35k events/sec; reduced p99 latency by 52% by migrating hot keys to local ring buffers."
  );
  const [resumeResult, setResumeResult] = useState<{
    score: number;
    grade: string;
    verdict: string;
    highlights: string[];
    rewrittenExample: string;
  } | null>(null);
  const [resumeLoading, setResumeLoading] = useState(false);

  const syncRepo = async (e: React.FormEvent) => {
    e.preventDefault();
    setGhLoading(true);
    try {
      const res = await fetch("/api/coach/github", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ repoUrl }),
      });
      const data = await res.json();
      if (!data.error) setGhResult(data);
    } finally {
      setGhLoading(false);
    }
  };

  const analyzeResume = async (e: React.FormEvent) => {
    e.preventDefault();
    setResumeLoading(true);
    try {
      const res = await fetch("/api/coach/resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeText }),
      });
      const data = await res.json();
      if (!data.error) setResumeResult(data);
    } finally {
      setResumeLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="manga-panel p-5 bg-[#7C4DFF] text-white speed-lines">
        <span className="bg-[#121218] text-[#FFC82C] text-[10px] font-black px-2 py-0.5 uppercase">
          COMPLETE TANKOBON LIBRARY · CAREER ARSENAL
        </span>
        <h1 className="font-manga text-4xl sm:text-5xl tracking-wider mt-1 drop-shadow-[3px_3px_0px_#121218]">
          THE 5 MANGA VOLUMES + INTEL &amp; GITHUB SYNC
        </h1>
      </div>

      {/* 5 Volumes Detailed Cards */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {MANGA_VOLUMES.map((vol) => (
          <div
            id={`vol-${vol.number}`}
            key={vol.number}
            className="manga-panel bg-[#FFFDF7] text-[#121218] overflow-hidden flex flex-col justify-between"
          >
            <div
              style={{ backgroundColor: vol.accent }}
              className="p-4 border-b-[3px] border-[#121218] speed-lines"
            >
              <div className="flex items-center justify-between">
                <span className="font-manga text-2xl">{vol.code}</span>
                <span className="bg-[#121218] text-white text-[10px] font-black px-2 py-0.5">
                  {vol.badge}
                </span>
              </div>
              <h2 className="font-manga text-3xl tracking-wide mt-0.5">{vol.name}</h2>
            </div>
            <div className="p-4 flex-1 flex flex-col justify-between space-y-4">
              <p className="text-xs font-bold text-[#3D3D4E]">{vol.subtitle}</p>
              <div className="flex flex-wrap gap-1.5">
                {vol.topics.map((t) => (
                  <span
                    key={t}
                    className="text-[11px] font-black bg-[#FAF4E6] border-2 border-[#121218] px-2 py-0.5"
                  >
                    {t}
                  </span>
                ))}
              </div>
              <Link
                href={vol.number === 4 ? "/blueprint" : "/shell-break"}
                className="manga-btn bg-[#121218] text-[#FFC82C] px-3 py-2 text-xs flex items-center justify-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                OPEN VOLUME ARENA <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        ))}
      </section>

      {/* GITHUB REPO SYNC + RESUME FORGE */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* GitHub Repo Interrogation */}
        <div className="manga-panel p-5 bg-[#FFFDF7] text-[#121218] space-y-4">
          <div className="border-b-[3px] border-[#121218] pb-2">
            <span className="text-[10px] font-black uppercase text-[#00C2FF]">
              PORTFOLIO CODEBASE DRILL
            </span>
            <h2 className="font-manga text-3xl flex items-center gap-2">
              <GitBranch className="w-6 h-6 text-[#FF3358]" />
              GITHUB REPO INTERROGATION
            </h2>
          </div>

          <form onSubmit={syncRepo} className="flex gap-2">
            <input
              value={repoUrl}
              onChange={(e) => setRepoUrl(e.target.value)}
              placeholder="owner/repo or https://github.com/..."
              className="flex-1 border-[2.5px] border-[#121218] bg-[#FAF4E6] px-3 py-2 text-xs font-mono font-bold"
            />
            <button
              type="submit"
              disabled={ghLoading}
              className="manga-btn bg-[#00C2FF] text-[#121218] px-4 py-2 text-xs"
            >
              {ghLoading ? "SYNCING..." : "SYNC REPO"}
            </button>
          </form>

          {ghResult && (
            <div className="space-y-3">
              <div className="bg-[#FAF4E6] border-2 border-[#121218] p-3 text-xs font-bold">
                <div className="font-black text-sm">{ghResult.meta.name}</div>
                <div className="text-[#4A4A5A] mt-0.5">{ghResult.meta.description}</div>
              </div>
              {ghResult.questions.map((q, i) => (
                <div
                  key={i}
                  className="border-2 border-[#121218] bg-white p-3 shadow-[3px_3px_0px_#121218]"
                >
                  <span
                    style={{ backgroundColor: q.accent }}
                    className="text-white text-[10px] font-black px-2 py-0.5 border border-[#121218]"
                  >
                    {q.tag}
                  </span>
                  <p className="text-xs font-bold mt-2 leading-snug">{q.question}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Resume Forge */}
        <div className="manga-panel p-5 bg-[#FFFDF7] text-[#121218] space-y-4">
          <div className="border-b-[3px] border-[#121218] pb-2">
            <span className="text-[10px] font-black uppercase text-[#FF3358]">
              SIGNAL EXTRACTOR &amp; CRITIQUE
            </span>
            <h2 className="font-manga text-3xl flex items-center gap-2">
              <FileCheck2 className="w-6 h-6 text-[#00C875]" />
              RESUME FORGE
            </h2>
          </div>

          <form onSubmit={analyzeResume} className="space-y-3">
            <textarea
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
              rows={4}
              className="w-full border-[2.5px] border-[#121218] bg-[#FAF4E6] p-3 text-xs font-bold"
              placeholder="Paste your top engineering resume bullets..."
            />
            <button
              type="submit"
              disabled={resumeLoading}
              className="manga-btn bg-[#FFC82C] text-[#121218] px-4 py-2 text-xs"
            >
              {resumeLoading ? "GRADING..." : "FORGE & GRADE RESUME"}
            </button>
          </form>

          {resumeResult && (
            <div className="space-y-3 border-t-2 border-dashed border-[#121218]/30 pt-3">
              <div className="flex items-center justify-between">
                <span className="font-manga text-3xl text-[#FF3358]">
                  GRADE {resumeResult.grade} · {resumeResult.score}/100
                </span>
              </div>
              <p className="text-xs font-bold">{resumeResult.verdict}</p>
              <ul className="space-y-1.5 text-xs font-medium list-disc pl-4">
                {resumeResult.highlights.map((h, i) => (
                  <li key={i}>{h}</li>
                ))}
              </ul>
              <div className="bg-[#00C875]/20 border-2 border-[#121218] p-2.5 text-xs font-bold">
                <span className="uppercase text-[10px] font-black block text-[#121218]">
                  STAFF-TIER REWRITE EXAMPLE:
                </span>
                {resumeResult.rewrittenExample}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* COMPANY INTEL FILES */}
      <section className="space-y-3">
        <h2 className="font-manga text-3xl tracking-wider flex items-center gap-2">
          <ShieldAlert className="w-7 h-7 text-[#FF3358]" />
          CLASSIFIED COMPANY INTEL FILES
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {COMPANY_INTEL_FILES.map((file) => (
            <div
              key={file.code}
              className="manga-panel bg-[#FFFDF7] text-[#121218] overflow-hidden flex flex-col"
            >
              <div
                style={{ backgroundColor: file.accent }}
                className="px-3.5 py-2 border-b-[3px] border-[#121218] text-white flex items-center justify-between"
              >
                <span className="font-mono text-xs font-black">{file.code}</span>
                <span className="bg-[#121218] text-[#FFC82C] text-[10px] font-black px-1.5 py-0.5">
                  {file.tier}
                </span>
              </div>
              <div className="p-4 space-y-2.5 flex-1">
                <h3 className="font-manga text-2xl">{file.company}</h3>
                <ul className="space-y-1 text-[11px] font-bold">
                  {file.rounds.map((r) => (
                    <li key={r} className="bg-[#FAF4E6] border border-[#121218] px-2 py-1">
                      • {r}
                    </li>
                  ))}
                </ul>
                <p className="text-xs font-medium text-[#4A4A5A] pt-1">{file.signal}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
