// Comprehensive Question Bank & Generator with Canonical IDs, Topic Categorization, and Multi-Platform Resources

export interface QuestionResource {
  type: "video" | "article" | "cheatsheet" | "docs";
  title: string;
  url: string;
  source: string; // e.g. "Striver", "NeetCode", "ByteByteGo", "GeeksforGeeks", "System Design Primer", "Roadmap.sh"
}

export interface InterviewQuestionItem {
  id: string; // Canonical persistent ID e.g. "dsa-two-sum", "sys-rate-limiter"
  title: string;
  category: "dsa" | "system" | "fundamentals" | "hr" | "specific";
  topic: string;
  difficulty: "Easy" | "Medium" | "Hard";
  roundTag: string;
  frequency: "Must Do" | "Frequently Asked" | "Trending" | "High Probability";
  companies: string[];
  leetcodeUrl?: string;
  gfgUrl?: string;
  resources: QuestionResource[];
  solutionStrategy: string;
  timeComplexity?: string;
  spaceComplexity?: string;
  keyInsights?: string[];
}

export interface TopicCheatSheet {
  topic: string;
  category: "dsa" | "system" | "fundamentals" | "hr";
  summary: string;
  keyPatterns: string[];
  resources: { title: string; url: string; source: string }[];
}

export function slugify(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

// -------------------------------------------------------------
// TOPIC CHEAT SHEETS & CURATED GUIDES
// -------------------------------------------------------------
export const TOPIC_CHEAT_SHEETS: Record<string, TopicCheatSheet> = {
  "Arrays & Hash Maps": {
    topic: "Arrays & Hash Maps",
    category: "dsa",
    summary: "Hash maps allow O(1) average lookups to trade space for time. Array problems often leverage prefix sums, frequency buckets, and running counters.",
    keyPatterns: ["Complement lookup (Two Sum pattern)", "Frequency counting & buckets", "Prefix/Suffix cumulative arrays", "In-place array modifications"],
    resources: [
      { title: "NeetCode Arrays & Hashing Roadmap", url: "https://neetcode.io/roadmap", source: "NeetCode" },
      { title: "Striver's A2Z Arrays Sheet", url: "https://takeuforward.org/strivers-a2z-dsa-course/strivers-a2z-dsa-course-sheet-2/", source: "takeuforward" },
      { title: "GFG Arrays Cheat Sheet", url: "https://www.geeksforgeeks.org/array-data-structure/", source: "GeeksforGeeks" }
    ]
  },
  "Two Pointers": {
    topic: "Two Pointers",
    category: "dsa",
    summary: "Used on sorted arrays or sequences to converge from both ends or run fast/slow pointers in O(N) time and O(1) space.",
    keyPatterns: ["Left & right converging pointers (Sorted sum, Container water)", "Slow and Fast runner (Cycle detection, Midpoint)", "In-place compaction & removal"],
    resources: [
      { title: "Two Pointer Technique Explained", url: "https://takeuforward.org/data-structure/two-sum-check-if-a-pair-with-given-sum-exists-in-array/", source: "takeuforward" },
      { title: "NeetCode Two Pointers Practice", url: "https://neetcode.io/problems/two-integer-sum-ii", source: "NeetCode" }
    ]
  },
  "Sliding Window": {
    topic: "Sliding Window",
    category: "dsa",
    summary: "Tracks contiguous subarrays/substrings using dynamic or fixed window boundaries, avoiding recomputation.",
    keyPatterns: ["Fixed window: Rolling max/sum", "Dynamic window: Expand right until invalid, then contract left", "Character frequency hash map tracking"],
    resources: [
      { title: "Sliding Window Algorithm Guide", url: "https://takeuforward.org/data-structure/length-of-longest-substring-without-any-repeating-character/", source: "takeuforward" },
      { title: "NeetCode Sliding Window", url: "https://neetcode.io/problems/sliding-window-maximum", source: "NeetCode" }
    ]
  },
  "Stack & Queues": {
    topic: "Stack & Queues",
    category: "dsa",
    summary: "LIFO for nested structures & monotonic sequences; FIFO for level-by-level BFS traversal and task scheduling.",
    keyPatterns: ["Monotonic stack (Next Greater Element, Histogram)", "Matching parentheses & expression evaluation", "Min/Max stack design with auxiliary encoding"],
    resources: [
      { title: "Monotonic Stack Deep Dive", url: "https://takeuforward.org/data-structure/next-greater-element-using-stack/", source: "takeuforward" },
      { title: "NeetCode Stack Practice", url: "https://neetcode.io/problems/daily-temperatures", source: "NeetCode" }
    ]
  },
  "Linked Lists": {
    topic: "Linked Lists",
    category: "dsa",
    summary: "Pointer manipulation fundamentals. Watch out for null checks, cycles, and maintaining dummy head nodes.",
    keyPatterns: ["Dummy node for edge case simplicity", "Floyd's Tortoise and Hare (Cycle finding)", "Multi-pointer reversals (prev, curr, next)"],
    resources: [
      { title: "Striver Linked List Master Sheet", url: "https://takeuforward.org/linked-list/reverse-a-linked-list-and-recursive-iterative/", source: "takeuforward" },
      { title: "LRU Cache Doubly-Linked Implementation", url: "https://takeuforward.org/data-structure/lru-cache-implementation/", source: "takeuforward" }
    ]
  },
  "Binary Trees & BST": {
    topic: "Binary Trees & BST",
    category: "dsa",
    summary: "DFS (Pre/In/Post order) for depth & structural properties; BFS for level order & shortest tree distance.",
    keyPatterns: ["Recursive subtree breakdown (divide & conquer)", "BST in-order traversal yields sorted order", "Tree diameter & LCA bottom-up propagation"],
    resources: [
      { title: "Striver Binary Tree Series", url: "https://takeuforward.org/data-structure/lowest-common-ancestor-for-two-given-nodes/", source: "takeuforward" },
      { title: "NeetCode Trees Roadmap", url: "https://neetcode.io/problems/level-order-traversal-of-binary-tree", source: "NeetCode" }
    ]
  },
  "Dynamic Programming": {
    topic: "Dynamic Programming",
    category: "dsa",
    summary: "Breaking problems into overlapping subproblems with optimal substructure. Transition from Memoization (top-down) to Tabulation (bottom-up).",
    keyPatterns: ["1D State (Fibonacci, House Robber, Coin Change)", "2D Grid / String DP (LCS, Edit Distance)", "Knapsack 0/1 & Unbounded", "DP on Subsequences & Intervals"],
    resources: [
      { title: "Striver's DP Master Course", url: "https://takeuforward.org/dynamic-programming/striver-dp-series-dynamic-programming-problems/", source: "takeuforward" },
      { title: "NeetCode 1-D & 2-D DP", url: "https://neetcode.io/problems/coin-change", source: "NeetCode" }
    ]
  },
  "Graphs & Searches": {
    topic: "Graphs & Searches",
    category: "dsa",
    summary: "Node and edge traversals. BFS for unweighted shortest paths; Dijkstra for weighted; Kahn's/DFS for Topological Sort & Cycle detection.",
    keyPatterns: ["Grid DFS/BFS (Islands, flood fill)", "Topological Sort via Kahn's in-degrees", "Dijkstra's Priority Queue for shortest paths", "Disjoint Set Union (Kruskal's)"],
    resources: [
      { title: "Striver Graph Series", url: "https://takeuforward.org/graph/striver-graph-series-top-graph-interview-questions/", source: "takeuforward" },
      { title: "NeetCode Advanced Graphs", url: "https://neetcode.io/problems/course-schedule", source: "NeetCode" }
    ]
  },
  "System Design Architecture": {
    topic: "System Design Architecture",
    category: "system",
    summary: "Designing scalable, fault-tolerant distributed web architectures with load balancers, caching, microservices, and databases.",
    keyPatterns: ["Horizontal scaling & Load balancing", "Cache-aside & Redis caching layers", "Database Sharding & Replication", "Asynchronous processing with Message Queues"],
    resources: [
      { title: "System Design Primer (Donne Martin)", url: "https://github.com/donnemartin/system-design-primer", source: "System Design Primer" },
      { title: "ByteByteGo System Design YouTube", url: "https://www.youtube.com/@ByteByteGo", source: "ByteByteGo" },
      { title: "Gaurav Sen System Design Playlist", url: "https://www.youtube.com/c/GauravSensei", source: "Gaurav Sen" }
    ]
  },
  "Operating Systems": {
    topic: "Operating Systems",
    category: "fundamentals",
    summary: "Core OS principles: process scheduling, memory virtualization, multi-threading, concurrency locks, and deadlocks.",
    keyPatterns: ["Process vs Thread memory layout", "Mutex vs Semaphore & Banker's Algorithm", "Virtual Memory & Paging (Page faults, TLB)", "Inter-process Communication (IPC)"],
    resources: [
      { title: "CS Fundamentals OS Guide", url: "https://roadmap.sh/computer-science", source: "Roadmap.sh" },
      { title: "TakeUforward OS Notes", url: "https://takeuforward.org/operating-systems/deadlocks-in-operating-systems/", source: "takeuforward" }
    ]
  },
  "DBMS & SQL": {
    topic: "DBMS & SQL",
    category: "fundamentals",
    summary: "Relational integrity, ACID guarantees, transaction isolation, indexing internals (B+ Trees), and query optimization.",
    keyPatterns: ["ACID properties with WAL disk logging", "B+ Tree indexing for point & range scans", "Normalization 1NF to BCNF trade-offs", "SQL JOINs and Execution Plans"],
    resources: [
      { title: "Use The Index, Luke (Indexing Deep Dive)", url: "https://use-the-index-luke.com/", source: "Index Luke" },
      { title: "TakeUforward DBMS Sheet", url: "https://takeuforward.org/dbms/acid-properties-in-dbms/", source: "takeuforward" }
    ]
  },
  "Computer Networks": {
    topic: "Computer Networks",
    category: "fundamentals",
    summary: "OSI and TCP/IP stack, 3-way handshake, TLS/HTTPS, DNS resolution, and REST vs WebSockets.",
    keyPatterns: ["TCP 3-Way Handshake & Congestion Control", "HTTP/1.1 vs HTTP/2 vs HTTP/3 (QUIC)", "DNS lookup hierarchy & Caching", "IP addressing & Subnetting"],
    resources: [
      { title: "Roadmap.sh Networking Guide", url: "https://roadmap.sh/guides/http-networking", source: "Roadmap.sh" },
      { title: "GFG Computer Networks Series", url: "https://www.geeksforgeeks.org/computer-network-tutorials/", source: "GeeksforGeeks" }
    ]
  },
  "STAR & Behavioral": {
    topic: "STAR & Behavioral",
    category: "hr",
    summary: "Situation, Task, Action, Result structured responses with quantifiable engineering impact and leadership ownership.",
    keyPatterns: ["STAR framework structuring", "Handling team conflicts constructively", "Post-mortem incident leadership", "Quantifying business impact in metrics"],
    resources: [
      { title: "The Muse STAR Interview Guide", url: "https://www.themuse.com/advice/star-interview-method", source: "The Muse" },
      { title: "Amazon 16 Leadership Principles", url: "https://www.amazon.jobs/content/en/our-workplace/leadership-principles", source: "Amazon Careers" },
      { title: "Google Engineering Post-Mortem Culture", url: "https://sre.google/sre-book/postmortem-culture/", source: "Google SRE Book" }
    ]
  }
};

const ALL_COMPANIES = ["Google", "Amazon", "Microsoft", "Adobe", "Flipkart", "Zoho", "TCS", "Infosys", "Wipro", "Cognizant", "Accenture", "Deloitte"];

// -------------------------------------------------------------
// 1. Curated Master DSA Questions
// -------------------------------------------------------------
export const MASTER_DSA_QUESTIONS: InterviewQuestionItem[] = [
  // --- Arrays & Hash Maps ---
  {
    id: "dsa-two-sum",
    title: "Two Sum",
    category: "dsa",
    topic: "Arrays & Hash Maps",
    difficulty: "Easy",
    roundTag: "Online Assessment & Technical Screen",
    frequency: "Must Do",
    companies: ALL_COMPANIES,
    leetcodeUrl: "https://leetcode.com/problems/two-sum/",
    gfgUrl: "https://www.geeksforgeeks.org/check-if-pair-with-given-sum-exists-in-array/",
    resources: [
      { type: "video", title: "NeetCode Two Sum Complete Video Solution", url: "https://www.youtube.com/watch?v=KLlXCFG5TnA", source: "NeetCode" },
      { type: "article", title: "Striver Two Sum Optimal Approach & Code", url: "https://takeuforward.org/data-structure/two-sum-check-if-a-pair-with-given-sum-exists-in-array/", source: "takeuforward" }
    ],
    timeComplexity: "O(N)",
    spaceComplexity: "O(N)",
    keyInsights: ["Use a hash map to store `target - num` as key and current index as value in a single pass."],
    solutionStrategy: "Iterate through the array once. For each element `x`, check if `target - x` exists in the hash map. If found, return both indices; otherwise, store `x` with its index in the map."
  },
  {
    id: "dsa-contains-duplicate",
    title: "Contains Duplicate",
    category: "dsa",
    topic: "Arrays & Hash Maps",
    difficulty: "Easy",
    roundTag: "Online Assessment",
    frequency: "Must Do",
    companies: ALL_COMPANIES,
    leetcodeUrl: "https://leetcode.com/problems/contains-duplicate/",
    gfgUrl: "https://www.geeksforgeeks.org/check-given-array-contains-duplicate-elements-within-k-distance/",
    resources: [
      { type: "video", title: "Contains Duplicate HashSet Solution", url: "https://www.youtube.com/watch?v=3OamzN90kPg", source: "NeetCode" }
    ],
    timeComplexity: "O(N)",
    spaceComplexity: "O(N)",
    solutionStrategy: "Add elements to a HashSet as you iterate. If an element already exists in the set, return true. If loop completes, return false."
  },
  {
    id: "dsa-valid-anagram",
    title: "Valid Anagram",
    category: "dsa",
    topic: "Arrays & Hash Maps",
    difficulty: "Easy",
    roundTag: "Round 1 (Coding)",
    frequency: "Must Do",
    companies: ALL_COMPANIES,
    leetcodeUrl: "https://leetcode.com/problems/valid-anagram/",
    gfgUrl: "https://www.geeksforgeeks.org/check-whether-two-strings-are-anagram-of-each-other/",
    resources: [
      { type: "video", title: "NeetCode Valid Anagram", url: "https://www.youtube.com/watch?v=9UtInBqnCgA", source: "NeetCode" }
    ],
    timeComplexity: "O(N)",
    spaceComplexity: "O(1) (26 chars)",
    solutionStrategy: "Check lengths first. Use a frequency array of size 26; increment for characters in `s` and decrement for `t`. If all frequencies remain 0, return true."
  },
  {
    id: "dsa-group-anagrams",
    title: "Group Anagrams",
    category: "dsa",
    topic: "Arrays & Hash Maps",
    difficulty: "Medium",
    roundTag: "Round 1 (Coding)",
    frequency: "Frequently Asked",
    companies: ["Amazon", "Google", "Microsoft", "Flipkart", "Adobe"],
    leetcodeUrl: "https://leetcode.com/problems/group-anagrams/",
    gfgUrl: "https://www.geeksforgeeks.org/given-a-sequence-of-words-print-all-anagrams-together/",
    resources: [
      { type: "video", title: "NeetCode Group Anagrams Explained", url: "https://www.youtube.com/watch?v=vzdNOK2oQ2g", source: "NeetCode" },
      { type: "article", title: "TakeUforward Group Anagrams Tutorial", url: "https://takeuforward.org/data-structure/group-anagrams-together/", source: "takeuforward" }
    ],
    timeComplexity: "O(N * K)",
    spaceComplexity: "O(N * K)",
    solutionStrategy: "Map each string to a character count signature `[count of a-z]`. Group strings with identical signatures in a HashMap and return values."
  },
  {
    id: "dsa-top-k-frequent",
    title: "Top K Frequent Elements",
    category: "dsa",
    topic: "Arrays & Hash Maps",
    difficulty: "Medium",
    roundTag: "Round 1 (Coding)",
    frequency: "Trending",
    companies: ["Amazon", "Google", "Microsoft", "Flipkart", "TCS"],
    leetcodeUrl: "https://leetcode.com/problems/top-k-frequent-elements/",
    gfgUrl: "https://www.geeksforgeeks.org/find-k-numbers-occurrences-given-array/",
    resources: [
      { type: "video", title: "Bucket Sort O(N) for Top K Elements", url: "https://www.youtube.com/watch?v=YPTqKIgVk-k", source: "NeetCode" },
      { type: "article", title: "TakeUforward Top K Frequent Tutorial", url: "https://takeuforward.org/arrays/top-k-frequent-elements/", source: "takeuforward" }
    ],
    timeComplexity: "O(N)",
    spaceComplexity: "O(N)",
    solutionStrategy: "Count frequencies in a map. Create buckets array where index represents frequency. Traverse buckets from highest frequency downwards until K elements are collected."
  },
  {
    id: "dsa-product-except-self",
    title: "Product of Array Except Self",
    category: "dsa",
    topic: "Arrays & Hash Maps",
    difficulty: "Medium",
    roundTag: "Round 1 (Coding)",
    frequency: "Must Do",
    companies: ["Amazon", "Microsoft", "Google", "Adobe", "Flipkart", "Infosys"],
    leetcodeUrl: "https://leetcode.com/problems/product-of-array-except-self/",
    gfgUrl: "https://www.geeksforgeeks.org/a-product-array-puzzle/",
    resources: [
      { type: "video", title: "NeetCode Prefix & Suffix Products Solution", url: "https://www.youtube.com/watch?v=bNvIQI2wAjk", source: "NeetCode" },
      { type: "article", title: "Striver Product of Array Except Self", url: "https://takeuforward.org/data-structure/product-of-array-except-itself/", source: "takeuforward" }
    ],
    timeComplexity: "O(N)",
    spaceComplexity: "O(1) extra",
    solutionStrategy: "Initialize output array with prefix products (left to right). Then iterate backwards from right maintaining a running suffix product accumulator."
  },
  {
    id: "dsa-longest-consecutive-sequence",
    title: "Longest Consecutive Sequence",
    category: "dsa",
    topic: "Arrays & Hash Maps",
    difficulty: "Medium",
    roundTag: "Round 2 (DSA)",
    frequency: "Frequently Asked",
    companies: ["Google", "Amazon", "Microsoft", "Flipkart", "Adobe"],
    leetcodeUrl: "https://leetcode.com/problems/longest-consecutive-sequence/",
    gfgUrl: "https://www.geeksforgeeks.org/longest-consecutive-subsequence/",
    resources: [
      { type: "video", title: "Striver Longest Consecutive Sequence Video", url: "https://www.youtube.com/watch?v=oO5uLE7EUlM", source: "takeuforward" },
      { type: "article", title: "NeetCode Longest Consecutive Guide", url: "https://neetcode.io/problems/longest-consecutive-sequence", source: "NeetCode" }
    ],
    timeComplexity: "O(N)",
    spaceComplexity: "O(N)",
    solutionStrategy: "Insert all elements into a HashSet. Iterate through numbers; if `num - 1` is not in set, loop with `num + 1, num + 2...` to measure streak length and update max."
  },

  // --- Two Pointers & Sliding Window ---
  {
    id: "dsa-3sum",
    title: "3Sum",
    category: "dsa",
    topic: "Two Pointers",
    difficulty: "Medium",
    roundTag: "Round 1 (Coding)",
    frequency: "Must Do",
    companies: ["Google", "Amazon", "Microsoft", "Adobe", "Flipkart"],
    leetcodeUrl: "https://leetcode.com/problems/3sum/",
    gfgUrl: "https://www.geeksforgeeks.org/find-a-triplet-that-sum-to-a-given-value/",
    resources: [
      { type: "video", title: "NeetCode 3Sum Complete Guide", url: "https://www.youtube.com/watch?v=jzZsG8n2R9A", source: "NeetCode" },
      { type: "article", title: "Striver 3Sum Optimal Solution", url: "https://takeuforward.org/data-structure/3-sum-find-triplets-that-add-up-to-a-zero/", source: "takeuforward" }
    ],
    timeComplexity: "O(N^2)",
    spaceComplexity: "O(1) extra",
    solutionStrategy: "Sort the array. Loop `i` from `0..n-3`. Skip duplicates for `i`. Run two pointers `left = i + 1` and `right = n - 1` to find pairs summing to `-nums[i]`, skipping duplicate values."
  },
  {
    id: "dsa-container-most-water",
    title: "Container With Most Water",
    category: "dsa",
    topic: "Two Pointers",
    difficulty: "Medium",
    roundTag: "Round 1 (Coding)",
    frequency: "Frequently Asked",
    companies: ["Amazon", "Google", "Microsoft", "Adobe", "Flipkart", "Zoho"],
    leetcodeUrl: "https://leetcode.com/problems/container-with-most-water/",
    gfgUrl: "https://www.geeksforgeeks.org/container-with-most-water/",
    resources: [
      { type: "video", title: "Container With Most Water Two Pointers", url: "https://www.youtube.com/watch?v=UuiTKBwPgAo", source: "NeetCode" },
      { type: "article", title: "TakeUforward Container with Most Water", url: "https://takeuforward.org/data-structure/container-with-most-water/", source: "takeuforward" }
    ],
    timeComplexity: "O(N)",
    spaceComplexity: "O(1)",
    solutionStrategy: "Start with two pointers at index `0` and `n - 1`. Calculate current area `(right - left) * min(h[left], h[right])`. Move the pointer with the smaller height inward."
  },
  {
    id: "dsa-trapping-rain-water",
    title: "Trapping Rain Water",
    category: "dsa",
    topic: "Two Pointers",
    difficulty: "Hard",
    roundTag: "Round 2 (DSA)",
    frequency: "Must Do",
    companies: ["Google", "Amazon", "Microsoft", "Adobe", "Flipkart"],
    leetcodeUrl: "https://leetcode.com/problems/trapping-rain-water/",
    gfgUrl: "https://www.geeksforgeeks.org/trapping-rain-water/",
    resources: [
      { type: "video", title: "Striver Rainwater Trapping (2 Pointers)", url: "https://www.youtube.com/watch?v=m18Hntz4go8", source: "takeuforward" },
      { type: "article", title: "NeetCode Trapping Rain Water Guide", url: "https://neetcode.io/problems/trapping-rain-water", source: "NeetCode" }
    ],
    timeComplexity: "O(N)",
    spaceComplexity: "O(1)",
    solutionStrategy: "Initialize `left = 0`, `right = n - 1`, `leftMax = 0`, `rightMax = 0`. Move pointer on the smaller max height side inward, adding `max - height` to total."
  },
  {
    id: "dsa-best-time-buy-sell-stock",
    title: "Best Time to Buy and Sell Stock",
    category: "dsa",
    topic: "Sliding Window",
    difficulty: "Easy",
    roundTag: "Online Assessment",
    frequency: "Must Do",
    companies: ALL_COMPANIES,
    leetcodeUrl: "https://leetcode.com/problems/best-time-to-buy-and-sell-stock/",
    gfgUrl: "https://www.geeksforgeeks.org/best-time-to-buy-and-sell-stock/",
    resources: [
      { type: "video", title: "Stock Buy & Sell NeetCode Video", url: "https://www.youtube.com/watch?v=1pkOGcDnx5o", source: "NeetCode" },
      { type: "article", title: "Striver Stock Buy and Sell Guide", url: "https://takeuforward.org/data-structure/stock-buy-and-sell/", source: "takeuforward" }
    ],
    timeComplexity: "O(N)",
    spaceComplexity: "O(1)",
    solutionStrategy: "Iterate through prices, continuously update `minPrice = min(minPrice, price)` and `maxProfit = max(maxProfit, price - minPrice)`."
  },
  {
    id: "dsa-longest-substring-without-repeating",
    title: "Longest Substring Without Repeating Characters",
    category: "dsa",
    topic: "Sliding Window",
    difficulty: "Medium",
    roundTag: "Round 1 (Coding)",
    frequency: "Must Do",
    companies: ALL_COMPANIES,
    leetcodeUrl: "https://leetcode.com/problems/longest-substring-without-repeating-characters/",
    gfgUrl: "https://www.geeksforgeeks.org/length-of-the-longest-substring-without-repeating-characters/",
    resources: [
      { type: "video", title: "Sliding Window Pattern Tutorial", url: "https://www.youtube.com/watch?v=wiGpQwVHdE0", source: "NeetCode" },
      { type: "article", title: "Striver Substring Without Repeating Chars", url: "https://takeuforward.org/data-structure/length-of-longest-substring-without-any-repeating-character/", source: "takeuforward" }
    ],
    timeComplexity: "O(N)",
    spaceComplexity: "O(min(N, M))",
    solutionStrategy: "Maintain a sliding window with `left` and `right` pointers. Expand `right`, update character's latest position in map, and adjust `left = max(left, map[char] + 1)`."
  },
  {
    id: "dsa-minimum-window-substring",
    title: "Minimum Window Substring",
    category: "dsa",
    topic: "Sliding Window",
    difficulty: "Hard",
    roundTag: "Round 2 (DSA)",
    frequency: "High Probability",
    companies: ["Google", "Amazon", "Microsoft", "Flipkart", "Adobe"],
    leetcodeUrl: "https://leetcode.com/problems/minimum-window-substring/",
    gfgUrl: "https://www.geeksforgeeks.org/find-the-smallest-window-in-a-string-containing-all-characters-of-another-string/",
    resources: [
      { type: "video", title: "NeetCode Min Window Substring Video", url: "https://www.youtube.com/watch?v=jSto0O4AJbM", source: "NeetCode" },
      { type: "article", title: "TakeUforward Sliding Window Masterclass", url: "https://takeuforward.org/data-structure/minimum-window-substring/", source: "takeuforward" }
    ],
    timeComplexity: "O(N + M)",
    spaceComplexity: "O(K)",
    solutionStrategy: "Count frequency of string `t`. Slide `right` across `s` updating `have` count. When `have === need`, contract `left` while recording the minimal valid window."
  },

  // --- Stacks, Queues & Linked Lists ---
  {
    id: "dsa-valid-parentheses",
    title: "Valid Parentheses",
    category: "dsa",
    topic: "Stack & Queues",
    difficulty: "Easy",
    roundTag: "Online Assessment & Technical Screen",
    frequency: "Must Do",
    companies: ALL_COMPANIES,
    leetcodeUrl: "https://leetcode.com/problems/valid-parentheses/",
    gfgUrl: "https://www.geeksforgeeks.org/check-for-balanced-parentheses-in-an-expression/",
    resources: [
      { type: "video", title: "NeetCode Valid Parentheses Explained", url: "https://www.youtube.com/watch?v=WTzjTskDFMg", source: "NeetCode" },
      { type: "article", title: "TakeUforward Stack Balancing Tutorial", url: "https://takeuforward.org/data-structure/check-for-balanced-parentheses/", source: "takeuforward" }
    ],
    timeComplexity: "O(N)",
    spaceComplexity: "O(N)",
    solutionStrategy: "Iterate through characters. Push opening brackets to stack. For closing brackets, check if stack top matches expected opening bracket and pop."
  },
  {
    id: "dsa-min-stack",
    title: "Min Stack Implementation",
    category: "dsa",
    topic: "Stack & Queues",
    difficulty: "Medium",
    roundTag: "Round 1 (Coding)",
    frequency: "Frequently Asked",
    companies: ["Amazon", "Microsoft", "Google", "Flipkart", "Adobe"],
    leetcodeUrl: "https://leetcode.com/problems/min-stack/",
    gfgUrl: "https://www.geeksforgeeks.org/design-and-implement-special-stack-data-structure/",
    resources: [
      { type: "video", title: "Min Stack Design in O(1) Time", url: "https://www.youtube.com/watch?v=qkLl7nAwDPo", source: "NeetCode" },
      { type: "article", title: "Striver Min Stack (O(1) Space trick)", url: "https://takeuforward.org/data-structure/implement-min-stack-o2n-and-on-space-complexity/", source: "takeuforward" }
    ],
    timeComplexity: "O(1) for all operations",
    spaceComplexity: "O(N)",
    solutionStrategy: "Maintain primary stack and parallel minStack, or push pairs containing the value and minimum element up to that stack depth."
  },
  {
    id: "dsa-reverse-linked-list",
    title: "Reverse Linked List",
    category: "dsa",
    topic: "Linked Lists",
    difficulty: "Easy",
    roundTag: "Round 1 (Coding)",
    frequency: "Must Do",
    companies: ALL_COMPANIES,
    leetcodeUrl: "https://leetcode.com/problems/reverse-linked-list/",
    gfgUrl: "https://www.geeksforgeeks.org/reverse-a-linked-list/",
    resources: [
      { type: "video", title: "Reverse Linked List Iterative & Recursive", url: "https://www.youtube.com/watch?v=G0_I-ZF0S38", source: "NeetCode" },
      { type: "article", title: "Striver Linked List Reversal Guide", url: "https://takeuforward.org/data-structure/reverse-a-linked-list/", source: "takeuforward" }
    ],
    timeComplexity: "O(N)",
    spaceComplexity: "O(1)",
    solutionStrategy: "Loop while `curr !== null`: store `next = curr.next`, set `curr.next = prev`, shift `prev = curr`, shift `curr = next`. Return `prev` as new head."
  },
  {
    id: "dsa-detect-cycle-linked-list",
    title: "Detect and Find Loop in Linked List",
    category: "dsa",
    topic: "Linked Lists",
    difficulty: "Medium",
    roundTag: "Round 1 (Coding)",
    frequency: "Must Do",
    companies: ["Amazon", "Microsoft", "Google", "Flipkart", "Adobe", "TCS", "Infosys"],
    leetcodeUrl: "https://leetcode.com/problems/linked-list-cycle-ii/",
    gfgUrl: "https://www.geeksforgeeks.org/find-first-node-of-loop-in-a-linked-list/",
    resources: [
      { type: "video", title: "Floyd's Tortoise & Hare Cycle Finding", url: "https://www.youtube.com/watch?v=gBTe7lFR3vc", source: "NeetCode" },
      { type: "article", title: "Striver Cycle Detection & Origin Proof", url: "https://takeuforward.org/data-structure/find-the-starting-point-of-the-loop-in-a-linked-list/", source: "takeuforward" }
    ],
    timeComplexity: "O(N)",
    spaceComplexity: "O(1)",
    solutionStrategy: "Use fast & slow pointers. When they collide, reset slow pointer to head. Advance both pointers 1 step at a time; their next meeting node is the cycle start."
  },
  {
    id: "dsa-lru-cache",
    title: "LRU Cache Design",
    category: "dsa",
    topic: "Linked Lists",
    difficulty: "Medium",
    roundTag: "Round 2 (DSA & Architecture)",
    frequency: "Must Do",
    companies: ["Amazon", "Google", "Microsoft", "Flipkart", "Adobe"],
    leetcodeUrl: "https://leetcode.com/problems/lru-cache/",
    gfgUrl: "https://www.geeksforgeeks.org/lru-cache-implementation/",
    resources: [
      { type: "video", title: "NeetCode LRU Cache Implementation", url: "https://www.youtube.com/watch?v=7ABFKPK2hD4", source: "NeetCode" },
      { type: "article", title: "Striver LRU Cache (Doubly Linked List + Map)", url: "https://takeuforward.org/data-structure/lru-cache-implementation/", source: "takeuforward" }
    ],
    timeComplexity: "O(1) get and put",
    spaceComplexity: "O(Capacity)",
    solutionStrategy: "Maintain dummy head and tail pointers in a Doubly Linked List. On `get(k)` or `put(k, v)`, move accessed node to head. On overflow, evict node at `tail.prev`."
  },

  // --- Binary Trees & BST ---
  {
    id: "dsa-lowest-common-ancestor",
    title: "Lowest Common Ancestor in Binary Tree",
    category: "dsa",
    topic: "Binary Trees & BST",
    difficulty: "Medium",
    roundTag: "Round 2 (DSA)",
    frequency: "Frequently Asked",
    companies: ["Google", "Amazon", "Microsoft", "Adobe", "Flipkart"],
    leetcodeUrl: "https://leetcode.com/problems/lowest-common-ancestor-of-a-binary-tree/",
    gfgUrl: "https://www.geeksforgeeks.org/lowest-common-ancestor-binary-tree-set-1/",
    resources: [
      { type: "video", title: "Striver LCA Recursive Algorithm", url: "https://www.youtube.com/watch?v=_-QHfMDde90", source: "takeuforward" },
      { type: "article", title: "TakeUforward LCA in Binary Tree", url: "https://takeuforward.org/data-structure/lowest-common-ancestor-for-two-given-nodes/", source: "takeuforward" }
    ],
    timeComplexity: "O(N)",
    spaceComplexity: "O(H)",
    solutionStrategy: "Recursively check left and right subtrees. If left returns non-null and right returns non-null, current node is the LCA. Otherwise return the non-null child."
  },
  {
    id: "dsa-binary-tree-level-order",
    title: "Binary Tree Level Order Traversal",
    category: "dsa",
    topic: "Binary Trees & BST",
    difficulty: "Medium",
    roundTag: "Round 1 (Coding)",
    frequency: "Must Do",
    companies: ALL_COMPANIES,
    leetcodeUrl: "https://leetcode.com/problems/binary-tree-level-order-traversal/",
    gfgUrl: "https://www.geeksforgeeks.org/level-order-tree-traversal/",
    resources: [
      { type: "video", title: "NeetCode Level Order Traversal BFS", url: "https://www.youtube.com/watch?v=6ZnyEApgFYg", source: "NeetCode" },
      { type: "article", title: "TakeUforward BFS Tree Traversal", url: "https://takeuforward.org/data-structure/level-order-traversal-of-a-binary-tree/", source: "takeuforward" }
    ],
    timeComplexity: "O(N)",
    spaceComplexity: "O(N)",
    solutionStrategy: "Use a FIFO queue initialized with root. In each iteration, take `len = queue.length`, dequeue `len` nodes, add values to current level array, and enqueue children."
  },
  {
    id: "dsa-validate-bst",
    title: "Validate Binary Search Tree",
    category: "dsa",
    topic: "Binary Trees & BST",
    difficulty: "Medium",
    roundTag: "Round 1 (Coding)",
    frequency: "Frequently Asked",
    companies: ["Amazon", "Google", "Microsoft", "Flipkart", "Adobe"],
    leetcodeUrl: "https://leetcode.com/problems/validate-binary-search-tree/",
    gfgUrl: "https://www.geeksforgeeks.org/a-program-to-check-if-a-binary-tree-is-bst-or-not/",
    resources: [
      { type: "video", title: "Validate BST Boundary Check Video", url: "https://www.youtube.com/watch?v=s6ATEkipzow", source: "NeetCode" },
      { type: "article", title: "TakeUforward Validate BST", url: "https://takeuforward.org/data-structure/check-if-a-tree-is-a-bst-or-bt/", source: "takeuforward" }
    ],
    timeComplexity: "O(N)",
    spaceComplexity: "O(H)",
    solutionStrategy: "Helper function `isValid(node, min, max)`: return false if `node.val <= min` or `node.val >= max`. Recursively validate `isValid(node.left, min, node.val)` and `isValid(node.right, node.val, max)`."
  },

  // --- Dynamic Programming & Graphs ---
  {
    id: "dsa-climbing-stairs",
    title: "Climbing Stairs",
    category: "dsa",
    topic: "Dynamic Programming",
    difficulty: "Easy",
    roundTag: "Online Assessment",
    frequency: "Must Do",
    companies: ALL_COMPANIES,
    leetcodeUrl: "https://leetcode.com/problems/climbing-stairs/",
    gfgUrl: "https://www.geeksforgeeks.org/count-ways-reach-nth-stair/",
    resources: [
      { type: "video", title: "NeetCode Climbing Stairs DP Introduction", url: "https://www.youtube.com/watch?v=Y0lT9Fck7qI", source: "NeetCode" },
      { type: "article", title: "Striver DP Series: Climbing Stairs", url: "https://takeuforward.org/data-structure/dynamic-programming-climbing-stairs/", source: "takeuforward" }
    ],
    timeComplexity: "O(N)",
    spaceComplexity: "O(1)",
    solutionStrategy: "Initialize `a = 1, b = 1`. For step `2..N`, update `temp = a + b; a = b; b = temp`. Return `b`."
  },
  {
    id: "dsa-coin-change",
    title: "Coin Change (Minimum Coins)",
    category: "dsa",
    topic: "Dynamic Programming",
    difficulty: "Medium",
    roundTag: "Round 2 (DSA)",
    frequency: "Must Do",
    companies: ["Google", "Amazon", "Microsoft", "Adobe", "Flipkart"],
    leetcodeUrl: "https://leetcode.com/problems/coin-change/",
    gfgUrl: "https://www.geeksforgeeks.org/find-minimum-number-of-coins-that-make-a-change/",
    resources: [
      { type: "video", title: "NeetCode Coin Change DP Tutorial", url: "https://www.youtube.com/watch?v=H9bfqozjoqs", source: "NeetCode" },
      { type: "article", title: "Striver Unbounded Knapsack Coin Change", url: "https://takeuforward.org/data-structure/coin-change-2-dp-22/", source: "takeuforward" }
    ],
    timeComplexity: "O(Amount * Coins.length)",
    spaceComplexity: "O(Amount)",
    solutionStrategy: "Iterate from `1..amount`. For each coin, if `coin <= i`, set `dp[i] = min(dp[i], 1 + dp[i - coin])`. If `dp[amount] === Infinity` return -1."
  },
  {
    id: "dsa-longest-common-subsequence",
    title: "Longest Common Subsequence (LCS)",
    category: "dsa",
    topic: "Dynamic Programming",
    difficulty: "Medium",
    roundTag: "Round 2 (DSA)",
    frequency: "Frequently Asked",
    companies: ["Amazon", "Google", "Microsoft", "Flipkart", "Adobe"],
    leetcodeUrl: "https://leetcode.com/problems/longest-common-subsequence/",
    gfgUrl: "https://www.geeksforgeeks.org/longest-common-subsequence-dp-4/",
    resources: [
      { type: "video", title: "Striver LCS 2D String DP Explained", url: "https://www.youtube.com/watch?v=NPZn9jBrX8U", source: "takeuforward" },
      { type: "article", title: "TakeUforward LCS Memoization to Tabulation", url: "https://takeuforward.org/data-structure/longest-common-subsequence-dp-25/", source: "takeuforward" }
    ],
    timeComplexity: "O(M * N)",
    spaceComplexity: "O(M * N)",
    solutionStrategy: "Build 2D table `dp[i][j]`. If characters match at `s1[i-1]` and `s2[j-1]`, set `dp[i][j] = 1 + dp[i-1][j-1]`; else set `dp[i][j] = max(dp[i-1][j], dp[i][j-1])`."
  },
  {
    id: "dsa-number-of-islands",
    title: "Number of Islands",
    category: "dsa",
    topic: "Graphs & Searches",
    difficulty: "Medium",
    roundTag: "Round 1 (Coding)",
    frequency: "Must Do",
    companies: ["Google", "Amazon", "Microsoft", "Adobe", "Flipkart", "Zoho"],
    leetcodeUrl: "https://leetcode.com/problems/number-of-islands/",
    gfgUrl: "https://www.geeksforgeeks.org/find-number-of-islands/",
    resources: [
      { type: "video", title: "NeetCode Number of Islands BFS/DFS", url: "https://www.youtube.com/watch?v=pV2kpPD66nE", source: "NeetCode" },
      { type: "article", title: "TakeUforward Grid Traversal Islands", url: "https://takeuforward.org/data-structure/number-of-islands/", source: "takeuforward" }
    ],
    timeComplexity: "O(M * N)",
    spaceComplexity: "O(M * N)",
    solutionStrategy: "Iterate across grid. When a '1' is found, increment island count and initiate DFS/BFS to mark all connected '1's as '0'."
  },
  {
    id: "dsa-course-schedule",
    title: "Course Schedule (Topological Sort / Cycle Detection)",
    category: "dsa",
    topic: "Graphs & Searches",
    difficulty: "Medium",
    roundTag: "Round 2 (DSA)",
    frequency: "Must Do",
    companies: ["Google", "Amazon", "Microsoft", "Flipkart", "Adobe"],
    leetcodeUrl: "https://leetcode.com/problems/course-schedule/",
    gfgUrl: "https://www.geeksforgeeks.org/topological-sorting-indegree-based-solution/",
    resources: [
      { type: "video", title: "Kahn's Algorithm BFS Topological Sort", url: "https://www.youtube.com/watch?v=EgI5nU9etnU", source: "NeetCode" },
      { type: "article", title: "Striver Course Schedule Cycle Detection", url: "https://takeuforward.org/data-structure/course-schedule-i-and-ii-pre-requisite-tasks-topological-sort-g-24/", source: "takeuforward" }
    ],
    timeComplexity: "O(V + E)",
    spaceComplexity: "O(V + E)",
    solutionStrategy: "Build adjacency list and in-degree array. Push all nodes with in-degree 0 into a queue. Process queue, decrementing neighbor in-degrees; if total processed equals `numCourses`, no cycle exists."
  }
];

// -------------------------------------------------------------
// 2. Curated Master System Design Questions
// -------------------------------------------------------------
export const MASTER_SYSTEM_QUESTIONS: InterviewQuestionItem[] = [
  {
    id: "sys-tinyurl",
    title: "Design a Scalable URL Shortener (TinyURL / Bitly)",
    category: "system",
    topic: "System Design Architecture",
    difficulty: "Medium",
    roundTag: "Round 2 (System Design)",
    frequency: "Must Do",
    companies: ["Google", "Amazon", "Microsoft", "Flipkart", "Adobe"],
    leetcodeUrl: "https://leetcode.com/discuss/interview-question/124658/Design-a-URL-Shortener-(-TinyURL-)",
    gfgUrl: "https://www.geeksforgeeks.org/system-design-url-shortening-service/",
    resources: [
      { type: "video", title: "ByteByteGo Design TinyURL Complete Walkthrough", url: "https://www.youtube.com/watch?v=JQDHz72OA3c", source: "ByteByteGo" },
      { type: "article", title: "System Design Primer - URL Shortener", url: "https://github.com/donnemartin/system-design-primer#design-pastebin", source: "System Design Primer" }
    ],
    timeComplexity: "O(1) read & write",
    spaceComplexity: "Distributed storage scaled to billions of mappings",
    keyInsights: ["Base62 encoding on 64-bit unique IDs (Snowflake sequence generator).", "Redis cache for hot short-URLs (LRU eviction).", "NoSQL / Cassandra or PostgreSQL with unique index."],
    solutionStrategy: "Client -> Load Balancer -> Web App -> Redis Cache (hot reads) -> DB (Cassandra/SQL). Generates unique 7-char Base62 keys from Snowflake IDs, returning 301/302 redirects."
  },
  {
    id: "sys-rate-limiter",
    title: "Design a Distributed Rate Limiter for API Gateways",
    category: "system",
    topic: "System Design Architecture",
    difficulty: "Hard",
    roundTag: "Round 2 (System Design)",
    frequency: "Must Do",
    companies: ["Google", "Amazon", "Microsoft", "Flipkart", "Adobe"],
    leetcodeUrl: "https://leetcode.com/discuss/interview-question/system-design/124558/Design-Rate-Limiter",
    gfgUrl: "https://www.geeksforgeeks.org/design-a-rate-limiter/",
    resources: [
      { type: "video", title: "ByteByteGo Distributed Rate Limiter Explained", url: "https://www.youtube.com/watch?v=FU4Wisl454Y", source: "ByteByteGo" },
      { type: "article", title: "Token Bucket vs Sliding Window Algorithms", url: "https://blog.bytebytego.com/p/ep1-design-a-rate-limiter", source: "ByteByteGo" }
    ],
    keyInsights: ["Token Bucket & Sliding Window Log algorithms in Redis with atomic Lua scripts.", "Handling synchronization race conditions with local memory fallbacks."],
    solutionStrategy: "Place Rate Limiter middleware in API Gateway. Track client tokens in Redis clusters using atomic Lua scripts. Return HTTP 429 Too Many Requests with `Retry-After` header when limit exceeded."
  },
  {
    id: "sys-notification-system",
    title: "Design a Scalable Notification Service (Push, SMS, Email)",
    category: "system",
    topic: "System Design Architecture",
    difficulty: "Medium",
    roundTag: "Round 2 (System Design)",
    frequency: "Frequently Asked",
    companies: ["Amazon", "Google", "Microsoft", "Flipkart", "Adobe"],
    leetcodeUrl: "https://leetcode.com/discuss/interview-question/system-design/1429402/Design-Notification-System",
    gfgUrl: "https://www.geeksforgeeks.org/design-notification-service-system-design/",
    resources: [
      { type: "video", title: "Kafka Event-Driven Architecture System Design", url: "https://www.youtube.com/watch?v=hnpzNAPiC0E", source: "ByteByteGo" },
      { type: "article", title: "Notification Service Architecture Patterns", url: "https://roadmap.sh/software-design", source: "Roadmap.sh" }
    ],
    keyInsights: ["Decoupled message queues (Kafka / RabbitMQ) per notification provider.", "Idempotency keys to avoid duplicate pushes.", "Exponential backoff retry with Dead-Letter Queues (DLQ)."],
    solutionStrategy: "Microservices publish notification events to Kafka topics. Dedicated worker pools pull from channels, interact with third-party providers (APNs, FCM, Twilio, SendGrid), and log delivery statuses."
  },
  {
    id: "sys-realtime-chat",
    title: "Design a Real-Time Chat System (WhatsApp / Slack)",
    category: "system",
    topic: "System Design Architecture",
    difficulty: "Hard",
    roundTag: "Round 3 (System Design)",
    frequency: "Must Do",
    companies: ["Google", "Amazon", "Microsoft", "Flipkart"],
    leetcodeUrl: "https://leetcode.com/discuss/interview-question/system-design/124606/Design-a-chat-application",
    gfgUrl: "https://www.geeksforgeeks.org/design-whatsapp-a-system-design-interview-question/",
    resources: [
      { type: "video", title: "ByteByteGo WhatsApp System Design", url: "https://www.youtube.com/watch?v=vvhC64hQZMk", source: "ByteByteGo" },
      { type: "article", title: "System Design Primer - Chat & WebSockets", url: "https://github.com/donnemartin/system-design-primer", source: "System Design Primer" }
    ],
    keyInsights: ["Persistent WebSockets for low-latency bidirectional messaging.", "Redis Pub/Sub to route messages between different chat server instances.", "Cassandra for high write-throughput chat history."],
    solutionStrategy: "Maintain persistent WebSocket connections on Chat Gateways. Route cross-server messages via Redis Pub/Sub clusters. Persist messages in wide-column Cassandra and buffer offline messages in push queues."
  }
];

// -------------------------------------------------------------
// 3. Curated Master CS Fundamentals Questions
// -------------------------------------------------------------
export const MASTER_FUNDAMENTALS_QUESTIONS: InterviewQuestionItem[] = [
  {
    id: "fund-process-vs-thread",
    title: "Process vs Thread & Context Switching Overhead",
    category: "fundamentals",
    topic: "Operating Systems",
    difficulty: "Easy",
    roundTag: "Round 1 (Fundamentals)",
    frequency: "Must Do",
    companies: ALL_COMPANIES,
    gfgUrl: "https://www.geeksforgeeks.org/difference-between-process-and-thread/",
    resources: [
      { type: "video", title: "Operating Systems: Processes & Threads Explained", url: "https://www.youtube.com/watch?v=OrM7nZcx5nA", source: "Neso Academy" },
      { type: "article", title: "CS Fundamentals OS Roadmap", url: "https://roadmap.sh/computer-science", source: "Roadmap.sh" }
    ],
    keyInsights: ["Processes have separate virtual address spaces and page tables; thread switches only save registers and program counter within shared memory."],
    solutionStrategy: "Detail process isolation (PCB, separate memory mappings, heavy context switch) vs threads (lightweight, share code/heap/open files, faster context switch). Address concurrency race conditions."
  },
  {
    id: "fund-acid-properties",
    title: "ACID Properties in Relational Databases with Real Examples",
    category: "fundamentals",
    topic: "DBMS & SQL",
    difficulty: "Easy",
    roundTag: "Round 1 (Fundamentals)",
    frequency: "Must Do",
    companies: ALL_COMPANIES,
    gfgUrl: "https://www.geeksforgeeks.org/acid-properties-in-dbms/",
    resources: [
      { type: "video", title: "ACID Properties & Transaction Isolation", url: "https://www.youtube.com/watch?v=GAe5NffllwM", source: "takeuforward" },
      { type: "article", title: "TakeUforward ACID Properties Deep Dive", url: "https://takeuforward.org/dbms/acid-properties-in-dbms/", source: "takeuforward" }
    ],
    keyInsights: ["Atomicity (All or nothing via WAL/Undo logs).", "Consistency (Integrity constraints).", "Isolation (Isolation levels: Read Uncommitted to Serializable).", "Durability (Committed to non-volatile disk)."],
    solutionStrategy: "Define Atomicity, Consistency, Isolation, and Durability with a concrete bank fund transfer scenario. Explain WAL (Write-Ahead Logging) and two-phase locking mechanisms."
  },
  {
    id: "fund-database-indexing",
    title: "Database Indexing: B-Trees vs B+ Trees & Hash Indexes",
    category: "fundamentals",
    topic: "DBMS & SQL",
    difficulty: "Medium",
    roundTag: "Round 2 (Technical)",
    frequency: "Frequently Asked",
    companies: ALL_COMPANIES,
    gfgUrl: "https://www.geeksforgeeks.org/b-tree-and-b-tree-in-dbms/",
    resources: [
      { type: "article", title: "Use The Index, Luke! (SQL Indexing Book)", url: "https://use-the-index-luke.com/", source: "Index Luke" },
      { type: "video", title: "B+ Tree Indexing Internals Explained", url: "https://www.youtube.com/watch?v=aZjYr87r1b8", source: "ByteByteGo" }
    ],
    keyInsights: ["B+ trees store data pointers only in leaf nodes linked sequentially.", "Enables O(log N + K) range queries and high disk cache locality."],
    solutionStrategy: "Contrast B-Trees with B+ Trees: B+ tree leaves form a linked list making range scans trivial. Explain clustered vs non-clustered indexes and why indexes slow down INSERT/UPDATE operations."
  },
  {
    id: "fund-tcp-vs-udp",
    title: "TCP vs UDP & The 3-Way Handshake Connection Protocol",
    category: "fundamentals",
    topic: "Computer Networks",
    difficulty: "Easy",
    roundTag: "Round 1 (Fundamentals)",
    frequency: "Must Do",
    companies: ALL_COMPANIES,
    gfgUrl: "https://www.geeksforgeeks.org/differences-between-tcp-and-udp/",
    resources: [
      { type: "video", title: "TCP 3-Way Handshake & Connection Teardown", url: "https://www.youtube.com/watch?v=bW_UILN7b4Q", source: "PowerCert" },
      { type: "article", title: "Roadmap.sh Computer Networking Guide", url: "https://roadmap.sh/guides/http-networking", source: "Roadmap.sh" }
    ],
    keyInsights: ["TCP guarantees in-order, reliable delivery via SYN -> SYN-ACK -> ACK with flow/congestion control.", "UDP is lightweight and connectionless, ideal for video streaming and gaming."],
    solutionStrategy: "Explain SYN, SYN-ACK, ACK sequence numbers, sliding window flow control, packet retransmission, and why UDP is preferred when speed outweighs packet loss."
  },
  {
    id: "fund-deadlocks",
    title: "Deadlocks: 4 Necessary Conditions & Banker's Algorithm",
    category: "fundamentals",
    topic: "Operating Systems",
    difficulty: "Medium",
    roundTag: "Round 2 (Technical)",
    frequency: "Frequently Asked",
    companies: ALL_COMPANIES,
    gfgUrl: "https://www.geeksforgeeks.org/introduction-of-deadlock-in-operating-system/",
    resources: [
      { type: "video", title: "Deadlock Prevention & Banker's Algorithm", url: "https://www.youtube.com/watch?v=T04pzp_U2e4", source: "Neso Academy" },
      { type: "article", title: "TakeUforward Deadlocks Guide", url: "https://takeuforward.org/operating-systems/deadlocks-in-operating-systems/", source: "takeuforward" }
    ],
    keyInsights: ["4 Coffman conditions: Mutual Exclusion, Hold and Wait, No Preemption, Circular Wait.", "Break circular wait by enforcing global resource acquisition order."],
    solutionStrategy: "Define the 4 Coffman conditions. Explain Banker's algorithm safe state check matrix and practical mitigation strategies (lock timeout, lock hierarchies)."
  }
];

// -------------------------------------------------------------
// 4. Curated Master HR & Behavioral Questions
// -------------------------------------------------------------
export const MASTER_HR_QUESTIONS: InterviewQuestionItem[] = [
  {
    id: "hr-disagreement-star",
    title: "Tell me about a time you had a critical technical disagreement with a teammate",
    category: "hr",
    topic: "STAR & Behavioral",
    difficulty: "Easy",
    roundTag: "HR & Hiring Manager Round",
    frequency: "Must Do",
    companies: ALL_COMPANIES,
    gfgUrl: "https://www.geeksforgeeks.org/hr-interview-questions/",
    resources: [
      { type: "article", title: "STAR Behavioral Interview Method Breakdown", url: "https://www.themuse.com/advice/star-interview-method", source: "The Muse" },
      { type: "video", title: "Answering 'Conflict with a Teammate' Interview Question", url: "https://www.youtube.com/watch?v=q6t8rO4Y484", source: "CareerVidz" }
    ],
    keyInsights: ["Do not blame the other person; focus on objective data, benchmarking, and project success."],
    solutionStrategy: "Situation (Debate on database schema or architecture), Task (Delivering high-throughput API on time), Action (Benchmarked both designs with load testing, presented data, found collaborative middle ground), Result (Delivered on schedule with zero performance regressions)."
  },
  {
    id: "hr-why-company-role",
    title: "Why our company, and what excites you about this specific engineering role?",
    category: "hr",
    topic: "STAR & Behavioral",
    difficulty: "Easy",
    roundTag: "HR & Culture Round",
    frequency: "Must Do",
    companies: ALL_COMPANIES,
    gfgUrl: "https://www.geeksforgeeks.org/why-should-we-hire-you/",
    resources: [
      { type: "article", title: "HBR: How to Answer 'Why Do You Want to Work Here'", url: "https://hbr.org/2021/11/how-to-answer-why-do-you-want-to-work-here", source: "Harvard Business Review" }
    ],
    keyInsights: ["Reference real engineering scale, company open-source contributions, or specific product features you respect."],
    solutionStrategy: "Connect your specific engineering skills and passions directly to the company's real-world scale, engineering mission, and technological challenges."
  },
  {
    id: "hr-outage-resolution",
    title: "Describe a high-stakes bug, outage, or critical blocker you resolved under pressure",
    category: "hr",
    topic: "STAR & Behavioral",
    difficulty: "Medium",
    roundTag: "Managerial Round",
    frequency: "Frequently Asked",
    companies: ["Google", "Amazon", "Microsoft", "Flipkart", "Adobe"],
    gfgUrl: "https://www.geeksforgeeks.org/behavioral-interview-questions/",
    resources: [
      { type: "article", title: "Google SRE Post-Mortem & Incident Culture", url: "https://sre.google/sre-book/postmortem-culture/", source: "Google SRE Book" }
    ],
    keyInsights: ["Focus on structured triage, calm communication, rapid mitigation, and post-mortem safeguards."],
    solutionStrategy: "Detail symptom identification, swift mitigation (rollback or hotfix), root-cause analysis via logs/profilers, and adding automated CI/CD unit tests to prevent recurrence."
  },
  {
    id: "hr-competing-deadlines",
    title: "How do you prioritize competing tasks when multiple project deadlines overlap?",
    category: "hr",
    topic: "STAR & Behavioral",
    difficulty: "Easy",
    roundTag: "HR Round",
    frequency: "Must Do",
    companies: ALL_COMPANIES,
    gfgUrl: "https://www.geeksforgeeks.org/how-to-handle-work-pressure-in-interviews/",
    resources: [
      { type: "article", title: "Eisenhower Matrix & Priority Management in Tech", url: "https://asana.com/resources/eisenhower-matrix", source: "Asana Guide" }
    ],
    keyInsights: ["Proactive stakeholder communication, impact vs effort evaluation, milestone decomposition."],
    solutionStrategy: "Demonstrate transparent stakeholder alignment, evaluate impact vs urgency, break work into milestones, and reset realistic expectations proactively."
  }
];

// -------------------------------------------------------------
// Helper generator for rich authentic company-specific question banks (20+ questions per company)
// -------------------------------------------------------------

function buildCompanySpecificQuestions(companyName: string): InterviewQuestionItem[] {
  const templates: Record<string, Array<{ title: string; topic: string; difficulty: "Easy" | "Medium" | "Hard"; round: string; strategy: string }>> = {
    Google: [
      { title: "Design Distributed Web Search Indexing (Google Scale)", topic: "System Design Architecture", difficulty: "Hard", round: "Googlyness & Architecture", strategy: "Inverted index partitioned by document ID, distributed document shards, query parsing, and multi-tier ranking." },
      { title: "Google Docs Real-Time Collaborative Conflict Resolution (OT & CRDT)", topic: "System Design Architecture", difficulty: "Hard", round: "Round 2 (Architecture)", strategy: "Operational Transformation (OT) or Conflict-free Replicated Data Types (CRDTs) over WebSockets with central sequence numbers." },
      { title: "Google Maps Shortest Route & Real-Time Traffic Calculation", topic: "Graphs & Searches", difficulty: "Hard", round: "Technical Round", strategy: "Contraction Hierarchies and A* algorithm with real-time dynamic edge weight updates from live telemetry." },
      { title: "YouTube Video Transcoding Pipeline & CDN Edge Caching", topic: "System Design Architecture", difficulty: "Hard", round: "Round 2 (System Design)", strategy: "Chunking input streams, worker pools encoding to adaptive bitrates (DASH/HLS), and geo-distributed CDN caching." },
      { title: "Google Spanner TrueTime API & Global Distributed Transactions", topic: "DBMS & SQL", difficulty: "Hard", round: "Round 3 (Technical)", strategy: "GPS and atomic clocks bounded uncertainty interval with Paxos consensus for serializable distributed transactions." },
      { title: "Handling Ambiguous Feature Requests with Missing Edge Cases", topic: "STAR & Behavioral", difficulty: "Medium", round: "Hiring Manager Round", strategy: "Ask clarifying questions on user personas, latency SLAs, edge failure modes, and propose minimum testable prototypes." },
      { title: "Google Kubernetes / Borg Cluster Scheduling & Eviction", topic: "Operating Systems", difficulty: "Hard", round: "Infrastructure Round", strategy: "Priority tiers (prod vs non-prod), bin-packing scheduler, cgroups resource isolation, and graceful node drainage." },
      { title: "Gmail Autocomplete Search with Tries and Frequency Ranking", topic: "Arrays & Hash Maps", difficulty: "Medium", round: "Round 1 (Coding)", strategy: "Trie structure with top-k cached completions at each prefix node for O(prefix) latency." },
      { title: "Google Photos Image Deduplication & Feature Vector Search", topic: "System Design Architecture", difficulty: "Hard", round: "Round 2 (System Design)", strategy: "Perceptual hashing for exact duplicates; deep embedding vectors with HNSW / FAISS approximate nearest neighbors." },
      { title: "Chrome Browser Multi-Process Architecture & Tab Sandboxing", topic: "Operating Systems", difficulty: "Medium", round: "Round 1 (Fundamentals)", strategy: "Separate render processes per site instance to isolate memory crashes and prevent cross-origin DOM access." },
      { title: "Zero-Trust Security Architecture (BeyondCorp) Principles", topic: "Computer Networks", difficulty: "Medium", round: "Technical Screen", strategy: "Context-aware access proxies verifying device health, user identity, and ephemeral certificates rather than perimeter VPNs." },
      { title: "Google Cloud Pub/Sub At-Least-Once Delivery Architecture", topic: "System Design Architecture", difficulty: "Hard", round: "Round 2 (System Design)", strategy: "Distributed log partitions with subscriber ACK trackers, redelivery backoffs, and dead-letter queues." },
      { title: "Google Meet WebRTC Low-Latency Video Conferencing", topic: "Computer Networks", difficulty: "Hard", round: "Technical Architecture", strategy: "Selective Forwarding Units (SFU) routing RTP streams over UDP with dynamic bandwidth estimation and packet loss concealment." },
      { title: "MapReduce Distributed Data Processing Paradigm & Fault Recovery", topic: "Operating Systems", difficulty: "Medium", round: "Round 1 (Fundamentals)", strategy: "Split input files, execute map workers, write partitioned intermediates to local disk, shuffle, and reduce with worker heartbeats." },
      { title: "Android APK Delta Update & Binary Patch Distribution", topic: "System Design Architecture", difficulty: "Medium", round: "Round 1 (Technical)", strategy: "Compute bsdiff binary deltas between current and new version, compress, and reconstruct on-device." },
      { title: "Dynamic Ad Auction Bidding Engine (Sub-50ms Latency SLA)", topic: "System Design Architecture", difficulty: "Hard", round: "Round 3 (Architecture)", strategy: "In-memory bidder caches, asynchronous event bidding pools, and second-price auction resolution." },
      { title: "Design Distributed Rate Limiter for Google Cloud APIs", topic: "System Design Architecture", difficulty: "Medium", round: "Round 2 (System Design)", strategy: "Sliding window counter in Redis clusters with localized memory token fallback." },
      { title: "Google SRE Post-Mortem: Handling Cascading Failures in Production", topic: "STAR & Behavioral", difficulty: "Medium", round: "Leadership & Culture", strategy: "Blameless post-mortem framework: symptom triage, circuit breaking, root cause analysis, and automated CI test addition." },
      { title: "Distributed Tracing Architecture (Google Dapper)", topic: "System Design Architecture", difficulty: "Hard", round: "Technical Architecture", strategy: "Propagate TraceID and SpanID via HTTP headers across microservices; asynchronous sample logging." },
      { title: "Large-Scale Graph PageRank Computation for Web Ranking", topic: "Graphs & Searches", difficulty: "Hard", round: "Round 2 (DSA)", strategy: "Iterative power iteration on sparse transition matrix with damping factor distributed across nodes." }
    ],
    Amazon: [
      { title: "Amazon LP: Customer Obsession vs Speed of Delivery Trade-off", topic: "STAR & Behavioral", difficulty: "Medium", round: "Bar Raiser Round", strategy: "Explain a real decision where customer experience was preserved despite engineering delivery pressure." },
      { title: "Design Amazon Flash Sale High-Concurrency Checkout System", topic: "System Design Architecture", difficulty: "Hard", round: "Technical Architecture", strategy: "Pessimistic vs Optimistic Locking in SQL, Redis distributed lock with lease time, asynchronous order creation via SQS queue." },
      { title: "DynamoDB Partitioning, Sloppy Quorums & Vector Clocks", topic: "DBMS & SQL", difficulty: "Hard", round: "Round 2 (System Design)", strategy: "Consistent hashing ring with virtual nodes, tunable W+R>N consistency, and vector clocks for concurrent write reconciliation." },
      { title: "Amazon Prime Video Adaptive Bitrate Streaming & CDN Ingestion", topic: "System Design Architecture", difficulty: "Hard", round: "Round 2 (System Design)", strategy: "Fragmented MP4 packaging, multi-bitrate transcode matrix, and edge token verification." },
      { title: "Amazon 1-Click Ordering Idempotency & Payment State Machine", topic: "System Design Architecture", difficulty: "Medium", round: "Technical Round", strategy: "Idempotency tokens stored in Redis with payment state machine (Initiated -> Authorized -> Captured)." },
      { title: "AWS S3 99.999999999% Durability & Reed-Solomon Erasure Coding", topic: "System Design Architecture", difficulty: "Hard", round: "Round 3 (Architecture)", strategy: "8+4 Erasure coding across independent availability zones with background bit-rot scrubbers." },
      { title: "AWS Lambda Serverless Cold Start & MicroVM Optimization (Firecracker)", topic: "Operating Systems", difficulty: "Hard", round: "Round 2 (Systems)", strategy: "Minimalist Linux microVM snapshotting, pre-warmed execution environments, and lightweight cgroup isolation." },
      { title: "Amazon Warehouse Autonomous Robot Task & Path Allocation", topic: "Graphs & Searches", difficulty: "Hard", round: "Technical Round", strategy: "Multi-Agent Path Finding (MAPF) with time-expanded reservation grids to prevent collision deadlocks." },
      { title: "Amazon Review Verification & Anti-Fraud Graph Pipeline", topic: "System Design Architecture", difficulty: "Medium", round: "Technical Round", strategy: "Graph relationship analysis between seller and reviewer accounts, velocity checks, and text embedding similarity." },
      { title: "Amazon LP: Bias for Action with Incomplete Data Case Study", topic: "STAR & Behavioral", difficulty: "Medium", round: "Hiring Manager Round", strategy: "Walk through calculating two-way vs one-way door decisions and prototyping minimum testable solutions." },
      { title: "AWS API Gateway Multi-Tenant Rate Limiter with Token Buckets", topic: "System Design Architecture", difficulty: "Medium", round: "Round 2 (System Design)", strategy: "Tiered token buckets in Redis clusters with burst allowances and custom 429 response headers." },
      { title: "Amazon Order Fulfillment & Logistics Hub Package Routing", topic: "System Design Architecture", difficulty: "Hard", round: "Technical Architecture", strategy: "Event-driven orchestration with SQS/SNS, dead-letter queues, and dynamic carrier dispatch." },
      { title: "Amazon Cart Temporary Reservation & Automatic Stock Expiry", topic: "System Design Architecture", difficulty: "Medium", round: "Round 1 (Coding)", strategy: "Redis TTL keys with keyspace expiration events or scheduled background sweeper workers." },
      { title: "Amazon Peak Traffic (Black Friday / Prime Day) Load Shedding Strategy", topic: "System Design Architecture", difficulty: "Hard", round: "Technical Architecture", strategy: "Graceful feature degradation (hide non-essential recommendations), aggressive caching, and backpressure queueing." },
      { title: "Amazon LP: Dive Deep - Debugging a Hidden Concurrency Race Condition", topic: "STAR & Behavioral", difficulty: "Medium", round: "Technical Screen", strategy: "Step-by-step reproduction with thread dumps, thread analyzers, and atomic lock refactoring." },
      { title: "AWS CloudWatch Real-Time Metric Aggregation Pipeline", topic: "System Design Architecture", difficulty: "Hard", round: "Round 2 (System Design)", strategy: "Time-series database with sliding window stream aggregators (Apache Flink) and tiered storage." },
      { title: "Amazon Recommendation Engine Collaborative Filtering at Scale", topic: "System Design Architecture", difficulty: "Hard", round: "Round 3 (Architecture)", strategy: "Item-to-item collaborative filtering matrix precomputed offline and cached in low-latency key-value stores." },
      { title: "Amazon SQS Message Deduplication (FIFO) and Visibility Timeout", topic: "Operating Systems", difficulty: "Medium", round: "Round 1 (Fundamentals)", strategy: "Deduplication ID hashing within 5-minute window; visibility timeout reset on worker heartbeats." },
      { title: "Amazon LP: Earn Trust - Overcoming a Team Delivery Roadblock", topic: "STAR & Behavioral", difficulty: "Easy", round: "HR Round", strategy: "Demonstrate active listening, objective metrics, and establishing transparent sprint visibility." },
      { title: "Amazon Elastic Load Balancing (ALB) Path Routing & Health Probing", topic: "Computer Networks", difficulty: "Easy", round: "Round 1 (Fundamentals)", strategy: "Layer 7 HTTP request inspection, least connections load balancing algorithm, and circuit breaking unhealthy targets." }
    ]
  };

  // Generic generator for other companies if not explicitly defined above
  const genericCompanyTopics = [
    { title: `Core Enterprise Software Architecture Relevant to ${companyName}`, topic: "System Design Architecture", difficulty: "Medium" as const, round: "Technical Round", strategy: "Articulate modular decoupled microservices, database schema design, and asynchronous message queues." },
    { title: `Database Query Optimization & Performance Tuning for ${companyName}`, topic: "DBMS & SQL", difficulty: "Medium" as const, round: "Round 1 (Fundamentals)", strategy: "Explain B+ tree indexing, query execution plans, avoiding full table scans, and connection pooling." },
    { title: `Handling High-Throughput REST API Traffic at ${companyName}`, topic: "System Design Architecture", difficulty: "Hard" as const, round: "Round 2 (Technical)", strategy: "Implement Redis caching layers, horizontal load balancing, and rate limiting middleware." },
    { title: `Walkthrough of Your Primary Engineering Project Relevant to ${companyName}`, topic: "STAR & Behavioral", difficulty: "Medium" as const, round: "Technical Screen", strategy: "Detail problem context, architectural decisions, technical trade-offs, and measurable engineering impact." },
    { title: `Multi-Threading, Synchronization, and Deadlock Prevention in ${companyName} Systems`, topic: "Operating Systems", difficulty: "Medium" as const, round: "Round 1 (Coding)", strategy: "Discuss thread-safe data structures, volatile keyword, locks vs semaphores, and Banker's algorithm." },
    { title: `Microservices Security: OAuth2, JWT, and API Authentication at ${companyName}`, topic: "Computer Networks", difficulty: "Medium" as const, round: "Technical Round", strategy: "Detail token-based stateless authentication, public-private key validation, and role-based access control." },
    { title: `CI/CD Automation, Automated Testing, and Deployment Pipelines at ${companyName}`, topic: "Operating Systems", difficulty: "Easy" as const, round: "Technical Screen", strategy: "Walk through GitHub Actions / Jenkins pipelines, automated unit/integration tests, and zero-downtime deployment." },
    { title: `Handling Tight Delivery Deadlines & Sprint Prioritization at ${companyName}`, topic: "STAR & Behavioral", difficulty: "Easy" as const, round: "HR & Manager Round", strategy: "Apply Eisenhower matrix, proactive stakeholder communication, and milestone scoping." },
    { title: `SQL vs NoSQL Database Selection Matrix for ${companyName} Client Projects`, topic: "DBMS & SQL", difficulty: "Medium" as const, round: "Round 1 (Fundamentals)", strategy: "Contrast ACID relational guarantees with horizontally scalable NoSQL document/key-value stores." },
    { title: `Resolving a Production Outage and Adding Regression Tests at ${companyName}`, topic: "STAR & Behavioral", difficulty: "Medium" as const, round: "Managerial Round", strategy: "Detail symptom triage, rapid rollback, root cause analysis, and post-mortem test coverage addition." },
    { title: `Design a Distributed Caching Strategy using Redis for ${companyName}`, topic: "System Design Architecture", difficulty: "Medium" as const, round: "Round 2 (System Design)", strategy: "Implement Cache-Aside pattern, write-through vs write-back, and cache stampede mitigation." },
    { title: `Why ${companyName}, and How Do Your Skills Align with This Engineering Team?`, topic: "STAR & Behavioral", difficulty: "Easy" as const, round: "HR Round", strategy: "Align personal technical strengths directly with the company's real scale, engineering culture, and business domain." },
    { title: `Object-Oriented Design Patterns (Singleton, Factory, Strategy) at ${companyName}`, topic: "Object Oriented Design (OOP)", difficulty: "Easy" as const, round: "Round 1 (Coding)", strategy: "Implement SOLID principles, dependency injection, and clean design patterns with real code examples." },
    { title: `Handling Network Latency & TCP 3-Way Handshake in Web Apps at ${companyName}`, topic: "Computer Networks", difficulty: "Easy" as const, round: "Round 1 (Fundamentals)", strategy: "Explain SYN, SYN-ACK, ACK, HTTP/2 multiplexing, and TLS session resumption." },
    { title: `Scalable Message Brokering with Kafka / RabbitMQ in ${companyName} Architectures`, topic: "System Design Architecture", difficulty: "Hard" as const, round: "Round 2 (Architecture)", strategy: "Publish-subscribe topics, consumer groups, offset tracking, and idempotency guarantees." },
    { title: `Design an End-to-End User Authentication & Password Reset Flow for ${companyName}`, topic: "System Design Architecture", difficulty: "Medium" as const, round: "Technical Round", strategy: "Bcrypt password hashing, short-lived HMAC reset tokens with expiration, and rate-limited email dispatch." },
    { title: `Code Refactoring and Managing Technical Debt in Fast-Paced ${companyName} Sprints`, topic: "STAR & Behavioral", difficulty: "Medium" as const, round: "Hiring Manager Round", strategy: "Identify code smells, write regression test harnesses, and refactor incrementally without disrupting delivery." },
    { title: `Web Application Security: Mitigating SQL Injection, XSS, and CSRF at ${companyName}`, topic: "Computer Networks", difficulty: "Easy" as const, round: "Technical Screen", strategy: "Parameterized SQL queries, context-aware HTML escaping, and SameSite CSRF tokens." },
    { title: `Designing Resilient Systems with Circuit Breakers & Retries at ${companyName}`, topic: "System Design Architecture", difficulty: "Hard" as const, round: "Round 3 (Architecture)", strategy: "Polly / Resilience4j circuit breakers: Closed -> Open -> Half-Open states with exponential backoff and jitter." },
    { title: `Working in Cross-Functional Agile Teams and Communicating Technical Concepts at ${companyName}`, topic: "STAR & Behavioral", difficulty: "Easy" as const, round: "HR Round", strategy: "Demonstrate transparent collaboration across product managers, QA, and senior engineers." }
  ];

  const list = templates[companyName] || genericCompanyTopics;
  return list.map((item, index) => ({
    id: `${slugify(companyName)}-spec-${index + 1}`,
    title: item.title,
    category: "specific" as const,
    topic: item.topic,
    difficulty: item.difficulty,
    roundTag: item.round,
    frequency: (index % 3 === 0 ? "Must Do" : index % 3 === 1 ? "Frequently Asked" : "High Probability") as any,
    companies: [companyName],
    gfgUrl: `https://www.geeksforgeeks.org/search/?q=${encodeURIComponent(item.title)}`,
    resources: [
      { type: "article", title: `${companyName} Technical Prep Guide & Strategy`, url: "https://takeuforward.org/", source: "takeuforward" },
      { type: "video", title: `${companyName} System Architecture Tutorial`, url: "https://www.youtube.com/@ByteByteGo", source: "ByteByteGo" }
    ],
    solutionStrategy: item.strategy
  }));
}

export const MASTER_SPECIFIC_QUESTIONS: Record<string, InterviewQuestionItem[]> = {};

ALL_COMPANIES.forEach(comp => {
  MASTER_SPECIFIC_QUESTIONS[comp] = buildCompanySpecificQuestions(comp);
});

// -------------------------------------------------------------
// HELPER FUNCTIONS & CANONICAL GENERATOR
// -------------------------------------------------------------

/**
 * Returns all master canonical questions across all categories
 */
export function getAllMasterQuestions(): InterviewQuestionItem[] {
  const specificList = Object.values(MASTER_SPECIFIC_QUESTIONS).flat();
  return [
    ...MASTER_DSA_QUESTIONS,
    ...MASTER_SYSTEM_QUESTIONS,
    ...MASTER_FUNDAMENTALS_QUESTIONS,
    ...MASTER_HR_QUESTIONS,
    ...specificList
  ];
}

/**
 * Returns the most common questions across companies (sorted by number of companies)
 */
export function getMostCommonQuestions(limit: number = 50): InterviewQuestionItem[] {
  const all = getAllMasterQuestions();
  const sorted = [...all].sort((a, b) => (b.companies?.length || 0) - (a.companies?.length || 0));
  return sorted.slice(0, limit);
}

/**
 * Generates questions for a company & role & category ensuring canonical persistent IDs
 */
export function generateCompanyQuestions(
  companyName: string,
  roleTitle: string,
  level: string,
  category: "dsa" | "system" | "fundamentals" | "hr" | "specific",
  targetCount?: number
): InterviewQuestionItem[] {
  let pool: InterviewQuestionItem[] = [];

  if (category === "dsa") {
    pool = MASTER_DSA_QUESTIONS;
  } else if (category === "system") {
    pool = MASTER_SYSTEM_QUESTIONS;
  } else if (category === "fundamentals") {
    pool = MASTER_FUNDAMENTALS_QUESTIONS;
  } else if (category === "hr") {
    pool = MASTER_HR_QUESTIONS;
  } else {
    pool = MASTER_SPECIFIC_QUESTIONS[companyName] || buildCompanySpecificQuestions(companyName);
  }

  // Filter items that specifically list this company or general questions
  const companySpecific = pool.filter(q => q.companies && q.companies.includes(companyName));
  const general = pool.filter(q => !q.companies || !q.companies.includes(companyName));
  const combined = [...companySpecific, ...general];

  const count = targetCount && targetCount > 0 ? targetCount : combined.length;
  const result: InterviewQuestionItem[] = [];

  for (let i = 0; i < Math.min(count, combined.length); i++) {
    result.push(combined[i]);
  }

  return result;
}

/**
 * Returns all distinct topics for a given category
 */
export function getTopicsForCategory(category: "dsa" | "system" | "fundamentals" | "hr" | "specific"): string[] {
  let pool: InterviewQuestionItem[] = [];
  if (category === "dsa") pool = MASTER_DSA_QUESTIONS;
  else if (category === "system") pool = MASTER_SYSTEM_QUESTIONS;
  else if (category === "fundamentals") pool = MASTER_FUNDAMENTALS_QUESTIONS;
  else if (category === "hr") pool = MASTER_HR_QUESTIONS;
  else pool = Object.values(MASTER_SPECIFIC_QUESTIONS).flat();

  const set = new Set<string>();
  pool.forEach(q => {
    if (q.topic) set.add(q.topic);
  });
  return Array.from(set);
}
