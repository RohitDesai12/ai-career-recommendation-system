/**
 * Career Compass — Centralized Adaptive Assessment Engine
 * 
 * Step 1 acts as the Central Control Centre:
 * - Part A: Academic Background (Who are you? - Branch, Specialization, Year, CGPA, Strengths)
 * - Part B: Intended Career Direction (Where do you want to go? - 12 Categorized Directions + Discovery Mode)
 * 
 * Steps 2–7 dynamically adapt their questions, scenarios, challenges, environments, sectors,
 * and skill catalogs based on the primary career direction selected in Step 1.
 * Step 8 generates the canonical 20-feature V8 input profile for career_model_v8.pkl.
 */

export interface BranchOption {
  id: string;
  name: string;
  defaultSpecialization: string;
  category: 'Computing' | 'Mechanical' | 'Electrical' | 'Civil' | 'Chemical & Bio' | 'Other';
}

export const ENGINEERING_BRANCHES: BranchOption[] = [
  { id: "CSE", name: "Computer Science and Engineering", defaultSpecialization: "Software Systems", category: "Computing" },
  { id: "IT", name: "Information Technology", defaultSpecialization: "Network Systems", category: "Computing" },
  { id: "AIDS", name: "Artificial Intelligence and Data Science", defaultSpecialization: "Machine Learning", category: "Computing" },
  { id: "ECE", name: "Electronics and Communication", defaultSpecialization: "Embedded Systems", category: "Electrical" },
  { id: "EE", name: "Electrical Engineering", defaultSpecialization: "Power Systems", category: "Electrical" },
  { id: "EEE", name: "Electrical and Electronics", defaultSpecialization: "Power Electronics", category: "Electrical" },
  { id: "MECH", name: "Mechanical Engineering", defaultSpecialization: "Mechanical Design", category: "Mechanical" },
  { id: "CIVIL", name: "Civil Engineering", defaultSpecialization: "Structural Engineering", category: "Civil" },
  { id: "CHEM", name: "Chemical Engineering", defaultSpecialization: "Process Engineering", category: "Chemical & Bio" },
  { id: "BIOTECH", name: "Biotechnology", defaultSpecialization: "Applied Biotechnology", category: "Chemical & Bio" },
  { id: "BIOMED", name: "Biomedical Engineering", defaultSpecialization: "Biomedical Instrumentation", category: "Chemical & Bio" },
  { id: "AUTO", name: "Automotive Engineering", defaultSpecialization: "Automotive Dynamics", category: "Mechanical" },
  { id: "INST", name: "Instrumentation Engineering", defaultSpecialization: "Industrial Automation", category: "Electrical" },
  { id: "MECHATRONICS", name: "Mechatronics Engineering", defaultSpecialization: "Robotics and Automation", category: "Mechanical" },
  { id: "AERO", name: "Aerospace Engineering", defaultSpecialization: "Aerodynamics & Propulsion", category: "Mechanical" },
  { id: "ROBOTICS", name: "Robotics and Automation", defaultSpecialization: "Autonomous Robotics", category: "Mechanical" },
  { id: "PROD", name: "Production Engineering", defaultSpecialization: "Manufacturing Technology", category: "Mechanical" },
  { id: "META", name: "Metallurgical and Materials Engineering", defaultSpecialization: "Material Characterization", category: "Mechanical" },
  { id: "ENV", name: "Environmental Engineering", defaultSpecialization: "Environmental Systems", category: "Civil" },
  { id: "CYBER", name: "Cybersecurity", defaultSpecialization: "Information Security", category: "Computing" },
  { id: "MATH_COMP", name: "Mathematics and Computing", defaultSpecialization: "Computational Modeling", category: "Computing" },
  { id: "AGRI", name: "Agricultural Engineering", defaultSpecialization: "Farm Machinery & Irrigation", category: "Other" },
  { id: "OTHER", name: "Other Engineering Discipline", defaultSpecialization: "Engineering Fundamentals", category: "Other" }
];

export const ACADEMIC_YEARS = [
  "1st Year (Freshman)",
  "2nd Year (Sophomore)",
  "3rd Year (Junior)",
  "4th Year (Final Year)",
  "Graduated / Alum"
];

export const ACADEMIC_STRENGTHS_OPTIONS = [
  "Analytical & Mathematical Modeling",
  "Algorithm & Software Logic",
  "Physical & Mechanical Systems Design",
  "Circuit & Hardware Analysis",
  "Laboratory Experiments & Wet Lab Assays",
  "Project Planning & Field Execution",
  "Systems Optimization & Control Theory",
  "Data & Statistical Interpretation"
];

export interface ScenarioOption {
  label: string;
  trait: string;
}

export interface ScenarioItem {
  id: string;
  domain: string;
  title: string;
  situation: string;
  options: ScenarioOption[];
}

export interface InterestOption {
  id: string;
  label: string;
  desc: string;
  icon: string;
}

export interface ChallengeOption {
  id: string;
  label: string;
  focus: string;
}

export interface SkillCategoryItem {
  category: string;
  skills: string[];
}

export interface CareerDirectionConfig {
  id: string;
  title: string;
  subtitle: string;
  iconName: string;
  gradient: string;
  borderHover: string;
  v8Defaults: {
    careerGoal: string;
    targetSector: string;
    preferredEnvironment: string;
    interestArea: string;
    programmingLanguages: string;
    primarySkill: string;
    secondarySkill: string;
    technicalProficiency: string;
  };
  interests: InterestOption[];
  scenarios: ScenarioItem[];
  challenges: ChallengeOption[];
  environments: string[];
  sectors: string[];
  skillsCatalog: SkillCategoryItem[];
  suggestedDesiredSkills: string[];
  defaultProblemSolvingStyle: string;
}

export const CAREER_DIRECTIONS: Record<string, CareerDirectionConfig> = {
  "cs-software": {
    id: "cs-software",
    title: "Computer Science & Software",
    subtitle: "Web, cloud, distributed systems, mobile & desktop software",
    iconName: "Laptop",
    gradient: "from-blue-600 to-indigo-600",
    borderHover: "hover:border-blue-500",
    v8Defaults: {
      careerGoal: "Build scalable software systems",
      targetSector: "Information Technology",
      preferredEnvironment: "Product-based Company",
      interestArea: "Software Development",
      programmingLanguages: "Java, SQL",
      primarySkill: "Software Development",
      secondarySkill: "Data Structures",
      technicalProficiency: "Intermediate"
    },
    interests: [
      { id: "Software and Application Development", label: "Full Stack & Web Architecture", desc: "Modern microservices, scalable APIs, and reactive frontends", icon: "code" },
      { id: "Cloud Computing and Distributed Systems", label: "Cloud & DevOps Infrastructure", desc: "Automated CI/CD, Docker, Kubernetes, and serverless backends", icon: "cloud" },
      { id: "Database Systems and Performance", label: "Database Engineering & Storage", desc: "High-throughput database engines, caching, and SQL/NoSQL tuning", icon: "database" },
      { id: "Mobile Application Engineering", label: "Mobile App Development", desc: "Native iOS/Android and cross-platform Flutter/React Native", icon: "smartphone" },
      { id: "System Architecture and Design", label: "System Design & Algorithms", desc: "Distributed consensus, low-latency queues, and core algorithms", icon: "layers" },
      { id: "Developer Productivity Tools", label: "Software Tooling & SDKs", desc: "Developer platforms, compilers, build systems, and open-source frameworks", icon: "wrench" }
    ],
    scenarios: [
      {
        id: "cs-sc-1",
        domain: "Software Architecture",
        title: "Production Latency Degradation",
        situation: "A high-traffic web API experiences a 4x latency spike and periodic gateway timeouts after a major deployment. What is your first investigation angle?",
        options: [
          { label: "Profile database query execution plans and add targeted caching layers", trait: "Database & Backend Optimization" },
          { label: "Trace distributed microservice call traces in APM telemetry logs", trait: "Distributed Systems Diagnostics" },
          { label: "Roll back the release and debug memory allocations in a staging environment", trait: "Risk Mitigation & Code Profiling" },
          { label: "Scale out horizontal pod replicas and tune load-balancer routing algorithms", trait: "Infrastructure & Cloud Scaling" }
        ]
      },
      {
        id: "cs-sc-2",
        domain: "Frontend & Applications",
        title: "Single-Page Application Memory Leak",
        situation: "Users of an enterprise web portal report that the browser tab becomes sluggish and crashes after extended usage. How would you solve this?",
        options: [
          { label: "Inspect Chrome DevTools heap snapshots to detect unmounted component event listeners", trait: "Frontend Debugging" },
          { label: "Refactor state management store to eliminate unnecessary recursive re-renders", trait: "Component State Optimization" },
          { label: "Virtualize large data tables so only visible viewport rows are rendered in DOM", trait: "UI Performance Engineering" },
          { label: "Add client-side error telemetry to capture user interactions prior to crash", trait: "Observability & Telemetry" }
        ]
      }
    ],
    challenges: [
      { id: "Writing scalable and maintainable code", label: "Writing scalable and maintainable clean code", focus: "Software Quality" },
      { id: "Architecting distributed systems and APIs", label: "Architecting high-concurrency microservices and APIs", focus: "Architecture" },
      { id: "Optimizing database queries and caching", label: "Optimizing complex database transactions and indexing", focus: "Data Layer" },
      { id: "Automating cloud deployments and CI/CD pipelines", label: "Automating zero-downtime cloud deployments and CI/CD", focus: "DevOps" }
    ],
    environments: ["Product-based Company", "Startup", "Remote / Hybrid", "Corporate Office", "Service-based Company"],
    sectors: ["Information Technology", "FinTech", "EdTech", "Consulting"],
    skillsCatalog: [
      { category: "Languages & Frameworks", skills: ["Java", "Python", "JavaScript", "TypeScript", "C++", "Go", "React", "Node.js"] },
      { category: "Databases & Storage", skills: ["SQL", "PostgreSQL", "MongoDB", "Oracle Database", "Redis"] },
      { category: "Cloud & Infrastructure", skills: ["AWS", "Docker", "Kubernetes", "Linux", "Git", "Jenkins", "Terraform"] }
    ],
    suggestedDesiredSkills: ["System Design", "Cloud Computing", "Docker", "Kubernetes"],
    defaultProblemSolvingStyle: "Logical & Algorithmic"
  },

  "ai-data": {
    id: "ai-data",
    title: "AI, Machine Learning & Data",
    subtitle: "Predictive models, deep learning, NLP, computer vision & big data",
    iconName: "Brain",
    gradient: "from-purple-600 to-violet-600",
    borderHover: "hover:border-purple-500",
    v8Defaults: {
      careerGoal: "Develop intelligent machine learning models",
      targetSector: "Information Technology",
      preferredEnvironment: "Product-based Company",
      interestArea: "Machine Learning",
      programmingLanguages: "Python, SQL",
      primarySkill: "Python",
      secondarySkill: "Machine Learning",
      technicalProficiency: "Intermediate"
    },
    interests: [
      { id: "Machine Learning and Predictive Modeling", label: "Supervised & Unsupervised ML", desc: "Training predictive models on tabular and structured business data", icon: "brain" },
      { id: "Deep Learning and Neural Architectures", label: "Deep Learning & Neural Networks", desc: "Designing convolutional, transformer, and recurrent neural nets", icon: "cpu" },
      { id: "Generative AI and Large Language Models", label: "Generative AI & LLM Engineering", desc: "Prompt engineering, RAG pipelines, fine-tuning, and vector stores", icon: "sparkles" },
      { id: "Computer Vision and Visual Intelligence", label: "Computer Vision & Object Detection", desc: "Image segmentation, video tracking, OpenCV, and facial recognition", icon: "eye" },
      { id: "Data Engineering and Big Data Pipelines", label: "Data Pipelines & ETL Architecture", desc: "Spark, Kafka, Airflow, and large-scale data lake warehousing", icon: "database" },
      { id: "Business Intelligence and Data Insights", label: "Business Intelligence & Visualization", desc: "Translating data distributions into decision-making dashboards", icon: "bar-chart" }
    ],
    scenarios: [
      {
        id: "ai-sc-1",
        domain: "Machine Learning",
        title: "Overfitting on Production Data Drift",
        situation: "A predictive model achieved 96% accuracy during offline validation, but drops to 74% precision when deployed to live customer data. What do you do?",
        options: [
          { label: "Analyze feature distribution drift between training dataset and live production inputs", trait: "Data Drift & Distribution Analysis" },
          { label: "Apply stronger regularizers, cross-validation splits, and ensemble bagging", trait: "Model Regularization" },
          { label: "Collect and annotate hard edge-case real-world examples to re-train the pipeline", trait: "Data Quality & Augmentation" },
          { label: "Calibrate decision confidence thresholds to balance precision vs recall tradeoff", trait: "Decision Boundary Optimization" }
        ]
      },
      {
        id: "ai-sc-2",
        domain: "Data Systems",
        title: "Real-Time Vector Search Bottleneck",
        situation: "An AI-powered knowledge assistant is taking over 6 seconds to retrieve relevant context vectors for user questions. Where do you optimize?",
        options: [
          { label: "Implement Approximate Nearest Neighbor (ANN) index quantization (HNSW/IVFFlat)", trait: "Vector Index Optimization" },
          { label: "Cache frequently queried document embeddings in memory to bypass vector calculations", trait: "Caching & Systems Design" },
          { label: "Reduce embedding dimensionality and fine-tune a smaller domain-specific bi-encoder", trait: "Embedding Optimization" },
          { label: "Distribute semantic search queries across partitioned GPU inference nodes", trait: "Scalable Infrastructure" }
        ]
      }
    ],
    challenges: [
      { id: "Developing high-accuracy predictive ML models", label: "Developing high-accuracy predictive models from scratch", focus: "Model Development" },
      { id: "Building scalable automated data pipelines", label: "Building high-throughput real-time streaming data pipelines", focus: "Data Engineering" },
      { id: "Deploying and monitoring production AI models", label: "Deploying, quantizing, and monitoring models in production", focus: "MLOps" },
      { id: "Extracting actionable insights from messy data", label: "Cleaning, transforming, and extracting signals from messy data", focus: "Exploratory Analysis" }
    ],
    environments: ["Product-based Company", "R&D Center", "Startup", "Remote / Hybrid", "Research Laboratory"],
    sectors: ["Information Technology", "FinTech", "Healthcare & Biotech", "Consulting", "Research"],
    skillsCatalog: [
      { category: "ML & Data Science", skills: ["Python", "PyTorch", "TensorFlow", "Scikit-learn", "Pandas", "Mathematics"] },
      { category: "Generative AI & NLP", skills: ["LLM APIs", "Hugging Face", "Transformers", "Generative AI", "OpenCV"] },
      { category: "Data Engineering & BI", skills: ["SQL", "Apache Spark", "Airflow", "Kafka", "Power BI", "Tableau", "Jupyter"] }
    ],
    suggestedDesiredSkills: ["PyTorch", "Deep Learning", "Generative AI", "Apache Spark"],
    defaultProblemSolvingStyle: "Analytical & Quantitative"
  },

  "mechanical-automotive": {
    id: "mechanical-automotive",
    title: "Mechanical & Automotive",
    subtitle: "CAD/CAM, thermodynamics, machine design, EV powertrains & manufacturing",
    iconName: "Wrench",
    gradient: "from-slate-700 to-zinc-900",
    borderHover: "hover:border-slate-500",
    v8Defaults: {
      careerGoal: "Design mechanical products",
      targetSector: "Core Manufacturing",
      preferredEnvironment: "Core Manufacturing",
      interestArea: "Mechanical Design",
      programmingLanguages: "None / Basic Scripting",
      primarySkill: "SolidWorks",
      secondarySkill: "CAD",
      technicalProficiency: "Intermediate"
    },
    interests: [
      { id: "Mechanical Design and Manufacturing", label: "CAD Modeling & Product Prototyping", desc: "3D parametric modeling, SolidWorks/CATIA, and tolerancing (GD&T)", icon: "settings" },
      { id: "Finite Element and Thermal Analysis", label: "FEA Simulation & Structural Mechanics", desc: "Stress, thermal dissipation, and modal simulation using ANSYS", icon: "activity" },
      { id: "Automotive Technology and Powertrains", label: "Automotive Dynamics & Electric Vehicles", desc: "Chassis dynamics, battery pack thermal management, and powertrains", icon: "truck" },
      { id: "Manufacturing Technology and Production", label: "Precision Manufacturing & CNC", desc: "Machining tolerances, casting, sheet metal, and shop floor automation", icon: "factory" },
      { id: "Materials Science and Metallurgy", label: "Material Selection & Fatigue Testing", desc: "Alloys, composites, fracture mechanics, and lifecycle durability", icon: "box" },
      { id: "Thermal Systems and Fluid Dynamics", label: "HVAC & Fluid Flow (CFD)", desc: "Aerodynamic resistance, heat exchangers, and computational fluid flow", icon: "wind" }
    ],
    scenarios: [
      {
        id: "mech-sc-1",
        domain: "Mechanical Engineering",
        title: "High-Speed Turbine Bearing Vibration",
        situation: "An industrial high-speed turbine test rig shows excessive harmonic vibration above 4,000 RPM. What do you inspect first?",
        options: [
          { label: "Conduct finite element modal analysis to identify resonant frequency overlap", trait: "FEA & Modal Simulation" },
          { label: "Inspect bearing journal alignment, radial clearances, and dynamic balance weights", trait: "Mechanical Precision & Tolerances" },
          { label: "Analyze hydrodynamic lubrication fluid film thickness and oil viscosity degradation", trait: "Tribology & Fluid Mechanics" },
          { label: "Review assembly GD&T runout measurements against manufacturing specifications", trait: "Quality Engineering & Metrology" }
        ]
      },
      {
        id: "mech-sc-2",
        domain: "Automotive Systems",
        title: "EV Battery Pack Thermal Runway Risk",
        situation: "Under fast charging tests, the center cells of a lithium-ion battery pack reach 58°C while outer modules remain at 32°C. How do you resolve this?",
        options: [
          { label: "Redesign the liquid cooling plate channel geometry to equalize fluid flow and heat transfer", trait: "Thermal & CFD Engineering" },
          { label: "Incorporate phase change material (PCM) liners to absorb localized thermal spikes", trait: "Materials Innovation" },
          { label: "Model heat dissipation curves in ANSYS to optimize spacing between cylindrical cells", trait: "Thermal Modeling & Simulation" },
          { label: "Reconfigure battery management system (BMS) current throttling algorithms", trait: "Systems Control & Safety" }
        ]
      }
    ],
    challenges: [
      { id: "Designing physical machinery and CAD models", label: "Designing complex 3D mechanical components and assemblies in CAD", focus: "CAD Design" },
      { id: "Performing FEA and stress simulation", label: "Running stress, fatigue, and thermodynamic simulations in ANSYS", focus: "Simulation" },
      { id: "Optimizing automotive powertrains and chassis", label: "Optimizing vehicle dynamics, braking systems, and EV battery packaging", focus: "Automotive" },
      { id: "Improving shop-floor manufacturing efficiency", label: "Eliminating defects, improving tool life, and optimizing CNC workflows", focus: "Manufacturing" }
    ],
    environments: ["Core Manufacturing", "Design Office", "Automotive", "R&D Center", "Testing Laboratory"],
    sectors: ["Core Manufacturing", "Automotive", "Defense & Aerospace", "Heavy Engineering"],
    skillsCatalog: [
      { category: "CAD & Modeling", skills: ["SolidWorks", "AutoCAD", "CATIA", "Product Design", "GD&T"] },
      { category: "Analysis & Simulation", skills: ["ANSYS", "Vehicle Dynamics", "Automotive Systems", "MATLAB"] },
      { category: "Manufacturing & Production", skills: ["Manufacturing Processes", "CNC Programming", "Materials Science", "Quality Control"] }
    ],
    suggestedDesiredSkills: ["SolidWorks", "ANSYS", "CATIA", "Vehicle Dynamics"],
    defaultProblemSolvingStyle: "Practical & Hands-on"
  },

  "robotics-mechatronics": {
    id: "robotics-mechatronics",
    title: "Robotics & Mechatronics",
    subtitle: "Robotic arms, autonomous mobile robots, ROS, PLCs, actuators & smart automation",
    iconName: "Cpu",
    gradient: "from-orange-500 to-amber-600",
    borderHover: "hover:border-orange-500",
    v8Defaults: {
      careerGoal: "Design autonomous robotic systems",
      targetSector: "Automotive",
      preferredEnvironment: "R&D Center",
      interestArea: "Robotics & Automation",
      programmingLanguages: "MATLAB, C++",
      primarySkill: "Robotics",
      secondarySkill: "PLC",
      technicalProficiency: "Intermediate"
    },
    interests: [
      { id: "Robotics and Automation", label: "Robotic Manipulators & Kinematics", desc: "Inverse kinematics, multi-axis arm trajectory planning, and grippers", icon: "cpu" },
      { id: "Autonomous Mobile Systems", label: "Autonomous Mobile Robots & SLAM", desc: "LiDAR mapping, sensor fusion, path planning algorithms, and ROS 2", icon: "navigation" },
      { id: "Industrial Automation and PLC Control", label: "PLC, SCADA & Smart Factory Systems", desc: "Ladder logic, Allen Bradley/Siemens PLCs, and factory cell integration", icon: "factory" },
      { id: "Sensors, Actuators and Feedback", label: "Mechatronic Sensors & Actuators", desc: "Optical encoders, IMUs, stepper/servo motor drives, and feedback loops", icon: "sliders" },
      { id: "Embedded Control Systems", label: "Real-Time Embedded Systems & RTOS", desc: "Microcontroller motor control algorithms, CAN bus, and low-latency firmware", icon: "zap" },
      { id: "Human-Robot Interaction", label: "Cobots & Safety Systems", desc: "Collaborative robots, torque sensing, force feedback, and ISO safety standards", icon: "shield" }
    ],
    scenarios: [
      {
        id: "rob-sc-1",
        domain: "Robotics",
        title: "6-Axis Robot Positioning Overshoot",
        situation: "An industrial 6-axis pick-and-place robot overshoots its target coordinate by 4mm during high-speed cycle times. What is your primary fix?",
        options: [
          { label: "Tune the joint servo PID velocity loops and implement S-curve jerk-limiting profiles", trait: "Control Systems & PID Tuning" },
          { label: "Inspect mechanical gearbox backlash and calibrate absolute optical shaft encoders", trait: "Hardware Calibration & Kinematics" },
          { label: "Recalculate dynamic payload inertia matrix in ROS/MATLAB trajectory generator", trait: "Dynamic Modeling" },
          { label: "Integrate high-speed machine vision fiducial cameras for closed-loop visual servoing", trait: "Vision-Guided Robotics" }
        ]
      },
      {
        id: "rob-sc-2",
        domain: "Automation",
        title: "Autonomous Mobile Robot Navigation Failure",
        situation: "An automated guided vehicle in a manufacturing facility loses localization in long uniform corridors. How do you resolve this?",
        options: [
          { label: "Fuse wheel odometry and IMU data with 2D LiDAR using an Extended Kalman Filter (EKF)", trait: "Sensor Fusion & State Estimation" },
          { label: "Install passive ultra-wideband (UWB) anchors or reflective markers along the pathway", trait: "Infrastructure & Localization" },
          { label: "Upgrade local costmap obstacle inflation radius and dynamic obstacle tracking rules", trait: "Path Planning & Navigation" },
          { label: "Implement deep learning feature point matching to extract distinctive structural cues", trait: "Visual SLAM" }
        ]
      }
    ],
    challenges: [
      { id: "Programming robotic motion and ROS nodes", label: "Developing autonomous navigation and motion planning nodes in ROS/C++", focus: "Robotics Software" },
      { id: "Configuring industrial PLCs and automated cells", label: "Programming PLC ladder logic and integrating fieldbus sensors", focus: "Industrial Automation" },
      { id: "Designing electro-mechanical actuator mechanisms", label: "Sizing servo motors, gearheads, and mechanical linkages for dynamic loads", focus: "Mechatronics Hardware" },
      { id: "Implementing real-time sensor fusion", label: "Fusing LiDAR, camera, and IMU data for precision state estimation", focus: "Perception & Control" }
    ],
    environments: ["R&D Center", "Core Manufacturing", "Automotive", "Testing Laboratory", "Design Office"],
    sectors: ["Automotive", "Core Manufacturing", "Defense & Aerospace", "Semiconductors"],
    skillsCatalog: [
      { category: "Robotics & Control", skills: ["ROS", "Robotics", "PLC", "Control Systems", "MATLAB"] },
      { category: "Hardware & Electronics", skills: ["Microcontrollers", "Arduino", "ESP32", "Sensors", "Circuit Design"] },
      { category: "Mechanical & Design", skills: ["SolidWorks", "CAD", "Automation", "C++"] }
    ],
    suggestedDesiredSkills: ["ROS", "PLC", "Control Systems", "SolidWorks"],
    defaultProblemSolvingStyle: "Practical & Hands-on"
  },

  "civil-infrastructure": {
    id: "civil-infrastructure",
    title: "Civil & Infrastructure",
    subtitle: "Structural engineering, BIM, geotechnical analysis, smart transportation & green buildings",
    iconName: "Building",
    gradient: "from-emerald-700 to-teal-800",
    borderHover: "hover:border-emerald-500",
    v8Defaults: {
      careerGoal: "Design resilient structures",
      targetSector: "Construction",
      preferredEnvironment: "Construction Site",
      interestArea: "Structural Design",
      programmingLanguages: "None / Basic Scripting",
      primarySkill: "AutoCAD",
      secondarySkill: "Structural Analysis",
      technicalProficiency: "Intermediate"
    },
    interests: [
      { id: "Structural Design and Analysis", label: "Structural Design & Load Modeling", desc: "RCC and steel framing, STAAD.Pro/ETABS, and seismic design codes", icon: "box" },
      { id: "Building Information Modeling (BIM)", label: "BIM & Digital Construction", desc: "3D architectural modeling in Revit, clash detection, and construction 4D", icon: "layers" },
      { id: "Geotechnical and Foundation Engineering", label: "Geotechnical & Soil Mechanics", desc: "Soil bearing capacity, deep pile foundations, and slope stability", icon: "mountain" },
      { id: "Transportation and Highway Systems", label: "Transportation Planning & Highways", desc: "Geometric highway design, pavement lifecycle, and traffic simulation", icon: "navigation" },
      { id: "Environmental Engineering and Water Resources", label: "Water Resources & Environmental Systems", desc: "Hydrological watershed modeling, flood mitigation, and water treatment", icon: "droplet" },
      { id: "Construction Management and Project Delivery", label: "Construction Management & Costing", desc: "Quantity estimation, site logistics, safety protocols, and CPM scheduling", icon: "clipboard" }
    ],
    scenarios: [
      {
        id: "civ-sc-1",
        domain: "Structural Engineering",
        title: "High-Rise Shear Wall Deflection Failure",
        situation: "Finite element analysis of a 30-story commercial tower reveals excessive lateral wind drift exceeding permissible building code limits. What is your redesign strategy?",
        options: [
          { label: "Increase shear wall thickness and integrate outrigger belt trusses to stiffen core", trait: "Structural System Optimization" },
          { label: "Evaluate tuned mass damper (TMD) resonance counterweight systems on upper plant floors", trait: "Dynamic Structural Control" },
          { label: "Recalculate dynamic wind tunnel gust factors with computational wind engineering", trait: "Aerodynamic Load Modeling" },
          { label: "Optimize steel reinforcement ratios to maximize structural ductility and cost", trait: "Reinforced Concrete Detailing" }
        ]
      },
      {
        id: "civ-sc-2",
        domain: "Geotechnical Engineering",
        title: "Bridge Abutment Differential Settlement",
        situation: "Post-monsoon geotechnical monitoring on a river bridge shows 45mm differential settlement under the southern pier. How do you intervene?",
        options: [
          { label: "Conduct cone penetration tests (CPT) to map soft alluvial subsoil lens geometry", trait: "Geotechnical Investigation" },
          { label: "Design pressure jet-grouting underpinnings to reinforce the compromised subgrade strata", trait: "Ground Improvement" },
          { label: "Recalculate load redistribution through continuous deck expansion joints to prevent shear failure", trait: "Structural Safety Assessment" },
          { label: "Install automated fiber-optic piezometers and tilt sensors for real-time risk alert", trait: "Infrastructure Monitoring" }
        ]
      }
    ],
    challenges: [
      { id: "Designing resilient structural frameworks", label: "Designing safe, code-compliant RCC and steel structures in STAAD.Pro", focus: "Structural Design" },
      { id: "Managing complex BIM workflows in Revit", label: "Coordinating multi-discipline BIM models and resolving structural clashes", focus: "BIM Coordination" },
      { id: "Solving geotechnical and foundation challenges", label: "Determining foundation bearing capacities and slope stabilization measures", focus: "Geotechnical" },
      { id: "Coordinating civil construction site operations", label: "Managing site safety, quality audits, material supply chains, and subcontractors", focus: "Site Management" }
    ],
    environments: ["Construction Site", "Design Office", "Corporate Office", "Government Organization", "Consulting"],
    sectors: ["Construction", "Infrastructure", "Consulting", "Government"],
    skillsCatalog: [
      { category: "Design & Modeling", skills: ["AutoCAD", "Revit", "STAAD.Pro", "ETABS", "Structural Analysis"] },
      { category: "Surveying & GIS", skills: ["GIS", "Surveying & Total Station", "Civil 3D", "BIM"] },
      { category: "Execution & Management", skills: ["Construction Management", "Quantity Surveying", "Geotechnical Engineering", "Project Planning"] }
    ],
    suggestedDesiredSkills: ["AutoCAD", "STAAD.Pro", "Revit", "ETABS"],
    defaultProblemSolvingStyle: "Precision & Detail"
  },

  "electrical-power": {
    id: "electrical-power",
    title: "Electrical & Power Systems",
    subtitle: "Power grids, electrical machines, switchgear, clean energy, drives & high-voltage",
    iconName: "Zap",
    gradient: "from-amber-600 to-yellow-600",
    borderHover: "hover:border-amber-500",
    v8Defaults: {
      careerGoal: "Design reliable power systems",
      targetSector: "CleanTech & Energy",
      preferredEnvironment: "Power Utility",
      interestArea: "Power Systems",
      programmingLanguages: "None / Basic Scripting",
      primarySkill: "Power Systems",
      secondarySkill: "PLC",
      technicalProficiency: "Intermediate"
    },
    interests: [
      { id: "Power Systems and Grid Transmission", label: "Transmission Grids & Substation Design", desc: "Load flow, fault calculations, protection relays, and transformer switchyards", icon: "zap" },
      { id: "Renewable Energy and Clean Technology", label: "Solar & Wind Clean Energy Integration", desc: "PV inverter sizing, wind generator dynamics, and grid interconnects", icon: "sun" },
      { id: "Electrical Machines and Motor Drives", label: "Electric Motors & Variable Frequency Drives", desc: "Induction and PMSM motor drives, torque control, and vector algorithms", icon: "disc" },
      { id: "Power Electronics and Energy Conversion", label: "Power Electronics Converters", desc: "DC-DC buck/boost converters, multi-level inverters, and IGBT thermal designs", icon: "cpu" },
      { id: "Smart Grids and Energy Management", label: "Smart Metering & Microgrid Storage", desc: "Distributed generation, SCADA telemetry, and battery energy storage (BESS)", icon: "activity" },
      { id: "High-Voltage Safety and Industrial Switchgear", label: "High-Voltage Protection & Switchgear", desc: "Circuit breakers, arc flash calculations, grounding grids, and IEC standards", icon: "shield" }
    ],
    scenarios: [
      {
        id: "ee-sc-1",
        domain: "Power Systems",
        title: "Substation Transformer Overload & Harmonic Distortion",
        situation: "An industrial substation transformer is operating at 95°C with a 15% total harmonic distortion (THD) caused by large variable frequency motor drives. How do you respond?",
        options: [
          { label: "Design and size active harmonic filters (AHF) with tuned passive LC branch filters", trait: "Harmonic Mitigation & Power Quality" },
          { label: "Model ETAP load flow and short-circuit impedances to verify transformer k-factor rating", trait: "ETAP Simulation & Sizing" },
          { label: "Deploy automated capacitor banks for power factor correction with detuned reactors", trait: "Reactive Power Management" },
          { label: "Reconfigure feeder distribution topology to segregate non-linear loads", trait: "Network Optimization" }
        ]
      },
      {
        id: "ee-sc-2",
        domain: "Renewable Energy",
        title: "Microgrid Voltage Sag during Cloud Cover",
        situation: "A commercial solar-plus-storage microgrid experiences severe 12% voltage dips when sudden cloud transients drop PV generation. What is your design solution?",
        options: [
          { label: "Optimize battery storage bi-directional inverter fast frequency-watt response curves", trait: "Inverter Control & Fast Response" },
          { label: "Implement automated droop control in the microgrid energy management controller (EMS)", trait: "Microgrid Control Systems" },
          { label: "Incorporate short-duration supercapacitor banks for instantaneous peak transient support", trait: "Energy Storage Integration" },
          { label: "Fine-tune spinning reserve diesel generator automatic startup thresholds", trait: "Auxiliary Power Management" }
        ]
      }
    ],
    challenges: [
      { id: "Simulating power grid stability and load flow", label: "Running transient stability and load flow analyses in ETAP or MATLAB", focus: "Grid Simulation" },
      { id: "Designing high-efficiency power converters", label: "Designing high-efficiency DC-DC converters and inverter gate drive circuits", focus: "Power Electronics" },
      { id: "Configuring protective relays and switchgear", label: "Setting numerical protection relays and coordinating breaker trip curves", focus: "System Protection" },
      { id: "Integrating renewable solar and storage systems", label: "Designing utility-scale solar arrays, battery inverters, and grid synchronizers", focus: "Renewables" }
    ],
    environments: ["Power Utility", "Core Manufacturing", "Design Office", "Field Work", "R&D Center"],
    sectors: ["CleanTech & Energy", "Core Manufacturing", "Infrastructure", "Government"],
    skillsCatalog: [
      { category: "Power & Systems", skills: ["Power Systems", "PLC", "ETAP", "MATLAB", "Control Systems"] },
      { category: "Machines & Electronics", skills: ["Electrical Machines", "Power Electronics", "Circuit Analysis", "High Voltage"] },
      { category: "Renewables & Automation", skills: ["Renewable Energy", "Smart Grids", "SCADA", "Energy Management"] }
    ],
    suggestedDesiredSkills: ["Power Systems", "PLC", "ETAP", "MATLAB"],
    defaultProblemSolvingStyle: "Analytical & Quantitative"
  },

  "electronics-vlsi": {
    id: "electronics-vlsi",
    title: "Electronics, Embedded & VLSI",
    subtitle: "Microchips, Verilog/VHDL, embedded firmware, PCB design, sensors & semiconductors",
    iconName: "Cpu",
    gradient: "from-purple-700 to-indigo-800",
    borderHover: "hover:border-purple-500",
    v8Defaults: {
      careerGoal: "Develop integrated circuits",
      targetSector: "Semiconductors",
      preferredEnvironment: "Electronics Laboratory",
      interestArea: "VLSI & Chip Design",
      programmingLanguages: "C, Embedded C",
      primarySkill: "Verilog",
      secondarySkill: "Digital Electronics",
      technicalProficiency: "Intermediate"
    },
    interests: [
      { id: "VLSI and Chip Architecture", label: "Digital VLSI & ASIC Design", desc: "RTL design, Verilog/SystemVerilog, synthesis, and static timing analysis", icon: "cpu" },
      { id: "Embedded Systems and Firmware", label: "Embedded Firmware & RTOS", desc: "Bare-metal C/C++, ARM Cortex microcontrollers, and FreeRTOS drivers", icon: "terminal" },
      { id: "PCB Design and Hardware Prototyping", label: "High-Speed PCB Design", desc: "Multilayer PCB routing, signal integrity, impedance matching, and Altium", icon: "layers" },
      { id: "Analog and Mixed-Signal Design", label: "Analog & RF Circuit Design", desc: "Op-amps, PLLs, ADCs/DACs, and RF transceiver frontends", icon: "activity" },
      { id: "Internet of Things and Wireless Devices", label: "Connected IoT Hardware", desc: "BLE, Wi-Fi 6, Zigbee, low-power sensor nodes, and MQTT telemetry", icon: "wifi" },
      { id: "Semiconductor Fabrication and Verification", label: "Design Verification (UVM)", desc: "Universal Verification Methodology, testbenches, and functional coverage", icon: "check-circle" }
    ],
    scenarios: [
      {
        id: "ece-sc-1",
        domain: "Embedded Firmware",
        title: "Intermittent Microcontroller Hard-Fault Lockup",
        situation: "An ARM Cortex-M4 IoT controller locks up into a HardFault exception after 24 to 72 hours of uninterrupted field operation. What is your diagnostic procedure?",
        options: [
          { label: "Analyze stack pointer registers and memory watermarking to detect RTOS task stack overflow", trait: "Embedded RTOS Debugging" },
          { label: "Probe the 3.3V power rails with an oscilloscope to check for brownout transients during radio bursts", trait: "Hardware Signal Integrity" },
          { label: "Inspect DMA buffer boundary indices and pointer arithmetic for buffer overflow memory corruption", trait: "Low-Level Firmware Verification" },
          { label: "Enable hardware watchdog timer resets with fault log dumps into non-volatile EEPROM", trait: "Fault Recovery Architecture" }
        ]
      },
      {
        id: "ece-sc-2",
        domain: "VLSI Design",
        title: "Setup Time Violation on Critical Arithmetic Clock Path",
        situation: "Post-synthesis static timing analysis (STA) on a custom 32-bit RISC-V pipelined ALU reveals a -180ps setup time timing violation at 500 MHz. What is your fix?",
        options: [
          { label: "Insert an additional pipeline stage (retiming) to divide the combinatorial carry-lookahead adder path", trait: "RTL Architecture & Retiming" },
          { label: "Substitute target cells in the critical path with low-Vth (LVT) high-drive standard cells", trait: "Physical Synthesis & Cell Sizing" },
          { label: "Optimize clock tree synthesis (CTS) to introduce useful clock skew at the receiving flip-flop", trait: "Static Timing Analysis & CTS" },
          { label: "Re-synthesize using tighter constraint directives and register balancing in the EDA tool", trait: "EDA Synthesis Optimization" }
        ]
      }
    ],
    challenges: [
      { id: "Writing clean RTL in Verilog or SystemVerilog", label: "Writing synthesizable digital RTL logic in Verilog and building UVM testbenches", focus: "VLSI Design" },
      { id: "Writing robust low-level C firmware drivers", label: "Writing low-overhead interrupt handlers, peripheral drivers, and RTOS threads", focus: "Embedded Firmware" },
      { id: "Routing high-speed multi-layer PCBs", label: "Designing multilayer PCBs with controlled impedance, EMI shielding, and thermal vias", focus: "Hardware Design" },
      { id: "Debugging mixed-signal analog hardware", label: "Testing noisy sensor analog frontends, filters, and high-frequency clock signals", focus: "Analog & RF" }
    ],
    environments: ["Electronics Laboratory", "Semiconductor Company", "R&D Center", "Product-based Company", "Testing Laboratory"],
    sectors: ["Semiconductors", "Electronics Manufacturing", "Automotive", "Defense & Aerospace"],
    skillsCatalog: [
      { category: "VLSI & Digital Design", skills: ["Verilog", "VHDL", "SystemVerilog", "Digital Electronics", "FPGA"] },
      { category: "Embedded & Hardware", skills: ["Embedded C", "Microcontrollers", "C", "PCB Design", "Arduino", "ESP32"] },
      { category: "Protocols & Testing", skills: ["Circuit Design", "IoT", "MQTT", "Signal Processing", "Linux"] }
    ],
    suggestedDesiredSkills: ["Verilog", "Embedded C", "PCB Design", "SystemVerilog"],
    defaultProblemSolvingStyle: "Logical & Algorithmic"
  },

  "chemical-process": {
    id: "chemical-process",
    title: "Chemical & Process Engineering",
    subtitle: "Chemical plants, Aspen Plus, thermodynamics, process safety, refining & reaction design",
    iconName: "FlaskConical",
    gradient: "from-teal-600 to-cyan-700",
    borderHover: "hover:border-teal-500",
    v8Defaults: {
      careerGoal: "Optimize industrial processes",
      targetSector: "Chemicals",
      preferredEnvironment: "Chemical Plant",
      interestArea: "Chemical Processes",
      programmingLanguages: "None / Basic Scripting",
      primarySkill: "Process Simulation",
      secondarySkill: "Aspen Plus",
      technicalProficiency: "Intermediate"
    },
    interests: [
      { id: "Chemical and Process Engineering", label: "Chemical Process Simulation & Flowsheeting", desc: "Steady-state and dynamic process modeling in Aspen Plus/HYSYS", icon: "activity" },
      { id: "Reaction Engineering and Catalysis", label: "Reaction Engineering & Reactor Design", desc: "Chemical kinetics, catalyst deactivation, and packed-bed reactor modeling", icon: "flame" },
      { id: "Mass Transfer and Separation Systems", label: "Separation Processes & Distillation", desc: "Fractionation columns, liquid-liquid extraction, membrane separation", icon: "filter" },
      { id: "Process Safety and Risk Assessment", label: "Process Safety & HAZOP Analysis", desc: "Hazard and operability studies, pressure relief valves, and plant safety", icon: "shield" },
      { id: "Industrial Polymers and Specialty Chemicals", label: "Polymers, Petrochemicals & Materials", desc: "Polymerization processes, specialty biochemicals, and rheology", icon: "box" },
      { id: "Energy Integration and Plant Optimization", label: "Pinch Analysis & Energy Efficiency", desc: "Heat exchanger networks, energy minimization, and carbon footprint reduction", icon: "sun" }
    ],
    scenarios: [
      {
        id: "chem-sc-1",
        domain: "Process Engineering",
        title: "Exothermic CSTR Thermal Runaway Hazard",
        situation: "A continuous stirred tank reactor (CSTR) conducting an exothermic synthesis experiences an uncontrolled 18°C temperature climb when feed throughput is ramped by 20%. What is your immediate action?",
        options: [
          { label: "Throttle reactor feed rate and open automated chilled-water cooling jacket cascade control valves", trait: "Emergency Process Control" },
          { label: "Model heat generation vs heat removal curves in Aspen Plus to verify jacket heat transfer limit", trait: "Thermodynamic Modeling" },
          { label: "Inspect reactor agitator impeller speed and baffle clearances to eliminate localized hot spots", trait: "Mixing Hydrodynamics" },
          { label: "Trigger automated inhibitor injection and safety relief vent before bursting disc rupture", trait: "Process Safety & HAZOP" }
        ]
      },
      {
        id: "chem-sc-2",
        domain: "Separation Systems",
        title: "Distillation Column Overhead Off-Spec Impurity",
        situation: "The top distillate product of a multi-component hydrocarbon distillation column fails purity specifications by 2.4%. How do you correct the operation?",
        options: [
          { label: "Increase the internal reflux ratio and adjust condenser subcooling temperature setpoint", trait: "Distillation Tray Equilibrium" },
          { label: "Audit differential pressure gauges across upper packing beds to check for column flooding", trait: "Hydraulic Column Diagnostics" },
          { label: "Re-tune reboiler steam heat duty to prevent heavier boiling components from vaporizing overhead", trait: "Heat Duty Optimization" },
          { label: "Calibrate online gas chromatography analyzers to verify feed compositional variations", trait: "Process Analytical Instrumentation" }
        ]
      }
    ],
    challenges: [
      { id: "Simulating chemical flowsheets in Aspen Plus", label: "Developing mass and energy balance flowsheets in Aspen Plus or ChemCAD", focus: "Process Simulation" },
      { id: "Designing safe industrial chemical reactors", label: "Sizing chemical reactors, heat exchangers, and separation columns", focus: "Equipment Design" },
      { id: "Conducting rigorous HAZOP process safety audits", label: "Conducting hazard operability reviews, safety instrumented systems (SIS) audits", focus: "Process Safety" },
      { id: "Optimizing plant energy consumption", label: "Performing pinch analysis to recover industrial waste heat and cut fuel costs", focus: "Energy Optimization" }
    ],
    environments: ["Chemical Plant", "Core Manufacturing", "R&D Center", "Design Office", "Testing Laboratory"],
    sectors: ["Chemicals", "Pharmaceuticals", "CleanTech & Energy", "Core Manufacturing"],
    skillsCatalog: [
      { category: "Simulation & Modeling", skills: ["Aspen Plus", "Process Simulation", "ChemCAD", "MATLAB"] },
      { category: "Engineering Principles", skills: ["Thermodynamics", "Reaction Engineering", "Mass Transfer", "Process Control"] },
      { category: "Plant Operations & Safety", skills: ["Plant Safety", "Fluid Dynamics", "Process Design", "Quality Assurance"] }
    ],
    suggestedDesiredSkills: ["Aspen Plus", "Process Simulation", "Thermodynamics", "ChemCAD"],
    defaultProblemSolvingStyle: "Analytical & Quantitative"
  },

  "biotech-lifesciences": {
    id: "biotech-lifesciences",
    title: "Biotechnology & Life Sciences",
    subtitle: "Bioinformatics, molecular biology, genetics, bioprocesses, pharma & medical devices",
    iconName: "Atom",
    gradient: "from-rose-600 to-pink-700",
    borderHover: "hover:border-rose-500",
    v8Defaults: {
      careerGoal: "Conduct biological research",
      targetSector: "Healthcare & Biotech",
      preferredEnvironment: "Research Laboratory",
      interestArea: "Biotechnology & Genomics",
      programmingLanguages: "R, MATLAB",
      primarySkill: "Bioinformatics",
      secondarySkill: "Molecular Biology",
      technicalProficiency: "Intermediate"
    },
    interests: [
      { id: "Biotechnology and Biomedical Research", label: "Molecular Biology & Genetic Engineering", desc: "CRISPR gene editing, cloning, recombinant proteins, and PCR assays", icon: "activity" },
      { id: "Bioinformatics and Computational Biology", label: "Bioinformatics & Genomic Data", desc: "Next-generation sequencing (NGS), BLAST, protein folding, and Python/R biostats", icon: "database" },
      { id: "Bioprocess Engineering and Fermentation", label: "Bioprocess Engineering & Bioreactors", desc: "Cell culture growth kinetics, fermentation scale-up, and downstream harvesting", icon: "flask" },
      { id: "Biomedical Instrumentation and Devices", label: "Biomedical Devices & Biosensors", desc: "Wearable health sensors, diagnostic microfluidics, and medical optics", icon: "heart" },
      { id: "Pharmaceutical Research and Drug Discovery", label: "Drug Discovery & Molecular Docking", desc: "Ligand-receptor docking, pharmacokinetics, and clinical trial analytics", icon: "shield" },
      { id: "Environmental and Agricultural Biotechnology", label: "Agritech & Bio-Remediation", desc: "Bio-fertilizers, transgenic crop traits, and environmental waste bioremediation", icon: "leaf" }
    ],
    scenarios: [
      {
        id: "bio-sc-1",
        domain: "Biotechnology",
        title: "Recombinant Bioreactor Protein Yield Drop",
        situation: "An industrial pilot bioreactor expressing a therapeutic monoclonal antibody shows a 40% decline in target protein titer compared to shake-flask trials. What do you investigate?",
        options: [
          { label: "Analyze dissolved oxygen (DO) saturation and impeller shear stress cell viability profiles", trait: "Bioprocess Kinetics & Fermentation" },
          { label: "Sequence plasmid stability and promoter copy number in host production cells", trait: "Molecular Genetics & Vector Stability" },
          { label: "Inspect HPLC chromatography fractions to detect unwanted proteolysis and aggregation", trait: "Downstream Bio-Separations" },
          { label: "Reformulate media trace minerals, amino acid feeding feeds, and pH buffer balance", trait: "Cell Culture Media Optimization" }
        ]
      },
      {
        id: "bio-sc-2",
        domain: "Computational Biology",
        title: "Ambiguous Variant Reads in RNA-Seq Pipeline",
        situation: "A high-throughput transcriptomic RNA-Seq workflow flags hundreds of ambiguous low-confidence splice variants in patient disease samples. How do you validate?",
        options: [
          { label: "Refine sequence read alignment heuristics and filter PCR duplication artifacts in R/Python", trait: "Bioinformatics Pipeline Engineering" },
          { label: "Validate top candidate splice junctions through quantitative RT-qPCR assay primers in wet lab", trait: "Experimental Assay Validation" },
          { label: "Cross-reference genomic variant frequencies against NCBI ClinVar and gnomAD databases", trait: "Genomic Data Mining" },
          { label: "Apply structural homology modeling to evaluate predicted protein conformational impacts", trait: "Protein Structural Modeling" }
        ]
      }
    ],
    challenges: [
      { id: "Analyzing large-scale genomic and proteomic datasets", label: "Processing next-generation sequencing data in Python, R, and Bioconductor", focus: "Bioinformatics" },
      { id: "Optimizing wet-lab molecular biological assays", label: "Performing PCR, gel electrophoresis, cell culture, and Western blotting", focus: "Laboratory Research" },
      { id: "Scaling up microbial fermentation bioreactors", label: "Scaling up industrial fermentation bioreactors while maintaining sterile purity", focus: "Bioprocess Engineering" },
      { id: "Designing biomedical biosensors and devices", label: "Designing microfluidic cartridges or biocompatible electronic health monitors", focus: "Biomedical Devices" }
    ],
    environments: ["Research Laboratory", "Healthcare & Biotech", "Testing Laboratory", "University", "R&D Center"],
    sectors: ["Healthcare & Biotech", "Pharmaceuticals", "Research", "Higher Education"],
    skillsCatalog: [
      { category: "Genomics & Bioinformatics", skills: ["Bioinformatics", "R", "Python", "Molecular Biology", "Mathematics"] },
      { category: "Lab & Biological Techniques", skills: ["Cell Culture", "Microbiology", "Biochemistry", "Genetics", "Research Methods"] },
      { category: "Bioprocess & Pharma", skills: ["Bioprocess Engineering", "Biomedical Instrumentation", "Quality Assurance", "Chromatography"] }
    ],
    suggestedDesiredSkills: ["Bioinformatics", "Molecular Biology", "R", "Bioprocess Engineering"],
    defaultProblemSolvingStyle: "Research & Scientific"
  },

  "cybersecurity-networks": {
    id: "cybersecurity-networks",
    title: "Cybersecurity & Networks",
    subtitle: "Ethical hacking, SOC defense, penetration testing, network engineering & cloud security",
    iconName: "Shield",
    gradient: "from-emerald-600 to-green-700",
    borderHover: "hover:border-emerald-500",
    v8Defaults: {
      careerGoal: "Secure networks and enterprise applications",
      targetSector: "Information Technology",
      preferredEnvironment: "Security Operations Center",
      interestArea: "Cybersecurity",
      programmingLanguages: "Python, Bash",
      primarySkill: "Kali Linux",
      secondarySkill: "Networking",
      technicalProficiency: "Intermediate"
    },
    interests: [
      { id: "Network Security and Infrastructure Defense", label: "SOC & Defensive Operations (Blue Team)", desc: "SIEM monitoring, threat detection, incident triage, and firewall hardening", icon: "shield" },
      { id: "Ethical Hacking and Penetration Testing", label: "Ethical Hacking & Red Teaming", desc: "Penetration testing, exploit development, Metasploit, and vulnerability research", icon: "target" },
      { id: "Application Security and Secure Coding", label: "Application Security (AppSec)", desc: "OWASP Top 10 mitigation, code auditing, DevSecOps, and API security", icon: "code" },
      { id: "Digital Forensics and Incident Response", label: "Digital Forensics & Malware Analysis", desc: "Memory forensics, disk image carving, reverse engineering, and threat hunting", icon: "search" },
      { id: "Cloud Security and Identity Governance", label: "Cloud Security & Zero Trust", desc: "AWS IAM policies, Kubernetes hardening, zero-trust network architectures", icon: "cloud" },
      { id: "Cryptography and Secure Protocols", label: "Cryptography & Privacy Engineering", desc: "PKI, TLS/SSL, end-to-end encryption, homomorphic encryption, and compliance", icon: "lock" }
    ],
    scenarios: [
      {
        id: "sec-sc-1",
        domain: "Security Operations",
        title: "Anomalous Encrypted Data Exfiltration Alert",
        situation: "Your SOC SIEM detects anomalous encrypted outbound beaconing from a production database server to an unknown foreign IP address at 2:00 AM. What is your immediate protocol?",
        options: [
          { label: "Isolate the compromised host at network layer and revoke all active service credentials", trait: "Incident Containment & Response" },
          { label: "Analyze Wireshark PCAP packets to identify Command and Control (C2) beacon cadence", trait: "Network Traffic Forensics" },
          { label: "Dump volatile RAM memory image to extract active malware strings and injected DLLs", trait: "Host Memory Forensics" },
          { label: "Audit database access query audit logs to determine the exact blast radius of data accessed", trait: "Data Breach Assessment" }
        ]
      },
      {
        id: "sec-sc-2",
        domain: "Application Security",
        title: "Zero-Day Vulnerability in Customer Auth API",
        situation: "A security researcher responsibly discloses an unauthenticated broken object level authorization (BOLA) flaw allowing unauthorized access to customer account profiles. How do you remediate?",
        options: [
          { label: "Deploy an immediate Web Application Firewall (WAF) regex inspection rule to block exploitation vectors", trait: "Immediate Threat Shielding" },
          { label: "Refactor API middleware to enforce strict server-side cryptographic token-to-record ownership validation", trait: "Secure Code Remediation" },
          { label: "Scan historical access logs to confirm whether the vulnerability was previously exploited by threat actors", trait: "Forensic Log Auditing" },
          { label: "Incorporate automated regression security unit tests into CI/CD pipeline to prevent future regressions", trait: "DevSecOps Integration" }
        ]
      }
    ],
    challenges: [
      { id: "Conducting systematic penetration tests", label: "Discovering web and network vulnerabilities using Kali Linux and Burp Suite", focus: "Penetration Testing" },
      { id: "Defending networks against live intrusions", label: "Configuring SIEM detection rules, firewalls, and responding to cyber incidents", focus: "Blue Team Defense" },
      { id: "Hardening cloud infrastructure and containers", label: "Securing Docker, Kubernetes, and cloud IAM permissions under zero-trust", focus: "Cloud Security" },
      { id: "Auditing application source code for flaws", label: "Analyzing application codebases for memory leaks, injections, and logic bugs", focus: "AppSec" }
    ],
    environments: ["Security Operations Center", "Security Testing Lab", "Product-based Company", "Corporate Office", "Remote / Hybrid"],
    sectors: ["Information Technology", "FinTech", "Government", "Consulting", "Defense & Aerospace"],
    skillsCatalog: [
      { category: "Offensive Security", skills: ["Kali Linux", "Burp Suite", "Metasploit", "Python", "Linux"] },
      { category: "Defensive & Networks", skills: ["Networking", "Firewalls", "Wireshark", "Cisco", "Cloud Security"] },
      { category: "Infrastructure & Identity", skills: ["AWS", "Docker", "Git", "Cryptography", "Information Governance"] }
    ],
    suggestedDesiredSkills: ["Kali Linux", "Burp Suite", "Networking", "Wireshark"],
    defaultProblemSolvingStyle: "Logical & Algorithmic"
  },

  "business-management": {
    id: "business-management",
    title: "Business & Management",
    subtitle: "Product management, tech consulting, business analytics, startup leadership & strategy",
    iconName: "Briefcase",
    gradient: "from-amber-600 to-orange-600",
    borderHover: "hover:border-amber-500",
    v8Defaults: {
      careerGoal: "Analyze business data for insights",
      targetSector: "Consulting",
      preferredEnvironment: "Corporate Office",
      interestArea: "Business Analytics",
      programmingLanguages: "SQL, Excel",
      primarySkill: "Power BI",
      secondarySkill: "Excel",
      technicalProficiency: "Intermediate"
    },
    interests: [
      { id: "Product Strategy and Management", label: "Technical Product Management (TPM)", desc: "User story definition, sprint roadmaps, feature prioritization, and engineering coordination", icon: "compass" },
      { id: "Business Intelligence and Data Analytics", label: "Business Analytics & Dashboards", desc: "Power BI, Tableau, SQL queries, KPI metrics, and executive reporting", icon: "bar-chart" },
      { id: "Technology Consulting and Digital Transformation", label: "Tech Consulting & Strategy", desc: "Advising enterprise clients on IT modernization, vendor selection, and change management", icon: "briefcase" },
      { id: "Entrepreneurship and Startup Building", label: "Entrepreneurship & Venture Building", desc: "Customer discovery, product-market fit, unit economics, fundraising, and pitch decks", icon: "rocket" },
      { id: "Operations and Engineering Management", label: "Engineering Operations & Agile Delivery", desc: "Scrum ceremonies, resource capacity planning, OKRs, and risk mitigation", icon: "check-square" },
      { id: "Financial Modeling and Tech Economics", label: "FinTech & Financial Modeling", desc: "Valuation models, SaaS metrics (CAC, LTV, MRR), pricing strategy, and forecasting", icon: "dollar-sign" }
    ],
    scenarios: [
      {
        id: "biz-sc-1",
        domain: "Product Management",
        title: "Product Feature Launch Underperformance",
        situation: "A newly engineered B2B analytics module with superior compute performance is experiencing 60% lower user adoption than projected 30 days after launch. What do you do?",
        options: [
          { label: "Conduct structured user discovery interviews to uncover onboarding friction and cognitive load", trait: "User Research & Product Intuition" },
          { label: "Analyze user session telemetry drop-off funnels in Mixpanel to locate abandonment points", trait: "Quantitative Analytics & Metrics" },
          { label: "Re-evaluate market positioning, pricing tiers, and provide targeted interactive walkthroughs", trait: "Go-to-Market Strategy" },
          { label: "Collaborate with engineering to simplify the user workflow into a one-click automated action", trait: "Feature Design & UX Optimization" }
        ]
      },
      {
        id: "biz-sc-2",
        domain: "Operations & Consulting",
        title: "Client Scope Creep & Milestone Slippage",
        situation: "An enterprise transformation client requests additional custom integrations two weeks before contract milestone delivery, threatening a delivery delay. How do you resolve?",
        options: [
          { label: "Perform critical-path trade-off analysis and present a phased release roadmap for executive signoff", trait: "Stakeholder Management & Negotiation" },
          { label: "Re-scope non-essential deliverables while delivering core mission-critical features on time", trait: "Agile Scope Triage" },
          { label: "Formulate a transparent change-order outlining budget adjustments and realistic timeline shifts", trait: "Contractual & Project Governance" },
          { label: "Reallocate cross-functional engineering resources to absorb the integration work without overtime", trait: "Resource Optimization" }
        ]
      }
    ],
    challenges: [
      { id: "Translating customer pain points into roadmaps", label: "Translating customer pain points into clear technical specifications and PRDs", focus: "Product Management" },
      { id: "Building executive business intelligence dashboards", label: "Analyzing enterprise datasets and building executive dashboards in Power BI", focus: "Business Analytics" },
      { id: "Leading cross-disciplinary teams under deadlines", label: "Leading cross-functional engineering teams and facilitating sprint delivery", focus: "Leadership" },
      { id: "Evaluating venture unit economics and strategy", label: "Evaluating business models, unit economics, customer acquisition, and market size", focus: "Entrepreneurship" }
    ],
    environments: ["Corporate Office", "Consulting", "Startup", "Remote / Hybrid", "Product-based Company"],
    sectors: ["Consulting", "Information Technology", "FinTech", "Core Manufacturing", "EdTech"],
    skillsCatalog: [
      { category: "Analytics & BI", skills: ["Power BI", "Tableau", "Excel", "SQL", "Data Analysis"] },
      { category: "Management & Strategy", skills: ["Business Modeling", "Project Management", "Product Design", "Team Leadership"] },
      { category: "Communication & Tools", skills: ["Technical Writing", "Public Speaking", "Agile Methodologies", "Jira"] }
    ],
    suggestedDesiredSkills: ["Power BI", "SQL", "Business Modeling", "Product Design"],
    defaultProblemSolvingStyle: "Analytical & Quantitative"
  },

  "research-higherstudies": {
    id: "research-higherstudies",
    title: "Research & Higher Studies",
    subtitle: "Scientific inquiry, GRE/GATE, Master's/Ph.D. tracks, publications & corporate R&D",
    iconName: "GraduationCap",
    gradient: "from-indigo-600 to-blue-800",
    borderHover: "hover:border-indigo-500",
    v8Defaults: {
      careerGoal: "Conduct cutting-edge scientific research",
      targetSector: "Research",
      preferredEnvironment: "Research Laboratory",
      interestArea: "Scientific Research",
      programmingLanguages: "Python, R",
      primarySkill: "Research Methods",
      secondarySkill: "Mathematics",
      technicalProficiency: "Intermediate"
    },
    interests: [
      { id: "Scientific Research and Innovation", label: "Fundamental & Applied Research", desc: "Hypothesis testing, literature surveys, novel experimentation, and peer-reviewed journals", icon: "book-open" },
      { id: "Mathematical and Computational Modeling", label: "Mathematical & Algorithmic Modeling", desc: "Differential equations, stochastic processes, numerical methods, and simulations", icon: "activity" },
      { id: "Postgraduate Academic Pursuits (MS / PhD)", label: "Master's & Ph.D. Pathways", desc: "Graduate research assistantships, thesis defense, academic grant writing, and scholarships", icon: "award" },
      { id: "Interdisciplinary Emerging Technologies", label: "Emerging Tech & Frontier Science", desc: "Quantum computing, advanced nanomaterials, brain-computer interfaces, and synthetic bio", icon: "sparkles" },
      { id: "Academic Teaching and Mentorship", label: "Academic Pedagogy & Mentorship", desc: "University teaching, curriculum design, student laboratory guidance, and academic leadership", icon: "users" },
      { id: "Industrial R&D and Intellectual Property", label: "Industrial R&D & Patent Innovation", desc: "Translating lab discoveries into patentable commercial innovations in corporate labs", icon: "shield" }
    ],
    scenarios: [
      {
        id: "res-sc-1",
        domain: "Scientific Inquiry",
        title: "Unexpected Experimental Anomaly Contradicts Literature",
        situation: "Your rigorous laboratory experiment repeatedly produces a statistically significant result that directly contradicts prevailing peer-reviewed academic literature. What is your response?",
        options: [
          { label: "Conduct a systematic error audit on equipment calibration, sensor drift, and reagents", trait: "Scientific Rigor & Error Analysis" },
          { label: "Formulate an alternative physical hypothesis and design double-blind orthogonal control trials", trait: "Hypothesis Formulation" },
          { label: "Perform comprehensive literature synthesis to locate boundary conditions where theory breaks down", trait: "Literature Synthesis" },
          { label: "Document the empirical findings and prepare a manuscript presenting the reproducible anomaly", trait: "Academic Publication" }
        ]
      },
      {
        id: "res-sc-2",
        domain: "Numerical Simulation",
        title: "Numerical Instability in High-Fidelity Simulation",
        situation: "A complex partial differential equation (PDE) simulation model diverges and outputs NaN values at high Reynolds numbers. How do you resolve this?",
        options: [
          { label: "Refine spatial mesh resolution and decrease numerical integration time step (CFL condition)", trait: "Numerical Methods & Discretization" },
          { label: "Switch from explicit time-marching to an implicit solver with stabilized flux limiters", trait: "Computational Mathematics" },
          { label: "Benchmark the numerical solver against classical analytical solutions for simple geometries", trait: "Model Verification & Validation" },
          { label: "Accelerate matrix solver computations using GPU-parallelized sparse algebraic multigrid", trait: "High-Performance Computing" }
        ]
      }
    ],
    challenges: [
      { id: "Formulating novel scientific hypotheses", label: "Formulating testable hypotheses and designing controlled experiments", focus: "Scientific Method" },
      { id: "Solving advanced mathematical and modeling problems", label: "Deriving mathematical formulations and solving differential equations", focus: "Applied Mathematics" },
      { id: "Writing rigorous scientific research papers", label: "Synthesizing research literature and authoring peer-reviewed conference papers", focus: "Scientific Writing" },
      { id: "Benchmarking and validating novel algorithms", label: "Statistically validating algorithms against empirical baselines with significance tests", focus: "Validation" }
    ],
    environments: ["Research Laboratory", "University", "R&D Center", "Testing Laboratory", "Government Organization"],
    sectors: ["Research", "Higher Education", "Defense & Aerospace", "Healthcare & Biotech"],
    skillsCatalog: [
      { category: "Research & Mathematics", skills: ["Research Methods", "Mathematics", "Python", "R", "Jupyter"] },
      { category: "Simulation & Analytics", skills: ["MATLAB", "Statistical Modeling", "Data Analysis", "Scikit-learn"] },
      { category: "Academic & Communication", skills: ["Technical Writing", "Critical Thinking", "Problem Solving", "Literature Review"] }
    ],
    suggestedDesiredSkills: ["Research Methods", "Mathematics", "MATLAB", "Python"],
    defaultProblemSolvingStyle: "Research & Scientific"
  },

  "undecided": {
    id: "undecided",
    title: "Explore Multiple Fields (Discovery Mode)",
    subtitle: "Open-ended exploration across software, hardware, manufacturing, and analytics",
    iconName: "Compass",
    gradient: "from-slate-600 to-indigo-700",
    borderHover: "hover:border-indigo-400",
    v8Defaults: {
      careerGoal: "Build products that solve real problems",
      targetSector: "Information Technology",
      preferredEnvironment: "Product-based Company",
      interestArea: "Software Development",
      programmingLanguages: "None / Basic Scripting",
      primarySkill: "Problem Solving",
      secondarySkill: "Analytical Thinking",
      technicalProficiency: "Beginner"
    },
    interests: [
      { id: "Software and Application Development", label: "Software & Digital Systems", desc: "Building apps, websites, APIs, and cloud services", icon: "code" },
      { id: "Artificial Intelligence and Machine Learning", label: "Artificial Intelligence & Data Insights", desc: "Predictive algorithms, machine learning, and data analytics", icon: "brain" },
      { id: "Robotics and Automation", label: "Robotics, Automation & Mechatronics", desc: "Smart machinery, sensors, actuators, and autonomous systems", icon: "cpu" },
      { id: "Mechanical Design and Manufacturing", label: "Mechanical Products & Design", desc: "Physical machinery, CAD models, and manufacturing processes", icon: "settings" },
      { id: "Civil Engineering and Infrastructure", label: "Civil Infrastructure & Smart Cities", desc: "Structures, sustainable buildings, and transportation networks", icon: "building" },
      { id: "Electronics and Circuit Design", label: "Electronics & Microchip Hardware", desc: "Circuits, embedded devices, IoT, and microcontrollers", icon: "zap" }
    ],
    scenarios: [
      {
        id: "und-sc-1",
        domain: "Cross-Disciplinary Problem",
        title: "Smart Factory Automation Downtime",
        situation: "An automated factory production line unexpectedly halts during full operation. Which aspect would you instinctively gravitate towards to solve it?",
        options: [
          { label: "Debug the software control logic, error codes, and server communication logs", trait: "Software & Logic Debugging" },
          { label: "Inspect the mechanical actuators, conveyor belts, and pneumatic pressure valves", trait: "Mechanical Troubleshooting" },
          { label: "Examine power supply voltage fluctuations, sensor wiring, and circuit breakers", trait: "Electrical & Instrumentation" },
          { label: "Coordinate with floor supervisors to manage inventory logistics and operator workflow", trait: "Process & Operations Coordination" }
        ]
      },
      {
        id: "und-sc-2",
        domain: "Product Development",
        title: "Designing a Clean Mobility Solution",
        situation: "A team is developing a next-generation lightweight clean electric two-wheeler. Where would you most want to contribute your effort?",
        options: [
          { label: "Developing the smart dashboard mobile app, navigation UI, and vehicle telemetry cloud", trait: "Software & User Experience" },
          { label: "Designing the aerodynamic chassis frame, suspension geometry, and crash ergonomics", trait: "Mechanical & Industrial Design" },
          { label: "Engineering the battery pack thermal cooling, power electronics inverter, and motor drive", trait: "Electrical & Powertrain Engineering" },
          { label: "Conducting market research, user surveys, unit pricing, and go-to-market strategy", trait: "Business & Product Strategy" }
        ]
      }
    ],
    challenges: [
      { id: "Building software applications and digital solutions", label: "Writing code and building software applications that solve problems", focus: "Software" },
      { id: "Designing physical hardware and machinery", label: "Working with physical machines, 3D CAD models, or electronic circuits", focus: "Physical Hardware" },
      { id: "Analyzing data to identify trends and patterns", label: "Examining charts, metrics, and data distributions to find insights", focus: "Data & Analysis" },
      { id: "Leading projects and coordinating cross-discipline teams", label: "Organizing project milestones, managing stakeholders, and teamwork", focus: "Management" }
    ],
    environments: ["Product-based Company", "R&D Center", "Core Manufacturing", "Corporate Office", "Design Office"],
    sectors: ["Information Technology", "Core Manufacturing", "Automotive", "CleanTech & Energy", "Construction"],
    skillsCatalog: [
      { category: "Foundational & Software", skills: ["Python", "Java", "SQL", "JavaScript", "Problem Solving"] },
      { category: "Core Engineering", skills: ["SolidWorks", "AutoCAD", "MATLAB", "PLC", "Circuit Design"] },
      { category: "Professional & Analysis", skills: ["Data Analysis", "Project Management", "Technical Writing", "Excel"] }
    ],
    suggestedDesiredSkills: ["Python", "SQL", "SolidWorks", "Problem Solving"],
    defaultProblemSolvingStyle: "Logical & Algorithmic"
  }
};

/**
 * Get active configuration for a selected direction
 */
export function getAdaptiveConfig(directionId: string): CareerDirectionConfig {
  return CAREER_DIRECTIONS[directionId] || CAREER_DIRECTIONS["undecided"];
}

/**
 * Helper to construct the exact canonical 20-feature V8 profile
 */
export function constructCanonicalV8Profile(params: {
  branch: string;
  specialization: string;
  cgpa: number | string;
  primaryDirectionId: string;
  selectedInterests: string[];
  existingSkills: { name: string; proficiency: string }[];
  programmingLanguages: string;
  technicalProficiency: string;
  certifications?: string;
  workEnvironment: string;
  targetSector: string;
  expectedSalary: number | string;
  higherStudiesInterest: string;
  researchInterest?: string;
  problemSolvingStyle?: string;
  startupInterest?: string;
  customCareerGoal?: string;
}) {
  const config = getAdaptiveConfig(params.primaryDirectionId);
  const numCgpa = typeof params.cgpa === "number" ? params.cgpa : parseFloat(params.cgpa) || 8.0;

  // Academic performance bucket
  let academicPerf = "Good";
  if (numCgpa >= 8.5) academicPerf = "Excellent";
  else if (numCgpa >= 7.5) academicPerf = "Good";
  else if (numCgpa >= 6.5) academicPerf = "Average";
  else academicPerf = "Below Average";

  // Primary & Secondary Skills: Strictly genuinely possessed skills
  let primarySkill = params.existingSkills[0]?.name;
  let secondarySkill = params.existingSkills[1]?.name || params.existingSkills[0]?.name;

  if (!primarySkill) {
    primarySkill = config.v8Defaults.primarySkill;
    secondarySkill = config.v8Defaults.secondarySkill;
  }

  // Target Sector
  const targetSector = params.targetSector || config.v8Defaults.targetSector;

  // Career Goal
  const careerGoal = params.customCareerGoal || config.v8Defaults.careerGoal;

  // Environment
  const env = params.workEnvironment || config.v8Defaults.preferredEnvironment;

  // Interest Area
  const interestArea = params.selectedInterests[0] || config.v8Defaults.interestArea;

  // Languages
  const languages = params.programmingLanguages || config.v8Defaults.programmingLanguages;

  // Problem solving level
  let problemSolvingLvl = "Intermediate";
  const pStyle = params.problemSolvingStyle || config.defaultProblemSolvingStyle;
  if (pStyle.includes("Algorithmic") || pStyle.includes("Analytical") || params.technicalProficiency === "Advanced") {
    problemSolvingLvl = "Advanced";
  }

  // Research interest
  let resInterest = params.researchInterest || "Moderate";
  if (params.primaryDirectionId === "research-higherstudies" || params.selectedInterests.some(i => i.toLowerCase().includes("research"))) {
    resInterest = "High";
  }

  // Higher studies
  let higherStudies = params.higherStudiesInterest || "No";
  if (params.primaryDirectionId === "research-higherstudies") {
    higherStudies = "Yes";
  }

  return {
    Branch: params.branch,
    Specialization: params.specialization || "General",
    CGPA: numCgpa,
    Academic_Performance: academicPerf,
    Primary_Skill: primarySkill,
    Secondary_Skill: secondarySkill,
    Programming_Languages: languages,
    Technical_Proficiency: params.technicalProficiency || config.v8Defaults.technicalProficiency,
    Certifications: params.certifications || "None / In Progress",
    Interest_Area: interestArea,
    Career_Goal: careerGoal,
    Preferred_Environment: env,
    Target_Sector: targetSector,
    Expected_Salary: typeof params.expectedSalary === "number" ? params.expectedSalary : parseFloat(params.expectedSalary) || 10.0,
    Higher_Studies_Interest: higherStudies,
    Research_Interest: resInterest,
    Problem_Solving_Level: problemSolvingLvl,
    Communication_Level: "Good",
    Preferred_Location: "Flexible",
    Startup_Interest: params.startupInterest || "Moderate"
  };
}

