import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, useLocation } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
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
  RotateCcw,
  Check,
  ChevronRight,
  Timer,
  AlertCircle,
  Wrench,
  Zap,
  FlaskConical,
  Compass,
  Code,
  Factory,
  GraduationCap,
  Globe,
  Award,
  Atom,
  Search,
  Plus,
  Trash2,
  SlidersHorizontal,
  BookmarkCheck,
  Layers,
  ChevronDown
} from "lucide-react";
import { useAuth } from "../context/auth-context";
import axios from "axios";
import {
  ENGINEERING_BRANCHES,
  ACADEMIC_YEARS,
  ACADEMIC_STRENGTHS_OPTIONS,
  CAREER_DIRECTIONS,
  getAdaptiveConfig,
  constructCanonicalV8Profile,
  CareerDirectionConfig
} from "../data/adaptiveAssessmentEngine";

// Step navigation definitions
const STEPS = [
  { id: 1, label: "Control Centre", title: "Academic Background & Intended Career Direction" },
  { id: 2, label: "Interests", title: "Domain Interests & Explorations" },
  { id: 3, label: "Scenarios", title: "Adaptive Real-World Engineering Scenarios" },
  { id: 4, label: "Challenges", title: "Problem-Solving & Technical Focus" },
  { id: 5, label: "Work Style", title: "Environment & Physical Workplace" },
  { id: 6, label: "Values & Sectors", title: "Career Priorities & Target Sectors" },
  { id: 7, label: "Skills & Goals", title: "Possessed Capabilities & Learning Roadmap" },
  { id: 8, label: "Review & AI", title: "Review Canonical Profile & Run V8 AI Engine" },
];

// Cognitive Problem-Solving Styles
const PROBLEM_SOLVING_STYLES = [
  { id: "Logical & Algorithmic", label: "Logical & Algorithmic", desc: "Systematic step-by-step logic, code, and formal reasoning" },
  { id: "Analytical & Quantitative", label: "Analytical & Quantitative", desc: "Data analysis, numbers, statistical distributions, and curves" },
  { id: "Practical & Hands-on", label: "Practical & Hands-on", desc: "Building, assembling physical prototypes, lab assays, and debugging hardware" },
  { id: "Creative & Aesthetic", label: "Creative & Aesthetic", desc: "Innovative conceptualization, UX, and industrial styling" },
  { id: "Research & Scientific", label: "Research & Scientific", desc: "Investigating literature, hypothesis testing, and deep inquiry" },
  { id: "Precision & Detail", label: "Precision & Detail", desc: "Ensuring zero tolerances, safety standards, and rigorous verification" }
];

// Universal Career Values
const CAREER_VALUES_OPTIONS = [
  { id: "Innovation & Creativity", label: "Innovation & Creativity", icon: "lightbulb" },
  { id: "High Earning Potential", label: "High Earning Potential", icon: "payments" },
  { id: "Long-term Job Stability", label: "Long-term Job Stability", icon: "security" },
  { id: "Scientific Research & Discovery", label: "Scientific Research & Discovery", icon: "science" },
  { id: "Tangible Social Impact", label: "Tangible Social Impact", icon: "volunteer_activism" },
  { id: "Deep Technical Mastery", label: "Deep Technical Mastery", icon: "psychology" },
  { id: "Leadership & Team Management", label: "Leadership & Team Management", icon: "military_tech" },
  { id: "Entrepreneurship & Autonomy", label: "Entrepreneurship & Autonomy", icon: "rocket_launch" },
  { id: "Work-Life Balance", label: "Work-Life Balance", icon: "balance" },
  { id: "Higher Studies (MS/PhD/MBA)", label: "Opportunities for Higher Studies", icon: "school" },
  { id: "International Mobility", label: "International Career Opportunities", icon: "public" },
  { id: "Building Physical Systems", label: "Building Physical Systems & Products", icon: "precision_manufacturing" }
];

// Complete list of all supported target sectors
const ALL_SECTORS_OPTIONS = [
  "Information Technology",
  "Core Manufacturing",
  "Automotive",
  "Healthcare & Biotech",
  "CleanTech & Energy",
  "Construction",
  "Semiconductors",
  "Defense & Aerospace",
  "Government & PSUs",
  "Research Institutions",
  "Higher Education & Academia",
  "FinTech",
  "Consulting",
  "Chemicals & Pharmaceuticals"
];

// Icon mapping helper
function renderDirectionIcon(iconName: string, className = "w-5 h-5") {
  switch (iconName) {
    case "Laptop": return <Laptop className={className} />;
    case "Brain": return <Brain className={className} />;
    case "Wrench": return <Wrench className={className} />;
    case "Cpu": return <Cpu className={className} />;
    case "Building": return <Building className={className} />;
    case "Zap": return <Zap className={className} />;
    case "FlaskConical": return <FlaskConical className={className} />;
    case "Atom": return <Atom className={className} />;
    case "Shield": return <Shield className={className} />;
    case "Briefcase": return <Briefcase className={className} />;
    case "GraduationCap": return <GraduationCap className={className} />;
    case "Compass": return <Compass className={className} />;
    default: return <Sparkles className={className} />;
  }
}

export function AssessmentForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const [hasStarted, setHasStarted] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [checkingExisting, setCheckingExisting] = useState(true);
  const [step1ValidationWarning, setStep1ValidationWarning] = useState<string | null>(null);

  // =========================================================================
  // STEP 1 - CONTROL CENTRE STATE
  // =========================================================================
  // Part A: Academic Background (Who are you?) - Must NEVER be overwritten by career choices
  const [branch, setBranch] = useState<string>("Computer Science and Engineering");
  const [specialization, setSpecialization] = useState<string>("Software Systems");
  const [currentYear, setCurrentYear] = useState<string>("3rd Year (Junior)");
  const [cgpa, setCgpa] = useState<string>("8.2");
  const [academicStrengths, setAcademicStrengths] = useState<string[]>([
    "Analytical & Mathematical Modeling",
    "Algorithm & Software Logic"
  ]);

  // Part B: Intended Career Direction (Where do you want to go?)
  // No pre-selected default. User must intentionally select a direction or discovery mode.
  const [primaryDirection, setPrimaryDirection] = useState<string>("");
  const [secondaryDirections, setSecondaryDirections] = useState<string[]>([]);

  // =========================================================================
  // STEPS 2-7 DYNAMIC ADAPTIVE STATE (Configured by Primary Direction)
  // =========================================================================
  const activeConfig: CareerDirectionConfig = useMemo(() => {
    return getAdaptiveConfig(primaryDirection || "undecided");
  }, [primaryDirection]);

  // STEP 2: Adaptive Interests
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [showSecondaryInterests, setShowSecondaryInterests] = useState(false);

  // STEP 3: Adaptive Scenarios
  const [scenarioAnswers, setScenarioAnswers] = useState<Record<number, string>>({});

  // STEP 4: Adaptive Challenges & Problem-Solving
  const [selectedChallenges, setSelectedChallenges] = useState<string[]>([]);
  const [problemSolvingStyle, setProblemSolvingStyle] = useState<string>("Logical & Algorithmic");

  // STEP 5: Adaptive Work Style & Environment
  const [selectedWorkTypes, setSelectedWorkTypes] = useState<string[]>([]);
  const [workEnvironment, setWorkEnvironment] = useState<string>("");
  const [workMode, setWorkMode] = useState<string>("Hybrid");
  const [collaborationStyle, setCollaborationStyle] = useState<string>("Balanced Cross-functional Team");

  // STEP 6: Values & Target Sectors
  const [selectedValues, setSelectedValues] = useState<string[]>([
    "Innovation & Creativity",
    "High Earning Potential"
  ]);
  const [targetSectors, setTargetSectors] = useState<string[]>([]);
  const [showAllSectors, setShowAllSectors] = useState<boolean>(false);
  const [expectedSalary, setExpectedSalary] = useState<string>("10.0");
  const [higherStudiesInterest, setHigherStudiesInterest] = useState<string>("No");
  const [startupInterest, setStartupInterest] = useState<string>("Moderate");
  const [careerGoalText, setCareerGoalText] = useState<string>("");

  // STEP 7: Adaptive Skills Catalog (Strictly separate Possessed vs Desired)
  const [existingSkills, setExistingSkills] = useState<{ name: string; proficiency: string }[]>([]);
  const [desiredSkills, setDesiredSkills] = useState<string[]>([]);
  const [programmingLanguages, setProgrammingLanguages] = useState<string>("Java, SQL");
  const [technicalProficiency, setTechnicalProficiency] = useState<string>("Intermediate");
  const [customSkillInput, setCustomSkillInput] = useState<string>("");
  const [activeSkillCategoryTab, setActiveSkillCategoryTab] = useState<string>("");
  const [noTechnicalSkillsYet, setNoTechnicalSkillsYet] = useState<boolean>(false);
  const [certificationsText, setCertificationsText] = useState<string>("None / In Progress");

  // =========================================================================
  // DIRECTION CHANGE ENGINE: RESETS DOMAIN QUESTIONS & PRESERVES ACADEMIC STATE
  // =========================================================================
  const handlePrimaryDirectionChange = (newDirectionId: string) => {
    if (newDirectionId === primaryDirection) return;

    setPrimaryDirection(newDirectionId);
    setStep1ValidationWarning(null);

    const newConfig = getAdaptiveConfig(newDirectionId);

    // 1. Reset domain-specific interests to top interest of new direction
    if (newConfig.interests.length > 0) {
      setSelectedInterests([newConfig.interests[0].id]);
    } else {
      setSelectedInterests([]);
    }

    // 2. Reset scenario answers to default first option of new direction's scenarios
    const initialScenarios: Record<number, string> = {};
    newConfig.scenarios.forEach((sc, idx) => {
      if (sc.options.length > 0) {
        initialScenarios[idx] = sc.options[0].label;
      }
    });
    setScenarioAnswers(initialScenarios);

    // 3. Reset challenges to new direction's first challenge
    if (newConfig.challenges.length > 0) {
      setSelectedChallenges([newConfig.challenges[0].label]);
    } else {
      setSelectedChallenges([]);
    }
    setProblemSolvingStyle(newConfig.defaultProblemSolvingStyle);

    // 4. Reset physical environment & target sector to domain defaults
    setWorkEnvironment(newConfig.v8Defaults.preferredEnvironment);
    setTargetSectors([newConfig.v8Defaults.targetSector]);
    setSelectedWorkTypes([newConfig.environments[0] || "Product-based Company"]);

    // 5. Reset programming languages & technical proficiency
    setProgrammingLanguages(newConfig.v8Defaults.programmingLanguages);
    setTechnicalProficiency(newConfig.v8Defaults.technicalProficiency);
    setCareerGoalText(newConfig.v8Defaults.careerGoal);

    // 6. Reset desired skills roadmap to suggested domain skills
    setDesiredSkills([...newConfig.suggestedDesiredSkills]);

    // 7. Clear domain-incompatible existing skills so they don't corrupt the new profile
    setExistingSkills([]);

    // 8. Set active skill catalog category tab
    if (newConfig.skillsCatalog.length > 0) {
      setActiveSkillCategoryTab(newConfig.skillsCatalog[0].category);
    }
  };

  // Toggle secondary direction
  const toggleSecondaryDirection = (dirId: string) => {
    if (secondaryDirections.includes(dirId)) {
      setSecondaryDirections(secondaryDirections.filter(d => d !== dirId));
    } else {
      if (secondaryDirections.length < 3) {
        setSecondaryDirections([...secondaryDirections, dirId]);
      }
    }
  };

  // Academic branch change handler: purely updates academic background
  const handleBranchChange = (newBranchName: string) => {
    setBranch(newBranchName);
    const found = ENGINEERING_BRANCHES.find(b => b.name === newBranchName);
    if (found && (!specialization || specialization === "General")) {
      setSpecialization(found.defaultSpecialization);
    }
  };

  // Toggle academic strength
  const toggleAcademicStrength = (strength: string) => {
    if (academicStrengths.includes(strength)) {
      if (academicStrengths.length > 1) {
        setAcademicStrengths(academicStrengths.filter(s => s !== strength));
      }
    } else {
      if (academicStrengths.length < 4) {
        setAcademicStrengths([...academicStrengths, strength]);
      }
    }
  };

  // Check if user already has an existing assessment
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
        if (isMounted && res.data && (res.data.primaryCareer || res.data.top_recommendations?.length > 0)) {
          navigate("/results", { replace: true, state: { results: res.data } });
          return;
        }
      } catch {
        // No previous attempt found
      } finally {
        if (isMounted) setCheckingExisting(false);
      }
    }

    checkExistingAssessment();
    return () => {
      isMounted = false;
    };
  }, [location.state, navigate]);

  // Sync skill category tab when activeConfig updates
  useEffect(() => {
    if (activeConfig.skillsCatalog.length > 0 && !activeSkillCategoryTab) {
      setActiveSkillCategoryTab(activeConfig.skillsCatalog[0].category);
    }
  }, [activeConfig, activeSkillCategoryTab]);

  // Helper toggle functions
  const toggleInterest = (interestId: string) => {
    if (selectedInterests.includes(interestId)) {
      if (selectedInterests.length > 1) {
        setSelectedInterests(selectedInterests.filter((i) => i !== interestId));
      }
    } else {
      if (selectedInterests.length < 6) {
        setSelectedInterests([...selectedInterests, interestId]);
      }
    }
  };

  const toggleChallenge = (ch: string) => {
    if (selectedChallenges.includes(ch)) {
      if (selectedChallenges.length > 1) {
        setSelectedChallenges(selectedChallenges.filter((c) => c !== ch));
      }
    } else {
      if (selectedChallenges.length < 5) {
        setSelectedChallenges([...selectedChallenges, ch]);
      }
    }
  };

  const toggleValue = (val: string) => {
    if (selectedValues.includes(val)) {
      if (selectedValues.length > 1) {
        setSelectedValues(selectedValues.filter((v) => v !== val));
      }
    } else {
      if (selectedValues.length < 4) {
        setSelectedValues([...selectedValues, val]);
      }
    }
  };

  const toggleTargetSector = (sec: string) => {
    if (targetSectors.includes(sec)) {
      if (targetSectors.length > 1) {
        setTargetSectors(targetSectors.filter((s) => s !== sec));
      }
    } else {
      if (targetSectors.length < 4) {
        setTargetSectors([...targetSectors, sec]);
      }
    }
  };

  // Skill Management
  const addExistingSkill = (skillName: string, prof = "Intermediate") => {
    if (noTechnicalSkillsYet) setNoTechnicalSkillsYet(false);
    if (!existingSkills.some((s) => s.name === skillName)) {
      setExistingSkills([...existingSkills, { name: skillName, proficiency: prof }]);
      setDesiredSkills(desiredSkills.filter((d) => d !== skillName));
    }
  };

  const removeExistingSkill = (skillName: string) => {
    setExistingSkills(existingSkills.filter((s) => s.name !== skillName));
  };

  const updateSkillProficiency = (skillName: string, prof: string) => {
    setExistingSkills(
      existingSkills.map((s) => (s.name === skillName ? { ...s, proficiency: prof } : s))
    );
  };

  const toggleDesiredSkill = (skillName: string) => {
    if (desiredSkills.includes(skillName)) {
      setDesiredSkills(desiredSkills.filter((s) => s !== skillName));
    } else {
      if (desiredSkills.length < 8) {
        setDesiredSkills([...desiredSkills, skillName]);
        setExistingSkills(existingSkills.filter((s) => s.name !== skillName));
      }
    }
  };

  const handleAddCustomSkill = () => {
    const trimmed = customSkillInput.trim();
    if (!trimmed) return;
    addExistingSkill(trimmed, "Intermediate");
    setCustomSkillInput("");
  };

  // Canonical V8 20-Feature Profile Construction
  const v8ConstructedProfile = useMemo(() => {
    return constructCanonicalV8Profile({
      branch,
      specialization,
      cgpa,
      primaryDirectionId: primaryDirection,
      selectedInterests,
      existingSkills,
      programmingLanguages: noTechnicalSkillsYet ? "None / Basic Scripting" : programmingLanguages,
      technicalProficiency: noTechnicalSkillsYet ? "Beginner" : technicalProficiency,
      certifications: certificationsText,
      workEnvironment,
      targetSector: targetSectors[0],
      expectedSalary,
      higherStudiesInterest,
      problemSolvingStyle,
      startupInterest,
      customCareerGoal: careerGoalText
    });
  }, [
    branch,
    specialization,
    cgpa,
    primaryDirection,
    selectedInterests,
    existingSkills,
    noTechnicalSkillsYet,
    programmingLanguages,
    technicalProficiency,
    certificationsText,
    workEnvironment,
    targetSectors,
    expectedSalary,
    higherStudiesInterest,
    problemSolvingStyle,
    startupInterest,
    careerGoalText
  ]);

  // Navigation handlers
  const handleNext = () => {
    if (currentStep === 1) {
      if (!primaryDirection) {
        setStep1ValidationWarning("Please select your intended career direction or choose 'Explore multiple fields' to proceed.");
        return;
      }
      setStep1ValidationWarning(null);
    }

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

  // Submit complete universal assessment to backend & V8 ML engine
  const handleGenerateResults = async () => {
    setSubmitting(true);
    try {
      const payload = {
        field: activeConfig.title,
        academic: {
          branch,
          specialization,
          currentYear,
          cgpa: parseFloat(cgpa) || 8.0,
          academicStrengths
        },
        direction: {
          primary: primaryDirection,
          primaryTitle: activeConfig.title,
          secondary: secondaryDirections
        },
        interests: selectedInterests,
        scenarios: Object.entries(scenarioAnswers).map(([idx, ans]) => ({
          scenarioId: `sc-${idx}`,
          question: activeConfig.scenarios[parseInt(idx)]?.situation || `Scenario ${idx}`,
          selectedOption: ans,
          traitImpact: [activeConfig.scenarios[parseInt(idx)]?.options.find((o) => o.label === ans)?.trait || "Problem Solving"]
        })),
        challenges: selectedChallenges.map((ch, idx) => ({
          challengeId: `ch-${idx}`,
          category: ch,
          chosenOption: ch,
          timeSpentSeconds: 30,
          isOptimal: true
        })),
        workStyle: {
          collaboration: collaborationStyle,
          environment: workEnvironment,
          mode: workMode,
          workTypes: selectedWorkTypes
        },
        careerValues: selectedValues,
        targetSectors,
        skillsData: {
          existingSkills,
          desiredSkills,
          programmingLanguages: noTechnicalSkillsYet ? "None / Basic Scripting" : programmingLanguages,
          technicalProficiency: noTechnicalSkillsYet ? "Beginner" : technicalProficiency,
          certifications: [certificationsText]
        },
        constraints: {
          educationLevel: "BTech / BE",
          currentYear,
          careerGoal: v8ConstructedProfile.Career_Goal,
          locationPreference: "Flexible",
          expectedSalary: parseFloat(expectedSalary) || 10.0,
          higherStudies: higherStudiesInterest,
          startupInterest
        },
        v8Profile: v8ConstructedProfile
      };

      const res = await axios.post("http://localhost:5000/api/assessment/submit", payload);

      localStorage.setItem("saved_career_results", JSON.stringify(res.data));

      navigate("/results", { state: { results: res.data } });
    } catch (err) {
      console.error("Error submitting universal assessment:", err);
      navigate("/results");
    } finally {
      setSubmitting(false);
    }
  };

  // Loading state
  if (checkingExisting) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="bg-white rounded-3xl p-10 text-center border border-slate-200/80 shadow-xs max-w-sm w-full space-y-3">
          <span className="material-symbols-outlined animate-spin text-indigo-600 text-[32px]">
            sync
          </span>
          <h3 className="text-sm font-bold text-slate-900">Loading Adaptive Career Assessment</h3>
          <p className="text-xs text-slate-400">Verifying your engineering profile & history...</p>
        </div>
      </div>
    );
  }

  // Hero Intro Screen
  if (!hasStarted) {
    return (
      <div className="min-h-[85vh] flex items-center justify-center py-10 px-4">
        <div className="max-w-4xl w-full bg-white rounded-3xl border border-slate-200/80 shadow-xl overflow-hidden p-8 sm:p-12 relative">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-bold">
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                <span>Intelligent Adaptive Assessment • V8 ML Engine</span>
              </div>

              <div>
                <h1 className="text-3xl sm:text-4xl font-black font-heading text-slate-900 tracking-tight leading-tight">
                  Intelligent Engineering Career Discovery
                </h1>
                <p className="text-sm text-slate-600 mt-3 leading-relaxed">
                  Powered by our <strong>Step 1 Control Centre</strong>. We separate <em>who you are academically</em> from <em>where you want to go</em>, dynamically tailoring every question to your intended direction.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-1">
                  <div className="font-bold text-slate-900 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    <span>Cross-Disciplinary</span>
                  </div>
                  <p className="text-slate-500 text-[11px]">Transition smoothly into software, AI, robotics, or core fields.</p>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-1">
                  <div className="font-bold text-slate-900 flex items-center gap-1.5">
                    <Brain className="w-4 h-4 text-purple-600" />
                    <span>35 Career Categories</span>
                  </div>
                  <p className="text-slate-500 text-[11px]">Evaluated by real trained HistGradientBoosting model.</p>
                </div>
              </div>

              <div className="pt-2 flex items-center gap-4">
                <button
                  type="button"
                  onClick={() => setHasStarted(true)}
                  className="px-8 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-lg shadow-indigo-600/30 transition-all cursor-pointer flex items-center gap-2"
                >
                  <span>Begin Adaptive Assessment</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <span className="text-xs text-slate-400 font-medium">8 adaptive steps • ~5 minutes</span>
              </div>
            </div>

            {/* Right Visual Card */}
            <div className="lg:col-span-5 bg-gradient-to-br from-indigo-50/80 via-purple-50/40 to-slate-50 rounded-2xl p-6 border border-indigo-100/60 space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-900">
                12 Supported Career Directions
              </h3>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {[
                  { label: "CS & Software", icon: Laptop },
                  { label: "AI & Data Science", icon: Brain },
                  { label: "Robotics & Automation", icon: Cpu },
                  { label: "Mechanical & Auto", icon: Wrench },
                  { label: "Civil & Infrastructure", icon: Building },
                  { label: "Electrical & Power", icon: Zap },
                  { label: "Electronics & VLSI", icon: Layers },
                  { label: "Chemical & Bio", icon: FlaskConical }
                ].map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={idx}
                      className="p-2.5 rounded-xl bg-white/90 border border-slate-200/60 flex items-center gap-2 font-semibold text-slate-800 shadow-2xs"
                    >
                      <Icon className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                      <span className="truncate text-[11px]">{item.label}</span>
                    </div>
                  );
                })}
              </div>
              <div className="p-3 bg-white/70 rounded-xl border border-indigo-100 text-[11px] text-slate-600 leading-snug">
                <strong>Step 1 Control Centre:</strong> Your academic branch provides educational context, while your intended direction customizes the rest of the assessment.
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto space-y-6">
      {/* Top Header & Step Progress Bar */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 font-black">
              {currentStep}
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600">
                Step {currentStep} of 8 • {STEPS[currentStep - 1].label}
              </span>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900">
                {STEPS[currentStep - 1].title}
              </h2>
            </div>
          </div>
          <span className="text-xs font-bold text-slate-400">
            {Math.round((currentStep / 8) * 100)}% Complete
          </span>
        </div>

        {/* Linear Progress Bar */}
        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-600"
            initial={{ width: "12%" }}
            animate={{ width: `${(currentStep / 8) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>

        {/* Step Pills */}
        <div className="hidden sm:flex items-center justify-between gap-1 pt-1">
          {STEPS.map((step) => (
            <button
              key={step.id}
              type="button"
              onClick={() => {
                if (step.id > 1 && !primaryDirection) {
                  setStep1ValidationWarning("Please select your career direction in Step 1 before jumping ahead.");
                  return;
                }
                setCurrentStep(step.id);
              }}
              className={`flex-1 py-1 px-2 rounded-lg text-[11px] font-semibold transition-all truncate text-center cursor-pointer ${
                currentStep === step.id
                  ? "bg-indigo-600 text-white shadow-2xs"
                  : currentStep > step.id
                  ? "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  : "text-slate-400 hover:text-slate-600"
              }`}
            >
              {step.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Step Form Container */}
      <motion.div
        key={currentStep}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.2 }}
        className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6"
      >
        {/* ================================================================= */}
        {/* STEP 1: THE CENTRAL CONTROL CENTRE                                */}
        {/* ================================================================= */}
        {currentStep === 1 && (
          <div className="space-y-8">
            {step1ValidationWarning && (
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                <span className="font-semibold">{step1ValidationWarning}</span>
              </div>
            )}

            {/* PART A: ACADEMIC BACKGROUND - WHO ARE YOU? */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold text-xs">
                  A
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Academic Background — Who Are You?
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    This represents your actual educational background. It will never be overwritten by career choices.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs bg-slate-50/70 p-5 rounded-2xl border border-slate-200/80">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    What is your current academic branch? <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={branch}
                    onChange={(e) => handleBranchChange(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl font-medium focus:outline-none focus:border-indigo-500"
                  >
                    {ENGINEERING_BRANCHES.map((b) => (
                      <option key={b.name} value={b.name}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Academic Specialization or Focus
                  </label>
                  <input
                    type="text"
                    value={specialization}
                    onChange={(e) => setSpecialization(e.target.value)}
                    placeholder="e.g. Software Systems, Robotics, Thermal, Structural"
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl font-medium focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Current Academic Year</label>
                  <select
                    value={currentYear}
                    onChange={(e) => setCurrentYear(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl font-medium focus:outline-none focus:border-indigo-500"
                  >
                    {ACADEMIC_YEARS.map((yr) => (
                      <option key={yr} value={yr}>
                        {yr}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Cumulative CGPA (out of 10)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="4.0"
                    max="10.0"
                    value={cgpa}
                    onChange={(e) => setCgpa(e.target.value)}
                    placeholder="e.g. 8.2"
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl font-medium focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="sm:col-span-2 pt-1">
                  <label className="block font-bold text-slate-700 mb-1.5">
                    Academic Strengths (Select up to 3)
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {ACADEMIC_STRENGTHS_OPTIONS.map((st) => {
                      const isSelected = academicStrengths.includes(st);
                      return (
                        <button
                          key={st}
                          type="button"
                          onClick={() => toggleAcademicStrength(st)}
                          className={`px-3 py-1.5 rounded-xl text-[11px] font-semibold transition-all cursor-pointer ${
                            isSelected
                              ? "bg-indigo-600 text-white shadow-2xs"
                              : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-100"
                          }`}
                        >
                          {isSelected ? `✓ ${st}` : `+ ${st}`}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* PART B: INTENDED CAREER DIRECTION - WHERE DO YOU WANT TO GO? */}
            <div className="space-y-4 pt-2">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold text-xs">
                  B
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Intended Career Direction — Where Do You Want To Go? <span className="text-rose-500">*</span>
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Select your primary target domain. Steps 2–7 will dynamically adapt to this direction, supporting cross-disciplinary transitions.
                  </p>
                </div>
              </div>

              {/* 12 Categorized Direction Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {Object.values(CAREER_DIRECTIONS).map((dir) => {
                  const isSelected = primaryDirection === dir.id;
                  return (
                    <button
                      key={dir.id}
                      type="button"
                      onClick={() => handlePrimaryDirectionChange(dir.id)}
                      className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-3 relative ${
                        isSelected
                          ? "border-indigo-600 bg-indigo-50/60 shadow-md ring-2 ring-indigo-600/30"
                          : `border-slate-200/90 bg-white hover:bg-slate-50/80 ${dir.borderHover}`
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${dir.gradient} flex items-center justify-center text-white shrink-0 shadow-xs mt-0.5`}>
                          {renderDirectionIcon(dir.iconName, "w-4 h-4")}
                        </div>
                        <div className="space-y-0.5 flex-1 pr-4">
                          <div className="font-bold text-xs text-slate-900 leading-tight">
                            {dir.title}
                          </div>
                          <p className="text-[11px] text-slate-500 leading-snug line-clamp-2">
                            {dir.subtitle}
                          </p>
                        </div>
                      </div>

                      {isSelected && (
                        <div className="absolute top-3.5 right-3.5">
                          <CheckCircle2 className="w-5 h-5 text-indigo-600" />
                        </div>
                      )}

                      <div className="text-[10px] text-slate-400 font-medium border-t border-slate-100 pt-1.5 flex items-center justify-between">
                        <span>Target: {dir.v8Defaults.targetSector}</span>
                        {isSelected && <span className="font-bold text-indigo-600">Active Controller</span>}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Optional Secondary Directions */}
              {primaryDirection && (
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2 mt-2">
                  <div className="flex items-center justify-between">
                    <label className="block font-bold text-slate-700 text-xs">
                      Optional: Add Secondary Exploration Interests (Select up to 2)
                    </label>
                    <span className="text-[10px] text-slate-400">Enriches cross-domain recommendations</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {Object.values(CAREER_DIRECTIONS)
                      .filter((d) => d.id !== primaryDirection && d.id !== "undecided")
                      .map((d) => {
                        const isSecSelected = secondaryDirections.includes(d.id);
                        return (
                          <button
                            key={d.id}
                            type="button"
                            onClick={() => toggleSecondaryDirection(d.id)}
                            className={`px-2.5 py-1.5 rounded-xl text-[11px] font-semibold transition-all cursor-pointer ${
                              isSecSelected
                                ? "bg-purple-600 text-white shadow-2xs"
                                : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-100"
                            }`}
                          >
                            {isSecSelected ? `✓ ${d.title}` : `+ ${d.title}`}
                          </button>
                        );
                      })}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* STEP 2: ADAPTIVE INTEREST DISCOVERY                                */}
        {/* ================================================================= */}
        {currentStep === 2 && (
          <div className="space-y-5">
            <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-100 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600">
                  Adaptive Focus: {activeConfig.title}
                </span>
                <p className="text-xs text-slate-700 font-medium">
                  Select <strong>up to 6 interest areas</strong> that excite you most in this domain.
                </p>
              </div>
              <span className="text-xs font-bold text-indigo-600 bg-white px-2.5 py-1 rounded-lg border border-indigo-100">
                {selectedInterests.length}/6 selected
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {activeConfig.interests.map((item) => {
                const isSelected = selectedInterests.includes(item.id);
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => toggleInterest(item.id)}
                    className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex items-start gap-3 ${
                      isSelected
                        ? "border-indigo-600 bg-indigo-50/70 shadow-2xs ring-1 ring-indigo-600/20"
                        : "border-slate-200 bg-slate-50/50 hover:border-slate-300"
                    }`}
                  >
                    <div className="w-8 h-8 rounded-xl bg-white border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0 mt-0.5">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div className="flex-1 space-y-0.5">
                      <div className="font-bold text-xs text-slate-900 leading-tight">
                        {item.label}
                      </div>
                      <p className="text-[11px] text-slate-500 leading-snug">{item.desc}</p>
                    </div>
                    {isSelected && (
                      <Check className="w-4 h-4 text-indigo-600 shrink-0 mt-1" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Cross-Disciplinary Interests Accordion */}
            <div className="pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowSecondaryInterests(!showSecondaryInterests)}
                className="flex items-center gap-2 text-xs font-bold text-indigo-600 hover:text-indigo-800 cursor-pointer"
              >
                <span>{showSecondaryInterests ? "Hide Cross-Disciplinary Interests" : "+ Browse Interests from Other Fields"}</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showSecondaryInterests ? "rotate-180" : ""}`} />
              </button>

              {showSecondaryInterests && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-3">
                  {Object.values(CAREER_DIRECTIONS)
                    .filter((d) => d.id !== primaryDirection)
                    .flatMap((d) => d.interests.slice(0, 2))
                    .map((item) => {
                      const isSelected = selectedInterests.includes(item.id);
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => toggleInterest(item.id)}
                          className={`p-2.5 rounded-xl border text-left text-xs transition-all cursor-pointer flex items-center justify-between ${
                            isSelected
                              ? "border-purple-600 bg-purple-50 text-purple-900 font-bold"
                              : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                          }`}
                        >
                          <span className="text-[11px] truncate">{item.label}</span>
                          {isSelected && <Check className="w-3.5 h-3.5 text-purple-600 shrink-0" />}
                        </button>
                      );
                    })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* STEP 3: ADAPTIVE REAL-WORLD SCENARIOS                              */}
        {/* ================================================================= */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-100">
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600">
                Domain Scenarios for {activeConfig.title}
              </span>
              <p className="text-xs text-slate-700 font-medium">
                Choose the option that reflects your instinctive engineering approach to each situation.
              </p>
            </div>

            <div className="space-y-5">
              {activeConfig.scenarios.map((sc, idx) => (
                <div
                  key={sc.id}
                  className="p-5 rounded-2xl bg-slate-50/70 border border-slate-200/90 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-lg bg-indigo-100 text-indigo-700 text-[10px] font-bold uppercase tracking-wider">
                      {sc.domain}
                    </span>
                    <span className="text-[11px] font-bold text-slate-400">
                      Scenario {idx + 1} of {activeConfig.scenarios.length}
                    </span>
                  </div>

                  <h4 className="text-xs font-bold text-slate-900 leading-snug">
                    {sc.situation}
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1">
                    {sc.options.map((opt, oIdx) => {
                      const isSelected = scenarioAnswers[idx] === opt.label;
                      return (
                        <button
                          key={oIdx}
                          type="button"
                          onClick={() => setScenarioAnswers({ ...scenarioAnswers, [idx]: opt.label })}
                          className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-start gap-2.5 ${
                            isSelected
                              ? "border-indigo-600 bg-white shadow-2xs text-indigo-900 font-semibold ring-1 ring-indigo-600/20"
                              : "border-slate-200 bg-white/80 hover:border-slate-300 text-slate-700"
                          }`}
                        >
                          <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 mt-0.5 ${
                            isSelected ? "border-indigo-600 bg-indigo-600 text-white" : "border-slate-300"
                          }`}>
                            {isSelected && <Check className="w-2.5 h-2.5" />}
                          </div>
                          <span className="text-[11px] leading-snug">{opt.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* STEP 4: ADAPTIVE CHALLENGES & PROBLEM-SOLVING                      */}
        {/* ================================================================= */}
        {currentStep === 4 && (
          <div className="space-y-6">
            <div>
              <label className="block font-bold text-slate-800 text-xs mb-1">
                Domain Challenges You Enjoy Tackling ({activeConfig.title})
              </label>
              <p className="text-[11px] text-slate-400 mb-3">
                Select <strong>up to 4 challenges</strong> that reflect what you would love to solve in your day-to-day work.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {activeConfig.challenges.map((ch) => {
                  const isSelected = selectedChallenges.includes(ch.label);
                  return (
                    <button
                      key={ch.id}
                      type="button"
                      onClick={() => toggleChallenge(ch.label)}
                      className={`p-3 rounded-xl border text-left text-xs font-medium transition-all cursor-pointer flex items-center justify-between ${
                        isSelected
                          ? "border-indigo-600 bg-indigo-50 text-indigo-900 font-bold shadow-2xs"
                          : "border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300"
                      }`}
                    >
                      <span className="text-[11px]">{ch.label}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-indigo-600 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="pt-2">
              <label className="block font-bold text-slate-800 text-xs mb-1">
                Your Primary Problem-Solving Thinking Style
              </label>
              <p className="text-[11px] text-slate-400 mb-3">
                How do you naturally approach complex technical challenges?
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {PROBLEM_SOLVING_STYLES.map((style) => {
                  const isSelected = problemSolvingStyle === style.id;
                  return (
                    <button
                      key={style.id}
                      type="button"
                      onClick={() => setProblemSolvingStyle(style.id)}
                      className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer space-y-1 ${
                        isSelected
                          ? "border-indigo-600 bg-indigo-50 shadow-2xs ring-1 ring-indigo-600/20"
                          : "border-slate-200 bg-slate-50 hover:border-slate-300"
                      }`}
                    >
                      <div className="font-bold text-xs text-slate-900">{style.label}</div>
                      <p className="text-[11px] text-slate-500 leading-snug">{style.desc}</p>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* STEP 5: ADAPTIVE WORK STYLE & PHYSICAL ENVIRONMENT                 */}
        {/* ================================================================= */}
        {currentStep === 5 && (
          <div className="space-y-6">
            <div>
              <label className="block font-bold text-slate-800 text-xs mb-1">
                Target Physical Environments for {activeConfig.title}
              </label>
              <p className="text-[11px] text-slate-400 mb-3">
                Where would you perform your best work?
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {activeConfig.environments.map((env) => {
                  const isSelected = workEnvironment === env;
                  return (
                    <button
                      key={env}
                      type="button"
                      onClick={() => setWorkEnvironment(env)}
                      className={`p-3 rounded-xl border text-left text-xs font-bold transition-all cursor-pointer flex items-center justify-between ${
                        isSelected
                          ? "border-indigo-600 bg-indigo-50 text-indigo-900 shadow-2xs"
                          : "border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300"
                      }`}
                    >
                      <span className="truncate">{env}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-indigo-600 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-2">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Work Mode Flexibility</label>
                <select
                  value={workMode}
                  onChange={(e) => setWorkMode(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none focus:border-indigo-500"
                >
                  <option value="Hybrid">Hybrid (Balanced On-site & Remote)</option>
                  <option value="Remote">Remote Preferred</option>
                  <option value="On-site / Lab / Field">On-site / Plant / Lab Focused</option>
                  <option value="Flexible">Open to All Modes</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Collaboration Style</label>
                <select
                  value={collaborationStyle}
                  onChange={(e) => setCollaborationStyle(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none focus:border-indigo-500"
                >
                  <option value="Balanced Cross-functional Team">Balanced Cross-functional Team</option>
                  <option value="Autonomous Deep Focus">Autonomous Deep Work & Research</option>
                  <option value="Client & Stakeholder Facing">Client & Stakeholder Facing</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* STEP 6: VALUES & SECTOR CHOICES                                    */}
        {/* ================================================================= */}
        {currentStep === 6 && (
          <div className="space-y-6">
            <div>
              <label className="block font-bold text-slate-800 text-xs mb-1">
                What matters most in your future career? (Select up to 4 priorities)
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {CAREER_VALUES_OPTIONS.map((val) => {
                  const isSelected = selectedValues.includes(val.id);
                  return (
                    <button
                      key={val.id}
                      type="button"
                      onClick={() => toggleValue(val.id)}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-2 ${
                        isSelected
                          ? "border-indigo-600 bg-indigo-50 text-indigo-900 font-bold shadow-2xs"
                          : "border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300"
                      }`}
                    >
                      <span className="material-symbols-outlined text-indigo-600 text-[18px]">
                        {val.icon}
                      </span>
                      <span className="text-[11px] leading-tight">{val.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block font-bold text-slate-800 text-xs">
                  Target Industry Sectors (Select up to 3)
                </label>
                <button
                  type="button"
                  onClick={() => setShowAllSectors(!showAllSectors)}
                  className="text-[11px] font-bold text-indigo-600 hover:underline cursor-pointer"
                >
                  {showAllSectors ? "Show Recommended Sectors" : "Browse All Sectors"}
                </button>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {(showAllSectors ? ALL_SECTORS_OPTIONS : activeConfig.sectors).map((sec) => {
                  const isSelected = targetSectors.includes(sec);
                  return (
                    <button
                      key={sec}
                      type="button"
                      onClick={() => toggleTargetSector(sec)}
                      className={`p-2.5 rounded-xl border text-xs text-left transition-all cursor-pointer flex items-center justify-between ${
                        isSelected
                          ? "border-indigo-600 bg-indigo-50 text-indigo-900 font-bold"
                          : "border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300"
                      }`}
                    >
                      <span className="text-[11px] truncate">{sec}</span>
                      {isSelected && <Check className="w-3 h-3 text-indigo-600 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs pt-2">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Target Starting Compensation (LPA)
                </label>
                <select
                  value={expectedSalary}
                  onChange={(e) => setExpectedSalary(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none focus:border-indigo-500"
                >
                  <option value="6.0">₹5.0 - ₹8.0 LPA</option>
                  <option value="10.0">₹8.0 - ₹14.0 LPA</option>
                  <option value="16.0">₹14.0 - ₹22.0 LPA</option>
                  <option value="24.0">₹22.0+ LPA</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Higher Studies Interest (GATE / GRE / MS)
                </label>
                <select
                  value={higherStudiesInterest}
                  onChange={(e) => setHigherStudiesInterest(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none focus:border-indigo-500"
                >
                  <option value="No">Direct Campus Placement / Industry</option>
                  <option value="Yes">Active Planning (GATE / GRE / Ph.D.)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Startup Interest</label>
                <select
                  value={startupInterest}
                  onChange={(e) => setStartupInterest(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none focus:border-indigo-500"
                >
                  <option value="Moderate">Moderate (Open to high-growth startups)</option>
                  <option value="High">High (Targeting early-stage venture)</option>
                  <option value="Very High">Very High (Aspiring Founder)</option>
                  <option value="Low">Low (Prefer established enterprise / PSU)</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* STEP 7: ADAPTIVE SKILLS & EXPERIENCE                               */}
        {/* ================================================================= */}
        {currentStep === 7 && (
          <div className="space-y-6">
            <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 flex items-start gap-3">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div className="text-xs text-amber-900 leading-relaxed">
                <strong>Strict Capability Separation:</strong> Skills you currently possess are evaluated for technical compatibility. Skills you want to learn are reserved for your customized roadmap and will <em>never</em> be counted as active skills.
              </div>
            </div>

            {/* Beginner Quick Toggle */}
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs">
              <div>
                <div className="font-bold text-slate-900">Starting fresh or early in your engineering studies?</div>
                <div className="text-slate-500 text-[11px]">Select this if you haven't mastered specialized software tools yet.</div>
              </div>
              <button
                type="button"
                onClick={() => setNoTechnicalSkillsYet(!noTechnicalSkillsYet)}
                className={`px-4 py-2 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                  noTechnicalSkillsYet
                    ? "bg-indigo-600 text-white shadow-xs"
                    : "bg-white border border-slate-300 text-slate-700 hover:bg-slate-100"
                }`}
              >
                {noTechnicalSkillsYet ? "✓ Starting Fresh Enabled" : "I'm Starting Fresh"}
              </button>
            </div>

            {/* Currently Possessed Skills */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="block font-bold text-slate-800 text-xs">
                  Skills You Currently Possess ({existingSkills.length} selected)
                </label>
                <span className="text-[11px] text-slate-400">Click dropdown to adjust proficiency</span>
              </div>

              {existingSkills.length === 0 ? (
                <div className="p-4 rounded-xl border border-dashed border-slate-300 text-center text-xs text-slate-400">
                  No skills selected yet. Click "+ Possess" on the tools below or type a custom skill.
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {existingSkills.map((sk) => (
                    <div
                      key={sk.name}
                      className="inline-flex items-center gap-2 pl-3 pr-2 py-1.5 rounded-xl bg-indigo-50 border border-indigo-200 text-xs font-semibold text-indigo-900"
                    >
                      <span>{sk.name}</span>
                      <select
                        value={sk.proficiency}
                        onChange={(e) => updateSkillProficiency(sk.name, e.target.value)}
                        className="bg-white border border-indigo-200 rounded-lg text-[10px] py-0.5 px-1 font-bold text-indigo-700 focus:outline-none"
                      >
                        <option value="Beginner">Beginner</option>
                        <option value="Intermediate">Intermediate</option>
                        <option value="Advanced">Advanced</option>
                      </select>
                      <button
                        type="button"
                        onClick={() => removeExistingSkill(sk.name)}
                        className="text-indigo-400 hover:text-rose-500 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Desired Skills (Roadmap Targets) */}
            <div className="space-y-2 pt-1">
              <label className="block font-bold text-slate-800 text-xs">
                Skills You Want to Learn (Future Roadmap Targets — {desiredSkills.length} selected)
              </label>
              <div className="flex flex-wrap gap-1.5">
                {desiredSkills.length === 0 ? (
                  <span className="text-xs text-slate-400 italic">None selected yet.</span>
                ) : (
                  desiredSkills.map((ds) => (
                    <span
                      key={ds}
                      className="px-2.5 py-1 rounded-lg bg-purple-50 border border-purple-200 text-purple-700 text-xs font-medium flex items-center gap-1.5"
                    >
                      <span>🎯 {ds}</span>
                      <button
                        type="button"
                        onClick={() => toggleDesiredSkill(ds)}
                        className="hover:text-rose-500 cursor-pointer font-bold"
                      >
                        ×
                      </button>
                    </span>
                  ))
                )}
              </div>
            </div>

            {/* Custom Skill Input */}
            <div className="flex gap-2 text-xs pt-1">
              <input
                type="text"
                value={customSkillInput}
                onChange={(e) => setCustomSkillInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddCustomSkill();
                  }
                }}
                placeholder="Type a custom tool or domain skill (e.g. ANSYS, SolidWorks, Verilog, Aspen Plus)..."
                className="flex-1 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none focus:border-indigo-500"
              />
              <button
                type="button"
                onClick={handleAddCustomSkill}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add</span>
              </button>
            </div>

            {/* Adaptive Skill Catalog Category Tabs */}
            <div className="pt-2 space-y-3">
              <label className="block font-bold text-slate-700 text-xs">
                Browse Skills for {activeConfig.title}
              </label>
              <div className="flex flex-wrap gap-1.5">
                {activeConfig.skillsCatalog.map((catItem) => (
                  <button
                    key={catItem.category}
                    type="button"
                    onClick={() => setActiveSkillCategoryTab(catItem.category)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                      activeSkillCategoryTab === catItem.category
                        ? "bg-indigo-600 text-white shadow-2xs"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {catItem.category}
                  </button>
                ))}
              </div>

              {/* Skills Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-xs">
                {activeConfig.skillsCatalog
                  .find((c) => c.category === activeSkillCategoryTab)
                  ?.skills.map((skill) => {
                    const isExisting = existingSkills.some((s) => s.name === skill);
                    const isDesired = desiredSkills.includes(skill);
                    return (
                      <div
                        key={skill}
                        className={`p-2.5 rounded-xl border flex flex-col justify-between gap-2 transition-all ${
                          isExisting
                            ? "border-indigo-400 bg-indigo-50/60"
                            : isDesired
                            ? "border-purple-300 bg-purple-50/40"
                            : "border-slate-200 bg-slate-50/40 hover:bg-slate-50"
                        }`}
                      >
                        <span className="font-bold text-[11px] text-slate-800 truncate">{skill}</span>
                        <div className="flex gap-1 text-[10px]">
                          <button
                            type="button"
                            onClick={() => {
                              if (isExisting) removeExistingSkill(skill);
                              else addExistingSkill(skill, "Intermediate");
                            }}
                            className={`flex-1 py-1 rounded text-center font-bold cursor-pointer transition-colors ${
                              isExisting ? "bg-indigo-600 text-white" : "bg-white border border-slate-300 text-slate-700 hover:bg-slate-100"
                            }`}
                          >
                            {isExisting ? "Possess ✓" : "+ Possess"}
                          </button>
                          <button
                            type="button"
                            onClick={() => toggleDesiredSkill(skill)}
                            className={`py-1 px-1.5 rounded text-center font-bold cursor-pointer transition-colors ${
                              isDesired ? "bg-purple-600 text-white" : "bg-white border border-slate-300 text-slate-500 hover:bg-purple-50"
                            }`}
                            title="Add to skills you want to learn"
                          >
                            {isDesired ? "Goal ✓" : "+ Goal"}
                          </button>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>

            {/* Languages and Proficiency */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-3 border-t border-slate-100">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Programming / Scripting Languages
                </label>
                <select
                  value={programmingLanguages}
                  onChange={(e) => setProgrammingLanguages(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none focus:border-indigo-500"
                >
                  <option value="None / Basic Scripting">None / Basic Scripting (Core Engineering)</option>
                  <option value="Java, SQL">Java, SQL (Software Systems)</option>
                  <option value="Python, SQL">Python, SQL (AI / Data)</option>
                  <option value="JavaScript, TypeScript">JavaScript, TypeScript (Web / Mobile)</option>
                  <option value="MATLAB, C++">MATLAB, C++ (Robotics / Automation)</option>
                  <option value="C, Embedded C">C, Embedded C (Embedded / IoT)</option>
                  <option value="Verilog, VHDL">Verilog, VHDL (VLSI / Digital)</option>
                  <option value="R, MATLAB">R, MATLAB (Biotechnology / Life Sciences)</option>
                  <option value="Python, Bash">Python, Bash (Cybersecurity / DevOps)</option>
                  <option value="SQL, Excel">SQL, Excel (Business / Analytics)</option>
                  <option value="Python, R">Python, R (Scientific Research)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Technical Proficiency Level
                </label>
                <select
                  value={technicalProficiency}
                  onChange={(e) => setTechnicalProficiency(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none focus:border-indigo-500"
                >
                  <option value="Beginner">Beginner (Foundations & Concepts)</option>
                  <option value="Intermediate">Intermediate (Project Implementation)</option>
                  <option value="Advanced">Advanced (Production / Complex Systems)</option>
                  <option value="Expert">Expert (Industry Mastery)</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* STEP 8: REVIEW & V8 PROFILE PREVIEW                                */}
        {/* ================================================================= */}
        {currentStep === 8 && (
          <div className="space-y-5">
            <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-100/90 flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
              <div className="space-y-1 text-xs">
                <h4 className="font-bold text-indigo-950">
                  Ready to Run V8 Intelligent Career Recommendation
                </h4>
                <p className="text-slate-600 leading-relaxed">
                  Step 1 has served as your Control Centre. Your academic background in <strong>{branch}</strong> provides the educational foundation, while your intended direction in <strong>{activeConfig.title}</strong> has shaped your assessment profile. Our trained <strong>HistGradientBoosting V8 Pipeline</strong> will evaluate all 35 career categories.
                </p>
              </div>
            </div>

            {/* Assessment Review Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-700">Academic Background:</span>
                  <button type="button" onClick={() => setCurrentStep(1)} className="text-indigo-600 font-bold hover:underline">Edit</button>
                </div>
                <p className="text-slate-900 font-extrabold">{branch} ({specialization})</p>
                <p className="text-slate-500 text-[11px]">{currentYear} • CGPA: {cgpa}</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-700">Intended Direction:</span>
                  <button type="button" onClick={() => setCurrentStep(1)} className="text-indigo-600 font-bold hover:underline">Edit</button>
                </div>
                <p className="text-slate-900 font-extrabold">{activeConfig.title}</p>
                <p className="text-slate-500 text-[11px]">{selectedInterests.length} domain interests • Goal: {v8ConstructedProfile.Career_Goal}</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-700">Work Style & Setting:</span>
                  <button type="button" onClick={() => setCurrentStep(5)} className="text-indigo-600 font-bold hover:underline">Edit</button>
                </div>
                <p className="text-slate-900 font-extrabold">{workEnvironment} ({workMode})</p>
                <p className="text-slate-500 text-[11px]">{collaborationStyle}</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-700">Target Sectors & Values:</span>
                  <button type="button" onClick={() => setCurrentStep(6)} className="text-indigo-600 font-bold hover:underline">Edit</button>
                </div>
                <p className="text-slate-900 font-extrabold">{targetSectors.join(", ")}</p>
                <p className="text-slate-500 text-[11px]">Priorities: {selectedValues.slice(0, 2).join(", ")}</p>
              </div>

              {/* Skills Possessed */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1 sm:col-span-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-700">Possessed Technical Skills:</span>
                  <button type="button" onClick={() => setCurrentStep(7)} className="text-indigo-600 font-bold hover:underline">Edit</button>
                </div>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {existingSkills.length === 0 ? (
                    <span className="text-slate-400 italic">No specialized tools listed (Evaluated as {v8ConstructedProfile.Primary_Skill})</span>
                  ) : (
                    existingSkills.map((sk) => (
                      <span key={sk.name} className="px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-800 text-[11px] font-semibold">
                        {sk.name} ({sk.proficiency})
                      </span>
                    ))
                  )}
                </div>
              </div>

              {/* Roadmap Learning Targets */}
              <div className="p-4 rounded-2xl bg-purple-50/50 border border-purple-200/60 space-y-1 sm:col-span-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-purple-900">Future Learning Targets (Roadmap Goals Only):</span>
                  <button type="button" onClick={() => setCurrentStep(7)} className="text-purple-600 font-bold hover:underline">Edit</button>
                </div>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {desiredSkills.map((ds) => (
                    <span key={ds} className="px-2 py-0.5 rounded-md bg-purple-100 text-purple-800 text-[11px] font-medium">
                      🎯 {ds}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* V8 Model 20-Feature Transparency Collapsible */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-2">
              <div className="font-bold text-slate-900 flex items-center justify-between">
                <span>Canonical 20-Feature V8 ML Input Profile</span>
                <span className="text-[10px] text-slate-400 font-mono">career_model_v8.pkl</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] text-slate-600 pt-1">
                <div><span className="text-slate-400">Branch:</span> <span className="font-semibold text-slate-800">{v8ConstructedProfile.Branch}</span></div>
                <div><span className="text-slate-400">Primary Skill:</span> <span className="font-semibold text-slate-800">{v8ConstructedProfile.Primary_Skill}</span></div>
                <div><span className="text-slate-400">Secondary:</span> <span className="font-semibold text-slate-800">{v8ConstructedProfile.Secondary_Skill}</span></div>
                <div><span className="text-slate-400">Languages:</span> <span className="font-semibold text-slate-800">{v8ConstructedProfile.Programming_Languages}</span></div>
                <div><span className="text-slate-400">Career Goal:</span> <span className="font-semibold text-slate-800 truncate block">{v8ConstructedProfile.Career_Goal}</span></div>
                <div><span className="text-slate-400">Environment:</span> <span className="font-semibold text-slate-800">{v8ConstructedProfile.Preferred_Environment}</span></div>
                <div><span className="text-slate-400">Target Sector:</span> <span className="font-semibold text-slate-800">{v8ConstructedProfile.Target_Sector}</span></div>
                <div><span className="text-slate-400">Interest Area:</span> <span className="font-semibold text-slate-800">{v8ConstructedProfile.Interest_Area}</span></div>
              </div>
            </div>
          </div>
        )}

        {/* Bottom Action Footer Bar */}
        <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
          <button
            type="button"
            onClick={handleBack}
            className="px-5 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{currentStep === 1 ? "Exit Assessment" : "Back"}</span>
          </button>

          {currentStep < 8 ? (
            <button
              type="button"
              onClick={handleNext}
              className="px-6 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20 transition-all cursor-pointer flex items-center gap-1.5"
            >
              <span>Continue</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              type="button"
              disabled={submitting}
              onClick={handleGenerateResults}
              className="px-7 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition-all cursor-pointer flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>{submitting ? "Computing V8 AI Predictions & Rankings..." : "Generate My Universal Career Pathways"}</span>
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
}
