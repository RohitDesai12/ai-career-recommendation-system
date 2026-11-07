const mongoose = require('mongoose');
const Resource = require('./models/Resource');
require('dotenv').config({ path: __dirname + '/.env' });

const VERIFIED_RESOURCES = [
    // --- WEB DEVELOPMENT & JAVASCRIPT / TYPESCRIPT ---
    {
        title: 'HTML & CSS Fundamentals Documentation',
        provider: 'MDN Web Docs',
        description: 'Comprehensive official guide to modern semantic HTML5 and CSS3 fundamentals.',
        url: 'https://developer.mozilla.org/en-US/docs/Learn/Getting_started_with_the_web',
        resourceType: 'Doc',
        skill: 'HTML',
        career: 'Full Stack Web Developer',
        department: 'Computer Science & IT',
        difficulty: 'Beginner',
        duration: '10 Hours',
        isFree: true,
        rating: 4.9
    },
    {
        title: 'Responsive Web Design Certification',
        provider: 'freeCodeCamp',
        description: 'Learn modern HTML5, CSS Flexbox, Grid, and responsive design by building real projects.',
        url: 'https://www.freecodecamp.org/learn/2022/responsive-web-design/',
        resourceType: 'Course',
        skill: 'CSS',
        career: 'Full Stack Web Developer',
        department: 'Computer Science & IT',
        difficulty: 'Beginner',
        duration: '30 Hours',
        isFree: true,
        rating: 4.9
    },
    {
        title: 'JavaScript Deep Dive & Reference Guide',
        provider: 'MDN Web Docs',
        description: 'Official authoritative guide for modern ECMAScript features, closures, promises, and async/await.',
        url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript',
        resourceType: 'Doc',
        skill: 'JavaScript',
        career: 'Full Stack Web Developer',
        department: 'Computer Science & IT',
        difficulty: 'Beginner',
        duration: '20 Hours',
        isFree: true,
        rating: 4.9
    },
    {
        title: 'JavaScript Algorithms and Data Structures',
        provider: 'freeCodeCamp',
        description: 'Master fundamentals of JavaScript, ES6+, OOP, functional programming, and data structures.',
        url: 'https://www.freecodecamp.org/learn/javascript-algorithms-and-data-structures/',
        resourceType: 'Practice',
        skill: 'JavaScript',
        career: 'Full Stack Web Developer',
        department: 'Computer Science & IT',
        difficulty: 'Intermediate',
        duration: '40 Hours',
        isFree: true,
        rating: 4.8
    },
    {
        title: 'TypeScript Official Handbook & Tutorials',
        provider: 'Microsoft TypeScript',
        description: 'Learn type annotations, interfaces, generics, and type manipulation in TypeScript.',
        url: 'https://www.typescriptlang.org/docs/handbook/intro.html',
        resourceType: 'Doc',
        skill: 'TypeScript',
        career: 'Full Stack Web Developer',
        department: 'Computer Science & IT',
        difficulty: 'Intermediate',
        duration: '15 Hours',
        isFree: true,
        rating: 4.9
    },
    {
        title: 'React Official Interactive Documentation',
        provider: 'React.dev',
        description: 'Master component architecture, hooks, state management, and modern React 19 best practices.',
        url: 'https://react.dev/learn',
        resourceType: 'Doc',
        skill: 'React',
        career: 'Full Stack Web Developer',
        department: 'Computer Science & IT',
        difficulty: 'Intermediate',
        duration: '25 Hours',
        isFree: true,
        rating: 4.9
    },
    {
        title: 'Full Stack React & Node.js Guide',
        provider: 'FullStackOpen (Univ of Helsinki)',
        description: 'Deep dive into modern single page web apps with React, Redux, Node.js, Express, MongoDB, and GraphQL.',
        url: 'https://fullstackopen.com/en/',
        resourceType: 'Course',
        skill: 'React',
        career: 'Full Stack Web Developer',
        department: 'Computer Science & IT',
        difficulty: 'Intermediate',
        duration: '60 Hours',
        isFree: true,
        rating: 5.0
    },
    {
        title: 'Node.js & Express Architecture Guide',
        provider: 'Node.js Foundation',
        description: 'Official guides on asynchronous event loops, HTTP server modules, REST APIs, and middleware.',
        url: 'https://nodejs.org/en/learn/getting-started/introduction-to-nodejs',
        resourceType: 'Doc',
        skill: 'Node.js',
        career: 'Full Stack Web Developer',
        department: 'Computer Science & IT',
        difficulty: 'Intermediate',
        duration: '18 Hours',
        isFree: true,
        rating: 4.8
    },
    {
        title: 'Express.js Web Application Framework',
        provider: 'Expressjs.com',
        description: 'Fast, unopinionated, minimalist web framework for Node.js REST API creation and route routing.',
        url: 'https://expressjs.com/en/starter/installing.html',
        resourceType: 'Doc',
        skill: 'Express.js',
        career: 'Full Stack Web Developer',
        department: 'Computer Science & IT',
        difficulty: 'Intermediate',
        duration: '12 Hours',
        isFree: true,
        rating: 4.7
    },
    {
        title: 'MongoDB University Node.js Developer Path',
        provider: 'MongoDB Inc.',
        description: 'Build robust database architectures, write aggregation pipelines, and model documents in MongoDB.',
        url: 'https://learn.mongodb.com/',
        resourceType: 'Course',
        skill: 'MongoDB',
        career: 'Full Stack Web Developer',
        department: 'Computer Science & IT',
        difficulty: 'Intermediate',
        duration: '20 Hours',
        isFree: true,
        rating: 4.9
    },
    {
        title: 'SQL & Relational Database Design',
        provider: 'SQLZoo',
        description: 'Hands-on interactive browser SQL playground covering SELECT, JOINs, aggregations, and subqueries.',
        url: 'https://sqlzoo.net/wiki/SQL_Tutorial',
        resourceType: 'Practice',
        skill: 'SQL',
        career: 'Full Stack Web Developer',
        department: 'Computer Science & IT',
        difficulty: 'Beginner',
        duration: '12 Hours',
        isFree: true,
        rating: 4.8
    },
    {
        title: 'PostgreSQL Official Documentation',
        provider: 'PostgreSQL Global Development',
        description: 'Comprehensive tutorials for the world\'s most advanced open source relational database.',
        url: 'https://www.postgresql.org/docs/current/tutorial.html',
        resourceType: 'Doc',
        skill: 'PostgreSQL',
        career: 'Full Stack Web Developer',
        department: 'Computer Science & IT',
        difficulty: 'Intermediate',
        duration: '15 Hours',
        isFree: true,
        rating: 4.8
    },
    {
        title: 'Git & GitHub Version Control Guide',
        provider: 'Git SCM Pro Book',
        description: 'The official Pro Git book covering branching, rebasing, remote collaboration, and pull requests.',
        url: 'https://git-scm.com/book/en/v2',
        resourceType: 'Book',
        skill: 'Git',
        career: 'General',
        department: 'Computer Science & IT',
        difficulty: 'Beginner',
        duration: '10 Hours',
        isFree: true,
        rating: 4.9
    },
    {
        title: 'Docker & Containerization for Developers',
        provider: 'Docker Docs',
        description: 'Build Dockerfiles, containerize full stack applications, and orchestrate with Docker Compose.',
        url: 'https://docs.docker.com/get-started/',
        resourceType: 'Doc',
        skill: 'Docker',
        career: 'Software Development Engineer',
        department: 'Computer Science & IT',
        difficulty: 'Intermediate',
        duration: '14 Hours',
        isFree: true,
        rating: 4.8
    },

    // --- DATA SCIENCE & AI / ML ---
    {
        title: 'Python for Everybody Specialization',
        provider: 'Coursera / Univ of Michigan',
        description: 'Complete foundational programming in Python including data structures, web scraping, and database access.',
        url: 'https://www.coursera.org/specializations/python',
        resourceType: 'Course',
        skill: 'Python',
        career: 'Data Scientist',
        department: 'Computer Science & IT',
        difficulty: 'Beginner',
        duration: '35 Hours',
        isFree: true,
        rating: 4.9
    },
    {
        title: 'Python Official Tutorial & Standard Library',
        provider: 'Python Software Foundation',
        description: 'The definitive guide to Python syntax, standard modules, OOP, and exceptions.',
        url: 'https://docs.python.org/3/tutorial/index.html',
        resourceType: 'Doc',
        skill: 'Python',
        career: 'Software Development Engineer',
        department: 'Computer Science & IT',
        difficulty: 'Beginner',
        duration: '15 Hours',
        isFree: true,
        rating: 4.8
    },
    {
        title: 'Machine Learning Specialization',
        provider: 'DeepLearning.AI / Stanford',
        description: 'Andrew Ng\'s foundational course on Supervised Learning, Neural Networks, and Unsupervised Learning.',
        url: 'https://www.coursera.org/specializations/machine-learning-introduction',
        resourceType: 'Course',
        skill: 'Machine Learning',
        career: 'ML Engineer / AI Researcher',
        department: 'Computer Science & IT',
        difficulty: 'Intermediate',
        duration: '45 Hours',
        isFree: true,
        rating: 4.9
    },
    {
        title: 'Practical Deep Learning for Coders',
        provider: 'fast.ai',
        description: 'Hands-on deep learning with PyTorch, computer vision, natural language processing, and tabular models.',
        url: 'https://course.fast.ai/',
        resourceType: 'Course',
        skill: 'Deep Learning',
        career: 'ML Engineer / AI Researcher',
        department: 'Computer Science & IT',
        difficulty: 'Intermediate',
        duration: '50 Hours',
        isFree: true,
        rating: 5.0
    },
    {
        title: 'PyTorch Official Tutorials & Deep Learning',
        provider: 'PyTorch Foundation',
        description: 'Learn tensor operations, Autograd, neural network modules, CUDA acceleration, and Torchvision.',
        url: 'https://pytorch.org/tutorials/',
        resourceType: 'Doc',
        skill: 'PyTorch',
        career: 'ML Engineer / AI Researcher',
        department: 'Computer Science & IT',
        difficulty: 'Intermediate',
        duration: '25 Hours',
        isFree: true,
        rating: 4.9
    },
    {
        title: 'TensorFlow Core & Keras Quickstart',
        provider: 'TensorFlow Docs',
        description: 'Comprehensive guide to building, training, and deploying neural networks with Keras and TensorFlow.',
        url: 'https://www.tensorflow.org/tutorials',
        resourceType: 'Doc',
        skill: 'TensorFlow',
        career: 'ML Engineer / AI Researcher',
        department: 'Computer Science & IT',
        difficulty: 'Intermediate',
        duration: '20 Hours',
        isFree: true,
        rating: 4.8
    },
    {
        title: 'Pandas & NumPy Data Analysis Library',
        provider: 'Pandas PyData',
        description: 'Essential data manipulation, cleaning, aggregation, time series analysis, and statistical querying.',
        url: 'https://pandas.pydata.org/docs/user_guide/index.html',
        resourceType: 'Doc',
        skill: 'Pandas',
        career: 'Data Scientist',
        department: 'Computer Science & IT',
        difficulty: 'Beginner',
        duration: '18 Hours',
        isFree: true,
        rating: 4.8
    },
    {
        title: 'Kaggle Hands-on Micro-Courses',
        provider: 'Kaggle',
        description: 'Interactive bite-sized practical tutorials on Python, Pandas, Data Visualization, and Feature Engineering.',
        url: 'https://www.kaggle.com/learn',
        resourceType: 'Practice',
        skill: 'Data Analysis',
        career: 'Data Scientist',
        department: 'Computer Science & IT',
        difficulty: 'Beginner',
        duration: '25 Hours',
        isFree: true,
        rating: 4.9
    },

    // --- CLOUD, DEVOPS & SYSTEM DESIGN ---
    {
        title: 'AWS Cloud Practitioner & Architecture Guide',
        provider: 'AWS Training & Certification',
        description: 'Learn compute (EC2, Lambda), storage (S3), networking (VPC), IAM security, and serverless architectures.',
        url: 'https://aws.amazon.com/training/',
        resourceType: 'Course',
        skill: 'AWS',
        career: 'Cloud Architect / DevOps Engineer',
        department: 'Computer Science & IT',
        difficulty: 'Intermediate',
        duration: '30 Hours',
        isFree: true,
        rating: 4.8
    },
    {
        title: 'Kubernetes Official Documentation & Interactive Sandbox',
        provider: 'Kubernetes.io / CNCF',
        description: 'Production container orchestration, Pods, Deployments, Services, ConfigMaps, and Ingress controllers.',
        url: 'https://kubernetes.io/docs/tutorials/',
        resourceType: 'Doc',
        skill: 'Kubernetes',
        career: 'Cloud Architect / DevOps Engineer',
        department: 'Computer Science & IT',
        difficulty: 'Advanced',
        duration: '25 Hours',
        isFree: true,
        rating: 4.9
    },
    {
        title: 'CI/CD with GitHub Actions',
        provider: 'GitHub Docs',
        description: 'Automate build, test, and deployment workflows with GitHub Actions CI/CD pipelines.',
        url: 'https://docs.github.com/en/actions/learn-github-actions',
        resourceType: 'Tutorial',
        skill: 'CI/CD',
        career: 'Cloud Architect / DevOps Engineer',
        department: 'Computer Science & IT',
        difficulty: 'Intermediate',
        duration: '10 Hours',
        isFree: true,
        rating: 4.8
    },
    {
        title: 'System Design Primer',
        provider: 'Donne Martin / GitHub',
        description: 'Comprehensive guide to scaling distributed systems, load balancing, caching, microservices, and databases.',
        url: 'https://github.com/donnemartin/system-design-primer',
        resourceType: 'Book',
        skill: 'System Design',
        career: 'Software Development Engineer',
        department: 'Computer Science & IT',
        difficulty: 'Advanced',
        duration: '40 Hours',
        isFree: true,
        rating: 5.0
    },

    // --- CYBERSECURITY ---
    {
        title: 'TryHackMe Cyber Security Fundamentals',
        provider: 'TryHackMe',
        description: 'Hands-on network security, web application penetration testing, Linux command line, and SOC workflows.',
        url: 'https://tryhackme.com/path/outline/presecurity',
        resourceType: 'Practice',
        skill: 'Cybersecurity',
        career: 'Cybersecurity Analyst',
        department: 'Computer Science & IT',
        difficulty: 'Beginner',
        duration: '35 Hours',
        isFree: true,
        rating: 4.9
    },
    {
        title: 'OWASP Top 10 Web Application Security',
        provider: 'OWASP Foundation',
        description: 'In-depth guide on SQL injection, XSS, broken access control, and API security remediation.',
        url: 'https://owasp.org/www-project-top-ten/',
        resourceType: 'Doc',
        skill: 'Network Security',
        career: 'Cybersecurity Analyst',
        department: 'Computer Science & IT',
        difficulty: 'Intermediate',
        duration: '15 Hours',
        isFree: true,
        rating: 4.9
    },

    // --- ELECTRONICS & EMBEDDED SYSTEMS ---
    {
        title: 'Embedded C and Microcontroller Architecture',
        provider: 'Coursera / Univ of Colorado Boulder',
        description: 'Learn ARM Cortex-M architecture, memory-mapped I/O, timers, interrupts, and bare-metal embedded C programming.',
        url: 'https://www.coursera.org/specializations/embedded-systems',
        resourceType: 'Course',
        skill: 'Embedded C',
        career: 'Embedded Systems Engineer',
        department: 'Electronics & Communication',
        difficulty: 'Intermediate',
        duration: '40 Hours',
        isFree: true,
        rating: 4.8
    },
    {
        title: 'VLSI Digital Design and Verilog HDL',
        provider: 'NPTEL / IIT Madras',
        description: 'Combinational and sequential digital circuit design, RTL modeling, synthesis, and FPGA implementation with Verilog.',
        url: 'https://nptel.ac.in/courses/117105080',
        resourceType: 'Course',
        skill: 'Verilog',
        career: 'VLSI Design Engineer',
        department: 'Electronics & Communication',
        difficulty: 'Intermediate',
        duration: '30 Hours',
        isFree: true,
        rating: 4.7
    },

    // --- MECHANICAL & AEROSPACE ---
    {
        title: 'Engineering CAD Design with SolidWorks & Fusion 360',
        provider: 'Autodesk Design Academy',
        description: '3D parametric modeling, mechanical assembly creation, drafting standards, and simulation.',
        url: 'https://www.autodesk.com/certification/learn',
        resourceType: 'Course',
        skill: 'CAD',
        career: 'Automotive Design Engineer',
        department: 'Mechanical & Manufacturing',
        difficulty: 'Beginner',
        duration: '25 Hours',
        isFree: true,
        rating: 4.8
    },
    {
        title: 'Fundamentals of Fluid Dynamics & CFD',
        provider: 'MIT OpenCourseWare',
        description: 'Governing Navier-Stokes equations, boundary layer theory, compressible flow, and computational fluid dynamics.',
        url: 'https://ocw.mit.edu/courses/2-06-fluid-dynamics-spring-2013/',
        resourceType: 'Course',
        skill: 'CFD',
        career: 'Aerodynamics / CFD Engineer',
        department: 'Mechanical & Manufacturing',
        difficulty: 'Intermediate',
        duration: '35 Hours',
        isFree: true,
        rating: 4.9
    },

    // --- CIVIL & INFRASTRUCTURE ---
    {
        title: 'Structural Analysis and Design with ETABS & STAAD',
        provider: 'NPTEL / IIT Kharagpur',
        description: 'Matrix methods of structural analysis, reinforced concrete design, and seismic load calculations.',
        url: 'https://nptel.ac.in/courses/105105166',
        resourceType: 'Course',
        skill: 'Structural Design',
        career: 'Structural Design Engineer',
        department: 'Civil & Infrastructure',
        difficulty: 'Intermediate',
        duration: '30 Hours',
        isFree: true,
        rating: 4.7
    }
];

async function seed() {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/career-compass');
        console.log('MongoDB connected for seeding resources');

        // Upsert verified resources based on URL
        let inserted = 0;
        let updated = 0;

        for (const res of VERIFIED_RESOURCES) {
            const existing = await Resource.findOne({ url: res.url });
            if (existing) {
                await Resource.updateOne({ _id: existing._id }, { $set: res });
                updated++;
            } else {
                await Resource.create(res);
                inserted++;
            }
        }

        console.log(`Seeding complete: ${inserted} new resources inserted, ${updated} existing resources updated.`);
        process.exit(0);
    } catch (err) {
        console.error('Error seeding resources:', err);
        process.exit(1);
    }
}

seed();
