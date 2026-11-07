import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Clock,
  Laptop,
  Database,
  Brain,
  Palette,
  Briefcase,
  Shield,
  Cpu,
  Settings,
  HelpCircle,
  Building,
  Home,
  Layers,
  RotateCcw,
  Check,
  ChevronRight,
  Timer,
  AlertCircle
} from "lucide-react";
import { useAuth } from "../context/auth-context";
import axios from "axios";

// Step definitions
const STEPS = [
  { id: 1, label: "Field", title: "Which field are you exploring?" },
  { id: 2, label: "Interests", title: "What activities interest you the most?" },
  { id: 3, label: "Scenarios", title: "Real-World Scenarios" },
  { id: 4, label: "Challenges", title: "Try a Career Challenge" },
  { id: 5, label: "Work Style", title: "Work Style & Environment" },
  { id: 6, label: "Values", title: "What matters most in your future career?" },
  { id: 7, label: "Details", title: "A few final details" },
  { id: 8, label: "Review", title: "Review Your Responses" },
];

export function AssessmentForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const [hasStarted, setHasStarted] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  // Assessment state
  const [selectedField, setSelectedField] = useState<string>("Technology & Software");
  const [selectedInterests, setSelectedInterests] = useState<string[]>([
    "Building things",
    "Solving puzzles",
    "Designing experiences"
  ]);

  // Scenarios state (6 scenarios)
  const [scenarioIndex, setScenarioIndex] = useState(0);
  const [scenarioAnswers, setScenarioAnswers] = useState<Record<number, string>>({
    0: "Investigate the code and identify what is causing the slowdown",
    1: "Interview key stakeholders and users to map their real pain points",
    2: "Dive into the error stack trace to reproduce and hotfix the defect",
    3: "Build a full-stack automated tool that saves teammates time"
  });

  // Mini Challenges state
  const [activeChallengeCategory, setActiveChallengeCategory] = useState<string>("Logic & Problem Solving");
  const [challengeAnswers, setChallengeAnswers] = useState<Record<string, string>>({
    "Logic & Problem Solving": "Sort products by number of purchases from the database"
  });
  const [challengeTimer, setChallengeTimer] = useState<number>(45);

  // Work Style state
  const [collaborationPreference, setCollaborationPreference] = useState<string>("Working in a team");
  const [workEnvironment, setWorkEnvironment] = useState<string>("Hybrid");

  // Career Values state
  const [selectedValues, setSelectedValues] = useState<string[]>([
    "High Salary",
    "Career Growth",
    "Continuous Learning"
  ]);
  const [tradeOff1, setTradeOff1] = useState<string>("Higher starting salary with steady growth");
  const [tradeOff2, setTradeOff2] = useState<string>("Working across diverse modern tech stacks");

  // Practical Constraints state
  const [educationLevel, setEducationLevel] = useState<string>("BTech / BE");
  const [currentYear, setCurrentYear] = useState<string>("3rd Year");
  const [investWeeklyHours, setInvestWeeklyHours] = useState<string>("5-10 hours");
  const [careerGoal, setCareerGoal] = useState<string>("Job after graduation");
  const [locationPreference, setLocationPreference] = useState<string>("Flexible");
  const [workModePreference, setWorkModePreference] = useState<string>("Open to all");

  const [checkingExisting, setCheckingExisting] = useState(true);

  // Check if user already has a completed assessment attempt in database
  useEffect(() => {
    let isMounted = true;
    async function checkExistingAssessment() {
      const searchParams = new URLSearchParams(location.search);
      const isRetake = location.state?.retake || searchParams.get("retake") === "true";
      if (isRetake) {
        setHasStarted(true);
        setCurrentStep(1);
        setCheckingExisting(false);
        return;
      }

      try {
        const res = await axios.get("http://localhost:5000/api/assessment/latest");
        if (isMounted && res.data && res.data.primaryCareer) {
          // User already completed assessment! Directly route to persistent results
          navigate("/results", { replace: true, state: { results: res.data } });
          return;
        }
      } catch {
        // No previous assessment in DB -> show first-time intro hero screen
      } finally {
        if (isMounted) setCheckingExisting(false);
      }
    }

    checkExistingAssessment();
    return () => {
      isMounted = false;
    };
  }, [location.state, navigate]);

  // Challenge timer countdown
  useEffect(() => {
    if (hasStarted && currentStep === 4 && challengeTimer > 0) {
      const interval = setInterval(() => {
        setChallengeTimer((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [hasStarted, currentStep, challengeTimer]);

  // Field definitions
  const FIELD_OPTIONS = [
    {
      id: "Technology & Software",
      label: "Technology & Software",
      icon: Laptop,
      color: "from-indigo-500 to-blue-600",
      desc: "Software, web, cloud & systems development"
    },
    {
      id: "Data & Analytics",
      label: "Data & Analytics",
      icon: Database,
      color: "from-cyan-500 to-teal-600",
      desc: "Data science, business intelligence & analytics"
    },
    {
      id: "AI & Machine Learning",
      label: "AI & Machine Learning",
      icon: Brain,
      color: "from-purple-500 to-indigo-600",
      desc: "Machine learning, LLMs & intelligent algorithms"
    },
    {
      id: "Design & UX",
      label: "Design & UX",
      icon: Palette,
      color: "from-pink-500 to-rose-600",
      desc: "User experience, visual design & product aesthetics"
    },
    {
      id: "Business & Management",
      label: "Business & Management",
      icon: Briefcase,
      color: "from-amber-500 to-orange-600",
      desc: "Product management, tech consulting & analysis"
    },
    {
      id: "Cybersecurity",
      label: "Cybersecurity",
      icon: Shield,
      color: "from-emerald-500 to-green-600",
      desc: "Network security, threat defense & ethical hacking"
    },
    {
      id: "Core Engineering",
      label: "Core Engineering",
      icon: Settings,
      color: "from-blue-600 to-slate-700",
      desc: "Mechanical, robotics, automation & infrastructure"
    },
    {
      id: "Electronics & Embedded",
      label: "Electronics & Embedded",
      icon: Cpu,
      color: "from-violet-500 to-purple-700",
      desc: "IoT, microcontrollers, VLSI & firmware engineering"
    },
  ];

  // Interest options
  const INTEREST_OPTIONS = [
    { id: "Building things", label: "Building things", desc: "Create and develop applications or systems", icon: "code" },
    { id: "Solving puzzles", label: "Solving puzzles", desc: "Debug, analyze, and find solutions", icon: "extension" },
    { id: "Working with numbers", label: "Working with numbers", desc: "Analyze data and find patterns", icon: "bar_chart" },
    { id: "Designing experiences", label: "Designing experiences", desc: "Create user-friendly interfaces", icon: "palette" },
    { id: "Understanding people", label: "Understanding people", desc: "Work with users and teams", icon: "group" },
    { id: "Researching", label: "Researching", desc: "Explore new technologies and ideas", icon: "search" },
    { id: "Investigating problems", label: "Investigating problems", desc: "Find and solve complex issues", icon: "troubleshoot" },
    { id: "Explaining ideas", label: "Explaining ideas", desc: "Teach and communicate concepts", icon: "record_voice_over" },
    { id: "Leading teams", label: "Leading teams", desc: "Manage and guide people", icon: "military_tech" },
    { id: "Creating new ideas", label: "Creating new ideas", desc: "Think creatively and innovate", icon: "lightbulb" },
    { id: "Working with machines", label: "Working with machines", desc: "Hardware, devices and automation", icon: "precision_manufacturing" },
    { id: "Making decisions", label: "Making decisions", desc: "Plan and strategize", icon: "crisis_alert" },
  ];

  // Real-world scenarios list
  const SCENARIOS = [
    {
      title: "Scenario 1: System Slowdown",
      situation: "Your team discovers that an application has suddenly become very slow. What would you naturally want to do first?",
      options: [
        { label: "Investigate the code and identify what is causing the slowdown", trait: "Technical & Problem Solving" },
        { label: "Analyze the usage data to find where performance dropped", trait: "Analytical & Data Focus" },
        { label: "Talk to users to understand what they are experiencing", trait: "User Empathy & People Orientation" },
        { label: "Redesign the interface so the problem is easier to avoid", trait: "Creativity & UX Design" }
      ]
    },
    {
      title: "Scenario 2: Vague Requirements",
      situation: "You are asked to deliver a new product feature with vague stakeholder guidelines. What is your immediate approach?",
      options: [
        { label: "Interview key stakeholders and users to map their real pain points", trait: "Stakeholder Leadership" },
        { label: "Prototype several UI/UX concepts to get immediate visual feedback", trait: "Creative Prototyping" },
        { label: "Write a technical architecture spec and define the API contract", trait: "Systems Architecture" },
        { label: "Analyze historical metrics and competitor solutions for benchmarks", trait: "Quantitative Research" }
      ]
    },
    {
      title: "Scenario 3: Release Day Dilemma",
      situation: "A critical bug is reported 1 hour before a scheduled major product deployment. How do you respond?",
      options: [
        { label: "Dive into the error stack trace to reproduce and hotfix the defect", trait: "Hands-on Debugging" },
        { label: "Assess business risk and release rollback procedures with team leads", trait: "Strategic Decision Making" },
        { label: "Verify telemetry logs to measure exact customer blast radius", trait: "Data Verification" },
        { label: "Draft transparent release communication for support and clients", trait: "Clear Communication" }
      ]
    },
    {
      title: "Scenario 4: Hackathon Freedom",
      situation: "You have complete creative freedom for a 2-day team hackathon. What type of project excites you most?",
      options: [
        { label: "Build a full-stack automated tool that saves teammates hours of work", trait: "Practical Full-Stack Builder" },
        { label: "Train and evaluate an intelligent machine learning prediction model", trait: "AI / Data Science" },
        { label: "Craft an ultra-sleek, delightful design system with micro-interactions", trait: "UI/UX & Product Design" },
        { label: "Develop a high-impact business pitch and interactive customer demo", trait: "Product Management & Growth" }
      ]
    }
  ];

  // Mini career challenge definitions
  const CAREER_CHALLENGES: Record<string, { prompt: string; options: string[] }> = {
    "Logic & Problem Solving": {
      prompt: "You are building a feature to show the most popular products on an e-commerce website. Which approach would you choose first?",
      options: [
        "Sort products by number of purchases from the database",
        "Track product views and show most viewed",
        "Ask users which products they like",
        "Show recently added products"
      ]
    },
    "Data Interpretation": {
      prompt: "A dashboard displays daily active users dropped 25% on mobile while desktop stayed flat. What is your first hypothesis?",
      options: [
        "A recent mobile app update introduced a crash or login blocker",
        "User preferences suddenly changed overnight",
        "Desktop servers received better cloud bandwidth",
        "Marketing campaigns are favoring desktop ads"
      ]
    },
    "Design & UX": {
      prompt: "Users report getting confused when trying to check out. How do you improve the checkout flow?",
      options: [
        "Implement a clear multi-step progress bar and reduce clutter",
        "Add more decorative icons and promotional banners",
        "Require user registration before allowing cart preview",
        "Combine all 12 input forms onto a single long webpage"
      ]
    },
    "Planning & Prioritization": {
      prompt: "Your sprint backlog has 4 items. The client deadline is in 3 days. What do you prioritize?",
      options: [
        "Ship the core essential MVP workflow with zero bugs",
        "Try to deliver all 4 items even if untested",
        "Delay the entire sprint by 2 weeks without notice",
        "Work only on the visual theme and postpone functionality"
      ]
    }
  };

  // Career values list
  const CAREER_VALUES = [
    { id: "High Salary", label: "High Salary", icon: "payments" },
    { id: "Career Growth", label: "Career Growth", icon: "trending_up" },
    { id: "Continuous Learning", label: "Continuous Learning", icon: "school" },
    { id: "Work-Life Balance", label: "Work-Life Balance", icon: "balance" },
    { id: "Remote Flexibility", label: "Remote Flexibility", icon: "home_work" },
    { id: "Job Stability", label: "Job Stability", icon: "security" },
    { id: "Creativity", label: "Creativity", icon: "brush" },
    { id: "Research & Innovation", label: "Research & Innovation", icon: "science" },
    { id: "Leadership", label: "Leadership", icon: "supervisor_account" },
    { id: "Social Impact", label: "Social Impact", icon: "volunteer_activism" },
    { id: "International Opportunities", label: "International Opportunities", icon: "public" },
    { id: "Entrepreneurship", label: "Entrepreneurship", icon: "rocket_launch" },
  ];

  // Toggle interest helper
  const toggleInterest = (interest: string) => {
    if (selectedInterests.includes(interest)) {
      if (selectedInterests.length > 1) {
        setSelectedInterests(selectedInterests.filter((i) => i !== interest));
      }
    } else {
      if (selectedInterests.length < 5) {
        setSelectedInterests([...selectedInterests, interest]);
      }
    }
  };

  // Toggle value helper
  const toggleValue = (value: string) => {
    if (selectedValues.includes(value)) {
      if (selectedValues.length > 1) {
        setSelectedValues(selectedValues.filter((v) => v !== value));
      }
    } else {
      if (selectedValues.length < 4) {
        setSelectedValues([...selectedValues, value]);
      }
    }
  };

  // Navigation handlers
  const handleNext = () => {
    if (currentStep < 8) {
      setCurrentStep(currentStep + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      setHasStarted(false);
    }
  };

  // Submit complete assessment
  const handleGenerateResults = async () => {
    setSubmitting(true);
    try {
      const payload = {
        field: selectedField,
        interests: selectedInterests,
        scenarios: Object.entries(scenarioAnswers).map(([idx, ans]) => ({
          scenarioId: `sc-${idx}`,
          question: SCENARIOS[parseInt(idx)]?.situation || `Scenario ${idx}`,
          selectedOption: ans,
          traitImpact: [SCENARIOS[parseInt(idx)]?.options.find((o) => o.label === ans)?.trait || "Problem Solving"]
        })),
        challenges: Object.entries(challengeAnswers).map(([cat, ans]) => ({
          challengeId: `ch-${cat}`,
          category: cat,
          chosenOption: ans,
          timeSpentSeconds: 45 - challengeTimer,
          isOptimal: true
        })),
        workStyle: {
          collaboration: collaborationPreference.includes("team") ? "Team" : "Independent",
          environment: workEnvironment,
          structure: "Balanced"
        },
        careerValues: selectedValues,
        tradeOffs: [
          { question: "Salary vs Learning", choice: tradeOff1 },
          { question: "Depth vs Breadth", choice: tradeOff2 }
        ],
        constraints: {
          educationLevel,
          currentYear,
          weeklyHours: investWeeklyHours,
          careerGoal,
          locationPreference,
          workMode: workModePreference
        }
      };

      // Call dedicated assessment engine
      const res = await axios.post("http://localhost:5000/api/assessment/submit", payload);

      // Save to localStorage as well for fast client navigation
      localStorage.setItem("saved_career_results", JSON.stringify(res.data));

      navigate("/results", { state: { results: res.data } });
    } catch (err) {
      console.error("Error submitting assessment:", err);
      // Fallback: navigate to results
      navigate("/results");
    } finally {
      setSubmitting(false);
    }
  };

  // Show loading spinner while checking for existing assessment
  if (checkingExisting) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="bg-white rounded-3xl p-10 text-center border border-slate-200/80 shadow-xs max-w-sm w-full space-y-3">
          <span className="material-symbols-outlined animate-spin text-indigo-600 text-[32px]">
            sync
          </span>
          <h3 className="text-sm font-bold text-slate-900">Loading Career Discovery</h3>
          <p className="text-xs text-slate-400">Checking your profile and assessment history...</p>
        </div>
      </div>
    );
  }

  // Render Hero Intro Screen
  if (!hasStarted) {
    return (
      <div className="min-h-[85vh] flex items-center justify-center py-10 px-4">
        <div className="max-w-4xl w-full bg-white rounded-3xl border border-slate-200/80 shadow-xl overflow-hidden p-8 sm:p-12 relative">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-bold">
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                <span>AI-Powered Career Discovery</span>
              </div>

              <div>
                <h1 className="text-3xl sm:text-4xl font-black font-heading text-slate-900 tracking-tight leading-tight">
                  Discover Your Career Direction
                </h1>
                <p className="text-sm text-slate-600 mt-3 leading-relaxed">
                  A scientific, personalized assessment to help you find careers that truly match your interests, strengths, work style, and practical goals.
                </p>
              </div>

              <div className="space-y-2.5 pt-2">
                {[
                  "Discover your natural strengths & problem-solving instincts",
                  "Explore real-world workplace scenarios & mini challenges",
                  "Receive transparent career matches with evidence",
                  "Directly connect your results to a custom learning roadmap"
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-2.5 text-xs text-slate-700 font-medium">
                    <div className="w-5 h-5 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    </div>
                    <span>{item}</span>
                  </div>
                ))}
              </div>

              <div className="pt-4 flex flex-col sm:flex-row sm:items-center gap-4">
                <button
                  type="button"
                  onClick={() => setHasStarted(true)}
                  className="px-6 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-lg shadow-indigo-600/25 transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <span>Start Career Test</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <div className="flex items-center gap-1.5 text-xs text-slate-400 font-semibold">
                  <Clock className="w-4 h-4 text-slate-400" />
                  <span>Takes 8–10 minutes</span>
                </div>
              </div>
            </div>

            {/* Right Graphic Card */}
            <div className="lg:col-span-5 flex flex-col items-center justify-center relative">
              <div className="w-full aspect-square max-w-[280px] rounded-3xl bg-gradient-to-tr from-indigo-100/80 via-purple-50 to-pink-50 border border-indigo-100 flex items-center justify-center relative p-6 shadow-inner">
                <div className="w-24 h-24 rounded-3xl bg-indigo-600 text-white flex items-center justify-center shadow-xl shadow-indigo-600/30">
                  <Brain className="w-12 h-12" />
                </div>

                {/* Floating Chips */}
                <div className="absolute top-4 left-2 px-3 py-1.5 rounded-xl bg-white shadow-md border border-slate-100 text-[11px] font-bold text-indigo-600 flex items-center gap-1.5 animate-bounce">
                  <Sparkles className="w-3 h-3 text-amber-500" />
                  <span>Skills</span>
                </div>
                <div className="absolute bottom-6 left-4 px-3 py-1.5 rounded-xl bg-white shadow-md border border-slate-100 text-[11px] font-bold text-purple-600 flex items-center gap-1.5">
                  <Palette className="w-3 h-3 text-pink-500" />
                  <span>Personality</span>
                </div>
                <div className="absolute top-8 right-2 px-3 py-1.5 rounded-xl bg-white shadow-md border border-slate-100 text-[11px] font-bold text-emerald-600 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                  <span>Goals</span>
                </div>
                <div className="absolute bottom-10 right-4 px-3 py-1.5 rounded-xl bg-white shadow-md border border-slate-100 text-[11px] font-bold text-cyan-600 flex items-center gap-1.5">
                  <Briefcase className="w-3 h-3 text-cyan-500" />
                  <span>Interests</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const currentStepMeta = STEPS[currentStep - 1];
  const progressPercent = Math.round((currentStep / 8) * 100);

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 space-y-6 pb-20">
      {/* Top Header & Progress */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-black text-xs">
              CC
            </div>
            <div>
              <div className="text-xs font-bold text-slate-800">Career Compass Discovery</div>
              <div className="text-[11px] text-slate-400">Personalized Trajectory Assessment</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-indigo-600">
              Step {currentStep} of 8
            </span>
            <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 font-bold text-[10px]">
              {progressPercent}% Complete
            </span>
          </div>
        </div>

        {/* Progress Line */}
        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-indigo-600 rounded-full"
            initial={{ width: `${((currentStep - 1) / 8) * 100}%` }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>

        {/* Step Chips */}
        <div className="hidden sm:flex items-center justify-between text-[11px] font-bold text-slate-400 pt-1">
          {STEPS.map((s) => (
            <span
              key={s.id}
              className={`cursor-pointer transition-colors ${
                s.id === currentStep
                  ? "text-indigo-600 font-extrabold"
                  : s.id < currentStep
                  ? "text-slate-700"
                  : "text-slate-300"
              }`}
              onClick={() => {
                if (s.id < currentStep) setCurrentStep(s.id);
              }}
            >
              {s.id}. {s.label}
            </span>
          ))}
        </div>
      </div>

      {/* Main Interactive Question Canvas */}
      <motion.div
        key={currentStep}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -12 }}
        transition={{ duration: 0.25 }}
        className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6"
      >
        {/* Step Title & Subtitle */}
        <div>
          <div className="text-[11px] font-bold tracking-wider uppercase text-indigo-600">
            Step {currentStep} of 8
          </div>
          <h2 className="text-xl sm:text-2xl font-black font-heading text-slate-900 mt-1">
            {currentStepMeta.title}
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            {currentStep === 1 && "Choose an area you're interested in. We'll help you discover roles within it. You can change this later."}
            {currentStep === 2 && "Select 3–5 activities that you would enjoy spending time on."}
            {currentStep === 3 && "Choose the option that feels most natural to you. There are no right or wrong answers."}
            {currentStep === 4 && "A short, interactive task to observe your problem-solving approach. This is not a technical exam."}
            {currentStep === 5 && "Choose the work environments and collaboration styles that suit you best."}
            {currentStep === 6 && "Select up to 4 priorities and balance key career trade-offs."}
            {currentStep === 7 && "This helps us personalize your matches and learning roadmap."}
            {currentStep === 8 && "Take a quick look at your selections before we compute your results."}
          </p>
        </div>

        {/* STEP 1: FIELD SELECTION */}
        {currentStep === 1 && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3.5">
              {FIELD_OPTIONS.map((f) => {
                const IconComponent = f.icon;
                const isSelected = selectedField === f.id;
                return (
                  <div
                    key={f.id}
                    onClick={() => setSelectedField(f.id)}
                    className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between text-left hover:shadow-md ${
                      isSelected
                        ? "border-indigo-600 bg-indigo-50/40 shadow-xs"
                        : "border-slate-200 bg-slate-50/50 hover:border-slate-300"
                    }`}
                  >
                    <div>
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 bg-gradient-to-tr ${f.color} text-white shadow-sm`}
                      >
                        <IconComponent className="w-5 h-5" />
                      </div>
                      <h3 className="text-xs font-bold font-heading text-slate-900 leading-snug">
                        {f.label}
                      </h3>
                      <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                        {f.desc}
                      </p>
                    </div>

                    <div className="mt-4 flex items-center justify-between pt-2 border-t border-slate-100">
                      <span className={`text-[10px] font-bold ${isSelected ? "text-indigo-600" : "text-slate-400"}`}>
                        {isSelected ? "Selected ✓" : "Explore"}
                      </span>
                      <div
                        className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                          isSelected ? "border-indigo-600 bg-indigo-600 text-white" : "border-slate-300"
                        }`}
                      >
                        {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* "I'm not sure yet" Card */}
            <div
              onClick={() => setSelectedField("I'm not sure yet")}
              className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between hover:shadow-md ${
                selectedField === "I'm not sure yet"
                  ? "border-indigo-600 bg-indigo-50/50 shadow-xs"
                  : "border-dashed border-slate-300 bg-white hover:border-slate-400"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center">
                  <HelpCircle className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-800">I'm not sure yet</h4>
                  <p className="text-[11px] text-slate-500">Show me all fields and evaluate across the entire career universe</p>
                </div>
              </div>
              <div
                className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                  selectedField === "I'm not sure yet"
                    ? "border-indigo-600 bg-indigo-600 text-white"
                    : "border-slate-300"
                }`}
              >
                {selectedField === "I'm not sure yet" && <Check className="w-3 h-3 stroke-[3]" />}
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: INTEREST DISCOVERY */}
        {currentStep === 2 && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5">
              {INTEREST_OPTIONS.map((item) => {
                const isSelected = selectedInterests.includes(item.id);
                return (
                  <div
                    key={item.id}
                    onClick={() => toggleInterest(item.id)}
                    className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between text-left hover:shadow-md ${
                      isSelected
                        ? "border-indigo-600 bg-indigo-50/40 shadow-xs"
                        : "border-slate-200 bg-slate-50/40 hover:border-slate-300"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2.5">
                        <span className="material-symbols-outlined text-indigo-600 text-[22px]">
                          {item.icon}
                        </span>
                        <div
                          className={`w-4 h-4 rounded-md border flex items-center justify-center ${
                            isSelected ? "border-indigo-600 bg-indigo-600 text-white" : "border-slate-300 bg-white"
                          }`}
                        >
                          {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                      </div>
                      <h4 className="text-xs font-bold text-slate-900">{item.label}</h4>
                      <p className="text-[11px] text-slate-500 mt-1 leading-snug">{item.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Selection Counter */}
            <div className="flex items-center justify-between pt-2 text-xs font-semibold text-slate-500">
              <span>Choose between 3 and 5 activities that sound fun</span>
              <span className="text-indigo-600 font-bold">{selectedInterests.length} of 5 selected</span>
            </div>
          </div>
        )}

        {/* STEP 3: REAL-WORLD SCENARIOS */}
        {currentStep === 3 && (
          <div className="space-y-6">
            {/* Scenario Navigation Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {SCENARIOS.map((sc, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setScenarioIndex(idx)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                    scenarioIndex === idx
                      ? "bg-indigo-600 text-white shadow-xs"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  Scenario {idx + 1} {scenarioAnswers[idx] ? "✓" : ""}
                </button>
              ))}
            </div>

            {/* Active Scenario Card */}
            <div className="bg-slate-50/80 rounded-3xl p-6 border border-slate-200 space-y-5">
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 rounded-lg bg-indigo-100 text-indigo-700 font-bold text-xs">
                  {SCENARIOS[scenarioIndex].title}
                </span>
                <span className="text-xs text-slate-400 font-semibold">
                  {scenarioIndex + 1} of {SCENARIOS.length}
                </span>
              </div>

              <h3 className="text-sm sm:text-base font-bold text-slate-900 leading-snug">
                {SCENARIOS[scenarioIndex].situation}
              </h3>

              {/* 4 Choices */}
              <div className="space-y-2.5">
                {SCENARIOS[scenarioIndex].options.map((opt, optIdx) => {
                  const isSelected = scenarioAnswers[scenarioIndex] === opt.label;
                  return (
                    <div
                      key={optIdx}
                      onClick={() => setScenarioAnswers({ ...scenarioAnswers, [scenarioIndex]: opt.label })}
                      className={`p-3.5 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between ${
                        isSelected
                          ? "border-indigo-600 bg-white shadow-xs text-indigo-900"
                          : "border-slate-200 bg-white hover:border-slate-300 text-slate-700"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${
                            isSelected ? "border-indigo-600 bg-indigo-600 text-white" : "border-slate-300"
                          }`}
                        >
                          {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                        <span className="text-xs font-medium">{opt.label}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Quick Next Scenario Button */}
            {scenarioIndex < SCENARIOS.length - 1 && (
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setScenarioIndex(scenarioIndex + 1)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors inline-flex items-center gap-1 cursor-pointer"
                >
                  <span>Next Scenario</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        )}

        {/* STEP 4: MINI CAREER CHALLENGES */}
        {currentStep === 4 && (
          <div className="space-y-5">
            {/* Category Selector */}
            <div className="flex flex-wrap items-center gap-2">
              {Object.keys(CAREER_CHALLENGES).map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setActiveChallengeCategory(cat)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    activeChallengeCategory === cat
                      ? "bg-indigo-600 text-white shadow-xs"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Challenge Card */}
            <div className="bg-slate-50 rounded-3xl p-6 border border-slate-200 space-y-4">
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 rounded-lg bg-amber-100 text-amber-800 font-bold text-xs">
                  {activeChallengeCategory}
                </span>
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white border border-slate-200 text-xs font-bold text-slate-700 shadow-xs">
                  <Timer className="w-3.5 h-3.5 text-indigo-600" />
                  <span>0:{challengeTimer < 10 ? `0${challengeTimer}` : challengeTimer}</span>
                </div>
              </div>

              <h3 className="text-sm font-bold text-slate-900 leading-snug">
                {CAREER_CHALLENGES[activeChallengeCategory]?.prompt}
              </h3>

              {/* Options */}
              <div className="space-y-2.5">
                {CAREER_CHALLENGES[activeChallengeCategory]?.options.map((opt, i) => {
                  const isSelected = challengeAnswers[activeChallengeCategory] === opt;
                  return (
                    <div
                      key={i}
                      onClick={() =>
                        setChallengeAnswers({ ...challengeAnswers, [activeChallengeCategory]: opt })
                      }
                      className={`p-3.5 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between ${
                        isSelected
                          ? "border-indigo-600 bg-white shadow-xs text-indigo-900"
                          : "border-slate-200 bg-white hover:border-slate-300 text-slate-700"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${
                            isSelected ? "border-indigo-600 bg-indigo-600 text-white" : "border-slate-300"
                          }`}
                        >
                          {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                        <span className="text-xs font-medium">{opt}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* STEP 5: WORK STYLE & ENVIRONMENT */}
        {currentStep === 5 && (
          <div className="space-y-6">
            <div>
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Which situation feels more comfortable?
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div
                  onClick={() => setCollaborationPreference("Working independently")}
                  className={`p-5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                    collaborationPreference === "Working independently"
                      ? "border-indigo-600 bg-indigo-50/50 shadow-xs"
                      : "border-slate-200 bg-slate-50/50 hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">Working independently</h4>
                      <p className="text-[11px] text-slate-500 mt-0.5">I enjoy figuring things out and deep focus on my own.</p>
                    </div>
                    <div
                      className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${
                        collaborationPreference === "Working independently"
                          ? "border-indigo-600 bg-indigo-600 text-white"
                          : "border-slate-300"
                      }`}
                    >
                      {collaborationPreference === "Working independently" && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                  </div>
                </div>

                <div
                  onClick={() => setCollaborationPreference("Working in a team")}
                  className={`p-5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                    collaborationPreference === "Working in a team"
                      ? "border-indigo-600 bg-indigo-50/50 shadow-xs"
                      : "border-slate-200 bg-slate-50/50 hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">Working in a team</h4>
                      <p className="text-[11px] text-slate-500 mt-0.5">I enjoy collaborating, whiteboarding, and discussing with others.</p>
                    </div>
                    <div
                      className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${
                        collaborationPreference === "Working in a team"
                          ? "border-indigo-600 bg-indigo-600 text-white"
                          : "border-slate-300"
                      }`}
                    >
                      {collaborationPreference === "Working in a team" && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Preferred Work Environment
              </h4>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: "Office", label: "Office", icon: Building },
                  { id: "Remote", label: "Remote", icon: Home },
                  { id: "Hybrid", label: "Hybrid", icon: Layers },
                ].map((env) => {
                  const IconComp = env.icon;
                  const isSelected = workEnvironment === env.id;
                  return (
                    <div
                      key={env.id}
                      onClick={() => setWorkEnvironment(env.id)}
                      className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col items-center justify-center gap-2 ${
                        isSelected
                          ? "border-indigo-600 bg-indigo-50/50 text-indigo-700 shadow-xs"
                          : "border-slate-200 bg-slate-50/50 text-slate-700 hover:border-slate-300"
                      }`}
                    >
                      <IconComp className="w-5 h-5" />
                      <span className="text-xs font-bold">{env.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* STEP 6: CAREER VALUES */}
        {currentStep === 6 && (
          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Select up to 4 priorities
                </span>
                <span className="text-xs font-bold text-indigo-600">{selectedValues.length} of 4 selected</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {CAREER_VALUES.map((val) => {
                  const isSelected = selectedValues.includes(val.id);
                  return (
                    <div
                      key={val.id}
                      onClick={() => toggleValue(val.id)}
                      className={`p-3.5 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between ${
                        isSelected
                          ? "border-indigo-600 bg-indigo-50/50 shadow-xs"
                          : "border-slate-200 bg-slate-50/40 hover:border-slate-300"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-indigo-600 text-[18px]">
                          {val.icon}
                        </span>
                        <span className="text-xs font-bold text-slate-800">{val.label}</span>
                      </div>
                      <div
                        className={`w-4 h-4 rounded-md border flex items-center justify-center shrink-0 ${
                          isSelected ? "border-indigo-600 bg-indigo-600 text-white" : "border-slate-300 bg-white"
                        }`}
                      >
                        {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Trade-off Dilemmas */}
            <div className="pt-2 space-y-4">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Career Trade-Off Preferences
              </h4>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <span className="text-xs font-bold text-slate-800">Compensation vs Growth Pace:</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {[
                    "Higher starting salary with steady growth",
                    "Lower starting salary with accelerated learning curve"
                  ].map((opt, i) => (
                    <div
                      key={i}
                      onClick={() => setTradeOff1(opt)}
                      className={`p-3 rounded-xl border transition-all cursor-pointer ${
                        tradeOff1 === opt
                          ? "border-indigo-600 bg-white font-bold text-indigo-700 shadow-xs"
                          : "border-slate-200 bg-white/70 text-slate-600 hover:border-slate-300"
                      }`}
                    >
                      {opt}
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <span className="text-xs font-bold text-slate-800">Depth vs Diversity:</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {[
                    "Specializing deeply in one core domain/system",
                    "Working across diverse modern tech stacks"
                  ].map((opt, i) => (
                    <div
                      key={i}
                      onClick={() => setTradeOff2(opt)}
                      className={`p-3 rounded-xl border transition-all cursor-pointer ${
                        tradeOff2 === opt
                          ? "border-indigo-600 bg-white font-bold text-indigo-700 shadow-xs"
                          : "border-slate-200 bg-white/70 text-slate-600 hover:border-slate-300"
                      }`}
                    >
                      {opt}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 7: PRACTICAL CONSTRAINTS */}
        {currentStep === 7 && (
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Current Education Level</label>
                <select
                  value={educationLevel}
                  onChange={(e) => setEducationLevel(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none focus:border-indigo-500"
                >
                  <option value="BTech / BE">BTech / BE</option>
                  <option value="BCA / MCA">BCA / MCA</option>
                  <option value="BSc / MSc (CS / IT)">BSc / MSc (CS / IT)</option>
                  <option value="MTech">MTech</option>
                  <option value="Other Degree">Other Degree</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Current Year</label>
                <select
                  value={currentYear}
                  onChange={(e) => setCurrentYear(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none focus:border-indigo-500"
                >
                  <option value="1st Year">1st Year</option>
                  <option value="2nd Year">2nd Year</option>
                  <option value="3rd Year">3rd Year</option>
                  <option value="4th Year">4th Year</option>
                  <option value="Graduated">Graduated / Working</option>
                </select>
              </div>
            </div>

            <div className="pt-2">
              <label className="block font-bold text-slate-700 mb-1.5">How many hours can you invest weekly?</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {["< 5 hours", "5-10 hours", "10-15 hours", "15+ hours"].map((hrs) => (
                  <button
                    key={hrs}
                    type="button"
                    onClick={() => setInvestWeeklyHours(hrs)}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                      investWeeklyHours === hrs
                        ? "border-indigo-600 bg-indigo-50 text-indigo-700 shadow-xs"
                        : "border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300"
                    }`}
                  >
                    {hrs}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-2">
              <label className="block font-bold text-slate-700 mb-1.5">What is your preferred career path?</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {[
                  "Job after graduation",
                  "Higher studies",
                  "Entrepreneurship",
                  "Not sure yet"
                ].map((goal) => (
                  <button
                    key={goal}
                    type="button"
                    onClick={() => setCareerGoal(goal)}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                      careerGoal === goal
                        ? "border-indigo-600 bg-indigo-50 text-indigo-700 shadow-xs"
                        : "border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300"
                    }`}
                  >
                    {goal}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Location Preference</label>
                <select
                  value={locationPreference}
                  onChange={(e) => setLocationPreference(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none focus:border-indigo-500"
                >
                  <option value="Flexible">Flexible (Any Metro)</option>
                  <option value="Bangalore">Bangalore</option>
                  <option value="Mumbai">Mumbai</option>
                  <option value="Delhi NCR">Delhi NCR</option>
                  <option value="Hyderabad">Hyderabad</option>
                  <option value="Pune">Pune</option>
                  <option value="Chennai">Chennai</option>
                  <option value="Remote Only">Remote Only</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Work Mode Preference</label>
                <select
                  value={workModePreference}
                  onChange={(e) => setWorkModePreference(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none focus:border-indigo-500"
                >
                  <option value="Open to all">Open to all</option>
                  <option value="Remote preferred">Remote preferred</option>
                  <option value="Hybrid preferred">Hybrid preferred</option>
                  <option value="On-site only">On-site only</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* STEP 8: REVIEW YOUR RESPONSES */}
        {currentStep === 8 && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-700">Explored Field:</span>
                  <button type="button" onClick={() => setCurrentStep(1)} className="text-indigo-600 font-bold hover:underline">Edit</button>
                </div>
                <p className="text-slate-900 font-extrabold">{selectedField}</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-700">Top Activities:</span>
                  <button type="button" onClick={() => setCurrentStep(2)} className="text-indigo-600 font-bold hover:underline">Edit</button>
                </div>
                <p className="text-slate-900 font-extrabold">{selectedInterests.join(", ")}</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-700">Work Style:</span>
                  <button type="button" onClick={() => setCurrentStep(5)} className="text-indigo-600 font-bold hover:underline">Edit</button>
                </div>
                <p className="text-slate-900 font-extrabold">{collaborationPreference} ({workEnvironment})</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-700">Top Career Values:</span>
                  <button type="button" onClick={() => setCurrentStep(6)} className="text-indigo-600 font-bold hover:underline">Edit</button>
                </div>
                <p className="text-slate-900 font-extrabold">{selectedValues.join(", ")}</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1 sm:col-span-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-700">Practical Constraints:</span>
                  <button type="button" onClick={() => setCurrentStep(7)} className="text-indigo-600 font-bold hover:underline">Edit</button>
                </div>
                <p className="text-slate-900 font-extrabold">
                  {educationLevel} ({currentYear}) • {investWeeklyHours} weekly • Goal: {careerGoal} • {locationPreference}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Action Footer Bar */}
        <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
          <button
            type="button"
            onClick={handleBack}
            className="px-5 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{currentStep === 1 ? "Exit" : "Back"}</span>
          </button>

          {currentStep < 8 ? (
            <button
              type="button"
              onClick={handleNext}
              className="px-6 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20 transition-all cursor-pointer flex items-center gap-1.5"
            >
              <span>Next</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              type="button"
              disabled={submitting}
              onClick={handleGenerateResults}
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition-all cursor-pointer flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>{submitting ? "Analyzing Your Signals..." : "Generate My Career Results"}</span>
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
}
