import { Link } from "react-router";
import { useAuth } from "../context/auth-context";
import { useEffect, useState, useRef } from "react";
import axios from "axios";

export function Dashboard() {
  const { user } = useAuth();
  const [profileData, setProfileData] = useState<any>(null);
  const [roadmapData, setRoadmapData] = useState<any>(null);
  const courseContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function fetchProfile() {
      if (user) {
        try {
          const res = await axios.get("http://localhost:5000/api/profile/me");
          setProfileData(res.data);
        } catch (err) {
          console.error("No profile found or error fetching");
        }

        try {
          const roadmapRes = await axios.get("http://localhost:5000/api/roadmap");
          setRoadmapData(roadmapRes.data);
        } catch (err) {
          console.error("No roadmap found or error fetching roadmap");
        }
      }
    }
    fetchProfile();
  }, [user]);

  const scrollCourses = (direction: "left" | "right") => {
    if (courseContainerRef.current) {
      const scrollAmount = 300;
      courseContainerRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth"
      });
    }
  };

  const skillCount = profileData?.skills?.length || 0;

  // Find active stage and next stage from roadmapData
  let activeStage: any = null;
  let activeStageIndex = -1;
  let activeStageProgressPct = 0;
  let nextStage: any = null;

  if (roadmapData && roadmapData.stages && roadmapData.stages.length > 0) {
    activeStage = roadmapData.stages.find((s: any) => s.status === "In progress");
    if (!activeStage) {
      const allCompleted = roadmapData.stages.every((s: any) => s.status === "Completed");
      if (allCompleted) {
        activeStage = roadmapData.stages[roadmapData.stages.length - 1];
      } else {
        activeStage = roadmapData.stages[0];
      }
    }
    activeStageIndex = roadmapData.stages.indexOf(activeStage);
    
    if (activeStage && activeStage.skills) {
      const completedCount = activeStage.skills.filter((s: any) => s.completed).length;
      activeStageProgressPct = activeStage.skills.length > 0 
        ? Math.round((completedCount / activeStage.skills.length) * 100) 
        : 0;
    }
    
    if (activeStageIndex !== -1 && activeStageIndex < roadmapData.stages.length - 1) {
      nextStage = roadmapData.stages[activeStageIndex + 1];
    }
  }
  const hasAssessment = !!profileData?.recommendedCareers?.length;
  const targetCareer = profileData?.targetCareer;
  const topMatch = profileData?.recommendedCareers?.[0];
  const atsScore = profileData?.resumeData?.atsScore ?? null;
  const resumeRole = profileData?.resumeData?.role ?? null;
  const careerMatchPct = topMatch?.confidence ?? (hasAssessment ? 85 : 0);

  // Fallbacks for empty states
  const displayCareerTitle = targetCareer || topMatch?.title || "Machine Learning Engineer";
  const displayMatchPct = careerMatchPct || 85;

  return (
    <div className="min-h-screen bg-background text-on-background relative">
      {/* Main Content */}
      <main className="relative">
        <div className="flex flex-col w-full px-12 py-10 gap-10">
          
          {/* Header Section */}
          <section className="flex flex-col gap-2">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg shadow-primary/10">
                <span className="material-symbols-outlined text-white text-[32px]">waving_hand</span>
              </div>
              <div className="flex flex-col">
                <span className="font-label-sm text-xs text-on-surface-variant uppercase tracking-widest">Dashboard Overview</span>
                <h1 className="font-display-lg text-3xl font-bold text-on-background">Welcome back, {user?.name || "Guest"}</h1>
              </div>
            </div>
            <p className="font-body-lg text-base text-on-surface-variant max-w-2xl mt-2 leading-relaxed">
              Your career trajectory is currently optimized for a <strong className="text-primary font-semibold">{displayCareerTitle}</strong> role. Let's see what you can tackle today to get closer to your goal.
            </p>
          </section>

          {/* Bento Grid */}
          <section className="grid grid-cols-12 gap-6">
            
            {/* Career Recommendation (Large Card) */}
            <div className="col-span-12 lg:col-span-8 bg-surface-container-low rounded-3xl p-8 relative overflow-hidden group border border-outline-variant/10 shadow-sm transition-all duration-300 hover:shadow-md">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="absolute -right-12 -top-12 w-64 h-64 bg-primary/10 rounded-full blur-3xl group-hover:bg-primary/20 transition-colors duration-500"></div>
              
              <div className="relative z-10 flex flex-col h-full justify-between gap-6">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-1.5 bg-surface-container-high px-4 py-1.5 rounded-full border border-outline-variant/10">
                    <span className="material-symbols-outlined text-primary text-[16px]">insights</span>
                    <span className="font-label-sm text-xs font-semibold text-on-surface">AI Top Pick</span>
                  </div>
                  <Link 
                    to="/assessment" 
                    className="bg-primary text-white font-label-sm text-xs font-semibold px-5 py-2 rounded-full shadow-md shadow-primary/20 hover:opacity-90 transition-opacity"
                  >
                    Explore Path
                  </Link>
                </div>
                
                <div className="flex flex-col gap-2 mt-4">
                  <h2 className="font-headline-md text-2xl font-bold text-on-surface">{displayCareerTitle}</h2>
                  <p className="font-body-md text-sm text-on-surface-variant max-w-lg leading-relaxed">
                    {hasAssessment 
                      ? `Based on your recent skill assessments, navigating to a ${displayCareerTitle} offers a ${displayMatchPct}% match score with excellent growth prospects.`
                      : "Assess your technical skills, branch details, and career interests to generate your customized AI recommendation path."
                    }
                  </p>
                </div>

                <div className="flex gap-8 mt-4 items-center">
                  <div className="flex flex-col">
                    <span className="font-label-sm text-[10px] text-on-surface-variant uppercase tracking-wider">Match Score</span>
                    <span className="font-headline-md text-2xl font-bold text-secondary">{displayMatchPct}%</span>
                  </div>
                  <div className="h-10 w-px bg-outline-variant/20"></div>
                  <div className="flex flex-col">
                    <span className="font-label-sm text-[10px] text-on-surface-variant uppercase tracking-wider">Est. Salary Growth</span>
                    <span className="font-headline-md text-2xl font-bold text-on-surface">+$25k</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Resume Analysis */}
            <Link 
              to="/resume"
              className="col-span-12 md:col-span-6 lg:col-span-4 bg-surface-container rounded-3xl p-8 border border-outline-variant/10 shadow-sm transition-all duration-300 hover:border-primary/30 flex flex-col justify-between gap-6"
            >
              <div className="flex justify-between items-center">
                <div className="h-12 w-12 rounded-2xl bg-tertiary-container/20 border border-tertiary-container/30 flex items-center justify-center">
                  <span className="material-symbols-outlined text-tertiary text-[24px]">document_scanner</span>
                </div>
                <span className={`font-label-sm text-xs font-semibold px-3 py-1 rounded-full ${atsScore ? "bg-success/20 text-success" : "bg-tertiary-container/20 text-tertiary"}`}>
                  {atsScore ? "Analyzed" : "Needs Update"}
                </span>
              </div>
              
              <div className="flex flex-col">
                <h3 className="font-headline-md text-xl font-bold text-on-surface">Resume Health</h3>
                <p className="font-body-md text-sm text-on-surface-variant mt-2">
                  {atsScore 
                    ? `Your resume has an ATS compatibility score of ${atsScore}% for ${resumeRole || "target roles"}.`
                    : "Upload and analyze your resume to check ATS compatibility and keyword coverage."
                  }
                </p>
              </div>
              
              <div className="w-full bg-surface-container-highest rounded-full h-2 mt-4 overflow-hidden">
                <div className="bg-tertiary h-2 rounded-full transition-all duration-1000" style={{ width: `${atsScore || 30}%` }}></div>
              </div>
            </Link>

            {/* AI Mentor */}
            <Link 
              to="/chatbot"
              className="col-span-12 bg-surface-container rounded-3xl p-8 border border-outline-variant/10 shadow-sm flex items-center justify-between group overflow-hidden relative"
            >
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_right,_var(--tw-gradient-stops))] from-primary/10 via-background/0 to-background/0"></div>
              
              <div className="flex flex-col gap-2 relative z-10 max-w-md">
                <div className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-primary text-[20px]">smart_toy</span>
                  <span className="font-label-sm text-xs font-semibold text-primary uppercase tracking-widest">AI Mentor Active</span>
                </div>
                <h3 className="font-headline-md text-xl font-bold text-on-surface">Discuss your interview strategy</h3>
                <p className="font-body-md text-sm text-on-surface-variant mt-1">Your mentor has prepared custom technical mock questions based on your profile.</p>
              </div>
              
              <div className="relative z-10 flex-shrink-0">
                <div className="h-14 w-14 rounded-full bg-primary flex items-center justify-center shadow-lg hover:scale-105 transition-transform duration-200">
                  <span className="material-symbols-outlined text-white text-[24px]">chat_bubble</span>
                </div>
              </div>
            </Link>

          </section>

          {/* Two Column Layout */}
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-10 mt-4">
            
            {/* Learning Roadmap */}
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h2 className="font-headline-md text-xl font-bold text-on-surface">Learning Roadmap</h2>
                {roadmapData ? (
                  <Link to="/roadmap" className="font-label-sm text-xs font-semibold text-primary hover:underline">View Roadmap</Link>
                ) : (
                  <Link to="/roadmap" className="font-label-sm text-xs font-semibold text-primary hover:underline">Create Roadmap</Link>
                )}
              </div>
              
              {roadmapData ? (
                <div className="flex flex-col gap-4 relative pl-6">
                  {/* Timeline Line */}
                  <div className="absolute left-2.5 top-2 bottom-2 w-px bg-outline-variant/20"></div>

                  {/* Node 1 (Active) */}
                  <Link to="/roadmap" className="block relative bg-surface-container-low p-5 rounded-2xl border border-outline-variant/10 shadow-sm flex flex-col gap-2 hover:bg-surface-container-high/40 transition-colors">
                    <div className="absolute -left-6 top-6 h-3.5 w-3.5 rounded-full bg-primary shadow-[0_0_10px_rgba(99,102,241,0.5)] border-4 border-surface-container-low"></div>
                    <div className="flex justify-between items-center">
                      <span className="font-label-sm text-xs font-semibold text-primary">{activeStage?.status || "Active"}</span>
                      <span className="font-label-sm text-xs font-semibold text-on-surface-variant">{activeStageProgressPct}%</span>
                    </div>
                    <h4 className="font-body-lg text-base font-bold text-on-surface">
                      {activeStage?.title.split(':').slice(1).join(':').trim() || activeStage?.title}
                    </h4>
                    <div className="w-full bg-surface-container-highest rounded-full h-1.5 mt-2 overflow-hidden">
                      <div className="bg-primary h-1.5 rounded-full transition-all duration-500" style={{ width: `${activeStageProgressPct}%` }}></div>
                    </div>
                  </Link>

                  {/* Node 2 (Upcoming) */}
                  {nextStage ? (
                    <div className="relative bg-surface-container p-5 rounded-2xl border border-outline-variant/10 flex flex-col gap-1 opacity-75">
                      <div className="absolute -left-6 top-6 h-3.5 w-3.5 rounded-full bg-surface-container-highest border-4 border-surface-container"></div>
                      <span className="font-label-sm text-xs font-semibold text-on-surface-variant">Up Next</span>
                      <h4 className="font-body-lg text-base font-bold text-on-surface">
                        {nextStage?.title.split(':').slice(1).join(':').trim() || nextStage?.title}
                      </h4>
                    </div>
                  ) : (
                    <div className="relative bg-surface-container p-5 rounded-2xl border border-outline-variant/10 flex flex-col gap-1 opacity-75">
                      <div className="absolute -left-6 top-6 h-3.5 w-3.5 rounded-full bg-surface-container-highest border-4 border-surface-container"></div>
                      <span className="font-label-sm text-xs font-semibold text-on-surface-variant">Completed</span>
                      <h4 className="font-body-lg text-base font-bold text-on-surface">Path fully mastered!</h4>
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-surface-container p-6 rounded-2xl border border-outline-variant/10 flex flex-col items-center justify-center text-center gap-4">
                  <span className="material-symbols-outlined text-primary text-[36px]">map</span>
                  <div className="flex flex-col gap-1">
                    <h4 className="text-sm font-bold text-on-surface">No active learning path</h4>
                    <p className="text-xs text-on-surface-variant max-w-[240px]">Create a step-by-step career roadmap tailored for your engineering branch.</p>
                  </div>
                  <Link to="/roadmap" className="bg-primary text-white font-label-sm text-xs font-semibold px-5 py-2.5 rounded-full shadow-md shadow-primary/20 hover:opacity-90 transition-opacity">
                    Create Roadmap
                  </Link>
                </div>
              )}
            </div>

            {/* Saved Careers */}
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h2 className="font-headline-md text-xl font-bold text-on-surface">Saved Careers</h2>
                <Link to="/assessment" className="font-label-sm text-xs font-semibold text-on-surface-variant hover:text-primary transition-colors">Manage</Link>
              </div>

              <div className="flex flex-col gap-3">
                {/* Career 1 */}
                <div className="flex items-center justify-between p-4 bg-surface-container rounded-2xl border border-outline-variant/10 hover:bg-surface-container-high transition-colors cursor-pointer group">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-xl bg-primary/15 border border-primary/20 flex items-center justify-center">
                      <span className="material-symbols-outlined text-primary text-[20px]">database</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="font-body-lg text-base font-bold text-on-surface">Data Engineer</span>
                      <span className="font-label-sm text-xs text-on-surface-variant">82% Match • High Demand</span>
                    </div>
                  </div>
                  <span className="material-symbols-outlined text-on-surface-variant opacity-0 group-hover:opacity-100 transition-opacity">chevron_right</span>
                </div>

                {/* Career 2 */}
                <div className="flex items-center justify-between p-4 bg-surface-container rounded-2xl border border-outline-variant/10 hover:bg-surface-container-high transition-colors cursor-pointer group">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-xl bg-secondary/15 border border-secondary/20 flex items-center justify-center">
                      <span className="material-symbols-outlined text-secondary text-[20px]">analytics</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="font-body-lg text-base font-bold text-on-surface">Business Intelligence Analyst</span>
                      <span className="font-label-sm text-xs text-on-surface-variant">78% Match • Steady Growth</span>
                    </div>
                  </div>
                  <span className="material-symbols-outlined text-on-surface-variant opacity-0 group-hover:opacity-100 transition-opacity">chevron_right</span>
                </div>
              </div>
            </div>

          </section>

          {/* Recommended Courses */}
          <section className="flex flex-col gap-4 mt-4 mb-10">
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <h2 className="font-headline-md text-xl font-bold text-on-surface">Recommended Courses</h2>
                <span className="font-body-md text-sm text-on-surface-variant">Curated to close your skill gaps</span>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => scrollCourses("left")}
                  className="h-8 w-8 rounded-full bg-surface-container border border-outline-variant/20 flex items-center justify-center hover:bg-surface-container-high transition-colors"
                >
                  <span className="material-symbols-outlined text-[20px] text-on-surface">arrow_back</span>
                </button>
                <button 
                  onClick={() => scrollCourses("right")}
                  className="h-8 w-8 rounded-full bg-surface-container border border-outline-variant/20 flex items-center justify-center hover:bg-surface-container-high transition-colors"
                >
                  <span className="material-symbols-outlined text-[20px] text-on-surface">arrow_forward</span>
                </button>
              </div>
            </div>

            <div 
              ref={courseContainerRef}
              className="flex gap-6 overflow-x-auto pb-4 snap-x snap-mandatory scroll-smooth" 
              style={{ scrollbarWidth: "none" }}
            >
              {/* Course Card 1 */}
              <div className="flex-shrink-0 w-72 bg-surface-container rounded-2xl border border-outline-variant/10 overflow-hidden shadow-sm snap-start group cursor-pointer">
                <div 
                  className="h-32 w-full bg-cover bg-center group-hover:scale-105 transition-transform duration-500" 
                  style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCXncReKhRdoyPzKLuloWByEs-J8t3kaR8INGSSJ_vm7-Y9AIzh-Eo_pvPug8bQ_5Xw2wPeqG5rAoxqhFRwM8BUCRC0kkDc9ObqMKFzOOQ2cEgFmudJU3vSbq7Gc6Pne65IOX8H1VEQ6tiQ9d47L5lQgDUpZo8lmnW_V3xnqTWQxPRxz-DOwEYuoJ1fmJ4nabVhrcgJcXCesXzw-SJdc55mmadATuYoAoQd7mc2TNZSEjXTgpwC3fmR')" }}
                ></div>
                <div className="p-4 flex flex-col gap-1 bg-surface-container relative z-10">
                  <span className="font-label-sm text-xs font-semibold text-primary">Coursera</span>
                  <h4 className="font-body-lg text-sm font-bold text-on-surface line-clamp-2">Applied Machine Learning in Python</h4>
                  <div className="flex items-center gap-1 mt-2">
                    <span className="material-symbols-outlined text-[16px] text-tertiary" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                    <span className="font-label-sm text-xs text-on-surface-variant">4.8 (12k reviews)</span>
                  </div>
                </div>
              </div>

              {/* Course Card 2 */}
              <div className="flex-shrink-0 w-72 bg-surface-container rounded-2xl border border-outline-variant/10 overflow-hidden shadow-sm snap-start group cursor-pointer">
                <div 
                  className="h-32 w-full bg-cover bg-center group-hover:scale-105 transition-transform duration-500" 
                  style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuBs-iVcd0M3or1IR4b0z5uj4sgFfIa2kZUGuRpDFRpUhnIcLnvWkkjZDuadWc6iShHa0gsh18fc-4g5LSv4Z7wl0r55LuGovKvrRJkwcksUzeAIdhYyckytBPuWA3r71rhkfxnjpugWBDGlhCMnf_IJ6vP0OV3Lu0PpjhZT7P1TWxtDiiBE7OV1LIN9eEhaluwV-cFAWdZHI0LcACtF9mQXrtJFDM9PBC9HojP9ZA2m1cav_pNUpbKi')" }}
                ></div>
                <div className="p-4 flex flex-col gap-1 bg-surface-container relative z-10">
                  <span className="font-label-sm text-xs font-semibold text-secondary">Udacity</span>
                  <h4 className="font-body-lg text-sm font-bold text-on-surface line-clamp-2">Data Engineering Nano-degree</h4>
                  <div className="flex items-center gap-1 mt-2">
                    <span className="material-symbols-outlined text-[16px] text-tertiary" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                    <span className="font-label-sm text-xs text-on-surface-variant">4.9 (8k reviews)</span>
                  </div>
                </div>
              </div>

              {/* Course Card 3 */}
              <div className="flex-shrink-0 w-72 bg-surface-container rounded-2xl border border-outline-variant/10 overflow-hidden shadow-sm snap-start group cursor-pointer">
                <div 
                  className="h-32 w-full bg-cover bg-center group-hover:scale-105 transition-transform duration-500" 
                  style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuACWcJV1PvU5iS5tL0N0KKc5q551qFKnZn9NjwH6ohr0PvvhPPCPsSDkqo_2grXAKNls4ZDpahi_PG6Wpc8Y6EipVaFDWk2yt0HkrO3VzQu0S12BBs-Qz4tmKcD921bF9fKlcTq_2b2Oqh8C_1PHl2accfqlh4FHcy2ZeuJdfisKptJQC6iFgkQVdsuGRKHaeYtwylR4od-NjaqtuaVcaIqBUSEQuothO0bfEzgUaarLEkal9nUWdC_')" }}
                ></div>
                <div className="p-4 flex flex-col gap-1 bg-surface-container relative z-10">
                  <span className="font-label-sm text-xs font-semibold text-primary">edX</span>
                  <h4 className="font-body-lg text-sm font-bold text-on-surface line-clamp-2">Introduction to Cloud Computing</h4>
                  <div className="flex items-center gap-1 mt-2">
                    <span className="material-symbols-outlined text-[16px] text-tertiary" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                    <span className="font-label-sm text-xs text-on-surface-variant">4.7 (5k reviews)</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

        </div>
      </main>
    </div>
  );
}
