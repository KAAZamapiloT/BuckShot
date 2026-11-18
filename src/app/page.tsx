"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Crosshair,
  Flame,
  Layers,
  ScrollText,
  Sparkles,
  Zap,
  ShieldCheck,
} from "lucide-react";
import { SenseiAvatar } from "@/components/SenseiAvatar";
import { MANGA_VOLUMES } from "@/lib/seed-data";

interface BootstrapData {
  profile: {
    codename: string;
    rankTitle: string;
    overallRating: number;
    streakDays: number;
    xp: number;
    targetCompany: string;
    rank: { grade: string; title: string; color: string };
  };
  aiStatus: string;
  problems: Array<{
    slug: string;
    title: string;
    volumeNumber: number;
    solved: boolean;
    unlockedCount: number;
    totalPanels: number;
  }>;
}

export default function HomePage() {
  const [data, setData] = useState<BootstrapData | null>(null);

  useEffect(() => {
    fetch("/api/bootstrap")
      .then((r) => r.json())
      .then(setData)
      .catch(console.error);
  }, []);

  const totalPanels = data?.problems.reduce((a, p) => a + p.totalPanels, 0) ?? 20;
  const coloredPanels = data?.problems.reduce((a, p) => a + p.unlockedCount, 0) ?? 0;

  return (
    <div className="space-y-8">
      {/* DOUBLE-PAGE MANGA HERO SPREAD */}
      <section className="manga-panel overflow-hidden relative">
        <div className="grid grid-cols-1 lg:grid-cols-12 relative">
          {/* Center Book Spine Shadow on Desktop */}
          <div className="hidden lg:block absolute inset-y-0 left-1/2 -translate-x-1/2 w-8 book-spread-spine pointer-events-none z-20" />

          {/* LEFT PAGE: Title Splash + Philosophy + Action Buttons */}
          <div className="lg:col-span-6 p-6 sm:p-8 flex flex-col justify-between bg-[#FFFDF7] text-[#121218] halftone-dots relative">
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="bg-[#FF3358] text-white text-xs font-black px-2.5 py-1 border-2 border-[#121218] shadow-[2px_2px_0px_#121218] uppercase">
                  ISSUE #01 · FULL COLOR EDITION
                </span>
                <span className="bg-[#FFC82C] text-[#121218] text-xs font-black px-2.5 py-1 border-2 border-[#121218] uppercase">
                  {data?.aiStatus || "MULTI-PROVIDER AI COACH READY"}
                </span>
              </div>

              <h1 className="font-manga text-5xl sm:text-7xl leading-[0.95] tracking-wider text-[#121218]">
                LOAD THE LOGIC.
                <span className="block text-[#FF3358] drop-shadow-[3px_3px_0px_#121218]">
                  FIRE THE PROOF.
                </span>
              </h1>

              <p className="text-sm sm:text-base font-bold text-[#2D2D3A] leading-relaxed max-w-xl">
                Stop memorizing 400 puzzle templates.{" "}
                <strong className="bg-[#FFC82C]/60 px-1">BUCKSHOT</strong> is an anime-styled AI
                engineering dojo built on cognitive scaffolding: every unsolved breakthrough starts
                in stark black-and-white ink and{" "}
                <span className="text-[#FF3358] font-black">floods with full anime color</span> the
                moment you prove your invariant to Sensei Reiko.
              </p>

              {/* Sensei Welcome Speech Bubble */}
              <div className="flex items-start gap-4 pt-2">
                <SenseiAvatar expression="idle" sfx="YO!" size="md" />
                <div className="relative speech-bubble-left bg-[#FFFDF7] border-[3px] border-[#121218] shadow-[4px_4px_0px_#121218] p-3.5 text-xs sm:text-sm font-bold leading-snug flex-1">
                  &ldquo;Welcome back,{" "}
                  <span className="text-[#FF3358]">{data?.profile.codename ?? "SHADOW_DEV"}</span>.
                  Your Power Rating sits at{" "}
                  <span className="bg-[#00C2FF]/30 px-1">
                    PL {data?.profile.overallRating ?? 1480}
                  </span>
                  . Step into <strong>Shell Break</strong> and shatter all 3 panels before touching
                  the keyboard!&rdquo;
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-3 pt-6">
              <Link
                href="/shell-break/monotonic-stack-skyline"
                className="manga-btn bg-[#FF3358] text-white px-5 py-3 text-sm flex items-center gap-2"
              >
                <Crosshair className="w-4 h-4" />
                ENTER SHELL BREAK ARENA
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/chamber"
                className="manga-btn bg-[#FFC82C] text-[#121218] px-5 py-3 text-sm flex items-center gap-2"
              >
                <Flame className="w-4 h-4" />
                OPEN THE CHAMBER
              </Link>
              <Link
                href="/blueprint"
                className="manga-btn bg-[#00C2FF] text-[#121218] px-4 py-3 text-sm flex items-center gap-2"
              >
                <Layers className="w-4 h-4" />
                VOICE BLUEPRINT
              </Link>
              <Link
                href="/guessr"
                className="manga-btn bg-[#00C875] text-[#121218] px-4 py-3 text-sm flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                BOUNTY GUESSR
              </Link>
            </div>
          </div>

          {/* RIGHT PAGE: Full-Color Custom Shonen Spread Artwork + Live Stats Overlay */}
          <div className="lg:col-span-6 relative min-h-[340px] lg:min-h-[470px] border-t-4 lg:border-t-0 lg:border-l-4 border-[#121218] bg-[#121218] overflow-hidden manga-color-layer">
            <img
              src="/art/hero-spread.jpg"
              alt="BUCKSHOT Shonen Engineering Command Dojo"
              className="w-full h-full object-cover object-center"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#121218]/90 via-transparent to-[#121218]/20" />

            {/* Top-Right Manga Chapter Stamp */}
            <div className="absolute top-4 right-4 bg-[#FFC82C] text-[#121218] border-[3px] border-[#121218] shadow-[4px_4px_0px_#121218] px-3 py-1.5 rotate-2">
              <div className="font-manga text-xl leading-none">
                RANK {data?.profile.rank.grade ?? "B"} · PL {data?.profile.overallRating ?? 1480}
              </div>
              <div className="text-[10px] font-black uppercase">
                {data?.profile.rank.title ?? "B-RANK TACTICIAN"}
              </div>
            </div>

            {/* Bottom Live Telemetry Strip */}
            <div className="absolute bottom-4 inset-x-4 grid grid-cols-3 gap-2.5">
              <div className="bg-[#FFFDF7] text-[#121218] border-[3px] border-[#121218] shadow-[3px_3px_0px_#FF3358] p-2.5">
                <div className="text-[10px] font-black text-[#4A4A5A] uppercase">PANELS COLORED</div>
                <div className="font-manga text-2xl text-[#FF3358]">
                  {coloredPanels} / {totalPanels}
                </div>
              </div>
              <div className="bg-[#FFFDF7] text-[#121218] border-[3px] border-[#121218] shadow-[3px_3px_0px_#00C2FF] p-2.5">
                <div className="text-[10px] font-black text-[#4A4A5A] uppercase">STREAK FLAME</div>
                <div className="font-manga text-2xl text-[#00C2FF]">
                  {data?.profile.streakDays ?? 7} DAYS
                </div>
              </div>
              <div className="bg-[#FFFDF7] text-[#121218] border-[3px] border-[#121218] shadow-[3px_3px_0px_#FFC82C] p-2.5">
                <div className="text-[10px] font-black text-[#4A4A5A] uppercase">TOTAL XP</div>
                <div className="font-manga text-2xl text-[#121218]">
                  {data?.profile.xp ?? 2450}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4 SIGNATURE AI COACH COMIC PANELS */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-manga text-3xl sm:text-4xl tracking-wider flex items-center gap-2">
            <Zap className="w-7 h-7 text-[#FF3358] fill-[#FFC82C]" />
            CORE AI COACH MODULES
          </h2>
          <span className="text-xs font-black uppercase bg-[#121218] text-[#FFC82C] px-2.5 py-1">
            ACTIVE LEARNING · VYGOTSKY ZPD
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {[
            {
              href: "/shell-break",
              badge: "SIGNATURE ARENA",
              title: "SHELL BREAK",
              desc: "Proof-before-code arena. Unlock 3–4 B&W manga Breakthrough Panels into vibrant color with Sensei Reiko before the code seal breaks.",
              color: "#00C2FF",
              icon: Crosshair,
            },
            {
              href: "/chamber",
              badge: "ADAPTIVE PREP HQ",
              title: "THE CHAMBER",
              desc: "7-Axis Anime Combat Stat Radar + Adaptive 5-Round Magazine that deals battle cards calibrated to your weakest topic rating.",
              color: "#FF3358",
              icon: Flame,
            },
            {
              href: "/blueprint",
              badge: "VOICE-TO-BOARD",
              title: "VOL. 04 BLUEPRINT",
              desc: "Speak system design tradeoffs aloud. Sensei sketches dashed ghost nodes on the canvas—nothing lands without your APPROVE stamp.",
              color: "#00C875",
              icon: Layers,
            },
            {
              href: "/dossier",
              badge: "TRANSPARENT MEMORY",
              title: "SENSEI'S DOSSIER",
              desc: "Inspect and edit everything your AI Coach remembers about your weak invariants, sprint deadlines, strengths, and strictness rules.",
              color: "#FF6FAE",
              icon: ScrollText,
            },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.title}
                href={item.href}
                className="manga-panel p-0 overflow-hidden group flex flex-col justify-between hover:-translate-y-1.5 transition-transform"
              >
                <div
                  style={{ backgroundColor: item.color }}
                  className="px-4 py-2.5 border-b-[3px] border-[#121218] flex items-center justify-between speed-lines"
                >
                  <span className="bg-[#121218] text-white text-[10px] font-black px-2 py-0.5 uppercase tracking-wider">
                    {item.badge}
                  </span>
                  <Icon className="w-5 h-5 text-[#121218] stroke-[2.6]" />
                </div>
                <div className="p-4 bg-[#FFFDF7] text-[#121218] flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-manga text-2xl tracking-wide mb-1.5 group-hover:text-[#FF3358] transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-xs font-medium text-[#4A4A5A] leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                  <div className="mt-4 flex items-center gap-1 text-xs font-black uppercase text-[#FF3358]">
                    OPEN CHAPTER <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* 5 FULL-COLOR MANGA VOLUMES BOOKSHELF */}
      <section className="manga-panel p-6 bg-[#FFFDF7] text-[#121218] space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b-[3px] border-[#121218] pb-3">
          <div>
            <span className="text-[11px] font-black uppercase tracking-widest text-[#FF3358]">
              COMPLETE ENGINEERING SAGA
            </span>
            <h2 className="font-manga text-3xl sm:text-4xl tracking-wider">
              THE 5 BUCKSHOT MANGA VOLUMES
            </h2>
          </div>
          <Link
            href="/volumes"
            className="manga-btn bg-[#7C4DFF] text-white px-4 py-2 text-xs flex items-center gap-1.5"
          >
            <Sparkles className="w-4 h-4" />
            EXPLORE VOLUMES + GITHUB SYNC
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {MANGA_VOLUMES.map((vol) => {
            const pct = Math.round((vol.completed / vol.chapters) * 100);
            return (
              <Link
                key={vol.number}
                href={`/volumes#vol-${vol.number}`}
                className="border-[3px] border-[#121218] shadow-[4px_4px_0px_#121218] bg-[#FAF4E6] flex flex-col justify-between overflow-hidden hover:-translate-y-1 transition-transform manga-color-layer"
              >
                <div
                  style={{ backgroundColor: vol.accent }}
                  className="p-3 border-b-[3px] border-[#121218] speed-lines"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-manga text-xl text-[#121218]">{vol.code}</span>
                    <span className="bg-[#121218] text-white text-[9px] font-black px-1.5 py-0.5">
                      {vol.badge}
                    </span>
                  </div>
                  <div className="font-manga text-2xl tracking-wide text-[#121218] mt-1">
                    {vol.name}
                  </div>
                </div>
                <div className="p-3 flex-1 flex flex-col justify-between space-y-3">
                  <p className="text-xs font-bold text-[#3D3D4E] leading-snug">{vol.subtitle}</p>
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] font-black uppercase">
                      <span>{vol.completed}/{vol.chapters} CH.</span>
                      <span>{pct}% COLORED</span>
                    </div>
                    <div className="h-2 bg-white border-2 border-[#121218]">
                      <div
                        style={{ width: `${pct}%`, backgroundColor: vol.accent }}
                        className="h-full"
                      />
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        <div className="bg-[#FAF4E6] border-2 border-dashed border-[#121218] p-3.5 flex flex-wrap items-center justify-between gap-2 text-xs font-bold">
          <span className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#00C875]" />
            Tip: Toggle <strong>B&amp;W INK</strong> in the top bar to experience classic manga pages where ONLY your unlocked breakthroughs pop in vivid anime color!
          </span>
          <span className="font-mono text-[11px] bg-[#121218] text-[#00C2FF] px-2 py-0.5">
            SQLite + Prisma Persistence Active
          </span>
        </div>
      </section>
    </div>
  );
}
