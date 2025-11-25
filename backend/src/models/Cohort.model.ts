import mongoose, { Schema, Document } from "mongoose";

export interface ICohortTrack {
  track: mongoose.Types.ObjectId;
  mentors: mongoose.Types.ObjectId[];
  maxStudents?: number;
  currentStudents: number;
  isActive: boolean;
  startDate?: Date;
  endDate?: Date;
  settings: {
    allowApplications: boolean;
    requireAssessment: boolean;
    requireInterview: boolean;
    autoReview: boolean;
  };
  statistics?: {
    totalApplications: number;
    pendingApplications: number;
    acceptedApplications: number;
    rejectedApplications: number;
    totalStudents: number;
    totalAssessments: number;
    totalInterviews: number;
  };
}

export interface ICohortSettings {
  applicationDeadline?: Date;
  maxStudentsTotal?: number;
  allowLateApplications: boolean;
  requireCVUpload: boolean;
  requirePortfolio: boolean;
  emailNotifications: boolean;
}

export interface ICohort extends Document {
  _id: string;
  name: string;
  cohortNumber: string;
  description: string;
  startDate: Date;
  endDate: Date;
  applicationDeadline: Date;
  maxStudents: number;
  currentStudents: number;
  tracks: ICohortTrack[];
  status: "upcoming" | "active" | "completed" | "cancelled";
  isAcceptingApplications: boolean;
  isCurrentlyActive: boolean;
  settings: ICohortSettings;

  // Virtual properties for aggregations
  totalApplications?: number;
  totalMentors?: number;
  trackStatistics?: any[];

  // Instance methods
  hasTrack(trackId: string): Boolean;
  getMentorsForTrack(trackId: string): mongoose.Types.ObjectId[];
  addMentorToTrack(trackId: string, mentorId: string): Promise<ICohort>;
  getTrackById(trackId: string): ICohortTrack | null;
  updateTrackStatistics(trackId: string): Promise<void>;
  getCompleteData(): Promise<any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICohortModel extends mongoose.Model<ICohort> {
  getCurrentActive(): Promise<ICohort | null>;
  setCurrentlyActive(cohortId: string): Promise<ICohort | null>;
}

const CohortSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Cohort name is required"],
      unique: true,
      trim: true,
      maxlength: [100, "Cohort name cannot exceed 100 characters"],
    },
    cohortNumber: {
      type: String,
      required: [true, "Cohort number is required"],
      unique: true,
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, "Description cannot exceed 1000 characters"],
    },
    startDate: {
      type: Date,
      required: [true, "Start date is required"],
    },
    endDate: {
      type: Date,
      required: [true, "End date is required"],
    },
    applicationDeadline: {
      type: Date,
      required: [true, "Application deadline is required"],
    },
    maxStudents: {
      type: Number,
      required: [true, "Maximum students is required"],
      min: [1, "Maximum students must be at least 1"],
      default: 500,
    },
    currentStudents: {
      type: Number,
      default: 0,
      min: [0, "Current students cannot be negative"],
    },
    tracks: [
      {
        track: {
          type: Schema.Types.ObjectId,
          ref: "Track",
          required: true,
        },
        mentors: [
          {
            type: Schema.Types.ObjectId,
            ref: "User",
          },
        ],
        maxStudents: {
          type: Number,
          min: [1, "Track max students must be at least 1"],
        },
        currentStudents: {
          type: Number,
          default: 0,
          min: [0, "Current students cannot be negative"],
        },
        isActive: {
          type: Boolean,
          default: true,
        },
        startDate: {
          type: Date,
        },
        endDate: {
          type: Date,
        },
        settings: {
          allowApplications: {
            type: Boolean,
            default: true,
          },
          requireAssessment: {
            type: Boolean,
            default: true,
          },
          requireInterview: {
            type: Boolean,
            default: true,
          },
          autoReview: {
            type: Boolean,
            default: false,
          },
        },
        statistics: {
          totalApplications: { type: Number, default: 0 },
          pendingApplications: { type: Number, default: 0 },
          acceptedApplications: { type: Number, default: 0 },
          rejectedApplications: { type: Number, default: 0 },
          totalStudents: { type: Number, default: 0 },
          totalAssessments: { type: Number, default: 0 },
          totalInterviews: { type: Number, default: 0 },
        },
      },
    ],
    settings: {
      applicationDeadline: {
        type: Date,
      },
      maxStudentsTotal: {
        type: Number,
      },
      allowLateApplications: {
        type: Boolean,
        default: false,
      },
      requireCVUpload: {
        type: Boolean,
        default: true,
      },
      requirePortfolio: {
        type: Boolean,
        default: false,
      },
      emailNotifications: {
        type: Boolean,
        default: true,
      },
    },
    status: {
      type: String,
      enum: {
        values: ["upcoming", "active", "completed", "cancelled"],
        message: "Status must be upcoming, active, completed, or cancelled",
      },
      default: "upcoming",
    },
    isAcceptingApplications: {
      type: Boolean,
      default: true,
    },
    isCurrentlyActive: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

// Validation to ensure dates are logical
CohortSchema.pre("save", function (next) {
  if (this.endDate <= this.startDate) {
    next(new Error("End date must be after start date"));
    return;
  }
  if (this.applicationDeadline >= this.startDate) {
    next(new Error("Application deadline must be before start date"));
    return;
  }
  next();
});

// Ensure only one currently active cohort exists
CohortSchema.pre("save", async function (next) {
  if (this.isCurrentlyActive) {
    // Check if there's already a currently active cohort (excluding current document)
    const existingActiveCohort = await mongoose.model("Cohort").findOne({
      isCurrentlyActive: true,
      _id: { $ne: this._id },
    });

    if (existingActiveCohort) {
      next(new Error("Only one cohort can be currently active at a time"));
      return;
    }
  }
  next();
});

// Instance method to check if cohort has a specific track
CohortSchema.methods.hasTrack = function (trackId: string): Boolean {
  return this.tracks.some(
    (cohortTrack: ICohortTrack) => cohortTrack.track.toString() === trackId,
  );
};

// Instance method to get mentors for a specific track
CohortSchema.methods.getMentorsForTrack = function (
  trackId: string,
): mongoose.Types.ObjectId[] {
  const cohortTrack = this.tracks.find(
    (ct: ICohortTrack) => ct.track.toString() === trackId,
  );
  return cohortTrack ? cohortTrack.mentors : [];
};

// Instance method to add mentor to a track
CohortSchema.methods.addMentorToTrack = async function (
  this: ICohort,
  trackId: string,
  mentorId: string,
): Promise<ICohort> {
  const trackIndex = this.tracks.findIndex(
    (ct: ICohortTrack) => ct.track.toString() === trackId,
  );

  if (trackIndex === -1) {
    throw new Error("Track not found in cohort");
  }

  if (
    !this.tracks[trackIndex].mentors.includes(
      new mongoose.Types.ObjectId(mentorId),
    )
  ) {
    this.tracks[trackIndex].mentors.push(new mongoose.Types.ObjectId(mentorId));
    await this.save();
  }

  return this;
};

// Instance method to get track by ID
CohortSchema.methods.getTrackById = function (trackId: string): ICohortTrack | null {
  return this.tracks.find(
    (ct: ICohortTrack) => ct.track.toString() === trackId
  ) || null;
};

// Instance method to update track statistics
CohortSchema.methods.updateTrackStatistics = async function (trackId: string): Promise<void> {
  const trackIndex = this.tracks.findIndex(
    (ct: ICohortTrack) => ct.track.toString() === trackId
  );

  if (trackIndex === -1) return;

  // Import models here to avoid circular dependencies
  const Application = mongoose.model('Application');
  const Assessment = mongoose.model('Assessment');
  const Interview = mongoose.model('Interview');
  const User = mongoose.model('User');

  // Get statistics for this track
  const applications = await Application.find({ track: trackId });
  const assessments = await Assessment.find({ application: { $in: applications.map(app => app._id) } });
  const interviews = await Interview.find({ application: { $in: applications.map(app => app._id) } });
  const students = await User.find({
    role: 'student',
    'trackAssignments.track': trackId,
    'trackAssignments.cohort': this._id
  });

  // Update statistics
  this.tracks[trackIndex].statistics = {
    totalApplications: applications.length,
    pendingApplications: applications.filter(app => app.status === 'pending').length,
    acceptedApplications: applications.filter(app => app.status === 'accepted').length,
    rejectedApplications: applications.filter(app => app.status === 'rejected').length,
    totalStudents: students.length,
    totalAssessments: assessments.length,
    totalInterviews: interviews.length,
  };

  // Update currentStudents
  this.tracks[trackIndex].currentStudents = students.length;

  await this.save();
};

// Instance method to get complete cohort data with all relations
CohortSchema.methods.getCompleteData = async function (): Promise<any> {
  const Application = mongoose.model('Application');
  const Assessment = mongoose.model('Assessment');
  const Interview = mongoose.model('Interview');
  const Stream = mongoose.model('Stream');
  const Task = mongoose.model('Task');
  const Material = mongoose.model('Material');
  const User = mongoose.model('User');

  await this.populate([
    { path: 'tracks.track', select: 'name trackId description isActive' },
    { path: 'tracks.mentors', select: 'firstName lastName email role' }
  ]);

  const trackIds = this.tracks.map((ct: any) => ct.track._id);

  // Get all data for tracks in this cohort
  const [applications, assessments, interviews, streams, tasks, materials, students] = await Promise.all([
    Application.find({ track: { $in: trackIds } }).populate('applicant', 'firstName lastName email'),
    Assessment.find({}).populate({
      path: 'application',
      match: { track: { $in: trackIds } },
      populate: { path: 'applicant', select: 'firstName lastName email' }
    }),
    Interview.find({}).populate({
      path: 'application',
      match: { track: { $in: trackIds } },
      populate: { path: 'applicant', select: 'firstName lastName email' }
    }),
    Stream.find({ track: { $in: trackIds } }).populate('createdBy', 'firstName lastName'),
    Task.find({ track: { $in: trackIds } }).populate('createdBy', 'firstName lastName'),
    Material.find({ track: { $in: trackIds } }).populate('createdBy', 'firstName lastName'),
    User.find({
      role: 'student',
      'trackAssignments.track': { $in: trackIds },
      'trackAssignments.cohort': this._id
    })
  ]);

  // Organize data by track
  const trackData = this.tracks.map((cohortTrack: any) => {
    const trackId = cohortTrack.track._id.toString();

    const trackApplications = applications.filter(app => app.track.toString() === trackId);
    const trackAssessments = assessments.filter(assess => assess.application && assess.application.track.toString() === trackId);
    const trackInterviews = interviews.filter(interview => interview.application && interview.application.track.toString() === trackId);
    const trackStreams = streams.filter(stream => stream.track.toString() === trackId);
    const trackTasks = tasks.filter(task => task.track.toString() === trackId);
    const trackMaterials = materials.filter(material => material.track.toString() === trackId);
    const trackStudents = students.filter(student =>
      student.trackAssignments.some((assignment: any) =>
        assignment.track.toString() === trackId && assignment.cohort.toString() === this._id.toString()
      )
    );

    return {
      ...cohortTrack.toObject(),
      applications: trackApplications,
      assessments: trackAssessments,
      interviews: trackInterviews,
      streams: trackStreams,
      tasks: trackTasks,
      materials: trackMaterials,
      students: trackStudents,
      statistics: {
        totalApplications: trackApplications.length,
        pendingApplications: trackApplications.filter(app => app.status === 'pending').length,
        acceptedApplications: trackApplications.filter(app => app.status === 'accepted').length,
        rejectedApplications: trackApplications.filter(app => app.status === 'rejected').length,
        totalStudents: trackStudents.length,
        totalAssessments: trackAssessments.length,
        totalInterviews: trackInterviews.length,
        totalStreams: trackStreams.length,
        totalTasks: trackTasks.length,
        totalMaterials: trackMaterials.length,
      }
    };
  });

  return {
    ...this.toObject(),
    trackData,
    overallStatistics: {
      totalApplications: applications.length,
      totalStudents: students.length,
      totalMentors: this.tracks.reduce((sum: any, track: any) => sum + track.mentors.length, 0),
      totalTracks: this.tracks.length,
      totalStreams: streams.length,
      totalTasks: tasks.length,
      totalMaterials: materials.length,
    }
  };
};

// Static method to get the current active cohort
CohortSchema.statics.getCurrentActive = function (): Promise<ICohort | null> {
  return this.findOne({ isCurrentlyActive: true })
    .populate("tracks.track", "name trackId description isActive")
    .populate("tracks.mentors", "firstName lastName email");
};

// Static method to set a cohort as currently active (deactivates others)
CohortSchema.statics.setCurrentlyActive = async function (
  cohortId: string,
): Promise<ICohort | null> {
  // First, deactivate all other cohorts
  await this.updateMany(
    { isCurrentlyActive: true, _id: { $ne: cohortId } },
    { isCurrentlyActive: false },
  );

  // Then activate the specified cohort
  return this.findByIdAndUpdate(
    cohortId,
    { isCurrentlyActive: true },
    { new: true },
  )
    .populate("tracks.track", "name trackId description isActive")
    .populate("tracks.mentors", "firstName lastName email");
};

// Index for performance
CohortSchema.index({ status: 1 });
CohortSchema.index({ startDate: 1 });
CohortSchema.index({ isAcceptingApplications: 1 });
CohortSchema.index({ isCurrentlyActive: 1 });
CohortSchema.index({ "tracks.track": 1 });

export const Cohort = mongoose.model<ICohort, ICohortModel>(
  "Cohort",
  CohortSchema,
);
