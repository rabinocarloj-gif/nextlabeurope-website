import React, { useEffect, useRef } from 'react';

// Omino stilizzato del menu da telefono (stile "stick figure" animato a scheletro).
// Sbircia da dietro la forma blu del logo, si muove tra le linee con salti acrobatici,
// pesca una stella europea dal fondo dello schermo, ha un'idea, apre una porta ed esce di scena.
// Parte una sola volta per caricamento del sito.

let buddyPlayed = false;

const INK = '#141414';
const GOLD = '#e3b53f';
const D = Math.PI / 180;
const LEN = { thigh: 6.6, shin: 6.6, torso: 11, neck: 1.6, head: 7, upper: 5.4, fore: 5.2 };

const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const lerp = (a, b, t) => a + (b - a) * t;
const ease = (t) => { const k = clamp(t, 0, 1); return k * k * (3 - 2 * k); };
const easeOut = (t) => 1 - Math.pow(1 - clamp(t, 0, 1), 3);

// ---------- pose dello scheletro (angoli in gradi, 0 = verso il basso, + = in avanti) ----------
const BASE = { torso: 3, head: 0, hipL: 4, kneeL: -6, hipR: -4, kneeR: -4, shL: 6, elL: 14, shR: -6, elR: 12 };
const mixP = (a, b, t) => { const o = {}; for (const k in BASE) o[k] = lerp(a[k] ?? BASE[k], b[k] ?? BASE[k], t); return o; };
const P = {
  idle: (s) => ({ ...BASE, torso: 3 + Math.sin(s * 2) * 1.2, shL: 6 + Math.sin(s * 2) * 2, shR: -6 - Math.sin(s * 2) * 2 }),
  walk: (ph) => ({
    torso: 5, head: 0,
    hipL: 26 * Math.sin(ph), hipR: -26 * Math.sin(ph),
    kneeL: -6 - 34 * (0.5 + 0.5 * Math.sin(ph - 1.1)), kneeR: -6 - 34 * (0.5 + 0.5 * Math.sin(ph + Math.PI - 1.1)),
    shL: -24 * Math.sin(ph), elL: 20, shR: 24 * Math.sin(ph), elR: 20,
  }),
  run: (ph) => ({
    torso: 20, head: -10,
    hipL: 48 * Math.sin(ph) + 10, hipR: -48 * Math.sin(ph) + 10,
    kneeL: -20 - 85 * (0.5 + 0.5 * Math.sin(ph - 1.3)), kneeR: -20 - 85 * (0.5 + 0.5 * Math.sin(ph + Math.PI - 1.3)),
    shL: -60 * Math.sin(ph), elL: 90, shR: 60 * Math.sin(ph), elR: 90,
  }),
  crouch: { torso: 32, head: -16, hipL: 78, kneeL: -128, hipR: 70, kneeR: -120, shL: 35, elL: 40, shR: 25, elR: 50 },
  tuck: { torso: 25, head: -10, hipL: 115, kneeL: -150, hipR: 108, kneeR: -150, shL: 70, elL: 100, shR: 60, elR: 110 },
  stretch: { torso: -4, head: 6, hipL: -6, kneeL: -2, hipR: 8, kneeR: -4, shL: 165, elL: 6, shR: 150, elR: 10 },
  sit: (sw) => ({ torso: -4, head: 4, hipL: 88, kneeL: -84 + sw, hipR: 92, kneeR: -96 - sw, shL: 30, elL: 30, shR: 20, elR: 40 }),
  chin: { shR: 125, elR: 120 },
  thumbs: { shR: 78, elR: 98 },
  scratch: { shR: 150, elR: 125, head: 10 },
  reach: { shR: 172, elR: 4, head: 18 },
  carry: { shL: 48, elL: 38 },
  rod: { shR: 62, elR: -20, shL: 50, elL: 20 },
  push: { shR: 82, elR: 6 },
};
const withArms = (p, arms) => ({ ...p, ...arms });

// cinematica: calcola i punti del corpo in coordinate schermo
function skeleton(p, hx, hy, f, rot) {
  const cr = Math.cos(rot * D), sr = Math.sin(rot * D);
  const W = (lx, ly) => [hx + f * (lx * cr - ly * sr), hy + (lx * sr + ly * cr)];
  const dirDown = (a) => [Math.sin(a * D), Math.cos(a * D)];
  const add = (pt, d, l) => [pt[0] + d[0] * l, pt[1] + d[1] * l];
  const hip = [0, 0];
  const kneeL = add(hip, dirDown(p.hipL), LEN.thigh), footL = add(kneeL, dirDown(p.hipL + p.kneeL), LEN.shin);
  const kneeR = add(hip, dirDown(p.hipR), LEN.thigh), footR = add(kneeR, dirDown(p.hipR + p.kneeR), LEN.shin);
  const tUp = [Math.sin(p.torso * D), -Math.cos(p.torso * D)];
  const neck = add(hip, tUp, LEN.torso), sh = add(hip, tUp, LEN.torso - 1.2);
  const ha = p.torso + p.head;
  const headC = add(neck, [Math.sin(ha * D), -Math.cos(ha * D)], LEN.neck + LEN.head);
  const elbL = add(sh, dirDown(p.shL), LEN.upper), handL = add(elbL, dirDown(p.shL + p.elL), LEN.fore);
  const elbR = add(sh, dirDown(p.shR), LEN.upper), handR = add(elbR, dirDown(p.shR + p.elR), LEN.fore);
  const local = { hip, kneeL, footL, kneeR, footR, neck, sh, headC, elbL, handL, elbR, handR };
  const out = {};
  for (const k in local) out[k] = W(local[k][0], local[k][1]);
  out.lowest = Math.max(footL[1], footR[1]);
  out.headAngle = ha * f + rot * f;
  return out;
}

function starPoints(cx, cy, r) {
  const pts = [];
  for (let k = 0; k < 10; k++) {
    const rad = k % 2 === 0 ? r : r * 0.45;
    const a = (k / 10) * Math.PI * 2 - Math.PI / 2;
    pts.push(`${(cx + Math.cos(a) * rad).toFixed(1)},${(cy + Math.sin(a) * rad).toFixed(1)}`);
  }
  return pts.join(' ');
}

// espressioni: sopracciglia (alzate / inclinate), occhi (sguardo, apertura), bocca (curva, apertura)
const FACE = {
  neutral: { bL: 0, bR: 0, bAng: 0, eyeOpen: 1, curve: 0.3, open: 0 },
  curious: { bL: 0.9, bR: 0.6, bAng: -0.2, eyeOpen: 1.1, curve: 0.1, open: 0.15 },
  suspicious: { bL: -0.3, bR: -0.3, bAng: 0.8, eyeOpen: 0.45, curve: -0.1, open: 0 },
  happy: { bL: 0.5, bR: 0.5, bAng: -0.3, eyeOpen: 0.9, curve: 1, open: 0.25 },
  wow: { bL: 1.2, bR: 1.2, bAng: -0.3, eyeOpen: 1.25, curve: 0.2, open: 0.7 },
  thinking: { bL: -0.2, bR: 0.4, bAng: 0.4, eyeOpen: 0.85, curve: -0.1, open: 0 },
  perplexed: { bL: -0.4, bR: 1.1, bAng: 0.2, eyeOpen: 1, curve: -0.4, open: 0.1 },
  bored: { bL: -0.2, bR: -0.2, bAng: -0.2, eyeOpen: 0.5, curve: -0.2, open: 0 },
  yawn: { bL: 0.4, bR: 0.4, bAng: -0.4, eyeOpen: 0.1, curve: 0, open: 1 },
  serious: { bL: -0.5, bR: -0.5, bAng: 1, eyeOpen: 0.8, curve: -0.3, open: 0 },
  focused: { bL: -0.3, bR: -0.3, bAng: 0.6, eyeOpen: 0.9, curve: 0.1, open: 0 },
};

export default function MenuBuddy({ containerRef }) {
  const els = useRef({});

  useEffect(() => {
    if (buddyPlayed) return undefined;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;
    const container = containerRef.current;
    if (!container) return undefined;
    buddyPlayed = true;

    let lines = [], W = 0, H = 0, logo = { blueEdge: 86, bottom: 82, left: 24, top: 14, w: 100 }, doorX = 150;
    const measure = () => {
      const c = container.getBoundingClientRect();
      W = c.width; H = c.height;
      const items = [...container.querySelectorAll('[data-line]')];
      lines = items.map((el) => { const r = el.getBoundingClientRect(); const sp = el.querySelector('span')?.getBoundingClientRect(); return { y: r.bottom - c.top, x0: r.left - c.left, x1: r.right - c.left, tR: (sp ? sp.right : r.left + 90) - c.left }; });
      const lastText = items[items.length - 1]?.querySelector('span');
      if (lastText) doorX = lastText.getBoundingClientRect().right - c.left + 22;
      const img = document.querySelector('nav a[aria-label="Home"] img');
      if (img) {
        const r = img.getBoundingClientRect();
        logo = { left: r.left - c.left, top: r.top - c.top, w: r.width, bottom: r.top - c.top + r.height * 0.985, blueEdge: r.left - c.left + r.width * 0.612 };
      }
    };
    let raf, t0 = null, last = 0;
    const start = setTimeout(() => { measure(); t0 = performance.now(); last = t0; raf = requestAnimationFrame(frame); }, 700);
    window.addEventListener('resize', measure);

    const e = els.current;
    const set = (el, attrs) => { if (!el) return; for (const k in attrs) el.setAttribute(k, attrs[k]); };
    const L = (i) => lines[Math.min(i, lines.length - 1)] || { y: 200, x0: 32, x1: W - 32 };
    const X = (i, fr) => { const l = L(i); return lerp(l.x0 + 12, l.x1 - 12, fr); };
    const T = (i, gap = 16) => Math.min((L(i).tR ?? L(i).x0 + 90) + gap, L(i).x1 - 20); // subito dopo la scritta

    // stato del viso (si muove in modo fluido verso l'espressione richiesta)
    const face = { ...FACE.neutral, lx: 0.6, ly: 0 };
    let nextBlink = 2.5, blinkUntil = 0;

    // ---------- copione ----------
    // salto acrobatico tra due punti: carica, capriola in avanti, atterraggio
    function leap(s, t0s, x0, y0, x1, y1, dirFace) {
      const tCh = 0.28, tAir = 0.75, tLand = 0.3;
      const u = s - t0s;
      const f = dirFace ?? (x1 >= x0 ? 1 : -1);
      if (u < tCh) return { ground: y0, x: x0, f, p: mixP(P.idle(s), P.crouch, easeOut(u / tCh)), expr: 'focused', look: [0.8, 0.6] };
      if (u < tCh + tAir) {
        const k = (u - tCh) / tAir;
        const x = lerp(x0, x1, k), y = lerp(y0, y1, k) - Math.sin(k * Math.PI) * 30;
        const pp = k < 0.15 ? mixP(P.stretch, P.tuck, k / 0.15) : k > 0.8 ? mixP(P.tuck, P.stretch, (k - 0.8) / 0.2) : P.tuck;
        return { air: true, x, hipY: y - 12, f, rot: ease(k) * 360, p: pp, expr: 'focused', look: [1, 0] };
      }
      const k = (u - tCh - tAir) / tLand;
      return { ground: y1, x: x1, f, p: mixP(P.crouch, P.idle(s), easeOut(k)), expr: 'happy', look: [0.6, 0] };
    }
    const LEAP_T = 1.33;

    function walkTo(s, ts, dur, x0, x1, li, extra = {}) {
      const k = clamp((s - ts) / dur, 0, 1);
      const f = x1 >= x0 ? 1 : -1;
      const base = P.walk((s - ts) * 8.5);
      return { ground: L(li).y, x: lerp(x0, x1, k), f, p: extra.arms ? withArms(base, extra.arms) : base, ...extra };
    }
    const idleAt = (s, x, y, f, extra = {}) => ({ ground: y, x, f, p: extra.arms ? withArms(P.idle(s), extra.arms) : P.idle(s), ...extra });

    function scene(s) {
      const edge = logo.blueEdge, ly = logo.bottom;
      const hidX = edge - 13;
      // 0-9.8: sbircia da dietro la forma blu del logo
      if (s < 1.2) return idleAt(s, hidX, ly, 1, { clip: edge, expr: 'neutral' });
      if (s < 2.2) { const k = ease(s - 1.2); return { ground: ly, x: hidX, f: 1, p: { ...P.idle(s), torso: lerp(3, 46, k), head: lerp(0, -20, k) }, clip: edge, expr: 'curious', look: [1.4, 0] }; }
      if (s < 4.2) { const lk = Math.sin((s - 2.2) * 2.6); return { ground: ly, x: hidX, f: 1, p: { ...P.idle(s), torso: 46, head: -20 + lk * 6 }, clip: edge, expr: lk > 0 ? 'curious' : 'suspicious', look: [lk * 1.4, -0.3] }; }
      if (s < 4.8) { const k = ease((s - 4.2) / 0.6); return { ground: ly, x: hidX, f: 1, p: { ...P.idle(s), torso: lerp(46, 3, k), head: lerp(-20, 0, k) }, clip: edge, expr: 'wow', look: [-1, 0] }; }
      if (s < 5.2) return idleAt(s, hidX, ly, 1, { clip: edge, expr: 'neutral' });
      if (s < 5.8) { const k = ease((s - 5.2) / 0.6); return { ground: ly, x: hidX, f: 1, p: { ...P.idle(s), torso: lerp(3, 40, k), head: lerp(0, -16, k) }, clip: edge, expr: 'suspicious', look: [1.4, 0.2] }; }
      if (s < 7.2) return walkTo(s, 5.8, 1.4, hidX, edge + 12, 0, { ground: ly, clip: edge, expr: 'neutral', look: [1, 0] });
      if (s < 7.7) return idleAt(s, edge + 12, ly, 1, { expr: 'curious', look: [1.3, 0] });
      if (s < 8.3) return idleAt(s, edge + 12, ly, -1, { expr: 'curious', look: [1.3, -0.4] });
      if (s < 8.9) return idleAt(s, edge + 12, ly, 1, { expr: 'suspicious', look: [1.3, 0.3] });
      if (s < 9.8) return idleAt(s, edge + 12, ly, 1, { expr: 'happy', look: [0.6, 0] });
      // 9.8-11.1: salto verso Home
      if (s < 9.8 + LEAP_T) return leap(s, 9.8, edge + 12, ly, T(0), L(0).y, 1);
      // 11.1-16.3: cammina pensieroso, mano al mento, sguardo in giù
      if (s < 16.3) return walkTo(s, 11.1, 5.2, T(0), X(0, 0.6), 0, { arms: P.chin, expr: 'thinking', look: [0.5, 1.3] });
      // 16.3-19.3: si gira verso il logo, stupito, pollice in su
      if (s < 17.1) return idleAt(s, X(0, 0.6), L(0).y, -1, { expr: 'wow', look: [1.3, -1.3], headTilt: -14 });
      if (s < 19.3) return idleAt(s, X(0, 0.6), L(0).y, -1, { arms: P.thumbs, expr: 'happy', look: [1.2, -1.1], headTilt: -10, sparkle: true });
      // 19.3-20.6: corre fino al bordo
      if (s < 20.6) { const k = (s - 19.3) / 1.3; return { ground: L(0).y, x: lerp(X(0, 0.6), X(0, 0.92), ease(k)), f: 1, p: P.run((s - 19.3) * 15), expr: 'focused', look: [1.2, 0.3] }; }
      if (s < 20.6 + LEAP_T) return leap(s, 20.6, X(0, 0.92), L(0).y, X(1, 0.88), L(1).y, -1);
      // 21.9-26.4: cammina curioso guardandosi intorno
      if (s < 26.4) { const lk = Math.sin(s * 1.8); return walkTo(s, 21.9, 4.5, X(1, 0.88), T(1, 22), 1, { expr: lk > 0.3 ? 'curious' : 'neutral', look: [lk * 1.4, -0.3] }); }
      // 26.4-28.4: perplesso, si gratta la testa
      if (s < 28.4) return idleAt(s, T(1, 22), L(1).y, -1, { arms: { ...P.scratch, elR: 125 + Math.sin(s * 14) * 12 }, expr: 'perplexed', look: [0.4, -0.9], mark: '?' });
      if (s < 28.4 + LEAP_T) return leap(s, 28.4, T(1, 22), L(1).y, T(2), L(2).y, 1);
      if (s < 33.4) return walkTo(s, 29.73, 3.67, T(2), Math.max(X(2, 0.55), T(2) + 40), 2, { arms: P.chin, expr: 'thinking', look: [0.5, 1.2] });
      if (s < 33.4 + LEAP_T) return leap(s, 33.4, Math.max(X(2, 0.55), T(2) + 40), L(2).y, X(3, 0.6), L(3).y, 1);
      const fx = X(3, 0.7), fy = L(3).y;
      if (s < 36) return walkTo(s, 34.73, 1.27, X(3, 0.6), fx, 3, { expr: 'happy', look: [1, 0.6] });
      // 36-54: si siede e pesca
      if (s < 37) { const k = ease(s - 36); return { sit: true, k, x: fx, y: fy, f: 1, p: mixP(P.idle(s), P.sit(0), k), expr: 'neutral', look: [1, 1] }; }
      const sw = Math.sin(s * 2.2) * 14;
      if (s < 38.5) {
        const k = (s - 37) / 1.5;
        const arm = k < 0.4 ? { shR: lerp(62, 150, k / 0.4), elR: -10 } : { shR: lerp(150, 62, (k - 0.4) / 0.6), elR: -20 };
        return { sit: true, k: 1, x: fx, y: fy, f: 1, p: withArms(P.sit(sw), { ...P.rod, ...arm }), fish: 'cast', fk: ease((k - 0.4) / 0.6), expr: 'focused', look: [1, 1.2] };
      }
      if (s < 47) {
        const yawn = s > 42.2 && s < 43.6;
        return { sit: true, k: 1, x: fx, y: fy, f: 1, p: withArms(P.sit(sw), yawn ? { ...P.rod, shL: 150, elL: 40 } : P.rod), fish: 'wait', expr: yawn ? 'yawn' : s > 40 ? 'bored' : 'neutral', look: [0.8, 1.3] };
      }
      if (s < 48) return { sit: true, k: 1, x: fx, y: fy, f: 1, p: withArms(P.sit(sw), { ...P.rod, shR: 62 + Math.sin((s - 47) * 40) * 8 }), fish: 'bite', fk: s - 47, expr: 'wow', look: [1, 1.3], mark: '!' };
      if (s < 51.5) {
        const k = (s - 48) / 3.5;
        return { sit: true, k: 1, x: fx, y: fy, f: 1, p: withArms(P.sit(sw), { ...P.rod, shR: 62 + Math.sin(s * 9) * 18, shL: 70 + Math.sin(s * 9 + 1) * 20 }), fish: 'reel', fk: ease(k), expr: 'focused', look: [1, lerp(1.3, -0.2, k)] };
      }
      if (s < 54) return { sit: true, k: 1, x: fx, y: fy, f: 1, p: withArms(P.sit(sw), { ...P.rod, shL: 140 + Math.sin(s * 8) * 10, elL: 20 }), fish: 'happy', expr: 'happy', look: [0.8, -0.6] };
      if (s < 55) { const k = ease(s - 54); return { sit: true, k: 1 - k, x: fx, y: fy, f: 1, p: withArms(mixP(P.sit(0), P.idle(s), k), P.carry), star: true, expr: 'happy', look: [0.6, 0] }; }
      // 55-61.5: avanti e indietro, serio
      if (s < 61.5) {
        const k = (s - 55) / 6.5;
        const off = Math.sin(k * Math.PI * 3) * 40, prev = Math.sin((k - 0.004) * Math.PI * 3) * 40;
        return { ground: fy, x: fx + off, f: off >= prev ? 1 : -1, p: withArms(P.walk(s * 7.5), { ...P.carry, ...P.chin }), star: true, expr: 'serious', look: [0.3, 0.8] };
      }
      const ix = fx + Math.sin(Math.PI * 3) * 40;
      // 61.5-63.1: l'idea, prende la lampadina
      if (s < 62.3) return idleAt(s, ix, fy, -1, { arms: P.carry, star: true, expr: s < 61.8 ? 'serious' : 'wow', look: [0, -1.5], bulb: 'above', bulbK: ease((s - 61.5) / 0.5), headTilt: 10 });
      if (s < 63.1) { const k = ease((s - 62.3) / 0.8); return idleAt(s, ix, fy, -1, { arms: { ...P.carry, ...(k < 0.5 ? P.reach : { shR: lerp(172, 40, (k - 0.5) * 2), elR: lerp(4, 60, (k - 0.5) * 2) }) }, star: true, expr: 'happy', look: [0.6, -1], bulb: k < 0.5 ? 'above' : 'hand', bulbK: 1 }); }
      // 63.1-65.4: corre verso Contatti e si ferma davanti alla porta
      const dx = doorX + 4;
      if (s < 65.4) { const k = (s - 63.1) / 2.3; return { ground: fy, x: lerp(ix, dx + 15, easeOut(k)), f: -1, p: withArms(P.run((s - 63.1) * 15), { shL: 50, elL: 70 }), star: true, bulb: 'hand', expr: 'happy', look: [1, 0], door: Math.min(1, (s - 63.1) / 1) }; }
      // 65.4-67: apre la porta
      if (s < 67) { const k = ease((s - 65.4) / 1.6); return idleAt(s, dx + 15, fy, -1, { arms: { ...P.carry, ...P.push }, star: true, bulb: 'hand', expr: 'happy', look: [1, 0], door: 1, doorOpen: k }); }
      // 67-68.3: entra
      if (s < 68.3) { const k = (s - 67) / 1.3; return { ground: fy, x: lerp(dx + 15, dx - 2, k), f: -1, p: withArms(P.walk((s - 67) * 8), P.carry), star: true, bulb: 'hand', expr: 'happy', look: [1, 0], door: 1, doorOpen: 1, enter: k }; }
      // 68.3-70: la porta si chiude e sparisce
      if (s < 69.3) return { gone: true, door: 1, doorOpen: 1 - ease((s - 68.3) / 0.8) };
      if (s < 70.3) return { gone: true, door: 1 - ease(s - 69.3), doorOpen: 0 };
      return { end: true };
    }

    // ---------- disegno ----------
    function drawDoor(st) {
      const dw = 21, dh = 40, x0 = doorX - dw / 2, y1 = L(3).y;
      const k = st.door ?? 0;
      if (k <= 0) { set(e.door, { opacity: 0 }); return; }
      const h = dh * easeOut(k);
      set(e.door, { opacity: Math.min(1, k * 1.4) });
      set(e.doorFrame, { x: x0, y: y1 - h, width: dw, height: h });
      set(e.doorDark, { x: x0 + 1, y: y1 - h + 1, width: dw - 2, height: Math.max(0, h - 1), opacity: (st.doorOpen ?? 0) > 0.02 ? 1 : 0 });
      const open = st.doorOpen ?? 0;
      const panelW = (dw - 2) * Math.cos(open * 80 * D);
      set(e.doorPanel, { x: x0 + 1, y: y1 - h + 1, width: Math.max(0.5, panelW), height: Math.max(0, h - 1) });
      set(e.doorKnob, { cx: x0 + 1 + Math.max(0.5, panelW) - 2.5, cy: y1 - h * 0.45, opacity: open < 0.6 ? 1 : 0 });
    }

    function draw(st, s, dt) {
      if (st.end) { set(e.g, { opacity: 0 }); set(e.door, { opacity: 0 }); return false; }
      drawDoor(st);
      if (st.gone) { set(e.g, { opacity: 0 }); return true; }

      const f = st.f || 1;
      let hipX = st.x, hipY, rot = st.rot || 0;
      const p = { ...st.p };
      if (st.headTilt) p.head = (p.head || 0) + st.headTilt;
      if (st.air) { hipY = st.hipY; }
      else if (st.sit) { hipY = lerp(st.y - 13, st.y - 1, st.k); }
      else {
        const probe = skeleton(p, 0, 0, f, 0);
        hipY = st.ground - probe.lowest;
      }
      const sk = skeleton(p, hipX, hipY, f, rot);
      const ln = (a, b) => `M${a[0].toFixed(1)} ${a[1].toFixed(1)} L${b[0].toFixed(1)} ${b[1].toFixed(1)}`;
      const body = [ln(sk.hip, sk.kneeL), ln(sk.kneeL, sk.footL), ln(sk.hip, sk.kneeR), ln(sk.kneeR, sk.footR), ln(sk.hip, sk.neck),
        ln(sk.sh, sk.elbL), ln(sk.elbL, sk.handL), ln(sk.sh, sk.elbR), ln(sk.elbR, sk.handR)].join(' ');

      // viso fluido
      const tgt = FACE[st.expr || 'neutral'];
      const kf = Math.min(1, dt * 7);
      for (const k in tgt) face[k] += (tgt[k] - face[k]) * kf;
      const look = st.look || [0.6, 0];
      face.lx += (look[0] - face.lx) * Math.min(1, dt * 9);
      face.ly += (look[1] - face.ly) * Math.min(1, dt * 9);
      if (s > nextBlink) { blinkUntil = s + 0.13; nextBlink = s + 2.4 + Math.random() * 2.6; }
      const blink = s < blinkUntil ? 0.1 : 1;

      const [hx, hy] = sk.headC;
      const ang = sk.headAngle;
      set(e.g, { opacity: st.enter ? 1 - ease(st.enter) : 1 });
      set(e.clip, { x: st.clip != null ? st.clip : -2000 });
      set(e.body, { d: body });
      set(e.headG, { transform: `translate(${hx.toFixed(1)} ${hy.toFixed(1)}) rotate(${ang.toFixed(1)}) scale(${f} 1)` });
      const ex = face.lx, ey = face.ly;
      const eo = Math.max(0.08, face.eyeOpen * blink);
      set(e.eyeL, { cx: -2.3 + ex, cy: -0.8 + ey, ry: (1.15 * eo).toFixed(2) });
      set(e.eyeR, { cx: 2.3 + ex, cy: -0.8 + ey, ry: (1.15 * eo).toFixed(2) });
      const by = -3.9;
      const brow = (cx, raise, inner) => {
        const yo = by - raise * 1.1 + ey * 0.25;
        const xi = cx + inner * 1.4, xo = cx - inner * 1.4;
        return `M${(xo + ex * 0.5).toFixed(2)} ${(yo - face.bAng * 0.5 * -1 * 0).toFixed(2)} L${(xi + ex * 0.5).toFixed(2)} ${(yo + face.bAng * 0.9).toFixed(2)}`;
      };
      set(e.brows, { d: `${brow(-2.4, face.bL, 1)} ${brow(2.4, face.bR, -1)}` });
      const mx = ex * 0.5, my = 2.9 + ey * 0.2, mw = 2.3;
      const c = face.curve * 1.8, o = face.open * 2.4;
      const mouthD = o > 0.15
        ? `M${mx - mw} ${my} Q${mx} ${my + c + o} ${mx + mw} ${my} Q${mx} ${my + c - o * 0.35} ${mx - mw} ${my} Z`
        : `M${mx - mw} ${my} Q${mx} ${my + c} ${mx + mw} ${my}`;
      set(e.mouth, { d: mouthD, fill: o > 0.15 ? INK : 'none' });

      // segni ? !
      if (st.mark) {
        set(e.mark, { x: hx + 9 * f, y: hy - 9 + Math.sin(s * 6) * 1, opacity: 1 });
        if (e.mark.textContent !== st.mark) e.mark.textContent = st.mark;
      } else set(e.mark, { opacity: 0 });
      // scintilla verso il logo
      if (st.sparkle) {
        const sp = 0.6 + Math.sin(s * 9) * 0.4;
        set(e.sparkle, { transform: `translate(${(logo.left + logo.w * 0.5).toFixed(1)} ${(logo.top + 10).toFixed(1)}) scale(${sp.toFixed(2)})`, opacity: 1 });
      } else set(e.sparkle, { opacity: 0 });

      // pesca
      let rod = '', lineD = '', starAt = null;
      if (st.fish) {
        const hand = sk.handR;
        const tip = [hand[0] + 24, hand[1] - 17];
        rod = `M${(hand[0] - 3).toFixed(1)} ${(hand[1] + 2).toFixed(1)} L${tip[0].toFixed(1)} ${tip[1].toFixed(1)}`;
        const bottom = H + 30;
        let endY = bottom;
        if (st.fish === 'cast') endY = lerp(tip[1], bottom, clamp(st.fk, 0, 1));
        if (st.fish === 'bite') endY = bottom - 8 + Math.sin(st.fk * Math.PI * 8) * 9;
        if (st.fish === 'reel') endY = lerp(bottom, tip[1] + 8, st.fk);
        if (st.fish === 'happy') endY = tip[1] + 8;
        lineD = `M${tip[0].toFixed(1)} ${tip[1].toFixed(1)} L${tip[0].toFixed(1)} ${endY.toFixed(1)}`;
        if (st.fish === 'reel' || st.fish === 'happy') starAt = { cx: tip[0], cy: endY + 8, r: 8 };
      }
      set(e.rod, { d: rod });
      set(e.line, { d: lineD });
      if (st.star) starAt = { cx: sk.handL[0] + 2 * f, cy: sk.handL[1] + 2, r: 5.5 };
      if (starAt) {
        const sp = 1 + Math.sin(s * 8) * 0.1;
        set(e.star, { points: starPoints(starAt.cx, starAt.cy, starAt.r * sp), opacity: 1 });
        set(e.glow, { cx: starAt.cx, cy: starAt.cy, r: starAt.r * 2.4, opacity: 0.55 });
      } else { set(e.star, { opacity: 0 }); set(e.glow, { opacity: 0 }); }

      // lampadina
      if (st.bulb) {
        const pos = st.bulb === 'above' ? [hx, hy - 15 - (st.bulbK || 0) * 2] : [sk.handR[0], sk.handR[1] - 4];
        set(e.bulb, { opacity: st.bulb === 'above' ? (st.bulbK ?? 1) : 1, transform: `translate(${pos[0].toFixed(1)} ${pos[1].toFixed(1)})` });
        set(e.bulbGlow, { opacity: 0.5 + Math.sin(s * 9) * 0.25 });
      } else set(e.bulb, { opacity: 0 });
      return true;
    }

    function frame(now) {
      const s = (now - t0) / 1000, dt = Math.min(0.05, (now - last) / 1000); last = now;
      if (draw(scene(s), s, dt)) raf = requestAnimationFrame(frame);
    }

    return () => { clearTimeout(start); cancelAnimationFrame(raf); window.removeEventListener('resize', measure); };
  }, [containerRef]);

  const r = (k) => (el) => { els.current[k] = el; };
  return (
    <svg aria-hidden="true" className="pointer-events-none absolute inset-0 w-full h-full" style={{ zIndex: 5, overflow: 'visible' }}>
      <defs>
        <radialGradient id="buddyStarGlow"><stop offset="0%" stopColor="#f6d36b" stopOpacity="0.9" /><stop offset="100%" stopColor="#f6d36b" stopOpacity="0" /></radialGradient>
        <radialGradient id="buddyBulbGlow"><stop offset="0%" stopColor="#ffe27a" stopOpacity="1" /><stop offset="100%" stopColor="#ffe27a" stopOpacity="0" /></radialGradient>
        <clipPath id="buddyClip"><rect ref={r('clip')} x="-2000" y="-2000" width="6000" height="6000" /></clipPath>
      </defs>
      <g ref={r('door')} opacity="0">
        <rect ref={r('doorFrame')} fill="none" stroke={INK} strokeWidth="1" rx="1" />
        <rect ref={r('doorDark')} fill="#1b2235" />
        <rect ref={r('doorPanel')} fill="#ffffff" stroke={INK} strokeWidth="0.8" />
        <circle ref={r('doorKnob')} r="0.9" fill={INK} />
      </g>
      <g ref={r('g')} opacity="0" clipPath="url(#buddyClip)">
        <path ref={r('line')} fill="none" stroke="#9aa3b5" strokeWidth="0.7" />
        <path ref={r('rod')} fill="none" stroke="#8a5a2b" strokeWidth="1.3" strokeLinecap="round" />
        <path ref={r('body')} fill="none" stroke={INK} strokeWidth="1.15" strokeLinecap="round" strokeLinejoin="round" />
        <g ref={r('headG')}>
          <circle r={LEN.head} fill="#ffffff" stroke={INK} strokeWidth="1.1" />
          <ellipse ref={r('eyeL')} rx="0.95" ry="1.15" fill={INK} />
          <ellipse ref={r('eyeR')} rx="0.95" ry="1.15" fill={INK} />
          <path ref={r('brows')} fill="none" stroke={INK} strokeWidth="0.75" strokeLinecap="round" />
          <path ref={r('mouth')} fill="none" stroke={INK} strokeWidth="0.75" strokeLinecap="round" strokeLinejoin="round" />
        </g>
        <circle ref={r('glow')} r="14" fill="url(#buddyStarGlow)" opacity="0" />
        <polygon ref={r('star')} fill={GOLD} stroke="#c9952a" strokeWidth="0.6" opacity="0" />
        <g ref={r('bulb')} opacity="0">
          <circle ref={r('bulbGlow')} r="12" fill="url(#buddyBulbGlow)" />
          <circle r="4" cy="-1" fill="#ffd84a" stroke={INK} strokeWidth="0.6" />
          <rect x="-1.7" y="2.6" width="3.4" height="2.4" rx="0.6" fill="#c9ccd3" stroke={INK} strokeWidth="0.5" />
          <path d="M-7 -6 L-9 -8 M7 -6 L9 -8 M0 -8 L0 -11" stroke="#e3b53f" strokeWidth="0.8" strokeLinecap="round" />
        </g>
        <text ref={r('mark')} fontSize="10" fontWeight="800" fontFamily="'Plus Jakarta Sans', sans-serif" fill={INK} textAnchor="middle" opacity="0">?</text>
      </g>
      <g ref={r('sparkle')} opacity="0">
        <path d="M0 -6 L1.3 -1.3 L6 0 L1.3 1.3 L0 6 L-1.3 1.3 L-6 0 L-1.3 -1.3 Z" fill={GOLD} />
      </g>
    </svg>
  );
}
