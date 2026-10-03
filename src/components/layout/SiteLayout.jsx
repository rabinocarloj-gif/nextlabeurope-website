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

// Titolo, descrizione e indirizzo canonico per ogni pagina (letti da Google)
const SEO = {
  '/': {
    it: ["Next Lab Europe APS", "Next Lab Europe APS è un'associazione di promozione sociale di Lugo (RA) che promuove imprenditorialità giovanile, formazione e valori europei per una nuova generazione di cittadini attivi."],
    en: ['Next Lab Europe APS', 'Next Lab Europe APS is a social promotion association based in Lugo (Italy) promoting youth entrepreneurship, education and European values for a new generation of active citizens.'],
  },
  '/contatti': {
    it: ['Contatti – Next Lab Europe APS', "Scrivi a Next Lab Europe APS per diventare socio o volontario, chiedere informazioni o proporre una collaborazione. Sede a Lugo (RA)."],
    en: ['Contact – Next Lab Europe APS', 'Write to Next Lab Europe APS to become a member or volunteer, ask for information or propose a collaboration. Based in Lugo (Italy).'],
  },
  '/privacy': {
    it: ['Informativa sulla privacy – Next Lab Europe APS', 'Come Next Lab Europe APS tratta i dati personali di visitatori, contatti e soci, ai sensi del GDPR.'],
    en: ['Privacy Policy – Next Lab Europe APS', 'How Next Lab Europe APS processes the personal data of visitors, contacts and members under the GDPR.'],
  },
  '/cookie-policy': {
    it: ['Cookie Policy – Next Lab Europe APS', 'Il sito di Next Lab Europe APS non utilizza cookie di profilazione né strumenti di tracciamento.'],
    en: ['Cookie Policy – Next Lab Europe APS', 'The Next Lab Europe APS website does not use profiling cookies or tracking tools.'],
  },
};

function setMeta(selector, attr, value, create) {
  let el = document.head.querySelector(selector);
  if (!el && create) { el = document.createElement(create.tag); Object.entries(create.attrs).forEach(([k, v]) => el.setAttribute(k, v)); document.head.appendChild(el); }
  if (el) el.setAttribute(attr, value);
}

function useSeo(lang) {
  const { pathname } = useLocation();
  useEffect(() => {
    const page = SEO[pathname] || SEO['/'];
    const [title, description] = page[lang];
    const url = 'https://www.nextlabeurope.eu' + (pathname === '/' ? '/' : pathname);
    document.title = title;
    document.documentElement.lang = lang;
    setMeta('meta[name="description"]', 'content', description, { tag: 'meta', attrs: { name: 'description' } });
    setMeta('link[rel="canonical"]', 'href', url, { tag: 'link', attrs: { rel: 'canonical' } });
    setMeta('meta[property="og:title"]', 'content', title);
    setMeta('meta[property="og:description"]', 'content', description);
    setMeta('meta[property="og:url"]', 'content', url);
  }, [pathname, lang]);
}

export default function SiteLayout() {
  const [lang, setLang] = useState('it');
  useScrollOnNavigate();
  useSeo(lang);
  return (
    <div className="min-h-screen bg-background lattice-line">
      <Navbar lang={lang} setLang={setLang} />
      <main><Outlet context={{ lang }} /></main>
      <Footer lang={lang} />
    </div>
  );
}
