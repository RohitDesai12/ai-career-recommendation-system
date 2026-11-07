import { InterviewQuestionItem, QuestionResource, TopicCheatSheet } from "../interviewQuestionsData";

export interface RoleCounts {
  dsa: number;
  system: number;
  fundamentals: number;
  hr: number;
  specific: number;
}

export interface RoleDifficulty {
  easy: number;
  medium: number;
  hard: number;
}

export interface CompanyRole {
  id: string;
  title: string;
  level: string;
  counts: RoleCounts;
  difficulty: RoleDifficulty;
}

export interface CompanyData {
  id: string;
  name: string;
  initials: string;
  color: string;
  type: "Product" | "Service";
  blurb: string;
  roles: CompanyRole[];
}

export interface CategoryMeta {
  key: keyof RoleCounts;
  label: string;
  shortLabel: string;
  iconName: string;
  ramp: string;
  bg: string;
  text: string;
}

export type InterviewStageStatus = "Completed" | "Current" | "Upcoming" | "Locked";

export interface InterviewStage {
  id: string;
  name: string;
  category: "dsa" | "system" | "fundamentals" | "hr" | "specific" | "aptitude";
  status: InterviewStageStatus;
  description: string;
  focusTopics: string[];
}

export interface UserInterviewTarget {
  id: string;
  company: string;
  role: string;
  companyId?: string;
  roleId?: string;
  interviewDate: string; // ISO string e.g. "2026-10-15"
  interviewType: "Technical" | "System Design" | "Behavioral" | "Full Interview" | "DSA";
  currentStageIndex: number;
  stages: InterviewStage[];
  notes?: string;
  isCompleted?: boolean;
  createdAt: string;
}

export interface PrepTaskItem {
  id: string;
  title: string;
  category: "dsa" | "system" | "fundamentals" | "behavioral" | "mock";
  estimatedMinutes: number;
  completed: boolean;
  questionId?: string;
  resourceLink?: string;
}

export interface PrepPlanDay {
  dayNumber: number;
  title: string;
  focus: string;
  tasks: PrepTaskItem[];
  isCompleted?: boolean;
}

export interface InterviewRoundReport {
  roundName: string;
  focus: string;
  difficulty: "Easy" | "Medium" | "Hard";
  questions: string[];
  tips?: string;
}

export interface InterviewExperienceItem {
  id: string;
  company: string;
  role: string;
  location?: string;
  date: string;
  verdict: "Offer" | "Rejected" | "Pending";
  difficulty: "Easy" | "Medium" | "Hard";
  overallRating: number; // 1-5
  summary: string;
  rounds: InterviewRoundReport[];
  authorName?: string;
  isVerified?: boolean;
}

export interface ReadinessBreakdown {
  overall: number; // 0 - 100
  dsa: number;
  fundamentals: number;
  system: number;
  behavioral: number;
  specific: number;
  totalSolved: number;
  totalAvailable: number;
  strongestTopic: { name: string; score: number };
  weakestTopic: { name: string; score: number };
  nextBestAction: {
    category: "dsa" | "system" | "fundamentals" | "hr";
    topic: string;
    questionId?: string;
    questionTitle: string;
  };
}

export interface MockAttemptHistoryItem {
  id: string;
  company: string;
  role: string;
  interviewType: string;
  date: string;
  overallScore: number;
  hiringVerdict: string;
  metrics: {
    technicalAccuracy: number;
    communicationClarity: number;
    problemSolving: number;
    crossExaminationAdaptability: number;
    systemArchitecture: number;
  };
}
