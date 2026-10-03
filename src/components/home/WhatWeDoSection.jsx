import React, { useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Rocket, GraduationCap, Globe, BookOpen, UserRound, Brain, Lightbulb } from 'lucide-react';

const ICON_STYLE = { color: '#1a4fc4' };
const reduceMotion = () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Razzo: si carica, decolla fuori dallo schermo e lascia un po' di cenere nella casella
function RocketIcon({ trigger }) {
  const ref = useRef(null);
  const [phase, setPhase] = useState('idle'); // idle | charge | gone | back
  const [flight, setFlight] = useState(null);
  const [ash, setAsh] = useState([]);
  const busy = useRef(false);
  const timers = useRef([]);
  React.useEffect(() => () => timers.current.forEach(clearTimeout), []);

  React.useEffect(() => {
    if (!trigger || busy.current || reduceMotion()) return;
    busy.current = true;
    setPhase('charge');
    timers.current = [];
    const t1 = setTimeout(() => {
      const r = ref.current?.getBoundingClientRect();
      if (r) setFlight({ x: r.left, y: r.top, w: r.width, h: r.height, id: Date.now() });
      setAsh(Array.from({ length: 12 }, (_, i) => ({ id: `${Date.now()}-${i}`, left: 35 + Math.random() * 30, top: 55 + Math.random() * 20, dx: `${(Math.random() - 0.5) * 14}px`, delay: Math.random() * 0.4 })));
      setPhase('gone');
    }, 900);
    const t2 = setTimeout(() => { setFlight(null); setPhase('back'); }, 3600);
    const t3 = setTimeout(() => { setAsh([]); setPhase('idle'); busy.current = false; }, 4300);
    timers.current.push(t1, t2, t3);
  }, [trigger]);

  return (
    <span className="relative w-5 h-5 inline-flex">
      <span ref={ref} className={`inline-flex ${phase === 'charge' ? 'rocket-charging' : ''} ${phase === 'back' ? 'rocket-return' : ''}`}
        style={{ opacity: phase === 'gone' ? 0 : 1 }}>
        <Rocket className="w-5 h-5" style={ICON_STYLE} />
      </span>
      {ash.map((a) => (
        <span key={a.id} className="ash" style={{ left: `${a.left}%`, top: `${a.top}%`, '--dx': a.dx, animationDelay: `${a.delay}s` }} />
      ))}
      {flight && createPortal(<FlyingRocket key={flight.id} {...flight} />, document.body)}
    </span>
  );
}

function FlyingRocket({ x, y, w, h }) {
  const el = useRef(null);
  React.useLayoutEffect(() => {
    const dx = window.innerWidth - x + 120, dy = -(y + 160);
    el.current?.animate(
      [
        { transform: 'translate(0,0) scale(1)', opacity: 1 },
        { transform: `translate(${dx * 0.15}px, ${dy * 0.15}px) scale(1.15)`, opacity: 1, offset: 0.25 },
        { transform: `translate(${dx}px, ${dy}px) scale(2.2)`, opacity: 1 },
      ],
      { duration: 1300, easing: 'cubic-bezier(0.5, 0, 0.85, 0.35)', fill: 'forwards' }
    );
  }, [x, y]);
  return (
    <span ref={el} aria-hidden="true" style={{ position: 'fixed', left: x, top: y, width: w, height: h, zIndex: 60, pointerEvents: 'none' }}>
      <span style={{ position: 'absolute', left: -6, bottom: -6, width: 10, height: 10, borderRadius: 9999, background: 'radial-gradient(circle, #fff3c4 0%, #ffb547 45%, rgba(255,120,40,0) 75%)', filter: 'blur(1px)' }} />
      <Rocket className="w-5 h-5" style={ICON_STYLE} />
    </span>
  );
}

// Formazione: cappello -> libro -> cervello -> idea luminosa -> di nuovo cappello
const EDU_STEPS = [
  { Icon: GraduationCap, color: '#1a4fc4' },
  { Icon: BookOpen, color: '#1a4fc4' },
  { Icon: Brain, color: '#1a4fc4' },
  { Icon: Lightbulb, color: '#e0a91e', glow: true },
];

function CycleIcon({ step, steps, spin }) {
  const { Icon, color, glow } = steps[step % steps.length];
  const motionProps = spin
    ? { initial: { rotate: -200, scale: 0.4, opacity: 0 }, animate: { rotate: 0, scale: 1, opacity: 1 }, exit: { rotate: 360, scale: 0.4, opacity: 0 }, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } }
    : { initial: { rotateY: -90, opacity: 0 }, animate: { rotateY: 0, opacity: 1 }, exit: { rotateY: 90, opacity: 0 }, transition: { duration: 0.35, ease: 'easeInOut' } };
  return (
    <span className="relative w-5 h-5 inline-flex" style={{ perspective: 200 }}>
      <AnimatePresence mode="wait" initial={false}>
        <motion.span key={step} className="absolute inset-0 inline-flex" {...motionProps}>
          <Icon className={`w-5 h-5 ${glow ? 'bulb-on' : ''}`} style={{ color }} />
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

const CIVIC_STEPS = [{ Icon: Globe, color: '#1a4fc4' }, { Icon: UserRound, color: '#1a4fc4' }];

function MissionCard({ card, i }) {
  const [hovers, setHovers] = useState(0);
  return (
    <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }} transition={{ delay: i * 0.15 }}
      onMouseEnter={() => setHovers((h) => h + 1)}
      className="card-glow group bg-white p-10 rounded-2xl transition-all duration-500 cursor-default hover:-translate-y-1.5 hover:shadow-[0_24px_50px_-30px_rgba(26,79,196,0.4)]"
      style={{ border: '1px solid #f3f4f6' }}>
      <div className="mb-8">
        <div className="relative w-12 h-12 flex items-center justify-center rounded-xl transition-all duration-300 group-hover:shadow-[0_8px_20px_-10px_rgba(26,79,196,0.6)]"
          style={{ backgroundColor: 'rgba(26,79,196,0.08)' }}>
          {card.kind === 'rocket' && <RocketIcon trigger={hovers} />}
          {card.kind === 'edu' && <CycleIcon step={hovers} steps={EDU_STEPS} />}
          {card.kind === 'civic' && <CycleIcon step={hovers} steps={CIVIC_STEPS} spin />}
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
