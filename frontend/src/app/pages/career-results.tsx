import { useLocation, Link, useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles, TrendingUp, Award, ChevronRight, FileText, MessageSquare, Target, ArrowLeft, CheckCircle2, Map, Compass, Loader2, RotateCcw, AlertCircle, X, ExternalLink, BookOpen, Layers } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import axios from "axios";

// Map frontend branch names to model-expected codes
const BRANCH_TO_MODEL: Record<string, string> = {
  "Computer Science & Engineering": "CSE",
  "Information Technology": "IT",
  "Software Engineering": "CSE",
  "Data Science": "Data Science",
  "Electronics & Communication Engineering": "ECE",
  "Electronics Engineering": "ECE",
  "VLSI Design": "ECE",
  "Embedded Systems": "ECE",
  "Electrical Engineering": "EEE",
  "Electrical & Electronics Engineering": "EEE",
  "Power Engineering": "EEE",
  "Mechanical Engineering": "Mechanical",
  "Manufacturing Engineering": "Mechanical",
  "Automotive Engineering": "Mechanical",
  "Aerospace Engineering": "Aerospace",
  "Civil Engineering": "Civil",
  "Construction Engineering": "Civil",
  "Transportation Engineering": "Civil",
};

// Map frontend specialization names to model-expected values
const SPEC_MAP: Record<string, string> = {
  "Computer Science & Engineering": "Software Engineering",
  "Information Technology": "Software Engineering",
  "Software Engineering": "Software Engineering",
  "Data Science": "Data Science",
  "Electronics & Communication Engineering": "Embedded Systems",
  "Electronics Engineering": "Embedded Systems",
  "VLSI Design": "VLSI Design",
  "Embedded Systems": "Embedded Systems",
  "Electrical Engineering": "Power Systems",
  "Electrical & Electronics Engineering": "Power Systems",
  "Power Engineering": "Power Systems",
  "Mechanical Engineering": "Product Design",
  "Manufacturing Engineering": "Manufacturing",
  "Automotive Engineering": "Automobile Engineering",
  "Aerospace Engineering": "Aerodynamics",
  "Civil Engineering": "Structural Engineering",
  "Construction Engineering": "Construction Management",
  "Transportation Engineering": "Transportation Engineering",
};

// Map year display to model value
const YEAR_MAP: Record<string, string> = {
  "1st Year": "1",
  "2nd Year": "2",
  "3rd Year": "3",
  "4th Year": "4",
};

// Map CGPA display to model value
const CGPA_MAP: Record<string, string> = {
  "9.0 - 10.0": "9.0-10.0",
  "8.0 - 8.9": "8.0-8.9",
  "7.0 - 7.9": "7.0-7.9",
  "6.0 - 6.9": "6.0-6.9",
  "Below 6.0": "Below 6.0",
};

const DEPARTMENT_FIELDS: Record<string, string[]> = {
  "Computer Science & IT": [
    "Full Stack Web Developer",
    "Software Development Engineer",
    "ML Engineer / AI Researcher",
    "Data Scientist",
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

export function CareerResults() {
  const location = useLocation();
  const navigate = useNavigate();

  // Load saved formData from location or localStorage
  const [formData, setFormData] = useState<any>(() => {
    if (location.state?.formData) {
      return location.state.formData;
    }
    try {
      const saved = localStorage.getItem("saved_career_assessment_formData");
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const [loading, setLoading] = useState(true);
  const [selectedCareer, setSelectedCareer] = useState<string | null>(null);
  const [primaryCareer, setPrimaryCareer] = useState<any>(null);
  const [alternativeCareers, setAlternativeCareers] = useState<any[]>([]);
  const [skillRoadmap, setSkillRoadmap] = useState<any[]>([]);

  // Roadmap Modal & Inline Viewer State
  const [existingRoadmap, setExistingRoadmap] = useState<any>(null);
  const [showRoadmapModal, setShowRoadmapModal] = useState(false);
  const [targetCareerForRoadmap, setTargetCareerForRoadmap] = useState<string | null>(null);
  const [generatingRoadmap, setGeneratingRoadmap] = useState<string | null>(null);
  const [inlineRoadmapCareer, setInlineRoadmapCareer] = useState<string | null>(null);
  const [inlineRoadmapStages, setInlineRoadmapStages] = useState<any[]>([]);

  const inlineRoadmapRef = useRef<HTMLDivElement>(null);

  // Check existing roadmap and profile on load
  useEffect(() => {
    const checkProfileAndRoadmap = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/profile/me");
        if (res.data?.targetCareer) {
          setSelectedCareer(res.data.targetCareer);
        }
      } catch (err) {
        // user not logged in or no profile
      }

      try {
        const roadmapRes = await axios.get("http://localhost:5000/api/roadmap");
        if (roadmapRes.data && roadmapRes.data.field) {
          setExistingRoadmap(roadmapRes.data);
        }
      } catch (err) {
        // no active roadmap found
      }
    };
    checkProfileAndRoadmap();
  }, []);

  const handleRetakeAssessment = () => {
    // Clear saved assessment cache and navigate to start of test
    localStorage.removeItem("saved_career_assessment_formData");
    localStorage.removeItem("saved_career_results");
    navigate("/assessment", { state: { retake: true } });
  };

  const handleSelectCareer = async (title: string) => {
    try {
      await axios.put("http://localhost:5000/api/profile", {
        targetCareer: title
      });
      setSelectedCareer(title);
    } catch (err) {
      console.error("Failed to save selection");
    }
  };

  const getDepartmentForCareer = (careerTitle: string) => {
    let selectedDept = "Computer Science & IT";
    const branchLower = (formData.branch || "").toLowerCase();
    if (branchLower.includes("electronics") || branchLower.includes("vlsi") || branchLower.includes("embedded")) {
      selectedDept = "Electronics & Communication";
    } else if (branchLower.includes("electrical") || branchLower.includes("power")) {
      selectedDept = "Electrical & Power";
    } else if (branchLower.includes("mechanical") || branchLower.includes("aerospace") || branchLower.includes("automotive")) {
      selectedDept = "Mechanical & Manufacturing";
    } else if (branchLower.includes("civil") || branchLower.includes("construction")) {
      selectedDept = "Civil & Infrastructure";
    }

    for (const [dept, fields] of Object.entries(DEPARTMENT_FIELDS)) {
      if (fields.some(f => f.toLowerCase().includes(careerTitle.toLowerCase()) || careerTitle.toLowerCase().includes(f.toLowerCase()))) {
        selectedDept = dept;
        break;
      }
    }
    return selectedDept;
  };

  // Called when user clicks "Generate Roadmap" on a career
  const handleGenerateRoadmapClick = async (careerTitle: string) => {
    setTargetCareerForRoadmap(careerTitle);

    // Refresh existing roadmap state to be 100% sure
    try {
      const roadmapRes = await axios.get("http://localhost:5000/api/roadmap");
      if (roadmapRes.data && roadmapRes.data.field) {
        setExistingRoadmap(roadmapRes.data);
        setShowRoadmapModal(true);
        return;
      }
    } catch {
      // No existing roadmap
    }

    // If no existing roadmap, generate directly
    await executeReplaceRoadmap(careerTitle);
  };

  // Option A: Replace active roadmap and redirect to /roadmap
  const executeReplaceRoadmap = async (careerTitle: string) => {
    setGeneratingRoadmap(careerTitle);
    setShowRoadmapModal(false);
    try {
      const selectedDept = getDepartmentForCareer(careerTitle);

      // Save target career in profile
      try {
        await axios.put("http://localhost:5000/api/profile", {
          targetCareer: careerTitle
        });
        setSelectedCareer(careerTitle);
      } catch (profErr) {
        console.warn("Could not save profile target career", profErr);
      }

      // Generate in backend
      await axios.post("http://localhost:5000/api/roadmap", {
        department: selectedDept,
        field: careerTitle
      });

      navigate("/roadmap");
    } catch (err) {
      console.error("Error generating roadmap:", err);
      navigate("/roadmap");
    } finally {
      setGeneratingRoadmap(null);
    }
  };

  // Option B: Generate / show roadmap preview right on this Career Test page ONLY
  const executePreviewOnTestPage = (careerTitle: string) => {
    setShowRoadmapModal(false);
    setInlineRoadmapCareer(careerTitle);
    
    // Generate tailored stages for the inline viewer
    const stages = getDetailedRoadmapForCareer(careerTitle, formData);
    setInlineRoadmapStages(stages);

    // Smooth scroll down to inline roadmap viewer
    setTimeout(() => {
      inlineRoadmapRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 150);
  };

  useEffect(() => {
    async function fetchRecommendation() {
      // Check if we have cached results in localStorage
      const cached = localStorage.getItem("saved_career_results");
      if (cached && !location.state?.formData) {
        try {
          const parsed = JSON.parse(cached);
          if (parsed.primaryCareer && parsed.alternativeCareers) {
            setPrimaryCareer(parsed.primaryCareer);
            setAlternativeCareers(parsed.alternativeCareers);
            setSkillRoadmap(parsed.skillRoadmap || getSkillRoadmap(formData));
            setLoading(false);
            return;
          }
        } catch {
          // ignore error and re-fetch
        }
      }

      try {
        const mappedBranch = BRANCH_TO_MODEL[formData.branch] || formData.branch || "CSE";
        const mappedSpec = formData.specialization
          ? (SPEC_MAP[formData.specialization] || formData.specialization)
          : (SPEC_MAP[formData.branch] || "Software Engineering");
        const mappedYear = YEAR_MAP[formData.year] || formData.year || "3";
        const mappedCGPA = CGPA_MAP[formData.cgpa] || formData.cgpa || "7.5-8.4";

        const skillNames = formData.skillRatings
          ? Object.keys(formData.skillRatings)
          : (formData.skills || []).map((s: string) => s.replace(/\s*\(.*\)/, ''));

        const payload = {
          Branch: mappedBranch,
          Specialization: mappedSpec,
          Year: mappedYear,
          CGPA_Range: mappedCGPA,
          Primary_Skill: skillNames[0] || "Programming",
          Secondary_Skill: skillNames[1] || "Algorithms",
          Projects_Done: parseInt(formData.projects) || 2,
          Certifications: parseInt(formData.certifications) || 1,
          Hardware_or_Software: "Software",
          Work_Style: formData.workPreference || "Team",
          Task_Type: "Development",
          Preferred_Environment: formData.environment || "Office",
          Remote_Preference: formData.remotePreference || "Hybrid",
          Career_Goal: formData.postBTechGoal || "Job",
          Target_Sector: "IT",
          Willing_to_Relocate: "Yes",
          Expected_Salary: formData.salaryExpectation || "10-15 LPA",
          Internship_Interest: "Yes",
          Communication_Level: formData.softSkills?.includes("Communication") ? "Excellent" : "Good",
          Leadership_Experience: formData.softSkills?.includes("Leadership") ? "Yes" : "No",
          Problem_Solving_Style: formData.softSkills?.includes("Problem Solving") ? "Analytical" : "Creative",
        };

        const res = await axios.post("http://localhost:5000/api/ml/recommend", payload);
        const data = res.data;
        
        const primaryData = {
          title: data.recommendation || "Software Development Engineer (SDE)",
          description: "Based on your AI assessment, this career aligns with your skills, interests, and preferences.",
          confidence: data.confidence || 85,
          topSkill: payload.Primary_Skill,
          sector: "Product & Engineering",
          salary: payload.Expected_Salary
        };
        setPrimaryCareer(primaryData);
        
        let alts: any[] = [];
        if (data.alternatives && data.alternatives.length > 0) {
          alts = data.alternatives.map((alt: any) => ({
            title: alt.title,
            description: `High-alignment career path matching your profile`,
            tag: "Strong Match"
          }));
        } else {
          alts = getAlternativeCareers(formData);
        }
        setAlternativeCareers(alts);
        const sRoadmap = getSkillRoadmap(formData);
        setSkillRoadmap(sRoadmap);

        // Save results cache to localStorage
        localStorage.setItem("saved_career_results", JSON.stringify({
          primaryCareer: primaryData,
          alternativeCareers: alts,
          skillRoadmap: sRoadmap
        }));

        // Save recommendedCareers to profile so Dashboard updates
        try {
          const careersToSave = [
            { title: primaryData.title, confidence: 95, description: primaryData.description },
            ...alts.map((a: any) => ({ title: a.title, confidence: 85, description: a.description || '' }))
          ];
          await axios.put("http://localhost:5000/api/profile", {
            recommendedCareers: careersToSave
          });
        } catch (saveErr) {
          console.error("Could not save recommended careers to profile", saveErr);
        }
      } catch (err) {
        console.error("Error fetching recommendation:", err);
        const fallbackPrimary = getPrimaryCareer(formData);
        const fallbackAlts = getAlternativeCareers(formData);
        const fallbackRoadmap = getSkillRoadmap(formData);
        setPrimaryCareer(fallbackPrimary);
        setAlternativeCareers(fallbackAlts);
        setSkillRoadmap(fallbackRoadmap);

        localStorage.setItem("saved_career_results", JSON.stringify({
          primaryCareer: fallbackPrimary,
          alternativeCareers: fallbackAlts,
          skillRoadmap: fallbackRoadmap
        }));
      } finally {
        setLoading(false);
      }
    }

    fetchRecommendation();
  }, [formData, location.state]);

  if (loading || !primaryCareer) {
    return (
      <div className="w-full min-h-[60vh] flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-foreground font-medium animate-pulse">Synthesizing your AI career assessment...</p>
      </div>
    );
  }

  // Extract top skills for highlight badges
  const topSkillsList = formData.skillRatings
    ? Object.keys(formData.skillRatings).slice(0, 3)
    : (formData.skills || []).map((s: string) => s.replace(/\s*\(.*\)/, '')).slice(0, 3);
  const relevantSkillsText = topSkillsList.length > 0 ? topSkillsList.join(", ") : "Programming, System Design";
  const workStyleText = formData.workPreference || "collaborative engineering teams";

  return (
    <div className="w-full py-12 px-6 bg-background text-foreground">
      <div className="max-w-5xl mx-auto relative">
        
        {/* Top Control Bar with Retake Option */}
        <div className="flex items-center justify-between gap-4 mb-8">
          <button 
            onClick={() => navigate("/")}
            className="p-2 text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2 cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm font-semibold">Home</span>
          </button>

          {/* 🔄 Retake Career Test Button */}
          <button
            onClick={handleRetakeAssessment}
            className="px-4 py-2 rounded-full bg-surface-container hover:bg-surface-container-high border border-border text-foreground text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer shadow-xs"
          >
            <RotateCcw className="w-3.5 h-3.5 text-primary" />
            <span>Retake Career Test</span>
          </button>
        </div>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 text-primary mb-3 shadow-xs">
            <Sparkles className="w-7 h-7" />
          </div>
          <h1 className="text-3xl md:text-4xl text-foreground font-bold mb-2">Your AI Career Recommendations</h1>
          <p className="text-base text-muted-foreground">Personalized evaluation derived from your academic background, skills, and work style</p>
        </motion.div>

        {/* 🏆 Best Match Hero Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.15 }}
          className="p-8 md:p-10 rounded-3xl bg-card border-2 border-primary/50 shadow-xl mb-12 relative overflow-hidden"
        >
          <div className="absolute -top-24 -right-24 w-72 h-72 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

          {/* Top Badge */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/15 border border-primary/30 text-primary text-xs font-bold uppercase tracking-wider">
              <span>🏆 Best Match</span>
            </div>
            
            {selectedCareer === primaryCareer.title && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-success/15 border border-success/30 text-success text-xs font-bold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Active Target Career
              </span>
            )}
          </div>

          {/* Career Title */}
          <h2 className="text-3xl md:text-4xl text-foreground font-bold mb-3 tracking-tight">
            {primaryCareer.title}
          </h2>

          {/* Subtitle */}
          <p className="text-muted-foreground text-base md:text-lg mb-6 leading-relaxed max-w-3xl">
            Based on your AI assessment, this career aligns with your skills, interests, and preferences.
          </p>

          {/* Qualitative Alignment Checkpoints */}
          <div className="p-5 rounded-2xl bg-surface-container border border-border/80 mb-8 space-y-3">
            <div className="flex items-center gap-3 text-sm font-semibold text-foreground">
              <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
              <span>Strong technical alignment with your {formData.branch || "engineering"} background</span>
            </div>
            <div className="flex items-center gap-3 text-sm font-semibold text-foreground">
              <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
              <span>Good fit for your preferred work style ({workStyleText})</span>
            </div>
            <div className="flex items-center gap-3 text-sm font-semibold text-foreground">
              <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
              <span>Relevant skills: <strong className="text-primary font-bold">{relevantSkillsText}</strong></span>
            </div>
          </div>

          {/* Action Row */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-border/60">
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1 font-semibold text-foreground">
                <span className="w-2 h-2 rounded-full bg-primary" />
                {primaryCareer.sector || "Tech / Engineering"}
              </span>
              <span>·</span>
              <span>Avg. Salary: <strong className="text-foreground">{primaryCareer.salary || "10-15 LPA"}</strong></span>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                onClick={() => handleSelectCareer(primaryCareer.title)}
                className={`px-5 py-3 rounded-full text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                  selectedCareer === primaryCareer.title
                    ? "bg-surface-container-high border border-border text-foreground"
                    : "bg-surface-container hover:bg-surface-container-high border border-border text-foreground"
                }`}
              >
                {selectedCareer === primaryCareer.title ? "✓ Target Saved" : "Set as Target Role"}
              </button>

              <button
                onClick={() => handleGenerateRoadmapClick(primaryCareer.title)}
                disabled={generatingRoadmap === primaryCareer.title}
                className="px-7 py-3 rounded-full bg-primary hover:bg-primary/90 text-white text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer disabled:opacity-50"
              >
                {generatingRoadmap === primaryCareer.title ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Generating...</span>
                  </>
                ) : (
                  <>
                    <Compass className="w-4 h-4" />
                    <span>Generate Roadmap</span>
                    <ChevronRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        </motion.div>

        {/* Alternative Career Paths */}
        <div className="mb-14">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-2xl text-foreground font-bold">Alternative Career Paths</h3>
              <p className="text-sm text-muted-foreground mt-0.5">High-potential career tracks tailored to your versatile skill profile</p>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {alternativeCareers.map((career, index) => (
              <motion.div
                key={career.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + index * 0.1 }}
                className="p-6 rounded-3xl bg-card border border-border/80 hover:border-primary/50 transition-all shadow-sm flex flex-col justify-between group"
              >
                <div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[11px] font-bold uppercase tracking-wider mb-3">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Strong Alignment</span>
                  </div>
                  <h4 className="text-lg text-foreground font-bold mb-2 group-hover:text-primary transition-colors">
                    {career.title}
                  </h4>
                  <p className="text-muted-foreground text-xs leading-relaxed mb-6">
                    {career.description || "Alternative high-growth track matching your technical abilities."}
                  </p>
                </div>

                <div className="space-y-2 pt-4 border-t border-border/60">
                  <button
                    onClick={() => handleGenerateRoadmapClick(career.title)}
                    disabled={generatingRoadmap === career.title}
                    className="w-full py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer disabled:opacity-50"
                  >
                    {generatingRoadmap === career.title ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <>
                        <Compass className="w-3.5 h-3.5" />
                        <span>Generate Roadmap</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => handleSelectCareer(career.title)}
                    className={`w-full py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                      selectedCareer === career.title
                        ? "text-success font-bold"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {selectedCareer === career.title ? "✓ Active Target Role" : "Select as Target"}
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* 🗺️ INLINE ROADMAP VIEWER (When user selects 'Preview on Career Test page only') */}
        {inlineRoadmapCareer && (
          <motion.div
            ref={inlineRoadmapRef}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-8 rounded-3xl bg-card border-2 border-primary/60 shadow-2xl mb-14 scroll-mt-20"
          >
            <div className="flex flex-wrap items-start justify-between gap-4 mb-6 pb-4 border-b border-border/60">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/15 text-primary text-xs font-bold uppercase tracking-wider mb-2">
                  <Compass className="w-3.5 h-3.5" />
                  <span>Roadmap Preview Generated</span>
                </div>
                <h3 className="text-2xl font-bold text-foreground">
                  Interactive Learning Roadmap for {inlineRoadmapCareer}
                </h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Shown on this Career Test page only. Your primary active roadmap at <Link to="/roadmap" className="text-primary underline font-semibold">/roadmap</Link> remains set to {existingRoadmap?.field || "your current path"}.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => executeReplaceRoadmap(inlineRoadmapCareer)}
                  className="px-4 py-2 rounded-full bg-primary hover:bg-primary/90 text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-md cursor-pointer transition-all"
                >
                  <Map className="w-3.5 h-3.5" />
                  <span>Set as Main Roadmap</span>
                </button>
                <button
                  onClick={() => setInlineRoadmapCareer(null)}
                  className="p-2 rounded-full hover:bg-surface-container text-muted-foreground hover:text-foreground cursor-pointer"
                  title="Close Preview"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Stages Grid */}
            <div className="space-y-4">
              {inlineRoadmapStages.map((stage, idx) => (
                <div key={idx} className="p-5 rounded-2xl bg-surface-container border border-border/80">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-primary text-white text-xs font-bold flex items-center justify-center">
                        {idx + 1}
                      </div>
                      <h4 className="text-sm font-bold text-foreground">{stage.title}</h4>
                    </div>
                    <span className="text-xs font-semibold text-muted-foreground">{stage.duration}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mb-3">{stage.description}</p>
                  
                  <div className="flex flex-wrap gap-2">
                    {stage.skills.map((skill: string) => (
                      <span key={skill} className="px-3 py-1 rounded-full bg-card border border-border text-xs font-semibold text-primary">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Skill Progression Preview */}
        <div className="grid lg:grid-cols-3 gap-8 mb-12">
          <div className="lg:col-span-2">
            <h3 className="text-2xl text-foreground font-bold mb-2">Skill Progression Roadmap</h3>
            <p className="text-sm text-muted-foreground mb-6">Curated stage-by-stage learning plan for {primaryCareer.title}</p>
            
            <div className="space-y-4">
              {skillRoadmap.map((item, index) => (
                <motion.div
                  key={item.phase}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  className="flex gap-4"
                >
                  <div className="flex flex-col items-center">
                    <div className="w-9 h-9 rounded-full bg-primary text-white font-bold text-xs flex items-center justify-center shadow-xs">
                      {index + 1}
                    </div>
                    {index < skillRoadmap.length - 1 && (
                      <div className="w-0.5 flex-1 bg-border mt-2" />
                    )}
                  </div>
                  <div className="flex-1 pb-6">
                    <div className="p-5 rounded-2xl bg-card border border-border">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="text-foreground font-bold text-sm">{item.phase}</h4>
                        <span className="text-xs text-muted-foreground font-medium">{item.duration}</span>
                      </div>
                      <div className="flex flex-wrap gap-2 mt-3">
                        {item.skills.map((skill: string) => (
                          <span
                            key={skill}
                            className="px-2.5 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Quick Actions Sidebar */}
          <div>
            <h3 className="text-2xl text-foreground font-bold mb-2">Next Steps</h3>
            <p className="text-sm text-muted-foreground mb-6">Tools to accelerate your career preparation</p>

            <div className="space-y-4">
              <Link
                to="/roadmap"
                className="flex items-center gap-3.5 p-4 rounded-2xl bg-card border border-border hover:border-primary hover:shadow-md transition-all group"
              >
                <div className="w-11 h-11 rounded-xl bg-primary/15 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all flex-shrink-0">
                  <Map className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-bold text-foreground">Interactive Roadmap</h4>
                  <p className="text-xs text-muted-foreground">Track stages & milestones</p>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
              </Link>

              <Link
                to="/resume"
                className="flex items-center gap-3.5 p-4 rounded-2xl bg-card border border-border hover:border-primary hover:shadow-md transition-all group"
              >
                <div className="w-11 h-11 rounded-xl bg-[#D6A85F]/15 text-[#9E732A] flex items-center justify-center group-hover:bg-[#D6A85F] group-hover:text-white transition-all flex-shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-bold text-foreground">Resume Analyzer</h4>
                  <p className="text-xs text-muted-foreground">Get ATS scores & keyword gaps</p>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
              </Link>

              <Link
                to="/interview-prep"
                className="flex items-center gap-3.5 p-4 rounded-2xl bg-card border border-border hover:border-primary hover:shadow-md transition-all group"
              >
                <div className="w-11 h-11 rounded-xl bg-[#1F5C45]/15 text-[#1F5C45] flex items-center justify-center group-hover:bg-[#1F5C45] group-hover:text-white transition-all flex-shrink-0">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-bold text-foreground">Mock Interviews</h4>
                  <p className="text-xs text-muted-foreground">Practice role-specific questions</p>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ROADMAP ACTION MODAL (Replace vs Preview on Career Test Page) */}
      <AnimatePresence>
        {showRoadmapModal && targetCareerForRoadmap && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="w-full max-w-lg rounded-3xl bg-card border border-border p-7 shadow-2xl space-y-6 text-foreground"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-[#D6A85F]/20 text-[#9E732A] flex items-center justify-center flex-shrink-0 border border-[#D6A85F]/30">
                    <AlertCircle className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-foreground">Existing Roadmap Detected</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">Active roadmap found on your profile</p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowRoadmapModal(false)}
                  className="p-1 text-muted-foreground hover:text-foreground rounded-full hover:bg-surface-container cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-4 rounded-2xl bg-surface-container border border-border/80 text-sm leading-relaxed">
                <p className="text-muted-foreground">
                  You already have an active roadmap saved for <strong className="text-foreground">{existingRoadmap?.field}</strong>.
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  Would you like to replace your active roadmap with <strong className="text-primary">{targetCareerForRoadmap}</strong>, or generate and view this new roadmap here on the career test page?
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-2">
                <button
                  onClick={() => executePreviewOnTestPage(targetCareerForRoadmap)}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-surface-container hover:bg-surface-container-high border border-border text-foreground text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-all"
                >
                  <Layers className="w-4 h-4 text-primary" />
                  <span>View on Test Page Only</span>
                </button>

                <button
                  onClick={() => executeReplaceRoadmap(targetCareerForRoadmap)}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-md shadow-primary/25 cursor-pointer transition-all"
                >
                  <Map className="w-4 h-4" />
                  <span>Replace Existing Roadmap</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function getPrimaryCareer(formData: any) {
  const branchLower = (formData.branch || "").toLowerCase();
  
  if (branchLower.includes("electronics") || branchLower.includes("vlsi") || branchLower.includes("embedded")) {
    return {
      title: "Embedded Systems & IoT Engineer",
      description: "Based on your AI assessment, this career aligns with your skills, interests, and preferences.",
      topSkill: "C/C++ & Microcontrollers",
      sector: "Hardware & IoT",
      salary: "9-14 LPA"
    };
  }
  
  if (branchLower.includes("mechanical") || branchLower.includes("aerospace")) {
    return {
      title: "Product Design & CAD Engineer",
      description: "Based on your AI assessment, this career aligns with your skills, interests, and preferences.",
      topSkill: "SolidWorks & Product Design",
      sector: "Manufacturing & R&D",
      salary: "8-13 LPA"
    };
  }

  if (branchLower.includes("civil")) {
    return {
      title: "Structural Design Engineer",
      description: "Based on your AI assessment, this career aligns with your skills, interests, and preferences.",
      topSkill: "STAAD Pro & AutoCAD",
      sector: "Infrastructure & Real Estate",
      salary: "7-12 LPA"
    };
  }

  return {
    title: "Software Development Engineer (SDE)",
    description: "Based on your AI assessment, this career aligns with your skills, interests, and preferences.",
    topSkill: "Full Stack & System Design",
    sector: "Tech & Product Companies",
    salary: "12-18 LPA"
  };
}

function getAlternativeCareers(formData: any) {
  return [
    {
      title: "Data Scientist / ML Engineer",
      description: "Analyze datasets, build predictive models, and optimize decision algorithms.",
      tag: "Strong Alignment"
    },
    {
      title: "Cloud Architect & DevOps Engineer",
      description: "Design resilient infrastructure, automate CI/CD pipelines, and manage cloud services.",
      tag: "High Demand"
    },
    {
      title: "Full Stack Web Developer",
      description: "Build scalable client-side interfaces and high-performance server APIs.",
      tag: "Alternative Track"
    }
  ];
}

function getSkillRoadmap(formData: any) {
  return [
    {
      phase: "Stage 1: Core Fundamentals",
      duration: "1–2 Months",
      skills: ["Data Structures & Algorithms", "Git & Version Control", "Core Language Fundamentals"]
    },
    {
      phase: "Stage 2: Technical Specialization",
      duration: "2–3 Months",
      skills: ["Framework Proficiencies", "Database & API Design", "State Management & Testing"]
    },
    {
      phase: "Stage 3: Advanced Architecture & Projects",
      duration: "2 Months",
      skills: ["System Architecture", "Performance Optimization", "Full-Stack Deployment"]
    },
    {
      phase: "Stage 4: Industry Interview Preparation",
      duration: "Ongoing",
      skills: ["Mock Interviews", "System Design Rounds", "Behavioral & Leadership Fit"]
    }
  ];
}

function getDetailedRoadmapForCareer(careerTitle: string, formData: any) {
  const c = careerTitle.toLowerCase();
  if (c.includes("data") || c.includes("ml") || c.includes("ai")) {
    return [
      {
        title: "Stage 1: Mathematical Foundations & Python",
        duration: "Month 1–2",
        description: "Master linear algebra, probability, pandas, NumPy, and data manipulation libraries.",
        skills: ["Python", "NumPy & Pandas", "Statistics & Probability", "SQL", "Git"]
      },
      {
        title: "Stage 2: Machine Learning & Feature Engineering",
        duration: "Month 3–4",
        description: "Implement supervised/unsupervised algorithms, scikit-learn models, and evaluation metrics.",
        skills: ["Scikit-Learn", "Model Validation", "Feature Engineering", "Data Visualization", "XGBoost"]
      },
      {
        title: "Stage 3: Deep Learning & MLOps Pipelines",
        duration: "Month 5–6",
        description: "Train neural networks with PyTorch/TensorFlow and build automated prediction APIs.",
        skills: ["PyTorch", "TensorFlow", "FastAPI / Flask", "Docker", "MLflow"]
      },
      {
        title: "Stage 4: Portfolio Projects & Technical Interviews",
        duration: "Month 7+",
        description: "Deploy end-to-end ML applications on cloud platforms and prepare coding challenges.",
        skills: ["Cloud Deployment (AWS/GCP)", "System Design for ML", "Kaggle Competitions", "Interview Prep"]
      }
    ];
  }

  if (c.includes("embedded") || c.includes("iot") || c.includes("vlsi") || c.includes("electronics")) {
    return [
      {
        title: "Stage 1: Low-Level Programming & Circuit Fundamentals",
        duration: "Month 1–2",
        description: "Master C/C++ memory management, registers, pointers, and circuit simulation basics.",
        skills: ["Embedded C / C++", "Microcontroller Architecture", "Circuit Theory", "Git", "Oscilloscopes"]
      },
      {
        title: "Stage 2: Communication Protocols & Peripheral Drivers",
        duration: "Month 3–4",
        description: "Write drivers for UART, I2C, SPI, ADC, PWM, and interface sensor modules.",
        skills: ["UART / SPI / I2C", "ARM Cortex-M", "STM32 / ESP32", "FreeRTOS Basics", "Timer/Interrupts"]
      },
      {
        title: "Stage 3: Real-Time Operating Systems & IoT Networking",
        duration: "Month 5–6",
        description: "Build concurrent RTOS tasks, MQTT wireless communication, and low-power telemetry.",
        skills: ["FreeRTOS", "MQTT / HTTP", "BLE & WiFi Stacks", "PCB Design (KiCad)", "Device Security"]
      },
      {
        title: "Stage 4: Hardware-in-the-Loop Testing & Production",
        duration: "Month 7+",
        description: "Conduct timing analysis, firmware OTA updates, and industry design interview prep.",
        skills: ["Firmware OTA", "Hardware Debugging", "JTAG/SWD", "Technical Interview Prep"]
      }
    ];
  }

  return [
    {
      title: "Stage 1: Core Computer Science & Algorithms",
      duration: "Month 1–2",
      description: "Master computational complexity, data structures (Trees, Graphs, DP), and clean coding.",
      skills: ["Data Structures & Algorithms", "C++ / Java / Python", "Git & GitHub", "Object-Oriented Design"]
    },
    {
      title: "Stage 2: Full-Stack Web & Backend Engineering",
      duration: "Month 3–4",
      description: "Construct scalable RESTful APIs, relational/document databases, and interactive UIs.",
      skills: ["React / TypeScript", "Node.js / Express", "PostgreSQL / MongoDB", "REST APIs", "Authentication"]
    },
    {
      title: "Stage 3: Distributed Systems & Cloud DevOps",
      duration: "Month 5–6",
      description: "Deploy microservices with containerization, caching layers, and CI/CD automation.",
      skills: ["Docker & Containers", "Redis Caching", "AWS Cloud Basics", "CI/CD Pipelines", "System Design"]
    },
    {
      title: "Stage 4: Scalable Architecture & Mock Interviews",
      duration: "Month 7+",
      description: "Solve high-concurrency architecture problems and practice technical interview rounds.",
      skills: ["High-Level System Design", "Load Balancing", "Performance Tuning", "Live Mock Interviews"]
    }
  ];
}
