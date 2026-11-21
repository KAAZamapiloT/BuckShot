"use client";

import React, { useEffect, useState } from "react";
import { Crosshair } from "lucide-react";
import { BattleCard, type BattleCardData } from "@/components/BattleCard";
import { playSfx } from "@/lib/sound";

export default function ShellBreakIndexPage() {
  const [problems, setProblems] = useState<BattleCardData[]>([]);
  const [volFilter, setVolFilter] = useState<number | "all">("all");

  useEffect(() => {
    fetch("/api/problems")
      .then((r) => r.json())
      .then((d) => setProblems(d.problems || []));
  }, []);

  const filtered =
    volFilter === "all"
      ? problems
      : problems.filter((p) => p.volumeName.includes(`VOL. 0${volFilter}`));

  const handleFilter = (v: number | "all") => {
    playSfx("click");
    setVolFilter(v);
  };

  return (
    <div className="space-y-6">
      <div className="manga-panel p-5 bg-[#00C2FF] text-[#121218] speed-lines flex flex-wrap items-center justify-between gap-4 border-[3px] border-[var(--border-ink)]">
        <div>
          <span className="bg-[#121218] text-white text-[10px] font-black px-2 py-0.5 uppercase border border-white/20">
            Challenge library
          </span>
          <h1 className="font-manga text-4xl sm:text-5xl tracking-wider mt-1 flex items-center gap-2">
            <Crosshair className="w-9 h-9" />
            SHELL BREAK ARENA
          </h1>
          <p className="text-xs sm:text-sm font-bold max-w-2xl mt-1 text-[#121218]/90">
            Choose a problem and try its warm-up by hand. Check your reasoning, then
            work through the proof panels with Sensei Reiko to unlock the code editor.
          </p>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {(["all", 1, 2, 3, 4, 5] as const).map((v) => (
            <button
              key={String(v)}
              onClick={() => handleFilter(v)}
              className={`manga-btn px-3 py-1.5 text-xs ${
                volFilter === v ? "bg-[#121218] text-[#FFC82C]" : "bg-[var(--card-bg)] text-[var(--ink)]"
              }`}
            >
              {v === "all" ? "ALL VOLUMES" : `VOL. 0${v}`}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((card) => (
          <BattleCard key={card.slug} card={card} />
        ))}
      </div>
    </div>
  );
}
