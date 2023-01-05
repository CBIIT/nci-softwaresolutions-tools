import session from "express-session";
import createMemoryStore from "memorystore";
const Memorystore = createMemoryStore(session);

export function createSession(env = process.env) {
  return session({
    cookie: {
      maxAge: +env.SESSION_MAX_AGE,
    },
    store: new Memorystore({
      checkPeriod: +env.SESSION_MAX_AGE,
    }),
    resave: false,
    secret: env.SESSION_SECRET,
    saveUninitialized: true,
  });
}
