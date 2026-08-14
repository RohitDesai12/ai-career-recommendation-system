import { Briefcase, Building, Home, Users } from "lucide-react";

interface Step4Props {
  data: any;
  updateData: (data: any) => void;
}

const WORK_PREFERENCES = [
  {
    id: "individual",
    title: "Individual Contributor",
    description: "Work independently on specialized tasks",
    icon: Users,
  },
  {
    id: "team",
    title: "Team Player",
    description: "Collaborate closely with team members",
    icon: Users,
  },
  {
    id: "leadership",
    title: "Leadership Role",
    description: "Lead teams and manage projects",
    icon: Briefcase,
  },
];

const ENVIRONMENTS = [
  {
    id: "corporate",
    title: "Corporate",
    description: "Large established companies",
    icon: Building,
  },
  {
    id: "startup",
    title: "Startup",
    description: "Fast-paced, innovative environment",
    icon: Briefcase,
  },
  {
    id: "freelance",
    title: "Freelance",
    description: "Independent consulting work",
    icon: Home,
  },
];

const REMOTE_OPTIONS = [
  { id: "office", label: "Office Only" },
  { id: "hybrid", label: "Hybrid (3-4 days office)" },
  { id: "remote", label: "Fully Remote" },
  { id: "flexible", label: "Flexible" },
];

export function Step4WorkStyle({ data, updateData }: Step4Props) {
  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-indigo-500 flex items-center justify-center">
          <Briefcase className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-2xl text-foreground">Work Style</h2>
          <p className="text-muted-foreground">How do you prefer to work?</p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Work Preference */}
        <div>
          <label className="block text-foreground mb-3">Work Preference</label>
          <div className="grid gap-3">
            {WORK_PREFERENCES.map((pref) => {
              const Icon = pref.icon;
              return (
                <button
                  key={pref.id}
                  onClick={() => updateData({ workPreference: pref.id })}
                  className={`flex items-start gap-4 p-4 rounded-lg border transition-all text-left ${
                    data.workPreference === pref.id
                      ? "bg-primary/10 border-primary"
                      : "bg-muted border-border hover:border-primary"
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      data.workPreference === pref.id
                        ? "bg-primary"
                        : "bg-slate-200"
                    }`}
                  >
                    <Icon
                      className={`w-5 h-5 ${
                        data.workPreference === pref.id ? "text-white" : "text-muted-foreground"
                      }`}
                    />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-foreground mb-1">{pref.title}</h4>
                    <p className="text-sm text-muted-foreground">{pref.description}</p>
                  </div>
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      data.workPreference === pref.id
                        ? "border-primary"
                        : "border-border"
                    }`}
                  >
                    {data.workPreference === pref.id && (
                      <div className="w-2.5 h-2.5 rounded-full bg-primary" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Environment */}
        <div>
          <label className="block text-foreground mb-3">Preferred Environment</label>
          <div className="grid gap-3">
            {ENVIRONMENTS.map((env) => {
              const Icon = env.icon;
              return (
                <button
                  key={env.id}
                  onClick={() => updateData({ environment: env.id })}
                  className={`flex items-start gap-4 p-4 rounded-lg border transition-all text-left ${
                    data.environment === env.id
                      ? "bg-primary/10 border-primary"
                      : "bg-muted border-border hover:border-primary"
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      data.environment === env.id ? "bg-primary" : "bg-slate-200"
                    }`}
                  >
                    <Icon
                      className={`w-5 h-5 ${
                        data.environment === env.id ? "text-white" : "text-muted-foreground"
                      }`}
                    />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-foreground mb-1">{env.title}</h4>
                    <p className="text-sm text-muted-foreground">{env.description}</p>
                  </div>
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      data.environment === env.id
                        ? "border-primary"
                        : "border-border"
                    }`}
                  >
                    {data.environment === env.id && (
                      <div className="w-2.5 h-2.5 rounded-full bg-primary" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Remote Preference */}
        <div>
          <label className="block text-foreground mb-3">Remote Work Preference</label>
          <div className="grid grid-cols-2 gap-3">
            {REMOTE_OPTIONS.map((option) => (
              <button
                key={option.id}
                onClick={() => updateData({ remotePreference: option.id })}
                className={`px-4 py-3 rounded-lg border transition-all ${
                  data.remotePreference === option.id
                    ? "bg-primary border-primary text-white"
                    : "bg-muted border-border text-foreground hover:border-primary"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
