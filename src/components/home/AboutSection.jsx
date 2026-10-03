import React, { useRef } from 'react';
import { motion } from 'framer-motion';

const team = [
  {
    name: 'Carlo Juan Rabino',
    role: { it: 'Presidente', en: 'President' },
    bio: {
      it: 'Laureato in Economia e Management e laureato magistrale in Entrepreneurship and Innovation presso la Libera Università di Bolzano.',
      en: "Bachelor's degree in Economics and Management and Master's degree in Entrepreneurship and Innovation, Free University of Bozen-Bolzano.",
    },
  },
  {
    name: 'Chiara Foschi',
    role: { it: 'Vicepresidente', en: 'Vice President' },
    bio: {
      it: 'Laureata triennale in Economia Politica ed Etica presso Unibz, oggi studentessa magistrale in International Economic Policy a Sciences Po Parigi.',
      en: "Bachelor's degree in Political Economy and Ethics from Unibz, currently a Master's student in International Economic Policy at Sciences Po Paris.",
    },
  },
  {
    name: 'Igino Poggiali',
    role: { it: 'Segretario Generale', en: 'Secretary General' },
    bio: {
      it: "Per oltre trent'anni Direttore di biblioteche e responsabile dei servizi culturali e sociali del Comune di Lugo. Oggi attivo nella consulenza aziendale e nell'innovazione, con focus sullo scouting di giovani talenti.",
      en: 'For over thirty years Library Director and head of cultural and social services for the Municipality of Lugo. Now active in business consulting and innovation, with a focus on scouting young talent.',
    },
  },
];

// Icone a linea dei tre pilastri
const PILLAR_ICONS = [
  // Imprenditoria: razzo/crescita
  <path key="a" d="M4 16l5-5 4 4 7-7M14 8h6v6" />,
  // Formazione: libro aperto
  <path key="b" d="M3 6.5C5.5 5 8.5 5 12 7c3.5-2 6.5-2 9-.5V19c-2.5-1.5-5.5-1.5-9 .5-3.5-2-6.5-2-9-.5zM12 7v12.5" />,
  // Valori europei: stella
  <path key="c" d="M12 3.5l2.6 5.3 5.9.9-4.25 4.1 1 5.8L12 16.9l-5.25 2.7 1-5.8L3.5 9.7l5.9-.9z" />,
];

function initials(name) {
  return name.split(' ').filter(Boolean).map((w) => w[0]).slice(0, 2).join('');
}

const translations = {
  it: {
    label: '01 / CHI SIAMO',
    title: "Una nuova generazione per l'",
    titleAccent: 'Europa.',
    description: "Next Lab Europe nasce dalla convinzione che il futuro dell'Europa si costruisca valorizzando le nuove generazioni: giovani che uniscono spirito imprenditoriale, formazione continua e un profondo senso di appartenenza ai valori europei. Il nostro obiettivo è far emergere questi talenti e accompagnarli nella loro crescita, perché possano restare e generare valore nei territori da cui partono, invece di doverli lasciare.",
    pillars: [
      { num: '01', title: 'Imprenditoria', desc: "Promuoviamo l'innovazione e lo spirito imprenditoriale come motore di cambiamento sociale ed economico." },
      { num: '02', title: 'Formazione', desc: "Investiamo nella crescita personale e professionale attraverso programmi educativi d'eccellenza." },
      { num: '03', title: 'Valori Europei', desc: 'Rafforziamo il senso di cittadinanza europea, la democrazia, e la cooperazione tra popoli.' },
    ],
    govLabel: 'IL DIRETTIVO',
    govTitle: 'Chi guida Next Lab Europe.',
  },
  en: {
    label: '01 / ABOUT US',
    title: 'A new generation for ',
    titleAccent: 'Europe.',
    description: "Next Lab Europe was born from the conviction that Europe's future is built by empowering new generations: young people who combine entrepreneurial spirit, continuous learning and a deep sense of belonging to European values. Our goal is to bring out these talents and support their growth, so that they can stay and create value in the places they come from, instead of having to leave them.",
    pillars: [
      { num: '01', title: 'Entrepreneurship', desc: 'We promote innovation and entrepreneurial spirit as engines of social and economic change.' },
      { num: '02', title: 'Education', desc: 'We invest in personal and professional growth through excellence-driven educational programs.' },
      { num: '03', title: 'European Values', desc: 'We strengthen European citizenship, democracy, and cooperation among peoples.' },
    ],
    govLabel: 'THE BOARD',
    govTitle: 'Who leads Next Lab Europe.',
  },
};

export default function AboutSection({ lang, aboutImage }) {
  const t = translations[lang];
  const scrollerRef = useRef(null);

  const scrollByCard = (dir) => {
    if (!scrollerRef.current) return;
    scrollerRef.current.scrollBy({ left: dir * 340, behavior: 'smooth' });
  };

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
                className="relative group py-9 first:pt-0 flex gap-6 items-start" style={{ borderBottom: '1px solid #ececf1' }}>
                <div className="relative shrink-0 w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500 group-hover:-translate-y-1"
                  style={{ background: 'linear-gradient(140deg, #eff4ff 0%, #ffffff 100%)', border: '1px solid rgba(26,79,196,0.14)', boxShadow: '0 10px 24px -14px rgba(26,79,196,0.45)' }}>
                  <span aria-hidden="true" className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    style={{ background: 'linear-gradient(140deg, #1a4fc4 0%, #4a90e2 100%)' }} />
                  <svg viewBox="0 0 24 24" width="24" height="24" fill="none" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"
                    className="relative transition-colors duration-500 stroke-[#1a4fc4] group-hover:stroke-white">
                    {PILLAR_ICONS[i]}
                  </svg>
                </div>
                <div className="relative z-10 pt-1">
                  <p className="font-mono text-[10px] uppercase tracking-[0.4em] mb-2" style={{ color: '#1a4fc4', fontFamily: "'JetBrains Mono', monospace" }}>
                    {pillar.num} / {lang === 'it' ? 'Pilastro' : 'Pillar'}
                  </p>
                  <h3 className="font-heading font-bold text-2xl mb-2 transition-colors duration-500 group-hover:text-[#1a4fc4]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{pillar.title}</h3>
                  <p className="leading-relaxed text-sm" style={{ color: '#6b7280' }}>{pillar.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Governance carousel */}
        <div className="mt-28 lg:mt-36">
          <div className="flex items-end justify-between mb-10 flex-wrap gap-4">
            <div>
              <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
                className="font-mono text-[10px] uppercase tracking-[0.4em] mb-4" style={{ color: '#1a4fc4', fontFamily: "'JetBrains Mono', monospace" }}>
                {t.govLabel}
              </motion.p>
              <motion.h3 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                className="font-heading font-extrabold text-3xl lg:text-4xl" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                {t.govTitle}
              </motion.h3>
            </div>
          </div>

          <div ref={scrollerRef}
            className="flex gap-6 overflow-x-auto pt-2 pb-6 -mx-6 px-6 lg:mx-0 lg:px-0"
            style={{ scrollSnapType: 'x mandatory', scrollbarWidth: 'none' }}>
            {team.map((person, i) => (
              <motion.div key={person.name} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.12, duration: 0.6 }}
                className="card-glow group relative shrink-0 w-[300px] lg:w-[340px] p-8 rounded-3xl bg-white overflow-hidden transition-all duration-500 hover:-translate-y-1.5"
                style={{ border: '1px solid #ececf1', scrollSnapAlign: 'start', boxShadow: '0 1px 2px rgba(15,15,15,0.03)' }}>
                <span aria-hidden="true" className="absolute -top-20 -right-20 w-48 h-48 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700"
                  style={{ background: 'radial-gradient(circle, rgba(74,144,226,0.18) 0%, rgba(74,144,226,0) 70%)' }} />
                <div className="relative flex items-center gap-4 mb-6">
                  <div className="w-14 h-14 rounded-full flex items-center justify-center font-heading font-bold text-white text-lg transition-transform duration-500 group-hover:scale-105"
                    style={{ background: 'linear-gradient(140deg, #1a4fc4 0%, #4a90e2 100%)', boxShadow: '0 10px 22px -10px rgba(26,79,196,0.7)', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                    {initials(person.name)}
                  </div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.3em] leading-relaxed" style={{ color: '#1a4fc4', fontFamily: "'JetBrains Mono', monospace" }}>
                    {person.role[lang]}
                  </p>
                </div>
                <h4 className="relative font-heading font-bold text-xl mb-3" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                  {person.name}
                </h4>
                <span aria-hidden="true" className="relative block h-px w-10 mb-4 transition-all duration-500 group-hover:w-24"
                  style={{ background: 'linear-gradient(to right, #1a4fc4, rgba(74,144,226,0))' }} />
                <p className="relative leading-relaxed text-sm" style={{ color: '#6b7280' }}>
                  {person.bio[lang]}
                </p>
              </motion.div>
            ))}
          </div>
          <div className="flex justify-center gap-3 mt-8">
            <button onClick={() => scrollByCard(-1)} aria-label="Previous"
              className="w-11 h-11 rounded-full flex items-center justify-center bg-white transition-all duration-300 hover:text-white hover:bg-[#1a4fc4] hover:border-[#1a4fc4] hover:shadow-[0_8px_20px_-8px_rgba(26,79,196,0.6)]"
              style={{ border: '1.5px solid #e5e7eb' }}>‹</button>
            <button onClick={() => scrollByCard(1)} aria-label="Next"
              className="w-11 h-11 rounded-full flex items-center justify-center bg-white transition-all duration-300 hover:text-white hover:bg-[#1a4fc4] hover:border-[#1a4fc4] hover:shadow-[0_8px_20px_-8px_rgba(26,79,196,0.6)]"
              style={{ border: '1.5px solid #e5e7eb' }}>›</button>
          </div>
        </div>
      </div>
    </section>
  );
}
