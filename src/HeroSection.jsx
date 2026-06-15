import React from 'react';
import { motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { Link } from 'react-router-dom';

const LOGO_URL = "https://media.base44.com/images/public/6a22d208947a03fa34e3238c/9830c8abc_WhatsApp_Image_2026-04-19_at_184059-removebg-preview.png";

const translations = {
  it: {
    label: 'nextlab EUROPE APS',
    title1: 'Costruiamo il futuro',
    title2: "dell'Europa,",
    title3: 'insieme.',
    subtitle: "nextlab EUROPE è un'associazione di giovani leader che promuove imprenditoria, formazione e valori europei per costruire una nuova generazione di cittadini attivi.",
    cta1: 'Scopri di più',
    cta2: 'Unisciti a noi',
  },
  en: {
    label: 'nextlab EUROPE APS',
    title1: 'Building the future',
    title2: 'of Europe,',
    title3: 'together.',
    subtitle: 'nextlab EUROPE is an association of young leaders promoting entrepreneurship, education, and European values to build a new generation of active citizens.',
    cta1: 'Learn more',
    cta2: 'Join us',
  },
};

export default function HeroSection({ lang, heroImage }) {
  const t = translations[lang];
  const scrollToAbout = () => document.getElementById('chi-siamo')?.scrollIntoView({ behavior: 'smooth' });

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-white">
      <div className="absolute inset-0">
        <img src={heroImage} alt="" className="w-full h-full object-cover opacity-10" />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(255,255,255,0.6), rgba(255,255,255,0.4), rgba(255,255,255,0.8))' }} />
      </div>
      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 pt-36 pb-20 w-full">
        <div className="max-w-4xl">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-10">
            <img src={LOGO_URL} alt="nextlab EUROPE" className="h-40 w-auto object-contain" />
          </motion.div>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="font-mono text-[10px] uppercase tracking-[0.4em] mb-8" style={{ color: '#1a4fc4', fontFamily: "'JetBrains Mono', monospace" }}>
            {t.label}
          </motion.p>
          <div className="space-y-1">
            {[t.title1, t.title2].map((line, i) => (
              <motion.h1 key={i} initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + i * 0.15, duration: 0.8 }}
                className="font-heading font-extrabold leading-[0.95] tracking-tight"
                style={{ fontSize: 'clamp(2.5rem, 7vw, 6rem)', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                {line}
              </motion.h1>
            ))}
            <motion.h1 initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7, duration: 0.8 }}
              className="font-heading font-extrabold leading-[0.95] tracking-tight text-blue-gradient"
              style={{ fontSize: 'clamp(2.5rem, 7vw, 6rem)', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              {t.title3}
            </motion.h1>
          </div>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1 }}
            className="mt-10 text-lg leading-relaxed max-w-xl" style={{ color: '#6b7280' }}>
            {t.subtitle}
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.2 }}
            className="mt-10 flex flex-wrap gap-4">
            <button onClick={scrollToAbout}
              className="px-8 py-4 font-heading font-bold text-sm tracking-wide rounded-full text-white transition-all duration-300 shadow-md"
              style={{ backgroundColor: '#1a4fc4', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              {t.cta1}
            </button>
            <Link to="/contatti"
              className="px-8 py-4 border-2 font-heading font-bold text-sm tracking-wide rounded-full transition-all duration-300"
              style={{ borderColor: '#1a4fc4', color: '#1a4fc4', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
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
