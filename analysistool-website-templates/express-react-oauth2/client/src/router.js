import { createBrowserRouter } from "react-router-dom";
import App from "./app";
import Home from "./pages/home";
import Protected from "./pages/protected";
import RouteGuard from "./components/route-guard";
import Session from "./session/session";

export const routes = [
  {
    path: "/",
    title: "Home",
    element: <Session><Home /></Session>,
  },
  {
    path: "/protected",
    title: "Protected",
    element: <Session><RouteGuard><Protected /></RouteGuard></Session>,
  },
  {
    path: "/api/login",
    title: "Log In",
    native: true,
    show: (session) => !session?.authenticated,
  },
  {
    path: "/api/logout",
    title: "Log Out",
    native: true,
    show: (session) => session?.authenticated,
  },
]

const router = createBrowserRouter([
  {
    element: <App />,
    children: routes
  }
]);

export default router;