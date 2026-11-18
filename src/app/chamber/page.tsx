"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { RefreshCw, CheckSquare, Square, Flame, Target, ArrowRight } from "lucide-react";
import { CombatRadar } from "@/components/CombatRadar";
import { BattleCard, type BattleCardData } from "@/components/BattleCard";
import { SenseiAvatar } from "@/components/SenseiAvatar";

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

export default function ChamberPage() {
  const [state, setState] = useState<ChamberState | null>(null);
  const [dealing, setDealing] = useState(false);

  const load = async () => {
    const res = await fetch("/api/bootstrap");
    const json = await res.json();
    setState(json);
  };

  useEffect(() => {
    load();
  }, []);

  const dealNewHand = async () => {
    setDealing(true);
    try {
      await fetch("/api/magazine", { method: "POST" });
      await load();
    } finally {
      setDealing(false);
    }
  };

  const toggleTask = async (taskId: string) => {
    if (!state) return;
    const updatedAgenda = state.profile.sprintAgenda.map((t) =>
      t.id === taskId ? { ...t, done: !t.done } : t
    );
    setState({
      ...state,
      profile: { ...state.profile, sprintAgenda: updatedAgenda },
    });
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
  const handCards: BattleCardData[] = state.profile.magazineHand.flatMap((slot) => {
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

  return (
    <div className="space-y-6">
      {/* Banner Header */}
      <div className="manga-panel p-5 bg-[#FF3358] text-white speed-lines flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="bg-[#121218] text-[#FFC82C] text-[10px] font-black px-2 py-0.5 uppercase tracking-widest">
            PERSONAL AI PREP HQ · ADAPTIVE ELO ENGINE
          </span>
          <h1 className="font-manga text-4xl sm:text-5xl tracking-wider mt-1 drop-shadow-[3px_3px_0px_#121218]">
            THE CHAMBER
          </h1>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="bg-[#FFFDF7] text-[#121218] border-[3px] border-[#121218] shadow-[4px_4px_0px_#121218] px-4 py-2">
            <div className="text-[10px] font-black uppercase text-[#4A4A5A]">ACTIVE SPRINT</div>
            <div className="font-black text-sm flex items-center gap-1.5">
              <Target className="w-4 h-4 text-[#FF3358]" />
              {state.profile.targetCompany} ({state.profile.sprintWeeksLeft}w left)
            </div>
          </div>
          <Link
            href="/dossier"
            className="manga-btn bg-[#FFC82C] text-[#121218] px-4 py-2.5 text-xs"
          >
            EDIT SENSEI DOSSIER
          </Link>
        </div>
      </div>

      {/* 2-PAGE SPREAD: LEFT = RADAR + AGENDA | RIGHT = SENSEI DIRECTIVE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Combat Stat Radar */}
        <div className="lg:col-span-5 manga-panel p-5 bg-[#FFFDF7] text-[#121218] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b-[3px] border-[#121218] pb-2 mb-4">
              <h2 className="font-manga text-2xl tracking-wide">7-AXIS COMBAT STAT RADAR</h2>
              <span className="bg-[#121218] text-[#00C2FF] font-manga text-lg px-2.5 py-0.5">
                PL {state.profile.overallRating}
              </span>
            </div>
            <CombatRadar ratings={state.profile.topicRatings} />
          </div>

          <div className="mt-4 bg-[#FAF4E6] border-2 border-[#121218] p-3 flex items-center gap-3">
            <SenseiAvatar expression="thinking" size="sm" />
            <p className="text-xs font-bold leading-snug">
              Your lowest axis drives Round 02 of your Magazine. Crush{" "}
              <strong className="text-[#FF3358]">Concurrency</strong> &amp;{" "}
              <strong className="text-[#7C4DFF]">DP</strong> panels to hit A-Rank (1650+ PL)!
            </p>
          </div>
        </div>

        {/* Sprint Daily Agenda */}
        <div className="lg:col-span-7 manga-panel p-5 bg-[#FFFDF7] text-[#121218] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b-[3px] border-[#121218] pb-2 mb-4">
              <h2 className="font-manga text-2xl tracking-wide flex items-center gap-2">
                <Flame className="w-6 h-6 text-[#FF3358]" />
                TODAY&apos;S TRAINING ARC AGENDA
              </h2>
              <span className="text-xs font-black uppercase bg-[#FFC82C] border-2 border-[#121218] px-2 py-0.5">
                {state.profile.sprintAgenda.filter((t) => t.done).length}/
                {state.profile.sprintAgenda.length} CLEARED
              </span>
            </div>

            <div className="space-y-3">
              {state.profile.sprintAgenda.map((task) => (
                <div
                  key={task.id}
                  className={`border-[3px] border-[#121218] p-3.5 flex items-center justify-between gap-3 transition-colors ${
                    task.done
                      ? "bg-[#00C875]/20 line-through opacity-80"
                      : "bg-[#FAF4E6] shadow-[3px_3px_0px_#121218]"
                  }`}
                >
                  <button
                    onClick={() => toggleTask(task.id)}
                    className="flex items-start gap-3 text-left flex-1"
                  >
                    {task.done ? (
                      <CheckSquare className="w-5 h-5 text-[#00C875] shrink-0 mt-0.5" />
                    ) : (
                      <Square className="w-5 h-5 text-[#121218] shrink-0 mt-0.5" />
                    )}
                    <div>
                      <div className="text-sm font-black">{task.title}</div>
                      <div className="text-[11px] font-bold text-[#4A4A5A] uppercase">
                        {task.volume} · EST. {task.mins} MIN
                      </div>
                    </div>
                  </button>

                  <Link
                    href={task.href}
                    className="manga-btn bg-[#00C2FF] text-[#121218] px-3 py-1 text-[11px] shrink-0 flex items-center gap-1"
                  >
                    GO <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-5 pt-4 border-t-2 border-dashed border-[#121218]/30 flex flex-wrap items-center justify-between gap-2 text-xs font-bold">
            <span>Every panel colored in Shell Break auto-bumps your topic Power Level in SQLite.</span>
            <Link href="/blueprint" className="text-[#FF3358] font-black underline uppercase">
              Launch Voice Mock Interview →
            </Link>
          </div>
        </div>
      </div>

      {/* ADAPTIVE 5-ROUND MAGAZINE */}
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
            className="manga-btn bg-[#FFC82C] text-[#121218] px-4 py-2 text-xs flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${dealing ? "animate-spin" : ""}`} />
            {dealing ? "SHUFFLING DECK..." : "DEAL FRESH 5-ROUND HAND"}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {handCards.map((card) => (
            <BattleCard key={`${card.slotLabel}-${card.slug}`} card={card} />
          ))}
        </div>
      </section>
    </div>
  );
}
