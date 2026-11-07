/**
 * Standardized Industry Learning Paths for Career Compass
 * Covers 10 high-demand engineering career paths:
 * 1. Full Stack Developer
 * 2. Data Engineer
 * 3. AI/ML Engineer
 * 4. Java Developer
 * 5. Python Developer
 * 6. Cybersecurity Engineer
 * 7. Cloud Engineer
 * 8. DevOps Engineer
 * 9. Frontend Developer
 * 10. Backend Developer
 */

const LEARNING_PATHS = [
    {
        id: 'data-engineer',
        title: 'Data Engineer Learning Path',
        role: 'Data Engineer',
        overview: 'Master data pipelines, distributed processing, SQL databases, big data architectures with Apache Spark, and cloud data warehousing on AWS/GCP.',
        careerObjective: 'Become a job-ready Data Engineer capable of designing scalable ETL/ELT pipelines, streaming architectures, and enterprise data warehouses.',
        requiredSkills: ['Python', 'SQL', 'Apache Spark', 'AWS', 'Data Warehousing', 'ETL Pipelines', 'Airflow', 'Kafka'],
        skillsSummary: 'Python • SQL • Spark • AWS • Data Warehousing',
        icon: 'database',
        color: 'from-blue-600 to-cyan-500',
        bgLight: 'bg-blue-50 text-blue-700 border-blue-200',
        estimatedDuration: '8 Weeks',
        totalCoursesCount: 10,
        stages: [
            {
                stageNumber: 1,
                name: 'Beginner',
                title: 'Data Engineering Foundations & Relational Modeling',
                duration: '2 Weeks',
                description: 'Master advanced SQL querying, data normalization, dimensional modeling, and Python scripting for data manipulation.',
                skills: ['Python', 'SQL', 'Relational Databases', 'Git'],
                courseIds: [4, 35, 101, 102],
                practicalProjects: [
                    'E-commerce Relational Schema & Analytical Reporting Queries',
                    'Automated CSV & JSON Data Ingestion Script with Python'
                ]
            },
            {
                stageNumber: 2,
                name: 'Intermediate',
                title: 'Distributed Processing & Big Data with Spark',
                duration: '3 Weeks',
                description: 'Build high-throughput distributed batch processing pipelines using PySpark, Parquet columnar storage, and Apache Airflow orchestration.',
                skills: ['Apache Spark', 'PySpark', 'ETL Pipelines', 'Data Warehousing'],
                courseIds: [3, 103],
                practicalProjects: [
                    'Multi-terabyte Log Processing Pipeline with PySpark',
                    'Scheduled ETL Orchestration DAG using Apache Airflow'
                ]
            },
            {
                stageNumber: 3,
                name: 'Advanced',
                title: 'Cloud Data Lakes, Warehouses & Real-Time Streaming',
                duration: '3 Weeks',
                description: 'Implement real-time streaming architectures using Apache Kafka and deploy cloud warehouses with Snowflake/BigQuery/AWS Redshift.',
                skills: ['AWS', 'Kafka', 'Streaming Architecture', 'Data Lakehouse'],
                courseIds: [33, 104, 45],
                practicalProjects: [
                    'Real-Time Financial Fraud Detection Streaming Engine with Kafka & Spark',
                    'End-to-End Enterprise Cloud Lakehouse on AWS Redshift & S3'
                ]
            }
        ],
        practicalProjects: [
            {
                title: 'Automated E-Commerce Data Ingestion & Warehouse Pipeline',
                difficulty: 'Intermediate',
                description: 'Extract raw transactions via REST APIs, transform using PySpark, and load into a dimensional star schema in Snowflake/Redshift.',
                techStack: ['Python', 'SQL', 'PySpark', 'Airflow', 'AWS S3']
            },
            {
                title: 'Real-Time Clickstream Analytics Platform',
                difficulty: 'Advanced',
                description: 'Ingest live website events using Apache Kafka, process aggregations with Spark Streaming, and visualize metrics in real-time dashboards.',
                techStack: ['Apache Kafka', 'PySpark', 'PostgreSQL', 'Docker']
            }
        ]
    },
    {
        id: 'full-stack-developer',
        title: 'Full Stack Developer Learning Path',
        role: 'Full Stack Developer',
        overview: 'Comprehensive full-stack roadmap from semantic HTML5 and modern React/TypeScript frontends to scalable Node.js/Express and MongoDB/PostgreSQL backends.',
        careerObjective: 'Build and deploy production-grade web applications with modern frontend frameworks, RESTful & GraphQL APIs, authentication, and cloud deployment.',
        requiredSkills: ['HTML', 'CSS', 'JavaScript', 'TypeScript', 'React', 'Node.js', 'Express', 'MongoDB', 'PostgreSQL', 'Git'],
        skillsSummary: 'HTML • React • Node.js • MongoDB • TypeScript',
        icon: 'terminal',
        color: 'from-rose-600 to-pink-500',
        bgLight: 'bg-rose-50 text-rose-700 border-rose-200',
        estimatedDuration: '10 Weeks',
        totalCoursesCount: 12,
        stages: [
            {
                stageNumber: 1,
                name: 'Beginner',
                title: 'Frontend Fundamentals & Modern JavaScript',
                duration: '3 Weeks',
                description: 'Master HTML5 semantic markup, CSS Flexbox/Grid layouts, DOM manipulation, ES6+ features, and Git version control.',
                skills: ['HTML', 'CSS', 'JavaScript', 'Git'],
                courseIds: [7, 8],
                practicalProjects: [
                    'Interactive Developer Portfolio with Responsive CSS & Dark Mode',
                    'Interactive Task Management App with LocalStorage & Vanilla JS'
                ]
            },
            {
                stageNumber: 2,
                name: 'Intermediate',
                title: 'React Component Architecture & TypeScript',
                duration: '4 Weeks',
                description: 'Build stateful Single Page Applications using React 19 hooks, component composition, Tailwind CSS, TypeScript type safety, and TanStack Query.',
                skills: ['React', 'TypeScript', 'Tailwind CSS', 'State Management'],
                courseIds: [5, 34, 46],
                practicalProjects: [
                    'Full-Featured E-Commerce Product Catalog with Cart and Filtering',
                    'Collaborative Kanban Board with Drag-and-Drop and TypeScript'
                ]
            },
            {
                stageNumber: 3,
                name: 'Advanced',
                title: 'Scalable Backend APIs, Databases & Cloud Deployment',
                duration: '3 Weeks',
                description: 'Design secure RESTful APIs with Node.js/Express, JWT authentication, MongoDB Mongoose, relational PostgreSQL, and containerized Docker deployment.',
                skills: ['Node.js', 'Express', 'MongoDB', 'Docker', 'Authentication'],
                courseIds: [6, 31, 35, 43],
                practicalProjects: [
                    'Real-Time Chat & Collaboration Platform with WebSockets and JWT Auth',
                    'Production SaaS Application Deployed via Docker and CI/CD'
                ]
            }
        ],
        practicalProjects: [
            {
                title: 'SaaS Multi-Tenant Project Management Suite',
                difficulty: 'Advanced',
                description: 'Build a production-grade workspace application with role-based access control (RBAC), payments, real-time messaging, and Docker deployment.',
                techStack: ['React', 'TypeScript', 'Node.js', 'Express', 'MongoDB', 'Docker']
            }
        ]
    },
    {
        id: 'ai-ml-engineer',
        title: 'AI/ML Engineer Learning Path',
        role: 'AI/ML Engineer',
        overview: 'Master mathematical foundations, classical machine learning, deep neural networks with PyTorch/TensorFlow, and large language model (LLM) fine-tuning.',
        careerObjective: 'Develop and operationalize cutting-edge machine learning and generative AI models for enterprise intelligence and computer vision/NLP.',
        requiredSkills: ['Python', 'NumPy', 'Pandas', 'Scikit-learn', 'PyTorch', 'TensorFlow', 'Deep Learning', 'NLP', 'MLOps'],
        skillsSummary: 'Python • ML • Deep Learning • NLP • PyTorch',
        icon: 'psychology',
        color: 'from-purple-600 to-indigo-500',
        bgLight: 'bg-purple-50 text-purple-700 border-purple-200',
        estimatedDuration: '12 Weeks',
        totalCoursesCount: 14,
        stages: [
            {
                stageNumber: 1,
                name: 'Beginner',
                title: 'Python for Data Science & Supervised Learning',
                duration: '4 Weeks',
                description: 'Master vector computation with NumPy, data cleaning with Pandas, visualization, and classical algorithms with Scikit-learn.',
                skills: ['Python', 'Data Analysis', 'Scikit-learn', 'Statistics'],
                courseIds: [1, 4],
                practicalProjects: [
                    'Customer Churn Prediction Model with Logistic Regression and Random Forests',
                    'Exploratory Data Analysis and Feature Engineering on Housing Market Data'
                ]
            },
            {
                stageNumber: 2,
                name: 'Intermediate',
                title: 'Deep Learning & Neural Architectures',
                duration: '4 Weeks',
                description: 'Implement convolutional neural networks (CNNs) for vision and recurrent/transformer architectures using PyTorch and Keras.',
                skills: ['PyTorch', 'TensorFlow', 'Deep Learning', 'Computer Vision'],
                courseIds: [37, 38],
                practicalProjects: [
                    'Medical Image Classification with Transfer Learning in PyTorch',
                    'Sentiment Analysis & Intent Classifier with Transformer Embeddings'
                ]
            },
            {
                stageNumber: 3,
                name: 'Advanced',
                title: 'LLMs, RAG Pipelines & MLOps Deployment',
                duration: '4 Weeks',
                description: 'Build Retrieval-Augmented Generation (RAG) agents with vector embeddings, fine-tune models, and deploy scalable inference APIs with FastAPI and Docker.',
                skills: ['NLP', 'RAG', 'Vector Databases', 'MLOps', 'FastAPI'],
                courseIds: [38, 6],
                practicalProjects: [
                    'Enterprise Document Q&A Agent using LangChain, ChromaDB, and FastAPI',
                    'Automated ML Model Training & Evaluation Pipeline with MLflow and Docker'
                ]
            }
        ],
        practicalProjects: [
            {
                title: 'Autonomous Multi-Document Knowledge Retrieval Engine',
                difficulty: 'Advanced',
                description: 'Design an end-to-end RAG system with hybrid semantic search, re-ranking, and guardrails deployed in a production microservice.',
                techStack: ['Python', 'PyTorch', 'FastAPI', 'ChromaDB', 'Docker']
            }
        ]
    },
    {
        id: 'cybersecurity-engineer',
        title: 'Cybersecurity Engineer Learning Path',
        role: 'Cybersecurity Engineer',
        overview: 'Learn defensive security, offensive penetration testing, network packet analysis, vulnerability management, and Security Operations Center (SOC) triage.',
        careerObjective: 'Safeguard digital infrastructure through security incident response, threat hunting, secure architecture design, and compliance audits.',
        requiredSkills: ['Networking', 'Linux', 'Network Security', 'Ethical Hacking', 'SOC Operations', 'Cryptography', 'SIEM'],
        skillsSummary: 'Networking • Linux • Security • SOC • SIEM',
        icon: 'shield',
        color: 'from-emerald-600 to-teal-500',
        bgLight: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        estimatedDuration: '8 Weeks',
        totalCoursesCount: 10,
        stages: [
            {
                stageNumber: 1,
                name: 'Beginner',
                title: 'Networking Protocols & Linux System Security',
                duration: '2 Weeks',
                description: 'Understand TCP/IP, DNS, routing, Linux command line security, firewalls, and permission auditing.',
                skills: ['Networking', 'Linux', 'TCP/IP', 'Firewalls'],
                courseIds: [30, 42],
                practicalProjects: [
                    'Network Packet Analysis & Rogue Device Detection with Wireshark',
                    'Hardened Linux Server Configuration with UFW and SSH Key Auth'
                ]
            },
            {
                stageNumber: 2,
                name: 'Intermediate',
                title: 'Vulnerability Assessment & Web Security (OWASP Top 10)',
                duration: '3 Weeks',
                description: 'Identify and remediate SQL injection, cross-site scripting (XSS), CSRF, and broken authorization in web applications.',
                skills: ['Ethical Hacking', 'OWASP Top 10', 'Penetration Testing'],
                courseIds: [30],
                practicalProjects: [
                    'Comprehensive Security Audit of a Vulnerable Web Application',
                    'Automated Vulnerability Scanner Script using Python and Nmap'
                ]
            },
            {
                stageNumber: 3,
                name: 'Advanced',
                title: 'SOC Incident Response, Threat Detection & SIEM',
                duration: '3 Weeks',
                description: 'Configure Splunk/ELK SIEM rules, analyze malicious PCAPs, detect lateral movement, and automate incident response runbooks.',
                skills: ['SIEM', 'SOC Operations', 'Incident Response', 'Threat Hunting'],
                courseIds: [42],
                practicalProjects: [
                    'Enterprise SOC Incident Simulation & Detection Rules in Splunk',
                    'Malware Traffic Triage & Forensics Investigation Report'
                ]
            }
        ],
        practicalProjects: [
            {
                title: 'Enterprise Threat Detection & Incident Response Lab',
                difficulty: 'Advanced',
                description: 'Deploy a multi-host network with a SIEM pipeline to capture simulated brute-force and privilege escalation attacks.',
                techStack: ['Linux', 'Splunk', 'Wireshark', 'Python', 'Snort IDS']
            }
        ]
    },
    {
        id: 'cloud-engineer',
        title: 'Cloud Engineer Learning Path',
        role: 'Cloud Engineer',
        overview: 'Master cloud architecture on AWS, infrastructure as code with Terraform, container orchestration, identity management, and serverless compute.',
        careerObjective: 'Architect, deploy, and maintain highly available, fault-tolerant, and secure cloud infrastructures on leading public clouds.',
        requiredSkills: ['AWS', 'Cloud Architecture', 'Terraform', 'Linux', 'Docker', 'IAM', 'VPC Networking'],
        skillsSummary: 'AWS • Cloud Architecture • Terraform • VPC',
        icon: 'cloud',
        color: 'from-amber-600 to-orange-500',
        bgLight: 'bg-amber-50 text-amber-700 border-amber-200',
        estimatedDuration: '8 Weeks',
        totalCoursesCount: 10,
        stages: [
            {
                stageNumber: 1,
                name: 'Beginner',
                title: 'Cloud Foundations & Core AWS Services',
                duration: '2 Weeks',
                description: 'Learn compute (EC2), storage (S3), relational databases (RDS), and Identity & Access Management (IAM) on AWS.',
                skills: ['AWS', 'Cloud Computing', 'IAM', 'S3'],
                courseIds: [33, 104],
                practicalProjects: [
                    'High-Availability Static Site with S3, CloudFront CDN, and Route53',
                    'Multi-AZ Compute Deployment with EC2 Auto Scaling and ALB'
                ]
            },
            {
                stageNumber: 2,
                name: 'Intermediate',
                title: 'Virtual Private Clouds (VPC) & Infrastructure as Code',
                duration: '3 Weeks',
                description: 'Provision secure multi-tier subnets, NAT gateways, security groups, and automate infrastructure with HashiCorp Terraform.',
                skills: ['Terraform', 'VPC Networking', 'Security Groups', 'Infrastructure as Code'],
                courseIds: [33, 45],
                practicalProjects: [
                    'Production-Grade Modular Terraform Repository for Multi-Tier VPC',
                    'Serverless Microservice Backend with AWS Lambda, API Gateway, and DynamoDB'
                ]
            },
            {
                stageNumber: 3,
                name: 'Advanced',
                title: 'Enterprise Cloud Architecture & Disaster Recovery',
                duration: '3 Weeks',
                description: 'Design multi-region disaster recovery, cost optimization, automated backups, and CloudWatch/CloudTrail observability.',
                skills: ['Enterprise Architecture', 'Disaster Recovery', 'Monitoring', 'Cost Optimization'],
                courseIds: [45],
                practicalProjects: [
                    'Zero-Downtime Multi-Region Disaster Recovery Architecture on AWS',
                    'Automated Compliance & Security Auditing Pipeline with AWS Config'
                ]
            }
        ],
        practicalProjects: [
            {
                title: 'Multi-Region High Availability Enterprise Cloud Deployment',
                difficulty: 'Advanced',
                description: 'Provision a production AWS topology featuring redundant subnets, auto-scaling compute, managed databases, and Terraform state locking.',
                techStack: ['AWS', 'Terraform', 'Docker', 'Linux', 'Bash']
            }
        ]
    },
    {
        id: 'devops-engineer',
        title: 'DevOps Engineer Learning Path',
        role: 'DevOps Engineer',
        overview: 'Bridge software engineering and IT operations with automated CI/CD pipelines, Docker containerization, Kubernetes clusters, and Prometheus observability.',
        careerObjective: 'Automate build, test, and release cycles, manage infrastructure state, and maintain 99.99% system reliability at scale.',
        requiredSkills: ['Linux', 'Git', 'Docker', 'Kubernetes', 'CI/CD', 'GitHub Actions', 'Terraform', 'Prometheus'],
        skillsSummary: 'Linux • Docker • Kubernetes • CI/CD • Prometheus',
        icon: 'settings_suggest',
        color: 'from-cyan-600 to-blue-500',
        bgLight: 'bg-cyan-50 text-cyan-700 border-cyan-200',
        estimatedDuration: '10 Weeks',
        totalCoursesCount: 11,
        stages: [
            {
                stageNumber: 1,
                name: 'Beginner',
                title: 'Linux Automation & Containerization with Docker',
                duration: '3 Weeks',
                description: 'Master bash scripting, systemd, multi-stage Docker builds, container networking, and Docker Compose development environments.',
                skills: ['Linux', 'Docker', 'Bash', 'Git'],
                courseIds: [6, 8],
                practicalProjects: [
                    'Multi-Container Application Development Environment with Docker Compose',
                    'Automated Linux System Health Check & Backup Script'
                ]
            },
            {
                stageNumber: 2,
                name: 'Intermediate',
                title: 'Continuous Integration & Continuous Deployment (CI/CD)',
                duration: '3 Weeks',
                description: 'Construct automated build, lint, test, security scanning, and deployment pipelines using GitHub Actions and GitLab CI.',
                skills: ['CI/CD', 'GitHub Actions', 'Automated Testing', 'Docker Registry'],
                courseIds: [6, 36],
                practicalProjects: [
                    'End-to-End Production CI/CD Pipeline with Automated Unit Tests and Docker Build',
                    'GitOps Continuous Delivery Setup with ArgoCD'
                ]
            },
            {
                stageNumber: 3,
                name: 'Advanced',
                title: 'Production Kubernetes Cluster Management & Monitoring',
                duration: '4 Weeks',
                description: 'Deploy resilient deployments, ingress controllers, Helm charts, stateful sets, and Prometheus/Grafana alerting metrics.',
                skills: ['Kubernetes', 'Helm', 'Prometheus', 'Grafana'],
                courseIds: [36, 48],
                practicalProjects: [
                    'Production-Ready Kubernetes Microservices Cluster with Helm and Ingress',
                    'Full-Stack Observability Dashboard with Prometheus, Grafana, and AlertManager'
                ]
            }
        ],
        practicalProjects: [
            {
                title: 'Automated GitOps Microservices Pipeline on Kubernetes',
                difficulty: 'Advanced',
                description: 'Deliver zero-downtime rolling updates for multi-tier microservices with automated rollback, canary deployments, and metric alerts.',
                techStack: ['Kubernetes', 'Docker', 'GitHub Actions', 'ArgoCD', 'Prometheus']
            }
        ]
    },
    {
        id: 'frontend-developer',
        title: 'Frontend Developer Learning Path',
        role: 'Frontend Developer',
        overview: 'Specialized path focused on mastering UI/UX implementation, responsive CSS, JavaScript/TypeScript, React 19, Next.js, and web performance optimization.',
        careerObjective: 'Build blazing-fast, accessible, and delightful user interfaces for web applications across mobile and desktop devices.',
        requiredSkills: ['HTML5', 'CSS3', 'JavaScript', 'TypeScript', 'React', 'Next.js', 'Tailwind CSS', 'Web Performance', 'Accessibility'],
        skillsSummary: 'HTML5 • CSS3 • React • Next.js • Tailwind CSS',
        icon: 'web',
        color: 'from-violet-600 to-purple-500',
        bgLight: 'bg-violet-50 text-violet-700 border-violet-200',
        estimatedDuration: '8 Weeks',
        totalCoursesCount: 10,
        stages: [
            {
                stageNumber: 1,
                name: 'Beginner',
                title: 'Modern CSS Layouts & JavaScript DOM Engineering',
                duration: '2 Weeks',
                description: 'Master CSS Grid, Flexbox, responsive design, accessibility (a11y), and asynchronous JavaScript with Fetch and Promises.',
                skills: ['HTML5', 'CSS3', 'JavaScript', 'Responsive Design'],
                courseIds: [7, 8],
                practicalProjects: [
                    'Pixel-Perfect Responsive Landing Page with CSS Grid and Animations',
                    'Dynamic Weather & Crypto Dashboard using Browser Web APIs'
                ]
            },
            {
                stageNumber: 2,
                name: 'Intermediate',
                title: 'React 19, Component Design Systems & Tailwind',
                duration: '3 Weeks',
                description: 'Develop scalable component architectures, custom hooks, reusable design systems, and form validation with Zod and React Hook Form.',
                skills: ['React', 'TypeScript', 'Tailwind CSS', 'Design Systems'],
                courseIds: [5, 34, 46],
                practicalProjects: [
                    'Modular UI Component Library with Storybook and Tailwind CSS',
                    'Multi-Step Interactive Form with Client-Side Validation and State Persistence'
                ]
            },
            {
                stageNumber: 3,
                name: 'Advanced',
                title: 'Next.js App Router, Server Components & Performance Optimization',
                duration: '3 Weeks',
                description: 'Build production Next.js apps with Server Components, streaming SSR, image optimization, SEO best practices, and Core Web Vitals.',
                skills: ['Next.js', 'App Router', 'Performance Optimization', 'SEO'],
                courseIds: [5],
                practicalProjects: [
                    'High-Performance Next.js E-Commerce Platform with Server Actions and ISR',
                    'Interactive Data Visualization Dashboard with Recharts and TanStack Table'
                ]
            }
        ],
        practicalProjects: [
            {
                title: 'Production Next.js 14 Web Application with App Router',
                difficulty: 'Intermediate',
                description: 'Build an ultra-responsive content publishing and analytics dashboard with dark mode, search filters, and 95+ Lighthouse score.',
                techStack: ['Next.js', 'React', 'TypeScript', 'Tailwind CSS', 'TanStack Query']
            }
        ]
    },
    {
        id: 'backend-developer',
        title: 'Backend Developer Learning Path',
        role: 'Backend Developer',
        overview: 'Deep dive into server-side architectures, database design, caching layers, message queues, API security, and high-concurrency systems.',
        careerObjective: 'Architect reliable, high-throughput server backends and distributed services powering consumer and enterprise applications.',
        requiredSkills: ['Node.js', 'Express', 'Python', 'SQL', 'PostgreSQL', 'MongoDB', 'Redis', 'Docker', 'API Security'],
        skillsSummary: 'Node.js • Express • PostgreSQL • Redis • Docker',
        icon: 'dns',
        color: 'from-emerald-600 to-green-500',
        bgLight: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        estimatedDuration: '10 Weeks',
        totalCoursesCount: 11,
        stages: [
            {
                stageNumber: 1,
                name: 'Beginner',
                title: 'Server-Side Fundamentals & RESTful API Architecture',
                duration: '3 Weeks',
                description: 'Master Node.js event loop, Express routing, middleware, request validation, and relational database schema design.',
                skills: ['Node.js', 'Express', 'SQL', 'REST APIs'],
                courseIds: [31, 35],
                practicalProjects: [
                    'RESTful Product Inventory API with PostgreSQL and Express',
                    'User Authentication Microservice with JWT and Bcrypt'
                ]
            },
            {
                stageNumber: 2,
                name: 'Intermediate',
                title: 'Database Optimization, Caching with Redis & NoSQL',
                duration: '4 Weeks',
                description: 'Implement database indexing, connection pooling, Redis caching layers, transactions, and MongoDB document modeling.',
                skills: ['PostgreSQL', 'MongoDB', 'Redis', 'Database Indexing'],
                courseIds: [35, 43, 47],
                practicalProjects: [
                    'High-Concurrency Flash-Sale Backend with Redis Distributed Locks',
                    'Social Media Feed API with Aggregation Pipelines in MongoDB'
                ]
            },
            {
                stageNumber: 3,
                name: 'Advanced',
                title: 'Microservices, Message Queues & Distributed Systems',
                duration: '3 Weeks',
                description: 'Decouple services with RabbitMQ/Kafka, implement rate limiting, API gateways, Docker containers, and observability.',
                skills: ['Microservices', 'Message Queues', 'Docker', 'Rate Limiting'],
                courseIds: [6, 43],
                practicalProjects: [
                    'Event-Driven Order Processing System with RabbitMQ and Microservices',
                    'API Gateway with Rate Limiting, Circuit Breakers, and Logging'
                ]
            }
        ],
        practicalProjects: [
            {
                title: 'Distributed Event-Driven Banking & Transaction Engine',
                difficulty: 'Advanced',
                description: 'Build a fault-tolerant financial backend handling atomic ledger operations, idempotency, Redis caching, and automated audit trails.',
                techStack: ['Node.js', 'PostgreSQL', 'Redis', 'Docker', 'Express']
            }
        ]
    },
    {
        id: 'java-developer',
        title: 'Java Developer Learning Path',
        role: 'Java Developer',
        overview: 'Master enterprise Java, Object-Oriented Design, JVM internals, Spring Boot microservices, Hibernate/JPA, and enterprise cloud integrations.',
        careerObjective: 'Develop mission-critical enterprise systems, banking engines, and scalable microservices using the Java and Spring Boot ecosystem.',
        requiredSkills: ['Java', 'OOP', 'Spring Boot', 'Hibernate/JPA', 'SQL', 'Maven/Gradle', 'Microservices', 'Docker'],
        skillsSummary: 'Java • OOP • Spring Boot • Hibernate • SQL',
        icon: 'coffee',
        color: 'from-amber-700 to-yellow-600',
        bgLight: 'bg-amber-50 text-amber-800 border-amber-200',
        estimatedDuration: '10 Weeks',
        totalCoursesCount: 10,
        stages: [
            {
                stageNumber: 1,
                name: 'Beginner',
                title: 'Core Java, Data Structures & Object-Oriented Design',
                duration: '3 Weeks',
                description: 'Master Java syntax, collections framework, generics, exception handling, multithreading, and Clean Code principles.',
                skills: ['Java', 'OOP', 'Collections', 'Multithreading'],
                courseIds: [2, 32],
                practicalProjects: [
                    'Bank Account Management & Transaction Simulator in Core Java',
                    'Custom Generic Data Structures Library with Unit Tests'
                ]
            },
            {
                stageNumber: 2,
                name: 'Intermediate',
                title: 'Spring Boot 3, REST APIs & Hibernate/JPA',
                duration: '4 Weeks',
                description: 'Build dependency-injected microservices with Spring Boot, Spring Data JPA, relational databases, and Spring Security.',
                skills: ['Spring Boot', 'Hibernate', 'JPA', 'Spring Security', 'SQL'],
                courseIds: [35, 47],
                practicalProjects: [
                    'Enterprise HR Management REST API with Spring Boot and PostgreSQL',
                    'Secure OAuth2 Authentication Service with JWT'
                ]
            },
            {
                stageNumber: 3,
                name: 'Advanced',
                title: 'Cloud-Native Java Microservices & Kafka Integration',
                duration: '3 Weeks',
                description: 'Orchestrate microservices with Spring Cloud, Eureka service registry, resilience patterns (Resilience4j), and Apache Kafka.',
                skills: ['Spring Cloud', 'Kafka', 'Microservices', 'Docker'],
                courseIds: [6],
                practicalProjects: [
                    'Distributed E-Commerce Microservices Architecture with Spring Cloud and Kafka',
                    'Containerized Java Application Deployed to Kubernetes'
                ]
            }
        ],
        practicalProjects: [
            {
                title: 'Enterprise Spring Boot Microservices Platform',
                difficulty: 'Advanced',
                description: 'Construct a resilient distributed retail system with Spring Cloud Gateway, Eureka discovery, Spring Data JPA, and Docker containers.',
                techStack: ['Java 21', 'Spring Boot 3', 'PostgreSQL', 'Docker', 'Maven']
            }
        ]
    },
    {
        id: 'python-developer',
        title: 'Python Developer Learning Path',
        role: 'Python Developer',
        overview: 'Master Python from idiomatic scripting to asynchronous backends with FastAPI, web scraping, data automation, and cloud integrations.',
        careerObjective: 'Build scalable web applications, automation engines, and backend APIs using modern asynchronous Python.',
        requiredSkills: ['Python', 'FastAPI', 'Django', 'SQLAlchemy', 'PostgreSQL', 'Asynchronous Programming', 'Docker'],
        skillsSummary: 'Python • FastAPI • Django • SQLAlchemy • Docker',
        icon: 'code',
        color: 'from-blue-600 to-indigo-600',
        bgLight: 'bg-blue-50 text-blue-700 border-blue-200',
        estimatedDuration: '8 Weeks',
        totalCoursesCount: 10,
        stages: [
            {
                stageNumber: 1,
                name: 'Beginner',
                title: 'Idiomatic Python, Data Structures & Scripting',
                duration: '2 Weeks',
                description: 'Learn modern Python 3.12 syntax, list comprehensions, generators, decorators, file I/O, and automated testing with pytest.',
                skills: ['Python', 'OOP', 'Data Structures', 'Testing'],
                courseIds: [4, 101],
                practicalProjects: [
                    'CLI Automation Tool for System Metrics and File Organization',
                    'Web Scraper & Data Extractor with BeautifulSoup and Requests'
                ]
            },
            {
                stageNumber: 2,
                name: 'Intermediate',
                title: 'High-Performance APIs with FastAPI & SQLAlchemy',
                duration: '3 Weeks',
                description: 'Build asynchronous REST APIs with FastAPI, Pydantic type validation, SQLAlchemy ORM, and Alembic migrations.',
                skills: ['FastAPI', 'Pydantic', 'SQLAlchemy', 'PostgreSQL', 'Asyncio'],
                courseIds: [31, 35],
                practicalProjects: [
                    'Asynchronous Book Review API with FastAPI and PostgreSQL',
                    'Task Queue System with Celery and Redis'
                ]
            },
            {
                stageNumber: 3,
                name: 'Advanced',
                title: 'Production Deployment, Docker & Cloud Architecture',
                duration: '3 Weeks',
                description: 'Package Python microservices into minimal Docker containers, configure Gunicorn/Uvicorn workers, and integrate AWS services.',
                skills: ['Docker', 'AWS', 'CI/CD', 'Microservices'],
                courseIds: [6, 33],
                practicalProjects: [
                    'Production Asynchronous Microservice Deployed on AWS with Docker',
                    'Real-Time WebSocket Notification Server with Asyncio'
                ]
            }
        ],
        practicalProjects: [
            {
                title: 'Asynchronous Microservices Platform with FastAPI & Celery',
                difficulty: 'Intermediate',
                description: 'Build a high-performance backend with async database queries, background job workers, Redis caching, and automated OpenAPI documentation.',
                techStack: ['Python', 'FastAPI', 'PostgreSQL', 'Redis', 'Docker']
            }
        ]
    }
];

module.exports = { LEARNING_PATHS };

