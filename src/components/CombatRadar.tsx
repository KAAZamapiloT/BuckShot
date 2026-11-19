"use client";

import React from "react";

interface CombatRadarProps {
  ratings: Record<string, number>;
}

function gradeFor(val: number): string {
  if (val >= 2100) return "SS";
  if (val >= 1850) return "S";
  if (val >= 1620) return "A";
  if (val >= 1400) return "B";
  if (val >= 1180) return "C";
  return "D";
}

export function CombatRadar({ ratings }: CombatRadarProps) {
  const entries = Object.entries(ratings);
  const count = entries.length || 1;
  const cx = 170;
  const cy = 155;
  const maxR = 96;

  const pointAt = (index: number, ratio: number) => {
    const angle = (Math.PI * 2 * index) / count - Math.PI / 2;
    return {
      x: cx + Math.cos(angle) * maxR * ratio,
      y: cy + Math.sin(angle) * maxR * ratio,
    };
  };

  const rings = [0.25, 0.5, 0.75, 1];
  const statPoints = entries
    .map(([, val], idx) => {
      const normalized = Math.max(0.18, Math.min(1, (val - 800) / 1600));
      const p = pointAt(idx, normalized);
      return `${p.x},${p.y}`;
    })
    .join(" ");

  return (
    <div className="w-full flex flex-col items-center">
      <svg viewBox="0 0 340 310" className="w-full max-w-[340px] overflow-visible">
        {/* Background Concentric Polygons */}
        {rings.map((r) => {
          const pts = entries
            .map((_, idx) => {
              const p = pointAt(idx, r);
              return `${p.x},${p.y}`;
            })
            .join(" ");
          return (
            <polygon
              key={r}
              points={pts}
              fill={r === 1 ? "var(--radar-bg, #FAF4E6)" : "none"}
              stroke="var(--radar-grid, #121218)"
              strokeWidth={r === 1 ? 2.5 : 1.2}
              strokeDasharray={r === 1 ? undefined : "4 3"}
              opacity={r === 1 ? 0.95 : 0.45}
            />
          );
        })}

        {/* Axis Spokes */}
        {entries.map((_, idx) => {
          const outer = pointAt(idx, 1);
          return (
            <line
              key={idx}
              x1={cx}
              y1={cy}
              x2={outer.x}
              y2={outer.y}
              stroke="var(--radar-grid, #121218)"
              strokeWidth={1.3}
              opacity={0.4}
            />
          );
        })}

        {/* Filled Anime Power Polygon */}
        <polygon
          points={statPoints}
          fill="rgba(0, 194, 255, 0.4)"
          stroke="#FF3358"
          strokeWidth={3.2}
          strokeLinejoin="round"
        />

        {/* Vertex Dots & Stat Labels */}
        {entries.map(([topic, val], idx) => {
          const normalized = Math.max(0.18, Math.min(1, (val - 800) / 1600));
          const p = pointAt(idx, normalized);
          const lbl = pointAt(idx, 1.28);
          const grade = gradeFor(val);

          return (
            <g key={topic}>
              <circle
                cx={p.x}
                cy={p.y}
                r={5.5}
                fill="#FFC82C"
                stroke="var(--radar-grid, #121218)"
                strokeWidth={2.2}
              />
              <text
                x={lbl.x}
                y={lbl.y - 4}
                textAnchor="middle"
                className="fill-[var(--ink,#121218)] text-[10px] font-black uppercase tracking-wider"
              >
                {topic}
              </text>
              <text
                x={lbl.x}
                y={lbl.y + 10}
                textAnchor="middle"
                className="fill-[#FF3358] text-[10px] font-black"
              >
                {grade} · {val}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
