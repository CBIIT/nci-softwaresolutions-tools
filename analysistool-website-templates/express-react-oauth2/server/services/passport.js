
import { Issuer, Strategy } from "openid-client";

export function createUserSerializer() {
  return (user, done) => done(null, user);
}

// This is where we would retrieve user information from the database
export function createUserDeserializer() {
  return (user, done) => done(null, user);
}

export async function createOAuth2Strategy(env = process.env) {
  const { Client } = await Issuer.discover(env.OAUTH2_BASE_URL);

  const client = new Client({
    client_id: env.OAUTH2_CLIENT_ID,
    client_secret: env.OAUTH2_CLIENT_SECRET,
    redirect_uris: [env.OAUTH2_REDIRECT_URI],
    response_types: ["code"],
  });

  const params = {
    scope: "openid profile email",
    prompt: "login",
  }

  return new Strategy({ client, params }, async (tokenSet, done) => {
    const user = await client.userinfo(tokenSet);
    done(null, user);
  });
}