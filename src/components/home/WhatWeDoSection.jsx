import React, { useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Rocket, GraduationCap, Globe, BookOpen, UserRound, Brain, Lightbulb } from 'lucide-react';

const ICON_STYLE = { color: '#1a4fc4' };
const reduceMotion = () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Razzo: si carica, decolla con una grande fiamma e lascia una scia di fumo sullo schermo.
// Succede una sola volta per caricamento di pagina.
let rocketLaunched = false;

function RocketIcon({ trigger }) {
  const ref = useRef(null);
  const [phase, setPhase] = useState('idle'); // idle | charge | gone | back
  const [flight, setFlight] = useState(null);
  const [ash, setAsh] = useState([]);
  const timers = useRef([]);
  React.useEffect(() => () => timers.current.forEach(clearTimeout), []);

  React.useEffect(() => {
    if (!trigger || rocketLaunched || reduceMotion()) return;
    rocketLaunched = true;
    setPhase('charge');
    timers.current.push(setTimeout(() => {
      const r = ref.current?.getBoundingClientRect();
      if (r) setFlight({ x: r.left, y: r.top, w: r.width, h: r.height, id: Date.now() });
      setAsh(Array.from({ length: 14 }, (_, i) => ({ id: `${Date.now()}-${i}`, left: 30 + Math.random() * 40, top: 50 + Math.random() * 25, dx: `${(Math.random() - 0.5) * 16}px`, delay: Math.random() * 0.5 })));
      setPhase('gone');
    }, 1100));
  }, [trigger]);

  const onFlightDone = () => {
    setFlight(null);
    setPhase('back');
    timers.current.push(setTimeout(() => { setAsh([]); setPhase('idle'); }, 800));
  };

  return (
    <span className="relative w-5 h-5 inline-flex">
      <span ref={ref} className={`inline-flex ${phase === 'charge' ? 'rocket-charging' : ''} ${phase === 'back' ? 'rocket-return' : ''}`}
        style={{ opacity: phase === 'gone' ? 0 : 1 }}>
        <Rocket className="w-5 h-5" style={ICON_STYLE} />
      </span>
      {ash.map((a) => (
        <span key={a.id} className="ash" style={{ left: `${a.left}%`, top: `${a.top}%`, '--dx': a.dx, animationDelay: `${a.delay}s` }} />
      ))}
      {flight && createPortal(<RocketFlight key={flight.id} {...flight} onDone={onFlightDone} />, document.body)}
    </span>
  );
}

// Volo a schermo intero: razzo, fiamma grande e fumo disegnati su un canvas sopra la pagina
function RocketFlight({ x, y, w, h, onDone }) {
  const canvasRef = useRef(null);
  const rocketRef = useRef(null);
  React.useEffect(() => {
    const canvas = canvasRef.current; const ctx = canvas.getContext('2d');
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const W = window.innerWidth, H = window.innerHeight;
    canvas.width = W * dpr; canvas.height = H * dpr; ctx.scale(dpr, dpr);
    const sx = x + w / 2, sy = y + h / 2;
    const ex = W + 220, ey = -220;
    const FLY = 1700, FADE = 2800;
    const smoke = [];
    const t0 = performance.now();
    let last = t0, raf;
    const ease = (t) => t * t * (3 - 2 * t) * 0.35 + t * t * t * 0.65;
    const pos = (t) => {
      const k = ease(Math.min(1, t));
      // leggera curva verso l'alto
      const cx = sx + (ex - sx) * k;
      const cy = sy + (ey - sy) * k - Math.sin(k * Math.PI) * 60;
      return [cx, cy];
    };
    const frame = (now) => {
      const el = now - t0; const dt = Math.min(0.05, (now - last) / 1000); last = now;
      const t = el / FLY;
      ctx.clearRect(0, 0, W, H);
      const flying = t < 1;
      let px = 0, py = 0, ang = -Math.PI / 4, scale = 1;
      if (flying) {
        [px, py] = pos(t);
        const [nx, ny] = pos(Math.min(1, t + 0.01));
        ang = Math.atan2(ny - py, nx - px);
        scale = 1 + Math.min(1, t) * 2.2;
        // scia di fumo dalla coda
        const tx = px - Math.cos(ang) * 14 * scale, ty = py - Math.sin(ang) * 14 * scale;
        for (let i = 0; i < 4; i++) {
          smoke.push({ x: tx + (Math.random() - 0.5) * 8, y: ty + (Math.random() - 0.5) * 8,
            vx: -Math.cos(ang) * (20 + Math.random() * 40) + (Math.random() - 0.5) * 30,
            vy: -Math.sin(ang) * (20 + Math.random() * 40) + (Math.random() - 0.5) * 30,
            r: 8 + Math.random() * 8 * scale, grow: 34 + Math.random() * 40, life: 0, max: 1.8 + Math.random() * 1.4 });
        }
      }
      // fumo
      for (let i = smoke.length - 1; i >= 0; i--) {
        const p = smoke[i]; p.life += dt;
        if (p.life > p.max) { smoke.splice(i, 1); continue; }
        p.x += p.vx * dt; p.y += p.vy * dt; p.vx *= 0.97; p.vy = p.vy * 0.97 - 6 * dt; p.r += p.grow * dt;
        const k = p.life / p.max;
        const a = 0.38 * (1 - k) * Math.min(1, p.life * 6);
        const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r);
        g.addColorStop(0, `rgba(205,210,220,${a})`);
        g.addColorStop(0.6, `rgba(185,192,205,${a * 0.6})`);
        g.addColorStop(1, 'rgba(185,192,205,0)');
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill();
      }
      // fiamma grande
      if (flying) {
        const fx = px - Math.cos(ang) * 12 * scale, fy = py - Math.sin(ang) * 12 * scale;
        const flick = 0.85 + Math.random() * 0.3;
        const len = 72 * scale * flick;
        ctx.save(); ctx.translate(fx, fy); ctx.rotate(ang + Math.PI);
        const fg = ctx.createRadialGradient(0, 0, 0, len * 0.35, 0, len);
        fg.addColorStop(0, 'rgba(255,255,240,0.95)');
        fg.addColorStop(0.2, 'rgba(255,225,120,0.9)');
        fg.addColorStop(0.5, 'rgba(255,140,40,0.7)');
        fg.addColorStop(1, 'rgba(255,80,20,0)');
        ctx.fillStyle = fg; ctx.beginPath(); ctx.ellipse(len * 0.4, 0, len * 0.75, 13 * scale * flick, 0, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
        const glow = ctx.createRadialGradient(fx, fy, 0, fx, fy, 40 * scale);
        glow.addColorStop(0, 'rgba(255,190,90,0.35)'); glow.addColorStop(1, 'rgba(255,190,90,0)');
        ctx.fillStyle = glow; ctx.beginPath(); ctx.arc(fx, fy, 40 * scale, 0, Math.PI * 2); ctx.fill();
        if (rocketRef.current) {
          rocketRef.current.style.transform = `translate(${px - w / 2}px, ${py - h / 2}px) rotate(${ang + Math.PI / 4}rad) scale(${scale})`;
          rocketRef.current.style.opacity = '1';
        }
      } else if (rocketRef.current) {
        rocketRef.current.style.opacity = '0';
      }
      if (el < FLY + FADE || smoke.length) raf = requestAnimationFrame(frame);
      else onDone();
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, []);
  return (
    <>
      <canvas ref={canvasRef} aria-hidden="true" style={{ position: 'fixed', inset: 0, width: '100vw', height: '100vh', zIndex: 60, pointerEvents: 'none' }} />
      <span ref={rocketRef} aria-hidden="true" style={{ position: 'fixed', left: 0, top: 0, width: w, height: h, zIndex: 61, pointerEvents: 'none', opacity: 0, willChange: 'transform' }}>
        <Rocket className="w-5 h-5" style={ICON_STYLE} />
      </span>
    </>
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
