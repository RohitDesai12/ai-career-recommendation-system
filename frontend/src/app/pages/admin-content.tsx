import React, { useState, useEffect } from "react";
import axios from "axios";

interface InterviewPrepItem {
  _id: string;
  company: string;
  role: string;
  salaryRange?: string;
  requiredSkills?: string[];
  selectionProcess?: string;
  createdAt: string;
}

interface ResourceItem {
  _id: string;
  title: string;
  provider: string;
  description?: string;
  url: string;
  resourceType: string;
  skill: string;
  career?: string;
  difficulty?: string;
  duration?: string;
  isFree?: boolean;
  rating?: number;
  isVerified?: boolean;
  createdAt?: string;
}

export function AdminContent() {
  const [activeTab, setActiveTab] = useState<"interview" | "skills" | "careerPaths" | "resources">("interview");
  const [data, setData] = useState<{
    interviewPreps: InterviewPrepItem[];
    resources: ResourceItem[];
    skills: string[];
    careerPaths: string[];
  }>({ interviewPreps: [], resources: [], skills: [], careerPaths: [] });
  const [loading, setLoading] = useState(true);
  
  // Interview Prep modal state
  const [showAddPrepModal, setShowAddPrepModal] = useState(false);
  const [newCompany, setNewCompany] = useState("");
  const [newRole, setNewRole] = useState("");
  const [newSalary, setNewSalary] = useState("₹18,00,000 - ₹28,00,000");
  const [newSkills, setNewSkills] = useState("");
  const [newProcess, setNewProcess] = useState("1. Coding Assessment\n2. Technical Round\n3. System Design\n4. HR Round");
  
  // Learning Resource modal state
  const [showAddResourceModal, setShowAddResourceModal] = useState(false);
  const [resTitle, setResTitle] = useState("");
  const [resProvider, setResProvider] = useState("");
  const [resUrl, setResUrl] = useState("");
  const [resType, setResType] = useState("Course");
  const [resSkill, setResSkill] = useState("");
  const [resCareer, setResCareer] = useState("General");
  const [resDifficulty, setResDifficulty] = useState("Beginner");
  const [resDuration, setResDuration] = useState("4 Weeks");
  const [resIsFree, setResIsFree] = useState(true);
  const [resRating, setResRating] = useState("4.8");
  const [resDesc, setResDesc] = useState("");
  const [resourceSearch, setResourceSearch] = useState("");
  const [resourceFilterType, setResourceFilterType] = useState("All");

  const [submitting, setSubmitting] = useState(false);

  const fetchContent = async () => {
    setLoading(true);
    try {
      const res = await axios.get("http://localhost:5000/api/admin/content");
      setData({
        interviewPreps: res.data.interviewPreps || [],
        resources: res.data.resources || [],
        skills: res.data.skills || [],
        careerPaths: res.data.careerPaths || []
      });
    } catch (err) {
      console.error("Error fetching content:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContent();
  }, []);

  const handleCreatePrep = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await axios.post("http://localhost:5000/api/admin/content", {
        company: newCompany,
        role: newRole,
        salaryRange: newSalary,
        requiredSkills: newSkills.split(",").map((s) => s.trim()).filter(Boolean),
        selectionProcess: newProcess,
      });
      setShowAddPrepModal(false);
      setNewCompany("");
      setNewRole("");
      setNewSkills("");
      await fetchContent();
    } catch (err) {
      console.error("Error creating prep guide:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateResource = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await axios.post("http://localhost:5000/api/admin/resources", {
        title: resTitle,
        provider: resProvider,
        url: resUrl,
        resourceType: resType,
        skill: resSkill,
        career: resCareer,
        difficulty: resDifficulty,
        duration: resDuration,
        isFree: resIsFree,
        rating: parseFloat(resRating) || 4.8,
        description: resDesc,
      });
      setShowAddResourceModal(false);
      setResTitle("");
      setResProvider("");
      setResUrl("");
      setResSkill("");
      setResDesc("");
      await fetchContent();
    } catch (err) {
      console.error("Error creating resource:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteResource = async (id: string, name: string) => {
    if (!window.confirm(`Delete verified learning resource "${name}"?`)) return;
    try {
      await axios.delete(`http://localhost:5000/api/admin/resources/${id}`);
      await fetchContent();
    } catch (err) {
      console.error("Error deleting resource:", err);
    }
  };

  const handleDeletePrep = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete prep guide for ${name}?`)) return;
    try {
      await axios.delete(`http://localhost:5000/api/admin/content/${id}`);
      await fetchContent();
    } catch (err) {
      console.error("Error deleting content:", err);
    }
  };

  const filteredResources = (data.resources || []).filter((r) => {
    const matchesSearch =
      r.title.toLowerCase().includes(resourceSearch.toLowerCase()) ||
      r.provider.toLowerCase().includes(resourceSearch.toLowerCase()) ||
      r.skill.toLowerCase().includes(resourceSearch.toLowerCase());
    const matchesType = resourceFilterType === "All" || r.resourceType === resourceFilterType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black font-heading text-slate-900 tracking-tight">
            Content & Knowledge Management
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage company-specific interview prep guides, verified learning resources, standardized skill taxonomies, and career paths
          </p>
        </div>
        <div className="flex items-center gap-2">
          {activeTab === "interview" && (
            <button
              type="button"
              onClick={() => setShowAddPrepModal(true)}
              className="px-4 py-2 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20 transition-all cursor-pointer inline-flex items-center gap-1.5 self-start sm:self-auto"
            >
              <span className="material-symbols-outlined text-[16px]">add</span>
              <span>Create Prep Guide</span>
            </button>
          )}
          {activeTab === "resources" && (
            <button
              type="button"
              onClick={() => setShowAddResourceModal(true)}
              className="px-4 py-2 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20 transition-all cursor-pointer inline-flex items-center gap-1.5 self-start sm:self-auto"
            >
              <span className="material-symbols-outlined text-[16px]">add_link</span>
              <span>Add Verified Resource</span>
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap items-center gap-2 bg-slate-100 p-1 rounded-2xl w-fit">
        <button
          type="button"
          onClick={() => setActiveTab("interview")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === "interview" ? "bg-white text-slate-900 shadow-xs" : "text-slate-500 hover:text-slate-800"
          }`}
        >
          Interview Guides ({data.interviewPreps.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("resources")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === "resources" ? "bg-white text-indigo-600 shadow-xs" : "text-slate-500 hover:text-slate-800"
          }`}
        >
          Learning Resources ({data.resources.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("skills")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === "skills" ? "bg-white text-slate-900 shadow-xs" : "text-slate-500 hover:text-slate-800"
          }`}
        >
          Skill Library ({data.skills.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("careerPaths")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === "careerPaths" ? "bg-white text-slate-900 shadow-xs" : "text-slate-500 hover:text-slate-800"
          }`}
        >
          Career Roles ({data.careerPaths.length})
        </button>
      </div>

      {/* Content Canvas */}
      {loading ? (
        <div className="bg-white rounded-3xl p-16 text-center border border-slate-200/80 shadow-xs">
          <span className="material-symbols-outlined animate-spin text-indigo-600 text-[32px]">
            sync
          </span>
          <p className="text-xs font-semibold text-slate-400 mt-2">Loading content items...</p>
        </div>
      ) : activeTab === "interview" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.interviewPreps.length === 0 ? (
            <div className="col-span-full bg-white rounded-3xl p-12 text-center border border-slate-200/80">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-2">
                <span className="material-symbols-outlined text-[24px]">menu_book</span>
              </div>
              <h3 className="text-sm font-bold text-slate-800">No interview guides published</h3>
              <p className="text-xs text-slate-400 mt-0.5">Click "Create Prep Guide" above to add new company materials.</p>
            </div>
          ) : (
            data.interviewPreps.map((prep) => (
              <div
                key={prep._id}
                className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="px-2.5 py-0.5 rounded-lg bg-indigo-50 text-indigo-700 font-bold text-[10.5px]">
                        {prep.company}
                      </span>
                      <h3 className="text-base font-bold font-heading text-slate-900 mt-2">{prep.role}</h3>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDeletePrep(prep._id, `${prep.company} - ${prep.role}`)}
                      className="w-7 h-7 rounded-lg bg-slate-50 text-slate-400 hover:bg-rose-50 hover:text-rose-600 flex items-center justify-center transition-colors cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[15px]">delete</span>
                    </button>
                  </div>

                  {prep.salaryRange && (
                    <div className="text-xs font-bold text-emerald-600 mt-2">{prep.salaryRange}</div>
                  )}

                  {prep.requiredSkills && prep.requiredSkills.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-3">
                      {prep.requiredSkills.slice(0, 4).map((s, i) => (
                        <span key={i} className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[10.5px] font-medium">
                          {s}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-100 mt-4 flex items-center justify-between">
                  <span className="text-[10.5px] text-slate-400 font-medium">Published Guide</span>
                  <span className="text-[10.5px] font-bold text-indigo-600">Active ✓</span>
                </div>
              </div>
            ))
          )}
        </div>
      ) : activeTab === "resources" ? (
        <div className="space-y-4">
          {/* Resource Search and Filter */}
          <div className="bg-white rounded-2xl p-3 border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-1">
              <span className="material-symbols-outlined text-slate-400 text-[18px]">search</span>
              <input
                type="text"
                value={resourceSearch}
                onChange={(e) => setResourceSearch(e.target.value)}
                placeholder="Search resources by title, provider, or skill tag..."
                className="w-full text-xs font-medium text-slate-800 placeholder-slate-400 outline-none bg-transparent"
              />
            </div>
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
              {["All", "Course", "Documentation", "Interactive", "Tutorial", "Video", "Project"].map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setResourceFilterType(type)}
                  className={`px-3 py-1 rounded-xl text-[11px] font-bold transition-colors cursor-pointer whitespace-nowrap ${
                    resourceFilterType === type
                      ? "bg-indigo-600 text-white shadow-xs"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Resource Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredResources.length === 0 ? (
              <div className="col-span-full bg-white rounded-3xl p-12 text-center border border-slate-200/80">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-2">
                  <span className="material-symbols-outlined text-[24px]">school</span>
                </div>
                <h3 className="text-sm font-bold text-slate-800">No verified resources found</h3>
                <p className="text-xs text-slate-400 mt-0.5">Click "Add Verified Resource" above to populate the catalog.</p>
              </div>
            ) : (
              filteredResources.map((res) => (
                <div
                  key={res._id}
                  className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="px-2.5 py-0.5 rounded-lg bg-indigo-50 text-indigo-700 font-bold text-[10px]">
                          {res.resourceType}
                        </span>
                        <span className="px-2 py-0.5 rounded-lg bg-slate-100 text-slate-600 font-semibold text-[10px]">
                          {res.provider}
                        </span>
                        {res.isFree && (
                          <span className="px-2 py-0.5 rounded-lg bg-emerald-50 text-emerald-700 font-bold text-[10px]">
                            Free
                          </span>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDeleteResource(res._id, res.title)}
                        className="w-7 h-7 rounded-lg bg-slate-50 text-slate-400 hover:bg-rose-50 hover:text-rose-600 flex items-center justify-center transition-colors cursor-pointer shrink-0"
                        title="Delete Resource"
                      >
                        <span className="material-symbols-outlined text-[15px]">delete</span>
                      </button>
                    </div>

                    <h3 className="text-sm font-bold font-heading text-slate-900 mt-2.5 leading-snug line-clamp-2">
                      {res.title}
                    </h3>
                    
                    {res.description && (
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2">{res.description}</p>
                    )}

                    <div className="flex flex-wrap items-center gap-2 mt-3 text-[11px]">
                      <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 font-bold flex items-center gap-1">
                        <span className="material-symbols-outlined text-[13px]">star</span>
                        {res.rating || 4.8}
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-medium">
                        {res.difficulty || "All Levels"}
                      </span>
                      {res.duration && (
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-medium">
                          {res.duration}
                        </span>
                      )}
                    </div>

                    <div className="mt-2.5">
                      <span className="px-2.5 py-0.5 rounded-md bg-indigo-50/70 border border-indigo-100 text-indigo-700 font-bold text-[10px]">
                        Skill: {res.skill}
                      </span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 mt-4 flex items-center justify-between">
                    <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">verified</span>
                      Verified URL
                    </span>
                    <a
                      href={res.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1 rounded-xl bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-slate-700 font-bold text-[11px] transition-colors inline-flex items-center gap-1 cursor-pointer"
                    >
                      <span>Open Link</span>
                      <span className="material-symbols-outlined text-[13px]">open_in_new</span>
                    </a>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      ) : activeTab === "skills" ? (
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs">
          <h2 className="text-base font-bold font-heading text-slate-900 mb-2">Platform Skill Taxonomy</h2>
          <p className="text-xs text-slate-400 mb-4">Dynamically extracted from verified job postings, student candidate profiles, and learning catalog.</p>
          <div className="flex flex-wrap gap-2">
            {data.skills.map((s, i) => (
              <span
                key={i}
                className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-xs font-semibold hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700 transition-colors"
              >
                {s}
              </span>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs">
          <h2 className="text-base font-bold font-heading text-slate-900 mb-2">Tracked Career Roles</h2>
          <p className="text-xs text-slate-400 mb-4">Target occupational classifications supported in the ML recommendation system.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {data.careerPaths.map((c, i) => (
              <div key={i} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center gap-2.5">
                <span className="material-symbols-outlined text-indigo-600 text-[18px]">navigation</span>
                <span className="text-xs font-bold text-slate-800">{c}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add Prep Modal */}
      {showAddPrepModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs" onClick={() => setShowAddPrepModal(false)} />
          <div className="relative bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 z-10">
            <h3 className="text-lg font-bold font-heading text-slate-900 mb-1">Create Interview Prep Guide</h3>
            <p className="text-xs text-slate-400 mb-4">Publish tailored interview preparation resources for students.</p>

            <form onSubmit={handleCreatePrep} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Company Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Google, Microsoft, Nexus AI"
                  value={newCompany}
                  onChange={(e) => setNewCompany(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Target Role</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Full Stack Engineer, ML Specialist"
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Expected Salary Range</label>
                <input
                  type="text"
                  placeholder="e.g. ₹20,00,000 - ₹32,00,000 / yr"
                  value={newSalary}
                  onChange={(e) => setNewSalary(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Required Skills (comma separated)</label>
                <input
                  type="text"
                  placeholder="e.g. React, Node.js, TypeScript, PostgreSQL"
                  value={newSkills}
                  onChange={(e) => setNewSkills(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Hiring & Selection Process</label>
                <textarea
                  rows={3}
                  value={newProcess}
                  onChange={(e) => setNewProcess(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddPrepModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-600 font-bold hover:bg-slate-200 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition-all shadow-sm cursor-pointer"
                >
                  {submitting ? "Publishing..." : "Publish Guide"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Resource Modal */}
      {showAddResourceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs" onClick={() => setShowAddResourceModal(false)} />
          <div className="relative bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 z-10 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold font-heading text-slate-900 mb-1">Add Verified Learning Resource</h3>
            <p className="text-xs text-slate-400 mb-4">Add a real tutorial, course, or doc to the platform verified learning catalog.</p>

            <form onSubmit={handleCreateResource} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Resource Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. The Complete React 19 Guide"
                  value={resTitle}
                  onChange={(e) => setResTitle(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Provider / Platform *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. MDN, freeCodeCamp, Coursera"
                    value={resProvider}
                    onChange={(e) => setResProvider(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Skill Tag *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. React, Node.js, Python, Docker"
                    value={resSkill}
                    onChange={(e) => setResSkill(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Verified URL *</label>
                <input
                  type="url"
                  required
                  placeholder="https://react.dev/learn"
                  value={resUrl}
                  onChange={(e) => setResUrl(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Resource Type</label>
                  <select
                    value={resType}
                    onChange={(e) => setResType(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Course">Course</option>
                    <option value="Documentation">Documentation</option>
                    <option value="Interactive">Interactive</option>
                    <option value="Tutorial">Tutorial</option>
                    <option value="Video">Video</option>
                    <option value="Project">Project</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Difficulty</label>
                  <select
                    value={resDifficulty}
                    onChange={(e) => setResDifficulty(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Rating (1-5)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="1"
                    max="5"
                    value={resRating}
                    onChange={(e) => setResRating(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Duration / Time</label>
                  <input
                    type="text"
                    placeholder="e.g. 4 Weeks, 12 Hours"
                    value={resDuration}
                    onChange={(e) => setResDuration(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Target Career Role</label>
                  <input
                    type="text"
                    placeholder="e.g. Full Stack Developer"
                    value={resCareer}
                    onChange={(e) => setResCareer(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  placeholder="Brief summary of what students will learn..."
                  value={resDesc}
                  onChange={(e) => setResDesc(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="resIsFree"
                  checked={resIsFree}
                  onChange={(e) => setResIsFree(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                />
                <label htmlFor="resIsFree" className="font-bold text-slate-700 cursor-pointer">
                  Free Resource (No paywall required)
                </label>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddResourceModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-600 font-bold hover:bg-slate-200 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition-all shadow-sm cursor-pointer"
                >
                  {submitting ? "Adding..." : "Add Resource"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
