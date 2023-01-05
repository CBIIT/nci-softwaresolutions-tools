import { Link } from "react-router-dom";
import { useRecoilValue } from "recoil";
import { sessionState } from "../session/session.state";

export function NavbarLink({route}) {
  return route.native 
    ? <a href={route.path}>{route.title}</a> 
    : <Link to={route.path}>{route.title}</Link>
}

export default function Navbar({routes}) {
  const session = useRecoilValue(sessionState);

  return (
    <nav>
      <ul>
        {routes
          .filter((route) => !route.show || route.show(session))
          .map((route) => <li key={route.path}><NavbarLink route={route} /></li>)
        }
      </ul>
    </nav>
  );
}