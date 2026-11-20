"use client";

export type FlawCategory =
  | "OFF_BY_ONE"
  | "MEMORY_BLOWUP"
  | "RACE_CONDITION"
  | "SUBOPTIMAL_TIME"
  | "EDGE_CASE";

export interface DefeatRecord {
  id: string;
  problemSlug: string;
  problemTitle: string;
  topic: string;
  flawCategory: FlawCategory;
  flawLabel: string;
  mistakeNotes: string;
  senseiRemediation: string;
  failedCount: number;
  resolved: boolean;
  lastFailedAt: string;
}

const STORAGE_KEY = "buckshot-grimoire-defeats";

export const INITIAL_DEFEATS: DefeatRecord[] = [
  {
    id: "def-1",
    problemSlug: "prefix-sum-subarray-k",
    problemTitle: "Zero-Allocation Subarray Target Counter",
    topic: "Algorithms",
    flawCategory: "EDGE_CASE",
    flawLabel: "Missing Zero-Length Prefix Base Case",
    mistakeNotes: "Forgot to seed the frequency map with {0: 1}. Subarrays starting from index 0 were completely ignored!",
    senseiRemediation: "Always account for the empty prefix before the loop: if prefix[r] == k, then prefix[r] - k == 0 must hit the seed!",
    failedCount: 2,
    resolved: false,
    lastFailedAt: "Yesterday at 14:22",
  },
  {
    id: "def-2",
    problemSlug: "ring-buffer-lockfree",
    problemTitle: "Bounded Lock-Free SPSC Ring Buffer",
    topic: "Concurrency",
    flawCategory: "RACE_CONDITION",
    flawLabel: "False Sharing & Memory Ordering Violation",
    mistakeNotes: "Did not pad producer tail and consumer head onto separate 64-byte cache lines; producer used Relaxed ordering instead of Release.",
    senseiRemediation: "Hardware cache lines are 64 bytes! Without alignas(64), producer and consumer thrash the same L1 cache line.",
    failedCount: 3,
    resolved: false,
    lastFailedAt: "3 days ago",
  },
];

export function getGrimoireDefeats(): DefeatRecord[] {
  if (typeof window === "undefined") return INITIAL_DEFEATS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_DEFEATS));
      return INITIAL_DEFEATS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_DEFEATS;
  }
}

export function saveGrimoireDefeats(defeats: DefeatRecord[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(defeats));
  } catch (err) {
    console.error("Failed to save grimoire to local storage", err);
  }
}

export function logDefeat(
  problemSlug: string,
  problemTitle: string,
  topic: string,
  flawCategory: FlawCategory,
  mistakeNotes: string
): DefeatRecord[] {
  const current = getGrimoireDefeats();
  const existingIndex = current.findIndex((d) => d.problemSlug === problemSlug);

  const categoryLabels: Record<FlawCategory, string> = {
    OFF_BY_ONE: "Off-by-One Boundary Slip",
    MEMORY_BLOWUP: "Memory Allocation & Heap Blowup",
    RACE_CONDITION: "Race Condition / Memory Barrier Miss",
    SUBOPTIMAL_TIME: "Suboptimal O(N²) Quadratic Fallback",
    EDGE_CASE: "Unhandled Zero / Empty / Negative Edge Case",
  };

  const remediations: Record<FlawCategory, string> = {
    OFF_BY_ONE: "Verify both loop boundaries strictly. Write out index ranges for N=1 and N=2 on scrap paper first.",
    MEMORY_BLOWUP: "Eliminate auxiliary allocations inside inner loops. Reuse buffers and enforce static bounds.",
    RACE_CONDITION: "Ensure acquire-release synchronization pairs match exactly. Never read dirty published variables.",
    SUBOPTIMAL_TIME: "Identify the redundant inner loop scan and replace it with a Monotonic Stack, Map, or Binary Search.",
    EDGE_CASE: "Always dry-run null, 0-element, 1-element, and duplicate input values before firing test suites.",
  };

  if (existingIndex >= 0) {
    const existing = current[existingIndex];
    current[existingIndex] = {
      ...existing,
      failedCount: existing.failedCount + 1,
      resolved: false,
      flawCategory,
      flawLabel: categoryLabels[flawCategory],
      mistakeNotes,
      senseiRemediation: remediations[flawCategory],
      lastFailedAt: "Just now",
    };
  } else {
    current.unshift({
      id: `def-${Date.now()}`,
      problemSlug,
      problemTitle,
      topic,
      flawCategory,
      flawLabel: categoryLabels[flawCategory],
      mistakeNotes,
      senseiRemediation: remediations[flawCategory],
      failedCount: 1,
      resolved: false,
      lastFailedAt: "Just now",
    });
  }

  saveGrimoireDefeats(current);
  return current;
}

export function avengeDefeat(problemSlug: string): DefeatRecord[] {
  const current = getGrimoireDefeats();
  const next = current.map((d) => {
    if (d.problemSlug === problemSlug) {
      return { ...d, resolved: true, mistakeNotes: "AVENGED! Pattern mastered cleanly in live combat." };
    }
    return d;
  });
  saveGrimoireDefeats(next);
  return next;
}

export function hasUnresolvedDefeat(problemSlug: string): DefeatRecord | null {
  const current = getGrimoireDefeats();
  const match = current.find((d) => d.problemSlug === problemSlug && !d.resolved);
  return match || null;
}
