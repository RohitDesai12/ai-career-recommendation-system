import { GraduationCap } from "lucide-react";

interface Step1Props {
  data: any;
  updateData: (data: any) => void;
}

const BRANCHES = {
  "Computer Science & IT": [
    "Computer Science & Engineering",
    "Information Technology",
    "Software Engineering",
    "Data Science",
  ],
  "Electronics & Communication": [
    "Electronics & Communication Engineering",
    "Electronics Engineering",
    "VLSI Design",
    "Embedded Systems",
  ],
  "Electrical & Power": [
    "Electrical Engineering",
    "Electrical & Electronics Engineering",
    "Power Engineering",
  ],
  "Mechanical & Manufacturing": [
    "Mechanical Engineering",
    "Manufacturing Engineering",
    "Automotive Engineering",
    "Aerospace Engineering",
  ],
  "Civil & Infrastructure": [
    "Civil Engineering",
    "Construction Engineering",
    "Transportation Engineering",
  ],
};

export function Step1Academic({ data, updateData }: Step1Props) {
  const handleBranchChange = (branch: string) => {
    updateData({ branch, specialization: "" });
  };

  const getSpecializations = () => {
    for (const [category, branches] of Object.entries(BRANCHES)) {
      if (branches.includes(data.branch)) {
        return branches;
      }
    }
    return [];
  };

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-indigo-500 flex items-center justify-center">
          <GraduationCap className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-2xl text-foreground">Academic Background</h2>
          <p className="text-muted-foreground">Tell us about your engineering education</p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Branch Selection */}
        <div>
          <label className="block text-foreground mb-2">Branch / Stream</label>
          <select
            value={data.branch}
            onChange={(e) => handleBranchChange(e.target.value)}
            className="w-full px-4 py-3 rounded-lg bg-muted border border-border text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-[#4F8EF7]/20 transition-all"
          >
            <option value="">Select your branch</option>
            {Object.entries(BRANCHES).map(([category, branches]) => (
              <optgroup key={category} label={category}>
                {branches.map((branch) => (
                  <option key={branch} value={branch}>
                    {branch}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>

        {/* Specialization */}
        {data.branch && (
          <div>
            <label className="block text-foreground mb-2">Specialization (Optional)</label>
            <select
              value={data.specialization}
              onChange={(e) => updateData({ specialization: e.target.value })}
              className="w-full px-4 py-3 rounded-lg bg-muted border border-border text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-[#4F8EF7]/20 transition-all"
            >
              <option value="">No specific specialization</option>
              {getSpecializations().map((spec) => (
                <option key={spec} value={spec}>
                  {spec}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Year */}
        <div>
          <label className="block text-foreground mb-2">Current Year</label>
          <div className="grid grid-cols-4 gap-3">
            {["1st Year", "2nd Year", "3rd Year", "4th Year"].map((year) => (
              <button
                key={year}
                onClick={() => updateData({ year })}
                className={`px-4 py-3 rounded-lg border transition-all ${
                  data.year === year
                    ? "bg-primary border-primary text-white"
                    : "bg-muted border-border text-foreground hover:border-primary"
                }`}
              >
                {year}
              </button>
            ))}
          </div>
        </div>

        {/* CGPA */}
        <div>
          <label className="block text-foreground mb-2">CGPA / Percentage Range</label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {["9.0 - 10.0", "8.0 - 8.9", "7.0 - 7.9", "6.0 - 6.9", "Below 6.0"].map((range) => (
              <button
                key={range}
                onClick={() => updateData({ cgpa: range })}
                className={`px-4 py-3 rounded-lg border transition-all ${
                  data.cgpa === range
                    ? "bg-primary border-primary text-white"
                    : "bg-muted border-border text-foreground hover:border-primary"
                }`}
              >
                {range}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
