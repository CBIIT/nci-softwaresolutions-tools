import React, { useEffect } from 'react';
import { Route, HashRouter as Router, useLocation } from 'react-router-dom';
import { Header } from './components/header/header';
import { Footer } from './components/footer/footer';
import { Navbar } from './components/navbar/navbar';
import { Home } from './pages/home/home';
import { Calculate } from './pages/calculate/calculate';
import { About } from './pages/about/about';
import './styles/main.scss';

export function App() {
  
  /** Defines links which will appear in the navbar */
  const links = [
    {
      route: '/',
      title: 'Home',
    },
    {
      route: '/calculate',
      title: 'Calculate',
    },
    {
      route: '/about',
      title: 'About',
    },
    
  ];

  /**
   * Component which resets scroll position when location changes
   * @type React.FunctionComponent
   */
  function ResetScroll() {
    const { pathname } = useLocation();
    useEffect(_ => window.scrollTo(0, 0), [pathname]);
    return null;
  }

  return (
    <Router>
      <Header 
        imageSource="assets/images/logo.svg" 
        url="https://cancer.gov/"
      />
      <Navbar links={links} />
      <main id="main" tabIndex="-1">
        <ResetScroll />
        <Route key="home-page" path="/" exact={true} component={Home} />
        <Route key="calculate-page" path="/calculate" component={Calculate} />
        <Route key="about-page" path="/about" component={About} />
      </main>
      <Footer 
        className="py-4 bg-primary-gradient text-light"
        title={<>
            <div className="h4 mb-0">National Cancer Institute</div>
            <div className="h6">at the National Institutes of Health</div>
        </>}
      />
    </Router>
  );
}
