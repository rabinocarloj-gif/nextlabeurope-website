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
        <div className="aurora absolute -top-40 left-[10%] w-[520px] h-[520px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(74,144,226,0.14) 0%, rgba(74,144,226,0) 70%)' }} />
        <div className="aurora absolute -bottom-48 right-[5%] w-[560px] h-[560px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(26,79,196,0.10) 0%, rgba(26,79,196,0) 70%)', animationDelay: '-9s' }} />
        <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(rgba(26,79,196,0.10) 1px, transparent 1px)', backgroundSize: '26px 26px', maskImage: 'radial-gradient(ellipse at center, #000 30%, transparent 75%)', WebkitMaskImage: 'radial-gradient(ellipse at center, #000 30%, transparent 75%)' }} />
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
          {t.note}{' '}
          <Link to="/contatti?motivo=collaborazione" className="text-link font-semibold" style={{ color: '#1a4fc4' }}>{t.cta} →</Link>
        </p>
      </div>
    </section>
  );
}
