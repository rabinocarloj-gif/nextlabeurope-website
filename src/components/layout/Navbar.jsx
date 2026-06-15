import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const LOGO_URL = "https://media.base44.com/images/public/6a22d208947a03fa34e3238c/9830c8abc_WhatsApp_Image_2026-04-19_at_184059-removebg-preview.png";

const translations = {
  it: { home: 'Home', about: 'Chi Siamo', programs: 'Progetti', contact: 'Contatti' },
  en: { home: 'Home', about: 'About Us', programs: 'Projects', contact: 'Contact' },
};

export default function Navbar({ lang, setLang }) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const t = translations[lang];

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: t.home, to: '/' },
    { label: t.about, to: '/#chi-siamo' },
    { label: t.programs, to: '/#progetti' },
    { label: t.contact, to: '/contatti' },
  ];

  const handleNavClick = (to) => {
    setMobileOpen(false);
    if (to.startsWith('/#')) {
      const id = to.replace('/#', '');
      if (location.pathname === '/') {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
      } else {
        window.location.href = to;
      }
    }
  };

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled ? 'bg-white/95 backdrop-blur-xl border-b border-gray-100 shadow-sm' : 'bg-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-6 lg:px-8 flex items-center justify-between h-20">
          <Link to="/" className="flex items-center shrink-0">
            <img src={LOGO_URL} alt="nextlab EUROPE" className="h-14 w-auto object-contain" />
          </Link>
          <div className="hidden md:flex items-center gap-10">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                to={link.to.startsWith('/#') ? (location.pathname === '/' ? '#' : link.to) : link.to}
                onClick={() => handleNavClick(link.to)}
                className="font-mono text-xs uppercase tracking-[0.2em] text-foreground/60 hover:text-primary transition-colors duration-300"
                style={{ color: '#0F0F0F99' }}
              >
                {link.label}
              </Link>
            ))}
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setLang(lang === 'it' ? 'en' : 'it')}
              className="relative flex items-center w-16 h-8 rounded-full bg-gray-100 border border-gray-200 overflow-hidden"
            >
              <motion.div
                className="absolute top-0.5 w-7 h-7 rounded-full bg-primary"
                style={{ backgroundColor: '#1a4fc4' }}
                animate={{ left: lang === 'it' ? '2px' : '30px' }}
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              />
              <span className={`relative z-10 flex-1 text-center font-mono text-[10px] font-semibold ${lang === 'it' ? 'text-white' : 'text-gray-500'}`}>IT</span>
              <span className={`relative z-10 flex-1 text-center font-mono text-[10px] font-semibold ${lang === 'en' ? 'text-white' : 'text-gray-500'}`}>EN</span>
            </button>
            <button className="md:hidden" onClick={() => setMobileOpen(!mobileOpen)}>
              {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </nav>
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 z-40 bg-white pt-24 px-8"
          >
            <div className="flex flex-col gap-8">
              {navLinks.map((link, i) => (
                <motion.div key={link.label} initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}>
                  <Link
                    to={link.to.startsWith('/#') ? '#' : link.to}
                    onClick={() => handleNavClick(link.to)}
                    className="font-heading text-4xl font-bold hover:text-primary transition-colors"
                    style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                  >
                    {link.label}
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
