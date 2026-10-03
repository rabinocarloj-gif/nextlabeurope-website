import React, { useState, useEffect, useRef } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';

// Gestisce lo scorrimento a ogni clic sui link: sezione indicata (#chi-siamo, #progetti) oppure inizio pagina
function useScrollOnNavigate() {
  const location = useLocation();
  const prevPath = useRef(location.pathname);
  useEffect(() => {
    const samePage = prevPath.current === location.pathname;
    prevPath.current = location.pathname;
    if (location.search.includes('motivo=')) return; // la pagina Contatti porta da sola al modulo
    const behavior = samePage ? 'smooth' : 'auto';
    requestAnimationFrame(() => {
      if (location.hash) {
        const el = document.getElementById(location.hash.slice(1));
        if (el) { el.scrollIntoView({ behavior, block: 'start' }); return; }
      }
      window.scrollTo({ top: 0, behavior });
    });
  }, [location.key]);
}

export default function SiteLayout() {
  const [lang, setLang] = useState('it');
  useScrollOnNavigate();
  return (
    <div className="min-h-screen bg-background lattice-line">
      <Navbar lang={lang} setLang={setLang} />
      <main><Outlet context={{ lang }} /></main>
      <Footer lang={lang} />
    </div>
  );
}
