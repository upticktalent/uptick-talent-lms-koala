import { routeCreator } from "../utils";

export const urls = {
  health: {
    entry: () => routeCreator("health"),
    root: () => "/", // optional, for clarity
    detailed: () => "/detailed",
    liveness: () => "/liveness",
    readiness: () => "/readiness",
  },
  auth: {
    entry: () => routeCreator("auth"),
    login: () => "/login",
    resetPassword: () => "/reset-password",
    profile: () => "/profile",
  },
  applications: {
    entry: () => routeCreator("applications"),
    apply: () => "/apply",
    list: () => "/",
    review: (id: string) => `/${id}/review`,
    accept: (id: string) => `/${id}/accept`,
    reject: (id: string) => `/${id}/reject`,
    details: (id: string) => `/${id}`,
  },
  cohorts: {
    entry: () => routeCreator("cohorts"),
    list: () => "/",
    create: () => "/create",
    details: (id: string) => `/${id}`,
    update: (id: string) => `/${id}`,
    delete: (id: string) => `/${id}`,
  },
  tracks: {
    entry: () => routeCreator("tracks"),
    list: () => "/",
    create: () => "/create",
    details: (id: string) => `/${id}`,
    update: (id: string) => `/${id}`,
    delete: (id: string) => `/${id}`,
  },
};
