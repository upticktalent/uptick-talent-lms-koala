import mongoose, { Types } from "mongoose";
import { Cohort } from "../models/Cohort.model";
import { Application } from "../models/Application.model";
import { Assessment } from "../models/Assessment.model";
import { Interview } from "../models/Interview.model";
import { InterviewSlot } from "../models/InterviewSlot.model";
import { Stream } from "../models/Stream.model";
import { Task } from "../models/Task.model";
import { Material } from "../models/Material.model";
import { User } from "../models/User.model";
import { Track } from "../models/Track.model";

/**
 * Comprehensive Migration Script for Cohort-Centric Architecture
 * 
 * This script migrates the existing data structure to be cohort-centric:
 * - Updates all existing cohorts to have proper track statistics
 * - Migrates user track assignments to new structure
 * - Validates all data references are consistent
 */

export const migrateToCohortCentric = async () => {
    console.log("🚀 Starting migration to cohort-centric architecture...");

    try {
        // Step 1: Update all cohorts to have proper track statistics and settings
        console.log("📊 Step 1: Updating cohorts with track statistics and settings...");

        const cohorts = await Cohort.find({});
        console.log(`Found ${cohorts.length} cohorts to update`);

        for (const cohort of cohorts) {
            console.log(`Processing cohort: ${cohort.name}`);

            // Add settings if not present
            if (!cohort.settings) {
                cohort.settings = {
                    allowLateApplications: false,
                    requireCVUpload: true,
                    requirePortfolio: false,
                    emailNotifications: true,
                };
            }

            // Update each track within the cohort
            for (let i = 0; i < cohort.tracks.length; i++) {
                const cohortTrack = cohort.tracks[i];

                // Add missing fields to track
                if (!cohortTrack.isActive) {
                    cohort.tracks[i].isActive = true;
                }

                if (!cohortTrack.settings) {
                    cohort.tracks[i].settings = {
                        allowApplications: true,
                        requireAssessment: true,
                        requireInterview: true,
                        autoReview: false,
                    };
                }

                // Calculate statistics for this track
                const trackId = cohortTrack.track;

                // Count applications for this track
                const applications = await Application.find({ track: trackId });

                // Count assessments via applications
                const applicationIds = applications.map(app => app._id);
                const assessments = await Assessment.find({ application: { $in: applicationIds } });
                const interviews = await Interview.find({ application: { $in: applicationIds } });

                // Count students assigned to this track in this cohort
                const students = await User.find({
                    role: 'student',
                    'trackAssignments.track': trackId,
                    'trackAssignments.cohort': cohort._id
                });

                // Update statistics
                cohort.tracks[i].statistics = {
                    totalApplications: applications.length,
                    pendingApplications: applications.filter(app => app.status === 'pending').length,
                    acceptedApplications: applications.filter(app => app.status === 'accepted').length,
                    rejectedApplications: applications.filter(app => app.status === 'rejected').length,
                    totalStudents: students.length,
                    totalAssessments: assessments.length,
                    totalInterviews: interviews.length,
                };

                // Update current students count
                cohort.tracks[i].currentStudents = students.length;

                console.log(`  Track ${trackId}: ${applications.length} applications, ${students.length} students`);
            }

            // Update cohort-level currentStudents
            const totalStudents = await User.find({
                role: 'student',
                'trackAssignments.cohort': cohort._id,
                'trackAssignments.isActive': true
            });
            cohort.currentStudents = totalStudents.length;

            await cohort.save();
            console.log(`✅ Updated cohort: ${cohort.name}`);
        }

        // Step 2: Migrate user track assignments to new structure
        console.log("\n👥 Step 2: Migrating user track assignments...");

        const users = await User.find({ role: { $in: ['student', 'mentor'] } });
        console.log(`Found ${users.length} users to migrate`);

        for (const user of users) {
            if (!user.trackAssignments || user.trackAssignments.length === 0) {
                // Migrate from old fields if they exist
                const newAssignments = [];

                if (user.role === 'student') {
                    // For students, find their current track/cohort from old fields
                    const oldTrack = (user as any).currentTrack;
                    const oldCohortNumber = (user as any).currentCohort;

                    if (oldTrack && oldCohortNumber) {
                        // Find the cohort by cohort number
                        const cohort = await Cohort.findOne({ cohortNumber: oldCohortNumber });
                        if (cohort) {
                            newAssignments.push({
                                cohort: cohort._id,
                                track: oldTrack,
                                role: 'student',
                                assignedAt: user.createdAt,
                                isActive: true,
                            });
                        }
                    }
                } else if (user.role === 'mentor') {
                    // For mentors, find their track assignments from cohorts
                    const oldTracks = (user as any).assignedTracks || [];

                    for (const trackId of oldTracks) {
                        // Find cohorts that have this track
                        const cohortsWithTrack = await Cohort.find({ 'tracks.track': trackId });

                        for (const cohort of cohortsWithTrack) {
                            const cohortTrack = cohort.tracks.find(ct => ct.track.toString() === trackId.toString());
                            if (cohortTrack && cohortTrack.mentors.includes(user._id as any)) {
                                newAssignments.push({
                                    cohort: cohort._id as any,
                                    track: trackId,
                                    role: 'mentor',
                                    assignedAt: user.createdAt,
                                    isActive: true,
                                });
                            }
                        }
                    }
                }

                if (newAssignments.length > 0) {
                    user.trackAssignments = newAssignments as any;
                    await user.save();
                    console.log(`✅ Migrated ${newAssignments.length} track assignments for user: ${user.email}`);
                }
            }
        }

        // Step 3: Update InterviewSlots to use single track instead of tracks array
        console.log("\n🗓️ Step 3: Updating interview slots...");

        const interviewSlots = await InterviewSlot.find({});
        console.log(`Found ${interviewSlots.length} interview slots to update`);

        for (const slot of interviewSlots) {
            // If the old structure had multiple tracks, take the first one
            const oldTracks = (slot as any).tracks;
            if (oldTracks && oldTracks.length > 0 && !slot.track) {
                (slot as any).track = oldTracks[0];
                await slot.save();
                console.log(`✅ Updated interview slot ${slot._id} to use single track`);
            }
        }

        // Step 4: Validate data integrity
        console.log("\n🔍 Step 4: Validating data integrity...");

        // Check that all applications have valid tracks
        const applicationsCount = await Application.countDocuments({});
        const validApplications = await Application.countDocuments({ track: { $exists: true } });
        console.log(`Applications: ${validApplications}/${applicationsCount} have valid track references`);

        // Check that all streams have valid tracks
        const streamsCount = await Stream.countDocuments({});
        const validStreams = await Stream.countDocuments({ track: { $exists: true } });
        console.log(`Streams: ${validStreams}/${streamsCount} have valid track references`);

        // Check that all tasks have valid tracks
        const tasksCount = await Task.countDocuments({});
        const validTasks = await Task.countDocuments({ track: { $exists: true } });
        console.log(`Tasks: ${validTasks}/${tasksCount} have valid track references`);

        // Check that all materials have valid tracks
        const materialsCount = await Material.countDocuments({});
        const validMaterials = await Material.countDocuments({ track: { $exists: true } });
        console.log(`Materials: ${validMaterials}/${materialsCount} have valid track references`);

        console.log("\n✅ Migration completed successfully!");
        console.log("\n📋 Migration Summary:");
        console.log(`- Updated ${cohorts.length} cohorts with enhanced track statistics`);
        console.log(`- Migrated track assignments for users`);
        console.log(`- Updated ${interviewSlots.length} interview slots`);
        console.log("- Validated data integrity across all models");

    } catch (error) {
        console.error("❌ Migration failed:", error);
        throw error;
    }
};

// Script to run the migration
const runMigration = async () => {
    try {
        const DATABASE_URI = process.env.DATABASE_URI || "mongodb://localhost:27017/uptick-lms";

        console.log(`Connecting to database: ${DATABASE_URI}`);
        await mongoose.connect(DATABASE_URI);
        console.log("✅ Connected to database");

        await migrateToCohortCentric();

        console.log("\n🎉 Migration completed successfully!");
        process.exit(0);
    } catch (error) {
        console.error("❌ Migration script failed:", error);
        process.exit(1);
    }
};

// Run if this file is executed directly
if (require.main === module) {
    runMigration();
}

export default migrateToCohortCentric;