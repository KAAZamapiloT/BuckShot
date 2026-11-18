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
  Search,
  Trophy,
  X,
  Send,
  MessageCircle,
} from "lucide-react";
import { SEED_PROBLEMS, MANGA_VOLUMES } from "@/lib/seed-data";
import { SenseiAvatar, type SenseiExpression } from "@/components/SenseiAvatar";

type MangaMode = "color" | "ink" | "midnight";

const NAV_TABS = [
  { href: "/", label: "COVER", icon: BookOpen, color: "#FFC82C" },
  { href: "/chamber", label: "CHAMBER", icon: Flame, color: "#FF3358" },
  { href: "/shell-break", label: "SHELL BREAK", icon: Crosshair, color: "#00C2FF" },
  { href: "/blueprint", label: "BLUEPRINT", icon: Layers, color: "#00C875" },
  { href: "/guessr", label: "GUESSR", icon: Trophy, color: "#FFC82C" },
  { href: "/volumes", label: "VOLUMES", icon: Sparkles, color: "#7C4DFF" },
  { href: "/dossier", label: "DOSSIER", icon: ScrollText, color: "#FF6FAE" },
];

export function MangaShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [mode, setMode] = useState<MangaMode>("color");

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
    const saved = localStorage.getItem("buckshot-manga-mode") as MangaMode | null;
    if (saved === "color" || saved === "ink" || saved === "midnight") {
      setMode(saved);
      document.documentElement.setAttribute("data-manga-mode", saved);
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

  const switchMode = (next: MangaMode) => {
    setMode(next);
    document.documentElement.setAttribute("data-manga-mode", next);
    localStorage.setItem("buckshot-manga-mode", next);
  };

  const askSensei = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = senseiInput.trim();
    if (!text || senseiBusy) return;
    setSenseiInput("");
    setSenseiBusy(true);
    setSenseiExpr("thinking");
    setSenseiMsgs((prev) => [...prev, { role: "user", text }]);

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
    <div className="min-h-screen flex flex-col">
      {/* Top Manga Book Masthead */}
      <header className="sticky top-0 z-40 border-b-4 border-[#121218] bg-[#FAF4E6]/95 backdrop-blur-sm">
        <div className="max-w-[1440px] mx-auto px-4 py-2.5 flex flex-wrap items-center justify-between gap-2.5">
          {/* Logo Stamp */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="relative bg-[#FF3358] text-white border-[3px] border-[#121218] shadow-[4px_4px_0px_#121218] px-3 py-1 -rotate-2 group-hover:rotate-0 transition-transform">
              <span className="font-manga text-2xl sm:text-3xl tracking-wider leading-none block">
                BUCKSHOT
              </span>
            </div>
            <div className="hidden 2xl:flex flex-col leading-tight">
              <span className="text-[11px] font-black tracking-widest uppercase text-[#121218]">
                SHONEN AI INTERVIEW BOOK
              </span>
              <span className="text-[10px] font-bold uppercase text-[#FF3358]">
                VOL. 01–05 · FULL COLOR EDITION
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
                  style={{
                    backgroundColor: active ? tab.color : "#FFFDF7",
                    color: "#121218",
                  }}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] font-black tracking-wide uppercase border-2 border-[#121218] transition-all ${
                    active
                      ? "shadow-[3px_3px_0px_#121218] -translate-y-0.5"
                      : "hover:bg-[#FFC82C]/40 hover:-translate-y-0.5 shadow-[2px_2px_0px_#121218]"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 stroke-[2.6]" />
                  <span>{tab.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Right Utilities: Cmd+K Search + Manga Coloring Mode Switcher */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSearchOpen(true)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 bg-[#FFFDF7] text-[#121218] border-2 border-[#121218] shadow-[2px_2px_0px_#121218] text-[11px] font-black hover:bg-[#00C2FF]/25"
              title="Quick Manga Index (Ctrl+K)"
            >
              <Search className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">INDEX</span>
              <kbd className="bg-[#121218] text-[#FFC82C] px-1 text-[9px] font-mono">⌘K</kbd>
            </button>

            <div className="flex items-center border-2 border-[#121218] bg-[#FFFDF7] shadow-[3px_3px_0px_#121218] overflow-hidden">
              <button
                onClick={() => switchMode("color")}
                title="Full-Color Manga Spread"
                className={`px-2 py-1.5 text-[11px] font-black flex items-center gap-1 transition-colors ${
                  mode === "color" ? "bg-[#FFC82C] text-[#121218]" : "text-[#121218] hover:bg-black/5"
                }`}
              >
                <Palette className="w-3.5 h-3.5" />
                <span className="hidden xl:inline">COLOR</span>
              </button>
              <button
                onClick={() => switchMode("ink")}
                title="Classic B&W Ink (Mastered panels glow in color!)"
                className={`px-2 py-1.5 text-[11px] font-black flex items-center gap-1 border-x-2 border-[#121218] transition-colors ${
                  mode === "ink" ? "bg-[#121218] text-white" : "text-[#121218] hover:bg-black/5"
                }`}
              >
                <Contrast className="w-3.5 h-3.5" />
                <span className="hidden xl:inline">B&amp;W</span>
              </button>
              <button
                onClick={() => switchMode("midnight")}
                title="Midnight Shonen Neon Ink"
                className={`px-2 py-1.5 text-[11px] font-black flex items-center gap-1 transition-colors ${
                  mode === "midnight" ? "bg-[#7C4DFF] text-white" : "text-[#121218] hover:bg-black/5"
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
      <footer className="border-t-4 border-[#121218] bg-[#FFFDF7] text-[#121218] mt-10">
        <div className="max-w-[1440px] mx-auto px-4 py-4 flex flex-wrap items-center justify-between gap-3 text-xs font-bold">
          <div className="flex items-center gap-2">
            <span className="font-manga text-lg bg-[#121218] text-[#FFC82C] px-2 py-0.5 tracking-wider">
              BUCKSHOT
            </span>
            <span>LOAD THE LOGIC. FIRE THE PROOF.</span>
          </div>
          <div className="flex items-center gap-4 uppercase text-[11px] text-[#4A4A5A]">
            <span>NEXT.JS 15 · PRISMA SQLITE · MULTI-PROVIDER AI SDK</span>
            <span className="bg-[#00C2FF]/20 border border-[#121218] px-2 py-0.5 text-[#121218]">
              10 ARENAS · 5 VOLUMES
            </span>
          </div>
        </div>
      </footer>

      {/* CTRL+K QUICK MANGA INDEX MODAL */}
      {searchOpen && (
        <div
          className="fixed inset-0 z-50 bg-[#121218]/75 backdrop-blur-xs flex items-start justify-center pt-20 p-4"
          onClick={() => setSearchOpen(false)}
        >
          <div
            className="manga-panel w-full max-w-xl bg-[#FFFDF7] text-[#121218] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-[#FFC82C] px-4 py-2.5 border-b-[3px] border-[#121218] flex items-center justify-between">
              <span className="font-manga text-2xl tracking-wider">MANGA BOOK QUICK INDEX</span>
              <button onClick={() => setSearchOpen(false)}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-3 border-b-2 border-[#121218]">
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Jump to problem, Volume, Ring Buffer, KV Cache, Raft, Guessr..."
                className="w-full bg-[#FAF4E6] border-2 border-[#121218] px-3 py-2 text-sm font-bold focus:outline-none"
              />
            </div>
            <div className="max-h-80 overflow-y-auto divide-y-2 divide-[#121218]/15">
              {searchItems.slice(0, 12).map((item) => (
                <button
                  key={`${item.tag}-${item.href}`}
                  onClick={() => {
                    setSearchOpen(false);
                    setQuery("");
                    router.push(item.href);
                  }}
                  className="w-full text-left px-4 py-2.5 hover:bg-[#00C2FF]/20 flex items-center justify-between gap-2"
                >
                  <div>
                    <div className="text-sm font-black">{item.title}</div>
                    <div className="text-[11px] font-bold text-[#4A4A5A]">{item.sub}</div>
                  </div>
                  <span className="bg-[#121218] text-[#FFC82C] text-[10px] font-black px-2 py-0.5 shrink-0">
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
            onClick={() => setSenseiOpen(true)}
            className="group flex items-center gap-2.5 bg-[#FF3358] text-white border-[3px] border-[#121218] shadow-[5px_5px_0px_#121218] px-3.5 py-2 hover:-translate-y-1 transition-transform"
          >
            <img
              src="/art/sensei-idle.jpg"
              alt="Summon Sensei Reiko"
              className="w-9 h-9 rounded-full object-cover border-2 border-[#121218] manga-unlocked-pop"
            />
            <div className="text-left leading-tight">
              <div className="font-manga text-lg tracking-wider">ASK SENSEI REIKO</div>
              <div className="text-[9px] font-black uppercase text-[#FFC82C] flex items-center gap-1">
                <MessageCircle className="w-2.5 h-2.5" /> DOSSIER-AWARE COACH
              </div>
            </div>
          </button>
        ) : (
          <div className="manga-panel w-[340px] sm:w-[390px] bg-[#FFFDF7] text-[#121218] overflow-hidden flex flex-col max-h-[520px]">
            <div className="bg-[#FFC82C] px-3.5 py-2.5 border-b-[3px] border-[#121218] flex items-center justify-between speed-lines">
              <div className="flex items-center gap-2.5">
                <SenseiAvatar expression={senseiExpr} size="sm" />
                <div>
                  <div className="font-manga text-xl leading-none">SENSEI REIKO</div>
                  <div className="text-[10px] font-black uppercase">INSTANT MENTOR LINK</div>
                </div>
              </div>
              <button
                onClick={() => setSenseiOpen(false)}
                className="bg-[#121218] text-white p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-2.5 bg-[#FAF4E6] halftone-dots min-h-[220px]">
              {senseiMsgs.map((m, i) => (
                <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[88%] border-2 border-[#121218] p-2.5 text-xs font-bold leading-snug ${
                      m.role === "user"
                        ? "bg-[#00C2FF] shadow-[2px_2px_0px_#121218]"
                        : "bg-white shadow-[3px_3px_0px_#FF3358]"
                    }`}
                  >
                    {m.sfx && (
                      <span className="inline-block mb-1 bg-[#FF3358] text-white font-manga text-xs px-1.5">
                        {m.sfx}
                      </span>
                    )}
                    <div>{m.text}</div>
                  </div>
                </div>
              ))}
            </div>

            <form
              onSubmit={askSensei}
              className="p-2.5 bg-[#FFFDF7] border-t-[3px] border-[#121218] flex gap-1.5"
            >
              <input
                value={senseiInput}
                onChange={(e) => setSenseiInput(e.target.value)}
                placeholder="Ask about DP, Kafka, Rust, KV Cache..."
                className="flex-1 border-2 border-[#121218] bg-[#FAF4E6] px-2.5 py-1.5 text-xs font-bold focus:outline-none"
              />
              <button
                type="submit"
                disabled={senseiBusy || !senseiInput.trim()}
                className="manga-btn bg-[#FF3358] text-white px-3 py-1.5 text-xs"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
