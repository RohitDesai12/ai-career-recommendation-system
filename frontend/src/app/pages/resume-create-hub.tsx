import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router";
import { useAuth } from "../context/auth-context";
import { motion, AnimatePresence } from "motion/react";
import axios from "axios";
import {
  FileText,
  User,
  Upload,
  Globe,
  Plus,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Briefcase,
  GraduationCap,
  Award,
  Layers,
  FileCheck,
  RefreshCw,
  X
} from "lucide-react";

export function ResumeCreateHub() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [selectedSource, setSelectedSource] = useState<"profile" | "upload" | "linkedin" | "scratch" | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [profileData, setProfileData] = useState<any>(null);

  // Upload State
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [parsingDocument, setParsingDocument] = useState(false);
  const [parsedData, setParsedData] = useState<any>(null);
  const [isReviewOpen, setIsReviewOpen] = useState(false);

  // LinkedIn State
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [linkedinText, setLinkedinText] = useState("");
  const [parsingLinkedin, setParsingLinkedin] = useState(false);

  // Load Profile on mount
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setLoadingProfile(true);
      axios
        .get("http://localhost:5000/api/profile/me", {
          headers: { "x-auth-token": token }
        })
        .then((res) => {
          if (res.data) {
            setProfileData(res.data);
          }
        })
        .catch(() => {})
        .finally(() => setLoadingProfile(false));
    }
  }, []);

  // Profile Checklist items
  const hasPersonalInfo = Boolean(user?.name || profileData?.personalInfo?.fullName);
  const hasEducation = Boolean(profileData?.education || profileData?.academic);
  const hasSkills = Boolean(profileData?.skills && profileData.skills.length > 0);
  const hasProjects = Boolean(profileData?.projects && profileData.projects.length > 0);
  const hasCertifications = Boolean(profileData?.certifications && profileData.certifications.length > 0);
  const hasExperience = Boolean(profileData?.experience && profileData.experience.length > 0);
  const hasAchievements = Boolean(profileData?.achievements && profileData.achievements.length > 0);

  // Handle Profile Import
  const handleImportProfile = () => {
    const defaultData = {
      title: `${user?.name || "Professional"} Resume`,
      targetRole: profileData?.targetCareer || "Software Engineer",
      template: "Modern",
      personalInfo: {
        fullName: user?.name || profileData?.personalInfo?.fullName || "",
        email: user?.email || profileData?.personalInfo?.email || "",
        phone: profileData?.phone || "",
        location: profileData?.location || "",
        website: profileData?.website || "",
        linkedin: profileData?.linkedin || "",
        github: profileData?.github || ""
      },
      summary: profileData?.bio || profileData?.careerObjective || `Results-driven ${profileData?.targetCareer || "engineering"} professional with a proven track record of designing scalable applications and collaborating in agile teams.`,
      skills: hasSkills ? [{ category: "Technical Skills", items: profileData.skills }] : [
        { category: "Core Technologies", items: ["Python", "JavaScript", "React", "SQL", "Git"] }
      ],
      education: hasEducation ? [
        {
          degree: profileData.education || "Bachelor of Technology",
          institution: profileData.institution || "Engineering University",
          location: profileData.location || "India",
          graduationYear: profileData.graduationYear || "2024",
          gpa: profileData.cgpa || ""
        }
      ] : [],
      projects: hasProjects ? profileData.projects : [],
      certifications: hasCertifications ? profileData.certifications : [],
      experience: hasExperience ? profileData.experience : []
    };

    sessionStorage.setItem("imported_resume_draft", JSON.stringify(defaultData));
    navigate("/resume-studio/templates?source=profile");
  };

  // Handle Document Upload & Parse
  const handleFileUpload = async (file: File) => {
    setUploadedFile(file);
    setParsingDocument(true);
    const token = localStorage.getItem("token");

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await axios.post("http://localhost:5000/api/resume/parse-document", formData, {
        headers: {
          "x-auth-token": token || "",
          "Content-Type": "multipart/form-data"
        }
      });

      if (res.data?.extracted) {
        setParsedData(res.data.extracted);
        setIsReviewOpen(true);
      }
    } catch (err) {
      console.error("Parse document failed:", err);
      alert("Could not extract resume sections automatically. Starting builder with template.");
      navigate("/resume-studio/templates?source=upload");
    } finally {
      setParsingDocument(false);
    }
  };

  // Handle LinkedIn Parse
  const handleLinkedinImport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!linkedinText.trim() && !linkedinUrl.trim()) return;

    setParsingLinkedin(true);
    const token = localStorage.getItem("token");

    try {
      const res = await axios.post("http://localhost:5000/api/resume/parse-linkedin", {
        text: linkedinText,
        url: linkedinUrl
      }, {
        headers: { "x-auth-token": token || "" }
      });

      if (res.data?.extracted) {
        setParsedData(res.data.extracted);
        setIsReviewOpen(true);
      }
    } catch (err) {
      console.error("LinkedIn parse error:", err);
      navigate("/resume-studio/templates?source=linkedin");
    } finally {
      setParsingLinkedin(false);
    }
  };

  // Proceed with confirmed reviewed data
  const handleConfirmImport = () => {
    sessionStorage.setItem("imported_resume_draft", JSON.stringify(parsedData));
    navigate("/resume-studio/templates?source=custom");
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 font-sans antialiased text-slate-900 dark:text-slate-100 pb-20">
      
      {/* Header */}
      <div className="flex items-center gap-3.5 border-b border-slate-200/80 dark:border-slate-800 pb-4">
        <Link
          to="/resume-studio"
          className="w-10 h-10 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl sm:text-3xl font-black font-heading text-slate-900 dark:text-white tracking-tight">
            Create a New Resume
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Choose your starting point. Import verified profile data, upload an existing document, or build from scratch.
          </p>
        </div>
      </div>

      {/* 4 Source Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Option 1: Career Compass Profile */}
        <div
          onClick={() => setSelectedSource("profile")}
          className={`bg-white dark:bg-slate-900 rounded-3xl p-6 border-2 transition-all cursor-pointer shadow-xs hover:shadow-md flex flex-col justify-between ${
            selectedSource === "profile"
              ? "border-purple-600 ring-4 ring-purple-600/10 dark:ring-purple-500/20"
              : "border-slate-200 dark:border-slate-800 hover:border-purple-300 dark:hover:border-purple-700"
          }`}
        >
          <div>
            <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold mb-4 shadow-inner">
              <User className="w-6 h-6" />
            </div>
            <span className="text-[11px] font-bold text-purple-600 uppercase tracking-wider block mb-1">Recommended</span>
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">From My Profile</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Auto-fill personal details, education, verified skills, and project history from Career Compass.
            </p>
          </div>
          <div className="pt-5 mt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-bold text-purple-600">
            <span>Select Source</span>
            <ArrowRight className="w-4 h-4" />
          </div>
        </div>

        {/* Option 2: Upload Existing Resume */}
        <div
          onClick={() => setSelectedSource("upload")}
          className={`bg-white dark:bg-slate-900 rounded-3xl p-6 border-2 transition-all cursor-pointer shadow-xs hover:shadow-md flex flex-col justify-between ${
            selectedSource === "upload"
              ? "border-indigo-600 ring-4 ring-indigo-600/10 dark:ring-indigo-500/20"
              : "border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700"
          }`}
        >
          <div>
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold mb-4 shadow-inner">
              <Upload className="w-6 h-6" />
            </div>
            <span className="text-[11px] font-bold text-indigo-600 uppercase tracking-wider block mb-1">Fast Import</span>
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">Import Existing Resume</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Upload your PDF or DOCX resume. Our parser will extract contact info, experience, and skills.
            </p>
          </div>
          <div className="pt-5 mt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-bold text-indigo-600">
            <span>Upload File</span>
            <ArrowRight className="w-4 h-4" />
          </div>
        </div>

        {/* Option 3: LinkedIn Import */}
        <div
          onClick={() => setSelectedSource("linkedin")}
          className={`bg-white dark:bg-slate-900 rounded-3xl p-6 border-2 transition-all cursor-pointer shadow-xs hover:shadow-md flex flex-col justify-between ${
            selectedSource === "linkedin"
              ? "border-blue-600 ring-4 ring-blue-600/10 dark:ring-blue-500/20"
              : "border-slate-200 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-700"
          }`}
        >
          <div>
            <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold mb-4 shadow-inner">
              <Globe className="w-6 h-6" />
            </div>
            <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wider block mb-1">Social Profile</span>
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">Import LinkedIn</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Paste your public LinkedIn profile summary, work history, and skills for automatic structured parsing.
            </p>
          </div>
          <div className="pt-5 mt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-bold text-blue-600">
            <span>Paste Profile</span>
            <ArrowRight className="w-4 h-4" />
          </div>
        </div>

        {/* Option 4: Start From Scratch */}
        <div
          onClick={() => {
            sessionStorage.removeItem("imported_resume_draft");
            navigate("/resume-studio/templates?source=scratch");
          }}
          className="bg-white dark:bg-slate-900 rounded-3xl p-6 border-2 border-slate-200 dark:border-slate-800 hover:border-slate-400 transition-all cursor-pointer shadow-xs hover:shadow-md flex flex-col justify-between"
        >
          <div>
            <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center font-bold mb-4 shadow-inner">
              <Plus className="w-6 h-6" />
            </div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Blank Canvas</span>
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">Start From Scratch</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Build your resume step-by-step from a blank canvas with real-time ATS suggestions.
            </p>
          </div>
          <div className="pt-5 mt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-bold text-slate-600 dark:text-slate-400">
            <span>Open Builder</span>
            <ArrowRight className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Dynamic Source Workspaces */}
      <AnimatePresence mode="wait">
        
        {/* 1. Career Compass Profile Checklist View */}
        {selectedSource === "profile" && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 p-6 sm:p-8 shadow-sm space-y-6"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  Career Compass Profile Information Detected
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Review the information found in your active student account before importing into your new resume.
                </p>
              </div>
              <button
                onClick={handleImportProfile}
                className="px-6 py-2.5 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md shadow-purple-600/25 transition-all flex items-center gap-2 cursor-pointer self-start sm:self-auto shrink-0"
              >
                <span>Import Selected Information</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
              
              <div className={`p-4 rounded-2xl border flex items-start gap-3 ${hasPersonalInfo ? 'bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/60' : 'bg-amber-50/60 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800/60'}`}>
                {hasPersonalInfo ? <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" /> : <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />}
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">Personal Information</h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    {user?.name ? `${user.name} (${user.email})` : "Name and contact verified"}
                  </p>
                </div>
              </div>

              <div className={`p-4 rounded-2xl border flex items-start gap-3 ${hasEducation ? 'bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/60' : 'bg-amber-50/60 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800/60'}`}>
                {hasEducation ? <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" /> : <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />}
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">Education</h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    {profileData?.education || "Degree and university detected"}
                  </p>
                </div>
              </div>

              <div className={`p-4 rounded-2xl border flex items-start gap-3 ${hasSkills ? 'bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/60' : 'bg-amber-50/60 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800/60'}`}>
                {hasSkills ? <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" /> : <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />}
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">Technical Skills</h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    {hasSkills ? `${profileData.skills.length} verified technical skills` : "Skills not found"}
                  </p>
                </div>
              </div>

              <div className={`p-4 rounded-2xl border flex items-start gap-3 ${hasProjects ? 'bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/60' : 'bg-amber-50/60 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800/60'}`}>
                {hasProjects ? <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" /> : <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />}
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">Projects</h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    {hasProjects ? `${profileData.projects.length} portfolio projects` : "Projects not found"}
                  </p>
                </div>
              </div>

              <div className={`p-4 rounded-2xl border flex items-start gap-3 ${hasCertifications ? 'bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/60' : 'bg-amber-50/60 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800/60'}`}>
                {hasCertifications ? <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" /> : <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />}
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">Certifications</h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    {hasCertifications ? `${profileData.certifications.length} verified badges` : "Certifications not found"}
                  </p>
                </div>
              </div>

              <div className={`p-4 rounded-2xl border flex items-start gap-3 ${hasExperience ? 'bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/60' : 'bg-amber-50/60 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800/60'}`}>
                {hasExperience ? <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" /> : <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />}
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">Work Experience</h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    {hasExperience ? "Experience entries detected" : "Can be added directly in editor"}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* 2. Upload Document Workspace */}
        {selectedSource === "upload" && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 p-8 shadow-sm text-center space-y-4 max-w-xl mx-auto"
          >
            <div className="w-16 h-16 rounded-3xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto shadow-inner">
              <Upload className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Upload Your Resume Document</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
              Select your existing PDF or DOCX file. Our parser will extract contact details, experience bullets, and skills into your editable workspace.
            </p>

            <label className="mt-4 block border-2 border-dashed border-indigo-200 dark:border-indigo-800/60 hover:border-indigo-500 rounded-2xl p-8 bg-indigo-50/30 dark:bg-indigo-950/20 cursor-pointer transition-colors">
              <input
                type="file"
                accept=".pdf,.docx,.txt"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files?.[0]) handleFileUpload(e.target.files[0]);
                }}
              />
              <FileText className="w-8 h-8 text-indigo-500 mx-auto mb-2" />
              <span className="text-xs font-bold text-indigo-600 block">
                {parsingDocument ? "Parsing resume content..." : "Click or drag file here (PDF, DOCX)"}
              </span>
              <span className="text-[11px] text-slate-400 block mt-1">Maximum file size 10MB</span>
            </label>
          </motion.div>
        )}

        {/* 3. LinkedIn Profile Workspace */}
        {selectedSource === "linkedin" && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 p-6 sm:p-8 shadow-sm space-y-4 max-w-2xl mx-auto"
          >
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Import from LinkedIn</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Paste your LinkedIn profile text or export below. We do not require your LinkedIn password or scrape private data.
              </p>
            </div>

            <form onSubmit={handleLinkedinImport} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">LinkedIn Profile URL (Optional)</label>
                <input
                  type="url"
                  placeholder="https://www.linkedin.com/in/yourprofile"
                  value={linkedinUrl}
                  onChange={(e) => setLinkedinUrl(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Paste Profile Summary / Experience Text
                </label>
                <textarea
                  rows={6}
                  placeholder="Paste your About section, experience bullets, and skills list here..."
                  value={linkedinText}
                  onChange={(e) => setLinkedinText(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="submit"
                  disabled={parsingLinkedin || (!linkedinText.trim() && !linkedinUrl.trim())}
                  className="px-6 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-600/20 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {parsingLinkedin ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                  <span>{parsingLinkedin ? "Parsing Content..." : "Parse & Review Resume"}</span>
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Interactive Review Modal */}
      <AnimatePresence>
        {isReviewOpen && parsedData && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl border border-slate-200 dark:border-slate-800 space-y-5 my-8 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-start justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">Review Extracted Information</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Confirm or refine the parsed content before choosing your resume template.
                  </p>
                </div>
                <button
                  onClick={() => setIsReviewOpen(false)}
                  className="p-1 rounded-xl text-slate-400 hover:text-slate-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4 text-xs">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Full Name</label>
                  <input
                    type="text"
                    value={parsedData.personalInfo?.fullName || ""}
                    onChange={(e) => setParsedData({
                      ...parsedData,
                      personalInfo: { ...parsedData.personalInfo, fullName: e.target.value }
                    })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Email</label>
                  <input
                    type="email"
                    value={parsedData.personalInfo?.email || ""}
                    onChange={(e) => setParsedData({
                      ...parsedData,
                      personalInfo: { ...parsedData.personalInfo, email: e.target.value }
                    })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Summary</label>
                  <textarea
                    rows={3}
                    value={parsedData.summary || ""}
                    onChange={(e) => setParsedData({ ...parsedData, summary: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Extracted Skills ({parsedData.skills?.[0]?.items?.length || 0})
                  </label>
                  <div className="flex flex-wrap gap-1.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                    {(parsedData.skills?.[0]?.items || []).map((sk: string, idx: number) => (
                      <span key={idx} className="px-2.5 py-0.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-semibold text-[11px]">
                        {sk}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={() => setIsReviewOpen(false)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold"
                >
                  Back
                </button>
                <button
                  onClick={handleConfirmImport}
                  className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold shadow-md shadow-purple-600/20"
                >
                  Confirm & Select Template
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
export default ResumeCreateHub;
