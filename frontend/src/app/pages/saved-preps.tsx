import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { 
  Bookmark, 
  Trash2, 
  ArrowRight, 
  Building2, 
  Briefcase, 
  Loader2,
  DollarSign
} from "lucide-react";
import axios from "axios";

interface SavedPrepItem {
  _id: string;
  interviewPrep: {
    company: string;
    role: string;
    salaryRange?: string;
  };
  savedAt: string;
}

export function SavedPrepsPage() {
  const [savedPreps, setSavedPreps] = useState<SavedPrepItem[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchSavedPreps = async () => {
    setLoading(true);
    try {
      const res = await axios.get("http://localhost:5000/api/interview-prep/saved");
      setSavedPreps(res.data);
    } catch (err) {
      console.error("Error fetching saved preps:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSavedPreps();
  }, []);

  const handleRemove = async (company: string, role: string, e: React.MouseEvent) => {
    e.stopPropagation(); // prevent card click navigation
    if (!confirm(`Are you sure you want to remove the preparation guide for ${role} at ${company}?`)) {
      return;
    }
    try {
      await axios.delete(`http://localhost:5000/api/interview-prep/save?company=${encodeURIComponent(company)}&role=${encodeURIComponent(role)}`);
      setSavedPreps(prev => prev.filter(item => !(item.interviewPrep.company === company && item.interviewPrep.role === role)));
    } catch (err) {
      console.error("Error removing saved prep:", err);
      alert("Failed to remove saved preparation guide.");
    }
  };

  return (
    <div className="w-full min-h-screen bg-background text-foreground relative p-6 select-none overflow-y-auto">
      
      {/* Background radial glow */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-20">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <radialGradient cx="50%" cy="50%" fx="50%" fy="50%" id="saved-glow" r="50%">
              <stop offset="0%" stopColor="#0ea5e9" stopOpacity="0.25"></stop>
              <stop offset="100%" stopColor="#0b1326" stopOpacity="0"></stop>
            </radialGradient>
          </defs>
          <circle className="animate-pulse" cx="80%" cy="20%" fill="url(#saved-glow)" r="35%"></circle>
          <circle className="animate-pulse" cx="20%" cy="80%" fill="url(#saved-glow)" r="45%"></circle>
        </svg>
      </div>

      <div className="max-w-6xl mx-auto z-10 relative space-y-6">
        
        {/* Page Header */}
        <header className="flex justify-between items-center pb-4 border-b border-outline-variant/10">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-on-surface flex items-center gap-3">
              <Bookmark className="w-8 h-8 text-primary" /> Saved Interview Guides
            </h1>
            <p className="text-sm text-on-surface-variant mt-1">Access your saved company preparation guides and practice interviews anytime</p>
          </div>
          <button 
            onClick={() => navigate("/interview-prep")}
            className="p-2.5 rounded-xl border border-outline-variant/10 hover:bg-surface-container-high transition-all flex items-center gap-2 text-xs font-semibold text-on-surface-variant hover:text-white"
          >
            Find More Guides
          </button>
        </header>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <Loader2 className="w-10 h-10 text-primary animate-spin" />
            <p className="text-sm text-on-surface-variant">Loading your saved guides...</p>
          </div>
        ) : savedPreps.length === 0 ? (
          <div className="text-center py-20 bg-surface-container-low/40 rounded-3xl border border-outline-variant/10 max-w-2xl mx-auto space-y-4 shadow-sm">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary mx-auto">
              <Bookmark className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-on-surface">No Saved Guides</h3>
              <p className="text-xs text-on-surface-variant max-w-sm mx-auto">
                You haven't saved any interview preparation guides yet. Find a guide and save it to access it quickly here.
              </p>
            </div>
            <button
              onClick={() => navigate("/interview-prep")}
              className="px-5 py-2.5 bg-primary text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-md hover:bg-primary/95 transition-all"
            >
              Search Guides
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {savedPreps.map((item) => {
              const { company, role, salaryRange } = item.interviewPrep;
              return (
                <div 
                  key={item._id}
                  onClick={() => navigate(`/interview-prep?company=${encodeURIComponent(company)}&role=${encodeURIComponent(role)}`)}
                  className="group bg-surface-container/40 border border-outline-variant/10 rounded-2xl p-5 flex flex-col justify-between cursor-pointer hover:border-primary/30 hover:bg-surface-container/60 transition-all shadow-sm relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-bl-full blur-xl group-hover:bg-primary/10 transition-all pointer-events-none" />
                  
                  <div className="space-y-4">
                    {/* Company and Role header */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0 shadow-inner">
                          <Briefcase className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="font-bold text-sm text-on-surface line-clamp-1 group-hover:text-primary transition-colors leading-tight">
                            {role}
                          </h3>
                          <p className="text-xs text-on-surface-variant flex items-center gap-1 mt-0.5 font-medium">
                            <Building2 className="w-3.5 h-3.5 shrink-0 text-secondary" /> {company}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={(e) => handleRemove(company, role, e)}
                        className="p-1.5 rounded-lg border border-outline-variant/10 hover:bg-error-container/20 hover:border-error/20 hover:text-error text-on-surface-variant transition-all shrink-0 cursor-pointer"
                        title="Remove guide"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Meta info tags */}
                    <div className="flex items-center gap-2 pt-2 border-t border-outline-variant/5">
                      {salaryRange && (
                        <span className="px-2.5 py-1 bg-secondary/10 border border-secondary/15 text-secondary text-[10px] font-bold uppercase rounded-md flex items-center gap-0.5">
                          <DollarSign className="w-3 h-3" /> {salaryRange}
                        </span>
                      )}
                      <span className="text-[9px] text-on-surface-variant/60 ml-auto">
                        Saved {new Date(item.savedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  {/* Navigation prompt */}
                  <div className="flex items-center gap-1.5 text-xs font-bold text-primary mt-4 group-hover:translate-x-1 transition-transform self-end">
                    View Guide <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
}
