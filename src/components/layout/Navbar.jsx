import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const LOGO_URL = "/logo-next-lab-europe-simbolo.png";

const translations = {
  it: { home: 'Home', about: 'Chi Siamo', programs: 'Progetti', contact: 'Contatti' },
  en: { home: 'Home', about: 'About Us', programs: 'Projects', contact: 'Contact' },
};

export default function Navbar({ lang, setLang }) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [footerLogoVisible, setFooterLogoVisible] = useState(false);
  const location = useLocation();
  const t = translations[lang];

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Quando il logo del footer entra nello schermo, il logo dell'header svanisce dolcemente
  useEffect(() => {
    const target = document.getElementById('footer-logo');
    if (!target || !('IntersectionObserver' in window)) return;
    const observer = new IntersectionObserver(
      ([entry]) => setFooterLogoVisible(entry.isIntersecting),
      { threshold: 0.25 }
    );
    observer.observe(target);
    return () => observer.disconnect();
  }, [location.pathname]);

  const logoRef = useRef(null);
  const goHome = () => {
    setMobileOpen(false);
    const el = logoRef.current;
    if (el && el.animate && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      el.animate(
        [
          { transform: 'scale(1) rotate(0deg)', filter: 'drop-shadow(0 0 0 rgba(74,144,226,0))' },
          { transform: 'scale(0.86) rotate(-6deg)', filter: 'drop-shadow(0 0 6px rgba(74,144,226,0.6))', offset: 0.3 },
          { transform: 'scale(1.08) rotate(3deg)', filter: 'drop-shadow(0 0 14px rgba(74,144,226,0.55))', offset: 0.65 },
          { transform: 'scale(1) rotate(0deg)', filter: 'drop-shadow(0 0 0 rgba(74,144,226,0))' },
        ],
        { duration: 750, easing: 'cubic-bezier(0.22, 1, 0.36, 1)' }
      );
    }
    if (location.pathname === '/') window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navLinks = [
    { label: t.home, to: '/' },
    { label: t.about, to: '/#chi-siamo' },
    { label: t.programs, to: '/#progetti' },
    { label: t.contact, to: '/contatti' },
  ];

  const handleNavClick = () => setMobileOpen(false);

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled ? 'bg-white/75 backdrop-blur-md border-b border-gray-100/70 shadow-sm' : 'bg-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-6 lg:px-8 flex items-center justify-between h-24">
          <Link to="/" onClick={goHome} aria-label="Home"
            className="flex items-center shrink-0"
            style={{
              opacity: footerLogoVisible ? 0 : 1,
              transform: footerLogoVisible ? 'translateY(-6px) scale(0.96)' : 'none',
              filter: footerLogoVisible ? 'blur(2px)' : 'none',
              pointerEvents: footerLogoVisible ? 'none' : 'auto',
              transition: 'opacity 900ms cubic-bezier(0.22, 1, 0.36, 1), transform 900ms cubic-bezier(0.22, 1, 0.36, 1), filter 900ms cubic-bezier(0.22, 1, 0.36, 1)',
            }}>
            <img ref={logoRef} src={LOGO_URL} alt="Next Lab Europe" className="h-[68px] w-auto object-contain transition-transform duration-300 hover:scale-[1.04]" />
          </Link>
          <div key={lang} className="lang-swap-soft hidden md:flex items-center gap-10">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                to={link.to}
                onClick={handleNavClick}
                className="nav-link font-mono text-xs uppercase tracking-[0.2em]"
              >
                {link.label}
              </Link>
            ))}
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setLang(lang === 'it' ? 'en' : 'it')}
              className="relative flex items-center w-16 h-8 rounded-full bg-gray-100 border border-gray-200 overflow-hidden transition-shadow duration-300 hover:shadow-[0_0_0_4px_rgba(74,144,226,0.12)]"
            >
              <motion.div
                className="absolute top-[1px] w-7 h-7 rounded-full bg-primary"
                style={{ backgroundColor: '#1a4fc4' }}
                animate={{ left: lang === 'it' ? '1px' : '33px' }}
                transition={{ type: 'spring', stiffness: 260, damping: 26 }}
              />
              <span className={`relative z-10 flex-1 text-center font-mono text-[10px] font-semibold ${lang === 'it' ? 'text-white' : 'text-gray-500'} transition-colors duration-500`}>IT</span>
              <span className={`relative z-10 flex-1 text-center font-mono text-[10px] font-semibold ${lang === 'en' ? 'text-white' : 'text-gray-500'} transition-colors duration-500`}>EN</span>
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
                    to={link.to}
                    onClick={handleNavClick}
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
