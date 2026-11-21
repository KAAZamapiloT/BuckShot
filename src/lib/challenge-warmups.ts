export const challengeWarmups: Record<string, { prompt: string; explanation: string }> = {
  "prefix-sum-subarray-k": {
    prompt: "In [2, −2, 2], how many contiguous slices sum to 2?",
    explanation: "Three. Either 2 can stand alone, and the whole array also sums to 2. A count that only remembers whether a prefix sum appeared can miss a slice.",
  },
  "monotonic-stack-skyline": {
    prompt: "Three adjacent bars have heights [3, 2, 3] and width 1 each. What is the largest rectangle you can draw under them?",
    explanation: "Area 6. A rectangle two units tall spans all three bars. Either taller bar alone gives area 3.",
  },
  "interval-scheduler-proof": {
    prompt: "One job pays 9 for hours 1–5. Two others pay 4 each for hours 1–2 and 3–4. Which schedule wins?",
    explanation: "Take the long job for 9. Taking the earliest finish first leaves a best possible total of 8, even though it fits two jobs.",
  },
  "ring-buffer-lockfree": {
    prompt: "An eight-slot ring uses slots 0 through 7. The producer has just written slot 7. Which slot comes next, and when is it safe to reuse it?",
    explanation: "Slot 0 comes next. Wrapping the index finds the address. The producer still needs to observe that the consumer has released the slot before overwriting it.",
  },
  "consistent-hash-ring": {
    prompt: "Shard tokens sit at 20°, 120°, and 240°. A key hashes to 350°. Which shard owns it? What if a token joins at 355°?",
    explanation: "Walk clockwise. Initially the first token is 20° after wrapping past zero. With the new token present, the walk stops at 355° instead.",
  },
  "token-bucket-limiter": {
    prompt: "An empty bucket holds at most 5 tokens and gains 2 per second. After 4 idle seconds, how many simultaneous one-token requests can pass?",
    explanation: "Five. Eight tokens would have arrived, but storage caps at five. The sixth request must wait for another refill.",
  },
  "kv-cache-paged-attention": {
    prompt: "A cache block holds 4 tokens. A sequence with 8 tokens grows by one. How many blocks does it need now?",
    explanation: "Three blocks. The first two stay full. The ninth token occupies the first slot of a new block, leaving three slots for later tokens.",
  },
  "binary-search-answer-koko": {
    prompt: "Batches of 5 MB and 7 MB must finish in 3 slots. Each slot serves one batch. Does 4 MB per slot work? What is the minimum speed?",
    explanation: "At speed 4, each batch needs two slots. At speed 5, the first needs one and the second needs two. Since 4 fails and slower speeds cannot help, 5 is the minimum.",
  },
  "lru-cache-o1": {
    prompt: "A two-entry cache receives put(A), put(B), get(A), put(C). Which key leaves?",
    explanation: "B leaves. Reading A made it the most recently used entry, even though A was inserted first.",
  },
  "raft-leader-election": {
    prompt: "In one term, two candidates in a five-node cluster each claim three votes. Can both claims be valid?",
    explanation: "No. Two groups of three among five nodes share at least one voter. Both claims would require that voter to cast two votes in the same term.",
  },
  "hybrid-rrf-rag-ranker": {
    prompt: "With RRF smoothing set to 60, document A ranks first in one list and is absent from the other. B ranks second in both. Which scores higher?",
    explanation: "B scores 2/62, about 0.0323. A scores 1/61, about 0.0164. Appearing near the top of both lists outweighs a single first-place result here.",
  },
};
