import { useState } from "react";
import "./step2.css";

interface Step2Props {
  data: any;
  updateData: (data: any) => void;
}

const LEVEL_SCORES: Record<string, number> = {beginner:25, familiar:50, proficient:75, expert:90};
const LEVEL_COLORS: Record<string, string> = {beginner:'#E24B4A', familiar:'#EF9F27', proficient:'#378ADD', expert:'#1D9E75'};

const BRANCH_SKILLS_MAP: Record<string, string[]> = {
  "Computer Science & IT": [
    "Python", "Java", "C++", "JavaScript", "React", "Node.js", "SQL", 
    "TensorFlow", "Docker", "Git", "AWS", "Kubernetes", "PyTorch", "Machine Learning"
  ],
  "Electronics & Communication": [
    "Verilog / VHDL", "Embedded C", "Microcontrollers", "RTOS", "DSP / Signal Processing", 
    "MATLAB", "PCB Design", "Circuit Simulation", "FPGA Programming", "Python", "C++", 
    "IoT Protocols", "Wireless Communication"
  ],
  "Electrical & Power": [
    "Power Systems Analysis", "Electrical Machines", "Control Systems", "MATLAB / Simulink", 
    "PLC Programming", "SCADA Systems", "Renewable Energy", "Circuit Design", 
    "Power Electronics", "Smart Grid Tech", "High Voltage Engineering"
  ],
  "Mechanical & Manufacturing": [
    "CAD Modeling", "Finite Element Analysis (FEA)", "CFD (Fluid Dynamics)", "Thermodynamics", 
    "Materials Science", "CNC Programming", "Kinematics & Dynamics", "3D Printing", 
    "Aerodynamics", "Solid Mechanics", "Robotics & Automation"
  ],
  "Civil & Infrastructure": [
    "Structural Analysis", "Concrete Technology", "Geotechnical Eng", "Surveying & Levelling", 
    "Transportation Planning", "Hydraulics & Water", "Construction Management", 
    "Estimation & Costing", "Environmental Eng"
  ]
};

const BRANCH_TOOLS_MAP: Record<string, string[]> = {
  "Computer Science & IT": [
    "Linux", "GitHub", "VS Code", "Postman", "Figma", "MongoDB", "Firebase", "REST API", "CI/CD"
  ],
  "Electronics & Communication": [
    "Multisim", "LTspice", "KiCad / Altium", "Xilinx Vivado", "Arduino IDE", "Keil uVision", "Oscilloscope", "Logic Analyzer"
  ],
  "Electrical & Power": [
    "Simulink", "ETAP", "AutoCAD Electrical", "LabVIEW", "Arduino IDE", "Siemens TIA Portal", "Multimeter / Clamp meter"
  ],
  "Mechanical & Manufacturing": [
    "SolidWorks", "Autodesk Fusion 360", "ANSYS", "MATLAB", "AutoCAD", "CATIA", "3D Printer slicer", "CNC simulator"
  ],
  "Civil & Infrastructure": [
    "AutoCAD", "STAAD.Pro", "Revit", "SAP2000", "MS Project", "GIS (QGIS/ArcGIS)", "Total Station", "Excel (Advanced)"
  ]
};

const getCategoryForBranch = (branch: string): string => {
  const BRANCH_CATEGORIES: Record<string, string[]> = {
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

  for (const [category, branches] of Object.entries(BRANCH_CATEGORIES)) {
    if (branches.includes(branch)) {
      return category;
    }
  }
  return "Computer Science & IT";
};

export function Step2Skills({ data, updateData }: Step2Props) {
  const category = getCategoryForBranch(data.branch);
  const ALL_SKILLS = BRANCH_SKILLS_MAP[category] || BRANCH_SKILLS_MAP["Computer Science & IT"];
  const ALL_TOOLS = BRANCH_TOOLS_MAP[category] || BRANCH_TOOLS_MAP["Computer Science & IT"];
  const [popupState, setPopupState] = useState<{ isOpen: boolean; skill: string; tempLevel: string | null }>({
    isOpen: false,
    skill: "",
    tempLevel: null
  });

  const skillRatings: Record<string, {level: string, score: number}> = data.skillRatings || {};

  const openRating = (skillName: string) => {
    setPopupState({
      isOpen: true,
      skill: skillName,
      tempLevel: skillRatings[skillName]?.level || null
    });
  };

  const closePopup = () => setPopupState({ ...popupState, isOpen: false });

  const confirmRating = () => {
    if (!popupState.tempLevel) return;
    
    const newRatings = { ...skillRatings };
    newRatings[popupState.skill] = {
      level: popupState.tempLevel,
      score: LEVEL_SCORES[popupState.tempLevel]
    };
    
    // Convert dictionary back into array for backend compatibility
    const backendSkills = Object.entries(newRatings).map(([name, val]: [string, any]) => `${name} (${val.level})`);
    
    updateData({ 
      skillRatings: newRatings,
      skills: backendSkills
    });
    closePopup();
  };

  const removeSkill = (e: React.MouseEvent, skillName: string) => {
    e.stopPropagation();
    const newRatings = { ...skillRatings };
    delete newRatings[skillName];
    
    const backendSkills = Object.entries(newRatings).map(([name, val]: [string, any]) => `${name} (${val.level})`);
    
    updateData({ 
      skillRatings: newRatings,
      skills: backendSkills
    });
  };

  const renderChip = (skill: string) => {
    const rating = skillRatings[skill];
    if (rating) {
      return (
        <div key={skill} className={`chip rated-${rating.level}`} onClick={() => openRating(skill)}>
          <div className={`chip-level-dot ${rating.level}`}></div>
          {skill}
          <span style={{ fontSize: '10px', fontWeight: 600 }}>{rating.score}</span>
          <span className="chip-x" onClick={(e) => removeSkill(e, skill)}>×</span>
        </div>
      );
    }
    return (
      <div key={skill} className="chip" onClick={() => openRating(skill)}>
        {skill}
      </div>
    );
  };

  const ratedSkillsCount = Object.keys(skillRatings).length;

  return (
    <div className="step2-custom-wrap">
      <div className="step-card">
        <div className="step-head">
          <div className="step-ico">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#378ADD" strokeWidth="1.5"><path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z"/></svg>
          </div>
          <div className="step-title">Skills & Experience</div>
        </div>
        <div className="step-sub">Click a skill chip to select it — then rate your level in that skill</div>

        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '5px 12px', borderRadius: '100px', background: 'var(--color-background-info)', border: '0.5px solid var(--color-border-info)', fontSize: '11px', fontWeight: 500, color: 'var(--color-text-info)', marginBottom: '20px' }}>
          <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="8" cy="8" r="6"/><path d="M8 5v3l2 1"/></svg>
          Showing skills for {data.branch || 'CSE'} branch
        </div>

        <div className="field">
          <div className="flabel">Your skills <span className="flabel-hint">— click to select, then rate your level</span></div>
          <div className="chips">
            {ALL_SKILLS.map(renderChip)}
          </div>
        </div>

        <div className={`rating-summary ${ratedSkillsCount > 0 ? 'show' : ''}`}>
          <div className="summary-title">Your rated skills</div>
          <div className="summary-grid">
            {Object.entries(skillRatings).map(([name, info]: [string, any]) => (
              <div key={name} className="sum-item">
                <div className="sum-dot" style={{ background: LEVEL_COLORS[info.level] }}></div>
                <span style={{ fontSize: '12px', color: 'var(--color-text-primary)' }}>{name}</span>
                <span className="sum-score" style={{ color: LEVEL_COLORS[info.level] }}>{info.score}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="field" style={{ marginTop: '20px' }}>
          <div className="flabel">Tools & technologies <span className="flabel-hint">— click to select, then rate</span></div>
          <div className="chips">
            {ALL_TOOLS.map(renderChip)}
          </div>
        </div>

        <div className="grid2">
          <div className="field" style={{ marginBottom: 0 }}>
            <div className="flabel">Projects completed</div>
            <select 
              value={data.projects || ""} 
              onChange={(e) => updateData({ projects: e.target.value })}
            >
              <option value="">Select…</option>
              <option value="0">0 — Not started</option>
              <option value="1">1 project</option>
              <option value="2">2 projects</option>
              <option value="3">3 projects</option>
              <option value="4+">4 or more</option>
            </select>
          </div>
          <div className="field" style={{ marginBottom: 0 }}>
            <div className="flabel">Certifications done</div>
            <select 
              value={data.certifications || ""} 
              onChange={(e) => updateData({ certifications: e.target.value })}
            >
              <option value="">Select…</option>
              <option value="0">None</option>
              <option value="1">1</option>
              <option value="2">2</option>
              <option value="3+">3+</option>
            </select>
          </div>
        </div>

      </div>

      {popupState.isOpen && (
        <div className="popup-overlay" onClick={closePopup} style={{ display: 'flex' }}>
          <div className="popup" onClick={(e) => e.stopPropagation()}>
            <div className="popup-skill">{popupState.skill}</div>
            <div className="popup-sub">How well do you know this skill?</div>

            <div className="rating-options">
              {['beginner', 'familiar', 'proficient', 'expert'].map((level) => {
                const isSelected = popupState.tempLevel === level;
                let icon, label, desc, score, cls;
                if (level === 'beginner') { icon = '🌱'; label = 'Beginner'; desc = 'Just started learning, know the basics'; score = '25 / 100'; cls = 'beg'; }
                else if (level === 'familiar') { icon = '📘'; label = 'Familiar'; desc = 'Can use it with some reference / help'; score = '50 / 100'; cls = 'fam'; }
                else if (level === 'proficient') { icon = '💡'; label = 'Proficient'; desc = 'Use it independently in projects'; score = '75 / 100'; cls = 'pro'; }
                else { icon = '🏆'; label = 'Expert'; desc = 'Deep knowledge, can teach others'; score = '90 / 100'; cls = 'exp'; }

                return (
                  <div 
                    key={level}
                    className={`rating-opt r-${cls} ${isSelected ? 'selected' : ''}`}
                    onClick={() => setPopupState({ ...popupState, tempLevel: level })}
                  >
                    <div className={`opt-icon ${cls}`}>{icon}</div>
                    <div className="opt-info">
                      <div className="opt-label">{label}</div>
                      <div className="opt-desc">{desc}</div>
                    </div>
                    <div className={`opt-score ${cls}`}>{score}</div>
                  </div>
                );
              })}
            </div>

            <div className="popup-btns">
              <button className="popup-cancel" onClick={closePopup}>Cancel</button>
              <button 
                className="popup-confirm" 
                onClick={confirmRating} 
                disabled={!popupState.tempLevel}
              >
                Confirm Rating
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
