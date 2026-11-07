import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { useAuth } from "../context/auth-context";
import axios from "axios";
import { CircularProgress } from "../components/ui/circular-progress";

// Available Skill Categories
const SKILL_CATEGORIES = [
  "All Categories",
  "Programming Languages",
  "Frontend Development",
  "Backend Development",
  "Databases",
  "AI & Machine Learning",
  "Data Engineering",
  "Cloud & DevOps",
  "Tools & Technologies",
  "Cybersecurity"
] as const;

// Standard Target Career Roles
const TARGET_ROLES_OPTIONS = [
  "Data Engineer",
  "Software Engineer",
  "Full Stack Developer",
  "AI/ML Engineer",
  "Frontend Developer",
  "Backend Developer",
  "Python Developer",
  "Java Developer",
  "Cloud Engineer",
  "DevOps Engineer",
  "Cybersecurity Engineer",
  "Data Analyst"
];

// Major Indian Cities
const INDIAN_CITIES = [
  "Bengaluru",
  "Hyderabad",
  "Pune",
  "Mumbai",
  "Delhi / NCR",
  "Chennai",
  "Kolkata",
  "Ahmedabad",
  "Noida",
  "Gurugram",
  "Chandigarh",
  "Jaipur"
];

interface EducationItem {
  _id?: string;
  degree: string;
  level: string;
  specialization: string;
  institution: string;
  location: string;
  startYear: string;
  endYear: string;
  currentYear: string;
  grade: string;
  gradingScale: string;
}

interface CategorizedSkill {
  _id?: string;
  name: string;
  category: string;
  proficiency: "Beginner" | "Intermediate" | "Proficient" | "Advanced";
  yearsExperience?: string;
}

interface ExperienceItem {
  _id?: string;
  company: string;
  jobTitle: string;
  employmentType: string;
  location: string;
  startDate: string;
  endDate: string;
  currentlyWorking: boolean;
  responsibilities: string;
  technologies: string[];
  achievements?: string;
  certificateUrl?: string;
}

interface ProjectItem {
  _id?: string;
  title: string;
  shortDescription?: string;
  description: string;
  detailedDescription?: string;
  techStack: string[];
  category: string;
  github?: string;
  link?: string;
  startDate?: string;
  completionDate?: string;
  role?: string;
  contributions?: string;
  featured?: boolean;
}

interface CertificationItem {
  _id?: string;
  name: string;
  issuer: string;
  issueDate: string;
  expiryDate?: string;
  credentialId?: string;
  credentialUrl?: string;
}

interface AchievementItem {
  _id?: string;
  title: string;
  category: string;
  description: string;
  issuer: string;
  date: string;
  url?: string;
}

interface LanguageItem {
  _id?: string;
  language: string;
  proficiency: "Basic" | "Conversational" | "Professional" | "Fluent" | "Native";
}

interface CompletenessData {
  percentage: number;
  completedSections: string[];
  missingSections: Array<{
    id: string;
    name: string;
    points: number;
    actionText: string;
  }>;
}

export function ProfilePage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [activeNav, setActiveNav] = useState("overview");

  // Profile ID for public link
  const [profileId, setProfileId] = useState("");

  // 1. Overview & Headline
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [designation, setDesignation] = useState("Student & Aspiring Software Engineer");
  const [targetCareer, setTargetCareer] = useState("Data Engineer");
  const [summary, setSummary] = useState("");
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);

  // 2. Personal & Contact
  const [phone, setPhone] = useState("");
  const [dob, setDob] = useState("");
  const [city, setCity] = useState("Bengaluru");
  const [state, setState] = useState("Karnataka");
  const [country, setCountry] = useState("India");
  const [address, setAddress] = useState("");
  const [preferredContactMethod, setPreferredContactMethod] = useState<"Email" | "Phone" | "LinkedIn">("Email");
  const [isPublic, setIsPublic] = useState(true);
  const [showEmailPublic, setShowEmailPublic] = useState(false);
  const [showPhonePublic, setShowPhonePublic] = useState(false);

  // 3. Education & Academics
  const [educationHistory, setEducationHistory] = useState<EducationItem[]>([]);
  const [isAddingEdu, setIsAddingEdu] = useState(false);
  const [newDegree, setNewDegree] = useState("");
  const [newEduLevel, setNewEduLevel] = useState("Undergraduate");
  const [newSpecialization, setNewSpecialization] = useState("");
  const [newInstitution, setNewInstitution] = useState("");
  const [newEduLocation, setNewEduLocation] = useState("");
  const [newStartYear, setNewStartYear] = useState("2022");
  const [newEndYear, setNewEndYear] = useState("2026");
  const [newGrade, setNewGrade] = useState("");

  // 4. Career Preferences
  const [preferredRoles, setPreferredRoles] = useState<string[]>([]);
  const [newRoleInput, setNewRoleInput] = useState("");
  const [geoScope, setGeoScope] = useState<"india" | "international" | "remote" | "all">("india");
  const [preferredCities, setPreferredCities] = useState<string[]>(["Bengaluru", "Hyderabad"]);
  const [workModes, setWorkModes] = useState<string[]>(["Hybrid", "Remote"]);
  const [employmentTypes, setEmploymentTypes] = useState<string[]>(["Full Time", "Internship"]);
  const [minSalary, setMinSalary] = useState(8);
  const [willingToRelocate, setWillingToRelocate] = useState(true);
  const [internationalWorkAuth, setInternationalWorkAuth] = useState(false);

  // 5. Technical Skills
  const [categorizedSkills, setCategorizedSkills] = useState<CategorizedSkill[]>([]);
  const [selectedSkillCategory, setSelectedSkillCategory] = useState<string>("All Categories");
  const [skillSearch, setSkillSearch] = useState("");
  const [isAddingSkill, setIsAddingSkill] = useState(false);
  const [newSkillName, setNewSkillName] = useState("");
  const [newSkillCategory, setNewSkillCategory] = useState<string>("Programming Languages");
  const [newSkillProficiency, setNewSkillProficiency] = useState<"Beginner" | "Intermediate" | "Proficient" | "Advanced">("Intermediate");

  // 6. Work Experience
  const [isFresher, setIsFresher] = useState(true);
  const [workExperience, setWorkExperience] = useState<ExperienceItem[]>([]);
  const [isAddingExp, setIsAddingExp] = useState(false);
  const [newExpCompany, setNewExpCompany] = useState("");
  const [newExpTitle, setNewExpTitle] = useState("");
  const [newExpType, setNewExpType] = useState("Internship");
  const [newExpLocation, setNewExpLocation] = useState("");
  const [newExpStart, setNewExpStart] = useState("");
  const [newExpEnd, setNewExpEnd] = useState("");
  const [newExpCurrent, setNewExpCurrent] = useState(false);
  const [newExpResp, setNewExpResp] = useState("");
  const [newExpTech, setNewExpTech] = useState("");

  // 7. Projects & Portfolio
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [isAddingProject, setIsAddingProject] = useState(false);
  const [newProjTitle, setNewProjTitle] = useState("");
  const [newProjCategory, setNewProjCategory] = useState("Web Development");
  const [newProjDesc, setNewProjDesc] = useState("");
  const [newProjTech, setNewProjTech] = useState("");
  const [newProjGithub, setNewProjGithub] = useState("");
  const [newProjLink, setNewProjLink] = useState("");
  const [newProjFeatured, setNewProjFeatured] = useState(false);

  // 8. Certifications & Achievements
  const [certifications, setCertifications] = useState<CertificationItem[]>([]);
  const [isAddingCert, setIsAddingCert] = useState(false);
  const [newCertName, setNewCertName] = useState("");
  const [newCertIssuer, setNewCertIssuer] = useState("");
  const [newCertDate, setNewCertDate] = useState("");
  const [newCertUrl, setNewCertUrl] = useState("");

  const [achievements, setAchievements] = useState<AchievementItem[]>([]);
  const [isAddingAch, setIsAddingAch] = useState(false);
  const [newAchTitle, setNewAchTitle] = useState("");
  const [newAchCategory, setNewAchCategory] = useState("Hackathon");
  const [newAchDesc, setNewAchDesc] = useState("");
  const [newAchDate, setNewAchDate] = useState("");

  // 9. Professional Links
  const [githubLink, setGithubLink] = useState("");
  const [linkedinLink, setLinkedinLink] = useState("");
  const [leetcodeLink, setLeetcodeLink] = useState("");
  const [kaggleLink, setKaggleLink] = useState("");
  const [portfolioLink, setPortfolioLink] = useState("");

  // 10. Soft Skills & Languages
  const [softSkills, setSoftSkills] = useState<string[]>(["Communication", "Problem-solving", "Teamwork"]);
  const [newSoftSkillInput, setNewSoftSkillInput] = useState("");
  const [languages, setLanguages] = useState<LanguageItem[]>([
    { language: "English", proficiency: "Professional" },
    { language: "Hindi", proficiency: "Native" }
  ]);
  const [newLangName, setNewLangName] = useState("");
  const [newLangProf, setNewLangProf] = useState<"Basic" | "Conversational" | "Professional" | "Fluent" | "Native">("Conversational");

  // 11. Resume Analyzer Status
  const [resumeData, setResumeData] = useState<any>(null);

  // Completeness Metrics
  const [completeness, setCompleteness] = useState<CompletenessData>({
    percentage: 75,
    completedSections: [],
    missingSections: []
  });

  // Load Profile from Server
  const loadProfile = async () => {
    setLoading(true);
    const token = localStorage.getItem("token");
    try {
      const res = await axios.get("http://localhost:5000/api/profile/me", {
        headers: token ? { "x-auth-token": token } : undefined
      });

      if (res.data) {
        const p = res.data;
        setProfileId(p._id || "");
        setName(p.user?.name || user?.name || "");
        setEmail(p.user?.email || user?.email || "");
        setPhone(p.phone || p.user?.phone || "");
        setDesignation(p.designation || "Student & Aspiring Software Engineer");
        setTargetCareer(p.targetCareer || "Data Engineer");
        setSummary(p.summary || "");
        setDob(p.dob || "");
        setCity(p.city || "Bengaluru");
        setState(p.state || "Karnataka");
        setCountry(p.country || "India");
        setAddress(p.address || "");
        setPreferredContactMethod(p.preferredContactMethod || "Email");
        setIsPublic(p.isPublic !== undefined ? p.isPublic : true);
        setShowEmailPublic(p.publicPreferences?.showEmail || false);
        setShowPhonePublic(p.publicPreferences?.showPhone || false);

        setEducationHistory(Array.isArray(p.educationHistory) ? p.educationHistory : []);
        setCategorizedSkills(Array.isArray(p.categorizedSkills) ? p.categorizedSkills : []);
        setIsFresher(p.isFresher !== undefined ? p.isFresher : true);
        setWorkExperience(Array.isArray(p.workExperience) ? p.workExperience : []);
        setProjects(Array.isArray(p.projects) ? p.projects : []);
        setCertifications(Array.isArray(p.certifications) ? p.certifications : []);
        setAchievements(Array.isArray(p.achievements) ? p.achievements : []);

        if (p.professionalLinks) {
          setGithubLink(p.professionalLinks.github || "");
          setLinkedinLink(p.professionalLinks.linkedin || "");
          setLeetcodeLink(p.professionalLinks.leetcode || "");
          setKaggleLink(p.professionalLinks.kaggle || "");
          setPortfolioLink(p.professionalLinks.portfolio || "");
        }

        if (p.careerPreferences) {
          setPreferredRoles(p.careerPreferences.preferredRoles || [p.targetCareer || "Data Engineer"]);
          setGeoScope(p.careerPreferences.geoScope || "india");
          setPreferredCities(p.careerPreferences.preferredCities || ["Bengaluru", "Hyderabad"]);
          setWorkModes(p.careerPreferences.workModes || ["Hybrid", "Remote"]);
          setEmploymentTypes(p.careerPreferences.employmentTypes || ["Full Time", "Internship"]);
          setMinSalary(p.careerPreferences.minSalary || 8);
          setWillingToRelocate(p.careerPreferences.willingToRelocate !== undefined ? p.careerPreferences.willingToRelocate : true);
          setInternationalWorkAuth(p.careerPreferences.internationalWorkAuthorization || false);
        }

        if (p.softSkills && p.softSkills.length > 0) {
          setSoftSkills(p.softSkills);
        }
        if (p.languages && p.languages.length > 0) {
          setLanguages(p.languages);
        }

        setResumeData(p.resumeData || null);
        if (p.completeness) {
          setCompleteness(p.completeness);
        }
      }
    } catch (err) {
      console.error("Error loading profile:", err);
      setName(user?.name || "");
      setEmail(user?.email || "");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, [user]);

  // Save Full Profile
  const handleSaveProfile = async () => {
    setSaving(true);
    setSaveSuccess(false);
    setErrorMessage("");

    const token = localStorage.getItem("token");
    const headers = token ? { "x-auth-token": token } : undefined;

    try {
      const payload = {
        name,
        phone,
        designation,
        summary,
        dob,
        city,
        state,
        country,
        address,
        preferredContactMethod,
        isPublic,
        publicPreferences: {
          showEmail: showEmailPublic,
          showPhone: showPhonePublic,
          showEducation: true,
          showExperience: true,
          showProjects: true,
          showSkills: true,
          showCertifications: true
        },
        educationHistory,
        categorizedSkills,
        softSkills,
        languages,
        isFresher,
        workExperience,
        projects,
        certifications,
        achievements,
        professionalLinks: {
          github: githubLink,
          linkedin: linkedinLink,
          leetcode: leetcodeLink,
          kaggle: kaggleLink,
          portfolio: portfolioLink
        },
        careerPreferences: {
          preferredRoles,
          geoScope,
          preferredCities,
          workModes,
          employmentTypes,
          minSalary,
          willingToRelocate,
          internationalWorkAuthorization: internationalWorkAuth
        },
        targetCareer
      };

      const res = await axios.put("http://localhost:5000/api/profile", payload, { headers });
      if (res.data?.completeness) {
        setCompleteness(res.data.completeness);
      }
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3500);
    } catch (err: any) {
      console.error("Error saving profile:", err);
      setErrorMessage(err.response?.data?.msg || "Failed to save profile changes.");
    } finally {
      setSaving(false);
    }
  };

  // Generate AI Professional Summary
  const handleGenerateSummary = async () => {
    setIsGeneratingSummary(true);
    const token = localStorage.getItem("token");
    try {
      const res = await axios.post(
        "http://localhost:5000/api/profile/generate-summary",
        {},
        { headers: token ? { "x-auth-token": token } : undefined }
      );
      if (res.data?.summary) {
        setSummary(res.data.summary);
      }
    } catch (err) {
      console.error("Error generating summary:", err);
    } finally {
      setIsGeneratingSummary(false);
    }
  };

  // Education Helpers
  const handleAddEducation = () => {
    if (!newDegree.trim() || !newInstitution.trim()) return;
    const item: EducationItem = {
      degree: newDegree.trim(),
      level: newEduLevel,
      specialization: newSpecialization.trim(),
      institution: newInstitution.trim(),
      location: newEduLocation.trim() || country,
      startYear: newStartYear,
      endYear: newEndYear,
      currentYear: `${newEndYear} Graduating`,
      grade: newGrade.trim(),
      gradingScale: "10.0 Scale"
    };
    setEducationHistory([item, ...educationHistory]);
    setIsAddingEdu(false);
    setNewDegree("");
    setNewSpecialization("");
    setNewInstitution("");
    setNewGrade("");
  };

  const handleRemoveEducation = (index: number) => {
    setEducationHistory(educationHistory.filter((_, i) => i !== index));
  };

  // Skills Helpers
  const handleAddSkill = () => {
    const trimmed = newSkillName.trim();
    if (!trimmed) return;
    const exists = categorizedSkills.some((s) => s.name.toLowerCase() === trimmed.toLowerCase());
    if (exists) return;

    const newSkill: CategorizedSkill = {
      name: trimmed,
      category: newSkillCategory,
      proficiency: newSkillProficiency,
      yearsExperience: "1-2 years"
    };
    setCategorizedSkills([...categorizedSkills, newSkill]);
    setNewSkillName("");
    setIsAddingSkill(false);
  };

  const handleRemoveSkill = (skillName: string) => {
    setCategorizedSkills(categorizedSkills.filter((s) => s.name !== skillName));
  };

  const handleUpdateSkillProficiency = (skillName: string, newProf: CategorizedSkill["proficiency"]) => {
    setCategorizedSkills(
      categorizedSkills.map((s) => (s.name === skillName ? { ...s, proficiency: newProf } : s))
    );
  };

  // Experience Helpers
  const handleAddExperience = () => {
    if (!newExpCompany.trim() || !newExpTitle.trim()) return;
    const item: ExperienceItem = {
      company: newExpCompany.trim(),
      jobTitle: newExpTitle.trim(),
      employmentType: newExpType,
      location: newExpLocation.trim(),
      startDate: newExpStart,
      endDate: newExpCurrent ? "Present" : newExpEnd,
      currentlyWorking: newExpCurrent,
      responsibilities: newExpResp.trim(),
      technologies: newExpTech.split(",").map((t) => t.trim()).filter(Boolean)
    };
    setWorkExperience([...workExperience, item]);
    setIsFresher(false);
    setIsAddingExp(false);
    setNewExpCompany("");
    setNewExpTitle("");
    setNewExpResp("");
    setNewExpTech("");
  };

  const handleRemoveExperience = (index: number) => {
    setWorkExperience(workExperience.filter((_, i) => i !== index));
  };

  // Project Helpers
  const handleAddProject = () => {
    if (!newProjTitle.trim()) return;
    const item: ProjectItem = {
      title: newProjTitle.trim(),
      category: newProjCategory,
      description: newProjDesc.trim(),
      detailedDescription: newProjDesc.trim(),
      techStack: newProjTech.split(",").map((t) => t.trim()).filter(Boolean),
      github: newProjGithub.trim(),
      link: newProjLink.trim(),
      featured: newProjFeatured
    };
    setProjects([...projects, item]);
    setIsAddingProject(false);
    setNewProjTitle("");
    setNewProjDesc("");
    setNewProjTech("");
    setNewProjGithub("");
    setNewProjLink("");
    setNewProjFeatured(false);
  };

  const handleRemoveProject = (index: number) => {
    setProjects(projects.filter((_, i) => i !== index));
  };

  const handleToggleFeaturedProject = (index: number) => {
    setProjects(
      projects.map((p, i) => (i === index ? { ...p, featured: !p.featured } : p))
    );
  };

  // Certification Helpers
  const handleAddCertification = () => {
    if (!newCertName.trim() || !newCertIssuer.trim()) return;
    const item: CertificationItem = {
      name: newCertName.trim(),
      issuer: newCertIssuer.trim(),
      issueDate: newCertDate.trim(),
      credentialUrl: newCertUrl.trim()
    };
    setCertifications([...certifications, item]);
    setIsAddingCert(false);
    setNewCertName("");
    setNewCertIssuer("");
    setNewCertUrl("");
  };

  // Achievement Helpers
  const handleAddAchievement = () => {
    if (!newAchTitle.trim()) return;
    const item: AchievementItem = {
      title: newAchTitle.trim(),
      category: newAchCategory,
      description: newAchDesc.trim(),
      issuer: "Competition",
      date: newAchDate.trim()
    };
    setAchievements([...achievements, item]);
    setIsAddingAch(false);
    setNewAchTitle("");
    setNewAchDesc("");
  };

  // Soft Skills & Languages Helpers
  const handleAddSoftSkill = () => {
    const val = newSoftSkillInput.trim();
    if (val && !softSkills.includes(val)) {
      setSoftSkills([...softSkills, val]);
      setNewSoftSkillInput("");
    }
  };

  const handleAddLanguage = () => {
    const val = newLangName.trim();
    if (val && !languages.some((l) => l.language.toLowerCase() === val.toLowerCase())) {
      setLanguages([...languages, { language: val, proficiency: newLangProf }]);
      setNewLangName("");
    }
  };

  // Filter skills by category & search
  const filteredSkills = categorizedSkills.filter((sk) => {
    const matchesCat = selectedSkillCategory === "All Categories" || sk.category === selectedSkillCategory;
    const matchesQuery = sk.name.toLowerCase().includes(skillSearch.toLowerCase());
    return matchesCat && matchesQuery;
  });

  const initials = name
    ? name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "ST";

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-3">
        <span className="material-symbols-outlined animate-spin text-indigo-600 text-[36px]">
          sync
        </span>
        <p className="text-xs font-semibold text-slate-500">Loading student professional profile...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 font-sans">
      
      {/* ======================================================== */}
      {/* 1. TOP HEADER & COMPLETENESS BAR                         */}
      {/* ======================================================== */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 sm:p-8 relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-start gap-5">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center text-2xl font-black shadow-md shadow-indigo-100 shrink-0">
            {initials}
          </div>

          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">{name || "Student Profile"}</h1>
              <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-[11px] font-bold border border-indigo-200/70">
                Verified Student
              </span>
            </div>
            <p className="text-xs font-bold text-slate-600">{designation}</p>
            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 pt-0.5">
              <span>{email}</span>
              {phone && <span>• {phone}</span>}
              <span>• {city}, {country}</span>
            </div>
          </div>
        </div>

        {/* Right Completeness & Primary Action */}
        <div className="flex items-center gap-6 shrink-0">
          <div className="flex items-center gap-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-200/70">
            <CircularProgress value={completeness.percentage} size="sm" variant="primary" />
            <div>
              <div className="text-xs font-black text-slate-900">{completeness.percentage}% Complete</div>
              <div className="text-[11px] text-slate-500 font-medium">Professional Readiness</div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-2.5">
            <Link
              to={`/portfolio/${profileId || user?.id}`}
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <span className="material-symbols-outlined text-[16px]">visibility</span>
              <span>View Public Portfolio</span>
            </Link>

            <button
              type="button"
              onClick={handleSaveProfile}
              disabled={saving}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {saving ? (
                <>
                  <span className="material-symbols-outlined text-[16px] animate-spin">sync</span>
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[16px]">save</span>
                  <span>Save Profile</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Toast Alert Feedback */}
      {saveSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <span className="material-symbols-outlined text-[20px] text-emerald-600">check_circle</span>
          <span>Profile and portfolio updated successfully across Career Compass!</span>
        </div>
      )}
      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <span className="material-symbols-outlined text-[20px] text-rose-600">error</span>
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Completeness Missing Sections Bar */}
      {completeness.missingSections.length > 0 && (
        <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200 text-amber-950 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="material-symbols-outlined text-amber-600 text-[22px]">info</span>
            <div>
              <div className="text-xs font-bold">Recommended actions to boost profile matching:</div>
              <div className="text-[11px] text-amber-800">
                {completeness.missingSections.map((m) => m.name).join(" • ")}
              </div>
            </div>
          </div>
          <a
            href={`#${completeness.missingSections[0]?.id || "skills"}`}
            className="text-xs font-black text-amber-900 underline hover:text-amber-700 shrink-0"
          >
            {completeness.missingSections[0]?.actionText} →
          </a>
        </div>
      )}

      {/* ======================================================== */}
      {/* 2. SECTION SUBNAV (Sticky Horizontal Bar)                */}
      {/* ======================================================== */}
      <div className="flex items-center gap-1.5 p-1.5 bg-slate-100 rounded-2xl border border-slate-200/80 overflow-x-auto sticky top-2 z-20 shadow-2xs backdrop-blur-md">
        {[
          { id: "overview", label: "Overview", icon: "person" },
          { id: "personal", label: "Contact Details", icon: "call" },
          { id: "education", label: "Education", icon: "school" },
          { id: "preferences", label: "Career Preferences", icon: "target" },
          { id: "skills", label: "Technical Skills", icon: "code" },
          { id: "experience", label: "Experience", icon: "work" },
          { id: "projects", label: "Projects", icon: "rocket_launch" },
          { id: "certifications", label: "Certifications", icon: "workspace_premium" },
          { id: "links", label: "Links", icon: "link" },
          { id: "summary", label: "AI Summary", icon: "auto_awesome" },
          { id: "resume", label: "ATS Resume", icon: "description" }
        ].map((item) => (
          <a
            key={item.id}
            href={`#${item.id}`}
            onClick={() => setActiveNav(item.id)}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
              activeNav === item.id
                ? "bg-white text-indigo-700 shadow-xs border border-slate-200/80"
                : "text-slate-600 hover:text-slate-900 hover:bg-white/40"
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">{item.icon}</span>
            <span>{item.label}</span>
          </a>
        ))}
      </div>

      {/* ======================================================== */}
      {/* 3. PROFILE FORM SECTIONS                                 */}
      {/* ======================================================== */}
      <div className="space-y-8">

        {/* SECTION: PERSONAL & CONTACT DETAILS */}
        <section id="personal" className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2.5">
              <span className="material-symbols-outlined text-indigo-600 text-[24px]">contact_mail</span>
              <div>
                <h2 className="text-base font-black text-slate-900">Personal & Contact Details</h2>
                <p className="text-xs text-slate-500">Contact information used for verified applications and profile identity.</p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <label className="flex items-center gap-2 cursor-pointer text-slate-600 font-semibold">
                <input
                  type="checkbox"
                  checked={isPublic}
                  onChange={(e) => setIsPublic(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-0"
                />
                Public Profile Enabled
              </label>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1.5">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1.5 flex items-center justify-between">
                <span>Email Address</span>
                <span className="text-[10px] text-slate-400 font-bold">Read-Only (Auth)</span>
              </label>
              <input
                type="email"
                value={email}
                disabled
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-500 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1.5">Phone Number</label>
              <input
                type="text"
                placeholder="+91 98765 43210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1.5">Current City</label>
              <input
                type="text"
                placeholder="e.g. Bengaluru"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1.5">State / Region</label>
              <input
                type="text"
                placeholder="e.g. Karnataka"
                value={state}
                onChange={(e) => setState(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1.5">Country</label>
              <input
                type="text"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="text-xs font-bold text-slate-700 block mb-1.5">Professional Designation / Headline</label>
              <input
                type="text"
                placeholder="e.g. Final Year B.Tech CSE | Aspiring Data Engineer"
                value={designation}
                onChange={(e) => setDesignation(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1.5">Preferred Contact Method</label>
              <select
                value={preferredContactMethod}
                onChange={(e: any) => setPreferredContactMethod(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-none focus:border-indigo-500"
              >
                <option value="Email">Email</option>
                <option value="Phone">Phone</option>
                <option value="LinkedIn">LinkedIn</option>
              </select>
            </div>
          </div>

          {/* Privacy Controls */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex flex-wrap items-center gap-6 text-xs text-slate-700">
            <span className="font-bold text-slate-900">Public Privacy:</span>
            <label className="flex items-center gap-2 cursor-pointer font-medium">
              <input
                type="checkbox"
                checked={showEmailPublic}
                onChange={(e) => setShowEmailPublic(e.target.checked)}
                className="rounded text-indigo-600 focus:ring-0"
              />
              Show email on public portfolio
            </label>
            <label className="flex items-center gap-2 cursor-pointer font-medium">
              <input
                type="checkbox"
                checked={showPhonePublic}
                onChange={(e) => setShowPhonePublic(e.target.checked)}
                className="rounded text-indigo-600 focus:ring-0"
              />
              Show phone on public portfolio
            </label>
          </div>
        </section>

        {/* SECTION: EDUCATION & ACADEMICS */}
        <section id="education" className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2.5">
              <span className="material-symbols-outlined text-indigo-600 text-[24px]">school</span>
              <div>
                <h2 className="text-base font-black text-slate-900">Education & Academics</h2>
                <p className="text-xs text-slate-500">Degree programs, academic specializations, and CGPA.</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsAddingEdu(!isAddingEdu)}
              className="px-3.5 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">add</span>
              <span>Add Education</span>
            </button>
          </div>

          {/* Add Education Inline Card */}
          {isAddingEdu && (
            <div className="p-5 rounded-2xl bg-indigo-50/50 border border-indigo-200 space-y-4 animate-in fade-in">
              <h4 className="text-xs font-bold text-indigo-950 uppercase tracking-wider">New Academic Record</h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">Degree</label>
                  <input
                    type="text"
                    placeholder="e.g. Bachelor of Technology (B.Tech)"
                    value={newDegree}
                    onChange={(e) => setNewDegree(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-900"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">Level</label>
                  <select
                    value={newEduLevel}
                    onChange={(e) => setNewEduLevel(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-900"
                  >
                    <option value="Undergraduate">Undergraduate</option>
                    <option value="Postgraduate">Postgraduate</option>
                    <option value="Higher Secondary">Higher Secondary (12th)</option>
                    <option value="Secondary">Secondary (10th)</option>
                    <option value="Diploma">Diploma</option>
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">Specialization / Branch</label>
                  <input
                    type="text"
                    placeholder="e.g. Computer Science & Engineering"
                    value={newSpecialization}
                    onChange={(e) => setNewSpecialization(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-900"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">College / University</label>
                  <input
                    type="text"
                    placeholder="e.g. National Institute of Technology"
                    value={newInstitution}
                    onChange={(e) => setNewInstitution(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-900"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">Start & Graduation Year</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Start"
                      value={newStartYear}
                      onChange={(e) => setNewStartYear(e.target.value)}
                      className="w-1/2 px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-900"
                    />
                    <input
                      type="text"
                      placeholder="End"
                      value={newEndYear}
                      onChange={(e) => setNewEndYear(e.target.value)}
                      className="w-1/2 px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-900"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">CGPA / Percentage</label>
                  <input
                    type="text"
                    placeholder="e.g. 8.5 / 10.0"
                    value={newGrade}
                    onChange={(e) => setNewGrade(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-900"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddingEdu(false)}
                  className="px-3.5 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleAddEducation}
                  className="px-4 py-1.5 rounded-xl bg-indigo-600 text-white text-xs font-bold shadow-xs cursor-pointer"
                >
                  Save Record
                </button>
              </div>
            </div>
          )}

          {/* Education List */}
          <div className="space-y-3">
            {educationHistory.map((edu, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200 flex items-start justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs font-bold text-slate-900">{edu.degree}</h4>
                    <span className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-[10px] font-bold text-indigo-700">
                      {edu.level}
                    </span>
                  </div>
                  <div className="text-xs font-semibold text-slate-700">{edu.institution}</div>
                  <div className="text-[11px] text-slate-500">
                    {edu.specialization ? `${edu.specialization} • ` : ""}
                    {edu.startYear} – {edu.endYear}
                    {edu.grade ? ` • CGPA: ${edu.grade}` : ""}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleRemoveEducation(idx)}
                  className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg cursor-pointer"
                  title="Remove record"
                >
                  <span className="material-symbols-outlined text-[18px]">delete</span>
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* SECTION: CAREER PREFERENCES */}
        <section id="preferences" className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2.5">
              <span className="material-symbols-outlined text-indigo-600 text-[24px]">target</span>
              <div>
                <h2 className="text-base font-black text-slate-900">Career Preferences</h2>
                <p className="text-xs text-slate-500">Target roles, geographical preferences, and work parameters powering Job Discovery.</p>
              </div>
            </div>
          </div>

          <div className="space-y-5">
            {/* Target Career Roles */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-2">Target Career Roles</label>
              <div className="flex flex-wrap gap-2 mb-3">
                {preferredRoles.map((role) => (
                  <span
                    key={role}
                    className="px-3 py-1.5 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-bold flex items-center gap-1.5"
                  >
                    <span>{role}</span>
                    <button
                      type="button"
                      onClick={() => setPreferredRoles(preferredRoles.filter((r) => r !== role))}
                      className="hover:text-indigo-900 cursor-pointer"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>

              {/* Add Role Dropdown / Tag */}
              <div className="flex items-center gap-2 max-w-md">
                <select
                  value=""
                  onChange={(e) => {
                    if (e.target.value && !preferredRoles.includes(e.target.value)) {
                      setPreferredRoles([...preferredRoles, e.target.value]);
                      setTargetCareer(e.target.value);
                    }
                  }}
                  className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none"
                >
                  <option value="">+ Add Popular Target Role...</option>
                  {TARGET_ROLES_OPTIONS.filter((r) => !preferredRoles.includes(r)).map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Geographical Scope */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-2">Geographical Discovery Preference</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { id: "india", label: "India 🇮🇳", desc: "Domestic hubs" },
                  { id: "international", label: "International 🌎", desc: "US, UK, EU, Singapore" },
                  { id: "remote", label: "Remote Worldwide 🌐", desc: "Global distributed" },
                  { id: "all", label: "All Opportunities 🌍", desc: "No geo filters" }
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setGeoScope(item.id as any)}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                      geoScope === item.id
                        ? "bg-indigo-50/70 border-indigo-300 ring-1 ring-indigo-200 text-indigo-950"
                        : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    <div className="text-xs font-bold">{item.label}</div>
                    <div className="text-[10.5px] text-slate-500 font-medium">{item.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Work Modes & Employment Type */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-2">Work Modes</label>
                <div className="flex flex-wrap gap-3">
                  {["Remote", "Hybrid", "On-site"].map((mode) => (
                    <label key={mode} className="flex items-center gap-2 text-xs font-semibold text-slate-800 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={workModes.includes(mode)}
                        onChange={(e) => {
                          if (e.target.checked) setWorkModes([...workModes, mode]);
                          else setWorkModes(workModes.filter((m) => m !== mode));
                        }}
                        className="rounded text-indigo-600 focus:ring-0"
                      />
                      <span>{mode}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-2">Employment Types</label>
                <div className="flex flex-wrap gap-3">
                  {["Full Time", "Internship", "Contract"].map((type) => (
                    <label key={type} className="flex items-center gap-2 text-xs font-semibold text-slate-800 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={employmentTypes.includes(type)}
                        onChange={(e) => {
                          if (e.target.checked) setEmploymentTypes([...employmentTypes, type]);
                          else setEmploymentTypes(employmentTypes.filter((t) => t !== type));
                        }}
                        className="rounded text-indigo-600 focus:ring-0"
                      />
                      <span>{type}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Relocation & Visa authorization */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-wrap items-center gap-6 text-xs text-slate-800">
              <label className="flex items-center gap-2 font-bold cursor-pointer">
                <input
                  type="checkbox"
                  checked={willingToRelocate}
                  onChange={(e) => setWillingToRelocate(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-0"
                />
                Willing to relocate for opportunities
              </label>

              <label className="flex items-center gap-2 font-bold cursor-pointer">
                <input
                  type="checkbox"
                  checked={internationalWorkAuth}
                  onChange={(e) => setInternationalWorkAuth(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-0"
                />
                Holds international work authorization / citizenship
              </label>
            </div>
          </div>
        </section>

        {/* SECTION: TECHNICAL & PROFESSIONAL SKILLS */}
        <section id="skills" className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2.5">
              <span className="material-symbols-outlined text-indigo-600 text-[24px]">code</span>
              <div>
                <h2 className="text-base font-black text-slate-900">Technical & Professional Skills</h2>
                <p className="text-xs text-slate-500">Categorized skills with verifiable proficiency levels powering AI Job Matching.</p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsAddingSkill(!isAddingSkill)}
              className="px-3.5 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer shrink-0"
            >
              <span className="material-symbols-outlined text-[16px]">add</span>
              <span>Add Skill</span>
            </button>
          </div>

          {/* Add Skill Inline Form */}
          {isAddingSkill && (
            <div className="p-4 rounded-2xl bg-indigo-50/50 border border-indigo-200 space-y-3 animate-in fade-in">
              <h4 className="text-xs font-bold text-indigo-950 uppercase tracking-wider">New Skill Specification</h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">Skill Name</label>
                  <input
                    type="text"
                    placeholder="e.g. PyTorch, React, Apache Spark..."
                    value={newSkillName}
                    onChange={(e) => setNewSkillName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-900"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">Category</label>
                  <select
                    value={newSkillCategory}
                    onChange={(e) => setNewSkillCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-900"
                  >
                    {SKILL_CATEGORIES.filter((c) => c !== "All Categories").map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">Proficiency Level</label>
                  <select
                    value={newSkillProficiency}
                    onChange={(e: any) => setNewSkillProficiency(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-900"
                  >
                    <option value="Beginner">Beginner (Foundations)</option>
                    <option value="Intermediate">Intermediate (Project experience)</option>
                    <option value="Proficient">Proficient (Production ready)</option>
                    <option value="Advanced">Advanced (Deep expertise)</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsAddingSkill(false)}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleAddSkill}
                  className="px-4 py-1.5 rounded-xl bg-indigo-600 text-white text-xs font-bold shadow-xs cursor-pointer"
                >
                  Add Skill
                </button>
              </div>
            </div>
          )}

          {/* Category Filter Pills & Search */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
              {SKILL_CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedSkillCategory(cat)}
                  className={`px-3 py-1 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                    selectedSkillCategory === cat
                      ? "bg-slate-900 text-white shadow-xs"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="w-full sm:w-48 relative">
              <input
                type="text"
                placeholder="Search skills..."
                value={skillSearch}
                onChange={(e) => setSkillSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800"
              />
              <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-[16px]">
                search
              </span>
            </div>
          </div>

          {/* Skills Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredSkills.map((sk) => (
              <div
                key={sk.name}
                className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-2"
              >
                <div>
                  <div className="text-xs font-bold text-slate-900">{sk.name}</div>
                  <div className="text-[10.5px] text-slate-400">{sk.category}</div>
                </div>

                <div className="flex items-center gap-1.5">
                  <select
                    value={sk.proficiency}
                    onChange={(e: any) => handleUpdateSkillProficiency(sk.name, e.target.value)}
                    className={`text-[10.5px] font-bold px-2 py-0.5 rounded-md border focus:outline-none cursor-pointer ${
                      sk.proficiency === "Advanced"
                        ? "bg-purple-50 text-purple-700 border-purple-200"
                        : sk.proficiency === "Proficient"
                        ? "bg-indigo-50 text-indigo-700 border-indigo-200"
                        : sk.proficiency === "Intermediate"
                        ? "bg-blue-50 text-blue-700 border-blue-200"
                        : "bg-slate-100 text-slate-600 border-slate-200"
                    }`}
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Proficient">Proficient</option>
                    <option value="Advanced">Advanced</option>
                  </select>

                  <button
                    type="button"
                    onClick={() => handleRemoveSkill(sk.name)}
                    className="p-1 text-slate-400 hover:text-rose-600 cursor-pointer"
                    title="Remove skill"
                  >
                    <span className="material-symbols-outlined text-[16px]">close</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* SECTION: WORK EXPERIENCE & INTERNSHIPS */}
        <section id="experience" className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2.5">
              <span className="material-symbols-outlined text-indigo-600 text-[24px]">work</span>
              <div>
                <h2 className="text-base font-black text-slate-900">Work Experience & Internships</h2>
                <p className="text-xs text-slate-500">Internship and employment history, or declared Fresher status.</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 text-xs font-bold text-slate-800 cursor-pointer bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
                <input
                  type="checkbox"
                  checked={isFresher}
                  onChange={(e) => {
                    setIsFresher(e.target.checked);
                    if (e.target.checked) setWorkExperience([]);
                  }}
                  className="rounded text-indigo-600 focus:ring-0"
                />
                Fresher — No Work Experience
              </label>

              {!isFresher && (
                <button
                  type="button"
                  onClick={() => setIsAddingExp(!isAddingExp)}
                  className="px-3.5 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px]">add</span>
                  <span>Add Experience</span>
                </button>
              )}
            </div>
          </div>

          {/* Fresher Status Notice */}
          {isFresher ? (
            <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 text-xs text-emerald-900 flex items-center gap-3">
              <span className="material-symbols-outlined text-emerald-600 text-[24px]">verified</span>
              <div>
                <div className="font-bold">Marked as Fresher (Job-Ready Graduate)</div>
                <div className="text-[11px] text-emerald-700">
                  You are targeting fresher and entry-level engineering roles. Your projects and technical skills will be highlighted.
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Add Experience Inline Form */}
              {isAddingExp && (
                <div className="p-4 rounded-2xl bg-indigo-50/50 border border-indigo-200 space-y-3 animate-in fade-in">
                  <h4 className="text-xs font-bold text-indigo-950 uppercase tracking-wider">New Work Experience</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="text-[11px] font-bold text-slate-700 block mb-1">Company Name</label>
                      <input
                        type="text"
                        placeholder="e.g. Google, TechNova"
                        value={newExpCompany}
                        onChange={(e) => setNewExpCompany(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-900"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-slate-700 block mb-1">Job Title</label>
                      <input
                        type="text"
                        placeholder="e.g. Software Engineering Intern"
                        value={newExpTitle}
                        onChange={(e) => setNewExpTitle(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-900"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-slate-700 block mb-1">Employment Type</label>
                      <select
                        value={newExpType}
                        onChange={(e) => setNewExpType(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-900"
                      >
                        <option value="Internship">Internship</option>
                        <option value="Full-time">Full-time</option>
                        <option value="Part-time">Part-time</option>
                        <option value="Contract">Contract</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-slate-700 block mb-1">Location</label>
                      <input
                        type="text"
                        placeholder="e.g. Bengaluru / Remote"
                        value={newExpLocation}
                        onChange={(e) => setNewExpLocation(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-900"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-slate-700 block mb-1">Duration (Start – End)</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          placeholder="Jan 2024"
                          value={newExpStart}
                          onChange={(e) => setNewExpStart(e.target.value)}
                          className="w-1/2 px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-900"
                        />
                        <input
                          type="text"
                          placeholder="Jun 2024"
                          value={newExpEnd}
                          onChange={(e) => setNewExpEnd(e.target.value)}
                          disabled={newExpCurrent}
                          className="w-1/2 px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-900"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-slate-700 block mb-1">Technologies Used</label>
                      <input
                        type="text"
                        placeholder="React, Node.js, AWS (comma separated)"
                        value={newExpTech}
                        onChange={(e) => setNewExpTech(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-900"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">Key Responsibilities & Deliverables</label>
                    <textarea
                      rows={2}
                      placeholder="Describe what you engineered or delivered..."
                      value={newExpResp}
                      onChange={(e) => setNewExpResp(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-900"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setIsAddingExp(false)}
                      className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleAddExperience}
                      className="px-4 py-1.5 rounded-xl bg-indigo-600 text-white text-xs font-bold shadow-xs cursor-pointer"
                    >
                      Save Experience
                    </button>
                  </div>
                </div>
              )}

              {/* Experience Records */}
              {workExperience.map((exp, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200 flex items-start justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-bold text-slate-900">{exp.jobTitle}</h4>
                      <span className="text-xs font-semibold text-emerald-700">@ {exp.company}</span>
                      <span className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-[10px] font-bold text-slate-600">
                        {exp.employmentType}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400">
                      {exp.startDate} – {exp.currentlyWorking ? "Present" : exp.endDate} {exp.location ? `• ${exp.location}` : ""}
                    </div>
                    {exp.responsibilities && (
                      <p className="text-xs text-slate-600 pt-1 leading-relaxed">{exp.responsibilities}</p>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRemoveExperience(idx)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg cursor-pointer"
                    title="Remove record"
                  >
                    <span className="material-symbols-outlined text-[18px]">delete</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* SECTION: PROJECTS & PORTFOLIO */}
        <section id="projects" className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2.5">
              <span className="material-symbols-outlined text-indigo-600 text-[24px]">rocket_launch</span>
              <div>
                <h2 className="text-base font-black text-slate-900">Projects & Portfolio</h2>
                <p className="text-xs text-slate-500">Showcase software applications, system architectures, and live demonstrations.</p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsAddingProject(!isAddingProject)}
              className="px-3.5 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer shrink-0"
            >
              <span className="material-symbols-outlined text-[16px]">add</span>
              <span>Add Project</span>
            </button>
          </div>

          {/* Add Project Form */}
          {isAddingProject && (
            <div className="p-5 rounded-2xl bg-indigo-50/50 border border-indigo-200 space-y-3 animate-in fade-in">
              <h4 className="text-xs font-bold text-indigo-950 uppercase tracking-wider">New Project Specification</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">Project Title</label>
                  <input
                    type="text"
                    placeholder="e.g. Real-Time Distributed Pipeline"
                    value={newProjTitle}
                    onChange={(e) => setNewProjTitle(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-900"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">Category</label>
                  <select
                    value={newProjCategory}
                    onChange={(e) => setNewProjCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-900"
                  >
                    <option value="Web Development">Web Development</option>
                    <option value="AI & Machine Learning">AI & Machine Learning</option>
                    <option value="Data Engineering">Data Engineering</option>
                    <option value="Cloud & DevOps">Cloud & DevOps</option>
                    <option value="Mobile App">Mobile App</option>
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">Technologies Used</label>
                  <input
                    type="text"
                    placeholder="Python, Spark, Docker, AWS (comma separated)"
                    value={newProjTech}
                    onChange={(e) => setNewProjTech(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-900"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">Description & Problem Solved</label>
                  <textarea
                    rows={3}
                    placeholder="Detailed explanation of the project architecture and features..."
                    value={newProjDesc}
                    onChange={(e) => setNewProjDesc(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-900"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">GitHub Repository URL</label>
                  <input
                    type="text"
                    placeholder="https://github.com/..."
                    value={newProjGithub}
                    onChange={(e) => setNewProjGithub(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-900"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">Live Demo / Deployed Link</label>
                  <input
                    type="text"
                    placeholder="https://myproject.dev"
                    value={newProjLink}
                    onChange={(e) => setNewProjLink(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-900"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <label className="flex items-center gap-2 text-xs font-bold text-slate-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newProjFeatured}
                    onChange={(e) => setNewProjFeatured(e.target.checked)}
                    className="rounded text-indigo-600 focus:ring-0"
                  />
                  Mark as Featured Project
                </label>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsAddingProject(false)}
                    className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleAddProject}
                    className="px-4 py-1.5 rounded-xl bg-indigo-600 text-white text-xs font-bold shadow-xs cursor-pointer"
                  >
                    Save Project
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Projects List */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {projects.map((proj, idx) => (
              <div
                key={idx}
                className={`p-5 rounded-2xl border shadow-xs flex flex-col justify-between ${
                  proj.featured ? "bg-indigo-50/30 border-indigo-200" : "bg-slate-50/70 border-slate-200"
                }`}
              >
                <div className="space-y-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-bold text-slate-900">{proj.title}</h4>
                      {proj.featured && (
                        <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 text-[9.5px] font-black border border-amber-200">
                          ★ Featured
                        </span>
                      )}
                    </div>
                    <span className="text-[10.5px] text-slate-400 font-semibold">{proj.category}</span>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
                    {proj.detailedDescription || proj.description || proj.shortDescription}
                  </p>

                  <div className="flex flex-wrap gap-1">
                    {(proj.techStack || []).map((t, tIdx) => (
                      <span key={tIdx} className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-700 text-[10px] font-medium">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-3 mt-3 border-t border-slate-200/60 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    {proj.github && (
                      <a href={proj.github} target="_blank" rel="noreferrer" className="text-slate-700 hover:text-indigo-600 font-bold flex items-center gap-1">
                        <span className="material-symbols-outlined text-[15px]">code</span>
                        <span>Code</span>
                      </a>
                    )}
                    {proj.link && (
                      <a href={proj.link} target="_blank" rel="noreferrer" className="text-indigo-600 hover:text-indigo-800 font-bold flex items-center gap-1">
                        <span className="material-symbols-outlined text-[15px]">open_in_new</span>
                        <span>Demo</span>
                      </a>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleToggleFeaturedProject(idx)}
                      className={`text-[11px] font-bold cursor-pointer ${proj.featured ? "text-amber-600" : "text-slate-400 hover:text-slate-700"}`}
                    >
                      {proj.featured ? "Unfeature" : "Star"}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemoveProject(idx)}
                      className="text-slate-400 hover:text-rose-600 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[16px]">delete</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* SECTION: CERTIFICATIONS & ACHIEVEMENTS */}
        <section id="certifications" className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2.5">
              <span className="material-symbols-outlined text-amber-500 text-[24px]">workspace_premium</span>
              <div>
                <h2 className="text-base font-black text-slate-900">Certifications & Achievements</h2>
                <p className="text-xs text-slate-500">Industry credentials, course certifications, hackathons, and awards.</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsAddingCert(!isAddingCert)}
                className="px-3 py-1.5 rounded-xl bg-indigo-50 text-indigo-700 text-xs font-bold hover:bg-indigo-100 cursor-pointer"
              >
                + Certification
              </button>
              <button
                type="button"
                onClick={() => setIsAddingAch(!isAddingAch)}
                className="px-3 py-1.5 rounded-xl bg-amber-50 text-amber-800 text-xs font-bold hover:bg-amber-100 cursor-pointer"
              >
                + Achievement
              </button>
            </div>
          </div>

          {/* Add Certification Inline */}
          {isAddingCert && (
            <div className="p-4 rounded-2xl bg-indigo-50/50 border border-indigo-200 space-y-3">
              <h4 className="text-xs font-bold text-indigo-950 uppercase">New Professional Certification</h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <input
                  type="text"
                  placeholder="Certification Name (e.g. AWS Solutions Architect)"
                  value={newCertName}
                  onChange={(e) => setNewCertName(e.target.value)}
                  className="px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-semibold"
                />
                <input
                  type="text"
                  placeholder="Issuer (e.g. Amazon Web Services, Coursera)"
                  value={newCertIssuer}
                  onChange={(e) => setNewCertIssuer(e.target.value)}
                  className="px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-semibold"
                />
                <input
                  type="text"
                  placeholder="Verification URL"
                  value={newCertUrl}
                  onChange={(e) => setNewCertUrl(e.target.value)}
                  className="px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-semibold"
                />
              </div>
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setIsAddingCert(false)} className="px-3 py-1 text-xs font-bold text-slate-600">Cancel</button>
                <button type="button" onClick={handleAddCertification} className="px-4 py-1.5 rounded-xl bg-indigo-600 text-white text-xs font-bold">Add Cert</button>
              </div>
            </div>
          )}

          {/* Add Achievement Inline */}
          {isAddingAch && (
            <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-200 space-y-3">
              <h4 className="text-xs font-bold text-amber-950 uppercase">New Achievement / Competition</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="Achievement Title (e.g. Smart India Hackathon Finalist)"
                  value={newAchTitle}
                  onChange={(e) => setNewAchTitle(e.target.value)}
                  className="px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-semibold"
                />
                <input
                  type="text"
                  placeholder="Date / Year"
                  value={newAchDate}
                  onChange={(e) => setNewAchDate(e.target.value)}
                  className="px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-semibold"
                />
                <textarea
                  rows={2}
                  placeholder="Description..."
                  value={newAchDesc}
                  onChange={(e) => setNewAchDesc(e.target.value)}
                  className="sm:col-span-2 px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-semibold"
                />
              </div>
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setIsAddingAch(false)} className="px-3 py-1 text-xs font-bold text-slate-600">Cancel</button>
                <button type="button" onClick={handleAddAchievement} className="px-4 py-1.5 rounded-xl bg-amber-600 text-white text-xs font-bold">Add Achievement</button>
              </div>
            </div>
          )}

          {/* Lists */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {certifications.map((c, idx) => (
              <div key={idx} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-slate-900">{c.name}</div>
                  <div className="text-[11px] text-indigo-600 font-semibold">{c.issuer}</div>
                </div>
                <button
                  type="button"
                  onClick={() => setCertifications(certifications.filter((_, i) => i !== idx))}
                  className="text-slate-400 hover:text-rose-600"
                >
                  <span className="material-symbols-outlined text-[16px]">close</span>
                </button>
              </div>
            ))}

            {achievements.map((a, idx) => (
              <div key={idx} className="p-3.5 rounded-2xl bg-amber-50/40 border border-amber-200 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-slate-900">{a.title}</div>
                  <div className="text-[11px] text-slate-600">{a.description}</div>
                </div>
                <button
                  type="button"
                  onClick={() => setAchievements(achievements.filter((_, i) => i !== idx))}
                  className="text-slate-400 hover:text-rose-600"
                >
                  <span className="material-symbols-outlined text-[16px]">close</span>
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* SECTION: PROFESSIONAL LINKS */}
        <section id="links" className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2.5">
              <span className="material-symbols-outlined text-indigo-600 text-[24px]">link</span>
              <div>
                <h2 className="text-base font-black text-slate-900">Professional Links & Online Presence</h2>
                <p className="text-xs text-slate-500">Connect verified profiles to display as clickable badges on your public portfolio.</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">GitHub Profile</label>
              <input
                type="text"
                placeholder="https://github.com/username"
                value={githubLink}
                onChange={(e) => setGithubLink(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">LinkedIn Profile</label>
              <input
                type="text"
                placeholder="https://linkedin.com/in/username"
                value={linkedinLink}
                onChange={(e) => setLinkedinLink(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">LeetCode Profile</label>
              <input
                type="text"
                placeholder="https://leetcode.com/username"
                value={leetcodeLink}
                onChange={(e) => setLeetcodeLink(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Kaggle Profile</label>
              <input
                type="text"
                placeholder="https://kaggle.com/username"
                value={kaggleLink}
                onChange={(e) => setKaggleLink(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="text-xs font-bold text-slate-700 block mb-1">Personal Portfolio / Website</label>
              <input
                type="text"
                placeholder="https://yourname.dev"
                value={portfolioLink}
                onChange={(e) => setPortfolioLink(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900"
              />
            </div>
          </div>
        </section>

        {/* SECTION: PROFESSIONAL SUMMARY & AI GENERATION */}
        <section id="summary" className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2.5">
              <span className="material-symbols-outlined text-purple-600 text-[24px]">auto_awesome</span>
              <div>
                <h2 className="text-base font-black text-slate-900">Professional Summary</h2>
                <p className="text-xs text-slate-500">Your professional bio written manually or synthesized using genuine profile facts.</p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleGenerateSummary}
              disabled={isGeneratingSummary}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-[16px]">
                {isGeneratingSummary ? "sync" : "sparkles"}
              </span>
              <span>{isGeneratingSummary ? "Synthesizing Summary..." : "Generate with AI"}</span>
            </button>
          </div>

          <div className="space-y-2">
            <textarea
              rows={5}
              placeholder="Write a concise narrative summarizing your academic journey, technical proficiencies, and career goals..."
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs sm:text-sm font-medium text-slate-800 leading-relaxed focus:outline-none focus:border-indigo-500 focus:bg-white"
            />
            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span>Uses real verified student data: education, technical skills, and project highlights.</span>
              <span>{summary.length} characters</span>
            </div>
          </div>
        </section>

        {/* SECTION: RESUME & ATS STATUS */}
        <section id="resume" className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2.5">
              <span className="material-symbols-outlined text-indigo-600 text-[24px]">description</span>
              <div>
                <h2 className="text-base font-black text-slate-900">Resume & ATS Status</h2>
                <p className="text-xs text-slate-500">Real-time scan metrics from Resume Studio evaluated against target roles.</p>
              </div>
            </div>

            <Link
              to="/resume-studio"
              className="px-4 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold transition-colors flex items-center gap-1"
            >
              <span>Open Resume Studio</span>
              <span className="material-symbols-outlined text-[15px]">arrow_forward</span>
            </Link>
          </div>

          {resumeData?.atsScore ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-100 text-center">
                  <div className="text-2xl font-black text-indigo-700">{resumeData.atsScore}%</div>
                  <div className="text-xs font-bold text-slate-700 mt-1">ATS Compatibility Score</div>
                  <div className="text-[10.5px] text-slate-400">Target Role: {resumeData.role || targetCareer}</div>
                </div>

                <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-100 text-center">
                  <div className="text-2xl font-black text-emerald-700">{resumeData.keywordScore || 85}%</div>
                  <div className="text-xs font-bold text-slate-700 mt-1">Keyword Match Score</div>
                  <div className="text-[10.5px] text-slate-400">Industry standards</div>
                </div>

                <div className="p-4 rounded-2xl bg-purple-50/60 border border-purple-100 text-center">
                  <div className="text-2xl font-black text-purple-700">{resumeData.strengths?.length || 4}</div>
                  <div className="text-xs font-bold text-slate-700 mt-1">Strengths Detected</div>
                  <div className="text-[10.5px] text-slate-400">Verified core competencies</div>
                </div>
              </div>

              {resumeData.improvements && resumeData.improvements.length > 0 && (
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="text-xs font-bold text-slate-800">Improvement Suggestions:</div>
                  <ul className="space-y-1 text-xs text-slate-600">
                    {resumeData.improvements.map((imp: string, i: number) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="material-symbols-outlined text-amber-500 text-[16px] shrink-0 mt-0.5">lightbulb</span>
                        <span>{imp}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 space-y-2">
              <span className="material-symbols-outlined text-slate-400 text-[36px]">upload_file</span>
              <h4 className="text-xs font-bold text-slate-700">No Resume Analyzed Yet</h4>
              <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
                Upload your resume in Resume Studio to unlock ATS compatibility scores, missing keyword detection, and tailoring.
              </p>
              <Link
                to="/resume-studio/create"
                className="inline-block mt-2 px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold shadow-xs"
              >
                Upload Resume Now
              </Link>
            </div>
          )}
        </section>

      </div>
    </div>
  );
}

export default ProfilePage;
