import React from 'react';
import { motion } from 'framer-motion';
import { Rocket, GraduationCap, Globe } from 'lucide-react';

const translations = {
  it: {
    label: '02 / COSA FACCIAMO',
    title: 'Tre missioni, un ',
    titleAccent: 'obiettivo.',
    cards: [
      { icon: Rocket, title: 'Imprenditoria', desc: 'Supportiamo giovani imprenditori con mentorship, networking e accesso a risorse per trasformare idee in imprese che generano impatto.' },
      { icon: GraduationCap, title: 'Formazione', desc: "Organizziamo workshop e formazioni volte all'orientamento sui valori europei, sul mondo del lavoro e sullo sviluppo personale." },
      { icon: Globe, title: 'Impegno Civico', desc: 'Promuoviamo e realizziamo direttamente progetti di impegno civico a sostegno della società e delle popolazioni più sensibili.' },
    ],
  },
  en: {
    label: '02 / WHAT WE DO',
    title: 'Three missions, one ',
    titleAccent: 'goal.',
    cards: [
      { icon: Rocket, title: 'Entrepreneurship', desc: 'We support young entrepreneurs with mentorship, networking, and access to resources to turn ideas into impactful businesses.' },
      { icon: GraduationCap, title: 'Education', desc: 'We organize workshops and training sessions focused on European values, the world of work, and personal development.' },
      { icon: Globe, title: 'Civic Engagement', desc: 'We directly promote and carry out civic engagement projects in support of society and the most vulnerable populations.' },
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
          {t.cards.map((card, i) => {
            const Icon = card.icon;
            return (
              <motion.div key={card.title} initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.15 }}
                className="group bg-white p-10 rounded-2xl transition-all duration-500 cursor-default"
                style={{ border: '1px solid #f3f4f6' }}>
                <div className="mb-8">
                  <div className="w-12 h-12 flex items-center justify-center rounded-xl transition-all duration-300"
                    style={{ backgroundColor: 'rgba(26,79,196,0.08)' }}>
                    <Icon className="w-5 h-5" style={{ color: '#1a4fc4' }} />
                  </div>
                </div>
                <h3 className="font-heading font-extrabold italic text-xl mb-4" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: '#0F0F0F' }}>
                  {card.title}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: '#6b7280' }}>{card.desc}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
