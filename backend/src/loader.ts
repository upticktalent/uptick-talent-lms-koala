import { getters, HttpStatusCode } from "./config";
import { joinUrls, responseObject } from "./utils";

import type { Express } from "express";
import { constants } from "./constants";
import routers from "./routes";

const servicesLoader = [
  {
    path: joinUrls(constants.urls.health.entry().path),
    handler: [routers.health],
  },
  {
    path: joinUrls(constants.urls.auth.entry().path),
    handler: [routers.auth],
  },
  {
    path: joinUrls(constants.urls.applications.entry().path),
    handler: [routers.application],
  },
  {
    path: joinUrls(constants.urls.cohorts.entry().path),
    handler: [routers.cohort],
  },
  {
    path: joinUrls(constants.urls.tracks.entry().path),
    handler: [routers.track],
  },
  {
    path: joinUrls(constants.urls.users.entry().path),
    handler: [routers.user],
  },
];

export const loadServices = (app: Express) => {
  servicesLoader.map((service) => {
    console.log(service.path);
    app.use(service.path, ...service.handler);
  });

  app.use("*", (...rest) => {
    responseObject({
      res: rest[1],
      message: getters.geti18ns().LOGS.ROUTES.WILDCARD,
      statusCode: HttpStatusCode.NOT_FOUND,
    });
  });
};
