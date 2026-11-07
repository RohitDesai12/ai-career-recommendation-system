const mongoose = require('mongoose');
const Job = require('./models/Job');
const Employer = require('./models/Employer');
const User = require('./models/User');
require('dotenv').config({ path: __dirname + '/.env' });

const SEED_COMPANIES = [
    {
        companyName: 'Google',
        industry: 'Information Technology & Cloud',
        companySize: '10,000+',
        companyWebsite: 'https://careers.google.com',
        description: 'Google is a global technology leader focused on search, cloud computing, software, and artificial intelligence.',
        location: 'Bangalore, Karnataka'
    },
    {
        companyName: 'Microsoft',
        industry: 'Software & Cloud Services',
        companySize: '10,000+',
        companyWebsite: 'https://careers.microsoft.com',
        description: 'Microsoft develops computer software, consumer electronics, personal computers, and related cloud services.',
        location: 'Hyderabad, Telangana'
    },
    {
        companyName: 'Amazon',
        industry: 'E-Commerce & Cloud Infrastructure',
        companySize: '10,000+',
        companyWebsite: 'https://amazon.jobs',
        description: 'Amazon focuses on e-commerce, cloud computing (AWS), digital streaming, and artificial intelligence.',
        location: 'Bangalore, Karnataka'
    },
    {
        companyName: 'Razorpay',
        industry: 'FinTech & Payments',
        companySize: '1,000–5,000',
        companyWebsite: 'https://razorpay.com/jobs',
        description: 'Razorpay is India leading payments and banking platform for businesses of all sizes.',
        location: 'Bangalore, Karnataka'
    },
    {
        companyName: 'Swiggy',
        industry: 'On-Demand Delivery & Logistics',
        companySize: '5,000–10,000',
        companyWebsite: 'https://careers.swiggy.com',
        description: 'Swiggy is India leading on-demand convenience platform connecting consumers to food, grocery, and dining.',
        location: 'Bangalore, Karnataka'
    },
    {
        companyName: 'Zerodha',
        industry: 'Financial Technology & Brokerage',
        companySize: '500–1,000',
        companyWebsite: 'https://zerodha.com/careers',
        description: 'Zerodha is the largest retail stockbroker in India by active client base with high-scale tech architecture.',
        location: 'Bangalore, Karnataka'
    },
    {
        companyName: 'Tata Consultancy Services (TCS)',
        industry: 'IT Services & Consulting',
        companySize: '10,000+',
        companyWebsite: 'https://www.tcs.com/careers',
        description: 'TCS is a global leader in IT services, consulting, and business solutions operating across 55 countries.',
        location: 'Mumbai, Maharashtra'
    },
    {
        companyName: 'Infosys',
        industry: 'IT Services & Software Development',
        companySize: '10,000+',
        companyWebsite: 'https://www.infosys.com/careers',
        description: 'Infosys is a global leader in next-generation digital services and consulting.',
        location: 'Pune, Maharashtra'
    },
    {
        companyName: 'Flipkart',
        industry: 'E-Commerce & Supply Chain',
        companySize: '10,000+',
        companyWebsite: 'https://www.flipkartcareers.com',
        description: 'Flipkart is one of India leading digital commerce entities, revolutionizing online shopping experiences.',
        location: 'Bangalore, Karnataka'
    },
    {
        companyName: 'Zomato',
        industry: 'Food Tech & Quick Commerce',
        companySize: '1,000–5,000',
        companyWebsite: 'https://www.zomato.com/careers',
        description: 'Zomato connects customers, restaurant partners, and delivery partners across India.',
        location: 'Gurgaon, Haryana'
    },
    {
        companyName: 'Qualcomm',
        industry: 'Semiconductors & Telecommunications',
        companySize: '10,000+',
        companyWebsite: 'https://www.qualcomm.com/company/careers',
        description: 'Qualcomm is an American multinational corporation creating semiconductors, software, and wireless telecommunications equipment.',
        location: 'Hyderabad, Telangana'
    },
    {
        companyName: 'NVIDIA',
        industry: 'AI & GPU Computing',
        companySize: '10,000+',
        companyWebsite: 'https://www.nvidia.com/careers',
        description: 'NVIDIA pioneer of GPU computing, driving advances in computer graphics, AI, and autonomous machines.',
        location: 'Pune, Maharashtra'
    }
];

const SEED_JOBS = [
    // --- DATA & AI ROLES ---
    {
        companyName: 'Google',
        title: 'Data Analyst - Business Intelligence',
        department: 'Data & Analytics',
        location: 'Bangalore, Karnataka',
        type: 'Full-Time',
        workMode: 'Hybrid',
        experience: '0–2 years',
        salary: '₹14L - ₹22L',
        skills: ['SQL', 'Python', 'Tableau', 'Data Analysis', 'Statistics', 'BigQuery'],
        preferredSkills: ['R', 'Looker', 'Machine Learning'],
        education: "Bachelor's in Computer Science, Statistics, or related field",
        description: 'Analyze complex datasets to empower product decision-making, optimize user acquisition funnels, and build executive dashboards using SQL and Python.',
        responsibilities: [
            'Develop automated dashboards and ETL metrics pipelines.',
            'Perform exploratory data analysis and hypothesis testing on user behavior.',
            'Collaborate with product and engineering teams to define measurable KPIs.'
        ],
        benefits: ['Comprehensive Health Insurance', 'Stock Units (GSUs)', 'Meal Allowance & Wellness Perks', 'Learning Stipend'],
        isUrgent: true,
        status: 'Active'
    },
    {
        companyName: 'Amazon',
        title: 'Data Engineer I',
        department: 'Data & Analytics',
        location: 'Bangalore, Karnataka',
        type: 'Full-Time',
        workMode: 'Hybrid',
        experience: '1–3 years',
        salary: '₹18L - ₹28L',
        skills: ['Python', 'SQL', 'AWS', 'Spark', 'Data Pipeline', 'Redshift'],
        preferredSkills: ['Airflow', 'Kafka', 'Scala'],
        education: "Bachelor's in Computer Science, IT, or Engineering",
        description: 'Architect, construct, test, and maintain highly scalable data architectures for Amazon global retail and fulfillment networks.',
        responsibilities: [
            'Build large-scale real-time and batch data pipelines using Apache Spark and AWS.',
            'Optimize database schemas and data lake performance for analytical workloads.',
            'Ensure high data quality, governance, and low-latency availability.'
        ],
        benefits: ['Relocation Support', 'Amazon Employee Discount', 'Health & Dental Coverage', 'Parental Leave'],
        status: 'Active'
    },
    {
        companyName: 'Flipkart',
        title: 'Junior Data Analyst',
        department: 'Data & Analytics',
        location: 'Bangalore, Karnataka',
        type: 'Full-Time',
        workMode: 'On-site',
        experience: '0–1 years',
        salary: '₹8L - ₹12L',
        skills: ['Excel', 'SQL', 'Python', 'Power BI', 'Data Visualization'],
        preferredSkills: ['Pandas', 'Statistics'],
        education: "Bachelor's Degree in Engineering, Math, or Commerce",
        description: 'Support category managers with daily sales insights, inventory turnover metrics, and competitor pricing analytics.',
        responsibilities: [
            'Extract transactional data from SQL data warehouses.',
            'Create interactive Power BI and Excel reports for sales operations.',
            'Track daily conversion rates and customer satisfaction scores.'
        ],
        benefits: ['Medical Insurance', 'Transport Facility', 'Performance Bonus'],
        status: 'Active'
    },
    {
        companyName: 'Swiggy',
        title: 'Machine Learning Engineer',
        department: 'Engineering',
        location: 'Bangalore, Karnataka',
        type: 'Full-Time',
        workMode: 'Remote',
        experience: '1–3 years',
        salary: '₹20L - ₹32L',
        skills: ['Python', 'PyTorch', 'TensorFlow', 'Scikit-learn', 'Docker', 'MLOps'],
        preferredSkills: ['FastAPI', 'Kubernetes', 'Computer Vision'],
        education: "B.Tech/M.Tech in CS or AI/Data Science",
        description: 'Develop and deploy predictive delivery dispatch algorithms, demand forecasting models, and personalized recommendation systems.',
        responsibilities: [
            'Train, evaluate, and tune deep learning and gradient boosted models.',
            'Deploy microservices in Docker containers for sub-100ms real-time inference.',
            'Collaborate with data engineers on feature store creation.'
        ],
        benefits: ['Work from Anywhere', 'Flexible Hours', 'Mental Health Support', 'Annual Bonus'],
        status: 'Active'
    },

    // --- SOFTWARE DEVELOPMENT & FULL STACK ROLES ---
    {
        companyName: 'Microsoft',
        title: 'Software Development Engineer - Java / Backend',
        department: 'Engineering',
        location: 'Hyderabad, Telangana',
        type: 'Full-Time',
        workMode: 'Hybrid',
        experience: '1–3 years',
        salary: '₹18L - ₹26L',
        skills: ['Java', 'Spring Boot', 'Microservices', 'SQL', 'Azure', 'Git'],
        preferredSkills: ['Docker', 'Kafka', 'Distributed Systems'],
        education: "Bachelor's in Computer Science or Software Engineering",
        description: 'Build mission-critical cloud services on Azure utilizing modern Java, Spring Boot microservices, and asynchronous event streams.',
        responsibilities: [
            'Design scalable, fault-tolerant REST and gRPC backend microservices.',
            'Implement automated unit and integration tests using JUnit and Mockito.',
            'Optimize memory allocation, database connection pooling, and request latency.'
        ],
        benefits: ['Stock Awards', 'Tuition Reimbursement', 'Flexible Work', 'Health Insurance'],
        isUrgent: true,
        status: 'Active'
    },
    {
        companyName: 'Razorpay',
        title: 'Full Stack Web Developer (React + Node.js)',
        department: 'Engineering',
        location: 'Bangalore, Karnataka',
        type: 'Full-Time',
        workMode: 'Hybrid',
        experience: '1–3 years',
        salary: '₹16L - ₹25L',
        skills: ['React', 'Node.js', 'TypeScript', 'JavaScript', 'MongoDB', 'REST APIs'],
        preferredSkills: ['Next.js', 'TailwindCSS', 'Redis'],
        education: "B.E/B.Tech in Computer Science or equivalent",
        description: 'Craft frictionless developer dashboards and high-throughput checkout payment interfaces for millions of daily active merchants.',
        responsibilities: [
            'Build responsive, accessible frontend interfaces with React, TypeScript, and modern CSS.',
            'Develop secure Node.js APIs handling financial webhooks and transactions.',
            'Participate in design system maintenance and performance profiling.'
        ],
        benefits: ['ESOPs', 'Unlimited Leave Policy', 'Gadget Allowance', 'Premium Healthcare'],
        isUrgent: true,
        status: 'Active'
    },
    {
        companyName: 'Zerodha',
        title: 'Frontend Developer - React & TypeScript',
        department: 'Engineering',
        location: 'Bangalore, Karnataka',
        type: 'Full-Time',
        workMode: 'Remote',
        experience: '0–2 years',
        salary: '₹12L - ₹18L',
        skills: ['React', 'TypeScript', 'JavaScript', 'HTML5', 'CSS3', 'WebSockets'],
        preferredSkills: ['State Management', 'Canvas API', 'Chart.js'],
        education: "Degree in Computer Science, IT or self-taught developer with strong portfolio",
        description: 'Build real-time trading interfaces, responsive financial charts, and ultra-fast web applications with clean, dependency-light code.',
        responsibilities: [
            'Develop high-frequency trading web dashboards receiving real-time WebSocket feeds.',
            'Ensure pixel-perfect responsiveness across desktop, tablet, and mobile browsers.',
            'Optimize browser rendering speed and DOM memory consumption.'
        ],
        benefits: ['100% Remote Option', 'Quarterly Profit Sharing', 'MacBook Pro Provided', 'Comprehensive Health Plan'],
        status: 'Active'
    },
    {
        companyName: 'Tata Consultancy Services (TCS)',
        title: 'Java Developer - Enterprise Systems',
        department: 'Engineering',
        location: 'Mumbai, Maharashtra',
        type: 'Full-Time',
        workMode: 'Hybrid',
        experience: '0–2 years',
        salary: '₹6L - ₹9L',
        skills: ['Java', 'Spring', 'Hibernate', 'Oracle SQL', 'Git', 'REST'],
        preferredSkills: ['Maven', 'Jenkins', 'Linux'],
        education: "B.E/B.Tech/MCA with minimum 60% aggregate",
        description: 'Join TCS Digital practice building enterprise banking and telecom backend services with Java and relational databases.',
        responsibilities: [
            'Develop core business logic modules in Java and Spring framework.',
            'Write complex SQL queries, stored procedures, and triggers.',
            'Deploy code through continuous integration pipelines.'
        ],
        benefits: ['Health Insurance', 'Gratuity & PF', 'Global Onsite Opportunities', 'Continuous Learning Portal'],
        status: 'Active'
    },
    {
        companyName: 'Infosys',
        title: 'Python Backend Developer',
        department: 'Engineering',
        location: 'Pune, Maharashtra',
        type: 'Full-Time',
        workMode: 'Hybrid',
        experience: '0–2 years',
        salary: '₹6.5L - ₹9.5L',
        skills: ['Python', 'Django', 'Flask', 'PostgreSQL', 'Git', 'Docker'],
        preferredSkills: ['Celery', 'Redis', 'AWS'],
        education: "B.E / B.Tech / M.Sc Computer Science",
        description: 'Develop RESTful APIs and automation microservices for global automotive and retail clients using modern Python web frameworks.',
        responsibilities: [
            'Build backend REST APIs using Django and FastAPI.',
            'Perform database schema migrations and query optimizations.',
            'Write automated tests and integrate with Docker container workflows.'
        ],
        benefits: ['Health Care', 'Campus Transport', 'Higher Education Sponsorship', 'Life Insurance'],
        status: 'Active'
    },
    {
        companyName: 'Zomato',
        title: 'DevOps / Cloud Engineer',
        department: 'Engineering',
        location: 'Gurgaon, Haryana',
        type: 'Full-Time',
        workMode: 'Hybrid',
        experience: '1–3 years',
        salary: '₹16L - ₹24L',
        skills: ['AWS', 'Docker', 'Kubernetes', 'Terraform', 'CI/CD', 'Linux'],
        preferredSkills: ['Prometheus', 'Grafana', 'Python'],
        education: "B.Tech in Computer Science, IT, or Electronics",
        description: 'Maintain 99.99% uptime for high-traffic food ordering infrastructure during IPL matches and festival peaks.',
        responsibilities: [
            'Manage Kubernetes clusters hosting hundreds of microservices.',
            'Implement infrastructure as code with Terraform on AWS.',
            'Automate zero-downtime deployment pipelines with GitHub Actions.'
        ],
        benefits: ['Stock Grants', 'Flexible Working', 'Food Allowance', 'Medical Insurance'],
        status: 'Active'
    },

    // --- HARDWARE & ELECTRONICS ROLES ---
    {
        companyName: 'Qualcomm',
        title: 'VLSI Design & Verification Engineer',
        department: 'Electronics & Communication',
        location: 'Hyderabad, Telangana',
        type: 'Full-Time',
        workMode: 'On-site',
        experience: '0–2 years',
        salary: '₹15L - ₹24L',
        skills: ['Verilog', 'SystemVerilog', 'UVM', 'VLSI', 'Digital Design', 'C++'],
        preferredSkills: ['Python Scripting', 'FPGA', 'Synthesis'],
        education: "B.Tech/M.Tech in ECE, VLSI, or Microelectronics",
        description: 'Verify cutting-edge Snapdragon mobile and automotive processor architectures using SystemVerilog and UVM methodologies.',
        responsibilities: [
            'Develop testbenches and testcases for complex SOC blocks.',
            'Perform functional coverage and code coverage closure.',
            'Debug RTL bugs and collaborate with digital design teams.'
        ],
        benefits: ['Patent Filing Bonuses', 'Comprehensive Health Plan', 'Wellness Centers', 'Employee Stock Purchase'],
        status: 'Active'
    },
    {
        companyName: 'NVIDIA',
        title: 'Embedded Systems & Firmware Engineer',
        department: 'Electronics & Communication',
        location: 'Pune, Maharashtra',
        type: 'Full-Time',
        workMode: 'Hybrid',
        experience: '1–3 years',
        salary: '₹18L - ₹28L',
        skills: ['C', 'C++', 'Embedded Linux', 'RTOS', 'Device Drivers', 'Microcontrollers'],
        preferredSkills: ['ARM Architecture', 'I2C/SPI/UART', 'Python'],
        education: "B.Tech/M.Tech in Electrical, Electronics, or Computer Engineering",
        description: 'Write low-level firmware and device drivers for next-generation GPU platforms and AI hardware accelerators.',
        responsibilities: [
            'Develop board support packages and bootloaders for ARM architectures.',
            'Implement hardware-level protocols (PCIe, I2C, SPI, CAN).',
            'Debug bare-metal and RTOS firmware using JTAG and logic analyzers.'
        ],
        benefits: ['NVIDIA Stock Purchase Plan', 'Global Work Mobility', 'Childcare Benefits', 'Top Tier Health Insurance'],
        status: 'Active'
    }
];

async function seedJobsDatabase() {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/career_recommender');
        console.log('Connected to MongoDB.');

        // Find or create default employer user
        let defaultUser = await User.findOne({ email: 'employer_admin@careercompass.com' });
        if (!defaultUser) {
            defaultUser = new User({
                name: 'Talent Acquisition Team',
                email: 'employer_admin@careercompass.com',
                password: 'Password@123',
                role: 'employer',
                status: 'Active',
                isVerified: true
            });
            await defaultUser.save();
            console.log('Created default employer admin user.');
        }

        // Upsert Companies / Employers
        const employerMap = {};
        for (const comp of SEED_COMPANIES) {
            let emp = await Employer.findOne({ companyName: comp.companyName });
            if (!emp) {
                emp = new Employer({
                    user: defaultUser._id,
                    companyName: comp.companyName,
                    industry: comp.industry,
                    companySize: comp.companySize,
                    companyWebsite: comp.companyWebsite,
                    website: comp.companyWebsite,
                    description: comp.description,
                    aboutCompany: comp.description,
                    workEmail: `careers@${comp.companyName.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`,
                    phone: '+91 80 4000 1000'
                });
                await emp.save();
                console.log(`Created Employer: ${comp.companyName}`);
            }
            employerMap[comp.companyName] = emp._id;
        }

        // Upsert Jobs
        let addedCount = 0;
        for (const jobData of SEED_JOBS) {
            const empId = employerMap[jobData.companyName] || defaultUser._id;
            const existing = await Job.findOne({
                title: jobData.title,
                companyName: jobData.companyName
            });

            if (!existing) {
                await Job.create({
                    ...jobData,
                    employer: empId
                });
                addedCount++;
                console.log(`Added Job: ${jobData.title} at ${jobData.companyName}`);
            } else {
                existing.status = 'Active';
                existing.skills = jobData.skills;
                existing.location = jobData.location;
                existing.salary = jobData.salary;
                existing.department = jobData.department;
                await existing.save();
            }
        }

        console.log(`\n✓ Seed completed! Total jobs active in DB: ${await Job.countDocuments({ status: 'Active' })}`);
        await mongoose.disconnect();
    } catch (err) {
        console.error('Error seeding jobs:', err);
        process.exit(1);
    }
}

seedJobsDatabase();
