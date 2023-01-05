import express from "express";
import passport from "passport";
import sessionRouter from "./routes/session.js"
import { createSession } from "./services/session.js";
import { 
  createOAuth2Strategy, 
  createUserSerializer, 
  createUserDeserializer 
} from "./services/passport.js";

startApp(process.env);

export async function startApp(env) {
  const { PORT } = env;
  const app = await createApp(env);
  app.listen(PORT, () => console.info(`Application is running on port: ${PORT}`));
}

export async function createApp(env) {
  // create app and register locals/middlware
  const app = express();

  passport.serializeUser(createUserSerializer());
  passport.deserializeUser(createUserDeserializer());
  passport.use("default", await createOAuth2Strategy(env));

  // configure session
  app.use(createSession(env));
  app.use(passport.initialize());
  app.use(passport.session());

  // register api routes
  app.use("/api", sessionRouter);
  return app;
}
