import { useState } from "react";
import { Search } from "lucide-react";

import { COURSES } from "./coursesData";
import type { Course } from "./coursesData";

// Inline SVGs for brand logos
export function YouTubeLogo() {
  return (
    <svg className="w-3.5 h-3.5 fill-red-600" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path d="M23.498 6.163a3.003 3.003 0 0 0-2.11-2.108C19.516 3.5 12 3.5 12 3.5s-7.516 0-9.388.555A3.003 3.003 0 0 0 .502 6.163C0 8.07 0 12 0 12s0 3.93.502 5.837a3.003 3.003 0 0 0 2.11 2.108C4.484 20.5 12 20.5 12 20.5s7.516 0 9.388-.555a3.003 3.003 0 0 0 2.11-2.108C24 15.93 24 12 24 12s0-3.93-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
    </svg>
  );
}

export function CourseraLogo() {
  return (
    <svg className="w-3.5 h-3.5 fill-[#0056D2]" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path d="M12.24 7.64c-3.14 0-5.7 2.56-5.7 5.7s2.56 5.7 5.7 5.7 5.7-2.56 5.7-5.7-2.56-5.7-5.7-5.7zm0 9.24c-1.95 0-3.54-1.59-3.54-3.54s1.59-3.54 3.54-3.54 3.54 1.59 3.54 3.54-1.59 3.54-3.54 3.54zM2.84 8.79C1.27 10.36.42 12.48.42 14.73c0 2.25.85 4.37 2.42 5.94l1.52-1.52c-1.16-1.16-1.8-2.7-1.8-4.42 0-1.72.64-3.26 1.8-4.42L2.84 8.79zm18.32 0l-1.52 1.52c1.16 1.16 1.8 2.7 1.8 4.42 0 1.72-.64 3.26-1.8 4.42l1.52 1.52c1.57-1.57 2.42-3.69 2.42-5.94 0-2.25-.85-4.37-2.42-5.94z"/>
    </svg>
  );
}

export function UdemyLogo() {
  return (
    <svg className="w-3.5 h-3.5 fill-[#A435F0]" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1.96 12.58l-1.96 1.96-1.96-1.96V10.1h3.92v4.48zm1.96-6.44v6.44c0 2.17-1.75 3.92-3.92 3.92s-3.92-1.75-3.92-3.92V8.14h1.96v6.44c0 1.08.88 1.96 1.96 1.96s1.96-.88 1.96-1.96V8.14h1.96z"/>
    </svg>
  );
}

export function EdxLogo() {
  return (
    <svg className="w-3.5 h-3.5 fill-[#FFFFFF]" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <rect width="24" height="24" rx="4" fill="#0F1011"/>
      <path d="M5 8h4.5v1h-3.5v2h3v1h-3v2h3.5v1H5V8zm9.5 0h1.5l1.5 3.5L19 8h1.5l-2.25 5L20.5 18H19l-1.5-3.5L16 18h-1.5l2.25-5-2.25-5zM11 8h1v10h-1V8z" fill="#FFFFFF"/>
    </svg>
  );
}

export function UdacityLogo() {
  return (
    <svg className="w-3.5 h-3.5 fill-[#01B3E6]" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path d="M2 3v13c0 2.76 2.24 5 5 5h10c2.76 0 5-2.24 5-5V3h-3v13c0 1.1-.9 2-2 2H7c-1.1 0-2-.9-2-2V3H2z"/>
    </svg>
  );
}

function PlatformBadge({ platform }: { platform: string }) {
  switch (platform.toLowerCase()) {
    case "youtube":
      return (
        <span className="flex items-center gap-1 bg-red-600/10 border border-red-500/30 text-red-400 px-2.5 py-1 rounded-full text-[9px] font-extrabold uppercase tracking-wider backdrop-blur-md">
          <YouTubeLogo />
          YouTube
        </span>
      );
    case "coursera":
      return (
        <span className="flex items-center gap-1 bg-blue-600/10 border border-blue-500/30 text-blue-400 px-2.5 py-1 rounded-full text-[9px] font-extrabold uppercase tracking-wider backdrop-blur-md">
          <CourseraLogo />
          Coursera
        </span>
      );
    case "udemy":
      return (
        <span className="flex items-center gap-1 bg-purple-600/10 border border-purple-500/30 text-purple-400 px-2.5 py-1 rounded-full text-[9px] font-extrabold uppercase tracking-wider backdrop-blur-md">
          <UdemyLogo />
          Udemy
        </span>
      );
    case "edx":
      return (
        <span className="flex items-center gap-1 bg-neutral-800/80 border border-neutral-700/60 text-neutral-300 px-2.5 py-1 rounded-full text-[9px] font-extrabold uppercase tracking-wider backdrop-blur-md">
          <EdxLogo />
          edX
        </span>
      );
    case "udacity":
      return (
        <span className="flex items-center gap-1 bg-cyan-600/10 border border-cyan-500/30 text-cyan-400 px-2.5 py-1 rounded-full text-[9px] font-extrabold uppercase tracking-wider backdrop-blur-md">
          <UdacityLogo />
          Udacity
        </span>
      );
    default:
      return (
        <span className="flex items-center gap-1 bg-primary/10 border border-primary/30 text-primary px-2.5 py-1 rounded-full text-[9px] font-extrabold uppercase tracking-wider backdrop-blur-md">
          {platform}
        </span>
      );
  }
}

const getPlatformTheme = (platform: string) => {
  switch (platform.toLowerCase()) {
    case "youtube":
      return {
        borderHover: "hover:border-red-500/30 hover:shadow-red-950/10",
        buttonHover: "group-hover:bg-red-600 group-hover:text-white",
        textHover: "group-hover:text-red-400",
        cardBg: "hover:bg-red-950/5"
      };
    case "coursera":
      return {
        borderHover: "hover:border-[#0056D2]/35 hover:shadow-blue-950/10",
        buttonHover: "group-hover:bg-[#0056D2] group-hover:text-white",
        textHover: "group-hover:text-[#0056D2]",
        cardBg: "hover:bg-blue-950/5"
      };
    case "udemy":
      return {
        borderHover: "hover:border-[#A435F0]/30 hover:shadow-purple-950/10",
        buttonHover: "group-hover:bg-[#A435F0] group-hover:text-white",
        textHover: "group-hover:text-purple-400",
        cardBg: "hover:bg-purple-950/5"
      };
    case "edx":
      return {
        borderHover: "hover:border-neutral-500/30 hover:shadow-neutral-950/15",
        buttonHover: "group-hover:bg-neutral-800 group-hover:text-white",
        textHover: "group-hover:text-white",
        cardBg: "hover:bg-neutral-950/5"
      };
    case "udacity":
      return {
        borderHover: "hover:border-[#01B3E6]/30 hover:shadow-cyan-950/10",
        buttonHover: "group-hover:bg-[#01B3E6] group-hover:text-white",
        textHover: "group-hover:text-[#01B3E6]",
        cardBg: "hover:bg-cyan-950/5"
      };
    default:
      return {
        borderHover: "hover:border-primary/30 hover:shadow-primary/10",
        buttonHover: "group-hover:bg-primary group-hover:text-white",
        textHover: "group-hover:text-primary",
        cardBg: "hover:bg-primary/5"
      };
  }
};

// COURSES list loaded from external coursesData.ts file

const DEPARTMENTS = [
  "All Departments",
  "Computer Science & IT",
  "Electronics & Communication",
  "Electrical & Power",
  "Mechanical & Manufacturing",
  "Civil & Infrastructure"
];

export function Courses() {
  const [selectedBranch, setSelectedBranch] = useState("All Departments");
  const [costFilter, setCostFilter] = useState<"All" | "Free" | "Paid">("All");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredCourses = COURSES.filter((course) => {
    const matchesBranch = 
      selectedBranch === "All Departments" || course.branch === selectedBranch;
    
    const matchesCost = 
      costFilter === "All" || course.cost === costFilter;
      
    const matchesSearch = 
      course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.platform.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesBranch && matchesCost && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-background text-on-background p-12">
      {/* Header */}
      <div className="flex flex-col gap-2 mb-10">
        <span className="font-label-sm text-xs text-primary uppercase tracking-widest">Resource Hub</span>
        <h1 className="font-display-lg text-3xl font-bold text-on-background">Explore Technical Courses</h1>
        <p className="text-on-surface-variant max-w-xl leading-relaxed text-sm">
          Master in-demand skills tailored to your engineering branch. Filter by department or cost and start learning on top global platforms.
        </p>
      </div>

      {/* Control Panel: Filters & Search */}
      <div className="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between pb-6 border-b border-outline-variant/10 mb-8">
        
        {/* Search */}
        <div className="w-full md:w-80 flex items-center bg-surface-container-high rounded-xl px-4 py-2.5 gap-2 border border-outline-variant/10">
          <Search className="w-5 h-5 text-on-surface-variant" />
          <input 
            className="bg-transparent border-none outline-none focus:ring-0 text-sm w-full text-on-surface placeholder-on-surface-variant/40" 
            placeholder="Search courses..." 
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
          {/* Branch Select */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-on-surface-variant uppercase tracking-wider font-semibold">Field:</span>
            <select
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
              className="bg-surface-container-high text-on-surface text-sm px-4 py-2.5 rounded-xl border border-outline-variant/10 focus:outline-none focus:border-primary transition-colors cursor-pointer"
            >
              {DEPARTMENTS.map((dept) => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>

          {/* Cost Filter */}
          <div className="flex items-center gap-1 bg-surface-container/50 p-1 rounded-xl border border-outline-variant/10">
            {(["All", "Free", "Paid"] as const).map((filter) => (
              <button
                key={filter}
                onClick={() => setCostFilter(filter)}
                className={`px-4 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wide transition-all ${
                  costFilter === filter
                    ? "bg-primary text-white shadow-sm"
                    : "text-on-surface-variant hover:text-on-surface"
                }`}
              >
                {filter === "All" ? "All Costs" : filter}
              </button>
            ))}
          </div>
        </div>

      </div>

      {/* Courses Grid */}
      {filteredCourses.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredCourses.map((course) => {
            const theme = getPlatformTheme(course.platform);
            return (
              <a
                key={course.id}
                href={course.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`group bg-surface-container rounded-2xl border border-outline-variant/10 overflow-hidden shadow-sm transition-all duration-300 flex flex-col justify-between ${theme.borderHover} ${theme.cardBg}`}
              >
                <div>
                  {/* Image Header with Brand badge and Cost Badge */}
                  <div 
                    className="h-36 w-full bg-cover bg-center group-hover:scale-[1.01] transition-transform duration-500 relative"
                    style={{ backgroundImage: `url('${course.image}')` }}
                  >
                    {/* Dark gradient overlay for badge readability */}
                    <div className="absolute inset-0 bg-gradient-to-b from-black/45 via-transparent to-transparent" />
                    
                    {/* Platform Badge Overlay */}
                    <div className="absolute top-3 left-3 z-10">
                      <PlatformBadge platform={course.platform} />
                    </div>

                    {/* Cost Badge Overlay */}
                    <span className={`absolute top-3 right-3 px-3 py-1 rounded-full text-[9px] font-extrabold uppercase tracking-widest border shadow-md backdrop-blur-md ${
                      course.cost === "Free"
                        ? "bg-success/20 border-success/35 text-success"
                        : "bg-primary/20 border-primary/35 text-primary"
                    }`}>
                      {course.cost}
                    </span>
                  </div>

                  {/* Course Info */}
                  <div className="p-5 flex flex-col gap-2">
                    <span className="font-label-sm text-[9px] font-semibold text-on-surface-variant/65 uppercase tracking-widest">
                      {course.branch}
                    </span>
                    <h4 className={`font-body-lg text-sm font-bold text-on-surface line-clamp-2 leading-snug transition-colors ${theme.textHover}`}>
                      {course.title}
                    </h4>
                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-outline-variant/5">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] text-on-surface-variant font-medium">
                          Rating
                        </span>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <span className="material-symbols-outlined text-[13px] text-tertiary" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                          <span className="font-label-sm text-[10px] font-bold text-on-surface-variant">{course.rating}</span>
                        </div>
                      </div>
                      <span className="text-[10px] text-on-surface-variant/50 font-bold uppercase tracking-wider">
                        {course.platform}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Action Button Footer */}
                <div className="px-5 pb-5 pt-1">
                  <div className={`w-full bg-surface-container-high py-2.5 rounded-xl border border-outline-variant/10 text-center font-label-sm text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 ${theme.buttonHover}`}>
                    Explore Course
                    <span className="material-symbols-outlined text-[14px] transition-transform group-hover:translate-x-0.5">open_in_new</span>
                  </div>
                </div>
              </a>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center border border-dashed border-outline-variant/20 rounded-3xl">
          <span className="material-symbols-outlined text-on-surface-variant/50 text-[48px] mb-4">school</span>
          <h3 className="text-lg font-bold text-on-surface mb-1">No Courses Found</h3>
          <p className="text-sm text-on-surface-variant max-w-xs">
            Try adjusting your filters or search terms to find available courses.
          </p>
        </div>
      )}
    </div>
  );
}
