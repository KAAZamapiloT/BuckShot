"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  BookOpen,
  Flame,
  Crosshair,
  Layers,
  ScrollText,
  Sparkles,
  Palette,
  Contrast,
  Moon,
  Sun,
  Search,
  Trophy,
  X,
  Send,
  MessageCircle,
  Volume2,
  VolumeX,
  GitBranch,
  Building2,
} from "lucide-react";
import { SEED_PROBLEMS, MANGA_VOLUMES } from "@/lib/seed-data";
import { SenseiAvatar, type SenseiExpression } from "@/components/SenseiAvatar";
import { ProgressionModal } from "@/components/ProgressionModal";
import { isSoundEnabled, toggleSound, playSfx } from "@/lib/sound";

type MangaMode = "color" | "ink" | "midnight";

const NAV_TABS = [
  { href: "/", label: "COVER", icon: BookOpen, color: "#FFC82C" },
  { href: "/chamber", label: "CHAMBER", icon: Flame, color: "#FF3358" },
  { href: "/shell-break", label: "SHELL BREAK", icon: Crosshair, color: "#00C2FF" },
  { href: "/tree", label: "JUTSU TREE", icon: GitBranch, color: "#00C2FF" },
  { href: "/intel", label: "INTEL", icon: Building2, color: "#FF3358" },
  { href: "/blueprint", label: "BLUEPRINT", icon: Layers, color: "#00C875" },
  { href: "/guessr", label: "GUESSR", icon: Trophy, color: "#FFC82C" },
  { href: "/volumes", label: "VOLUMES", icon: Sparkles, color: "#7C4DFF" },
  { href: "/dossier", label: "DOSSIER", icon: ScrollText, color: "#FF6FAE" },
];

const QUICK_PROMPTS = [
  "💡 Give me an invariant hint",
  "🔍 What is the brute-force bottleneck?",
  "⚖️ Compare time & space bounds",
  "🛡️ Check for tricky edge cases",
];

export function MangaShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [mode, setMode] = useState<MangaMode>("color");
  const [soundOn, setSoundOn] = useState(true);
  const [progressionOpen, setProgressionOpen] = useState(false);
  const [userXp, setUserXp] = useState(2450);

  // Ctrl+K Quick Manga Search
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");

  // Floating Summon Sensei Drawer
  const [senseiOpen, setSenseiOpen] = useState(false);
  const [senseiInput, setSenseiInput] = useState("");
  const [senseiBusy, setSenseiBusy] = useState(false);
  const [senseiExpr, setSenseiExpr] = useState<SenseiExpression>("idle");
  const [senseiMsgs, setSenseiMsgs] = useState<Array<{ role: "user" | "sensei"; text: string; sfx?: string }>>([
    {
      role: "sensei",
      sfx: "SUMMONED!",
      text: "Sensei Reiko online! Ask me anything about DP invariants, lock-free concurrency, System Design tradeoffs, or your active sprint.",
    },
  ]);

  useEffect(() => {
    setSoundOn(isSoundEnabled());
    const saved = localStorage.getItem("buckshot-manga-mode") as MangaMode | null;
    if (saved === "color" || saved === "ink" || saved === "midnight") {
      setMode(saved);
      applyMode(saved);
    } else {
      // Auto-detect OS dark mode
      if (typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches) {
        setMode("midnight");
        applyMode("midnight");
      }
    }

    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      } else if (e.key === "Escape") {
        setSearchOpen(false);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const applyMode = (next: MangaMode) => {
    document.documentElement.setAttribute("data-manga-mode", next);
    if (next === "midnight") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  const switchMode = (next: MangaMode) => {
    playSfx("click");
    setMode(next);
    applyMode(next);
    localStorage.setItem("buckshot-manga-mode", next);
  };

  const toggleDarkMode = () => {
    const next: MangaMode = mode === "midnight" ? "color" : "midnight";
    switchMode(next);
  };

  const handleSoundToggle = () => {
    const next = toggleSound();
    setSoundOn(next);
    if (next) playSfx("click");
  };

  const askSensei = async (messageText?: string) => {
    const text = (messageText ?? senseiInput).trim();
    if (!text || senseiBusy) return;
    if (!messageText) setSenseiInput("");
    setSenseiBusy(true);
    setSenseiExpr("thinking");
    setSenseiMsgs((prev) => [...prev, { role: "user", text }]);
    playSfx("click");

    try {
      const res = await fetch("/api/coach/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, currentPath: pathname }),
      });
      const json = await res.json();
      setSenseiExpr(json.expression || "idle");
      setSenseiMsgs((prev) => [
        ...prev,
        { role: "sensei", text: json.reply || "Keep pushing your proof!", sfx: json.sfx },
      ]);
      playSfx("unlock");
    } finally {
      setSenseiBusy(false);
    }
  };

  const searchItems = [
    ...NAV_TABS.map((t) => ({ title: t.label, sub: "Chapter Page", href: t.href, tag: "PAGE" })),
    ...SEED_PROBLEMS.map((p) => ({
      title: p.title,
      sub: `${p.volumeName} · PL ${p.rating} · ${p.topic}`,
      href: `/shell-break/${p.slug}`,
      tag: "SHELL BREAK",
    })),
    ...MANGA_VOLUMES.map((v) => ({
      title: `${v.code} — ${v.name}`,
      sub: v.subtitle,
      href: `/volumes#vol-${v.number}`,
      tag: "VOLUME",
    })),
  ].filter(
    (item) =>
      !query.trim() ||
      item.title.toLowerCase().includes(query.toLowerCase()) ||
      item.sub.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="min-h-screen flex flex-col bg-[var(--paper-bg)] text-[var(--ink)] transition-colors duration-200">
      {/* Top Manga Book Masthead */}
      <header className="sticky top-0 z-40 border-b-4 border-[var(--border-ink)] bg-[var(--header-bg)] backdrop-blur-md transition-colors">
        <div className="max-w-[1440px] mx-auto px-4 py-2.5 flex flex-wrap items-center justify-between gap-2.5">
          {/* Logo Stamp */}
          <Link href="/" onClick={() => playSfx("click")} className="flex items-center gap-2.5 group">
            <div className="relative bg-[#FF3358] text-white border-[3px] border-[var(--border-ink)] shadow-[4px_4px_0px_var(--shadow-ink)] px-3 py-1 -rotate-2 group-hover:rotate-0 transition-transform">
              <span className="font-manga text-2xl sm:text-3xl tracking-wider leading-none block">
                BUCKSHOT
              </span>
            </div>
            <div className="hidden 2xl:flex flex-col leading-tight">
              <span className="text-[11px] font-black tracking-widest uppercase text-[var(--ink)]">
                SHONEN AI INTERVIEW BOOK
              </span>
              <span className="text-[10px] font-bold uppercase text-[#FF3358]">
                VOL. 01–05 · FULL COLOR &amp; DARK MODE
              </span>
            </div>
          </Link>

          {/* Chapter Ribbon Tabs */}
          <nav className="flex items-center gap-1.5 flex-wrap">
            {NAV_TABS.map((tab) => {
              const Icon = tab.icon;
              const active = tab.href === "/" ? pathname === "/" : pathname.startsWith(tab.href);

              return (
                <Link
                  key={tab.href}
                  href={tab.href}
                  onClick={() => playSfx("click")}
                  style={{
                    backgroundColor: active ? tab.color : "var(--panel-bg)",
                    color: active ? "#121218" : "var(--ink)",
                  }}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] font-black tracking-wide uppercase border-2 border-[var(--border-ink)] transition-all ${
                    active
                      ? "shadow-[3px_3px_0px_var(--shadow-ink)] -translate-y-0.5"
                      : "hover:-translate-y-0.5 shadow-[2px_2px_0px_var(--shadow-ink)] hover:opacity-90"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 stroke-[2.6]" />
                  <span>{tab.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Right Utilities: Rank / XP Pill + Light/Dark Quick Toggle + Manga Theme Switcher + SFX Toggle + Search */}
          <div className="flex items-center gap-2">
            {/* Shonen Rank & Quests Pill */}
            <button
              onClick={() => {
                playSfx("click");
                setProgressionOpen(true);
              }}
              className="flex items-center gap-1.5 px-2.5 py-1.5 bg-[#121218] text-[#FFC82C] border-2 border-[var(--border-ink)] shadow-[2px_2px_0px_var(--shadow-ink)] text-[10px] font-black uppercase hover:bg-[#202132] transition-colors"
              title="View Shonen Exam Progression, Daily Quests & Grimoire of Defeats"
            >
              <span>⚡ JŌNIN</span>
              <span className="hidden md:inline font-mono text-white/80">· {userXp} XP</span>
            </button>

            {/* Direct Light/Dark Quick Toggle */}
            <button
              onClick={toggleDarkMode}
              className={`p-1.5 border-2 border-[var(--border-ink)] shadow-[2px_2px_0px_var(--shadow-ink)] text-xs font-black flex items-center gap-1 transition-all ${
                mode === "midnight"
                  ? "bg-[#7C4DFF] text-white"
                  : "bg-[#FFC82C] text-[#121218]"
              }`}
              title={mode === "midnight" ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {mode === "midnight" ? (
                <>
                  <Moon className="w-4 h-4 fill-current" />
                  <span className="hidden sm:inline text-[10px] font-black uppercase">DARK</span>
                </>
              ) : (
                <>
                  <Sun className="w-4 h-4 fill-current" />
                  <span className="hidden sm:inline text-[10px] font-black uppercase">LIGHT</span>
                </>
              )}
            </button>

            {/* SFX Mute/Unmute */}
            <button
              onClick={handleSoundToggle}
              className="p-1.5 border-2 border-[var(--border-ink)] bg-[var(--panel-bg)] shadow-[2px_2px_0px_var(--shadow-ink)] hover:bg-[#00C2FF]/20 transition-colors"
              title={soundOn ? "Mute Comic Audio SFX" : "Unmute Comic Audio SFX"}
            >
              {soundOn ? (
                <Volume2 className="w-4 h-4 text-[#00C2FF]" />
              ) : (
                <VolumeX className="w-4 h-4 text-[var(--ink-muted)]" />
              )}
            </button>

            {/* Cmd+K Search */}
            <button
              onClick={() => setSearchOpen(true)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 bg-[var(--panel-bg)] text-[var(--ink)] border-2 border-[var(--border-ink)] shadow-[2px_2px_0px_var(--shadow-ink)] text-[11px] font-black hover:bg-[#00C2FF]/25"
              title="Quick Manga Index (Ctrl+K)"
            >
              <Search className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">INDEX</span>
              <kbd className="bg-[var(--border-ink)] text-[var(--paper-bg)] px-1 text-[9px] font-mono">⌘K</kbd>
            </button>

            {/* 3-Way Manga Theme Switcher */}
            <div className="flex items-center border-2 border-[var(--border-ink)] bg-[var(--panel-bg)] shadow-[3px_3px_0px_var(--shadow-ink)] overflow-hidden">
              <button
                onClick={() => switchMode("color")}
                title="Full-Color Shonen Manga"
                className={`px-2 py-1 text-[11px] font-black flex items-center gap-1 transition-colors ${
                  mode === "color" ? "bg-[#FFC82C] text-[#121218]" : "text-[var(--ink)] hover:opacity-80"
                }`}
              >
                <Palette className="w-3.5 h-3.5" />
                <span className="hidden xl:inline">COLOR</span>
              </button>
              <button
                onClick={() => switchMode("ink")}
                title="Classic B&W Halftone Ink"
                className={`px-2 py-1 text-[11px] font-black flex items-center gap-1 border-x-2 border-[var(--border-ink)] transition-colors ${
                  mode === "ink" ? "bg-[#121218] text-white" : "text-[var(--ink)] hover:opacity-80"
                }`}
              >
                <Contrast className="w-3.5 h-3.5" />
                <span className="hidden xl:inline">B&amp;W</span>
              </button>
              <button
                onClick={() => switchMode("midnight")}
                title="Midnight Shonen Dark Mode"
                className={`px-2 py-1 text-[11px] font-black flex items-center gap-1 transition-colors ${
                  mode === "midnight" ? "bg-[#7C4DFF] text-white" : "text-[var(--ink)] hover:opacity-80"
                }`}
              >
                <Moon className="w-3.5 h-3.5" />
                <span className="hidden xl:inline">NIGHT</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Manga Book Spread Area */}
      <main className="flex-1 max-w-[1440px] w-full mx-auto px-4 py-6">{children}</main>

      {/* Printed Manga Tankobon Footer */}
      <footer className="border-t-4 border-[var(--border-ink)] bg-[var(--panel-bg)] text-[var(--ink)] mt-10 transition-colors">
        <div className="max-w-[1440px] mx-auto px-4 py-4 flex flex-wrap items-center justify-between gap-3 text-xs font-bold">
          <div className="flex items-center gap-2">
            <span className="font-manga text-lg bg-[#FF3358] text-white px-2 py-0.5 tracking-wider">
              BUCKSHOT
            </span>
            <span>LOAD THE LOGIC. FIRE THE PROOF.</span>
          </div>
          <div className="flex items-center gap-4 uppercase text-[11px] text-[var(--ink-muted)]">
            <span>FULL COLOR &amp; MIDNIGHT DARK MODE READY</span>
            <span className="bg-[#00C2FF]/20 border border-[var(--border-ink)] px-2 py-0.5 text-[var(--ink)]">
              10 ARENAS · 5 VOLUMES
            </span>
          </div>
        </div>
      </footer>

      {/* CTRL+K QUICK MANGA INDEX MODAL */}
      {searchOpen && (
        <div
          className="fixed inset-0 z-50 bg-[#121218]/80 backdrop-blur-sm flex items-start justify-center pt-20 p-4"
          onClick={() => setSearchOpen(false)}
        >
          <div
            className="manga-panel w-full max-w-xl bg-[var(--panel-bg)] text-[var(--ink)] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-[#FFC82C] text-[#121218] px-4 py-2.5 border-b-[3px] border-[var(--border-ink)] flex items-center justify-between">
              <span className="font-manga text-2xl tracking-wider">MANGA BOOK QUICK INDEX</span>
              <button onClick={() => setSearchOpen(false)}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-3 border-b-2 border-[var(--border-ink)]">
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Jump to problem, Volume, Ring Buffer, KV Cache, Raft, Guessr..."
                className="w-full bg-[var(--input-bg)] text-[var(--ink)] border-2 border-[var(--border-ink)] px-3 py-2 text-sm font-bold focus:outline-none"
              />
            </div>
            <div className="max-h-80 overflow-y-auto divide-y-2 divide-[var(--border-ink)]/15">
              {searchItems.slice(0, 12).map((item) => (
                <button
                  key={`${item.tag}-${item.href}`}
                  onClick={() => {
                    setSearchOpen(false);
                    setQuery("");
                    router.push(item.href);
                  }}
                  className="w-full text-left px-4 py-2.5 hover:bg-[#00C2FF]/20 flex items-center justify-between gap-2 transition-colors"
                >
                  <div>
                    <div className="text-sm font-black">{item.title}</div>
                    <div className="text-[11px] font-bold text-[var(--ink-muted)]">{item.sub}</div>
                  </div>
                  <span className="bg-[#FF3358] text-white text-[10px] font-black px-2 py-0.5 shrink-0">
                    {item.tag}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* FLOATING SUMMON SENSEI REIKO BUTTON + DRAWER */}
      <div className="fixed bottom-5 right-5 z-40">
        {!senseiOpen ? (
          <button
            onClick={() => {
              playSfx("click");
              setSenseiOpen(true);
            }}
            className="group flex items-center gap-2.5 bg-[#FF3358] text-white border-[3px] border-[var(--border-ink)] shadow-[5px_5px_0px_var(--shadow-ink)] px-3.5 py-2 hover:-translate-y-1 transition-transform"
          >
            <img
              src="/art/sensei-idle.jpg"
              alt="Summon Sensei Reiko"
              className="w-9 h-9 rounded-full object-cover border-2 border-[var(--border-ink)] manga-unlocked-pop"
            />
            <div className="text-left leading-tight">
              <div className="font-manga text-lg tracking-wider">ASK SENSEI REIKO</div>
              <div className="text-[9px] font-black uppercase text-[#FFC82C] flex items-center gap-1">
                <MessageCircle className="w-2.5 h-2.5" /> DOSSIER-AWARE COACH
              </div>
            </div>
          </button>
        ) : (
          <div className="manga-panel w-[340px] sm:w-[410px] bg-[var(--panel-bg)] text-[var(--ink)] overflow-hidden flex flex-col max-h-[560px]">
            <div className="bg-[#FFC82C] text-[#121218] px-3.5 py-2.5 border-b-[3px] border-[var(--border-ink)] flex items-center justify-between speed-lines">
              <div className="flex items-center gap-2.5">
                <SenseiAvatar expression={senseiExpr} size="sm" />
                <div>
                  <div className="font-manga text-xl leading-none">SENSEI REIKO</div>
                  <div className="text-[10px] font-black uppercase">INSTANT MENTOR LINK</div>
                </div>
              </div>
              <button
                onClick={() => setSenseiOpen(false)}
                className="bg-[var(--border-ink)] text-white p-1 hover:opacity-80"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Ask Suggestion Chips */}
            <div className="p-2 bg-[var(--subpanel-bg)] border-b border-[var(--border-ink)]/20 flex flex-wrap gap-1">
              {QUICK_PROMPTS.map((qp) => (
                <button
                  key={qp}
                  onClick={() => askSensei(qp.replace(/^[^a-zA-Z]+/, ""))}
                  className="text-[10px] font-black bg-[var(--card-bg)] text-[var(--ink)] border border-[var(--border-ink)] px-2 py-0.5 hover:bg-[#00C2FF]/20 transition-colors"
                >
                  {qp}
                </button>
              ))}
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-2.5 bg-[var(--subpanel-bg)] halftone-dots min-h-[220px]">
              {senseiMsgs.map((m, i) => (
                <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[88%] border-2 border-[var(--border-ink)] p-2.5 text-xs font-bold leading-snug ${
                      m.role === "user"
                        ? "bg-[#00C2FF] text-[#121218] shadow-[2px_2px_0px_var(--shadow-ink)]"
                        : "bg-[var(--card-bg)] text-[var(--ink)] shadow-[3px_3px_0px_#FF3358]"
                    }`}
                  >
                    {m.sfx && (
                      <span className="inline-block mb-1 bg-[#FF3358] text-white font-manga text-xs px-1.5">
                        {m.sfx}
                      </span>
                    )}
                    <div className="whitespace-pre-line">{m.text}</div>
                  </div>
                </div>
              ))}
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                askSensei();
              }}
              className="p-2.5 bg-[var(--card-bg)] border-t-[3px] border-[var(--border-ink)] flex gap-1.5"
            >
              <input
                value={senseiInput}
                onChange={(e) => setSenseiInput(e.target.value)}
                placeholder="Ask about DP, Kafka, Rust, KV Cache..."
                className="flex-1 border-2 border-[var(--border-ink)] bg-[var(--input-bg)] text-[var(--ink)] px-2.5 py-1.5 text-xs font-bold focus:outline-none"
              />
              <button
                type="submit"
                disabled={senseiBusy || !senseiInput.trim()}
                className="manga-btn bg-[#FF3358] text-white px-3 py-1.5 text-xs disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        )}

        {/* Global Shonen Progression & Quests Modal */}
        <ProgressionModal
          open={progressionOpen}
          onClose={() => setProgressionOpen(false)}
        />
      </div>
    </div>
  );
}
