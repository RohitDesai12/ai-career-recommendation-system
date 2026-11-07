import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";

interface TemplateInfo {
  id: string;
  name: string;
  category: "ats" | "modern" | "tech" | "executive" | "creative";
  categoryLabel: string;
  atsScoreRating: number;
  popularFor: string;
  description: string;
  columns: "Single Column" | "Two Column" | "Split Header";
  colorAccent: string;
  accentHex: string;
  badge: string;
  recommendedRoles: string[];
  features: string[];
}

const TEMPLATES: TemplateInfo[] = [
  {
    id: "ATS-Classic",
    name: "ATS Classic",
    category: "ats",
    categoryLabel: "ATS-Friendly",
    atsScoreRating: 99,
    popularFor: "Top Applicant Tracking Systems (Workday, Greenhouse, Lever, Taleo)",
    description: "Strict single-column layout with standard headings, optimal margin geometry, and zero parsing obstacles. Maximum readability for automated parsers.",
    columns: "Single Column",
    colorAccent: "Slate Navy",
    accentHex: "#1e293b",
    badge: "99% ATS Pass Rate",
    recommendedRoles: ["Software Engineer", "Systems Architect", "Corporate Analyst", "Operations Manager"],
    features: ["Single-column standard flow", "Parseable typography hierarchy", "Standardized section headings", "Compact contact metadata header"]
  },
  {
    id: "Modern",
    name: "Modern Tech",
    category: "modern",
    categoryLabel: "Modern",
    atsScoreRating: 95,
    popularFor: "High-growth tech companies, modern startups, and product firms",
    description: "Sleek contemporary design with a clean left-accent border, dedicated technical skill pill tags, and structured timeline styling.",
    columns: "Single Column",
    colorAccent: "Indigo Purple",
    accentHex: "#4f46e5",
    badge: "Most Popular",
    recommendedRoles: ["Full Stack Developer", "Frontend Engineer", "Product Manager", "DevOps Engineer"],
    features: ["Indigo hero banner", "Technical skill badge cloud", "Bullet point impact highlights", "GitHub and portfolio links row"]
  },
  {
    id: "Minimal",
    name: "Minimalist Executive",
    category: "executive",
    categoryLabel: "Executive",
    atsScoreRating: 97,
    popularFor: "Senior engineering, management, consulting, and finance leadership",
    description: "Refined monochrome typography with elegant horizontal separators. Emphasizes career progression, leadership metrics, and strategic impact.",
    columns: "Single Column",
    colorAccent: "Charcoal Black",
    accentHex: "#0f172a",
    badge: "Executive Standard",
    recommendedRoles: ["Engineering Lead", "Solutions Architect", "Product Director", "Consultant"],
    features: ["Monochrome elegance", "Executive summary prominence", "Key metric callouts", "Clean date-aligned timeline"]
  },
  {
    id: "Software-Tech",
    name: "Software & Systems",
    category: "tech",
    categoryLabel: "Tech & AI",
    atsScoreRating: 96,
    popularFor: "Backend developers, cloud architects, and systems engineers",
    description: "Structured specifically for developers. Prominently highlights core programming languages, frameworks, architecture experience, and open source repositories.",
    columns: "Two Column",
    colorAccent: "Emerald Cyan",
    accentHex: "#059669",
    badge: "Developer Choice",
    recommendedRoles: ["Backend Engineer", "Cloud Developer", "Security Engineer", "Site Reliability Engineer"],
    features: ["Dedicated tech stack sidebar", "Git repo and project links", "System architecture metrics", "Fast-scan technical layout"]
  },
  {
    id: "Data-Science",
    name: "Data & Analytics",
    category: "tech",
    categoryLabel: "Tech & AI",
    atsScoreRating: 96,
    popularFor: "Data scientists, ML practitioners, and business intelligence analysts",
    description: "Designed to showcase quantitative findings, data pipelines, statistical modeling techniques, and end-to-end analytical dashboards.",
    columns: "Single Column",
    colorAccent: "Sky Blue",
    accentHex: "#0284c7",
    badge: "Quant Focused",
    recommendedRoles: ["Data Scientist", "Data Analyst", "BI Developer", "Quantitative Analyst"],
    features: ["Statistical tools highlight", "Quantified business impact metrics", "Dashboard & visualization links", "Research methodology tags"]
  },
  {
    id: "AI-ML",
    name: "AI & Machine Learning",
    category: "tech",
    categoryLabel: "Tech & AI",
    atsScoreRating: 95,
    popularFor: "AI researchers, deep learning engineers, and NLP/CV specialists",
    description: "Specialized sections for model architectures (LLMs, Diffusion, Transformers), research publications, compute frameworks (PyTorch, HuggingFace), and benchmark metrics.",
    columns: "Single Column",
    colorAccent: "Violet Purple",
    accentHex: "#7c3aed",
    badge: "AI Specialized",
    recommendedRoles: ["ML Engineer", "AI Researcher", "NLP Engineer", "Computer Vision Specialist"],
    features: ["Model architecture stack", "Publications and whitepapers", "Compute & training frameworks", "Kaggle & benchmark badges"]
  },
  {
    id: "Corporate",
    name: "Corporate & Enterprise",
    category: "executive",
    categoryLabel: "Executive",
    atsScoreRating: 98,
    popularFor: "Fortune 500 corporations, consulting firms, banks, and enterprise enterprises",
    description: "Conservative, highly structured layout with formal serif/sans hybrid typography, clear credential highlights, and corporate compliance standard formatting.",
    columns: "Single Column",
    colorAccent: "Deep Navy",
    accentHex: "#1e3a8a",
    badge: "Enterprise Ready",
    recommendedRoles: ["Business Analyst", "Project Manager", "Financial Analyst", "Enterprise Consultant"],
    features: ["Formal grid structure", "Certifications highlight box", "Budget & team metrics", "Strict compliance layout"]
  },
  {
    id: "Creative",
    name: "Creative & Design",
    category: "creative",
    categoryLabel: "Modern",
    atsScoreRating: 92,
    popularFor: "UI/UX designers, creative technologists, and frontend innovators",
    description: "Vibrant accent headers, creative typography hierarchy, and visual project showcases with Figma/Dribbble/Portfolio integration.",
    columns: "Split Header",
    colorAccent: "Amber Coral",
    accentHex: "#ea580c",
    badge: "High Visual Impact",
    recommendedRoles: ["UI/UX Designer", "Product Designer", "Creative Developer", "Design Technologist"],
    features: ["Dual-tone header layout", "Interactive portfolio links", "Design system tools list", "Visual project showcase cards"]
  }
];

export function ResumeTemplatesGallery() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<string>("all");
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateInfo | null>(null);

  const filteredTemplates = TEMPLATES.filter((tpl) => {
    if (activeTab === "all") return true;
    if (activeTab === "ats") return tpl.category === "ats";
    if (activeTab === "tech") return tpl.category === "tech";
    if (activeTab === "executive") return tpl.category === "executive";
    if (activeTab === "modern") return tpl.category === "modern" || tpl.category === "creative";
    return true;
  });

  const handleUseTemplate = (templateId: string) => {
    navigate(`/resume-studio/builder?template=${templateId}`);
  };

  return (
    <div className="space-y-6 font-sans antialiased text-slate-900 dark:text-slate-100 pb-20">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 dark:border-slate-800 pb-5">
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
                Resume Template Gallery
              </h1>
              <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200/60 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 text-[11px] font-bold">
                8 Templates
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Select an ATS-optimized, high-conversion template tailored to your target industry.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            to="/resume-studio/create"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all"
          >
            <span className="material-symbols-outlined text-[18px]">add_circle</span>
            <span>Import / Scratch</span>
          </Link>
          <Link
            to="/resume-studio/builder"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">edit_document</span>
            <span>Open Builder</span>
          </Link>
        </div>
      </div>

      {/* Category Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2">
        {[
          { id: "all", label: "All Templates (8)", icon: "grid_view" },
          { id: "ats", label: "ATS-Optimized", icon: "verified" },
          { id: "tech", label: "Tech & Data/AI", icon: "code" },
          { id: "executive", label: "Executive & Corporate", icon: "business_center" },
          { id: "modern", label: "Modern & Creative", icon: "palette" },
        ].map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                isActive
                  ? "bg-indigo-600 text-white shadow-sm shadow-indigo-600/20"
                  : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200/80 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60"
              }`}
            >
              <span className="material-symbols-outlined text-[17px]">{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {filteredTemplates.map((tpl) => (
          <motion.div
            key={tpl.id}
            whileHover={{ y: -4 }}
            className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-4.5 flex flex-col justify-between shadow-xs hover:shadow-md hover:border-indigo-300 dark:hover:border-indigo-800/80 transition-all group"
          >
            <div>
              {/* Thumbnail / Mock Preview */}
              <div
                onClick={() => setSelectedTemplate(tpl)}
                className="relative w-full h-56 rounded-xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200/60 dark:border-slate-800 p-3 overflow-hidden cursor-pointer group-hover:border-indigo-400/50 transition-all flex flex-col justify-between"
              >
                {/* Visual Header Mock */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div
                      className="h-3 rounded-full w-24"
                      style={{ backgroundColor: tpl.accentHex }}
                    />
                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 shadow-2xs">
                      {tpl.columns}
                    </span>
                  </div>
                  <div className="h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full w-36" />
                  <div className="h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full w-28" />
                </div>

                {/* Body Lines Mock */}
                <div className="space-y-1.5 my-auto">
                  <div className="h-2 rounded w-16" style={{ backgroundColor: `${tpl.accentHex}40` }} />
                  <div className="h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full w-full" />
                  <div className="h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full w-5/6" />
                  <div className="h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full w-4/6" />
                </div>

                {/* Footer Badges Mock */}
                <div className="flex items-center gap-1.5 pt-2 border-t border-slate-200/60 dark:border-slate-800">
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-bold border border-emerald-200/60 dark:border-emerald-800">
                    ATS {tpl.atsScoreRating}%
                  </span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-200/70 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold truncate">
                    {tpl.colorAccent}
                  </span>
                </div>

                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-indigo-950/40 opacity-0 group-hover:opacity-100 backdrop-blur-[2px] transition-opacity flex items-center justify-center gap-2">
                  <span className="px-3 py-1.5 rounded-lg bg-white text-slate-900 text-xs font-bold shadow-md flex items-center gap-1">
                    <span className="material-symbols-outlined text-[16px]">visibility</span>
                    Preview
                  </span>
                </div>
              </div>

              {/* Template Metadata */}
              <div className="mt-4">
                <div className="flex items-center justify-between gap-1 mb-1">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {tpl.name}
                  </h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                    {tpl.badge}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                  {tpl.description}
                </p>
              </div>

              {/* Recommended Roles Pills */}
              <div className="mt-3 flex flex-wrap gap-1">
                {tpl.recommendedRoles.slice(0, 2).map((role) => (
                  <span
                    key={role}
                    className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                  >
                    {role}
                  </span>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center gap-2">
              <button
                onClick={() => setSelectedTemplate(tpl)}
                className="flex-1 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-colors cursor-pointer"
              >
                Inspect
              </button>
              <button
                onClick={() => handleUseTemplate(tpl.id)}
                className="flex-1 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs shadow-indigo-600/20 transition-colors cursor-pointer flex items-center justify-center gap-1"
              >
                <span>Use</span>
                <span className="material-symbols-outlined text-[15px]">arrow_forward</span>
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Template Detail Modal */}
      <AnimatePresence>
        {selectedTemplate && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-2xl w-full p-6 space-y-5 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-sm"
                    style={{ backgroundColor: selectedTemplate.accentHex }}
                  >
                    <span className="material-symbols-outlined text-[22px]">description</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                        {selectedTemplate.name}
                      </h2>
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-[11px] font-bold">
                        ATS Score {selectedTemplate.atsScoreRating}/100
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      {selectedTemplate.categoryLabel} &bull; {selectedTemplate.columns} &bull; Accent: {selectedTemplate.colorAccent}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedTemplate(null)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <span className="material-symbols-outlined text-[20px]">close</span>
                </button>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                {selectedTemplate.description}
              </div>

              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Key Design Features
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {selectedTemplate.features.map((feat, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2 p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 text-xs font-medium text-slate-800 dark:text-slate-200"
                    >
                      <span className="material-symbols-outlined text-emerald-500 text-[18px]">check_circle</span>
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Best For Roles
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {selectedTemplate.recommendedRoles.map((role) => (
                    <span
                      key={role}
                      className="px-3 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200/60 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 text-xs font-semibold"
                    >
                      {role}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200/80 dark:border-slate-800 flex items-center justify-end gap-3">
                <button
                  onClick={() => setSelectedTemplate(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleUseTemplate(selectedTemplate.id)}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/20 transition-all cursor-pointer flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-[18px]">edit_document</span>
                  <span>Use This Template in Builder</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
