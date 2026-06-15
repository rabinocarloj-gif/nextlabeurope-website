import React from 'react';
import { motion } from 'framer-motion';

const translations = {
  it: {
    label: '01 / CHI SIAMO',
    title: "Una nuova generazione per l'",
    titleAccent: 'Europa.',
    description: "nextlab EUROPE nasce dalla convinzione che il futuro dell'Europa si costruisce dal basso, attraverso giovani leader che combinano spirito imprenditoriale, formazione continua e un profondo senso di appartenenza ai valori europei.",
    pillars: [
      { num: '01', title: 'Imprenditoria', desc: "Promuoviamo l'innovazione e lo spirito imprenditoriale come motore di cambiamento sociale ed economico." },
      { num: '02', title: 'Formazione', desc: "Investiamo nella crescita personale e professionale attraverso programmi educativi d'eccellenza." },
      { num: '03', title: 'Valori Europei', desc: 'Rafforziamo il senso di cittadinanza europea, la democrazia, e la cooperazione tra popoli.' },
    ],
  },
  en: {
    label: '01 / ABOUT US',
    title: 'A new generation for ',
    titleAccent: 'Europe.',
    description: "nextlab EUROPE was born from the conviction that Europe's future is built from the ground up, through young leaders who combine entrepreneurial spirit, continuous learning, and a deep sense of European values.",
    pillars: [
      { num: '01', title: 'Entrepreneurship', desc: 'We promote innovation and entrepreneurial spirit as engines of social and economic change.' },
      { num: '02', title: 'Education', desc: 'We invest in personal and professional growth through excellence-driven educational programs.' },
      { num: '03', title: 'European Values', desc: 'We strengthen European citizenship, democracy, and cooperation among peoples.' },
    ],
  },
};

export default function AboutSection({ lang, aboutImage }) {
  const t = translations[lang];
  return (
    <section id="chi-siamo" className="py-32 lg:py-44 bg-white">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 lg:gap-32">
          <div>
            <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
              className="font-mono text-[10px] uppercase tracking-[0.4em] mb-8" style={{ color: '#1a4fc4', fontFamily: "'JetBrains Mono', monospace" }}>
              {t.label}
            </motion.p>
            <motion.h2 initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              className="font-heading font-extrabold text-4xl lg:text-5xl leading-tight mb-8"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              {t.title}<span className="text-blue-gradient">{t.titleAccent}</span>
            </motion.h2>
            <motion.p initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              transition={{ delay: 0.2 }} className="text-lg leading-relaxed" style={{ color: '#6b7280' }}>
              {t.description}
            </motion.p>
            <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
              transition={{ delay: 0.4 }} className="mt-10 rounded-xl overflow-hidden shadow-sm">
              <img src={aboutImage} alt="Team" className="w-full h-64 object-cover" />
            </motion.div>
          </div>
          <div className="space-y-0">
            {t.pillars.map((pillar, i) => (
              <motion.div key={pillar.num} initial={{ opacity: 0, x: 40 }} whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.15 }}
                className="relative group py-10 first:pt-0" style={{ borderBottom: '1px solid #f3f4f6' }}>
                <span className="absolute -right-2 top-1/2 -translate-y-1/2 font-heading font-extrabold leading-none select-none pointer-events-none transition-all duration-700"
                  style={{ fontSize: '8rem', color: '#f3f4f6', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                  {pillar.num}
                </span>
                <div className="relative z-10">
                  <p className="font-mono text-[10px] uppercase tracking-[0.4em] mb-3" style={{ color: '#1a4fc4', fontFamily: "'JetBrains Mono', monospace" }}>
                    {pillar.num} / {lang === 'it' ? 'Pilastro' : 'Pillar'}
                  </p>
                  <h3 className="font-heading font-bold text-2xl mb-3" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{pillar.title}</h3>
                  <p className="leading-relaxed text-sm" style={{ color: '#6b7280' }}>{pillar.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
