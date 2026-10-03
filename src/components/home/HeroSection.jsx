import React from 'react';
import { motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { Link } from 'react-router-dom';

const translations = {
  it: {
    label: 'Next Lab Europe APS',
    title1: 'Costruiamo il futuro',
    title2: "dell'Europa,",
    title3: 'insieme.',
    subtitle: "Next Lab Europe è un'associazione che promuove l'imprenditoria giovanile e lo sviluppo dei territori in una prospettiva europea, diffonde i valori dell'Unione e contribuisce a formare una nuova generazione di cittadini motivati e attivi.",
    cta1: 'Scopri di più',
    cta2: 'Unisciti a noi',
  },
  en: {
    label: 'Next Lab Europe APS',
    title1: 'Building the future',
    title2: 'of Europe,',
    title3: 'together.',
    subtitle: 'Next Lab Europe is an association that promotes youth entrepreneurship and local development from a European perspective, spreads the values of the Union and helps shape a new generation of motivated and active citizens.',
    cta1: 'Learn more',
    cta2: 'Join us',
  },
};

// Anello di 12 stelle ispirato alla bandiera europea, in rotazione lentissima
function EuropeanRing() {
  const stars = Array.from({ length: 12 }, (_, i) => {
    const a = (i / 12) * Math.PI * 2 - Math.PI / 2;
    return { x: 200 + Math.cos(a) * 150, y: 200 + Math.sin(a) * 150, delay: (i * 0.5).toFixed(1) };
  });
  const star = (cx, cy, r) => {
    const pts = [];
    for (let k = 0; k < 10; k++) {
      const rad = k % 2 === 0 ? r : r * 0.42;
      const ang = (k / 10) * Math.PI * 2 - Math.PI / 2;
      pts.push(`${(cx + Math.cos(ang) * rad).toFixed(2)},${(cy + Math.sin(ang) * rad).toFixed(2)}`);
    }
    return pts.join(' ');
  };
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="eu-ring-hover pointer-events-auto absolute -top-16 -right-40 w-[360px] h-[360px] opacity-25 sm:opacity-40 sm:w-[480px] sm:h-[480px] sm:-right-32 lg:opacity-90 lg:w-[600px] lg:h-[600px] lg:top-1/2 lg:-translate-y-1/2 lg:right-[-2%]">
        <div className="eu-glow absolute inset-[12%] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(74,144,226,0.20) 0%, rgba(26,79,196,0.10) 45%, rgba(26,79,196,0) 72%)', filter: 'blur(10px)' }} />
        <div className="eu-glow-gold absolute inset-[12%] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(242,201,76,0.22) 0%, rgba(242,201,76,0.08) 45%, rgba(242,201,76,0) 72%)', filter: 'blur(12px)' }} />
        <svg viewBox="0 0 400 400" className="eu-ring absolute inset-0 w-full h-full">
          <defs>
            <linearGradient id="euStar" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#4a90e2" />
              <stop offset="100%" stopColor="#1a4fc4" />
            </linearGradient>
            <linearGradient id="euGold" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#f7dc8a" />
              <stop offset="100%" stopColor="#e3b53f" />
            </linearGradient>
          </defs>
          <circle cx="200" cy="200" r="150" fill="none" stroke="rgba(26,79,196,0.10)" strokeWidth="0.6" strokeDasharray="2 6" />
          <circle cx="200" cy="200" r="182" fill="none" stroke="rgba(26,79,196,0.06)" strokeWidth="0.5" />
          {stars.map((st, i) => (
            <polygon key={i} className="eu-star" points={star(st.x, st.y, 11)} fill="url(#euStar)"
              style={{ animationDelay: `${st.delay}s`, opacity: 0.5 }} />
          ))}
          <g className="eu-gold">
            {stars.map((st, i) => (
              <polygon key={i} points={star(st.x, st.y, 11)} fill="url(#euGold)" />
            ))}
          </g>
        </svg>
      </div>
    </div>
  );
}

export default function HeroSection({ lang, heroImage }) {
  const t = translations[lang];
  const scrollToAbout = () => document.getElementById('chi-siamo')?.scrollIntoView({ behavior: 'smooth' });

  return (
    <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden bg-white">
      <div className="absolute inset-0">
        <div aria-hidden="true" className="w-full h-full opacity-10" style={{ backgroundImage: `url(${heroImage})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(255,255,255,0.6), rgba(255,255,255,0.4), rgba(255,255,255,0.8))' }} />
      </div>
      <EuropeanRing />
      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 pt-28 pb-20 w-full pointer-events-none">
        <div className="max-w-4xl pointer-events-auto">
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="font-mono text-[12px] uppercase tracking-[0.4em] mb-8" style={{ color: '#1a4fc4', fontFamily: "'JetBrains Mono', monospace" }}>
            {t.label}
          </motion.p>
          <div className="space-y-1">
            {[t.title1, t.title2].map((line, i) => (
              <motion.h1 key={i} initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + i * 0.15, duration: 0.8 }}
                className="font-heading font-extrabold leading-[0.95] tracking-tight"
                style={{ fontSize: 'clamp(2.25rem, 6vw, 5.25rem)', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                {line}
              </motion.h1>
            ))}
            <motion.h1 initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7, duration: 0.8 }}
              className="font-heading font-extrabold leading-[0.95] tracking-tight shimmer-once"
              style={{ fontSize: 'clamp(2.25rem, 6vw, 5.25rem)', fontFamily: "'Plus Jakarta Sans', sans-serif", paddingBottom: '0.14em', paddingRight: '0.12em', marginBottom: '-0.14em', display: 'inline-block' }}>
              {t.title3}
            </motion.h1>
          </div>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1 }}
            className="mt-10 text-lg leading-relaxed max-w-xl" style={{ color: '#6b7280' }}>
            {t.subtitle}
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.2 }}
            className="mt-10 flex flex-wrap gap-4">
            <Link to="/contatti?motivo=socio"
              className="btn-glow inline-block px-16 py-4 font-heading font-bold text-sm tracking-wide rounded-full text-white shadow-md"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              {t.cta2}
            </Link>
          </motion.div>
        </div>
      </div>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2">
        <button onClick={scrollToAbout} className="animate-scroll-bounce">
          <ChevronDown className="w-6 h-6" style={{ color: '#1a4fc4' }} />
        </button>
      </motion.div>
    </section>
  );
}
