"use client";

import React, { useEffect, useState } from "react";
import { Crosshair, Trophy, Flame, ArrowRight, Sparkles, CheckCircle2 } from "lucide-react";
import { BOUNTY_GUESSR_POSTERS, BOUNTY_RANK_LADDER } from "@/lib/seed-data";
import { SenseiAvatar } from "@/components/SenseiAvatar";

export default function BountyGuessrPage() {
  const [posterIdx, setPosterIdx] = useState(0);
  const [guess, setGuess] = useState(1500);
  const [revealed, setRevealed] = useState(false);
  const [streak, setStreak] = useState(0);
  const [sessionXp, setSessionXp] = useState(0);
  const [userRating, setUserRating] = useState(1480);
  const [totalXp, setTotalXp] = useState(2450);

  useEffect(() => {
    fetch("/api/bootstrap")
      .then((r) => r.json())
      .then((d) => {
        if (d?.profile) {
          setUserRating(d.profile.overallRating);
          setTotalXp(d.profile.xp);
        }
      });
  }, []);

  const poster = BOUNTY_GUESSR_POSTERS[posterIdx % BOUNTY_GUESSR_POSTERS.length];
  const diff = Math.abs(guess - poster.trueRating);

  const stamp =
    diff <= 100
      ? { label: "BULLSEYE!!", xp: 120, color: "#00C875", expr: "victory" as const }
      : diff <= 260
      ? { label: "CLOSE HIT!", xp: 60, color: "#FFC82C", expr: "fired-up" as const }
      : { label: "OFF TARGET!", xp: 15, color: "#FF3358", expr: "thinking" as const };

  const submitGuess = async () => {
    setRevealed(true);
    setSessionXp((x) => x + stamp.xp);
    setStreak((s) => (diff <= 260 ? s + 1 : 0));

    const res = await fetch("/api/guessr", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ xpDelta: stamp.xp }),
    });
    const json = await res.json();
    if (typeof json.xp === "number") setTotalXp(json.xp);
  };

  const nextPoster = () => {
    setPosterIdx((i) => (i + 1) % BOUNTY_GUESSR_POSTERS.length);
    setRevealed(false);
    setGuess(1500);
  };

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="manga-panel p-5 bg-[#FFC82C] text-[#121218] speed-lines flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="bg-[#121218] text-white text-[10px] font-black px-2 py-0.5 uppercase">
            CALIBRATE YOUR PROBLEM-DIFFICULTY RADAR · CP &amp; SYSTEMS SCALE
          </span>
          <h1 className="font-manga text-4xl sm:text-5xl tracking-wider mt-1 flex items-center gap-2">
            <Crosshair className="w-9 h-9 text-[#FF3358]" />
            BOUNTY GUESSR &amp; RANK LADDER
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-[#FFFDF7] border-[3px] border-[#121218] shadow-[3px_3px_0px_#121218] px-3.5 py-1.5 text-center">
            <div className="text-[10px] font-black text-[#4A4A5A]">STREAK</div>
            <div className="font-manga text-2xl text-[#FF3358] flex items-center gap-1 justify-center">
              <Flame className="w-4 h-4 fill-[#FFC82C]" /> {streak}
            </div>
          </div>
          <div className="bg-[#FFFDF7] border-[3px] border-[#121218] shadow-[3px_3px_0px_#121218] px-3.5 py-1.5 text-center">
            <div className="text-[10px] font-black text-[#4A4A5A]">TOTAL XP</div>
            <div className="font-manga text-2xl text-[#00C2FF]">{totalXp}</div>
          </div>
        </div>
      </div>

      {/* BOUNTY GUESSR ARENA (2-COLUMN SPREAD) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Shonen Wanted Poster */}
        <div className="lg:col-span-7 manga-panel bg-[#FFFDF7] text-[#121218] p-6 halftone-dots relative overflow-hidden">
          <div className="flex items-center justify-between border-b-4 border-[#121218] pb-3 mb-4">
            <div>
              <span className="bg-[#FF3358] text-white text-xs font-black px-2.5 py-0.5 border-2 border-[#121218]">
                {poster.codename}
              </span>
              <span className="ml-2 text-xs font-black uppercase text-[#4A4A5A]">
                {poster.origin}
              </span>
            </div>
            <span className="font-manga text-xl text-[#121218]">
              POSTER {(posterIdx % BOUNTY_GUESSR_POSTERS.length) + 1}/{BOUNTY_GUESSR_POSTERS.length}
            </span>
          </div>

          <h2 className="font-manga text-4xl sm:text-5xl tracking-wide leading-none mb-3">
            {poster.title}
          </h2>
          <p className="text-sm sm:text-base font-bold text-[#22222E] leading-relaxed mb-4">
            {poster.summary}
          </p>
          <div className="bg-[#FAF4E6] border-2 border-[#121218] px-3.5 py-2 font-mono text-xs font-bold mb-4">
            CONSTRAINTS: {poster.constraints}
          </div>

          <div className="flex flex-wrap gap-2 mb-6">
            {poster.tags.map((t) => (
              <span
                key={t}
                className="bg-[#00C2FF]/25 border-2 border-[#121218] text-xs font-black px-2.5 py-0.5 uppercase"
              >
                {t}
              </span>
            ))}
          </div>

          {/* Guess Slider */}
          <div className="bg-[#FAF4E6] border-[3px] border-[#121218] p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase">YOUR POWER LEVEL ESTIMATE</span>
              <span className="font-manga text-3xl text-[#FF3358] bg-white border-2 border-[#121218] px-3 py-0.5 shadow-[2px_2px_0px_#121218]">
                PL {guess}
              </span>
            </div>
            <input
              type="range"
              min={800}
              max={2700}
              step={10}
              disabled={revealed}
              value={guess}
              onChange={(e) => setGuess(Number(e.target.value))}
              className="w-full accent-[#FF3358]"
            />
            <div className="flex justify-between text-[10px] font-black text-[#4A4A5A]">
              <span>800 (INITIATE)</span>
              <span>1400 (B-RANK)</span>
              <span>1900 (S-RANK)</span>
              <span>2700 (GRANDMASTER)</span>
            </div>
          </div>

          {/* Action / Reveal */}
          {!revealed ? (
            <button
              onClick={submitGuess}
              className="mt-5 w-full manga-btn bg-[#FF3358] text-white py-3 text-base"
            >
              LOCK IN BOUNTY ESTIMATE!!
            </button>
          ) : (
            <div
              style={{ backgroundColor: stamp.color }}
              className="mt-5 border-[3px] border-[#121218] shadow-[5px_5px_0px_#121218] p-4 text-[#121218] space-y-2 speed-lines"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-manga text-3xl tracking-wider">
                  {stamp.label} (+{stamp.xp} XP)
                </span>
                <span className="bg-[#121218] text-[#FFC82C] font-manga text-2xl px-3 py-0.5">
                  TRUE PL: {poster.trueRating} (Δ {diff})
                </span>
              </div>
              <p className="text-xs font-bold bg-[#FFFDF7] border-2 border-[#121218] p-2.5">
                {poster.revealReason}
              </p>
              <button
                onClick={nextPoster}
                className="manga-btn bg-[#121218] text-[#FFC82C] px-4 py-2 text-xs flex items-center gap-1.5"
              >
                NEXT WANTED POSTER <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Right Side: Sensei Reaction + Session Tracker */}
        <div className="lg:col-span-5 space-y-5">
          <div className="manga-panel p-5 bg-[#FFFDF7] text-[#121218] flex items-center gap-4">
            <SenseiAvatar
              expression={revealed ? stamp.expr : "thinking"}
              sfx={revealed ? stamp.label : "GUESS!"}
              size="lg"
            />
            <div className="space-y-1.5">
              <div className="font-manga text-2xl text-[#FF3358]">WHY CALIBRATE RATINGS?</div>
              <p className="text-xs font-bold leading-snug text-[#3D3D4E]">
                Great engineers recognize problem difficulty in 30 seconds. Spot whether a prompt
                needs a clean 1200-PL hash map or a 1900-PL systems invariant before writing a
                single line!
              </p>
              <div className="text-[11px] font-black text-[#00C875]">
                SESSION XP EARNED: +{sessionXp} XP
              </div>
            </div>
          </div>

          <div className="manga-panel overflow-hidden bg-[#121218] relative h-52">
            <img
              src="/art/bounty-poster.jpg"
              alt="BUCKSHOT Tactical Bounty Board"
              className="w-full h-full object-cover opacity-90"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = "/art/hero-spread.jpg";
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#121218]/90 via-transparent to-transparent flex items-end p-4">
              <div className="text-white">
                <div className="font-manga text-2xl text-[#FFC82C]">OBJECTIVE 800–3500 SCALE</div>
                <div className="text-xs font-bold text-white/85">
                  No vague &ldquo;Easy / Medium / Hard&rdquo; buckets—train on competitive rating precision.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 6-TIER BOUNTY RANK LADDER */}
      <section className="manga-panel p-6 bg-[#FFFDF7] text-[#121218] space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b-[3px] border-[#121218] pb-3">
          <h2 className="font-manga text-3xl sm:text-4xl flex items-center gap-2">
            <Trophy className="w-7 h-7 text-[#FFC82C] stroke-[#121218]" />
            THE BOUNTY RANK LADDER (CURRENT: PL {userRating})
          </h2>
          <span className="bg-[#121218] text-[#00C2FF] text-xs font-black px-3 py-1 uppercase flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5" /> COLORIZE EVERY TIER
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {BOUNTY_RANK_LADDER.map((tier) => {
            const unlocked = userRating >= tier.minPl;
            return (
              <div
                key={tier.grade}
                style={{ backgroundColor: unlocked ? tier.color : undefined }}
                className={`border-[3px] border-[#121218] shadow-[4px_4px_0px_#121218] p-4 ${
                  unlocked ? "manga-unlocked-pop speed-lines text-[#121218]" : "crux-panel-locked text-[#121218]"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-manga text-3xl bg-[#121218] text-white px-2.5 py-0.5">
                    {tier.grade}-RANK
                  </span>
                  <span className="bg-[#FFFDF7] border-2 border-[#121218] text-xs font-black px-2 py-0.5 flex items-center gap-1">
                    {unlocked && <CheckCircle2 className="w-3.5 h-3.5 text-[#00C875]" />}
                    {tier.minPl}+ PL
                  </span>
                </div>
                <div className="font-manga text-2xl">{tier.title}</div>
                <div className="mt-2 bg-[#FFFDF7]/95 border-2 border-[#121218] p-2.5 text-xs font-bold space-y-1">
                  <div>Trial: {tier.trial}</div>
                  <div className="text-[#FF3358]">Unlock Reward: {tier.reward}</div>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
