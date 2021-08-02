import React, { useEffect } from "react";
import { Route, useLocation, NavLink } from "react-router-dom";
import { Home } from "./pages/home/home";
import { Navbar, Nav } from "react-bootstrap";
import { NCIFooter } from "@cbiitss/react-components";
import { Calculate } from "./pages/calculate/calculate";
import { About } from "./pages/about/about";
import "./styles/main.scss";

export function App() {
  const { pathname } = useLocation();
  useEffect((_) => window.scrollTo(0, 0), [pathname]);

  const links = [
    {
      route: "/",
      title: "Home",
    },
    {
      route: "/calculate",
      title: "Calculate",
    },
    {
      route: "/about",
      title: "About",
    },
  ];

  return (
    <>
      <header>
        <div className="container py-4">
          <a href="https://cancer.gov/">
            <img src="assets/images/logo.svg" alt="NCI Logo" className="w-50" />
          </a>
        </div>
      </header>
      <Navbar bg="dark" expand="sm" className="navbar-dark py-0">
        <div className="container">
          <Navbar.Toggle aria-controls="app-navbar" />
          <Navbar.Collapse id="app-navbar">
            <Nav className="mr-auto">
              {links.map((link, index) => (
                <NavLink
                  key={`navlink-${index}`}
                  exact
                  activeClassName="active"
                  className="nav-link px-3 text-uppercase font-weight-bold"
                  to={link.route}>
                  {link.title}
                </NavLink>
              ))}
            </Nav>
          </Navbar.Collapse>
        </div>
      </Navbar>
      <main id="main">
        <Route path="/" exact={true} component={Home} />
        <Route path="/calculate" component={Calculate} />
        <Route path="/about" component={About} />
      </main>
      <NCIFooter
        className="py-4 bg-primary-gradient text-light"
        title={
          <div className="mb-4">
            <div className="h4 mb-0">Division Name</div>
            <div className="h6">at the National Cancer Institute</div>
          </div>
        }
      />
    </>
  );
}
