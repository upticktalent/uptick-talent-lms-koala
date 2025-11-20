import { connectDatabase } from "../models/db";
import { Track } from "../models/Track.model";
import { Cohort } from "../models/Cohort.model";
import { User } from "../models/User.model";
import { Application } from "../models/Application.model";
import { Assessment } from "../models/Assessment.model";
import { Interview } from "../models/Interview.model";
import { InterviewSlot } from "../models/InterviewSlot.model";
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

    // Create multiple cohorts
    const cohorts = [
      {
        name: "Cohort 2025-Q1",
        cohortNumber: "1",
        description:
          "First quarter 2025 cohort - Full immersive program focusing on modern web development",
        startDate: new Date("2025-03-01"),
        endDate: new Date("2025-08-31"),
        maxStudents: 50,
        status: "active",
        tracks: createdTracks.slice(0, 5).map((track) => track._id), // First 5 tracks
        isAcceptingApplications: true,
      },
      {
        name: "Cohort 2025-Q2",
        cohortNumber: "2",
        description:
          "Second quarter 2025 cohort - Advanced technologies and specializations",
        startDate: new Date("2025-06-01"),
        endDate: new Date("2025-11-30"),
        maxStudents: 40,
        tracks: createdTracks.slice(3, 8).map((track) => track._id), // Overlapping tracks
        isAcceptingApplications: false,
      },
      {
        name: "Cohort 2024-Q4 (Completed)",
        cohortNumber: "0",
        description: "Previous cohort for reference - Already completed",
        startDate: new Date("2024-09-01"),
        endDate: new Date("2025-02-28"),
        maxStudents: 45,
        tracks: createdTracks.slice(0, 6).map((track) => track._id),
        isAcceptingApplications: false,
      },
    ];

    console.log("🏗️  Creating cohorts...");
    const createdCohorts = await Cohort.insertMany(cohorts);
    console.log(`✅ Created ${createdCohorts.length} cohorts`);

    // Create admin user
    const adminPassword = await hashPassword("admin123");
    const admin = new User({
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
    });

    await admin.save();
    console.log("✅ Created admin user");

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
        createdBy: admin._id,
      });
      await mentor.save();
      createdMentors.push(mentor);
    }

    console.log(
      `✅ Created ${createdMentors.length} mentor users with assigned tracks`,
    );

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
        educationalQualification: "BSc Computer Science",
        tools: ["JavaScript", "React", "HTML", "CSS"],
        trackId: "frontend-development",
        cohortNumber: "1",
      },
      {
        firstName: "Emeka",
        lastName: "Obi",
        email: "emeka.obi@example.com",
        phoneNumber: "+234-807-222-2222",
        gender: "male",
        country: "Nigeria",
        state: "Abuja",
        educationalQualification: "BSc Information Technology",
        tools: ["Python", "Django", "PostgreSQL", "Docker"],
        trackId: "backend-development",
        cohortNumber: "1",
      },
      {
        firstName: "Fatima",
        lastName: "Abdullahi",
        email: "fatima.abdullahi@example.com",
        phoneNumber: "+234-807-333-3333",
        gender: "female",
        country: "Nigeria",
        state: "Kano",
        educationalQualification: "BSc Mathematics",
        tools: ["Python", "R", "SQL", "Tableau"],
        trackId: "data-science",
        cohortNumber: "2",
      },
      {
        firstName: "Joseph",
        lastName: "Adamu",
        email: "joseph.adamu@example.com",
        phoneNumber: "+234-807-444-4444",
        gender: "male",
        country: "Nigeria",
        state: "Kaduna",
        educationalQualification: "BSc Business Administration",
        tools: ["Figma", "Adobe XD", "Sketch", "InVision"],
        trackId: "product-design",
        cohortNumber: "2",
      },
      {
        firstName: "Blessing",
        lastName: "Okwu",
        email: "blessing.okwu@example.com",
        phoneNumber: "+234-807-555-5555",
        gender: "female",
        country: "Nigeria",
        state: "Enugu",
        educationalQualification: "BSc Computer Engineering",
        tools: ["React Native", "Flutter", "Kotlin", "Swift"],
        trackId: "mobile-development",
        cohortNumber: "1",
      },
      {
        firstName: "Ahmed",
        lastName: "Yusuf",
        email: "ahmed.yusuf@example.com",
        phoneNumber: "+234-807-666-6666",
        gender: "male",
        country: "Nigeria",
        state: "Sokoto",
        educationalQualification: "BSc Economics",
        tools: ["Jira", "Confluence", "Notion", "Slack"],
        trackId: "product-management",
        cohortNumber: "2",
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
        email: applicantData.email,
        phoneNumber: applicantData.phoneNumber,
        gender: applicantData.gender,
        country: applicantData.country,
        state: applicantData.state,
        educationalQualification: applicantData.educationalQualification,
        tools: applicantData.tools,
        track: track?._id,
        cohort: cohort?._id,
        cvUrl: `https://res.cloudinary.com/sample/raw/upload/v1699123456/cvs/${applicant.firstName.toLowerCase()}-${applicant.lastName.toLowerCase()}-cv.pdf`,
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

        // Randomly assign 1-2 tracks to each slot from mentor's assigned tracks or all tracks
        const availableTracks = createdTracks.map((track) => track._id);
        const numTracks = Math.floor(Math.random() * 2) + 1; // 1 to 2 tracks
        const slotTracks = [];
        const shuffledTracks = [...availableTracks].sort(
          () => Math.random() - 0.5,
        );

        for (let i = 0; i < numTracks && i < shuffledTracks.length; i++) {
          slotTracks.push(shuffledTracks[i]);
        }

        const slotData = {
          interviewer: mentor._id,
          tracks: slotTracks, // Required field - tracks this slot is available for
          date: slotDate,
          startTime: timeSlot.start,
          endTime: timeSlot.end,
          duration: 60,
          maxInterviews: timeSlot.max,
          isAvailable: true,
          bookedCount: 0,
          location:
            Math.random() > 0.7 ? "Office - Conference Room A" : "Online",
          meetingLink:
            meetingLinks[Math.floor(Math.random() * meetingLinks.length)],
          notes:
            Math.random() > 0.8
              ? "Please join 5 minutes early for technical setup"
              : undefined,
        };

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

        // Find available slots that support this application's track
        const availableSlots = createdSlots.filter(
          (slot) =>
            slot.isAvailable &&
            slot.bookedCount < slot.maxInterviews &&
            slot.date > today &&
            slot.tracks.some(
              (trackId) => trackId.toString() === application.track.toString(),
            ),
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

    // Seed email templates
    console.log("🌱 Seeding email templates...");
    await seedEmailTemplates();

    console.log("\n🎉 Comprehensive database seeding completed successfully!");
    console.log("📊 Seeding Summary:");
    console.log(`   • ${createdTracks.length} tracks created`);
    console.log(`   • ${createdCohorts.length} cohorts created`);
    console.log(`   • 1 admin user created`);
    console.log(`   • ${createdMentors.length} mentor users created`);
    console.log(`   • ${createdApplicants.length} applicant users created`);
    console.log(`   • ${createdApplications.length} applications created`);
    console.log(`   • ${assessmentCount} assessments created`);
    console.log(`   • ${createdSlots.length} interview slots created`);
    console.log(`   • ${interviewCount} interviews scheduled`);
    console.log("📧 Default email templates have been created");

    console.log("\n📝 Default Credentials:");
    console.log(
      "┌─────────────────────────────────────────────────────────────┐",
    );
    console.log(
      "│ ADMIN                                                       │",
    );
    console.log(
      "│ Email: admin@upticktalent.com                               │",
    );
    console.log(
      "│ Password: admin123                                          │",
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
    console.log("• Role-based access control (Admin, Mentor, Applicant)");
    console.log("• Application status management and tracking");
    console.log("• Assessment review and scoring system");
    console.log("• Multi-cohort and multi-track support");

    console.log("\n📚 Test Data Includes:");
    console.log(
      "• Various application statuses (pending, shortlisted, rejected)",
    );
    console.log("• Different assessment types (file uploads and URLs)");
    console.log("• Sample assessment notes and reviews");
    console.log("• Multiple tracks and cohorts for testing");
    console.log("• Realistic Nigerian user data and phone numbers");
  } catch (error) {
    console.error("❌ Error seeding database:", error);
  } finally {
    process.exit(0);
  }
};

seedDatabase();
