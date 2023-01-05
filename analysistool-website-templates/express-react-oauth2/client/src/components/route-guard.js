import { useRecoilValue } from "recoil";
import { useLocation } from "react-router-dom";
import { sessionState } from "../session/session.state";
import Unauthorized from "../pages/unauthorized";

export function isAuthorized(session, resource) {
  // todo: check if session is authorized to access resource
  return session?.authenticated;
}

export default function RouteGuard({children}) {
  const session = useRecoilValue(sessionState);
  const location = useLocation();
  const resource = location?.pathname || "/";

  return isAuthorized(session, resource) ? children : <Unauthorized />
}