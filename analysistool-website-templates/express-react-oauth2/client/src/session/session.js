import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useSetRecoilState } from "recoil";
import { sessionState, refreshSession } from "./session.state";

export default function Session({ children }) {
  const setSession = useSetRecoilState(sessionState);
  const location = useLocation();

  useEffect(() => {
    refreshSession().then(setSession);
  }, [setSession, location]);

  return children;
}
