"use client";

import React, { useEffect, useState } from "react";
import { Play, Pause, RotateCcw, Clock, Volume2, VolumeX } from "lucide-react";
import { playSfx, isSoundEnabled, toggleSound } from "@/lib/sound";

export function SprintTimer({ defaultMinutes = 45 }: { defaultMinutes?: number }) {
  const [secondsLeft, setSecondsLeft] = useState(defaultMinutes * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [soundOn, setSoundOn] = useState(true);

  useEffect(() => {
    setSoundOn(isSoundEnabled());
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning && secondsLeft > 0) {
      interval = setInterval(() => {
        setSecondsLeft((prev) => {
          if (prev <= 1) {
            playSfx("seal-broken");
            setIsRunning(false);
            return 0;
          }
          if (prev === 300) {
            // 5 minutes warning
            playSfx("guess");
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning, secondsLeft]);

  const toggleTimer = () => {
    playSfx("click");
    setIsRunning(!isRunning);
  };

  const resetTimer = (mins: number = defaultMinutes) => {
    playSfx("click");
    setIsRunning(false);
    setSecondsLeft(mins * 60);
  };

  const handleSoundToggle = () => {
    const next = toggleSound();
    setSoundOn(next);
    if (next) playSfx("click");
  };

  const mins = Math.floor(secondsLeft / 60);
  const secs = secondsLeft % 60;
  const progressPct = ((defaultMinutes * 60 - secondsLeft) / (defaultMinutes * 60)) * 100;
  const isUrgent = secondsLeft < 300;

  return (
    <div className="border-[3px] border-[var(--border-ink,#121218)] bg-[var(--card-bg,#FFFDF7)] text-[var(--ink,#121218)] p-3.5 shadow-[4px_4px_0px_var(--shadow-ink,#121218)] space-y-2.5">
      <div className="flex items-center justify-between gap-2">
        <span className="text-[11px] font-black uppercase flex items-center gap-1.5 text-[var(--ink-secondary,#4A4A5A)]">
          <Clock className="w-3.5 h-3.5 text-[#FF3358]" />
          TECHNICAL MOCK COUNTDOWN
        </span>
        <button
          onClick={handleSoundToggle}
          title={soundOn ? "Mute SFX" : "Enable SFX"}
          className="text-xs p-1 hover:opacity-80 transition-opacity"
        >
          {soundOn ? (
            <Volume2 className="w-3.5 h-3.5 text-[#00C2FF]" />
          ) : (
            <VolumeX className="w-3.5 h-3.5 text-[#888899]" />
          )}
        </button>
      </div>

      <div className="flex items-center justify-between gap-3">
        <div
          className={`font-mono font-black text-2xl sm:text-3xl tracking-tight px-3 py-1 border-2 border-[var(--border-ink,#121218)] ${
            isUrgent
              ? "bg-[#FF3358] text-white animate-pulse"
              : "bg-[var(--subpanel-bg,#FAF4E6)] text-[var(--ink,#121218)]"
          }`}
        >
          {String(mins).padStart(2, "0")}:{String(secs).padStart(2, "0")}
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={toggleTimer}
            className={`manga-btn px-3 py-1.5 text-xs flex items-center gap-1 ${
              isRunning
                ? "bg-[#FFC82C] text-[#121218]"
                : "bg-[#00C875] text-[#121218]"
            }`}
          >
            {isRunning ? (
              <>
                <Pause className="w-3.5 h-3.5 fill-current" /> PAUSE
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" /> START
              </>
            )}
          </button>
          <button
            onClick={() => resetTimer(defaultMinutes)}
            className="manga-btn bg-[var(--subpanel-bg,#FAF4E6)] text-[var(--ink,#121218)] px-2 py-1.5 text-xs"
            title="Reset"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-1">
        <div className="h-2 w-full bg-[var(--subpanel-bg,#E5E0D5)] border-2 border-[var(--border-ink,#121218)] overflow-hidden">
          <div
            style={{ width: `${Math.min(100, Math.max(0, progressPct))}%` }}
            className={`h-full transition-all duration-300 ${
              isUrgent ? "bg-[#FF3358]" : "bg-[#00C2FF]"
            }`}
          />
        </div>
        <div className="flex justify-between text-[9px] font-black uppercase text-[var(--ink-muted,#666677)]">
          <button onClick={() => resetTimer(15)} className="hover:underline">15M</button>
          <button onClick={() => resetTimer(30)} className="hover:underline">30M</button>
          <button onClick={() => resetTimer(45)} className="hover:underline">45M (STAFF)</button>
          <button onClick={() => resetTimer(60)} className="hover:underline">60M</button>
        </div>
      </div>
    </div>
  );
}
