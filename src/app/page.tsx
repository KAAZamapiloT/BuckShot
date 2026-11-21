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
    brief: string;
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
      <section className="overflow-hidden rounded-sm border border-[var(--border-muted)] bg-[var(--card-bg)]">
        <div className="grid lg:grid-cols-2">
          <div className="flex min-w-0 flex-col justify-center gap-4 p-5 sm:gap-6 sm:p-9 xl:p-12">
            <div className="flex items-center gap-3 text-xs font-semibold tracking-wide text-[var(--ink-muted)]">
              <span aria-hidden="true" className="h-px w-8 bg-current" />
              Shell Break {challenge && `· Volume ${challenge.volumeNumber}`}
            </div>
            <div aria-live="polite" aria-busy={loading}>
              <h1 className="font-manga break-words text-4xl leading-none sm:text-5xl xl:text-6xl">
                {challenge?.title ?? (loading ? "Loading your challenge…" : data && problems.length ? "Every challenge solved." : "Shell Break arena")}
              </h1>
              <p className="mt-3 line-clamp-2 max-w-lg text-sm leading-relaxed text-[var(--ink-secondary)] sm:text-base">
                {failed ? "Your saved progress is unavailable. Open the arena to choose a challenge."
                  : challenge ? challenge.brief.replaceAll("`", "")
                  : data && problems.length ? "Revisit a proof or practice a challenge again."
                  : "Explore the manga challenge library."}
              </p>
            </div>
            {challenge && (
              <div className="space-y-2">
                <p className="text-sm font-semibold">{challenge.topic} · {challenge.unlockedCount} of {challenge.totalPanels} panels unlocked</p>
                <div className="flex gap-1 max-w-xs" aria-hidden="true">
                  {Array.from({ length: challenge.totalPanels }, (_, i) => (
                    <span key={i} className={`h-1 flex-1 rounded-full ${i < challenge.unlockedCount ? "bg-[var(--crimson)]" : "bg-[var(--border-muted)]"}`} />
                  ))}
                </div>
              </div>
            )}
            {!loading && (
              <Link href={challenge ? `/shell-break/${challenge.slug}` : "/shell-break"}
                onClick={() => playSfx("click")}
                className="inline-flex self-start items-center gap-3 rounded bg-[#FFC82C] px-5 py-3 text-sm font-bold text-[#121218] hover:bg-[#ffd85c]">
                {action} <ArrowRight aria-hidden="true" className="h-4 w-4" />
              </Link>
            )}
          </div>
          <div className="manga-color-layer relative aspect-[2.4] overflow-hidden bg-[#121218] lg:aspect-auto lg:min-h-[360px]">
            <img src="/art/hero-spread.jpg" alt="The BUCKSHOT manga dojo" className="absolute inset-0 h-full w-full object-cover" />
          </div>
        </div>
        {data && (
          <dl aria-label="Training progress" className="grid grid-cols-2 gap-x-4 gap-y-3 border-t border-[var(--border-muted)] px-5 py-3 sm:flex sm:justify-between sm:px-9 lg:px-12">
            {[
              ["Rank", data.profile.rank.grade],
              ["Panels", `${coloredPanels} / ${totalPanels}`],
              ["Streak", `${data.profile.streakDays} days`],
              ["XP", data.profile.xp.toLocaleString()],
            ].map(([label, value]) => (
              <div key={label} className="flex items-baseline gap-2 text-sm"><dt className="text-[var(--ink-muted)]">{label}</dt><dd className="font-bold tabular-nums">{value}</dd></div>
            ))}
          </dl>
        )}
      </section>

      {/* 4 SIGNATURE AI COACH COMIC PANELS */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-manga text-3xl sm:text-4xl tracking-wider flex items-center gap-2">
            Choose what to practice
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {[
            {
              href: "/shell-break",
              title: "SHELL BREAK",
              desc: "Try a small example by hand. Explain why your approach works, then unlock the editor and implement it.",
              action: "Choose a problem",
              icon: Crosshair,
            },
            {
              href: "/chamber",
              title: "THE CHAMBER",
              desc: "Find a weak topic on your skill chart, pick a matching challenge, and start a timed practice session.",
              action: "Plan a session",
              icon: Flame,
            },
            {
              href: "/blueprint",
              title: "VOL. 04 BLUEPRINT",
              desc: "Talk through a design decision. Review Sensei’s suggested components and choose which ones belong on your diagram.",
              action: "Open the design board",
              icon: Layers,
            },
            {
              href: "/dossier",
              title: "SENSEI'S DOSSIER",
              desc: "Review the strengths and weak spots Sensei remembers. Update your target company and what you want to work on next.",
              action: "Review your profile",
              icon: ScrollText,
            },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.title}
                href={item.href}
                onClick={() => playSfx("click")}
                className="group flex flex-col items-start gap-3 rounded-sm border border-[var(--border-muted)] bg-[var(--card-bg)] p-5 hover:border-[var(--ink)]"
              >
                <span className="flex items-center gap-2 text-xs font-semibold text-[var(--ink-muted)]"><Icon size={16} />{item.title}</span>
                <h3 className="text-lg font-bold">{item.action}</h3>
                <p className="text-sm leading-relaxed text-[var(--ink-secondary)]">{item.desc}</p>
                <ArrowRight aria-hidden="true" className="mt-auto h-4 w-4 transition-transform group-hover:translate-x-1" />
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

      </section>
    </div>
  );
}
