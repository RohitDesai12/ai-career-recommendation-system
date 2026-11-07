import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router";
import axios from "axios";
import { useAuth } from "../context/auth-context";

interface PublicProfileData {
  id: string;
  userId: string;
  name: string;
  designation: string;
  targetCareer: string;
  city?: string;
  state?: string;
  country?: string;
  summary?: string;
  email?: string | null;
  phone?: string | null;
  preferredContactMethod?: string;
  professionalLinks?: {
    linkedin?: string;
    github?: string;
    leetcode?: string;
    hackerrank?: string;
    kaggle?: string;
    portfolio?: string;
    other?: string;
  };
  educationHistory?: Array<{
    degree: string;
    level: string;
    specialization: string;
    institution: string;
    location: string;
    startYear: string;
    endYear: string;
    currentYear: string;
    grade: string;
  }>;
  categorizedSkills?: Array<{
    name: string;
    category: string;
    proficiency: string;
    yearsExperience?: string;
  }>;
  softSkills?: string[];
  languages?: Array<{
    language: string;
    proficiency: string;
  }>;
  isFresher?: boolean;
  workExperience?: Array<{
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
  }>;
  projects?: Array<{
    title: string;
    shortDescription?: string;
    description: string;
    techStack: string[];
    category: string;
    github?: string;
    link?: string;
    featured?: boolean;
    role?: string;
  }>;
  certifications?: Array<{
    name: string;
    issuer: string;
    issueDate: string;
    credentialUrl?: string;
  }>;
  achievements?: Array<{
    title: string;
    category: string;
    description: string;
    issuer: string;
    date: string;
    url?: string;
  }>;
  completeness?: {
    percentage: number;
  };
}

export function PublicPortfolioPage() {
  const { id } = useParams<{ id?: string }>();
  const { user } = useAuth();

  const [profile, setProfile] = useState<PublicProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPublicProfile() {
      try {
        setLoading(true);
        // If id provided in URL params, use it; else if logged in, use current user id
        const targetId = id || user?.id;
        if (!targetId) {
          setError("No student ID specified.");
          setLoading(false);
          return;
        }

        const res = await axios.get(`http://localhost:5000/api/profile/public/${targetId}`);
        if (res.data?.profile) {
          setProfile(res.data.profile);
        } else {
          setError("Student portfolio not found.");
        }
      } catch (err: any) {
        console.error("Error fetching public profile:", err);
        setError(err.response?.data?.msg || "Could not load student portfolio.");
      } finally {
        setLoading(false);
      }
    }

    fetchPublicProfile();
  }, [id, user]);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-3 bg-[#f8fafc]">
        <span className="material-symbols-outlined animate-spin text-indigo-600 text-[36px]">
          sync
        </span>
        <p className="text-xs font-semibold text-slate-500">Loading professional portfolio...</p>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center bg-[#f8fafc]">
        <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mb-4">
          <span className="material-symbols-outlined text-[32px]">lock</span>
        </div>
        <h2 className="text-xl font-bold text-slate-900 mb-2">Portfolio Unavailable</h2>
        <p className="text-xs text-slate-500 max-w-md mb-6 leading-relaxed">
          {error || "This portfolio might be private or the requested link does not exist."}
        </p>
        <Link
          to="/dashboard"
          className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 transition-colors shadow-xs"
        >
          Return to Dashboard
        </Link>
      </div>
    );
  }

  const initials = profile.name
    ? profile.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "ST";

  const featuredProjects = (profile.projects || []).filter((p) => p.featured);
  const otherProjects = (profile.projects || []).filter((p) => !p.featured);

  // Group skills by category
  const skillsByCategory: { [cat: string]: typeof profile.categorizedSkills } = {};
  (profile.categorizedSkills || []).forEach((sk) => {
    const cat = sk.category || "Other Technical";
    if (!skillsByCategory[cat]) skillsByCategory[cat] = [];
    skillsByCategory[cat]?.push(sk);
  });

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 pb-20 font-sans">
      {/* Top Header / Public Bar */}
      <header className="bg-white border-b border-slate-200/80 px-4 sm:px-8 py-3 flex items-center justify-between sticky top-0 z-30 shadow-2xs">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-black text-xs">
            C
          </div>
          <span className="text-xs font-bold text-slate-900 tracking-tight">
            Career Compass <span className="text-slate-400 font-normal">| Verified Student Portfolio</span>
          </span>
        </div>

        <div className="flex items-center gap-3">
          {user && (
            <Link
              to="/profile"
              className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-[15px]">edit</span>
              <span>Edit My Profile</span>
            </Link>
          )}
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        
        {/* ======================================================== */}
        {/* 1. HERO PORTFOLIO BANNER                                 */}
        {/* ======================================================== */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 sm:p-8 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
          
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 pt-2">
            <div className="flex items-start gap-5">
              {/* Initials Avatar */}
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center text-2xl font-black shadow-md shadow-indigo-100 shrink-0">
                {initials}
              </div>

              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                    {profile.name}
                  </h1>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10.5px] font-bold border border-emerald-200 flex items-center gap-1">
                    <span className="material-symbols-outlined text-[13px]">verified</span>
                    Verified Student
                  </span>
                </div>

                <p className="text-xs sm:text-sm font-semibold text-slate-600">
                  {profile.designation || "Aspiring Software Engineer"}
                </p>

                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 pt-1">
                  {profile.city && (
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-slate-400 text-[16px]">location_on</span>
                      {profile.city}{profile.country ? `, ${profile.country}` : ""}
                    </span>
                  )}
                  {profile.targetCareer && (
                    <span className="flex items-center gap-1 font-semibold text-indigo-600">
                      <span className="material-symbols-outlined text-indigo-500 text-[16px]">target</span>
                      Target Role: {profile.targetCareer}
                    </span>
                  )}
                  {profile.email && (
                    <a href={`mailto:${profile.email}`} className="flex items-center gap-1 hover:text-indigo-600">
                      <span className="material-symbols-outlined text-slate-400 text-[16px]">mail</span>
                      {profile.email}
                    </a>
                  )}
                  {profile.phone && (
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-slate-400 text-[16px]">call</span>
                      {profile.phone}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Clickable Social / Professional Links */}
            <div className="flex items-center gap-2 shrink-0 self-start">
              {profile.professionalLinks?.github && (
                <a
                  href={profile.professionalLinks.github}
                  target="_blank"
                  rel="noreferrer"
                  className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition-colors shadow-2xs"
                  title="GitHub Profile"
                >
                  <span className="font-bold text-xs">GH</span>
                </a>
              )}
              {profile.professionalLinks?.linkedin && (
                <a
                  href={profile.professionalLinks.linkedin}
                  target="_blank"
                  rel="noreferrer"
                  className="w-9 h-9 rounded-xl bg-[#0077b5]/10 hover:bg-[#0077b5]/20 text-[#0077b5] flex items-center justify-center transition-colors shadow-2xs"
                  title="LinkedIn Profile"
                >
                  <span className="font-bold text-xs">in</span>
                </a>
              )}
              {profile.professionalLinks?.leetcode && (
                <a
                  href={profile.professionalLinks.leetcode}
                  target="_blank"
                  rel="noreferrer"
                  className="w-9 h-9 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 flex items-center justify-center transition-colors shadow-2xs"
                  title="LeetCode Profile"
                >
                  <span className="font-bold text-xs">LC</span>
                </a>
              )}
              {profile.professionalLinks?.kaggle && (
                <a
                  href={profile.professionalLinks.kaggle}
                  target="_blank"
                  rel="noreferrer"
                  className="w-9 h-9 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-700 flex items-center justify-center transition-colors shadow-2xs"
                  title="Kaggle Profile"
                >
                  <span className="font-bold text-xs">K</span>
                </a>
              )}
              {profile.professionalLinks?.portfolio && (
                <a
                  href={profile.professionalLinks.portfolio}
                  target="_blank"
                  rel="noreferrer"
                  className="w-9 h-9 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-700 flex items-center justify-center transition-colors shadow-2xs"
                  title="Personal Portfolio"
                >
                  <span className="material-symbols-outlined text-[18px]">language</span>
                </a>
              )}
            </div>
          </div>

          {/* Professional Summary */}
          {profile.summary && (
            <div className="mt-6 pt-5 border-t border-slate-100">
              <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                Professional Overview
              </h2>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-normal">
                {profile.summary}
              </p>
            </div>
          )}
        </div>

        {/* ======================================================== */}
        {/* 2. FEATURED & NOTABLE PROJECTS                           */}
        {/* ======================================================== */}
        {(profile.projects || []).length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-indigo-600 text-[22px]">rocket_launch</span>
              <h2 className="text-lg font-black text-slate-900 tracking-tight">Software Projects & Applications</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {[...featuredProjects, ...otherProjects].map((proj, idx) => (
                <div
                  key={idx}
                  className={`bg-white rounded-2xl p-5 border shadow-xs flex flex-col justify-between transition-all ${
                    proj.featured
                      ? "border-indigo-300 ring-1 ring-indigo-100 hover:border-indigo-400"
                      : "border-slate-200/80 hover:border-slate-300"
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-bold text-slate-900">{proj.title}</h3>
                        {proj.featured && (
                          <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 text-[10px] font-black border border-amber-200 flex items-center gap-0.5">
                            <span className="material-symbols-outlined text-amber-500 text-[13px] fill-current">star</span>
                            Featured
                          </span>
                        )}
                      </div>
                      <span className="text-[10.5px] font-semibold text-slate-400 shrink-0">
                        {proj.category}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed">
                      {proj.detailedDescription || proj.description || proj.shortDescription}
                    </p>

                    {/* Tech Stack Pills */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {(proj.techStack || []).map((tech, tIdx) => (
                        <span
                          key={tIdx}
                          className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10.5px] font-medium"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Links Row */}
                  <div className="pt-4 mt-3 border-t border-slate-100 flex items-center gap-3 text-xs">
                    {proj.github && (
                      <a
                        href={proj.github}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1 font-bold text-slate-700 hover:text-indigo-600"
                      >
                        <span className="material-symbols-outlined text-[16px]">code</span>
                        <span>Source Code</span>
                      </a>
                    )}
                    {proj.link && (
                      <a
                        href={proj.link}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1 font-bold text-indigo-600 hover:text-indigo-800"
                      >
                        <span className="material-symbols-outlined text-[16px]">open_in_new</span>
                        <span>Live Demo</span>
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* 3. TECHNICAL & PROFESSIONAL SKILLS MATRIX                */}
        {/* ======================================================== */}
        {(profile.categorizedSkills || []).length > 0 && (
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 sm:p-8 space-y-5">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-indigo-600 text-[22px]">code_blocks</span>
              <h2 className="text-lg font-black text-slate-900 tracking-tight">Technical Skills Matrix</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {Object.entries(skillsByCategory).map(([category, items]) => (
                <div key={category} className="p-4 rounded-2xl bg-slate-50/70 border border-slate-100 space-y-2.5">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">{category}</h4>
                  <div className="flex flex-wrap gap-2">
                    {(items || []).map((sk, idx) => (
                      <div
                        key={idx}
                        className="px-2.5 py-1 rounded-xl bg-white border border-slate-200 shadow-2xs flex items-center gap-1.5 text-xs font-semibold text-slate-800"
                      >
                        <span>{sk.name}</span>
                        <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                          sk.proficiency === "Advanced"
                            ? "bg-purple-50 text-purple-700"
                            : sk.proficiency === "Proficient"
                            ? "bg-indigo-50 text-indigo-700"
                            : "bg-slate-100 text-slate-600"
                        }`}>
                          {sk.proficiency}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* 4. EDUCATION & WORK EXPERIENCE TIMELINES                  */}
        {/* ======================================================== */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Education Timeline */}
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 space-y-4">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-indigo-600 text-[22px]">school</span>
              <h2 className="text-base font-black text-slate-900 tracking-tight">Education & Academics</h2>
            </div>

            <div className="space-y-4">
              {(profile.educationHistory || []).map((edu, idx) => (
                <div key={idx} className="relative pl-5 border-l-2 border-indigo-200 space-y-1">
                  <div className="absolute -left-[5px] top-1.5 w-2 h-2 rounded-full bg-indigo-600" />
                  <h3 className="text-xs font-bold text-slate-900 leading-snug">{edu.degree}</h3>
                  <div className="text-[11px] font-medium text-indigo-600">{edu.institution}</div>
                  <div className="text-[10.5px] text-slate-400">
                    {edu.specialization ? `${edu.specialization} • ` : ""}
                    {edu.startYear && edu.endYear ? `${edu.startYear} – ${edu.endYear}` : edu.endYear || "Ongoing"}
                    {edu.grade ? ` • CGPA: ${edu.grade}` : ""}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Work Experience Timeline */}
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 space-y-4">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-indigo-600 text-[22px]">work</span>
              <h2 className="text-base font-black text-slate-900 tracking-tight">Experience & Internships</h2>
            </div>

            {profile.isFresher && (!profile.workExperience || profile.workExperience.length === 0) ? (
              <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-100 flex items-center gap-3">
                <span className="material-symbols-outlined text-emerald-600 text-[24px]">school</span>
                <div>
                  <div className="text-xs font-bold text-emerald-900">Fresher Candidate</div>
                  <p className="text-[11px] text-emerald-700">
                    Focused on academic excellence, hands-on software projects, and core technical problem solving.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {(profile.workExperience || []).map((exp, idx) => (
                  <div key={idx} className="relative pl-5 border-l-2 border-emerald-200 space-y-1">
                    <div className="absolute -left-[5px] top-1.5 w-2 h-2 rounded-full bg-emerald-600" />
                    <h3 className="text-xs font-bold text-slate-900 leading-snug">{exp.jobTitle}</h3>
                    <div className="text-[11px] font-medium text-emerald-600">{exp.company} • {exp.employmentType}</div>
                    <div className="text-[10.5px] text-slate-400">
                      {exp.startDate} – {exp.currentlyWorking ? "Present" : exp.endDate || ""}
                    </div>
                    {exp.responsibilities && (
                      <p className="text-[11px] text-slate-600 leading-relaxed pt-1">
                        {exp.responsibilities}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ======================================================== */}
        {/* 5. CERTIFICATIONS & ACHIEVEMENTS                         */}
        {/* ======================================================== */}
        {((profile.certifications && profile.certifications.length > 0) || (profile.achievements && profile.achievements.length > 0)) && (
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 sm:p-8 space-y-5">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-amber-500 text-[22px]">workspace_premium</span>
              <h2 className="text-lg font-black text-slate-900 tracking-tight">Certifications & Achievements</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {(profile.certifications || []).map((cert, idx) => (
                <div key={idx} className="p-4 rounded-2xl bg-slate-50/70 border border-slate-100 flex items-start justify-between gap-3">
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">{cert.name}</h4>
                    <div className="text-[11px] text-indigo-600 font-semibold">{cert.issuer}</div>
                    <div className="text-[10.5px] text-slate-400 mt-0.5">Issued: {cert.issueDate}</div>
                  </div>
                  {cert.credentialUrl && (
                    <a
                      href={cert.credentialUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-600 hover:text-indigo-600 shadow-2xs"
                      title="Verify Credential"
                    >
                      <span className="material-symbols-outlined text-[16px]">open_in_new</span>
                    </a>
                  )}
                </div>
              ))}

              {(profile.achievements || []).map((ach, idx) => (
                <div key={idx} className="p-4 rounded-2xl bg-amber-50/40 border border-amber-100 flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-amber-600 text-[16px]">emoji_events</span>
                      <h4 className="text-xs font-bold text-slate-900">{ach.title}</h4>
                    </div>
                    <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">{ach.description}</p>
                    <div className="text-[10px] text-amber-800 font-semibold mt-1">{ach.issuer} • {ach.date}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </main>
    </div>
  );
}

export default PublicPortfolioPage;

