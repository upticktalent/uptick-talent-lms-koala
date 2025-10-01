import { routeCreator } from "@utils";

export const urls = {
  health: {
    entry: () => routeCreator("health"),
    root: () => "/", // optional, for clarity
    detailed: () => "/detailed",
    liveness: () => "/liveness",
    readiness: () => "/readiness",
  },
  features: {
    getByFlag: () => routeCreator("flags"),
    getAll: () => routeCreator("all"),
  },
};
