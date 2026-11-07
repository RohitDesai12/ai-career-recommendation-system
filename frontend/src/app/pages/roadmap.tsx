import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation, useSearchParams } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import axios from "axios";
import { useAuth } from "../context/auth-context";
import {
  Sparkles,
  Map,
  Compass,
  CheckCircle2,
  Clock,
  BookOpen,
  Briefcase,
  Layers,
  ChevronRight,
  ChevronDown,
  Star,
  Play,
  Pause,
  Archive,
  Trash2,
  Plus,
  RotateCcw,
  SlidersHorizontal,
  FileText,
  ExternalLink,
  Code,
  FolderGit2,
  Bookmark,
  Check,
  X,
  AlertCircle,
  HelpCircle,
  TrendingUp,
  Target,
  Award,
  Calendar,
  Grid,
  List,
  Filter,
  Search,
  ArrowRight,
  MoreVertical,
  Flag,
  Lightbulb,
  Edit2,
  GraduationCap
} from "lucide-react";
import { CircularProgress } from "../components/ui/circular-progress";

// Department & Field Taxonomies
const DEPARTMENT_FIELDS: Record<string, string[]> = {
  "Computer Science & IT": [
    "Full Stack Web Developer",
    "Software Development Engineer",
    "ML Engineer / AI Researcher",
    "Data Scientist",
    "Data Engineer",
    "Cybersecurity Analyst",
    "Cloud Architect / DevOps Engineer",
    "Blockchain Developer",
    "Mobile App Developer",
    "Game Developer",
    "Database Administrator",
    "Network Engineer",
    "IT Security Analyst",
    "QA / Automation Test Engineer",
    "SAP / ERP Consultant",
    "Business / Data Analyst",
    "Quantitative / Risk Analyst"
  ],
  "Electronics & Communication": [
    "VLSI Design Engineer",
    "Embedded Systems Engineer",
    "IoT Solutions Developer",
    "RF / Telecom Engineer",
    "Robotics Engineer"
  ],
  "Electrical & Power": [
    "Power Systems Engineer",
    "PLC / SCADA Automation Engineer",
    "Renewable Energy Engineer",
    "Smart Grid Engineer",
    "EV Powertrain Engineer"
  ],
  "Mechanical & Manufacturing": [
    "Automotive Design Engineer",
    "Manufacturing / Production Engineer",
    "Industrial Robotics Engineer",
    "CAD/CAM Design Engineer",
    "Thermal / HVAC Engineer",
    "Aerodynamics / CFD Engineer",
    "Propulsion / Rocket Engineer",
    "Spacecraft / Satellite Engineer",
    "Avionics Engineer"
  ],
  "Civil & Infrastructure": [
    "Structural Design Engineer",
    "Construction Project Manager",
    "Geotechnical Engineer",
    "Urban / City Planner"
  ]
};

interface SkillItem {
  _id?: string;
  name: string;
  status: "Not Started" | "Beginner" | "Intermediate" | "Advanced" | "Completed";
  completed: boolean;
  required?: number;
  category?: string;
}

interface ResourceItem {
  _id?: string;
  resourceId?: string;
  name: string;
  provider: string;
  url: string;
  type: string;
  duration?: string;
  isFree: boolean;
  rating?: number;
  completed: boolean;
  isCustom?: boolean;
}

interface ProjectItem {
  _id?: string;
  title: string;
  description: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  duration: string;
  skills: string[];
  requirements: string[];
  suggestedTechnologies: string[];
  status: "Not Started" | "In Progress" | "Completed";
  githubUrl?: string;
  liveDemoUrl?: string;
  notes?: string;
  completedAt?: string;
}

interface StageItem {
  _id?: string;
  stageNumber: number;
  title: string;
  description: string;
  weeks: number;
  status: "Not Started" | "In Progress" | "Completed" | "Locked";
  progressPercent: number;
  skills: SkillItem[];
  resources: ResourceItem[];
  projects: ProjectItem[];
  aiTip?: string;
}

interface MilestoneItem {
  title: string;
  stageNumber: number;
  durationWeeks: number;
  targetTimeframe: string;
  completed: boolean;
}

interface RoadmapData {
  _id: string;
  user?: string;
  department: string;
  field: string;
  targetCareer?: string;
  isPrimary?: boolean;
  status?: "Not Started" | "In Progress" | "Paused" | "Completed" | "Archived";
  version?: number;
  lastAccessedAt?: string;
  archivedAt?: string;
  completedAt?: string;
  learningPaceHoursPerWeek: number;
  preferredLearningStyle: "Mixed" | "Hands-on" | "Video" | "Reading";
  stages: StageItem[];
  milestones: MilestoneItem[];
  percentComplete: number;
  stagesComplete: number;
  totalStages: number;
  completedSkillsCount: number;
  totalSkillsCount: number;
  completedProjectsCount: number;
  totalProjectsCount: number;
  totalResourcesCount: number;
  estimatedMonths: string;
  careerReadinessScore: number;
}

interface MyRoadmapsSummary {
  primary: any | null;
  active: any[];
  paused: any[];
  completed: any[];
  archived: any[];
  allRoadmaps: any[];
  totalRoadmaps: number;
}

export function RoadmapPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();

  const queryRoadmapId = searchParams.get("id") || searchParams.get("roadmapId");

  // Determine subview from pathname: "/roadmap", "/roadmap/overview", "/roadmap/roadmaps", "/roadmap/history"
  const isRoadmapsView = location.pathname.endsWith("/roadmaps");
  const isHistoryView = location.pathname.endsWith("/history");
  const isOverviewView = !isRoadmapsView && !isHistoryView;

  // Multi-Roadmaps Aggregation State
  const [myRoadmaps, setMyRoadmaps] = useState<MyRoadmapsSummary>({
    primary: null,
    active: [],
    paused: [],
    completed: [],
    archived: [],
    allRoadmaps: [],
    totalRoadmaps: 0
  });

  // Active Roadmap Data
  const [roadmap, setRoadmap] = useState<RoadmapData | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  // State for toasts & async actions
  const [successToast, setSuccessToast] = useState<string | null>(null);
  const [errorToast, setErrorToast] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<Record<string, string>>({});

  // Switcher dropdown state
  const [isSwitcherOpen, setIsSwitcherOpen] = useState(false);
  const switcherRef = useRef<HTMLDivElement>(null);
  const fetchRequestIdRef = useRef<number>(0);

  // Action menu for cards in Roadmaps tab
  const [openCardMenuId, setOpenCardMenuId] = useState<string | null>(null);

  // Overview Internal Content Tabs: "stages" | "skills" | "projects" | "courses" | "jobs"
  type OverviewTab = "stages" | "skills" | "projects" | "courses" | "jobs";
  const [overviewTab, setOverviewTab] = useState<OverviewTab>("stages");
  const [viewMode, setViewMode] = useState<"stages" | "timeline">("stages");

  // Expanded Stage Accordions
  const [expandedStages, setExpandedStages] = useState<Record<number, boolean>>({ 0: true });

  // Verified Catalog Resources & Jobs
  const [verifiedResources, setVerifiedResources] = useState<any[]>([]);
  const [jobs, setJobs] = useState<any[]>([]);
  const [profile, setProfile] = useState<any>(null);

  // Skills Tab Filter
  const [skillFilter, setSkillFilter] = useState<"all" | "high" | "medium" | "completed">("all");
  const [skillSearch, setSkillSearch] = useState("");

  // Course Tab Filters
  const [courseTypeFilter, setCourseTypeFilter] = useState("all");
  const [courseSearch, setCourseSearch] = useState("");

  // Roadmaps Tab Filter: "all" | "in_progress" | "not_started" | "paused" | "completed" | "archived"
  const [roadmapsListFilter, setRoadmapsListFilter] = useState<string>("all");

  // History Tab Filter: "all" | "in_progress" | "completed" | "paused" | "archived"
  const [historyFilter, setHistoryFilter] = useState<string>("all");

  // Modals
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [showEditGoalModal, setShowEditGoalModal] = useState(false);
  const [showNewRoadmapModal, setShowNewRoadmapModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; title: string } | null>(null);
  const [showAddResourceModal, setShowAddResourceModal] = useState<number | null>(null);
  const [showProjectModal, setShowProjectModal] = useState<{ stageIdx: number; projIdx: number } | null>(null);

  // Adjust Path Form State
  const [adjustPace, setAdjustPace] = useState(10);
  const [adjustStyle, setAdjustStyle] = useState<"Mixed" | "Hands-on" | "Video" | "Reading">("Mixed");
  const [adjustKnownSkills, setAdjustKnownSkills] = useState<string[]>([]);
  const [savingAdjust, setSavingAdjust] = useState(false);

  // New Roadmap Form State
  const [newRoadmapDept, setNewRoadmapDept] = useState("Computer Science & IT");
  const [newRoadmapField, setNewRoadmapField] = useState("Full Stack Web Developer");
  const [newRoadmapCustomField, setNewRoadmapCustomField] = useState("");

  // Add Resource Form State
  const [newResTitle, setNewResTitle] = useState("");
  const [newResProvider, setNewResProvider] = useState("");
  const [newResUrl, setNewResUrl] = useState("");
  const [newResType, setNewResType] = useState("Doc");
  const [newResDuration, setNewResDuration] = useState("2 Hours");
  const [newResFree, setNewResFree] = useState(true);

  // Project Submission Form State
  const [projGithubUrl, setProjGithubUrl] = useState("");
  const [projLiveUrl, setProjLiveUrl] = useState("");
  const [projNotes, setProjNotes] = useState("");
  const [projStatus, setProjStatus] = useState<"Not Started" | "In Progress" | "Completed">("In Progress");

  // Dynamic Token and Header helper to prevent stale auth headers
  const getAuthHeaders = () => {
    const t = localStorage.getItem("token");
    return t ? { "x-auth-token": t } : {};
  };

  // Close dropdowns when clicking outside or pressing Escape
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as HTMLElement;
      if (switcherRef.current && !switcherRef.current.contains(target)) {
        setIsSwitcherOpen(false);
      }
      if (!target.closest("[data-roadmap-menu]")) {
        setOpenCardMenuId(null);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsSwitcherOpen(false);
        setOpenCardMenuId(null);
        setDeleteTarget(null);
        setShowAdjustModal(false);
        setShowEditGoalModal(false);
        setShowNewRoadmapModal(false);
        setShowAddResourceModal(null);
        setShowProjectModal(null);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  // Safe normalization helper for roadmap object
  const normalizeRoadmap = (data: any): RoadmapData => {
    if (!data) return data;
    const stages = Array.isArray(data.stages) ? data.stages : [];
    const normalizedStages: StageItem[] = stages.map((st: any, idx: number) => ({
      _id: st._id,
      stageNumber: st.stageNumber || idx + 1,
      title: st.title || `Stage ${idx + 1}`,
      description: st.description || "",
      weeks: st.weeks || 4,
      status: st.status || (idx === 0 ? "In Progress" : "Not Started"),
      progressPercent: typeof st.progressPercent === "number" ? st.progressPercent : 0,
      skills: Array.isArray(st.skills) ? st.skills.map((sk: any) => ({
        _id: sk._id,
        name: sk.name || "Skill",
        status: sk.status || (sk.completed ? "Completed" : "Not Started"),
        completed: Boolean(sk.completed || sk.status === "Completed"),
        required: sk.required || 75,
        category: sk.category || "Core"
      })) : [],
      resources: Array.isArray(st.resources) ? st.resources.map((r: any) => ({
        _id: r._id,
        resourceId: r.resourceId,
        name: r.name || "Resource",
        provider: r.provider || "Official Guide",
        url: r.url || "#",
        type: r.type || "Doc",
        duration: r.duration || "2 Hours",
        isFree: r.isFree !== false,
        rating: r.rating || 4.8,
        completed: Boolean(r.completed),
        isCustom: Boolean(r.isCustom)
      })) : [],
      projects: Array.isArray(st.projects) ? st.projects.map((p: any) => ({
        _id: p._id,
        title: p.title || "Capstone Project",
        description: p.description || "",
        difficulty: p.difficulty || "Intermediate",
        duration: p.duration || "2 Weeks",
        skills: Array.isArray(p.skills) ? p.skills : [],
        requirements: Array.isArray(p.requirements) ? p.requirements : [],
        suggestedTechnologies: Array.isArray(p.suggestedTechnologies) ? p.suggestedTechnologies : [],
        status: p.status || "Not Started",
        githubUrl: p.githubUrl,
        liveDemoUrl: p.liveDemoUrl,
        notes: p.notes,
        completedAt: p.completedAt
      })) : [],
      aiTip: st.aiTip || ""
    }));

    const milestones: MilestoneItem[] = Array.isArray(data.milestones) ? data.milestones.map((m: any, idx: number) => ({
      title: m.title || `Milestone ${idx + 1}`,
      stageNumber: m.stageNumber || idx + 1,
      durationWeeks: m.durationWeeks || 4,
      targetTimeframe: m.targetTimeframe || `In ~${(idx + 1) * 4} weeks`,
      completed: Boolean(m.completed)
    })) : [];

    return {
      _id: data._id,
      user: data.user,
      department: data.department || "Computer Science & IT",
      field: data.field || data.targetCareer || "Full Stack Web Developer",
      targetCareer: data.targetCareer || data.field || "Full Stack Web Developer",
      isPrimary: Boolean(data.isPrimary),
      status: data.status || "In Progress",
      version: data.version || 1,
      lastAccessedAt: data.lastAccessedAt,
      archivedAt: data.archivedAt,
      completedAt: data.completedAt,
      learningPaceHoursPerWeek: data.learningPaceHoursPerWeek || 10,
      preferredLearningStyle: data.preferredLearningStyle || "Mixed",
      stages: normalizedStages,
      milestones,
      percentComplete: typeof data.percentComplete === "number" ? data.percentComplete : 0,
      stagesComplete: typeof data.stagesComplete === "number" ? data.stagesComplete : 0,
      totalStages: data.totalStages || normalizedStages.length,
      completedSkillsCount: typeof data.completedSkillsCount === "number" ? data.completedSkillsCount : 0,
      totalSkillsCount: typeof data.totalSkillsCount === "number" ? data.totalSkillsCount : 0,
      completedProjectsCount: typeof data.completedProjectsCount === "number" ? data.completedProjectsCount : 0,
      totalProjectsCount: typeof data.totalProjectsCount === "number" ? data.totalProjectsCount : 0,
      totalResourcesCount: typeof data.totalResourcesCount === "number" ? data.totalResourcesCount : 0,
      estimatedMonths: data.estimatedMonths || "~4 Months",
      careerReadinessScore: data.careerReadinessScore || 70
    };
  };

  // Load Roadmap Suite & Selected Active Roadmap
  const fetchRoadmapData = async (targetId?: string) => {
    const currentRequestId = ++fetchRequestIdRef.current;
    setLoading(true);
    setErrorMessage(null);
    try {
      const activeIdToFetch = targetId !== undefined ? targetId : queryRoadmapId;
      const roadmapUrl = activeIdToFetch
        ? `http://localhost:5000/api/roadmap?id=${activeIdToFetch}`
        : "http://localhost:5000/api/roadmap";

      const authConfig = { headers: getAuthHeaders() };
      const [rRes, myRes, pRes, resRes, jRes] = await Promise.allSettled([
        axios.get(roadmapUrl, authConfig),
        axios.get("http://localhost:5000/api/roadmap/my-roadmaps", authConfig),
        axios.get("http://localhost:5000/api/profile/me", authConfig),
        axios.get("http://localhost:5000/api/roadmap/resources", authConfig),
        axios.get("http://localhost:5000/api/employer/public-jobs")
      ]);

      // If a newer request was dispatched while this was pending, drop this result to avoid race conditions
      if (currentRequestId !== fetchRequestIdRef.current) return;

      if (rRes.status === "fulfilled" && rRes.value.data && rRes.value.data._id) {
        const normalized = normalizeRoadmap(rRes.value.data);
        setRoadmap(normalized);
        setAdjustPace(normalized.learningPaceHoursPerWeek || 10);
        setAdjustStyle(normalized.preferredLearningStyle || "Mixed");

        // Auto expand active stage
        const exp: Record<number, boolean> = {};
        let activeIdx = 0;
        normalized.stages.forEach((st, idx) => {
          if (st.status === "In Progress") activeIdx = idx;
        });
        exp[activeIdx] = true;
        setExpandedStages(exp);
      } else {
        setRoadmap(null);
      }

      if (myRes.status === "fulfilled" && myRes.value.data) {
        const raw = myRes.value.data;
        const allList: any[] = Array.isArray(raw.allRoadmaps) ? raw.allRoadmaps : [];
        const activeList: any[] = Array.isArray(raw.activeRoadmaps) ? raw.activeRoadmaps : (Array.isArray(raw.active) ? raw.active : []);
        const pausedList: any[] = Array.isArray(raw.pausedRoadmaps) ? raw.pausedRoadmaps : (Array.isArray(raw.paused) ? raw.paused : []);
        const completedList: any[] = Array.isArray(raw.completedRoadmaps) ? raw.completedRoadmaps : (Array.isArray(raw.completed) ? raw.completed : []);
        const archivedList: any[] = Array.isArray(raw.archivedRoadmaps) ? raw.archivedRoadmaps : (Array.isArray(raw.archived) ? raw.archived : []);

        setMyRoadmaps({
          primary: raw.primaryRoadmap || raw.primary || null,
          active: activeList,
          paused: pausedList,
          completed: completedList,
          archived: archivedList,
          allRoadmaps: allList.length > 0 ? allList : [...activeList, ...pausedList, ...completedList, ...archivedList],
          totalRoadmaps: typeof raw.totalRoadmaps === "number" ? raw.totalRoadmaps : allList.length
        });
      }

      if (pRes.status === "fulfilled" && pRes.value.data) {
        setProfile(pRes.value.data);
        if (pRes.value.data.targetCareer) {
          setNewRoadmapField(pRes.value.data.targetCareer);
        }
      }

      if (resRes.status === "fulfilled" && resRes.value.data?.resources && Array.isArray(resRes.value.data.resources)) {
        setVerifiedResources(resRes.value.data.resources);
      }

      if (jRes.status === "fulfilled" && jRes.value.data?.jobs && Array.isArray(jRes.value.data.jobs)) {
        setJobs(jRes.value.data.jobs);
      }
    } catch (err: any) {
      if (currentRequestId !== fetchRequestIdRef.current) return;
      console.error("Error loading roadmap suite:", err);
      setErrorMessage("We couldn't load your roadmap data. Please verify connection and try again.");
    } finally {
      if (currentRequestId === fetchRequestIdRef.current) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchRoadmapData(queryRoadmapId || undefined);
  }, [user, queryRoadmapId]);

  // Handler: Switch Active Roadmap
  const handleSwitchRoadmap = (roadmapId: string) => {
    setIsSwitcherOpen(false);
    if (isRoadmapsView || isHistoryView) {
      navigate(`/roadmap?id=${roadmapId}`);
    } else {
      setSearchParams({ id: roadmapId });
    }
  };

  // Handler: Set As Primary Roadmap (Scoped & Persisted in DB)
  const handleSetPrimary = async (roadmapId: string) => {
    if (actionLoading[roadmapId]) return;
    setActionLoading((prev) => ({ ...prev, [roadmapId]: "primary" }));
    try {
      const res = await axios.put(`http://localhost:5000/api/roadmap/${roadmapId}/primary`, {}, { headers: getAuthHeaders() });
      setSuccessToast("Primary target career updated.");
      setTimeout(() => setSuccessToast(null), 3000);
      await fetchRoadmapData(roadmap?._id);
    } catch (err: any) {
      console.error("Error setting primary roadmap:", err);
      setErrorToast("Unable to set this roadmap as primary. Please try again.");
      setTimeout(() => setErrorToast(null), 4000);
    } finally {
      setActionLoading((prev) => {
        const copy = { ...prev };
        delete copy[roadmapId];
        return copy;
      });
    }
  };

  // Handler: Update Roadmap Status (Pause / Resume / Archive / Restore)
  const handleUpdateStatus = async (roadmapId: string, newStatus: string) => {
    if (actionLoading[roadmapId]) return;
    setActionLoading((prev) => ({ ...prev, [roadmapId]: newStatus.toLowerCase() }));
    try {
      await axios.put(`http://localhost:5000/api/roadmap/${roadmapId}/status`, { status: newStatus }, { headers: getAuthHeaders() });
      if (newStatus === "Paused") {
        setSuccessToast("Roadmap paused. You can resume it anytime.");
      } else if (newStatus === "In Progress") {
        setSuccessToast("Roadmap is now active and in progress.");
      } else if (newStatus === "Archived") {
        setSuccessToast("Roadmap archived. You can view or restore it from History.");
      } else {
        setSuccessToast(`Roadmap status updated to ${newStatus}.`);
      }
      setTimeout(() => setSuccessToast(null), 3000);
      await fetchRoadmapData(roadmap?._id);
    } catch (err: any) {
      console.error("Error updating roadmap status:", err);
      const actionName = newStatus === "Paused" ? "pause" : newStatus === "Archived" ? "archive" : "update";
      setErrorToast(`Unable to ${actionName} this roadmap. Please try again.`);
      setTimeout(() => setErrorToast(null), 4000);
    } finally {
      setActionLoading((prev) => {
        const copy = { ...prev };
        delete copy[roadmapId];
        return copy;
      });
    }
  };

  // Handler: Delete Roadmap (Permanently remove scoped to user)
  const handleDeleteRoadmap = async (roadmapId: string) => {
    if (actionLoading[roadmapId]) return;
    setActionLoading((prev) => ({ ...prev, [roadmapId]: "deleting" }));
    try {
      await axios.delete(`http://localhost:5000/api/roadmap/${roadmapId}`, { headers: getAuthHeaders() });
      setDeleteTarget(null);
      setSuccessToast("Roadmap deleted successfully.");
      setTimeout(() => setSuccessToast(null), 3000);
      if (roadmap?._id === roadmapId) {
        setSearchParams({});
        await fetchRoadmapData("");
      } else {
        await fetchRoadmapData(roadmap?._id);
      }
    } catch (err: any) {
      console.error("Error deleting roadmap:", err);
      setErrorToast("Unable to delete this roadmap. Please try again.");
      setTimeout(() => setErrorToast(null), 4000);
    } finally {
      setActionLoading((prev) => {
        const copy = { ...prev };
        delete copy[roadmapId];
        return copy;
      });
    }
  };

  // Handler: Create / Generate New Roadmap
  const handleCreateRoadmapSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (generating) return;
    const finalCareer = newRoadmapCustomField.trim() || newRoadmapField;
    if (!finalCareer) return;

    setGenerating(true);
    try {
      const res = await axios.post("http://localhost:5000/api/roadmap/generate", {
        department: newRoadmapDept,
        field: finalCareer,
        forceNew: true
      }, { headers: getAuthHeaders() });

      setShowNewRoadmapModal(false);
      setNewRoadmapCustomField("");
      setSuccessToast("Roadmap created successfully.");
      setTimeout(() => setSuccessToast(null), 4000);

      if (res.data?._id) {
        navigate(`/roadmap?id=${res.data._id}`);
      } else {
        navigate("/roadmap");
      }
    } catch (err: any) {
      console.error("Error generating new roadmap:", err);
      alert("Roadmap couldn't be created. Please verify backend connection and try again.");
    } finally {
      setGenerating(false);
    }
  };

  // Handler: Toggle / Update Skill Status
  const handleUpdateSkill = async (stageIdx: number, skillName: string, newStatus?: "Not Started" | "Beginner" | "Intermediate" | "Advanced" | "Completed") => {
    if (!roadmap) return;
    try {
      const res = await axios.put("http://localhost:5000/api/roadmap/skill-progress", {
        stageIndex: stageIdx,
        skillName,
        status: newStatus,
        roadmapId: roadmap._id
      }, { headers: getAuthHeaders() });

      const normalized = normalizeRoadmap(res.data);
      setRoadmap(normalized);
      // Refresh myRoadmaps summary
      const myRes = await axios.get("http://localhost:5000/api/roadmap/my-roadmaps", { headers: getAuthHeaders() });
      if (myRes.data) {
        const raw = myRes.data;
        const allList: any[] = Array.isArray(raw.allRoadmaps) ? raw.allRoadmaps : [];
        setMyRoadmaps({
          primary: raw.primaryRoadmap || raw.primary || null,
          active: Array.isArray(raw.activeRoadmaps) ? raw.activeRoadmaps : (raw.active || []),
          paused: Array.isArray(raw.pausedRoadmaps) ? raw.pausedRoadmaps : (raw.paused || []),
          completed: Array.isArray(raw.completedRoadmaps) ? raw.completedRoadmaps : (raw.completed || []),
          archived: Array.isArray(raw.archivedRoadmaps) ? raw.archivedRoadmaps : (raw.archived || []),
          allRoadmaps: allList,
          totalRoadmaps: typeof raw.totalRoadmaps === "number" ? raw.totalRoadmaps : allList.length
        });
      }
    } catch (err) {
      console.error("Error updating skill:", err);
    }
  };

  // Handler: Toggle Resource Completion
  const handleToggleResource = async (stageIdx: number, resourceUrl: string, completed: boolean) => {
    if (!roadmap) return;
    try {
      const res = await axios.put("http://localhost:5000/api/roadmap/resource-progress", {
        stageIndex: stageIdx,
        resourceUrl,
        completed: !completed,
        roadmapId: roadmap._id
      }, { headers: getAuthHeaders() });

      setRoadmap(normalizeRoadmap(res.data));
    } catch (err) {
      console.error("Error toggling resource:", err);
    }
  };

  // Handler: Submit Project Solution
  const handleSaveProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roadmap || !showProjectModal) return;

    try {
      const res = await axios.put("http://localhost:5000/api/roadmap/project-progress", {
        stageIndex: showProjectModal.stageIdx,
        projectIndex: showProjectModal.projIdx,
        status: projStatus,
        githubUrl: projGithubUrl,
        liveDemoUrl: projLiveUrl,
        notes: projNotes,
        roadmapId: roadmap._id
      }, { headers: getAuthHeaders() });

      setRoadmap(normalizeRoadmap(res.data));
      setShowProjectModal(null);
      setSuccessToast("Project solution recorded!");
      setTimeout(() => setSuccessToast(null), 3000);
    } catch (err) {
      console.error("Error saving project:", err);
    }
  };

  // Handler: Add Custom Resource
  const handleAddCustomResource = async (e: React.FormEvent) => {
    e.preventDefault();
    if (showAddResourceModal === null || !newResTitle || !newResUrl || !roadmap) return;

    try {
      const res = await axios.post("http://localhost:5000/api/roadmap/custom-resource", {
        stageIndex: showAddResourceModal,
        name: newResTitle,
        provider: newResProvider || "Custom Link",
        url: newResUrl,
        type: newResType,
        duration: newResDuration,
        isFree: newResFree,
        roadmapId: roadmap._id
      }, { headers: getAuthHeaders() });

      setRoadmap(normalizeRoadmap(res.data));
      setShowAddResourceModal(null);
      setNewResTitle("");
      setNewResProvider("");
      setNewResUrl("");
      setSuccessToast("Custom resource added to stage.");
      setTimeout(() => setSuccessToast(null), 3000);
    } catch (err) {
      console.error("Error adding resource:", err);
    }
  };

  // Handler: Save Path Adjustments
  const handleSaveAdjustPath = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roadmap) return;
    setSavingAdjust(true);
    try {
      const res = await axios.post("http://localhost:5000/api/roadmap/adjust-path", {
        learningPaceHoursPerWeek: adjustPace,
        preferredLearningStyle: adjustStyle,
        knownSkills: adjustKnownSkills,
        roadmapId: roadmap._id
      }, { headers: getAuthHeaders() });

      setRoadmap(normalizeRoadmap(res.data));
      setShowAdjustModal(false);
      setSuccessToast("Roadmap pace & style adjusted.");
      setTimeout(() => setSuccessToast(null), 3000);
    } catch (err) {
      console.error("Error adjusting path:", err);
    } finally {
      setSavingAdjust(false);
    }
  };

  const toggleExpand = (idx: number) => {
    setExpandedStages((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  // Safe Flat roadmaps list
  const allUserRoadmaps: any[] = [];
  if (myRoadmaps.allRoadmaps && myRoadmaps.allRoadmaps.length > 0) {
    allUserRoadmaps.push(...myRoadmaps.allRoadmaps);
  } else {
    if (myRoadmaps.primary) allUserRoadmaps.push(myRoadmaps.primary);
    (myRoadmaps.active || []).forEach((r) => {
      if (!allUserRoadmaps.some((x) => x._id === r._id)) allUserRoadmaps.push(r);
    });
    (myRoadmaps.paused || []).forEach((r) => {
      if (!allUserRoadmaps.some((x) => x._id === r._id)) allUserRoadmaps.push(r);
    });
    (myRoadmaps.completed || []).forEach((r) => {
      if (!allUserRoadmaps.some((x) => x._id === r._id)) allUserRoadmaps.push(r);
    });
    (myRoadmaps.archived || []).forEach((r) => {
      if (!allUserRoadmaps.some((x) => x._id === r._id)) allUserRoadmaps.push(r);
    });
  }

  // Filtered roadmaps for "My Roadmaps" subview
  const filteredMyRoadmaps = allUserRoadmaps.filter((r) => {
    if (roadmapsListFilter === "in_progress") return r.status === "In Progress";
    if (roadmapsListFilter === "not_started") return r.status === "Not Started";
    if (roadmapsListFilter === "paused") return r.status === "Paused";
    if (roadmapsListFilter === "completed") return r.status === "Completed";
    if (roadmapsListFilter === "archived") return r.status === "Archived";
    return true;
  });

  // Filtered roadmaps for "History" subview
  const filteredHistoryRoadmaps = allUserRoadmaps.filter((r) => {
    if (historyFilter === "in_progress") return r.status === "In Progress";
    if (historyFilter === "completed") return r.status === "Completed";
    if (historyFilter === "paused") return r.status === "Paused";
    if (historyFilter === "archived") return r.status === "Archived";
    return true;
  });

  // -------------------------------------------------------------
  // LOADING SKELETON
  // -------------------------------------------------------------
  if (loading) {
    return (
      <div className="max-w-7xl mx-auto space-y-6 font-sans pb-16">
        <div className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-xs animate-pulse flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-3 w-full max-w-lg">
            <div className="h-4 w-32 bg-slate-200 rounded-full" />
            <div className="h-8 w-72 bg-slate-200 rounded-2xl" />
            <div className="h-3 w-96 bg-slate-100 rounded-full" />
          </div>
          <div className="w-24 h-24 rounded-full bg-slate-100 border-4 border-slate-200" />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs h-28 animate-pulse" />
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs h-96 animate-pulse" />
          <div className="lg:col-span-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs h-96 animate-pulse" />
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // ERROR STATE
  // -------------------------------------------------------------
  if (errorMessage && !roadmap) {
    return (
      <div className="max-w-xl mx-auto py-16 px-4 text-center font-sans">
        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-xs space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
            <AlertCircle className="w-7 h-7" />
          </div>
          <h2 className="text-lg font-bold text-slate-900">Something went wrong</h2>
          <p className="text-xs text-slate-500">{errorMessage}</p>
          <button
            type="button"
            onClick={() => fetchRoadmapData()}
            className="px-6 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20 transition-all cursor-pointer inline-flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Try Again</span>
          </button>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // EMPTY STATE (NO ROADMAP CONFIGURED)
  // -------------------------------------------------------------
  if (!roadmap) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-6 font-sans">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-3xl bg-indigo-50 border border-indigo-200 text-indigo-600 flex items-center justify-center mx-auto mb-4 shadow-sm">
            <Map className="w-8 h-8" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 font-heading">
            Build Your Personalized Career Roadmap
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto mt-2 leading-relaxed">
            Select your engineering department and target role to generate a step-by-step path with verified learning resources and practical projects.
          </p>
        </div>

        <form onSubmit={handleCreateRoadmapSubmit} className="bg-white rounded-3xl p-8 border border-slate-200 shadow-xs max-w-xl mx-auto space-y-5">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">1. Select Department</label>
            <select
              value={newRoadmapDept}
              onChange={(e) => {
                setNewRoadmapDept(e.target.value);
                const fields = DEPARTMENT_FIELDS[e.target.value] || [];
                setNewRoadmapField(fields[0] || "");
              }}
              className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none focus:border-indigo-500 cursor-pointer"
            >
              {Object.keys(DEPARTMENT_FIELDS).map((dept) => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">2. Choose Target Career</label>
            <select
              value={newRoadmapField}
              onChange={(e) => setNewRoadmapField(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none focus:border-indigo-500 cursor-pointer"
            >
              {(DEPARTMENT_FIELDS[newRoadmapDept] || []).map((f) => (
                <option key={f} value={f}>{f}</option>
              ))}
            </select>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row gap-3">
            <Link
              to="/assessment"
              className="flex-1 py-3.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-all text-center flex items-center justify-center gap-1.5"
            >
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <span>Take Career Test</span>
            </Link>

            <button
              type="submit"
              disabled={generating || !newRoadmapField}
              className="flex-1 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/25 transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {generating ? (
                <>
                  <span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span>
                  <span>Generating Roadmap...</span>
                </>
              ) : (
                <>
                  <span>Create Roadmap</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    );
  }

  // Dynamic Calculated Quantities for Active Roadmap
  const activeTargetRole = roadmap.targetCareer || roadmap.field;
  const stagesList = roadmap.stages || [];
  const remainingSkillsCount = Math.max(0, (roadmap.totalSkillsCount || 0) - (roadmap.completedSkillsCount || 0));

  // Extract Flat Skills List
  const allRoadmapSkills: { skill: SkillItem; stageNum: number; stageTitle: string }[] = [];
  stagesList.forEach((st) => {
    (st.skills || []).forEach((sk) => {
      allRoadmapSkills.push({ skill: sk, stageNum: st.stageNumber, stageTitle: st.title });
    });
  });

  const filteredSkills = allRoadmapSkills.filter(({ skill }) => {
    if (skillSearch.trim()) {
      if (!skill.name.toLowerCase().includes(skillSearch.toLowerCase())) return false;
    }
    if (skillFilter === "completed") return skill.completed || skill.status === "Completed";
    if (skillFilter === "high") return (skill.required || 75) >= 80 && !skill.completed;
    if (skillFilter === "medium") return (skill.required || 75) < 80 && !skill.completed;
    return true;
  });

  // Extract Flat Projects List
  const allRoadmapProjects: { project: ProjectItem; stageNum: number; stageTitle: string; stageIdx: number; projIdx: number }[] = [];
  stagesList.forEach((st, sIdx) => {
    (st.projects || []).forEach((p, pIdx) => {
      allRoadmapProjects.push({ project: p, stageNum: st.stageNumber, stageTitle: st.title, stageIdx: sIdx, projIdx: pIdx });
    });
  });

  // Extract Unique Key Skills for the Right Sidebar Widget
  const keySkillsList = Array.from(new Set(allRoadmapSkills.map(s => s.skill.name))).slice(0, 10);

  // Filtered Courses for Courses Tab
  const filteredCourses = verifiedResources.filter((c) => {
    if (courseSearch.trim()) {
      const q = courseSearch.toLowerCase();
      if (!c.title?.toLowerCase().includes(q) && !c.provider?.toLowerCase().includes(q) && !c.skill?.toLowerCase().includes(q)) {
        return false;
      }
    }
    if (courseTypeFilter === "free") return c.isFree === true;
    if (courseTypeFilter === "paid") return c.isFree === false;
    if (courseTypeFilter === "doc") return c.resourceType === "Doc";
    if (courseTypeFilter === "course") return c.resourceType === "Course";
    if (courseTypeFilter === "practice") return c.resourceType === "Practice";
    return true;
  });

  // Matching Jobs for Jobs Tab
  const relevantJobs = jobs.filter((j) => {
    const titleMatch = j.title?.toLowerCase().includes(activeTargetRole.toLowerCase()) ||
      activeTargetRole.toLowerCase().includes(j.title?.toLowerCase());
    const deptMatch = j.department?.toLowerCase().includes(roadmap.department.toLowerCase());
    return titleMatch || deptMatch || j.skills?.some((sk: string) => allRoadmapSkills.some(rs => rs.skill.name.toLowerCase() === sk.toLowerCase()));
  });

  return (
    <div className="max-w-7xl mx-auto space-y-6 font-sans pb-20 select-none">
      {/* Floating Success & Error Toasts */}
      <AnimatePresence>
        {successToast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-xl border border-slate-800 flex items-center gap-3 text-xs font-bold"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{successToast}</span>
          </motion.div>
        )}
        {errorToast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-6 right-6 z-50 bg-rose-950 text-white px-5 py-3 rounded-2xl shadow-xl border border-rose-800 flex items-center gap-3 text-xs font-bold"
          >
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{errorToast}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ================================================================== */}
      {/* SUBVIEW 1: ROADMAPS LIST PAGE (Roadmap > Roadmaps)                */}
      {/* ================================================================== */}
      {isRoadmapsView && (
        <div className="space-y-6">
          {/* Breadcrumb & Header */}
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
              <Link to="/roadmap" className="hover:text-indigo-600 transition-colors">Roadmap</Link>
              <ChevronRight className="w-3.5 h-3.5" />
              <span className="text-slate-700 font-bold">Roadmaps</span>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
              <div>
                <h1 className="text-2xl sm:text-3xl font-black font-heading text-slate-900 tracking-tight">
                  My Roadmaps
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                  Manage and track all your learning paths. You can follow multiple roadmaps at the same time.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowNewRoadmapModal(true)}
                className="px-5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20 transition-all cursor-pointer inline-flex items-center gap-2 self-start sm:self-auto"
              >
                <Plus className="w-4 h-4" />
                <span>Create New Roadmap</span>
              </button>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-slate-200">
            {[
              { id: "all", label: `All (${allUserRoadmaps.length})` },
              { id: "in_progress", label: `In Progress (${allUserRoadmaps.filter(r => r.status === 'In Progress').length})` },
              { id: "not_started", label: `Not Started (${allUserRoadmaps.filter(r => r.status === 'Not Started').length})` },
              { id: "paused", label: `Paused (${allUserRoadmaps.filter(r => r.status === 'Paused').length})` },
              { id: "completed", label: `Completed (${allUserRoadmaps.filter(r => r.status === 'Completed').length})` },
              { id: "archived", label: `Archived (${allUserRoadmaps.filter(r => r.status === 'Archived').length})` }
            ].map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setRoadmapsListFilter(f.id)}
                className={`px-4 py-2 rounded-xl font-bold text-xs transition-colors cursor-pointer whitespace-nowrap ${
                  roadmapsListFilter === f.id
                    ? "bg-indigo-600 text-white"
                    : "bg-slate-100 hover:bg-slate-200 text-slate-600"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Grid of Roadmap Cards */}
          {filteredMyRoadmaps.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80 shadow-xs space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
                <Layers className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">No Roadmaps Found</h3>
              <p className="text-xs text-slate-400">No roadmaps match the selected status filter.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredMyRoadmaps.map((r) => {
                const isSelected = r._id === roadmap._id;
                const statusColor = r.status === "Completed"
                  ? "bg-emerald-100 text-emerald-800"
                  : r.status === "Paused"
                  ? "bg-amber-100 text-amber-800"
                  : r.status === "Archived"
                  ? "bg-slate-200 text-slate-600"
                  : "bg-emerald-50 text-emerald-700 border border-emerald-200";

                return (
                  <div
                    key={r._id}
                    className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-5 relative"
                  >
                    {/* Top Row: Status + Primary badge + 3-Dot Menu */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10.5px] font-bold ${statusColor}`}>
                          {r.status || "In Progress"}
                        </span>
                        {r.isPrimary && (
                          <span className="px-2.5 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-[10.5px] font-bold inline-flex items-center gap-1">
                            <Star className="w-3 h-3 fill-amber-400 text-amber-500" /> Primary
                          </span>
                        )}
                      </div>

                      <div className="relative" data-roadmap-menu="true">
                        <button
                          type="button"
                          disabled={!!actionLoading[r._id]}
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenCardMenuId(openCardMenuId === r._id ? null : r._id);
                          }}
                          className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer disabled:opacity-50"
                          title="Roadmap options"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>

                        {/* Card Dropdown Menu (Context-Aware Actions) */}
                        {openCardMenuId === r._id && (
                          <div
                            onClick={(e) => e.stopPropagation()}
                            className="absolute right-0 top-full mt-1 w-48 bg-white rounded-2xl border border-slate-200 shadow-xl z-30 py-1.5 text-xs font-semibold text-slate-700 space-y-0.5"
                          >
                            {/* 1. Set as Primary */}
                            {!r.isPrimary && r.status !== "Archived" && (
                              <button
                                type="button"
                                disabled={!!actionLoading[r._id]}
                                onClick={() => {
                                  setOpenCardMenuId(null);
                                  handleSetPrimary(r._id);
                                }}
                                className="w-full px-3.5 py-2 text-left hover:bg-slate-50 flex items-center gap-2 cursor-pointer transition-colors disabled:opacity-50"
                              >
                                <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
                                <span>{actionLoading[r._id] === "primary" ? "Setting..." : "Set as Primary"}</span>
                              </button>
                            )}

                            {/* 2. Pause Roadmap (for In Progress or Not Started) */}
                            {(r.status === "In Progress" || r.status === "Not Started" || !r.status) && (
                              <button
                                type="button"
                                disabled={!!actionLoading[r._id]}
                                onClick={() => {
                                  setOpenCardMenuId(null);
                                  handleUpdateStatus(r._id, "Paused");
                                }}
                                className="w-full px-3.5 py-2 text-left hover:bg-slate-50 flex items-center gap-2 cursor-pointer transition-colors disabled:opacity-50"
                              >
                                <Pause className="w-3.5 h-3.5 text-slate-500" />
                                <span>{actionLoading[r._id] === "paused" ? "Pausing..." : "Pause Roadmap"}</span>
                              </button>
                            )}

                            {/* 2b. Resume Roadmap (for Paused) */}
                            {r.status === "Paused" && (
                              <button
                                type="button"
                                disabled={!!actionLoading[r._id]}
                                onClick={() => {
                                  setOpenCardMenuId(null);
                                  handleUpdateStatus(r._id, "In Progress");
                                }}
                                className="w-full px-3.5 py-2 text-left hover:bg-slate-50 flex items-center gap-2 cursor-pointer transition-colors disabled:opacity-50"
                              >
                                <Play className="w-3.5 h-3.5 text-emerald-600" />
                                <span>{actionLoading[r._id] === "in progress" ? "Resuming..." : "Resume Roadmap"}</span>
                              </button>
                            )}

                            {/* 3. Archive / Restore */}
                            {r.status === "Archived" ? (
                              <button
                                type="button"
                                disabled={!!actionLoading[r._id]}
                                onClick={() => {
                                  setOpenCardMenuId(null);
                                  handleUpdateStatus(r._id, "In Progress");
                                }}
                                className="w-full px-3.5 py-2 text-left hover:bg-slate-50 flex items-center gap-2 cursor-pointer transition-colors disabled:opacity-50"
                              >
                                <RotateCcw className="w-3.5 h-3.5 text-indigo-600" />
                                <span>{actionLoading[r._id] === "in progress" ? "Restoring..." : "Restore Roadmap"}</span>
                              </button>
                            ) : (
                              <button
                                type="button"
                                disabled={!!actionLoading[r._id]}
                                onClick={() => {
                                  setOpenCardMenuId(null);
                                  handleUpdateStatus(r._id, "Archived");
                                }}
                                className="w-full px-3.5 py-2 text-left hover:bg-slate-50 flex items-center gap-2 cursor-pointer transition-colors disabled:opacity-50"
                              >
                                <Archive className="w-3.5 h-3.5 text-slate-500" />
                                <span>{actionLoading[r._id] === "archived" ? "Archiving..." : "Archive Roadmap"}</span>
                              </button>
                            )}

                            {/* 4. Delete with confirmation */}
                            <div className="border-t border-slate-100 my-1" />
                            <button
                              type="button"
                              disabled={!!actionLoading[r._id]}
                              onClick={() => {
                                setOpenCardMenuId(null);
                                setDeleteTarget({ id: r._id, title: r.careerTitle || r.field || "Roadmap" });
                              }}
                              className="w-full px-3.5 py-2 text-left hover:bg-rose-50 text-rose-600 flex items-center gap-2 cursor-pointer transition-colors disabled:opacity-50"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Delete</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Career Title & Progress Bar */}
                    <div className="space-y-3">
                      <div>
                        <h3 className="text-base font-bold font-heading text-slate-900 leading-snug">
                          {r.careerTitle || r.field}
                        </h3>
                        <p className="text-[11px] text-slate-400 mt-0.5">{r.department}</p>
                      </div>

                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                          <span className="text-[11px] text-slate-500 font-medium">Path Progress</span>
                          <span className="text-indigo-600 font-bold">{r.progress || r.percentComplete || 0}%</span>
                        </div>
                        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-indigo-600 rounded-full transition-all duration-500"
                            style={{ width: `${r.progress || r.percentComplete || 0}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* 4 Stats Chips */}
                    <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600 pt-1">
                      <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 font-medium">
                        {r.stagesComplete || 0} of {r.totalStages || 4} stages
                      </div>
                      <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 font-medium">
                        {r.totalSkillsCount || 12} Skills
                      </div>
                      <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 font-medium">
                        {r.totalProjectsCount || 4} Projects
                      </div>
                      <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 font-medium">
                        {r.estimatedMonths || "~4 Months"}
                      </div>
                    </div>

                    {/* CTA Button */}
                    <button
                      type="button"
                      onClick={() => handleSwitchRoadmap(r._id)}
                      className="w-full py-2.5 rounded-2xl bg-indigo-50 hover:bg-indigo-600 text-indigo-700 hover:text-white font-bold text-xs transition-all cursor-pointer text-center"
                    >
                      {r.status === "Not Started" ? "Start Roadmap" : "Continue Roadmap"}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ================================================================== */}
      {/* SUBVIEW 2: HISTORY LIST PAGE (Roadmap > History)                  */}
      {/* ================================================================== */}
      {isHistoryView && (
        <div className="space-y-6">
          {/* Breadcrumb & Header */}
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
              <Link to="/roadmap" className="hover:text-indigo-600 transition-colors">Roadmap</Link>
              <ChevronRight className="w-3.5 h-3.5" />
              <span className="text-slate-700 font-bold">History</span>
            </div>
            <div className="pt-1">
              <h1 className="text-2xl sm:text-3xl font-black font-heading text-slate-900 tracking-tight">
                Roadmap History
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                View all your past and current roadmaps. Track your learning progress over time.
              </p>
            </div>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-slate-200">
            {[
              { id: "all", label: `All (${allUserRoadmaps.length})` },
              { id: "in_progress", label: `In Progress (${allUserRoadmaps.filter(r => r.status === 'In Progress').length})` },
              { id: "completed", label: `Completed (${allUserRoadmaps.filter(r => r.status === 'Completed').length})` },
              { id: "paused", label: `Paused (${allUserRoadmaps.filter(r => r.status === 'Paused').length})` },
              { id: "archived", label: `Archived (${allUserRoadmaps.filter(r => r.status === 'Archived').length})` }
            ].map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setHistoryFilter(f.id)}
                className={`px-4 py-2 rounded-xl font-bold text-xs transition-colors cursor-pointer whitespace-nowrap ${
                  historyFilter === f.id
                    ? "bg-indigo-600 text-white"
                    : "bg-slate-100 hover:bg-slate-200 text-slate-600"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* History List Items */}
          {filteredHistoryRoadmaps.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80 shadow-xs space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
                <RotateCcw className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">No roadmap history yet</h3>
              <p className="text-xs text-slate-400">Your completed and archived roadmaps will appear here.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredHistoryRoadmaps.map((r) => {
                const statusColor = r.status === "Completed"
                  ? "bg-emerald-100 text-emerald-800"
                  : r.status === "Paused"
                  ? "bg-amber-100 text-amber-800"
                  : r.status === "Archived"
                  ? "bg-slate-200 text-slate-600"
                  : "bg-emerald-50 text-emerald-700 border border-emerald-200";

                return (
                  <div
                    key={r._id}
                    onClick={() => handleSwitchRoadmap(r._id)}
                    className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-xs hover:shadow-md hover:border-indigo-300 transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-11 h-11 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                        <Map className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-bold text-slate-900">{r.careerTitle || r.field}</h3>
                          {r.isPrimary && (
                            <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 text-[10px] font-bold border border-amber-200 inline-flex items-center gap-0.5">
                              <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-500" /> Primary
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-indigo-600 font-bold mt-0.5">{r.progress || r.percentComplete || 0}% complete</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-4 text-xs text-slate-500">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10.5px] font-bold ${statusColor}`}>
                        {r.status || "In Progress"}
                      </span>
                      <span className="font-medium text-slate-600 hidden md:inline">{r.stagesComplete || 0} of {r.totalStages || 4} stages</span>
                      <span className="text-slate-400 text-[11px] hidden lg:inline">
                        {r.lastAccessedAt ? `Last accessed: ${new Date(r.lastAccessedAt).toLocaleDateString()}` : "Active"}
                      </span>

                      {/* Three-dot menu for history item */}
                      <div className="relative" data-roadmap-menu="true" onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          disabled={!!actionLoading[r._id]}
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenCardMenuId(openCardMenuId === `hist_${r._id}` ? null : `hist_${r._id}`);
                          }}
                          className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer disabled:opacity-50"
                          title="Roadmap options"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>

                        {openCardMenuId === `hist_${r._id}` && (
                          <div
                            onClick={(e) => e.stopPropagation()}
                            className="absolute right-0 top-full mt-1 w-48 bg-white rounded-2xl border border-slate-200 shadow-xl z-30 py-1.5 text-xs font-semibold text-slate-700 space-y-0.5"
                          >
                            {!r.isPrimary && r.status !== "Archived" && (
                              <button
                                type="button"
                                disabled={!!actionLoading[r._id]}
                                onClick={() => {
                                  setOpenCardMenuId(null);
                                  handleSetPrimary(r._id);
                                }}
                                className="w-full px-3.5 py-2 text-left hover:bg-slate-50 flex items-center gap-2 cursor-pointer transition-colors disabled:opacity-50"
                              >
                                <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
                                <span>{actionLoading[r._id] === "primary" ? "Setting..." : "Set as Primary"}</span>
                              </button>
                            )}

                            {r.status === "Archived" ? (
                              <button
                                type="button"
                                disabled={!!actionLoading[r._id]}
                                onClick={() => {
                                  setOpenCardMenuId(null);
                                  handleUpdateStatus(r._id, "In Progress");
                                }}
                                className="w-full px-3.5 py-2 text-left hover:bg-slate-50 flex items-center gap-2 cursor-pointer transition-colors disabled:opacity-50"
                              >
                                <RotateCcw className="w-3.5 h-3.5 text-indigo-600" />
                                <span>{actionLoading[r._id] === "in progress" ? "Restoring..." : "Restore Roadmap"}</span>
                              </button>
                            ) : r.status === "Paused" ? (
                              <button
                                type="button"
                                disabled={!!actionLoading[r._id]}
                                onClick={() => {
                                  setOpenCardMenuId(null);
                                  handleUpdateStatus(r._id, "In Progress");
                                }}
                                className="w-full px-3.5 py-2 text-left hover:bg-slate-50 flex items-center gap-2 cursor-pointer transition-colors disabled:opacity-50"
                              >
                                <Play className="w-3.5 h-3.5 text-emerald-600" />
                                <span>{actionLoading[r._id] === "in progress" ? "Resuming..." : "Resume Roadmap"}</span>
                              </button>
                            ) : (
                              <button
                                type="button"
                                disabled={!!actionLoading[r._id]}
                                onClick={() => {
                                  setOpenCardMenuId(null);
                                  handleUpdateStatus(r._id, "Paused");
                                }}
                                className="w-full px-3.5 py-2 text-left hover:bg-slate-50 flex items-center gap-2 cursor-pointer transition-colors disabled:opacity-50"
                              >
                                <Pause className="w-3.5 h-3.5 text-slate-500" />
                                <span>{actionLoading[r._id] === "paused" ? "Pausing..." : "Pause Roadmap"}</span>
                              </button>
                            )}

                            {r.status !== "Archived" && (
                              <button
                                type="button"
                                disabled={!!actionLoading[r._id]}
                                onClick={() => {
                                  setOpenCardMenuId(null);
                                  handleUpdateStatus(r._id, "Archived");
                                }}
                                className="w-full px-3.5 py-2 text-left hover:bg-slate-50 flex items-center gap-2 cursor-pointer transition-colors disabled:opacity-50"
                              >
                                <Archive className="w-3.5 h-3.5 text-slate-500" />
                                <span>{actionLoading[r._id] === "archived" ? "Archiving..." : "Archive Roadmap"}</span>
                              </button>
                            )}

                            <div className="border-t border-slate-100 my-1" />
                            <button
                              type="button"
                              disabled={!!actionLoading[r._id]}
                              onClick={() => {
                                setOpenCardMenuId(null);
                                setDeleteTarget({ id: r._id, title: r.careerTitle || r.field || "Roadmap" });
                              }}
                              className="w-full px-3.5 py-2 text-left hover:bg-rose-50 text-rose-600 flex items-center gap-2 cursor-pointer transition-colors disabled:opacity-50"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Delete</span>
                            </button>
                          </div>
                        )}
                      </div>

                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ================================================================== */}
      {/* SUBVIEW 3: MAIN OVERVIEW PAGE (Roadmap > Overview)                 */}
      {/* ================================================================== */}
      {isOverviewView && (
        <div className="space-y-6">
          {/* 1. TOP HERO: YOUR PERSONALIZED PATH WITH VECTOR MOUNTAIN BANNER */}
          <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-xs relative z-20">
            {/* Mountain / Checkpoint Illustration Background Layer */}
            <div className="absolute inset-0 overflow-hidden rounded-3xl pointer-events-none">
              <div className="absolute top-0 right-0 w-full lg:w-[580px] h-full opacity-90 hidden md:block">
                <svg viewBox="0 0 580 200" className="w-full h-full" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="mtnGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#ede9fe" stopOpacity="0.8" />
                      <stop offset="100%" stopColor="#e0e7ff" stopOpacity="0.3" />
                    </linearGradient>
                  </defs>
                  {/* Stylized Mountain Waves */}
                  <path d="M0,180 Q140,120 280,150 T580,100 L580,200 L0,200 Z" fill="url(#mtnGrad)" />
                  <path d="M50,190 Q220,130 380,160 T580,80" fill="none" stroke="#6366f1" strokeWidth="3" strokeDasharray="6 6" />
                  
                  {/* Milestone Node 1: Learn */}
                  <circle cx="340" cy="155" r="5" fill="#6366f1" />
                  
                  {/* Milestone Node 2: Practice */}
                  <circle cx="440" cy="130" r="5" fill="#6366f1" />

                  {/* Milestone Node 3: Apply */}
                  <circle cx="510" cy="105" r="5" fill="#6366f1" />
                </svg>

                {/* Floating Checkpoint Labels */}
                <div className="absolute top-14 right-56 bg-white/90 backdrop-blur-xs px-2.5 py-1 rounded-xl shadow-xs border border-indigo-100 text-[10.5px] font-bold text-indigo-950 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span>Learn (Build core skills)</span>
                </div>
                <div className="absolute top-8 right-32 bg-white/90 backdrop-blur-xs px-2.5 py-1 rounded-xl shadow-xs border border-indigo-100 text-[10.5px] font-bold text-indigo-950 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-indigo-500" />
                  <span>Practice (Work on projects)</span>
                </div>
                <div className="absolute top-2 right-12 bg-white/90 backdrop-blur-xs px-2.5 py-1 rounded-xl shadow-xs border border-indigo-100 text-[10.5px] font-bold text-indigo-950 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-indigo-600" />
                  <span>Apply (Find jobs)</span>
                </div>
                <div className="absolute top-2 right-1 bg-indigo-600 px-3 py-1.5 rounded-2xl shadow-md text-[10.5px] font-black text-white flex items-center gap-1">
                  <Flag className="w-3.5 h-3.5 text-amber-300" />
                  <span>Get Hired</span>
                </div>
              </div>
            </div>

            {/* Left Content Area */}
            <div className="relative z-10 max-w-2xl space-y-3">
              <div className="flex items-center gap-2">
                <div className="inline-flex items-center gap-1.5 text-[10.5px] font-black uppercase tracking-widest text-indigo-700 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">
                  <Sparkles className="w-3 h-3 text-indigo-600" />
                  <span>YOUR PERSONALIZED PATH</span>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-0.5">
                <div className="w-7 h-7 rounded-full bg-indigo-600 text-white font-black text-xs flex items-center justify-center shrink-0">
                  1
                </div>
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 font-heading tracking-tight">
                  {activeTargetRole} Roadmap
                </h1>
              </div>

              <p className="text-xs sm:text-sm text-slate-500 leading-relaxed max-w-xl">
                A step-by-step learning path tailored to your profile, skills and career goals.
              </p>

              {/* Department & Role Pills + Active Roadmap Switcher */}
              <div className="flex flex-wrap items-center gap-2 pt-2">
                <span className="px-3 py-1 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold border border-slate-200">
                  {roadmap.department}
                </span>
                <span className="px-3 py-1 rounded-xl bg-indigo-50 text-indigo-700 text-xs font-bold border border-indigo-100">
                  {activeTargetRole}
                </span>

                {/* Active Roadmap Dropdown Switcher Button */}
                <div className="relative" ref={switcherRef}>
                  <button
                    type="button"
                    onClick={() => setIsSwitcherOpen(!isSwitcherOpen)}
                    className="px-3.5 py-1 rounded-xl bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-xs"
                  >
                    {roadmap.isPrimary && <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />}
                    <span>{activeTargetRole}</span>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  </button>

                  {/* Switcher Dropdown Menu */}
                  <AnimatePresence>
                    {isSwitcherOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 4 }}
                        className="absolute left-0 top-full mt-2 w-80 bg-white rounded-3xl border border-slate-200 shadow-2xl z-50 p-4 space-y-3"
                      >
                        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                          <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">Active Roadmaps</span>
                          <span className="text-[10.5px] font-bold text-indigo-600">{allUserRoadmaps.length} Total</span>
                        </div>

                        <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
                          {allUserRoadmaps.map((r) => {
                            const isCurrent = r._id === roadmap._id;
                            return (
                              <div
                                key={r._id}
                                onClick={() => handleSwitchRoadmap(r._id)}
                                className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                                  isCurrent ? "bg-indigo-50 border-indigo-300" : "bg-slate-50 hover:bg-slate-100 border-slate-200/80"
                                }`}
                              >
                                <div>
                                  <div className="flex items-center gap-1.5">
                                    {r.isPrimary && <Star className="w-3 h-3 text-amber-500 fill-amber-400 shrink-0" />}
                                    <h4 className="text-xs font-bold text-slate-900">{r.careerTitle || r.field}</h4>
                                  </div>
                                  <p className="text-[10.5px] text-slate-400 mt-0.5">{r.progress || r.percentComplete || 0}% • {r.status || "In Progress"}</p>
                                </div>
                                <span className="text-[10px] font-bold text-indigo-600">v{r.version || 1}</span>
                              </div>
                            );
                          })}
                        </div>

                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setIsSwitcherOpen(false);
                              setShowNewRoadmapModal(true);
                            }}
                            className="flex-1 py-2 px-3 rounded-xl bg-indigo-600 text-white font-bold text-xs hover:bg-indigo-700 transition-colors cursor-pointer text-center"
                          >
                            + Create New
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setIsSwitcherOpen(false);
                              navigate("/roadmap/history");
                            }}
                            className="py-2 px-3 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs hover:bg-slate-200 transition-colors cursor-pointer text-center"
                          >
                            View History
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Active Roadmap Context Action Menu */}
                <div className="relative" data-roadmap-menu="true">
                  <button
                    type="button"
                    disabled={!!actionLoading[roadmap._id]}
                    onClick={(e) => {
                      e.stopPropagation();
                      setOpenCardMenuId(openCardMenuId === `hero_${roadmap._id}` ? null : `hero_${roadmap._id}`);
                    }}
                    className="p-1.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-300 text-slate-600 hover:text-slate-900 transition-colors cursor-pointer disabled:opacity-50 flex items-center justify-center shadow-xs"
                    title="Active Roadmap actions"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </button>

                  {openCardMenuId === `hero_${roadmap._id}` && (
                    <div
                      onClick={(e) => e.stopPropagation()}
                      className="absolute left-0 sm:right-0 sm:left-auto top-full mt-1 w-48 bg-white rounded-2xl border border-slate-200 shadow-xl z-50 py-1.5 text-xs font-semibold text-slate-700 space-y-0.5"
                    >
                      {/* 1. Set as Primary */}
                      {!roadmap.isPrimary && roadmap.status !== "Archived" && (
                        <button
                          type="button"
                          disabled={!!actionLoading[roadmap._id]}
                          onClick={() => {
                            setOpenCardMenuId(null);
                            handleSetPrimary(roadmap._id);
                          }}
                          className="w-full px-3.5 py-2 text-left hover:bg-slate-50 flex items-center gap-2 cursor-pointer transition-colors disabled:opacity-50"
                        >
                          <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
                          <span>{actionLoading[roadmap._id] === "primary" ? "Setting..." : "Set as Primary"}</span>
                        </button>
                      )}

                      {/* 2. Pause / Resume Roadmap */}
                      {(roadmap.status === "In Progress" || roadmap.status === "Not Started" || !roadmap.status) && (
                        <button
                          type="button"
                          disabled={!!actionLoading[roadmap._id]}
                          onClick={() => {
                            setOpenCardMenuId(null);
                            handleUpdateStatus(roadmap._id, "Paused");
                          }}
                          className="w-full px-3.5 py-2 text-left hover:bg-slate-50 flex items-center gap-2 cursor-pointer transition-colors disabled:opacity-50"
                        >
                          <Pause className="w-3.5 h-3.5 text-slate-500" />
                          <span>{actionLoading[roadmap._id] === "paused" ? "Pausing..." : "Pause Roadmap"}</span>
                        </button>
                      )}

                      {roadmap.status === "Paused" && (
                        <button
                          type="button"
                          disabled={!!actionLoading[roadmap._id]}
                          onClick={() => {
                            setOpenCardMenuId(null);
                            handleUpdateStatus(roadmap._id, "In Progress");
                          }}
                          className="w-full px-3.5 py-2 text-left hover:bg-slate-50 flex items-center gap-2 cursor-pointer transition-colors disabled:opacity-50"
                        >
                          <Play className="w-3.5 h-3.5 text-emerald-600" />
                          <span>{actionLoading[roadmap._id] === "in progress" ? "Resuming..." : "Resume Roadmap"}</span>
                        </button>
                      )}

                      {/* 3. Archive Roadmap */}
                      {roadmap.status === "Archived" ? (
                        <button
                          type="button"
                          disabled={!!actionLoading[roadmap._id]}
                          onClick={() => {
                            setOpenCardMenuId(null);
                            handleUpdateStatus(roadmap._id, "In Progress");
                          }}
                          className="w-full px-3.5 py-2 text-left hover:bg-slate-50 flex items-center gap-2 cursor-pointer transition-colors disabled:opacity-50"
                        >
                          <RotateCcw className="w-3.5 h-3.5 text-indigo-600" />
                          <span>{actionLoading[roadmap._id] === "in progress" ? "Restoring..." : "Restore Roadmap"}</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          disabled={!!actionLoading[roadmap._id]}
                          onClick={() => {
                            setOpenCardMenuId(null);
                            handleUpdateStatus(roadmap._id, "Archived");
                          }}
                          className="w-full px-3.5 py-2 text-left hover:bg-slate-50 flex items-center gap-2 cursor-pointer transition-colors disabled:opacity-50"
                        >
                          <Archive className="w-3.5 h-3.5 text-slate-500" />
                          <span>{actionLoading[roadmap._id] === "archived" ? "Archiving..." : "Archive Roadmap"}</span>
                        </button>
                      )}

                      {/* 4. Delete with confirmation */}
                      <div className="border-t border-slate-100 my-1" />
                      <button
                        type="button"
                        disabled={!!actionLoading[roadmap._id]}
                        onClick={() => {
                          setOpenCardMenuId(null);
                          setDeleteTarget({ id: roadmap._id, title: roadmap.careerTitle || roadmap.field || "Roadmap" });
                        }}
                        className="w-full px-3.5 py-2 text-left hover:bg-rose-50 text-rose-600 flex items-center gap-2 cursor-pointer transition-colors disabled:opacity-50"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* 2. FIVE SUMMARY METRIC CARDS (Exact Match to Reference UI!) */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {/* Card 1: Overall Progress */}
            <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-xs flex items-center gap-3.5">
              <CircularProgress
                value={roadmap.percentComplete || 0}
                size="sm"
                variant="primary"
              />
              <div>
                <h4 className="text-xs font-bold text-slate-900">Overall Progress</h4>
                <p className="text-[10.5px] text-slate-400 mt-0.5">{roadmap.stagesComplete || 0} of {stagesList.length} stages completed</p>
              </div>
            </div>

            {/* Card 2: Skills to Learn */}
            <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-xs flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900 leading-none">{remainingSkillsCount || roadmap.totalSkillsCount || 12}</h3>
                <p className="text-xs font-bold text-slate-500 mt-1">Skills to Learn</p>
              </div>
            </div>

            {/* Card 3: Learning Resources */}
            <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-xs flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900 leading-none">{roadmap.totalResourcesCount || 24}</h3>
                <p className="text-xs font-bold text-slate-500 mt-1">Learning Resources</p>
              </div>
            </div>

            {/* Card 4: Projects */}
            <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-xs flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                <FolderGit2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900 leading-none">{roadmap.totalProjectsCount || 6}</h3>
                <p className="text-xs font-bold text-slate-500 mt-1">Projects</p>
              </div>
            </div>

            {/* Card 5: Estimated Time */}
            <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-xs flex items-center gap-3.5 col-span-2 sm:col-span-1">
              <div className="w-11 h-11 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900 leading-none">{roadmap.estimatedMonths || "~4 Months"}</h3>
                <p className="text-xs font-bold text-slate-500 mt-1">Estimated Time</p>
              </div>
            </div>
          </div>

          {/* 3. INTERNAL ROADMAP NAVIGATION TABS */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              {[
                { id: "stages", label: "Roadmap Stages" },
                { id: "skills", label: "Skills Overview" },
                { id: "projects", label: "Projects" },
                { id: "courses", label: "Recommended Courses" },
                { id: "jobs", label: "Job Opportunities" }
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setOverviewTab(tab.id as OverviewTab)}
                  className={`px-4 py-2 rounded-2xl font-bold text-xs transition-all whitespace-nowrap cursor-pointer ${
                    overviewTab === tab.id
                      ? "bg-indigo-600 text-white shadow-sm shadow-indigo-600/25"
                      : "bg-white hover:bg-slate-100 text-slate-600 border border-slate-200/80"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto">
              <button
                type="button"
                onClick={() => setViewMode(viewMode === "stages" ? "timeline" : "stages")}
                className="px-3.5 py-2 rounded-2xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <Clock className="w-3.5 h-3.5 text-slate-500" />
                <span>{viewMode === "stages" ? "View as Timeline" : "View as Stages"}</span>
              </button>

              <button
                type="button"
                onClick={() => setShowAdjustModal(true)}
                className="px-3.5 py-2 rounded-2xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500" />
                <span>Adjust Path</span>
              </button>
            </div>
          </div>

          {/* 4. SPLIT 2-COLUMN MAIN WORKSPACE */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* LEFT COLUMN: Stage Accordions / Tab Content (8 Cols) */}
            <div className="lg:col-span-8 space-y-4">
              {overviewTab === "stages" && (
                <div className="space-y-4">
                  {stagesList.map((stage, stageIdx) => {
                    const isExpanded = !!expandedStages[stageIdx];
                    const isCompleted = stage.status === "Completed";
                    const isInProgress = stage.status === "In Progress";
                    const completedSkillsCount = stage.skills.filter(s => s.completed).length;

                    return (
                      <div
                        key={stageIdx}
                        className={`bg-white rounded-3xl border transition-all overflow-hidden ${
                          isInProgress
                            ? "border-indigo-400 shadow-md ring-1 ring-indigo-300/30"
                            : isCompleted
                            ? "border-emerald-200"
                            : "border-slate-200/90"
                        }`}
                      >
                        {/* Stage Card Header */}
                        <div
                          onClick={() => toggleExpand(stageIdx)}
                          className="p-5 sm:p-6 flex items-start justify-between gap-4 cursor-pointer select-none bg-gradient-to-r from-transparent to-slate-50/40"
                        >
                          <div className="flex items-start gap-3.5 min-w-0">
                            <div
                              className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 ${
                                isCompleted
                                  ? "bg-emerald-500 text-white"
                                  : isInProgress
                                  ? "bg-indigo-600 text-white"
                                  : "bg-slate-100 text-slate-500"
                              }`}
                            >
                              {isCompleted ? <Check className="w-4 h-4" /> : stage.stageNumber}
                            </div>

                            <div className="space-y-1 min-w-0">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="text-xs font-bold text-slate-500">Stage {stage.stageNumber}</span>
                                <span
                                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                                    isCompleted
                                      ? "bg-emerald-100 text-emerald-800"
                                      : isInProgress
                                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold"
                                      : "bg-slate-100 text-slate-600"
                                  }`}
                                >
                                  {stage.status}
                                </span>
                              </div>

                              <h3 className="text-base font-bold font-heading text-slate-900 truncate">
                                {stage.title.includes(":") ? stage.title.split(":").slice(1).join(":").trim() : stage.title}
                              </h3>

                              <p className="text-xs text-slate-500 leading-relaxed max-w-xl">
                                {stage.description}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-4 shrink-0">
                            <div className="hidden sm:flex flex-col items-end gap-1">
                              <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
                                <Clock className="w-3.5 h-3.5" />
                                <span>{stage.weeks} Weeks</span>
                              </div>
                              <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-emerald-500 rounded-full"
                                  style={{ width: `${stage.progressPercent || (isCompleted ? 100 : 0)}%` }}
                                />
                              </div>
                              <span className="text-[10px] font-bold text-slate-500">{stage.progressPercent || 0}%</span>
                            </div>

                            <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`} />
                          </div>
                        </div>

                        {/* Stage Expanded Body */}
                        {isExpanded && (
                          <div className="px-5 sm:px-6 pb-6 pt-3 border-t border-slate-100 space-y-6">
                            
                            {/* Two-Column Internal Layout: Skills to Acquire + Learning Resources */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              
                              {/* Left Sub-Column: Skills to Acquire */}
                              <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                  <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                                    <Award className="w-3.5 h-3.5 text-indigo-600" />
                                    <span>Skills to Acquire ({completedSkillsCount}/{stage.skills.length})</span>
                                  </h4>
                                  <button
                                    type="button"
                                    onClick={() => setOverviewTab("skills")}
                                    className="text-[11px] font-bold text-indigo-600 hover:underline cursor-pointer"
                                  >
                                    View All
                                  </button>
                                </div>

                                <div className="space-y-2">
                                  {stage.skills.map((skill, skIdx) => (
                                    <div
                                      key={skIdx}
                                      onClick={() => handleUpdateSkill(stageIdx, skill.name, skill.completed ? "Not Started" : "Completed")}
                                      className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-2.5 ${
                                        skill.completed
                                          ? "bg-emerald-50/60 border-emerald-200 text-emerald-950 font-bold"
                                          : "bg-slate-50/80 hover:bg-slate-100 border-slate-200/80 text-slate-700"
                                      }`}
                                    >
                                      <div className="flex items-center gap-2.5 min-w-0">
                                        <div
                                          className={`w-4 h-4 rounded-md border flex items-center justify-center transition-colors ${
                                            skill.completed
                                              ? "bg-emerald-500 border-emerald-600 text-white"
                                              : "border-slate-300 bg-white"
                                          }`}
                                        >
                                          {skill.completed && <Check className="w-3 h-3" />}
                                        </div>
                                        <span className="text-xs truncate">{skill.name}</span>
                                      </div>

                                      <span className="text-[10px] font-semibold text-slate-400">
                                        {skill.status || (skill.completed ? "Completed" : "Not Started")}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              {/* Right Sub-Column: Learning Resources */}
                              <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                  <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                                    <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
                                    <span>Learning Resources</span>
                                  </h4>
                                  <button
                                    type="button"
                                    onClick={() => setOverviewTab("courses")}
                                    className="text-[11px] font-bold text-indigo-600 hover:underline cursor-pointer"
                                  >
                                    View All
                                  </button>
                                </div>

                                <div className="space-y-2">
                                  {stage.resources.map((res, rIdx) => (
                                    <div
                                      key={rIdx}
                                      className="p-3 rounded-2xl bg-slate-50/80 border border-slate-200/80 flex items-center justify-between gap-3"
                                    >
                                      <div className="flex items-center gap-2.5 min-w-0">
                                        <button
                                          type="button"
                                          onClick={() => handleToggleResource(stageIdx, res.url, res.completed)}
                                          className={`w-4 h-4 rounded-md border flex items-center justify-center cursor-pointer shrink-0 ${
                                            res.completed ? "bg-emerald-500 border-emerald-600 text-white" : "border-slate-300 bg-white"
                                          }`}
                                        >
                                          {res.completed && <Check className="w-3 h-3" />}
                                        </button>

                                        <div className="min-w-0">
                                          <a
                                            href={res.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-xs font-bold text-slate-900 hover:text-indigo-600 transition-colors flex items-center gap-1 truncate"
                                          >
                                            <span>{res.name}</span>
                                            <ExternalLink className="w-3 h-3 text-slate-400 shrink-0" />
                                          </a>
                                          <span className="text-[10px] text-slate-400">{res.provider}</span>
                                        </div>
                                      </div>

                                      <span className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 text-[9.5px] font-bold shrink-0">
                                        {res.type}
                                      </span>
                                    </div>
                                  ))}

                                  <button
                                    type="button"
                                    onClick={() => setShowAddResourceModal(stageIdx)}
                                    className="w-full py-2 rounded-xl bg-white hover:bg-slate-50 border border-dashed border-slate-300 text-indigo-600 font-bold text-[11px] transition-colors cursor-pointer flex items-center justify-center gap-1"
                                  >
                                    <Plus className="w-3.5 h-3.5" />
                                    <span>Add Custom Resource</span>
                                  </button>
                                </div>
                              </div>
                            </div>

                            {/* AI Tip Footer */}
                            {stage.aiTip && (
                              <div className="p-3.5 rounded-2xl bg-indigo-50/80 border border-indigo-100 flex items-start gap-2.5">
                                <Lightbulb className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                                <p className="text-xs text-indigo-950 font-medium leading-relaxed">
                                  {stage.aiTip}
                                </p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* OVERVIEW TAB 2: SKILLS MATRIX */}
              {overviewTab === "skills" && (
                <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <h3 className="text-sm font-bold font-heading text-slate-900">Skills Overview</h3>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        placeholder="Search skills..."
                        value={skillSearch}
                        onChange={(e) => setSkillSearch(e.target.value)}
                        className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:outline-none focus:border-indigo-500 w-40"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {filteredSkills.map(({ skill, stageNum }, idx) => (
                      <div
                        key={idx}
                        className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between ${
                          skill.completed ? "bg-emerald-50/60 border-emerald-200" : "bg-slate-50 border-slate-200/80"
                        }`}
                      >
                        <div>
                          <span className="text-[10px] font-bold text-slate-400">Stage {stageNum}</span>
                          <h4 className="text-xs font-bold text-slate-900 mt-0.5">{skill.name}</h4>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleUpdateSkill(stageNum - 1, skill.name, skill.completed ? "Not Started" : "Completed")}
                          className="text-[11px] font-bold text-indigo-600 hover:underline cursor-pointer"
                        >
                          {skill.completed ? "Mastered ✓" : "Mark Mastered"}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* OVERVIEW TAB 3: PROJECTS */}
              {overviewTab === "projects" && (
                <div className="space-y-4">
                  {allRoadmapProjects.map(({ project, stageNum, stageIdx, projIdx }, idx) => (
                    <div key={idx} className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="px-2.5 py-0.5 rounded-md bg-indigo-50 text-indigo-700 text-[10px] font-bold">
                          Stage {stageNum} Project
                        </span>
                        <span className="text-[10px] font-bold text-slate-400">{project.duration}</span>
                      </div>
                      <h4 className="text-sm font-bold text-slate-900">{project.title}</h4>
                      <p className="text-xs text-slate-500 leading-relaxed">{project.description}</p>
                      <div className="pt-2 flex justify-end">
                        <button
                          type="button"
                          onClick={() => {
                            setShowProjectModal({ stageIdx, projIdx });
                            setProjGithubUrl(project.githubUrl || "");
                            setProjLiveUrl(project.liveDemoUrl || "");
                            setProjNotes(project.notes || "");
                            setProjStatus(project.status || "In Progress");
                          }}
                          className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-sm transition-all cursor-pointer"
                        >
                          {project.status === "Completed" ? "Update Project Solution" : "Submit Solution"}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* OVERVIEW TAB 4: COURSES */}
              {overviewTab === "courses" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {filteredCourses.map((c, idx) => (
                    <div key={idx} className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-xs space-y-3 flex flex-col justify-between">
                      <div>
                        <span className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 text-[10px] font-bold">{c.resourceType || "Course"}</span>
                        <h4 className="text-xs font-bold text-slate-900 mt-2">{c.title}</h4>
                        <p className="text-[11px] text-slate-400 mt-1">{c.provider}</p>
                      </div>
                      <a
                        href={c.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3.5 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-600 hover:text-white text-indigo-700 font-bold text-xs transition-colors flex items-center justify-center gap-1.5"
                      >
                        <span>Open Course</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  ))}
                </div>
              )}

              {/* OVERVIEW TAB 5: JOBS */}
              {overviewTab === "jobs" && (
                <div className="space-y-3">
                  {relevantJobs.length === 0 ? (
                    <div className="bg-white p-8 rounded-3xl border border-slate-200 text-center text-xs text-slate-400">
                      No active postings currently match this role. Check the Jobs portal for latest updates.
                    </div>
                  ) : (
                    relevantJobs.slice(0, 5).map((job, idx) => (
                      <div key={idx} className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-xs flex items-center justify-between">
                        <div>
                          <h4 className="text-xs font-bold text-slate-900">{job.title}</h4>
                          <p className="text-[11px] text-slate-400 mt-0.5">{job.companyName} • {job.location || "Hybrid"}</p>
                        </div>
                        <Link
                          to="/jobs"
                          className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition-colors"
                        >
                          Apply
                        </Link>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* RIGHT COLUMN: 3 Clean Sidebar Widgets (4 Cols) */}
            <div className="lg:col-span-4 space-y-4">
              
              {/* Widget 1: Career Goal */}
              <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                      <Target className="w-4 h-4" />
                    </div>
                    <h4 className="text-xs font-bold text-slate-900">Career Goal</h4>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowEditGoalModal(true)}
                    className="text-[11px] font-bold text-indigo-600 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Edit2 className="w-3 h-3" />
                    <span>Edit</span>
                  </button>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed font-medium">
                  Become a {activeTargetRole} and work at a product-based company.
                </p>
              </div>

              {/* Widget 2: Key Skills You'll Gain */}
              <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                      <Award className="w-4 h-4" />
                    </div>
                    <h4 className="text-xs font-bold text-slate-900">Key Skills You'll Gain</h4>
                  </div>

                  <button
                    type="button"
                    onClick={() => setOverviewTab("skills")}
                    className="text-[11px] font-bold text-indigo-600 hover:underline cursor-pointer"
                  >
                    View All
                  </button>
                </div>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {keySkillsList.map((skillName, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-xl bg-slate-50 border border-slate-200/80 text-slate-700 text-[10.5px] font-semibold"
                    >
                      {skillName}
                    </span>
                  ))}
                </div>
              </div>

              {/* Widget 3: Upcoming Milestones */}
              <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                      <Flag className="w-4 h-4" />
                    </div>
                    <h4 className="text-xs font-bold text-slate-900">Upcoming Milestones</h4>
                  </div>

                  <span className="text-[11px] font-bold text-slate-400">
                    {roadmap.milestones?.length || 0} Target Goals
                  </span>
                </div>

                <div className="space-y-2.5 pt-1">
                  {(roadmap.milestones || []).slice(0, 3).map((m, idx) => (
                    <div key={idx} className="p-3 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                      <div className="flex items-center justify-between text-[10px] font-bold">
                        <span className="text-indigo-600">Stage {m.stageNumber}</span>
                        <span className="text-slate-400">{m.targetTimeframe}</span>
                      </div>
                      <h5 className="text-xs font-bold text-slate-900 leading-snug">{m.title}</h5>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* ================================================================== */}
      {/* MODALS                                                             */}
      {/* ================================================================== */}

      {/* 1. Create New Roadmap Modal */}
      {showNewRoadmapModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs" onClick={() => setShowNewRoadmapModal(false)} />
          <div className="relative bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-200 z-10 space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold font-heading text-slate-900">Create New Career Roadmap</h3>
                  <p className="text-xs text-slate-400">Follow another engineering discipline</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowNewRoadmapModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-400 hover:text-slate-600 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateRoadmapSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  1. Select Department
                </label>
                <select
                  value={newRoadmapDept}
                  onChange={(e) => {
                    setNewRoadmapDept(e.target.value);
                    const fields = DEPARTMENT_FIELDS[e.target.value] || [];
                    setNewRoadmapField(fields[0] || "");
                  }}
                  className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none focus:border-indigo-500 cursor-pointer"
                >
                  {Object.keys(DEPARTMENT_FIELDS).map((dept) => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  2. Choose Target Career
                </label>
                <select
                  value={newRoadmapField}
                  onChange={(e) => {
                    setNewRoadmapField(e.target.value);
                    setNewRoadmapCustomField("");
                  }}
                  className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none focus:border-indigo-500 cursor-pointer"
                >
                  {(DEPARTMENT_FIELDS[newRoadmapDept] || []).map((f) => (
                    <option key={f} value={f}>{f}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Or enter custom career title (optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Quantitative Risk Analyst"
                  value={newRoadmapCustomField}
                  onChange={(e) => setNewRoadmapCustomField(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewRoadmapModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={generating}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20 transition-all cursor-pointer flex items-center gap-1.5"
                >
                  {generating ? "Generating..." : "Generate Roadmap"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. Delete Roadmap Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs"
            onClick={() => !actionLoading[deleteTarget.id] && setDeleteTarget(null)}
          />
          <div className="relative bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-slate-200 z-10 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0 border border-rose-100">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold font-heading text-slate-900">Delete roadmap?</h3>
                <p className="text-xs text-slate-400">This action cannot be undone</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs text-slate-600 leading-relaxed space-y-1.5">
              <p>
                Are you sure you want to permanently delete <strong className="text-slate-900 font-bold">{deleteTarget.title}</strong>?
              </p>
              <p className="text-[11px] text-slate-400">
                This action cannot be undone.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                disabled={!!actionLoading[deleteTarget.id]}
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!!actionLoading[deleteTarget.id]}
                onClick={() => handleDeleteRoadmap(deleteTarget.id)}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md shadow-rose-600/20 transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
              >
                {actionLoading[deleteTarget.id] === "deleting" ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <span>Delete Roadmap</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. Adjust Path Modal */}
      {showAdjustModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs" onClick={() => setShowAdjustModal(false)} />
          <div className="relative bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-slate-200 z-10 space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <SlidersHorizontal className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold font-heading text-slate-900">Adjust Learning Path</h3>
                  <p className="text-xs text-slate-400">Tune your weekly pace and learning style</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAdjustModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-400 hover:text-slate-600 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveAdjustPath} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Weekly Study Hours ({adjustPace} hrs/week)
                </label>
                <input
                  type="range"
                  min="2"
                  max="40"
                  value={adjustPace}
                  onChange={(e) => setAdjustPace(Number(e.target.value))}
                  className="w-full accent-indigo-600 cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Preferred Learning Style
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {["Mixed", "Hands-on", "Video", "Reading"].map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setAdjustStyle(st as any)}
                      className={`p-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                        adjustStyle === st
                          ? "bg-indigo-50 border-indigo-500 text-indigo-700"
                          : "bg-slate-50 border-slate-200 text-slate-700"
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAdjustModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingAdjust}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20 cursor-pointer"
                >
                  {savingAdjust ? "Saving..." : "Save Preferences"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. Edit Career Goal Modal */}
      {showEditGoalModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs" onClick={() => setShowEditGoalModal(false)} />
          <div className="relative bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-slate-200 z-10 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold font-heading text-slate-900">Update Target Career Goal</h3>
              <button
                type="button"
                onClick={() => setShowEditGoalModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-400 hover:text-slate-600 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-500">
              Want to switch to a different career goal? You can create a new roadmap or select another active roadmap from the switcher.
            </p>

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowEditGoalModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowEditGoalModal(false);
                  setShowNewRoadmapModal(true);
                }}
                className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-bold text-xs"
              >
                + Create New Roadmap
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. Project Submission Modal */}
      {showProjectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs" onClick={() => setShowProjectModal(null)} />
          <div className="relative bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-200 z-10 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <Code className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold font-heading text-slate-900">Submit Project Solution</h3>
                  <p className="text-xs text-slate-400">Share your repository and live demo</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowProjectModal(null)}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-400 hover:text-slate-600 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveProject} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  GitHub Repository URL
                </label>
                <input
                  type="url"
                  placeholder="https://github.com/username/project"
                  value={projGithubUrl}
                  onChange={(e) => setProjGithubUrl(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Live Demo URL (Optional)
                </label>
                <input
                  type="url"
                  placeholder="https://my-app.vercel.app"
                  value={projLiveUrl}
                  onChange={(e) => setProjLiveUrl(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Submission Notes
                </label>
                <textarea
                  rows={3}
                  placeholder="Key features implemented, challenges overcome..."
                  value={projNotes}
                  onChange={(e) => setProjNotes(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs focus:outline-none focus:border-indigo-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Status
                </label>
                <select
                  value={projStatus}
                  onChange={(e) => setProjStatus(e.target.value as any)}
                  className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 cursor-pointer"
                >
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setShowProjectModal(null)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20 cursor-pointer"
                >
                  Save Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. Add Custom Resource Modal */}
      {showAddResourceModal !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs" onClick={() => setShowAddResourceModal(null)} />
          <div className="relative bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-slate-200 z-10 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold font-heading text-slate-900">Add Custom Resource</h3>
              <button
                type="button"
                onClick={() => setShowAddResourceModal(null)}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-400 hover:text-slate-600 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddCustomResource} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Resource Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Modern React Documentation"
                  value={newResTitle}
                  onChange={(e) => setNewResTitle(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Provider / Platform</label>
                <input
                  type="text"
                  placeholder="e.g. Official Docs, YouTube"
                  value={newResProvider}
                  onChange={(e) => setNewResProvider(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">URL</label>
                <input
                  type="url"
                  required
                  placeholder="https://..."
                  value={newResUrl}
                  onChange={(e) => setNewResUrl(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddResourceModal(null)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs cursor-pointer"
                >
                  Add Resource
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
