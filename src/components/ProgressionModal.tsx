"use client";

import React, { useEffect, useState } from "react";
import {
  Trophy,
  X,
  Sparkles,
  Flame,
  CheckCircle2,
  Skull,
  Award,
  Zap,
  ArrowRight,
} from "lucide-react";
import {
  SHONEN_RANKS,
  INITIAL_PRESTIGE_TITLES,
  DEFAULT_DAILY_QUESTS,
  type DailyQuest,
  type PrestigeTitle,
} from "@/lib/intel-data";
import { getGrimoireDefeats, avengeDefeat, type DefeatRecord } from "@/lib/grimoire";
import { playSfx } from "@/lib/sound";

interface ProgressionModalProps {
  open: boolean;
  onClose: () => void;
}

export function ProgressionModal({ open, onClose }: ProgressionModalProps) {
  const [activeTab, setActiveTab] = useState<"ranks" | "quests" | "titles" | "grimoire">("quests");
  const [xp, setXp] = useState<number>(2450);
  const [quests, setQuests] = useState<DailyQuest[]>(DEFAULT_DAILY_QUESTS);
  const [titles, setTitles] = useState<PrestigeTitle[]>(INITIAL_PRESTIGE_TITLES);
  const [equippedTitle, setEquippedTitle] = useState<string>("Zero-Allocation Ronin");
  const [defeats, setDefeats] = useState<DefeatRecord[]>([]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedXp = localStorage.getItem("buckshot-user-xp");
      if (savedXp) setXp(parseInt(savedXp, 10));

      const savedTitle = localStorage.getItem("buckshot-equipped-title");
      if (savedTitle) setEquippedTitle(savedTitle);

      const savedQuests = localStorage.getItem("buckshot-daily-quests");
      if (savedQuests) {
        try {
          setQuests(JSON.parse(savedQuests));
        } catch {}
      }

      setDefeats(getGrimoireDefeats());
    }
  }, [open]);

  if (!open) return null;

  // Determine active rank
  const currentRank =
    SHONEN_RANKS.find((r) => xp >= r.minXp && xp <= r.maxXp) || SHONEN_RANKS[SHONEN_RANKS.length - 1];

  const handleClaimQuest = (id: string, reward: number) => {
    playSfx("victory");
    const nextQuests = quests.map((q) => (q.id === id ? { ...q, claimed: true } : q));
    setQuests(nextQuests);
    const nextXp = xp + reward;
    setXp(nextXp);
    localStorage.setItem("buckshot-user-xp", nextXp.toString());
    localStorage.setItem("buckshot-daily-quests", JSON.stringify(nextQuests));
  };

  const handleEquipTitle = (t: string) => {
    playSfx("click");
    setEquippedTitle(t);
    localStorage.setItem("buckshot-equipped-title", t);
  };

  const handleAvenge = (slug: string) => {
    playSfx("victory");
    const next = avengeDefeat(slug);
    setDefeats(next);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
      <div className="manga-panel bg-[var(--card-bg)] text-[var(--ink)] border-4 border-[var(--border-ink)] shadow-[10px_10px_0px_var(--shadow-ink)] max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-[#121218] text-white p-4 border-b-4 border-[var(--border-ink)] flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{currentRank.badge.split(" ")[0]}</span>
            <div>
              <div className="font-manga text-2xl tracking-wider text-[#FFC82C] leading-tight">
                SHONEN EXAM PROGRESSION &amp; QUESTS
              </div>
              <div className="text-[11px] font-mono font-bold text-white/70">
                RANK: {currentRank.rank} &bull; LEVEL {currentRank.level} &bull; {xp} TOTAL XP
              </div>
            </div>
          </div>

          <button
            onClick={() => {
              playSfx("click");
              onClose();
            }}
            className="p-1.5 bg-white/10 hover:bg-[#FF3358] hover:text-white border border-white/20 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Strip */}
        <div className="flex items-center border-b-2 border-[var(--border-ink)] bg-[var(--subpanel-bg)] overflow-x-auto">
          {[
            { id: "quests", label: "DAILY QUESTS", icon: Flame, color: "#FF3358" },
            { id: "ranks", label: "HUNTER RANKS", icon: Trophy, color: "#FFC82C" },
            { id: "titles", label: "PRESTIGE TITLES", icon: Award, color: "#00C2FF" },
            {
              id: "grimoire",
              label: `GRIMOIRE OF DEFEATS (${defeats.filter((d) => !d.resolved).length})`,
              icon: Skull,
              color: "#FF3358",
            },
          ].map((t) => {
            const active = activeTab === t.id;
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                onClick={() => {
                  playSfx("click");
                  setActiveTab(t.id as typeof activeTab);
                }}
                className={`px-4 py-2.5 text-xs font-black uppercase flex items-center gap-1.5 border-r border-[var(--border-ink)] transition-colors whitespace-nowrap ${
                  active
                    ? "bg-[var(--card-bg)] text-[#FF3358] border-b-2 border-b-[#FF3358]"
                    : "text-[var(--ink-secondary)] hover:text-[var(--ink)]"
                }`}
              >
                <Icon className="w-4 h-4" />
                {t.label}
              </button>
            );
          })}
        </div>

        {/* Body Content */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          {/* TAB 1: DAILY QUESTS */}
          {activeTab === "quests" && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-black uppercase text-[var(--ink-muted)]">
                <span>ACTIVE SHONEN QUESTS (RESETS DAILY)</span>
                <span className="text-[#00C2FF]">EQUIPPED: &quot;{equippedTitle}&quot;</span>
              </div>

              {quests.map((q) => (
                <div
                  key={q.id}
                  className="p-3.5 bg-[var(--subpanel-bg)] border-2 border-[var(--border-ink)] shadow-[2px_2px_0px_var(--shadow-ink)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="bg-[#121218] text-[#FFC82C] text-[9px] font-black px-1.5 py-0.5 uppercase">
                        {q.category}
                      </span>
                      <span className="font-manga text-lg text-[var(--ink)]">{q.title}</span>
                    </div>
                    <p className="text-xs font-medium text-[var(--ink-secondary)] leading-snug">
                      {q.description}
                    </p>
                    <div className="flex items-center gap-2 pt-1">
                      <div className="w-36 h-2 bg-black/20 border border-[var(--border-ink)] overflow-hidden">
                        <div
                          style={{
                            width: `${Math.min(100, (q.progress / q.maxProgress) * 100)}%`,
                          }}
                          className="h-full bg-[#00C875]"
                        />
                      </div>
                      <span className="text-[10px] font-mono font-bold text-[var(--ink-muted)]">
                        {q.progress}/{q.maxProgress}
                      </span>
                    </div>
                  </div>

                  <div className="shrink-0">
                    {q.claimed ? (
                      <span className="text-xs font-black text-[#00C875] flex items-center gap-1 bg-[#00C875]/15 border border-[#00C875] px-2.5 py-1">
                        <CheckCircle2 className="w-4 h-4" /> CLAIMED
                      </span>
                    ) : q.completed ? (
                      <button
                        onClick={() => handleClaimQuest(q.id, q.xpReward)}
                        className="px-3.5 py-1.5 bg-[#FFC82C] hover:bg-[#ffe17d] text-[#121218] font-black text-xs uppercase border-2 border-[#121218] shadow-[2px_2px_0px_#121218] animate-bounce"
                      >
                        CLAIM +{q.xpReward} XP!
                      </button>
                    ) : (
                      <span className="text-xs font-mono font-bold text-[var(--ink-muted)] border border-[var(--border-ink)] px-2.5 py-1 bg-[var(--card-bg)]">
                        +{q.xpReward} XP
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 2: HUNTER RANKS */}
          {activeTab === "ranks" && (
            <div className="space-y-3">
              <span className="text-xs font-black uppercase text-[var(--ink-muted)] block">
                NINJA / HUNTER EXAM LADDER
              </span>

              {SHONEN_RANKS.map((r) => {
                const isCurrent = currentRank.rank === r.rank;
                return (
                  <div
                    key={r.rank}
                    className={`p-3.5 border-2 transition-all ${
                      isCurrent
                        ? "bg-[#121218] text-white border-[#FFC82C] shadow-[4px_4px_0px_#FFC82C]"
                        : "bg-[var(--subpanel-bg)] text-[var(--ink)] border-[var(--border-ink)]"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{r.badge.split(" ")[0]}</span>
                        <span className="font-manga text-xl tracking-wider text-[#FFC82C]">
                          {r.rank}
                        </span>
                        {isCurrent && (
                          <span className="bg-[#FF3358] text-white text-[9px] font-black px-1.5 py-0.5 uppercase">
                            CURRENT
                          </span>
                        )}
                      </div>
                      <span className="font-mono text-xs font-bold opacity-80">
                        {r.minXp} - {r.maxXp >= 99999 ? "∞" : r.maxXp} XP
                      </span>
                    </div>
                    <p className="text-xs font-medium opacity-90 leading-snug">{r.description}</p>
                  </div>
                );
              })}
            </div>
          )}

          {/* TAB 3: PRESTIGE TITLES */}
          {activeTab === "titles" && (
            <div className="space-y-3">
              <span className="text-xs font-black uppercase text-[var(--ink-muted)] block">
                UNLOCKABLE PRESTIGE TITLES
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {titles.map((t) => {
                  const isEquipped = equippedTitle === t.title;
                  return (
                    <div
                      key={t.id}
                      className="p-3 bg-[var(--subpanel-bg)] border-2 border-[var(--border-ink)] shadow-[2px_2px_0px_var(--shadow-ink)] flex flex-col justify-between gap-2"
                    >
                      <div>
                        <div className="flex items-center justify-between text-xs font-black mb-1">
                          <span className="font-manga text-base text-[var(--ink)]">{t.title}</span>
                          {t.unlocked ? (
                            <span className="text-[9px] font-black px-1.5 bg-[#00C875]/20 text-[#00C875] border border-[#00C875]">
                              UNLOCKED
                            </span>
                          ) : (
                            <span className="text-[9px] font-black px-1.5 bg-black/15 text-[var(--ink-muted)] border border-[var(--border-ink)]">
                              LOCKED
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] font-medium text-[var(--ink-secondary)] leading-snug">
                          {t.requirement}
                        </p>
                      </div>

                      {t.unlocked && (
                        <button
                          onClick={() => handleEquipTitle(t.title)}
                          className={`w-full py-1 text-[10px] font-black uppercase border transition-colors ${
                            isEquipped
                              ? "bg-[#00C2FF] text-[#121218] border-[#121218]"
                              : "bg-[var(--card-bg)] text-[var(--ink)] border-[var(--border-ink)] hover:bg-[#00C2FF]/20"
                          }`}
                        >
                          {isEquipped ? "EQUIPPED ✓" : "EQUIP TITLE"}
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 4: GRIMOIRE OF DEFEATS */}
          {activeTab === "grimoire" && (
            <div className="space-y-3">
              <span className="text-xs font-black uppercase text-[var(--ink-muted)] block">
                PERSISTENT FLAW LOG (SPACED REPETITION ENGINE)
              </span>

              {defeats.length === 0 ? (
                <div className="p-8 text-center bg-[var(--subpanel-bg)] border border-[var(--border-ink)] font-manga text-xl text-[var(--ink-muted)]">
                  NO DEFEATS RECORDED! YOU ARE CLEAN IN BATTLE!
                </div>
              ) : (
                defeats.map((d) => (
                  <div
                    key={d.id}
                    className={`p-3.5 border-2 ${
                      d.resolved
                        ? "bg-[var(--subpanel-bg)] border-dashed border-[var(--border-ink)] opacity-70"
                        : "bg-[#FF3358]/10 border-[#FF3358] shadow-[3px_3px_0px_#FF3358]"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <div className="flex items-center gap-1.5">
                        <Skull className="w-4 h-4 text-[#FF3358]" />
                        <span className="font-manga text-lg text-[var(--ink)]">
                          {d.problemTitle}
                        </span>
                      </div>
                      <span
                        className={`text-[9px] font-black px-1.5 py-0.5 uppercase ${
                          d.resolved
                            ? "bg-[#00C875] text-[#121218]"
                            : "bg-[#FF3358] text-white"
                        }`}
                      >
                        {d.resolved ? "AVENGED ✓" : `DEFEATED (${d.failedCount}X)`}
                      </span>
                    </div>

                    <div className="text-[11px] font-mono font-bold text-[#FF3358] mb-1">
                      FLAW: {d.flawLabel}
                    </div>
                    <p className="text-xs font-medium text-[var(--ink)] leading-snug mb-2">
                      &quot;{d.mistakeNotes}&quot;
                    </p>
                    <div className="p-2 bg-[var(--card-bg)] border border-[var(--border-ink)] text-[11px] font-bold text-[var(--ink-secondary)]">
                      <span className="text-[#00C2FF]">Sensei Invariant:</span>{" "}
                      {d.senseiRemediation}
                    </div>

                    {!d.resolved && (
                      <div className="pt-2 flex justify-end">
                        <button
                          onClick={() => handleAvenge(d.problemSlug)}
                          className="px-3 py-1 bg-[#00C875] hover:bg-[#1fe391] text-[#121218] font-black text-[10px] uppercase border border-[#121218]"
                        >
                          MARK AVENGED ✓
                        </button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
