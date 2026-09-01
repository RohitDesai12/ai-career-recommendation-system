import { Trophy, GraduationCap, Briefcase, Building2, DollarSign } from "lucide-react";

interface Step5Props {
  data: any;
  updateData: (data: any) => void;
}

const POST_BTECH_GOALS = [
  {
    id: "job",
    title: "Get a Job",
    description: "Start working immediately after graduation",
    icon: Briefcase,
  },
  {
    id: "masters",
    title: "Pursue Masters",
    description: "MS/MTech in India or abroad",
    icon: GraduationCap,
  },
  {
    id: "mba",
    title: "MBA",
    description: "Management studies for leadership roles",
    icon: Building2,
  },
  {
    id: "startup",
    title: "Start a Business",
    description: "Launch your own venture",
    icon: Trophy,
  },
];

const SALARY_RANGES = [
  "Below 5 LPA",
  "5-10 LPA",
  "10-15 LPA",
  "15-20 LPA",
  "20+ LPA",
];

const SOFT_SKILLS = [
  "Communication",
  "Problem Solving",
  "Leadership",
  "Teamwork",
  "Adaptability",
  "Time Management",
  "Critical Thinking",
  "Creativity",
];

export function Step5Goals({ data, updateData }: Step5Props) {
  const toggleSoftSkill = (skill: string) => {
    const softSkills = data.softSkills || [];
    if (softSkills.includes(skill)) {
      updateData({ softSkills: softSkills.filter((s: string) => s !== skill) });
    } else {
      updateData({ softSkills: [...softSkills, skill] });
    }
  };

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-sm">
          <Trophy className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-2xl text-foreground font-bold">Goals & Aspirations</h2>
          <p className="text-muted-foreground">What are your career goals?</p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Post-BTech Goal */}
        <div>
          <label className="block text-foreground mb-3">Primary Goal After BTech</label>
          <div className="grid md:grid-cols-2 gap-3">
            {POST_BTECH_GOALS.map((goal) => {
              const Icon = goal.icon;
              return (
                <button
                  key={goal.id}
                  onClick={() => updateData({ postBTechGoal: goal.id })}
                  className={`flex items-start gap-4 p-4 rounded-lg border transition-all text-left ${
                    data.postBTechGoal === goal.id
                      ? "bg-primary/10 border-primary"
                      : "bg-muted border-border hover:border-primary"
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      data.postBTechGoal === goal.id ? "bg-primary" : "bg-slate-200"
                    }`}
                  >
                    <Icon
                      className={`w-5 h-5 ${
                        data.postBTechGoal === goal.id ? "text-white" : "text-muted-foreground"
                      }`}
                    />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-foreground mb-1">{goal.title}</h4>
                    <p className="text-sm text-muted-foreground">{goal.description}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Salary Expectation */}
        <div>
          <label className="block text-foreground mb-3">
            <div className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-primary" />
              Expected Salary Range (First Job)
            </div>
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {SALARY_RANGES.map((range) => (
              <button
                key={range}
                onClick={() => updateData({ salaryExpectation: range })}
                className={`px-4 py-3 rounded-lg border transition-all ${
                  data.salaryExpectation === range
                    ? "bg-primary border-primary text-white"
                    : "bg-muted border-border text-foreground hover:border-primary"
                }`}
              >
                {range}
              </button>
            ))}
          </div>
        </div>

        {/* Soft Skills */}
        <div>
          <label className="block text-foreground mb-3">Your Strongest Soft Skills (Select up to 3)</label>
          <div className="flex flex-wrap gap-2">
            {SOFT_SKILLS.map((skill) => (
              <button
                key={skill}
                onClick={() => toggleSoftSkill(skill)}
                disabled={
                  !data.softSkills?.includes(skill) && (data.softSkills?.length || 0) >= 3
                }
                className={`px-4 py-2 rounded-full border transition-all ${
                  data.softSkills?.includes(skill)
                    ? "bg-primary border-primary text-white"
                    : "bg-muted border-border text-foreground hover:border-primary disabled:opacity-50 disabled:cursor-not-allowed"
                }`}
              >
                {skill}
              </button>
            ))}
          </div>
          {data.softSkills?.length > 0 && (
            <p className="text-sm text-muted-foreground mt-2">
              Selected: {data.softSkills.length}/3
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
