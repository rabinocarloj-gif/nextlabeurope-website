import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { motion } from 'framer-motion';

const CONTACT_IMG = 'https://media.base44.com/images/public/6a22d208947a03fa34e3238c/8614fbdfe_generated_c9cdfb85.png';

const translations = {
  it: {
    label: 'CONTATTI',
    title: 'Entra nel nextlab.',
    subtitle: "Che tu voglia proporre un progetto, diventare partner o semplicemente conoscerci meglio — siamo qui.",
    formTitle: 'Scrivici',
    namePlaceholder: 'Nome e Cognome',
    emailPlaceholder: 'La tua email',
    subjectLabel: 'Motivo del contatto',
    subjects: ['Voglio unirmi a nextlab', 'Proposta di collaborazione', 'Informazioni sui programmi', 'Diventare partner', 'Altro'],
    messagePlaceholder: 'Scrivi qui il tuo messaggio...',
    submit: 'Invia messaggio',
    sent: 'Messaggio inviato ✓',
    infoTitle: 'Dove siamo',
    email: 'info@nextlabeurope.eu',
    joinTitle: 'Vuoi far parte di nextlab?',
    joinDesc: 'Siamo alla ricerca di giovani motivati tra i 15 e i 30 anni che vogliano contribuire a costruire qualcosa di significativo per l\'Europa.',
    joinCta: 'Candidati ora',
  },
  en: {
    label: 'CONTACT',
    title: 'Join the nextlab.',
    subtitle: "Whether you want to propose a project, become a partner, or simply get to know us better — we're here.",
    formTitle: 'Write to us',
    namePlaceholder: 'Full name',
    emailPlaceholder: 'Your email',
    subjectLabel: 'Reason for contact',
    subjects: ['I want to join nextlab', 'Partnership proposal', 'Program information', 'Become a partner', 'Other'],
    messagePlaceholder: 'Write your message here...',
    submit: 'Send message',
    sent: 'Message sent ✓',
    infoTitle: 'Where we are',
    email: 'info@nextlabeurope.eu',
    joinTitle: 'Want to be part of nextlab?',
    joinDesc: 'We are looking for motivated young people between 15 and 30 who want to contribute to building something meaningful for Europe.',
    joinCta: 'Apply now',
  },
};

export default function Contatti() {
  const { lang } = useOutletContext();
  const t = translations[lang];
  const [sent, setSent] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSent(true);
  };

  return (
    <>
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0">
          <img src={CONTACT_IMG} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(252,252,252,0.95), rgba(252,252,252,0.9), rgba(252,252,252,1))' }} />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 pt-16">
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="font-mono text-[10px] uppercase tracking-[0.4em] mb-8" style={{ color: '#1a4fc4', fontFamily: "'JetBrains Mono', monospace" }}>
            {t.label}
          </motion.p>
          <motion.h1 initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="font-heading font-extrabold leading-[0.95] tracking-tight mb-6"
            style={{ fontSize: 'clamp(3rem, 8vw, 7rem)', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            {t.title}
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="text-lg leading-relaxed max-w-xl" style={{ color: '#6b7280' }}>
            {t.subtitle}
          </motion.p>
        </div>
      </section>

      <section className="pb-32 lg:pb-44">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 lg:gap-32">
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
              <h2 className="font-heading font-extrabold text-3xl mb-8" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{t.formTitle}</h2>
              <form onSubmit={handleSubmit} className="space-y-5">
                <input type="text" placeholder={t.namePlaceholder} required
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
                  style={{ border: '1.5px solid #e5e7eb', fontFamily: "'Plus Jakarta Sans', sans-serif" }} />
                <input type="email" placeholder={t.emailPlaceholder} required
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
                  style={{ border: '1.5px solid #e5e7eb', fontFamily: "'Plus Jakarta Sans', sans-serif" }} />
                <select className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                  style={{ border: '1.5px solid #e5e7eb', fontFamily: "'Plus Jakarta Sans', sans-serif", color: '#6b7280' }}>
                  {t.subjects.map(s => <option key={s}>{s}</option>)}
                </select>
                <textarea rows={5} placeholder={t.messagePlaceholder} required
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none resize-vertical"
                  style={{ border: '1.5px solid #e5e7eb', fontFamily: "'Plus Jakarta Sans', sans-serif" }} />
                <button type="submit"
                  className="w-full py-4 font-heading font-bold text-sm tracking-wide rounded-full text-white transition-all"
                  style={{ backgroundColor: sent ? '#22c55e' : '#1a4fc4', fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                  disabled={sent}>
                  {sent ? t.sent : t.submit}
                </button>
              </form>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
              <h2 className="font-heading font-extrabold text-3xl mb-8" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{t.infoTitle}</h2>
              <div className="space-y-6 mb-10">
                <div className="flex gap-4">
                  <span className="text-xl" style={{ color: '#1a4fc4' }}>✉</span>
                  <div>
                    <strong className="block text-xs uppercase tracking-widest mb-1" style={{ color: '#9ca3af', fontFamily: "'JetBrains Mono', monospace" }}>Email</strong>
                    <p>{t.email}</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <span className="text-xl" style={{ color: '#1a4fc4' }}>◎</span>
                  <div>
                    <strong className="block text-xs uppercase tracking-widest mb-1" style={{ color: '#9ca3af', fontFamily: "'JetBrains Mono', monospace" }}>
                      {lang === 'it' ? 'Sede' : 'Location'}
                    </strong>
                    <p>Italia</p>
                  </div>
                </div>
              </div>
              <div className="p-7 rounded-2xl" style={{ backgroundColor: '#eff4ff', borderLeft: '4px solid #1a4fc4' }}>
                <h3 className="font-heading font-bold text-xl mb-3" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{t.joinTitle}</h3>
                <p className="text-sm leading-relaxed mb-5" style={{ color: '#6b7280' }}>{t.joinDesc}</p>
                <button className="px-6 py-3 font-heading font-bold text-sm rounded-full text-white"
                  style={{ backgroundColor: '#1a4fc4', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                  {t.joinCta}
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </>
  );
}
