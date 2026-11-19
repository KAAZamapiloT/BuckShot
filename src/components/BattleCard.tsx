"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Flame } from "lucide-react";
import { playSfx } from "@/lib/sound";

const ACCENT_MAP: Record<string, { bg: string; badgeLight: string; badgeDark: string }> = {
  crimson: { bg: "#FF3358", badgeLight: "#FFE0E6", badgeDark: "rgba(255, 51, 88, 0.25)" },
  cyan: { bg: "#00C2FF", badgeLight: "#DFF7FF", badgeDark: "rgba(0, 194, 255, 0.25)" },
  gold: { bg: "#FFC82C", badgeLight: "#FFF4CC", badgeDark: "rgba(255, 200, 44, 0.25)" },
  violet: { bg: "#7C4DFF", badgeLight: "#ECE4FF", badgeDark: "rgba(124, 77, 255, 0.25)" },
  emerald: { bg: "#00C875", badgeLight: "#DCFCE7", badgeDark: "rgba(0, 200, 117, 0.25)" },
};

export interface BattleCardData {
  slug: string;
  title: string;
  volumeName: string;
  topic: string;
  sourceTag: string;
  rating: number;
  accentColor: string;
  totalPanels: number;
  unlockedCount: number;
  solved: boolean;
  slotLabel?: string;
  roleBadge?: string;
  reason?: string;
}

export function BattleCard({ card }: { card: BattleCardData }) {
  const palette = ACCENT_MAP[card.accentColor] ?? ACCENT_MAP.cyan;
  const pct = Math.round((card.unlockedCount / Math.max(1, card.totalPanels)) * 100);

  return (
    <Link
      href={`/shell-break/${card.slug}`}
      onClick={() => playSfx("click")}
      className={`group flex flex-col justify-between manga-panel p-0 overflow-hidden transition-all duration-200 hover:-translate-y-1.5 hover:shadow-[7px_7px_0px_var(--shadow-ink)] ${
        card.solved ? "manga-unlocked-pop" : "manga-color-layer"
      }`}
    >
      {/* Top Colored Foil Header */}
      <div
        style={{ backgroundColor: palette.bg }}
        className="px-3.5 py-2.5 border-b-[3px] border-[var(--border-ink)] flex items-center justify-between speed-lines"
      >
        <span className="bg-[#121218] text-white text-[10px] font-black tracking-widest px-2 py-0.5 uppercase border border-white/20">
          {card.slotLabel ? `${card.slotLabel} · ${card.roleBadge}` : card.sourceTag}
        </span>
        <span className="bg-[#FFFDF7] text-[#121218] border-2 border-[#121218] font-manga text-base px-2 leading-tight shadow-[2px_2px_0px_#121218]">
          PL {card.rating}
        </span>
      </div>

      {/* Card Body */}
      <div className="p-4 flex-1 flex flex-col justify-between bg-[var(--card-bg)] text-[var(--ink)] halftone-dots">
        <div>
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <span className="text-[10px] font-black uppercase tracking-wider text-[var(--ink-muted)]">
              {card.volumeName}
            </span>
            <span
              style={{ backgroundColor: palette.badgeDark }}
              className="text-[10px] font-black uppercase px-1.5 py-0.5 border border-[var(--border-ink)] text-[var(--ink)]"
            >
              {card.topic}
            </span>
          </div>
          <h3 className="font-manga text-xl tracking-wide leading-snug mb-2 group-hover:text-[#FF3358] transition-colors">
            {card.title}
          </h3>
          {card.reason && (
            <p className="text-xs font-medium text-[var(--ink-secondary)] leading-snug mb-3">
              {card.reason}
            </p>
          )}
        </div>

        {/* Ink-to-Color Progress Meter */}
        <div className="space-y-2 pt-2 border-t-2 border-dashed border-[var(--border-ink)]/25">
          <div className="flex items-center justify-between text-[11px] font-black uppercase">
            <span className="flex items-center gap-1">
              {card.solved ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#00C875]" />
                  MASTERED
                </>
              ) : (
                <>
                  <Flame className="w-3.5 h-3.5 text-[#FF3358]" />
                  PANELS COLORED: {card.unlockedCount}/{card.totalPanels}
                </>
              )}
            </span>
            <span className="flex items-center gap-1 text-[#FF3358] group-hover:translate-x-1 transition-transform">
              ENTER <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="h-2.5 w-full bg-[var(--subpanel-bg)] border-2 border-[var(--border-ink)] overflow-hidden">
            <div
              style={{ width: `${Math.max(8, pct)}%`, backgroundColor: palette.bg }}
              className="h-full transition-all duration-500"
            />
          </div>
        </div>
      </div>
    </Link>
  );
}
