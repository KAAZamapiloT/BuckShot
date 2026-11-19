"use client";

import React, { useEffect, useState } from "react";
import { Save, Plus, Trash2, ScrollText, CheckCircle2 } from "lucide-react";
import { SenseiAvatar } from "@/components/SenseiAvatar";
import { CombatRadar } from "@/components/CombatRadar";
import { playSfx } from "@/lib/sound";

interface DossierData {
  codename: string;
  overallRating: number;
  targetCompany: string;
  sprintWeeksLeft: number;
  senseiDirectives: string;
  topicRatings: Record<string, number>;
  strengths: string[];
  weaknesses: string[];
}

export default function DossierPage() {
  const [dossier, setDossier] = useState<DossierData | null>(null);
  const [newStrength, setNewStrength] = useState("");
  const [newWeakness, setNewWeakness] = useState("");
  const [saving, setSaving] = useState(false);
  const [savedToast, setSavedToast] = useState(false);

  useEffect(() => {
    fetch("/api/dossier")
      .then((r) => r.json())
      .then(setDossier);
  }, []);

  const saveAll = async () => {
    if (!dossier) return;
    setSaving(true);
    playSfx("click");
    try {
      const res = await fetch("/api/dossier", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dossier),
      });
      const updated = await res.json();
      setDossier(updated);
      setSavedToast(true);
      playSfx("unlock");
      setTimeout(() => setSavedToast(false), 2600);
    } finally {
      setSaving(false);
    }
  };

  if (!dossier) {
    return (
      <div className="manga-panel p-12 text-center font-manga text-3xl">
        UNROLLING SENSEI&apos;S DOSSIER...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="manga-panel p-5 bg-[#FF6FAE] text-[#121218] speed-lines flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <SenseiAvatar expression="thinking" sfx="MEMORY!" size="md" />
          <div>
            <span className="bg-[#121218] text-white text-[10px] font-black px-2 py-0.5 uppercase border border-white/20">
              TRANSPARENT PERSISTENT AI MEMORY · SAVED IN SQLITE
            </span>
            <h1 className="font-manga text-4xl sm:text-5xl tracking-wider mt-1 flex items-center gap-2">
              <ScrollText className="w-8 h-8" />
              SENSEI&apos;S CHARACTER DOSSIER
            </h1>
            <p className="text-xs sm:text-sm font-bold max-w-2xl text-[#121218]/90">
              Everything Sensei Reiko remembers about you lives right here. Edit your weak spots,
              sprint target, or coaching rules anytime—changes inject immediately into Shell Break
              &amp; Blueprint prompts.
            </p>
          </div>
        </div>

        <button
          onClick={saveAll}
          disabled={saving}
          className="manga-btn bg-[#FFC82C] text-[#121218] px-5 py-3 text-sm flex items-center gap-2"
        >
          {savedToast ? <CheckCircle2 className="w-5 h-5 text-[#00C875]" /> : <Save className="w-5 h-5" />}
          {saving ? "SAVING..." : savedToast ? "DOSSIER SAVED!" : "SAVE TO SQLITE"}
        </button>
      </div>

      {/* 2-Page Character Sheet */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Character Profile + Strengths/Weaknesses */}
        <div className="lg:col-span-7 space-y-5">
          <div className="manga-panel p-5 bg-[var(--card-bg)] text-[var(--ink)] space-y-4 border-[3px] border-[var(--border-ink)]">
            <h2 className="font-manga text-2xl border-b-[3px] border-[var(--border-ink)] pb-2">
              IDENTITY &amp; ACTIVE SPRINT
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-[11px] font-black uppercase block mb-1 text-[var(--ink-muted)]">CODENAME</label>
                <input
                  value={dossier.codename}
                  onChange={(e) => setDossier({ ...dossier, codename: e.target.value })}
                  className="w-full border-2 border-[var(--border-ink)] bg-[var(--input-bg)] text-[var(--ink)] px-3 py-2 text-sm font-black"
                />
              </div>
              <div>
                <label className="text-[11px] font-black uppercase block mb-1 text-[var(--ink-muted)]">TARGET LOOP</label>
                <input
                  value={dossier.targetCompany}
                  onChange={(e) => setDossier({ ...dossier, targetCompany: e.target.value })}
                  className="w-full border-2 border-[var(--border-ink)] bg-[var(--input-bg)] text-[var(--ink)] px-3 py-2 text-sm font-bold"
                />
              </div>
              <div>
                <label className="text-[11px] font-black uppercase block mb-1 text-[var(--ink-muted)]">WEEKS LEFT</label>
                <input
                  type="number"
                  min={1}
                  max={52}
                  value={dossier.sprintWeeksLeft}
                  onChange={(e) =>
                    setDossier({ ...dossier, sprintWeeksLeft: Number(e.target.value) || 1 })
                  }
                  className="w-full border-2 border-[var(--border-ink)] bg-[var(--input-bg)] text-[var(--ink)] px-3 py-2 text-sm font-black"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-black uppercase block mb-1 text-[var(--ink-muted)]">
                CUSTOM SENSEI REIKO DIRECTIVES (INJECTED INTO SYSTEM PROMPT)
              </label>
              <textarea
                rows={3}
                value={dossier.senseiDirectives}
                onChange={(e) => setDossier({ ...dossier, senseiDirectives: e.target.value })}
                className="w-full border-2 border-[var(--border-ink)] bg-[var(--input-bg)] text-[var(--ink)] p-3 text-xs font-bold"
              />
            </div>
          </div>

          {/* Weak Invariants + Strengths */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="manga-panel p-4 bg-[var(--card-bg)] text-[var(--ink)] space-y-3 border-[3px] border-[var(--border-ink)]">
              <h3 className="font-manga text-2xl text-[#FF3358]">KNOWN WEAK INVARIANTS</h3>
              <div className="space-y-2">
                {dossier.weaknesses.map((w, i) => (
                  <div
                    key={i}
                    className="flex items-start justify-between gap-2 bg-[#FF3358]/10 border-2 border-[var(--border-ink)] p-2.5 text-xs font-bold text-[var(--ink)]"
                  >
                    <span>{w}</span>
                    <button
                      onClick={() => {
                        playSfx("click");
                        setDossier({
                          ...dossier,
                          weaknesses: dossier.weaknesses.filter((_, idx) => idx !== i),
                        });
                      }}
                      className="text-[#FF3358] hover:scale-110"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex gap-1.5">
                <input
                  value={newWeakness}
                  onChange={(e) => setNewWeakness(e.target.value)}
                  placeholder="Add weak spot..."
                  className="flex-1 border-2 border-[var(--border-ink)] bg-[var(--input-bg)] text-[var(--ink)] px-2.5 py-1.5 text-xs font-bold"
                />
                <button
                  onClick={() => {
                    if (!newWeakness.trim()) return;
                    playSfx("click");
                    setDossier({
                      ...dossier,
                      weaknesses: [...dossier.weaknesses, newWeakness.trim()],
                    });
                    setNewWeakness("");
                  }}
                  className="manga-btn bg-[#FF3358] text-white px-2.5"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="manga-panel p-4 bg-[var(--card-bg)] text-[var(--ink)] space-y-3 border-[3px] border-[var(--border-ink)]">
              <h3 className="font-manga text-2xl text-[#00C875]">SIGNATURE STRENGTHS</h3>
              <div className="space-y-2">
                {dossier.strengths.map((s, i) => (
                  <div
                    key={i}
                    className="flex items-start justify-between gap-2 bg-[#00C875]/15 border-2 border-[var(--border-ink)] p-2.5 text-xs font-bold text-[var(--ink)]"
                  >
                    <span>{s}</span>
                    <button
                      onClick={() => {
                        playSfx("click");
                        setDossier({
                          ...dossier,
                          strengths: dossier.strengths.filter((_, idx) => idx !== i),
                        });
                      }}
                      className="text-[#FF3358] hover:scale-110"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex gap-1.5">
                <input
                  value={newStrength}
                  onChange={(e) => setNewStrength(e.target.value)}
                  placeholder="Add strength..."
                  className="flex-1 border-2 border-[var(--border-ink)] bg-[var(--input-bg)] text-[var(--ink)] px-2.5 py-1.5 text-xs font-bold"
                />
                <button
                  onClick={() => {
                    if (!newStrength.trim()) return;
                    playSfx("click");
                    setDossier({
                      ...dossier,
                      strengths: [...dossier.strengths, newStrength.trim()],
                    });
                    setNewStrength("");
                  }}
                  className="manga-btn bg-[#00C875] text-[#121218] px-2.5"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Calibrate Topic Power Levels + Live Radar */}
        <div className="lg:col-span-5 manga-panel p-5 bg-[var(--card-bg)] text-[var(--ink)] space-y-4 border-[3px] border-[var(--border-ink)]">
          <div className="flex items-center justify-between border-b-[3px] border-[var(--border-ink)] pb-2">
            <h2 className="font-manga text-2xl">SELF-CALIBRATE POWER RATINGS</h2>
            <span className="bg-[#121218] text-[#FFC82C] font-manga text-xl px-2.5 py-0.5 border border-[var(--border-ink)]">
              AVG {dossier.overallRating}
            </span>
          </div>

          <CombatRadar ratings={dossier.topicRatings} />

          <div className="space-y-2.5">
            {Object.entries(dossier.topicRatings).map(([topic, val]) => (
              <div key={topic} className="space-y-1">
                <div className="flex justify-between text-xs font-black uppercase">
                  <span>{topic}</span>
                  <span className="text-[#FF3358]">PL {val}</span>
                </div>
                <input
                  type="range"
                  min={800}
                  max={2600}
                  step={20}
                  value={val}
                  onChange={(e) => {
                    const nextRatings = {
                      ...dossier.topicRatings,
                      [topic]: Number(e.target.value),
                    };
                    const vals = Object.values(nextRatings);
                    setDossier({
                      ...dossier,
                      topicRatings: nextRatings,
                      overallRating: Math.round(vals.reduce((a, b) => a + b, 0) / vals.length),
                    });
                  }}
                  className="w-full accent-[#FF3358]"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
