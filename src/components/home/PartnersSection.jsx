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
    <section className="relative py-32 lg:py-44 overflow-hidden" style={{ backgroundColor: '#f8f9fc' }}>
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="glide-x absolute -top-40 left-[25%] w-[640px] h-[640px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(74,144,226,0.14) 0%, rgba(74,144,226,0) 70%)' }} />
        <div className="glide-x-rev absolute -bottom-48 right-[20%] w-[620px] h-[620px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(26,79,196,0.10) 0%, rgba(26,79,196,0) 70%)', }} />
        <div className="absolute left-0 right-0 bottom-[12%] h-40 opacity-60">
          <svg className="wave-flow h-full" style={{ width: '200%' }} viewBox="0 0 2400 160" preserveAspectRatio="none">
            <path d="M0 80 C 200 20, 400 140, 600 80 S 1000 20, 1200 80 S 1600 140, 1800 80 S 2200 20, 2400 80" fill="none" stroke="rgba(26,79,196,0.14)" strokeWidth="1.2" />
            <path d="M0 100 C 200 50, 400 150, 600 100 S 1000 50, 1200 100 S 1600 150, 1800 100 S 2200 50, 2400 100" fill="none" stroke="rgba(74,144,226,0.12)" strokeWidth="1" />
            <path d="M0 60 C 200 110, 400 10, 600 60 S 1000 110, 1200 60 S 1600 10, 1800 60 S 2200 110, 2400 60" fill="none" stroke="rgba(242,201,76,0.16)" strokeWidth="1" />
          </svg>
        </div>
        <div className="dots-drift absolute inset-0" style={{ backgroundImage: 'radial-gradient(rgba(26,79,196,0.12) 1px, transparent 1px)', backgroundSize: '26px 26px', maskImage: 'radial-gradient(ellipse at center, #000 30%, transparent 75%)', WebkitMaskImage: 'radial-gradient(ellipse at center, #000 30%, transparent 75%)' }} />
      </div>
      <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
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
              viewport={{ once: true }} transition={{ delay: i * 0.08, duration: 0.6 }}
              className="card-glow group relative h-24 rounded-2xl flex items-center justify-center overflow-hidden transition-all duration-500 hover:-translate-y-1"
              style={{ background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)', border: '1px solid rgba(26,79,196,0.10)' }}>
              <span aria-hidden="true" className="absolute inset-y-0 -left-1/2 w-1/2 -skew-x-12 opacity-0 group-hover:opacity-100 group-hover:left-[120%] transition-all duration-1000"
                style={{ background: 'linear-gradient(to right, transparent, rgba(255,255,255,0.9), transparent)' }} />
              <span className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.3em]" style={{ color: '#9aa3b5' }}>
                <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: '#4a90e2' }} />
                Coming Soon
              </span>
            </motion.div>
          ))}
        </div>
        <p className="text-center text-sm" style={{ color: '#6b7280' }}>
          {t.note}
          <Link to="/contatti?motivo=collaborazione" className="text-link font-semibold ml-2" style={{ color: '#1a4fc4' }}>{t.cta}</Link>
        </p>
      </div>
    </section>
  );
}
