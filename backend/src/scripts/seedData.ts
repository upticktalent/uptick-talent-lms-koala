import { connectDatabase } from "../models/db";
import { Track } from "../models/Track.model";
import { Cohort } from "../models/Cohort.model";
import { User } from "../models/User.model";
import { Application } from "../models/Application.model";
import { Assessment } from "../models/Assessment.model";
import { Interview } from "../models/Interview.model";
import { InterviewSlot } from "../models/InterviewSlot.model";
import { Stream } from "../models/Stream.model";
import { Task } from "../models/Task.model";
import { Material } from "../models/Material.model";
import { hashPassword } from "../utils/auth";
import { seedEmailTemplates } from "./seedEmailTemplates";

const seedDatabase = async () => {
  console.log("🌱 Starting database seeding process...");

  try {
    console.log("📡 Attempting to connect to database...");
    await connectDatabase();
    console.log("✅ Successfully connected to database");

    // Clear existing data
    console.log("🧹 Clearing existing data...");
    await Material.deleteMany({});
    await Task.deleteMany({});
    await Stream.deleteMany({});
    await Interview.deleteMany({});
    await InterviewSlot.deleteMany({});
    await Assessment.deleteMany({});
    await Application.deleteMany({});
    await Track.deleteMany({});
    await Cohort.deleteMany({});
    await User.deleteMany({});
    console.log("✅ Cleared existing data");

    // Create tracks
    const tracks = [
      {
        name: "Frontend Development",
        trackId: "frontend-development",
        description:
          "Learn modern frontend technologies including React, Vue, Angular, and TypeScript. Build responsive, interactive web applications with cutting-edge tools and best practices.",
      },
      {
        name: "Backend Development",
        trackId: "backend-development",
        description:
          "Master server-side development with Node.js, Python, Java, and databases. Learn API design, microservices, and scalable backend architectures.",
      },
      {
        name: "Full Stack Development",
        trackId: "fullstack-development",
        description:
          "Comprehensive training in both frontend and backend technologies. Become a versatile developer capable of building complete web applications.",
      },
      {
        name: "Mobile Development",
        trackId: "mobile-development",
        description:
          "Build native and cross-platform mobile apps for iOS and Android using React Native, Flutter, and native development tools.",
      },
      {
        name: "Product Management",
        trackId: "product-management",
        description:
          "Learn product strategy, roadmapping, stakeholder management, and data-driven decision making for successful product launches.",
      },
      {
        name: "Product Design",
        trackId: "product-design",
        description:
          "UX/UI design principles, prototyping, design thinking, and user research. Create beautiful and functional digital experiences.",
      },
      {
        name: "Data Science",
        trackId: "data-science",
        description:
          "Analytics, machine learning, data visualization, and statistical analysis. Transform data into actionable business insights.",
      },
      {
        name: "DevOps Engineering",
        trackId: "devops-engineering",
        description:
          "Infrastructure as code, CI/CD pipelines, cloud platforms, containerization, and automation for modern software delivery.",
      },
      {
        name: "Blockchain Development",
        trackId: "blockchain-development",
        description:
          "Smart contracts, DeFi, Web3 technologies, and decentralized application development on various blockchain platforms.",
      },
    ];

    console.log("🏗️  Creating tracks...");
    const createdTracks = await Track.insertMany(tracks);
    console.log(`✅ Created ${createdTracks.length} tracks`);

    // Create multiple cohorts (empty tracks - will be populated after mentor creation)
    const cohorts = [
      {
        name: "Cohort 2026-Q1",
        cohortNumber: "1",
        description:
          "First quarter 2026 cohort - Full immersive program focusing on modern web development",
        startDate: new Date("2026-01-15"),
        endDate: new Date("2026-06-30"),
        applicationDeadline: new Date("2025-12-31"), // Future deadline
        maxStudents: 50,
        status: "active",
        tracks: [], // Will be populated with ICohortTrack structure after mentor creation
        isAcceptingApplications: true,
        isCurrentlyActive: true,
      },
      {
        name: "Cohort 2026-Q2",
        cohortNumber: "2",
        description:
          "Second quarter 2026 cohort - Advanced technologies and specializations",
        startDate: new Date("2026-04-01"),
        endDate: new Date("2026-09-30"),
        applicationDeadline: new Date("2026-03-15"), // Future deadline
        maxStudents: 40,
        status: "upcoming",
        tracks: [], // Will be populated with ICohortTrack structure after mentor creation
        isAcceptingApplications: false,
        isCurrentlyActive: false,
      },
      {
        name: "Cohort 2024-Q4 (Completed)",
        cohortNumber: "0",
        description: "Previous cohort for reference - Already completed",
        startDate: new Date("2024-09-01"),
        endDate: new Date("2025-02-28"),
        applicationDeadline: new Date("2024-08-15"), // Past deadline
        maxStudents: 45,
        status: "completed",
        tracks: [], // Will be populated with ICohortTrack structure after mentor creation
        isAcceptingApplications: false,
        isCurrentlyActive: false,
      },
    ];

    console.log("🏗️  Creating cohorts...");
    const createdCohorts = await Cohort.insertMany(cohorts);
    console.log(`✅ Created ${createdCohorts.length} cohorts`);

    // Create admin users
    const adminPassword = await hashPassword("admin123");
    const admins = [
      {
        firstName: "System",
        lastName: "Administrator",
        email: "admin@upticktalent.com",
        phoneNumber: "+234-800-123-4567",
        gender: "male",
        country: "Nigeria",
        state: "Lagos",
        password: adminPassword,
        role: "admin",
        isPasswordDefault: false,
      },
      {
        firstName: "Victoria",
        lastName: "Adeoye",
        email: "victoria.adeoye@upticktalent.com",
        phoneNumber: "+234-801-555-0001",
        gender: "female",
        country: "Nigeria",
        state: "Lagos",
        password: adminPassword,
        role: "admin",
        isPasswordDefault: false,
      },
      {
        firstName: "Chinedu",
        lastName: "Okwu",
        email: "chinedu.okwu@upticktalent.com",
        phoneNumber: "+234-802-555-0002",
        gender: "male",
        country: "Nigeria",
        state: "Abuja",
        password: adminPassword,
        role: "admin",
        isPasswordDefault: false,
      },
    ];

    const createdAdmins = await User.insertMany(admins);
    console.log(`✅ Created ${createdAdmins.length} admin users`);

    // Create mentor users
    const mentors = [
      {
        firstName: "John",
        lastName: "Okafor",
        email: "john.okafor@upticktalent.com",
        phoneNumber: "+234-803-555-0001",
        gender: "male",
        country: "Nigeria",
        state: "Lagos",
        assignedTracks: [createdTracks[0]._id, createdTracks[2]._id], // Frontend and Fullstack
      },
      {
        firstName: "Sarah",
        lastName: "Adebayo",
        email: "sarah.adebayo@upticktalent.com",
        phoneNumber: "+234-803-555-0002",
        gender: "female",
        country: "Nigeria",
        state: "Abuja",
        assignedTracks: [createdTracks[1]._id, createdTracks[7]._id], // Backend and DevOps
      },
      {
        firstName: "Michael",
        lastName: "Emeka",
        email: "michael.emeka@upticktalent.com",
        phoneNumber: "+234-803-555-0003",
        gender: "male",
        country: "Nigeria",
        state: "Port Harcourt",
        assignedTracks: [createdTracks[3]._id, createdTracks[8]._id], // Mobile and Blockchain
      },
      {
        firstName: "Grace",
        lastName: "Okoro",
        email: "grace.okoro@upticktalent.com",
        phoneNumber: "+234-803-555-0004",
        gender: "female",
        country: "Nigeria",
        state: "Kano",
        assignedTracks: [createdTracks[4]._id, createdTracks[5]._id], // Product Management and Design
      },
      {
        firstName: "David",
        lastName: "Eze",
        email: "david.eze@upticktalent.com",
        phoneNumber: "+234-803-555-0005",
        gender: "male",
        country: "Nigeria",
        state: "Enugu",
        assignedTracks: [createdTracks[6]._id], // Data Science
      },
    ];

    const mentorPassword = await hashPassword("mentor123");
    const createdMentors = [];

    for (const mentorData of mentors) {
      const mentor = new User({
        ...mentorData,
        password: mentorPassword,
        role: "mentor",
        isPasswordDefault: false,
        createdBy: createdAdmins[0]._id,
      });
      await mentor.save();
      createdMentors.push(mentor);
    }

    console.log(
      `✅ Created ${createdMentors.length} mentor users with assigned tracks`,
    );

    // Update cohorts with proper ICohortTrack structure
    console.log("🏗️  Updating cohorts with track-mentor assignments...");

    // Cohort 2026-Q1 (Active) - ALL TRACKS AVAILABLE
    const cohort1Tracks = [
      {
        track: createdTracks[0]._id, // Frontend Development
        mentors: [createdMentors[0]._id], // John Okafor
        maxStudents: 15,
        currentStudents: 0,
      },
      {
        track: createdTracks[1]._id, // Backend Development
        mentors: [createdMentors[1]._id], // Sarah Adebayo
        maxStudents: 12,
        currentStudents: 0,
      },
      {
        track: createdTracks[2]._id, // Full Stack Development
        mentors: [createdMentors[0]._id, createdMentors[1]._id], // John & Sarah
        maxStudents: 10,
        currentStudents: 0,
      },
      {
        track: createdTracks[3]._id, // Mobile Development
        mentors: [createdMentors[2]._id], // Michael Emeka
        maxStudents: 8,
        currentStudents: 0,
      },
      {
        track: createdTracks[4]._id, // Product Management
        mentors: [createdMentors[3]._id], // Grace Okoro
        maxStudents: 5,
        currentStudents: 0,
      },
      {
        track: createdTracks[5]._id, // Product Design
        mentors: [createdMentors[3]._id], // Grace Okoro
        maxStudents: 8,
        currentStudents: 0,
      },
      {
        track: createdTracks[6]._id, // Data Science
        mentors: [createdMentors[4]._id], // David Chukwuma
        maxStudents: 10,
        currentStudents: 0,
      },
      {
        track: createdTracks[7]._id, // DevOps Engineering
        mentors: [createdMentors[1]._id, createdMentors[4]._id], // Sarah & David
        maxStudents: 6,
        currentStudents: 0,
      },
      {
        track: createdTracks[8]._id, // Blockchain Development
        mentors: [createdMentors[2]._id, createdMentors[4]._id], // Michael & David
        maxStudents: 4,
        currentStudents: 0,
      },
    ];

    // Cohort 2026-Q2 (Upcoming) - Different track combination
    const cohort2Tracks = [
      {
        track: createdTracks[3]._id, // Mobile Development
        mentors: [createdMentors[2]._id], // Michael Emeka
        maxStudents: 10,
        currentStudents: 0,
      },
      {
        track: createdTracks[5]._id, // Product Design
        mentors: [createdMentors[3]._id], // Grace Okoro
        maxStudents: 8,
        currentStudents: 0,
      },
      {
        track: createdTracks[6]._id, // Data Science
        mentors: [createdMentors[4]._id], // David Chukwuma
        maxStudents: 12,
        currentStudents: 0,
      },
      {
        track: createdTracks[7]._id, // DevOps
        mentors: [createdMentors[1]._id], // Sarah Adebayo
        maxStudents: 6,
        currentStudents: 0,
      },
      {
        track: createdTracks[8]._id, // Blockchain Development
        mentors: [createdMentors[2]._id, createdMentors[4]._id], // Michael & David
        maxStudents: 4,
        currentStudents: 0,
      },
    ];

    // Cohort 2024-Q4 (Completed) - Legacy tracks with students
    const cohort0Tracks = [
      {
        track: createdTracks[0]._id, // Frontend Development
        mentors: [createdMentors[0]._id], // John Okafor
        maxStudents: 15,
        currentStudents: 12, // Already has students (completed)
      },
      {
        track: createdTracks[1]._id, // Backend Development
        mentors: [createdMentors[1]._id], // Sarah Adebayo
        maxStudents: 12,
        currentStudents: 10,
      },
      {
        track: createdTracks[2]._id, // Full Stack Development
        mentors: [createdMentors[0]._id, createdMentors[1]._id], // John & Sarah
        maxStudents: 10,
        currentStudents: 8,
      },
      {
        track: createdTracks[4]._id, // Product Management
        mentors: [createdMentors[3]._id], // Grace Okoro
        maxStudents: 5,
        currentStudents: 4,
      },
      {
        track: createdTracks[5]._id, // Product Design
        mentors: [createdMentors[3]._id], // Grace Okoro
        maxStudents: 8,
        currentStudents: 6,
      },
      {
        track: createdTracks[6]._id, // Data Science
        mentors: [createdMentors[4]._id], // David Chukwuma
        maxStudents: 10,
        currentStudents: 5,
      },
    ];

    // Update each cohort with the proper track structure
    await Cohort.findOneAndUpdate(
      { cohortNumber: "1" },
      { tracks: cohort1Tracks },
      { new: true },
    );

    await Cohort.findOneAndUpdate(
      { cohortNumber: "2" },
      { tracks: cohort2Tracks },
      { new: true },
    );

    await Cohort.findOneAndUpdate(
      { cohortNumber: "0" },
      { tracks: cohort0Tracks },
      { new: true },
    );

    console.log("✅ Updated cohorts with ICohortTrack structure");

    // Create LMS data (Streams, Tasks, Materials)
    console.log("📚 Creating LMS content...");

    // Get some cohorts and tracks for LMS content
    const activeCohort = createdCohorts.find((c) => c.cohortNumber === "1");
    const frontendTrack = createdTracks.find(
      (t) => t.trackId === "frontend-development",
    );
    const backendTrack = createdTracks.find(
      (t) => t.trackId === "backend-development",
    );
    const fullstackTrack = createdTracks.find(
      (t) => t.trackId === "fullstack-development",
    );

    if (!activeCohort || !frontendTrack || !backendTrack || !fullstackTrack) {
      console.log("❌ Missing required cohorts or tracks for LMS seeding");
      throw new Error("Required cohorts or tracks not found");
    }

    // Create Streams (announcements, lessons, updates)
    const streams = [
      {
        track: frontendTrack._id,
        title: "Welcome to Frontend Development Track!",
        content:
          "Welcome everyone! This is your first announcement. We'll be using this platform for all course communications. Please introduce yourselves in the comments below!",
        type: "announcement",
        createdBy: createdMentors[0]._id,
        reactions: [
          {
            user: createdAdmins[0]._id,
            type: "like",
            createdAt: new Date(),
          },
        ],
        comments: [
          {
            user: createdAdmins[0]._id,
            content: "Looking forward to working with everyone this cohort!",
            createdAt: new Date(),
          },
        ],
      },
      {
        track: frontendTrack._id,
        title: "JavaScript Fundamentals - Week 1 Lesson",
        content:
          "Today we'll be covering JavaScript fundamentals including variables, functions, and control flow. Please review the materials before our live session.",
        type: "lesson",
        createdBy: createdMentors[0]._id,
        attachments: [
          {
            title: "JavaScript Basics Slides",
            url: "https://example.com/js-basics.pdf",
            type: "file",
            size: 2048000,
            uploadedAt: new Date(),
          },
        ],
      },
      {
        track: backendTrack._id,
        title: "Node.js Setup Instructions",
        content:
          "Please follow these instructions to set up Node.js on your local machine. We'll need this for next week's practical sessions.",
        type: "update",
        createdBy: createdMentors[1]._id,
      },
      {
        track: fullstackTrack._id,
        title: "Project Showcase Next Week",
        content:
          "Don't forget that we have project presentations next Friday! Please prepare a 5-minute demo of your current progress.",
        type: "announcement",
        createdBy: createdMentors[2]._id,
        reactions: [
          {
            user: createdMentors[0]._id,
            type: "helpful",
            createdAt: new Date(),
          },
        ],
      },
    ];

    const createdStreams = await Stream.insertMany(streams);
    console.log(`✅ Created ${createdStreams.length} streams`);

    // Create Tasks (assignments, projects, etc.)
    const tasks = [
      {
        cohort: activeCohort._id,
        track: frontendTrack._id,
        title: "Build a Personal Portfolio Website",
        description:
          "Create a responsive personal portfolio website using HTML, CSS, and vanilla JavaScript. The site should include sections for About, Projects, Skills, and Contact.",
        type: "project",
        difficulty: "beginner",
        estimatedHours: 20,
        maxScore: 100,
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 2 weeks from now
        requirements: [
          "Responsive design that works on mobile and desktop",
          "At least 3 sections (About, Projects, Contact)",
          "Clean, semantic HTML structure",
          "CSS animations or transitions",
          "JavaScript interactivity (e.g., smooth scrolling, modal)",
          "Cross-browser compatibility",
        ],
        resources: [
          {
            title: "HTML5 Semantic Elements Guide",
            url: "https://example.com/html5-guide",
            type: "link",
          },
          {
            title: "CSS Grid and Flexbox Tutorial",
            url: "https://example.com/css-layout",
            type: "video",
          },
        ],
        createdBy: createdMentors[0]._id,
        allowLateSubmissions: true,
      },
      {
        cohort: activeCohort._id,
        track: backendTrack._id,
        title: "RESTful API with Authentication",
        description:
          "Build a complete REST API for a blog application with user authentication, CRUD operations for posts, and proper error handling.",
        type: "assignment",
        difficulty: "intermediate",
        estimatedHours: 35,
        maxScore: 100,
        dueDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000), // 3 weeks from now
        requirements: [
          "User registration and login endpoints",
          "JWT token-based authentication",
          "CRUD operations for blog posts",
          "Input validation and sanitization",
          "Proper HTTP status codes",
          "API documentation",
          "Unit tests for key endpoints",
        ],
        createdBy: createdMentors[1]._id,
        allowLateSubmissions: false,
      },
      {
        cohort: activeCohort._id,
        track: frontendTrack._id,
        title: "JavaScript Quiz - Functions and Scope",
        description:
          "Test your understanding of JavaScript functions, closures, and scope concepts.",
        type: "quiz",
        difficulty: "beginner",
        estimatedHours: 1,
        maxScore: 50,
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week from now
        requirements: [
          "Complete all 20 questions",
          "No external resources allowed",
          "Time limit: 60 minutes",
        ],
        createdBy: createdMentors[0]._id,
        allowLateSubmissions: false,
      },
    ];

    const createdTasks = await Task.insertMany(tasks);
    console.log(`✅ Created ${createdTasks.length} tasks`);

    // Create Materials (resources, documents, etc.)
    const materials = [
      {
        cohort: activeCohort._id,
        track: frontendTrack._id,
        title: "HTML & CSS Complete Reference Guide",
        description:
          "Comprehensive guide covering HTML5 semantic elements, CSS Grid, Flexbox, and responsive design principles.",
        type: "document",
        url: "https://example.com/html-css-guide.pdf",
        category: "reference",
        difficulty: "beginner",
        estimatedReadTime: 180, // 3 hours
        isRequired: true,
        order: 1,
        tags: ["html", "css", "responsive-design", "reference"],
        createdBy: createdMentors[0]._id,
      },
      {
        cohort: activeCohort._id,
        track: frontendTrack._id,
        title: "JavaScript ES6+ Features Tutorial",
        description:
          "Learn modern JavaScript features including arrow functions, destructuring, promises, async/await, and modules.",
        type: "video",
        url: "https://example.com/js-es6-tutorial",
        category: "lesson",
        difficulty: "intermediate",
        estimatedReadTime: 240, // 4 hours
        isRequired: true,
        order: 2,
        tags: ["javascript", "es6", "modern-js", "tutorial"],
        createdBy: createdMentors[0]._id,
      },
      {
        cohort: activeCohort._id,
        track: backendTrack._id,
        title: "Node.js Best Practices Guide",
        description:
          "Industry best practices for Node.js development including project structure, error handling, security, and performance optimization.",
        type: "article",
        url: "https://example.com/nodejs-best-practices",
        category: "resource",
        difficulty: "intermediate",
        estimatedReadTime: 120, // 2 hours
        isRequired: true,
        order: 1,
        tags: ["nodejs", "best-practices", "security", "performance"],
        createdBy: createdMentors[1]._id,
      },
      {
        cohort: activeCohort._id,
        track: backendTrack._id,
        title: "Database Design Fundamentals",
        description:
          "Learn the principles of relational database design, normalization, and SQL optimization techniques.",
        type: "slides",
        url: "https://example.com/database-design-slides.pptx",
        category: "lesson",
        difficulty: "beginner",
        estimatedReadTime: 90, // 1.5 hours
        isRequired: false,
        order: 2,
        tags: ["database", "sql", "design", "normalization"],
        createdBy: createdMentors[1]._id,
      },
      {
        cohort: activeCohort._id,
        track: fullstackTrack._id,
        title: "Git Version Control Workflow",
        description:
          "Complete guide to Git workflows, branching strategies, and collaborative development practices.",
        type: "link",
        url: "https://example.com/git-workflow-guide",
        category: "supplementary",
        difficulty: "beginner",
        estimatedReadTime: 60, // 1 hour
        isRequired: true,
        order: 1,
        tags: ["git", "version-control", "workflow", "collaboration"],
        createdBy: createdMentors[2]._id,
      },
      {
        cohort: activeCohort._id,
        track: fullstackTrack._id,
        title: "React Development Environment Setup",
        description:
          "Step-by-step guide to setting up a complete React development environment with tools and extensions.",
        type: "document",
        url: "https://example.com/react-setup-guide.pdf",
        category: "resource",
        difficulty: "beginner",
        estimatedReadTime: 45,
        isRequired: false,
        order: 3,
        tags: ["react", "setup", "development-environment", "tools"],
        createdBy: createdMentors[0]._id,
      },
    ];

    const createdMaterials = await Material.insertMany(materials);
    console.log(`✅ Created ${createdMaterials.length} materials`);

    console.log("✅ LMS content creation completed!");

    // Create sample applicant users and applications
    const applicants = [
      {
        firstName: "Chioma",
        lastName: "Nkosi",
        email: "chioma.nkosi@example.com",
        phoneNumber: "+234-807-111-1111",
        gender: "female",
        country: "Nigeria",
        state: "Lagos",
        educationalBackground:
          "BSc Computer Science, University of Lagos (2020)",
        tools: ["JavaScript", "React", "HTML", "CSS", "TypeScript"],
        trackId: "frontend-development",
        cohortNumber: "1",
        yearsOfExperience: "1-2",
        githubLink: "https://github.com/chioma-nkosi",
        portfolioLink: "https://chioma-portfolio.vercel.app",
        careerGoals:
          "I want to become a senior frontend developer at a tech company and contribute to building user-friendly applications that solve real-world problems.",
        weeklyCommitment: "yes",
        referralSource: "linkedin",
      },
      {
        firstName: "Emeka",
        lastName: "Obi",
        email: "emeka.obi@example.com",
        phoneNumber: "+234-807-222-2222",
        gender: "male",
        country: "Nigeria",
        state: "Abuja",
        educationalBackground:
          "BSc Information Technology, University of Abuja (2019)",
        tools: ["Python", "Django", "PostgreSQL", "Docker", "AWS"],
        trackId: "backend-development",
        cohortNumber: "1",
        yearsOfExperience: "2-3",
        githubLink: "https://github.com/emeka-obi",
        portfolioLink: "https://github.com/emeka-obi/api-portfolio",
        careerGoals:
          "My goal is to become a backend architect and specialize in building scalable microservices for enterprise applications.",
        weeklyCommitment: "yes",
        referralSource: "friend-referral",
      },
      {
        firstName: "Fatima",
        lastName: "Abdullahi",
        email: "fatima.abdullahi@example.com",
        phoneNumber: "+234-807-333-3333",
        gender: "female",
        country: "Nigeria",
        state: "Kano",
        educationalBackground: "BSc Mathematics, Bayero University (2021)",
        tools: ["Python", "R", "SQL", "Tableau", "Power BI"],
        trackId: "data-science",
        cohortNumber: "2",
        yearsOfExperience: "less-than-1",
        portfolioLink: "https://fatima-data-projects.herokuapp.com",
        careerGoals:
          "I aspire to become a data scientist specializing in machine learning and help organizations make data-driven decisions.",
        weeklyCommitment: "yes",
        referralSource: "google-search",
      },
      {
        firstName: "Joseph",
        lastName: "Adamu",
        email: "joseph.adamu@example.com",
        phoneNumber: "+234-807-444-4444",
        gender: "male",
        country: "Nigeria",
        state: "Kaduna",
        educationalBackground:
          "BSc Business Administration, Ahmadu Bello University (2018)",
        tools: ["Figma", "Adobe XD", "Sketch", "InVision", "Miro"],
        trackId: "product-design",
        cohortNumber: "2",
        yearsOfExperience: "2-3",
        portfolioLink: "https://joseph-design-portfolio.framer.website",
        careerGoals:
          "I want to become a senior UX designer and create intuitive digital experiences that delight users and drive business growth.",
        weeklyCommitment: "yes",
        referralSource: "instagram",
      },
      {
        firstName: "Blessing",
        lastName: "Okwu",
        email: "blessing.okwu@example.com",
        phoneNumber: "+234-807-555-5555",
        gender: "female",
        country: "Nigeria",
        state: "Enugu",
        educationalBackground:
          "BSc Computer Engineering, University of Nigeria Nsukka (2020)",
        tools: ["React Native", "Flutter", "Kotlin", "Swift", "Firebase"],
        trackId: "mobile-development",
        cohortNumber: "1",
        yearsOfExperience: "1-2",
        githubLink: "https://github.com/blessing-okwu",
        portfolioLink:
          "https://play.google.com/store/apps/developer?id=BlessingOkwu",
        careerGoals:
          "My goal is to become a mobile development expert and create innovative mobile applications that impact millions of users globally.",
        weeklyCommitment: "yes",
        referralSource: "twitter",
      },
      {
        firstName: "Ahmed",
        lastName: "Yusuf",
        email: "ahmed.yusuf@example.com",
        phoneNumber: "+234-807-666-6666",
        gender: "male",
        country: "Nigeria",
        state: "Sokoto",
        educationalBackground:
          "BSc Economics, Usmanu Danfodiyo University (2019)",
        tools: ["Jira", "Confluence", "Notion", "Slack", "Figma"],
        trackId: "product-management",
        cohortNumber: "2",
        yearsOfExperience: "1-2",
        portfolioLink: "https://ahmed-product-case-studies.notion.site",
        careerGoals:
          "I aim to become a senior product manager and lead cross-functional teams to build products that solve complex business problems.",
        weeklyCommitment: "yes",
        referralSource: "university",
      },
      {
        firstName: "Grace",
        lastName: "Okoro",
        email: "grace.okoro@example.com",
        phoneNumber: "+234-807-777-7777",
        gender: "female",
        country: "Nigeria",
        state: "Rivers",
        educationalBackground:
          "BSc Computer Science, University of Port Harcourt (2022)",
        tools: ["JavaScript", "Node.js", "React", "MongoDB", "Express"],
        trackId: "fullstack-development",
        cohortNumber: "1",
        yearsOfExperience: "less-than-1",
        githubLink: "https://github.com/grace-okoro",
        portfolioLink: "https://grace-fullstack-projects.netlify.app",
        careerGoals:
          "I want to become a full-stack engineer capable of building end-to-end web applications and eventually start my own tech company.",
        weeklyCommitment: "no",
        referralSource: "other",
        referralSourceOther: "Tech community meetup in Port Harcourt",
      },
    ];

    const applicantPassword = await hashPassword("applicant123");
    const createdApplicants = [];
    const createdApplications = [];

    for (const applicantData of applicants) {
      // Create applicant user
      const applicant = new User({
        firstName: applicantData.firstName,
        lastName: applicantData.lastName,
        email: applicantData.email,
        phoneNumber: applicantData.phoneNumber,
        gender: applicantData.gender,
        country: applicantData.country,
        state: applicantData.state,
        password: applicantPassword,
        role: "applicant",
        isPasswordDefault: false,
      });
      await applicant.save();
      createdApplicants.push(applicant);

      // Find track and cohort
      const track = createdTracks.find(
        (t) => t.trackId === applicantData.trackId,
      );
      const cohort = createdCohorts.find(
        (c) => c.cohortNumber === applicantData.cohortNumber,
      );

      // Create application
      const application = new Application({
        applicant: applicant._id,
        track: track?._id,
        cohort: cohort?._id, // Add the required cohort field
        cvUrl: `https://res.cloudinary.com/sample/raw/upload/v1699123456/cvs/${applicant.firstName.toLowerCase()}-${applicant.lastName.toLowerCase()}-cv.pdf`,

        // New enhanced application fields
        educationalBackground: applicantData.educationalBackground,
        tools: applicantData.tools,
        yearsOfExperience: applicantData.yearsOfExperience,
        githubLink: applicantData.githubLink,
        portfolioLink: applicantData.portfolioLink,
        careerGoals: applicantData.careerGoals,
        weeklyCommitment: applicantData.weeklyCommitment,
        referralSource: applicantData.referralSource,
        referralSourceOther: applicantData.referralSourceOther,

        // Legacy field for backward compatibility
        motivation: `I am passionate about ${track?.name.toLowerCase()} and eager to learn through this fellowship program.`,

        status: (() => {
          const rand = Math.random();
          if (rand < 0.4) return "shortlisted"; // 40% shortlisted
          if (rand < 0.7) return "under-review"; // 30% under-review
          return "pending"; // 30% pending
        })(),
        submittedAt: new Date(
          Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000,
        ), // Random date within last 30 days
      });
      await application.save();
      createdApplications.push(application);
    }

    console.log(
      `✅ Created ${createdApplicants.length} applicant users with applications`,
    );

    // Create sample assessments for shortlisted and under-review applicants
    const eligibleForAssessment = createdApplications.filter(
      (app) => app.status === "shortlisted" || app.status === "under-review",
    );

    console.log(
      `Found ${eligibleForAssessment.length} applications eligible for assessments`,
    );

    let assessmentCount = 0;
    let applicantCount = 0;
    for (const application of eligibleForAssessment) {
      // Create assessments for most eligible applications (70% chance)
      if (Math.random() > 0.3) {
        const isFileSubmission = Math.random() > 0.5;
        const assessmentData: any = {
          application: application._id,
        };

        if (isFileSubmission) {
          // File submission
          const firstName = applicants[applicantCount].firstName;
          assessmentData.fileUrl = `https://res.cloudinary.com/sample/raw/upload/v1699123456/assessments/${firstName.toLowerCase()}-assessment.pdf`;
          if (Math.random() > 0.7) {
            assessmentData.notes =
              "This assessment demonstrates my proficiency in the required technologies. I've included comprehensive documentation and test cases. Please review the README file for setup instructions.";
          }
        } else {
          // URL submission
          const firstName = applicants[applicantCount].firstName;
          const lastName = applicants[applicantCount].lastName;
          assessmentData.linkUrl = `https://github.com/${firstName.toLowerCase()}${lastName.toLowerCase()}/portfolio-project`;
          if (Math.random() > 0.6) {
            assessmentData.notes =
              "Live demo available at the GitHub Pages link. The project showcases responsive design and modern development practices. Feel free to test the authentication flow with the demo credentials provided in the README.";
          }
        }

        // Random status and review data
        const statuses = ["submitted", "reviewed"];
        const status = statuses[Math.floor(Math.random() * statuses.length)];
        assessmentData.status = status;
        assessmentData.submittedAt = new Date(
          Date.now() - Math.random() * 14 * 24 * 60 * 60 * 1000,
        ); // Random date within last 14 days

        if (status === "reviewed") {
          assessmentData.reviewedBy =
            createdMentors[
              Math.floor(Math.random() * createdMentors.length)
            ]._id;
          assessmentData.reviewedAt = new Date(
            assessmentData.submittedAt.getTime() +
              Math.random() * 7 * 24 * 60 * 60 * 1000,
          );
          assessmentData.score = Math.floor(Math.random() * 30) + 70; // Random score between 70-100
          assessmentData.reviewNotes =
            "Good implementation of core concepts. Clean code structure and well-documented. Areas for improvement: error handling and test coverage.";
        } else if (status === "under-review") {
          assessmentData.reviewedBy =
            createdMentors[
              Math.floor(Math.random() * createdMentors.length)
            ]._id;
          assessmentData.reviewedAt = new Date(
            assessmentData.submittedAt.getTime() +
              Math.random() * 3 * 24 * 60 * 60 * 1000,
          );
        }

        const assessment = new Assessment(assessmentData);
        await assessment.save();
        assessmentCount++;
        console.log(
          `Created assessment ${assessmentCount} for application ${application._id} (${status})`,
        );
      }
      applicantCount++;
    }

    console.log(`✅ Created ${assessmentCount} sample assessments`);

    // Create interview slots for mentors (limited to 20 total)
    console.log("📅 Creating interview slots...");
    const interviewSlots = [];
    const today = new Date();
    const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);

    const meetingLinks = [
      "https://zoom.us/j/123456789",
      "https://meet.google.com/abc-def-ghi",
      "https://teams.microsoft.com/l/meetup-join/xyz",
      "https://us02web.zoom.us/j/987654321",
    ];

    const timeSlots = [
      { start: "09:00", end: "10:00", max: 1 },
      { start: "11:00", end: "12:00", max: 1 },
      { start: "14:00", end: "15:00", max: 1 },
      { start: "16:00", end: "17:00", max: 1 },
    ];

    let slotsCreated = 0;
    const maxSlots = 20;

    // Create slots for each mentor until we reach 20 total
    for (const mentor of createdMentors) {
      if (slotsCreated >= maxSlots) break;

      // Create 4 slots per mentor (spread across next 2 weeks)
      for (let day = 1; day <= 8 && slotsCreated < maxSlots; day += 2) {
        const slotDate = new Date(nextWeek);
        slotDate.setDate(nextWeek.getDate() + day);

        // Skip weekends
        if (slotDate.getDay() === 0 || slotDate.getDay() === 6) continue;

        const timeSlot = timeSlots[slotsCreated % timeSlots.length];

        // Decide if this should be a general slot (30% chance) or track-specific (70% chance)
        const isGeneralSlot = Math.random() < 0.3;

        let slotData: any = {
          interviewer: mentor._id,
          date: slotDate,
          startTime: timeSlot.start,
          endTime: timeSlot.end,
          duration: 60,
          maxInterviews: timeSlot.max,
          isAvailable: true,
          bookedCount: 0,
        };

        if (isGeneralSlot) {
          // Create a general slot available for all tracks
          slotData.isGeneral = true;
          slotData.notes = "General interview slot - available for all tracks";
        } else {
          // Create a track-specific slot
          const availableTracks = createdTracks.map((track) => track._id);
          const shuffledTracks = [...availableTracks].sort(
            () => Math.random() - 0.5,
          );
          slotData.track = shuffledTracks[0]; // Pick one track for this slot
          slotData.isGeneral = false;
        }

        // Add common slot properties
        slotData.location =
          Math.random() > 0.7 ? "Office - Conference Room A" : "Online";
        slotData.meetingLink =
          meetingLinks[Math.floor(Math.random() * meetingLinks.length)];

        // Only override notes if it's not already set for general slots
        if (!slotData.notes && Math.random() > 0.8) {
          slotData.notes = "Please join 5 minutes early for technical setup";
        }

        interviewSlots.push(slotData);
        slotsCreated++;
      }
    }

    const createdSlots = await InterviewSlot.insertMany(interviewSlots);
    console.log(`✅ Created ${createdSlots.length} interview slots`);

    // Create sample interviews for applications
    console.log("🗣️ Creating sample interviews...");

    // Get applications that can have interviews (shortlisted and under-review)
    const eligibleApplications = createdApplications.filter(
      (app) => app.status === "under-review" || app.status === "shortlisted",
    );

    console.log(
      `Found ${eligibleApplications.length} eligible applications for interviews`,
    );
    console.log(`Available slots: ${createdSlots.length}`);

    const createdInterviews = [];
    let interviewCount = 0;

    for (const application of eligibleApplications) {
      // Create interviews for most eligible applications (80% chance)
      if (Math.random() > 0.2) {
        console.log(
          `Attempting to create interview for application ${application._id}`,
        );

        // Find available slots that support this application's track (either track-specific or general)
        const availableSlots = createdSlots.filter(
          (slot) =>
            slot.isAvailable &&
            slot.bookedCount < slot.maxInterviews &&
            slot.date > today &&
            (slot.isGeneral ||
              (slot.track &&
                slot.track.toString() === application.track.toString())),
        );

        console.log(
          `Found ${availableSlots.length} available slots for track ${application.track}`,
        );

        if (availableSlots.length > 0) {
          // Pick a random available slot
          const selectedSlot =
            availableSlots[Math.floor(Math.random() * availableSlots.length)];
          console.log(`Selected slot: ${selectedSlot._id}`);

          // Create scheduled date from slot
          const scheduledDate = new Date(selectedSlot.date);
          const [hours, minutes] = selectedSlot.startTime
            .split(":")
            .map(Number);
          scheduledDate.setHours(hours, minutes, 0, 0);

          // Determine interview status
          const statuses = ["scheduled", "interviewed", "cancelled"];
          const weights = [0.6, 0.3, 0.1]; // 60% scheduled, 30% interviewed, 10% cancelled
          let status = statuses[0];
          const rand = Math.random();
          if (rand < weights[2]) {
            status = statuses[2];
          } else if (rand < weights[1] + weights[2]) {
            status = statuses[1];
          }

          const interviewData: any = {
            application: application._id,
            interviewer: selectedSlot.interviewer,
            scheduledDate,
            duration: selectedSlot.duration,
            meetingLink: selectedSlot.meetingLink,
            location: selectedSlot.location,
            status,
            scheduledBy: application.applicant,
            createdBy: selectedSlot.interviewer,
          };

          // Add interview notes and feedback for interviewed/cancelled
          if (status === "interviewed") {
            interviewData.notes =
              "Good technical knowledge. Strong problem-solving skills. Communicates clearly.";
            interviewData.rating = Math.floor(Math.random() * 3) + 7; // Rating 7-10
            interviewData.feedback =
              "Candidate demonstrated solid understanding of core concepts. Recommended for acceptance.";

            // Update application status based on interview result
            if (interviewData.rating >= 8) {
              application.status = "accepted";
              // Promote applicant to student role when accepted
              await User.findByIdAndUpdate(
                application.applicant,
                { role: "student" },
                { new: true },
              );
            } else {
              application.status = "rejected";
            }
            await application.save();
          } else if (status === "cancelled") {
            interviewData.notes =
              "Cancelled due to scheduling conflict. Will reschedule.";
          }

          const interview = new Interview(interviewData);
          await interview.save();
          createdInterviews.push(interview);

          // Update slot booking count
          await InterviewSlot.findByIdAndUpdate(selectedSlot._id, {
            $inc: { bookedCount: 1 },
            isAvailable:
              selectedSlot.bookedCount + 1 < selectedSlot.maxInterviews,
          });

          interviewCount++;
          console.log(`Created interview ${interviewCount}: ${interview._id}`);
        } else {
          console.log(
            `No available slots found for application ${application._id} with track ${application.track}`,
          );
        }
      }
    }

    console.log(`✅ Created ${interviewCount} sample interviews`);

    // Create additional student users for completed cohort (simulate accepted applicants)
    console.log("🎓 Creating additional student users for completed cohort...");

    const studentUsers = [
      {
        firstName: "Adaora",
        lastName: "Okonkwo",
        email: "adaora.okonkwo@student.upticktalent.com",
        phoneNumber: "+234-803-111-1001",
        gender: "female",
        country: "Nigeria",
        state: "Anambra",
        role: "student",
        currentCohort: "1", // Completed cohort
        currentTrack: createdTracks[0]._id, // Frontend Development
      },
      {
        firstName: "Kunle",
        lastName: "Adebayo",
        email: "kunle.adebayo@student.upticktalent.com",
        phoneNumber: "+234-803-111-1002",
        gender: "male",
        country: "Nigeria",
        state: "Oyo",
        role: "student",
        currentCohort: "1", // Completed cohort
        currentTrack: createdTracks[1]._id, // Backend Development
      },
      {
        firstName: "Zainab",
        lastName: "Ibrahim",
        email: "zainab.ibrahim@student.upticktalent.com",
        phoneNumber: "+234-803-111-1003",
        gender: "female",
        country: "Nigeria",
        state: "Kano",
        role: "student",
        currentCohort: "1", // Completed cohort
        currentTrack: createdTracks[2]._id, // Full Stack Development
      },
      {
        firstName: "Chinedu",
        lastName: "Okoro",
        email: "chinedu.okoro@student.upticktalent.com",
        phoneNumber: "+234-803-111-1004",
        gender: "male",
        country: "Nigeria",
        state: "Rivers",
        role: "student",
        currentCohort: "1", // Completed cohort
        currentTrack: createdTracks[4]._id, // Product Management
      },
      {
        firstName: "Amina",
        lastName: "Yusuf",
        email: "amina.yusuf@student.upticktalent.com",
        phoneNumber: "+234-803-111-1005",
        gender: "female",
        country: "Nigeria",
        state: "Kaduna",
        role: "student",
        currentCohort: "1", // Completed cohort
        currentTrack: createdTracks[5]._id, // Product Design
      },
    ];

    const createdStudents = [];
    const studentPassword = await hashPassword("student123");

    for (const studentData of studentUsers) {
      const student = new User({
        ...studentData,
        password: studentPassword,
        isPasswordDefault: false,
        createdBy: createdAdmins[0]._id,
      });
      await student.save();
      createdStudents.push(student);
    }

    console.log(`✅ Created ${createdStudents.length} student users`);

    // Seed email templates
    console.log("🌱 Seeding email templates...");
    const adminId =
      createdAdmins[Math.floor(Math.random() * createdAdmins.length - 1)]._id;
    await seedEmailTemplates(adminId);

    console.log("\n🎉 Comprehensive database seeding completed successfully!");
    console.log("📊 Seeding Summary:");
    console.log(`   • ${createdTracks.length} tracks created`);
    console.log(
      `   • ${createdCohorts.length} cohorts created with ICohortTrack structure`,
    );
    console.log(`   • ${createdAdmins.length} admin users created`);
    console.log(`   • ${createdMentors.length} mentor users created`);
    console.log(`   • ${createdStudents.length} student users created`);
    console.log(`   • ${createdApplicants.length} applicant users created`);
    console.log(`   • ${createdApplications.length} applications created`);
    console.log(`   • ${assessmentCount} assessments created`);
    console.log(`   • ${createdSlots.length} interview slots created`);
    console.log(`   • ${interviewCount} interviews scheduled`);
    console.log(`   • ${createdStreams.length} LMS streams created`);
    console.log(`   • ${createdTasks.length} LMS tasks created`);
    console.log(`   • ${createdMaterials.length} LMS materials created`);
    console.log("📧 Default email templates have been created");

    console.log("\n📝 Default Credentials:");
    console.log(
      "┌─────────────────────────────────────────────────────────────┐",
    );
    console.log(
      "│ ADMINS (Password: admin123)                                 │",
    );
    console.log(
      "│ • admin@upticktalent.com (System Administrator)            │",
    );
    console.log(
      "│ • victoria.adeoye@upticktalent.com (Admin)                 │",
    );
    console.log(
      "│ • chinedu.okwu@upticktalent.com (Admin)                    │",
    );
    console.log(
      "├─────────────────────────────────────────────────────────────┤",
    );
    console.log(
      "│ MENTORS                                                     │",
    );
    console.log(
      "│ All mentors use password: mentor123                        │",
    );
    console.log(
      "│ • john.okafor@upticktalent.com (Frontend, Fullstack)       │",
    );
    console.log(
      "│ • sarah.adebayo@upticktalent.com (Backend, DevOps)         │",
    );
    console.log(
      "│ • michael.emeka@upticktalent.com (Mobile, Blockchain)      │",
    );
    console.log(
      "│ • grace.okoro@upticktalent.com (Product Mgmt, Design)      │",
    );
    console.log(
      "│ • david.eze@upticktalent.com (Data Science)                │",
    );
    console.log(
      "├─────────────────────────────────────────────────────────────┤",
    );
    console.log(
      "│ STUDENTS                                                    │",
    );
    console.log(
      "│ All students use password: student123                      │",
    );
    console.log(
      "│ • adaora.okonkwo@student.upticktalent.com (Frontend)       │",
    );
    console.log(
      "│ • kunle.adebayo@student.upticktalent.com (Backend)         │",
    );
    console.log(
      "│ • zainab.ibrahim@student.upticktalent.com (Fullstack)      │",
    );
    console.log(
      "│ • chinedu.okoro@student.upticktalent.com (Product Mgmt)    │",
    );
    console.log(
      "│ • amina.yusuf@student.upticktalent.com (Product Design)    │",
    );
    console.log(
      "├─────────────────────────────────────────────────────────────┤",
    );
    console.log(
      "│ APPLICANTS                                                  │",
    );
    console.log(
      "│ All applicants use password: applicant123                  │",
    );
    console.log(
      "│ • chioma.nkosi@example.com (Frontend)                      │",
    );
    console.log(
      "│ • emeka.obi@example.com (Backend)                          │",
    );
    console.log(
      "│ • fatima.abdullahi@example.com (Data Science)              │",
    );
    console.log(
      "│ • joseph.adamu@example.com (Product Design)                │",
    );
    console.log(
      "│ • blessing.okwu@example.com (Mobile)                       │",
    );
    console.log(
      "│ • ahmed.yusuf@example.com (Product Management)             │",
    );
    console.log(
      "└─────────────────────────────────────────────────────────────┘",
    );

    console.log("\n🚀 System Features Available:");
    console.log("• Complete application system with file uploads");
    console.log("• Assessment submission with file/URL + notes");
    console.log("• Interview scheduling system (Calendly-style)");
    console.log("• Interview slot management for mentors");
    console.log("• ICS calendar integration with email attachments");
    console.log("• Email template management with Brevo integration");
    console.log(
      "• Role-based access control (Admin, Mentor, Applicant, Student)",
    );
    console.log("• Application status management and tracking");
    console.log("• Assessment review and scoring system");
    console.log("• Multi-cohort and multi-track support");
    console.log("• Complete LMS with Google Classroom-style features:");
    console.log("  - Streams (announcements, lessons, updates)");
    console.log("  - Tasks (assignments, projects, quizzes)");
    console.log("  - Materials (documents, videos, resources)");
    console.log("  - Comments, reactions, and real-time interactions");
    console.log("  - Task submissions with grading and feedback");
    console.log("  - Resource categorization and progress tracking");

    console.log("\n📚 Test Data Includes:");
    console.log(
      "• Various application statuses (pending, shortlisted, rejected)",
    );
    console.log("• Different assessment types (file uploads and URLs)");
    console.log("• Sample assessment notes and reviews");
    console.log("• Multiple tracks and cohorts for testing");
    console.log("• Realistic Nigerian user data and phone numbers");
    console.log("• Sample LMS content (streams, tasks, materials)");
    console.log("• Task submissions with different statuses");
    console.log("• Stream reactions and comments for interaction testing");
    console.log("• Various material types (videos, documents, links)");
  } catch (error) {
    console.error("❌ Error seeding database:", error);
  } finally {
    process.exit(0);
  }
};

seedDatabase();
