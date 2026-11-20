"use client";

import React, { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { RefreshCw, CheckSquare, Square, Flame, Target, ArrowRight, Skull, Building2 } from "lucide-react";
import { CombatRadar } from "@/components/CombatRadar";
import { BattleCard, type BattleCardData } from "@/components/BattleCard";
import { SenseiAvatar } from "@/components/SenseiAvatar";
import { SprintTimer } from "@/components/SprintTimer";
import { playSfx } from "@/lib/sound";
import { COMPANY_DOSSIERS } from "@/lib/intel-data";
import { getGrimoireDefeats, type DefeatRecord } from "@/lib/grimoire";

interface SprintTask {
  id: string;
  title: string;
  volume: string;
  mins: number;
  done: boolean;
  href: string;
}

interface MagazineSlot {
  slotLabel: string;
  roleBadge: string;
  problemSlug: string;
  reason: string;
}

interface ChamberState {
  profile: {
    codename: string;
    overallRating: number;
    targetCompany: string;
    sprintWeeksLeft: number;
    streakDays: number;
    xp: number;
    topicRatings: Record<string, number>;
    magazineHand: MagazineSlot[];
    sprintAgenda: SprintTask[];
    rank: { grade: string; title: string; color: string };
  };
  problems: BattleCardData[];
}

function ChamberContent() {
  const searchParams = useSearchParams();
  const initialCompany = searchParams?.get("company") || "all";

  const [state, setState] = useState<ChamberState | null>(null);
  const [dealing, setDealing] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<string>(initialCompany);
  const [onlyRevenge, setOnlyRevenge] = useState(false);
  const [defeats, setDefeats] = useState<DefeatRecord[]>([]);

  const load = async () => {
    const res = await fetch("/api/bootstrap");
    const json = await res.json();
    setState(json);
    setDefeats(getGrimoireDefeats());
  };

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    const c = searchParams?.get("company");
    if (c) setSelectedCompany(c);
  }, [searchParams]);

  const dealNewHand = async () => {
    setDealing(true);
    playSfx("deal");
    try {
      await fetch("/api/magazine", { method: "POST" });
      await load();
      playSfx("unlock");
    } finally {
      setDealing(false);
    }
  };

  const toggleTask = async (taskId: string) => {
    if (!state) return;
    playSfx("click");
    const updatedAgenda = state.profile.sprintAgenda.map((t) =>
      t.id === taskId ? { ...t, done: !t.done } : t
    );
    setState({
      ...state,
      profile: { ...state.profile, sprintAgenda: updatedAgenda },
    });
    if (!state.profile.sprintAgenda.find((t) => t.id === taskId)?.done) {
      playSfx("unlock");
    }
    await fetch("/api/dossier", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sprintAgenda: updatedAgenda }),
    });
  };

  if (!state) {
    return (
      <div className="manga-panel p-12 text-center font-manga text-3xl">
        LOADING THE CHAMBER...
      </div>
    );
  }

  const problemBySlug = Object.fromEntries(state.problems.map((p) => [p.slug, p]));
  const unresolvedSlugs = new Set(defeats.filter((d) => !d.resolved).map((d) => d.problemSlug));

  // Build deck with company & revenge filters
  let filteredCards: BattleCardData[] = state.profile.magazineHand.flatMap((slot) => {
    const p = problemBySlug[slot.problemSlug];
    if (!p) return [];
    return [
      {
        ...p,
        slotLabel: slot.slotLabel,
        roleBadge: slot.roleBadge,
        reason: slot.reason,
      },
    ];
  });

  // If company selected, include tailored recommended cards
  if (selectedCompany !== "all" && COMPANY_DOSSIERS[selectedCompany]) {
    const comp = COMPANY_DOSSIERS[selectedCompany];
    const companyProblemSlugs = new Set(comp.recommendedSlugs);
    // Prioritize company cards
    filteredCards = state.problems
      .filter((p) => companyProblemSlugs.has(p.slug))
      .map((p) => ({
        ...p,
        slotLabel: `${comp.name.toUpperCase()} INTEL`,
        roleBadge: "TARGET LOOP",
        reason: `Tested in ${comp.name} onsite loops.`,
      }));
  }

  // If only revenge filter active
  if (onlyRevenge) {
    filteredCards = filteredCards.filter((c) => unresolvedSlugs.has(c.slug));
  }

  return (
    <div className="space-y-6">
      {/* Banner Header */}
      <div className="manga-panel p-5 bg-[#FF3358] text-white speed-lines flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="bg-[#121218] text-[#FFC82C] text-[10px] font-black px-2 py-0.5 uppercase tracking-widest border border-white/20">
            PERSONAL AI PREP HQ · ADAPTIVE ELO ENGINE
          </span>
          <h1 className="font-manga text-4xl sm:text-5xl tracking-wider mt-1 drop-shadow-[3px_3px_0px_#121218]">
            THE CHAMBER
          </h1>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="bg-[var(--card-bg)] text-[var(--ink)] border-[3px] border-[var(--border-ink)] shadow-[4px_4px_0px_var(--shadow-ink)] px-4 py-2">
            <div className="text-[10px] font-black uppercase text-[var(--ink-muted)]">ACTIVE SPRINT</div>
            <div className="font-black text-sm flex items-center gap-1.5">
              <Target className="w-4 h-4 text-[#FF3358]" />
              {state.profile.targetCompany} ({state.profile.sprintWeeksLeft}w left)
            </div>
          </div>
          <Link
            href="/dossier"
            onClick={() => playSfx("click")}
            className="manga-btn bg-[#FFC82C] text-[#121218] px-4 py-2.5 text-xs"
          >
            EDIT SENSEI DOSSIER
          </Link>
        </div>
      </div>

      {/* 2-PAGE SPREAD: LEFT = RADAR + TIMER | RIGHT = AGENDA + SENSEI DIRECTIVE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Combat Stat Radar & Mock Timer */}
        <div className="lg:col-span-5 space-y-5">
          <div className="manga-panel p-5 bg-[var(--card-bg)] text-[var(--ink)] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b-[3px] border-[var(--border-ink)] pb-2 mb-4">
                <h2 className="font-manga text-2xl tracking-wide">7-AXIS COMBAT STAT RADAR</h2>
                <span className="bg-[#121218] text-[#00C2FF] font-manga text-lg px-2.5 py-0.5 border border-[var(--border-ink)]">
                  PL {state.profile.overallRating}
                </span>
              </div>
              <CombatRadar ratings={state.profile.topicRatings} />
            </div>

            <div className="mt-4 bg-[var(--subpanel-bg)] border-2 border-[var(--border-ink)] p-3 flex items-center gap-3">
              <SenseiAvatar expression="thinking" size="sm" />
              <p className="text-xs font-bold leading-snug">
                Your lowest axis drives Round 02 of your Magazine. Crush weak invariants before jumping into the code editor!
              </p>
            </div>
          </div>

          {/* 45-MINUTE MOCK INTERVIEW SPRINT TIMER */}
          <SprintTimer />
        </div>

        {/* Right Page: Daily Sprint Tasks */}
        <div className="lg:col-span-7 manga-panel p-5 bg-[var(--card-bg)] text-[var(--ink)] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b-[3px] border-[var(--border-ink)] pb-2 mb-4">
              <div>
                <span className="text-[10px] font-black uppercase text-[#FF3358] tracking-wider">
                  TODAY&apos;S MISSION
                </span>
                <h2 className="font-manga text-2xl sm:text-3xl tracking-wide">
                  ACTIVE SPRINT AGENDA
                </h2>
              </div>
              <span className="bg-[#121218] text-[#00C875] font-mono text-xs font-black px-2.5 py-1 border border-[var(--border-ink)]">
                {state.profile.sprintAgenda.filter((t) => t.done).length}/
                {state.profile.sprintAgenda.length} CLEARED
              </span>
            </div>

            <div className="space-y-3">
              {state.profile.sprintAgenda.map((task) => (
                <div
                  key={task.id}
                  className={`border-[3px] border-[var(--border-ink)] p-3.5 flex items-center justify-between gap-3 transition-colors ${
                    task.done
                      ? "bg-[#00C875]/20 line-through opacity-80"
                      : "bg-[var(--subpanel-bg)] shadow-[3px_3px_0px_var(--shadow-ink)]"
                  }`}
                >
                  <button
                    onClick={() => toggleTask(task.id)}
                    className="flex items-start gap-3 text-left flex-1"
                  >
                    {task.done ? (
                      <CheckSquare className="w-5 h-5 text-[#00C875] shrink-0 mt-0.5" />
                    ) : (
                      <Square className="w-5 h-5 text-[var(--ink)] shrink-0 mt-0.5" />
                    )}
                    <div>
                      <div className="text-sm font-black text-[var(--ink)]">{task.title}</div>
                      <div className="text-[11px] font-bold text-[var(--ink-muted)] uppercase">
                        {task.volume} · EST. {task.mins} MIN
                      </div>
                    </div>
                  </button>

                  <Link
                    href={task.href}
                    onClick={() => playSfx("click")}
                    className="manga-btn bg-[#00C2FF] text-[#121218] px-3 py-1 text-[11px] shrink-0 flex items-center gap-1"
                  >
                    GO <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-5 pt-4 border-t-2 border-dashed border-[var(--border-ink)]/30 flex flex-wrap items-center justify-between gap-2 text-xs font-bold text-[var(--ink-secondary)]">
            <span>Every panel colored in Shell Break auto-bumps your topic Power Level in SQLite.</span>
            <Link
              href="/blueprint"
              onClick={() => playSfx("click")}
              className="text-[#FF3358] font-black underline uppercase hover:opacity-85"
            >
              Launch Voice Mock Interview →
            </Link>
          </div>
        </div>
      </div>

      {/* ADAPTIVE 5-ROUND MAGAZINE & COMPANY INTEL FILTER */}
      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <span className="text-xs font-black uppercase text-[#FF3358] tracking-widest">
              NO STATIC LEETCODE SHEETS · DYNAMICALLY DEALT TO YOUR ELO
            </span>
            <h2 className="font-manga text-3xl sm:text-4xl tracking-wider">
              5-ROUND ADAPTIVE MAGAZINE
            </h2>
          </div>

          <button
            onClick={dealNewHand}
            disabled={dealing}
            className="manga-btn bg-[#FFC82C] text-[#121218] px-4 py-2 text-xs flex items-center gap-2 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${dealing ? "animate-spin" : ""}`} />
            {dealing ? "SHUFFLING DECK..." : "DEAL FRESH 5-ROUND HAND"}
          </button>
        </div>

        {/* Company & Revenge Filter Bar */}
        <div className="flex items-center gap-2 flex-wrap bg-[var(--card-bg)] p-3 border-2 border-[var(--border-ink)] shadow-[2px_2px_0px_var(--shadow-ink)]">
          <span className="text-[10px] font-black uppercase text-[var(--ink-muted)] flex items-center gap-1 mr-1">
            <Building2 className="w-3.5 h-3.5 text-[#FF3358]" />
            COMPANY LOOP:
          </span>

          <button
            onClick={() => {
              playSfx("click");
              setSelectedCompany("all");
            }}
            className={`px-2.5 py-1 text-[10px] font-black uppercase border transition-colors ${
              selectedCompany === "all"
                ? "bg-[#121218] text-[#FFC82C] border-[#121218]"
                : "bg-[var(--subpanel-bg)] text-[var(--ink)] border-[var(--border-ink)] hover:bg-[#FFC82C]/20"
            }`}
          >
            ALL (ADAPTIVE ELO)
          </button>

          {Object.values(COMPANY_DOSSIERS).map((comp) => {
            const active = selectedCompany === comp.id;
            return (
              <button
                key={comp.id}
                onClick={() => {
                  playSfx("click");
                  setSelectedCompany(comp.id);
                }}
                className={`px-2.5 py-1 text-[10px] font-black uppercase border transition-colors flex items-center gap-1 ${
                  active
                    ? "bg-[#FF3358] text-white border-[#121218]"
                    : "bg-[var(--subpanel-bg)] text-[var(--ink)] border-[var(--border-ink)] hover:bg-[#FF3358]/20"
                }`}
              >
                <span>{comp.logoEmoji}</span>
                <span>{comp.name}</span>
              </button>
            );
          })}

          {unresolvedSlugs.size > 0 && (
            <button
              onClick={() => {
                playSfx("click");
                setOnlyRevenge(!onlyRevenge);
              }}
              className={`ml-auto px-2.5 py-1 text-[10px] font-black uppercase border transition-colors flex items-center gap-1 ${
                onlyRevenge
                  ? "bg-[#FF3358] text-white border-[#121218] animate-pulse"
                  : "bg-[#FF3358]/15 text-[#FF3358] border-[#FF3358]"
              }`}
            >
              <Skull className="w-3 h-3" />
              <span>SEEK REVENGE ({unresolvedSlugs.size})</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {filteredCards.length > 0 ? (
            filteredCards.map((card) => (
              <BattleCard key={`${card.slotLabel}-${card.slug}`} card={card} />
            ))
          ) : (
            <div className="col-span-full manga-panel p-8 text-center font-manga text-xl text-[var(--ink-muted)]">
              NO BATTLE CARDS MATCHING FILTER. SWITCH TO &quot;ALL&quot; TO SEE DEALT HAND!
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

export default function ChamberPage() {
  return (
    <Suspense
      fallback={
        <div className="manga-panel p-12 text-center font-manga text-3xl">
          LOADING THE CHAMBER...
        </div>
      }
    >
      <ChamberContent />
    </Suspense>
  );
}
