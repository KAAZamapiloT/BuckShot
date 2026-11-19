"use client";

import React, { useCallback, useEffect, useState } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  addEdge,
  useNodesState,
  useEdgesState,
  type Connection,
  type Edge,
  type Node,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { Check, X, Mic, MicOff, Send, Layers, Award, Plus, Sparkles } from "lucide-react";
import { SenseiAvatar, type SenseiExpression } from "@/components/SenseiAvatar";
import { playSfx } from "@/lib/sound";
import type { BlueprintProposal } from "@/lib/ai";

interface Rubric {
  keyIdeas?: number;
  conceptChecks?: number;
  architecture?: number;
  communication?: number;
  summary?: string;
}

export default function BlueprintPage() {
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [scenarioTitle, setScenarioTitle] = useState("Distributed Real-Time Manga Streaming & Feed");
  const [messages, setMessages] = useState<Array<{ role: string; text: string; expression?: SenseiExpression }>>([]);
  const [proposals, setProposals] = useState<BlueprintProposal[]>([]);
  const [rubric, setRubric] = useState<Rubric>({});
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [listening, setListening] = useState(false);

  useEffect(() => {
    fetch("/api/coach/blueprint")
      .then((r) => r.json())
      .then((d) => {
        if (d.scenarioTitle) setScenarioTitle(d.scenarioTitle);
        setNodes(d.nodes || []);
        setEdges(d.edges || []);
        setMessages(d.messages || []);
        setRubric(d.rubric || {});
      });
  }, [setNodes, setEdges]);

  const persistBoard = async (nextNodes: Node[], nextEdges: Edge[]) => {
    await fetch("/api/coach/blueprint", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "save-board", nodes: nextNodes, edges: nextEdges }),
    });
  };

  const onConnect = useCallback(
    (params: Connection) => {
      playSfx("click");
      setEdges((eds) => {
        const next = addEdge({ ...params, animated: true, style: { stroke: "#00C2FF", strokeWidth: 3 } }, eds);
        persistBoard(nodes, next);
        return next;
      });
    },
    [nodes, setEdges]
  );

  const sendArchitecture = async (override?: string) => {
    const text = (override ?? input).trim();
    if (!text || sending) return;
    setSending(true);
    if (!override) setInput("");
    playSfx("click");

    try {
      const res = await fetch("/api/coach/blueprint", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, nodes, edges }),
      });
      const json = await res.json();
      if (json.messages) setMessages(json.messages);
      if (json.proposals && json.proposals.length > 0) {
        playSfx("unlock");
        setProposals((prev) => [...prev, ...json.proposals]);
      }
      if (json.rubric) setRubric(json.rubric);
    } finally {
      setSending(false);
    }
  };

  const addCustomNode = (label: string, color: string = "#FFC82C") => {
    playSfx("stamp");
    const id = `node-${Date.now()}`;
    const newNode: Node = {
      id,
      type: "default",
      position: { x: 180 + (nodes.length % 3) * 220, y: 180 + Math.floor(nodes.length / 3) * 90 },
      data: { label },
      style: {
        background: color,
        border: "3px solid #121218",
        boxShadow: "4px 4px 0px #121218",
        fontWeight: 800,
        borderRadius: 8,
        color: "#121218",
      },
    };
    const nextNodes = [...nodes, newNode];
    setNodes(nextNodes);
    persistBoard(nextNodes, edges);
  };

  const approveProposal = (prop: BlueprintProposal) => {
    playSfx("stamp");
    const newNode: Node = {
      id: prop.id,
      type: "default",
      position: { x: 240 + (nodes.length % 3) * 230, y: 270 + Math.floor(nodes.length / 4) * 90 },
      data: { label: prop.label },
      style: {
        background: prop.color,
        border: "3px solid #121218",
        boxShadow: "4px 4px 0 #121218",
        fontWeight: 800,
        borderRadius: 8,
        color: "#121218",
      },
    };
    const newEdge: Edge = {
      id: `e-${prop.connectFrom}-${prop.id}`,
      source: nodes.some((n) => n.id === prop.connectFrom) ? prop.connectFrom : nodes[0]?.id || "service",
      target: prop.id,
      label: prop.edgeLabel,
      animated: true,
      style: { stroke: "#FF3358", strokeWidth: 3 },
    };
    const nextNodes = [...nodes, newNode];
    const nextEdges = [...edges, newEdge];
    setNodes(nextNodes);
    setEdges(nextEdges);
    setProposals((prev) => prev.filter((p) => p.id !== prop.id));
    persistBoard(nextNodes, nextEdges);
  };

  const rejectProposal = (id: string) => {
    playSfx("click");
    setProposals((prev) => prev.filter((p) => p.id !== id));
  };

  const toggleVoice = () => {
    const SpeechRec =
      (window as unknown as { SpeechRecognition?: new () => unknown; webkitSpeechRecognition?: new () => unknown })
        .SpeechRecognition ||
      (window as unknown as { webkitSpeechRecognition?: new () => unknown }).webkitSpeechRecognition;

    if (!SpeechRec) {
      alert("Your browser does not expose Web Speech Recognition. Type your architecture pitch below!");
      return;
    }

    if (listening) {
      setListening(false);
      return;
    }

    const rec = new (SpeechRec as new () => {
      lang: string;
      onresult: (e: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void;
      onend: () => void;
      start: () => void;
    })();
    rec.lang = "en-US";
    setListening(true);
    playSfx("click");
    rec.onresult = (e) => {
      const transcript = e.results[0][0].transcript;
      setInput(transcript);
      setListening(false);
      playSfx("guess");
    };
    rec.onend = () => setListening(false);
    rec.start();
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="manga-panel p-5 bg-[#00C875] text-[#121218] speed-lines flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="bg-[#121218] text-white text-[10px] font-black px-2 py-0.5 uppercase border border-white/20">
            VOL. 04 BLUEPRINT · VOICE-TO-BOARD + HUMAN APPROVAL FLOW
          </span>
          <h1 className="font-manga text-4xl sm:text-5xl tracking-wider mt-1 flex items-center gap-2">
            <Layers className="w-8 h-8" />
            {scenarioTitle}
          </h1>
        </div>
        <div className="flex flex-wrap gap-2">
          {[
            "Add Redis cache for hot chapters",
            "Introduce Kafka queue for write spikes",
            "Serve manga spreads via Edge CDN",
          ].map((quick) => (
            <button
              key={quick}
              onClick={() => sendArchitecture(quick)}
              className="manga-btn bg-[var(--card-bg)] text-[var(--ink)] px-3 py-1.5 text-[11px]"
            >
              + {quick}
            </button>
          ))}
        </div>
      </div>

      {/* Interactive Board + Sensei Proposal Queue */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
        {/* React Flow Whiteboard Canvas */}
        <div className="xl:col-span-8 space-y-4">
          <div className="manga-panel h-[480px] bg-[var(--subpanel-bg)] overflow-hidden relative border-[3px] border-[var(--border-ink)]">
            <div className="absolute top-3 left-3 z-10 bg-[#121218] text-[#FFC82C] font-manga text-base px-3 py-0.5 tracking-wider border border-[var(--border-ink)] flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#00C2FF]" />
              TACTICAL ARCHITECTURE SPREAD (DRAG &amp; CONNECT NODES)
            </div>

            {/* Quick Component Dropper Toolbar */}
            <div className="absolute bottom-3 left-3 z-10 flex flex-wrap gap-1.5">
              <button
                onClick={() => addCustomNode("⚡ Redis Cache", "#FFC82C")}
                className="manga-btn bg-[#FFC82C] text-[#121218] px-2.5 py-1 text-[10px] flex items-center gap-1"
              >
                <Plus className="w-3 h-3" /> CACHE
              </button>
              <button
                onClick={() => addCustomNode("📨 Kafka Topic", "#7C4DFF")}
                className="manga-btn bg-[#7C4DFF] text-white px-2.5 py-1 text-[10px] flex items-center gap-1"
              >
                <Plus className="w-3 h-3" /> QUEUE
              </button>
              <button
                onClick={() => addCustomNode("🗄️ Sharded Postgres", "#00C2FF")}
                className="manga-btn bg-[#00C2FF] text-[#121218] px-2.5 py-1 text-[10px] flex items-center gap-1"
              >
                <Plus className="w-3 h-3" /> DB REPLICA
              </button>
              <button
                onClick={() => addCustomNode("🌐 Edge CDN", "#00C875")}
                className="manga-btn bg-[#00C875] text-[#121218] px-2.5 py-1 text-[10px] flex items-center gap-1"
              >
                <Plus className="w-3 h-3" /> CDN
              </button>
            </div>

            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              fitView
            >
              <Background gap={18} size={1.5} color="var(--border-ink, #121218)" />
              <Controls />
            </ReactFlow>
          </div>

          {/* Human-in-the-Loop Ghost Proposals */}
          {proposals.length > 0 && (
            <div className="manga-panel p-4 bg-[var(--card-bg)] text-[var(--ink)] border-[3px] border-[#00C2FF] space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-manga text-2xl text-[#FF3358] tracking-wider">
                  SENSEI PROPOSED SKETCHES — AWAITING YOUR STAMP!!
                </span>
                <span className="text-[10px] font-black uppercase bg-[#00C2FF] text-[#121218] px-2 py-0.5 border border-[#121218]">
                  HUMAN APPROVAL REQUIRED
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {proposals.map((prop) => (
                  <div
                    key={prop.id}
                    className="border-[3px] border-dashed border-[#00C2FF] bg-[var(--subpanel-bg)] p-3 flex flex-col justify-between gap-2.5"
                  >
                    <div>
                      <div className="font-black text-sm text-[var(--ink)]">{prop.label}</div>
                      <p className="text-xs font-medium text-[var(--ink-secondary)] mt-1">{prop.rationale}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => approveProposal(prop)}
                        className="manga-btn bg-[#00C875] text-[#121218] px-3 py-1 text-xs flex items-center gap-1 flex-1 justify-center"
                      >
                        <Check className="w-4 h-4" /> APPROVE TO BOARD
                      </button>
                      <button
                        onClick={() => rejectProposal(prop.id)}
                        className="manga-btn bg-[#FF3358] text-white px-3 py-1 text-xs flex items-center gap-1"
                      >
                        <X className="w-4 h-4" /> REJECT
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 4-Pillar Mock Interview Rubric */}
          <div className="manga-panel p-5 bg-[var(--card-bg)] text-[var(--ink)] space-y-3">
            <div className="flex items-center justify-between border-b-[3px] border-[var(--border-ink)] pb-2">
              <h2 className="font-manga text-2xl tracking-wide flex items-center gap-2">
                <Award className="w-6 h-6 text-[#FF3358]" />
                4-PILLAR MOCK INTERVIEW RUBRIC
              </h2>
              <span className="text-[11px] font-black uppercase text-[var(--ink-muted)]">LIVE EVALUATION</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: "KEY IDEAS", val: rubric.keyIdeas ?? 68, color: "#FF3358" },
                { label: "CONCEPT CHECKS", val: rubric.conceptChecks ?? 64, color: "#00C2FF" },
                { label: "ARCHITECTURE", val: rubric.architecture ?? 70, color: "#00C875" },
                { label: "COMMUNICATION", val: rubric.communication ?? 72, color: "#FFC82C" },
              ].map((p) => (
                <div
                  key={p.label}
                  className="border-2 border-[var(--border-ink)] bg-[var(--subpanel-bg)] p-3 shadow-[3px_3px_0px_var(--shadow-ink)]"
                >
                  <div className="text-[10px] font-black text-[var(--ink-muted)]">{p.label}</div>
                  <div className="font-manga text-3xl mt-0.5" style={{ color: p.color }}>
                    {p.val} / 100
                  </div>
                </div>
              ))}
            </div>
            {rubric.summary && (
              <p className="text-xs font-bold bg-[#FFC82C]/25 border-2 border-[var(--border-ink)] p-2.5 text-[var(--ink)]">
                Sensei Critique: {rubric.summary}
              </p>
            )}
          </div>
        </div>

        {/* Voice & Text Sensei Panel */}
        <div className="xl:col-span-4 manga-panel bg-[var(--card-bg)] text-[var(--ink)] flex flex-col overflow-hidden h-[700px] border-[3px] border-[var(--border-ink)]">
          <div className="bg-[#FFC82C] text-[#121218] px-4 py-3 border-b-[3px] border-[var(--border-ink)] flex items-center gap-3 speed-lines">
            <SenseiAvatar expression={sending ? "thinking" : "idle"} sfx="SKETCH!" size="sm" />
            <div>
              <div className="font-manga text-2xl leading-none">VOICE-TO-BOARD COACH</div>
              <div className="text-[11px] font-black">Speak or type tradeoffs to propose nodes</div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[var(--subpanel-bg)] halftone-dots">
            {messages.map((m, idx) => (
              <div key={idx} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[90%] border-2 border-[var(--border-ink)] p-3 text-xs font-bold leading-snug ${
                    m.role === "user"
                      ? "bg-[#00C2FF] text-[#121218] shadow-[3px_3px_0px_var(--shadow-ink)]"
                      : "bg-[var(--card-bg)] text-[var(--ink)] shadow-[3px_3px_0px_#FF3358]"
                  }`}
                >
                  <div className="text-[10px] font-black uppercase opacity-75 mb-1">
                    {m.role === "user" ? "YOU (ARCHITECT)" : "SENSEI REIKO"}
                  </div>
                  {m.text}
                </div>
              </div>
            ))}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              sendArchitecture();
            }}
            className="p-3 border-t-[3px] border-[var(--border-ink)] bg-[var(--card-bg)] flex gap-2"
          >
            <button
              type="button"
              onClick={toggleVoice}
              title="Voice Input (Web Speech API)"
              className={`manga-btn px-2.5 py-2 ${
                listening ? "bg-[#FF3358] text-white animate-pulse" : "bg-[#FFC82C] text-[#121218]"
              }`}
            >
              {listening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Explain caching, Kafka, CDN, replicas..."
              className="flex-1 border-2 border-[var(--border-ink)] bg-[var(--input-bg)] text-[var(--ink)] px-2.5 py-1.5 text-xs font-bold focus:outline-none"
            />
            <button
              type="submit"
              disabled={sending || !input.trim()}
              className="manga-btn bg-[#00C875] text-[#121218] px-4 py-2 text-xs"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
