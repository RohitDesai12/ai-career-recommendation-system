import { useState, useRef } from "react";
import { Upload, FileText, CheckCircle2, XCircle, TrendingUp, ArrowLeft, AlertTriangle, RefreshCw, ShieldAlert, Sparkles, AlertCircle, ArrowRight, Shuffle } from "lucide-react";
import { motion } from "motion/react";
import { useNavigate } from "react-router";
import axios from "axios";
import { CircularProgress } from "../components/ui/circular-progress";

// Branch & Roles mapping
const BRANCH_ROLES: Record<string, string[]> = {
  CSE: ['ML Engineer / AI Researcher','Data Scientist','Full Stack Web Developer','Cloud Architect / DevOps Engineer','Cybersecurity Analyst','Software Development Engineer','NLP / Conversational AI Engineer','Computer Vision Engineer','Blockchain Developer','Game Developer','Mobile App Developer'],
  IT: ['Network Engineer','Mobile App Developer','Web Developer / UI Engineer','Database Administrator','IT Security Analyst','QA / Automation Test Engineer','SAP / ERP Consultant','Cloud Solutions Engineer'],
  DS: ['Data Scientist','ML Engineer','Deep Learning Engineer','NLP / Conversational AI Engineer','Computer Vision Engineer','Business / Data Analyst','Quantitative / Risk Analyst','Biostatistician'],
  ECE: ['VLSI Design Engineer','Embedded Systems Engineer','Robotics Engineer','IoT Solutions Developer','RF / Telecom Engineer','DSP / Signal Processing Engineer','Computer Vision Engineer','Avionics Engineer'],
  EEE: ['Power Systems Engineer','Control & Automation Engineer','Renewable Energy Engineer','EV Powertrain Engineer','Smart Grid Engineer','PLC / SCADA Automation Engineer','High Voltage Engineer'],
  Mech: ['Automotive Design Engineer','Manufacturing / Production Engineer','Thermal / HVAC Engineer','Industrial Robotics Engineer','CAD/CAM Design Engineer','Product Design Engineer','Aerospace Structural Engineer','HVAC Systems Engineer'],
  Aero: ['Aerodynamics / CFD Engineer','Propulsion / Rocket Engineer','Avionics Engineer','Spacecraft / Satellite Engineer','FEA / Structural Analysis Engineer','Flight Dynamics Engineer'],
  Marine: ['Naval Architect','Ocean / Offshore Engineer','Marine Propulsion Engineer','Offshore Structures Engineer'],
  Civil: ['Structural Design Engineer','Construction Project Manager','Environmental / Water Engineer','Highway / Traffic Engineer','Geotechnical Engineer','Urban / City Planner','Hydraulic / Water Resource Engineer'],
  Arch: ['Urban Designer / Architect','Interior Designer','Sustainable / Green Building Architect','Landscape Architect'],
  Chem: ['Process / Chemical Engineer','Petroleum / Reservoir Engineer','Polymer / Materials Engineer','Food Processing Engineer','Pharma Process Engineer'],
  Meta: ['Materials / Metallurgical Engineer','Corrosion / Coatings Engineer','Welding / Quality Engineer','Nanotechnology Researcher'],
  Bio: ['Bioinformatics / Computational Biologist','Pharma Researcher / CRA','Molecular Biologist / Genetic Engineer','Medical Device Engineer','Environmental Consultant'],
  Agri: ['Soil / Agricultural Engineer','Irrigation / Water Management Engineer','Agricultural Machinery Engineer','Food Processing / Post-Harvest Engineer'],
  Mine: ['Mining Engineer','Geotechnical / Rock Mechanics Engineer','Environmental Mining Engineer','Mineral Processing Engineer']
};

const BRANCH_MAPPING: Record<string, string> = {
  "Computer Science & Engineering": "CSE",
  "Information Technology": "IT",
  "Software Engineering": "CSE",
  "Data Science": "DS",
  "Electronics & Communication Engineering": "ECE",
  "Electronics Engineering": "ECE",
  "VLSI Design": "ECE",
  "Embedded Systems": "ECE",
  "Electrical Engineering": "EEE",
  "Electrical & Electronics Engineering": "EEE",
  "Power Engineering": "EEE",
  "Mechanical Engineering": "Mech",
  "Manufacturing Engineering": "Mech",
  "Automotive Engineering": "Mech",
  "Aerospace Engineering": "Aero",
  "Civil Engineering": "Civil",
  "Construction Engineering": "Civil",
  "Transportation Engineering": "Civil"
};

const BRANCH_GROUPS = [
  {
    group: "Computer Science & IT",
    options: ["Computer Science & Engineering", "Information Technology", "Software Engineering", "Data Science"]
  },
  {
    group: "Electronics & Communication",
    options: ["Electronics & Communication Engineering", "Electronics Engineering", "VLSI Design", "Embedded Systems"]
  },
  {
    group: "Electrical & Power",
    options: ["Electrical Engineering", "Electrical & Electronics Engineering", "Power Engineering"]
  },
  {
    group: "Mechanical & Manufacturing",
    options: ["Mechanical Engineering", "Manufacturing Engineering", "Automotive Engineering", "Aerospace Engineering"]
  },
  {
    group: "Civil & Infrastructure",
    options: ["Civil Engineering", "Construction Engineering", "Transportation Engineering"]
  }
];

export function ResumeAnalyzer() {
  const [file, setFile] = useState<File | null>(null);
  const [branch, setBranch] = useState("");
  const [jobRole, setJobRole] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [forceAnalyze, setForceAnalyze] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.type === "application/pdf") {
      setFile(droppedFile);
      setResults(null);
      setForceAnalyze(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setFile(e.target.files[0]);
      setResults(null);
      setForceAnalyze(false);
    }
  };

  const resetUploader = () => {
    setFile(null);
    setResults(null);
    setForceAnalyze(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const runAnalysis = async () => {
    if (!file || !branch || !jobRole) return;
    setAnalyzing(true);
    setResults(null);
    setForceAnalyze(false);
    try {
      const mappedBranchForAnalysis = branch ? (BRANCH_MAPPING[branch] || branch) : "";
      const formData = new FormData();
      formData.append("file", file);
      formData.append("branch", mappedBranchForAnalysis);
      formData.append("jobRole", jobRole);

      const token = localStorage.getItem("token");
      const res = await axios.post("http://localhost:5000/api/ml/analyze-resume", formData, {
        headers: { 
          "Content-Type": "multipart/form-data",
          ...(token ? { "x-auth-token": token } : {})
        }
      });
      
      const analysisResult = { ...res.data, role: jobRole };
      setResults(analysisResult);

      // Only save to profile if document is verified as genuine resume AND is strong match
      if (res.data.document_type === "resume" && res.data.atsScore !== undefined && res.data.field_match?.status === "strong") {
        try {
          const strengths = (res.data.matchedKeywords || []).slice(0, 4);
          const improvements = (res.data.suggestions || []).map((s: any) => typeof s === 'string' ? s : s.text).slice(0, 3);

          await axios.put("http://localhost:5000/api/profile", {
            resumeData: {
              atsScore: res.data.atsScore,
              shortlistChance: res.data.shortlistChance,
              keywordScore: res.data.keywordScore,
              role: jobRole,
              strengths: strengths,
              improvements: improvements,
              analyzedAt: new Date().toISOString()
            }
          }, {
            headers: token ? { "x-auth-token": token } : {}
          });
        } catch (saveErr) {
          console.error("Could not save resume data to profile", saveErr);
        }
      }
    } catch (err: any) {
      console.error(err);
      const errorMsg = err.response?.data?.details || err.response?.data?.error || err.response?.data?.msg || "Error analyzing resume. Make sure backend and ML services are running.";
      alert(errorMsg);
    } finally {
      setAnalyzing(false);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const switchToRecommendedBranch = async (recBranch: string) => {
    setBranch(recBranch);
    const mapped = BRANCH_MAPPING[recBranch] || recBranch;
    const availableRoles = BRANCH_ROLES[mapped] || [];
    const defaultRole = availableRoles[0] || jobRole;
    setJobRole(defaultRole);
    setResults(null);
    setForceAnalyze(false);

    // Re-trigger analysis with recommended branch
    setAnalyzing(true);
    try {
      const formData = new FormData();
      formData.append("file", file!);
      formData.append("branch", mapped);
      formData.append("jobRole", defaultRole);

      const token = localStorage.getItem("token");
      const res = await axios.post("http://localhost:5000/api/ml/analyze-resume", formData, {
        headers: { 
          "Content-Type": "multipart/form-data",
          ...(token ? { "x-auth-token": token } : {})
        }
      });
      
      const analysisResult = { ...res.data, role: defaultRole };
      setResults(analysisResult);
    } catch (err: any) {
      console.error(err);
      const errorMsg = err.response?.data?.details || err.response?.data?.error || err.response?.data?.msg || "Error analyzing resume.";
      alert(errorMsg);
    } finally {
      setAnalyzing(false);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleForceAnalyze = async () => {
    setForceAnalyze(true);
    // Save to profile upon user confirmation
    if (results && results.document_type === "resume") {
      try {
        const strengths = (results.matchedKeywords || []).slice(0, 4);
        const improvements = (results.suggestions || []).map((s: any) => typeof s === 'string' ? s : s.text).slice(0, 3);
        const token = localStorage.getItem("token");

        await axios.put("http://localhost:5000/api/profile", {
          resumeData: {
            atsScore: results.atsScore,
            shortlistChance: results.shortlistChance,
            keywordScore: results.keywordScore,
            role: jobRole,
            strengths: strengths,
            improvements: improvements,
            analyzedAt: new Date().toISOString()
          }
        }, {
          headers: token ? { "x-auth-token": token } : {}
        });
      } catch (saveErr) {
        console.error("Could not save resume data to profile", saveErr);
      }
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const getPriorityColors = (priority: string) => {
    switch(priority) {
      case "High": return { bg: "bg-destructive/10", text: "text-destructive", border: "border-destructive/20" };
      case "Medium": return { bg: "bg-[#D6A85F]/15", text: "text-[#9E732A]", border: "border-[#D6A85F]/30" };
      case "Low": return { bg: "bg-muted", text: "text-muted-foreground", border: "border-border" };
      default: return { bg: "bg-muted", text: "text-foreground", border: "border-border" };
    }
  };

  const currentMappedBranch = branch ? (BRANCH_MAPPING[branch] || branch) : "";
  const sortedRoles = currentMappedBranch ? BRANCH_ROLES[currentMappedBranch] : [];

  // Determine if we should show the field alignment prompt
  const showFieldMatchPrompt = results && 
    results.document_type === "resume" && 
    results.field_match && 
    (results.field_match.status === "partial" || results.field_match.status === "mismatch") && 
    !forceAnalyze;

  return (
    <div className="min-h-screen bg-background p-6 md:p-8 font-sans">
      <div className="max-w-6xl mx-auto relative">
        <div className="flex items-center justify-between gap-4 mb-6">
          <button 
            onClick={() => navigate(-1)}
            className="p-2 text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2 cursor-pointer rounded-xl hover:bg-slate-100"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-xs font-bold">Back</span>
          </button>

          <button
            onClick={() => navigate("/resume-studio")}
            className="px-4 py-2 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-700 hover:bg-indigo-100 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Sparkles className="w-4 h-4 text-indigo-600" />
            <span>Open Resume Studio Workspace</span>
          </button>
        </div>

        <div className="mb-8">
          <h1 className="text-3xl text-foreground font-bold tracking-tight mb-1">Resume Analyzer</h1>
          <p className="text-sm text-muted-foreground">Upload your resume — our AI classifier verifies document authenticity and domain field alignment before calculating ATS scores</p>
        </div>

        {/* Top Controls */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Upload Zone */}
          <div
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            onClick={() => fileInputRef.current?.click()}
            className={`p-8 rounded-2xl border-2 border-dashed transition-all cursor-pointer flex flex-col items-center justify-center text-center
              ${file ? "border-primary bg-primary/5" : "border-border hover:border-primary bg-card"}
            `}
          >
            <input
              type="file"
              accept=".pdf"
              ref={fileInputRef}
              onChange={handleFileSelect}
              className="hidden"
            />
            {file ? (
              <>
                <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center mb-3 text-primary">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <p className="text-sm font-semibold text-foreground mb-1 max-w-[280px] truncate">{file.name}</p>
                <p className="text-xs text-primary font-medium">Ready to classify & analyze (click to replace)</p>
              </>
            ) : (
              <>
                <div className="w-12 h-12 rounded-2xl bg-surface-container flex items-center justify-center mb-3 border border-border">
                  <Upload className="w-5 h-5 text-muted-foreground" />
                </div>
                <p className="text-sm font-medium text-foreground mb-1">Drop your PDF resume here or click to browse</p>
                <p className="text-xs text-muted-foreground">Supports PDF · Max 5MB</p>
              </>
            )}
          </div>

          {/* Selectors */}
          <div className="flex flex-col justify-center space-y-4">
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">Your Engineering Branch</label>
              <select
                value={branch}
                onChange={(e) => {
                  setBranch(e.target.value);
                  setJobRole("");
                  setResults(null);
                  setForceAnalyze(false);
                }}
                className="w-full px-4 py-2.5 rounded-xl bg-card border border-border text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary appearance-none cursor-pointer"
              >
                <option value="">Select your branch...</option>
                {BRANCH_GROUPS.map((g) => (
                  <optgroup key={g.group} label={g.group}>
                    {g.options.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">Target Job Role</label>
              <select
                value={jobRole}
                onChange={(e) => {
                  setJobRole(e.target.value);
                  setResults(null);
                  setForceAnalyze(false);
                }}
                disabled={!branch}
                className="w-full px-4 py-2.5 rounded-xl bg-card border border-border text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value="">{branch ? "Select target role..." : "Select branch first..."}</option>
                {sortedRoles.map(r => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>

            <button
              onClick={runAnalysis}
              disabled={!file || !branch || !jobRole || analyzing}
              className="w-full py-2.5 rounded-xl bg-primary text-white text-sm font-bold uppercase tracking-wider hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center h-11 cursor-pointer shadow-md shadow-primary/25"
            >
              {analyzing ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  <span>Verifying & Analyzing Document...</span>
                </div>
              ) : (
                "Analyze Resume"
              )}
            </button>
          </div>
        </div>

        {/* 1. REJECTED: NOT A RESUME */}
        {results && results.document_type === "not_resume" && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.96 }} 
            animate={{ opacity: 1, scale: 1 }} 
            className="p-8 rounded-3xl bg-card border-2 border-destructive/30 shadow-xl space-y-6 pb-8 mb-16"
          >
            {/* Header Badge */}
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-destructive/10 border border-destructive/20 flex items-center justify-center text-destructive flex-shrink-0">
                <ShieldAlert className="w-8 h-8" />
              </div>
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-3 mb-1">
                  <span className="px-3 py-1 rounded-full bg-destructive/15 border border-destructive/30 text-destructive text-xs font-bold uppercase tracking-wider">
                    Document Rejected · Not a Resume
                  </span>
                  <span className="text-xs font-medium text-muted-foreground">
                    Confidence: {Math.round((results.confidence || 0.94) * 100)}%
                  </span>
                </div>
                <h2 className="text-2xl font-bold text-foreground">
                  The uploaded document does not appear to be a resume
                </h2>
              </div>
            </div>

            {/* Explanation Box */}
            <div className="p-5 rounded-2xl bg-destructive/5 border border-destructive/20 text-sm leading-relaxed text-foreground">
              <p className="font-medium text-destructive mb-1 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                Classifier Diagnostic Explanation:
              </p>
              <p className="text-on-surface-variant">{results.explanation}</p>
            </div>

            {/* Document Structure Detected */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div className="p-4 rounded-xl bg-surface-container border border-border flex flex-col gap-1">
                <span className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">Candidate Identity</span>
                <span className="text-sm font-semibold text-foreground">{results.candidate_name || "None Detected"}</span>
              </div>
              <div className="p-4 rounded-xl bg-surface-container border border-border flex flex-col gap-1">
                <span className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">Career Domain</span>
                <span className="text-sm font-semibold text-foreground">{results.career_domain || "Not applicable"}</span>
              </div>
              <div className="p-4 rounded-xl bg-surface-container border border-border flex flex-col gap-1">
                <span className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">Core Resume Sections</span>
                <div className="flex items-center gap-2 text-xs font-semibold text-destructive mt-0.5">
                  <XCircle className="w-4 h-4" />
                  <span>Missing Education / Skills / Experience</span>
                </div>
              </div>
            </div>

            {/* Policy & Re-upload notice */}
            <div className="pt-4 border-t border-border/60 flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-xs text-muted-foreground text-center sm:text-left max-w-xl">
                No ATS score or shortlist estimation is calculated for non-resume documents (such as homework assignments, lecture notes, syllabus, invoices, or research papers).
              </p>
              <button
                onClick={resetUploader}
                className="px-6 py-2.5 rounded-full bg-primary hover:bg-primary/90 text-white text-xs font-bold uppercase tracking-wider flex items-center gap-2 cursor-pointer shadow-md transition-all whitespace-nowrap"
              >
                <RefreshCw className="w-4 h-4" />
                Upload Valid Resume
              </button>
            </div>
          </motion.div>
        )}

        {/* 2. FIELD ALIGNMENT INTERCEPTION (PARTIAL MATCH OR MISMATCH) */}
        {showFieldMatchPrompt && (
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-8 rounded-3xl bg-card border-2 shadow-xl space-y-6 mb-16 ${
              results.field_match.status === "mismatch" 
                ? "border-[#C8754D]/50" 
                : "border-[#D6A85F]/50"
            }`}
          >
            {/* Header */}
            <div className="flex items-start gap-4">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 ${
                results.field_match.status === "mismatch"
                  ? "bg-[#C8754D]/15 text-[#C8754D] border border-[#C8754D]/30"
                  : "bg-[#D6A85F]/15 text-[#9E732A] border border-[#D6A85F]/30"
              }`}>
                <AlertTriangle className="w-8 h-8" />
              </div>
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-3 mb-1">
                  <span className={`px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                    results.field_match.status === "mismatch"
                      ? "bg-[#C8754D]/15 text-[#C8754D] border border-[#C8754D]/30"
                      : "bg-[#D6A85F]/20 text-[#9E732A] border border-[#D6A85F]/30"
                  }`}>
                    {results.field_match.status === "mismatch" ? "⚠️ Field Mismatch" : "⚠️ Partial Field Match"}
                  </span>
                  <span className="text-xs font-bold text-foreground">
                    Field Match: {results.field_match.score}%
                  </span>
                </div>
                <h2 className="text-2xl font-bold text-foreground">
                  {results.field_match.status === "mismatch"
                    ? "Your resume domain differs from the selected branch"
                    : "Partial field overlap detected"}
                </h2>
              </div>
            </div>

            {/* Explanation */}
            <div className="p-5 rounded-2xl bg-surface-container border border-border/80 text-sm leading-relaxed text-foreground">
              <p className="text-on-surface-variant font-medium">
                {results.field_match.explanation}
              </p>
            </div>

            {/* Comparison Details Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-surface-container border border-border flex flex-col gap-1">
                <span className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">Detected Resume Domain</span>
                <span className="text-sm font-bold text-foreground flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-primary" />
                  {results.field_match.detected_field || "Computer Science / IT"}
                </span>
              </div>
              <div className="p-4 rounded-xl bg-surface-container border border-border flex flex-col gap-1">
                <span className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">Selected Target Branch & Role</span>
                <span className="text-sm font-bold text-foreground flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-secondary" />
                  {branch} ({jobRole})
                </span>
              </div>
            </div>

            {/* Recommendations & Action Buttons */}
            <div className="pt-4 border-t border-border/60 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-xs text-muted-foreground text-center sm:text-left">
                {results.field_match.status === "mismatch" ? (
                  <span>We recommend selecting <strong>{results.field_match.recommended_branch}</strong> or uploading a branch-focused resume.</span>
                ) : (
                  <span>Continue analysis for the selected role or switch to target your primary domain.</span>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-3">
                {/* Switch to Recommended Branch (if mismatch) */}
                {results.field_match.status === "mismatch" && results.field_match.recommended_branch && results.field_match.recommended_branch !== branch && (
                  <button
                    onClick={() => switchToRecommendedBranch(results.field_match.recommended_branch)}
                    className="px-5 py-2.5 rounded-full bg-primary hover:bg-primary/90 text-white text-xs font-bold uppercase tracking-wider flex items-center gap-2 cursor-pointer shadow-md transition-all"
                  >
                    <Shuffle className="w-3.5 h-3.5" />
                    <span>Switch to {results.field_match.recommended_branch.split(" ")[0]}</span>
                  </button>
                )}

                {/* Yes, Analyze Anyway */}
                <button
                  onClick={handleForceAnalyze}
                  className="px-5 py-2.5 rounded-full bg-surface-container hover:bg-surface-container-high border border-border text-foreground text-xs font-bold uppercase tracking-wider flex items-center gap-2 cursor-pointer transition-all"
                >
                  <span>Yes, Analyze Anyway</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* 3. ACCEPTED: GENUINE RESUME RESULTS (STRONG MATCH OR USER CONFIRMED) */}
        {results && results.document_type === "resume" && !showFieldMatchPrompt && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 pb-20">
            
            {/* Verified Header Pill & Match Badge */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-card border border-border shadow-xs">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#1F5C45]/15 border border-[#1F5C45]/30 text-[#1F5C45] flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs text-muted-foreground font-medium">Verified Genuine Resume</div>
                  <div className="text-sm font-bold text-foreground">
                    {results.candidate_name ? `${results.candidate_name} · ` : ""}{results.field_match?.detected_field || results.career_domain || results.role}
                  </div>
                </div>
              </div>

              {/* Field Alignment Tag */}
              <div className="flex items-center gap-2">
                {results.field_match?.status === "strong" ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1F5C45]/10 border border-[#1F5C45]/25 text-xs font-bold text-[#1F5C45]">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Strong Field Match ({results.field_match.score}%)</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#D6A85F]/15 border border-[#D6A85F]/30 text-xs font-bold text-[#9E732A]">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>Cross-Field Analysis ({results.field_match?.score || 60}% match)</span>
                  </span>
                )}

                <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-bold text-primary">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Target: {results.role}</span>
                </div>
              </div>
            </div>

            {/* Score Rings Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <ScoreCard title="ATS Score" value={results.atsScore} suffix="" color="#1F5C45" label={results.resumeStrength} labelColor="text-primary" />
              <ScoreCard title="Shortlist Chance" value={results.shortlistChance} suffix="%" color="#10B981" label={results.shortlistChance >= 70 ? 'Likely' : 'Needs Work'} labelColor="text-success" />
              <ScoreCard title="Keyword Match" value={results.keywordScore} suffix="%" color="#D6A85F" label={`${results.matchedKeywords.length} keywords`} labelColor="text-[#9E732A]" />
              <div className="p-4 rounded-2xl bg-card border border-border flex flex-col items-center justify-center gap-2">
                <div className="w-20 h-20 rounded-2xl bg-surface-container flex items-center justify-center border border-border">
                  <span className="text-2xl font-bold text-foreground">
                    {results.sections.filter((s:any) => s.found).length}/{results.sections.length}
                  </span>
                </div>
                <div className="text-center">
                  <div className="text-xs text-muted-foreground mt-1">Sections Found</div>
                  <div className="text-sm font-semibold mt-0.5 text-primary">{results.resumeStrength} structure</div>
                </div>
              </div>
            </div>

            {/* Stats Bars Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatBar label="Word count" value={results.stats.wordCount} hint="Ideal: 300–600" pct={Math.min(results.stats.wordCount/600 * 100, 100)} color="bg-primary" />
              <StatBar label="Action verbs" value={results.stats.actionVerbs} hint="Ideal: 10+" pct={Math.min(results.stats.actionVerbs/15 * 100, 100)} color="bg-success" />
              <StatBar label="Internship" value={`${results.stats.internshipMonths} mos`} hint="Months of experience" pct={Math.min(results.stats.internshipMonths/12 * 100, 100)} color="bg-secondary" />
              <StatBar label="Formatting" value={`${results.stats.formattingScore}%`} hint="Layout & readability" pct={results.stats.formattingScore} color="bg-accent" />
            </div>

            {/* Middle Content */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Sections */}
              <div className="p-6 rounded-2xl bg-card border border-border">
                <h3 className="text-sm font-bold text-foreground mb-4">Sections detected in document</h3>
                <div className="grid grid-cols-2 gap-3">
                  {results.sections.map((section: any) => (
                    <div key={section.name} className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-xs font-semibold
                      ${section.found ? 'bg-primary/5 border-primary/20 text-primary' : 'bg-destructive/5 border-destructive/20 text-destructive'}
                    `}>
                      <div className={`w-1.5 h-1.5 rounded-full ${section.found ? 'bg-primary' : 'bg-destructive'}`} />
                      {section.name}
                      <span className="ml-auto">{section.found ? '✓' : '✗'}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Keywords */}
              <div className="p-6 rounded-2xl bg-card border border-border">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold text-foreground">Target Role Keyword Match</h3>
                  <span className="text-xs text-muted-foreground font-semibold">{results.matchedKeywords.length} matched / {results.missingKeywords.length} missing</span>
                </div>
                
                <div className="space-y-2 mb-5">
                  <div className="flex items-center gap-3 text-xs">
                    <span className="w-14 text-muted-foreground font-medium">Found</span>
                    <div className="flex-1 h-2 rounded-full bg-surface-container overflow-hidden">
                      <div className="h-full bg-primary rounded-full transition-all duration-1000" style={{ width: `${results.keywordScore}%` }} />
                    </div>
                    <span className="w-8 text-right font-bold text-primary">{results.keywordScore}%</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs">
                    <span className="w-14 text-muted-foreground font-medium">Missing</span>
                    <div className="flex-1 h-2 rounded-full bg-surface-container overflow-hidden">
                      <div className="h-full bg-destructive rounded-full transition-all duration-1000" style={{ width: `${100 - results.keywordScore}%` }} />
                    </div>
                    <span className="w-8 text-right font-bold text-destructive">{100 - results.keywordScore}%</span>
                  </div>
                </div>

                <div className="mb-4">
                  <div className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground mb-2">Found in your resume</div>
                  <div className="flex flex-wrap gap-1.5">
                    {results.matchedKeywords.length > 0 ? (
                      results.matchedKeywords.map((k: string) => (
                        <span key={k} className="px-2.5 py-1 rounded-full bg-primary/10 border border-primary/25 text-primary text-[11px] font-semibold">{k}</span>
                      ))
                    ) : (
                      <span className="text-xs text-muted-foreground italic">No target role keywords matched</span>
                    )}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground mb-2">Missing — Recommended to Add</div>
                  <div className="flex flex-wrap gap-1.5">
                    {results.missingKeywords.map((k: string) => (
                      <span key={k} className="px-2.5 py-1 rounded-full bg-destructive/10 border border-destructive/20 text-destructive text-[11px] font-semibold">{k}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Suggestions */}
            <div className="p-6 rounded-2xl bg-card border border-border">
              <div className="flex items-center gap-3 mb-4">
                <h3 className="text-sm font-bold text-foreground">Improvement Suggestions</h3>
                <span className="px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-[11px] font-bold border border-primary/20">
                  {results.suggestions.length} Action Items
                </span>
              </div>
              <div className="space-y-3">
                {results.suggestions.map((s: any, idx: number) => {
                  const colors = getPriorityColors(s.priority);
                  return (
                    <div key={idx} className={`flex items-start gap-3 p-3.5 rounded-xl border ${colors.bg} ${colors.border}`}>
                      <span className={`px-2 py-0.5 rounded-full border text-[10px] font-bold mt-0.5 ${colors.bg} ${colors.text} ${colors.border}`}>
                        {s.priority}
                      </span>
                      <p className="text-xs text-foreground leading-relaxed flex-1 font-medium">{s.text}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Resume Studio Action Bridge */}
            <div className="p-6 rounded-2xl bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/40 dark:to-purple-950/40 border border-indigo-200/80 dark:border-indigo-800 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="material-symbols-outlined text-indigo-600 text-[24px]">auto_awesome</span>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      Take Action with Resume Studio
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                      Apply these AI recommendations, upgrade formatting, or build tailored copies.
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => navigate(`/resume-studio/builder?step=summary`)}
                  className="p-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/20 transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined text-[18px]">edit_document</span>
                  <span>Fix in Resume Builder</span>
                </button>

                <button
                  type="button"
                  onClick={() => navigate(`/resume-studio/tailor?query=${encodeURIComponent(jobRole || "")}`)}
                  className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 text-xs font-bold hover:bg-slate-50 transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined text-[18px]">tune</span>
                  <span>Tailor for {jobRole || "Role"}</span>
                </button>

                <button
                  type="button"
                  onClick={() => navigate(`/resume-studio/cover-letter?jobTitle=${encodeURIComponent(jobRole || "")}`)}
                  className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 text-xs font-bold hover:bg-slate-50 transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined text-[18px]">mail</span>
                  <span>Write Cover Letter</span>
                </button>
              </div>
            </div>

          </motion.div>
        )}
      </div>
    </div>
  );
}

// Subcomponents

function ScoreCard({ title, value, suffix = "", color, label, labelColor }: any) {
  return (
    <div className="p-4 rounded-2xl bg-card border border-border flex flex-col items-center text-center gap-1.5">
      <CircularProgress
        value={value}
        size="lg"
        color={color}
        valueSuffix={suffix}
      />
      <div>
        <div className="text-xs text-muted-foreground font-medium">{title}</div>
        <div className={`text-sm font-bold mt-0.5 ${labelColor}`}>{label}</div>
      </div>
    </div>
  );
}

function StatBar({ label, value, hint, pct, color }: any) {
  return (
    <div className="p-4 rounded-2xl bg-card border border-border">
      <div className="text-[11px] text-muted-foreground font-semibold mb-1">{label}</div>
      <div className="text-lg font-bold text-foreground">{value}</div>
      <div className="text-[10px] text-muted-foreground mt-0.5">{hint}</div>
      <div className="h-1.5 bg-surface-container rounded-full mt-2.5 overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-1000 ${color}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
