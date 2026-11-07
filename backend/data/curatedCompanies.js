/**
 * Curated Official Company Directory with Verified Careers Page URLs.
 * Categorized strictly according to Career Compass Phase 2 specifications.
 */

const CURATED_COMPANIES = [
    {
        companyName: 'Google',
        industry: 'Technology & Cloud Infrastructure',
        category: 'Product-Based Companies',
        description: 'Google is a global technology leader focused on search, cloud computing (GCP), consumer hardware, and artificial intelligence.',
        officialWebsite: 'https://about.google',
        careerPageUrl: 'https://careers.google.com',
        location: 'Bangalore, Hyderabad, Gurgaon',
        companySize: '10,000+',
        isVerified: true
    },
    {
        companyName: 'Microsoft',
        industry: 'Software Platforms & Cloud Computing',
        category: 'Product-Based Companies',
        description: 'Microsoft develops, licenses, and supports software, services, devices, and cloud solutions including Azure, Windows, and Office 365.',
        officialWebsite: 'https://www.microsoft.com',
        careerPageUrl: 'https://careers.microsoft.com',
        location: 'Hyderabad, Bangalore, Noida',
        companySize: '10,000+',
        isVerified: true
    },
    {
        companyName: 'Amazon',
        industry: 'E-Commerce & Cloud Infrastructure',
        category: 'Product-Based Companies',
        description: 'Amazon focuses on e-commerce, cloud computing through AWS, digital streaming, and artificial intelligence systems.',
        officialWebsite: 'https://www.amazon.com',
        careerPageUrl: 'https://amazon.jobs',
        location: 'Bangalore, Hyderabad, Chennai, Mumbai',
        companySize: '10,000+',
        isVerified: true
    },
    {
        companyName: 'Tata Consultancy Services (TCS)',
        industry: 'IT Services & Business Solutions',
        category: 'IT Services',
        description: 'TCS is a global leader in IT services, consulting, and digital business solutions with operations spanning 55 countries.',
        officialWebsite: 'https://www.tcs.com',
        careerPageUrl: 'https://www.tcs.com/careers',
        location: 'Mumbai, Pune, Bangalore, Chennai, Hyderabad, Delhi',
        companySize: '10,000+',
        isVerified: true
    },
    {
        companyName: 'Infosys',
        industry: 'Digital Services & Software Engineering',
        category: 'IT Services',
        description: 'Infosys is a global leader in next-generation digital services, enterprise consulting, and cloud transformation.',
        officialWebsite: 'https://www.infosys.com',
        careerPageUrl: 'https://www.infosys.com/careers',
        location: 'Bangalore, Pune, Hyderabad, Chennai, Mysore',
        companySize: '10,000+',
        isVerified: true
    },
    {
        companyName: 'Wipro',
        industry: 'IT Consulting & System Integration',
        category: 'IT Services',
        description: 'Wipro is a technology services and consulting company focused on building innovative solutions addressing complex digital transformation needs.',
        officialWebsite: 'https://www.wipro.com',
        careerPageUrl: 'https://careers.wipro.com',
        location: 'Bangalore, Pune, Chennai, Hyderabad, Gurgaon',
        companySize: '10,000+',
        isVerified: true
    },
    {
        companyName: 'Accenture',
        industry: 'Strategy & Technology Consulting',
        category: 'Consulting',
        description: 'Accenture is a global professional services company with leading capabilities in digital, cloud, security, and enterprise transformation.',
        officialWebsite: 'https://www.accenture.com/in-en',
        careerPageUrl: 'https://www.accenture.com/careers',
        location: 'Bangalore, Mumbai, Gurgaon, Hyderabad, Pune, Kolkata',
        companySize: '10,000+',
        isVerified: true
    },
    {
        companyName: 'Capgemini',
        industry: 'Consulting & Digital Engineering',
        category: 'IT Services',
        description: 'Capgemini partners with companies to transform and manage their business through technology, cloud services, and AI systems.',
        officialWebsite: 'https://www.capgemini.com',
        careerPageUrl: 'https://www.capgemini.com/careers',
        location: 'Pune, Mumbai, Bangalore, Hyderabad, Chennai',
        companySize: '10,000+',
        isVerified: true
    },
    {
        companyName: 'Cognizant',
        industry: 'IT Services & Digital Operations',
        category: 'IT Services',
        description: 'Cognizant engineers modern businesses to improve everyday life, modernizing technology, reimaging processes, and transforming experiences.',
        officialWebsite: 'https://www.cognizant.com',
        careerPageUrl: 'https://careers.cognizant.com/india-en/',
        location: 'Chennai, Bangalore, Hyderabad, Pune, Kolkata',
        companySize: '10,000+',
        isVerified: true
    },
    {
        companyName: 'IBM',
        industry: 'Hybrid Cloud & Cognitive Software',
        category: 'Product-Based Companies',
        description: 'IBM creates hybrid cloud solutions, Red Hat Enterprise Linux infrastructure, and enterprise AI through watsonx.',
        officialWebsite: 'https://www.ibm.com',
        careerPageUrl: 'https://www.ibm.com/careers',
        location: 'Bangalore, Kochi, Hyderabad, Pune, Gurgaon',
        companySize: '10,000+',
        isVerified: true
    },
    {
        companyName: 'Deloitte',
        industry: 'Audit, Consulting & Financial Advisory',
        category: 'Consulting',
        description: 'Deloitte delivers audit, consulting, tax, and advisory services to many of the world most admired brands.',
        officialWebsite: 'https://www.deloitte.com',
        careerPageUrl: 'https://www.deloitte.com/global/en/careers.html',
        location: 'Hyderabad, Bangalore, Mumbai, Gurgaon, Pune',
        companySize: '10,000+',
        isVerified: true
    },
    {
        companyName: 'HCLTech',
        industry: 'Digital Engineering & IT Infrastructure',
        category: 'IT Services',
        description: 'HCLTech is a global technology company home to more than 220,000 people across 60 countries, delivering capabilities centered around digital, engineering, and cloud.',
        officialWebsite: 'https://www.hcltech.com',
        careerPageUrl: 'https://www.hcltech.com/careers',
        location: 'Noida, Chennai, Bangalore, Pune, Lucknow',
        companySize: '10,000+',
        isVerified: true
    },
    {
        companyName: 'Tech Mahindra',
        industry: 'Telecom & Digital Transformation',
        category: 'IT Services',
        description: 'Tech Mahindra offers innovative and customer-centric digital experiences, enabling enterprises, associates, and the society to Rise.',
        officialWebsite: 'https://www.techmahindra.com',
        careerPageUrl: 'https://www.techmahindra.com/careers',
        location: 'Pune, Mumbai, Hyderabad, Bangalore, Noida',
        companySize: '10,000+',
        isVerified: true
    },
    {
        companyName: 'LTIMindtree',
        industry: 'Global Technology Consulting',
        category: 'IT Services',
        description: 'LTIMindtree is a global technology consulting and digital solutions company that enables enterprises across industries to reimagine business models.',
        officialWebsite: 'https://www.ltimindtree.com',
        careerPageUrl: 'https://www.ltimindtree.com/careers',
        location: 'Mumbai, Bangalore, Pune, Chennai, Hyderabad',
        companySize: '10,000+',
        isVerified: true
    },
    {
        companyName: 'Oracle',
        industry: 'Enterprise Database & Cloud Applications',
        category: 'Product-Based Companies',
        description: 'Oracle provides enterprise database software and technology, cloud engineered systems, and enterprise software products like ERP and CRM.',
        officialWebsite: 'https://www.oracle.com',
        careerPageUrl: 'https://www.oracle.com/careers',
        location: 'Bangalore, Hyderabad, Noida, Mumbai, Pune',
        companySize: '10,000+',
        isVerified: true
    },
    {
        companyName: 'SAP',
        industry: 'Enterprise Resource Planning Software',
        category: 'Product-Based Companies',
        description: 'SAP is a market leader in enterprise application software, helping companies of all sizes and in all industries run at their best.',
        officialWebsite: 'https://www.sap.com',
        careerPageUrl: 'https://jobs.sap.com',
        location: 'Bangalore, Gurgaon, Pune, Mumbai',
        companySize: '10,000+',
        isVerified: true
    },
    {
        companyName: 'Razorpay',
        industry: 'FinTech & Payment Solutions',
        category: 'Startups',
        description: 'Razorpay is India leading full-stack payments and banking platform powering money movement for businesses across India.',
        officialWebsite: 'https://razorpay.com',
        careerPageUrl: 'https://razorpay.com/careers/',
        location: 'Bangalore, Karnataka',
        companySize: '1,000–5,000',
        isVerified: true
    },
    {
        companyName: 'Swiggy',
        industry: 'On-Demand Delivery & Logistics',
        category: 'Startups',
        description: 'Swiggy is India leading on-demand convenience platform connecting consumers to food, grocery, and quick commerce delivery.',
        officialWebsite: 'https://www.swiggy.com',
        careerPageUrl: 'https://careers.swiggy.in/',
        location: 'Bangalore, Karnataka (Remote / Hybrid)',
        companySize: '5,000–10,000',
        isVerified: true
    },
    {
        companyName: 'Zerodha',
        industry: 'Financial Technology & Brokerage',
        category: 'Startups',
        description: 'Zerodha is the largest retail stockbroker in India by active client base, built with a technology-first open source engineering culture.',
        officialWebsite: 'https://zerodha.com',
        careerPageUrl: 'https://careers.zerodha.com/',
        location: 'Bangalore, Karnataka (Remote Friendly)',
        companySize: '500–1,000',
        isVerified: true
    },
    {
        companyName: 'Qualcomm',
        industry: 'Semiconductors & Wireless Telecommunications',
        category: 'Core Engineering',
        description: 'Qualcomm is an American multinational corporation creating semiconductors, wireless communications, and Snapdragon processor architectures.',
        officialWebsite: 'https://www.qualcomm.com',
        careerPageUrl: 'https://www.qualcomm.com/company/careers',
        location: 'Hyderabad, Bangalore, Chennai',
        companySize: '10,000+',
        isVerified: true
    },
    {
        companyName: 'NVIDIA',
        industry: 'AI Hardware & High-Performance Computing',
        category: 'Core Engineering',
        description: 'NVIDIA pioneered GPU computing and accelerates modern breakthroughs in artificial intelligence, gaming, and autonomous driving.',
        officialWebsite: 'https://www.nvidia.com',
        careerPageUrl: 'https://www.nvidia.com/en-us/about-nvidia/careers/',
        location: 'Pune, Bangalore, Hyderabad',
        companySize: '10,000+',
        isVerified: true
    },
    {
        companyName: 'HDFC Bank',
        industry: 'Banking & Financial Services',
        category: 'Finance and Banking',
        description: 'HDFC Bank is India largest private sector bank, delivering digital retail banking, treasury, and financial software platforms.',
        officialWebsite: 'https://www.hdfcbank.com',
        careerPageUrl: 'https://www.hdfc.bank.in/careers',
        location: 'Mumbai, Bangalore, Pune, Delhi',
        companySize: '10,000+',
        isVerified: true
    },
    {
        companyName: 'ISRO',
        industry: 'Aerospace & Scientific Research',
        category: 'Government and Public Sector',
        description: 'Indian Space Research Organisation (ISRO) is the national space agency of India, pioneering space exploration and satellite launch vehicles.',
        officialWebsite: 'https://www.isro.gov.in',
        careerPageUrl: 'https://www.isro.gov.in/Careers.html',
        location: 'Bangalore, Thiruvananthapuram, Sriharikota, Ahmedabad',
        companySize: '10,000+',
        isVerified: true
    }
];

module.exports = { CURATED_COMPANIES };

