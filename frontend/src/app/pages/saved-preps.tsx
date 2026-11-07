import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { 
  Bookmark, 
  Trash2, 
  ArrowRight, 
  Building2, 
  Briefcase, 
  Loader2,
  DollarSign,
  ArrowLeft
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
    e.stopPropagation();
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
    <div className="w-full min-h-screen bg-background text-foreground font-sans p-6 md:p-8 select-none">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Page Header */}
        <header className="flex flex-wrap justify-between items-center gap-4 pb-5 border-b border-border">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-primary-container text-primary flex items-center justify-center shadow-xs">
                <Bookmark className="w-5 h-5 fill-current" />
              </div>
              <h1 className="text-2xl md:text-3xl font-bold font-heading tracking-tight text-on-surface">
                Saved interview guides
              </h1>
            </div>
            <p className="text-sm text-on-surface-variant mt-1">
              Access your bookmarked company preparation guides and practice mock interviews anytime.
            </p>
          </div>
          
          <button 
            onClick={() => navigate("/interview-prep")}
            className="px-4 py-2.5 rounded-xl border border-border bg-surface-1 hover:bg-surface-2 transition-all flex items-center gap-2 text-xs font-semibold text-on-surface shadow-xs cursor-pointer"
          >
            <ArrowLeft size={14} /> Browse all companies
          </button>
        </header>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3 bg-surface-1 border border-border rounded-2xl">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
            <p className="text-xs text-on-surface-variant font-medium">Loading your saved guides...</p>
          </div>
        ) : savedPreps.length === 0 ? (
          <div className="text-center py-16 bg-surface-1 rounded-2xl border border-border max-w-xl mx-auto space-y-4 shadow-xs p-8">
            <div className="w-14 h-14 rounded-2xl bg-primary-container text-primary flex items-center justify-center mx-auto shadow-xs">
              <Bookmark className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold font-heading text-on-surface">No Saved Guides Yet</h3>
              <p className="text-xs text-on-surface-variant max-w-sm mx-auto leading-relaxed">
                Bookmark specific company and role preparation hubs to quickly practice questions and mock interviews here.
              </p>
            </div>
            <button
              onClick={() => navigate("/interview-prep")}
              className="px-5 py-2.5 bg-primary text-white text-xs font-bold rounded-xl shadow-md shadow-primary/20 hover:bg-primary/90 transition-all cursor-pointer"
            >
              Explore Companies
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {savedPreps.map((item) => {
              const { company, role, salaryRange } = item.interviewPrep;
              return (
                <div 
                  key={item._id}
                  onClick={() => navigate(`/interview-prep?company=${encodeURIComponent(company)}&role=${encodeURIComponent(role)}`)}
                  className="group bg-surface-1 border border-border rounded-2xl p-5 flex flex-col justify-between cursor-pointer hover:border-primary/40 hover:shadow-md transition-all duration-200"
                >
                  <div className="space-y-4">
                    {/* Header row */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-xl bg-primary-container text-on-primary-container flex items-center justify-center shrink-0 font-heading font-bold text-sm">
                          {company.substring(0, 2).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-bold text-sm text-on-surface truncate group-hover:text-primary transition-colors leading-tight">
                            {role}
                          </h3>
                          <p className="text-xs text-on-surface-variant flex items-center gap-1 mt-0.5 font-medium">
                            <Building2 className="w-3.5 h-3.5 shrink-0 text-primary" /> {company}
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={(e) => handleRemove(company, role, e)}
                        className="p-1.5 rounded-lg border border-border hover:bg-error-container/20 hover:border-error/20 hover:text-error text-on-surface-variant transition-all shrink-0 cursor-pointer"
                        title="Remove guide"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Meta tags */}
                    <div className="flex items-center gap-2 pt-2 border-t border-border/60">
                      {salaryRange && (
                        <span className="px-2.5 py-1 bg-surface-2 text-on-primary-container text-[11px] font-bold rounded-lg flex items-center gap-1">
                          <DollarSign className="w-3 h-3" /> {salaryRange}
                        </span>
                      )}
                      <span className="text-[10px] text-on-surface-variant ml-auto font-medium">
                        Saved {new Date(item.savedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  {/* Call to action */}
                  <div className="flex items-center gap-1 text-xs font-bold text-primary mt-4 group-hover:translate-x-1 transition-transform self-end">
                    Open Prep Hub <ArrowRight className="w-3.5 h-3.5" />
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

export default SavedPrepsPage;
