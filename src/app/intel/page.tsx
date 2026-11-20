"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Building2,
  ShieldAlert,
  ArrowRight,
  Flame,
  Award,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Layers,
  Sparkles,
} from "lucide-react";
import { COMPANY_DOSSIERS, type CompanyDossier } from "@/lib/intel-data";
import { SEED_PROBLEMS } from "@/lib/seed-data";
import { playSfx } from "@/lib/sound";

export default function CompanyIntelPage() {
  const [selectedId, setSelectedId] = useState<string>("openai");
  const dossier: CompanyDossier = COMPANY_DOSSIERS[selectedId] || COMPANY_DOSSIERS["openai"];

  // Find recommended problem objects
  const recommendedProblems = SEED_PROBLEMS.filter((p) =>
    dossier.recommendedSlugs.includes(p.slug)
  );

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Top Masthead Banner */}
      <div className="manga-panel bg-[var(--card-bg)] text-[var(--ink)] p-5 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-full bg-gradient-to-l from-[#FF3358]/15 to-transparent pointer-events-none" />
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="bg-[#FF3358] text-white font-black text-[10px] tracking-widest px-2 py-0.5 uppercase border border-[#121218]">
                TIER-1 BOUNTY INTEL
              </span>
              <span className="text-[11px] font-mono font-bold text-[var(--ink-muted)]">
                HIRING COMMITTEE BAR-RAISER DOSSIERS
              </span>
            </div>
            <h1 className="font-manga text-3xl sm:text-4xl tracking-wider text-[var(--ink)]">
              COMPANY BOUNTY INTEL VAULT
            </h1>
            <p className="text-xs sm:text-sm font-medium text-[var(--ink-secondary)] max-w-2xl mt-1">
              Top tech titans don&apos;t evaluate the same skills. Databricks tests cache locality and
              concurrency; Meta tests high-velocity execution; OpenAI tests AI memory architectures.
              Study their exact rubrics before entering the loop.
            </p>
          </div>

          <Link
            href={`/chamber?company=${dossier.id}`}
            onClick={() => playSfx("deal")}
            className="px-4 py-2.5 bg-[#FFC82C] hover:bg-[#ffe17d] text-[#121218] font-black text-xs uppercase flex items-center gap-2 border-2 border-[#121218] shadow-[3px_3px_0px_#121218] shrink-0"
          >
            <Flame className="w-4 h-4 text-[#FF3358] fill-current" />
            FILTER CHAMBER FOR {dossier.name.toUpperCase()}
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Company Selector Tab Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
        {Object.values(COMPANY_DOSSIERS).map((c) => {
          const active = selectedId === c.id;
          return (
            <button
              key={c.id}
              onClick={() => {
                playSfx("click");
                setSelectedId(c.id);
              }}
              className={`p-3 border-2 transition-all flex flex-col items-center justify-center text-center gap-1 ${
                active
                  ? "bg-[#121218] text-white border-[#FFC82C] shadow-[4px_4px_0px_#FFC82C] -translate-y-1"
                  : "bg-[var(--card-bg)] hover:bg-[var(--subpanel-bg)] text-[var(--ink)] border-[var(--border-ink)]"
              }`}
            >
              <span className="text-xl">{c.logoEmoji}</span>
              <span className="font-manga text-base tracking-wider leading-tight">{c.name}</span>
              <span className="text-[9px] font-mono font-bold opacity-75">{c.code}</span>
            </button>
          );
        })}
      </div>

      {/* Selected Company Dossier Spread */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Bar Raiser & Round Breakdown */}
        <div className="lg:col-span-7 space-y-5">
          {/* Company Hero Profile */}
          <div className="manga-panel bg-[var(--card-bg)] text-[var(--ink)] p-5 space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2 border-b-2 border-[var(--border-ink)] pb-3">
              <div>
                <span className="text-[10px] font-black tracking-widest uppercase text-[#FF3358] block">
                  {dossier.badge}
                </span>
                <h2 className="font-manga text-3xl tracking-wide mt-0.5">
                  {dossier.name} &bull; {dossier.targetRole}
                </h2>
              </div>
              <div className="p-2 bg-[var(--subpanel-bg)] border border-[var(--border-ink)] text-right">
                <span className="text-[9px] font-black uppercase text-[var(--ink-muted)] block">
                  EXPECTED TARGET TC
                </span>
                <span className="font-mono text-sm font-black text-[#00C875]">
                  {dossier.salaryRange}
                </span>
              </div>
            </div>

            {/* Bar Raiser Philosophy */}
            <div className="p-3.5 bg-[var(--subpanel-bg)] border-2 border-[var(--border-ink)] shadow-[2px_2px_0px_var(--shadow-ink)]">
              <span className="text-[10px] font-black tracking-widest uppercase text-[#00C2FF] flex items-center gap-1 mb-1">
                <ShieldAlert className="w-3.5 h-3.5 text-[#00C2FF]" />
                HIRING COMMITTEE &amp; BAR-RAISER PHILOSOPHY
              </span>
              <p className="text-xs sm:text-sm font-medium leading-relaxed text-[var(--ink)]">
                {dossier.barRaiserPhilosophy}
              </p>
            </div>

            {/* 4-Round Loop Timeline */}
            <div className="space-y-2 pt-2">
              <span className="text-[10px] font-black uppercase text-[var(--ink-muted)] tracking-wider block">
                TYPICAL ONSITE INTERVIEW LOOP:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {dossier.loopRounds.map((r, i) => (
                  <div
                    key={i}
                    className="p-3 bg-[var(--card-bg)] border-2 border-[var(--border-ink)] shadow-[2px_2px_0px_var(--shadow-ink)]"
                  >
                    <div className="flex items-center justify-between text-[10px] font-black uppercase mb-1">
                      <span className="text-[#FF3358]">{r.name}</span>
                      <span className="font-mono text-[var(--ink-muted)] flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {r.duration}
                      </span>
                    </div>
                    <div className="text-[10px] font-bold text-[#00C2FF] mb-1">{r.format}</div>
                    <p className="text-[11px] font-medium text-[var(--ink-secondary)] leading-snug">
                      {r.focus}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Critical Gotchas and Traps */}
          <div className="manga-panel bg-[var(--card-bg)] text-[var(--ink)] p-4 space-y-2">
            <span className="text-[10px] font-black tracking-widest uppercase text-[#FF3358] flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5 text-[#FF3358]" />
              FATAL GOTCHAS &amp; INTERVIEW TRAPS
            </span>
            <div className="space-y-2">
              {dossier.gotchasAndTraps.map((g, idx) => (
                <div
                  key={idx}
                  className="p-2.5 bg-[#FF3358]/10 border-l-4 border-[#FF3358] text-xs font-bold text-[var(--ink)] leading-snug"
                >
                  &bull; {g}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Tested Weaponry & Curated Problem Deck */}
        <div className="lg:col-span-5 space-y-5">
          {/* Tested Weaponry */}
          <div className="manga-panel bg-[var(--card-bg)] text-[var(--ink)] p-5 space-y-3">
            <span className="font-manga text-xl tracking-wider text-[#00C2FF] flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-[#00C2FF]" />
              FREQUENTLY TESTED WEAPONRY
            </span>
            <div className="space-y-2.5">
              {dossier.testedWeaponry.map((w, i) => (
                <div
                  key={i}
                  className="p-3 bg-[var(--subpanel-bg)] border border-[var(--border-ink)]"
                >
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="text-xs font-black text-[var(--ink)]">{w.pattern}</span>
                    <span
                      className={`text-[9px] font-black px-1.5 py-0.2 border ${
                        w.importance === "CRITICAL"
                          ? "bg-[#FF3358] text-white border-[#121218]"
                          : "bg-[#FFC82C] text-[#121218] border-[#121218]"
                      }`}
                    >
                      {w.importance}
                    </span>
                  </div>
                  <p className="text-[11px] font-medium text-[var(--ink-secondary)] leading-snug">
                    {w.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Curated Battle Cards for This Company */}
          <div className="manga-panel bg-[var(--card-bg)] text-[var(--ink)] p-5 space-y-3">
            <div className="flex items-center justify-between border-b-2 border-[var(--border-ink)] pb-2">
              <span className="font-manga text-xl tracking-wider text-[#FFC82C] flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-[#FFC82C]" />
                CURATED BATTLE CARDS ({recommendedProblems.length})
              </span>
              <span className="text-[10px] font-black text-[var(--ink-muted)] uppercase">
                TAILORED DECK
              </span>
            </div>

            <div className="space-y-2.5">
              {recommendedProblems.map((p) => (
                <Link
                  key={p.slug}
                  href={`/shell-break/${p.slug}`}
                  onClick={() => playSfx("deal")}
                  className="block p-3 bg-[var(--subpanel-bg)] hover:bg-[var(--card-bg)] border-2 border-[var(--border-ink)] shadow-[2px_2px_0px_var(--shadow-ink)] hover:-translate-y-0.5 transition-all group"
                >
                  <div className="flex items-center justify-between text-[10px] font-black uppercase text-[var(--ink-muted)] mb-1">
                    <span>{p.sourceTag}</span>
                    <span className="font-mono text-[#00C2FF]">PL {p.rating}</span>
                  </div>
                  <h4 className="font-manga text-lg group-hover:text-[#FF3358] transition-colors leading-snug">
                    {p.title}
                  </h4>
                  <p className="text-[11px] text-[var(--ink-secondary)] font-medium line-clamp-2 mt-1">
                    {p.brief}
                  </p>
                </Link>
              ))}
            </div>

            <Link
              href={`/chamber?company=${dossier.id}`}
              onClick={() => playSfx("deal")}
              className="w-full py-2.5 bg-[#121218] hover:bg-[#202132] text-[#FFC82C] font-black text-xs uppercase flex items-center justify-center gap-1.5 border border-[var(--border-ink)] transition-colors"
            >
              LAUNCH FULL {dossier.name.toUpperCase()} SPRINT IN CHAMBER &rarr;
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
