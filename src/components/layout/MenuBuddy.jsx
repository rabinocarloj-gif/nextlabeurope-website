import React, { useEffect, useRef } from 'react';

// Omino stilizzato che passeggia sulle linee del menu da telefono,
// pesca una stella europea e poi... inciampa. Durata circa 50 secondi.

const BLUE = '#1a4fc4';
const INK = '#0F1B3D';
const GOLD = '#e3b53f';

const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const lerp = (a, b, t) => a + (b - a) * t;
const ease = (t) => t * t * (3 - 2 * t);

function starPoints(cx, cy, r) {
  const pts = [];
  for (let k = 0; k < 10; k++) {
    const rad = k % 2 === 0 ? r : r * 0.45;
    const a = (k / 10) * Math.PI * 2 - Math.PI / 2;
    pts.push(`${(cx + Math.cos(a) * rad).toFixed(1)},${(cy + Math.sin(a) * rad).toFixed(1)}`);
  }
  return pts.join(' ');
}

export default function MenuBuddy({ containerRef }) {
  const svgRef = useRef(null);
  const els = useRef({});

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;
    const container = containerRef.current;
    if (!container) return undefined;

    let lines = [], W = 0, H = 0;
    const measure = () => {
      const c = container.getBoundingClientRect();
      W = c.width; H = c.height;
      lines = [...container.querySelectorAll('[data-line]')].map((el) => {
        const r = el.getBoundingClientRect();
        return { y: r.bottom - c.top, x0: r.left - c.left, x1: r.right - c.left };
      });
    };
    // aspetta che le voci abbiano finito di entrare
    let raf, t0 = null;
    const start = setTimeout(() => { measure(); t0 = performance.now(); raf = requestAnimationFrame(frame); }, 700);
    window.addEventListener('resize', measure);

    const e = els.current;
    const set = (el, attrs) => { if (!el) return; for (const k in attrs) el.setAttribute(k, attrs[k]); };

    // posizione lungo le linee
    const L = (i) => lines[Math.min(i, lines.length - 1)] || { y: 200, x0: 32, x1: W - 32 };
    const X = (i, f) => { const l = L(i); return lerp(l.x0 + 10, l.x1 - 10, f); };

    function walkPose(t, from, to, li, dur) {
      const k = clamp(t / dur, 0, 1);
      return { mode: 'walk', x: lerp(from, to, k), y: L(li).y, face: to >= from ? 1 : -1, phase: t * 9 };
    }
    function hopPose(t, x0, y0, x1, y1, dur) {
      const k = ease(clamp(t / dur, 0, 1));
      return { mode: 'hop', x: lerp(x0, x1, k), y: lerp(y0, y1, k) - Math.sin(k * Math.PI) * 22, face: x1 >= x0 ? 1 : -1, phase: 0 };
    }

    function pose(s) {
      // 0-7 cammina sulla prima linea verso destra
      if (s < 7) return walkPose(s, X(0, 0.02), X(0, 0.85), 0, 7);
      if (s < 8.2) return hopPose(s - 7, X(0, 0.85), L(0).y, X(1, 0.9), L(1).y, 1.2);
      if (s < 15) return walkPose(s - 8.2, X(1, 0.9), X(1, 0.12), 1, 6.8);
      if (s < 16.2) return hopPose(s - 15, X(1, 0.12), L(1).y, X(2, 0.1), L(2).y, 1.2);
      if (s < 21) return walkPose(s - 16.2, X(2, 0.1), X(2, 0.55), 2, 4.8);
      if (s < 22.2) return hopPose(s - 21, X(2, 0.55), L(2).y, X(3, 0.62), L(3).y, 1.2);
      if (s < 24.5) return walkPose(s - 22.2, X(3, 0.62), X(3, 0.72), 3, 2.3);
      // seduto a penzoloni
      const x = X(3, 0.72), y = L(3).y;
      if (s < 25.5) return { mode: 'sitdown', k: ease(s - 24.5), x, y, face: 1 };
      if (s < 27) return { mode: 'fish', stage: 'cast', k: ease((s - 25.5) / 1.5), x, y, face: 1, s };
      if (s < 38) return { mode: 'fish', stage: 'wait', x, y, face: 1, s };
      if (s < 39) return { mode: 'fish', stage: 'bite', k: s - 38, x, y, face: 1, s };
      if (s < 41.5) return { mode: 'fish', stage: 'reel', k: ease((s - 39) / 2.5), x, y, face: 1, s };
      if (s < 43.5) return { mode: 'fish', stage: 'happy', k: s - 41.5, x, y, face: 1, s };
      if (s < 44.5) return { mode: 'standup', k: ease(s - 43.5), x, y, face: 1 };
      // cammina con la stella, traballando sempre di più
      if (s < 48.5) {
        const k = (s - 44.5) / 4;
        const p = walkPose(s - 44.5, x, Math.min(X(3, 1), x + 60), 3, 4);
        return { ...p, star: true, wobble: Math.sin(s * 7) * (4 + k * 14) };
      }
      // inciampa e cade giù
      if (s < 52) {
        const k = s - 48.5;
        return { mode: 'fall', x: Math.min(X(3, 1), x + 60) + k * 30, y: L(3).y + 0.5 * 900 * k * k, rot: Math.min(160, k * 260), star: true, face: 1, k };
      }
      return { mode: 'gone' };
    }

    function draw(p, s) {
      if (p.mode === 'gone') { set(e.g, { opacity: 0 }); return false; }
      const f = p.face || 1;
      let body = '', head = { cx: 0, cy: 0 }, extra = '', rot = 0, starAt = null, fishLine = '', rod = '';
      const { x, y } = p;

      if (p.mode === 'walk' || p.mode === 'hop' || p.mode === 'fall') {
        const sw = p.mode === 'walk' ? Math.sin(p.phase) * 4 : (p.mode === 'hop' ? 3 : 5);
        const hipY = y - 10, neckY = y - 21;
        body = `M${x} ${hipY} L${x + sw} ${y} M${x} ${hipY} L${x - sw} ${y} M${x} ${hipY} L${x} ${neckY}`;
        const arm = p.mode === 'walk' ? Math.sin(p.phase + Math.PI) * 4 : -6;
        body += ` M${x} ${neckY + 3} L${x + arm} ${neckY + 11} M${x} ${neckY + 3} L${x - arm} ${neckY + 11}`;
        head = { cx: x, cy: neckY - 6 };
        if (p.star) starAt = { cx: x + 9 * f, cy: neckY + 2 };
        rot = p.mode === 'fall' ? p.rot : (p.wobble || 0);
      } else if (p.mode === 'sitdown' || p.mode === 'standup') {
        const k = p.mode === 'sitdown' ? p.k : 1 - p.k;
        const hipY = lerp(y - 10, y - 1, k), neckY = hipY - 11;
        const kneeX = x + lerp(0, 5, k) * f, kneeY = lerp(y - 5, y + 2, k);
        body = `M${x} ${hipY} L${kneeX} ${kneeY} L${x + lerp(2, 5, k) * f} ${lerp(y, y + 10, k)} M${x} ${hipY} L${kneeX - 2} ${kneeY} L${x + lerp(-2, 3, k) * f} ${lerp(y, y + 10, k)} M${x} ${hipY} L${x} ${neckY}`;
        body += ` M${x} ${neckY + 3} L${x + 5 * f} ${neckY + 9} M${x} ${neckY + 3} L${x - 4 * f} ${neckY + 9}`;
        head = { cx: x, cy: neckY - 6 };
        if (p.mode === 'standup') starAt = { cx: x + 9 * f, cy: neckY + 2 };
      } else if (p.mode === 'fish') {
        const swing = Math.sin(s * 2.2) * 3;
        const hipY = y - 1, neckY = hipY - 11;
        body = `M${x} ${hipY} L${x + 5} ${y + 2} L${x + 5 + swing} ${y + 11} M${x} ${hipY} L${x + 3} ${y + 2} L${x + 3 - swing} ${y + 11} M${x} ${hipY} L${x} ${neckY}`;
        let jerk = 0;
        if (p.stage === 'bite') jerk = Math.sin(p.k * Math.PI * 6) * 4;
        if (p.stage === 'reel') jerk = -3;
        const handX = x + 6, handY = neckY + 7 + jerk * 0.3;
        body += ` M${x} ${neckY + 3} L${handX} ${handY} M${x} ${neckY + 3} L${x + 4} ${neckY + 9}`;
        head = { cx: x, cy: neckY - 6 };
        const tipX = handX + 22, tipY = handY - 16 + jerk;
        rod = `M${handX - 3} ${handY + 2} L${tipX} ${tipY}`;
        // lenza
        let depth = 70;
        if (p.stage === 'cast') depth = 70 * p.k;
        let bob = 0;
        if (p.stage === 'wait') bob = Math.sin(s * 3) * 2;
        if (p.stage === 'bite') bob = Math.sin(p.k * Math.PI * 8) * 6 + 4;
        if (p.stage === 'reel') depth = lerp(70, 6, p.k);
        if (p.stage === 'happy') depth = 6;
        const endY = tipY + depth + bob;
        fishLine = `M${tipX} ${tipY} L${tipX} ${endY}`;
        if (p.stage === 'reel' || p.stage === 'happy') starAt = { cx: tipX, cy: endY + 8 };
        if (p.stage === 'cast' || p.stage === 'wait' || p.stage === 'bite') extra = `M${tipX - 2} ${endY} L${tipX + 2} ${endY}`;
        if (p.stage === 'happy') rot = Math.sin(p.k * Math.PI * 4) * 4;
      }

      set(e.g, { opacity: p.mode === 'fall' ? clamp(1 - (p.k - 1.2) / 1.5, 0, 1) : 1, transform: `rotate(${rot.toFixed(1)} ${x.toFixed(1)} ${y.toFixed(1)})` });
      set(e.body, { d: body });
      set(e.rod, { d: rod });
      set(e.line, { d: fishLine + ' ' + extra });
      set(e.head, { cx: head.cx, cy: head.cy });
      set(e.eyeL, { cx: head.cx - 2 + f * 1.2, cy: head.cy - 0.8 });
      set(e.eyeR, { cx: head.cx + 2 + f * 1.2, cy: head.cy - 0.8 });
      set(e.smile, { d: `M${head.cx - 2 + f} ${head.cy + 2} Q${head.cx + f} ${head.cy + 4} ${head.cx + 2 + f} ${head.cy + 2}` });
      if (starAt) {
        const sparkle = 1 + Math.sin(s * 8) * 0.12;
        set(e.star, { points: starPoints(starAt.cx, starAt.cy, 6.5 * sparkle), opacity: 1 });
        set(e.glow, { cx: starAt.cx, cy: starAt.cy, opacity: 0.55 });
      } else {
        set(e.star, { opacity: 0 });
        set(e.glow, { opacity: 0 });
      }
      return true;
    }

    function frame(now) {
      const s = (now - t0) / 1000;
      if (draw(pose(s), s)) raf = requestAnimationFrame(frame);
    }

    return () => { clearTimeout(start); cancelAnimationFrame(raf); window.removeEventListener('resize', measure); };
  }, [containerRef]);

  const r = (k) => (el) => { els.current[k] = el; };
  return (
    <svg ref={svgRef} aria-hidden="true" className="pointer-events-none absolute inset-0 w-full h-full" style={{ zIndex: 5, overflow: 'visible' }}>
      <defs>
        <radialGradient id="buddyStarGlow">
          <stop offset="0%" stopColor="#f6d36b" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#f6d36b" stopOpacity="0" />
        </radialGradient>
      </defs>
      <g ref={r('g')} opacity="0">
        <path ref={r('line')} fill="none" stroke="#6b7280" strokeWidth="0.8" />
        <path ref={r('rod')} fill="none" stroke="#8a5a2b" strokeWidth="1.8" strokeLinecap="round" />
        <path ref={r('body')} fill="none" stroke={BLUE} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <circle ref={r('head')} r="6.5" fill="#ffffff" stroke={BLUE} strokeWidth="2" />
        <circle ref={r('eyeL')} r="1.1" fill={INK} />
        <circle ref={r('eyeR')} r="1.1" fill={INK} />
        <path ref={r('smile')} fill="none" stroke={INK} strokeWidth="0.9" strokeLinecap="round" />
        <circle ref={r('glow')} r="14" fill="url(#buddyStarGlow)" opacity="0" />
        <polygon ref={r('star')} fill={GOLD} stroke="#c9952a" strokeWidth="0.6" opacity="0" />
      </g>
    </svg>
  );
}
