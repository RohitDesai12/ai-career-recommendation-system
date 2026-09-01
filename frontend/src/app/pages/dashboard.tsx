import { Link } from "react-router";
import { useAuth } from "../context/auth-context";
import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { COURSES } from "./coursesData";

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

  const handleToggleSave = async (courseId: number) => {
    try {
      const res = await axios.put("http://localhost:5000/api/profile/save-course", { courseId });
      setProfileData(res.data);
    } catch (err) {
      console.error("Error toggling saved course:", err);
    }
  };

  const savedCourses = COURSES.filter(course => 
    profileData?.savedCourses?.includes(course.id)
  );

  const userBranch = roadmapData?.department || "Computer Science & IT";
  const branchCourses = COURSES.filter(course => course.branch === userBranch);
  const dynamicRecommendedCourses = branchCourses.length > 0 ? branchCourses.slice(0, 6) : COURSES.slice(0, 6);

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
                <Link 
                  to="/roadmap"
                  className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-surface-container-low border border-outline-variant/15 p-6 rounded-3xl gap-6 shadow-sm relative overflow-hidden group hover:border-primary/30 transition-all duration-300"
                >
                  <div className="absolute top-0 right-0 -mr-6 -mt-6 w-24 h-24 bg-primary/10 rounded-full blur-2xl group-hover:bg-primary/20 transition-colors duration-500" />
                  
                  <div className="flex flex-col gap-2 min-w-0 flex-1 relative z-10">
                    <div className="flex items-center gap-2">
                      <span className="bg-primary/15 text-primary text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider border border-primary/20">
                        {roadmapData.department}
                      </span>
                    </div>
                    <h3 className="text-xl font-extrabold text-on-surface">Your Career Roadmap</h3>
                    <p className="text-on-surface-variant text-xs flex items-center gap-1.5 mt-0.5 font-medium leading-relaxed">
                      <span className="material-symbols-outlined text-[16px] text-secondary flex-shrink-0">location_on</span>
                      <span className="truncate">{roadmapData.field} Path · Customized for your profile</span>
                    </p>
                  </div>

                  {/* Circular progress badge */}
                  <div className="flex items-center bg-surface-container border border-outline-variant/10 px-4 py-3 rounded-2xl gap-3 flex-shrink-0 shadow-sm relative z-10 w-full sm:w-auto justify-between">
                    <div className="relative w-12 h-12 flex items-center justify-center flex-shrink-0">
                      <svg className="w-full h-full transform -rotate-90">
                        <circle
                          cx="24"
                          cy="24"
                          r="19"
                          className="stroke-outline-variant/20 fill-none"
                          strokeWidth="3.5"
                        />
                        <circle
                          cx="24"
                          cy="24"
                          r="19"
                          className="stroke-primary fill-none transition-all duration-500 ease-out"
                          strokeWidth="4"
                          strokeDasharray={119.3}
                          strokeDashoffset={119.3 - (119.3 * roadmapData.percentComplete) / 100}
                          strokeLinecap="round"
                        />
                      </svg>
                      <span className="absolute text-[10px] font-bold text-on-surface">{roadmapData.percentComplete}%</span>
                    </div>
                    <div className="flex flex-col text-left">
                      <span className="text-xs font-bold text-on-surface leading-tight">{roadmapData.stagesComplete}/{roadmapData.totalStages} Stages</span>
                      <span className="text-[10px] text-on-surface-variant font-medium">Completed Path</span>
                    </div>
                  </div>
                </Link>
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

            {/* Saved Careers & Saved Courses Column */}
            <div className="flex flex-col gap-8">
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

              {/* Saved Courses */}
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <h2 className="font-headline-md text-xl font-bold text-on-surface">Saved Courses</h2>
                  <Link to="/courses" className="font-label-sm text-xs font-semibold text-on-surface-variant hover:text-primary transition-colors">Manage</Link>
                </div>

                {savedCourses.length > 0 ? (
                  <div className="flex flex-col gap-3">
                    {savedCourses.map((course) => (
                      <div 
                        key={course.id} 
                        className="flex items-center justify-between p-4 bg-surface-container rounded-2xl border border-outline-variant/10 hover:bg-surface-container-high transition-colors group relative cursor-pointer"
                        onClick={() => window.open(course.url, "_blank", "noopener,noreferrer")}
                      >
                        <div className="flex items-center gap-4 min-w-0 flex-1">
                          <div className={`h-10 w-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                            course.platform.toLowerCase() === "youtube" ? "bg-red-500/15 border border-red-500/20 text-red-500" :
                            course.platform.toLowerCase() === "coursera" ? "bg-blue-500/15 border border-blue-500/20 text-blue-500" :
                            course.platform.toLowerCase() === "udemy" ? "bg-purple-500/15 border border-purple-500/20 text-purple-500" :
                            "bg-secondary/15 border border-secondary/20 text-secondary"
                          }`}>
                            <span className="material-symbols-outlined text-[20px]">school</span>
                          </div>
                          <div className="flex flex-col min-w-0">
                            <span className="font-body-lg text-base font-bold text-on-surface truncate">
                              {course.title}
                            </span>
                            <span className="font-label-sm text-xs text-on-surface-variant flex items-center gap-1.5 mt-0.5">
                              <span>{course.platform}</span>
                              <span>•</span>
                              <span className="flex items-center gap-0.5">
                                <span className="material-symbols-outlined text-[12px] text-tertiary" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                                {course.rating}
                              </span>
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => handleToggleSave(course.id)}
                            className="p-2 hover:bg-surface-container-highest rounded-xl text-primary transition-colors flex items-center justify-center"
                            title="Remove Bookmark"
                          >
                            <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>bookmark</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-surface-container p-6 rounded-2xl border border-outline-variant/10 flex flex-col items-center justify-center text-center gap-4">
                    <span className="material-symbols-outlined text-primary/70 text-[36px]">bookmark_border</span>
                    <div className="flex flex-col gap-1">
                      <h4 className="text-sm font-bold text-on-surface">No saved courses yet</h4>
                      <p className="text-xs text-on-surface-variant max-w-[240px]">Browse our resource hub and save courses you want to track.</p>
                    </div>
                    <Link to="/courses" className="bg-primary/20 text-primary font-label-sm text-xs font-semibold px-5 py-2.5 rounded-full hover:bg-primary/30 transition-colors">
                      Find Courses
                    </Link>
                  </div>
                )}
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
              {dynamicRecommendedCourses.map((course) => {
                const isSaved = profileData?.savedCourses?.includes(course.id);
                return (
                  <div 
                    key={course.id}
                    onClick={() => window.open(course.url, "_blank", "noopener,noreferrer")}
                    className="flex-shrink-0 w-72 bg-surface-container rounded-2xl border border-outline-variant/10 overflow-hidden shadow-sm snap-start group cursor-pointer flex flex-col justify-between"
                  >
                    <div>
                      <div 
                        className="h-32 w-full bg-cover bg-center group-hover:scale-[1.01] transition-transform duration-500 relative" 
                        style={{ backgroundImage: `url('${course.image}')` }}
                      >
                        {/* Dark overlay */}
                        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-transparent" />
                        
                        {/* Cost badge */}
                        <span className={`absolute top-2 right-2 px-2 py-0.5 rounded-full text-[8px] font-extrabold uppercase tracking-widest border shadow-md backdrop-blur-md ${
                          course.cost === "Free"
                            ? "bg-success/20 border-success/35 text-success"
                            : "bg-primary/20 border-primary/35 text-primary"
                        }`}>
                          {course.cost}
                        </span>

                        {/* Save Toggle */}
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleToggleSave(course.id);
                          }}
                          className="absolute bottom-2 right-2 z-20 h-7 w-7 rounded-full bg-surface-container/85 border border-outline-variant/20 flex items-center justify-center hover:bg-surface-container hover:scale-105 active:scale-95 transition-all text-on-surface backdrop-blur-md shadow-sm"
                          title={isSaved ? "Remove from saved courses" : "Save course"}
                        >
                          <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: isSaved ? "'FILL' 1" : undefined }}>
                            bookmark
                          </span>
                        </button>
                      </div>
                      <div className="p-4 flex flex-col gap-1 bg-surface-container relative z-10">
                        <span className="font-label-sm text-[10px] font-semibold text-primary uppercase tracking-wider">{course.platform}</span>
                        <h4 className="font-body-lg text-sm font-bold text-on-surface line-clamp-2 leading-snug group-hover:text-primary transition-colors">{course.title}</h4>
                      </div>
                    </div>
                    <div className="p-4 pt-0 flex items-center justify-between bg-surface-container relative z-10">
                      <div className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px] text-tertiary" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                        <span className="font-label-sm text-xs text-on-surface-variant">{course.rating}</span>
                      </div>
                      <span className="text-[10px] text-on-surface-variant/60 font-medium uppercase tracking-wider truncate max-w-[120px]">{course.branch}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

        </div>
      </main>
    </div>
  );
}
