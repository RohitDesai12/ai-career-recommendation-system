import React, { useState, useEffect } from "react";
import { useLocation, useNavigate, Link } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import {
  Sparkles,
  Award,
  ChevronRight,
  Target,
  ArrowLeft,
  CheckCircle2,
  Map,
  Compass,
  RotateCcw,
  AlertCircle,
  X,
  ExternalLink,
  BookOpen,
  Briefcase,
  FileText,
  MessageSquare,
  History,
  Timer,
  Play,
  Check,
  Building,
  HelpCircle,
  SlidersHorizontal
} from "lucide-react";
import { useAuth } from "../context/auth-context";
import axios from "axios";

export function CareerResults() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [assessmentData, setAssessmentData] = useState<any>(null);

  // Modals state
  const [showComparisonModal, setShowComparisonModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showRetakeModal, setShowRetakeModal] = useState(false);
  const [showExistingRoadmapModal, setShowExistingRoadmapModal] = useState(false);
  const [existingRoadmapData, setExistingRoadmapData] = useState<any>(null);
  const [targetCareerForRoadmap, setTargetCareerForRoadmap] = useState<string>("");
  const [generatingRoadmap, setGeneratingRoadmap] = useState(false);

  const [showChallengeModal, setShowChallengeModal] = useState(false);
  const [selectedChallengeCareer, setSelectedChallengeCareer] = useState<any>(null);
  const [challengeFeedback, setChallengeFeedback] = useState<any>(null);
  const [evaluatingChallenge, setEvaluatingChallenge] = useState(false);
  const [selectedChallengeOption, setSelectedChallengeOption] = useState<string>("");

  // Career Details Drawer
  const [drawerCareer, setDrawerCareer] = useState<any>(null);

  // History list state
  const [historyList, setHistoryList] = useState<any[]>([]);

  // Fetch assessment results (from location state, API latest, or fallback)
  useEffect(() => {
    async function loadResults() {
      setLoading(true);
      try {
        if (location.state?.results) {
          setAssessmentData(location.state.results);
          setLoading(false);
          return;
        }

        // Try getting latest from backend
        const res = await axios.get("http://localhost:5000/api/assessment/latest");
        if (res.data) {
          setAssessmentData(res.data);
          setLoading(false);
          return;
        }
      } catch (err) {
        console.warn("Could not load latest assessment from API, checking local storage:", err);
      }

      // Check localStorage fallback
      try {
        const saved = localStorage.getItem("saved_career_results");
        if (saved) {
          setAssessmentData(JSON.parse(saved));
        }
      } catch {
        // empty
      } finally {
        setLoading(false);
      }
    }

    loadResults();
  }, [location.state]);

  // Load history list for modal
  const handleOpenHistory = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/assessment/history");
      setHistoryList(res.data.history || []);
    } catch (err) {
      console.error("Error fetching history:", err);
    }
    setShowHistoryModal(true);
  };

  const handleRetakeClick = () => {
    setShowRetakeModal(true);
  };

  const handleConfirmRetake = () => {
    setShowRetakeModal(false);
    navigate("/assessment?retake=true", { state: { retake: true } });
  };

  // Launch 5-min challenge
  const handleOpenChallenge = (career: any) => {
    setSelectedChallengeCareer(career);
    setChallengeFeedback(null);
    setSelectedChallengeOption("");
    setShowChallengeModal(true);
  };

  const handleSubmitChallenge = async () => {
    if (!selectedChallengeOption) return;
    setEvaluatingChallenge(true);
    try {
      const res = await axios.post("http://localhost:5000/api/assessment/challenge", {
        careerTitle: selectedChallengeCareer?.title,
        challengeId: "ch-5min",
        chosenOption: selectedChallengeOption,
        timeSpentSeconds: 45
      });
      setChallengeFeedback(res.data.feedback);
    } catch (err) {
      console.error("Error evaluating challenge:", err);
    } finally {
      setEvaluatingChallenge(false);
    }
  };

  // Quick Action triggers with Existing Roadmap Check
  const handleExploreRoadmap = async (careerTitle: string) => {
    setGeneratingRoadmap(true);
    try {
      // 1. Check if user already has a roadmap for this career
      const checkRes = await axios.post("http://localhost:5000/api/roadmap/check-existing", {
        careerTitle
      });

      if ((checkRes.data?.hasExisting || checkRes.data?.exists) && checkRes.data.roadmap) {
        setExistingRoadmapData(checkRes.data.roadmap);
        setTargetCareerForRoadmap(careerTitle);
        setShowExistingRoadmapModal(true);
        setGeneratingRoadmap(false);
        return;
      }

      // 2. No existing roadmap -> generate new and navigate
      const genRes = await axios.post("http://localhost:5000/api/roadmap/generate", {
        targetCareer: careerTitle
      });

      if (genRes.data?._id) {
        navigate(`/roadmap?id=${genRes.data._id}`);
      } else {
        throw new Error("Roadmap was not saved in database");
      }
    } catch (err: any) {
      console.error("Error generating roadmap from Career Discovery:", err);
      alert("Roadmap could not be saved to database. Please try again.");
    } finally {
      setGeneratingRoadmap(false);
    }
  };

  const handleContinueExisting = () => {
    setShowExistingRoadmapModal(false);
    if (existingRoadmapData?._id) {
      navigate(`/roadmap?id=${existingRoadmapData._id}`);
    } else {
      navigate("/roadmap");
    }
  };

  const handleCreateNewVersion = async () => {
    setShowExistingRoadmapModal(false);
    setGeneratingRoadmap(true);
    try {
      const genRes = await axios.post("http://localhost:5000/api/roadmap/generate", {
        targetCareer: targetCareerForRoadmap,
        forceNew: true
      });

      if (genRes.data?._id) {
        navigate(`/roadmap?id=${genRes.data._id}`);
      } else {
        throw new Error("Roadmap was not saved in database");
      }
    } catch (err: any) {
      console.error("Error creating new roadmap version:", err);
      alert("Roadmap could not be saved to database. Please try again.");
    } finally {
      setGeneratingRoadmap(false);
    }
  };

  const handleViewJobs = (careerTitle: string) => {
    navigate("/jobs");
  };

  const handleTailorResume = (careerTitle: string) => {
    navigate("/resume-studio/tailor", { state: { targetRole: careerTitle } });
  };

  const handleMockInterview = (careerTitle: string) => {
    navigate("/mock-interview", { state: { targetRole: careerTitle } });
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80 shadow-xs max-w-md w-full">
          <span className="material-symbols-outlined animate-spin text-indigo-600 text-[36px]">
            sync
          </span>
          <h3 className="text-sm font-bold text-slate-900 mt-3">Synthesizing Your Career Signals</h3>
          <p className="text-xs text-slate-400 mt-1">Analyzing scenario patterns, problem-solving approach, and values...</p>
        </div>
      </div>
    );
  }

  if (!assessmentData || !assessmentData.primaryCareer) {
    return (
      <div className="max-w-xl mx-auto py-16 px-4 text-center">
        <div className="bg-white rounded-3xl p-10 border border-slate-200/80 shadow-xs space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
            <Compass className="w-7 h-7" />
          </div>
          <h2 className="text-lg font-bold text-slate-900">No Assessment Results Found</h2>
          <p className="text-xs text-slate-500">
            Take the 8-minute interactive Career Discovery Assessment to discover your ideal career trajectories.
          </p>
          <button
            type="button"
            onClick={() => navigate("/assessment")}
            className="px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20 transition-all cursor-pointer inline-flex items-center gap-2"
          >
            <span>Start Career Assessment</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  const dimensions = assessmentData.dimensions || {
    technicalInterest: 85,
    analytical: 75,
    problemSolving: 90,
    creativity: 65,
    peopleOrientation: 55
  };

  const keyStrengths = assessmentData.keyStrengths || [
    {
      title: "Technical Problem Solving",
      description: "You excel at analyzing and solving complex, practical issues through structured logic."
    },
    {
      title: "Building and Systems",
      description: "You enjoy hands-on development and constructing reliable end-to-end architectures."
    },
    {
      title: "Continuous Learning",
      description: "You are motivated to master new technologies and expand your technical horizons."
    }
  ];

  const primaryCareer = assessmentData.primaryCareer;
  const alternativeCareers = (assessmentData.alternativeCareers || []).slice(0, 2);
  const otherCareers = (assessmentData.allCareers || []).slice(3, 7);

  // SVG Radar Chart calculations
  // Center is (120, 120), radius is 80
  const center = 120;
  const radius = 80;
  const angles = [-90, -18, 54, 126, 198]; // 5 axes in degrees

  const getPoint = (value: number, angleDeg: number) => {
    const rad = (angleDeg * Math.PI) / 180;
    const r = (value / 100) * radius;
    return {
      x: center + r * Math.cos(rad),
      y: center + r * Math.sin(rad)
    };
  };

  const dimValues = [
    dimensions.analytical || 50,
    dimensions.problemSolving || 50,
    dimensions.creativity || 50,
    dimensions.peopleOrientation || 50,
    dimensions.technicalInterest || 50
  ];

  const polygonPoints = dimValues
    .map((val, idx) => {
      const pt = getPoint(val, angles[idx]);
      return `${pt.x},${pt.y}`;
    })
    .join(" ");

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-20">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-xs">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-700 text-[11px] font-bold">
            <Sparkles className="w-3 h-3 text-emerald-600" />
            <span>Career Discovery Completed</span>
          </div>
          <h1 className="text-2xl font-black font-heading text-slate-900 mt-2 tracking-tight">
            Your Personalized Career Profile
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Based on your scenario decisions, problem-solving challenges, work styles, and career values.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setShowComparisonModal(true)}
            className="px-4 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer inline-flex items-center gap-1.5"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>View Comparison</span>
          </button>
          <button
            type="button"
            onClick={handleOpenHistory}
            className="px-4 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer inline-flex items-center gap-1.5"
          >
            <History className="w-3.5 h-3.5" />
            <span>Assessment History</span>
          </button>
          <button
            type="button"
            onClick={handleRetakeClick}
            className="px-4 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20 transition-all cursor-pointer inline-flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Retake Test</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Left Profile Card + Right Top Career Matches */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN: Your Career Profile (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                  <Compass className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold font-heading text-slate-900">Your Career Profile</h3>
                  <p className="text-[11px] text-slate-400">Multi-dimensional strength footprint</p>
                </div>
              </div>
            </div>

            {/* Radar / Spider Chart SVG */}
            <div className="flex flex-col items-center justify-center pt-2">
              <div className="relative w-[240px] h-[240px]">
                <svg viewBox="0 0 240 240" className="w-full h-full">
                  {/* Outer Circles / Webs */}
                  {[0.25, 0.5, 0.75, 1.0].map((scale, i) => (
                    <polygon
                      key={i}
                      points={angles
                        .map((deg) => {
                          const pt = getPoint(100 * scale, deg);
                          return `${pt.x},${pt.y}`;
                        })
                        .join(" ")}
                      fill="none"
                      stroke="#e2e8f0"
                      strokeWidth="1"
                    />
                  ))}

                  {/* Axis lines */}
                  {angles.map((deg, i) => {
                    const pt = getPoint(100, deg);
                    return (
                      <line
                        key={i}
                        x1={center}
                        y1={center}
                        x2={pt.x}
                        y2={pt.y}
                        stroke="#e2e8f0"
                        strokeWidth="1"
                      />
                    );
                  })}

                  {/* Dimension Polygon */}
                  <polygon
                    points={polygonPoints}
                    fill="rgba(99, 102, 241, 0.25)"
                    stroke="#4f46e5"
                    strokeWidth="2.5"
                    strokeLinejoin="round"
                  />

                  {/* Points on Polygon */}
                  {dimValues.map((val, idx) => {
                    const pt = getPoint(val, angles[idx]);
                    return (
                      <circle
                        key={idx}
                        cx={pt.x}
                        cy={pt.y}
                        r="3.5"
                        fill="#4f46e5"
                        stroke="#ffffff"
                        strokeWidth="1.5"
                      />
                    );
                  })}
                </svg>

                {/* Radar Axis Labels */}
                <div className="absolute top-1 left-1/2 -translate-x-1/2 text-[10px] font-bold text-slate-700 bg-white/90 px-1.5 rounded shadow-xs">
                  Analytical: {dimensions.analytical}%
                </div>
                <div className="absolute top-1/4 right-0 text-[10px] font-bold text-slate-700 bg-white/90 px-1.5 rounded shadow-xs">
                  Problem Solving: {dimensions.problemSolving}%
                </div>
                <div className="absolute bottom-6 right-2 text-[10px] font-bold text-slate-700 bg-white/90 px-1.5 rounded shadow-xs">
                  Creativity: {dimensions.creativity}%
                </div>
                <div className="absolute bottom-6 left-2 text-[10px] font-bold text-slate-700 bg-white/90 px-1.5 rounded shadow-xs">
                  People: {dimensions.peopleOrientation}%
                </div>
                <div className="absolute top-1/4 left-0 text-[10px] font-bold text-slate-700 bg-white/90 px-1.5 rounded shadow-xs">
                  Technical: {dimensions.technicalInterest}%
                </div>
              </div>
            </div>

            {/* Key Strengths */}
            <div className="pt-2 border-t border-slate-100 space-y-3">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Key Strengths</h4>
              <div className="space-y-2.5">
                {keyStrengths.map((str: any, i: number) => (
                  <div key={i} className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-indigo-600 text-[16px]">
                        verified
                      </span>
                      <h5 className="text-xs font-bold text-slate-900">{str.title}</h5>
                    </div>
                    <p className="text-[11px] text-slate-500 leading-relaxed pl-6">{str.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Your Preferences */}
            <div className="pt-2 border-t border-slate-100 space-y-2.5">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Your Preferences</h4>
              <div className="flex flex-wrap gap-1.5">
                {["Continuous Learning", "High Growth", "Modern Tech", "Flexible Location"].map((p, i) => (
                  <span
                    key={i}
                    className="px-2.5 py-1 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-700 text-[10.5px] font-bold"
                  >
                    {p}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Top Career Matches (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-black font-heading text-slate-900 tracking-tight">
                Top Career Matches
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                These careers align with your natural problem-solving profile, interests, and stated goals.
              </p>
            </div>
          </div>

          {/* Matches Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Card 1: Primary Career (Best Match) */}
            <div className="bg-white rounded-3xl p-5 border-2 border-emerald-500/80 shadow-md flex flex-col justify-between relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-50 rounded-full blur-2xl -mr-6 -mt-6 pointer-events-none" />

              <div>
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-lg bg-emerald-500 text-white font-bold text-[10px]">
                    Best Match
                  </span>
                  <span className="text-xs font-black text-emerald-600">
                    {primaryCareer.matchScore}% Match
                  </span>
                </div>

                <h3 className="text-base font-bold font-heading text-slate-900 mt-2.5 leading-snug">
                  {primaryCareer.title}
                </h3>
                <div className="text-[11px] font-bold text-slate-500 mt-0.5">
                  {primaryCareer.salaryRange}
                </div>

                <div className="mt-3.5 space-y-1.5">
                  <div className="text-[10.5px] font-bold text-slate-700 uppercase tracking-wider">Why it matches:</div>
                  {(primaryCareer.whyMatches || []).slice(0, 3).map((r: string, idx: number) => (
                    <div key={idx} className="flex items-start gap-1.5 text-[11px] text-slate-600">
                      <span className="text-emerald-500 font-bold">✓</span>
                      <span className="line-clamp-2 leading-tight">{r}</span>
                    </div>
                  ))}
                </div>

                {primaryCareer.areasToDevelop && primaryCareer.areasToDevelop.length > 0 && (
                  <div className="mt-3 space-y-1">
                    <div className="text-[10px] font-bold text-slate-400 uppercase">Areas to develop:</div>
                    <div className="flex flex-wrap gap-1">
                      {primaryCareer.areasToDevelop.slice(0, 2).map((a: string, i: number) => (
                        <span key={i} className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[10px]">
                          • {a}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-slate-100 mt-4 space-y-2">
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    type="button"
                    onClick={() => setDrawerCareer(primaryCareer)}
                    className="py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[11px] transition-colors cursor-pointer"
                  >
                    View Details
                  </button>
                  <button
                    type="button"
                    onClick={() => handleOpenChallenge(primaryCareer)}
                    className="py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-[11px] transition-colors cursor-pointer flex items-center justify-center gap-1"
                  >
                    <Play className="w-3 h-3 text-indigo-600" />
                    <span>Try 5-min Test</span>
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => handleExploreRoadmap(primaryCareer.title)}
                  className="w-full py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[11px] shadow-sm transition-all cursor-pointer flex items-center justify-center gap-1"
                >
                  <Map className="w-3.5 h-3.5" />
                  <span>Explore Learning Roadmap</span>
                </button>
              </div>
            </div>

            {/* Alternative Cards */}
            {alternativeCareers.map((career: any, i: number) => (
              <div
                key={i}
                className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between hover:shadow-md transition-all"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-lg bg-indigo-50 text-indigo-700 font-bold text-[10px]">
                      {i === 0 ? "High Match" : "Good Match"}
                    </span>
                    <span className="text-xs font-black text-indigo-600">
                      {career.matchScore}% Match
                    </span>
                  </div>

                  <h3 className="text-base font-bold font-heading text-slate-900 mt-2.5 leading-snug">
                    {career.title}
                  </h3>
                  <div className="text-[11px] font-bold text-slate-500 mt-0.5">
                    {career.salaryRange}
                  </div>

                  <div className="mt-3.5 space-y-1.5">
                    <div className="text-[10.5px] font-bold text-slate-700 uppercase tracking-wider">Why it matches:</div>
                    {(career.whyMatches || []).slice(0, 2).map((r: string, idx: number) => (
                      <div key={idx} className="flex items-start gap-1.5 text-[11px] text-slate-600">
                        <span className="text-indigo-500 font-bold">✓</span>
                        <span className="line-clamp-2 leading-tight">{r}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 mt-4 space-y-2">
                  <div className="grid grid-cols-2 gap-1.5">
                    <button
                      type="button"
                      onClick={() => setDrawerCareer(career)}
                      className="py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[11px] transition-colors cursor-pointer"
                    >
                      View Details
                    </button>
                    <button
                      type="button"
                      onClick={() => handleOpenChallenge(career)}
                      className="py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-[11px] transition-colors cursor-pointer flex items-center justify-center gap-1"
                    >
                      <Play className="w-3 h-3 text-indigo-600" />
                      <span>Try 5-min</span>
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleExploreRoadmap(career.title)}
                    className="w-full py-2 rounded-xl bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 font-bold text-[11px] transition-colors cursor-pointer flex items-center justify-center gap-1"
                  >
                    <span>Explore Roadmap</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Other Possible Career Paths */}
          {otherCareers.length > 0 && (
            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-3">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Other Possible Career Paths
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                {otherCareers.map((c: any, idx: number) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col justify-between"
                  >
                    <div>
                      <span className="text-[10px] font-bold text-indigo-600">{c.matchScore}% Match</span>
                      <h5 className="text-xs font-bold text-slate-900 mt-1 line-clamp-1">{c.title}</h5>
                    </div>
                    <button
                      type="button"
                      onClick={() => setDrawerCareer(c)}
                      className="mt-2 text-[10.5px] font-bold text-slate-600 hover:text-indigo-600 text-left cursor-pointer inline-flex items-center gap-0.5"
                    >
                      <span>Explore</span>
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Direct Platform Integration Banners */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <div
              onClick={() => handleViewJobs(primaryCareer.title)}
              className="p-4 rounded-2xl bg-gradient-to-tr from-blue-50 to-indigo-50 border border-indigo-100 cursor-pointer hover:shadow-md transition-all flex items-center gap-3"
            >
              <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0">
                <Briefcase className="w-5 h-5" />
              </div>
              <div>
                <h5 className="text-xs font-bold text-slate-900">Explore Matching Jobs</h5>
                <p className="text-[10.5px] text-slate-500">View real openings matching your profile</p>
              </div>
            </div>

            <div
              onClick={() => handleTailorResume(primaryCareer.title)}
              className="p-4 rounded-2xl bg-gradient-to-tr from-purple-50 to-pink-50 border border-purple-100 cursor-pointer hover:shadow-md transition-all flex items-center gap-3"
            >
              <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center shrink-0">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h5 className="text-xs font-bold text-slate-900">Resume Studio</h5>
                <p className="text-[10.5px] text-slate-500">Tailor your resume for {primaryCareer.title}</p>
              </div>
            </div>

            <div
              onClick={() => handleMockInterview(primaryCareer.title)}
              className="p-4 rounded-2xl bg-gradient-to-tr from-emerald-50 to-teal-50 border border-emerald-100 cursor-pointer hover:shadow-md transition-all flex items-center gap-3"
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
                <MessageSquare className="w-5 h-5" />
              </div>
              <div>
                <h5 className="text-xs font-bold text-slate-900">AI Mock Interview</h5>
                <p className="text-[10.5px] text-slate-500">Practice questions for this role</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 1. Career Comparison Modal */}
      {showComparisonModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs" onClick={() => setShowComparisonModal(false)} />
          <div className="relative bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 z-10 space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold font-heading text-slate-900">Career Comparison</h3>
                <p className="text-xs text-slate-400">Side-by-side dimension requirements across your top matches</p>
              </div>
              <button
                type="button"
                onClick={() => setShowComparisonModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-400 hover:text-slate-600 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase">
                    <th className="py-2.5">Dimension</th>
                    <th className="py-2.5 text-indigo-600">{primaryCareer.title}</th>
                    {alternativeCareers.map((c: any, i: number) => (
                      <th key={i} className="py-2.5">{c.title}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  <tr>
                    <td className="py-2.5 font-bold text-slate-900">Problem Solving</td>
                    <td className="py-2.5 text-emerald-600 font-bold">High (90+)</td>
                    <td className="py-2.5">High (85+)</td>
                    <td className="py-2.5">Moderate (75+)</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 font-bold text-slate-900">Creativity & Design</td>
                    <td className="py-2.5">Moderate (60+)</td>
                    <td className="py-2.5">Moderate (65+)</td>
                    <td className="py-2.5 text-indigo-600 font-bold">High (85+)</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 font-bold text-slate-900">Data & Analytics</td>
                    <td className="py-2.5">High (80+)</td>
                    <td className="py-2.5 text-emerald-600 font-bold">Very High (92+)</td>
                    <td className="py-2.5">Moderate (70+)</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 font-bold text-slate-900">User / Stakeholder Focus</td>
                    <td className="py-2.5">Moderate (50+)</td>
                    <td className="py-2.5">High (70+)</td>
                    <td className="py-2.5 text-emerald-600 font-bold">Very High (90+)</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 font-bold text-slate-900">Expected Salary</td>
                    <td className="py-2.5 text-slate-900 font-bold">{primaryCareer.salaryRange}</td>
                    {alternativeCareers.map((c: any, i: number) => (
                      <td key={i} className="py-2.5 font-bold">{c.salaryRange}</td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setShowComparisonModal(false)}
                className="px-5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Assessment History Modal */}
      {showHistoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs" onClick={() => setShowHistoryModal(false)} />
          <div className="relative bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 z-10 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold font-heading text-slate-900">My Assessment History</h3>
                <p className="text-xs text-slate-400">Previous career discovery attempts and results</p>
              </div>
              <button
                type="button"
                onClick={() => setShowHistoryModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-400 hover:text-slate-600 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="max-h-80 overflow-y-auto space-y-2.5 pr-1">
              {historyList.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400">No previous attempts recorded yet.</div>
              ) : (
                historyList.map((h: any, idx: number) => (
                  <div key={idx} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-slate-900">
                        {h.recommendedCareers?.[0]?.title || "Career Assessment"}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        Field: {h.field} • {new Date(h.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-xl bg-indigo-50 text-indigo-700 font-bold text-[11px]">
                      {h.recommendedCareers?.[0]?.matchScore || 90}% Match
                    </span>
                  </div>
                ))
              )}
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-400 font-medium">Want to explore another field?</span>
              <button
                type="button"
                onClick={() => {
                  setShowHistoryModal(false);
                  handleRetakeClick();
                }}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition-colors cursor-pointer"
              >
                Retake Assessment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. 5-Minute Career Challenge Modal */}
      {showChallengeModal && selectedChallengeCareer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs" onClick={() => setShowChallengeModal(false)} />
          <div className="relative bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 z-10 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-lg bg-indigo-100 text-indigo-800 font-bold text-[10px]">
                  5-Minute Micro Challenge
                </span>
                <span className="text-xs font-bold text-slate-700">{selectedChallengeCareer.title}</span>
              </div>
              <button
                type="button"
                onClick={() => setShowChallengeModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-400 hover:text-slate-600 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {!challengeFeedback ? (
              <div className="space-y-4">
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
                  <h4 className="text-xs font-bold text-slate-900 leading-snug">
                    Scenario: You have 45 seconds to optimize an API endpoint with a 3-second database latency. What is your chosen first action?
                  </h4>
                  <div className="space-y-2 pt-1 text-xs">
                    {[
                      "Profile the database query to check for missing indexes",
                      "Add a Redis in-memory cache layer for frequent reads",
                      "Upgrade server hardware specs immediately",
                      "Rewrite the frontend UI to display an artificial delay"
                    ].map((opt, i) => (
                      <div
                        key={i}
                        onClick={() => setSelectedChallengeOption(opt)}
                        className={`p-3 rounded-xl border transition-all cursor-pointer ${
                          selectedChallengeOption === opt
                            ? "border-indigo-600 bg-indigo-50/60 font-bold text-indigo-900 shadow-xs"
                            : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                        }`}
                      >
                        {opt}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowChallengeModal(false)}
                    className="px-4 py-2 rounded-xl bg-slate-100 text-slate-600 font-bold text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={!selectedChallengeOption || evaluatingChallenge}
                    onClick={handleSubmitChallenge}
                    className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-sm transition-all"
                  >
                    {evaluatingChallenge ? "Evaluating..." : "Submit Answer"}
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-2">
                  <div className="flex items-center gap-2 text-emerald-800 font-bold text-xs">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Challenge Completed — Approach: {challengeFeedback.observedApproach}</span>
                  </div>
                  <p className="text-xs text-emerald-700 leading-relaxed">{challengeFeedback.keyTakeaway}</p>
                </div>

                <div className="space-y-1.5 text-xs text-slate-600">
                  <div className="font-bold text-slate-800">What to explore next:</div>
                  {challengeFeedback.nextSteps.map((step: string, i: number) => (
                    <div key={i} className="flex items-center gap-2">
                      <ChevronRight className="w-3.5 h-3.5 text-indigo-600" />
                      <span>{step}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowChallengeModal(false);
                      handleExploreRoadmap(selectedChallengeCareer.title);
                    }}
                    className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-sm"
                  >
                    Proceed to Roadmap
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 4. Career Details Drawer */}
      {drawerCareer && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs" onClick={() => setDrawerCareer(null)} />
          <div className="relative bg-white w-full max-w-md h-full p-6 shadow-2xl z-10 overflow-y-auto space-y-6">
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-0.5 rounded-lg bg-indigo-50 text-indigo-700 font-bold text-xs">
                {drawerCareer.department}
              </span>
              <button
                type="button"
                onClick={() => setDrawerCareer(null)}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-400 hover:text-slate-600 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <h2 className="text-xl font-black font-heading text-slate-900">{drawerCareer.title}</h2>
              <p className="text-xs font-bold text-emerald-600 mt-1">{drawerCareer.salaryRange}</p>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Required Key Skills</h4>
              <div className="flex flex-wrap gap-1.5">
                {(drawerCareer.keySkills || ["System Design", "Core Languages", "Databases", "APIs"]).map((s: string, i: number) => (
                  <span key={i} className="px-2.5 py-1 rounded-xl bg-slate-100 text-slate-700 text-xs font-semibold">
                    {s}
                  </span>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Why It Matches Your Footprint</h4>
              <div className="space-y-2">
                {(drawerCareer.whyMatches || []).map((w: string, i: number) => (
                  <div key={i} className="flex items-start gap-2 text-xs text-slate-600">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span>{w}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-6 border-t border-slate-100 space-y-2">
              <button
                type="button"
                onClick={() => {
                  setDrawerCareer(null);
                  handleExploreRoadmap(drawerCareer.title);
                }}
                className="w-full py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20"
              >
                Build Roadmap for {drawerCareer.title}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. Retake Assessment Confirmation Modal */}
      {showRetakeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs" onClick={() => setShowRetakeModal(false)} />
          <div className="relative bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-slate-200 z-10 space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                <RotateCcw className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold font-heading text-slate-900">Retake Career Assessment?</h3>
                <p className="text-xs text-slate-400">Your profile history is preserved</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
              Your current career profile and recommendations will remain securely saved in your <strong>Assessment History</strong>. 
              Starting a new assessment lets you explore new disciplines, recalculate your dimension footprint, and discover fresh career matches.
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-1">
              <button
                type="button"
                onClick={() => setShowRetakeModal(false)}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmRetake}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20 transition-all cursor-pointer inline-flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Yes, Start Fresh Test</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. Existing Roadmap Choice Modal */}
      {showExistingRoadmapModal && existingRoadmapData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs" onClick={() => setShowExistingRoadmapModal(false)} />
          <div className="relative bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-200 z-10 space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                  <Map className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold font-heading text-slate-900">Existing Roadmap Found</h3>
                  <p className="text-xs text-slate-400">{targetCareerForRoadmap}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowExistingRoadmapModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-400 hover:text-slate-600 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-900">{existingRoadmapData.careerTitle || targetCareerForRoadmap}</span>
                  <span className="px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 text-[10px] font-bold">
                    v{existingRoadmapData.version || 1}
                  </span>
                </div>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                  existingRoadmapData.status === 'Completed' ? 'bg-emerald-100 text-emerald-700' :
                  existingRoadmapData.status === 'Paused' ? 'bg-amber-100 text-amber-700' :
                  'bg-indigo-100 text-indigo-700'
                }`}>
                  {existingRoadmapData.status || 'In Progress'}
                </span>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between text-[11px] font-semibold text-slate-600">
                  <span>Current Progress</span>
                  <span className="font-bold text-indigo-600">{existingRoadmapData.percentComplete || 0}% Complete</span>
                </div>
                <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-indigo-600 rounded-full transition-all duration-500"
                    style={{ width: `${existingRoadmapData.percentComplete || 0}%` }}
                  />
                </div>
              </div>

              <p className="text-[11px] text-slate-500">
                You can continue your current progress on this roadmap or generate a completely new version (v{(existingRoadmapData.version || 1) + 1}) to track a fresh learning attempt.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-end gap-2.5 pt-1">
              <button
                type="button"
                onClick={() => setShowExistingRoadmapModal(false)}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCreateNewVersion}
                disabled={generatingRoadmap}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 font-bold text-xs border border-slate-200 transition-colors cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                <span>Create New Version (v{(existingRoadmapData.version || 1) + 1})</span>
              </button>
              <button
                type="button"
                onClick={handleContinueExisting}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20 transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <span>Continue Existing (v{existingRoadmapData.version || 1})</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
