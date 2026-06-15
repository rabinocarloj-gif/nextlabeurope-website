import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const translations = {
  it: {
    label: '03 / PROGRAMMI',
    title: 'I nostri ',
    titleAccent: 'programmi.',
    soon: 'Presto disponibile',
    desc: 'Stiamo lavorando a nuovi programmi e iniziative per giovani tra i 15 e i 30 anni. Registrati per essere tra i primi a saperlo.',
    cta: 'Tienimi aggiornato',
  },
  en: {
    label: '03 / PROGRAMS',
    title: 'Our ',
    titleAccent: 'programs.',
    soon: 'Coming soon',
    desc: 'We are working on new programs and initiatives for young people aged 15 to 30. Sign up to be among the first to know.',
    cta: 'Keep me updated',
  },
};

export default function ProgramsSection({ lang }) {
  const t = translations[lang];
  return (
    <section id="progetti" className="py-32 lg:py-44 bg-white">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
          className="font-mono text-[10px] uppercase tracking-[0.4em] mb-8" style={{ color: '#1a4fc4', fontFamily: "'JetBrains Mono', monospace" }}>
          {t.label}
        </motion.p>
        <motion.h2 initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="font-heading font-extrabold text-4xl lg:text-5xl leading-tight mb-20"
          style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
          {t.title}<span className="text-blue-gradient">{t.titleAccent}</span>
        </motion.h2>
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="text-center py-20 px-10 rounded-2xl max-w-2xl mx-auto"
          style={{ border: '2px dashed #e5e7eb' }}>
          <p className="font-mono text-[10px] uppercase tracking-[0.4em] mb-6" style={{ color: '#1a4fc4', fontFamily: "'JetBrains Mono', monospace" }}>
            {t.soon}
          </p>
          <h3 className="font-heading font-extrabold text-2xl mb-4" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{t.soon}</h3>
          <p className="text-lg leading-relaxed mb-8" style={{ color: '#6b7280' }}>{t.desc}</p>
          <Link to="/contatti"
            className="inline-block px-8 py-4 font-heading font-bold text-sm tracking-wide rounded-full text-white"
            style={{ backgroundColor: '#1a4fc4', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            {t.cta}
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
