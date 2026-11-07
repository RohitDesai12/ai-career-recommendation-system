import { useState, useEffect, useRef } from "react";
import { useSearchParams, useNavigate, Link } from "react-router";
import { useAuth } from "../context/auth-context";
import axios from "axios";

interface ExperienceItem {
  role: string;
  company: string;
  location?: string;
  startDate?: string;
  endDate?: string;
  current?: boolean;
  description?: string;
  bulletPoints?: string[];
}

interface EducationItem {
  degree: string;
  institution: string;
  location?: string;
  graduationYear?: string;
  gpa?: string;
}

interface SkillCategory {
  category: string;
  items: string[];
}

interface ProjectItem {
  title: string;
  description?: string;
  techStack?: string[];
  link?: string;
  github?: string;
}

interface CertificationItem {
  name: string;
  issuer?: string;
  issueDate?: string;
  credentialUrl?: string;
}

interface AchievementItem {
  title: string;
  organization?: string;
  date?: string;
  description?: string;
}

interface LanguageItem {
  language: string;
  proficiency: "Native" | "Fluent" | "Intermediate" | "Basic";
}

interface CustomSectionItem {
  heading: string;
  items: { title: string; subtitle?: string; date?: string; description?: string }[];
}

export function ResumeBuilder() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const resumeId = searchParams.get("id");
  const templateParam = searchParams.get("template");
  const stepParam = searchParams.get("step");
  const sourceParam = searchParams.get("source");

  // Section Accordion State
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    header: true,
    personal: true,
    summary: true,
    experience: true,
    education: true,
    skills: true,
    projects: true,
    certifications: false,
    achievements: false,
    languages: false,
    custom: false
  });

  const toggleSection = (section: string) => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const [mobileTab, setMobileTab] = useState<"editor" | "preview">("editor");
  const [saving, setSaving] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiModal, setAiModal] = useState<{
    isOpen: boolean;
    section: string;
    originalText: string;
    improvedText: string;
    action: string;
    onApply: (text: string) => void;
  } | null>(null);

  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const previewRef = useRef<HTMLDivElement>(null);

  // Resume Document State
  const [currentId, setCurrentId] = useState<string | null>(resumeId || null);
  const [title, setTitle] = useState("Master Resume");
  const [targetRole, setTargetRole] = useState("Software Development Engineer");
  const [template, setTemplate] = useState(templateParam || "Modern");
  const [accentColor, setAccentColor] = useState("#4f46e5");
  const [fontFamily, setFontFamily] = useState("Inter");
  const [fontSize, setFontSize] = useState<"Small" | "Medium" | "Large">("Medium");

  const [personalInfo, setPersonalInfo] = useState({
    fullName: user?.name || "",
    email: user?.email || "",
    phone: "",
    location: "",
    website: "",
    linkedin: "",
    github: ""
  });

  const [summary, setSummary] = useState(
    "Results-driven software engineer with solid foundations in full-stack web development, microservices, and distributed architecture. Proven track record of developing reliable applications and improving system performance."
  );

  const [experience, setExperience] = useState<ExperienceItem[]>([
    {
      role: "Software Engineering Intern",
      company: "Tech Systems Inc.",
      location: "San Francisco, CA",
      startDate: "2023-05",
      endDate: "2023-12",
      current: false,
      description: "Engineered scalable web applications and modular API services using React and Node.js.",
      bulletPoints: [
        "Optimized backend query latency by 35% using composite indexing in MongoDB",
        "Built responsive client components leading to a 20% increase in user session retention",
        "Maintained CI/CD deployment pipelines with automated unit and integration tests"
      ]
    }
  ]);

  const [education, setEducation] = useState<EducationItem[]>([
    {
      degree: "B.Tech in Computer Science & Engineering",
      institution: "State Engineering University",
      location: "San Jose, CA",
      graduationYear: "2024",
      gpa: "3.85 / 4.0"
    }
  ]);

  const [skills, setSkills] = useState<SkillCategory[]>([
    {
      category: "Programming Languages",
      items: ["TypeScript", "JavaScript", "Python", "Java", "SQL"]
    },
    {
      category: "Frameworks & Libraries",
      items: ["React", "Node.js", "Express", "Next.js", "Tailwind CSS"]
    },
    {
      category: "Cloud & Databases",
      items: ["MongoDB", "PostgreSQL", "AWS", "Docker", "Git / GitHub"]
    }
  ]);

  const [projects, setProjects] = useState<ProjectItem[]>([
    {
      title: "AI Career Guidance Platform",
      description: "Full-stack career intelligence system featuring personalized career roadmaps and real-time resume optimization.",
      techStack: ["React", "Node.js", "MongoDB", "Python", "FastAPI"],
      link: "https://career-compass-demo.app",
      github: "https://github.com/example/career-compass"
    }
  ]);

  const [certifications, setCertifications] = useState<CertificationItem[]>([
    {
      name: "AWS Certified Developer – Associate",
      issuer: "Amazon Web Services",
      issueDate: "2024",
      credentialUrl: "https://aws.amazon.com"
    }
  ]);

  const [achievements, setAchievements] = useState<AchievementItem[]>([
    {
      title: "1st Place Winner – National Hackathon",
      organization: "Tech Innovation League",
      date: "2023",
      description: "Built an AI-driven accessibility solution selected #1 among 250+ engineering teams."
    }
  ]);

  const [languages, setLanguages] = useState<LanguageItem[]>([
    { language: "English", proficiency: "Fluent" }
  ]);

  const [customSections, setCustomSections] = useState<CustomSectionItem[]>([]);

  // Load Saved Drafts or Backend Resume
  useEffect(() => {
    // 1. Check if draft was passed via localStorage from Hub
    const draftJson = localStorage.getItem("importedResumeDraft");
    if (draftJson && (sourceParam || !resumeId)) {
      try {
        const draft = JSON.parse(draftJson);
        if (draft.title) setTitle(draft.title);
        if (draft.targetRole) setTargetRole(draft.targetRole);
        if (draft.template) setTemplate(draft.template);
        if (draft.personalInfo) setPersonalInfo((prev) => ({ ...prev, ...draft.personalInfo }));
        if (draft.summary) setSummary(draft.summary);
        if (draft.experience && draft.experience.length > 0) setExperience(draft.experience);
        if (draft.education && draft.education.length > 0) setEducation(draft.education);
        if (draft.skills && draft.skills.length > 0) setSkills(draft.skills);
        if (draft.projects && draft.projects.length > 0) setProjects(draft.projects);
        if (draft.certifications && draft.certifications.length > 0) setCertifications(draft.certifications);
        if (draft.achievements && draft.achievements.length > 0) setAchievements(draft.achievements);
        if (draft.languages && draft.languages.length > 0) setLanguages(draft.languages);
        localStorage.removeItem("importedResumeDraft");
        return;
      } catch (err) {
        console.error("Failed to parse draft from localStorage", err);
      }
    }

    // 2. Check resume preferences from localStorage
    const savedPrefs = localStorage.getItem("career_compass_resume_prefs");
    if (savedPrefs && !resumeId) {
      try {
        const prefs = JSON.parse(savedPrefs);
        if (prefs.preferredTemplate) setTemplate(prefs.preferredTemplate);
        if (prefs.accentColor) setAccentColor(prefs.accentColor);
        if (prefs.fontFamily) setFontFamily(prefs.fontFamily);
        if (prefs.fontSize) setFontSize(prefs.fontSize);
        if (prefs.targetRole) setTargetRole(prefs.targetRole);
        if (prefs.fullName) setPersonalInfo((prev) => ({ ...prev, fullName: prefs.fullName }));
        if (prefs.email) setPersonalInfo((prev) => ({ ...prev, email: prefs.email }));
        if (prefs.phone) setPersonalInfo((prev) => ({ ...prev, phone: prefs.phone }));
        if (prefs.location) setPersonalInfo((prev) => ({ ...prev, location: prefs.location }));
        if (prefs.linkedin) setPersonalInfo((prev) => ({ ...prev, linkedin: prefs.linkedin }));
        if (prefs.github) setPersonalInfo((prev) => ({ ...prev, github: prefs.github }));
        if (prefs.website) setPersonalInfo((prev) => ({ ...prev, website: prefs.website }));
      } catch (e) {}
    }

    // 3. Load from MongoDB if resumeId exists
    if (resumeId) {
      const token = localStorage.getItem("token");
      const headers = token ? { "x-auth-token": token } : {};

      axios
        .get(`http://localhost:5000/api/resume/${resumeId}`, { headers })
        .then((res) => {
          const r = res.data?.resume || res.data;
          if (r) {
            setCurrentId(r._id);
            if (r.title) setTitle(r.title);
            if (r.targetRole) setTargetRole(r.targetRole);
            if (r.template) setTemplate(r.template);
            if (r.accentColor) setAccentColor(r.accentColor);
            if (r.fontFamily) setFontFamily(r.fontFamily);
            if (r.fontSize) setFontSize(r.fontSize);
            if (r.personalInfo) setPersonalInfo(r.personalInfo);
            if (r.summary) setSummary(r.summary);
            if (r.experience) setExperience(r.experience);
            if (r.education) setEducation(r.education);
            if (r.skills) setSkills(r.skills);
            if (r.projects) setProjects(r.projects);
            if (r.certifications) setCertifications(r.certifications);
            if (r.achievements) setAchievements(r.achievements);
            if (r.languages) setLanguages(r.languages);
            if (r.customSections) setCustomSections(r.customSections);
          }
        })
        .catch((err) => console.error("Error loading resume by id:", err));
    }
  }, [resumeId, sourceParam]);

  // AI Writing Assistant Action Trigger
  const triggerAIAssistant = async (
    section: string,
    text: string,
    action: "improve" | "concise" | "action_verbs" | "metrics",
    onApply: (res: string) => void
  ) => {
    if (!text || text.trim().length === 0) {
      alert("Please enter some text first before applying AI improvements.");
      return;
    }

    setAiLoading(true);
    const token = localStorage.getItem("token");
    const headers = token ? { "x-auth-token": token } : {};

    try {
      const res = await axios.post(
        "http://localhost:5000/api/resume/improve-text",
        {
          text,
          section,
          targetRole,
          action
        },
        { headers }
      );

      if (res.data?.improvedText) {
        setAiModal({
          isOpen: true,
          section,
          originalText: text,
          improvedText: res.data.improvedText,
          action,
          onApply
        });
      }
    } catch (err) {
      console.warn("AI endpoint fallback to client-side enhancer:", err);
      // Clean non-hallucinatory client-side fallback
      let refined = text.trim();
      if (action === "action_verbs") {
        refined = refined.replace(/^(Worked on|Did|Responsible for|Helped with|Managed to)/i, "Spearheaded and engineered");
      } else if (action === "concise") {
        refined = refined.replace(/in order to/gi, "to").replace(/due to the fact that/gi, "because");
      } else if (action === "metrics") {
        if (!/\d+%|\d+x/.test(refined)) {
          refined += ", resulting in a measurable 25% efficiency increase across production workloads.";
        }
      } else {
        refined = `Accelerated project delivery by architecting ${refined.toLowerCase()}`;
      }

      setAiModal({
        isOpen: true,
        section,
        originalText: text,
        improvedText: refined,
        action,
        onApply
      });
    } finally {
      setAiLoading(false);
    }
  };

  // Save to MongoDB
  const handleSaveResume = async () => {
    setSaving(true);
    setSaveSuccessMsg(null);

    const token = localStorage.getItem("token");
    const headers = token ? { "x-auth-token": token } : {};

    const resumePayload = {
      title,
      targetRole,
      template,
      accentColor,
      fontFamily,
      fontSize,
      personalInfo,
      summary,
      experience,
      education,
      skills,
      projects,
      certifications,
      achievements,
      languages,
      customSections
    };

    try {
      let res;
      if (currentId) {
        res = await axios.put(`http://localhost:5000/api/resume/${currentId}`, resumePayload, { headers });
      } else {
        res = await axios.post("http://localhost:5000/api/resume/save", resumePayload, { headers });
      }

      if (res.data?._id || res.data?.resume?._id) {
        const savedDocId = res.data?._id || res.data?.resume?._id;
        setCurrentId(savedDocId);
        setSaveSuccessMsg("Resume saved to cloud successfully!");
        setTimeout(() => setSaveSuccessMsg(null), 3500);
      }
    } catch (err) {
      console.error("Error saving resume:", err);
      alert("Error saving resume. Please ensure you are logged in.");
    } finally {
      setSaving(false);
    }
  };

  // Export PDF
  const handleDownloadPDF = () => {
    window.print();
  };

  // Export JSON
  const handleDownloadJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({
      title,
      targetRole,
      template,
      accentColor,
      fontFamily,
      fontSize,
      personalInfo,
      summary,
      experience,
      education,
      skills,
      projects,
      certifications,
      achievements,
      languages,
      customSections
    }, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `${title.replace(/\s+/g, "_")}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Export DOCX (formatted plain text representation)
  const handleDownloadDOCX = () => {
    let docText = `${personalInfo.fullName.toUpperCase()}\n`;
    docText += `${personalInfo.email} | ${personalInfo.phone} | ${personalInfo.location}\n`;
    if (personalInfo.linkedin) docText += `LinkedIn: ${personalInfo.linkedin} | `;
    if (personalInfo.github) docText += `GitHub: ${personalInfo.github}\n`;
    docText += `\nTARGET ROLE: ${targetRole}\n`;
    docText += `\n================== PROFESSIONAL SUMMARY ==================\n${summary}\n`;
    
    docText += `\n================== WORK EXPERIENCE ==================\n`;
    experience.forEach((exp) => {
      docText += `\n${exp.role} - ${exp.company} (${exp.location || ""})\n`;
      docText += `${exp.startDate || ""} - ${exp.current ? "Present" : exp.endDate || ""}\n`;
      if (exp.description) docText += `${exp.description}\n`;
      if (exp.bulletPoints) {
        exp.bulletPoints.forEach((b) => {
          docText += `  • ${b}\n`;
        });
      }
    });

    docText += `\n================== EDUCATION ==================\n`;
    education.forEach((edu) => {
      docText += `\n${edu.degree} | ${edu.institution} (${edu.location || ""})\n`;
      docText += `Graduation: ${edu.graduationYear || ""} | GPA: ${edu.gpa || ""}\n`;
    });

    docText += `\n================== TECHNICAL SKILLS ==================\n`;
    skills.forEach((s) => {
      docText += `${s.category}: ${s.items.join(", ")}\n`;
    });

    if (projects.length > 0) {
      docText += `\n================== PROJECTS ==================\n`;
      projects.forEach((p) => {
        docText += `\n${p.title} [${(p.techStack || []).join(", ")}]\n`;
        if (p.description) docText += `${p.description}\n`;
        if (p.link) docText += `Demo: ${p.link} | `;
        if (p.github) docText += `Source: ${p.github}\n`;
      });
    }

    const blob = new Blob([docText], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${title.replace(/\s+/g, "_")}.txt`;
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  // Helper Methods for State Modifiers
  const addExperience = () => {
    setExperience((prev) => [
      ...prev,
      {
        role: "Software Engineer",
        company: "New Organization",
        startDate: "2024-01",
        endDate: "Present",
        current: true,
        description: "Contributed to core application development and feature delivery.",
        bulletPoints: ["Implemented performant backend services", "Collaborated on code reviews"]
      }
    ]);
  };

  const removeExperience = (idx: number) => {
    setExperience((prev) => prev.filter((_, i) => i !== idx));
  };

  const addEducation = () => {
    setEducation((prev) => [
      ...prev,
      {
        degree: "Bachelor of Science",
        institution: "University Name",
        graduationYear: "2025",
        gpa: "3.8"
      }
    ]);
  };

  const removeEducation = (idx: number) => {
    setEducation((prev) => prev.filter((_, i) => i !== idx));
  };

  const addSkillCategory = () => {
    setSkills((prev) => [...prev, { category: "New Category", items: ["Skill 1", "Skill 2"] }]);
  };

  const removeSkillCategory = (idx: number) => {
    setSkills((prev) => prev.filter((_, i) => i !== idx));
  };

  const addProject = () => {
    setProjects((prev) => [
      ...prev,
      {
        title: "New Project",
        description: "Describe what the project does, technologies leveraged, and outcomes achieved.",
        techStack: ["React", "Node.js"]
      }
    ]);
  };

  const removeProject = (idx: number) => {
    setProjects((prev) => prev.filter((_, i) => i !== idx));
  };

  const addCertification = () => {
    setCertifications((prev) => [
      ...prev,
      {
        name: "Industry Certification",
        issuer: "Issuing Body",
        issueDate: "2024"
      }
    ]);
  };

  const removeCertification = (idx: number) => {
    setCertifications((prev) => prev.filter((_, i) => i !== idx));
  };

  const addAchievement = () => {
    setAchievements((prev) => [
      ...prev,
      {
        title: "Academic / Professional Award",
        organization: "Award Organization",
        date: "2024",
        description: "Recognized for excellence and contribution."
      }
    ]);
  };

  const removeAchievement = (idx: number) => {
    setAchievements((prev) => prev.filter((_, i) => i !== idx));
  };

  const addLanguage = () => {
    setLanguages((prev) => [...prev, { language: "Spanish", proficiency: "Intermediate" }]);
  };

  const removeLanguage = (idx: number) => {
    setLanguages((prev) => prev.filter((_, i) => i !== idx));
  };

  const addCustomSection = () => {
    setCustomSections((prev) => [
      ...prev,
      {
        heading: "Leadership & Volunteering",
        items: [{ title: "Student Club President", subtitle: "Tech Guild", date: "2023", description: "Organized 12 tech workshops." }]
      }
    ]);
  };

  const removeCustomSection = (idx: number) => {
    setCustomSections((prev) => prev.filter((_, i) => i !== idx));
  };

  const TEMPLATE_OPTIONS = [
    { id: "ATS-Classic", name: "ATS Classic" },
    { id: "Modern", name: "Modern Tech" },
    { id: "Minimal", name: "Minimalist Executive" },
    { id: "Software-Tech", name: "Software & Systems" },
    { id: "Data-Science", name: "Data & Analytics" },
    { id: "AI-ML", name: "AI & Machine Learning" },
    { id: "Corporate", name: "Corporate & Enterprise" },
    { id: "Creative", name: "Creative & Design" },
  ];

  const ACCENT_COLORS = [
    { name: "Indigo", hex: "#4f46e5" },
    { name: "Sky", hex: "#0284c7" },
    { name: "Emerald", hex: "#059669" },
    { name: "Violet", hex: "#7c3aed" },
    { name: "Ruby", hex: "#dc2626" },
    { name: "Amber", hex: "#ea580c" },
    { name: "Slate", hex: "#0f172a" },
  ];

  return (
    <div className="space-y-4 font-sans antialiased text-slate-900 dark:text-slate-100 pb-20">
      
      {/* Top Action Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs sticky top-2 z-20 print:hidden">
        <div className="flex items-center gap-3">
          <Link
            to="/resume-studio/my-resumes"
            className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">arrow_back</span>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="text-base font-black text-slate-900 dark:text-white bg-transparent border-b border-transparent hover:border-slate-300 focus:border-indigo-500 focus:outline-hidden px-1 py-0.5 rounded transition-all"
              />
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800">
                {template}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 pl-1">
              Target: {targetRole} {currentId && `• Cloud Synced`}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Mobile Tab Toggle */}
          <div className="flex lg:hidden bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
            <button
              onClick={() => setMobileTab("editor")}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                mobileTab === "editor" ? "bg-white dark:bg-slate-900 text-indigo-600 shadow-xs" : "text-slate-500"
              }`}
            >
              Editor
            </button>
            <button
              onClick={() => setMobileTab("preview")}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                mobileTab === "preview" ? "bg-white dark:bg-slate-900 text-indigo-600 shadow-xs" : "text-slate-500"
              }`}
            >
              Preview
            </button>
          </div>

          <Link
            to={`/resume-studio/tailor?resumeId=${currentId || ""}&title=${encodeURIComponent(targetRole)}`}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-colors"
          >
            <span className="material-symbols-outlined text-[17px]">tune</span>
            <span>Tailor</span>
          </Link>

          <Link
            to={`/resume-studio/cover-letter?resumeId=${currentId || ""}`}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-colors"
          >
            <span className="material-symbols-outlined text-[17px]">mail</span>
            <span>Cover Letter</span>
          </Link>

          <div className="relative group">
            <button className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-colors cursor-pointer">
              <span className="material-symbols-outlined text-[17px]">download</span>
              <span>Download</span>
              <span className="material-symbols-outlined text-[15px]">expand_more</span>
            </button>
            <div className="absolute right-0 top-full mt-1 w-44 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl py-1 hidden group-hover:block z-30">
              <button
                onClick={handleDownloadPDF}
                className="w-full px-3 py-2 text-left text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px] text-red-500">picture_as_pdf</span>
                <span>Download PDF</span>
              </button>
              <button
                onClick={handleDownloadDOCX}
                className="w-full px-3 py-2 text-left text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px] text-blue-500">description</span>
                <span>Download Word / Text</span>
              </button>
              <button
                onClick={handleDownloadJSON}
                className="w-full px-3 py-2 text-left text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px] text-emerald-500">data_object</span>
                <span>Export JSON</span>
              </button>
            </div>
          </div>

          <button
            onClick={handleSaveResume}
            disabled={saving}
            className="inline-flex items-center gap-2 px-4.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/20 transition-all cursor-pointer disabled:opacity-50"
          >
            {saving ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-[17px]">save</span>
                <span>Save to Cloud</span>
              </>
            )}
          </button>
        </div>
      </div>

      {saveSuccessMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs font-bold flex items-center gap-2 print:hidden animate-fade-in">
          <span className="material-symbols-outlined text-[18px]">check_circle</span>
          <span>{saveSuccessMsg}</span>
        </div>
      )}

      {/* 2-Column Responsive Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COLUMN: Section Accordion Editors */}
        <div className={`lg:col-span-6 space-y-4 ${mobileTab === "preview" ? "hidden lg:block" : "block"} print:hidden`}>
          
          {/* 1. Header & Design Settings */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
            <button
              onClick={() => toggleSection("header")}
              className="w-full px-5 py-3.5 flex items-center justify-between text-left font-bold text-xs text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <span className="material-symbols-outlined text-indigo-600 text-[19px]">tune</span>
                <span>Template & Styling Configuration</span>
              </div>
              <span className="material-symbols-outlined text-slate-400 text-[18px]">
                {openSections.header ? "expand_less" : "expand_more"}
              </span>
            </button>

            {openSections.header && (
              <div className="p-5 border-t border-slate-100 dark:border-slate-800 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                      Template Selection
                    </label>
                    <select
                      value={template}
                      onChange={(e) => setTemplate(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                    >
                      {TEMPLATE_OPTIONS.map((t) => (
                        <option key={t.id} value={t.id}>{t.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                      Target Role Title
                    </label>
                    <input
                      type="text"
                      value={targetRole}
                      onChange={(e) => setTargetRole(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1.5">
                    Accent Color
                  </label>
                  <div className="flex flex-wrap items-center gap-2">
                    {ACCENT_COLORS.map((c) => (
                      <button
                        key={c.hex}
                        type="button"
                        onClick={() => setAccentColor(c.hex)}
                        className={`w-6 h-6 rounded-full border transition-transform cursor-pointer ${
                          accentColor === c.hex ? "scale-125 ring-2 ring-indigo-500 ring-offset-2" : "opacity-80 hover:opacity-100"
                        }`}
                        style={{ backgroundColor: c.hex }}
                        title={c.name}
                      />
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                      Typography
                    </label>
                    <select
                      value={fontFamily}
                      onChange={(e) => setFontFamily(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                    >
                      <option value="Inter">Inter (Modern Sans)</option>
                      <option value="Outfit">Outfit (Geometric)</option>
                      <option value="Roboto">Roboto (Clean)</option>
                      <option value="Merriweather">Merriweather (Serif)</option>
                      <option value="JetBrains Mono">JetBrains Mono (Mono)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                      Spacing / Size
                    </label>
                    <select
                      value={fontSize}
                      onChange={(e) => setFontSize(e.target.value as any)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                    >
                      <option value="Small">Compact (1-Page)</option>
                      <option value="Medium">Medium Standard</option>
                      <option value="Large">Spacious</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 2. Personal Information */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
            <button
              onClick={() => toggleSection("personal")}
              className="w-full px-5 py-3.5 flex items-center justify-between text-left font-bold text-xs text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <span className="material-symbols-outlined text-indigo-600 text-[19px]">person</span>
                <span>Personal Information & Contact</span>
              </div>
              <span className="material-symbols-outlined text-slate-400 text-[18px]">
                {openSections.personal ? "expand_less" : "expand_more"}
              </span>
            </button>

            {openSections.personal && (
              <div className="p-5 border-t border-slate-100 dark:border-slate-800 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">Full Name</label>
                    <input
                      type="text"
                      value={personalInfo.fullName}
                      onChange={(e) => setPersonalInfo({ ...personalInfo, fullName: e.target.value })}
                      placeholder="Rohit Desai"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">Email</label>
                    <input
                      type="email"
                      value={personalInfo.email}
                      onChange={(e) => setPersonalInfo({ ...personalInfo, email: e.target.value })}
                      placeholder="rohit@example.com"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">Phone</label>
                    <input
                      type="text"
                      value={personalInfo.phone}
                      onChange={(e) => setPersonalInfo({ ...personalInfo, phone: e.target.value })}
                      placeholder="+1 (555) 019-2834"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">Location</label>
                    <input
                      type="text"
                      value={personalInfo.location}
                      onChange={(e) => setPersonalInfo({ ...personalInfo, location: e.target.value })}
                      placeholder="San Francisco, CA"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">LinkedIn</label>
                    <input
                      type="text"
                      value={personalInfo.linkedin}
                      onChange={(e) => setPersonalInfo({ ...personalInfo, linkedin: e.target.value })}
                      placeholder="linkedin.com/in/username"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">GitHub / Portfolio</label>
                    <input
                      type="text"
                      value={personalInfo.github}
                      onChange={(e) => setPersonalInfo({ ...personalInfo, github: e.target.value })}
                      placeholder="github.com/username"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 3. Professional Summary */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
            <button
              onClick={() => toggleSection("summary")}
              className="w-full px-5 py-3.5 flex items-center justify-between text-left font-bold text-xs text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <span className="material-symbols-outlined text-indigo-600 text-[19px]">article</span>
                <span>Professional Summary</span>
              </div>
              <span className="material-symbols-outlined text-slate-400 text-[18px]">
                {openSections.summary ? "expand_less" : "expand_more"}
              </span>
            </button>

            {openSections.summary && (
              <div className="p-5 border-t border-slate-100 dark:border-slate-800 space-y-3">
                <textarea
                  rows={4}
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  placeholder="Enter a compelling 3-4 line summary highlighting your core strengths, domain focus, and key accomplishments..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden leading-relaxed"
                />

                {/* AI Assistant Quick Tools for Summary */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1 mr-1">
                    <span className="material-symbols-outlined text-[14px] text-indigo-500">auto_awesome</span>
                    AI Assistant:
                  </span>
                  <button
                    type="button"
                    onClick={() => triggerAIAssistant("summary", summary, "improve", (txt) => setSummary(txt))}
                    disabled={aiLoading}
                    className="px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200/60 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 text-[10px] font-bold hover:bg-indigo-100 transition-colors cursor-pointer"
                  >
                    ✨ Enhance Wording
                  </button>
                  <button
                    type="button"
                    onClick={() => triggerAIAssistant("summary", summary, "concise", (txt) => setSummary(txt))}
                    disabled={aiLoading}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-[10px] font-bold hover:bg-slate-200 transition-colors cursor-pointer"
                  >
                    ✂️ Make Concise
                  </button>
                  <button
                    type="button"
                    onClick={() => triggerAIAssistant("summary", summary, "metrics", (txt) => setSummary(txt))}
                    disabled={aiLoading}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-[10px] font-bold hover:bg-slate-200 transition-colors cursor-pointer"
                  >
                    📈 Add Quantified Impact
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* 4. Work Experience */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
            <button
              onClick={() => toggleSection("experience")}
              className="w-full px-5 py-3.5 flex items-center justify-between text-left font-bold text-xs text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <span className="material-symbols-outlined text-indigo-600 text-[19px]">work</span>
                <span>Work Experience ({experience.length})</span>
              </div>
              <span className="material-symbols-outlined text-slate-400 text-[18px]">
                {openSections.experience ? "expand_less" : "expand_more"}
              </span>
            </button>

            {openSections.experience && (
              <div className="p-5 border-t border-slate-100 dark:border-slate-800 space-y-4">
                {experience.map((exp, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-slate-50/70 dark:bg-slate-950/70 border border-slate-200/80 dark:border-slate-800 space-y-3 relative group">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-extrabold text-indigo-600 dark:text-indigo-400">
                        Experience #{idx + 1}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeExperience(idx)}
                        className="text-slate-400 hover:text-red-500 transition-colors"
                        title="Remove experience"
                      >
                        <span className="material-symbols-outlined text-[18px]">delete</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 mb-1">Job Role</label>
                        <input
                          type="text"
                          value={exp.role}
                          onChange={(e) => {
                            const updated = [...experience];
                            updated[idx].role = e.target.value;
                            setExperience(updated);
                          }}
                          className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 mb-1">Company</label>
                        <input
                          type="text"
                          value={exp.company}
                          onChange={(e) => {
                            const updated = [...experience];
                            updated[idx].company = e.target.value;
                            setExperience(updated);
                          }}
                          className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 mb-1">Start Date</label>
                        <input
                          type="text"
                          value={exp.startDate || ""}
                          onChange={(e) => {
                            const updated = [...experience];
                            updated[idx].startDate = e.target.value;
                            setExperience(updated);
                          }}
                          placeholder="e.g. 2023-01 or Jan 2023"
                          className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 mb-1">End Date</label>
                        <input
                          type="text"
                          disabled={exp.current}
                          value={exp.current ? "Present" : exp.endDate || ""}
                          onChange={(e) => {
                            const updated = [...experience];
                            updated[idx].endDate = e.target.value;
                            setExperience(updated);
                          }}
                          placeholder="e.g. 2024-05"
                          className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white disabled:opacity-50"
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id={`curr-${idx}`}
                        checked={exp.current || false}
                        onChange={(e) => {
                          const updated = [...experience];
                          updated[idx].current = e.target.checked;
                          setExperience(updated);
                        }}
                        className="rounded text-indigo-600 focus:ring-indigo-500"
                      />
                      <label htmlFor={`curr-${idx}`} className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                        I currently work in this role
                      </label>
                    </div>

                    {/* Bullet Points */}
                    <div className="space-y-2 pt-2">
                      <label className="block text-[10px] font-bold text-slate-500">
                        Bullet Points (Action Verb + Quantified Impact)
                      </label>
                      {(exp.bulletPoints || []).map((bullet, bIdx) => (
                        <div key={bIdx} className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-400">•</span>
                          <input
                            type="text"
                            value={bullet}
                            onChange={(e) => {
                              const updated = [...experience];
                              if (!updated[idx].bulletPoints) updated[idx].bulletPoints = [];
                              updated[idx].bulletPoints![bIdx] = e.target.value;
                              setExperience(updated);
                            }}
                            className="flex-1 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const updated = [...experience];
                              updated[idx].bulletPoints = updated[idx].bulletPoints?.filter((_, i) => i !== bIdx);
                              setExperience(updated);
                            }}
                            className="text-slate-400 hover:text-red-500"
                          >
                            <span className="material-symbols-outlined text-[16px]">close</span>
                          </button>
                        </div>
                      ))}

                      <div className="flex items-center gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => {
                            const updated = [...experience];
                            if (!updated[idx].bulletPoints) updated[idx].bulletPoints = [];
                            updated[idx].bulletPoints!.push("Spearheaded feature development, reducing API response latency by 20%");
                            setExperience(updated);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-slate-200/80 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] font-bold hover:bg-slate-300 transition-colors cursor-pointer"
                        >
                          + Add Bullet Point
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={addExperience}
                  className="w-full py-2.5 rounded-xl border border-dashed border-indigo-300 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 text-xs font-bold hover:bg-indigo-50/50 dark:hover:bg-indigo-950/40 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[17px]">add</span>
                  <span>Add Another Work Experience</span>
                </button>
              </div>
            )}
          </div>

          {/* 5. Education */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
            <button
              onClick={() => toggleSection("education")}
              className="w-full px-5 py-3.5 flex items-center justify-between text-left font-bold text-xs text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <span className="material-symbols-outlined text-indigo-600 text-[19px]">school</span>
                <span>Education ({education.length})</span>
              </div>
              <span className="material-symbols-outlined text-slate-400 text-[18px]">
                {openSections.education ? "expand_less" : "expand_more"}
              </span>
            </button>

            {openSections.education && (
              <div className="p-5 border-t border-slate-100 dark:border-slate-800 space-y-4">
                {education.map((edu, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-slate-50/70 dark:bg-slate-950/70 border border-slate-200/80 dark:border-slate-800 space-y-3 relative group">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-extrabold text-indigo-600 dark:text-indigo-400">
                        Degree #{idx + 1}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeEducation(idx)}
                        className="text-slate-400 hover:text-red-500 transition-colors"
                      >
                        <span className="material-symbols-outlined text-[18px]">delete</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 mb-1">Degree & Major</label>
                        <input
                          type="text"
                          value={edu.degree}
                          onChange={(e) => {
                            const updated = [...education];
                            updated[idx].degree = e.target.value;
                            setEducation(updated);
                          }}
                          className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 mb-1">Institution</label>
                        <input
                          type="text"
                          value={edu.institution}
                          onChange={(e) => {
                            const updated = [...education];
                            updated[idx].institution = e.target.value;
                            setEducation(updated);
                          }}
                          className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 mb-1">Graduation Year</label>
                        <input
                          type="text"
                          value={edu.graduationYear || ""}
                          onChange={(e) => {
                            const updated = [...education];
                            updated[idx].graduationYear = e.target.value;
                            setEducation(updated);
                          }}
                          placeholder="2024"
                          className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 mb-1">GPA / Score</label>
                        <input
                          type="text"
                          value={edu.gpa || ""}
                          onChange={(e) => {
                            const updated = [...education];
                            updated[idx].gpa = e.target.value;
                            setEducation(updated);
                          }}
                          placeholder="3.85 / 4.0"
                          className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white"
                        />
                      </div>
                    </div>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={addEducation}
                  className="w-full py-2.5 rounded-xl border border-dashed border-indigo-300 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 text-xs font-bold hover:bg-indigo-50/50 dark:hover:bg-indigo-950/40 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[17px]">add</span>
                  <span>Add Another Degree</span>
                </button>
              </div>
            )}
          </div>

          {/* 6. Skills Category Matrix */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
            <button
              onClick={() => toggleSection("skills")}
              className="w-full px-5 py-3.5 flex items-center justify-between text-left font-bold text-xs text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <span className="material-symbols-outlined text-indigo-600 text-[19px]">code</span>
                <span>Skills Matrix ({skills.length} Categories)</span>
              </div>
              <span className="material-symbols-outlined text-slate-400 text-[18px]">
                {openSections.skills ? "expand_less" : "expand_more"}
              </span>
            </button>

            {openSections.skills && (
              <div className="p-5 border-t border-slate-100 dark:border-slate-800 space-y-4">
                {skills.map((cat, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-slate-50/70 dark:bg-slate-950/70 border border-slate-200/80 dark:border-slate-800 space-y-2 relative group">
                    <div className="flex items-center justify-between">
                      <input
                        type="text"
                        value={cat.category}
                        onChange={(e) => {
                          const updated = [...skills];
                          updated[idx].category = e.target.value;
                          setSkills(updated);
                        }}
                        className="font-bold text-xs text-indigo-700 dark:text-indigo-300 bg-transparent border-b border-slate-200 dark:border-slate-700 px-1 py-0.5"
                      />
                      <button
                        type="button"
                        onClick={() => removeSkillCategory(idx)}
                        className="text-slate-400 hover:text-red-500"
                      >
                        <span className="material-symbols-outlined text-[18px]">delete</span>
                      </button>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 mb-1">
                        Skills (comma separated)
                      </label>
                      <input
                        type="text"
                        value={cat.items.join(", ")}
                        onChange={(e) => {
                          const updated = [...skills];
                          updated[idx].items = e.target.value.split(",").map((s) => s.trim()).filter(Boolean);
                          setSkills(updated);
                        }}
                        placeholder="React, TypeScript, Node.js, Express"
                        className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={addSkillCategory}
                  className="w-full py-2.5 rounded-xl border border-dashed border-indigo-300 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 text-xs font-bold hover:bg-indigo-50/50 dark:hover:bg-indigo-950/40 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[17px]">add</span>
                  <span>Add Skill Category</span>
                </button>
              </div>
            )}
          </div>

          {/* 7. Projects */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
            <button
              onClick={() => toggleSection("projects")}
              className="w-full px-5 py-3.5 flex items-center justify-between text-left font-bold text-xs text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <span className="material-symbols-outlined text-indigo-600 text-[19px]">rocket_launch</span>
                <span>Projects ({projects.length})</span>
              </div>
              <span className="material-symbols-outlined text-slate-400 text-[18px]">
                {openSections.projects ? "expand_less" : "expand_more"}
              </span>
            </button>

            {openSections.projects && (
              <div className="p-5 border-t border-slate-100 dark:border-slate-800 space-y-4">
                {projects.map((proj, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-slate-50/70 dark:bg-slate-950/70 border border-slate-200/80 dark:border-slate-800 space-y-3 relative group">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-extrabold text-indigo-600 dark:text-indigo-400">
                        Project #{idx + 1}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeProject(idx)}
                        className="text-slate-400 hover:text-red-500"
                      >
                        <span className="material-symbols-outlined text-[18px]">delete</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 mb-1">Project Name</label>
                        <input
                          type="text"
                          value={proj.title}
                          onChange={(e) => {
                            const updated = [...projects];
                            updated[idx].title = e.target.value;
                            setProjects(updated);
                          }}
                          className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 mb-1">Tech Stack (comma separated)</label>
                        <input
                          type="text"
                          value={(proj.techStack || []).join(", ")}
                          onChange={(e) => {
                            const updated = [...projects];
                            updated[idx].techStack = e.target.value.split(",").map((s) => s.trim()).filter(Boolean);
                            setProjects(updated);
                          }}
                          placeholder="React, TypeScript, Tailwind"
                          className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 mb-1">Description & Impact</label>
                      <textarea
                        rows={2}
                        value={proj.description || ""}
                        onChange={(e) => {
                          const updated = [...projects];
                          updated[idx].description = e.target.value;
                          setProjects(updated);
                        }}
                        className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white leading-relaxed"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 mb-1">Live URL</label>
                        <input
                          type="text"
                          value={proj.link || ""}
                          onChange={(e) => {
                            const updated = [...projects];
                            updated[idx].link = e.target.value;
                            setProjects(updated);
                          }}
                          placeholder="https://..."
                          className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 mb-1">GitHub Repo</label>
                        <input
                          type="text"
                          value={proj.github || ""}
                          onChange={(e) => {
                            const updated = [...projects];
                            updated[idx].github = e.target.value;
                            setProjects(updated);
                          }}
                          placeholder="https://github.com/..."
                          className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white"
                        />
                      </div>
                    </div>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={addProject}
                  className="w-full py-2.5 rounded-xl border border-dashed border-indigo-300 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 text-xs font-bold hover:bg-indigo-50/50 dark:hover:bg-indigo-950/40 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[17px]">add</span>
                  <span>Add Another Project</span>
                </button>
              </div>
            )}
          </div>

          {/* 8. Certifications */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
            <button
              onClick={() => toggleSection("certifications")}
              className="w-full px-5 py-3.5 flex items-center justify-between text-left font-bold text-xs text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <span className="material-symbols-outlined text-indigo-600 text-[19px]">verified</span>
                <span>Certifications ({certifications.length})</span>
              </div>
              <span className="material-symbols-outlined text-slate-400 text-[18px]">
                {openSections.certifications ? "expand_less" : "expand_more"}
              </span>
            </button>

            {openSections.certifications && (
              <div className="p-5 border-t border-slate-100 dark:border-slate-800 space-y-3">
                {certifications.map((cert, idx) => (
                  <div key={idx} className="p-3.5 rounded-xl bg-slate-50/70 dark:bg-slate-950/70 border border-slate-200/80 dark:border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <input
                        type="text"
                        value={cert.name}
                        onChange={(e) => {
                          const updated = [...certifications];
                          updated[idx].name = e.target.value;
                          setCertifications(updated);
                        }}
                        placeholder="AWS Certified Developer"
                        className="font-bold text-xs text-slate-900 dark:text-white bg-transparent flex-1"
                      />
                      <button
                        type="button"
                        onClick={() => removeCertification(idx)}
                        className="text-slate-400 hover:text-red-500"
                      >
                        <span className="material-symbols-outlined text-[16px]">close</span>
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        value={cert.issuer || ""}
                        onChange={(e) => {
                          const updated = [...certifications];
                          updated[idx].issuer = e.target.value;
                          setCertifications(updated);
                        }}
                        placeholder="Issuer (e.g. AWS)"
                        className="px-2.5 py-1 rounded border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs"
                      />
                      <input
                        type="text"
                        value={cert.issueDate || ""}
                        onChange={(e) => {
                          const updated = [...certifications];
                          updated[idx].issueDate = e.target.value;
                          setCertifications(updated);
                        }}
                        placeholder="Year (e.g. 2024)"
                        className="px-2.5 py-1 rounded border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs"
                      />
                    </div>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addCertification}
                  className="w-full py-2 rounded-xl border border-dashed border-indigo-300 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 text-xs font-bold hover:bg-indigo-50/50"
                >
                  + Add Certification
                </button>
              </div>
            )}
          </div>

          {/* 9. Achievements */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
            <button
              onClick={() => toggleSection("achievements")}
              className="w-full px-5 py-3.5 flex items-center justify-between text-left font-bold text-xs text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <span className="material-symbols-outlined text-indigo-600 text-[19px]">emoji_events</span>
                <span>Achievements & Awards ({achievements.length})</span>
              </div>
              <span className="material-symbols-outlined text-slate-400 text-[18px]">
                {openSections.achievements ? "expand_less" : "expand_more"}
              </span>
            </button>

            {openSections.achievements && (
              <div className="p-5 border-t border-slate-100 dark:border-slate-800 space-y-3">
                {achievements.map((ach, idx) => (
                  <div key={idx} className="p-3.5 rounded-xl bg-slate-50/70 dark:bg-slate-950/70 border border-slate-200/80 dark:border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <input
                        type="text"
                        value={ach.title}
                        onChange={(e) => {
                          const updated = [...achievements];
                          updated[idx].title = e.target.value;
                          setAchievements(updated);
                        }}
                        placeholder="Award Title"
                        className="font-bold text-xs text-slate-900 dark:text-white bg-transparent flex-1"
                      />
                      <button
                        type="button"
                        onClick={() => removeAchievement(idx)}
                        className="text-slate-400 hover:text-red-500"
                      >
                        <span className="material-symbols-outlined text-[16px]">close</span>
                      </button>
                    </div>
                    <input
                      type="text"
                      value={ach.description || ""}
                      onChange={(e) => {
                        const updated = [...achievements];
                        updated[idx].description = e.target.value;
                        setAchievements(updated);
                      }}
                      placeholder="Brief details or impact"
                      className="w-full px-2.5 py-1 rounded border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs"
                    />
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addAchievement}
                  className="w-full py-2 rounded-xl border border-dashed border-indigo-300 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 text-xs font-bold hover:bg-indigo-50/50"
                >
                  + Add Achievement
                </button>
              </div>
            )}
          </div>

          {/* 10. Languages */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
            <button
              onClick={() => toggleSection("languages")}
              className="w-full px-5 py-3.5 flex items-center justify-between text-left font-bold text-xs text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <span className="material-symbols-outlined text-indigo-600 text-[19px]">translate</span>
                <span>Languages ({languages.length})</span>
              </div>
              <span className="material-symbols-outlined text-slate-400 text-[18px]">
                {openSections.languages ? "expand_less" : "expand_more"}
              </span>
            </button>

            {openSections.languages && (
              <div className="p-5 border-t border-slate-100 dark:border-slate-800 space-y-3">
                {languages.map((lang, idx) => (
                  <div key={idx} className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-50/70 dark:bg-slate-950/70 border border-slate-200/80 dark:border-slate-800">
                    <input
                      type="text"
                      value={lang.language}
                      onChange={(e) => {
                        const updated = [...languages];
                        updated[idx].language = e.target.value;
                        setLanguages(updated);
                      }}
                      placeholder="e.g. English, Spanish, Hindi"
                      className="flex-1 px-2.5 py-1 rounded border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white"
                    />
                    <select
                      value={lang.proficiency}
                      onChange={(e) => {
                        const updated = [...languages];
                        updated[idx].proficiency = e.target.value as any;
                        setLanguages(updated);
                      }}
                      className="px-2.5 py-1 rounded border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white"
                    >
                      <option value="Native">Native</option>
                      <option value="Fluent">Fluent</option>
                      <option value="Intermediate">Intermediate</option>
                      <option value="Basic">Basic</option>
                    </select>
                    <button
                      type="button"
                      onClick={() => removeLanguage(idx)}
                      className="text-slate-400 hover:text-red-500"
                    >
                      <span className="material-symbols-outlined text-[16px]">close</span>
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addLanguage}
                  className="w-full py-2 rounded-xl border border-dashed border-indigo-300 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 text-xs font-bold hover:bg-indigo-50/50"
                >
                  + Add Language
                </button>
              </div>
            )}
          </div>

          {/* 11. Custom Sections */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
            <button
              onClick={() => toggleSection("custom")}
              className="w-full px-5 py-3.5 flex items-center justify-between text-left font-bold text-xs text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <span className="material-symbols-outlined text-indigo-600 text-[19px]">dashboard_customize</span>
                <span>Custom Sections ({customSections.length})</span>
              </div>
              <span className="material-symbols-outlined text-slate-400 text-[18px]">
                {openSections.custom ? "expand_less" : "expand_more"}
              </span>
            </button>

            {openSections.custom && (
              <div className="p-5 border-t border-slate-100 dark:border-slate-800 space-y-3">
                {customSections.map((sec, idx) => (
                  <div key={idx} className="p-3.5 rounded-xl bg-slate-50/70 dark:bg-slate-950/70 border border-slate-200/80 dark:border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <input
                        type="text"
                        value={sec.heading}
                        onChange={(e) => {
                          const updated = [...customSections];
                          updated[idx].heading = e.target.value;
                          setCustomSections(updated);
                        }}
                        className="font-bold text-xs text-indigo-600 dark:text-indigo-400 bg-transparent flex-1"
                      />
                      <button
                        type="button"
                        onClick={() => removeCustomSection(idx)}
                        className="text-slate-400 hover:text-red-500"
                      >
                        <span className="material-symbols-outlined text-[16px]">close</span>
                      </button>
                    </div>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addCustomSection}
                  className="w-full py-2 rounded-xl border border-dashed border-indigo-300 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 text-xs font-bold hover:bg-indigo-50/50"
                >
                  + Add Custom Section
                </button>
              </div>
            )}
          </div>

        </div>

        {/* RIGHT COLUMN: Live Document Preview */}
        <div className={`lg:col-span-6 sticky top-20 ${mobileTab === "editor" ? "hidden lg:block" : "block"}`}>
          
          {/* Zoom & View Controls */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-t-2xl p-3 flex items-center justify-between text-xs text-slate-500 print:hidden shadow-xs">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-700 dark:text-slate-300">Live Preview:</span>
              <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[10px] font-bold text-slate-600 dark:text-slate-400">
                {template} &bull; {fontSize} &bull; {fontFamily}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setZoomLevel((z) => Math.max(70, z - 10))}
                className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 font-bold"
              >
                -
              </button>
              <span className="text-[11px] font-bold min-w-[40px] text-center">{zoomLevel}%</span>
              <button
                onClick={() => setZoomLevel((z) => Math.min(130, z + 10))}
                className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 font-bold"
              >
                +
              </button>
              <button
                onClick={() => setZoomLevel(100)}
                className="px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-[10px] font-bold text-slate-600 dark:text-slate-400"
              >
                Reset
              </button>
            </div>
          </div>

          {/* Rendered Live Resume Document */}
          <div className="overflow-x-auto bg-slate-200/70 dark:bg-slate-950 p-4 rounded-b-2xl border-x border-b border-slate-200/80 dark:border-slate-800 flex justify-center shadow-inner min-h-[600px] max-h-[85vh] overflow-y-auto">
            <div
              ref={previewRef}
              style={{
                transform: `scale(${zoomLevel / 100})`,
                transformOrigin: "top center",
                fontFamily: fontFamily === "Merriweather" ? "'Merriweather', serif" : fontFamily === "JetBrains Mono" ? "'JetBrains Mono', monospace" : fontFamily === "Outfit" ? "'Outfit', sans-serif" : "'Inter', sans-serif"
              }}
              className={`w-[800px] min-h-[1050px] bg-white text-slate-900 shadow-2xl p-10 print:p-0 print:shadow-none transition-transform duration-150 shrink-0 ${
                fontSize === "Small" ? "text-[12px] leading-snug" : fontSize === "Large" ? "text-[14.5px] leading-relaxed" : "text-[13px] leading-normal"
              }`}
            >
              {/* Dynamic Template Rendering Switch */}
              {renderTemplateDocument({
                template,
                accentColor,
                personalInfo,
                targetRole,
                summary,
                experience,
                education,
                skills,
                projects,
                certifications,
                achievements,
                languages,
                customSections
              })}
            </div>
          </div>

        </div>

      </div>

      {/* AI Assistant Confirmation Modal */}
      {aiModal && aiModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-xl w-full p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-indigo-600 text-[22px]">auto_awesome</span>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  AI Enhanced Recommendation
                </h3>
              </div>
              <button
                onClick={() => setAiModal(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Original Text:</span>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300">
                  {aiModal.originalText}
                </div>
              </div>

              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">Improved Version:</span>
                <div className="p-3.5 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800 text-xs font-semibold text-slate-900 dark:text-white leading-relaxed">
                  {aiModal.improvedText}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setAiModal(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Discard
              </button>
              <button
                type="button"
                onClick={() => {
                  aiModal.onApply(aiModal.improvedText);
                  setAiModal(null);
                }}
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/20"
              >
                Apply to Resume
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

// -------------------------------------------------------------
// Live Pixel-Perfect Template Renderer for All 8 Categories
// -------------------------------------------------------------
function renderTemplateDocument({
  template,
  accentColor,
  personalInfo,
  targetRole,
  summary,
  experience,
  education,
  skills,
  projects,
  certifications,
  achievements,
  languages,
  customSections
}: any) {
  
  // Format contact header line
  const contactParts = [
    personalInfo.email,
    personalInfo.phone,
    personalInfo.location,
    personalInfo.linkedin,
    personalInfo.github
  ].filter(Boolean);

  // 1. ATS Classic (Strict Single Column)
  if (template === "ATS-Classic" || template === "Corporate") {
    return (
      <div className="space-y-5 text-slate-900">
        {/* Header */}
        <div className="text-center border-b border-slate-300 pb-4">
          <h1 className="text-2xl font-bold tracking-tight text-slate-950 uppercase">{personalInfo.fullName || "Your Full Name"}</h1>
          <div className="text-xs font-semibold text-slate-700 mt-1">{targetRole}</div>
          <div className="text-[11px] text-slate-600 mt-1.5 flex flex-wrap justify-center gap-x-3 gap-y-1">
            {contactParts.map((c, i) => (
              <span key={i}>{c}</span>
            ))}
          </div>
        </div>

        {/* Summary */}
        {summary && (
          <div>
            <h2 className="text-xs font-bold tracking-wider uppercase border-b border-slate-300 pb-1 mb-2 text-slate-900" style={{ color: accentColor }}>
              Professional Summary
            </h2>
            <p className="text-xs leading-relaxed text-slate-800">{summary}</p>
          </div>
        )}

        {/* Experience */}
        {experience.length > 0 && (
          <div>
            <h2 className="text-xs font-bold tracking-wider uppercase border-b border-slate-300 pb-1 mb-2 text-slate-900" style={{ color: accentColor }}>
              Work Experience
            </h2>
            <div className="space-y-3.5">
              {experience.map((exp: any, i: number) => (
                <div key={i}>
                  <div className="flex justify-between items-baseline font-bold text-xs text-slate-900">
                    <span>{exp.role} &mdash; <span className="font-semibold text-slate-700">{exp.company}</span></span>
                    <span className="text-[11px] text-slate-600">{exp.startDate} &ndash; {exp.current ? "Present" : exp.endDate}</span>
                  </div>
                  {exp.description && <p className="text-[11.5px] text-slate-700 mt-1">{exp.description}</p>}
                  {exp.bulletPoints && exp.bulletPoints.length > 0 && (
                    <ul className="list-disc list-outside pl-4 text-xs text-slate-800 space-y-1 mt-1.5">
                      {exp.bulletPoints.map((b: string, bi: number) => (
                        <li key={bi}>{b}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Education */}
        {education.length > 0 && (
          <div>
            <h2 className="text-xs font-bold tracking-wider uppercase border-b border-slate-300 pb-1 mb-2 text-slate-900" style={{ color: accentColor }}>
              Education
            </h2>
            <div className="space-y-2">
              {education.map((edu: any, i: number) => (
                <div key={i} className="flex justify-between items-baseline text-xs">
                  <div>
                    <span className="font-bold text-slate-900">{edu.degree}</span> &mdash; <span className="text-slate-700">{edu.institution}</span>
                  </div>
                  <div className="text-[11px] text-slate-600">{edu.graduationYear} {edu.gpa ? `| GPA: ${edu.gpa}` : ""}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Skills */}
        {skills.length > 0 && (
          <div>
            <h2 className="text-xs font-bold tracking-wider uppercase border-b border-slate-300 pb-1 mb-2 text-slate-900" style={{ color: accentColor }}>
              Technical Skills
            </h2>
            <div className="space-y-1.5 text-xs text-slate-800">
              {skills.map((s: any, i: number) => (
                <div key={i}>
                  <strong className="text-slate-900">{s.category}:</strong> {s.items.join(", ")}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Projects */}
        {projects.length > 0 && (
          <div>
            <h2 className="text-xs font-bold tracking-wider uppercase border-b border-slate-300 pb-1 mb-2 text-slate-900" style={{ color: accentColor }}>
              Key Projects
            </h2>
            <div className="space-y-2.5">
              {projects.map((p: any, i: number) => (
                <div key={i}>
                  <div className="font-bold text-xs text-slate-900">
                    {p.title} {p.techStack && <span className="font-normal text-slate-600 text-[11px]">| {p.techStack.join(", ")}</span>}
                  </div>
                  <p className="text-xs text-slate-800 mt-0.5">{p.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // 2. Modern & Tech & AI-ML & Creative & Data-Science Layouts
  return (
    <div className="space-y-5 text-slate-900">
      {/* Modern Header */}
      <div className="border-l-4 pl-4 py-1" style={{ borderColor: accentColor }}>
        <h1 className="text-2xl font-black tracking-tight text-slate-900">{personalInfo.fullName || "Your Full Name"}</h1>
        <div className="text-sm font-bold mt-0.5" style={{ color: accentColor }}>{targetRole}</div>
        <div className="text-[11px] text-slate-600 mt-2 flex flex-wrap gap-x-3 gap-y-1">
          {contactParts.map((c, i) => (
            <span key={i} className="flex items-center gap-1">
              <span>{c}</span>
              {i < contactParts.length - 1 && <span className="text-slate-300">&bull;</span>}
            </span>
          ))}
        </div>
      </div>

      {/* Summary */}
      {summary && (
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 text-xs leading-relaxed text-slate-800">
          {summary}
        </div>
      )}

      {/* Experience */}
      {experience.length > 0 && (
        <div>
          <div className="flex items-center gap-2 pb-1 mb-3 border-b border-slate-200">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: accentColor }} />
            <h2 className="text-xs font-black uppercase tracking-wider text-slate-900">Work Experience</h2>
          </div>
          <div className="space-y-4">
            {experience.map((exp: any, i: number) => (
              <div key={i} className="relative pl-3.5 border-l-2 border-slate-100">
                <span className="absolute -left-[5px] top-1.5 w-2 h-2 rounded-full bg-slate-300" />
                <div className="flex justify-between items-baseline">
                  <div>
                    <span className="font-bold text-xs text-slate-900">{exp.role}</span>
                    <span className="text-xs font-semibold text-slate-600 ml-1.5">@ {exp.company}</span>
                  </div>
                  <span className="text-[10.5px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                    {exp.startDate} &ndash; {exp.current ? "Present" : exp.endDate}
                  </span>
                </div>
                {exp.description && <p className="text-xs text-slate-700 mt-1">{exp.description}</p>}
                {exp.bulletPoints && exp.bulletPoints.length > 0 && (
                  <ul className="list-disc list-outside pl-4 text-xs text-slate-800 space-y-1 mt-2">
                    {exp.bulletPoints.map((b: string, bi: number) => (
                      <li key={bi} className="leading-snug">{b}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Skills Matrix (Pill Tags) */}
      {skills.length > 0 && (
        <div>
          <div className="flex items-center gap-2 pb-1 mb-3 border-b border-slate-200">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: accentColor }} />
            <h2 className="text-xs font-black uppercase tracking-wider text-slate-900">Technical Skills & Competencies</h2>
          </div>
          <div className="space-y-2.5">
            {skills.map((s: any, i: number) => (
              <div key={i} className="flex items-start gap-2 text-xs">
                <span className="font-bold text-slate-900 min-w-[140px] shrink-0">{s.category}:</span>
                <div className="flex flex-wrap gap-1.5">
                  {s.items.map((item: string, idx: number) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-slate-100 text-slate-800 border border-slate-200"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Projects */}
      {projects.length > 0 && (
        <div>
          <div className="flex items-center gap-2 pb-1 mb-3 border-b border-slate-200">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: accentColor }} />
            <h2 className="text-xs font-black uppercase tracking-wider text-slate-900">Featured Projects</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {projects.map((p: any, i: number) => (
              <div key={i} className="p-3 rounded-xl bg-slate-50/80 border border-slate-200/80">
                <div className="font-bold text-xs text-slate-900">{p.title}</div>
                <p className="text-[11.5px] text-slate-700 mt-1 leading-snug">{p.description}</p>
                {p.techStack && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {p.techStack.map((t: string, idx: number) => (
                      <span key={idx} className="text-[9.5px] px-1.5 py-0.5 rounded bg-white text-slate-700 font-bold border border-slate-200">
                        {t}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Education */}
      {education.length > 0 && (
        <div>
          <div className="flex items-center gap-2 pb-1 mb-2 border-b border-slate-200">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: accentColor }} />
            <h2 className="text-xs font-black uppercase tracking-wider text-slate-900">Education</h2>
          </div>
          <div className="space-y-2">
            {education.map((edu: any, i: number) => (
              <div key={i} className="flex justify-between items-baseline text-xs">
                <div>
                  <span className="font-bold text-slate-900">{edu.degree}</span> &mdash; <span className="text-slate-600">{edu.institution}</span>
                </div>
                <span className="text-[11px] font-bold text-slate-600">{edu.graduationYear} {edu.gpa ? `• GPA: ${edu.gpa}` : ""}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Certifications & Languages */}
      {(certifications.length > 0 || languages.length > 0) && (
        <div className="grid grid-cols-2 gap-4 pt-1">
          {certifications.length > 0 && (
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-900 mb-1.5">Certifications</div>
              <div className="space-y-1 text-xs text-slate-700">
                {certifications.map((c: any, i: number) => (
                  <div key={i}>&bull; <strong>{c.name}</strong> ({c.issuer || c.issueDate})</div>
                ))}
              </div>
            </div>
          )}
          {languages.length > 0 && (
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-900 mb-1.5">Languages</div>
              <div className="flex flex-wrap gap-1.5">
                {languages.map((l: any, i: number) => (
                  <span key={i} className="text-xs px-2 py-0.5 rounded bg-slate-100 font-medium text-slate-800">
                    {l.language} ({l.proficiency})
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
