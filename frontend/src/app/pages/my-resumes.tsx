import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import axios from "axios";

interface ResumeItem {
  _id: string;
  title: string;
  targetRole: string;
  template: string;
  isTailored?: boolean;
  targetJobTitle?: string;
  targetJobCompany?: string;
  score?: {
    overall?: number;
    atsScore?: number;
    contentQuality?: number;
    skillsMatch?: number;
    structureFormat?: number;
  };
  updatedAt: string;
}

export function MyResumes() {
  const navigate = useNavigate();
  const [resumes, setResumes] = useState<ResumeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterTab, setFilterTab] = useState<"all" | "master" | "tailored">("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  useEffect(() => {
    const token = localStorage.getItem("token");
    const headers = token ? { "x-auth-token": token } : {};

    axios
      .get("http://localhost:5000/api/resume/my-resumes", { headers })
      .then((res) => {
        if (res.data?.resumes) {
          setResumes(res.data.resumes);
        }
      })
      .catch((err) => console.error("Error fetching resumes:", err))
      .finally(() => setLoading(false));
  }, []);

  const handleDuplicate = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        `http://localhost:5000/api/resume/duplicate/${id}`,
        {},
        { headers: { "x-auth-token": token } }
      );
      if (res.data) {
        setResumes((prev) => [res.data, ...prev]);
      }
    } catch (err) {
      console.error("Duplicate failed:", err);
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this resume?")) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:5000/api/resume/${id}`, {
        headers: { "x-auth-token": token }
      });
      setResumes((prev) => prev.filter((r) => r._id !== id));
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  const filteredResumes = resumes.filter((r) => {
    const matchSearch =
      (r.title || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.targetRole || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.targetJobCompany || "").toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchSearch) return false;

    if (filterTab === "master") return !r.isTailored;
    if (filterTab === "tailored") return r.isTailored;
    return true;
  });

  return (
    <div className="space-y-6 font-sans antialiased text-slate-900 dark:text-slate-100 pb-20">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 dark:border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <Link
            to="/resume-studio"
            className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">arrow_back</span>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                My Resumes
              </h1>
              <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200/60 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 text-[11px] font-bold">
                {resumes.length} Documents
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Manage your master and job-tailored resume versions in one centralized workspace.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            to="/resume-studio/create"
            className="inline-flex items-center gap-2 px-4.5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            <span>Create New Resume</span>
          </Link>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
        
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <span className="material-symbols-outlined absolute left-3 top-2.5 text-slate-400 text-[18px]">
            search
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by resume title, target role, or company..."
            className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
          />
        </div>

        {/* Filter Tabs & View Mode */}
        <div className="flex items-center gap-2">
          <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
            <button
              onClick={() => setFilterTab("all")}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                filterTab === "all" ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs" : "text-slate-500"
              }`}
            >
              All ({resumes.length})
            </button>
            <button
              onClick={() => setFilterTab("master")}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                filterTab === "master" ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs" : "text-slate-500"
              }`}
            >
              Master ({resumes.filter((r) => !r.isTailored).length})
            </button>
            <button
              onClick={() => setFilterTab("tailored")}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                filterTab === "tailored" ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs" : "text-slate-500"
              }`}
            >
              Tailored ({resumes.filter((r) => r.isTailored).length})
            </button>
          </div>

          <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                viewMode === "grid" ? "bg-white dark:bg-slate-900 text-indigo-600" : "text-slate-400"
              }`}
              title="Grid View"
            >
              <span className="material-symbols-outlined text-[18px]">grid_view</span>
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                viewMode === "list" ? "bg-white dark:bg-slate-900 text-indigo-600" : "text-slate-400"
              }`}
              title="List View"
            >
              <span className="material-symbols-outlined text-[18px]">view_list</span>
            </button>
          </div>
        </div>
      </div>

      {/* Resumes Grid / List */}
      {filteredResumes.length > 0 ? (
        viewMode === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredResumes.map((resume) => (
              <div
                key={resume._id}
                onClick={() => navigate(`/resume-studio/builder?id=${resume._id}`)}
                className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-5 flex flex-col justify-between shadow-xs hover:shadow-md hover:border-indigo-300 dark:hover:border-indigo-800/80 transition-all cursor-pointer group relative"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-900/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined text-[22px]">description</span>
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-1">
                          {resume.title}
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
                          {resume.targetRole}
                        </p>
                      </div>
                    </div>
                  </div>

                  {resume.isTailored && (
                    <div className="mt-3 p-2.5 rounded-xl bg-purple-50/70 dark:bg-purple-950/40 border border-purple-200/60 dark:border-purple-800/80 text-[11px] text-purple-900 dark:text-purple-200">
                      <span className="font-bold">Tailored for:</span> {resume.targetJobCompany || "Target Job"} ({resume.targetJobTitle || resume.targetRole})
                    </div>
                  )}

                  <div className="flex flex-wrap items-center gap-1.5 mt-3">
                    <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[10px] font-bold">
                      {resume.template}
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/60 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold">
                      ATS {resume.score?.atsScore || 92}%
                    </span>
                  </div>
                </div>

                {/* Card Actions Footer */}
                <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">
                    {new Date(resume.updatedAt).toLocaleDateString()}
                  </span>

                  <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={(e) => handleDuplicate(resume._id, e)}
                      title="Duplicate Resume"
                      className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[17px]">content_copy</span>
                    </button>
                    <button
                      onClick={() => navigate(`/resume-studio/tailor?resumeId=${resume._id}`)}
                      title="Tailor for Job"
                      className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[17px]">tune</span>
                    </button>
                    <button
                      onClick={() => navigate(`/resume-studio/cover-letter?resumeId=${resume._id}`)}
                      title="Generate Cover Letter"
                      className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[17px]">mail</span>
                    </button>
                    <button
                      onClick={(e) => handleDelete(resume._id, e)}
                      title="Delete Resume"
                      className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/50 transition-colors cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[17px]">delete</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-xs divide-y divide-slate-100 dark:divide-slate-800">
            {filteredResumes.map((resume) => (
              <div
                key={resume._id}
                onClick={() => navigate(`/resume-studio/builder?id=${resume._id}`)}
                className="p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-[20px]">description</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-xs font-bold text-slate-900 dark:text-white">{resume.title}</h3>
                      {resume.isTailored && (
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-purple-100 text-purple-700 font-bold">
                          Tailored
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400">{resume.targetRole} &bull; Template: {resume.template}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
                  <span className="text-xs text-slate-400">{new Date(resume.updatedAt).toLocaleDateString()}</span>
                  <button
                    onClick={() => navigate(`/resume-studio/builder?id=${resume._id}`)}
                    className="px-3 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-600 text-xs font-bold hover:bg-indigo-100 transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={(e) => handleDuplicate(resume._id, e)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 transition-colors"
                  >
                    <span className="material-symbols-outlined text-[17px]">content_copy</span>
                  </button>
                  <button
                    onClick={(e) => handleDelete(resume._id, e)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 transition-colors"
                  >
                    <span className="material-symbols-outlined text-[17px]">delete</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        <div className="p-12 text-center rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 mx-auto flex items-center justify-center">
            <span className="material-symbols-outlined text-[28px]">search_off</span>
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">No Matching Resumes Found</h3>
            <p className="text-xs text-slate-400 mt-1">Try adjusting your search query or filter tab.</p>
          </div>
          <Link
            to="/resume-studio/create"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold shadow-md hover:bg-indigo-700 transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">add</span>
            <span>Create New Resume</span>
          </Link>
        </div>
      )}

    </div>
  );
}
