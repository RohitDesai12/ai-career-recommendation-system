export interface Course {
  id: number;
  title: string;
  platform: string;
  branch: string;
  cost: "Free" | "Paid";
  rating: number;
  url: string;
  image: string;
}

export const COURSES: Course[] = [
  {
    "id": 1,
    "title": "Applied Machine Learning in Python",
    "platform": "Coursera",
    "branch": "Computer Science & IT",
    "cost": "Paid",
    "rating": 4.8,
    "url": "https://www.coursera.org/learn/python-machine-learning",
    "image": "https://images.unsplash.com/photo-1527474305487-b87b222841cc?w=500&auto=format&fit=crop&q=60"
  },
  {
    "id": 2,
    "title": "CS50's Introduction to Computer Science",
    "platform": "edX",
    "branch": "Computer Science & IT",
    "cost": "Free",
    "rating": 4.9,
    "url": "https://www.edx.org/learn/computer-science/harvard-university-cs50-s-introduction-to-computer-science",
    "image": "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=500&auto=format&fit=crop&q=60"
  },
  {
    "id": 3,
    "title": "Data Engineering Nanodegree",
    "platform": "Udacity",
    "branch": "Computer Science & IT",
    "cost": "Paid",
    "rating": 4.9,
    "url": "https://www.udacity.com/course/data-engineer-nanodegree--nd027",
    "image": "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=500&auto=format&fit=crop&q=60"
  },
  {
    "id": 4,
    "title": "Python for Everybody Specialization",
    "platform": "Coursera",
    "branch": "Computer Science & IT",
    "cost": "Free",
    "rating": 4.8,
    "url": "https://www.coursera.org/specializations/python",
    "image": "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=500&auto=format&fit=crop&q=60"
  },
  {
    "id": 5,
    "title": "Next.js 14 Developer Tutorial - Full Course",
    "platform": "YouTube",
    "branch": "Computer Science & IT",
    "cost": "Free",
    "rating": 4.9,
    "url": "https://www.youtube.com/watch?v=ZjAqacLYzQI",
    "image": "https://images.unsplash.com/photo-1581291518633-83b4ebd1d83e?w=500&auto=format&fit=crop&q=60"
  },
  {
    "id": 6,
    "title": "Docker & Kubernetes: The Practical Guide",
    "platform": "Udemy",
    "branch": "Computer Science & IT",
    "cost": "Paid",
    "rating": 4.8,
    "url": "https://www.udemy.com/course/docker-kubernetes-the-practical-guide/",
    "image": "https://images.unsplash.com/photo-1607799279861-4dd421887fb3?w=500&auto=format&fit=crop&q=60"
  },
  {
    "id": 7,
    "title": "The Complete Web Development Bootcamp",
    "platform": "Udemy",
    "branch": "Computer Science & IT",
    "cost": "Paid",
    "rating": 4.9,
    "url": "https://www.udemy.com/course/the-complete-web-development-bootcamp/",
    "image": "https://images.unsplash.com/photo-1547658719-da2b81169144?w=500&auto=format&fit=crop&q=60"
  },
  {
    "id": 8,
    "title": "Git and GitHub Complete Crash Course",
    "platform": "YouTube",
    "branch": "Computer Science & IT",
    "cost": "Free",
    "rating": 4.8,
    "url": "https://www.youtube.com/watch?v=RGOj5yH7evk",
    "image": "https://images.unsplash.com/photo-1618401471353-b98aedd07871?w=500&auto=format&fit=crop&q=60"
  },
  {
    "id": 9,
    "title": "Introduction to VLSI Design",
    "platform": "Coursera",
    "branch": "Electronics & Communication",
    "cost": "Paid",
    "rating": 4.7,
    "url": "https://www.coursera.org/learn/vlsi-cad-logic-synthesis",
    "image": "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=500&auto=format&fit=crop&q=60"
  },
  {
    "id": 10,
    "title": "Embedded Systems Essentials with Arm Getting Started",
    "platform": "edX",
    "branch": "Electronics & Communication",
    "cost": "Free",
    "rating": 4.6,
    "url": "https://www.edx.org/learn/embedded-systems/arm-education-embedded-systems-essentials-with-arm-getting-started",
    "image": "https://images.unsplash.com/photo-1518770660439-4636190af475?w=500&auto=format&fit=crop&q=60"
  },
  {
    "id": 11,
    "title": "Introduction to FPGA Design for Embedded Systems",
    "platform": "Coursera",
    "branch": "Electronics & Communication",
    "cost": "Paid",
    "rating": 4.7,
    "url": "https://www.coursera.org/learn/fpga-design",
    "image": "https://images.unsplash.com/photo-1555680202-c86f0e12f086?w=500&auto=format&fit=crop&q=60"
  },
  {
    "id": 12,
    "title": "Verilog HDL: VLSI Hardware Description Language",
    "platform": "Udemy",
    "branch": "Electronics & Communication",
    "cost": "Paid",
    "rating": 4.8,
    "url": "https://www.udemy.com/course/verilog-hdl/",
    "image": "https://images.unsplash.com/photo-1563770660941-20978e870e26?w=500&auto=format&fit=crop&q=60"
  },
  {
    "id": 13,
    "title": "Arduino & IoT Sensors Workshop",
    "platform": "YouTube",
    "branch": "Electronics & Communication",
    "cost": "Free",
    "rating": 4.7,
    "url": "https://www.youtube.com/results?search_query=arduino+iot+sensors+workshop",
    "image": "https://images.unsplash.com/photo-1553406830-ef2513450d76?w=500&auto=format&fit=crop&q=60"
  },
  {
    "id": 14,
    "title": "Power Electronics and Drives Specialization",
    "platform": "Coursera",
    "branch": "Electrical & Power",
    "cost": "Paid",
    "rating": 4.8,
    "url": "https://www.coursera.org/specializations/power-electronics",
    "image": "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=500&auto=format&fit=crop&q=60"
  },
  {
    "id": 15,
    "title": "Renewable Energy and Smart Grids",
    "platform": "edX",
    "branch": "Electrical & Power",
    "cost": "Free",
    "rating": 4.7,
    "url": "https://www.edx.org/learn/renewable-energy/delft-university-of-technology-renewable-energy-integration-with-smart-grids",
    "image": "https://images.unsplash.com/photo-1466611653911-95081537e5b7?w=500&auto=format&fit=crop&q=60"
  },
  {
    "id": 16,
    "title": "PLC and SCADA Programming Bootcamp",
    "platform": "Udemy",
    "branch": "Electrical & Power",
    "cost": "Paid",
    "rating": 4.6,
    "url": "https://www.udemy.com/topic/plc/",
    "image": "https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?w=500&auto=format&fit=crop&q=60"
  },
  {
    "id": 17,
    "title": "Wind Energy Fundamentals & Integration",
    "platform": "Coursera",
    "branch": "Electrical & Power",
    "cost": "Free",
    "rating": 4.8,
    "url": "https://www.coursera.org/learn/wind-energy",
    "image": "https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?w=500&auto=format&fit=crop&q=60"
  },
  {
    "id": 18,
    "title": "Electric Vehicle Powertrain Engineering",
    "platform": "YouTube",
    "branch": "Electrical & Power",
    "cost": "Free",
    "rating": 4.8,
    "url": "https://www.youtube.com/results?search_query=electric+vehicle+powertrain+engineering",
    "image": "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=500&auto=format&fit=crop&q=60"
  },
  {
    "id": 19,
    "title": "Autodesk Certified: CAD for Mechanical Design",
    "platform": "Coursera",
    "branch": "Mechanical & Manufacturing",
    "cost": "Paid",
    "rating": 4.8,
    "url": "https://www.coursera.org/professional-certificates/autodesk-cad-design-mechanical-engineering",
    "image": "https://images.unsplash.com/photo-1537462715879-360eeb61a0bc?w=500&auto=format&fit=crop&q=60"
  },
  {
    "id": 20,
    "title": "Hands-on Introduction to Engineering Simulations",
    "platform": "edX",
    "branch": "Mechanical & Manufacturing",
    "cost": "Free",
    "rating": 4.9,
    "url": "https://www.edx.org/learn/engineering/cornell-university-a-hands-on-introduction-to-engineering-simulations",
    "image": "https://images.unsplash.com/photo-1616401784845-180882ba9ba8?w=500&auto=format&fit=crop&q=60"
  },
  {
    "id": 21,
    "title": "Robotics and Kinematics Specialization",
    "platform": "Coursera",
    "branch": "Mechanical & Manufacturing",
    "cost": "Free",
    "rating": 4.7,
    "url": "https://www.coursera.org/specializations/modernrobotics",
    "image": "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=500&auto=format&fit=crop&q=60"
  },
  {
    "id": 22,
    "title": "ANSYS Mechanical FEA Practical Training",
    "platform": "Udemy",
    "branch": "Mechanical & Manufacturing",
    "cost": "Paid",
    "rating": 4.8,
    "url": "https://www.udemy.com/course/ansys-fea/",
    "image": "https://images.unsplash.com/photo-1509023467864-1ecbb3e03427?w=500&auto=format&fit=crop&q=60"
  },
  {
    "id": 23,
    "title": "SolidWorks Tutorial for Beginners - Complete Course",
    "platform": "YouTube",
    "branch": "Mechanical & Manufacturing",
    "cost": "Free",
    "rating": 4.9,
    "url": "https://www.youtube.com/watch?v=q3zS7U1_oY0",
    "image": "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=500&auto=format&fit=crop&q=60"
  },
  {
    "id": 24,
    "title": "Structural Design and Construction Engineering",
    "platform": "Coursera",
    "branch": "Civil & Infrastructure",
    "cost": "Paid",
    "rating": 4.7,
    "url": "https://www.coursera.org/learn/construction-estimation-cost-control",
    "image": "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=500&auto=format&fit=crop&q=60"
  },
  {
    "id": 25,
    "title": "Sustainable Building Design and Revit",
    "platform": "edX",
    "branch": "Civil & Infrastructure",
    "cost": "Free",
    "rating": 4.8,
    "url": "https://www.edx.org/learn/revit",
    "image": "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=500&auto=format&fit=crop&q=60"
  },
  {
    "id": 26,
    "title": "MS Project for Construction Planning Bootcamp",
    "platform": "Udemy",
    "branch": "Civil & Infrastructure",
    "cost": "Paid",
    "rating": 4.6,
    "url": "https://www.udemy.com/topic/microsoft-project/",
    "image": "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=500&auto=format&fit=crop&q=60"
  },
  {
    "id": 27,
    "title": "Introduction to GIS Mapping & Spatial Analysis",
    "platform": "Coursera",
    "branch": "Civil & Infrastructure",
    "cost": "Free",
    "rating": 4.8,
    "url": "https://www.coursera.org/specializations/gis",
    "image": "https://images.unsplash.com/photo-1524661135-423995f22d0b?w=500&auto=format&fit=crop&q=60"
  },
  {
    "id": 28,
    "title": "AutoCAD Civil 3D Infrastructure Tutorial",
    "platform": "YouTube",
    "branch": "Civil & Infrastructure",
    "cost": "Free",
    "rating": 4.8,
    "url": "https://www.youtube.com/results?search_query=autocad+civil+3d+tutorial",
    "image": "https://images.unsplash.com/photo-1590069261209-f8e9b8642343?w=500&auto=format&fit=crop&q=60"
  },
  {
    "id": 29,
    "title": "React Native Mobile App Development",
    "platform": "Coursera",
    "branch": "Computer Science & IT",
    "cost": "Free",
    "rating": 4.5,
    "url": "https://www.coursera.org/search?query=React%20Native%20Mobile%20App%20Development",
    "image": "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=500&auto=format&fit=crop&q=60"
  },
  {
    "id": 30,
    "title": "Introduction to Cyber Security & Ethical Hacking",
    "platform": "Udemy",
    "branch": "Computer Science & IT",
    "cost": "Paid",
    "rating": 4.6,
    "url": "https://www.udemy.com/courses/search/?q=Introduction%20to%20Cyber%20Security%20%26%20Ethical%20Hacking",
    "image": "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=500&auto=format&fit=crop&q=60"
  },
  {
    "id": 31,
    "title": "Node.js & Express API Development Complete Guide",
    "platform": "edX",
    "branch": "Computer Science & IT",
    "cost": "Free",
    "rating": 4.7,
    "url": "https://www.edx.org/search?q=Node.js%20%26%20Express%20API%20Development%20Complete%20Guide",
    "image": "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=500&auto=format&fit=crop&q=60"
  },
  {
    "id": 32,
    "title": "Algorithms and Data Structures Masterclass",
    "platform": "YouTube",
    "branch": "Computer Science & IT",
    "cost": "Free",
    "rating": 4.8,
    "url": "https://www.youtube.com/results?search_query=Algorithms%20and%20Data%20Structures%20Masterclass",
    "image": "https://images.unsplash.com/photo-1607799279861-4dd421887fb3?w=500&auto=format&fit=crop&q=60"
  },
  {
    "id": 33,
    "title": "AWS Certified Solutions Architect Training",
    "platform": "Udacity",
    "branch": "Computer Science & IT",
    "cost": "Paid",
    "rating": 4.9,
    "url": "https://www.udacity.com/courses/all",
    "image": "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=500&auto=format&fit=crop&q=60"
  },
  {
    "id": 34,
    "title": "TypeScript Deep Dive for Front-end Developers",
    "platform": "Coursera",
    "branch": "Computer Science & IT",
    "cost": "Paid",
    "rating": 4.5,
    "url": "https://www.coursera.org/search?query=TypeScript%20Deep%20Dive%20for%20Front-end%20Developers",
    "image": "https://images.unsplash.com/photo-1516116211223-5c359a36298a?w=500&auto=format&fit=crop&q=60"
  },
  {
    "id": 35,
    "title": "Database Systems: SQL & MongoDB Bootcamp",
    "platform": "Udemy",
    "branch": "Computer Science & IT",
    "cost": "Paid",
    "rating": 4.6,
    "url": "https://www.udemy.com/courses/search/?q=Database%20Systems%3A%20SQL%20%26%20MongoDB%20Bootcamp",
    "image": "https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=500&auto=format&fit=crop&q=60"
  },
  {
    "id": 36,
    "title": "Kubernetes in Production: DevOps Engineering",
    "platform": "edX",
    "branch": "Computer Science & IT",
    "cost": "Paid",
    "rating": 4.7,
    "url": "https://www.edx.org/search?q=Kubernetes%20in%20Production%3A%20DevOps%20Engineering",
    "image": "https://images.unsplash.com/photo-1618401471353-b98aedd07871?w=500&auto=format&fit=crop&q=60"
  },
  {
    "id": 37,
    "title": "Machine Learning with TensorFlow & Keras",
    "platform": "YouTube",
    "branch": "Computer Science & IT",
    "cost": "Free",
    "rating": 4.8,
    "url": "https://www.youtube.com/results?search_query=Machine%20Learning%20with%20TensorFlow%20%26%20Keras",
    "image": "https://images.unsplash.com/photo-1507146426996-ef05306b995a?w=500&auto=format&fit=crop&q=60"
  },
  {
    "id": 38,
    "title": "Natural Language Processing (NLP) in Python",
    "platform": "Udacity",
    "branch": "Computer Science & IT",
    "cost": "Paid",
    "rating": 4.9,
    "url": "https://www.udacity.com/courses/all",
    "image": "https://images.unsplash.com/photo-1543946207-39bd91e70ca7?w=500&auto=format&fit=crop&q=60"
  },
  {
    "id": 39,
    "title": "Vue.js 3 Masterclass: Composition API & Pinia",
    "platform": "Coursera",
    "branch": "Computer Science & IT",
    "cost": "Paid",
    "rating": 4.5,
    "url": "https://www.coursera.org/search?query=Vue.js%203%20Masterclass%3A%20Composition%20API%20%26%20Pinia",
    "image": "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=500&auto=format&fit=crop&q=60"
  },
  {
    "id": 40,
    "title": "Rust Programming Language: Complete Guide",
    "platform": "Udemy",
    "branch": "Computer Science & IT",
    "cost": "Paid",
    "rating": 4.6,
    "url": "https://www.udemy.com/courses/search/?q=Rust%20Programming%20Language%3A%20Complete%20Guide",
    "image": "https://images.unsplash.com/photo-1605379399642-870262d3d051?w=500&auto=format&fit=crop&q=60"
  },
  {
    "id": 41,
    "title": "Advanced React Native Mobile App Development",
    "platform": "edX",
    "branch": "Computer Science & IT",
    "cost": "Free",
    "rating": 4.7,
    "url": "https://www.edx.org/search?q=Advanced%20React%20Native%20Mobile%20App%20Development",
    "image": "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=500&auto=format&fit=crop&q=60"
  },
  {
    "id": 42,
    "title": "Principles of Introduction to Cyber Security & Ethical Hacking",
    "platform": "YouTube",
    "branch": "Computer Science & IT",
    "cost": "Free",
    "rating": 4.8,
    "url": "https://www.youtube.com/results?search_query=Principles%20of%20Introduction%20to%20Cyber%20Security%20%26%20Ethical%20Hacking",
    "image": "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=500&auto=format&fit=crop&q=60"
  },
  {
    "id": 43,
    "title": "Advanced Node.js & Express API Development Complete Guide",
    "platform": "Udacity",
    "branch": "Computer Science & IT",
    "cost": "Paid",
    "rating": 4.9,
    "url": "https://www.udacity.com/courses/all",
    "image": "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=500&auto=format&fit=crop&q=60"
  },
  {
    "id": 44,
    "title": "Principles of Algorithms and Data Structures Masterclass",
    "platform": "Coursera",
    "branch": "Computer Science & IT",
    "cost": "Free",
    "rating": 4.5,
    "url": "https://www.coursera.org/search?query=Principles%20of%20Algorithms%20and%20Data%20Structures%20Masterclass",
    "image": "https://images.unsplash.com/photo-1607799279861-4dd421887fb3?w=500&auto=format&fit=crop&q=60"
  },
  {
    "id": 45,
    "title": "Advanced AWS Certified Solutions Architect Training",
    "platform": "Udemy",
    "branch": "Computer Science & IT",
    "cost": "Paid",
    "rating": 4.6,
    "url": "https://www.udemy.com/courses/search/?q=Advanced%20AWS%20Certified%20Solutions%20Architect%20Training",
    "image": "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=500&auto=format&fit=crop&q=60"
  },
  {
    "id": 46,
    "title": "Principles of TypeScript Deep Dive for Front-end Developers",
    "platform": "edX",
    "branch": "Computer Science & IT",
    "cost": "Paid",
    "rating": 4.7,
    "url": "https://www.edx.org/search?q=Principles%20of%20TypeScript%20Deep%20Dive%20for%20Front-end%20Developers",
    "image": "https://images.unsplash.com/photo-1516116211223-5c359a36298a?w=500&auto=format&fit=crop&q=60"
  },
  {
    "id": 47,
    "title": "Advanced Database Systems: SQL & MongoDB Bootcamp",
    "platform": "YouTube",
    "branch": "Computer Science & IT",
    "cost": "Free",
    "rating": 4.8,
    "url": "https://www.youtube.com/results?search_query=Advanced%20Database%20Systems%3A%20SQL%20%26%20MongoDB%20Bootcamp",
    "image": "https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=500&auto=format&fit=crop&q=60"
  },
  {
    "id": 48,
    "title": "Principles of Kubernetes in Production: DevOps Engineering",
    "platform": "Udacity",
    "branch": "Computer Science & IT",
    "cost": "Paid",
    "rating": 4.9,
    "url": "https://www.udacity.com/courses/all",
    "image": "https://images.unsplash.com/photo-1618401471353-b98aedd07871?w=500&auto=format&fit=crop&q=60"
  },
  {
    "id": 49,
    "title": "ASIC & FPGA Digital Design with SystemVerilog",
    "platform": "Coursera",
    "branch": "Electronics & Communication",
    "cost": "Free",
    "rating": 4.5,
    "url": "https://www.coursera.org/search?query=ASIC%20%26%20FPGA%20Digital%20Design%20with%20SystemVerilog",
    "image": "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=500&auto=format&fit=crop&q=60"
  },
  {
    "id": 50,
    "title": "Embedded Systems C Programming on ARM Cortex-M",
    "platform": "Udemy",
    "branch": "Electronics & Communication",
    "cost": "Paid",
    "rating": 4.6,
    "url": "https://www.udemy.com/courses/search/?q=Embedded%20Systems%20C%20Programming%20on%20ARM%20Cortex-M",
    "image": "https://images.unsplash.com/photo-1518770660439-4636190af475?w=500&auto=format&fit=crop&q=60"
  },
  {
    "id": 51,
    "title": "Digital Signal Processing (DSP) & MATLAB Applications",
    "platform": "edX",
    "branch": "Electronics & Communication",
    "cost": "Free",
    "rating": 4.7,
    "url": "https://www.edx.org/search?q=Digital%20Signal%20Processing%20(DSP)%20%26%20MATLAB%20Applications",
    "image": "https://images.unsplash.com/photo-1557072033-01053a23a3ab?w=500&auto=format&fit=crop&q=60"
  },
  {
    "id": 52,
    "title": "Wireless Communication Systems: 4G to 5G",
    "platform": "YouTube",
    "branch": "Electronics & Communication",
    "cost": "Free",
    "rating": 4.8,
    "url": "https://www.youtube.com/results?search_query=Wireless%20Communication%20Systems%3A%204G%20to%205G",
    "image": "https://images.unsplash.com/photo-1562408590-e32931084e23?w=500&auto=format&fit=crop&q=60"
  },
  {
    "id": 53,
    "title": "IoT Device Networks: Protocols, MQTT & Sensors",
    "platform": "Udacity",
    "branch": "Electronics & Communication",
    "cost": "Paid",
    "rating": 4.9,
    "url": "https://www.udacity.com/courses/all",
    "image": "https://images.unsplash.com/photo-1558346490-a72e53ae2d4f?w=500&auto=format&fit=crop&q=60"
  },
  {
    "id": 54,
    "title": "CMOS Analog IC Design Essentials",
    "platform": "Coursera",
    "branch": "Electronics & Communication",
    "cost": "Paid",
    "rating": 4.5,
    "url": "https://www.coursera.org/search?query=CMOS%20Analog%20IC%20Design%20Essentials",
    "image": "https://images.unsplash.com/photo-1563770660941-20978e870e26?w=500&auto=format&fit=crop&q=60"
  },
  {
    "id": 55,
    "title": "Digital Communication & Information Theory",
    "platform": "Udemy",
    "branch": "Electronics & Communication",
    "cost": "Paid",
    "rating": 4.6,
    "url": "https://www.udemy.com/courses/search/?q=Digital%20Communication%20%26%20Information%20Theory",
    "image": "https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=500&auto=format&fit=crop&q=60"
  },
  {
    "id": 56,
    "title": "RTOS Concepts & Real-Time Embedded Programming",
    "platform": "edX",
    "branch": "Electronics & Communication",
    "cost": "Paid",
    "rating": 4.7,
    "url": "https://www.edx.org/search?q=RTOS%20Concepts%20%26%20Real-Time%20Embedded%20Programming",
    "image": "https://images.unsplash.com/photo-1553406830-ef2513450d76?w=500&auto=format&fit=crop&q=60"
  },
  {
    "id": 57,
    "title": "Antenna Theory, Design & RF Engineering",
    "platform": "YouTube",
    "branch": "Electronics & Communication",
    "cost": "Free",
    "rating": 4.8,
    "url": "https://www.youtube.com/results?search_query=Antenna%20Theory%2C%20Design%20%26%20RF%20Engineering",
    "image": "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=500&auto=format&fit=crop&q=60"
  },
  {
    "id": 58,
    "title": "FPGA Prototyping Workshop for Beginners",
    "platform": "Udacity",
    "branch": "Electronics & Communication",
    "cost": "Paid",
    "rating": 4.9,
    "url": "https://www.udacity.com/courses/all",
    "image": "https://images.unsplash.com/photo-1555680202-c86f0e12f086?w=500&auto=format&fit=crop&q=60"
  },
  {
    "id": 59,
    "title": "Advanced ASIC & FPGA Digital Design with SystemVerilog",
    "platform": "Coursera",
    "branch": "Electronics & Communication",
    "cost": "Paid",
    "rating": 4.5,
    "url": "https://www.coursera.org/search?query=Advanced%20ASIC%20%26%20FPGA%20Digital%20Design%20with%20SystemVerilog",
    "image": "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=500&auto=format&fit=crop&q=60"
  },
  {
    "id": 60,
    "title": "Principles of Embedded Systems C Programming on ARM Cortex-M",
    "platform": "Udemy",
    "branch": "Electronics & Communication",
    "cost": "Paid",
    "rating": 4.6,
    "url": "https://www.udemy.com/courses/search/?q=Principles%20of%20Embedded%20Systems%20C%20Programming%20on%20ARM%20Cortex-M",
    "image": "https://images.unsplash.com/photo-1518770660439-4636190af475?w=500&auto=format&fit=crop&q=60"
  },
  {
    "id": 61,
    "title": "Advanced Digital Signal Processing (DSP) & MATLAB Applications",
    "platform": "edX",
    "branch": "Electronics & Communication",
    "cost": "Free",
    "rating": 4.7,
    "url": "https://www.edx.org/search?q=Advanced%20Digital%20Signal%20Processing%20(DSP)%20%26%20MATLAB%20Applications",
    "image": "https://images.unsplash.com/photo-1557072033-01053a23a3ab?w=500&auto=format&fit=crop&q=60"
  },
  {
    "id": 62,
    "title": "Principles of Wireless Communication Systems: 4G to 5G",
    "platform": "YouTube",
    "branch": "Electronics & Communication",
    "cost": "Free",
    "rating": 4.8,
    "url": "https://www.youtube.com/results?search_query=Principles%20of%20Wireless%20Communication%20Systems%3A%204G%20to%205G",
    "image": "https://images.unsplash.com/photo-1562408590-e32931084e23?w=500&auto=format&fit=crop&q=60"
  },
  {
    "id": 63,
    "title": "Advanced IoT Device Networks: Protocols, MQTT & Sensors",
    "platform": "Udacity",
    "branch": "Electronics & Communication",
    "cost": "Paid",
    "rating": 4.9,
    "url": "https://www.udacity.com/courses/all",
    "image": "https://images.unsplash.com/photo-1558346490-a72e53ae2d4f?w=500&auto=format&fit=crop&q=60"
  },
  {
    "id": 64,
    "title": "Principles of CMOS Analog IC Design Essentials",
    "platform": "Coursera",
    "branch": "Electronics & Communication",
    "cost": "Free",
    "rating": 4.5,
    "url": "https://www.coursera.org/search?query=Principles%20of%20CMOS%20Analog%20IC%20Design%20Essentials",
    "image": "https://images.unsplash.com/photo-1563770660941-20978e870e26?w=500&auto=format&fit=crop&q=60"
  },
  {
    "id": 65,
    "title": "Advanced Digital Communication & Information Theory",
    "platform": "Udemy",
    "branch": "Electronics & Communication",
    "cost": "Paid",
    "rating": 4.6,
    "url": "https://www.udemy.com/courses/search/?q=Advanced%20Digital%20Communication%20%26%20Information%20Theory",
    "image": "https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=500&auto=format&fit=crop&q=60"
  },
  {
    "id": 66,
    "title": "Principles of RTOS Concepts & Real-Time Embedded Programming",
    "platform": "edX",
    "branch": "Electronics & Communication",
    "cost": "Paid",
    "rating": 4.7,
    "url": "https://www.edx.org/search?q=Principles%20of%20RTOS%20Concepts%20%26%20Real-Time%20Embedded%20Programming",
    "image": "https://images.unsplash.com/photo-1553406830-ef2513450d76?w=500&auto=format&fit=crop&q=60"
  },
  {
    "id": 67,
    "title": "Advanced Antenna Theory, Design & RF Engineering",
    "platform": "YouTube",
    "branch": "Electronics & Communication",
    "cost": "Free",
    "rating": 4.8,
    "url": "https://www.youtube.com/results?search_query=Advanced%20Antenna%20Theory%2C%20Design%20%26%20RF%20Engineering",
    "image": "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=500&auto=format&fit=crop&q=60"
  },
  {
    "id": 68,
    "title": "Principles of FPGA Prototyping Workshop for Beginners",
    "platform": "Udacity",
    "branch": "Electronics & Communication",
    "cost": "Paid",
    "rating": 4.9,
    "url": "https://www.udacity.com/courses/all",
    "image": "https://images.unsplash.com/photo-1555680202-c86f0e12f086?w=500&auto=format&fit=crop&q=60"
  },
  {
    "id": 69,
    "title": "Electric Power Grid Systems & Distribution",
    "platform": "Coursera",
    "branch": "Electrical & Power",
    "cost": "Free",
    "rating": 4.5,
    "url": "https://www.coursera.org/search?query=Electric%20Power%20Grid%20Systems%20%26%20Distribution",
    "image": "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=500&auto=format&fit=crop&q=60"
  },
  {
    "id": 70,
    "title": "Solar Photovoltaic Energy: Design & Installation",
    "platform": "Udemy",
    "branch": "Electrical & Power",
    "cost": "Paid",
    "rating": 4.6,
    "url": "https://www.udemy.com/courses/search/?q=Solar%20Photovoltaic%20Energy%3A%20Design%20%26%20Installation",
    "image": "https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?w=500&auto=format&fit=crop&q=60"
  },
  {
    "id": 71,
    "title": "Control Systems Engineering with MATLAB & Simulink",
    "platform": "edX",
    "branch": "Electrical & Power",
    "cost": "Free",
    "rating": 4.7,
    "url": "https://www.edx.org/search?q=Control%20Systems%20Engineering%20with%20MATLAB%20%26%20Simulink",
    "image": "https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?w=500&auto=format&fit=crop&q=60"
  },
  {
    "id": 72,
    "title": "Smart Grid Integration & Energy Storage Systems",
    "platform": "YouTube",
    "branch": "Electrical & Power",
    "cost": "Free",
    "rating": 4.8,
    "url": "https://www.youtube.com/results?search_query=Smart%20Grid%20Integration%20%26%20Energy%20Storage%20Systems",
    "image": "https://images.unsplash.com/photo-1466611653911-95081537e5b7?w=500&auto=format&fit=crop&q=60"
  },
  {
    "id": 73,
    "title": "Electric Vehicle Battery Management Systems (BMS)",
    "platform": "Udacity",
    "branch": "Electrical & Power",
    "cost": "Paid",
    "rating": 4.9,
    "url": "https://www.udacity.com/courses/all",
    "image": "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=500&auto=format&fit=crop&q=60"
  },
  {
    "id": 74,
    "title": "Electrical Machines: Motors, Generators & Drives",
    "platform": "Coursera",
    "branch": "Electrical & Power",
    "cost": "Paid",
    "rating": 4.5,
    "url": "https://www.coursera.org/search?query=Electrical%20Machines%3A%20Motors%2C%20Generators%20%26%20Drives",
    "image": "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=500&auto=format&fit=crop&q=60"
  },
  {
    "id": 75,
    "title": "Power System Analysis, Protection & Relays",
    "platform": "Udemy",
    "branch": "Electrical & Power",
    "cost": "Paid",
    "rating": 4.6,
    "url": "https://www.udemy.com/courses/search/?q=Power%20System%20Analysis%2C%20Protection%20%26%20Relays",
    "image": "https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=500&auto=format&fit=crop&q=60"
  },
  {
    "id": 76,
    "title": "Industrial Automation: PLCs, SCADA & HMIs",
    "platform": "edX",
    "branch": "Electrical & Power",
    "cost": "Paid",
    "rating": 4.7,
    "url": "https://www.edx.org/search?q=Industrial%20Automation%3A%20PLCs%2C%20SCADA%20%26%20HMIs",
    "image": "https://images.unsplash.com/photo-1581092335397-9583fe92d232?w=500&auto=format&fit=crop&q=60"
  },
  {
    "id": 77,
    "title": "High Voltage Engineering & Testing Methods",
    "platform": "YouTube",
    "branch": "Electrical & Power",
    "cost": "Free",
    "rating": 4.8,
    "url": "https://www.youtube.com/results?search_query=High%20Voltage%20Engineering%20%26%20Testing%20Methods",
    "image": "https://images.unsplash.com/photo-1507668077129-56e32842fceb?w=500&auto=format&fit=crop&q=60"
  },
  {
    "id": 78,
    "title": "Electric Powertrain Design for EVs",
    "platform": "Udacity",
    "branch": "Electrical & Power",
    "cost": "Paid",
    "rating": 4.9,
    "url": "https://www.udacity.com/courses/all",
    "image": "https://images.unsplash.com/photo-1513828583688-c52646db42da?w=500&auto=format&fit=crop&q=60"
  },
  {
    "id": 79,
    "title": "Advanced Electric Power Grid Systems & Distribution",
    "platform": "Coursera",
    "branch": "Electrical & Power",
    "cost": "Paid",
    "rating": 4.5,
    "url": "https://www.coursera.org/search?query=Advanced%20Electric%20Power%20Grid%20Systems%20%26%20Distribution",
    "image": "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=500&auto=format&fit=crop&q=60"
  },
  {
    "id": 80,
    "title": "Principles of Solar Photovoltaic Energy: Design & Installation",
    "platform": "Udemy",
    "branch": "Electrical & Power",
    "cost": "Paid",
    "rating": 4.6,
    "url": "https://www.udemy.com/courses/search/?q=Principles%20of%20Solar%20Photovoltaic%20Energy%3A%20Design%20%26%20Installation",
    "image": "https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?w=500&auto=format&fit=crop&q=60"
  },
  {
    "id": 81,
    "title": "Advanced Control Systems Engineering with MATLAB & Simulink",
    "platform": "edX",
    "branch": "Electrical & Power",
    "cost": "Free",
    "rating": 4.7,
    "url": "https://www.edx.org/search?q=Advanced%20Control%20Systems%20Engineering%20with%20MATLAB%20%26%20Simulink",
    "image": "https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?w=500&auto=format&fit=crop&q=60"
  },
  {
    "id": 82,
    "title": "Principles of Smart Grid Integration & Energy Storage Systems",
    "platform": "YouTube",
    "branch": "Electrical & Power",
    "cost": "Free",
    "rating": 4.8,
    "url": "https://www.youtube.com/results?search_query=Principles%20of%20Smart%20Grid%20Integration%20%26%20Energy%20Storage%20Systems",
    "image": "https://images.unsplash.com/photo-1466611653911-95081537e5b7?w=500&auto=format&fit=crop&q=60"
  },
  {
    "id": 83,
    "title": "Advanced Electric Vehicle Battery Management Systems (BMS)",
    "platform": "Udacity",
    "branch": "Electrical & Power",
    "cost": "Paid",
    "rating": 4.9,
    "url": "https://www.udacity.com/courses/all",
    "image": "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=500&auto=format&fit=crop&q=60"
  },
  {
    "id": 84,
    "title": "Principles of Electrical Machines: Motors, Generators & Drives",
    "platform": "Coursera",
    "branch": "Electrical & Power",
    "cost": "Free",
    "rating": 4.5,
    "url": "https://www.coursera.org/search?query=Principles%20of%20Electrical%20Machines%3A%20Motors%2C%20Generators%20%26%20Drives",
    "image": "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=500&auto=format&fit=crop&q=60"
  },
  {
    "id": 85,
    "title": "Advanced Power System Analysis, Protection & Relays",
    "platform": "Udemy",
    "branch": "Electrical & Power",
    "cost": "Paid",
    "rating": 4.6,
    "url": "https://www.udemy.com/courses/search/?q=Advanced%20Power%20System%20Analysis%2C%20Protection%20%26%20Relays",
    "image": "https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=500&auto=format&fit=crop&q=60"
  },
  {
    "id": 86,
    "title": "Principles of Industrial Automation: PLCs, SCADA & HMIs",
    "platform": "edX",
    "branch": "Electrical & Power",
    "cost": "Paid",
    "rating": 4.7,
    "url": "https://www.edx.org/search?q=Principles%20of%20Industrial%20Automation%3A%20PLCs%2C%20SCADA%20%26%20HMIs",
    "image": "https://images.unsplash.com/photo-1581092335397-9583fe92d232?w=500&auto=format&fit=crop&q=60"
  },
  {
    "id": 87,
    "title": "Advanced High Voltage Engineering & Testing Methods",
    "platform": "YouTube",
    "branch": "Electrical & Power",
    "cost": "Free",
    "rating": 4.8,
    "url": "https://www.youtube.com/results?search_query=Advanced%20High%20Voltage%20Engineering%20%26%20Testing%20Methods",
    "image": "https://images.unsplash.com/photo-1507668077129-56e32842fceb?w=500&auto=format&fit=crop&q=60"
  },
  {
    "id": 88,
    "title": "Principles of Electric Powertrain Design for EVs",
    "platform": "Udacity",
    "branch": "Electrical & Power",
    "cost": "Paid",
    "rating": 4.9,
    "url": "https://www.udacity.com/courses/all",
    "image": "https://images.unsplash.com/photo-1513828583688-c52646db42da?w=500&auto=format&fit=crop&q=60"
  },
  {
    "id": 89,
    "title": "SolidWorks Mechanical Modeling & Drawing Essentials",
    "platform": "Coursera",
    "branch": "Mechanical & Manufacturing",
    "cost": "Free",
    "rating": 4.5,
    "url": "https://www.coursera.org/search?query=SolidWorks%20Mechanical%20Modeling%20%26%20Drawing%20Essentials",
    "image": "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=500&auto=format&fit=crop&q=60"
  },
  {
    "id": 90,
    "title": "Introduction to Aerodynamics & Fluid Mechanics",
    "platform": "Udemy",
    "branch": "Mechanical & Manufacturing",
    "cost": "Paid",
    "rating": 4.6,
    "url": "https://www.udemy.com/courses/search/?q=Introduction%20to%20Aerodynamics%20%26%20Fluid%20Mechanics",
    "image": "https://images.unsplash.com/photo-1517976487492-5750f3195933?w=500&auto=format&fit=crop&q=60"
  },
  {
    "id": 91,
    "title": "ANSYS Workbench: FEA Structural & Thermal Analysis",
    "platform": "edX",
    "branch": "Mechanical & Manufacturing",
    "cost": "Free",
    "rating": 4.7,
    "url": "https://www.edx.org/search?q=ANSYS%20Workbench%3A%20FEA%20Structural%20%26%20Thermal%20Analysis",
    "image": "https://images.unsplash.com/photo-1509023467864-1ecbb3e03427?w=500&auto=format&fit=crop&q=60"
  },
  {
    "id": 92,
    "title": "CNC Machining, G-Code & CAM Programming",
    "platform": "YouTube",
    "branch": "Mechanical & Manufacturing",
    "cost": "Free",
    "rating": 4.8,
    "url": "https://www.youtube.com/results?search_query=CNC%20Machining%2C%20G-Code%20%26%20CAM%20Programming",
    "image": "https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?w=500&auto=format&fit=crop&q=60"
  },
  {
    "id": 93,
    "title": "Robotics Kinematics, Dynamics & ROS Integration",
    "platform": "Udacity",
    "branch": "Mechanical & Manufacturing",
    "cost": "Paid",
    "rating": 4.9,
    "url": "https://www.udacity.com/courses/all",
    "image": "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=500&auto=format&fit=crop&q=60"
  },
  {
    "id": 94,
    "title": "Thermodynamics & Heat Transfer Fundamentals",
    "platform": "Coursera",
    "branch": "Mechanical & Manufacturing",
    "cost": "Paid",
    "rating": 4.5,
    "url": "https://www.coursera.org/search?query=Thermodynamics%20%26%20Heat%20Transfer%20Fundamentals",
    "image": "https://images.unsplash.com/photo-1616401784845-180882ba9ba8?w=500&auto=format&fit=crop&q=60"
  },
  {
    "id": 95,
    "title": "CFD Simulation with OpenFOAM & SimScale",
    "platform": "Udemy",
    "branch": "Mechanical & Manufacturing",
    "cost": "Paid",
    "rating": 4.6,
    "url": "https://www.udemy.com/courses/search/?q=CFD%20Simulation%20with%20OpenFOAM%20%26%20SimScale",
    "image": "https://images.unsplash.com/photo-1537462715879-360eeb61a0bc?w=500&auto=format&fit=crop&q=60"
  },
  {
    "id": 96,
    "title": "Modern Manufacturing: 3D Printing & Additive Tech",
    "platform": "edX",
    "branch": "Mechanical & Manufacturing",
    "cost": "Paid",
    "rating": 4.7,
    "url": "https://www.edx.org/search?q=Modern%20Manufacturing%3A%203D%20Printing%20%26%20Additive%20Tech",
    "image": "https://images.unsplash.com/photo-1615840287214-7fe58a8b668f?w=500&auto=format&fit=crop&q=60"
  },
  {
    "id": 97,
    "title": "Orbital Mechanics & Spacecraft Design",
    "platform": "YouTube",
    "branch": "Mechanical & Manufacturing",
    "cost": "Free",
    "rating": 4.8,
    "url": "https://www.youtube.com/results?search_query=Orbital%20Mechanics%20%26%20Spacecraft%20Design",
    "image": "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=500&auto=format&fit=crop&q=60"
  },
  {
    "id": 98,
    "title": "Automotive Design Engineering: Suspension & Chassis",
    "platform": "Udacity",
    "branch": "Mechanical & Manufacturing",
    "cost": "Paid",
    "rating": 4.9,
    "url": "https://www.udacity.com/courses/all",
    "image": "https://images.unsplash.com/photo-1511919884226-fd3cad34687c?w=500&auto=format&fit=crop&q=60"
  },
  {
    "id": 99,
    "title": "Advanced SolidWorks Mechanical Modeling & Drawing Essentials",
    "platform": "Coursera",
    "branch": "Mechanical & Manufacturing",
    "cost": "Paid",
    "rating": 4.5,
    "url": "https://www.coursera.org/search?query=Advanced%20SolidWorks%20Mechanical%20Modeling%20%26%20Drawing%20Essentials",
    "image": "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=500&auto=format&fit=crop&q=60"
  },
  {
    "id": 100,
    "title": "Principles of Introduction to Aerodynamics & Fluid Mechanics",
    "platform": "Udemy",
    "branch": "Mechanical & Manufacturing",
    "cost": "Paid",
    "rating": 4.6,
    "url": "https://www.udemy.com/courses/search/?q=Principles%20of%20Introduction%20to%20Aerodynamics%20%26%20Fluid%20Mechanics",
    "image": "https://images.unsplash.com/photo-1517976487492-5750f3195933?w=500&auto=format&fit=crop&q=60"
  },
  {
    "id": 101,
    "title": "Advanced ANSYS Workbench: FEA Structural & Thermal Analysis",
    "platform": "edX",
    "branch": "Mechanical & Manufacturing",
    "cost": "Free",
    "rating": 4.7,
    "url": "https://www.edx.org/search?q=Advanced%20ANSYS%20Workbench%3A%20FEA%20Structural%20%26%20Thermal%20Analysis",
    "image": "https://images.unsplash.com/photo-1509023467864-1ecbb3e03427?w=500&auto=format&fit=crop&q=60"
  },
  {
    "id": 102,
    "title": "Principles of CNC Machining, G-Code & CAM Programming",
    "platform": "YouTube",
    "branch": "Mechanical & Manufacturing",
    "cost": "Free",
    "rating": 4.8,
    "url": "https://www.youtube.com/results?search_query=Principles%20of%20CNC%20Machining%2C%20G-Code%20%26%20CAM%20Programming",
    "image": "https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?w=500&auto=format&fit=crop&q=60"
  },
  {
    "id": 103,
    "title": "Advanced Robotics Kinematics, Dynamics & ROS Integration",
    "platform": "Udacity",
    "branch": "Mechanical & Manufacturing",
    "cost": "Paid",
    "rating": 4.9,
    "url": "https://www.udacity.com/courses/all",
    "image": "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=500&auto=format&fit=crop&q=60"
  },
  {
    "id": 104,
    "title": "Principles of Thermodynamics & Heat Transfer Fundamentals",
    "platform": "Coursera",
    "branch": "Mechanical & Manufacturing",
    "cost": "Free",
    "rating": 4.5,
    "url": "https://www.coursera.org/search?query=Principles%20of%20Thermodynamics%20%26%20Heat%20Transfer%20Fundamentals",
    "image": "https://images.unsplash.com/photo-1616401784845-180882ba9ba8?w=500&auto=format&fit=crop&q=60"
  },
  {
    "id": 105,
    "title": "Advanced CFD Simulation with OpenFOAM & SimScale",
    "platform": "Udemy",
    "branch": "Mechanical & Manufacturing",
    "cost": "Paid",
    "rating": 4.6,
    "url": "https://www.udemy.com/courses/search/?q=Advanced%20CFD%20Simulation%20with%20OpenFOAM%20%26%20SimScale",
    "image": "https://images.unsplash.com/photo-1537462715879-360eeb61a0bc?w=500&auto=format&fit=crop&q=60"
  },
  {
    "id": 106,
    "title": "Principles of Modern Manufacturing: 3D Printing & Additive Tech",
    "platform": "edX",
    "branch": "Mechanical & Manufacturing",
    "cost": "Paid",
    "rating": 4.7,
    "url": "https://www.edx.org/search?q=Principles%20of%20Modern%20Manufacturing%3A%203D%20Printing%20%26%20Additive%20Tech",
    "image": "https://images.unsplash.com/photo-1615840287214-7fe58a8b668f?w=500&auto=format&fit=crop&q=60"
  },
  {
    "id": 107,
    "title": "Advanced Orbital Mechanics & Spacecraft Design",
    "platform": "YouTube",
    "branch": "Mechanical & Manufacturing",
    "cost": "Free",
    "rating": 4.8,
    "url": "https://www.youtube.com/results?search_query=Advanced%20Orbital%20Mechanics%20%26%20Spacecraft%20Design",
    "image": "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=500&auto=format&fit=crop&q=60"
  },
  {
    "id": 108,
    "title": "Principles of Automotive Design Engineering: Suspension & Chassis",
    "platform": "Udacity",
    "branch": "Mechanical & Manufacturing",
    "cost": "Paid",
    "rating": 4.9,
    "url": "https://www.udacity.com/courses/all",
    "image": "https://images.unsplash.com/photo-1511919884226-fd3cad34687c?w=500&auto=format&fit=crop&q=60"
  },
  {
    "id": 109,
    "title": "Structural Engineering: Steel & Concrete Design",
    "platform": "Coursera",
    "branch": "Civil & Infrastructure",
    "cost": "Free",
    "rating": 4.5,
    "url": "https://www.coursera.org/search?query=Structural%20Engineering%3A%20Steel%20%26%20Concrete%20Design",
    "image": "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=500&auto=format&fit=crop&q=60"
  },
  {
    "id": 110,
    "title": "Construction Estimation, Cost Control & Tendering",
    "platform": "Udemy",
    "branch": "Civil & Infrastructure",
    "cost": "Paid",
    "rating": 4.6,
    "url": "https://www.udemy.com/courses/search/?q=Construction%20Estimation%2C%20Cost%20Control%20%26%20Tendering",
    "image": "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=500&auto=format&fit=crop&q=60"
  },
  {
    "id": 111,
    "title": "Geotechnical Engineering: Soil Mechanics & Foundations",
    "platform": "edX",
    "branch": "Civil & Infrastructure",
    "cost": "Free",
    "rating": 4.7,
    "url": "https://www.edx.org/search?q=Geotechnical%20Engineering%3A%20Soil%20Mechanics%20%26%20Foundations",
    "image": "https://images.unsplash.com/photo-1590069261209-f8e9b8642343?w=500&auto=format&fit=crop&q=60"
  },
  {
    "id": 112,
    "title": "Highway Engineering & Traffic Flow Theory",
    "platform": "YouTube",
    "branch": "Civil & Infrastructure",
    "cost": "Free",
    "rating": 4.8,
    "url": "https://www.youtube.com/results?search_query=Highway%20Engineering%20%26%20Traffic%20Flow%20Theory",
    "image": "https://images.unsplash.com/photo-1518005020951-eccb494ad742?w=500&auto=format&fit=crop&q=60"
  },
  {
    "id": 113,
    "title": "GIS & Spatial Analysis with ArcGIS Pro",
    "platform": "Udacity",
    "branch": "Civil & Infrastructure",
    "cost": "Paid",
    "rating": 4.9,
    "url": "https://www.udacity.com/courses/all",
    "image": "https://images.unsplash.com/photo-1524661135-423995f22d0b?w=500&auto=format&fit=crop&q=60"
  },
  {
    "id": 114,
    "title": "AutoCAD Civil 3D for Site Design & Grading",
    "platform": "Coursera",
    "branch": "Civil & Infrastructure",
    "cost": "Paid",
    "rating": 4.5,
    "url": "https://www.coursera.org/search?query=AutoCAD%20Civil%203D%20for%20Site%20Design%20%26%20Grading",
    "image": "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=500&auto=format&fit=crop&q=60"
  },
  {
    "id": 115,
    "title": "Wastewater Treatment Systems & Hydraulics",
    "platform": "Udemy",
    "branch": "Civil & Infrastructure",
    "cost": "Paid",
    "rating": 4.6,
    "url": "https://www.udemy.com/courses/search/?q=Wastewater%20Treatment%20Systems%20%26%20Hydraulics",
    "image": "https://images.unsplash.com/photo-1490796813314-bc48325a74e5?w=500&auto=format&fit=crop&q=60"
  },
  {
    "id": 116,
    "title": "Sustainable Building Design & LEED Certification",
    "platform": "edX",
    "branch": "Civil & Infrastructure",
    "cost": "Paid",
    "rating": 4.7,
    "url": "https://www.edx.org/search?q=Sustainable%20Building%20Design%20%26%20LEED%20Certification",
    "image": "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=500&auto=format&fit=crop&q=60"
  },
  {
    "id": 117,
    "title": "Bridge Design Engineering: Suspensions & Truss",
    "platform": "YouTube",
    "branch": "Civil & Infrastructure",
    "cost": "Free",
    "rating": 4.8,
    "url": "https://www.youtube.com/results?search_query=Bridge%20Design%20Engineering%3A%20Suspensions%20%26%20Truss",
    "image": "https://images.unsplash.com/photo-1490796813314-bc48325a74e5?w=500&auto=format&fit=crop&q=60"
  },
  {
    "id": 118,
    "title": "Project Planning using Primavera P6",
    "platform": "Udacity",
    "branch": "Civil & Infrastructure",
    "cost": "Paid",
    "rating": 4.9,
    "url": "https://www.udacity.com/courses/all",
    "image": "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=500&auto=format&fit=crop&q=60"
  },
  {
    "id": 119,
    "title": "Advanced Structural Engineering: Steel & Concrete Design",
    "platform": "Coursera",
    "branch": "Civil & Infrastructure",
    "cost": "Paid",
    "rating": 4.5,
    "url": "https://www.coursera.org/search?query=Advanced%20Structural%20Engineering%3A%20Steel%20%26%20Concrete%20Design",
    "image": "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=500&auto=format&fit=crop&q=60"
  },
  {
    "id": 120,
    "title": "Principles of Construction Estimation, Cost Control & Tendering",
    "platform": "Udemy",
    "branch": "Civil & Infrastructure",
    "cost": "Paid",
    "rating": 4.6,
    "url": "https://www.udemy.com/courses/search/?q=Principles%20of%20Construction%20Estimation%2C%20Cost%20Control%20%26%20Tendering",
    "image": "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=500&auto=format&fit=crop&q=60"
  },
  {
    "id": 121,
    "title": "Advanced Geotechnical Engineering: Soil Mechanics & Foundations",
    "platform": "edX",
    "branch": "Civil & Infrastructure",
    "cost": "Free",
    "rating": 4.7,
    "url": "https://www.edx.org/search?q=Advanced%20Geotechnical%20Engineering%3A%20Soil%20Mechanics%20%26%20Foundations",
    "image": "https://images.unsplash.com/photo-1590069261209-f8e9b8642343?w=500&auto=format&fit=crop&q=60"
  },
  {
    "id": 122,
    "title": "Principles of Highway Engineering & Traffic Flow Theory",
    "platform": "YouTube",
    "branch": "Civil & Infrastructure",
    "cost": "Free",
    "rating": 4.8,
    "url": "https://www.youtube.com/results?search_query=Principles%20of%20Highway%20Engineering%20%26%20Traffic%20Flow%20Theory",
    "image": "https://images.unsplash.com/photo-1518005020951-eccb494ad742?w=500&auto=format&fit=crop&q=60"
  },
  {
    "id": 123,
    "title": "Advanced GIS & Spatial Analysis with ArcGIS Pro",
    "platform": "Udacity",
    "branch": "Civil & Infrastructure",
    "cost": "Paid",
    "rating": 4.9,
    "url": "https://www.udacity.com/courses/all",
    "image": "https://images.unsplash.com/photo-1524661135-423995f22d0b?w=500&auto=format&fit=crop&q=60"
  },
  {
    "id": 124,
    "title": "Principles of AutoCAD Civil 3D for Site Design & Grading",
    "platform": "Coursera",
    "branch": "Civil & Infrastructure",
    "cost": "Free",
    "rating": 4.5,
    "url": "https://www.coursera.org/search?query=Principles%20of%20AutoCAD%20Civil%203D%20for%20Site%20Design%20%26%20Grading",
    "image": "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=500&auto=format&fit=crop&q=60"
  },
  {
    "id": 125,
    "title": "Advanced Wastewater Treatment Systems & Hydraulics",
    "platform": "Udemy",
    "branch": "Civil & Infrastructure",
    "cost": "Paid",
    "rating": 4.6,
    "url": "https://www.udemy.com/courses/search/?q=Advanced%20Wastewater%20Treatment%20Systems%20%26%20Hydraulics",
    "image": "https://images.unsplash.com/photo-1490796813314-bc48325a74e5?w=500&auto=format&fit=crop&q=60"
  },
  {
    "id": 126,
    "title": "Principles of Sustainable Building Design & LEED Certification",
    "platform": "edX",
    "branch": "Civil & Infrastructure",
    "cost": "Paid",
    "rating": 4.7,
    "url": "https://www.edx.org/search?q=Principles%20of%20Sustainable%20Building%20Design%20%26%20LEED%20Certification",
    "image": "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=500&auto=format&fit=crop&q=60"
  },
  {
    "id": 127,
    "title": "Advanced Bridge Design Engineering: Suspensions & Truss",
    "platform": "YouTube",
    "branch": "Civil & Infrastructure",
    "cost": "Free",
    "rating": 4.8,
    "url": "https://www.youtube.com/results?search_query=Advanced%20Bridge%20Design%20Engineering%3A%20Suspensions%20%26%20Truss",
    "image": "https://images.unsplash.com/photo-1490796813314-bc48325a74e5?w=500&auto=format&fit=crop&q=60"
  },
  {
    "id": 128,
    "title": "Principles of Project Planning using Primavera P6",
    "platform": "Udacity",
    "branch": "Civil & Infrastructure",
    "cost": "Paid",
    "rating": 4.9,
    "url": "https://www.udacity.com/courses/all",
    "image": "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=500&auto=format&fit=crop&q=60"
  }
];
