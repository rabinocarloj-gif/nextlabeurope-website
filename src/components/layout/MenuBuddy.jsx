import React, { useEffect, useRef } from 'react';

// Omino stilizzato del menu da telefono.
// Sbircia da dietro il logo, passeggia sulle linee del menu cambiando espressione,
// pesca una stella europea dal fondo dello schermo, poi gli viene un'idea e scappa via.
// Parte una sola volta per caricamento del sito (circa 70 secondi).

let buddyPlayed = false;

const INK = '#141414';
const GOLD = '#e3b53f';

const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const lerp = (a, b, t) => a + (b - a) * t;
const ease = (t) => { const k = clamp(t, 0, 1); return k * k * (3 - 2 * k); };

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
  const els = useRef({});

  useEffect(() => {
    if (buddyPlayed) return undefined;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;
    const container = containerRef.current;
    if (!container) return undefined;
    buddyPlayed = true;

    let lines = [], W = 0, H = 0, logo = { left: 24, right: 124, top: 14, bottom: 82 };
    const measure = () => {
      const c = container.getBoundingClientRect();
      W = c.width; H = c.height;
      lines = [...container.querySelectorAll('[data-line]')].map((el) => {
        const r = el.getBoundingClientRect();
        return { y: r.bottom - c.top, x0: r.left - c.left, x1: r.right - c.left };
      });
      const img = document.querySelector('nav a[aria-label="Home"] img');
      if (img) { const r = img.getBoundingClientRect(); logo = { left: r.left - c.left, right: r.right - c.left, top: r.top - c.top, bottom: r.bottom - c.top }; }
    };
    let raf, t0 = null;
    const start = setTimeout(() => { measure(); t0 = performance.now(); raf = requestAnimationFrame(frame); }, 700);
    window.addEventListener('resize', measure);

    const e = els.current;
    const set = (el, attrs) => { if (!el) return; for (const k in attrs) el.setAttribute(k, attrs[k]); };

    const L = (i) => lines[Math.min(i, lines.length - 1)] || { y: 200, x0: 32, x1: W - 32 };
    const X = (i, f) => { const l = L(i); return lerp(l.x0 + 12, l.x1 - 12, f); };

    // ---------- copione ----------
    // ogni posa: posizione, modalità del corpo, espressione del viso, eventuale fumetto
    function walk(t, dur, from, to, li, extra = {}) {
      const k = clamp(t / dur, 0, 1);
      return { mode: 'walk', x: lerp(from, to, k), y: L(li).y, face: to >= from ? 1 : -1, phase: t * 9, ...extra };
    }
    function hop(t, dur, x0, y0, x1, y1, extra = {}) {
      const k = ease(t / dur);
      return { mode: 'hop', x: lerp(x0, x1, k), y: lerp(y0, y1, k) - Math.sin(k * Math.PI) * 26, face: x1 >= x0 ? 1 : -1, ...extra };
    }
    const stand = (x, y, extra = {}) => ({ mode: 'stand', x, y, face: 1, ...extra });

    function pose(s) {
      const lx = logo.right + 2, ly = logo.bottom;
      const peekClip = logo.right - 3;
      // 0-11: sbircia da dietro il logo
      if (s < 1.5) return stand(lx - 14, ly, { clip: peekClip, eyes: [0, 0], mouth: 'flat' });
      if (s < 2.5) return stand(lerp(lx - 14, lx - 4, ease(s - 1.5)), ly, { clip: peekClip, eyes: [1.2, 0], mouth: 'o' });
      if (s < 4.5) return stand(lx - 4, ly, { clip: peekClip, eyes: [Math.sin((s - 2.5) * 3) * 1.4, 0], mouth: 'flat', brow: 'up' });
      if (s < 5.2) return stand(lerp(lx - 4, lx - 16, ease((s - 4.5) / 0.7)), ly, { clip: peekClip, eyes: [-1, 0], mouth: 'o' });
      if (s < 5.8) return stand(lx - 16, ly, { clip: peekClip, eyes: [0, 0] });
      if (s < 6.5) return stand(lerp(lx - 16, lx - 4, ease((s - 5.8) / 0.7)), ly, { clip: peekClip, eyes: [1.2, 0], mouth: 'flat' });
      if (s < 8) return walk(s - 6.5, 1.5, lx - 4, lx + 14, 0, { y: ly, clip: peekClip, eyes: [1, 0], mouth: 'flat' });
      if (s < 10) return stand(lx + 14, ly, { eyes: [Math.sin((s - 8) * 3.2) * 1.5, -0.3], mouth: 'o', brow: 'up' });
      if (s < 11) return stand(lx + 14, ly, { eyes: [0.6, 0], mouth: 'smile', bubble: 'ok!' });
      if (s < 12.3) return hop(s - 11, 1.3, lx + 14, ly, X(0, 0.05), L(0).y, { mouth: 'grin', eyes: [1, 0.6] });
      // 12.3-17: cammina guardando in giù e pensa
      if (s < 17) return walk(s - 12.3, 4.7, X(0, 0.05), X(0, 0.62), 0, { eyes: [0.6, 1.2], mouth: 'flat', bubble: '...' });
      // 17-21: guarda il logo e si complimenta
      if (s < 19) return stand(X(0, 0.62), L(0).y, { face: -1, eyes: [-1.3, -1.3], mouth: 'o', brow: 'up' });
      if (s < 21) return stand(X(0, 0.62), L(0).y, { face: -1, eyes: [-1.2, -1], mouth: 'grin', bubble: 'bel logo!', wave: true });
      if (s < 22.2) return walk(s - 21, 1.2, X(0, 0.62), X(0, 0.86), 0, { eyes: [1, 0], mouth: 'smile' });
      if (s < 23.4) return hop(s - 22.2, 1.2, X(0, 0.86), L(0).y, X(1, 0.9), L(1).y, { mouth: 'o', eyes: [0, 1] });
      // 23.4-28: cammina curioso, guardandosi intorno
      if (s < 28) return walk(s - 23.4, 4.6, X(1, 0.9), X(1, 0.2), 1, { eyes: [Math.sin(s * 2) * 1.4 - 0.5, -0.4], mouth: 'smile' });
      // 28-30: perplesso
      if (s < 30) return stand(X(1, 0.2), L(1).y, { face: -1, eyes: [0.3, -0.8], mouth: 'wavy', brow: 'tilt', bubble: '?' });
      if (s < 31.2) return hop(s - 30, 1.2, X(1, 0.2), L(1).y, X(2, 0.1), L(2).y, { mouth: 'o' });
      if (s < 35) return walk(s - 31.2, 3.8, X(2, 0.1), X(2, 0.55), 2, { eyes: [0.5, 1.2], mouth: 'flat', bubble: '...' });
      if (s < 36.2) return hop(s - 35, 1.2, X(2, 0.55), L(2).y, X(3, 0.62), L(3).y, { mouth: 'grin' });
      if (s < 37.5) return walk(s - 36.2, 1.3, X(3, 0.62), X(3, 0.7), 3, { mouth: 'smile' });
      // 37.5-56: si siede e pesca
      const fx = X(3, 0.7), fy = L(3).y;
      if (s < 38.5) return { mode: 'sit', k: ease(s - 37.5), x: fx, y: fy, face: 1, mouth: 'smile' };
      if (s < 40) return { mode: 'fish', stage: 'cast', k: ease((s - 38.5) / 1.5), x: fx, y: fy, face: 1, mouth: 'smile', eyes: [0.6, 1.2] };
      if (s < 49) return { mode: 'fish', stage: 'wait', x: fx, y: fy, face: 1, mouth: s > 44 ? 'flat' : 'smile', eyes: [0.6, 1.3], bubble: s > 45 && s < 47.5 ? 'zzz' : null };
      if (s < 50) return { mode: 'fish', stage: 'bite', k: s - 49, x: fx, y: fy, face: 1, mouth: 'o', eyes: [1, 1.3], brow: 'up', bubble: '!' };
      if (s < 53.5) return { mode: 'fish', stage: 'reel', k: ease((s - 50) / 3.5), x: fx, y: fy, face: 1, mouth: 'grin', eyes: [1, 1] };
      if (s < 56) return { mode: 'fish', stage: 'happy', k: s - 53.5, x: fx, y: fy, face: 1, mouth: 'grin', eyes: [0.8, -0.3], bubble: 'evviva!' };
      if (s < 57) return { mode: 'sit', k: 1 - ease(s - 56), x: fx, y: fy, face: 1, mouth: 'smile', star: true };
      // 57-64: avanti e indietro, serio
      if (s < 64) {
        const k = (s - 57) / 7;
        const off = Math.sin(k * Math.PI * 3) * 40;
        const prev = Math.sin((k - 0.01) * Math.PI * 3) * 40;
        return { mode: 'walk', x: fx + off, y: fy, face: off >= prev ? 1 : -1, phase: s * 8, mouth: 'flat', brow: 'down', eyes: [0, 0.6], star: true };
      }
      // 64-66.5: l'idea!
      const ix = fx + Math.sin(Math.PI * 3) * 40;
      if (s < 65.5) return stand(ix, fy, { face: -1, mouth: 'o', brow: 'up', eyes: [0, -1.4], bulb: 'above', bulbK: ease((s - 64) / 0.6), star: true });
      if (s < 66.5) return stand(ix, fy, { face: -1, mouth: 'grin', eyes: [0, -1], bulb: 'grab', bulbK: ease(s - 65.5), star: true, reach: true });
      // 66.5-69.5: corre via a sinistra verso Contatti e esce dallo schermo
      if (s < 69.5) {
        const k = (s - 66.5) / 3;
        return { mode: 'run', x: lerp(ix, -60, k * k * 0.4 + k * 0.6), y: fy, face: -1, phase: s * 16, mouth: 'grin', eyes: [-1.2, 0], bulb: 'hand', star: true };
      }
      return { mode: 'gone' };
    }

    // ---------- disegno ----------
    function draw(p, s) {
      if (p.mode === 'gone') { set(e.g, { opacity: 0 }); return false; }
      const f = p.face || 1;
      const { x, y } = p;
      let body = '', head = { cx: 0, cy: 0 }, rod = '', fishLine = '', bob = '';
      let rot = 0, starAt = null, bulbAt = null, handX = 0, handY = 0;

      if (p.mode === 'walk' || p.mode === 'hop' || p.mode === 'stand' || p.mode === 'run') {
        const running = p.mode === 'run';
        const sw = p.mode === 'walk' ? Math.sin(p.phase) * 4 : running ? Math.sin(p.phase) * 6 : p.mode === 'hop' ? 3 : 1.5;
        const hipY = y - 10, neckY = y - 21;
        const lean = running ? 3 * f : 0;
        body = `M${x} ${hipY} L${x + sw} ${y} M${x} ${hipY} L${x - sw} ${y} M${x} ${hipY} L${x + lean} ${neckY}`;
        const arm = p.mode === 'walk' ? Math.sin(p.phase + Math.PI) * 4 : running ? Math.sin(p.phase + Math.PI) * 6 : 0;
        const nx = x + lean;
        if (p.wave) {
          const wv = Math.sin(s * 10) * 2;
          body += ` M${nx} ${neckY + 3} L${nx + 5 * f + wv} ${neckY - 6} M${nx} ${neckY + 3} L${nx - 3 * f} ${neckY + 11}`;
        } else if (p.reach) {
          body += ` M${nx} ${neckY + 3} L${nx + 2 * f} ${neckY - 9} M${nx} ${neckY + 3} L${nx - 3 * f} ${neckY + 11}`;
        } else {
          body += ` M${nx} ${neckY + 3} L${nx + arm + 2} ${neckY + 11} M${nx} ${neckY + 3} L${nx - arm - 2} ${neckY + 11}`;
        }
        handX = nx + (p.reach ? 2 * f : arm + 2); handY = p.reach ? neckY - 9 : neckY + 11;
        head = { cx: nx, cy: neckY - 7 };
        if (p.star) starAt = { cx: nx - (arm + 2) - 3 * f, cy: neckY + 12 };
        if (p.bulb === 'above') bulbAt = { cx: nx, cy: neckY - 24 - p.bulbK * 2, o: p.bulbK };
        if (p.bulb === 'grab') bulbAt = { cx: lerp(nx, nx + 2 * f, p.bulbK), cy: lerp(neckY - 26, neckY - 13, p.bulbK), o: 1 };
        if (p.bulb === 'hand') bulbAt = { cx: nx + (arm + 2) + 1, cy: neckY + 7, o: 1 };
        if (p.mode === 'hop') rot = 0;
      } else if (p.mode === 'sit') {
        const k = p.k;
        const hipY = lerp(y - 10, y - 1, k), neckY = hipY - 11;
        const kneeX = x + lerp(0, 5, k), kneeY = lerp(y - 5, y + 2, k);
        body = `M${x} ${hipY} L${kneeX} ${kneeY} L${x + lerp(2, 5, k)} ${lerp(y, y + 11, k)} M${x} ${hipY} L${kneeX - 2} ${kneeY} L${x + lerp(-2, 3, k)} ${lerp(y, y + 11, k)} M${x} ${hipY} L${x} ${neckY}`;
        body += ` M${x} ${neckY + 3} L${x + 5} ${neckY + 9} M${x} ${neckY + 3} L${x - 4} ${neckY + 9}`;
        head = { cx: x, cy: neckY - 7 };
        if (p.star) starAt = { cx: x - 7, cy: neckY + 10 };
      } else if (p.mode === 'fish') {
        const swing = Math.sin(s * 2.2) * 3;
        const hipY = y - 1, neckY = hipY - 11;
        body = `M${x} ${hipY} L${x + 5} ${y + 2} L${x + 5 + swing} ${y + 11} M${x} ${hipY} L${x + 3} ${y + 2} L${x + 3 - swing} ${y + 11} M${x} ${hipY} L${x} ${neckY}`;
        let jerk = 0;
        if (p.stage === 'bite') jerk = Math.sin(p.k * Math.PI * 6) * 4;
        if (p.stage === 'reel') jerk = -3 + Math.sin(s * 14) * 1.2;
        const hx = x + 6, hy = neckY + 7 + jerk * 0.3;
        body += ` M${x} ${neckY + 3} L${hx} ${hy} M${x} ${neckY + 3} L${x + 4} ${neckY + 9}`;
        head = { cx: x, cy: neckY - 7 };
        const tipX = hx + 24, tipY = hy - 18 + jerk;
        rod = `M${hx - 3} ${hy + 2} L${tipX} ${tipY}`;
        // la lenza scende fino in fondo allo schermo: la stella sbuca da fuori
        const bottom = H + 30;
        let endY = bottom;
        if (p.stage === 'cast') endY = lerp(tipY, bottom, p.k);
        if (p.stage === 'wait') endY = bottom;
        if (p.stage === 'bite') endY = bottom - 6 + Math.sin(p.k * Math.PI * 8) * 8;
        if (p.stage === 'reel') endY = lerp(bottom, tipY + 8, p.k);
        if (p.stage === 'happy') endY = tipY + 8;
        fishLine = `M${tipX} ${tipY} L${tipX} ${endY}`;
        if (p.stage === 'reel' || p.stage === 'happy') starAt = { cx: tipX, cy: endY + 8, big: true };
        if (p.stage === 'happy') rot = Math.sin(p.k * Math.PI * 4) * 3;
      }

      // viso
      const ex = (p.eyes || [0.8 * f, 0])[0], ey = (p.eyes || [0, 0])[1];
      const hc = head;
      set(e.g, { opacity: 1, transform: `rotate(${rot.toFixed(1)} ${x.toFixed(1)} ${y.toFixed(1)})` });
      set(e.clip, { x: p.clip != null ? p.clip : -2000 });
      set(e.body, { d: body });
      set(e.rod, { d: rod });
      set(e.line, { d: fishLine + ' ' + bob });
      set(e.head, { cx: hc.cx, cy: hc.cy });
      set(e.eyeL, { cx: hc.cx - 2.2 + ex, cy: hc.cy - 0.8 + ey });
      set(e.eyeR, { cx: hc.cx + 2.2 + ex, cy: hc.cy - 0.8 + ey });
      // sopracciglia
      let bl = '', br = '';
      const by = hc.cy - 3.6;
      if (p.brow === 'up') { bl = `M${hc.cx - 3.8} ${by - 1.2} L${hc.cx - 1} ${by - 1.8}`; br = `M${hc.cx + 1} ${by - 1.8} L${hc.cx + 3.8} ${by - 1.2}`; }
      if (p.brow === 'down') { bl = `M${hc.cx - 3.8} ${by - 0.6} L${hc.cx - 1} ${by + 0.4}`; br = `M${hc.cx + 1} ${by + 0.4} L${hc.cx + 3.8} ${by - 0.6}`; }
      if (p.brow === 'tilt') { bl = `M${hc.cx - 3.8} ${by - 0.2} L${hc.cx - 1} ${by - 0.2}`; br = `M${hc.cx + 1} ${by - 2} L${hc.cx + 3.8} ${by - 1}`; }
      set(e.brows, { d: `${bl} ${br}` });
      // bocca
      const mx = hc.cx + ex * 0.6, my = hc.cy + 2.6;
      const mouths = {
        smile: `M${mx - 2.2} ${my} Q${mx} ${my + 2} ${mx + 2.2} ${my}`,
        grin: `M${mx - 2.6} ${my - 0.4} Q${mx} ${my + 3} ${mx + 2.6} ${my - 0.4} Z`,
        flat: `M${mx - 1.8} ${my + 0.6} L${mx + 1.8} ${my + 0.6}`,
        wavy: `M${mx - 2.2} ${my + 0.6} Q${mx - 1.1} ${my - 0.4} ${mx} ${my + 0.6} Q${mx + 1.1} ${my + 1.6} ${mx + 2.2} ${my + 0.6}`,
        o: `M${mx} ${my - 0.4} m-1 0 a1 1.2 0 1 0 2 0 a1 1.2 0 1 0 -2 0`,
      };
      const mouth = p.mouth || 'smile';
      set(e.mouth, { d: mouths[mouth], fill: mouth === 'grin' ? INK : 'none' });

      // fumetto
      if (p.bubble) {
        const bx = hc.cx + 9 * (p.face === -1 ? -1 : 1), byy = hc.cy - 16;
        const w = Math.max(16, p.bubble.length * 5.6 + 8);
        const left = p.face === -1 ? bx - w : bx;
        set(e.bubble, { opacity: 1 });
        set(e.bubbleRect, { x: left, y: byy - 8, width: w, height: 14 });
        set(e.bubbleText, { x: left + w / 2, y: byy + 2 });
        if (e.bubbleText.textContent !== p.bubble) e.bubbleText.textContent = p.bubble;
      } else set(e.bubble, { opacity: 0 });

      // stella
      if (starAt) {
        const sp = 1 + Math.sin(s * 8) * 0.12;
        const r = (starAt.big ? 8 : 5.5) * sp;
        set(e.star, { points: starPoints(starAt.cx, starAt.cy, r), opacity: 1 });
        set(e.glow, { cx: starAt.cx, cy: starAt.cy, r: r * 2.4, opacity: 0.6 });
      } else { set(e.star, { opacity: 0 }); set(e.glow, { opacity: 0 }); }

      // lampadina
      if (bulbAt) {
        set(e.bulb, { opacity: bulbAt.o, transform: `translate(${bulbAt.cx.toFixed(1)} ${bulbAt.cy.toFixed(1)})` });
        set(e.bulbGlow, { opacity: 0.55 + Math.sin(s * 9) * 0.25 });
      } else set(e.bulb, { opacity: 0 });
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
    <svg aria-hidden="true" className="pointer-events-none absolute inset-0 w-full h-full" style={{ zIndex: 5, overflow: 'visible' }}>
      <defs>
        <radialGradient id="buddyStarGlow">
          <stop offset="0%" stopColor="#f6d36b" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#f6d36b" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="buddyBulbGlow">
          <stop offset="0%" stopColor="#ffe27a" stopOpacity="1" />
          <stop offset="100%" stopColor="#ffe27a" stopOpacity="0" />
        </radialGradient>
        <clipPath id="buddyClip">
          <rect ref={r('clip')} x="-2000" y="-2000" width="6000" height="6000" />
        </clipPath>
      </defs>
      <g ref={r('g')} opacity="0" clipPath="url(#buddyClip)">
        <path ref={r('line')} fill="none" stroke="#9aa3b5" strokeWidth="0.7" />
        <path ref={r('rod')} fill="none" stroke="#8a5a2b" strokeWidth="1.4" strokeLinecap="round" />
        <path ref={r('body')} fill="none" stroke={INK} strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
        <circle ref={r('head')} r="7" fill="#ffffff" stroke={INK} strokeWidth="1.2" />
        <circle ref={r('eyeL')} r="1" fill={INK} />
        <circle ref={r('eyeR')} r="1" fill={INK} />
        <path ref={r('brows')} fill="none" stroke={INK} strokeWidth="0.8" strokeLinecap="round" />
        <path ref={r('mouth')} fill="none" stroke={INK} strokeWidth="0.8" strokeLinecap="round" strokeLinejoin="round" />
        <circle ref={r('glow')} r="14" fill="url(#buddyStarGlow)" opacity="0" />
        <polygon ref={r('star')} fill={GOLD} stroke="#c9952a" strokeWidth="0.6" opacity="0" />
        <g ref={r('bulb')} opacity="0">
          <circle ref={r('bulbGlow')} r="12" fill="url(#buddyBulbGlow)" />
          <circle r="4.2" cy="-1" fill="#ffd84a" stroke={INK} strokeWidth="0.7" />
          <rect x="-1.8" y="2.8" width="3.6" height="2.6" rx="0.6" fill="#c9ccd3" stroke={INK} strokeWidth="0.5" />
          <path d="M-7 -6 L-9 -8 M7 -6 L9 -8 M0 -8 L0 -11" stroke="#e3b53f" strokeWidth="0.8" strokeLinecap="round" />
        </g>
        <g ref={r('bubble')} opacity="0">
          <rect ref={r('bubbleRect')} rx="7" fill="#ffffff" stroke={INK} strokeWidth="0.7" />
          <text ref={r('bubbleText')} textAnchor="middle" fontSize="8" fontFamily="'Plus Jakarta Sans', sans-serif" fontWeight="700" fill={INK} />
        </g>
      </g>
    </svg>
  );
}
