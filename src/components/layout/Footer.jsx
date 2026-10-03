import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import LegalModal from './LegalModal';

const LOGO_URL = "/logo-next-lab-europe-bianco.png";

const translations = {
  it: {
    tagline: "Costruiamo il futuro dell'Europa, insieme.",
    nav: { home: 'Home', about: 'Chi Siamo', programs: 'Progetti', contact: 'Contatti' },
    legal: '© 2026 Next Lab Europe APS — Associazione di Promozione Sociale. Tutti i diritti riservati.',
    orgTitle: 'NEXT LAB EUROPE APS',
    address: ['Piazza Baracca, 10', 'c/o Fondazione del Monte di Bologna e Ravenna', 'Scala A, Piano Secondo', '48022 Lugo (RA)'],
    phone: 'Cell. +39 335 5318353',
    cf: 'C.F. 92105040395',
    runts: 'Repertorio RUNTS n. 178511',
    email: 'info@nextlabeurope.eu',
    statuto: 'Statuto (PDF)',
  },
  en: {
    tagline: "Building Europe's future, together.",
    nav: { home: 'Home', about: 'About Us', programs: 'Projects', contact: 'Contact' },
    legal: '© 2026 Next Lab Europe APS — Social Promotion Association. All rights reserved.',
    orgTitle: 'NEXT LAB EUROPE APS',
    address: ['Piazza Baracca, 10', 'c/o Fondazione del Monte di Bologna e Ravenna', 'Scala A, Piano Secondo', '48022 Lugo (RA), Italy'],
    phone: 'Phone +39 335 5318353',
    cf: 'Tax code 92105040395',
    runts: 'RUNTS registration no. 178511',
    email: 'info@nextlabeurope.eu',
    statuto: 'Statute (PDF)',
  },
};

export default function Footer({ lang }) {
  const t = translations[lang];
  const [legalOpen, setLegalOpen] = useState(null); // 'privacy' | 'cookie' | null

  return (
    <footer style={{ backgroundColor: '#0C0C0C', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
          <div className="space-y-6">
            <Link to="/" id="footer-logo" aria-label="Home" className="inline-block transition-opacity duration-300 hover:opacity-80"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
              <img src={LOGO_URL} alt="Next Lab Europe" className="h-[92px] w-auto object-contain" />
            </Link>
            <p className="text-sm leading-relaxed max-w-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>{t.tagline}</p>
            <div className="text-sm leading-relaxed space-y-1" style={{ color: 'rgba(255,255,255,0.4)' }}>
              <p className="font-semibold" style={{ color: 'rgba(255,255,255,0.6)' }}>{t.orgTitle}</p>
              {t.address.map((line) => <p key={line}>{line}</p>)}
              <p className="pt-1">{t.phone}</p>
              <p>{t.cf}</p>
              <p>{t.runts}</p>
              <p><a href={`mailto:${t.email}`} className="transition-colors hover:text-white">{t.email}</a></p>
            </div>
          </div>
          <div className="space-y-6">
            <h4 className="font-mono text-[10px] uppercase tracking-[0.3em]" style={{ color: 'rgba(255,255,255,0.5)' }}>
              {lang === 'it' ? 'Navigazione' : 'Navigation'}
            </h4>
            <div className="flex flex-col gap-3">
              <Link to="/" className="text-sm transition-colors hover:text-white" style={{ color: 'rgba(255,255,255,0.4)' }}>{t.nav.home}</Link>
              <Link to="/#chi-siamo" className="text-sm transition-colors hover:text-white" style={{ color: 'rgba(255,255,255,0.4)' }}>{t.nav.about}</Link>
              <Link to="/#progetti" className="text-sm transition-colors hover:text-white" style={{ color: 'rgba(255,255,255,0.4)' }}>{t.nav.programs}</Link>
              <Link to="/contatti" className="text-sm transition-colors hover:text-white" style={{ color: 'rgba(255,255,255,0.4)' }}>{t.nav.contact}</Link>
            </div>
          </div>
          <div className="space-y-6">
            <h4 className="font-mono text-[10px] uppercase tracking-[0.3em]" style={{ color: 'rgba(255,255,255,0.5)' }}>
              {lang === 'it' ? 'Legale' : 'Legal'}
            </h4>
            <div className="flex flex-col gap-3">
              <button onClick={() => setLegalOpen('privacy')}
                className="text-sm text-left transition-colors hover:text-white" style={{ color: 'rgba(255,255,255,0.4)' }}>
                Privacy Policy
              </button>
              <button onClick={() => setLegalOpen('cookie')}
                className="text-sm text-left transition-colors hover:text-white" style={{ color: 'rgba(255,255,255,0.4)' }}>
                Cookie Policy
              </button>
              <a href="/documents/statuto-next-lab-europe-aps.pdf" target="_blank" rel="noopener noreferrer"
                className="text-sm transition-colors hover:text-white" style={{ color: 'rgba(255,255,255,0.4)' }}>
                {t.statuto}
              </a>
            </div>
          </div>
        </div>
        <div className="mt-20 pt-8" style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <p className="text-xs text-center" style={{ color: 'rgba(255,255,255,0.3)' }}>{t.legal}</p>
        </div>
      </div>

      <LegalModal lang={lang} type={legalOpen} onClose={() => setLegalOpen(null)} />
    </footer>
  );
}
