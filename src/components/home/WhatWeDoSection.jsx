import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Rocket, GraduationCap, Globe, BookOpen, UserRound } from 'lucide-react';

const ICON_STYLE = { color: '#1a4fc4' };

// Icone animate al passaggio del mouse
function AnimatedIcon({ kind, flipped }) {
  if (kind === 'rocket') {
    return <Rocket className="mission-rocket w-5 h-5" style={ICON_STYLE} />;
  }
  const [A, B] = kind === 'edu' ? [GraduationCap, BookOpen] : [Globe, UserRound];
  const Current = flipped ? B : A;
  const motionProps = kind === 'edu'
    ? { initial: { rotateY: -90, opacity: 0 }, animate: { rotateY: 0, opacity: 1 }, exit: { rotateY: 90, opacity: 0 }, transition: { duration: 0.35, ease: 'easeInOut' } }
    : { initial: { rotate: -200, scale: 0.4, opacity: 0 }, animate: { rotate: 0, scale: 1, opacity: 1 }, exit: { rotate: 360, scale: 0.4, opacity: 0 }, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } };
  return (
    <span className="relative w-5 h-5 inline-flex" style={{ perspective: 200 }}>
      <AnimatePresence mode="wait" initial={false}>
        <motion.span key={flipped ? 'b' : 'a'} className="absolute inset-0 inline-flex" {...motionProps}>
          <Current className="w-5 h-5" style={ICON_STYLE} />
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

function MissionCard({ card, i }) {
  const [flipped, setFlipped] = useState(false);
  return (
    <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }} transition={{ delay: i * 0.15 }}
      onMouseEnter={() => setFlipped((f) => !f)}
      className="card-glow group bg-white p-10 rounded-2xl transition-all duration-500 cursor-default hover:-translate-y-1.5 hover:shadow-[0_24px_50px_-30px_rgba(26,79,196,0.4)]"
      style={{ border: '1px solid #f3f4f6' }}>
      <div className="mb-8">
        <div className="w-12 h-12 flex items-center justify-center rounded-xl transition-all duration-300 overflow-hidden group-hover:shadow-[0_8px_20px_-10px_rgba(26,79,196,0.6)]"
          style={{ backgroundColor: 'rgba(26,79,196,0.08)' }}>
          <AnimatedIcon kind={card.kind} flipped={flipped} />
        </div>
      </div>
      <h3 className="font-heading font-extrabold italic text-xl mb-4 transition-colors duration-500 group-hover:text-[#1a4fc4]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: '#0F0F0F' }}>
        {card.title}
      </h3>
      <p className="text-sm leading-relaxed" style={{ color: '#6b7280' }}>{card.desc}</p>
    </motion.div>
  );
}

const translations = {
  it: {
    label: '02 / COSA FACCIAMO',
    title: 'Tre missioni, un ',
    titleAccent: 'obiettivo.',
    cards: [
      { kind: 'rocket', title: 'Imprenditoria', desc: 'Supportiamo giovani imprenditori con mentorship, networking e accesso a risorse per trasformare idee in imprese che generano impatto.' },
      { kind: 'edu', title: 'Formazione', desc: "Organizziamo workshop e formazioni volte all'orientamento sui valori europei, sul mondo del lavoro e sullo sviluppo personale." },
      { kind: 'civic', title: 'Impegno Civico', desc: 'Promuoviamo e realizziamo direttamente progetti di impegno civico a sostegno della società e delle popolazioni più sensibili.' },
    ],
  },
  en: {
    label: '02 / WHAT WE DO',
    title: 'Three missions, one ',
    titleAccent: 'goal.',
    cards: [
      { kind: 'rocket', title: 'Entrepreneurship', desc: 'We support young entrepreneurs with mentorship, networking, and access to resources to turn ideas into impactful businesses.' },
      { kind: 'edu', title: 'Education', desc: 'We organize workshops and training sessions focused on European values, the world of work, and personal development.' },
      { kind: 'civic', title: 'Civic Engagement', desc: 'We directly promote and carry out civic engagement projects in support of society and the most vulnerable populations.' },
    ],
  },
};

export default function WhatWeDoSection({ lang }) {
  const t = translations[lang];
  return (
    <section className="py-32 lg:py-16 relative overflow-hidden" style={{ backgroundColor: '#f9fafb' }}>
      <div className="absolute inset-0 lattice-line opacity-60" />
      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8">
        <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
          className="font-mono text-[10px] uppercase tracking-[0.4em] mb-8" style={{ color: '#1a4fc4', fontFamily: "'JetBrains Mono', monospace" }}>
          {t.label}
        </motion.p>
        <motion.h2 initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="font-heading font-extrabold text-4xl lg:text-5xl leading-tight mb-20"
          style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
          {t.title}<span className="text-blue-gradient">{t.titleAccent}</span>
        </motion.h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {t.cards.map((card, i) => <MissionCard key={card.title} card={card} i={i} />)}
        </div>
      </div>
    </section>
  );
}
