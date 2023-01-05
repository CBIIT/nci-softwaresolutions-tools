import { atom } from "recoil";
import axios from "axios";

export async function refreshSession() {
  try {
    const response = await axios.post("/api/session");
    return response.data;
  } catch (error) {
    console.error(error);
    return { authenticated: false };
  }
}

export const sessionState = atom({
  key: "session.sessionState",
  default: { authenticated: false },
});
