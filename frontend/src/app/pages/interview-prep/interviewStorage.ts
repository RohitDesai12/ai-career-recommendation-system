import { 
  CompanyData, 
  CompanyRole, 
  RoleCounts, 
  UserInterviewTarget, 
  PrepPlanDay, 
  InterviewExperienceItem, 
  ReadinessBreakdown,
  MockAttemptHistoryItem,
  InterviewStage
} from "./types";
import { 
  MASTER_DSA_QUESTIONS, 
  MASTER_SYSTEM_QUESTIONS, 
  MASTER_FUNDAMENTALS_QUESTIONS, 
  MASTER_HR_QUESTIONS, 
  MASTER_SPECIFIC_QUESTIONS,
  InterviewQuestionItem,
  getAllMasterQuestions
} from "../interviewQuestionsData";

// Curated companies definition
export const CURATED_COMPANIES: CompanyData[] = [
  {
    id: "google",
    name: "Google",
    initials: "G",
    color: "#3B6D11",
    type: "Product",
    blurb: "Interview loops lean heavily on core DSA, graph algorithms, and clean coding under time pressure, with one round dedicated to open-ended problem exploration.",
    roles: [
      {
        id: "software-engineer-sde-1",
        title: "Software Engineer",
        level: "SDE-1",
        counts: { dsa: MASTER_DSA_QUESTIONS.length, system: MASTER_SYSTEM_QUESTIONS.length, fundamentals: MASTER_FUNDAMENTALS_QUESTIONS.length, hr: MASTER_HR_QUESTIONS.length, specific: 8 },
        difficulty: { easy: 25, medium: 50, hard: 25 }
      },
      {
        id: "software-engineer-intern",
        title: "Software Engineer",
        level: "Intern",
        counts: { dsa: MASTER_DSA_QUESTIONS.length, system: 0, fundamentals: MASTER_FUNDAMENTALS_QUESTIONS.length, hr: MASTER_HR_QUESTIONS.length, specific: 6 },
        difficulty: { easy: 40, medium: 45, hard: 15 }
      }
    ]
  },
  {
    id: "microsoft",
    name: "Microsoft",
    initials: "M",
    color: "#185FA5",
    type: "Product",
    blurb: "Rounds mix data structures with practical system design, and interviewers probe how you extend a solution once requirements change mid-conversation.",
    roles: [
      {
        id: "software-engineer-sde-1",
        title: "Software Engineer",
        level: "SDE-1",
        counts: { dsa: MASTER_DSA_QUESTIONS.length, system: MASTER_SYSTEM_QUESTIONS.length, fundamentals: MASTER_FUNDAMENTALS_QUESTIONS.length, hr: MASTER_HR_QUESTIONS.length, specific: 8 },
        difficulty: { easy: 30, medium: 50, hard: 20 }
      },
      {
        id: "software-engineer-intern",
        title: "Software Engineer",
        level: "Intern",
        counts: { dsa: MASTER_DSA_QUESTIONS.length, system: 0, fundamentals: MASTER_FUNDAMENTALS_QUESTIONS.length, hr: MASTER_HR_QUESTIONS.length, specific: 6 },
        difficulty: { easy: 45, medium: 45, hard: 10 }
      }
    ]
  },
  {
    id: "amazon",
    name: "Amazon",
    initials: "A",
    color: "#854F0B",
    type: "Product",
    blurb: "Every round is scored against Leadership Principles as much as technical correctness — be ready to walk through real engineering decisions using STAR.",
    roles: [
      {
        id: "software-development-engineer-sde-1",
        title: "Software Development Engineer",
        level: "SDE-1",
        counts: { dsa: MASTER_DSA_QUESTIONS.length, system: MASTER_SYSTEM_QUESTIONS.length, fundamentals: MASTER_FUNDAMENTALS_QUESTIONS.length, hr: MASTER_HR_QUESTIONS.length, specific: 8 },
        difficulty: { easy: 30, medium: 50, hard: 20 }
      },
      {
        id: "software-development-engineer-intern",
        title: "Software Development Engineer",
        level: "Intern",
        counts: { dsa: MASTER_DSA_QUESTIONS.length, system: 0, fundamentals: MASTER_FUNDAMENTALS_QUESTIONS.length, hr: MASTER_HR_QUESTIONS.length, specific: 6 },
        difficulty: { easy: 40, medium: 45, hard: 15 }
      }
    ]
  },
  {
    id: "adobe",
    name: "Adobe",
    initials: "Ad",
    color: "#993556",
    type: "Product",
    blurb: "Expect a strong product-thinking round alongside DSA — interviewers prioritize candidates who ask clarifying edge-case questions before jumping to code.",
    roles: [
      {
        id: "software-engineer-sde-1",
        title: "Software Engineer",
        level: "SDE-1",
        counts: { dsa: MASTER_DSA_QUESTIONS.length, system: MASTER_SYSTEM_QUESTIONS.length, fundamentals: MASTER_FUNDAMENTALS_QUESTIONS.length, hr: MASTER_HR_QUESTIONS.length, specific: 7 },
        difficulty: { easy: 35, medium: 45, hard: 20 }
      }
    ]
  },
  {
    id: "flipkart",
    name: "Flipkart",
    initials: "F",
    color: "#0C447C",
    type: "Product",
    blurb: "Bar is high on problem-solving speed; a scale-oriented system design round shows up even for early-career engineering roles.",
    roles: [
      {
        id: "software-development-engineer-sde-1",
        title: "Software Development Engineer",
        level: "SDE-1",
        counts: { dsa: MASTER_DSA_QUESTIONS.length, system: MASTER_SYSTEM_QUESTIONS.length, fundamentals: MASTER_FUNDAMENTALS_QUESTIONS.length, hr: MASTER_HR_QUESTIONS.length, specific: 8 },
        difficulty: { easy: 25, medium: 55, hard: 20 }
      }
    ]
  },
  {
    id: "zoho",
    name: "Zoho",
    initials: "Z",
    color: "#3B6D11",
    type: "Product",
    blurb: "Known for deep programming fundamentals and written coding rounds — depth in language internals matters more than memorized solutions.",
    roles: [
      {
        id: "software-developer-entry-level",
        title: "Software Developer",
        level: "Entry Level",
        counts: { dsa: MASTER_DSA_QUESTIONS.length, system: 0, fundamentals: MASTER_FUNDAMENTALS_QUESTIONS.length, hr: MASTER_HR_QUESTIONS.length, specific: 6 },
        difficulty: { easy: 45, medium: 45, hard: 10 }
      }
    ]
  },
  {
    id: "tcs",
    name: "TCS",
    initials: "T",
    color: "#0F6E56",
    type: "Service",
    blurb: "Technical rounds stay close to core CS foundations (DBMS, OS, Networks) and project walk-throughs alongside standard DSA.",
    roles: [
      {
        id: "ninja-entry-level",
        title: "Ninja",
        level: "Entry Level",
        counts: { dsa: MASTER_DSA_QUESTIONS.length, system: 0, fundamentals: MASTER_FUNDAMENTALS_QUESTIONS.length, hr: MASTER_HR_QUESTIONS.length, specific: 6 },
        difficulty: { easy: 60, medium: 35, hard: 5 }
      },
      {
        id: "digital-entry-level",
        title: "Digital",
        level: "Entry Level",
        counts: { dsa: MASTER_DSA_QUESTIONS.length, system: 0, fundamentals: MASTER_FUNDAMENTALS_QUESTIONS.length, hr: MASTER_HR_QUESTIONS.length, specific: 6 },
        difficulty: { easy: 40, medium: 50, hard: 10 }
      }
    ]
  },
  {
    id: "infosys",
    name: "Infosys",
    initials: "I",
    color: "#3C3489",
    type: "Service",
    blurb: "Technical round covers your academic projects in real depth, so being able to defend architecture and SQL query choices is key.",
    roles: [
      {
        id: "systems-engineer-entry-level",
        title: "Systems Engineer",
        level: "Entry Level",
        counts: { dsa: MASTER_DSA_QUESTIONS.length, system: 0, fundamentals: MASTER_FUNDAMENTALS_QUESTIONS.length, hr: MASTER_HR_QUESTIONS.length, specific: 6 },
        difficulty: { easy: 55, medium: 40, hard: 5 }
      },
      {
        id: "digital-specialist-entry-level",
        title: "Digital Specialist",
        level: "Entry Level",
        counts: { dsa: MASTER_DSA_QUESTIONS.length, system: 0, fundamentals: MASTER_FUNDAMENTALS_QUESTIONS.length, hr: MASTER_HR_QUESTIONS.length, specific: 6 },
        difficulty: { easy: 35, medium: 50, hard: 15 }
      }
    ]
  },
  {
    id: "wipro",
    name: "Wipro",
    initials: "W",
    color: "#712B13",
    type: "Service",
    blurb: "Technical screen tests Java/Python fundamentals, while HR weighs adaptability and managing tight client deadlines.",
    roles: [
      {
        id: "project-engineer-entry-level",
        title: "Project Engineer",
        level: "Entry Level",
        counts: { dsa: MASTER_DSA_QUESTIONS.length, system: 0, fundamentals: MASTER_FUNDAMENTALS_QUESTIONS.length, hr: MASTER_HR_QUESTIONS.length, specific: 6 },
        difficulty: { easy: 55, medium: 40, hard: 5 }
      }
    ]
  },
  {
    id: "accenture",
    name: "Accenture",
    initials: "Ac",
    color: "#993C1D",
    type: "Service",
    blurb: "Case-style behavioral questions alongside a technical round that checks breadth across your resume and core web technologies.",
    roles: [
      {
        id: "associate-software-engineer-entry-level",
        title: "Associate Software Engineer",
        level: "Entry Level",
        counts: { dsa: MASTER_DSA_QUESTIONS.length, system: 0, fundamentals: MASTER_FUNDAMENTALS_QUESTIONS.length, hr: MASTER_HR_QUESTIONS.length, specific: 6 },
        difficulty: { easy: 50, medium: 45, hard: 5 }
      }
    ]
  },
  {
    id: "cognizant",
    name: "Cognizant",
    initials: "C",
    color: "#072D53",
    type: "Service",
    blurb: "Technical interviews stay conversational — walking through your logic and complexity analysis out loud is weighed heavily.",
    roles: [
      {
        id: "programmer-analyst-entry-level",
        title: "Programmer Analyst",
        level: "Entry Level",
        counts: { dsa: MASTER_DSA_QUESTIONS.length, system: 0, fundamentals: MASTER_FUNDAMENTALS_QUESTIONS.length, hr: MASTER_HR_QUESTIONS.length, specific: 6 },
        difficulty: { easy: 55, medium: 40, hard: 5 }
      }
    ]
  },
  {
    id: "deloitte",
    name: "Deloitte",
    initials: "D",
    color: "#72243E",
    type: "Service",
    blurb: "Expect a case-based round testing structured problem solving, paired with a technical screen focused on databases and web systems.",
    roles: [
      {
        id: "analyst-entry-level",
        title: "Analyst",
        level: "Entry Level",
        counts: { dsa: MASTER_DSA_QUESTIONS.length, system: 0, fundamentals: MASTER_FUNDAMENTALS_QUESTIONS.length, hr: MASTER_HR_QUESTIONS.length, specific: 6 },
        difficulty: { easy: 50, medium: 45, hard: 5 }
      }
    ]
  }
];

// Curated Initial Experiences (Realistic candidate interview round reports)
export const INITIAL_EXPERIENCES: InterviewExperienceItem[] = [
  {
    id: "exp-msft-sde1",
    company: "Microsoft",
    role: "Software Engineer (SDE-1)",
    location: "Redmond / Hyderabad (Hybrid)",
    date: "February 2026",
    verdict: "Offer",
    difficulty: "Medium",
    overallRating: 5,
    summary: "4 rounds in total. Strong focus on clean code, edge cases in Binary Trees, and scaling caching architectures in Round 3.",
    authorName: "Rohan S. • SDE-1",
    isVerified: true,
    rounds: [
      {
        roundName: "Round 1: Online Assessment",
        focus: "Codility - 3 DSA Problems (90 mins)",
        difficulty: "Medium",
        questions: [
          "Minimum deletions to make string frequencies unique",
          "LRU Cache modification with time-based eviction"
        ],
        tips: "Make sure all edge cases (null inputs, empty arrays, single element) pass with O(N) space."
      },
      {
        roundName: "Round 2: Technical Interview (DSA + CS)",
        focus: "Data Structures & Thread Safety",
        difficulty: "Medium",
        questions: [
          "Lowest Common Ancestor in Binary Tree without parent pointers",
          "Thread safe Singleton pattern in Java / C++ and Mutex lock mechanisms"
        ],
        tips: "Talk through your approach before coding. The interviewer changed tree requirements mid-way."
      },
      {
        roundName: "Round 3: System Design & Architecture",
        focus: "Distributed Key-Value Cache",
        difficulty: "Hard",
        questions: [
          "Design a Distributed Cache with LRU eviction and Consistent Hashing",
          "How to handle Cache Stampede / Thundering Herd problem?"
        ],
        tips: "Draw clear data-flow diagrams. Mention Redis master-replica and Sentinel."
      },
      {
        roundName: "Round 4: Hiring Manager & Behavioral",
        focus: "STAR Methodology & Leadership",
        difficulty: "Easy",
        questions: [
          "Tell me about a time you had a technical disagreement with a team member",
          "What was the most challenging bug you debugged in production?"
        ],
        tips: "Use concrete metrics when describing the outcome (e.g. reduced latency by 40%)."
      }
    ]
  },
  {
    id: "exp-goog-swe",
    company: "Google",
    role: "Software Engineer (L3 / Early Career)",
    location: "Mountain View / Bengaluru",
    date: "January 2026",
    verdict: "Offer",
    difficulty: "Hard",
    overallRating: 5,
    summary: "Heavy emphasis on Graph algorithms, topological sorting, and time/space complexity proof.",
    authorName: "Priya M. • SWE",
    isVerified: true,
    rounds: [
      {
        roundName: "Round 1: Technical Screen",
        focus: "Graphs & Topological Sort",
        difficulty: "Medium",
        questions: [
          "Course Schedule II (Detect cycle and return valid topological order)"
        ],
        tips: "Write clean, modular code with descriptive variable names."
      },
      {
        roundName: "Round 2: Advanced Data Structures",
        focus: "Trie & Dynamic Programming",
        difficulty: "Hard",
        questions: [
          "Word Break II with Trie optimization and memoization"
        ],
        tips: "Verify recursion depth and stack overflow constraints."
      },
      {
        roundName: "Round 3: Googleyness & Leadership",
        focus: "Behavioral & Ethics",
        difficulty: "Medium",
        questions: [
          "Describe how you prioritize technical debt against urgent product feature deadlines."
        ],
        tips: "Demonstrate curiosity, humility, and willingness to learn from failures."
      }
    ]
  },
  {
    id: "exp-tcs-digital",
    company: "TCS",
    role: "Digital Cadre",
    location: "Mumbai / Pune",
    date: "March 2026",
    verdict: "Offer",
    difficulty: "Medium",
    overallRating: 4,
    summary: "Solid round on Java OOP, SQL indexing, and academic project architecture.",
    authorName: "Ananya K.",
    isVerified: true,
    rounds: [
      {
        roundName: "Round 1: TCS NQT Advanced Section",
        focus: "Advanced Coding & Quantitative Aptitude",
        difficulty: "Medium",
        questions: [
          "Matrix rotation in-place by 90 degrees",
          "Subarray with given sum (Sliding window)"
        ],
        tips: "Focus on time management during the 180 min online exam."
      },
      {
        roundName: "Round 2: Technical + Managerial Interview",
        focus: "DBMS, OOP, REST APIs & Resume Projects",
        difficulty: "Medium",
        questions: [
          "Explain B+ Tree indexing in PostgreSQL / MySQL",
          "How did you implement authentication in your final year project?"
        ],
        tips: "Know every line of your resume projects thoroughly."
      }
    ]
  }
];

// -------------------------------------------------------------
// LOCAL STORAGE STATE HELPERS
// -------------------------------------------------------------

export function getStoredSolvedMap(): Record<string, boolean> {
  try {
    const raw = localStorage.getItem("user_solved_interview_questions");
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function saveSolvedMap(map: Record<string, boolean>) {
  try {
    localStorage.setItem("user_solved_interview_questions", JSON.stringify(map));
  } catch (e) {
    console.error("Failed to save solved map:", e);
  }
}

export function getStoredBookmarks(): Record<string, boolean> {
  try {
    const raw = localStorage.getItem("user_bookmarked_interview_questions");
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function saveBookmarks(map: Record<string, boolean>) {
  try {
    localStorage.setItem("user_bookmarked_interview_questions", JSON.stringify(map));
  } catch (e) {
    console.error("Failed to save bookmarks:", e);
  }
}

export function getStoredInterviews(): UserInterviewTarget[] {
  try {
    const raw = localStorage.getItem("user_interview_targets");
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.error(e);
  }

  // Default seed interview target if none configured
  const defaultDate = new Date();
  defaultDate.setDate(defaultDate.getDate() + 6);
  const defaultTarget: UserInterviewTarget = {
    id: "target-default-msft",
    company: "Microsoft",
    role: "Software Engineer — SDE-1",
    companyId: "microsoft",
    roleId: "software-engineer-sde-1",
    interviewDate: defaultDate.toISOString().split("T")[0],
    interviewType: "Full Interview",
    currentStageIndex: 1,
    stages: [
      { id: "s1", name: "Online Assessment", category: "dsa", status: "Completed", description: "Codility algorithmic screen", focusTopics: ["Arrays & Hash Maps", "Two Pointers"] },
      { id: "s2", name: "Technical — DSA", category: "dsa", status: "Current", description: "Core data structures & algorithms", focusTopics: ["Binary Trees & BST", "Dynamic Programming"] },
      { id: "s3", name: "Technical — System Design", category: "system", status: "Upcoming", description: "Architecture & scalability", focusTopics: ["Caching", "Database Indexing", "APIs"] },
      { id: "s4", name: "Hiring Manager / HR", category: "hr", status: "Upcoming", description: "Behavioral & STAR fit", focusTopics: ["Leadership Principles", "Conflict Resolution"] }
    ],
    createdAt: new Date().toISOString()
  };

  saveInterviews([defaultTarget]);
  return [defaultTarget];
}

export function saveInterviews(interviews: UserInterviewTarget[]) {
  try {
    localStorage.setItem("user_interview_targets", JSON.stringify(interviews));
  } catch (e) {
    console.error("Failed to save interviews:", e);
  }
}

export function getStoredExperiences(): InterviewExperienceItem[] {
  try {
    const raw = localStorage.getItem("user_interview_experiences");
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.error(e);
  }
  return INITIAL_EXPERIENCES;
}

export function saveExperiences(experiences: InterviewExperienceItem[]) {
  try {
    localStorage.setItem("user_interview_experiences", JSON.stringify(experiences));
  } catch (e) {
    console.error("Failed to save experiences:", e);
  }
}

export function getStoredMockHistory(): MockAttemptHistoryItem[] {
  try {
    const raw = localStorage.getItem("user_mock_interview_history");
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveMockHistory(history: MockAttemptHistoryItem[]) {
  try {
    localStorage.setItem("user_mock_interview_history", JSON.stringify(history));
  } catch (e) {
    console.error(e);
  }
}

// -------------------------------------------------------------
// READINESS SCORE & ANALYTICS ENGINE
// -------------------------------------------------------------

export function calculateReadinessBreakdown(
  solvedMap: Record<string, boolean>,
  targetCompany?: string
): ReadinessBreakdown {
  const dsaTotal = MASTER_DSA_QUESTIONS.length;
  const dsaSolved = MASTER_DSA_QUESTIONS.filter(q => !!solvedMap[q.id]).length;

  const fundTotal = MASTER_FUNDAMENTALS_QUESTIONS.length;
  const fundSolved = MASTER_FUNDAMENTALS_QUESTIONS.filter(q => !!solvedMap[q.id]).length;

  const sysTotal = MASTER_SYSTEM_QUESTIONS.length;
  const sysSolved = MASTER_SYSTEM_QUESTIONS.filter(q => !!solvedMap[q.id]).length;

  const hrTotal = MASTER_HR_QUESTIONS.length;
  const hrSolved = MASTER_HR_QUESTIONS.filter(q => !!solvedMap[q.id]).length;

  const specList = targetCompany && MASTER_SPECIFIC_QUESTIONS[targetCompany] 
    ? MASTER_SPECIFIC_QUESTIONS[targetCompany] 
    : Object.values(MASTER_SPECIFIC_QUESTIONS).flat();
  const specTotal = specList.length;
  const specSolved = specList.filter(q => !!solvedMap[q.id]).length;

  const totalAvailable = dsaTotal + fundTotal + sysTotal + hrTotal + specTotal;
  const totalSolved = dsaSolved + fundSolved + sysSolved + hrSolved + specSolved;

  // Weighted Readiness Metric
  // DSA: 35%, Fundamentals: 25%, System Design: 20%, Behavioral: 15%, Specific: 5%
  const dsaPercent = dsaTotal > 0 ? Math.round((dsaSolved / dsaTotal) * 100) : 0;
  const fundPercent = fundTotal > 0 ? Math.round((fundSolved / fundTotal) * 100) : 0;
  const sysPercent = sysTotal > 0 ? Math.round((sysSolved / sysTotal) * 100) : 0;
  const hrPercent = hrTotal > 0 ? Math.round((hrSolved / hrTotal) * 100) : 0;
  const specPercent = specTotal > 0 ? Math.round((specSolved / specTotal) * 100) : 0;

  // If user has solved 0 questions, base score is calculated accurately
  const overall = Math.round(
    dsaPercent * 0.35 +
    fundPercent * 0.25 +
    sysPercent * 0.20 +
    hrPercent * 0.15 +
    specPercent * 0.05
  );

  // Topic mastery breakdown
  const topicMap: Record<string, { total: number; solved: number }> = {};
  getAllMasterQuestions().forEach(q => {
    const t = q.topic || "General";
    if (!topicMap[t]) topicMap[t] = { total: 0, solved: 0 };
    topicMap[t].total += 1;
    if (solvedMap[q.id]) topicMap[t].solved += 1;
  });

  const topicEntries = Object.entries(topicMap).map(([name, stats]) => ({
    name,
    score: stats.total > 0 ? Math.round((stats.solved / stats.total) * 100) : 0
  }));

  topicEntries.sort((a, b) => b.score - a.score);
  const strongestTopic = topicEntries[0] || { name: "Arrays & Hash Maps", score: 0 };
  
  // Weakest topic with available questions
  const weakCandidates = [...topicEntries].sort((a, b) => a.score - b.score);
  const weakestTopic = weakCandidates[0] || { name: "System Design Architecture", score: 0 };

  // Determine Next Best Action Question
  const nextUnsolvedDSA = MASTER_DSA_QUESTIONS.find(q => !solvedMap[q.id]);
  const nextUnsolvedSys = MASTER_SYSTEM_QUESTIONS.find(q => !solvedMap[q.id]);
  const nextUnsolvedFund = MASTER_FUNDAMENTALS_QUESTIONS.find(q => !solvedMap[q.id]);

  let nextAction = {
    category: "dsa" as const,
    topic: "Arrays & Hash Maps",
    questionId: "dsa-two-sum",
    questionTitle: "Two Sum"
  };

  if (sysPercent < dsaPercent && nextUnsolvedSys) {
    nextAction = {
      category: "system",
      topic: nextUnsolvedSys.topic,
      questionId: nextUnsolvedSys.id,
      questionTitle: nextUnsolvedSys.title
    };
  } else if (fundPercent < dsaPercent && nextUnsolvedFund) {
    nextAction = {
      category: "fundamentals",
      topic: nextUnsolvedFund.topic,
      questionId: nextUnsolvedFund.id,
      questionTitle: nextUnsolvedFund.title
    };
  } else if (nextUnsolvedDSA) {
    nextAction = {
      category: "dsa",
      topic: nextUnsolvedDSA.topic,
      questionId: nextUnsolvedDSA.id,
      questionTitle: nextUnsolvedDSA.title
    };
  }

  return {
    overall,
    dsa: dsaPercent,
    fundamentals: fundPercent,
    system: sysPercent,
    behavioral: hrPercent,
    specific: specPercent,
    totalSolved,
    totalAvailable,
    strongestTopic,
    weakestTopic,
    nextBestAction: nextAction
  };
}

// -------------------------------------------------------------
// DYNAMIC PREPARATION PLAN GENERATOR
// -------------------------------------------------------------

export function generateDynamicPreparationPlan(
  company: string,
  role: string,
  interviewDateStr: string,
  interviewType: string
): PrepPlanDay[] {
  let daysCount = 7;
  if (interviewDateStr) {
    const today = new Date();
    const target = new Date(interviewDateStr);
    const diffTime = target.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays > 0 && diffDays <= 30) {
      daysCount = diffDays;
    }
  }

  const days: PrepPlanDay[] = [];

  for (let day = 1; day <= daysCount; day++) {
    if (day === 1) {
      days.push({
        dayNumber: 1,
        title: "Day 1: DSA Foundations & Hash Maps",
        focus: "Arrays, String algorithms, and Two Pointers patterns",
        tasks: [
          { id: `t-d1-1`, title: "Solve Two Sum & Valid Anagram", category: "dsa", estimatedMinutes: 30, completed: false, questionId: "dsa-two-sum" },
          { id: `t-d1-2`, title: "Review Two Pointers & Sliding Window Cheat Sheet", category: "dsa", estimatedMinutes: 20, completed: false },
          { id: `t-d1-3`, title: "Practice In-Place Array Compaction", category: "dsa", estimatedMinutes: 25, completed: false }
        ]
      });
    } else if (day === 2) {
      days.push({
        dayNumber: 2,
        title: "Day 2: Trees, BST & Recursion",
        focus: "Tree traversal (BFS/DFS), Invert Binary Tree & Lowest Common Ancestor",
        tasks: [
          { id: `t-d2-1`, title: "Solve Maximum Depth & Invert Binary Tree", category: "dsa", estimatedMinutes: 35, completed: false, questionId: "dsa-invert-tree" },
          { id: `t-d2-2`, title: "Review Lowest Common Ancestor in BST", category: "dsa", estimatedMinutes: 25, completed: false },
          { id: `t-d2-3`, title: "Tree Traversal Complexity analysis", category: "dsa", estimatedMinutes: 15, completed: false }
        ]
      });
    } else if (day === 3) {
      days.push({
        dayNumber: 3,
        title: "Day 3: CS Fundamentals (OOP & DBMS)",
        focus: "SOLID Principles, Design Patterns, SQL Indexing & ACID transactions",
        tasks: [
          { id: `t-d3-1`, title: "Review 4 OOP Pillars & Strategy Pattern", category: "fundamentals", estimatedMinutes: 30, completed: false, questionId: "fund-oop-pillars" },
          { id: `t-d3-2`, title: "B+ Tree Indexing vs Full Table Scans", category: "fundamentals", estimatedMinutes: 25, completed: false, questionId: "fund-dbms-indexing" },
          { id: `t-d3-3`, title: "ACID properties and Transaction Isolation Levels", category: "fundamentals", estimatedMinutes: 20, completed: false }
        ]
      });
    } else if (day === 4) {
      days.push({
        dayNumber: 4,
        title: "Day 4: System Design & Scalability",
        focus: "Load balancing, Caching layers (Redis), and DB Sharding",
        tasks: [
          { id: `t-d4-1`, title: "Design URL Shortener (TinyURL) end-to-end", category: "system", estimatedMinutes: 45, completed: false, questionId: "sys-url-shortener" },
          { id: `t-d4-2`, title: "Cache-Aside pattern and Cache Eviction Policies", category: "system", estimatedMinutes: 25, completed: false },
          { id: `t-d4-3`, title: "REST vs GraphQL API design trade-offs", category: "system", estimatedMinutes: 20, completed: false }
        ]
      });
    } else if (day === 5) {
      days.push({
        dayNumber: 5,
        title: `Day 5: ${company} Specific Question Bank`,
        focus: `High-frequency interview questions reported at ${company}`,
        tasks: [
          { id: `t-d5-1`, title: `Solve top ${company} DSA & Architecture problem`, category: "dsa", estimatedMinutes: 40, completed: false },
          { id: `t-d5-2`, title: `Review ${company} hiring process & role expectations`, category: "mock", estimatedMinutes: 20, completed: false },
          { id: `t-d5-3`, title: `Read verified candidate interview experiences`, category: "behavioral", estimatedMinutes: 20, completed: false }
        ]
      });
    } else if (day === 6) {
      days.push({
        dayNumber: 6,
        title: "Day 6: Behavioral & STAR Method Mastery",
        focus: "Leadership principles, handling conflicts, and project walkthroughs",
        tasks: [
          { id: `t-d6-1`, title: "Draft 3 STAR stories: Conflict, Failure, High Impact", category: "behavioral", estimatedMinutes: 40, completed: false, questionId: "hr-conflict-resolution" },
          { id: `t-d6-2`, title: "Practice Project Architecture defense out loud", category: "behavioral", estimatedMinutes: 25, completed: false },
          { id: `t-d6-3`, title: "Prepare thoughtful reverse-questions for the interviewer", category: "behavioral", estimatedMinutes: 15, completed: false }
        ]
      });
    } else {
      days.push({
        dayNumber: day,
        title: `Day ${day}: Full Simulation Mock Interview`,
        focus: "Live 45-minute timed simulation & final diagnostic check",
        tasks: [
          { id: `t-d${day}-1`, title: `Take a 30-min AI Mock Interview for ${company}`, category: "mock", estimatedMinutes: 35, completed: false },
          { id: `t-d${day}-2`, title: "Review Diagnostic Scorecard & Weak Topic feedback", category: "mock", estimatedMinutes: 20, completed: false },
          { id: `t-d${day}-3`, title: "Final confidence check & rest before the interview", category: "behavioral", estimatedMinutes: 15, completed: false }
        ]
      });
    }
  }

  return days;
}

// -------------------------------------------------------------
// PERSONALIZED RECOMMENDATIONS GENERATOR
// -------------------------------------------------------------

export function generatePersonalizedRecommendations(
  activeInterview: UserInterviewTarget | null,
  solvedMap: Record<string, boolean>
): InterviewQuestionItem[] {
  const all = getAllMasterQuestions();
  const targetCompany = activeInterview ? activeInterview.company : null;

  // Prioritize questions from target company or high-probability core patterns
  const prioritized = all.filter(q => {
    const isTarget = targetCompany ? (q.companies && q.companies.includes(targetCompany)) : true;
    const isUnsolved = !solvedMap[q.id];
    return isTarget && isUnsolved;
  });

  if (prioritized.length >= 4) {
    return prioritized.slice(0, 4);
  }

  // Fallback to top unsolved master questions
  const remaining = all.filter(q => !solvedMap[q.id] && !prioritized.some(p => p.id === q.id));
  return [...prioritized, ...remaining].slice(0, 4);
}
