import { Env } from "@types";
import dotenv from "dotenv";

dotenv.config();

export const env: Env = {
  NODE_ENV: process.env.NODE_ENV! as unknown as Env["NODE_ENV"],
  CURRENT_LANGUAGE: process.env.CURRENT_LANGUAGE! as Env["CURRENT_LANGUAGE"],
  APP_PORT: process.env.APP_PORT!,
  DATABASE_URI: process.env.DATABASE_URI!,
  ALLOWED_ORIGINS: process.env.ALLOWED_ORIGINS!,
};
