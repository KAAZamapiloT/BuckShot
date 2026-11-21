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

import { MANGA_VOLUMES } from "@/lib/seed-data";
import { playSfx } from "@/lib/sound";

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
    topic: string;
    lastAttemptAt: string | null;
    solved: boolean;
    unlockedCount: number;
    totalPanels: number;
  }>;
}

export default function HomePage() {
  const [data, setData] = useState<BootstrapData | null>(null);

  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/bootstrap", { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error("Progress unavailable");
        return response.json();
      })
      .then(setData)
      .catch(() => {
        if (!controller.signal.aborted) setFailed(true);
      });
    return () => controller.abort();
  }, []);

  const problems = data?.problems ?? [];
  const unfinished = problems.filter((problem) => !problem.solved);
  const recent = unfinished
    .filter((problem) => problem.lastAttemptAt)
    .sort((a, b) => b.lastAttemptAt!.localeCompare(a.lastAttemptAt!))[0];
  const challenge = recent ?? unfinished[0];
  const started = problems.some((problem) => problem.lastAttemptAt || problem.solved);
  const loading = !data && !failed;
  const totalPanels = problems.reduce((sum, problem) => sum + problem.totalPanels, 0);
  const coloredPanels = problems.reduce((sum, problem) => sum + problem.unlockedCount, 0);
  let action = "Browse challenges";
  if (recent) action = "Continue challenge";
  else if (challenge) action = started ? "Start next challenge" : "Start your first challenge";
  return (
    <div className="space-y-8">
      {/* DOUBLE-PAGE MANGA HERO SPREAD */}
      <section className="manga-panel overflow-hidden relative border-[3px] border-[var(--border-ink)] bg-[var(--card-bg)]">
        <div className="grid grid-cols-1 lg:grid-cols-12 relative">
          {/* Center Book Spine Shadow on Desktop */}
          <div className="hidden lg:block absolute inset-y-0 left-1/2 -translate-x-1/2 w-8 book-spread-spine pointer-events-none z-20" />

          <div className="lg:col-span-6 flex flex-col justify-center gap-6 p-6 sm:p-10 bg-[var(--card-bg)] text-[var(--ink)]">
            <div className="flex items-center gap-3 text-xs font-bold uppercase tracking-widest">
              <span className="h-1 w-8 bg-[var(--crimson)]" aria-hidden="true" />
              Shell Break {challenge && `· Volume ${challenge.volumeNumber}`}
            </div>
            <div aria-live="polite" aria-busy={loading}>
              <h1 className="font-manga text-5xl sm:text-6xl lg:text-7xl leading-none tracking-wide">
                {challenge?.title ?? (loading ? "Loading your challenge…" : data && problems.length ? "Every challenge solved." : "Shell Break arena")}
              </h1>
              <p className="mt-4 text-base leading-relaxed text-[var(--ink-secondary)] max-w-md">
                {failed ? "Your saved progress is unavailable. Open the arena to choose a challenge."
                  : challenge ? "Prove your reasoning to Sensei Reiko. Each breakthrough brings a panel into color."
                  : data && problems.length ? "Revisit a proof or practice a challenge again."
                  : "Explore the manga challenge library."}
              </p>
            </div>
            {challenge && (
              <div className="space-y-2">
                <p className="text-sm font-semibold">{challenge.topic} · {challenge.unlockedCount} of {challenge.totalPanels} panels unlocked</p>
                <div className="flex gap-1 max-w-xs" aria-hidden="true">
                  {Array.from({ length: challenge.totalPanels }, (_, i) => (
                    <span key={i} className={`h-2 flex-1 border border-[var(--ink)] ${i < challenge.unlockedCount ? "bg-[var(--crimson)]" : "bg-[var(--subpanel-bg)]"}`} />
                  ))}
                </div>
              </div>
            )}
            {!loading && (
              <Link href={challenge ? `/shell-break/${challenge.slug}` : "/shell-break"}
                onClick={() => playSfx("click")}
                className="manga-btn inline-flex self-start items-center gap-3 bg-[#FFC82C] px-5 py-3 text-sm text-[#121218]">
                {action} <ArrowRight aria-hidden="true" className="h-4 w-4" />
              </Link>
            )}
          </div>
          {/* RIGHT PAGE: Full-Color Custom Shonen Spread Artwork + Live Stats Overlay */}
          <div className="lg:col-span-6 relative min-h-[240px] lg:min-h-[420px] border-t-4 lg:border-t-0 lg:border-l-4 border-[var(--border-ink)] bg-[#121218] overflow-hidden manga-color-layer">
            <img
              src="/art/hero-spread.jpg"
              alt="BUCKSHOT Shonen Engineering Command Dojo"
              className="absolute inset-0 w-full h-full object-cover object-center"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0C0C14]/90 via-transparent to-transparent" />

            {data && <>
            <div className="absolute top-4 right-4 bg-[#FFC82C] text-[#121218] border-[3px] border-[#121218] shadow-[4px_4px_0px_#121218] px-3 py-1.5 rotate-2">
              <div className="font-manga text-xl leading-none">
                RANK {data.profile.rank.grade} · PL {data.profile.overallRating}
              </div>
              <div className="text-[10px] font-black uppercase">
                {data.profile.rank.title}
              </div>
            </div>

            {/* Bottom Live Telemetry Strip */}
            <div className="absolute bottom-4 inset-x-4 grid grid-cols-3 gap-2.5">
              <div className="bg-[var(--card-bg)] text-[var(--ink)] border-[3px] border-[var(--border-ink)] shadow-[3px_3px_0px_#FF3358] p-2.5">
                <div className="text-[10px] font-black text-[var(--ink-muted)] uppercase">PANELS COLORED</div>
                <div className="font-manga text-2xl text-[#FF3358]">
                  {coloredPanels} / {totalPanels}
                </div>
              </div>
              <div className="bg-[var(--card-bg)] text-[var(--ink)] border-[3px] border-[var(--border-ink)] shadow-[3px_3px_0px_#00C2FF] p-2.5">
                <div className="text-[10px] font-black text-[var(--ink-muted)] uppercase">STREAK FLAME</div>
                <div className="font-manga text-2xl text-[#00C2FF]">
                  {data.profile.streakDays} DAYS
                </div>
              </div>
              <div className="bg-[var(--card-bg)] text-[var(--ink)] border-[3px] border-[var(--border-ink)] shadow-[3px_3px_0px_#FFC82C] p-2.5">
                <div className="text-[10px] font-black text-[var(--ink-muted)] uppercase">TOTAL XP</div>
                <div className="font-manga text-2xl text-[var(--ink)]">
                  {data.profile.xp}
                </div>
              </div>
            </div>
            </>}
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
          <span className="text-xs font-black uppercase bg-[#121218] text-[#FFC82C] border border-[var(--border-ink)] px-2.5 py-1">
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
                onClick={() => playSfx("click")}
                className="manga-panel p-0 overflow-hidden group flex flex-col justify-between hover:-translate-y-1.5 transition-transform border-[3px] border-[var(--border-ink)] bg-[var(--card-bg)]"
              >
                <div
                  style={{ backgroundColor: item.color }}
                  className="px-4 py-2.5 border-b-[3px] border-[var(--border-ink)] flex items-center justify-between speed-lines text-[#121218]"
                >
                  <span className="bg-[#121218] text-white text-[10px] font-black px-2 py-0.5 uppercase tracking-wider">
                    {item.badge}
                  </span>
                  <Icon className="w-5 h-5 text-[#121218] stroke-[2.6]" />
                </div>
                <div className="p-4 bg-[var(--card-bg)] text-[var(--ink)] flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-manga text-2xl tracking-wide mb-1.5 group-hover:text-[#FF3358] transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-xs font-medium text-[var(--ink-secondary)] leading-relaxed">
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
      <section className="manga-panel p-6 bg-[var(--card-bg)] text-[var(--ink)] space-y-5 border-[3px] border-[var(--border-ink)]">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b-[3px] border-[var(--border-ink)] pb-3">
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
            onClick={() => playSfx("click")}
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
                onClick={() => playSfx("click")}
                className="border-[3px] border-[var(--border-ink)] shadow-[4px_4px_0px_var(--shadow-ink)] bg-[var(--subpanel-bg)] flex flex-col justify-between overflow-hidden hover:-translate-y-1 transition-transform manga-color-layer"
              >
                <div
                  style={{ backgroundColor: vol.accent }}
                  className="p-3 border-b-[3px] border-[var(--border-ink)] speed-lines text-[#121218]"
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
                <div className="p-3 flex-1 flex flex-col justify-between space-y-3 text-[var(--ink)]">
                  <p className="text-xs font-bold text-[var(--ink-secondary)] leading-snug">{vol.subtitle}</p>
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] font-black uppercase text-[var(--ink-muted)]">
                      <span>{vol.completed}/{vol.chapters} CH.</span>
                      <span>{pct}% COLORED</span>
                    </div>
                    <div className="h-2 bg-[var(--card-bg)] border-2 border-[var(--border-ink)]">
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

        <div className="bg-[var(--subpanel-bg)] border-2 border-dashed border-[var(--border-ink)] p-3.5 flex flex-wrap items-center justify-between gap-2 text-xs font-bold text-[var(--ink-secondary)]">
          <span className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#00C875]" />
            Tip: Click the <strong>🌙 DARK</strong> toggle in the top bar for Midnight Shonen Cyberpunk mode!
          </span>
          <span className="font-mono text-[11px] bg-[#121218] text-[#00C2FF] border border-[var(--border-ink)] px-2 py-0.5">
            Full-Color · B&amp;W · Midnight Dark
          </span>
        </div>
      </section>
    </div>
  );
}
