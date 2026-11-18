export interface CruxPanel {
  id: string;
  panelNo: string;
  title: string;
  criteria: string;
  hint: string;
  unlockedInsight: string;
  keywords: string[];
  colorHex: string;
  sfx: string;
}

export interface ProblemTestCase {
  label: string;
  args: unknown[];
  expected: unknown;
}

export interface SeedProblem {
  slug: string;
  title: string;
  volumeNumber: number;
  volumeName: string;
  topic: string;
  sourceTag: string;
  rating: number;
  accentColor: "crimson" | "cyan" | "gold" | "violet" | "emerald";
  brief: string;
  constraints: string;
  functionName: string;
  cruxPanels: CruxPanel[];
  starterCode: {
    typescript: string;
    python: string;
    cpp: string;
    rust: string;
  };
  testCases: ProblemTestCase[];
}

export const MANGA_VOLUMES = [
  {
    number: 1,
    code: "VOL. 01",
    name: "ORIGIN",
    subtitle: "Foundations, Memory Models & Complexity Intuition",
    accent: "#FFC82C",
    badge: "PROLOGUE ARC",
    chapters: 14,
    completed: 11,
    topics: ["Big-O Proofs", "Hash Maps", "Two Pointers", "Prefix Sums", "Recursion"],
  },
  {
    number: 2,
    code: "VOL. 02",
    name: "ALGORITHM ARC",
    subtitle: "Invariant Mastery, Competitive Ratings & Bounty Ladder",
    accent: "#FF3358",
    badge: "SHONEN CORE",
    chapters: 32,
    completed: 19,
    topics: ["Monotonic Stacks", "Binary Search on Answer", "Dynamic Programming", "Graphs & Flow", "Dual Heaps"],
  },
  {
    number: 3,
    code: "VOL. 03",
    name: "IRONWORKS",
    subtitle: "Production Systems Built From Scratch (Beyond Puzzles)",
    accent: "#00C2FF",
    badge: "SYSTEMS FORGE",
    chapters: 22,
    completed: 8,
    topics: ["Lock-Free Ring Buffers", "Consistent Hash Rings", "Skip Lists", "Reliable UDP", "Memory Allocators"],
  },
  {
    number: 4,
    code: "VOL. 04",
    name: "BLUEPRINT",
    subtitle: "Distributed Architecture, HLD/LLD & Voice-to-Board",
    accent: "#00C875",
    badge: "ARCHITECT ARC",
    chapters: 18,
    completed: 7,
    topics: ["Rate Limiters", "Kafka Event Logs", "Sharding & Consensus", "Backpressure", "Read/Write Separation"],
  },
  {
    number: 5,
    code: "VOL. 05",
    name: "FRONTIER AI",
    subtitle: "LLM Serving, Paged KV Cache, RAG & Tool-Use Agents",
    accent: "#7C4DFF",
    badge: "FINAL SAGA",
    chapters: 16,
    completed: 4,
    topics: ["PagedAttention KV Cache", "Eval Harnesses", "Hybrid Vector Search", "MCP Tool Loops", "Speculative Decoding"],
  },
];

export const SEED_PROBLEMS: SeedProblem[] = [
  {
    slug: "prefix-sum-subarray-k",
    title: "Zero-Allocation Subarray Target Counter",
    volumeNumber: 1,
    volumeName: "VOL. 01 — ORIGIN",
    topic: "Algorithms",
    sourceTag: "ORIGIN-ARC",
    rating: 1180,
    accentColor: "gold",
    brief:
      "Given an integer array `nums` (which may contain negative numbers and zeros) and an integer `k`, return the total number of contiguous subarrays whose sum equals `k`. Prove why sliding window fails before you code.",
    constraints: "1 <= nums.length <= 2 * 10^5 | -1000 <= nums[i] <= 1000 | Target: O(N) time, O(N) space",
    functionName: "countSubarrays",
    cruxPanels: [
      {
        id: "p1",
        panelNo: "PANEL 01",
        title: "Why Sliding Window Breaks",
        criteria: "Explain that negative numbers break monotonicity so shrinking/expanding a window misses valid subarrays.",
        hint: "What happens to the window sum monotonicity when `nums` contains negative integers?",
        unlockedInsight: "Negative values break prefix monotonicity — a two-pointer window cannot decide whether expanding increases or decreases the sum.",
        keywords: ["negative", "monoton", "sliding", "window", "two pointer", "shrink", "expand", "breaks", "fail"],
        colorHex: "#FFC82C",
        sfx: "CRACK!",
      },
      {
        id: "p2",
        panelNo: "PANEL 02",
        title: "Prefix Difference Identity",
        criteria: "Formulate `prefix[r] - prefix[l] == k`, so at index `r` we count prior prefixes equal to `curr - k`.",
        hint: "Rewrite the sum of subarray `[l..r]` using cumulative sums `P[r]` and `P[l-1]`.",
        unlockedInsight: "Subarray(l..r) = P[r] - P[l-1] = k  =>  look up frequency of (currSum - k) seen before index r.",
        keywords: ["prefix", "curr - k", "sum - k", "complement", "difference", "cumulative", "hashmap", "map", "frequency", "count"],
        colorHex: "#00C2FF",
        sfx: "FLASH!",
      },
      {
        id: "p3",
        panelNo: "PANEL 03",
        title: "Empty Prefix Base Invariant & O(N)",
        criteria: "Initialize frequency map with `{0: 1}` to capture subarrays starting at index 0, giving O(N) time & space.",
        hint: "If the very first prefix from index 0 equals `k`, what must already exist in your frequency map before the loop starts?",
        unlockedInsight: "Seeding map with {0: 1} accounts for zero-length prefix; single pass updates count before inserting current prefix -> O(N) time.",
        keywords: ["0: 1", "zero", "base", "empty", "index 0", "o(n)", "linear", "initialize", "seed"],
        colorHex: "#00C875",
        sfx: "SEAL BROKEN!",
      },
    ],
    starterCode: {
      typescript: `function countSubarrays(nums, k) {
  // Prove all 3 Breakthrough Panels with Sensei Reiko, then fire your code!
  const freq = new Map([[0, 1]]);
  let sum = 0;
  let total = 0;
  for (const x of nums) {
    sum += x;
    total += freq.get(sum - k) || 0;
    freq.set(sum, (freq.get(sum) || 0) + 1);
  }
  return total;
}`,
      python: `def count_subarrays(nums: list[int], k: int) -> int:
    freq = {0: 1}
    total = curr = 0
    for x in nums:
        curr += x
        total += freq.get(curr - k, 0)
        freq[curr] = freq.get(curr, 0) + 1
    return total`,
      cpp: `int countSubarrays(const vector<int>& nums, int k) {
    unordered_map<long long, int> freq;
    freq[0] = 1;
    long long sum = 0;
    int total = 0;
    for (int x : nums) {
        sum += x;
        if (auto it = freq.find(sum - k); it != freq.end()) total += it->second;
        freq[sum]++;
    }
    return total;
}`,
      rust: `use std::collections::HashMap;
pub fn count_subarrays(nums: &[i32], k: i64) -> i64 {
    let mut freq: HashMap<i64, i64> = HashMap::from([(0, 1)]);
    let (mut sum, mut total) = (0i64, 0i64);
    for &x in nums {
        sum += x as i64;
        total += *freq.get(&(sum - k)).unwrap_or(&0);
        *freq.entry(sum).or_insert(0) += 1;
    }
    total
}`,
    },
    testCases: [
      { label: "Standard positive", args: [[1, 1, 1], 2], expected: 2 },
      { label: "Negative cancel-out", args: [[1, -1, 1, -1, 1], 0], expected: 6 },
      { label: "Zero target edge", args: [[0, 0, 0], 0], expected: 6 },
    ],
  },
  {
    slug: "monotonic-stack-skyline",
    title: "Largest Inked Panel Rectangle",
    volumeNumber: 2,
    volumeName: "VOL. 02 — ALGORITHM ARC",
    topic: "Algorithms",
    sourceTag: "CF-1600",
    rating: 1590,
    accentColor: "crimson",
    brief:
      "You are laying out vertical manga panels whose heights are given by `heights[]` (each width 1). Find the maximum rectangular area that fits strictly inside the histogram silhouette. Prove the exact invariant that makes each bar pushed and popped at most once.",
    constraints: "1 <= heights.length <= 10^5 | 0 <= heights[i] <= 10^4 | Target: O(N) time",
    functionName: "largestPanelArea",
    cruxPanels: [
      {
        id: "p1",
        panelNo: "PANEL 01",
        title: "Nearest Smaller Boundaries",
        criteria: "Show that every optimal rectangle is bounded in height by some bar `i`, spanning from its nearest strictly smaller bar on the left to the right.",
        hint: "If bar `i` determines the rectangle's height, how far left and right can that rectangle extend?",
        unlockedInsight: "Every maximal rectangle uses some bar `i` as its minimum height: width = rightSmaller[i] - leftSmaller[i] - 1.",
        keywords: ["smaller", "left", "right", "boundary", "span", "extend", "minimum", "width"],
        colorHex: "#FF3358",
        sfx: "SLASH!",
      },
      {
        id: "p2",
        panelNo: "PANEL 02",
        title: "Monotonic Increasing Stack Invariant",
        criteria: "Maintain a monotonic increasing stack of indices; when a shorter bar arrives, pop taller bars and finalize their exact right boundary.",
        hint: "When `heights[i] < heights[stack.top]`, what do you suddenly know for certain about `stack.top`?",
        unlockedInsight: "A shorter incoming bar `i` immediately seals the right boundary of every taller bar on the stack, while the new stack top is its left boundary.",
        keywords: ["monotonic", "increasing", "stack", "pop", "shorter", "taller", "index", "indices"],
        colorHex: "#00C2FF",
        sfx: "CLANG!",
      },
      {
        id: "p3",
        panelNo: "PANEL 03",
        title: "Sentinel Flush & Amortized O(N)",
        criteria: "Explain pushing a 0-height sentinel at the end to flush remaining bars and prove O(N) via push/pop accounting.",
        hint: "What happens to bars still sitting in the stack after the loop ends, and why isn't the inner while-loop O(N^2)?",
        unlockedInsight: "Appending a trailing 0 sentinel flushes all residual bars cleanly; each index is pushed once and popped once => strictly O(N) amortized.",
        keywords: ["sentinel", "flush", "remaining", "push", "pop", "once", "amortized", "o(n)", "zero"],
        colorHex: "#FFC82C",
        sfx: "OVERDRIVE!",
      },
    ],
    starterCode: {
      typescript: `function largestPanelArea(heights) {
  const stack = [];
  let best = 0;
  for (let i = 0; i <= heights.length; i++) {
    const h = i === heights.length ? 0 : heights[i];
    while (stack.length && heights[stack[stack.length - 1]] > h) {
      const mid = stack.pop();
      const left = stack.length ? stack[stack.length - 1] : -1;
      best = Math.max(best, heights[mid] * (i - left - 1));
    }
    stack.push(i);
  }
  return best;
}`,
      python: `def largest_panel_area(heights: list[int]) -> int:
    stack, best = [], 0
    for i, h in enumerate(heights + [0]):
        while stack and heights[stack[-1]] > h:
            mid = stack.pop()
            left = stack[-1] if stack else -1
            best = max(best, heights[mid] * (i - left - 1))
        stack.append(i)
    return best`,
      cpp: `int largestPanelArea(vector<int> heights) {
    heights.push_back(0);
    vector<int> st;
    int best = 0;
    for (int i = 0; i < (int)heights.size(); ++i) {
        while (!st.empty() && heights[st.back()] > heights[i]) {
            int mid = st.back(); st.pop_back();
            int left = st.empty() ? -1 : st.back();
            best = max(best, heights[mid] * (i - left - 1));
        }
        st.push_back(i);
    }
    return best;
}`,
      rust: `pub fn largest_panel_area(mut heights: Vec<i32>) -> i32 {
    heights.push(0);
    let mut stack: Vec<usize> = Vec::new();
    let mut best = 0;
    for i in 0..heights.len() {
        while let Some(&top) = stack.last() {
            if heights[top] <= heights[i] { break; }
            stack.pop();
            let left = stack.last().map(|&x| x as i32).unwrap_or(-1);
            best = best.max(heights[top] * (i as i32 - left - 1));
        }
        stack.push(i);
    }
    best
}`,
    },
    testCases: [
      { label: "Classic skyline", args: [[2, 1, 5, 6, 2, 3]], expected: 10 },
      { label: "Strictly ascending", args: [[1, 2, 3, 4, 5]], expected: 9 },
      { label: "Flat valley", args: [[4, 2, 0, 3, 2, 5]], expected: 6 },
    ],
  },
  {
    slug: "interval-scheduler-proof",
    title: "Weighted Event Arc Scheduler",
    volumeNumber: 2,
    volumeName: "VOL. 02 — ALGORITHM ARC",
    topic: "DP",
    sourceTag: "ATCODER-DP",
    rating: 1420,
    accentColor: "violet",
    brief:
      "Given `jobs = [[start, end, profit], ...]`, pick a non-overlapping subset maximizing total profit. First disprove greedy-by-end-time, then formulate the sorted DP + binary search recurrence.",
    constraints: "1 <= jobs.length <= 5 * 10^4 | Target: O(N log N) time",
    functionName: "maxArcProfit",
    cruxPanels: [
      {
        id: "p1",
        panelNo: "PANEL 01",
        title: "Greedy Counterexample",
        criteria: "Explain why sorting by earliest end time (which works for unweighted intervals) fails when weights/profits differ.",
        hint: "Construct a 2-job example where picking the earliest-finishing job loses massive profit.",
        unlockedInsight: "A short early job with profit 1 can block a slightly longer overlapping job with profit 1000 — greedy choice property fails.",
        keywords: ["greedy", "fails", "counterexample", "weight", "profit", "early", "short", "block"],
        colorHex: "#7C4DFF",
        sfx: "DISPROVED!",
      },
      {
        id: "p2",
        panelNo: "PANEL 02",
        title: "End-Time Sort + Take/Skip Recurrence",
        criteria: "Sort by end time and define dp[i] = max(dp[i-1], profit[i] + dp[prev(i)]).",
        hint: "Once sorted by end time, what are the only two choices for job `i`?",
        unlockedInsight: "Sort jobs by end time: dp[i] = max(skip: dp[i-1], take: profit[i] + dp[lastNonOverlapping(i)]).",
        keywords: ["sort", "end", "dp", "take", "skip", "recurrence", "max", "previous", "non-overlapping"],
        colorHex: "#FF6FAE",
        sfx: "LOCKED IN!",
      },
      {
        id: "p3",
        panelNo: "PANEL 03",
        title: "Binary Search Jump for O(N log N)",
        criteria: "Use binary search on sorted end times to find the latest job with `end <= start[i]` in O(log N).",
        hint: "How do you avoid an O(N) backward linear scan to find `prev(i)`?",
        unlockedInsight: "Because end times are sorted, upper_bound(start[i]) locates the last compatible job in O(log N) => O(N log N) total.",
        keywords: ["binary search", "log", "upper", "compatible", "n log n", "o(n log n)", "sorted"],
        colorHex: "#00C875",
        sfx: "BREAKTHROUGH!",
      },
    ],
    starterCode: {
      typescript: `function maxArcProfit(jobs) {
  const sorted = [...jobs].sort((a, b) => a[1] - b[1]);
  const n = sorted.length;
  const dp = new Array(n + 1).fill(0);
  for (let i = 1; i <= n; i++) {
    const [start, , profit] = sorted[i - 1];
    let lo = 0, hi = i - 1;
    while (lo < hi) {
      const mid = (lo + hi + 1) >> 1;
      if (sorted[mid - 1][1] <= start) lo = mid;
      else hi = mid - 1;
    }
    dp[i] = Math.max(dp[i - 1], dp[lo] + profit);
  }
  return dp[n];
}`,
      python: `from bisect import bisect_right
def max_arc_profit(jobs: list[list[int]]) -> int:
    jobs.sort(key=lambda j: j[1])
    ends = [j[1] for j in jobs]
    dp = [0] * (len(jobs) + 1)
    for i, (s, e, p) in enumerate(jobs, 1):
        prev = bisect_right(ends, s, 0, i - 1)
        dp[i] = max(dp[i - 1], dp[prev] + p)
    return dp[-1]`,
      cpp: `// Sort by end time + upper_bound DP -> O(N log N)`,
      rust: `// Sort by end time + partition_point DP -> O(N log N)`,
    },
    testCases: [
      {
        label: "Weighted beats greedy",
        args: [[[1, 3, 50], [2, 4, 10], [3, 5, 40], [3, 6, 70]]],
        expected: 120,
      },
      {
        label: "Disjoint chain",
        args: [[[1, 2, 20], [2, 3, 25], [3, 5, 30]]],
        expected: 75,
      },
    ],
  },
  {
    slug: "ring-buffer-lockfree",
    title: "Bounded Lock-Free SPSC Ring Buffer",
    volumeNumber: 3,
    volumeName: "VOL. 03 — IRONWORKS",
    topic: "Concurrency",
    sourceTag: "IRONWORKS-QUANT",
    rating: 1680,
    accentColor: "crimson",
    brief:
      "Implement a high-throughput single-producer, single-consumer (SPSC) ring buffer with capacity `cap` that simulates wrap-around enqueue/dequeue operations without heap reallocations. Prove how head/tail ownership eliminates mutexes and avoids false sharing.",
    constraints: "Zero allocations on hot path | Power-of-two masking | Acquire-Release memory ordering",
    functionName: "simulateRingBuffer",
    cruxPanels: [
      {
        id: "p1",
        panelNo: "PANEL 01",
        title: "Single-Writer Ownership & Power-of-Two Wrap",
        criteria: "Explain that producer solely writes `tail` and consumer solely writes `head`, using bitmask `idx & (cap - 1)` for O(1) wrap-around.",
        hint: "Why doesn't an SPSC ring buffer need compare-and-swap (CAS) loops, and how can modulo be replaced?",
        unlockedInsight: "Disjoint write ownership (producer owns tail, consumer owns head) eliminates CAS contention; power-of-two capacity replaces modulo with bitmask.",
        keywords: ["producer", "consumer", "head", "tail", "modulo", "mask", "power of two", "bitmask", "cas", "ownership"],
        colorHex: "#FF3358",
        sfx: "IGNITE!",
      },
      {
        id: "p2",
        panelNo: "PANEL 02",
        title: "Acquire-Release Visibility Ordering",
        criteria: "Producer writes payload BEFORE release-storing `tail`; consumer acquire-loads `tail` BEFORE reading payload.",
        hint: "If the CPU reorders the data write after updating `tail`, what does the consumer read?",
        unlockedInsight: "Release-store on tail publishes slot data; acquire-load on tail guarantees the consumer observes initialized bytes without full seq_cst fences.",
        keywords: ["acquire", "release", "order", "reorder", "memory", "barrier", "fence", "atomic", "visibility"],
        colorHex: "#00C2FF",
        sfx: "SYNCED!",
      },
      {
        id: "p3",
        panelNo: "PANEL 03",
        title: "Cache-Line Padding (False Sharing)",
        criteria: "Pad `head` and `tail` onto separate 64-byte cache lines so producer and consumer cores don't invalidate each other's L1 cache.",
        hint: "Even without locks, why would placing `head` and `tail` adjacent in a struct tank throughput on two CPU cores?",
        unlockedInsight: "Aligning head and tail to distinct 64-byte cache lines prevents MESI cache-line ping-pong (false sharing) across cores.",
        keywords: ["cache", "false sharing", "64", "pad", "align", "line", "mesi", "l1", "ping"],
        colorHex: "#FFC82C",
        sfx: "MAX SPEED!",
      },
    ],
    starterCode: {
      typescript: `function simulateRingBuffer(capacity, ops) {
  // ops: Array<["push", number] | ["pop"]>
  // Return array of results: boolean for push, number|null for pop
  const buf = new Array(capacity).fill(null);
  let head = 0, tail = 0, size = 0;
  const out = [];
  for (const op of ops) {
    if (op[0] === "push") {
      if (size === capacity) { out.push(false); }
      else {
        buf[tail] = op[1];
        tail = (tail + 1) % capacity;
        size++;
        out.push(true);
      }
    } else {
      if (size === 0) { out.push(null); }
      else {
        out.push(buf[head]);
        head = (head + 1) % capacity;
        size--;
      }
    }
  }
  return out;
}`,
      python: `# Bounded circular ring buffer simulation`,
      cpp: `// alignas(64) std::atomic<size_t> head_{0}, tail_{0}; with memory_order_acquire/release`,
      rust: `// #[repr(align(64))] AtomicUsize head/tail with Ordering::Acquire / Ordering::Release`,
    },
    testCases: [
      {
        label: "Wrap-around + full reject",
        args: [2, [["push", 10], ["push", 20], ["push", 30], ["pop"], ["push", 30], ["pop"], ["pop"], ["pop"]]],
        expected: [true, true, false, 10, true, 20, 30, null],
      },
    ],
  },
  {
    slug: "consistent-hash-ring",
    title: "Consistent Hash Ring with Virtual Nodes",
    volumeNumber: 3,
    volumeName: "VOL. 03 — IRONWORKS",
    topic: "Systems",
    sourceTag: "IRONWORKS-DIST",
    rating: 1460,
    accentColor: "cyan",
    brief:
      "Design a consistent hash ring that maps keys clockwise to the nearest shard token on `[0, 360)` and prove why virtual nodes prevent hot-shard skew when nodes join or leave.",
    constraints: "O(log(N * V)) key lookup | Minimal key remapping ~ K/N on topology change",
    functionName: "routeKeys",
    cruxPanels: [
      {
        id: "p1",
        panelNo: "PANEL 01",
        title: "Why `hash(key) % N` Catastrophically Rehashes",
        criteria: "Explain that changing N invalidates almost all keys (~(N-1)/N), triggering cache stampedes.",
        hint: "If you have 10 cache shards and 1 dies (`% 9`), what fraction of keys change owners?",
        unlockedInsight: "Modulo hashing remaps nearly 100% of keys when N changes, collapsing cache hit rates; a ring restricts movement to ~1/N keys.",
        keywords: ["modulo", "% n", "rehash", "remap", "stampede", "cache", "1/n", "all keys"],
        colorHex: "#00C2FF",
        sfx: "SHATTER!",
      },
      {
        id: "p2",
        panelNo: "PANEL 02",
        title: "Clockwise Binary Search on Sorted Ring",
        criteria: "Store sorted node positions and binary search for the first token >= key hash, wrapping around to index 0.",
        hint: "How do you find the responsible shard for a hashed key in O(log M) time?",
        unlockedInsight: "Binary search finds the first ring token >= keyPos; if none exists, wrap around to ring[0].",
        keywords: ["clockwise", "binary search", "sorted", "wrap", "nearest", "ring", "log"],
        colorHex: "#FFC82C",
        sfx: "LOCK-ON!",
      },
      {
        id: "p3",
        panelNo: "PANEL 03",
        title: "Virtual Nodes Eliminate Load Skew",
        criteria: "Assign V virtual tokens per physical server to smooth variance and spread load evenly if one server dies.",
        hint: "With only 3 physical nodes on a ring, what happens if two hash close together?",
        unlockedInsight: "Virtual nodes (e.g., 100-200 replicas per server) shrink standard deviation of shard ranges and distribute failover load across all survivors.",
        keywords: ["virtual", "vnode", "skew", "balance", "even", "replica", "variance", "hot"],
        colorHex: "#00C875",
        sfx: "BALANCED!",
      },
    ],
    starterCode: {
      typescript: `function routeKeys(ringNodes, keyPositions) {
  // ringNodes: Array<[pos: number, shard: string]>
  // keyPositions: number[] -> return assigned shard name for each key
  const sorted = [...ringNodes].sort((a, b) => a[0] - b[0]);
  return keyPositions.map((pos) => {
    let lo = 0, hi = sorted.length;
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      if (sorted[mid][0] >= pos) hi = mid;
      else lo = mid + 1;
    }
    return sorted[lo % sorted.length][1];
  });
}`,
      python: `# Binary search clockwise on sorted (pos, shard) ring`,
      cpp: `// std::map<uint32_t, string>::lower_bound with wrap to begin()`,
      rust: `// BTreeMap<u32, String>::range(pos..).next().or_else(|| map.iter().next())`,
    },
    testCases: [
      {
        label: "Clockwise wrap-around",
        args: [[[30, "S1"], [120, "S2"], [260, "S3"]], [10, 30, 150, 300]],
        expected: ["S1", "S1", "S3", "S1"],
      },
    ],
  },
  {
    slug: "token-bucket-limiter",
    title: "Distributed Token Bucket Rate Limiter",
    volumeNumber: 4,
    volumeName: "VOL. 04 — BLUEPRINT",
    topic: "Architecture",
    sourceTag: "BLUEPRINT-HLD",
    rating: 1360,
    accentColor: "emerald",
    brief:
      "Implement a lazy-refill token bucket limiter supporting burst capacity `cap` and refill rate `rate` tokens/sec, and explain how to prevent race conditions across stateless API gateways using atomic Redis Lua scripts.",
    constraints: "O(1) memory per tenant | Zero background timers | Atomic read-modify-write",
    functionName: "evaluateRequests",
    cruxPanels: [
      {
        id: "p1",
        panelNo: "PANEL 01",
        title: "Lazy Refill Formula (No Timers)",
        criteria: "Compute `tokens = min(cap, tokens + (now - lastTs) * rate)` on request arrival instead of running per-user background cron jobs.",
        hint: "Why would spawning a 1-second refill timer for 10 million API keys destroy your server?",
        unlockedInsight: "Lazy evaluation computes accrued tokens on demand via elapsed time delta -> O(1) compute and zero timer overhead.",
        keywords: ["lazy", "elapsed", "delta", "timer", "min", "cap", "refill", "timestamp"],
        colorHex: "#00C875",
        sfx: "REFILL!",
      },
      {
        id: "p2",
        panelNo: "PANEL 02",
        title: "Atomic Distributed State (Redis Lua)",
        criteria: "Explain why GET-then-SET across multiple gateway replicas causes TOCTOU race conditions and how a Redis Lua script makes it atomic.",
        hint: "If two API servers read `tokens = 1` at the exact same millisecond, what goes wrong?",
        unlockedInsight: "Concurrent GET/SET allows double-spend bursts; executing the check-and-decrement inside a single-threaded Redis Lua script guarantees atomicity.",
        keywords: ["race", "atomic", "redis", "lua", "toctou", "concurrent", "replica", "distributed"],
        colorHex: "#00C2FF",
        sfx: "ATOMIC!",
      },
    ],
    starterCode: {
      typescript: `function evaluateRequests(cap, rate, timestamps) {
  let tokens = cap;
  let last = timestamps.length ? timestamps[0] : 0;
  return timestamps.map((t) => {
    tokens = Math.min(cap, tokens + (t - last) * rate);
    last = t;
    if (tokens >= 1) {
      tokens -= 1;
      return true;
    }
    return false;
  });
}`,
      python: `# Lazy token bucket evaluation`,
      cpp: `// Lazy token bucket in O(1)`,
      rust: `// Lazy token bucket in O(1)`,
    },
    testCases: [
      {
        label: "Burst then throttle then recover",
        args: [2, 1, [0, 0, 0, 1, 1]],
        expected: [true, true, false, true, false],
      },
    ],
  },
  {
    slug: "kv-cache-paged-attention",
    title: "Paged KV-Cache Block Allocator",
    volumeNumber: 5,
    volumeName: "VOL. 05 — FRONTIER AI",
    topic: "AI Systems",
    sourceTag: "FRONTIER-LLM",
    rating: 1850,
    accentColor: "violet",
    brief:
      "Serving LLMs naively pre-allocates contiguous KV cache for `max_seq_len`, wasting 60–80% of VRAM via internal fragmentation. Design a virtual-memory style Paged KV-Cache block table allocator supporting dynamic growth and copy-on-write prefix sharing.",
    constraints: "Block size B tokens | O(1) free-block pop/return | Zero external fragmentation",
    functionName: "simulateKvAllocator",
    cruxPanels: [
      {
        id: "p1",
        panelNo: "PANEL 01",
        title: "Contiguous VRAM Fragmentation Bottleneck",
        criteria: "Identify that unknown output lengths force over-reservation of contiguous KV slabs, starving batch size.",
        hint: "Why can't an inference server simply malloc exact KV cache size before generation starts?",
        unlockedInsight: "Output token length is unknown a priori; reserving max_seq_len contiguously wastes VRAM and crushes maximum concurrent batch throughput.",
        keywords: ["fragmentation", "contiguous", "vram", "memory", "unknown", "length", "waste", "batch", "reserve"],
        colorHex: "#7C4DFF",
        sfx: "INSIGHT!",
      },
      {
        id: "p2",
        panelNo: "PANEL 02",
        title: "Logical-to-Physical Block Table (OS Paging)",
        criteria: "Split KV cache into fixed-size blocks mapped via a per-sequence block table so physical blocks need not be contiguous.",
        hint: "Which classic Operating Systems memory abstraction solves external fragmentation for arbitrary-length processes?",
        unlockedInsight: "Fixed-size KV blocks + per-request logical->physical block tables eliminate external fragmentation and cap internal waste to < 1 block.",
        keywords: ["page", "paging", "block", "table", "logical", "physical", "virtual", "os", "fixed"],
        colorHex: "#00C2FF",
        sfx: "PAGED!",
      },
      {
        id: "p3",
        panelNo: "PANEL 03",
        title: "Reference-Counted Copy-on-Write Prefix Sharing",
        criteria: "Share physical system-prompt blocks across requests via refcounts, copying only on write when sequences diverge.",
        hint: "If 50 users share the same 4,000-token system prompt, how do you store those KV blocks only once?",
        unlockedInsight: "Ref-counted shared physical blocks let identical prefixes share VRAM seamlessly; beam search or divergent tokens trigger copy-on-write.",
        keywords: ["copy", "cow", "share", "shared", "prefix", "refcount", "reference", "prompt", "beam"],
        colorHex: "#FF3358",
        sfx: "DOMAIN EXPAND!",
      },
    ],
    starterCode: {
      typescript: `function simulateKvAllocator(totalBlocks, blockSize, requests) {
  // requests: Array<["alloc", reqId, tokens] | ["free", reqId]>
  // Return remaining free physical blocks after each operation (-1 if OOM)
  let freeBlocks = totalBlocks;
  const held = new Map();
  const res = [];
  for (const r of requests) {
    if (r[0] === "alloc") {
      const need = Math.ceil(r[2] / blockSize);
      if (need > freeBlocks) { res.push(-1); }
      else {
        freeBlocks -= need;
        held.set(r[1], (held.get(r[1]) || 0) + need);
        res.push(freeBlocks);
      }
    } else {
      const count = held.get(r[1]) || 0;
      freeBlocks += count;
      held.delete(r[1]);
      res.push(freeBlocks);
    }
  }
  return res;
}`,
      python: `# Paged KV-Cache block table allocator`,
      cpp: `// Free-list physical block manager + refcount table`,
      rust: `// Vec<usize> free_list + HashMap<ReqId, Vec<BlockId>>`,
    },
    testCases: [
      {
        label: "Allocate, OOM guard, and reclaim",
        args: [10, 16, [["alloc", "r1", 40], ["alloc", "r2", 80], ["alloc", "r3", 64], ["free", "r1"], ["alloc", "r3", 48]]],
        expected: [7, 2, -1, 5, 2],
      },
    ],
  },
  {
    slug: "binary-search-answer-koko",
    title: "Monotonic Predicate Bandwidth Allocator",
    volumeNumber: 2,
    volumeName: "VOL. 02 — ALGORITHM ARC",
    topic: "Algorithms",
    sourceTag: "CF-1350",
    rating: 1320,
    accentColor: "cyan",
    brief:
      "You have `batches[]` representing chapter image payloads (MB) to push across `h` discrete time slots. Each slot can process at most `speed` MB from a single batch (unfinished batches carry over). Find the minimum integer `speed` so all batches finish within `h` slots.",
    constraints: "1 <= batches.length <= 10^5 | batches.length <= h <= 10^9 | Target: O(N log(maxBatch))",
    functionName: "minTransferSpeed",
    cruxPanels: [
      {
        id: "p1",
        panelNo: "PANEL 01",
        title: "Monotonic Feasibility Predicate",
        criteria: "Show that if speed `s` finishes within `h` slots, any speed `s' > s` also finishes (FFFF...TTTT transition).",
        hint: "If bandwidth `s` is fast enough to beat deadline `h`, what is guaranteed about `s + 1`?",
        unlockedInsight: "Feasibility is strictly monotonic: impossible below optimal speed, always feasible at or above it — enabling binary search over the answer space.",
        keywords: ["monotonic", "feasible", "predicate", "true", "false", "binary search", "answer", "faster"],
        colorHex: "#00C2FF",
        sfx: "TARGETED!",
      },
      {
        id: "p2",
        panelNo: "PANEL 02",
        title: "Ceiling Division Slot Cost & O(N log M)",
        criteria: "Compute slots needed per batch as `ceil(b / mid)` and narrow `[1, max(batches)]` in O(N log M) time.",
        hint: "How many slots does a batch of size `b` consume at speed `mid`, and what are the exact search bounds?",
        unlockedInsight: "Each feasibility check sums ceil(b / mid) in O(N); binary searching [1, max(batches)] converges in O(N log(maxBatch)).",
        keywords: ["ceil", "ceiling", "divide", "max", "log", "bounds", "o(n log", "slots"],
        colorHex: "#FFC82C",
        sfx: "LOCKED!",
      },
    ],
    starterCode: {
      typescript: `function minTransferSpeed(batches, h) {
  let lo = 1;
  let hi = Math.max(...batches);
  while (lo < hi) {
    const mid = Math.floor((lo + hi) / 2);
    let slots = 0;
    for (const b of batches) slots += Math.ceil(b / mid);
    if (slots <= h) hi = mid;
    else lo = mid + 1;
  }
  return lo;
}`,
      python: `import math
def min_transfer_speed(batches: list[int], h: int) -> int:
    lo, hi = 1, max(batches)
    while lo < hi:
        mid = (lo + hi) // 2
        if sum((b + mid - 1) // mid for b in batches) <= h:
            hi = mid
        else:
            lo = mid + 1
    return lo`,
      cpp: `// Binary search on answer [1, max(batches)] using (b + mid - 1) / mid`,
      rust: `// Binary search on answer [1, *batches.iter().max().unwrap()]`,
    },
    testCases: [
      { label: "Standard deadline", args: [[3, 6, 7, 11], 8], expected: 4 },
      { label: "Tight deadline equals count", args: [[30, 11, 23, 4, 20], 5], expected: 30 },
    ],
  },
  {
    slug: "lru-cache-o1",
    title: "Zero-Jitter O(1) LRU Cache Engine",
    volumeNumber: 3,
    volumeName: "VOL. 03 — IRONWORKS",
    topic: "Systems",
    sourceTag: "IRONWORKS-CORE",
    rating: 1520,
    accentColor: "gold",
    brief:
      "Build an LRU cache supporting `get` and `put` in strict worst-case O(1) time with capacity `cap`. Prove why a single hash map or heap cannot achieve O(1) eviction and how sentinel head/tail pointers eliminate null-branch bugs.",
    constraints: "O(1) get & put | Strict recency ordering | Zero O(N) scans",
    functionName: "runLruOps",
    cruxPanels: [
      {
        id: "p1",
        panelNo: "PANEL 01",
        title: "Hash Map + Doubly-Linked List Synergy",
        criteria: "Combine O(1) key->node lookup in a hash map with O(1) arbitrary splice/promote in a doubly-linked list.",
        hint: "Why isn't a singly-linked list enough when you need to promote a middle node to the front in O(1)?",
        unlockedInsight: "HashMap gives O(1) pointer to any node; Doubly-Linked List provides prev/next pointers so detaching and re-inserting at MRU head is O(1).",
        keywords: ["doubly", "linked", "prev", "next", "hashmap", "map", "o(1)", "pointer", "splice", "detach"],
        colorHex: "#FFC82C",
        sfx: "LINKED!",
      },
      {
        id: "p2",
        panelNo: "PANEL 02",
        title: "Dummy Sentinel Nodes & Eviction Sync",
        criteria: "Use dummy head/tail sentinels to remove null edge cases, and delete the evicted tail's key from the HashMap simultaneously.",
        hint: "When evicting the LRU node from the tail, what metadata must the node store so you can purge the HashMap in O(1)?",
        unlockedInsight: "Storing `key` inside every list node lets eviction remove `tail.prev.key` from the HashMap in O(1); dummy sentinels eliminate head/tail null branches.",
        keywords: ["sentinel", "dummy", "head", "tail", "evict", "key", "delete", "null", "edge"],
        colorHex: "#00C875",
        sfx: "ZERO JITTER!",
      },
    ],
    starterCode: {
      typescript: `function runLruOps(cap, ops) {
  // ops: Array<["put", k, v] | ["get", k]> -> returns array of get results (-1 if miss)
  const map = new Map();
  const out = [];
  for (const op of ops) {
    if (op[0] === "get") {
      const k = op[1];
      if (!map.has(k)) { out.push(-1); continue; }
      const v = map.get(k);
      map.delete(k);
      map.set(k, v);
      out.push(v);
    } else {
      const [, k, v] = op;
      if (map.has(k)) map.delete(k);
      map.set(k, v);
      if (map.size > cap) {
        const lruKey = map.keys().next().value;
        map.delete(lruKey);
      }
    }
  }
  return out;
}`,
      python: `# OrderedDict or custom Doubly-Linked List + dict`,
      cpp: `// std::list<pair<int,int>> + unordered_map<int, list::iterator>`,
      rust: `// Arena-backed Vec<Node> doubly-linked list + HashMap<K, usize>`,
    },
    testCases: [
      {
        label: "Promote + Evict LRU",
        args: [2, [["put", 1, 10], ["put", 2, 20], ["get", 1], ["put", 3, 30], ["get", 2], ["get", 3]]],
        expected: [10, -1, 30],
      },
    ],
  },
  {
    slug: "raft-leader-election",
    title: "Raft Term & Split-Vote Election Guard",
    volumeNumber: 4,
    volumeName: "VOL. 04 — BLUEPRINT",
    topic: "Architecture",
    sourceTag: "BLUEPRINT-CONSENSUS",
    rating: 1780,
    accentColor: "emerald",
    brief:
      "Simulate a Raft cluster's RequestVote quorum rule across candidate proposals. Prove how monotonic terms + at-most-one-vote-per-term + randomized election timeouts guarantee at most one leader per term and recover from split votes.",
    constraints: "Strict majority quorum floor(N/2) + 1 | Safety: <= 1 leader per term",
    functionName: "electRaftLeader",
    cruxPanels: [
      {
        id: "p1",
        panelNo: "PANEL 01",
        title: "Quorum Intersection Invariant",
        criteria: "Explain that any two majorities (> N/2) must share at least one overlapping node, preventing two leaders in the same term.",
        hint: "If every node votes at most once per term, why is it mathematically impossible for two candidates to both reach > N/2 votes?",
        unlockedInsight: "By Pigeonhole Principle, two sets of size > N/2 intersect in >= 1 voter; since each voter casts at most one vote per term, Election Safety holds.",
        keywords: ["majority", "quorum", "overlap", "intersect", "once", "pigeonhole", "n/2", "safety", "term"],
        colorHex: "#00C875",
        sfx: "QUORUM!",
      },
      {
        id: "p2",
        panelNo: "PANEL 02",
        title: "Log Freshness Check & Randomized Timeouts",
        criteria: "Voters reject candidates with stale `(lastLogTerm, lastLogIndex)`; randomized election timeouts break split-vote livelocks.",
        hint: "What prevents a partitioned node with missing committed entries from winning an election, and how does Raft escape repeated ties?",
        unlockedInsight: "RequestVote compares (lastLogTerm, lastLogIndex) to preserve committed logs; randomized timeouts (e.g. 150-300ms) break split-vote symmetry.",
        keywords: ["log", "stale", "up-to-date", "index", "random", "timeout", "split", "livelock", "fresh"],
        colorHex: "#00C2FF",
        sfx: "CONSENSUS!",
      },
    ],
    starterCode: {
      typescript: `function electRaftLeader(clusterSize, votes) {
  // votes: Array<[term, voterId, candidateId]>
  // Return winning candidateId for highest term achieving majority, or null
  const quorum = Math.floor(clusterSize / 2) + 1;
  const voted = new Set();
  const tally = new Map();
  let bestTerm = -1;
  let winner = null;
  for (const [term, voter, cand] of votes) {
    const vKey = term + ":" + voter;
    if (voted.has(vKey)) continue;
    voted.add(vKey);
    const cKey = term + ":" + cand;
    const count = (tally.get(cKey) || 0) + 1;
    tally.set(cKey, count);
    if (count >= quorum && term >= bestTerm) {
      bestTerm = term;
      winner = cand;
    }
  }
  return winner;
}`,
      python: `# Enforce 1 vote per (term, voter) and quorum = n // 2 + 1`,
      cpp: `// Quorum majority enforcement per Raft term`,
      rust: `// Raft term election safety simulator`,
    },
    testCases: [
      {
        label: "Duplicate voter ignored; valid majority wins",
        args: [5, [[1, "v1", "A"], [1, "v1", "A"], [1, "v2", "A"], [1, "v3", "B"], [1, "v4", "B"], [1, "v5", "B"]]],
        expected: "B",
      },
    ],
  },
  {
    slug: "hybrid-rrf-rag-ranker",
    title: "Reciprocal Rank Fusion (BM25 + Vector RAG)",
    volumeNumber: 5,
    volumeName: "VOL. 05 — FRONTIER AI",
    topic: "AI Systems",
    sourceTag: "FRONTIER-RAG",
    rating: 1640,
    accentColor: "violet",
    brief:
      "Dense embeddings miss exact error codes/identifiers while BM25 misses semantic paraphrases. Implement Reciprocal Rank Fusion (RRF) combining ranked retrieval lists without brittle score normalization.",
    constraints: "Score(d) = sum(1 / (k + rank_i(d))) | Default smoothing constant k = 60",
    functionName: "fuseRankingsRRF",
    cruxPanels: [
      {
        id: "p1",
        panelNo: "PANEL 01",
        title: "Why Raw Score Blending Fails",
        criteria: "Explain that BM25 unbounded lexical scores and cosine similarity [0,1] sit on incomparable scales across queries.",
        hint: "Why can't you just compute `0.5 * bm25_score + 0.5 * cosine_similarity` directly?",
        unlockedInsight: "BM25 is unbounded and query-dependent while cosine lives in [-1, 1]; rank-based fusion discards mismatched score scales cleanly.",
        keywords: ["scale", "normalize", "bm25", "cosine", "unbounded", "score", "incomparable", "rank"],
        colorHex: "#7C4DFF",
        sfx: "FUSED!",
      },
      {
        id: "p2",
        panelNo: "PANEL 02",
        title: "1 / (k + rank) Smoothing Formula",
        criteria: "Sum `1 / (k + rank)` (1-indexed) across retrievers; `k = 60` dampens outlier #1 ranks so consensus documents rise to the top.",
        hint: "What role does the constant `k = 60` play in `1 / (k + rank)`?",
        unlockedInsight: "Smoothing constant k=60 prevents a single retriever's noisy rank-1 outlier from dominating a document ranked strongly by both lexical and dense retrievers.",
        keywords: ["60", "smooth", "constant", "outlier", "consensus", "1 /", "reciprocal", "dampen"],
        colorHex: "#FF6FAE",
        sfx: "TOP-K HIT!",
      },
    ],
    starterCode: {
      typescript: `function fuseRankingsRRF(lists, k = 60) {
  // lists: string[][] (ordered docIds from each retriever)
  // Return docIds sorted descending by RRF score (tie-break lexicographically)
  const scores = new Map();
  for (const list of lists) {
    list.forEach((docId, idx) => {
      const rank = idx + 1;
      scores.set(docId, (scores.get(docId) || 0) + 1 / (k + rank));
    });
  }
  return [...scores.entries()]
    .sort((a, b) => (b[1] !== a[1] ? b[1] - a[1] : a[0].localeCompare(b[0])))
    .map(([id]) => id);
}`,
      python: `# Reciprocal Rank Fusion over hybrid lexical + dense lists`,
      cpp: `// RRF score accumulation with k=60`,
      rust: `// HashMap<String, f64> RRF ranker`,
    },
    testCases: [
      {
        label: "Consensus doc beats single-retriever #1",
        args: [[["docA", "docB", "docC"], ["docD", "docB", "docA"]], 60],
        expected: ["docA", "docB", "docD", "docC"],
      },
    ],
  },
];

export interface BountyGuessrPoster {
  id: string;
  codename: string;
  title: string;
  origin: string;
  summary: string;
  constraints: string;
  trueRating: number;
  tags: string[];
  revealReason: string;
}

export const BOUNTY_GUESSR_POSTERS: BountyGuessrPoster[] = [
  {
    id: "g1",
    codename: "WANTED #01",
    title: "Zero-Sum Subarray Signal",
    origin: "ORIGIN / CF-DIV2",
    summary: "Count all contiguous subarrays in an array with negative values whose elements sum to exact target K.",
    constraints: "N <= 2e5 · O(N) expected",
    trueRating: 1180,
    tags: ["Prefix Sums", "HashMap"],
    revealReason: "Classic prefix-difference identity with `{0:1}` base case—foundational 1100–1200 PL synthesis.",
  },
  {
    id: "g2",
    codename: "WANTED #02",
    title: "Minimax Bandwidth Binary Search",
    origin: "ATCODER-ABC",
    summary: "Find the smallest transfer rate `speed` that drains N queued manga packets within H discrete frames.",
    constraints: "N <= 1e5, H <= 1e9 · O(N log M)",
    trueRating: 1320,
    tags: ["Binary Search on Answer", "Monotonicity"],
    revealReason: "Standard monotonic feasibility check over `[1, maxBatch]`—sits squarely around 1300 PL.",
  },
  {
    id: "g3",
    codename: "WANTED #03",
    title: "Largest Inked Panel Histogram",
    origin: "CF-1600 / CLASSIC",
    summary: "Compute the largest rectangle enclosed within N vertical bar heights in a single amortized linear pass.",
    constraints: "N <= 1e5 · O(N) strict",
    trueRating: 1590,
    tags: ["Monotonic Stack", "Amortized Proof"],
    revealReason: "Requires proving nearest-smaller boundary invariants + sentinel flush—solid ~1600 PL benchmark.",
  },
  {
    id: "g4",
    codename: "WANTED #04",
    title: "Lock-Free SPSC Ring Buffer",
    origin: "IRONWORKS / QUANT",
    summary: "Zero-allocation circular queue between producer & consumer cores with acquire-release ordering and 64B cache padding.",
    constraints: "Zero mutexes · Zero false sharing",
    trueRating: 1680,
    tags: ["Concurrency", "Memory Ordering", "Cache Lines"],
    revealReason: "Low-level systems reasoning (MESI false sharing + acquire/release visibility) elevates this near 1700 PL.",
  },
  {
    id: "g5",
    codename: "WANTED #05",
    title: "Paged KV-Cache Virtual Block Table",
    origin: "FRONTIER AI / vLLM",
    summary: "Eliminate contiguous VRAM fragmentation during batched LLM decoding using OS-style block tables and CoW prefix sharing.",
    constraints: "O(1) alloc/free · Zero external fragmentation",
    trueRating: 1850,
    tags: ["AI Systems", "OS Paging", "Ref-Counted CoW"],
    revealReason: "Synthesizes OS virtual memory, GPU VRAM batching math, and copy-on-write refcounting (~1850 PL).",
  },
  {
    id: "g6",
    codename: "WANTED #06",
    title: "Dynamic Connectivity Offline Divide & Conquer",
    origin: "CF-DIV1 / ICPC",
    summary: "Process Q edge insertions, deletions, and connectivity queries on an undirected graph using a segment tree over time + rollback DSU.",
    constraints: "N, Q <= 3e5 · O(Q log Q log N)",
    trueRating: 2350,
    tags: ["Rollback DSU", "Segment Tree over Time"],
    revealReason: "Combining time-interval decomposition with rollback union-find (no path compression!) puts this in 2300+ Grandmaster territory.",
  },
];

export const BOUNTY_RANK_LADDER = [
  { grade: "D", title: "D-RANK INITIATE", minPl: 800, color: "#FF6FAE", trial: "Master VOL. 01 Prefix & Hash Invariants", reward: "Ink Brush Badge" },
  { grade: "C", title: "C-RANK CHALLENGER", minPl: 1150, color: "#00C875", trial: "Prove Monotonic Binary Search & Sliding Bounds", reward: "Halftone Frame" },
  { grade: "B", title: "B-RANK TACTICIAN", minPl: 1400, color: "#FFC82C", trial: "Break Monotonic Stack + Weighted DP Panels", reward: "Gold Speed-Lines" },
  { grade: "A", title: "A-RANK STRIKER", minPl: 1650, color: "#00C2FF", trial: "Ship Lock-Free Ring Buffer & Hash Ring in Ironworks", reward: "Electric Ki Aura" },
  { grade: "S", title: "S-RANK PHANTOM", minPl: 1900, color: "#7C4DFF", trial: "Architect 5M DAU Blueprint + Paged KV-Cache", reward: "Spirit Seal Frame" },
  { grade: "SS", title: "GRANDMASTER ARCHITECT", minPl: 2200, color: "#FF3358", trial: "Score 90+ Across All 4 Mock Rubric Pillars", reward: "Shonen Crimson Crown" },
];

export const DEFAULT_TOPIC_RATINGS: Record<string, number> = {
  Algorithms: 1520,
  DP: 1380,
  Systems: 1460,
  Concurrency: 1310,
  Architecture: 1510,
  "AI Systems": 1620,
  Communication: 1490,
};

export const DEFAULT_SPRINT_AGENDA = [
  { id: "t1", title: "Break all 3 panels on Largest Inked Panel Rectangle", volume: "VOL. 02", mins: 30, done: false, href: "/shell-break/monotonic-stack-skyline" },
  { id: "t2", title: "Lock-Free Ring Buffer false-sharing drill", volume: "VOL. 03", mins: 40, done: false, href: "/shell-break/ring-buffer-lockfree" },
  { id: "t3", title: "Voice-to-Board: Approve Kafka + Redis Cache nodes", volume: "VOL. 04", mins: 25, done: false, href: "/blueprint" },
  { id: "t4", title: "Audit Sensei's Dossier weak invariants", volume: "CHAMBER", mins: 10, done: true, href: "/dossier" },
];

export const COMPANY_INTEL_FILES = [
  {
    code: "FILE-01",
    company: "Frontier AI Lab",
    tier: "SS-CLASS",
    accent: "#7C4DFF",
    rounds: ["Systems + Concurrency Coding (60m)", "LLM Serving / KV Cache Deep Dive", "Codebase Debugging Live", "Founder Architecture Review"],
    signal: "Heavy bias toward clean low-level implementation, memory math, async streaming backpressure, and debugging unfamiliar repos.",
  },
  {
    code: "FILE-02",
    company: "Quant HFT Desk",
    tier: "S-CLASS",
    accent: "#FF3358",
    rounds: ["Probability + Game Theory", "Lock-Free Data Structures (C++/Rust)", "Order Book Matching Engine", "Latency Profiling"],
    signal: "Expects exact proofs of invariants, cache-line awareness, and zero-allocation hot paths. No LeetCode memorization passes.",
  },
  {
    code: "FILE-03",
    company: "Hyper-Scale Infra",
    tier: "A-CLASS",
    accent: "#00C2FF",
    rounds: ["Hard Graph / DP Synthesis", "Distributed Storage HLD", "Production Incident Triage", "Staff Behavioral Signal"],
    signal: "Grades strictly on clarifying bottlenecks early, quantifying QPS/storage math, and calling out failure modes unprompted.",
  },
  {
    code: "FILE-04",
    company: "Next-Gen Payments",
    tier: "A-CLASS",
    accent: "#00C875",
    rounds: ["Idempotent API Implementation", "Ledger Consistency & Outbox Pattern", "Bug Hunt in Existing Repo", "Cross-Team Design"],
    signal: "Values clean readable production code, explicit state machines, and rock-solid idempotency keys over clever tricks.",
  },
];

export const DEFAULT_BLUEPRINT_NODES = [
  {
    id: "client",
    type: "default",
    position: { x: 40, y: 140 },
    data: { label: "📱 Manga Readers (5M DAU)" },
    style: { background: "#FFFDF7", border: "3px solid #121218", boxShadow: "4px 4px 0 #121218", fontWeight: 700, borderRadius: 8 },
  },
  {
    id: "gateway",
    type: "default",
    position: { x: 280, y: 140 },
    data: { label: "⚡ Edge API Gateway" },
    style: { background: "#FFC82C", border: "3px solid #121218", boxShadow: "4px 4px 0 #121218", fontWeight: 700, borderRadius: 8 },
  },
  {
    id: "service",
    type: "default",
    position: { x: 520, y: 140 },
    data: { label: "🔥 Feed & Chapter Service" },
    style: { background: "#00C2FF", border: "3px solid #121218", boxShadow: "4px 4px 0 #121218", fontWeight: 700, borderRadius: 8 },
  },
  {
    id: "db",
    type: "default",
    position: { x: 780, y: 140 },
    data: { label: "🗄️ Primary PostgreSQL" },
    style: { background: "#FF6FAE", border: "3px solid #121218", boxShadow: "4px 4px 0 #121218", fontWeight: 700, borderRadius: 8 },
  },
];

export const DEFAULT_BLUEPRINT_EDGES = [
  { id: "e1", source: "client", target: "gateway", animated: true, style: { stroke: "#121218", strokeWidth: 3 } },
  { id: "e2", source: "gateway", target: "service", animated: true, style: { stroke: "#121218", strokeWidth: 3 } },
  { id: "e3", source: "service", target: "db", animated: true, style: { stroke: "#121218", strokeWidth: 3 } },
];
