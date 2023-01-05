import { Outlet } from "react-router-dom";
import Navbar from "./components/navbar";
import { useRecoilValue } from "recoil";
import { sessionState } from "./session/session.state";
import { routes } from "./router";

export default function App() {
  const session = useRecoilValue(sessionState);
  return (
    <>
      <Navbar routes={routes} />
      <Outlet />
      <pre>{JSON.stringify(session, null, 2)}</pre>
    </>
  );
}
