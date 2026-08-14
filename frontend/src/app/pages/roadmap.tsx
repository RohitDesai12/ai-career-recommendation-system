import { useEffect, useState } from "react";
import axios from "axios";
import { 
  ChevronDown, 
  ChevronUp, 
  Lock, 
  CheckCircle, 
  Circle, 
  BookOpen, 
  ExternalLink, 
  Loader2, 
  RefreshCw,
  Award,
  Sparkles,
  MapPin,
  Clock,
  Compass
} from "lucide-react";

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

export function RoadmapPage() {
  const [activeRoadmap, setActiveRoadmap] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [department, setDepartment] = useState("");
  const [field, setField] = useState("");
  const [expandedStages, setExpandedStages] = useState<Record<number, boolean>>({ 0: true });

  const fetchRoadmap = async () => {
    try {
      setLoading(true);
      const res = await axios.get("http://localhost:5000/api/roadmap");
      setActiveRoadmap(res.data);
      
      // Auto expand active or first stage
      const newExpanded: Record<number, boolean> = {};
      let activeIndex = 0;
      res.data.stages.forEach((stage: any, index: number) => {
        if (stage.status === "In progress") {
          activeIndex = index;
        }
      });
      newExpanded[activeIndex] = true;
      setExpandedStages(newExpanded);
    } catch (err: any) {
      if (err.response && err.response.status === 404) {
        setActiveRoadmap(null);
      } else {
        console.error("Error fetching roadmap:", err);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoadmap();
  }, []);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!department || !field) return;

    try {
      setGenerating(true);
      const res = await axios.post("http://localhost:5000/api/roadmap", { department, field });
      setActiveRoadmap(res.data);
      setExpandedStages({ 0: true });
    } catch (err) {
      console.error("Error generating roadmap:", err);
    } finally {
      setGenerating(false);
    }
  };

  const handleToggleSkill = async (stageIndex: number, skillName: string) => {
    try {
      const res = await axios.put("http://localhost:5000/api/roadmap/toggle-skill", {
        stageIndex,
        skillName
      });
      setActiveRoadmap(res.data);
    } catch (err) {
      console.error("Error toggling skill:", err);
    }
  };

  const handleReset = async () => {
    if (!window.confirm("Are you sure you want to reset this roadmap? All your progress will be lost.")) {
      return;
    }
    try {
      setLoading(true);
      await axios.delete("http://localhost:5000/api/roadmap");
      setActiveRoadmap(null);
      setDepartment("");
      setField("");
    } catch (err) {
      console.error("Error resetting roadmap:", err);
    } finally {
      setLoading(false);
    }
  };

  const toggleStageExpand = (index: number) => {
    setExpandedStages(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const getFieldsForDepartment = () => {
    return DEPARTMENT_FIELDS[department] || [];
  };

  if (loading) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center gap-4 text-on-surface-variant">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
        <span className="text-sm font-medium tracking-wide">Loading your path...</span>
      </div>
    );
  }

  // ------------------- EMPTY STATE (CONFIGURATION) -------------------
  if (!activeRoadmap) {
    return (
      <div className="max-w-3xl mx-auto py-12 px-6">
        <div className="text-center mb-10 flex flex-col items-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center mb-4 shadow-lg shadow-primary/25">
            <Compass className="w-8 h-8 text-white animate-pulse" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-on-surface mb-2">Build Your Career Roadmap</h1>
          <p className="text-on-surface-variant max-w-md text-sm leading-relaxed">
            Select your department and target field to generate a personalized learning roadmap loaded with skills and free resources.
          </p>
        </div>

        <form onSubmit={handleGenerate} className="bg-surface-container rounded-3xl p-8 border border-outline-variant/20 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-secondary" />
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-on-surface mb-2">1. Select Department / Branch</label>
              <select
                value={department}
                onChange={(e) => {
                  setDepartment(e.target.value);
                  setField("");
                }}
                required
                className="w-full px-4 py-3.5 rounded-xl bg-surface-container-low border border-outline-variant/30 text-on-surface focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-sm"
              >
                <option value="">Choose department...</option>
                {Object.keys(DEPARTMENT_FIELDS).map((dept) => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>

            {department && (
              <div>
                <label className="block text-sm font-semibold text-on-surface mb-2">2. Choose Specific Target Field</label>
                <select
                  value={field}
                  onChange={(e) => setField(e.target.value)}
                  required
                  className="w-full px-4 py-3.5 rounded-xl bg-surface-container-low border border-outline-variant/30 text-on-surface focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-sm"
                >
                  <option value="">Select a career field...</option>
                  {getFieldsForDepartment().map((f) => (
                    <option key={f} value={f}>{f}</option>
                  ))}
                </select>
              </div>
            )}

            <button
              type="submit"
              disabled={generating || !department || !field}
              className="w-full py-4 px-6 rounded-xl bg-primary text-white font-semibold flex items-center justify-center gap-2 hover:bg-primary-container hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 shadow-md shadow-primary/25 text-sm mt-4"
            >
              {generating ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Generating Roadmap...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Generate Career Roadmap
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    );
  }

  // ------------------- ACTIVE ROADMAP TIMELINE STATE -------------------
  return (
    <div className="max-w-4xl mx-auto py-10 px-6">
      
      {/* Header Info Card */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-surface-container-low border border-outline-variant/15 p-8 rounded-3xl gap-6 mb-10 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-6 -mt-6 w-32 h-32 bg-primary/10 rounded-full blur-3xl" />
        
        <div className="flex flex-col gap-2 min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="bg-primary/20 text-primary text-[11px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
              {activeRoadmap.department}
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-on-surface truncate">Your Career Roadmap</h1>
          <p className="text-on-surface-variant text-sm flex items-center gap-1.5 mt-1 font-medium">
            <MapPin className="w-4 h-4 text-secondary flex-shrink-0" />
            {activeRoadmap.field} Path · Customized for your profile
          </p>
        </div>

        {/* Dynamic circular progress badge */}
        <div className="flex items-center bg-surface-container border border-outline-variant/10 px-6 py-4 rounded-2xl gap-4 flex-shrink-0 shadow-sm">
          <div className="relative w-14 h-14 flex items-center justify-center">
            {/* SVG circular track & indicator */}
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="28"
                cy="28"
                r="23"
                className="stroke-outline-variant/20 fill-none"
                strokeWidth="4"
              />
              <circle
                cx="28"
                cy="28"
                r="23"
                className="stroke-primary fill-none transition-all duration-500 ease-out"
                strokeWidth="4.5"
                strokeDasharray={144.5}
                strokeDashoffset={144.5 - (144.5 * activeRoadmap.percentComplete) / 100}
                strokeLinecap="round"
              />
            </svg>
            <span className="absolute text-xs font-bold text-on-surface">{activeRoadmap.percentComplete}%</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[13px] font-bold text-on-surface">{activeRoadmap.stagesComplete}/{activeRoadmap.totalStages} Stages</span>
            <span className="text-[11px] text-on-surface-variant font-medium">Completed Path</span>
          </div>
        </div>
      </div>

      {/* Main Roadmap Timeline Section */}
      <div className="relative pl-8 md:pl-10 space-y-6">
        
        {/* Continuous Timeline Vertical Line */}
        <div className="absolute left-[15px] md:left-[19px] top-4 bottom-4 w-[2.5px] bg-outline-variant/20" />

        {activeRoadmap.stages.map((stage: any, index: number) => {
          const isExpanded = !!expandedStages[index];
          const isCompleted = stage.status === "Completed";
          const isInProgress = stage.status === "In progress";
          const isLocked = stage.status === "Locked";
          
          return (
            <div key={index} className="relative group">
              
              {/* Left Timeline Indicator Node */}
              <div className="absolute -left-[33px] md:-left-[39px] top-6 z-10">
                {isCompleted ? (
                  <div className="w-7 h-7 md:w-9 md:h-9 rounded-full bg-success flex items-center justify-center border-4 border-background shadow-md shadow-success/20">
                    <CheckCircle className="w-4 h-4 md:w-5 md:h-5 text-white" />
                  </div>
                ) : isInProgress ? (
                  <div className="w-7 h-7 md:w-9 md:h-9 rounded-full bg-primary flex items-center justify-center border-4 border-background shadow-[0_0_12px_rgba(99,102,241,0.5)]">
                    <Circle className="w-2.5 h-2.5 md:w-3 md:h-3 fill-white text-white animate-pulse" />
                  </div>
                ) : (
                  <div className="w-7 h-7 md:w-9 md:h-9 rounded-full bg-surface-container border-2 border-outline-variant/30 flex items-center justify-center shadow-sm">
                    <Lock className="w-3.5 h-3.5 text-on-surface-variant/40" />
                  </div>
                )}
              </div>

              {/* Timeline Card */}
              <div 
                className={`bg-surface-container-low rounded-3xl border transition-all duration-300 ${
                  isInProgress 
                    ? "border-primary/40 shadow-md shadow-primary/5" 
                    : isLocked 
                    ? "border-outline-variant/10 opacity-60" 
                    : "border-outline-variant/15"
                }`}
              >
                {/* Card Header (Clickable to Toggle Expand if not Locked) */}
                <div 
                  onClick={() => !isLocked && toggleStageExpand(index)}
                  className={`p-6 flex items-center justify-between gap-4 cursor-pointer select-none ${isLocked ? "cursor-default" : "hover:bg-surface-container-high/40 rounded-t-3xl"}`}
                >
                  <div className="flex flex-col gap-1 min-w-0">
                    <div className="flex items-center gap-3">
                      <span className="text-[11px] font-bold text-on-surface-variant tracking-wider uppercase">
                        Stage {index + 1}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        isCompleted 
                          ? "bg-success/25 text-success" 
                          : isInProgress 
                          ? "bg-primary/25 text-primary" 
                          : "bg-surface-container-highest text-on-surface-variant/50"
                      }`}>
                        {stage.status}
                      </span>
                    </div>
                    <h3 className={`text-base md:text-lg font-bold text-on-surface mt-1 ${isLocked ? "text-on-surface-variant/55" : ""}`}>
                      {stage.title.split(":").slice(1).join(":").trim() || stage.title}
                    </h3>
                    <p className="text-xs md:text-sm text-on-surface-variant line-clamp-1">
                      {stage.description}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 flex-shrink-0">
                    <div className="hidden sm:flex items-center gap-1 text-[11px] font-semibold text-on-surface-variant bg-surface-container px-2.5 py-1 rounded-full border border-outline-variant/10">
                      <Clock className="w-3.5 h-3.5 text-on-surface-variant/70" />
                      {stage.weeks} Weeks
                    </div>
                    {!isLocked && (
                      isExpanded ? <ChevronUp className="w-5 h-5 text-on-surface-variant" /> : <ChevronDown className="w-5 h-5 text-on-surface-variant" />
                    )}
                  </div>
                </div>

                {/* Card Content (Expandable Section) */}
                {isExpanded && !isLocked && (
                  <div className="border-t border-outline-variant/15 p-6 space-y-6 bg-surface-container/10 rounded-b-3xl">
                    
                    {/* Skills Checklist */}
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-on-surface-variant/80 mb-3.5 flex items-center gap-1.5">
                        <Award className="w-4 h-4 text-primary" />
                        Skills to Acquire
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {stage.skills.map((skill: any, sIdx: number) => (
                          <div 
                            key={sIdx}
                            onClick={() => handleToggleSkill(index, skill.name)}
                            className={`flex items-center p-3 rounded-xl border transition-all cursor-pointer select-none hover:bg-surface-container-high/40 ${
                              skill.completed 
                                ? "bg-success/5 border-success/30 text-on-surface" 
                                : "bg-surface-container border-outline-variant/20 text-on-surface-variant"
                            }`}
                          >
                            <div className="flex items-center gap-3 min-w-0 w-full">
                              <input
                                type="checkbox"
                                checked={skill.completed}
                                readOnly
                                className="w-4 h-4 rounded text-primary border-outline-variant focus:ring-primary focus:ring-offset-background"
                              />
                              <span className={`text-[13px] font-semibold truncate ${skill.completed ? "line-through text-on-surface-variant/60" : "text-on-surface"}`}>
                                {skill.name}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Resources List */}
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-on-surface-variant/80 mb-3.5 flex items-center gap-1.5">
                        <BookOpen className="w-4 h-4 text-secondary" />
                        Learning Resources
                      </h4>
                      <div className="space-y-2.5">
                        {stage.resources.map((resource: any, rIdx: number) => (
                          <a 
                            key={rIdx}
                            href={resource.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-between p-3.5 bg-surface-container border border-outline-variant/20 hover:border-secondary/35 rounded-xl hover:bg-surface-container-high/50 group transition-all"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="w-8 h-8 rounded-lg bg-secondary/15 flex items-center justify-center flex-shrink-0">
                                <BookOpen className="w-4 h-4 text-secondary" />
                              </div>
                              <div className="flex flex-col min-w-0">
                                <span className="text-[13px] font-bold text-on-surface truncate group-hover:text-secondary transition-colors">
                                  {resource.name}
                                </span>
                                <span className="text-[10px] text-on-surface-variant/70">
                                  {resource.type === "Course" ? "External Course / Tutorial" : resource.type === "Practice" ? "Interactive Practice Set" : "Official Documentation"}
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-surface-container-highest text-on-surface-variant/70 border border-outline-variant/5">
                                {resource.type}
                              </span>
                              <ExternalLink className="w-3.5 h-3.5 text-on-surface-variant group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                            </div>
                          </a>
                        ))}
                      </div>
                    </div>

                  </div>
                )}

              </div>
            </div>
          );
        })}

      </div>

      {/* Reset Roadmap Actions */}
      <div className="mt-12 flex justify-center border-t border-outline-variant/10 pt-8">
        <button
          onClick={handleReset}
          className="flex items-center gap-2 px-6 py-3 rounded-xl border border-error/30 text-error hover:bg-error/10 hover:border-error transition-all font-semibold text-sm shadow-sm"
        >
          <RefreshCw className="w-4 h-4" />
          Reset Career Roadmap
        </button>
      </div>

    </div>
  );
}
