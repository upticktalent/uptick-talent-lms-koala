import { connectDatabase } from "../models/db";
import { Track } from "../models/Track";
import { Cohort } from "../models/Cohort";
import { User } from "../models/User";
import { hashPassword } from "../utils/auth";

const seedData = async () => {
  try {
    console.log("🌱 Starting database seeding...");

    await connectDatabase();
    console.log("✅ Database connected");

    // Clear existing data
    console.log("🧹 Clearing existing data...");
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
          "Learn modern frontend technologies including React, Vue, Angular, and more",
      },
      {
        name: "Backend Development",
        trackId: "backend-development",
        description:
          "Master server-side development with Node.js, Python, Java, and databases",
      },
      {
        name: "Full Stack Development",
        trackId: "fullstack-development",
        description:
          "Comprehensive training in both frontend and backend technologies",
      },
      {
        name: "Mobile Development",
        trackId: "mobile-development",
        description:
          "Build native and cross-platform mobile apps for iOS and Android",
      },
      {
        name: "Product Management",
        trackId: "product-management",
        description:
          "Learn product strategy, roadmapping, and stakeholder management",
      },
      {
        name: "Product Design",
        trackId: "product-design",
        description:
          "UX/UI design principles, prototyping, and design thinking",
      },
      {
        name: "Data Science",
        trackId: "data-science",
        description: "Analytics, machine learning, and data visualization",
      },
      {
        name: "DevOps Engineering",
        trackId: "devops-engineering",
        description: "Infrastructure, CI/CD, cloud platforms, and automation",
      },
    ];

    console.log("🏗️  Creating tracks...");
    const createdTracks = await Track.insertMany(tracks);
    console.log(`✅ Created ${createdTracks.length} tracks`);

    // Create a sample cohort
    const cohort = new Cohort({
      name: "Cohort 2025-Q1",
      cohortNumber: "1",
      description: "First quarter 2025 cohort - Full immersive program",
      startDate: new Date("2025-03-01"),
      endDate: new Date("2025-08-31"),
      maxStudents: 50,
      tracks: createdTracks.map((track) => track._id),
      isAcceptingApplications: true,
    });

    await cohort.save();
    console.log("✅ Created sample cohort");

    // Create admin user
    const adminPassword = await hashPassword("admin123");
    const admin = new User({
      firstName: "Admin",
      lastName: "User",
      email: "admin@upticktalent.com",
      phoneNumber: "+1234567890",
      gender: "prefer-not-to-say",
      country: "Nigeria",
      state: "Lagos",
      password: adminPassword,
      role: "admin",
      isPasswordDefault: false,
    });

    await admin.save();
    console.log("✅ Created admin user");

    // Create mentor user
    const mentorPassword = await hashPassword("mentor123");
    const mentor = new User({
      firstName: "John",
      lastName: "Mentor",
      email: "mentor@upticktalent.com",
      phoneNumber: "+1234567891",
      gender: "male",
      country: "Nigeria",
      state: "Abuja",
      password: mentorPassword,
      role: "mentor",
      isPasswordDefault: false,
      assignedTracks: [createdTracks[0]._id, createdTracks[2]._id], // Frontend and Fullstack
      createdBy: admin._id,
    });

    await mentor.save();
    console.log("✅ Created mentor user with assigned tracks");

    // Create another mentor user
    const mentor2Password = await hashPassword("mentor123");
    const mentor2 = new User({
      firstName: "Jane",
      lastName: "Smith",
      email: "jane.mentor@upticktalent.com",
      phoneNumber: "+1234567892",
      gender: "female",
      country: "Nigeria",
      state: "Lagos",
      password: mentor2Password,
      role: "mentor",
      isPasswordDefault: false,
      assignedTracks: [createdTracks[1]._id, createdTracks[6]._id], // Backend and Data Science
      createdBy: admin._id,
    });

    await mentor2.save();
    console.log("✅ Created second mentor user with assigned tracks");

    console.log("\n🎉 Database seeding completed successfully!");
    console.log("\n📝 Default credentials:");
    console.log("Admin: admin@upticktalent.com / admin123");
    console.log("Mentor 1: mentor@upticktalent.com / mentor123");
    console.log("Mentor 2: jane.mentor@upticktalent.com / mentor123");
  } catch (error) {
    console.error("❌ Error seeding database:", error);
  } finally {
    process.exit(0);
  }
};

seedData();
