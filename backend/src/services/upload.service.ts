import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true, // Force HTTPS
});

// Test Cloudinary connection
const testCloudinaryConnection = async () => {
  try {
    await cloudinary.api.ping();
    console.log("✅ Cloudinary connection successful");
  } catch (error) {
    console.error("❌ Cloudinary connection failed:", error);
  }
};

// Test connection on startup
testCloudinaryConnection();

// Configure Cloudinary storage for CVs
const cvStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "uptick-talent/cvs",
    allowed_formats: ["pdf"],
    resource_type: "auto",
    public_id: (req: any, file: any) => {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      return `cv-${uniqueSuffix}`;
    },
  } as any,
});

// Configure Cloudinary storage for assessments
const assessmentStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "uptick-talent/assessments",
    allowed_formats: ["pdf", "docx"],
    resource_type: "auto",
    public_id: (req: any, file: any) => {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      return `assessment-${uniqueSuffix}`;
    },
  } as any,
});

// File filter for CV uploads (PDF only)
const cvFileFilter = (
  req: any,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback,
) => {
  // Accept only PDF files
  const allowedMimes = ["application/pdf"];

  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type. Only PDF files are allowed."));
  }
};

// File filter for assessment uploads (PDF and DOCX)
const assessmentFileFilter = (
  req: any,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback,
) => {
  // Accept PDF and DOCX files
  const allowedMimes = [
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ];

  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        "Invalid file type. Only PDF and DOCX files are allowed for assessments.",
      ),
    );
  }
};

// Configure multer for CV uploads
export const uploadCV = multer({
  storage: cvStorage as any,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: cvFileFilter,
});

// Configure multer for assessment uploads
export const uploadAssessment = multer({
  storage: assessmentStorage as any,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit for assessments
  },
  fileFilter: assessmentFileFilter,
});

// Helper function to get CV file URL (now returns Cloudinary URL directly)
export const getFileUrl = (cloudinaryUrl: string): string => {
  return cloudinaryUrl;
};

// Helper function to get assessment file URL (now returns Cloudinary URL directly)
export const getAssessmentFileUrl = (cloudinaryUrl: string): string => {
  return cloudinaryUrl;
};

// Export cloudinary instance for direct usage if needed
export { cloudinary };
