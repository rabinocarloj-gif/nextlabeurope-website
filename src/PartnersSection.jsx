import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const translations = {
  it: { label: '04 / PARTNER', title: 'Chi ci ', titleAccent: 'supporta.', note: 'Vuoi diventare partner o sostenitore?', cta: 'Contattaci' },
  en: { label: '04 / PARTNERS', title: 'Who ', titleAccent: 'supports us.', note: 'Want to become a partner or supporter?', cta: 'Contact us' },
};

export default function PartnersSection({ lang }) {
  const t = translations[lang];
  return (
    <section className="py-32 lg:py-44" style={{ backgroundColor: '#f9fafb' }}>
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
          className="font-mono text-[10px] uppercase tracking-[0.4em] mb-8" style={{ color: '#1a4fc4', fontFamily: "'JetBrains Mono', monospace" }}>
          {t.label}
        </motion.p>
        <motion.h2 initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="font-heading font-extrabold text-4xl lg:text-5xl leading-tight mb-16"
          style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
          {t.title}<span className="text-blue-gradient">{t.titleAccent}</span>
        </motion.h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-12">
          {[...Array(6)].map((_, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ delay: i * 0.1 }}
              className="h-20 rounded-xl flex items-center justify-center bg-white"
              style={{ border: '1.5px dashed #e5e7eb' }}>
              <span className="font-mono text-xs uppercase tracking-widest" style={{ color: '#9ca3af' }}>Coming Soon</span>
            </motion.div>
          ))}
        </div>
        <p className="text-center text-sm" style={{ color: '#6b7280' }}>
          {t.note}{' '}
          <Link to="/contatti" className="font-semibold" style={{ color: '#1a4fc4' }}>{t.cta}</Link>
        </p>
      </div>
    </section>
  );
}
