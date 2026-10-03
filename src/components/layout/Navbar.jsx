import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const LOGO_URL = "/logo-next-lab-europe-simbolo.png";

const translations = {
  it: { home: 'Home', about: 'Chi Siamo', programs: 'Progetti', contact: 'Contatti' },
  en: { home: 'Home', about: 'About Us', programs: 'Projects', contact: 'Contact' },
};

export default function Navbar({ lang, targetLang, setLang, fadeStyle }) {
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
              opacity: footerLogoVisible && !mobileOpen ? 0 : 1,
              transform: footerLogoVisible && !mobileOpen ? 'translateY(-6px) scale(0.96)' : 'none',
              filter: footerLogoVisible && !mobileOpen ? 'blur(2px)' : 'none',
              pointerEvents: footerLogoVisible && !mobileOpen ? 'none' : 'auto',
              transition: 'opacity 900ms cubic-bezier(0.22, 1, 0.36, 1), transform 900ms cubic-bezier(0.22, 1, 0.36, 1), filter 900ms cubic-bezier(0.22, 1, 0.36, 1)',
            }}>
            <img ref={logoRef} src={LOGO_URL} alt="Next Lab Europe" className="h-[68px] w-auto object-contain transition-transform duration-300 hover:scale-[1.04]" />
          </Link>
          <div className="hidden md:flex items-center gap-10" style={fadeStyle}>
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
              onClick={() => setLang(targetLang === 'it' ? 'en' : 'it')}
              className="relative flex items-center w-16 h-8 rounded-full bg-gray-100 border border-gray-200 overflow-hidden transition-shadow duration-300 hover:shadow-[0_0_0_4px_rgba(74,144,226,0.12)]"
            >
              <motion.div
                className="absolute top-[1px] w-7 h-7 rounded-full bg-primary"
                style={{ backgroundColor: '#1a4fc4' }}
                animate={{ left: targetLang === 'it' ? '1px' : '33px' }}
                transition={{ type: 'spring', stiffness: 260, damping: 26 }}
              />
              <span className={`relative z-10 flex-1 text-center font-mono text-[10px] font-semibold ${targetLang === 'it' ? 'text-white' : 'text-gray-500'} transition-colors duration-500`}>IT</span>
              <span className={`relative z-10 flex-1 text-center font-mono text-[10px] font-semibold ${targetLang === 'en' ? 'text-white' : 'text-gray-500'} transition-colors duration-500`}>EN</span>
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
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
            className="fixed inset-0 z-40 overflow-hidden flex flex-col"
            style={{ backgroundColor: '#fcfcfc' }}
          >
            {/* luci in movimento sullo sfondo */}
            <div aria-hidden="true" className="pointer-events-none absolute inset-0">
              <div className="glide-x absolute -top-24 left-[10%] w-[420px] h-[420px] rounded-full"
                style={{ background: 'radial-gradient(circle, rgba(74,144,226,0.18) 0%, rgba(74,144,226,0) 68%)' }} />
              <div className="glide-x-rev absolute -bottom-32 right-[5%] w-[420px] h-[420px] rounded-full"
                style={{ background: 'radial-gradient(circle, rgba(26,79,196,0.12) 0%, rgba(26,79,196,0) 68%)' }} />
            </div>

            <nav className="relative flex-1 flex flex-col justify-start px-8 pt-32" style={fadeStyle}>
              <p className="font-mono text-[10px] uppercase tracking-[0.4em] mb-6" style={{ color: '#9aa3b5', fontFamily: "'JetBrains Mono', monospace" }}>Menu</p>
              <div className="flex flex-col">
                {navLinks.map((link, i) => (
                  <motion.div key={link.label} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 + i * 0.07, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                    style={{ borderBottom: '1px solid rgba(26,79,196,0.10)' }}>
                    <Link to={link.to} onClick={handleNavClick} className="group flex items-baseline py-3.5">
                      <span className="font-heading text-2xl font-bold transition-transform duration-300 group-active:translate-x-1"
                        style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: '#1a4fc4' }}>
                        {link.label}
                      </span>
                    </Link>
                  </motion.div>
                ))}
              </div>
              <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, duration: 0.45 }}>
                <Link to="/contatti?motivo=socio" onClick={handleNavClick}
                  className="btn-glow mt-8 inline-block px-8 py-3.5 rounded-full text-white text-sm font-bold"
                  style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                  {lang === 'it' ? 'Unisciti a noi' : 'Join us'}
                </Link>
              </motion.div>
            </nav>

            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
              className="relative px-8 pb-10 pt-6 text-sm space-y-1.5" style={{ ...fadeStyle, color: '#6b7280', borderTop: '1px solid rgba(26,79,196,0.08)' }}>
              <a href="mailto:info@nextlabeurope.eu" className="block font-medium" style={{ color: '#1a4fc4' }}>info@nextlabeurope.eu</a>
              <p>Piazza Baracca 10, 48022 Lugo (RA)</p>
              <p className="font-mono text-[10px] uppercase tracking-[0.3em] pt-2" style={{ color: '#9aa3b5', fontFamily: "'JetBrains Mono', monospace" }}>
                Next Lab Europe APS · {lang === 'it' ? 'Associazione di Promozione Sociale' : 'Social Promotion Association'}
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
