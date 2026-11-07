import React, { useState } from "react";
import { Link, useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import axios from "axios";
import { useAuth } from "../context/auth-context";
import {
  Briefcase,
  Building2,
  Clock,
  GraduationCap,
  FileText,
  MapPin,
  Home,
  Globe,
  Users,
  Sparkles,
  CheckCircle2,
  HelpCircle,
  Lightbulb,
  ArrowRight,
  ArrowLeft,
  X,
  Plus,
  DollarSign,
  Calendar,
  ShieldCheck,
  Check,
  AlertCircle,
  Eye,
  Rocket,
  Share2
} from "lucide-react";

const DEPARTMENTS = [
  "Engineering",
  "Product Management",
  "Data Science & AI",
  "UI/UX Design",
  "DevOps & Cloud",
  "Marketing & Growth",
  "Sales & Business Development",
  "Operations",
  "Finance & Legal",
  "Human Resources",
];

const EXPERIENCE_LEVELS = [
  "0–2 years (Entry / Fresher)",
  "2–5 years (Mid-Level)",
  "5–8 years (Senior)",
  "8+ years (Lead / Principal)",
];

const EDUCATION_OPTIONS = [
  "Bachelor's in CS, IT, or Related Engineering",
  "Master's Degree (M.Tech / MS / MCA)",
  "Any STEM Degree (Science, Tech, Math)",
  "Any Graduate / Self-Taught Developer",
  "Doctorate / PhD in Computer Science or AI",
];

const POPULAR_SKILLS = [
  "React",
  "Node.js",
  "TypeScript",
  "Python",
  "Distributed Systems",
  "MongoDB",
  "PostgreSQL",
  "FastAPI",
  "Docker",
  "Kubernetes",
  "AWS",
  "GraphQL",
  "Next.js",
  "TailwindCSS",
  "Machine Learning",
  "PyTorch",
  "REST APIs",
  "Microservices",
];

const PREFERRED_SKILLS_LIST = [
  "CI/CD Pipelines",
  "Redis Caching",
  "Kafka / RabbitMQ",
  "Terraform",
  "System Architecture",
  "Unit Testing (Jest/Cypress)",
  "ElasticSearch",
  "WebSockets",
];

const BENEFIT_OPTIONS = [
  { id: "remote", label: "Flexible Remote Work", icon: "🏠" },
  { id: "health", label: "Comprehensive Health Insurance", icon: "🏥" },
  { id: "esop", label: "Stock Options (ESOPs)", icon: "📈" },
  { id: "bonus", label: "Annual Performance Bonus", icon: "💰" },
  { id: "learning", label: "Learning & Certification Budget", icon: "📚" },
  { id: "wellness", label: "Gym & Wellness Allowance", icon: "🏋️" },
  { id: "meals", label: "Free Meals & Healthy Snacks", icon: "🍕" },
  { id: "relocation", label: "Relocation Assistance", icon: "✈️" },
];

export function EmployerPostJob() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showInspirationModal, setShowInspirationModal] = useState(false);
  const [createdJobId, setCreatedJobId] = useState("");
  const [customSkillInput, setCustomSkillInput] = useState("");
  const [customPreferredInput, setCustomPreferredInput] = useState("");
  const [newQuestionInput, setNewQuestionInput] = useState("");
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    // Step 1: Basic Details
    title: "Software Development Engineer",
    department: "Engineering",
    type: "Full Time", // 'Full Time', 'Part Time', 'Internship', 'Contract'
    location: "Bangalore, Karnataka",
    workMode: "Hybrid", // 'On-site', 'Hybrid', 'Remote'
    experience: "0–2 years (Entry / Fresher)",
    openings: 3,
    description:
      "We are looking for a motivated Software Development Engineer to join our engineering team. You will be responsible for building scalable web applications, working with modern technologies, and contributing to end-to-end product development.",

    // Step 2: Requirements
    responsibilities: [
      "Design, build, and deploy robust microservices and interactive user interfaces.",
      "Collaborate with product managers and designers to transform complex requirements into elegant solutions.",
      "Write clean, maintainable, and well-tested code following best engineering practices.",
      "Optimize application performance, scalability, and responsiveness across modern web browsers.",
      "Participate in code reviews, architectural brainstorming, and continuous improvement sessions.",
    ],
    skills: ["React", "Node.js", "TypeScript", "Distributed Systems", "MongoDB"],
    preferredSkills: ["FastAPI", "Docker", "AWS", "Redis Caching"],
    education: "Bachelor's in CS, IT, or Related Engineering",
    minGpa: "No Minimum Criteria",

    // Step 3: Additional Info
    currency: "INR (₹)",
    salaryType: "Per Annum",
    minSalary: "12,00,000",
    maxSalary: "18,00,000",
    isDisclosed: true,
    deadline: "2026-10-15",
    benefits: ["Flexible Remote Work", "Comprehensive Health Insurance", "Stock Options (ESOPs)", "Learning & Certification Budget"],
    screeningQuestions: [
      "Please share your GitHub profile and any live portfolio projects.",
      "What is your current notice period and earliest joining availability?",
    ],
    isUrgent: true,
  });

  // Handle Input Changes
  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Toggle skills in tags
  const toggleSkill = (skill: string) => {
    if (formData.skills.includes(skill)) {
      setFormData((prev) => ({ ...prev, skills: prev.skills.filter((s) => s !== skill) }));
    } else {
      setFormData((prev) => ({ ...prev, skills: [...prev.skills, skill] }));
    }
  };

  const addCustomSkill = () => {
    if (customSkillInput.trim() && !formData.skills.includes(customSkillInput.trim())) {
      setFormData((prev) => ({ ...prev, skills: [...prev.skills, customSkillInput.trim()] }));
      setCustomSkillInput("");
    }
  };

  const togglePreferredSkill = (skill: string) => {
    if (formData.preferredSkills.includes(skill)) {
      setFormData((prev) => ({ ...prev, preferredSkills: prev.preferredSkills.filter((s) => s !== skill) }));
    } else {
      setFormData((prev) => ({ ...prev, preferredSkills: [...prev.preferredSkills, skill] }));
    }
  };

  const addCustomPreferred = () => {
    if (customPreferredInput.trim() && !formData.preferredSkills.includes(customPreferredInput.trim())) {
      setFormData((prev) => ({ ...prev, preferredSkills: [...prev.preferredSkills, customPreferredInput.trim()] }));
      setCustomPreferredInput("");
    }
  };

  // Toggle benefit
  const toggleBenefit = (label: string) => {
    if (formData.benefits.includes(label)) {
      setFormData((prev) => ({ ...prev, benefits: prev.benefits.filter((b) => b !== label) }));
    } else {
      setFormData((prev) => ({ ...prev, benefits: [...prev.benefits, label] }));
    }
  };

  // Add screening question
  const addScreeningQuestion = () => {
    if (newQuestionInput.trim()) {
      setFormData((prev) => ({
        ...prev,
        screeningQuestions: [...prev.screeningQuestions, newQuestionInput.trim()],
      }));
      setNewQuestionInput("");
    }
  };

  const removeScreeningQuestion = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      screeningQuestions: prev.screeningQuestions.filter((_, i) => i !== index),
    }));
  };

  // AI Auto-Generate Responsibilities
  const handleGenerateAIResponsibilities = () => {
    setIsGeneratingAI(true);
    setTimeout(() => {
      let generated: string[] = [];
      if (formData.title.toLowerCase().includes("frontend") || formData.title.toLowerCase().includes("react")) {
        generated = [
          "Architect responsive, mobile-first web applications utilizing React 19, TypeScript, and modern state architectures.",
          "Build reusable component libraries and collaborate closely with product designers to implement pixel-perfect user experiences.",
          "Diagnose and optimize frontend bundle size, rendering performance, and Core Web Vitals across major browsers.",
          "Integrate secure GraphQL and RESTful APIs with robust error handling and optimistic UI updates.",
          "Write comprehensive unit and end-to-end test suites using Jest and Playwright.",
        ];
      } else if (formData.title.toLowerCase().includes("data") || formData.title.toLowerCase().includes("machine learning")) {
        generated = [
          "Develop and deploy machine learning models and predictive analytics pipelines to production environments.",
          "Extract, clean, and analyze high-volume datasets using Python, Pandas, SQL, and distributed compute frameworks.",
          "Collaborate with backend engineers to expose model inference endpoints via high-throughput FastAPI microservices.",
          "Monitor model drift, latency, and accuracy metrics with automated alerting and retraining triggers.",
          "Present actionable data-driven insights and experimental findings to cross-functional stakeholders.",
        ];
      } else {
        generated = [
          "Design, develop, and maintain scalable microservices, backend services, and cloud-native infrastructure.",
          "Collaborate with cross-functional product and design teams to build user-focused features with high technical reliability.",
          "Write high-quality, maintainable code with automated test coverage, continuous integration, and seamless deployment.",
          "Troubleshoot production incidents, identify bottlenecks, and engineer robust self-healing mechanisms.",
          "Champion software engineering best practices, security standards, and mentor junior engineers.",
        ];
      }
      setFormData((prev) => ({ ...prev, responsibilities: generated }));
      setIsGeneratingAI(false);
    }, 800);
  };

  // Next & Previous Handlers
  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep((prev) => prev + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // Publish / Save Handlers
  const handlePublish = async (status: "Active" | "Draft" = "Active") => {
    setIsSubmitting(true);
    const token = localStorage.getItem("token") || "";

    const symbol = formData.currency.includes("USD") || formData.currency.includes("$")
      ? "$"
      : formData.currency.includes("EUR")
      ? "€"
      : formData.currency.includes("GBP")
      ? "£"
      : "₹";

    const salaryFormatted = formData.isDisclosed
      ? `${symbol} ${formData.minSalary} - ${formData.maxSalary} ${formData.salaryType === "Per Annum" ? "LPA" : formData.salaryType}`
      : "Competitive";

    const payload = {
      title: formData.title,
      department: formData.department,
      location: formData.location,
      type: formData.type,
      workMode: formData.workMode,
      experience: formData.experience,
      openings: formData.openings,
      salary: salaryFormatted,
      skills: formData.skills,
      preferredSkills: formData.preferredSkills,
      education: formData.education,
      description: formData.description,
      responsibilities: formData.responsibilities,
      benefits: formData.benefits,
      screeningQuestions: formData.screeningQuestions,
      deadline: formData.deadline,
      isUrgent: formData.isUrgent,
      status: status,
    };

    let newlyCreatedJob = {
      _id: "local-job-" + Date.now(),
      ...payload,
      applicationsCount: 0,
      createdAt: new Date().toISOString(),
    };

    try {
      const res = await axios.post("http://localhost:5000/api/employer/jobs", payload, {
        headers: { "x-auth-token": token },
      });
      if (res.data?.job) {
        newlyCreatedJob = res.data.job;
      }
      setCreatedJobId(newlyCreatedJob._id);
    } catch (err) {
      console.warn("API fallback mode triggered:", err);
      setCreatedJobId(newlyCreatedJob._id);
    } finally {
      // Save newly created job to localStorage cache so it displays at the top of the dashboard immediately
      try {
        const stored = localStorage.getItem("recent_employer_jobs");
        const existingList = stored ? JSON.parse(stored) : [];
        const updatedList = [newlyCreatedJob, ...existingList.filter((j: any) => j._id !== newlyCreatedJob._id)];
        localStorage.setItem("recent_employer_jobs", JSON.stringify(updatedList));
      } catch (e) {
        console.error("Error storing job in localStorage", e);
      }
      setIsSubmitting(false);
      setShowSuccessModal(true);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto font-sans text-slate-800 pb-12 min-w-0">
      {/* ================= TOP HEADER BANNER ================= */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 mb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/25 shrink-0">
            <span className="material-symbols-outlined text-[26px]">add_business</span>
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              Post a New Job
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              Connect with talented candidates. It only takes a few minutes.
            </p>
          </div>
        </div>

        {/* AI Spotlight Promo Card */}
        <div className="w-full lg:w-auto p-3 px-4 rounded-2xl bg-gradient-to-r from-purple-50 via-indigo-50 to-blue-50 border border-purple-200/70 flex items-center gap-3 shadow-xs">
          <div className="w-9 h-9 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-sm shadow-purple-500/30 shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-black text-purple-950">Find the right talent, faster</div>
            <div className="text-[11px] text-purple-800/80">
              Our AI helps you reach the most relevant candidates based on skills, experience and fit.
            </div>
          </div>
        </div>
      </div>

      {/* ================= 4-STEP WIZARD PROGRESS BAR ================= */}
      <div className="mb-8 p-4 px-6 rounded-3xl bg-white border border-slate-200 shadow-sm">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 relative">
          {[
            { num: 1, title: "Basic Details", desc: "Job title, type and location" },
            { num: 2, title: "Requirements", desc: "Skills and qualifications" },
            { num: 3, title: "Additional Info", desc: "Salary, deadline, application" },
            { num: 4, title: "Preview & Publish", desc: "Review and post your job" },
          ].map((step, idx) => {
            const isCompleted = currentStep > step.num;
            const isCurrent = currentStep === step.num;

            return (
              <button
                key={step.num}
                type="button"
                onClick={() => setCurrentStep(step.num)}
                className={`flex items-start gap-3 text-left transition-all p-2 rounded-2xl cursor-pointer ${
                  isCurrent
                    ? "bg-purple-50/60"
                    : isCompleted
                    ? "opacity-90 hover:bg-slate-50"
                    : "opacity-60 hover:opacity-80"
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 transition-all ${
                    isCurrent
                      ? "bg-purple-600 text-white shadow-md shadow-purple-500/30 ring-4 ring-purple-100"
                      : isCompleted
                      ? "bg-emerald-500 text-white"
                      : "bg-slate-100 text-slate-500 border border-slate-300"
                  }`}
                >
                  {isCompleted ? <Check className="w-4 h-4" /> : step.num}
                </div>
                <div className="min-w-0">
                  <div
                    className={`text-xs font-bold truncate ${
                      isCurrent ? "text-purple-900" : isCompleted ? "text-slate-800" : "text-slate-500"
                    }`}
                  >
                    {step.num}. {step.title}
                  </div>
                  <div className="text-[10px] text-slate-400 truncate hidden sm:block">{step.desc}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ================= MAIN SPLIT CONTENT ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT COLUMN: FORM CONTENT (8 cols) */}
        <div className="lg:col-span-8 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm relative overflow-hidden">
          <AnimatePresence mode="wait">
            {/* ============================================================== */}
            {/* STEP 1: JOB BASIC DETAILS                                      */}
            {/* ============================================================== */}
            {currentStep === 1 && (
              <motion.div
                key="step-1"
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 15 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div>
                    <h2 className="text-xl font-black text-slate-900 tracking-tight">Job Basic Details</h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Let's start with the basics. This information will be visible to candidates.
                    </p>
                  </div>
                  <span className="text-xs font-extrabold px-3 py-1 bg-purple-50 text-purple-700 rounded-full border border-purple-200">
                    Step 1 of 4
                  </span>
                </div>

                {/* Job Title & Department Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                      <span>Job Title *</span>
                      <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.title}
                      onChange={(e) => handleInputChange("title", e.target.value)}
                      placeholder="e.g., Software Development Engineer"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 transition-all bg-slate-50/50"
                    />
                    <span className="text-[11px] text-slate-400 mt-1 block">
                      Use a clear and specific job title (e.g., Software Engineer, Data Analyst)
                    </span>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Department *</label>
                    <select
                      value={formData.department}
                      onChange={(e) => handleInputChange("department", e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 transition-all bg-slate-50/50 cursor-pointer"
                    >
                      {DEPARTMENTS.map((dept) => (
                        <option key={dept} value={dept}>
                          {dept}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Employment Type Selector (4 Pills) */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2">Employment Type *</label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[
                      { id: "Full Time", label: "Full Time", icon: "work" },
                      { id: "Part Time", label: "Part Time", icon: "schedule" },
                      { id: "Internship", label: "Internship", icon: "school" },
                      { id: "Contract", label: "Contract", icon: "description" },
                    ].map((item) => {
                      const isSelected = formData.type === item.id;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => handleInputChange("type", item.id)}
                          className={`p-3 rounded-2xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                            isSelected
                              ? "border-purple-600 bg-purple-50/60 text-purple-900 font-bold shadow-xs ring-1 ring-purple-600"
                              : "border-slate-200 hover:border-slate-300 text-slate-700 bg-white"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span className={`material-symbols-outlined text-[18px] ${isSelected ? "text-purple-600" : "text-slate-400"}`}>
                              {item.icon}
                            </span>
                            <span className="text-xs">{item.label}</span>
                          </div>
                          {isSelected && (
                            <div className="w-4 h-4 rounded-full bg-purple-600 text-white flex items-center justify-center">
                              <Check className="w-2.5 h-2.5" />
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Location & Work Mode Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Location *</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                        <MapPin className="h-4 w-4 text-slate-400" />
                      </div>
                      <input
                        type="text"
                        value={formData.location}
                        onChange={(e) => handleInputChange("location", e.target.value)}
                        placeholder="e.g., Bangalore, Karnataka"
                        className="w-full pl-10 pr-8 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 transition-all bg-slate-50/50"
                      />
                      {formData.location && (
                        <button
                          type="button"
                          onClick={() => handleInputChange("location", "")}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-2">Work Mode *</label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: "On-site", label: "On-site", icon: "apartment" },
                        { id: "Hybrid", label: "Hybrid", icon: "home" },
                        { id: "Remote", label: "Remote", icon: "public" },
                      ].map((mode) => {
                        const isSelected = formData.workMode === mode.id;
                        return (
                          <button
                            key={mode.id}
                            type="button"
                            onClick={() => handleInputChange("workMode", mode.id)}
                            className={`py-2 px-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                              isSelected
                                ? "border-purple-600 bg-purple-50/60 text-purple-900 shadow-xs ring-1 ring-purple-600 font-bold"
                                : "border-slate-200 text-slate-600 hover:border-slate-300 bg-white"
                            }`}
                          >
                            <span className={`material-symbols-outlined text-[16px] ${isSelected ? "text-purple-600" : "text-slate-400"}`}>
                              {mode.icon}
                            </span>
                            <span>{mode.label}</span>
                            {isSelected && <Check className="w-3 h-3 text-purple-600" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Experience Level & Number of Openings */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Experience Level *</label>
                    <select
                      value={formData.experience}
                      onChange={(e) => handleInputChange("experience", e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 transition-all bg-slate-50/50 cursor-pointer"
                    >
                      {EXPERIENCE_LEVELS.map((lvl) => (
                        <option key={lvl} value={lvl}>
                          {lvl}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Number of Openings *</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                        <Users className="h-4 w-4 text-slate-400" />
                      </div>
                      <input
                        type="number"
                        min={1}
                        max={100}
                        value={formData.openings}
                        onChange={(e) => handleInputChange("openings", Math.max(1, parseInt(e.target.value) || 1))}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 transition-all bg-slate-50/50"
                      />
                    </div>
                  </div>
                </div>

                {/* Short Job Summary */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                      <span>Short Job Summary *</span>
                      <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
                    </label>
                    <span className="text-[11px] text-slate-400 font-mono">
                      {formData.description.length}/500
                    </span>
                  </div>
                  <textarea
                    rows={4}
                    maxLength={500}
                    value={formData.description}
                    onChange={(e) => handleInputChange("description", e.target.value)}
                    placeholder="Give a brief overview of the role, team, and what makes it exciting..."
                    className="w-full p-3.5 rounded-2xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 transition-all bg-slate-50/50 leading-relaxed"
                  />
                  <span className="text-[11px] text-slate-400 mt-1 block">
                    Give a brief overview of the role, team and what makes it exciting.
                  </span>
                </div>
              </motion.div>
            )}

            {/* ============================================================== */}
            {/* STEP 2: REQUIREMENTS & SKILLS                                  */}
            {/* ============================================================== */}
            {currentStep === 2 && (
              <motion.div
                key="step-2"
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 15 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div>
                    <h2 className="text-xl font-black text-slate-900 tracking-tight">Job Requirements & Skills</h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Specify key responsibilities, mandatory technical skills, and candidate qualifications.
                    </p>
                  </div>
                  <span className="text-xs font-extrabold px-3 py-1 bg-purple-50 text-purple-700 rounded-full border border-purple-200">
                    Step 2 of 4
                  </span>
                </div>

                {/* Key Responsibilities with AI Auto-Generator */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                      <span>Key Responsibilities *</span>
                      <span className="text-[10px] text-slate-400 font-normal">({formData.responsibilities.length} listed)</span>
                    </label>

                    <button
                      type="button"
                      onClick={handleGenerateAIResponsibilities}
                      disabled={isGeneratingAI}
                      className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white text-[11px] font-bold flex items-center gap-1.5 shadow-sm shadow-purple-500/20 transition-all cursor-pointer disabled:opacity-75"
                    >
                      <Sparkles className={`w-3.5 h-3.5 ${isGeneratingAI ? "animate-spin" : ""}`} />
                      <span>{isGeneratingAI ? "AI Generating..." : "✨ Auto-generate with AI"}</span>
                    </button>
                  </div>

                  <div className="space-y-2 mb-3">
                    {formData.responsibilities.map((resp, idx) => (
                      <div key={idx} className="flex items-start gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 group">
                        <span className="w-5 h-5 rounded-full bg-purple-100 text-purple-700 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                          {idx + 1}
                        </span>
                        <input
                          type="text"
                          value={resp}
                          onChange={(e) => {
                            const newResp = [...formData.responsibilities];
                            newResp[idx] = e.target.value;
                            handleInputChange("responsibilities", newResp);
                          }}
                          className="flex-1 bg-transparent border-none focus:outline-none text-xs text-slate-900"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const newResp = formData.responsibilities.filter((_, i) => i !== idx);
                            handleInputChange("responsibilities", newResp);
                          }}
                          className="text-slate-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity p-1 cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() => handleInputChange("responsibilities", [...formData.responsibilities, ""])}
                    className="text-xs font-bold text-purple-600 hover:text-purple-700 flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Another Responsibility</span>
                  </button>
                </div>

                {/* Required Core Skills Tag Picker */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Required Core Skills * <span className="text-[10px] text-slate-400 font-normal">(Primary match criteria)</span>
                  </label>

                  {/* Selected Tags */}
                  <div className="flex flex-wrap gap-2 p-3 rounded-2xl bg-purple-50/40 border border-purple-200/60 mb-3 min-h-[46px] items-center">
                    {formData.skills.map((skill) => (
                      <span
                        key={skill}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-purple-600 text-white font-semibold text-xs shadow-xs"
                      >
                        {skill}
                        <button
                          type="button"
                          onClick={() => toggleSkill(skill)}
                          className="hover:text-purple-200 cursor-pointer"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                    {formData.skills.length === 0 && (
                      <span className="text-xs text-slate-400 italic">No skills selected yet. Click from suggestions below.</span>
                    )}
                  </div>

                  {/* Skill Suggestions & Custom Input */}
                  <div className="flex flex-wrap gap-1.5 items-center">
                    <span className="text-[11px] font-bold text-slate-400 mr-1">Popular:</span>
                    {POPULAR_SKILLS.slice(0, 10).map((skill) => {
                      const isSelected = formData.skills.includes(skill);
                      return (
                        <button
                          key={skill}
                          type="button"
                          onClick={() => toggleSkill(skill)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                            isSelected
                              ? "bg-purple-100 text-purple-800 border border-purple-300 font-bold"
                              : "bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200"
                          }`}
                        >
                          {isSelected ? `✓ ${skill}` : `+ ${skill}`}
                        </button>
                      );
                    })}
                  </div>

                  {/* Custom Skill Adder */}
                  <div className="flex items-center gap-2 mt-3">
                    <input
                      type="text"
                      value={customSkillInput}
                      onChange={(e) => setCustomSkillInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addCustomSkill();
                        }
                      }}
                      placeholder="Type custom skill (e.g. Supabase, LangChain) & press Add"
                      className="flex-1 px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-purple-500 bg-slate-50/50"
                    />
                    <button
                      type="button"
                      onClick={addCustomSkill}
                      className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold cursor-pointer transition-all shadow-xs"
                    >
                      Add Skill
                    </button>
                  </div>
                </div>

                {/* Preferred / Nice-to-Have Skills */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Preferred / Nice-to-Have Skills <span className="text-[10px] text-slate-400 font-normal">(Optional bonus)</span>
                  </label>
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {PREFERRED_SKILLS_LIST.map((skill) => {
                      const isSelected = formData.preferredSkills.includes(skill);
                      return (
                        <button
                          key={skill}
                          type="button"
                          onClick={() => togglePreferredSkill(skill)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                            isSelected
                              ? "bg-indigo-100 text-indigo-800 border border-indigo-300 font-bold"
                              : "bg-slate-100 hover:bg-slate-200 text-slate-600 border border-slate-200"
                          }`}
                        >
                          {isSelected ? `✓ ${skill}` : `+ ${skill}`}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Educational Qualification & Cutoff */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2 border-t border-slate-100">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Educational Qualification *</label>
                    <select
                      value={formData.education}
                      onChange={(e) => handleInputChange("education", e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-900 focus:outline-none focus:border-purple-500 bg-slate-50/50 cursor-pointer"
                    >
                      {EDUCATION_OPTIONS.map((edu) => (
                        <option key={edu} value={edu}>
                          {edu}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Academic Cutoff / GPA</label>
                    <select
                      value={formData.minGpa}
                      onChange={(e) => handleInputChange("minGpa", e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-900 focus:outline-none focus:border-purple-500 bg-slate-50/50 cursor-pointer"
                    >
                      <option value="No Minimum Criteria">No Minimum Criteria</option>
                      <option value="60% or 6.0 CGPA & above">60% or 6.0 CGPA & above</option>
                      <option value="70% or 7.0 CGPA & above">70% or 7.0 CGPA & above</option>
                      <option value="80% or 8.0 CGPA & above">80% or 8.0 CGPA & above</option>
                    </select>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ============================================================== */}
            {/* STEP 3: ADDITIONAL INFO & BENEFITS                             */}
            {/* ============================================================== */}
            {currentStep === 3 && (
              <motion.div
                key="step-3"
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 15 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div>
                    <h2 className="text-xl font-black text-slate-900 tracking-tight">Additional Information & Benefits</h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Set compensation, application deadline, perks, and custom screening questions.
                    </p>
                  </div>
                  <span className="text-xs font-extrabold px-3 py-1 bg-purple-50 text-purple-700 rounded-full border border-purple-200">
                    Step 3 of 4
                  </span>
                </div>

                {/* Salary & Compensation Controls */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                      <span>Salary & Compensation Range *</span>
                    </label>
                    <label className="flex items-center gap-2 text-xs font-semibold text-purple-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.isDisclosed}
                        onChange={(e) => handleInputChange("isDisclosed", e.target.checked)}
                        className="rounded text-purple-600 focus:ring-purple-500 cursor-pointer"
                      />
                      <span>Show Salary on Job Post</span>
                    </label>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 block mb-1">Currency</span>
                      <select
                        value={formData.currency}
                        onChange={(e) => handleInputChange("currency", e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 bg-slate-50/50 cursor-pointer"
                      >
                        <option value="INR (₹)">INR (₹)</option>
                        <option value="USD ($)">USD ($)</option>
                        <option value="EUR (€)">EUR (€)</option>
                        <option value="GBP (£)">GBP (£)</option>
                      </select>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold text-slate-400 block mb-1">Minimum</span>
                      <input
                        type="text"
                        value={formData.minSalary}
                        onChange={(e) => handleInputChange("minSalary", e.target.value)}
                        placeholder="e.g. 12,00,000"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 bg-slate-50/50"
                      />
                    </div>

                    <div>
                      <span className="text-[10px] font-bold text-slate-400 block mb-1">Maximum</span>
                      <input
                        type="text"
                        value={formData.maxSalary}
                        onChange={(e) => handleInputChange("maxSalary", e.target.value)}
                        placeholder="e.g. 18,00,000"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 bg-slate-50/50"
                      />
                    </div>

                    <div>
                      <span className="text-[10px] font-bold text-slate-400 block mb-1">Frequency</span>
                      <select
                        value={formData.salaryType}
                        onChange={(e) => handleInputChange("salaryType", e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 bg-slate-50/50 cursor-pointer"
                      >
                        <option value="Per Annum">Per Annum (Yearly)</option>
                        <option value="Per Month">Per Month</option>
                        <option value="Fixed Stipend">Fixed Stipend</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Application Deadline & Urgent Hiring */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Application Deadline *</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                        <Calendar className="h-4 w-4 text-slate-400" />
                      </div>
                      <input
                        type="date"
                        value={formData.deadline}
                        onChange={(e) => handleInputChange("deadline", e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 bg-slate-50/50 cursor-pointer"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Urgent Hiring Priority</label>
                    <button
                      type="button"
                      onClick={() => handleInputChange("isUrgent", !formData.isUrgent)}
                      className={`w-full p-2.5 rounded-xl border text-xs font-bold flex items-center justify-between transition-all cursor-pointer ${
                        formData.isUrgent
                          ? "bg-rose-50 border-rose-300 text-rose-800 ring-1 ring-rose-400"
                          : "bg-slate-50 border-slate-200 text-slate-600"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-rose-600 text-[18px]">local_fire_department</span>
                        <span>Urgent Hiring (Fast-track candidate reviews)</span>
                      </div>
                      {formData.isUrgent && <Check className="w-4 h-4 text-rose-600" />}
                    </button>
                  </div>
                </div>

                {/* Perks & Benefits Selector */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2">
                    Perks & Benefits <span className="text-[10px] text-slate-400 font-normal">({formData.benefits.length} selected)</span>
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {BENEFIT_OPTIONS.map((benefit) => {
                      const isSelected = formData.benefits.includes(benefit.label);
                      return (
                        <button
                          key={benefit.id}
                          type="button"
                          onClick={() => toggleBenefit(benefit.label)}
                          className={`p-2.5 px-3 rounded-xl border text-xs text-left flex items-center justify-between transition-all cursor-pointer ${
                            isSelected
                              ? "bg-purple-50/70 border-purple-500 text-purple-900 font-bold ring-1 ring-purple-500 shadow-xs"
                              : "bg-white border-slate-200 text-slate-700 hover:border-slate-300"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-base">{benefit.icon}</span>
                            <span>{benefit.label}</span>
                          </div>
                          {isSelected && <Check className="w-3.5 h-3.5 text-purple-600" />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Custom Screening Questions */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Candidate Screening Questions <span className="text-[10px] text-slate-400 font-normal">(Ask before applying)</span>
                  </label>

                  <div className="space-y-2 mb-3">
                    {formData.screeningQuestions.map((q, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2.5 px-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800">
                        <span className="font-medium">
                          <span className="font-bold text-purple-600 mr-2">Q{idx + 1}:</span>
                          {q}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeScreeningQuestion(idx)}
                          className="text-slate-400 hover:text-rose-500 p-1 cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={newQuestionInput}
                      onChange={(e) => setNewQuestionInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addScreeningQuestion();
                        }
                      }}
                      placeholder="Add a screening question (e.g., 'Are you willing to work from Bangalore?')"
                      className="flex-1 px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-purple-500 bg-slate-50/50"
                    />
                    <button
                      type="button"
                      onClick={addScreeningQuestion}
                      className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold cursor-pointer transition-all shadow-xs"
                    >
                      Add Question
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ============================================================== */}
            {/* STEP 4: PREVIEW & PUBLISH                                      */}
            {/* ============================================================== */}
            {currentStep === 4 && (
              <motion.div
                key="step-4"
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 15 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div>
                    <h2 className="text-xl font-black text-slate-900 tracking-tight">Preview & Publish</h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Review how your job post will appear to candidates before publishing live.
                    </p>
                  </div>
                  <span className="text-xs font-extrabold px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-200">
                    Step 4 of 4
                  </span>
                </div>

                {/* Candidate Simulation Card */}
                <div className="p-6 rounded-3xl bg-gradient-to-b from-white to-slate-50/60 border border-slate-200 shadow-md">
                  {/* Job Header */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
                    <div className="flex items-center gap-3.5">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-black text-base flex items-center justify-center shadow-md shadow-blue-500/25">
                        TS
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-black text-slate-900">{formData.title}</h3>
                          {formData.isUrgent && (
                            <span className="px-2 py-0.5 rounded-md bg-rose-50 text-rose-600 text-[10px] font-extrabold uppercase border border-rose-200">
                              Urgent
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                          <span className="font-bold text-slate-700">{user?.name ? `${user.name} Corp` : "Your Company"}</span>
                          <span>•</span>
                          <span>{formData.department}</span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-slate-400" />
                            {formData.location} ({formData.workMode})
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-sm font-black text-purple-700">
                        {formData.isDisclosed
                          ? `${formData.currency.split(" ")[1] || "₹"}${formData.minSalary} - ${formData.currency.split(" ")[1] || "₹"}${formData.maxSalary}`
                          : "Competitive"}
                      </div>
                      <div className="text-[10px] text-slate-400">{formData.salaryType}</div>
                    </div>
                  </div>

                  {/* Metadata Chips */}
                  <div className="flex flex-wrap gap-2 py-4 border-b border-slate-100">
                    <span className="px-3 py-1 rounded-xl bg-purple-50 text-purple-700 text-xs font-bold border border-purple-200">
                      💼 {formData.type}
                    </span>
                    <span className="px-3 py-1 rounded-xl bg-blue-50 text-blue-700 text-xs font-bold border border-blue-200">
                      🏠 {formData.workMode}
                    </span>
                    <span className="px-3 py-1 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold border border-slate-200">
                      ⏳ {formData.experience}
                    </span>
                    <span className="px-3 py-1 rounded-xl bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
                      👥 {formData.openings} Openings
                    </span>
                    <span className="px-3 py-1 rounded-xl bg-amber-50 text-amber-700 text-xs font-bold border border-amber-200">
                      📅 Deadline: {formData.deadline || "Open until filled"}
                    </span>
                  </div>

                  {/* Summary */}
                  <div className="py-4 border-b border-slate-100">
                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">About the Role</h4>
                    <p className="text-xs text-slate-600 leading-relaxed">{formData.description}</p>
                  </div>

                  {/* Responsibilities */}
                  <div className="py-4 border-b border-slate-100">
                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">Key Responsibilities</h4>
                    <ul className="space-y-1.5">
                      {formData.responsibilities.map((r, i) => (
                        <li key={i} className="text-xs text-slate-600 flex items-start gap-2">
                          <span className="text-purple-600 font-bold">•</span>
                          <span>{r}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Skills */}
                  <div className="py-4 border-b border-slate-100">
                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">Required Skills</h4>
                    <div className="flex flex-wrap gap-1.5">
                      {formData.skills.map((s) => (
                        <span key={s} className="px-2.5 py-1 rounded-lg bg-purple-100 text-purple-800 text-xs font-bold">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Benefits */}
                  {formData.benefits.length > 0 && (
                    <div className="pt-4">
                      <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">Perks & Benefits</h4>
                      <div className="grid grid-cols-2 gap-2">
                        {formData.benefits.map((b) => (
                          <div key={b} className="text-xs text-slate-700 flex items-center gap-1.5">
                            <span className="text-emerald-500">✓</span>
                            <span>{b}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Bottom Publish Bar */}
                <div className="p-4 rounded-2xl bg-purple-50/50 border border-purple-200/80 flex items-center justify-between">
                  <div className="text-xs text-purple-950 font-medium">
                    Ready to launch your job post to thousands of qualified candidates?
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handlePublish("Draft")}
                      disabled={isSubmitting}
                      className="px-4 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all cursor-pointer"
                    >
                      Save as Draft
                    </button>
                    <button
                      type="button"
                      onClick={() => handlePublish("Active")}
                      disabled={isSubmitting}
                      className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-md shadow-purple-600/30 flex items-center gap-2 transition-all cursor-pointer"
                    >
                      <Rocket className="w-4 h-4" />
                      <span>{isSubmitting ? "Publishing..." : "Publish Job Post 🚀"}</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ================= BOTTOM ACTION CONTROLS ================= */}
          <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between">
            <button
              type="button"
              onClick={() => navigate("/employer/dashboard")}
              className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
              <span>Cancel</span>
            </button>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handlePrev}
                disabled={currentStep === 1}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Previous</span>
              </button>

              {currentStep < 4 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-md shadow-purple-600/25 flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <span>Next Step</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => handlePublish("Active")}
                  disabled={isSubmitting}
                  className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-md shadow-purple-600/25 flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <Rocket className="w-4 h-4" />
                  <span>Publish Job Post</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: HELPER GUIDE CARD (4 cols) */}
        <div className="lg:col-span-4 space-y-5 sticky top-24">
          {/* Main Tip Card matching screenshot */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm relative overflow-hidden">
            {/* Header Illustration */}
            <div className="w-full h-24 rounded-2xl bg-gradient-to-tr from-purple-100 via-indigo-50 to-blue-100 flex items-center justify-center text-purple-600 mb-4 border border-purple-100">
              <div className="p-3 bg-white rounded-2xl shadow-sm">
                <FileText className="w-8 h-8 text-purple-600" />
              </div>
            </div>

            <h3 className="text-sm font-black text-slate-900 mb-1.5">
              A great job post attracts great people
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed mb-5">
              Be clear, specific, and honest about the role. The more details you provide, the better matched candidates you'll receive.
            </p>

            {/* Quick Tips */}
            <div className="space-y-3 pt-4 border-t border-slate-100">
              <div className="flex items-center gap-2 text-xs font-extrabold text-slate-900">
                <Lightbulb className="w-4 h-4 text-purple-600" />
                <span>Quick Tips</span>
              </div>

              <ul className="space-y-2.5 text-xs text-slate-600">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                  <span>Use a clear and specific job title</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                  <span>Choose the correct employment type</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                  <span>Mention the actual work location or remote option</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                  <span>Write a short and engaging summary</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                  <span>You can preview the job before publishing</span>
                </li>
              </ul>
            </div>

            {/* Need Inspiration Card */}
            <div className="mt-5 p-3.5 rounded-2xl bg-purple-50/60 border border-purple-200/60 flex flex-col gap-2">
              <div className="flex items-center gap-2 text-xs font-bold text-purple-900">
                <FileText className="w-4 h-4 text-purple-600" />
                <span>Need Inspiration?</span>
              </div>
              <p className="text-[11px] text-purple-800/80 leading-snug">
                View sample job descriptions from top companies.
              </p>
              <button
                type="button"
                onClick={() => setShowInspirationModal(true)}
                className="text-xs font-bold text-purple-700 hover:text-purple-900 flex items-center gap-1 transition-colors cursor-pointer text-left"
              >
                <span>View Examples</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* AI Talent Match Guarantee */}
          <div className="p-4 rounded-3xl bg-slate-900 text-white shadow-lg border border-slate-800">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span className="text-xs font-bold">AI Matchmaking Active</span>
            </div>
            <p className="text-[11px] text-slate-300 leading-snug mb-3">
              Once published, our algorithm matches this job with verified candidates holding matching skill scores.
            </p>
            <div className="text-[10px] font-bold text-purple-300">
              ⚡ Over 85% average initial match precision
            </div>
          </div>
        </div>
      </div>

      {/* ================= SUCCESS PUBLISH CELEBRATION MODAL ================= */}
      <AnimatePresence>
        {showSuccessModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl border border-slate-200 text-center"
            >
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4 shadow-inner">
                <Rocket className="w-8 h-8" />
              </div>

              <h3 className="text-2xl font-black text-slate-900 mb-1 font-heading">
                Job Post Published! 🚀
              </h3>
              <p className="text-xs text-slate-500 mb-6 leading-relaxed">
                Your opening for <strong className="text-slate-800">{formData.title}</strong> is now live. Candidates can discover and apply immediately.
              </p>

              <div className="space-y-2.5 mb-6">
                <Link
                  to="/employer/dashboard"
                  className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold shadow-md shadow-purple-600/25 flex items-center justify-center gap-2 transition-all block"
                >
                  <Briefcase className="w-4 h-4" />
                  <span>Go to Recruiter Dashboard</span>
                </Link>

                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard?.writeText(window.location.origin + `/dashboard`);
                    alert("Job link copied to clipboard!");
                  }}
                  className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <Share2 className="w-4 h-4" />
                  <span>Copy Candidate Link</span>
                </button>
              </div>

              <button
                type="button"
                onClick={() => {
                  setShowSuccessModal(false);
                  setCurrentStep(1);
                }}
                className="text-xs text-slate-400 hover:text-slate-600 font-semibold cursor-pointer"
              >
                Post Another Job opening
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ================= INSPIRATION SAMPLE DESCRIPTIONS MODAL ================= */}
      <AnimatePresence>
        {showInspirationModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl border border-slate-200 max-h-[85vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center">
                    <FileText className="w-4 h-4" />
                  </div>
                  <h3 className="text-base font-black text-slate-900">Sample Job Descriptions</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowInspirationModal(false)}
                  className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                {[
                  {
                    role: "Software Development Engineer (Full Stack)",
                    summary: "We are seeking a versatile Full Stack Engineer to create seamless web applications and resilient microservices.",
                    skills: ["React", "Node.js", "TypeScript", "PostgreSQL"],
                  },
                  {
                    role: "Machine Learning / AI Engineer",
                    summary: "Join our AI research unit to train, fine-tune, and deploy transformer architectures and intelligent agents.",
                    skills: ["Python", "PyTorch", "LLMs", "FastAPI", "Docker"],
                  },
                  {
                    role: "Frontend UI/UX Engineer",
                    summary: "Help build modern, delightful web applications with high visual polish, smooth animations, and high performance.",
                    skills: ["React", "TypeScript", "TailwindCSS", "Next.js"],
                  },
                ].map((sample, idx) => (
                  <div key={idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 hover:border-purple-300 transition-all">
                    <div className="flex items-center justify-between mb-1.5">
                      <h4 className="text-xs font-black text-slate-900">{sample.role}</h4>
                      <button
                        type="button"
                        onClick={() => {
                          setFormData((prev) => ({
                            ...prev,
                            title: sample.role,
                            description: sample.summary,
                            skills: sample.skills,
                          }));
                          setShowInspirationModal(false);
                        }}
                        className="px-3 py-1 bg-purple-600 text-white rounded-lg text-[11px] font-bold hover:bg-purple-700 cursor-pointer shadow-xs"
                      >
                        Use Template
                      </button>
                    </div>
                    <p className="text-xs text-slate-600 mb-2">{sample.summary}</p>
                    <div className="flex flex-wrap gap-1">
                      {sample.skills.map((s) => (
                        <span key={s} className="px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 text-[10px] font-bold border border-purple-200">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default EmployerPostJob;
