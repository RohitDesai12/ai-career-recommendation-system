import React, { useState, useMemo } from "react";
import {
  Search, ArrowLeft, ArrowRight, CheckCircle2, Circle, Play,
  Code2, Layers, Brain, MessageSquare, Building2, Clock,
  Users, TrendingUp, ChevronRight, Star, BookOpen
} from "lucide-react";

const FONT_IMPORT = `@import url('https://fonts.googleapis.com/css2?family=Sora:wght@500;600;700&family=Inter:wght@400;500;600&display=swap');`;

// ---------- data ----------

const TYPE_ROUNDS = {
  Product: ["Online assessment", "Technical — DSA", "Technical — system design", "Hiring manager / HR"],
  Service: ["Aptitude test", "Technical interview", "HR interview"],
};

function hash(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0;
  return h;
}
function seeded(str, min, max) {
  return min + (hash(str) % (max - min + 1));
}

function makeRole(company, title, level) {
  const seed = company.name + title + level;
  const easy = seeded(seed + "e", 25, 40);
  const hard = seeded(seed + "h", 12, 24);
  const medium = 100 - easy - hard;
  return {
    id: (title + level).toLowerCase().replace(/[^a-z0-9]+/g, "-"),
    title,
    level,
    match: seeded(seed + "m", 48, 88),
    counts: {
      dsa: seeded(seed + "1", 60, 160),
      system: company.type === "Product" ? seeded(seed + "2", 10, 30) : 0,
      fundamentals: seeded(seed + "3", 20, 45),
      hr: seeded(seed + "4", 12, 24),
      specific: seeded(seed + "5", 6, 18),
    },
    difficulty: { easy, medium, hard },
  };
}

function makeCompany(name, initials, color, type, roles, blurb) {
  const c = { id: name.toLowerCase().replace(/\s+/g, "-"), name, initials, color, type, blurb };
  c.roles = roles.map(([t, l]) => makeRole(c, t, l));
  return c;
}

const COMPANIES = [
  makeCompany("Google", "G", "#3B6D11", "Product",
    [["Software engineer", "SDE-1"], ["Software engineer", "Intern"]],
    "Interview loops lean heavily on core DSA and clean coding under time pressure, with one round dedicated to how you approach ambiguous, open-ended problems."),
  makeCompany("Microsoft", "M", "#185FA5", "Product",
    [["Software engineer", "SDE-1"], ["Software engineer", "Intern"]],
    "Rounds mix data structures with practical system design, and interviewers often probe how you'd extend a solution once requirements change mid-conversation."),
  makeCompany("Amazon", "A", "#854F0B", "Product",
    [["SDE", "SDE-1"], ["SDE", "Intern"]],
    "Every round is scored against leadership principles as much as the code itself — be ready to walk through a real decision you made and why."),
  makeCompany("Adobe", "Ad", "#993556", "Product",
    [["Software engineer", "SDE-1"], ["Software engineer", "Intern"]],
    "Expect a strong product-thinking round alongside DSA — interviewers like candidates who ask clarifying questions before jumping to code."),
  makeCompany("Flipkart", "F", "#0C447C", "Product",
    [["SDE", "SDE-1"], ["SDE", "Intern"]],
    "Bar is high on problem-solving speed; a scale-oriented system design round shows up even for early-career roles."),
  makeCompany("Zoho", "Z", "#3B6D11", "Product",
    [["Software developer", "Entry level"]],
    "Known for a longer, written coding round before interviews even begin — depth in fundamentals matters more than breadth."),
  makeCompany("TCS", "T", "#0F6E56", "Service",
    [["Ninja", "Entry level"], ["Digital", "Entry level"]],
    "Aptitude and verbal sections filter heavily before the technical round, which stays close to fundamentals rather than hard DSA."),
  makeCompany("Infosys", "I", "#3C3489", "Service",
    [["Systems engineer", "Entry level"], ["Digital specialist", "Entry level"]],
    "Technical round covers your projects in real depth, so being able to defend design choices matters more than memorised answers."),
  makeCompany("Wipro", "W", "#712B13", "Service",
    [["Project engineer", "Entry level"]],
    "HR round weighs communication and adaptability heavily — panels often circle back to how you handle conflicting priorities."),
  makeCompany("Accenture", "Ac", "#993C1D", "Service",
    [["Associate software engineer", "Entry level"]],
    "Case-style HR questions are common, alongside a technical round that checks breadth across your resume rather than one deep topic."),
  makeCompany("Cognizant", "C", "#072D53", "Service",
    [["Programmer analyst", "Entry level"]],
    "Technical interviews stay conversational — walking through your logic out loud is weighed as much as reaching the right answer."),
  makeCompany("Deloitte", "D", "#72243E", "Service",
    [["Analyst", "Entry level"]],
    "Expect a case-based HR round testing structured thinking, paired with a lighter technical screen focused on fundamentals."),
];

const CATEGORY_META = [
  { key: "dsa", label: "Data structures & algorithms", icon: Code2, ramp: "#534AB7", bg: "#EEEDFE", text: "#3C3489" },
  { key: "system", label: "System design", icon: Layers, ramp: "#185FA5", bg: "#E6F1FB", text: "#0C447C" },
  { key: "fundamentals", label: "CS fundamentals", icon: Brain, ramp: "#0F6E56", bg: "#E1F5EE", text: "#085041" },
  { key: "hr", label: "HR & behavioral", icon: MessageSquare, ramp: "#993556", bg: "#FBEAF0", text: "#72243E" },
  { key: "specific", label: "Company-specific", icon: Building2, ramp: "#854F0B", bg: "#FAEEDA", text: "#633806" },
];

const SAMPLE_QUESTIONS = {
  dsa: [
    ["Find the longest substring without repeating characters", "Asked in R1", "Medium"],
    ["Detect a cycle in a linked list", "Frequently asked", "Easy"],
    ["Merge k sorted arrays efficiently", "Asked in R2", "Hard"],
  ],
  system: [
    ["Design a URL shortening service", "Asked in R2", "Medium"],
    ["Design a rate limiter for an API gateway", "Recently asked", "Hard"],
  ],
  fundamentals: [
    ["Explain normalization with an example", "Common opener", "Easy"],
    ["Process vs thread — where would you use each", "Frequently asked", "Medium"],
  ],
  hr: [
    ["Tell me about a time you disagreed with a teammate", "Almost always asked", "Easy"],
    ["Why this company, and why this role", "Almost always asked", "Easy"],
  ],
  specific: [
    ["Walk through a project on your resume in depth", "Asked in every round", "Medium"],
  ],
};

// ---------- small pieces ----------

function ReadinessRing({ value }) {
  const r = 42, c = 2 * Math.PI * r;
  const offset = c - (value / 100) * c;
  const color = value >= 70 ? "#0F6E56" : value >= 45 ? "#854F0B" : "#993C1D";
  return (
    <svg width="104" height="104" viewBox="0 0 104 104">
      <circle cx="52" cy="52" r={r} fill="none" stroke="#E4E0F0" strokeWidth="10" />
      <circle
        cx="52" cy="52" r={r} fill="none" stroke={color} strokeWidth="10"
        strokeDasharray={c} strokeDashoffset={offset} strokeLinecap="round"
        transform="rotate(-90 52 52)"
      />
      <text x="52" y="49" textAnchor="middle" fontSize="22" fontWeight="600" fill="#1E1B2E" fontFamily="Sora, sans-serif">{value}%</text>
      <text x="52" y="66" textAnchor="middle" fontSize="10" fill="#6B6579" fontFamily="Inter, sans-serif">ready</text>
    </svg>
  );
}

function DifficultyBar({ difficulty }) {
  return (
    <div style={{ display: "flex", height: 8, borderRadius: 999, overflow: "hidden", width: "100%" }}>
      <div style={{ width: `${difficulty.easy}%`, background: "#639922" }} />
      <div style={{ width: `${difficulty.medium}%`, background: "#EF9F27" }} />
      <div style={{ width: `${difficulty.hard}%`, background: "#E24B4A" }} />
    </div>
  );
}

// ---------- main ----------

export default function InterviewPrep() {
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");
  const [companyId, setCompanyId] = useState(null);
  const [roleId, setRoleId] = useState(null);
  const [activeCategory, setActiveCategory] = useState("dsa");

  const filtered = useMemo(() => {
    return COMPANIES.filter(c =>
      (typeFilter === "All" || c.type === typeFilter) &&
      c.name.toLowerCase().includes(query.toLowerCase())
    );
  }, [query, typeFilter]);

  const company = COMPANIES.find(c => c.id === companyId) || null;
  const role = company ? (company.roles.find(r => r.id === roleId) || company.roles[0]) : null;

  function openCompany(c) {
    setCompanyId(c.id);
    setRoleId(c.roles[0].id);
    setActiveCategory("dsa");
  }

  return (
    <div style={{
      fontFamily: "Inter, sans-serif", background: "#F7F5FC", color: "#1E1B2E",
      minHeight: "100%", padding: "28px 32px", boxSizing: "border-box"
    }}>
      <style>{FONT_IMPORT}</style>

      {!company && (
        <>
          <div style={{ marginBottom: 24 }}>
            <h1 style={{ fontFamily: "Sora, sans-serif", fontSize: 26, fontWeight: 600, margin: 0 }}>
              Interview prep
            </h1>
            <p style={{ color: "#6B6579", fontSize: 14, margin: "6px 0 0" }}>
              Pick a company and role to get a tailored question bank, mock interviews and round-by-round prep.
            </p>
          </div>

          <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
            <div style={{
              display: "flex", alignItems: "center", gap: 8, background: "#FFFFFF",
              border: "1px solid #E4E0F0", borderRadius: 10, padding: "10px 14px", flex: "1 1 260px"
            }}>
              <Search size={16} color="#6B6579" />
              <input
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search companies"
                style={{ border: "none", outline: "none", fontSize: 14, width: "100%", background: "transparent", color: "#1E1B2E" }}
              />
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              {["All", "Product", "Service"].map(t => (
                <button
                  key={t}
                  onClick={() => setTypeFilter(t)}
                  style={{
                    padding: "9px 16px", borderRadius: 10, fontSize: 13, fontWeight: 500, cursor: "pointer",
                    border: typeFilter === t ? "1px solid #6D28D9" : "1px solid #E4E0F0",
                    background: typeFilter === t ? "#EDE9FE" : "#FFFFFF",
                    color: typeFilter === t ? "#3C3489" : "#6B6579"
                  }}
                >
                  {t === "Service" ? "Service-based" : t}
                </button>
              ))}
            </div>
          </div>

          <div style={{
            display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 14
          }}>
            {filtered.map(c => (
              <button
                key={c.id}
                onClick={() => openCompany(c)}
                style={{
                  textAlign: "left", background: "#FFFFFF", border: "1px solid #E4E0F0",
                  borderRadius: 14, padding: 18, cursor: "pointer", display: "flex", flexDirection: "column", gap: 12
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{
                    width: 42, height: 42, borderRadius: 10, background: c.color,
                    color: "#FFFFFF", display: "flex", alignItems: "center", justifyContent: "center",
                    fontFamily: "Sora, sans-serif", fontWeight: 600, fontSize: 15
                  }}>{c.initials}</div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 15 }}>{c.name}</div>
                    <div style={{ fontSize: 12, color: "#6B6579" }}>{c.type === "Service" ? "Service-based" : "Product"}</div>
                  </div>
                </div>
                <div style={{ fontSize: 12, color: "#6B6579" }}>{c.roles.length} role{c.roles.length > 1 ? "s" : ""} available</div>
                <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12.5, fontWeight: 500, color: "#6D28D9" }}>
                  View prep <ChevronRight size={14} />
                </div>
              </button>
            ))}
          </div>
        </>
      )}

      {company && role && (
        <>
          <button
            onClick={() => { setCompanyId(null); setRoleId(null); }}
            style={{
              display: "flex", alignItems: "center", gap: 6, background: "none", border: "none",
              color: "#6B6579", fontSize: 13, cursor: "pointer", padding: 0, marginBottom: 18
            }}
          >
            <ArrowLeft size={15} /> All companies
          </button>

          <div style={{ display: "grid", gridTemplateColumns: "260px 1fr", gap: 20, alignItems: "start" }}>
            {/* left rail */}
            <div style={{ background: "#FFFFFF", border: "1px solid #E4E0F0", borderRadius: 14, padding: 18 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                <div style={{
                  width: 38, height: 38, borderRadius: 10, background: company.color,
                  color: "#FFFFFF", display: "flex", alignItems: "center", justifyContent: "center",
                  fontFamily: "Sora, sans-serif", fontWeight: 600, fontSize: 14
                }}>{company.initials}</div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 15 }}>{company.name}</div>
                  <div style={{ fontSize: 12, color: "#6B6579" }}>{company.type === "Service" ? "Service-based" : "Product"}</div>
                </div>
              </div>

              <div style={{ fontSize: 11.5, fontWeight: 600, color: "#6B6579", margin: "0 0 8px" }}>ROLES</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 18 }}>
                {company.roles.map(r => (
                  <button
                    key={r.id}
                    onClick={() => setRoleId(r.id)}
                    style={{
                      textAlign: "left", padding: "9px 10px", borderRadius: 9, cursor: "pointer",
                      border: "none", fontSize: 13.5,
                      background: r.id === role.id ? "#EDE9FE" : "transparent",
                      color: r.id === role.id ? "#3C3489" : "#1E1B2E",
                      fontWeight: r.id === role.id ? 600 : 400
                    }}
                  >
                    {r.title}
                    <div style={{ fontSize: 11.5, color: r.id === role.id ? "#534AB7" : "#6B6579" }}>{r.level}</div>
                  </button>
                ))}
              </div>

              <div style={{ fontSize: 11.5, fontWeight: 600, color: "#6B6579", margin: "0 0 8px" }}>INTERVIEW PROCESS</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {TYPE_ROUNDS[company.type].map((step, i) => (
                  <div key={step} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{
                      width: 20, height: 20, borderRadius: "50%", background: "#EEEDFE", color: "#534AB7",
                      display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 600, flexShrink: 0
                    }}>{i + 1}</div>
                    <div style={{ fontSize: 12.5, color: "#1E1B2E" }}>{step}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* main hub */}
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={{
                background: "#FFFFFF", border: "1px solid #E4E0F0", borderRadius: 14, padding: 20,
                display: "flex", justifyContent: "space-between", alignItems: "center", gap: 20
              }}>
                <div>
                  <h2 style={{ fontFamily: "Sora, sans-serif", fontSize: 19, fontWeight: 600, margin: "0 0 4px" }}>
                    {role.title} · {role.level}
                  </h2>
                  <p style={{ fontSize: 13, color: "#6B6579", margin: "0 0 14px", maxWidth: 440 }}>{company.blurb}</p>
                  <div style={{ display: "flex", gap: 10 }}>
                    <button style={{
                      display: "flex", alignItems: "center", gap: 7, background: "#6D28D9", color: "#FFFFFF",
                      border: "none", borderRadius: 9, padding: "10px 16px", fontSize: 13.5, fontWeight: 600, cursor: "pointer"
                    }}>
                      <Play size={14} /> Start mock interview
                    </button>
                    <button style={{
                      display: "flex", alignItems: "center", gap: 7, background: "#FFFFFF", color: "#3C3489",
                      border: "1px solid #E4E0F0", borderRadius: 9, padding: "10px 16px", fontSize: 13.5, fontWeight: 600, cursor: "pointer"
                    }}>
                      <BookOpen size={14} /> Practice questions
                    </button>
                  </div>
                </div>
                <ReadinessRing value={role.match} />
              </div>

              <div style={{
                background: "#FFFFFF", border: "1px solid #E4E0F0", borderRadius: 14, padding: 18
              }}>
                <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 14 }}>Question bank</div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 10 }}>
                  {CATEGORY_META.filter(cat => role.counts[cat.key] > 0).map(cat => {
                    const Icon = cat.icon;
                    const active = activeCategory === cat.key;
                    return (
                      <button
                        key={cat.key}
                        onClick={() => setActiveCategory(cat.key)}
                        style={{
                          textAlign: "left", padding: 12, borderRadius: 10, cursor: "pointer",
                          border: active ? `1px solid ${cat.ramp}` : "1px solid #E4E0F0",
                          background: active ? cat.bg : "#FFFFFF"
                        }}
                      >
                        <Icon size={16} color={cat.text} />
                        <div style={{ fontSize: 12.5, fontWeight: 600, margin: "8px 0 2px", color: "#1E1B2E" }}>{role.counts[cat.key]}</div>
                        <div style={{ fontSize: 11.5, color: "#6B6579", lineHeight: 1.3 }}>{cat.label}</div>
                      </button>
                    );
                  })}
                </div>

                <div style={{ marginTop: 18 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11.5, color: "#6B6579", marginBottom: 6 }}>
                    <span>Difficulty mix</span>
                    <span>{role.difficulty.easy}% easy · {role.difficulty.medium}% medium · {role.difficulty.hard}% hard</span>
                  </div>
                  <DifficultyBar difficulty={role.difficulty} />
                </div>
              </div>

              <div style={{ background: "#FFFFFF", border: "1px solid #E4E0F0", borderRadius: 14, padding: 18 }}>
                <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 12 }}>
                  {CATEGORY_META.find(c => c.key === activeCategory)?.label}
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {(SAMPLE_QUESTIONS[activeCategory] || []).map(([q, tag, diff], i) => (
                    <div key={i} style={{
                      display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12,
                      padding: "10px 12px", borderRadius: 9, border: "1px solid #E4E0F0"
                    }}>
                      <div style={{ fontSize: 13, color: "#1E1B2E" }}>{q}</div>
                      <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                        <span style={{ fontSize: 11, color: "#6B6579", background: "#F1EFE8", padding: "3px 8px", borderRadius: 999 }}>{tag}</span>
                        <span style={{
                          fontSize: 11, padding: "3px 8px", borderRadius: 999,
                          color: diff === "Easy" ? "#173404" : diff === "Medium" ? "#412402" : "#501313",
                          background: diff === "Easy" ? "#EAF3DE" : diff === "Medium" ? "#FAEEDA" : "#FCEBEB"
                        }}>{diff}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
