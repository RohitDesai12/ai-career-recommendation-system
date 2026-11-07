import React, { useState, useEffect, useMemo } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router";
import axios from "axios";
import { useAuth } from "../context/auth-context";
import {
  Search,
  MapPin,
  SlidersHorizontal,
  Bookmark,
  BookmarkCheck,
  Building2,
  Briefcase,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowRight,
  TrendingUp,
  Share2,
  ExternalLink,
  ChevronRight,
  FileText,
  GraduationCap,
  Award,
  Zap,
  BookOpen,
  Compass,
  X,
  Plus,
  Send,
  Bell,
  RefreshCw,
  ChevronDown,
  Check,
  ChevronLeft,
  DollarSign,
  Layers,
  ArrowUpRight,
  ShieldCheck,
  Trash2,
  Filter,
  Calendar,
  Target,
  Globe,
  Plane,
  AlertOctagon
} from "lucide-react";

import {
  JobItem,
  CompanyItem,
  SavedJobItem,
  TrackedApplication,
  JobAlertItem
} from "../components/jobs/types";
import { JobCard } from "../components/jobs/job-card";
import { CompanyCard } from "../components/jobs/company-card";
import { JobDetailsDrawer } from "../components/jobs/job-details-drawer";
import { ExternalApplyModal } from "../components/jobs/external-apply-modal";

export function JobsPage() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // Tab State: 'recommended' | 'explore' | 'companies' | 'saved' | 'applied' | 'alerts'
  const currentTabParam = searchParams.get("tab") || "recommended";
  // Normalize legacy tab names
  const activeTab = currentTabParam === "applications" ? "applied" : currentTabParam;

  // Geographical Navigation state (Phase 5)
  const storedGeo = (localStorage.getItem("careerCompass_geoScope") as "india" | "international" | "remote") || null;
  const initialGeo = (searchParams.get("geo") as "india" | "international" | "remote") || storedGeo || "india";
  const [geoScope, setGeoScope] = useState<"india" | "international" | "remote">(initialGeo);

  // Geo Specific Filters
  const [selectedIndianCity, setSelectedIndianCity] = useState("All");
  const [selectedCountry, setSelectedCountry] = useState("All");
  const [selectedVisaSponsorship, setSelectedVisaSponsorship] = useState("All");
  const [selectedRelocation, setSelectedRelocation] = useState("All");
  const [selectedRemoteEligibility, setSelectedRemoteEligibility] = useState("All");

  const [availableCountries, setAvailableCountries] = useState<string[]>([]);
  const [availableCities, setAvailableCities] = useState<string[]>([]);
  const [geoCounts, setGeoCounts] = useState<{ india: number; international: number; remote: number; all: number }>({
    india: 81,
    international: 1023,
    remote: 335,
    all: 1601
  });

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "");
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get("cat") || "All");
  const [selectedCompany, setSelectedCompany] = useState(searchParams.get("comp") || "All");
  const [selectedLocation, setSelectedLocation] = useState("All");
  const [selectedWorkMode, setSelectedWorkMode] = useState("All");
  const [selectedJobType, setSelectedJobType] = useState("All");
  const [selectedExperience, setSelectedExperience] = useState("All");
  const [selectedSourceType, setSelectedSourceType] = useState("All");
  const [recentlyVerifiedOnly, setRecentlyVerifiedOnly] = useState("All");
  const [freshersOnly, setFreshersOnly] = useState(false);
  const [sortOption, setSortOption] = useState("best_match");
  const [currentPage, setCurrentPage] = useState(1);

  // Company Tab Category Filter
  const [companyCategory, setCompanyCategory] = useState("All");
  const [companySearch, setCompanySearch] = useState("");

  // Application Tracker Status Filter
  const [applicationStatusFilter, setApplicationStatusFilter] = useState("All");

  // Data Collections
  const [exploreJobs, setExploreJobs] = useState<JobItem[]>([]);
  const [recommendedJobs, setRecommendedJobs] = useState<JobItem[]>([]);
  const [recommendedSections, setRecommendedSections] = useState<{
    topMatches?: JobItem[];
    recentlyDiscovered?: JobItem[];
    matchingYourSkills?: JobItem[];
    opportunitiesToGrow?: JobItem[];
    careerInterests?: JobItem[];
  }>({});
  const [companies, setCompanies] = useState<CompanyItem[]>([]);
  const [savedJobs, setSavedJobs] = useState<SavedJobItem[]>([]);
  const [applications, setApplications] = useState<TrackedApplication[]>([]);
  const [applicationStats, setApplicationStats] = useState<any>(null);
  const [jobAlerts, setJobAlerts] = useState<JobAlertItem[]>([]);

  // Metadata & Insights
  const [totalPages, setTotalPages] = useState(1);
  const [totalJobsCount, setTotalJobsCount] = useState(0);
  const [availableCategories, setAvailableCategories] = useState<string[]>([]);
  const [macroInsights, setMacroInsights] = useState<any>(null);
  const [studentProfile, setStudentProfile] = useState<any>(null);

  // Loading States
  const [loading, setLoading] = useState(true);
  const [exploreLoading, setExploreLoading] = useState(false);

  // Modals & Drawers
  const [selectedJob, setSelectedJob] = useState<JobItem | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [pendingApplyJob, setPendingApplyJob] = useState<JobItem | null>(null);
  const [isCreateAlertOpen, setIsCreateAlertOpen] = useState(false);
  const [editingFollowUpId, setEditingFollowUpId] = useState<string | null>(null);
  const [followUpDateInput, setFollowUpDateInput] = useState<string>("");

  // New Alert Form State
  const [alertForm, setAlertForm] = useState({
    title: "",
    role: "",
    company: "",
    skills: "",
    location: "Any",
    geoScope: "All" as "All" | "India" | "International" | "Remote Worldwide",
    targetCountry: "",
    targetCity: "",
    visaSponsorshipOnly: false,
    jobType: "All",
    workMode: "All",
    freshersOnly: true,
    minMatchScore: 70,
    notificationChannel: "in-app" as "in-app" | "email" | "both",
    frequency: "Daily" as "Daily" | "Weekly" | "Instant",
  });

  // Auth Header Helper
  const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  // Change Active Tab & Sync with URL
  const handleTabChange = (tab: string) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set("tab", tab);
      return next;
    });
  };

  // Change Geographical Scope & Sync with URL & LocalStorage
  const handleGeoScopeChange = (newScope: "india" | "international" | "remote") => {
    setGeoScope(newScope);
    localStorage.setItem("careerCompass_geoScope", newScope);
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set("geo", newScope);
      return next;
    });
    setSelectedIndianCity("All");
    setSelectedCountry("All");
    setSelectedVisaSponsorship("All");
    setSelectedRelocation("All");
    setSelectedRemoteEligibility("All");
  };

  // -------------------------------------------------------------
  // INITIAL DATA FETCHING
  // -------------------------------------------------------------
  useEffect(() => {
    fetchInitialData();
  }, [user]);

  const fetchInitialData = async () => {
    setLoading(true);
    const headers = getAuthHeaders();

    try {
      // 1. Fetch Recommended Jobs & Student Insights
      if (user) {
        try {
          const recRes = await axios.get(`http://localhost:5000/api/jobs/recommended?geoScope=${geoScope}`, { headers });
          setRecommendedJobs(recRes.data.recommendations || []);
          setRecommendedSections(recRes.data.sections || {});
          setMacroInsights(recRes.data.insights || null);
          setStudentProfile(recRes.data.studentProfileSummary || null);
          if (recRes.data.insights?.geoCounts) {
            setGeoCounts(recRes.data.insights.geoCounts);
          }
        } catch {
          // If recommendation fails, will fallback below
        }

        // 2. Fetch Saved Jobs
        try {
          const savedRes = await axios.get("http://localhost:5000/api/jobs/saved", { headers });
          setSavedJobs(savedRes.data.savedJobs || []);
        } catch {}

        // 3. Fetch Tracked Applications & Funnel Stats
        try {
          const [appRes, statsRes] = await Promise.all([
            axios.get("http://localhost:5000/api/jobs/applications", { headers }).catch(() => ({ data: { applications: [] } })),
            axios.get("http://localhost:5000/api/jobs/applications/stats", { headers }).catch(() => ({ data: null }))
          ]);
          setApplications(appRes.data.applications || []);
          if (statsRes.data) setApplicationStats(statsRes.data);
        } catch {}

        // 4. Fetch Job Alerts
        try {
          const alertRes = await axios.get("http://localhost:5000/api/jobs/alerts", { headers });
          setJobAlerts(alertRes.data.alerts || []);
        } catch {}
      }

      // 5. Fetch Curated Companies
      try {
        const compRes = await axios.get("http://localhost:5000/api/jobs/companies");
        setCompanies(compRes.data.companies || []);
      } catch {}

      // 6. Fetch First Page of Explore Jobs
      await fetchExploreJobs(1);

      // Fallback: If recommended is empty (e.g. guest or new user), populate with explore jobs
      setRecommendedJobs((prev) => {
        if (prev.length === 0 && exploreJobs.length > 0) {
          return exploreJobs.slice(0, 6);
        }
        return prev;
      });
    } catch (err) {
      console.error("Error loading jobs data:", err);
    } finally {
      setLoading(false);
    }
  };

  // -------------------------------------------------------------
  // RE-FETCH RECOMMENDATIONS ON GEO SCOPE CHANGE
  // -------------------------------------------------------------
  const fetchRecommendations = async () => {
    if (!user) return;
    const headers = getAuthHeaders();
    try {
      const recRes = await axios.get(`http://localhost:5000/api/jobs/recommended?geoScope=${geoScope}`, { headers });
      setRecommendedJobs(recRes.data.recommendations || []);
      setRecommendedSections(recRes.data.sections || {});
      setMacroInsights(recRes.data.insights || null);
      if (recRes.data.insights?.geoCounts) {
        setGeoCounts(recRes.data.insights.geoCounts);
      }
    } catch {}
  };

  // -------------------------------------------------------------
  // FETCH EXPLORE JOBS WITH MULTI-FILTERS
  // -------------------------------------------------------------
  const fetchExploreJobs = async (page = 1) => {
    setExploreLoading(true);
    const headers = getAuthHeaders();

    try {
      const params: any = {
        page,
        limit: 9,
        sort: sortOption,
        geoScope,
      };

      if (searchQuery.trim()) params.search = searchQuery.trim();
      if (selectedCategory !== "All") params.category = selectedCategory;
      if (selectedCompany !== "All") params.company = selectedCompany;
      if (selectedLocation !== "All") params.location = selectedLocation;
      if (selectedWorkMode !== "All") params.workMode = selectedWorkMode;
      if (selectedJobType !== "All") params.type = selectedJobType;
      if (selectedExperience !== "All") params.experience = selectedExperience;
      if (selectedSourceType !== "All") params.sourceType = selectedSourceType;
      if (recentlyVerifiedOnly !== "All") params.recentlyVerified = recentlyVerifiedOnly;
      if (freshersOnly) params.freshersEligible = true;

      // Granular geographical filters
      if (geoScope === "india" && selectedIndianCity !== "All") {
        params.city = selectedIndianCity;
      }
      if (geoScope === "international") {
        if (selectedCountry !== "All") params.country = selectedCountry;
        if (selectedVisaSponsorship !== "All") params.visaSponsorship = selectedVisaSponsorship;
        if (selectedRelocation !== "All") params.relocationAssistance = selectedRelocation;
      }
      if (geoScope === "remote" && selectedRemoteEligibility !== "All") {
        params.remoteEligibility = selectedRemoteEligibility;
      }

      const res = await axios.get("http://localhost:5000/api/jobs", {
        headers,
        params,
      });

      setExploreJobs(res.data.jobs || []);
      setTotalJobsCount(res.data.totalCount || 0);
      setTotalPages(res.data.totalPages || 1);
      setCurrentPage(res.data.currentPage || 1);
      if (res.data.categories) setAvailableCategories(res.data.categories);
      if (res.data.countries) setAvailableCountries(res.data.countries);
      if (res.data.cities) setAvailableCities(res.data.cities);
      if (res.data.geoCounts) setGeoCounts(res.data.geoCounts);
    } catch (err) {
      console.error("Error fetching explore jobs:", err);
    } finally {
      setExploreLoading(false);
    }
  };

  // Trigger Explore Jobs & Recommendations updates on filters or geoScope
  useEffect(() => {
    if (!loading) {
      fetchExploreJobs(1);
      fetchRecommendations();
    }
  }, [
    geoScope,
    selectedIndianCity,
    selectedCountry,
    selectedVisaSponsorship,
    selectedRelocation,
    selectedRemoteEligibility,
    searchQuery,
    selectedCategory,
    selectedCompany,
    selectedLocation,
    selectedWorkMode,
    selectedJobType,
    selectedExperience,
    selectedSourceType,
    recentlyVerifiedOnly,
    freshersOnly,
    sortOption,
  ]);

  // Set of Saved Job IDs for quick lookup
  const savedJobIdSet = useMemo(() => {
    return new Set(savedJobs.map((sj) => sj.job?._id));
  }, [savedJobs]);

  // -------------------------------------------------------------
  // SAVE / UNSAVE JOB HANDLER
  // -------------------------------------------------------------
  const handleToggleSave = async (job: JobItem) => {
    if (!user) {
      navigate("/login");
      return;
    }

    const isCurrentlySaved = savedJobIdSet.has(job._id);
    const headers = getAuthHeaders();

    try {
      if (isCurrentlySaved) {
        // Unsave
        await axios.delete(`http://localhost:5000/api/jobs/saved/${job._id}`, { headers });
        setSavedJobs((prev) => prev.filter((sj) => sj.job?._id !== job._id));
      } else {
        // Save
        const res = await axios.post(
          `http://localhost:5000/api/jobs/saved/${job._id}`,
          {},
          { headers }
        );
        const newEntry: SavedJobItem = {
          savedId: res.data.savedJob?._id || String(Date.now()),
          savedAt: new Date().toISOString(),
          job: job,
        };
        setSavedJobs((prev) => [newEntry, ...prev]);
      }
    } catch (err) {
      console.error("Error toggling saved job:", err);
    }
  };

  // -------------------------------------------------------------
  // EXTERNAL APPLY FLOW HANDLER
  // -------------------------------------------------------------
  const handleApplyExternal = (job: JobItem) => {
    // 1. Open official URL in new window
    const targetUrl =
      job.officialApplyUrl ||
      job.sourceUrl ||
      `https://www.google.com/search?q=${encodeURIComponent(job.companyName + " careers " + job.title)}`;
    window.open(targetUrl, "_blank", "noopener,noreferrer");

    // 2. Open confirmation prompt
    setPendingApplyJob(job);
    setIsApplyModalOpen(true);
  };

  const handleConfirmApplication = async (
    status: "Applied" | "Preparing",
    notes: string
  ) => {
    if (!pendingApplyJob || !user) {
      setIsApplyModalOpen(false);
      return;
    }

    const headers = getAuthHeaders();
    try {
      const res = await axios.post(
        "http://localhost:5000/api/jobs/applications",
        {
          jobId: pendingApplyJob._id,
          companyName: pendingApplyJob.companyName,
          role: pendingApplyJob.title,
          officialApplyUrl: pendingApplyJob.officialApplyUrl,
          status,
          notes,
          matchScore: pendingApplyJob.matchScore || 85,
        },
        { headers }
      );

      const savedApp = res.data.application;
      setApplications((prev) => {
        const filtered = prev.filter((a) => a.job?._id !== pendingApplyJob._id);
        return [{ ...savedApp, job: pendingApplyJob }, ...filtered];
      });
    } catch (err) {
      console.error("Error tracking application:", err);
    } finally {
      setIsApplyModalOpen(false);
      setPendingApplyJob(null);
    }
  };

  // -------------------------------------------------------------
  // APPLICATION TRACKER STATUS UPDATE
  // -------------------------------------------------------------
  const handleUpdateAppStatus = async (
    appId: string,
    newStatus: TrackedApplication["status"]
  ) => {
    const headers = getAuthHeaders();
    try {
      await axios.put(
        `http://localhost:5000/api/jobs/applications/${appId}`,
        { status: newStatus },
        { headers }
      );
      setApplications((prev) =>
        prev.map((app) =>
          app._id === appId
            ? { ...app, status: newStatus, lastUpdated: new Date().toISOString() }
            : app
        )
      );
    } catch (err) {
      console.error("Error updating application status:", err);
    }
  };

  const handleSaveFollowUpDate = async (appId: string) => {
    if (!followUpDateInput) return;
    const headers = getAuthHeaders();
    try {
      await axios.put(
        `http://localhost:5000/api/jobs/applications/${appId}`,
        { nextFollowUpDate: followUpDateInput, note: `Follow-up scheduled for ${followUpDateInput}` },
        { headers }
      );
      setApplications((prev) =>
        prev.map((app) =>
          app._id === appId ? { ...app, nextFollowUpDate: followUpDateInput } : app
        )
      );
      setEditingFollowUpId(null);
      setFollowUpDateInput("");
    } catch (err) {
      console.error("Error setting follow-up date:", err);
    }
  };

  const handleDeleteApplication = async (appId: string) => {
    const headers = getAuthHeaders();
    try {
      await axios.delete(`http://localhost:5000/api/jobs/applications/${appId}`, { headers });
      setApplications((prev) => prev.filter((a) => a._id !== appId));
    } catch (err) {
      console.error("Error deleting application tracking:", err);
    }
  };

  // -------------------------------------------------------------
  // JOB ALERTS HANDLERS
  // -------------------------------------------------------------
  const handleCreateAlert = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!alertForm.title.trim() || !user) return;

    const headers = getAuthHeaders();
    try {
      const res = await axios.post(
        "http://localhost:5000/api/jobs/alerts",
        alertForm,
        { headers }
      );
      setJobAlerts((prev) => [res.data.alert, ...prev]);
      setIsCreateAlertOpen(false);
      setAlertForm({
        title: "",
        role: "",
        company: "",
        skills: "",
        location: "Any",
        jobType: "All",
        workMode: "All",
        freshersOnly: true,
        minMatchScore: 70,
        notificationChannel: "in-app",
        frequency: "Daily",
      });
    } catch (err) {
      console.error("Error creating job alert:", err);
    }
  };

  const handleToggleAlert = async (alertId: string) => {
    const headers = getAuthHeaders();
    try {
      const res = await axios.patch(
        `http://localhost:5000/api/jobs/alerts/${alertId}/toggle`,
        {},
        { headers }
      );
      setJobAlerts((prev) =>
        prev.map((a) => (a._id === alertId ? res.data.alert : a))
      );
    } catch (err) {
      console.error("Error toggling alert:", err);
    }
  };

  const handleDeleteAlert = async (alertId: string) => {
    const headers = getAuthHeaders();
    try {
      await axios.delete(`http://localhost:5000/api/jobs/alerts/${alertId}`, { headers });
      setJobAlerts((prev) => prev.filter((a) => a._id !== alertId));
    } catch (err) {
      console.error("Error deleting job alert:", err);
    }
  };

  // -------------------------------------------------------------
  // OPEN JOB DETAILS
  // -------------------------------------------------------------
  const handleOpenDetails = (job: JobItem) => {
    setSelectedJob(job);
    setIsDetailsOpen(true);
  };

  // -------------------------------------------------------------
  // FILTERED LISTS
  // -------------------------------------------------------------
  const filteredCompanies = useMemo(() => {
    return companies.filter((c) => {
      const matchCat = companyCategory === "All" || c.category === companyCategory;
      const matchSearch =
        !companySearch.trim() ||
        c.companyName.toLowerCase().includes(companySearch.toLowerCase()) ||
        c.industry.toLowerCase().includes(companySearch.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [companies, companyCategory, companySearch]);

  const filteredApplications = useMemo(() => {
    if (applicationStatusFilter === "All") return applications;
    return applications.filter((app) => app.status === applicationStatusFilter);
  }, [applications, applicationStatusFilter]);

  // Pre-fill Alert form when opened from profile
  const handleOpenCreateAlertModal = () => {
    if (studentProfile) {
      setAlertForm({
        title: `${studentProfile.preferredRoles?.[0] || "Software Engineer"} Alerts`,
        role: studentProfile.preferredRoles?.[0] || "",
        company: "",
        skills: (studentProfile.skills || []).slice(0, 3).join(", "),
        location: "Any",
        jobType: "All",
        workMode: "All",
        freshersOnly: true,
        frequency: "Daily",
      });
    }
    setIsCreateAlertOpen(true);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-3 sm:px-6 py-4 font-sans text-slate-900">
      {/* ========================================================= */}
      {/* TOP HEADER: DISCOVER YOUR NEXT OPPORTUNITY */}
      {/* ========================================================= */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        {/* Background Decorative Rings */}
        <div className="absolute -right-16 -top-16 w-64 h-64 rounded-full bg-indigo-500/10 blur-2xl pointer-events-none" />
        <div className="absolute right-32 -bottom-16 w-48 h-48 rounded-full bg-sky-500/10 blur-xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold border border-indigo-500/30 mb-3">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>AI-Powered Career Intelligence</span>
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight">
            Discover Your Next Opportunity
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-slate-300 leading-relaxed max-w-2xl">
            Explore verified job opportunities from official company career portals.
            Every recommendation is calculated against your real academic degree,
            verified skills, and career preferences.
          </p>

          {/* Profile Match Completeness Indicator */}
          {user && macroInsights && (
            <div className="mt-5 pt-4 border-t border-white/10 flex flex-wrap items-center gap-4 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center font-bold text-xs text-indigo-300">
                  {macroInsights.profileCompletion || 75}%
                </div>
                <div>
                  <div className="font-bold text-white">Profile Readiness</div>
                  <div className="text-[11px] text-slate-400">
                    Optimized for Engineering & Tech
                  </div>
                </div>
              </div>

              {macroInsights.topMatchedSkills?.length > 0 && (
                <div className="hidden sm:flex items-center gap-1 text-[11.5px] text-slate-300">
                  <span className="text-slate-400">Your in-demand skills:</span>
                  <span className="font-semibold text-emerald-400">
                    {macroInsights.topMatchedSkills.slice(0, 3).join(", ")}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ========================================================= */}
      {/* GEOGRAPHICAL DISCOVERY SWITCHER (Phase 5) */}
      {/* ========================================================= */}
      <div className="bg-white rounded-3xl p-3 sm:p-4 border border-slate-200/90 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0 shadow-2xs">
            <Globe className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <span>Geographical Job Discovery</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <p className="text-[11px] text-slate-500">
              Filter verified career opportunities across domestic and global markets
            </p>
          </div>
        </div>

        {/* 3 Prominent Options */}
        <div className="grid grid-cols-3 w-full md:w-auto p-1.5 bg-slate-100/90 rounded-2xl border border-slate-200/70 gap-1.5">
          {/* Option 1: India */}
          <button
            type="button"
            onClick={() => handleGeoScopeChange("india")}
            className={`flex items-center justify-center gap-2 px-3 sm:px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              geoScope === "india"
                ? "bg-white text-indigo-700 shadow-md border border-slate-200/80 scale-[1.02]"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"
            }`}
          >
            <span className="text-base sm:text-lg">🇮🇳</span>
            <span>India</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[10.5px] font-extrabold ${
                geoScope === "india"
                  ? "bg-indigo-50 text-indigo-700 border border-indigo-200"
                  : "bg-slate-200/80 text-slate-600"
              }`}
            >
              {geoCounts.india}
            </span>
          </button>

          {/* Option 2: International */}
          <button
            type="button"
            onClick={() => handleGeoScopeChange("international")}
            className={`flex items-center justify-center gap-2 px-3 sm:px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              geoScope === "international"
                ? "bg-white text-indigo-700 shadow-md border border-slate-200/80 scale-[1.02]"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"
            }`}
          >
            <span className="text-base sm:text-lg">🌎</span>
            <span>International</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[10.5px] font-extrabold ${
                geoScope === "international"
                  ? "bg-indigo-50 text-indigo-700 border border-indigo-200"
                  : "bg-slate-200/80 text-slate-600"
              }`}
            >
              {geoCounts.international}
            </span>
          </button>

          {/* Option 3: Remote Worldwide */}
          <button
            type="button"
            onClick={() => handleGeoScopeChange("remote")}
            className={`flex items-center justify-center gap-2 px-3 sm:px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              geoScope === "remote"
                ? "bg-white text-indigo-700 shadow-md border border-slate-200/80 scale-[1.02]"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"
            }`}
          >
            <span className="text-base sm:text-lg">🌐</span>
            <span>Remote</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[10.5px] font-extrabold ${
                geoScope === "remote"
                  ? "bg-indigo-50 text-indigo-700 border border-indigo-200"
                  : "bg-slate-200/80 text-slate-600"
              }`}
            >
              {geoCounts.remote}
            </span>
          </button>
        </div>
      </div>

      {/* ========================================================= */}
      {/* NAVIGATION TABS */}
      {/* ========================================================= */}
      <div className="border-b border-slate-200 flex items-center gap-1 overflow-x-auto no-scrollbar scroll-smooth">
        {[
          { id: "recommended", label: "Recommended Jobs", icon: Sparkles },
          { id: "explore", label: "Explore Jobs", icon: Search },
          { id: "companies", label: "Company Career Pages", icon: Building2 },
          { id: "saved", label: `Saved Jobs (${savedJobs.length})`, icon: Bookmark },
          {
            id: "applied",
            label: `Applied Jobs (${applications.length})`,
            icon: CheckCircle2,
          },
          { id: "alerts", label: "Job Alerts", icon: Bell },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                isActive
                  ? "border-indigo-600 text-indigo-700 bg-indigo-50/40 rounded-t-xl"
                  : "border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300"
              }`}
            >
              <Icon
                className={`w-4 h-4 ${
                  isActive ? "text-indigo-600" : "text-slate-400"
                }`}
              />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ========================================================= */}
      {/* TAB 1: RECOMMENDED JOBS (INTELLIGENT DASHBOARD) */}
      {/* ========================================================= */}
      {activeTab === "recommended" && (
        <div className="space-y-8">
          {/* Top Macro Insights Cards */}
          {macroInsights && (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
              <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
                <div className="text-xs font-semibold text-slate-500 flex items-center justify-between">
                  <span>Opportunities</span>
                  <Briefcase className="w-4 h-4 text-slate-400" />
                </div>
                <div className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
                  {macroInsights.totalActiveOpportunities || macroInsights.totalOpportunities || 20}+
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  Verified official openings
                </div>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
                <div className="text-xs font-semibold text-slate-500 flex items-center justify-between">
                  <span>Strong Matches</span>
                  <Sparkles className="w-4 h-4 text-emerald-500" />
                </div>
                <div className="text-xl sm:text-2xl font-black text-emerald-600 mt-1">
                  {macroInsights.strongMatchesCount || 5}
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  ≥ 75% compatibility
                </div>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
                <div className="text-xs font-semibold text-slate-500 flex items-center justify-between">
                  <span>Freshers Eligible</span>
                  <GraduationCap className="w-4 h-4 text-indigo-500" />
                </div>
                <div className="text-xl sm:text-2xl font-black text-indigo-600 mt-1">
                  {macroInsights.freshersEligibleCount || 10}
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  0-1 yr entry opportunities
                </div>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
                <div className="text-xs font-semibold text-slate-500 flex items-center justify-between">
                  <span>Tracked Pipeline</span>
                  <CheckCircle2 className="w-4 h-4 text-purple-500" />
                </div>
                <div className="text-xl sm:text-2xl font-black text-purple-600 mt-1">
                  {applications.length}
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5 truncate">
                  Active job applications
                </div>
              </div>
            </div>
          )}

          {loading ? (
            <div className="py-16 flex flex-col items-center justify-center text-slate-400 gap-3">
              <RefreshCw className="w-6 h-6 animate-spin text-indigo-600" />
              <span className="text-xs font-bold text-slate-600">Computing multidimensional job recommendations...</span>
            </div>
          ) : (
            <>
              {/* Profile Completion Guidance Alert (Non-blocking) */}
              {studentProfile && (!studentProfile.skills || studentProfile.skills.length === 0) && (
                <div className="bg-amber-50 border border-amber-200/80 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
                  <div className="flex items-start sm:items-center gap-3">
                    <Sparkles className="w-5 h-5 text-amber-600 shrink-0 mt-0.5 sm:mt-0" />
                    <div>
                      <div className="text-xs font-bold text-amber-950">
                        Unlock Tailored Compatibility Scoring
                      </div>
                      <div className="text-[11px] text-amber-800 mt-0.5">
                        Your profile is missing technical skills and graduation details. We are displaying verified official opportunities below.
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => navigate("/profile")}
                    className="px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shrink-0 transition-colors cursor-pointer self-start sm:self-auto"
                  >
                    Complete Profile
                  </button>
                </div>
              )}

              {/* Section 1: Top Matches (80%+) */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200">
                        High Fit
                      </span>
                      <h2 className="text-base sm:text-lg font-bold text-slate-900">
                        Top Compatibility Matches
                      </h2>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Roles aligned with your exact degree, technical skills, and career preferences.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleTabChange("explore")}
                    className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
                  >
                    <span>View All</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                {(recommendedSections.topMatches && recommendedSections.topMatches.length > 0) || recommendedJobs.length > 0 || exploreJobs.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {((recommendedSections.topMatches && recommendedSections.topMatches.length > 0) ? recommendedSections.topMatches : (recommendedJobs.length > 0 ? recommendedJobs : exploreJobs)).slice(0, 6).map((job) => (
                      <JobCard
                        key={job._id}
                        job={job}
                        isSaved={savedJobIdSet.has(job._id)}
                        onToggleSave={handleToggleSave}
                        onOpenDetails={handleOpenDetails}
                        onApplyExternal={handleApplyExternal}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center max-w-md mx-auto space-y-3">
                    <Sparkles className="w-8 h-8 text-indigo-500 mx-auto" />
                    <h3 className="text-sm font-bold text-slate-900">Complete Your Student Profile</h3>
                    <p className="text-xs text-slate-500">
                      Add your branch, graduation year, and technical skills to your profile to unlock automated AI job matching.
                    </p>
                    <button
                      onClick={() => navigate("/profile")}
                      className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold"
                    >
                      Update Profile
                    </button>
                  </div>
                )}
              </div>

              {/* Section 2: Recently Discovered Live Roles */}
              {recommendedSections.recentlyDiscovered && recommendedSections.recentlyDiscovered.length > 0 && (
                <div className="space-y-4 pt-6 border-t border-slate-200/80">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-md bg-sky-50 text-sky-700 text-[10px] font-bold border border-sky-200">
                          Fresh Ingestion
                        </span>
                        <h2 className="text-base sm:text-lg font-bold text-slate-900">
                          Recently Discovered Openings
                        </h2>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        New verified postings ingested directly from official company ATS portals.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {recommendedSections.recentlyDiscovered.slice(0, 3).map((job) => (
                      <JobCard
                        key={job._id}
                        job={job}
                        isSaved={savedJobIdSet.has(job._id)}
                        onToggleSave={handleToggleSave}
                        onOpenDetails={handleOpenDetails}
                        onApplyExternal={handleApplyExternal}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Section 3: Matching Your Core Technical Skills */}
              {recommendedSections.matchingYourSkills && recommendedSections.matchingYourSkills.length > 0 && (
                <div className="space-y-4 pt-6 border-t border-slate-200/80">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 text-[10px] font-bold border border-indigo-200">
                          Direct Skill Overlap
                        </span>
                        <h2 className="text-base sm:text-lg font-bold text-slate-900">
                          Matching Your Technical Skills
                        </h2>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Opportunities where your verified technical skills fulfill core requirements.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {recommendedSections.matchingYourSkills.slice(0, 3).map((job) => (
                      <JobCard
                        key={job._id}
                        job={job}
                        isSaved={savedJobIdSet.has(job._id)}
                        onToggleSave={handleToggleSave}
                        onOpenDetails={handleOpenDetails}
                        onApplyExternal={handleApplyExternal}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Section 4: Opportunities to Grow (Missing Skills Bridge) */}
              {recommendedSections.opportunitiesToGrow && recommendedSections.opportunitiesToGrow.length > 0 && (
                <div className="space-y-4 pt-6 border-t border-slate-200/80">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 text-[10px] font-bold border border-amber-200">
                          Career Growth
                        </span>
                        <h2 className="text-base sm:text-lg font-bold text-slate-900">
                          Opportunities to Grow
                        </h2>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Promising roles where learning 1-2 complementary skills qualifies you for direct application.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {recommendedSections.opportunitiesToGrow.slice(0, 3).map((job) => (
                      <JobCard
                        key={job._id}
                        job={job}
                        isSaved={savedJobIdSet.has(job._id)}
                        onToggleSave={handleToggleSave}
                        onOpenDetails={handleOpenDetails}
                        onApplyExternal={handleApplyExternal}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Section 5: Aligned With Your Career Interests */}
              {recommendedSections.careerInterests && recommendedSections.careerInterests.length > 0 && (
                <div className="space-y-4 pt-6 border-t border-slate-200/80">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 text-[10px] font-bold border border-purple-200">
                          Aspirational
                        </span>
                        <h2 className="text-base sm:text-lg font-bold text-slate-900">
                          Aligned With Your Career Interests
                        </h2>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Roles tailored to your desired job roles, target industries, and preferred work environment.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {recommendedSections.careerInterests.slice(0, 3).map((job) => (
                      <JobCard
                        key={job._id}
                        job={job}
                        isSaved={savedJobIdSet.has(job._id)}
                        onToggleSave={handleToggleSave}
                        onOpenDetails={handleOpenDetails}
                        onApplyExternal={handleApplyExternal}
                      />
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {/* Section: Featured Official Company Career Portals */}
          <div className="space-y-4 pt-4 border-t border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Verified Company Career Portals
                </h2>
                <p className="text-xs text-slate-500">
                  Direct official career portals of top technology and consulting employers.
                </p>
              </div>

              <button
                type="button"
                onClick={() => handleTabChange("companies")}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
              >
                <span>Browse All Companies</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {companies.slice(0, 6).map((company) => (
                <CompanyCard
                  key={company.companyName}
                  company={company}
                  onBrowseJobs={(name) => {
                    setSelectedCompany(name);
                    handleTabChange("explore");
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 2: EXPLORE JOBS (SEARCH & MULTI-FILTER DISCOVERY) */}
      {/* ========================================================= */}
      {activeTab === "explore" && (
        <div className="space-y-5">
          {/* Search & Sort Controls */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-3.5">
            <div className="flex flex-col sm:flex-row gap-3">
              {/* Keyword Search Input */}
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by job title, company name, skills, or keywords..."
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 focus:bg-white transition-all"
                />
              </div>

              {/* Sort Dropdown */}
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-xs text-slate-400 font-semibold hidden sm:inline">
                  Sort:
                </span>
                <select
                  value={sortOption}
                  onChange={(e) => setSortOption(e.target.value)}
                  className="px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:border-indigo-500"
                >
                  <option value="best_match">Best Match Score</option>
                  <option value="recent">Recently Verified</option>
                  <option value="company">Company Name (A-Z)</option>
                </select>
              </div>
            </div>

            {/* Dynamic Filter Pills / Selectors tailored to active Geographical Scope */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 text-xs">
              {/* Contextual Filter 1: Geo-specific location dropdown */}
              {geoScope === "india" ? (
                <select
                  value={selectedIndianCity}
                  onChange={(e) => setSelectedIndianCity(e.target.value)}
                  className="px-2.5 py-2 bg-indigo-50/50 border border-indigo-200/80 rounded-xl text-indigo-900 font-semibold focus:outline-none focus:border-indigo-500 truncate"
                  title="Filter by Indian City"
                >
                  <option value="All">🇮🇳 All Indian Cities</option>
                  <option value="Bengaluru">Bengaluru ({geoCounts.india > 0 ? '58' : '0'})</option>
                  <option value="Delhi / NCR">Delhi / NCR (7)</option>
                  <option value="Hyderabad">Hyderabad (5)</option>
                  <option value="Pune">Pune (4)</option>
                  <option value="Mumbai">Mumbai (3)</option>
                  <option value="India (Remote)">India (Remote) (5)</option>
                  {availableCities
                    .filter((c) => !["Bengaluru", "Delhi / NCR", "Hyderabad", "Pune", "Mumbai", "India (Remote)"].includes(c))
                    .slice(0, 10)
                    .map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                </select>
              ) : geoScope === "international" ? (
                <select
                  value={selectedCountry}
                  onChange={(e) => setSelectedCountry(e.target.value)}
                  className="px-2.5 py-2 bg-indigo-50/50 border border-indigo-200/80 rounded-xl text-indigo-900 font-semibold focus:outline-none focus:border-indigo-500 truncate"
                  title="Filter by Destination Country"
                >
                  <option value="All">🌎 All Countries</option>
                  <option value="United States">United States</option>
                  <option value="United Kingdom">United Kingdom</option>
                  <option value="Canada">Canada</option>
                  <option value="Germany">Germany</option>
                  <option value="Singapore">Singapore</option>
                  <option value="Japan">Japan</option>
                  <option value="Australia">Australia</option>
                  <option value="Ireland">Ireland</option>
                  <option value="France">France</option>
                  <option value="Netherlands">Netherlands</option>
                  <option value="United Arab Emirates">UAE / Dubai</option>
                  {availableCountries
                    .filter((c) => !["India", "United States", "United Kingdom", "Canada", "Germany", "Singapore", "Japan", "Australia", "Ireland", "France", "Netherlands", "United Arab Emirates"].includes(c))
                    .map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                </select>
              ) : (
                <select
                  value={selectedRemoteEligibility}
                  onChange={(e) => setSelectedRemoteEligibility(e.target.value)}
                  className="px-2.5 py-2 bg-indigo-50/50 border border-indigo-200/80 rounded-xl text-indigo-900 font-semibold focus:outline-none focus:border-indigo-500 truncate"
                  title="Remote Eligibility Classification"
                >
                  <option value="All">🌐 All Remote ({geoCounts.remote})</option>
                  <option value="Worldwide Eligible">Worldwide Eligible</option>
                  <option value="India Eligible">India Eligible</option>
                  <option value="Specific Countries Only">Country Specific Only</option>
                  <option value="Eligibility Unclear">Eligibility Unclear</option>
                </select>
              )}

              {/* Contextual Filter 2: Visa Sponsorship or Work Mode */}
              {geoScope === "international" ? (
                <select
                  value={selectedVisaSponsorship}
                  onChange={(e) => setSelectedVisaSponsorship(e.target.value)}
                  className="px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-medium focus:outline-none focus:border-indigo-500"
                  title="Filter by Visa Sponsorship"
                >
                  <option value="All">All Visa Support</option>
                  <option value="Available">Visa Sponsored</option>
                  <option value="Not Available">No Sponsorship</option>
                  <option value="Unspecified">Unconfirmed</option>
                </select>
              ) : (
                <select
                  value={selectedWorkMode}
                  onChange={(e) => setSelectedWorkMode(e.target.value)}
                  className="px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-medium focus:outline-none focus:border-indigo-500"
                >
                  <option value="All">All Work Modes</option>
                  <option value="Remote">Remote</option>
                  <option value="Hybrid">Hybrid</option>
                  <option value="On-site">On-site</option>
                </select>
              )}

              {/* Contextual Filter 3: Relocation Assistance (if International) or Category */}
              {geoScope === "international" ? (
                <select
                  value={selectedRelocation}
                  onChange={(e) => setSelectedRelocation(e.target.value)}
                  className="px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-medium focus:outline-none focus:border-indigo-500"
                  title="Filter by Relocation Support"
                >
                  <option value="All">All Relocation</option>
                  <option value="Available">Relocation Provided</option>
                </select>
              ) : (
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-medium focus:outline-none focus:border-indigo-500 truncate"
                >
                  <option value="All">All Categories</option>
                  <option value="Software Development">Software Development</option>
                  <option value="Data Science & Analytics">Data & Analytics</option>
                  <option value="Cloud & DevOps">Cloud & DevOps</option>
                  <option value="Cybersecurity">Cybersecurity</option>
                  <option value="Product & Design">Product & Design</option>
                  <option value="Core Engineering">Core Engineering</option>
                </select>
              )}

              {/* Category (if International) or Job Source */}
              {geoScope === "international" ? (
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-medium focus:outline-none focus:border-indigo-500 truncate"
                >
                  <option value="All">All Categories</option>
                  <option value="Software Development">Software Development</option>
                  <option value="Data Science & Analytics">Data & Analytics</option>
                  <option value="Cloud & DevOps">Cloud & DevOps</option>
                  <option value="Cybersecurity">Cybersecurity</option>
                  <option value="Product & Design">Product & Design</option>
                  <option value="Core Engineering">Core Engineering</option>
                </select>
              ) : (
                <select
                  value={selectedSourceType}
                  onChange={(e) => setSelectedSourceType(e.target.value)}
                  className="px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-medium focus:outline-none focus:border-indigo-500"
                >
                  <option value="All">All Sources</option>
                  <option value="ATS_GREENHOUSE">Greenhouse ATS</option>
                  <option value="ATS_LEVER">Lever ATS</option>
                  <option value="MANUAL_SEED">Curated Portals</option>
                </select>
              )}

              {/* Job Type */}
              <select
                value={selectedJobType}
                onChange={(e) => setSelectedJobType(e.target.value)}
                className="px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-medium focus:outline-none focus:border-indigo-500"
              >
                <option value="All">All Types</option>
                <option value="Full-Time">Full-Time</option>
                <option value="Internship">Internship</option>
              </select>

              {/* Freshers Eligible Checkbox */}
              <label className="flex items-center gap-2 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer text-slate-700 font-medium select-none">
                <input
                  type="checkbox"
                  checked={freshersOnly}
                  onChange={(e) => setFreshersOnly(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-0"
                />
                <span className="truncate">Freshers Only</span>
              </label>
            </div>

            {/* Active Filters Clear Indicator */}
            {(searchQuery ||
              selectedCategory !== "All" ||
              selectedCompany !== "All" ||
              selectedWorkMode !== "All" ||
              selectedIndianCity !== "All" ||
              selectedCountry !== "All" ||
              selectedVisaSponsorship !== "All" ||
              selectedRelocation !== "All" ||
              selectedRemoteEligibility !== "All" ||
              freshersOnly) && (
              <div className="pt-2 flex items-center justify-between text-xs text-slate-500">
                <span>Showing {totalJobsCount} matching opportunities</span>
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedCategory("All");
                    setSelectedCompany("All");
                    setSelectedWorkMode("All");
                    setSelectedJobType("All");
                    setSelectedExperience("All");
                    setSelectedIndianCity("All");
                    setSelectedCountry("All");
                    setSelectedVisaSponsorship("All");
                    setSelectedRelocation("All");
                    setSelectedRemoteEligibility("All");
                    setFreshersOnly(false);
                  }}
                  className="text-rose-600 font-semibold hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Reset All Filters</span>
                </button>
              </div>
            )}
          </div>

          {/* Job Listings Grid */}
          {exploreLoading ? (
            <div className="py-16 text-center text-slate-400">
              <RefreshCw className="w-6 h-6 animate-spin text-indigo-600 mx-auto mb-2" />
              <p className="text-xs font-semibold">Filtering verified opportunities...</p>
            </div>
          ) : exploreJobs.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {exploreJobs.map((job) => (
                  <JobCard
                    key={job._id}
                    job={job}
                    isSaved={savedJobIdSet.has(job._id)}
                    onToggleSave={handleToggleSave}
                    onOpenDetails={handleOpenDetails}
                    onApplyExternal={handleApplyExternal}
                  />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="pt-4 flex items-center justify-center gap-2 text-xs">
                  <button
                    disabled={currentPage <= 1}
                    onClick={() => fetchExploreJobs(currentPage - 1)}
                    className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="px-3 py-1 font-semibold text-slate-600">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    disabled={currentPage >= totalPages}
                    onClick={() => fetchExploreJobs(currentPage + 1)}
                    className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-md mx-auto space-y-3">
              <Building2 className="w-8 h-8 text-slate-400 mx-auto" />
              <h3 className="text-sm font-bold text-slate-900">
                No matching opportunities found
              </h3>
              <p className="text-xs text-slate-500">
                Try widening your search terms or clearing specific category and
                experience filters.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("All");
                  setSelectedCompany("All");
                  setSelectedWorkMode("All");
                  setFreshersOnly(false);
                }}
                className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold"
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 3: COMPANY CAREER PAGES */}
      {/* ========================================================= */}
      {activeTab === "companies" && (
        <div className="space-y-5">
          {/* Search & Category Filter */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-3">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={companySearch}
                onChange={(e) => setCompanySearch(e.target.value)}
                placeholder="Search curated employers by company name or industry..."
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 focus:bg-white transition-all"
              />
            </div>

            {/* Category Filter Pills */}
            <div className="flex flex-wrap gap-1.5 text-xs">
              {[
                "All",
                "IT Services",
                "Product-Based Companies",
                "Startups",
                "Consulting",
                "Finance and Banking",
                "Core Engineering",
                "Government and Public Sector",
              ].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCompanyCategory(cat)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                    companyCategory === cat
                      ? "bg-indigo-600 text-white shadow-xs"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200/80"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Companies Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCompanies.map((comp) => (
              <CompanyCard
                key={comp.companyName}
                company={comp}
                onBrowseJobs={(name) => {
                  setSelectedCompany(name);
                  handleTabChange("explore");
                }}
              />
            ))}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 4: SAVED JOBS */}
      {/* ========================================================= */}
      {activeTab === "saved" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Your Saved Opportunities ({savedJobs.length})
              </h2>
              <p className="text-xs text-slate-500">
                Review, tailor your application materials, and apply directly through the official portals.
              </p>
            </div>
          </div>

          {savedJobs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {savedJobs.map((item) => (
                <JobCard
                  key={item.savedId}
                  job={item.job}
                  isSaved={true}
                  onToggleSave={handleToggleSave}
                  onOpenDetails={handleOpenDetails}
                  onApplyExternal={handleApplyExternal}
                />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-md mx-auto space-y-3">
              <Bookmark className="w-8 h-8 text-slate-400 mx-auto" />
              <h3 className="text-sm font-bold text-slate-900">
                No saved opportunities yet
              </h3>
              <p className="text-xs text-slate-500">
                Bookmark interesting job postings while exploring to save them for resume tailoring and application tracking.
              </p>
              <button
                type="button"
                onClick={() => handleTabChange("explore")}
                className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold cursor-pointer"
              >
                Explore Opportunities
              </button>
            </div>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 5: APPLIED JOBS (EXTERNAL APPLICATION TRACKER & FUNNEL) */}
      {/* ========================================================= */}
      {activeTab === "applied" && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Application Intelligence & Tracking
              </h2>
              <p className="text-xs text-slate-500">
                Manage your external application funnel, scheduled follow-ups, and interview progression.
              </p>
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-400">Filter:</span>
              <select
                value={applicationStatusFilter}
                onChange={(e) => setApplicationStatusFilter(e.target.value)}
                className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700"
              >
                <option value="All">All Stages ({applications.length})</option>
                <option value="Preparing">Preparing</option>
                <option value="Applied">Applied</option>
                <option value="Assessment">Assessment</option>
                <option value="Interview">Interview</option>
                <option value="Offer">Offer</option>
                <option value="Rejected">Rejected</option>
                <option value="Withdrawn">Withdrawn</option>
              </select>
            </div>
          </div>

          {/* Application Funnel KPI Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-2xs">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Pipeline</div>
              <div className="text-xl font-black text-slate-900 mt-0.5">{applicationStats?.total ?? applications.length}</div>
            </div>
            <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-2xs">
              <div className="text-[10px] font-bold text-amber-600 uppercase tracking-wider">Preparing</div>
              <div className="text-xl font-black text-amber-600 mt-0.5">{applicationStats?.preparing ?? 0}</div>
            </div>
            <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-2xs">
              <div className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">Submitted</div>
              <div className="text-xl font-black text-blue-600 mt-0.5">{applicationStats?.applied ?? 0}</div>
            </div>
            <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-2xs">
              <div className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider">Assessments</div>
              <div className="text-xl font-black text-indigo-600 mt-0.5">{applicationStats?.assessment ?? 0}</div>
            </div>
            <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-2xs">
              <div className="text-[10px] font-bold text-purple-600 uppercase tracking-wider">Interviews</div>
              <div className="text-xl font-black text-purple-600 mt-0.5">{applicationStats?.interview ?? 0}</div>
            </div>
            <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-2xs">
              <div className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">Offers</div>
              <div className="text-xl font-black text-emerald-600 mt-0.5">{applicationStats?.offered ?? 0}</div>
            </div>
          </div>

          {filteredApplications.length > 0 ? (
            <div className="space-y-4">
              {filteredApplications.map((app) => {
                const stages = ['Preparing', 'Applied', 'Assessment', 'Interview', 'Offer'];
                const currentIdx = stages.indexOf(app.status);
                const isTerminal = app.status === 'Rejected' || app.status === 'Withdrawn';

                return (
                  <div
                    key={app._id}
                    className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs hover:border-slate-300 transition-colors space-y-4"
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="min-w-0 flex items-center gap-3.5">
                        <div className="w-11 h-11 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                          {app.companyName?.slice(0, 2).toUpperCase() || "CO"}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-700">
                              {app.companyName}
                            </span>
                            <span className="px-2 py-0.5 rounded-md bg-slate-100 text-[10px] font-bold text-slate-500">
                              Tracked Opportunity
                            </span>
                            {app.nextFollowUpDate && (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200">
                                <Calendar className="w-3 h-3 text-indigo-600" />
                                Follow-up: {new Date(app.nextFollowUpDate).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                          <h4 className="text-sm font-bold text-slate-900 truncate mt-0.5">
                            {app.role}
                          </h4>
                          <div className="text-[11px] text-slate-400 mt-0.5">
                            Logged: {new Date(app.appliedAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>

                      {/* Right: Stage Selector & Actions */}
                      <div className="flex flex-wrap items-center gap-3 shrink-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[11px] font-bold text-slate-400">
                            Stage:
                          </span>
                          <select
                            value={app.status}
                            onChange={(e) =>
                              handleUpdateAppStatus(
                                app._id,
                                e.target.value as TrackedApplication["status"]
                              )
                            }
                            className="px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-800 focus:outline-none focus:border-indigo-500"
                          >
                            <option value="Preparing">Preparing</option>
                            <option value="Applied">Applied</option>
                            <option value="Assessment">Assessment</option>
                            <option value="Interview">Interview</option>
                            <option value="Offer">Offer</option>
                            <option value="Rejected">Rejected</option>
                            <option value="Withdrawn">Withdrawn</option>
                          </select>
                        </div>

                        {app.officialApplyUrl && (
                          <a
                            href={app.officialApplyUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 rounded-xl text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                            title="Open official career page"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        )}

                        <button
                          type="button"
                          onClick={() => handleDeleteApplication(app._id)}
                          className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                          title="Untrack this application"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Visual Journey Stepper */}
                    <div className="pt-3 border-t border-slate-100">
                      <div className="flex items-center justify-between relative px-2">
                        {stages.map((stageName, idx) => {
                          const isDone = currentIdx > idx;
                          const isCurrent = app.status === stageName;

                          return (
                            <div key={stageName} className="flex-1 flex flex-col items-center relative">
                              <div
                                className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-all z-10 ${
                                  isCurrent
                                    ? "bg-indigo-600 text-white ring-4 ring-indigo-100 shadow-xs"
                                    : isDone
                                    ? "bg-emerald-500 text-white"
                                    : isTerminal
                                    ? "bg-slate-100 text-slate-300"
                                    : "bg-slate-100 text-slate-400 border border-slate-200"
                                }`}
                              >
                                {isDone ? "✓" : idx + 1}
                              </div>
                              <span
                                className={`text-[10px] font-semibold mt-1 text-center truncate ${
                                  isCurrent
                                    ? "text-indigo-700 font-bold"
                                    : isDone
                                    ? "text-emerald-700"
                                    : "text-slate-400"
                                }`}
                              >
                                {stageName}
                              </span>
                            </div>
                          );
                        })}
                      </div>

                      {/* Follow-up scheduler bar */}
                      <div className="mt-3 flex items-center justify-between text-xs pt-2">
                        {editingFollowUpId === app._id ? (
                          <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-xl border border-slate-200 w-full sm:w-auto">
                            <input
                              type="date"
                              value={followUpDateInput}
                              onChange={(e) => setFollowUpDateInput(e.target.value)}
                              className="px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs"
                            />
                            <button
                              type="button"
                              onClick={() => handleSaveFollowUpDate(app._id)}
                              className="px-3 py-1 bg-indigo-600 text-white rounded-lg text-xs font-bold cursor-pointer"
                            >
                              Save Date
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingFollowUpId(null)}
                              className="px-2 py-1 text-slate-500 text-xs cursor-pointer"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              setEditingFollowUpId(app._id);
                              setFollowUpDateInput(app.nextFollowUpDate ? app.nextFollowUpDate.slice(0, 10) : "");
                            }}
                            className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-slate-500 hover:text-indigo-600 transition-colors cursor-pointer"
                          >
                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                            <span>{app.nextFollowUpDate ? "Reschedule Follow-up" : "+ Schedule Follow-up Date"}</span>
                          </button>
                        )}

                        {app.timeline && app.timeline.length > 0 && (
                          <span className="text-[10px] text-slate-400 font-medium">
                            {app.timeline.length} status change{app.timeline.length > 1 ? "s" : ""} recorded
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-md mx-auto space-y-3">
              <CheckCircle2 className="w-8 h-8 text-slate-400 mx-auto" />
              <h3 className="text-sm font-bold text-slate-900">
                No tracked applications yet
              </h3>
              <p className="text-xs text-slate-500">
                When you click "Apply on Company Website" for any opportunity, Career Compass will prompt you to log and track your submission.
              </p>
              <button
                type="button"
                onClick={() => handleTabChange("explore")}
                className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold cursor-pointer"
              >
                Browse Opportunities
              </button>
            </div>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 6: JOB ALERTS */}
      {/* ========================================================= */}
      {activeTab === "alerts" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Your Job Alert Subscriptions
              </h2>
              <p className="text-xs text-slate-500">
                Receive notifications when verified openings match your preferred roles, skills, and target compatibility threshold.
              </p>
            </div>

            <button
              type="button"
              onClick={handleOpenCreateAlertModal}
              className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Create Alert</span>
            </button>
          </div>

          {jobAlerts.length > 0 ? (
            <div className="space-y-3">
              {jobAlerts.map((alert) => (
                <div
                  key={alert._id}
                  className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-2xs flex items-center justify-between gap-4"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-slate-900">
                        {alert.title}
                      </h4>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          alert.isActive
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        {alert.isActive ? "Active" : "Paused"}
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 text-[10px] font-bold border border-indigo-200">
                        Min Match: {alert.minMatchScore || 70}%
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-sky-50 text-sky-700 text-[10px] font-bold border border-sky-200 uppercase">
                        {alert.notificationChannel || "in-app"}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 mt-1">
                      {alert.role && <span>Role: {alert.role}</span>}
                      {alert.company && <span>• Company: {alert.company}</span>}
                      {alert.location && <span>• Location: {alert.location}</span>}
                      <span>• Frequency: {alert.frequency}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleToggleAlert(alert._id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                        alert.isActive
                          ? "bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200"
                          : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200"
                      }`}
                    >
                      {alert.isActive ? "Pause" : "Activate"}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDeleteAlert(alert._id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-md mx-auto space-y-3">
              <Bell className="w-8 h-8 text-slate-400 mx-auto" />
              <h3 className="text-sm font-bold text-slate-900">
                No active job alerts configured
              </h3>
              <p className="text-xs text-slate-500">
                Set up alerts for specific job titles or companies to be notified when matching positions open.
              </p>
              <button
                type="button"
                onClick={handleOpenCreateAlertModal}
                className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold cursor-pointer"
              >
                Create First Alert
              </button>
            </div>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* CREATE ALERT MODAL */}
      {/* ========================================================= */}
      {isCreateAlertOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-2xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full border border-slate-200 p-6 shadow-2xl relative">
            <button
              onClick={() => setIsCreateAlertOpen(false)}
              className="absolute right-5 top-5 p-1.5 text-slate-400 hover:text-slate-700"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-4">
              <Bell className="w-5 h-5 text-indigo-600" />
              <h3 className="text-base font-bold text-slate-900">Create Job Alert</h3>
            </div>

            <form onSubmit={handleCreateAlert} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700">Alert Title *</label>
                <input
                  type="text"
                  required
                  value={alertForm.title}
                  onChange={(e) => setAlertForm({ ...alertForm, title: e.target.value })}
                  placeholder="e.g. Graduate Software Engineer Alerts"
                  className="w-full px-3 py-2 mt-1 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700">Target Role</label>
                <input
                  type="text"
                  value={alertForm.role}
                  onChange={(e) => setAlertForm({ ...alertForm, role: e.target.value })}
                  placeholder="e.g. Software Engineer / Data Analyst"
                  className="w-full px-3 py-2 mt-1 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700">Target Company (Optional)</label>
                <input
                  type="text"
                  value={alertForm.company}
                  onChange={(e) => setAlertForm({ ...alertForm, company: e.target.value })}
                  placeholder="e.g. Google, Microsoft, TCS"
                  className="w-full px-3 py-2 mt-1 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700">Skills (comma separated)</label>
                <input
                  type="text"
                  value={alertForm.skills}
                  onChange={(e) => setAlertForm({ ...alertForm, skills: e.target.value })}
                  placeholder="e.g. Java, Python, React"
                  className="w-full px-3 py-2 mt-1 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700">Minimum Fit Threshold</label>
                  <select
                    value={alertForm.minMatchScore}
                    onChange={(e) => setAlertForm({ ...alertForm, minMatchScore: Number(e.target.value) })}
                    className="w-full px-3 py-2 mt-1 bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    <option value={50}>50% Compatibility</option>
                    <option value={60}>60% Compatibility</option>
                    <option value={70}>70% Compatibility (Recommended)</option>
                    <option value={80}>80% Compatibility</option>
                    <option value={85}>85% Strong Fit Only</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700">Notification Channel</label>
                  <select
                    value={alertForm.notificationChannel}
                    onChange={(e) => setAlertForm({ ...alertForm, notificationChannel: e.target.value as "in-app" | "email" | "both" })}
                    className="w-full px-3 py-2 mt-1 bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    <option value="in-app">In-App Notification</option>
                    <option value="email">Email</option>
                    <option value="both">In-App & Email</option>
                  </select>
                </div>
              </div>

              {/* Geographical Alert Preferences */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700">Geographical Scope</label>
                  <select
                    value={alertForm.geoScope}
                    onChange={(e) => setAlertForm({ ...alertForm, geoScope: e.target.value as any })}
                    className="w-full px-3 py-2 mt-1 bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    <option value="All">All Regions</option>
                    <option value="India">India Only 🇮🇳</option>
                    <option value="International">International Only 🌎</option>
                    <option value="Remote Worldwide">Remote Worldwide 🌐</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700">Target Country / City</label>
                  <input
                    type="text"
                    value={alertForm.targetCountry || alertForm.targetCity}
                    onChange={(e) => setAlertForm({ ...alertForm, targetCountry: e.target.value, targetCity: e.target.value })}
                    placeholder="e.g. United States or Bengaluru"
                    className="w-full px-3 py-2 mt-1 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div className="space-y-1.5 pt-1">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="freshersOnlyCheck"
                    checked={alertForm.freshersOnly}
                    onChange={(e) => setAlertForm({ ...alertForm, freshersOnly: e.target.checked })}
                    className="rounded text-indigo-600"
                  />
                  <label htmlFor="freshersOnlyCheck" className="text-slate-700 font-semibold cursor-pointer">
                    Freshers & Graduate Eligible Only
                  </label>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="visaSponsorshipCheck"
                    checked={alertForm.visaSponsorshipOnly}
                    onChange={(e) => setAlertForm({ ...alertForm, visaSponsorshipOnly: e.target.checked })}
                    className="rounded text-indigo-600"
                  />
                  <label htmlFor="visaSponsorshipCheck" className="text-slate-700 font-semibold cursor-pointer">
                    Visa Sponsored Positions Only
                  </label>
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreateAlertOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-bold"
                >
                  Save Alert
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* JOB DETAILS DRAWER */}
      {/* ========================================================= */}
      <JobDetailsDrawer
        job={selectedJob}
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        isSaved={selectedJob ? savedJobIdSet.has(selectedJob._id) : false}
        onToggleSave={handleToggleSave}
        onApplyExternal={handleApplyExternal}
      />

      {/* ========================================================= */}
      {/* EXTERNAL APPLICATION CONFIRMATION MODAL */}
      {/* ========================================================= */}
      <ExternalApplyModal
        job={pendingApplyJob}
        isOpen={isApplyModalOpen}
        onClose={() => {
          setIsApplyModalOpen(false);
          setPendingApplyJob(null);
        }}
        onConfirmApplication={handleConfirmApplication}
        onSaveForLater={() => {
          if (pendingApplyJob) handleToggleSave(pendingApplyJob);
          setIsApplyModalOpen(false);
          setPendingApplyJob(null);
        }}
      />
    </div>
  );
}
