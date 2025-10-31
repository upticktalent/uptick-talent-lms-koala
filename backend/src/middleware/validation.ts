import { Request, Response, NextFunction } from "express";

export interface ValidationError {
  field: string;
  message: string;
}

export const validateApplication = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const {
    firstName,
    lastName,
    email,
    phoneNumber,
    gender,
    country,
    state,
    educationalQualification,
    track,
    cohort,
  } = req.body;
  const errors: ValidationError[] = [];

  // Required field validations
  if (!firstName?.trim()) {
    errors.push({ field: "firstName", message: "First name is required" });
  } else if (firstName.trim().length > 50) {
    errors.push({
      field: "firstName",
      message: "First name cannot exceed 50 characters",
    });
  }

  if (!lastName?.trim()) {
    errors.push({ field: "lastName", message: "Last name is required" });
  } else if (lastName.trim().length > 50) {
    errors.push({
      field: "lastName",
      message: "Last name cannot exceed 50 characters",
    });
  }

  // Email validation
  if (!email?.trim()) {
    errors.push({ field: "email", message: "Email is required" });
  } else {
    const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(email.trim())) {
      errors.push({
        field: "email",
        message: "Please enter a valid email address",
      });
    }
  }

  if (!phoneNumber?.trim()) {
    errors.push({ field: "phoneNumber", message: "Phone number is required" });
  }

  // Gender validation
  const validGenders = ["male", "female", "other", "prefer-not-to-say"];
  if (!gender) {
    errors.push({ field: "gender", message: "Gender is required" });
  } else if (!validGenders.includes(gender)) {
    errors.push({ field: "gender", message: "Invalid gender selection" });
  }

  if (!country?.trim()) {
    errors.push({ field: "country", message: "Country is required" });
  }

  if (!state?.trim()) {
    errors.push({ field: "state", message: "State is required" });
  }

  if (!educationalQualification?.trim()) {
    errors.push({
      field: "educationalQualification",
      message: "Educational qualification is required",
    });
  } else if (educationalQualification.trim().length > 200) {
    errors.push({
      field: "educationalQualification",
      message: "Educational qualification cannot exceed 200 characters",
    });
  }

  if (!track) {
    errors.push({ field: "track", message: "Track selection is required" });
  }

  if (!cohort) {
    errors.push({ field: "cohort", message: "Cohort selection is required" });
  }

  // CV file validation
  if (!req.file) {
    errors.push({ field: "cv", message: "CV file is required" });
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors,
    });
  }

  next();
};

export const validateLogin = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { email, password } = req.body;
  const errors: ValidationError[] = [];

  if (!email?.trim()) {
    errors.push({ field: "email", message: "Email is required" });
  } else {
    const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(email.trim())) {
      errors.push({
        field: "email",
        message: "Please enter a valid email address",
      });
    }
  }

  if (!password) {
    errors.push({ field: "password", message: "Password is required" });
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors,
    });
  }

  next();
};

export const validatePasswordReset = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { currentPassword, newPassword } = req.body;
  const errors: ValidationError[] = [];

  if (!currentPassword) {
    errors.push({
      field: "currentPassword",
      message: "Current password is required",
    });
  }

  if (!newPassword) {
    errors.push({ field: "newPassword", message: "New password is required" });
  } else if (newPassword.length < 6) {
    errors.push({
      field: "newPassword",
      message: "New password must be at least 6 characters long",
    });
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors,
    });
  }

  next();
};
