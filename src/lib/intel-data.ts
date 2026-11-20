export interface CompanyDossier {
  id: string;
  name: string;
  code: string;
  badge: string;
  accentColor: string;
  logoEmoji: string;
  targetRole: string;
  salaryRange: string;
  barRaiserPhilosophy: string;
  loopRounds: Array<{
    name: string;
    duration: string;
    format: string;
    focus: string;
  }>;
  testedWeaponry: Array<{
    pattern: string;
    importance: "CRITICAL" | "HIGH" | "MEDIUM";
    description: string;
  }>;
  gotchasAndTraps: string[];
  recommendedSlugs: string[];
}

export interface Phase2BossTwist {
  slug: string;
  bossTitle: string;
  subtitle: string;
  twistConstraint: string;
  senseiInterrogation: string;
  requiredProof: string;
  xpReward: number;
}

export interface JutsuNode {
  id: string;
  patternName: string;
  kanji: string;
  rank: "SPECIAL GRADE" | "S-RANK" | "A-RANK" | "B-RANK";
  timeComplexity: string;
  spaceComplexity: string;
  invariantFormula: string;
  explanation: string;
  codeSnippet: string;
  relatedSlugs: string[];
  tags: string[];
}

export interface DailyQuest {
  id: string;
  title: string;
  category: "ALGORITHMS" | "SYSTEMS" | "CONCURRENCY" | "ARCHITECTURE" | "GUESSR";
  description: string;
  progress: number;
  maxProgress: number;
  xpReward: number;
  completed: boolean;
  claimed: boolean;
}

export interface PrestigeTitle {
  id: string;
  title: string;
  requirement: string;
  unlocked: boolean;
  accent: string;
}

export const COMPANY_DOSSIERS: Record<string, CompanyDossier> = {
  openai: {
    id: "openai",
    name: "OpenAI",
    code: "FRONTIER-01",
    badge: "AGI LAB · SYSTEMS & SCALE",
    accentColor: "#7C4DFF",
    logoEmoji: "🧠",
    targetRole: "Research Engineer / Systems Member of Technical Staff",
    salaryRange: "$450k – $850k TC",
    barRaiserPhilosophy:
      "OpenAI looks for engineers who understand deep systems primitives: GPU memory hierarchies, KV-cache fragmentation, lock-free streaming, and clean distributed evaluation harnesses. Hand-waving algorithmic constants will immediately disqualify you.",
    loopRounds: [
      {
        name: "Round 1: Practical Systems Code",
        duration: "60 mins",
        format: "Live Code + Profiler",
        focus: "Implement a bounded memory allocator, ring buffer, or tensor serialization loop.",
      },
      {
        name: "Round 2: Algorithmic Invariants",
        duration: "45 mins",
        format: "Monaco / Screen Share",
        focus: "Hard DSA with zero-allocation constraints (Monotonic stacks, K-way merge, Interval trees).",
      },
      {
        name: "Round 3: AI Infra Architecture",
        duration: "60 mins",
        format: "Interactive Whiteboard",
        focus: "Design a high-throughput LLM serving engine with PagedAttention and speculative decoding.",
      },
      {
        name: "Round 4: Bar Raiser & Systems Deep Dive",
        duration: "45 mins",
        format: "Technical Cross-Examination",
        focus: "Dissect a real production incident: split-brain, GPU memory leaks, or race conditions.",
      },
    ],
    testedWeaponry: [
      {
        pattern: "Paged KV-Cache & Block Tables",
        importance: "CRITICAL",
        description: "Dynamic allocation of GPU memory to eliminate contiguous sequence fragmentation.",
      },
      {
        pattern: "Lock-Free SPSC/MPMC Ring Buffers",
        importance: "CRITICAL",
        description: "Zero-mutex atomic synchronization for high-frequency token generation queues.",
      },
      {
        pattern: "Reciprocal Rank Fusion (RRF)",
        importance: "HIGH",
        description: "Hybrid vector search combining sparse BM25 and dense embeddings with rank fusion.",
      },
    ],
    gotchasAndTraps: [
      "Never use mutexes when an atomic CAS or memory barrier suffices on the hot path.",
      "Always account for prefill vs. decode latency phases when discussing LLM serving.",
      "Don't ignore the hidden memory overhead of key-value caches across multi-turn sessions.",
    ],
    recommendedSlugs: ["kv-cache-paged-attention", "ring-buffer-lockfree", "hybrid-rrf-rag-ranker"],
  },
  anthropic: {
    id: "anthropic",
    name: "Anthropic",
    code: "CLAUDE-02",
    badge: "SAFETY & HIGH-RELIABILITY INFRA",
    accentColor: "#FFC82C",
    logoEmoji: "🛡️",
    targetRole: "Member of Technical Staff (Core Infrastructure)",
    salaryRange: "$400k – $800k TC",
    barRaiserPhilosophy:
      "Anthropic prizes rigorous invariant reasoning, defensive error-handling, and crystal-clear code architecture. They prefer clean, readable, modular implementations over hacky speed-optimizations that sacrifice safety.",
    loopRounds: [
      {
        name: "Round 1: Invariant & Algorithm Proof",
        duration: "45 mins",
        format: "Code + Invariant Discussion",
        focus: "Sliding window proofs, Monotonic queues, or Graph state machines with strict bounds.",
      },
      {
        name: "Round 2: Distributed Safety & Rate Limiting",
        duration: "60 mins",
        format: "System Architecture",
        focus: "Design a distributed token bucket rate limiter with sliding window logs across multi-region clusters.",
      },
      {
        name: "Round 3: Real-World Repo Debugging",
        duration: "60 mins",
        format: "Practical Git Challenge",
        focus: "Diagnose an async dead-lock or backpressure failure in an open-source agent framework.",
      },
      {
        name: "Round 4: Culture & Engineering Rigor",
        duration: "45 mins",
        format: "Behavioral & Ethics Scenario",
        focus: "Handling deployment rollbacks, safe AI evaluation pipelines, and post-mortems.",
      },
    ],
    testedWeaponry: [
      {
        pattern: "Distributed Token Bucket & Redis Cell",
        importance: "CRITICAL",
        description: "Smooth out bursty AI traffic with memory-efficient local time delta tracking.",
      },
      {
        pattern: "Raft Consensus & Split-Brain Guards",
        importance: "HIGH",
        description: "Term monotonic numbering and quorum safety under hostile network partitions.",
      },
      {
        pattern: "Monotonic Stack & Skyline Pruning",
        importance: "HIGH",
        description: "Optimal linear complexity invariants with explicit push/pop bounds.",
      },
    ],
    gotchasAndTraps: [
      "Failing to discuss clock drift (NTP skew) in distributed rate limiters.",
      "Not writing unit tests for zero/empty/negative edge cases before claiming victory.",
      "Relying on synchronous blocking calls inside async event loops.",
    ],
    recommendedSlugs: ["token-bucket-limiter", "raft-leader-election", "monotonic-stack-skyline"],
  },
  meta: {
    id: "meta",
    name: "Meta",
    code: "META-E6",
    badge: "HIGH-VELOCITY FAANG SCALE",
    accentColor: "#00C2FF",
    logoEmoji: "⚡",
    targetRole: "Senior / Staff Software Engineer (E5/E6)",
    salaryRange: "$380k – $680k TC",
    barRaiserPhilosophy:
      "Meta's coding rounds are strict 45-minute velocity tests. You must solve TWO LeetCode Medium/Hard problems completely bug-free in 40 minutes, including dry-running and stating tight Big-O bounds. In system design, you must demonstrate mastery of global caching and sharding.",
    loopRounds: [
      {
        name: "Round 1: Rapid Algorithmic Velocity",
        duration: "45 mins",
        format: "2 Coding Questions",
        focus: "Prefix sum sub-arrays, graph BFS/DFS, and dynamic programming.",
      },
      {
        name: "Round 2: Advanced Data Structures",
        duration: "45 mins",
        format: "2 Coding Questions",
        focus: "Dual heaps, monotonic stack, binary search on answer space.",
      },
      {
        name: "Round 3: High-Scale System Design",
        duration: "45 mins",
        format: "Diagram & Capacity Planning",
        focus: "Design News Feed, Instagram Stories, or WhatsApp Message Delivery (1B+ DAU).",
      },
      {
        name: "Round 4: Behavioral & Architectural Leadership",
        duration: "45 mins",
        format: "Past Projects Deep Dive",
        focus: "Driving cross-team consensus, resolving architectural debt, and mentorship.",
      },
    ],
    testedWeaponry: [
      {
        pattern: "Prefix Sum & Difference Maps",
        importance: "CRITICAL",
        description: "Zero-allocation counting of subarray targets in single pass O(N) time.",
      },
      {
        pattern: "Binary Search on Monotonic Answer",
        importance: "CRITICAL",
        description: "Koko Eating Bananas pattern to find minimum feasible throughput in O(N log Max).",
      },
      {
        pattern: "Zero-Jitter LRU Cache",
        importance: "HIGH",
        description: "Doubly linked list + hash map for strict O(1) eviction without GC spikes.",
      },
    ],
    gotchasAndTraps: [
      "Spending more than 3 minutes deliberating before articulating an initial approach.",
      "Syntactic bugs: Meta interviewers rarely provide live compiler execution in standard screens.",
      "Ignoring backpressure and read-replicas under 100M QPS fan-out scenarios.",
    ],
    recommendedSlugs: ["prefix-sum-subarray-k", "binary-search-answer-koko", "lru-cache-o1"],
  },
  databricks: {
    id: "databricks",
    name: "Databricks",
    code: "BRICKS-04",
    badge: "LOW-LEVEL SYSTEMS & ENGINES",
    accentColor: "#FF3358",
    logoEmoji: "🧱",
    targetRole: "Senior Systems Engineer (Photon Engine / Delta Lake)",
    salaryRange: "$420k – $750k TC",
    barRaiserPhilosophy:
      "Databricks evaluates your understanding of hardware reality: L1/L2 cache locality, SIMD vectorization, lock-free ring buffers, virtual memory pages, and consistent hashing. Abstract Java abstractions won't fly if you can't explain cache-line false sharing.",
    loopRounds: [
      {
        name: "Round 1: Systems & Concurrency Deep Dive",
        duration: "60 mins",
        format: "Live Coding in C++/Rust/Go",
        focus: "Lock-free SPSC buffer, memory arena allocator, or multi-threaded worker pool.",
      },
      {
        name: "Round 2: Distributed Data Partitioning",
        duration: "60 mins",
        format: "Architecture & Code",
        focus: "Consistent hash ring with virtual nodes and minimal key remapping on node failure.",
      },
      {
        name: "Round 3: Query Engine Architecture",
        duration: "60 mins",
        format: "System Design",
        focus: "Design a vectorized columnar storage engine with Parquet metadata indexing.",
      },
      {
        name: "Round 4: Bar Raiser / Executive Engineering",
        duration: "45 mins",
        format: "Architectural Defense",
        focus: "Deep dive into OS memory management, kernel bypass, and file system primitives.",
      },
    ],
    testedWeaponry: [
      {
        pattern: "Lock-Free SPSC Ring Buffer with Cache-Padding",
        importance: "CRITICAL",
        description: "Prevent false sharing with 64-byte padding on producer tail and consumer head.",
      },
      {
        pattern: "Consistent Hash Ring with Virtual Nodes",
        importance: "CRITICAL",
        description: "Even key distribution and $O(K/N)$ reshuffling when cluster nodes crash.",
      },
      {
        pattern: "O(1) LRU Eviction Engine",
        importance: "HIGH",
        description: "Zero pointer corruption under concurrent access and cold-storage eviction.",
      },
    ],
    gotchasAndTraps: [
      "Forgetting alignas(64) or hardware cache line width when designing concurrent atomics.",
      "Using standard modulo (%) inside ring buffers instead of power-of-two bitmasking (& mask).",
      "Assuming garbage collectors will keep up with high-frequency telemetry ingest.",
    ],
    recommendedSlugs: ["ring-buffer-lockfree", "consistent-hash-ring", "lru-cache-o1"],
  },
  stripe: {
    id: "stripe",
    name: "Stripe",
    code: "LEDGER-05",
    badge: "FINANCIAL RESILIENCE & APIS",
    accentColor: "#00C875",
    logoEmoji: "💳",
    targetRole: "Staff Infrastructure Engineer",
    salaryRange: "$390k – $700k TC",
    barRaiserPhilosophy:
      "Stripe's interviews are legendary for their practical, real-world development environment. You will code in a full IDE with real test suites, install npm/pip libraries, and build actual working servers. They prize idempotency, transactional integrity, and zero double-spending.",
    loopRounds: [
      {
        name: "Round 1: Practical Bug Hunter & API Build",
        duration: "60 mins",
        format: "Full IDE + Real Git Repo",
        focus: "Fix broken endpoints, parse real payloads, handle pagination and error retries.",
      },
      {
        name: "Round 2: Idempotent Ledger System Design",
        duration: "60 mins",
        format: "Interactive Whiteboard",
        focus: "Design double-entry bookkeeping with strict ACID guarantees and distributed locks.",
      },
      {
        name: "Round 3: Distributed Rate Limiting & Webhooks",
        duration: "60 mins",
        format: "Architecture & Code",
        focus: "Build a reliable webhook delivery engine with exponential backoff and dead-letter queues.",
      },
      {
        name: "Round 4: Technical Communication & Review",
        duration: "45 mins",
        format: "PR Code Review",
        focus: "Review a candidate PR for subtle concurrency bugs, security holes, and API ergonomics.",
      },
    ],
    testedWeaponry: [
      {
        pattern: "Token Bucket & Idempotency Key Caches",
        importance: "CRITICAL",
        description: "Deduplicate concurrent retry requests safely without duplicate balance charges.",
      },
      {
        pattern: "Weighted Interval Scheduling",
        importance: "HIGH",
        description: "Batch payout optimization and transaction ordering using dynamic programming.",
      },
      {
        pattern: "Raft Election Term Quorums",
        importance: "HIGH",
        description: "Ensure exactly one leader authorizes payment commits across partitions.",
      },
    ],
    gotchasAndTraps: [
      "Treating money calculations with floating point numbers (always use 64-bit integer cents!).",
      "Forgetting to design an explicit Dead-Letter Queue (DLQ) for poisoned webhook payloads.",
      "Assuming database primary keys are monotonically sequential across distributed shards.",
    ],
    recommendedSlugs: ["token-bucket-limiter", "interval-scheduler-proof", "raft-leader-election"],
  },
  jancestreet: {
    id: "jancestreet",
    name: "Jane Street",
    code: "ORDERBOOK-06",
    badge: "QUANT TECH & SUB-MICROSECOND",
    accentColor: "#FFC82C",
    logoEmoji: "🏹",
    targetRole: "Software Engineer (Trading Infrastructure)",
    salaryRange: "$450k – $950k TC",
    barRaiserPhilosophy:
      "Jane Street tests pure algorithmic clarity, invariant proofs, and sub-microsecond low-latency systems. You must be able to prove mathematical invariants on the fly and write zero-allocation code where every CPU cycle and memory fetch is accounted for.",
    loopRounds: [
      {
        name: "Round 1: Mathematical Algorithms & Invariants",
        duration: "60 mins",
        format: "Live Interactive Problem",
        focus: "Game theory, probability, custom heaps, and strict Big-O invariant proofs.",
      },
      {
        name: "Round 2: Zero-Allocation Matching Engine",
        duration: "60 mins",
        format: "Code Implementation",
        focus: "Build an in-memory limit order book with O(1) best bid/ask and B-tree depth.",
      },
      {
        name: "Round 3: Low-Latency Systems Architecture",
        duration: "60 mins",
        format: "Hardware & Network Design",
        focus: "Kernel bypass (Solarflare OpenOnload), zero-copy IPC, and lock-free ring buffers.",
      },
      {
        name: "Round 4: Deep Algorithmic Synthesis",
        duration: "60 mins",
        format: "Proof & Exploration",
        focus: "Combinatorial optimization, dynamic programming with bitmask states.",
      },
    ],
    testedWeaponry: [
      {
        pattern: "Lock-Free SPSC Ring Buffer",
        importance: "CRITICAL",
        description: "Atomic acquire-release memory semantics for zero-copy market tick streaming.",
      },
      {
        pattern: "Monotonic Invariant Rectangle Pruning",
        importance: "CRITICAL",
        description: "Strict push/pop amortized proofs without auxiliary memory allocations.",
      },
      {
        pattern: "Zero-Jitter LRU Replacement",
        importance: "HIGH",
        description: "Static node pool memory allocation to eliminate runtime heap allocations.",
      },
    ],
    gotchasAndTraps: [
      "Any runtime heap allocation (`malloc`, `new`, dynamic array resizing) in trading hot paths.",
      "Hand-waving Big-O proofs without formal induction or invariant demonstration.",
      "Not knowing the difference between memory ordering `seq_cst` vs `acquire_release`.",
    ],
    recommendedSlugs: ["ring-buffer-lockfree", "monotonic-stack-skyline", "lru-cache-o1"],
  },
};

export const PHASE_2_BOSS_TWISTS: Record<string, Phase2BossTwist> = {
  "prefix-sum-subarray-k": {
    slug: "prefix-sum-subarray-k",
    bossTitle: "PHASE 2: INFINITE STREAM MEMORY CAP",
    subtitle: "Staff Round Curveball: The Stream Never Ends!",
    twistConstraint:
      "The input is no longer an in-memory array — it is an unbounded stream arriving at 50,000 integers/sec. Your auxiliary hash map memory is capped strictly at 1,000 entries. How do you prevent out-of-memory errors while preserving exact subarray counts?",
    senseiInterrogation:
      "A naive frequency hash map will blow up your heap within 30 seconds! How do you bound memory? Can you partition the search with rolling prefix offsets, or does this require an eviction invariant?",
    requiredProof:
      "Prove that tracking rolling window prefixes with a bounded ring buffer or time-bucketed decay bounds heap space while maintaining count invariants over the active horizon.",
    xpReward: 250,
  },
  "monotonic-stack-skyline": {
    slug: "monotonic-stack-skyline",
    bossTitle: "PHASE 2: ZERO-SPACE IN-PLACE INVARIANT",
    subtitle: "Google Staff Curveball: Auxiliary Memory Dropped to O(1)!",
    twistConstraint:
      "Memory limit is strictly dropped from O(N) to O(1) auxiliary space! You cannot instantiate a stack data structure or recursive call stack. Can you calculate the largest rectangular area in O(N) time with O(1) extra space by mutating heights in-place or utilizing index pointers?",
    senseiInterrogation:
      "Stack frames are forbidden! If you cannot allocate an auxiliary array, how can you encode previous smaller heights directly into the existing memory or traverse using divide-and-conquer bounds?",
    requiredProof:
      "Demonstrate an in-place index pointer chain reusing unused sign bits or prove the impossibility under read-only memory, transitioning to an optimal cache-friendly block-processing invariant.",
    xpReward: 300,
  },
  "ring-buffer-lockfree": {
    slug: "ring-buffer-lockfree",
    bossTitle: "PHASE 2: MULTI-PRODUCER CAS SATURATION",
    subtitle: "Databricks Core Curveball: 100x Concurrency Spike!",
    twistConstraint:
      "Producer throughput just spiked by 100x! We now have MULTIPLE producers concurrently enqueueing into the same ring buffer. How do you adapt this SPSC ring into a lock-free MPMC ring buffer without introducing deadlocks or ABA pointer corruption?",
    senseiInterrogation:
      "A simple release-store on the tail will cause race condition collisions! How do you atomically reserve slots? What happens if Producer A reserves slot 1, but Producer B finishes writing slot 2 first?",
    requiredProof:
      "Formulate a two-phase commit on each slot: atomic fetch_add to claim the slot sequence, followed by slot-level sequence state transitions (empty -> committed -> consumed).",
    xpReward: 350,
  },
  "kv-cache-paged-attention": {
    slug: "kv-cache-paged-attention",
    bossTitle: "PHASE 2: SPECULATIVE DECODING ROLLBACK",
    subtitle: "OpenAI Frontier Curveball: Draft Tokens Rejected!",
    twistConstraint:
      "A speculative draft model produced 5 candidate tokens, which were stored across 2 physical VRAM blocks. The target LLM verified only 2 tokens and rejected the remaining 3. How does your Block Allocator roll back without memory leaks or race conditions?",
    senseiInterrogation:
      "You cannot simply wipe the blocks! Block 0 contains verified tokens; Block 1 contains rejected speculative tokens. How do you update logical-to-physical block tables atomically and decrement reference counts?",
    requiredProof:
      "Demonstrate atomic sequence length truncation: truncate logical table back to valid token index, return unreferenced physical blocks to the free list in O(1), and preserve shared prefix blocks.",
    xpReward: 350,
  },
  "token-bucket-limiter": {
    slug: "token-bucket-limiter",
    bossTitle: "PHASE 2: MULTI-REGION NTP CLOCK DRIFT",
    subtitle: "Stripe Scale Curveball: Server Time Moved Backwards!",
    twistConstraint:
      "Your rate limiter is deployed across 3 AWS regions. Due to a leap second or NTP sync jitter, a server's local clock moves backwards by 1,500 milliseconds. How do you prevent attackers from draining millions of tokens during clock skew?",
    senseiInterrogation:
      "If (now - lastRefill) evaluates to a negative number, what happens to your token calculation? Does the bucket empty or lock the user out entirely? How do you maintain safety without distributed locking?",
    requiredProof:
      "Clamp delta calculations: Math.max(0, current_time - last_refill). In case of severe backwards drift, fall back to monotonic hardware clocks (CLOCK_MONOTONIC_RAW) rather than wall-clock time.",
    xpReward: 250,
  },
  "lru-cache-o1": {
    slug: "lru-cache-o1",
    bossTitle: "PHASE 2: CONCURRENT READ/EVICTION WITHOUT LOCKS",
    subtitle: "Meta Infrastructure Curveball: Zero-Lock Eviction!",
    twistConstraint:
      "Under 2,000,000 reads/second, a global mutex on the doubly linked list creates catastrophic lock contention. How do you redesign this LRU cache to allow concurrent wait-free reads while background threads handle evictions (e.g. LRU-K or Clock-Pro)?",
    senseiInterrogation:
      "Every 'get' operation updates node pointers to move it to the head! In a multi-threaded system, this turns read operations into write operations! How do you eliminate write contention on read queries?",
    requiredProof:
      "Decouple read tracking from list mutation using thread-local read buffers or Clock/Second-Chance bit flags, batching eviction pointer reorganizations onto asynchronous background worker threads.",
    xpReward: 300,
  },
};

export const JUTSU_NODES: Record<string, JutsuNode> = {
  "monotonic-stack": {
    id: "monotonic-stack",
    patternName: "MONOTONIC STACK INVARIANT",
    kanji: "単調積層の術",
    rank: "SPECIAL GRADE",
    timeComplexity: "O(N) Amortized",
    spaceComplexity: "O(N)",
    invariantFormula: "stack[k] < stack[k+1] (Strictly Increasing/Decreasing)",
    explanation:
      "Maintains elements in strictly sorted order. An incoming element pops all violating elements, simultaneously resolving their nearest smaller/greater boundaries in a single linear pass.",
    codeSnippet: `def nearest_greater(nums: list[int]) -> list[int]:
    stack, res = [], [-1] * len(nums)
    for i, x in enumerate(nums):
        while stack and nums[stack[-1]] < x:
            res[stack.pop()] = x
        stack.append(i)
    return res`,
    relatedSlugs: ["monotonic-stack-skyline"],
    tags: ["Nearest Smaller", "Histogram Area", "Stock Spans", "Linear Scan"],
  },
  "sliding-window": {
    id: "sliding-window",
    patternName: "TWO-POINTER SLIDING WINDOW",
    kanji: "滑動窓の術",
    rank: "A-RANK",
    timeComplexity: "O(N)",
    spaceComplexity: "O(1) or O(K)",
    invariantFormula: "Valid(window[L..R]) is monotonic with respect to R and L",
    explanation:
      "Expand R until the window becomes invalid, then contract L until validity is restored. Requires that expanding R can only monotonically increase or decrease the constraint metric (no mixed negative values).",
    codeSnippet: `def max_window_k(nums: list[int], k: int) -> int:
    left = total = best = 0
    for right, x in enumerate(nums):
        total += x
        while total > k and left <= right:
            total -= nums[left]
            left += 1
        best = max(best, right - left + 1)
    return best`,
    relatedSlugs: ["prefix-sum-subarray-k"],
    tags: ["Contiguous Subarray", "Substring", "Monotonic Invariant"],
  },
  "binary-search-answer": {
    id: "binary-search-answer",
    patternName: "BINARY SEARCH ON ANSWER SPACE",
    kanji: "二分探索の極意",
    rank: "S-RANK",
    timeComplexity: "O(N log(Max - Min))",
    spaceComplexity: "O(1)",
    invariantFormula: "Predicate(speed) is Monotonic: False...False True...True",
    explanation:
      "When finding the minimum speed, capacity, or throughput that satisfies a condition, don't simulate all values. Test the midpoint in O(N); if feasible, search the lower half; if not, search the upper half.",
    codeSnippet: `def min_feasible_speed(nums: list[int], h: int) -> int:
    def feasible(speed: int) -> bool:
        return sum((x + speed - 1) // speed for x in nums) <= h
    low, high = 1, max(nums)
    while low < high:
        mid = (low + high) // 2
        if feasible(mid):
            high = mid
        else:
            low = mid + 1
    return low`,
    relatedSlugs: ["binary-search-answer-koko"],
    tags: ["Koko Eating", "Capacity Optimization", "Monotonic Predicate"],
  },
  "lock-free-ring": {
    id: "lock-free-ring",
    patternName: "LOCK-FREE SPSC RING BUFFER",
    kanji: "無錠環状記憶の陣",
    rank: "SPECIAL GRADE",
    timeComplexity: "O(1) Wait-Free",
    spaceComplexity: "O(Capacity) Cache-Padded",
    invariantFormula: "(tail - head) <= Capacity & alignas(64) padding",
    explanation:
      "Decouples producer and consumer onto separate 64-byte cache lines. Producer updates tail with Release semantics; Consumer updates head with Acquire semantics. Zero mutexes, zero context switches.",
    codeSnippet: `// Hardware cache-line alignment
alignas(64) std::atomic<uint64_t> tail{0};
alignas(64) std::atomic<uint64_t> head{0};
// Bitmask index wrapping (Capacity must be power of 2)
uint64_t idx = current_tail & (CAPACITY - 1);`,
    relatedSlugs: ["ring-buffer-lockfree"],
    tags: ["Concurrency", "Low Latency", "Zero Mutex", "High Throughput"],
  },
  "paged-attention": {
    id: "paged-attention",
    patternName: "PAGED KV-CACHE ALLOCATION",
    kanji: "仮想頁注意機構",
    rank: "SPECIAL GRADE",
    timeComplexity: "O(1) Block Lookup",
    spaceComplexity: "Bounded to < 1 Block Waste",
    invariantFormula: "Logical_Block -> Physical_Block_Table[Token_Idx / 16]",
    explanation:
      "Borrowed from OS virtual memory paging. Stores LLM key/value cache tokens in non-contiguous 16-token physical blocks, enabling dynamic on-demand token growth and zero-copy shared prefix forks.",
    codeSnippet: `class BlockTable:
    def __init__(self, block_size=16):
        self.block_size = block_size
        self.table = [] # maps logical chunk -> physical block ID
    def append_token(self, token_idx: int, free_pool) -> int:
        if token_idx % self.block_size == 0:
            self.table.append(free_pool.allocate_block())
        return self.table[-1]`,
    relatedSlugs: ["kv-cache-paged-attention"],
    tags: ["AI Systems", "LLM Inference", "VRAM Optimization", "Paged Memory"],
  },
  "consistent-hash": {
    id: "consistent-hash",
    patternName: "CONSISTENT HASH RING & VIRTUAL NODES",
    kanji: "一貫性分散輪",
    rank: "S-RANK",
    timeComplexity: "O(log(N * V)) Lookup",
    spaceComplexity: "O(N * V)",
    invariantFormula: "hash(key) -> next_clockwise_server(ring)",
    explanation:
      "Maps both servers and keys to a 32-bit circular ring. When a server node crashes or joins, only K/N keys are reshuffled. Virtual nodes ensure uniform load balancing across unequal hardware.",
    codeSnippet: `class ConsistentHashRing:
    def __init__(self, v_nodes=100):
        self.v_nodes = v_nodes
        self.ring = [] # sorted list of (hash_val, node_id)
    def get_node(self, key: str) -> str:
        h = sha256(key.encode()).hexdigest()
        idx = bisect_right([val for val, _ in self.ring], h)
        return self.ring[idx % len(self.ring)][1]`,
    relatedSlugs: ["consistent-hash-ring"],
    tags: ["Distributed Systems", "Sharding", "Cache Cluster", "Minimal Reshuffle"],
  },
};

export const SHONEN_RANKS = [
  {
    rank: "GENIN (NOVICE)",
    title: "Inked Genin",
    level: 1,
    minXp: 0,
    maxXp: 300,
    color: "#E5E0D5",
    badge: "🥋 WHITE BELT",
    description: "Mastering foundational time complexity, hash tables, and simple invariants.",
  },
  {
    rank: "CHŪNIN (MID-LEVEL)",
    title: "Chūnin Tactician",
    level: 2,
    minXp: 301,
    maxXp: 900,
    color: "#00C2FF",
    badge: "🗡️ DUAL BLADES",
    description: "Proficient in Monotonic Stacks, Binary Search on Answer, and dynamic programming.",
  },
  {
    rank: "JŌNIN (SENIOR)",
    title: "Senior Jōnin Vanguard",
    level: 3,
    minXp: 901,
    maxXp: 2000,
    color: "#FFC82C",
    badge: "⚡ GOLD LEAF KUNAI",
    description: "Expert in lock-free ring buffers, high-throughput rate limiters, and system design.",
  },
  {
    rank: "SPECIAL GRADE ARCHITECT (STAFF+)",
    title: "Special Grade Shonen Architect",
    level: 4,
    minXp: 2001,
    maxXp: 99999,
    color: "#FF3358",
    badge: "👑 OBSIDIAN DRAGON SEAL",
    description: "Dominates Paged KV Caches, Raft consensus, zero-allocation engines, and Staff Loops.",
  },
];

export const INITIAL_PRESTIGE_TITLES: PrestigeTitle[] = [
  { id: "t1", title: "Zero-Allocation Ronin", requirement: "Complete a Vol. 03 Systems problem with O(1) space", unlocked: true, accent: "#FFC82C" },
  { id: "t2", title: "Distributed Consensus Sorcerer", requirement: "Stamp approval on a Raft Distributed Blueprint", unlocked: true, accent: "#7C4DFF" },
  { id: "t3", title: "Kernel Hashmap Hashira", requirement: "Score 100% on Bounty Guessr L6 staff tier", unlocked: false, accent: "#00C2FF" },
  { id: "t4", title: "Monotonic Stack Shinobi", requirement: "Solve Largest Inked Panel under 15 minutes", unlocked: true, accent: "#FF3358" },
  { id: "t5", title: "Cache-Line Sensei", requirement: "Defeat Phase 2 on Lock-Free Ring Buffer", unlocked: false, accent: "#00C875" },
  { id: "t6", title: "Speculative Decoding Prodigy", requirement: "Solve Paged KV-Cache with zero hints", unlocked: false, accent: "#FF6FAE" },
];

export const DEFAULT_DAILY_QUESTS: DailyQuest[] = [
  {
    id: "q1",
    title: "Break a Concurrency or Systems Seal",
    category: "CONCURRENCY",
    description: "Complete or unlock all 3 Breakthrough Panels on any Vol. 03 Ironworks problem.",
    progress: 1,
    maxProgress: 1,
    xpReward: 150,
    completed: true,
    claimed: false,
  },
  {
    id: "q2",
    title: "Score 90%+ Accuracy on Bounty Guessr",
    category: "GUESSR",
    description: "Submit a salary or rating guess within 10% of the true target wanted value.",
    progress: 0,
    maxProgress: 1,
    xpReward: 100,
    completed: false,
    claimed: false,
  },
  {
    id: "q3",
    title: "Defeat a Phase 2 Boss Twist",
    category: "ALGORITHMS",
    description: "Overcome an emergency Phase 2 follow-up constraint inside Shell Break.",
    progress: 0,
    maxProgress: 1,
    xpReward: 250,
    completed: false,
    claimed: false,
  },
];
