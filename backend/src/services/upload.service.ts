import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";

// Validate required environment variables
const validateCloudinaryConfig = () => {
  const requiredVars = [
    "CLOUDINARY_CLOUD_NAME",
    "CLOUDINARY_API_KEY",
    "CLOUDINARY_API_SECRET",
  ];
  const missingVars = requiredVars.filter((varName) => !process.env[varName]);

  if (missingVars.length > 0) {
    throw new Error(
      `Missing required Cloudinary environment variables: ${missingVars.join(", ")}`,
    );
  }
};

// Validate config before setting up Cloudinary
try {
  validateCloudinaryConfig();
} catch (error) {
  console.error("❌ Cloudinary configuration error:", error);
  process.exit(1); // Exit in production if config is invalid
}

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true, // Force HTTPS
});

// Test Cloudinary connection with better error handling
const testCloudinaryConnection = async () => {
  try {
    const result = await cloudinary.api.ping();
    console.log("✅ Cloudinary connection successful");
    return true;
  } catch (error) {
    console.error("❌ Cloudinary connection failed:", error);
    if (process.env.NODE_ENV === "production") {
      throw new Error("Cloudinary connection failed in production");
    }
    return false;
  }
};

// Test connection on startup
testCloudinaryConnection().catch((error) => {
  console.error("Critical: Cloudinary connection failed:", error);
  if (process.env.NODE_ENV === "production") {
    process.exit(1);
  }
});

// Configure Cloudinary storage for CVs with error handling
const cvStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "uptick-talent/cvs",
    resource_type: "auto",
    public_id: (req: any, file: any) => {
      try {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        const sanitizedName = file.originalname.replace(/[^a-zA-Z0-9]/g, "_");
        return `cv-${sanitizedName}-${uniqueSuffix}`;
      } catch (error) {
        console.error("Error generating CV public_id:", error);
        return `cv-${Date.now()}`;
      }
    },
    transformation: [{ quality: "auto:eco" }], // Optimize file size
  } as any,
});

// Configure Cloudinary storage for assessments with error handling
const assessmentStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "uptick-talent/assessments",
    resource_type: "auto",
    public_id: (req: any, file: any) => {
      try {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        const sanitizedName = file.originalname.replace(/[^a-zA-Z0-9]/g, "_");
        return `assessment-${sanitizedName}-${uniqueSuffix}`;
      } catch (error) {
        console.error("Error generating assessment public_id:", error);
        return `assessment-${Date.now()}`;
      }
    },
    transformation: [{ quality: "auto:eco" }], // Optimize file size
  } as any,
});

// File filter for CV uploads with detailed error messages
const cvFileFilter = (
  req: any,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback,
) => {
  try {
    // Accept PDF and DOCX files for CVs
    const allowedMimes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    const allowedExtensions = [".pdf", ".docx", ".doc"];
    const fileExtension = file.originalname
      .toLowerCase()
      .substring(file.originalname.lastIndexOf("."));

    if (
      allowedMimes.includes(file.mimetype) &&
      allowedExtensions.includes(fileExtension)
    ) {
      cb(null, true);
    } else {
      const error = new Error(
        `Invalid file type. Only PDF and DOCX files are allowed for CV uploads. Received: ${file.mimetype} (${fileExtension})`,
      );
      error.name = "FILE_TYPE_ERROR";
      cb(error);
    }
  } catch (error) {
    console.error("Error in CV file filter:", error);
    cb(new Error("File validation failed"));
  }
};

// File filter for assessment uploads with detailed error messages
const assessmentFileFilter = (
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
  try {
    // Accept PDF and DOCX files for assessments
    const allowedMimes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    const allowedExtensions = [".pdf", ".docx"];
    const fileExtension = file.originalname
      .toLowerCase()
      .substring(file.originalname.lastIndexOf("."));

    if (
      allowedMimes.includes(file.mimetype) &&
      allowedExtensions.includes(fileExtension)
    ) {
      cb(null, true);
    } else {
      const error = new Error(
        `Invalid file type. Only PDF and DOCX files are allowed for assessment uploads. Received: ${file.mimetype} (${fileExtension})`,
      );
      error.name = "FILE_TYPE_ERROR";
      cb(error);
    }
  } catch (error) {
    console.error("Error in assessment file filter:", error);
    cb(new Error("File validation failed"));
  }
};

// Configure multer for CV uploads with comprehensive error handling
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
    fileSize: 10 * 1024 * 1024, // 10MB limit
    files: 1, // Only one file
  },
  fileFilter: cvFileFilter,
});

// Configure multer for assessment uploads with comprehensive error handling
export const uploadAssessment = multer({
  storage: assessmentStorage as any,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit for assessments
    files: 1, // Only one file
  },
  fileFilter: assessmentFileFilter,
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
  if (!cloudinaryUrl) {
    throw new Error("Cloudinary URL is required");
  }
  return cloudinaryUrl;
};

// Helper function to get assessment file URL (now returns Cloudinary URL directly)
export const getAssessmentFileUrl = (cloudinaryUrl: string): string => {
  if (!cloudinaryUrl) {
    throw new Error("Cloudinary URL is required");
  }
  return cloudinaryUrl;
};

// Helper function to handle multer errors
export const handleUploadError = (error: any) => {
  console.error("Upload error:", error);

  if (error.code === "LIMIT_FILE_SIZE") {
    return {
      status: 400,
      message: "File too large. Maximum size allowed is 10MB.",
      type: "FILE_SIZE_ERROR",
    };
  }

  if (error.code === "LIMIT_FILE_COUNT") {
    return {
      status: 400,
      message: "Too many files. Only one file is allowed.",
      type: "FILE_COUNT_ERROR",
    };
  }

  if (error.name === "FILE_TYPE_ERROR") {
    return {
      status: 400,
      message: error.message,
      type: "FILE_TYPE_ERROR",
    };
  }

  if (error.message?.includes("Cloudinary")) {
    return {
      status: 500,
      message:
        "File upload service is currently unavailable. Please try again later.",
      type: "CLOUDINARY_ERROR",
    };
  }
  return {
    status: 500,
    message: "An error occurred while uploading the file. Please try again.",
    type: "UPLOAD_ERROR",
  };
};

// Function to validate file before processing
export const validateUploadedFile = (file: any) => {
  if (!file) {
    throw new Error("No file uploaded");
  }

  if (!file.path && !file.url) {
    throw new Error("File upload failed - no URL received from Cloudinary");
  }

  return true;
};

// Export cloudinary instance for direct usage if needed
export { cloudinary };
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
