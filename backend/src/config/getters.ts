import { constants } from "../constants";
import { env } from "./dynamicEnv";

const getCurrentLanguage = () => {
  if (!env.CURRENT_LANGUAGE) {
    return constants.defaults.currentLanguage as typeof env.CURRENT_LANGUAGE;
  }

  return env.CURRENT_LANGUAGE;
};

const geti18ns = () => {
  return constants.i18n[getCurrentLanguage()];
};

const getNodeEnv = () => {
  if (!env.NODE_ENV) {
    return constants.defaults.environment as typeof env.NODE_ENV;
  }

  return env.NODE_ENV;
};

const getAppPort = () => {
  if (!env.APP_PORT) {
    return constants.defaults.appPort;
  }
  return parseInt(env.APP_PORT);
};

const getDatabaseUri = () => {
  return env.DATABASE_URI;
};

const getAllowedOrigins = () => {
  return env.ALLOWED_ORIGINS;
};

export const getters = {
  geti18ns,
  getCurrentLanguage,
  getNodeEnv,
  getAppPort,
  getDatabaseUri,
  getAllowedOrigins,
};
