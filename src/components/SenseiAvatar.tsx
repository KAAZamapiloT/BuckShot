"use client";

import React from "react";

export type SenseiExpression = "idle" | "thinking" | "fired-up" | "victory";

const ART_BY_EXPRESSION: Record<SenseiExpression, string> = {
  idle: "/art/sensei-idle.jpg",
  thinking: "/art/sensei-thinking.jpg",
  "fired-up": "/art/sensei-fired-up.jpg",
  victory: "/art/sensei-victory.jpg",
};

const BORDER_GLOW: Record<SenseiExpression, string> = {
  idle: "#00C2FF",
  thinking: "#7C4DFF",
  "fired-up": "#FFC82C",
  victory: "#00C875",
};

export function SenseiAvatar({
  expression = "idle",
  sfx,
  size = "md",
}: {
  expression?: SenseiExpression;
  sfx?: string;
  size?: "sm" | "md" | "lg";
}) {
  const dims =
    size === "sm"
      ? "w-14 h-14"
      : size === "lg"
      ? "w-28 h-28 sm:w-32 sm:h-32"
      : "w-20 h-20";

  return (
    <div className="relative inline-block shrink-0 select-none">
      <div
        style={{ boxShadow: `4px 4px 0px ${BORDER_GLOW[expression]}` }}
        className={`${dims} rounded-sm overflow-hidden border-[3px] border-[#121218] bg-[#121218] manga-unlocked-pop`}
      >
        <img
          src={ART_BY_EXPRESSION[expression]}
          alt={`Sensei Reiko (${expression})`}
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).src = "/art/sensei-fired-up.jpg";
          }}
          className="w-full h-full object-cover"
        />
      </div>
      {sfx && (
        <span className="absolute -top-2.5 -right-3 bg-[#FF3358] text-white font-manga text-sm tracking-wider px-2 py-0.5 border-2 border-[#121218] shadow-[2px_2px_0px_#121218] rotate-6 manga-unlocked-pop">
          {sfx}
        </span>
      )}
      <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-[#121218] text-[#FFC82C] text-[9px] font-black tracking-widest uppercase px-1.5 py-0.5 whitespace-nowrap">
        SENSEI REIKO
      </span>
    </div>
  );
}
