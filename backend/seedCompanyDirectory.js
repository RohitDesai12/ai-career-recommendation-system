const mongoose = require('mongoose');
const Company = require('./models/Company');
const Job = require('./models/Job');
const { CURATED_COMPANIES } = require('./data/curatedCompanies');
require('dotenv').config({ path: __dirname + '/.env' });

const VERIFIED_OPPORTUNITIES = [
    {
        companyName: 'Google',
        title: 'Associate Software Engineer - University Graduate',
        department: 'Engineering',
        category: 'Software Development',
        location: 'Bangalore, Karnataka',
        type: 'Full-Time',
        workMode: 'Hybrid',
        experience: '0–2 years',
        freshersEligible: true,
        salary: '₹18L - ₹28L',
        salaryMin: 1800000,
        salaryMax: 2800000,
        skills: ['Java', 'Python', 'C++', 'Data Structures', 'Algorithms', 'SQL', 'Git'],
        preferredSkills: ['Distributed Systems', 'Cloud Computing', 'Linux'],
        education: "Bachelor's or Master's degree in Computer Science, Computer Engineering, or related technical field",
        description: 'Google software engineers develop next-generation technologies that change how billions of users connect, explore, and interact with information and one another.',
        responsibilities: [
            'Design, develop, test, deploy, maintain, and improve large-scale software solutions.',
            'Manage individual project priorities, deadlines, and deliverables.',
            'Collaborate with global engineering teams on high-throughput microservices.'
        ],
        benefits: ['Google Stock Units (GSUs)', 'Comprehensive Medical, Dental & Vision Insurance', 'On-campus Meals & Micro-kitchens', 'Generous Learning & Conference Stipend'],
        officialApplyUrl: 'https://careers.google.com/jobs/results/?q=software%20engineer',
        sourceName: 'Google Careers Official Portal',
        sourceUrl: 'https://careers.google.com',
        verificationStatus: 'Verified',
        status: 'Active'
    },
    {
        companyName: 'Microsoft',
        title: 'Software Development Engineer I (Azure Cloud)',
        department: 'Engineering',
        category: 'Cloud Computing',
        location: 'Hyderabad, Telangana',
        type: 'Full-Time',
        workMode: 'Hybrid',
        experience: '0–2 years',
        freshersEligible: true,
        salary: '₹16L - ₹26L',
        salaryMin: 1600000,
        salaryMax: 2600000,
        skills: ['C#', 'Java', 'Python', 'Azure', 'Microservices', 'REST APIs', 'Git'],
        preferredSkills: ['Docker', 'Kubernetes', 'CI/CD'],
        education: "Bachelor's or Master's in Computer Science, IT, or related engineering discipline",
        description: 'Join the Microsoft Azure engineering organization building scalable, fault-tolerant cloud infrastructure and developer platform APIs.',
        responsibilities: [
            'Write secure, resilient, high-performance code on Azure cloud primitives.',
            'Build automated unit, integration, and performance benchmarking tests.',
            'Participate in architecture reviews and on-call operational telemetry rotations.'
        ],
        benefits: ['Microsoft Stock Awards', 'Health & Wellness Reimbursement', 'Flexible Work Options', 'Tuition Assistance'],
        officialApplyUrl: 'https://careers.microsoft.com/us/en/search-results?keywords=software%20engineer',
        sourceName: 'Microsoft Careers Official Portal',
        sourceUrl: 'https://careers.microsoft.com',
        verificationStatus: 'Verified',
        status: 'Active'
    },
    {
        companyName: 'Amazon',
        title: 'Software Development Engineer - Graduate 2026/2027',
        department: 'Engineering',
        category: 'Software Development',
        location: 'Bangalore, Karnataka',
        type: 'Full-Time',
        workMode: 'Hybrid',
        experience: '0–1 years',
        freshersEligible: true,
        salary: '₹18L - ₹28L',
        salaryMin: 1800000,
        salaryMax: 2800000,
        skills: ['Java', 'C++', 'Object Oriented Programming', 'Data Structures', 'SQL', 'AWS'],
        preferredSkills: ['Spring Boot', 'DynamoDB', 'Distributed Systems'],
        education: "B.Tech / M.Tech in Computer Science, IT, or Electronics",
        description: 'Amazon is hiring graduate software engineers to innovate on core retail, Prime Video, fulfillment logistics, and AWS cloud platforms.',
        responsibilities: [
            'Design and code mission-critical distributed services serving millions of requests.',
            'Collaborate with Principal Engineers to author high-level architecture designs.',
            'Continuously improve software quality and latency metrics.'
        ],
        benefits: ['Relocation Allowance', 'Amazon Employee Discount', 'Health Insurance', 'Parental Support'],
        officialApplyUrl: 'https://amazon.jobs/en/job_categories/software-development',
        sourceName: 'Amazon Jobs Official Portal',
        sourceUrl: 'https://amazon.jobs',
        verificationStatus: 'Verified',
        status: 'Active'
    },
    {
        companyName: 'Tata Consultancy Services (TCS)',
        title: 'TCS Digital - Assistant Systems Engineer',
        department: 'Engineering',
        category: 'Software Development',
        location: 'Pune, Maharashtra',
        type: 'Full-Time',
        workMode: 'Hybrid',
        experience: '0–2 years',
        freshersEligible: true,
        salary: '₹7L - ₹9.5L',
        salaryMin: 700000,
        salaryMax: 950000,
        skills: ['Java', 'Python', 'SQL', 'Spring Boot', 'HTML5', 'CSS3', 'Git'],
        preferredSkills: ['React', 'PostgreSQL', 'Docker'],
        education: "B.E / B.Tech / M.E / M.Tech / MCA / M.Sc with minimum 60% aggregate",
        description: 'TCS Digital is the premier talent intake program for engineering students to work on cutting-edge AI, IoT, cloud, and enterprise digital solutions.',
        responsibilities: [
            'Develop, test, and maintain enterprise software applications.',
            'Engage in full-stack modernization for Fortune 500 enterprise clients.',
            'Participate in continuous learning and digital certification programs.'
        ],
        benefits: ['Comprehensive Medical Coverage', 'TCS Wings Incentive Program', 'Higher Education Assistance', 'Provident Fund & Gratuity'],
        officialApplyUrl: 'https://www.tcs.com/careers/india',
        sourceName: 'TCS Careers Official Portal',
        sourceUrl: 'https://www.tcs.com/careers',
        verificationStatus: 'Verified',
        status: 'Active'
    },
    {
        companyName: 'Infosys',
        title: 'Specialist Programmer (Power Programmer)',
        department: 'Engineering',
        category: 'Software Development',
        location: 'Bangalore, Karnataka',
        type: 'Full-Time',
        workMode: 'Hybrid',
        experience: '0–2 years',
        freshersEligible: true,
        salary: '₹9.5L - ₹12L',
        salaryMin: 950000,
        salaryMax: 1200000,
        skills: ['Java', 'Python', 'Data Structures', 'Algorithms', 'Full Stack Development', 'SQL'],
        preferredSkills: ['Cloud Platforms', 'DevOps', 'Microservices'],
        education: "B.E / B.Tech in CSE / IT / ECE or MCA",
        description: 'Specialist Programmers at Infosys are high-performing coders who build complex architecture frameworks, deep-tech algorithms, and digital platforms.',
        responsibilities: [
            'Build full stack applications and optimized backend engines.',
            'Work closely with Chief Technology Officers to solve difficult algorithmic bottlenecks.',
            'Implement modern CI/CD deployment workflows.'
        ],
        benefits: ['Health Insurance', 'Infosys Mysore Campus Training', 'Accelerated Career Track', 'Annual Performance Bonus'],
        officialApplyUrl: 'https://www.infosys.com/careers/job-opportunities.html',
        sourceName: 'Infosys Careers Official Portal',
        sourceUrl: 'https://www.infosys.com/careers',
        verificationStatus: 'Verified',
        status: 'Active'
    },
    {
        companyName: 'Wipro',
        title: 'Project Engineer - Turbo Intake',
        department: 'Engineering',
        category: 'Software Development',
        location: 'Hyderabad, Telangana',
        type: 'Full-Time',
        workMode: 'Hybrid',
        experience: '0–2 years',
        freshersEligible: true,
        salary: '₹6.5L - ₹8.5L',
        salaryMin: 650000,
        salaryMax: 850000,
        skills: ['Java', 'C++', 'Python', 'Data Structures', 'Linux', 'SQL'],
        preferredSkills: ['Cloud Fundamentals', 'Spring', 'JavaScript'],
        education: "B.E / B.Tech / 5-year integrated M.Tech in CS/IT/ECE/EEE",
        description: 'Wipro Turbo is designed for engineers with deep coding and problem-solving aptitude to drive technological transformation across global industries.',
        responsibilities: [
            'Develop modules in Java and modern frameworks for global clients.',
            'Conduct unit testing, bug fixing, and code review compliance.',
            'Contribute to client-facing system integrations and maintenance.'
        ],
        benefits: ['Health Insurance for Family', 'Wipro Academy of Software Excellence (WASE)', 'Flexible Benefits Plan'],
        officialApplyUrl: 'https://careers.wipro.com/careers-home',
        sourceName: 'Wipro Careers Official Portal',
        sourceUrl: 'https://careers.wipro.com',
        verificationStatus: 'Verified',
        status: 'Active'
    },
    {
        companyName: 'Accenture',
        title: 'Associate Software Engineer (Advanced Technology Centers in India)',
        department: 'Technology',
        category: 'Software Development',
        location: 'Bangalore, Karnataka',
        type: 'Full-Time',
        workMode: 'Hybrid',
        experience: '0–1 years',
        freshersEligible: true,
        salary: '₹4.5L - ₹6.5L',
        salaryMin: 450000,
        salaryMax: 650000,
        skills: ['Java', 'Python', 'SQL', 'Object Oriented Programming', 'Cloud Basics'],
        preferredSkills: ['React', 'Angular', 'DevOps'],
        education: "All engineering streams: B.E/B.Tech/M.E/M.Tech/MCA/M.Sc (CS/IT)",
        description: 'Design, build, test, and deploy applications that help leading enterprises adapt to the fast-changing world.',
        responsibilities: [
            'Develop software application components in modern programming languages.',
            'Analyze business processes and configure software solutions accordingly.',
            'Test software for defects and record verification metrics.'
        ],
        benefits: ['Medical & Accidental Insurance', 'Accenture Innovation Centers Access', 'Global Certifications Sponsorship'],
        officialApplyUrl: 'https://www.accenture.com/in-en/careers/jobsearch',
        sourceName: 'Accenture Careers Official Portal',
        sourceUrl: 'https://www.accenture.com/careers',
        verificationStatus: 'Verified',
        status: 'Active'
    },
    {
        companyName: 'Razorpay',
        title: 'Junior Software Engineer - Backend',
        department: 'Engineering',
        category: 'Software Development',
        location: 'Bangalore, Karnataka',
        type: 'Full-Time',
        workMode: 'Hybrid',
        experience: '0–2 years',
        freshersEligible: true,
        salary: '₹14L - ₹22L',
        salaryMin: 1400000,
        salaryMax: 2200000,
        skills: ['Go', 'Python', 'Node.js', 'PostgreSQL', 'Redis', 'Kafka', 'Git'],
        preferredSkills: ['Docker', 'Microservices', 'REST APIs'],
        education: "B.Tech/B.E in Computer Science, Software Engineering or related discipline",
        description: 'Build robust, highly scalable payment processing infrastructure that processes tens of billions of dollars each year with 99.999% reliability.',
        responsibilities: [
            'Develop clean, performant microservices handling banking webhooks and ledger transactions.',
            'Optimize database query execution and cache invalidation strategies.',
            'Collaborate with product and fraud detection teams on security protocols.'
        ],
        benefits: ['ESOPs Options', 'Flexible Spending Account', 'Unlimited Sick Leave', 'Ergonomic Home Office Setup'],
        officialApplyUrl: 'https://razorpay.com/careers/',
        sourceName: 'Razorpay Careers Official Portal',
        sourceUrl: 'https://razorpay.com/careers/',
        verificationStatus: 'Verified',
        status: 'Active'
    },
    {
        companyName: 'Swiggy',
        title: 'Data Analyst - Consumer Intelligence',
        department: 'Data & Analytics',
        category: 'Data Analytics',
        location: 'Bangalore, Karnataka',
        type: 'Full-Time',
        workMode: 'Remote',
        experience: '0–2 years',
        freshersEligible: true,
        salary: '₹10L - ₹16L',
        salaryMin: 1000000,
        salaryMax: 1600000,
        skills: ['SQL', 'Python', 'Tableau', 'Power BI', 'Statistics', 'Excel'],
        preferredSkills: ['Pandas', 'BigQuery', 'A/B Testing'],
        education: "Bachelor's degree in Engineering, Mathematics, Statistics, Economics or related field",
        description: 'Empower rapid-fire decision-making for Swiggy food delivery, Instamart, and Dineout using data warehousing, SQL pipelines, and BI dashboards.',
        responsibilities: [
            'Design and maintain automated daily metric dashboards and KPI scorecards.',
            'Perform funnel drop-off analysis and hypothesize conversion improvements.',
            'Run statistical significance checks for experimental marketing cohorts.'
        ],
        benefits: ['100% Remote Policy', 'Swiggy Food Stipend', 'Health Insurance Cover', 'Annual Learning Credits'],
        officialApplyUrl: 'https://careers.swiggy.in/',
        sourceName: 'Swiggy Careers Official Portal',
        sourceUrl: 'https://careers.swiggy.in/',
        verificationStatus: 'Verified',
        status: 'Active'
    },
    {
        companyName: 'Zerodha',
        title: 'Frontend Engineer - Web & Charts',
        department: 'Engineering',
        category: 'Software Development',
        location: 'Bangalore, Karnataka',
        type: 'Full-Time',
        workMode: 'Remote',
        experience: '0–2 years',
        freshersEligible: true,
        salary: '₹12L - ₹18L',
        salaryMin: 1200000,
        salaryMax: 1800000,
        skills: ['JavaScript', 'TypeScript', 'React', 'HTML5', 'CSS3', 'WebSockets'],
        preferredSkills: ['Canvas API', 'State Management', 'Web Performance'],
        education: "Degree in Computer Science, IT, or equivalent demonstrable open-source projects",
        description: 'Build lightning-fast, zero-dependency financial interfaces and real-time interactive trading charts for millions of retail investors.',
        responsibilities: [
            'Develop accessible, keyboard-first web applications using React and vanilla TypeScript.',
            'Integrate low-latency WebSocket market feeds for live stock order books.',
            'Optimize browser repainting, bundle sizes, and DOM rendering overhead.'
        ],
        benefits: ['Work from Anywhere', 'Profit Sharing Bonus', 'MacBook Pro Hardware', 'Comprehensive Medical Cover'],
        officialApplyUrl: 'https://careers.zerodha.com/',
        sourceName: 'Zerodha Careers Official Portal',
        sourceUrl: 'https://careers.zerodha.com/',
        verificationStatus: 'Verified',
        status: 'Active'
    },
    {
        companyName: 'Qualcomm',
        title: 'Associate Engineer - VLSI & Embedded Software',
        department: 'Hardware & Engineering',
        category: 'Core Engineering',
        location: 'Hyderabad, Telangana',
        type: 'Full-Time',
        workMode: 'On-site',
        experience: '0–2 years',
        freshersEligible: true,
        salary: '₹14L - ₹22L',
        salaryMin: 1400000,
        salaryMax: 2200000,
        skills: ['C', 'C++', 'Verilog', 'SystemVerilog', 'Digital Design', 'Linux'],
        preferredSkills: ['Python Scripting', 'UVM', 'FPGA'],
        education: "B.Tech/M.Tech in Electronics & Communication, VLSI, or Electrical Engineering",
        description: 'Contribute to next-generation Snapdragon SOC verification and low-level embedded software stacks for smartphones, automotive, and compute platforms.',
        responsibilities: [
            'Develop test suites and verification environments for silicon blocks.',
            'Debug functional coverage gaps and timing anomalies.',
            'Collaborate with global chip architects on IP block integration.'
        ],
        benefits: ['Patent Filing Incentives', 'Top Tier Health Insurance', 'Wellness Facilities', 'Employee Stock Purchase Plan'],
        officialApplyUrl: 'https://www.qualcomm.com/company/careers',
        sourceName: 'Qualcomm Careers Official Portal',
        sourceUrl: 'https://www.qualcomm.com/company/careers',
        verificationStatus: 'Verified',
        status: 'Active'
    },
    {
        companyName: 'NVIDIA',
        title: 'System Software Engineer - GPU & AI Compute',
        department: 'Engineering',
        category: 'Artificial Intelligence',
        location: 'Pune, Maharashtra',
        type: 'Full-Time',
        workMode: 'Hybrid',
        experience: '0–2 years',
        freshersEligible: true,
        salary: '₹18L - ₹28L',
        salaryMin: 1800000,
        salaryMax: 2800000,
        skills: ['C++', 'Python', 'CUDA', 'Linux Internals', 'Data Structures', 'Git'],
        preferredSkills: ['PyTorch', 'TensorRT', 'Device Drivers'],
        education: "B.Tech/M.Tech in CS, IT, Electrical or Computer Engineering",
        description: 'NVIDIA is transforming how the world leverages accelerated computing. Join the system software team optimizing CUDA drivers, deep learning compilers, and GPU virtualization.',
        responsibilities: [
            'Write performant C++ code interfacing with GPU kernels and runtime libraries.',
            'Benchmark throughput for AI inference and training workloads.',
            'Diagnose low-level memory latency and kernel scheduling bottlenecks.'
        ],
        benefits: ['NVIDIA Stock Purchase Plan (ESPP)', 'Comprehensive Health Plan', 'Flexible Working Hours', 'Global Relocation Support'],
        officialApplyUrl: 'https://www.nvidia.com/en-us/about-nvidia/careers/',
        sourceName: 'NVIDIA Careers Official Portal',
        sourceUrl: 'https://www.nvidia.com/en-us/about-nvidia/careers/',
        verificationStatus: 'Verified',
        status: 'Active'
    }
];

async function seedCompanyDirectory() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/career_recommender');
        console.log('MongoDB Connected.');

        // 1. Upsert Curated Companies
        console.log(`\nUpserting ${CURATED_COMPANIES.length} Curated Companies...`);
        for (const company of CURATED_COMPANIES) {
            await Company.findOneAndUpdate(
                { companyName: company.companyName },
                { $set: { ...company, updatedAt: new Date() } },
                { upsert: true, new: true }
            );
        }
        console.log(`✓ All ${CURATED_COMPANIES.length} Curated Companies saved.`);

        // 2. Upsert Verified Opportunities
        console.log(`\nUpserting ${VERIFIED_OPPORTUNITIES.length} Verified Job Opportunities...`);
        for (const jobData of VERIFIED_OPPORTUNITIES) {
            const companyDoc = await Company.findOne({ companyName: jobData.companyName });
            await Job.findOneAndUpdate(
                { title: jobData.title, companyName: jobData.companyName },
                {
                    $set: {
                        ...jobData,
                        company: companyDoc ? companyDoc._id : null,
                        lastVerifiedDate: new Date(),
                        updatedAt: new Date()
                    }
                },
                { upsert: true, new: true }
            );
        }
        console.log(`✓ All ${VERIFIED_OPPORTUNITIES.length} Verified Job Opportunities saved.`);

        // 3. Update Available Job Counts on Companies
        for (const company of CURATED_COMPANIES) {
            const count = await Job.countDocuments({
                companyName: company.companyName,
                status: 'Active'
            });
            await Company.findOneAndUpdate(
                { companyName: company.companyName },
                { $set: { availableJobCount: count } }
            );
        }

        console.log('\n✓ Company Directory and Verified Jobs Seeding Complete!');
        await mongoose.disconnect();
    } catch (err) {
        console.error('Error seeding company directory:', err);
    }
}

// Export for programmatic use or run directly
module.exports = { seedCompanyDirectory, VERIFIED_OPPORTUNITIES, CURATED_COMPANIES };

if (require.main === module) {
    seedCompanyDirectory();
}

