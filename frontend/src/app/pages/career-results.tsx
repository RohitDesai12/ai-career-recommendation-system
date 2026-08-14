import { useLocation, Link, useNavigate } from "react-router";
import { motion } from "motion/react";
import { Sparkles, TrendingUp, Award, ChevronRight, FileText, MessageSquare, Target, ArrowLeft } from "lucide-react";
import { useState, useEffect } from "react";
import axios from "axios";

// Map frontend branch names to model-expected codes
const BRANCH_TO_MODEL: Record<string, string> = {
  "Computer Science & Engineering": "CSE",
  "Information Technology": "IT",
  "Software Engineering": "CSE",
  "Data Science": "Data Science",
  "Electronics & Communication Engineering": "ECE",
  "Electronics Engineering": "ECE",
  "VLSI Design": "ECE",
  "Embedded Systems": "ECE",
  "Electrical Engineering": "EEE",
  "Electrical & Electronics Engineering": "EEE",
  "Power Engineering": "EEE",
  "Mechanical Engineering": "Mechanical",
  "Manufacturing Engineering": "Mechanical",
  "Automotive Engineering": "Mechanical",
  "Aerospace Engineering": "Aerospace",
  "Civil Engineering": "Civil",
  "Construction Engineering": "Civil",
  "Transportation Engineering": "Civil",
};

// Map frontend specialization names to model-expected values
const SPEC_MAP: Record<string, string> = {
  "Computer Science & Engineering": "Software Engineering",
  "Information Technology": "Software Engineering",
  "Software Engineering": "Software Engineering",
  "Data Science": "Data Science",
  "Electronics & Communication Engineering": "Embedded Systems",
  "Electronics Engineering": "Embedded Systems",
  "VLSI Design": "VLSI Design",
  "Embedded Systems": "Embedded Systems",
  "Electrical Engineering": "Power Systems",
  "Electrical & Electronics Engineering": "Power Systems",
  "Power Engineering": "Power Systems",
  "Mechanical Engineering": "Product Design",
  "Manufacturing Engineering": "Manufacturing",
  "Automotive Engineering": "Automobile Engineering",
  "Aerospace Engineering": "Aerodynamics",
  "Civil Engineering": "Structural Engineering",
  "Construction Engineering": "Construction Management",
  "Transportation Engineering": "Transportation Engineering",
};

// Map year display to model value
const YEAR_MAP: Record<string, string> = {
  "1st Year": "1",
  "2nd Year": "2",
  "3rd Year": "3",
  "4th Year": "4",
};

// Map CGPA display to model value
const CGPA_MAP: Record<string, string> = {
  "9.0 - 10.0": "9.0-10.0",
  "8.0 - 8.9": "8.0-8.9",
  "7.0 - 7.9": "7.0-7.9",
  "6.0 - 6.9": "6.0-6.9",
  "Below 6.0": "Below 6.0",
};

export function CareerResults() {
  const location = useLocation();
  const navigate = useNavigate();
  const formData = location.state?.formData || {};

  const [loading, setLoading] = useState(true);
  const [selectedCareer, setSelectedCareer] = useState<string | null>(null);

  useEffect(() => {
    // Check if user already has a target career
    const checkProfile = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/profile/me");
        if (res.data?.targetCareer) {
          setSelectedCareer(res.data.targetCareer);
        }
      } catch (err) {
        console.error("No profile found");
      }
    };
    checkProfile();
  }, []);

  const handleSelectCareer = async (title: string) => {
    try {
      await axios.put("http://localhost:5000/api/profile", {
        targetCareer: title
      });
      setSelectedCareer(title);
      alert(`Success! ${title} has been set as your target career.`);
    } catch (err) {
      console.error("Failed to save selection");
    }
  };
  const [primaryCareer, setPrimaryCareer] = useState<any>(null);
  const [alternativeCareers, setAlternativeCareers] = useState<any[]>([]);
  const [skillRoadmap, setSkillRoadmap] = useState<any[]>([]);

  useEffect(() => {
    async function fetchRecommendation() {
      try {
        const mappedBranch = BRANCH_TO_MODEL[formData.branch] || formData.branch || "CSE";
        const mappedSpec = formData.specialization
          ? (SPEC_MAP[formData.specialization] || formData.specialization)
          : (SPEC_MAP[formData.branch] || "Software Engineering");
        const mappedYear = YEAR_MAP[formData.year] || formData.year || "3";
        const mappedCGPA = CGPA_MAP[formData.cgpa] || formData.cgpa || "7.5-8.4";

        // Extract clean skill names from skill ratings if available
        const skillNames = formData.skillRatings
          ? Object.keys(formData.skillRatings)
          : (formData.skills || []).map((s: string) => s.replace(/\s*\(.*\)/, ''));

        const payload = {
          Branch: mappedBranch,
          Specialization: mappedSpec,
          Year: mappedYear,
          CGPA_Range: mappedCGPA,
          Primary_Skill: skillNames[0] || "Programming",
          Secondary_Skill: skillNames[1] || "Algorithms",
          Projects_Done: parseInt(formData.projects) || 2,
          Certifications: parseInt(formData.certifications) || 1,
          Hardware_or_Software: "Software",
          Work_Style: formData.workPreference || "Team",
          Task_Type: "Development",
          Preferred_Environment: formData.environment || "Office",
          Remote_Preference: formData.remotePreference || "Hybrid",
          Career_Goal: formData.postBTechGoal || "Job",
          Target_Sector: "IT",
          Willing_to_Relocate: "Yes",
          Expected_Salary: formData.salaryExpectation || "10-15 LPA",
          Internship_Interest: "Yes",
          Communication_Level: formData.softSkills?.includes("Communication") ? "Excellent" : "Good",
          Leadership_Experience: formData.softSkills?.includes("Leadership") ? "Yes" : "No",
          Problem_Solving_Style: formData.softSkills?.includes("Problem Solving") ? "Analytical" : "Creative",
        };

        const res = await axios.post("http://localhost:5000/api/ml/recommend", payload);
        const data = res.data;
        
        const primaryData = {
          title: data.recommendation || "Software Engineer",
          description: "Based on our AI model prediction",
          confidence: data.confidence || 85,
          topSkill: payload.Primary_Skill,
          sector: "IT Sector",
          salary: payload.Expected_Salary
        };
        setPrimaryCareer(primaryData);
        
        // Use real alternatives from the ML service if available
        let alts: any[] = [];
        if (data.alternatives && data.alternatives.length > 0) {
          alts = data.alternatives.map((alt: any) => ({
            title: alt.title,
            description: `AI-predicted career path`,
            match: Math.round(alt.confidence)
          }));
        } else {
          alts = getAlternativeCareers(formData);
        }
        setAlternativeCareers(alts);
        setSkillRoadmap(getSkillRoadmap(formData));

        // ✅ Save recommendedCareers to profile so Dashboard updates
        try {
          const careersToSave = [
            { title: primaryData.title, confidence: primaryData.confidence, description: primaryData.description },
            ...alts.map((a: any) => ({ title: a.title, confidence: a.match, description: a.description || '' }))
          ];
          await axios.put("http://localhost:5000/api/profile", {
            recommendedCareers: careersToSave
          });
        } catch (saveErr) {
          console.error("Could not save recommended careers to profile", saveErr);
        }
      } catch (err) {
        console.error("Error fetching recommendation:", err);
        const fallbackPrimary = getPrimaryCareer(formData);
        const fallbackAlts = getAlternativeCareers(formData);
        setPrimaryCareer(fallbackPrimary);
        setAlternativeCareers(fallbackAlts);
        setSkillRoadmap(getSkillRoadmap(formData));
        // Save fallback careers to profile too
        try {
          const careersToSave = [
            { title: fallbackPrimary.title, confidence: fallbackPrimary.confidence, description: fallbackPrimary.description },
            ...fallbackAlts.map((a: any) => ({ title: a.title, confidence: a.match, description: a.description || '' }))
          ];
          await axios.put("http://localhost:5000/api/profile", { recommendedCareers: careersToSave });
        } catch (saveErr) {
          console.error("Could not save fallback careers to profile", saveErr);
        }
      } finally {
        setLoading(false);
      }
    }

    fetchRecommendation();
  }, [formData]);

  if (loading || !primaryCareer) {
    return (
      <div className="w-full flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-foreground animate-pulse">Analyzing your profile...</p>
      </div>
    );
  }

  return (
    <div className="w-full py-12 px-6">
      <div className="max-w-6xl mx-auto relative">
        {/* Back Button */}
        <button 
          onClick={() => navigate(-1)}
          className="absolute top-0 left-0 p-2 text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back</span>
        </button>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-indigo-500 mb-4 animate-pulse">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl text-foreground mb-3">Your Career Match</h1>
          <p className="text-xl text-muted-foreground">Based on your profile and preferences</p>
        </motion.div>

        {/* Primary Recommendation */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="p-8 rounded-2xl bg-gradient-to-br from-primary/20 to-indigo-500/20 border border-primary/30 backdrop-blur-xl mb-8"
        >
          <div className="flex items-start justify-between mb-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-success/20 border border-success/30 text-success text-sm mb-4">
                <Award className="w-4 h-4" />
                Best Match
              </div>
              <h2 className="text-3xl md:text-4xl bg-gradient-to-r from-primary to-indigo-500 bg-clip-text text-transparent mb-2">
                {primaryCareer.title}
              </h2>
              <p className="text-muted-foreground text-lg">{primaryCareer.description}</p>
            </div>
            <button
              onClick={() => handleSelectCareer(primaryCareer.title)}
              className={`px-6 py-3 rounded-xl font-medium transition-all ${
                selectedCareer === primaryCareer.title
                  ? "bg-success text-white"
                  : "bg-primary text-white hover:bg-primary/90"
              }`}
            >
              {selectedCareer === primaryCareer.title ? "Target Role Set" : "Select as Target Role"}
            </button>
          </div>

          {/* Confidence Bar */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-foreground">Match Confidence</span>
              <span className="text-primary">{primaryCareer.confidence}%</span>
            </div>
            <div className="h-3 rounded-full bg-muted overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${primaryCareer.confidence}%` }}
                transition={{ delay: 0.5, duration: 1 }}
                className="h-full bg-gradient-to-r from-primary to-indigo-500 rounded-full"
              />
            </div>
          </div>

          {/* Key Info */}
          <div className="grid md:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg bg-card border border-border">
              <p className="text-sm text-muted-foreground mb-1">Top Skill Needed</p>
              <p className="text-foreground">{primaryCareer.topSkill}</p>
            </div>
            <div className="p-4 rounded-lg bg-card border border-border">
              <p className="text-sm text-muted-foreground mb-1">Best Sector</p>
              <p className="text-foreground">{primaryCareer.sector}</p>
            </div>
            <div className="p-4 rounded-lg bg-card border border-border">
              <p className="text-sm text-muted-foreground mb-1">Avg. Starting Salary</p>
              <p className="text-foreground">{primaryCareer.salary}</p>
            </div>
          </div>
        </motion.div>

        {/* Alternative Careers */}
        <div className="mb-8">
          <h3 className="text-2xl text-foreground mb-4">Alternative Career Paths</h3>
          <div className="grid md:grid-cols-3 gap-4">
            {alternativeCareers.map((career, index) => (
              <motion.div
                key={career.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                className="p-6 rounded-xl bg-card border border-border hover:border-primary transition-all"
              >
                <h4 className="text-lg text-foreground mb-2">{career.title}</h4>
                <p className="text-muted-foreground text-sm mb-4">{career.description}</p>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs text-muted-foreground">Match: {career.match}%</span>
                  <div className="w-16 h-1.5 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full"
                      style={{ width: `${career.match}%` }}
                    />
                  </div>
                </div>
                <button
                  onClick={() => handleSelectCareer(career.title)}
                  className={`w-full py-2 rounded-lg text-sm transition-all ${
                    selectedCareer === career.title
                      ? "bg-success text-white"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  {selectedCareer === career.title ? "Selected" : "Select Path"}
                </button>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Skill Roadmap */}
        <div className="grid lg:grid-cols-3 gap-8 mb-8">
          <div className="lg:col-span-2">
            <h3 className="text-2xl text-foreground mb-4">Your Skill Roadmap</h3>
            <div className="space-y-4">
              {skillRoadmap.map((item, index) => (
                <motion.div
                  key={item.phase}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                  className="flex gap-4"
                >
                  <div className="flex flex-col items-center">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-indigo-500 flex items-center justify-center">
                      <span className="text-white">{index + 1}</span>
                    </div>
                    {index < skillRoadmap.length - 1 && (
                      <div className="w-0.5 flex-1 bg-slate-200 mt-2" />
                    )}
                  </div>
                  <div className="flex-1 pb-6">
                    <div className="p-4 rounded-lg bg-card border border-border">
                      <h4 className="text-foreground mb-1">{item.phase}</h4>
                      <p className="text-sm text-muted-foreground mb-3">{item.duration}</p>
                      <div className="flex flex-wrap gap-2">
                        {item.skills.map((skill: string) => (
                          <span
                            key={skill}
                            className="px-3 py-1 rounded-full bg-primary/20 border border-primary/30 text-primary text-sm"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-2xl text-foreground mb-4">Next Steps</h3>
            <div className="space-y-3">
              <Link
                to="/resume"
                className="flex items-center gap-3 p-4 rounded-lg bg-card border border-border hover:border-primary hover:bg-primary/5 transition-all group"
              >
                <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center group-hover:bg-primary transition-all">
                  <FileText className="w-5 h-5 text-primary group-hover:text-white transition-all" />
                </div>
                <div className="flex-1">
                  <h4 className="text-foreground">Analyze Resume</h4>
                  <p className="text-sm text-muted-foreground">Get ATS score</p>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
              </Link>

              <Link
                to="/chatbot"
                className="flex items-center gap-3 p-4 rounded-lg bg-card border border-border hover:border-primary hover:bg-primary/5 transition-all group"
              >
                <div className="w-10 h-10 rounded-lg bg-secondary/20 flex items-center justify-center group-hover:bg-secondary transition-all">
                  <MessageSquare className="w-5 h-5 text-secondary group-hover:text-white transition-all" />
                </div>
                <div className="flex-1">
                  <h4 className="text-foreground">Talk to Mentor</h4>
                  <p className="text-sm text-muted-foreground">Ask questions</p>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function getPrimaryCareer(formData: any) {
  // Mock AI logic - in real app, this would be ML-based
  const careers: Record<string, any> = {
    "Computer Science & Engineering": {
      title: "Full Stack Developer",
      description: "Build end-to-end web applications using modern frameworks",
      confidence: 92,
      topSkill: "React & Node.js",
      sector: "Tech / Product Companies",
      salary: "12-18 LPA"
    },
    "Electrical Engineering": {
      title: "Power Systems Engineer",
      description: "Design and optimize electrical power distribution systems",
      confidence: 88,
      topSkill: "Power Electronics",
      sector: "Energy / Utilities",
      salary: "8-12 LPA"
    },
    "Mechanical Engineering": {
      title: "Product Design Engineer",
      description: "Create and optimize mechanical product designs using CAD",
      confidence: 85,
      topSkill: "SolidWorks / AutoCAD",
      sector: "Manufacturing / Automotive",
      salary: "7-11 LPA"
    }
  };

  return careers[formData.branch] || {
    title: "Software Engineer",
    description: "Develop software solutions for business problems",
    confidence: 85,
    topSkill: "Programming",
    sector: "IT Services",
    salary: "10-15 LPA"
  };
}

function getAlternativeCareers(formData: any) {
  return [
    {
      title: "Data Analyst",
      description: "Analyze data to drive business decisions",
      match: 78
    },
    {
      title: "Product Manager",
      description: "Lead product development and strategy",
      match: 72
    },
    {
      title: "DevOps Engineer",
      description: "Automate and optimize development workflows",
      match: 68
    }
  ];
}

function getSkillRoadmap(formData: any) {
  return [
    {
      phase: "Foundation (Month 1-2)",
      duration: "2 months",
      skills: ["Core Programming", "Data Structures", "Git"]
    },
    {
      phase: "Intermediate (Month 3-4)",
      duration: "2 months",
      skills: ["Web Development", "Databases", "API Design"]
    },
    {
      phase: "Advanced (Month 5-6)",
      duration: "2 months",
      skills: ["System Design", "Cloud Services", "Testing"]
    },
    {
      phase: "Specialization (Month 7+)",
      duration: "Ongoing",
      skills: ["Advanced Frameworks", "Performance", "Security"]
    }
  ];
}
