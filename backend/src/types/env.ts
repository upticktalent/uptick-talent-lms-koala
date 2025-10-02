export type Env = {
  NODE_ENV: "production" | "staging" | "development";
  CURRENT_LANGUAGE: "en";
  APP_PORT: string;
  DATABASE_URI: string;
  ALLOWED_ORIGINS: string;
};
