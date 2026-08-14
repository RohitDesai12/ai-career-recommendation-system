import { useState, useRef } from "react";
import { Upload, FileText, CheckCircle2, XCircle, TrendingUp, ArrowLeft } from "lucide-react";
import { motion } from "motion/react";
import { useNavigate } from "react-router";
import axios from "axios";

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
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.type === "application/pdf") {
      setFile(droppedFile);
    }
  };

  const runAnalysis = async () => {
    if (!file || !branch || !jobRole) return;
    setAnalyzing(true);
    setResults(null);
    try {
      const mappedBranchForAnalysis = branch ? (BRANCH_MAPPING[branch] || branch) : "";
      const formData = new FormData();
      formData.append("file", file);
      formData.append("branch", mappedBranchForAnalysis);
      formData.append("jobRole", jobRole);

      const res = await axios.post("http://localhost:5000/api/ml/analyze-resume", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      const analysisResult = { ...res.data, role: jobRole };
      setResults(analysisResult);

      // ✅ Save resume analysis results to profile so Dashboard updates
      try {
        await axios.put("http://localhost:5000/api/profile", {
          resumeData: {
            atsScore: res.data.atsScore,
            shortlistChance: res.data.shortlistChance,
            keywordScore: res.data.keywordScore,
            role: jobRole,
            analyzedAt: new Date().toISOString()
          }
        });
      } catch (saveErr) {
        console.error("Could not save resume data to profile", saveErr);
      }
    } catch (err) {
      console.error(err);
      alert("Error analyzing resume. Make sure ML service is running.");
    } finally {
      setAnalyzing(false);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const getPriorityColors = (priority: string) => {
    switch(priority) {
      case "High": return { bg: "bg-destructive/10", text: "text-destructive", border: "border-destructive/20" };
      case "Medium": return { bg: "bg-amber-500/10", text: "text-amber-500", border: "border-amber-500/20" };
      case "Low": return { bg: "bg-muted", text: "text-muted-foreground", border: "border-border" };
      default: return { bg: "bg-muted", text: "text-foreground", border: "border-border" };
    }
  };

  const currentMappedBranch = branch ? (BRANCH_MAPPING[branch] || branch) : "";
  const sortedRoles = currentMappedBranch ? BRANCH_ROLES[currentMappedBranch] : [];

  return (
    <div className="w-full py-10 px-6 max-h-screen overflow-y-auto">
      <div className="max-w-6xl mx-auto relative">
        <button 
          onClick={() => navigate(-1)}
          className="absolute -top-4 left-0 p-2 text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <div className="mb-8 mt-6">
          <h1 className="text-3xl text-foreground font-medium mb-1">Resume Analyzer</h1>
          <p className="text-sm text-muted-foreground">Upload your resume — we'll score it for your specific branch and target role</p>
        </div>

        {/* Top Controls */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Upload Zone */}
          <div
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            onClick={() => fileInputRef.current?.click()}
            className={`p-8 rounded-xl border-2 border-dashed transition-all cursor-pointer flex flex-col items-center justify-center text-center
              ${file ? "border-success bg-success/5" : "border-border hover:border-primary bg-card"}
            `}
          >
            <input
              type="file"
              accept=".pdf"
              ref={fileInputRef}
              onChange={(e) => {
                if (e.target.files?.[0]) setFile(e.target.files[0]);
              }}
              className="hidden"
            />
            {file ? (
              <>
                <div className="w-12 h-12 rounded-xl bg-success/20 flex items-center justify-center mb-3">
                  <CheckCircle2 className="w-6 h-6 text-success" />
                </div>
                <p className="text-sm font-medium text-success mb-1">{file.name}</p>
                <p className="text-xs text-muted-foreground">Ready to analyze</p>
              </>
            ) : (
              <>
                <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center mb-3">
                  <Upload className="w-5 h-5 text-muted-foreground" />
                </div>
                <p className="text-sm font-medium text-foreground mb-1">Drop your resume here or click</p>
                <p className="text-xs text-muted-foreground">Supports PDF · Max 5MB</p>
              </>
            )}
          </div>

          {/* Selectors */}
          <div className="flex flex-col justify-center space-y-4">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">Your branch</label>
              <select
                value={branch}
                onChange={(e) => {
                  setBranch(e.target.value);
                  setJobRole("");
                  setResults(null);
                }}
                className="w-full px-4 py-2.5 rounded-lg bg-card border border-border text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary appearance-none cursor-pointer"
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
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">Target Job Role</label>
              <select
                value={jobRole}
                onChange={(e) => setJobRole(e.target.value)}
                disabled={!branch}
                className="w-full px-4 py-2.5 rounded-lg bg-card border border-border text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
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
              className="w-full py-2.5 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center h-10"
            >
              {analyzing ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                "Analyze Resume"
              )}
            </button>
          </div>
        </div>

        {/* Results */}
        {results && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 pb-20">
            <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-xs font-medium text-primary">
              Analyzing for: {results.role}
            </div>

            {/* Score Rings Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <ScoreCard title="ATS Score" value={results.atsScore} suffix="" color="#1C4ED8" label={results.resumeStrength} labelColor="text-primary" />
              <ScoreCard title="Shortlist Chance" value={results.shortlistChance} suffix="%" color="#10B981" label={results.shortlistChance >= 70 ? 'Likely' : 'Needs Work'} labelColor="text-success" />
              <ScoreCard title="Keyword Match" value={results.keywordScore} suffix="%" color="#F59E0B" label={`${results.matchedKeywords.length} keywords`} labelColor="text-amber-500" />
              <div className="p-4 rounded-xl bg-card border border-border flex flex-col items-center justify-center gap-2">
                <div className="w-20 h-20 rounded-2xl bg-muted flex items-center justify-center">
                  <span className="text-2xl font-medium text-foreground">
                    {results.sections.filter((s:any) => s.found).length}/{results.sections.length}
                  </span>
                </div>
                <div className="text-center">
                  <div className="text-xs text-muted-foreground mt-1">Sections Found</div>
                  <div className={`text-sm font-medium mt-0.5 text-success`}>{results.resumeStrength} structure</div>
                </div>
              </div>
            </div>

            {/* Stats Bars Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatBar label="Word count" value={results.stats.wordCount} hint="Ideal: 300–600" pct={Math.min(results.stats.wordCount/600 * 100, 100)} color="bg-primary" />
              <StatBar label="Action verbs" value={results.stats.actionVerbs} hint="Ideal: 10+" pct={Math.min(results.stats.actionVerbs/15 * 100, 100)} color="bg-success" />
              <StatBar label="Internship" value={`${results.stats.internshipMonths} mos`} hint="Months of experience" pct={Math.min(results.stats.internshipMonths/12 * 100, 100)} color="bg-indigo-500" />
              <StatBar label="Formatting" value={`${results.stats.formattingScore}%`} hint="Layout & readability" pct={results.stats.formattingScore} color="bg-amber-500" />
            </div>

            {/* Middle Content */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Sections */}
              <div className="p-5 rounded-xl bg-card border border-border">
                <h3 className="text-sm font-medium text-foreground mb-4">Sections detected</h3>
                <div className="grid grid-cols-2 gap-3">
                  {results.sections.map((section: any) => (
                    <div key={section.name} className={`flex items-center gap-2.5 p-2.5 rounded-lg border text-xs font-medium
                      ${section.found ? 'bg-success/5 border-success/20 text-success' : 'bg-destructive/5 border-destructive/20 text-destructive'}
                    `}>
                      <div className={`w-1.5 h-1.5 rounded-full ${section.found ? 'bg-success' : 'bg-destructive'}`} />
                      {section.name}
                      <span className="ml-auto">{section.found ? '✓' : '✗'}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Keywords */}
              <div className="p-5 rounded-xl bg-card border border-border">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium text-foreground">Keyword analysis</h3>
                  <span className="text-xs text-muted-foreground">{results.matchedKeywords.length} matched / {results.missingKeywords.length} missing</span>
                </div>
                
                <div className="space-y-2 mb-5">
                  <div className="flex items-center gap-3 text-xs">
                    <span className="w-14 text-muted-foreground">Found</span>
                    <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                      <div className="h-full bg-success rounded-full transition-all duration-1000" style={{ width: `${results.keywordScore}%` }} />
                    </div>
                    <span className="w-8 text-right font-medium text-success">{results.keywordScore}%</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs">
                    <span className="w-14 text-muted-foreground">Missing</span>
                    <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                      <div className="h-full bg-destructive rounded-full transition-all duration-1000" style={{ width: `${100 - results.keywordScore}%` }} />
                    </div>
                    <span className="w-8 text-right font-medium text-destructive">{100 - results.keywordScore}%</span>
                  </div>
                </div>

                <div className="mb-4">
                  <div className="text-[10px] uppercase tracking-wider font-medium text-muted-foreground mb-2">Found in your resume</div>
                  <div className="flex flex-wrap gap-1.5">
                    {results.matchedKeywords.map((k: string) => (
                      <span key={k} className="px-2.5 py-1 rounded-full bg-success/10 border border-success/20 text-success text-[11px] font-medium">{k}</span>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-wider font-medium text-muted-foreground mb-2">Missing — Add these</div>
                  <div className="flex flex-wrap gap-1.5">
                    {results.missingKeywords.map((k: string) => (
                      <span key={k} className="px-2.5 py-1 rounded-full bg-destructive/10 border border-destructive/20 text-destructive text-[11px] font-medium">{k}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Suggestions */}
            <div className="p-5 rounded-xl bg-card border border-border">
              <div className="flex items-center gap-3 mb-4">
                <h3 className="text-sm font-medium text-foreground">Improvement suggestions</h3>
                <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-medium border border-primary/20">
                  {results.suggestions.length} items
                </span>
              </div>
              <div className="space-y-2.5">
                {results.suggestions.map((s: any, idx: number) => {
                  const colors = getPriorityColors(s.priority);
                  return (
                    <div key={idx} className={`flex items-start gap-3 p-3 rounded-lg border ${colors.bg} ${colors.border}`}>
                      <span className={`px-2 py-0.5 rounded-full border text-[10px] font-medium mt-0.5 ${colors.bg} ${colors.text} ${colors.border}`}>
                        {s.priority}
                      </span>
                      <p className="text-xs text-foreground leading-relaxed flex-1">{s.text}</p>
                    </div>
                  );
                })}
              </div>
            </div>

          </motion.div>
        )}
      </div>
    </div>
  );
}

// Subcomponents

function ScoreCard({ title, value, suffix, color, label, labelColor }: any) {
  const circ = 2 * Math.PI * 34;
  const offset = circ - (value / 100) * circ;
  
  return (
    <div className="p-4 rounded-xl bg-card border border-border flex flex-col items-center text-center gap-1.5">
      <div className="relative w-20 h-20">
        <svg className="w-full h-full transform -rotate-90">
          <circle cx="40" cy="40" r="34" stroke="currentColor" strokeWidth="6" fill="none" className="text-muted" />
          <circle 
            cx="40" cy="40" r="34" 
            stroke={color} 
            strokeWidth="6" 
            fill="none" 
            strokeDasharray={circ} 
            strokeDashoffset={offset} 
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out" 
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-sm font-medium text-foreground">{value}{suffix}</span>
        </div>
      </div>
      <div>
        <div className="text-xs text-muted-foreground">{title}</div>
        <div className={`text-sm font-medium mt-0.5 ${labelColor}`}>{label}</div>
      </div>
    </div>
  );
}

function StatBar({ label, value, hint, pct, color }: any) {
  return (
    <div className="p-3.5 rounded-xl bg-card border border-border">
      <div className="text-[10px] text-muted-foreground mb-1">{label}</div>
      <div className="text-lg font-medium text-foreground">{value}</div>
      <div className="text-[10px] text-muted-foreground mt-0.5">{hint}</div>
      <div className="h-1 bg-muted rounded-full mt-2.5 overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-1000 ${color}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
