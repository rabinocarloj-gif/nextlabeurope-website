import React, { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Rocket, GraduationCap, Globe, BookOpen, UserRound, Brain, Lightbulb } from 'lucide-react';

const ICON_STYLE = { color: '#1a4fc4' };
const reduceMotion = () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Razzo: si carica e decolla dentro la casella, con tanto fuoco e fumo. Una sola volta per caricamento.
let rocketLaunched = false;

function RocketIcon({ trigger }) {
  const [phase, setPhase] = useState('idle'); // idle | charge | fly | back
  const [ash, setAsh] = useState([]);
  const timers = useRef([]);
  React.useEffect(() => () => timers.current.forEach(clearTimeout), []);

  React.useEffect(() => {
    if (!trigger || rocketLaunched || reduceMotion()) return;
    rocketLaunched = true;
    setPhase('charge');
    timers.current.push(setTimeout(() => {
      setPhase('fly');
      setAsh(Array.from({ length: 10 }, (_, i) => ({ id: `${Date.now()}-${i}`, left: 25 + Math.random() * 50, top: 60 + Math.random() * 25, dx: `${(Math.random() - 0.5) * 12}px`, delay: 0.5 + Math.random() * 0.8 })));
    }, 1100));
  }, [trigger]);

  return (
    <>
      {phase === 'fly' && <BoxFlight onDone={() => { setPhase('back'); timers.current.push(setTimeout(() => { setAsh([]); setPhase('idle'); }, 900)); }} />}
      <span className={`relative inline-flex ${phase === 'charge' ? 'rocket-charging' : ''} ${phase === 'back' ? 'rocket-return' : ''}`}
        style={{ opacity: phase === 'fly' ? 0 : 1 }}>
        <Rocket className="w-5 h-5" style={ICON_STYLE} />
      </span>
      {ash.map((a) => (
        <span key={a.id} className="ash" style={{ left: `${a.left}%`, top: `${a.top}%`, '--dx': a.dx, animationDelay: `${a.delay}s` }} />
      ))}
    </>
  );
}

// Decollo dentro la casella: canvas con fiamma, fumo e razzo che esce dall'angolo
function BoxFlight({ onDone }) {
  const canvasRef = useRef(null);
  React.useEffect(() => {
    const canvas = canvasRef.current; const box = canvas.parentElement;
    const W = box.clientWidth, H = box.clientHeight;
    const dpr = Math.min(3, window.devicePixelRatio || 1);
    canvas.width = W * dpr; canvas.height = H * dpr;
    const ctx = canvas.getContext('2d'); ctx.scale(dpr, dpr);
    const svg = new Image();
    svg.src = 'data:image/svg+xml;utf8,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#1a4fc4" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/></svg>');
    const sx = W / 2, sy = H / 2, ex = W + 18, ey = -18;
    const FLY = 900, TOTAL = 3400;
    const smoke = []; const sparks = [];
    const t0 = performance.now(); let last = t0, raf;
    const frame = (now) => {
      const el = now - t0, dt = Math.min(0.05, (now - last) / 1000); last = now;
      ctx.clearRect(0, 0, W, H);
      const t = Math.min(1, el / FLY), k = t * t;
      const flying = el < FLY + 60;
      const px = sx + (ex - sx) * k, py = sy + (ey - sy) * k;
      const ang = -Math.PI / 4;
      // tail position (rocket points up-right, tail down-left)
      const tx = px - 8, ty = py + 8;
      if (flying) {
        for (let i = 0; i < 5; i++) smoke.push({ x: tx + (Math.random() - 0.5) * 4, y: ty + (Math.random() - 0.5) * 4, vx: -20 - Math.random() * 30, vy: 20 + Math.random() * 30, r: 2 + Math.random() * 3, grow: 14 + Math.random() * 14, life: 0, max: 1.4 + Math.random() * 1.4 });
        for (let i = 0; i < 3; i++) sparks.push({ x: tx, y: ty, vx: -30 - Math.random() * 60 + (Math.random() - 0.5) * 30, vy: 30 + Math.random() * 60, life: 0, max: 0.25 + Math.random() * 0.3 });
      }
      for (let i = smoke.length - 1; i >= 0; i--) {
        const p = smoke[i]; p.life += dt; if (p.life > p.max) { smoke.splice(i, 1); continue; }
        p.x += p.vx * dt; p.y += p.vy * dt; p.vx *= 0.94; p.vy = p.vy * 0.94 - 10 * dt; p.r += p.grow * dt;
        const a = 0.55 * (1 - p.life / p.max);
        const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r);
        g.addColorStop(0, `rgba(170,178,192,${a})`); g.addColorStop(1, 'rgba(170,178,192,0)');
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill();
      }
      for (let i = sparks.length - 1; i >= 0; i--) {
        const p = sparks[i]; p.life += dt; if (p.life > p.max) { sparks.splice(i, 1); continue; }
        p.x += p.vx * dt; p.y += p.vy * dt;
        ctx.fillStyle = `rgba(255,${150 + Math.random() * 80 | 0},60,${1 - p.life / p.max})`; ctx.fillRect(p.x, p.y, 1.6, 1.6);
      }
      if (flying) {
        const flick = 0.8 + Math.random() * 0.4, len = 22 * flick;
        ctx.save(); ctx.translate(tx, ty); ctx.rotate(ang + Math.PI);
        const fg = ctx.createRadialGradient(0, 0, 0, len * 0.3, 0, len);
        fg.addColorStop(0, 'rgba(255,255,235,1)'); fg.addColorStop(0.25, 'rgba(255,220,110,0.95)'); fg.addColorStop(0.6, 'rgba(255,130,40,0.75)'); fg.addColorStop(1, 'rgba(255,70,20,0)');
        ctx.fillStyle = fg; ctx.beginPath(); ctx.ellipse(len * 0.4, 0, len * 0.7, 5.5 * flick, 0, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
        const glow = ctx.createRadialGradient(tx, ty, 0, tx, ty, 16);
        glow.addColorStop(0, 'rgba(255,190,90,0.55)'); glow.addColorStop(1, 'rgba(255,190,90,0)');
        ctx.fillStyle = glow; ctx.beginPath(); ctx.arc(tx, ty, 16, 0, Math.PI * 2); ctx.fill();
        if (svg.complete) ctx.drawImage(svg, px - 10, py - 10, 20, 20);
      }
      if (el < TOTAL || smoke.length) raf = requestAnimationFrame(frame); else onDone();
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, []);
  return <canvas ref={canvasRef} aria-hidden="true" className="absolute inset-0 w-full h-full pointer-events-none" />;
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
  // l'omino della home "preme" l'icona: stesso effetto del passaggio del mouse
  React.useEffect(() => {
    const onBuddy = (e) => { if (e.detail === i) setHovers((h) => h + 1); };
    window.addEventListener('buddy:mission', onBuddy);
    return () => window.removeEventListener('buddy:mission', onBuddy);
  }, [i]);
  return (
    <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }} transition={{ delay: i * 0.15 }}
      onMouseEnter={() => setHovers((h) => h + 1)} data-buddy={`mission-${i}`}
      className="card-glow group bg-white p-10 rounded-2xl transition-all duration-500 cursor-default hover:-translate-y-1.5 hover:shadow-[0_24px_50px_-30px_rgba(26,79,196,0.4)]"
      style={{ border: '1px solid #f3f4f6' }}>
      <div className="mb-8">
        <div data-buddy={`mission-icon-${i}`} className="relative w-12 h-12 flex items-center justify-center rounded-xl overflow-hidden transition-all duration-300 group-hover:shadow-[0_8px_20px_-10px_rgba(26,79,196,0.6)]"
          style={{ backgroundColor: 'rgba(26,79,196,0.08)' }}>
          {card.kind === 'rocket' && <RocketIcon trigger={hovers} />}
          {card.kind === 'edu' && <CycleIcon step={hovers} steps={EDU_STEPS} />}
          {card.kind === 'civic' && <CycleIcon step={hovers} steps={CIVIC_STEPS} spin />}
        </div>
      </div>
      <h3 data-buddy={`mission-title-${i}`} className="font-heading font-extrabold italic text-xl mb-4 transition-colors duration-500 group-hover:text-[#1a4fc4]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: '#0F0F0F' }}>
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
