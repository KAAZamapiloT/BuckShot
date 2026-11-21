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
  Menu,
  Search,
  Trophy,
  X,
  Send,
  MessageCircle,

  GitBranch,
  Building2,
} from "lucide-react";
import { SEED_PROBLEMS, MANGA_VOLUMES } from "@/lib/seed-data";
import { SenseiAvatar, type SenseiExpression } from "@/components/SenseiAvatar";
import { ProgressionModal } from "@/components/ProgressionModal";
import { isSoundEnabled, toggleSound, playSfx } from "@/lib/sound";

type MangaMode = "color" | "ink" | "midnight";

const NAV_TABS = [
  { href: "/", label: "COVER", icon: BookOpen, description: "Your next challenge" },
  { href: "/chamber", label: "CHAMBER", icon: Flame, description: "Plan a practice session" },
  { href: "/shell-break", label: "SHELL BREAK", icon: Crosshair, description: "Solve a challenge" },
  { href: "/tree", label: "JUTSU TREE", icon: GitBranch, description: "Explore related skills" },
  { href: "/intel", label: "INTEL", icon: Building2, description: "Research target companies" },
  { href: "/blueprint", label: "BLUEPRINT", icon: Layers, description: "Sketch a system design" },
  { href: "/guessr", label: "GUESSR", icon: Trophy, description: "Guess a problem rating" },
  { href: "/volumes", label: "VOLUMES", icon: Sparkles, description: "Browse the curriculum" },
  { href: "/dossier", label: "DOSSIER", icon: ScrollText, description: "Review your training profile" },
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
        document.getElementById("chapter-menu")?.hidePopover();
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
    ...NAV_TABS.map((t) => ({ title: t.label, sub: t.description, href: t.href, tag: "PAGE" })),
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
      <header className="sticky top-0 z-40 border-b border-[var(--border-muted)] bg-[var(--header-bg)] backdrop-blur-md">
        <nav aria-label="Main navigation" className="mx-auto flex h-14 max-w-[1440px] items-center gap-1 px-3 sm:h-16 sm:gap-5 sm:px-6">
          <Link href="/" className="mr-auto font-manga text-2xl italic tracking-wide sm:text-3xl">BUCKSHOT</Link>
          <Link href="/shell-break" aria-current={pathname.startsWith("/shell-break") ? "page" : undefined}
            className="px-1 py-3 text-sm font-semibold hover:underline aria-[current=page]:underline">Practice</Link>
          <button onClick={() => setProgressionOpen(true)} className="px-1 py-3 text-sm font-semibold hover:underline">Progress</button>
          <button aria-label="Search chapters and challenges" onClick={() => setSearchOpen(true)}
            className="inline-flex min-h-11 min-w-9 items-center justify-center gap-2 text-sm hover:opacity-70">
            <Search size={17} /><span className="hidden sm:inline">Search</span>
          </button>
          <button popoverTarget="chapter-menu" aria-label="Chapters and settings"
            className="inline-flex min-h-11 min-w-9 items-center justify-center gap-2 text-sm hover:opacity-70">
            <Menu size={20} /><span className="hidden sm:inline">Menu</span>
          </button>
          <div id="chapter-menu" popover="auto" aria-label="Chapters and settings"
            className="fixed inset-auto right-2 top-14 m-0 max-h-[75dvh] w-80 max-w-[95vw] overflow-y-auto rounded-lg border border-[var(--border-muted)] bg-[var(--panel-bg)] p-3 text-[var(--ink)] shadow-xl sm:right-[max(1.5rem,calc((100vw-1392px)/2))] sm:top-16">
            {NAV_TABS.map(({href, label, icon: Icon, description}) => (
              <Link key={href} href={href} aria-current={(href === "/" ? pathname === href : pathname.startsWith(href)) ? "page" : undefined}
                onClick={() => document.getElementById("chapter-menu")?.hidePopover()}
                className="flex items-center gap-3 rounded px-2 py-2 hover:bg-[var(--subpanel-bg)] aria-[current=page]:bg-[var(--subpanel-bg)]">
                <Icon size={16} /><span><span className="block text-sm font-bold capitalize">{label.toLowerCase()}</span>
                <span className="text-xs text-[var(--ink-muted)]">{description}</span></span>
              </Link>
            ))}
            <div className="mt-2 flex items-center justify-between gap-2 border-t border-[var(--border-muted)] px-2 pt-3 text-sm">
              <label>Theme <select value={mode} onChange={(e) => switchMode(e.target.value as MangaMode)} className="bg-[var(--panel-bg)] p-1">
                <option value="color">Color</option><option value="ink">Ink</option><option value="midnight">Midnight</option>
              </select></label>
              <button aria-pressed={soundOn} onClick={handleSoundToggle}>Sound {soundOn ? "on" : "off"}</button>
            </div>
          </div>
        </nav>
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
            <div className="hidden sm:block text-left leading-tight">
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
