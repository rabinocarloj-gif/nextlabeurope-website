import React, { useEffect, useRef } from 'react';

// Omino stilizzato del menu da telefono (stick figure a scheletro, movimenti "a molla").
// Sbircia da dietro la forma blu del logo, osserva lo spazio, salta tra le linee con slancio
// e atterraggio ammortizzato (una volta con rotolata parkour), pensa per immagini nella nuvoletta,
// si riposa appoggiato a una lettera, pesca una stella dal fondo dello schermo, ha un'idea
// e sparisce in un laboratorio dietro una porta accanto a "Contatti".
// Parte una sola volta per caricamento del sito.

let buddyPlayed = false;

const INK = '#141414';
const GOLD = '#e3b53f';
const BLUE = '#1a4fc4';
const D = Math.PI / 180;
const LEN = { thigh: 6.6, shin: 6.6, torso: 11, neck: 1.6, head: 7, upper: 6, fore: 5.8 };

const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const lerp = (a, b, t) => a + (b - a) * t;
const ease = (t) => { const k = clamp(t, 0, 1); return k * k * (3 - 2 * k); };
const easeOut = (t) => 1 - Math.pow(1 - clamp(t, 0, 1), 3);
// profilo di velocità a trapezio: parte piano, va regolare, rallenta
const trap = (t, a = 0.22) => {
  const k = clamp(t, 0, 1), vm = 1 / (1 - a);
  if (k < a) return (vm * k * k) / (2 * a);
  if (k < 1 - a) return vm * (k - a / 2);
  return 1 - (vm * (1 - k) * (1 - k)) / (2 * a);
};

// ---------- pose (gradi; 0 = verso il basso, + = in avanti) ----------
const BASE = { torso: 3, head: 0, hipL: 4, kneeL: -6, hipR: -4, kneeR: -4, shL: 6, elL: 14, shR: -6, elR: 12 };
const KEYS = Object.keys(BASE);
const ARM = new Set(['shL', 'elL', 'shR', 'elR']);
const mixP = (a, b, t) => { const o = {}; for (const k of KEYS) o[k] = lerp(a[k] ?? BASE[k], b[k] ?? BASE[k], t); return o; };
const P = {
  idle: (s) => ({ ...BASE, torso: 3 + Math.sin(s * 2) * 1.2, shL: 6 + Math.sin(s * 2) * 2, shR: -6 - Math.sin(s * 2) * 2 }),
  walk: (ph) => ({
    torso: 5, head: 0,
    hipL: 26 * Math.sin(ph), hipR: -26 * Math.sin(ph),
    kneeL: -6 - 34 * (0.5 + 0.5 * Math.sin(ph - 1.1)), kneeR: -6 - 34 * (0.5 + 0.5 * Math.sin(ph + Math.PI - 1.1)),
    shL: -24 * Math.sin(ph), elL: 20, shR: 24 * Math.sin(ph), elR: 20,
  }),
  run: (ph) => ({
    torso: 18, head: -9,
    hipL: 46 * Math.sin(ph) + 10, hipR: -46 * Math.sin(ph) + 10,
    kneeL: -20 - 80 * (0.5 + 0.5 * Math.sin(ph - 1.3)), kneeR: -20 - 80 * (0.5 + 0.5 * Math.sin(ph + Math.PI - 1.3)),
    shL: -58 * Math.sin(ph), elL: 88, shR: 58 * Math.sin(ph), elR: 88,
  }),
  prep: { torso: 30, head: -16, hipL: 72, kneeL: -112, hipR: 64, kneeR: -106, shL: -58, elL: 22, shR: -48, elR: 28 },
  push: { torso: 16, head: -8, hipL: -6, kneeL: -4, hipR: -16, kneeR: -10, shL: 150, elL: 10, shR: 136, elR: 16 },
  airUp: { torso: 12, head: -6, hipL: 22, kneeL: -55, hipR: -24, kneeR: -42, shL: 128, elL: 22, shR: 110, elR: 26 },
  airDown: { torso: 6, head: -2, hipL: 42, kneeL: -38, hipR: 28, kneeR: -58, shL: 96, elL: 16, shR: 80, elR: 20 },
  land: { torso: 34, head: -18, hipL: 88, kneeL: -126, hipR: 76, kneeR: -118, shL: 72, elL: 18, shR: 56, elR: 24 },
  tuck: { torso: 42, head: 22, hipL: 122, kneeL: -152, hipR: 114, kneeR: -150, shL: 84, elL: 92, shR: 72, elR: 100 },
  lean: { torso: -16, head: 7, hipL: -7, kneeL: 24, hipR: 11, kneeR: -22, shL: -38, elL: -96, shR: 14, elR: 26 },
  sit: (sw) => ({ torso: -4, head: 4, hipL: 88, kneeL: -84 + sw, hipR: 92, kneeR: -96 - sw, shL: 30, elL: 30, shR: 20, elR: 40 }),
  thumbs: { shR: 78, elR: 98 },
  carry: { shL: 48, elL: 38 },
  rod: { shR: 62, elR: -20, shL: 50, elL: 20 },
};

// cinematica diretta: punti del corpo in coordinate schermo (f = verso, anche frazionario mentre si gira)
function skeleton(p, hx, hy, f, rot) {
  const cr = Math.cos(rot * D), sr = Math.sin(rot * D);
  const W = (pt) => [hx + f * (pt[0] * cr - pt[1] * sr), hy + (pt[0] * sr + pt[1] * cr)];
  const local = localSkeleton(p);
  const out = {};
  for (const k in local) out[k] = W(local[k]);
  out.headAngle = (p.torso + p.head + rot) * f;
  return out;
}
function localSkeleton(p) {
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
  return { hip, kneeL, footL, kneeR, footR, neck, sh, headC, elbL, handL, elbR, handR };
}
// cinematica inversa per il braccio davanti: porta la mano su un punto (gomito sempre verso il basso)
function armIK(sh, target) {
  const dx = target[0] - sh[0], dy = target[1] - sh[1];
  const l1 = LEN.upper, l2 = LEN.fore;
  const d = clamp(Math.hypot(dx, dy), 0.5, l1 + l2 - 0.05);
  const base = Math.atan2(dx, dy) / D;
  const alpha = Math.acos(clamp((l1 * l1 + d * d - l2 * l2) / (2 * l1 * d), -1, 1)) / D;
  let best = null;
  for (const sg of [1, -1]) {
    const a = base + sg * alpha;
    const elb = [sh[0] + Math.sin(a * D) * l1, sh[1] + Math.cos(a * D) * l1];
    const tx = sh[0] + (dx / Math.hypot(dx, dy)) * d, ty = sh[1] + (dy / Math.hypot(dx, dy)) * d;
    const fa = Math.atan2(tx - elb[0], ty - elb[1]) / D;
    if (!best || elb[1] > best.y) best = { y: elb[1], sh: a, el: fa - a };
  }
  return best;
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
function gearPath(r, teeth) {
  let d = '';
  for (let i = 0; i < teeth * 2; i++) {
    const a0 = (i / (teeth * 2)) * Math.PI * 2, a1 = ((i + 1) / (teeth * 2)) * Math.PI * 2;
    const rr = i % 2 === 0 ? r : r * 0.74;
    d += `${i === 0 ? 'M' : 'L'}${(Math.cos(a0) * rr).toFixed(2)} ${(Math.sin(a0) * rr).toFixed(2)} L${(Math.cos(a1) * rr).toFixed(2)} ${(Math.sin(a1) * rr).toFixed(2)} `;
  }
  return `${d}Z`;
}

// espressioni: sopracciglia (alzate / inclinate), occhi (apertura), bocca (curva, apertura)
const FACE = {
  neutral: { bL: 0, bR: 0, bAng: 0, eyeOpen: 1, curve: 0.3, open: 0 },
  curious: { bL: 0.9, bR: 0.6, bAng: -0.2, eyeOpen: 1.1, curve: 0.1, open: 0.15 },
  suspicious: { bL: -0.3, bR: -0.3, bAng: 0.8, eyeOpen: 0.45, curve: -0.1, open: 0 },
  happy: { bL: 0.5, bR: 0.5, bAng: -0.3, eyeOpen: 0.9, curve: 1, open: 0.25 },
  wow: { bL: 1.2, bR: 1.2, bAng: -0.3, eyeOpen: 1.25, curve: 0.2, open: 0.7 },
  thinking: { bL: -0.2, bR: 0.5, bAng: 0.4, eyeOpen: 0.85, curve: -0.1, open: 0 },
  bored: { bL: -0.2, bR: -0.2, bAng: -0.2, eyeOpen: 0.5, curve: -0.2, open: 0 },
  yawn: { bL: 0.4, bR: 0.4, bAng: -0.4, eyeOpen: 0.1, curve: 0, open: 1 },
  serious: { bL: -0.5, bR: -0.5, bAng: 1, eyeOpen: 0.8, curve: -0.3, open: 0 },
  focused: { bL: -0.3, bR: -0.3, bAng: 0.6, eyeOpen: 0.9, curve: 0.1, open: 0 },
  tired: { bL: 0.4, bR: 0.4, bAng: -0.8, eyeOpen: 0.55, curve: -0.1, open: 0.5 },
  relief: { bL: 0.9, bR: 0.9, bAng: -0.7, eyeOpen: 0.3, curve: 0.6, open: 0.3 },
};
const ICONS = ['idea', 'gear', 'scribble', 'people', 'flags', 'rocket', 'star'];

export default function MenuBuddy({ containerRef }) {
  const els = useRef({});

  useEffect(() => {
    if (buddyPlayed) return undefined;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;
    const container = containerRef.current;
    if (!container) return undefined;
    buddyPlayed = true;

    let lines = [], W = 0, H = 0, logo = { blueEdge: 86, bottom: 82, left: 24, top: 14, w: 100, h: 70 };
    const measure = () => {
      const c = container.getBoundingClientRect();
      W = c.width; H = c.height;
      lines = [...container.querySelectorAll('[data-line]')].map((el) => {
        const r = el.getBoundingClientRect(), sp = el.querySelector('span')?.getBoundingClientRect();
        return { y: r.bottom - c.top, x0: r.left - c.left, x1: r.right - c.left, tR: (sp ? sp.right : r.left + 90) - c.left };
      });
      const img = document.querySelector('nav a[aria-label="Home"] img');
      if (img) {
        const r = img.getBoundingClientRect();
        logo = { left: r.left - c.left, top: r.top - c.top, w: r.width, h: r.height, bottom: r.top - c.top + r.height * 0.985, blueEdge: r.left - c.left + r.width * 0.612 };
      }
    };

    const e = els.current;
    const set = (el, attrs) => { if (!el) return; for (const k in attrs) el.setAttribute(k, attrs[k]); };
    const L = (i) => lines[Math.min(i, lines.length - 1)] || { y: 200, x0: 32, x1: W - 32, tR: 130 };
    const X = (i, fr) => { const l = L(i); return lerp(l.x0 + 12, l.x1 - 12, fr); };
    const T = (i, gap = 16) => Math.min(L(i).tR + gap, L(i).x1 - 20);

    // punti dello spazio che l'omino osserva
    const PT = {
      toggle: () => [W - 88, logo.top + logo.h * 0.5],
      close: () => [W - 34, logo.top + logo.h * 0.5],
      logo: () => [logo.left + logo.w * 0.42, logo.top + logo.h * 0.45],
      bottom: () => [W * 0.5, H - 30],
      below: () => [W * 0.6, L(3).y + 120],
      lines: () => [W * 0.35, L(2).y - 10],
      right: () => [W - 4, L(1).y - 20],
      left: () => [4, L(2).y - 20],
      sky: () => [W * 0.55, 10],
    };
    const tour = (u, list) => {
      const total = list.reduce((a, [, d]) => a + d, 0);
      let t = u % total;
      for (const [name, d] of list) { if (t < d) return PT[name](); t -= d; }
      return PT[list[0][0]]();
    };

    // ---------- copione (costruito dopo la misura dello schermo) ----------
    let SEG = [], TOTAL = 0, doorX = 150, fishX = 260;
    function build() {
      const S = []; let t = 0;
      const add = (d, fn) => { S.push({ a: t, d, fn }); t += d; };
      const edge = logo.blueEdge, ly = logo.bottom, hid = edge - 13, out = edge + 12;
      const idle = (x, y, f, extra = {}) => (u, k, s) => ({ ground: y, x, f, p: P.idle(s), ...(typeof extra === 'function' ? extra(u, k, s) : extra) });
      const walk = (x0, x1, y, speed, extra = {}) => {
        const d = Math.max(0.6, Math.abs(x1 - x0) / speed);
        add(d, (u, k, s) => ({ ground: y, x: lerp(x0, x1, trap(k)), f: x1 >= x0 ? 1 : -1, gait: 'walk', p: P.idle(s), ...(typeof extra === 'function' ? extra(u, k, s) : extra) }));
      };
      // salto naturale: carica sulle gambe, spinta, volo balistico, atterraggio ammortizzato (o rotolata parkour)
      let impact = 0;
      const jump = (x0, y0, x1, y1, f, roll) => {
        add(0.48, () => ({ ground: y0, x: x0, f, p: P.prep, w: 10, expr: 'focused', look: [1, 0.9] }));
        add(0.1, (u, k) => ({ ground: y0, x: x0 + k * 1.5 * f, f, p: P.push, w: 30, expr: 'focused', look: [1, 0.3] }));
        const dy = y1 - y0, r = 13;
        const v0 = 2 * r + Math.sqrt(Math.max(0, 4 * r * r + 4 * r * dy)), A = dy + v0;
        const tAir = 0.4 + 0.032 * Math.sqrt(Math.max(1, dy + r));
        add(tAir, (u, k) => ({ ground: y0 - v0 * k + A * k * k, x: lerp(x0 + 1.5 * f, x1, k), f, p: k < 0.42 ? P.airUp : P.airDown, w: 15, expr: 'focused', look: [1, k < 0.5 ? 0 : 1.2] }));
        const id = ++impact;
        if (roll) {
          add(0.1, () => ({ ground: y1, x: x1, f, p: P.land, w: 34, impact: id, expr: 'focused', look: [1, 0.6] }));
          add(0.62, (u, k) => ({ ground: y1, x: x1 + f * 30 * ease(k), f, rot: 360 * ease(k), p: P.tuck, w: 36, expr: 'focused', look: [1, 0] }));
          add(0.3, () => ({ ground: y1, x: x1 + f * 30, f, p: P.land, w: 18, expr: 'focused', look: [1, 0] }));
          add(0.6, idle(x1 + f * 30, y1, f, { w: 8, expr: 'happy', look: [1, -0.2] }));
          return x1 + f * 30;
        }
        add(0.34, () => ({ ground: y1, x: x1, f, p: P.land, w: 30, impact: id, expr: 'focused', look: [1, 0.6] }));
        add(0.6, idle(x1, y1, f, { w: 8, expr: 'happy', look: [1, 0] }));
        return x1;
      };

      // 1. sbircia da dietro la forma blu del logo
      add(1.0, idle(hid, ly, 1, { clip: edge, expr: 'neutral', look: [1, 0] }));
      add(1.1, (u, k, s) => ({ ground: ly, x: hid, f: 1, p: { ...P.idle(s), torso: lerp(3, 44, ease(k)), head: lerp(0, -18, ease(k)) }, w: 9, clip: edge, expr: 'curious', lookAt: PT.toggle() }));
      add(2.4, (u, k, s) => ({ ground: ly, x: hid, f: 1, p: { ...P.idle(s), torso: 44 + Math.sin(u * 2) * 2, head: -18 }, clip: edge, expr: u < 1.3 ? 'curious' : 'suspicious', lookAt: tour(u, [['toggle', 0.8], ['lines', 0.8], ['bottom', 0.8]]) }));
      add(0.45, (u, k, s) => ({ ground: ly, x: hid, f: 1, p: { ...P.idle(s), torso: lerp(44, 3, easeOut(k)), head: lerp(-18, 0, k) }, w: 18, clip: edge, expr: 'wow', look: [-1, 0] }));
      add(0.7, idle(hid, ly, 1, { clip: edge, expr: 'neutral', look: [-0.6, 0] }));
      add(0.8, (u, k, s) => ({ ground: ly, x: hid, f: 1, p: { ...P.idle(s), torso: lerp(3, 36, ease(k)), head: lerp(0, -14, ease(k)) }, w: 9, clip: edge, expr: 'suspicious', look: [1.4, 0.2] }));
      add(0.5, (u, k, s) => ({ ground: ly, x: hid, f: 1, p: { ...P.idle(s), torso: 36, head: -14 }, clip: edge, expr: 'suspicious', look: [1.4, -0.2] }));
      walk(hid, out, ly, 17, { clip: edge, expr: 'neutral', look: [1, 0] });
      // 2. osserva tutto lo spazio
      add(3.6, (u, k, s) => {
        if (u < 1.2) return { ground: ly, x: out, f: 1, p: P.idle(s), expr: 'curious', lookAt: u < 0.6 ? PT.toggle() : PT.close() };
        if (u < 2.0) return { ground: ly, x: out, f: 1, p: P.idle(s), expr: 'wow', lookAt: PT.bottom() };
        if (u < 2.8) return { ground: ly, x: out, f: -1, p: P.idle(s), expr: 'happy', lookAt: PT.logo() };
        return { ground: ly, x: out, f: 1, p: P.idle(s), expr: 'focused', lookAt: [T(0, 14), L(0).y - 10] };
      });
      // 3. primo salto (grande dislivello): atterra e rotola tipo parkour
      const r1 = jump(out, ly, T(0, 12), L(0).y, 1, true);
      // 4. cammina pensando per immagini
      const thumbsX = Math.max(X(0, 0.62), r1 + 60);
      walk(r1, thumbsX, L(0).y, 22, (u, k) => ({
        ikR: k < 0.55 ? { rel: 'head', x: 4.6, y: 5.4 } : null,
        expr: k < 0.55 ? 'thinking' : 'curious', bubble: ['idea', 'people', 'flags'],
        lookAt: k < 0.55 ? [r1 + 90, L(0).y + 10] : tour(u, [['below', 0.9], ['right', 0.9]]),
      }));
      // 5. si gira verso il logo: stupito, poi pollice in su
      add(3.0, (u, k, s) => ({ ground: L(0).y, x: thumbsX, f: -1, p: P.idle(s), arms: u > 1.0 ? P.thumbs : null, expr: u < 1.0 ? 'wow' : 'happy', lookAt: PT.logo(), sparkle: u > 1.1 }));
      // 6. secondo salto: giù verso sinistra, accanto alla scritta "Chi Siamo"
      const r2 = jump(thumbsX, L(0).y, T(1, 18), L(1).y, -1, false);
      // 7. si appoggia alla lettera, si riposa e si asciuga il sudore
      const leanX = L(1).tR + 9;
      walk(r2, leanX + 3, L(1).y, 14, { expr: 'tired', look: [1, 0.4] });
      add(0.7, (u, k, s) => ({ ground: L(1).y, x: leanX + 3, f: 1, p: P.idle(s), expr: 'tired', look: [0.6, 0.4] }));
      add(1.0, (u, k, s) => ({ ground: L(1).y, x: lerp(leanX + 3, leanX, ease(k)), f: 1, p: { ...P.lean, torso: P.lean.torso + Math.sin(s * 4.5) * 1.5 }, w: 7, expr: 'tired', look: [1, 0.3] }));
      add(1.4, (u, k, s) => ({ ground: L(1).y, x: leanX, f: 1, p: { ...P.lean, torso: P.lean.torso + Math.sin(s * 4.5) * 1.5 }, w: 7, expr: 'tired', lookAt: tour(u, [['below', 0.7], ['right', 0.7]]) }));
      add(1.6, (u, k, s) => ({ ground: L(1).y, x: leanX, f: 1, p: { ...P.lean, torso: P.lean.torso + Math.sin(s * 3.5) * 1 }, w: 14, ikR: { rel: 'head', x: -3.5 + 8 * (0.5 - 0.5 * Math.cos((u / 0.8) * Math.PI * 2)), y: -2.6 }, expr: 'relief', look: [0.4, -0.5] }));
      add(0.5, (u, k, s) => ({ ground: L(1).y, x: leanX, f: 1, p: { ...P.lean, shR: 100 + Math.sin(u * 30) * 10 * (1 - k), elR: 10 }, w: 16, expr: 'relief', look: [1, 0] }));
      add(0.9, (u, k, s) => ({ ground: L(1).y, x: leanX, f: 1, p: P.lean, w: 7, expr: 'happy', lookAt: PT.toggle() }));
      add(0.6, (u, k, s) => ({ ground: L(1).y, x: lerp(leanX, leanX + 4, ease(k)), f: 1, p: P.idle(s), w: 9, expr: 'happy', look: [1, 0] }));
      // 8. riparte guardandosi intorno, con nuove idee
      const j3 = X(1, 0.7);
      walk(leanX + 4, j3, L(1).y, 24, (u) => ({ expr: 'curious', bubble: ['gear', 'scribble', 'rocket'], lookAt: tour(u, [['right', 1], ['bottom', 1], ['sky', 1]]) }));
      // 9. terzo salto su "Progetti", guarda giù e pensa alla stella
      const pX = jump(j3, L(1).y, X(2, 0.82), L(2).y, 1, false);
      add(3.0, (u, k, s) => ({ ground: L(2).y, x: pX, f: -1, p: P.idle(s), expr: u < 1.2 ? 'curious' : 'happy', lookAt: PT.below(), bubble: u > 0.6 ? ['star'] : null }));
      // 10. quarto salto su "Contatti" e va al punto di pesca
      fishX = X(3, 0.72);
      const cX = jump(pX, L(2).y, X(3, 0.64), L(3).y, -1, false);
      walk(cX, fishX, L(3).y, 16, { expr: 'happy', look: [1, 0.8] });
      // 11. si siede sul bordo e pesca dal fondo dello schermo
      const fy = L(3).y;
      add(1.0, (u, k, s) => ({ sit: true, k: ease(k), x: fishX, y: fy, f: 1, p: P.sit(0), w: 8, expr: 'neutral', look: [1, 1] }));
      add(1.5, (u, k, s) => {
        const sw = Math.sin(s * 2.2) * 14;
        const arm = k < 0.4 ? { shR: lerp(62, 150, k / 0.4), elR: -10 } : { shR: lerp(150, 62, (k - 0.4) / 0.6), elR: -20 };
        return { sit: true, k: 1, x: fishX, y: fy, f: 1, p: { ...P.sit(sw), ...P.rod, ...arm }, w: 16, fish: 'cast', fk: ease((k - 0.4) / 0.6), expr: 'focused', look: [1, 1.2] };
      });
      add(8.5, (u, k, s) => {
        const sw = Math.sin(s * 2.2) * 14, yawn = u > 4.6 && u < 6.1;
        return { sit: true, k: 1, x: fishX, y: fy, f: 1, p: { ...P.sit(sw), ...P.rod, ...(yawn ? { shL: 150, elL: 40 } : {}) }, w: 8, fish: 'wait', expr: yawn ? 'yawn' : u > 2.5 ? 'bored' : 'neutral', lookAt: u < 2 || u > 6.5 ? PT.bottom() : tour(u, [['sky', 1.2], ['right', 1.2]]) };
      });
      add(1.0, (u, k, s) => ({ sit: true, k: 1, x: fishX, y: fy, f: 1, p: { ...P.sit(Math.sin(s * 2.2) * 14), ...P.rod, shR: 62 + Math.sin(u * 40) * 8 }, w: 20, fish: 'bite', fk: u, expr: 'wow', lookAt: PT.bottom(), mark: '!' }));
      add(3.5, (u, k, s) => ({ sit: true, k: 1, x: fishX, y: fy, f: 1, p: { ...P.sit(Math.sin(s * 2.2) * 14), ...P.rod, shR: 62 + Math.sin(s * 9) * 18, shL: 70 + Math.sin(s * 9 + 1) * 20 }, w: 16, fish: 'reel', fk: ease(k), expr: 'focused', look: [1, lerp(1.3, -0.2, k)] }));
      add(2.5, (u, k, s) => ({ sit: true, k: 1, x: fishX, y: fy, f: 1, p: { ...P.sit(Math.sin(s * 2.2) * 14), ...P.rod, shL: 140 + Math.sin(s * 8) * 10, elL: 20 }, w: 10, fish: 'happy', expr: 'happy', look: [0.8, -0.6] }));
      add(1.0, (u, k, s) => ({ sit: true, k: 1 - ease(k), x: fishX, y: fy, f: 1, p: { ...P.idle(s), ...P.carry }, w: 8, star: true, expr: 'happy', look: [0.6, 0] }));
      // 12. avanti e indietro, serio: pensieri confusi
      add(6.0, (u, k, s) => {
        const ph = k * Math.PI * 3;
        return { ground: fy, x: fishX + Math.sin(ph) * 40, f: Math.cos(ph) >= 0 ? 1 : -1, gait: 'walk', p: P.idle(s), arms: P.carry, ikR: { rel: 'head', x: 4.6, y: 5.4 }, star: true, expr: 'serious', look: [0.4, 0.9], bubble: ['scribble', 'people', 'flags', 'gear'] };
      });
      // 13. l'idea! prende la lampadina
      add(0.8, (u, k, s) => ({ ground: fy, x: fishX, f: -1, p: { ...P.idle(s), head: -10 }, arms: P.carry, star: true, expr: u < 0.3 ? 'serious' : 'wow', look: [0, -1.4], bulb: 'above', bulbK: ease(u / 0.5) }));
      add(0.8, (u, k, s) => ({ ground: fy, x: fishX, f: -1, p: P.idle(s), arms: P.carry, ikR: k < 0.5 ? { rel: 'head', x: 0, y: -14 } : null, w: 14, star: true, expr: 'happy', look: [0.6, -1], bulb: k < 0.5 ? 'above' : 'hand', bulbK: 1 }));
      // 14. corre verso "Contatti", la porta compare, la apre ed entra nel laboratorio
      doorX = L(3).tR + 26;
      const stop = doorX + 21;
      const runD = Math.max(1.2, Math.abs(fishX - stop) / 62);
      add(runD, (u, k, s) => ({ ground: fy, x: lerp(fishX, stop, trap(k, 0.18)), f: -1, gait: 'run', p: P.idle(s), arms: P.carry, star: true, bulb: 'hand', expr: 'happy', look: [1, 0], door: clamp((u - (runD - 1.0)) / 0.45, 0, 1) }));
      add(0.7, (u, k, s) => ({ ground: fy, x: stop, f: -1, p: P.idle(s), arms: P.carry, ikR: u < 0.35 ? { rel: 'hip', x: stop - (doorX + 9.4), y: -10 } : null, w: 16, star: true, bulb: 'hand', expr: 'happy', look: [1, 0], door: 1, doorOpen: ease((u - 0.15) / 0.5) }));
      add(0.45, (u, k, s) => ({ ground: fy, x: stop, f: -1, p: P.idle(s), arms: P.carry, star: true, bulb: 'hand', expr: 'wow', lookAt: [doorX, fy - 20], door: 1, doorOpen: 1 }));
      add(0.8, (u, k, s) => ({ ground: fy, x: lerp(stop, doorX, trap(k)), f: -1, gait: 'walk', p: P.idle(s), arms: P.carry, star: true, bulb: 'hand', expr: 'happy', look: [1, -0.2], door: 1, doorOpen: 1, scale: lerp(1, 0.84, ease(k)), fade: k < 0.4 ? 1 : 1 - ease((k - 0.4) / 0.6) }));
      add(0.45, (u, k) => ({ gone: true, door: 1, doorOpen: 1 - ease(k) }));
      add(0.42, (u, k) => ({ gone: true, door: 1 - ease(k), doorOpen: 0 }));
      SEG = S; TOTAL = t;
    }
    function scene(s) {
      if (s >= TOTAL) return { end: true };
      let lo = 0, hi = SEG.length - 1;
      while (lo < hi) { const mid = (lo + hi + 1) >> 1; if (SEG[mid].a <= s) lo = mid; else hi = mid - 1; }
      const g = SEG[lo], u = s - g.a;
      return g.fn(u, u / g.d, s);
    }

    // ---------- stato fluido ----------
    const cur = { ...BASE }, vel = {};
    for (const k of KEYS) vel[k] = 0;
    let fS = 1, fV = 0, prevX = null, speed = 0, phase = 0, gaitAmt = 0, curGait = 'walk';
    const face = { ...FACE.neutral, lx: 0.6, ly: 0 };
    let nextBlink = 2.5, blinkUntil = 0, bubbleK = 0, lastImpact = 0, dust = null;
    const iconOp = {}; for (const id of ICONS) iconOp[id] = 0;
    const spring = (dt, target, w) => {
      const steps = Math.ceil(dt / 0.008), h = dt / steps;
      for (let i = 0; i < steps; i++) {
        for (const k of KEYS) {
          let diff = target[k] - cur[k];
          if (ARM.has(k)) diff = ((diff + 540) % 360) - 180; // le braccia prendono sempre la via più corta
          const a = w * w * diff - 2 * w * vel[k];
          vel[k] += a * h; cur[k] += vel[k] * h;
        }
        for (const k of ARM) cur[k] = ((cur[k] + 540) % 360) - 180;
        const af = 12 * 12 * (fTarget - fS) - 2 * 12 * fV;
        fV += af * h; fS += fV * h;
      }
    };
    let fTarget = 1;

    // ---------- disegno ----------
    function drawDoor(st, s) {
      const dw = 24, dh = 42, x0 = doorX - dw / 2, y1 = L(3).y;
      const k = st.door ?? 0;
      if (k <= 0.001) { set(e.doorBack, { opacity: 0 }); set(e.doorFront, { opacity: 0 }); return; }
      const tf = `translate(${x0.toFixed(1)} ${y1.toFixed(1)}) scale(1 ${easeOut(k).toFixed(3)}) translate(0 ${-dh})`;
      const op = Math.min(1, k * 2).toFixed(2);
      const open = clamp(st.doorOpen ?? 0, 0, 1);
      set(e.doorBack, { opacity: open > 0.004 ? op : 0, transform: tf });
      set(e.doorFront, { opacity: op, transform: tf });
      const a = open * 84 * D, w = (dw - 1) * Math.cos(a), sk = Math.sin(a) * 2.6;
      set(e.doorPanel, { points: `0.5,0.5 ${(0.5 + w).toFixed(2)},${(0.5 - sk).toFixed(2)} ${(0.5 + w).toFixed(2)},${(dh - 0.5 + sk * 0.35).toFixed(2)} 0.5,${dh - 0.5}` });
      set(e.doorKnob, { cx: (0.5 + w - 2.6).toFixed(2), cy: dh * 0.55, opacity: open < 0.55 ? 1 : 0 });
      set(e.spill, { opacity: (open * 0.85).toFixed(2) });
      // laboratorio: luci che lampeggiano, ologramma che ruota
      for (let i = 0; i < 5; i++) set(e[`led${i}`], { opacity: Math.sin(s * (3 + i * 1.7) + i * 2) > 0 ? 1 : 0.25 });
      set(e.holo, { rx: Math.abs(Math.cos(s * 2.4)) * 3.2 + 0.2 });
      set(e.scr1, { opacity: 0.75 + Math.sin(s * 7) * 0.15 });
      set(e.scr2, { opacity: 0.75 + Math.sin(s * 5 + 1) * 0.15 });
    }

    function drawBubble(st, s, dt, hx, hy) {
      bubbleK += ((st.bubble ? 1 : 0) - bubbleK) * Math.min(1, dt * 6);
      if (bubbleK < 0.01) { set(e.bubble, { opacity: 0 }); return; }
      const list = st.bubble || [];
      const active = list.length ? list[Math.floor(s / 1.6) % list.length] : null;
      for (const id of ICONS) {
        iconOp[id] += ((id === active ? 1 : 0) - iconOp[id]) * Math.min(1, dt * 7);
        set(e[`ic_${id}`], { opacity: iconOp[id].toFixed(2) });
      }
      const bx = -5 * Math.sign(fS || 1);
      set(e.bubble, { opacity: bubbleK.toFixed(2), transform: `translate(${hx.toFixed(1)} ${(hy - 7).toFixed(1)}) scale(${bubbleK.toFixed(3)}) translate(${bx} -21)` });
      set(e.tail1, { cx: (-bx * 0.75).toFixed(1), cy: 14 });
      set(e.tail2, { cx: (-bx * 0.45).toFixed(1), cy: 10.4 });
      set(e.gear, { transform: `rotate(${(s * 90) % 360})` });
      set(e.gear2, { transform: `translate(5.2 3.2) rotate(${(-s * 140) % 360})` });
      set(e.scribble, { 'stroke-dashoffset': (40 - ((s * 30) % 50)).toFixed(1) });
      set(e.flame, { transform: `scale(1 ${(0.8 + Math.sin(s * 30) * 0.25).toFixed(2)})` });
      set(e.people, { transform: `translate(0 ${(Math.sin(s * 6) * 0.5).toFixed(2)})` });
      set(e.icStar, { transform: `scale(${(1 + Math.sin(s * 6) * 0.08).toFixed(3)})` });
    }

    function draw(st, s, dt) {
      if (st.end) { set(e.g, { opacity: 0 }); set(e.doorBack, { opacity: 0 }); set(e.doorFront, { opacity: 0 }); set(e.bubble, { opacity: 0 }); return false; }
      drawDoor(st, s);
      if (st.gone) { set(e.g, { opacity: 0 }); set(e.bubble, { opacity: 0 }); return true; }

      // posa obiettivo
      const target = { ...BASE, ...(st.p || {}) };
      if (st.arms) Object.assign(target, st.arms);
      target.head += clamp(face.ly, -1.4, 1.4) * 8;
      const fixed = new Set(st.arms ? Object.keys(st.arms) : []);
      if (st.ikR) {
        const ls = localSkeleton(target);
        const ref = st.ikR.rel === 'head' ? ls.headC : ls.hip;
        const sol = armIK(ls.sh, [ref[0] + st.ikR.x, ref[1] + st.ikR.y]);
        target.shR = sol.sh; target.elR = sol.el;
        fixed.add('shR'); fixed.add('elR');
      }
      fTarget = st.f || 1;
      spring(dt, target, st.w || 12);

      // andatura calcolata dalla distanza percorsa: niente piedi che scivolano, partenze e arresti morbidi
      if (prevX == null) prevX = st.x;
      const dx = st.x - prevX; prevX = st.x;
      speed += (Math.abs(dx) / Math.max(dt, 0.001) - speed) * Math.min(1, dt * 10);
      if (st.gait) curGait = st.gait;
      const stride = curGait === 'run' ? 44 : 23;
      phase += (Math.abs(dx) / stride) * Math.PI * 2;
      const want = st.gait ? clamp(speed / (curGait === 'run' ? 40 : 18), 0, 1) : 0;
      gaitAmt += (want - gaitAmt) * Math.min(1, dt * 8);
      let pose = cur;
      if (gaitAmt > 0.01) {
        const gp = curGait === 'run' ? P.run(phase) : P.walk(phase);
        pose = {};
        for (const k of KEYS) pose[k] = fixed.has(k) ? cur[k] : lerp(cur[k], gp[k], gaitAmt);
      }

      const f = Math.abs(fS) < 0.04 ? (fS < 0 ? -0.04 : 0.04) : fS;
      const rot = st.rot || 0;
      let hipY;
      if (st.sit) hipY = lerp(st.y - 13, st.y - 1, st.k);
      else {
        const pr = skeleton(pose, 0, 0, f, rot);
        const lowest = Math.max(pr.footL[1], pr.footR[1], pr.kneeL[1], pr.kneeR[1], pr.hip[1], pr.neck[1], pr.headC[1] + LEN.head * 0.92);
        hipY = st.ground - lowest;
      }
      const sk = skeleton(pose, st.x, hipY, f, rot);
      const ln = (a, b) => `M${a[0].toFixed(1)} ${a[1].toFixed(1)} L${b[0].toFixed(1)} ${b[1].toFixed(1)}`;
      set(e.body, { d: [ln(sk.hip, sk.kneeL), ln(sk.kneeL, sk.footL), ln(sk.hip, sk.kneeR), ln(sk.kneeR, sk.footR), ln(sk.hip, sk.neck), ln(sk.sh, sk.elbL), ln(sk.elbL, sk.handL)].join(' ') });
      set(e.armF, { d: `${ln(sk.sh, sk.elbR)} ${ln(sk.elbR, sk.handR)}` });

      // viso: espressioni e sguardo sempre in dissolvenza
      const [hx, hy] = sk.headC;
      const tgt = FACE[st.expr || 'neutral'];
      const kf = Math.min(1, dt * 5);
      for (const k in tgt) face[k] += (tgt[k] - face[k]) * kf;
      let lx, ly;
      if (st.lookAt) {
        const ddx = st.lookAt[0] - hx, ddy = st.lookAt[1] - hy, n = Math.hypot(ddx, ddy) || 1;
        lx = (ddx / n) * 1.5; ly = (ddy / n) * 1.3;
      } else { const lk = st.look || [0.7, 0.1]; lx = lk[0] * Math.sign(st.f || 1); ly = lk[1]; }
      face.lx += (lx - face.lx) * Math.min(1, dt * 6);
      face.ly += (ly - face.ly) * Math.min(1, dt * 6);
      if (s > nextBlink) { blinkUntil = s + 0.14; nextBlink = s + 2.2 + Math.random() * 2.8; }
      const blink = s < blinkUntil ? 0.1 : 1;

      const sc = st.scale ?? 1;
      set(e.g, { opacity: (st.fade ?? 1).toFixed(2), transform: sc !== 1 ? `translate(${st.x} ${st.ground}) scale(${sc}) translate(${-st.x} ${-st.ground})` : '' });
      set(e.clip, { x: st.clip != null ? st.clip : -2000 });
      set(e.headG, { transform: `translate(${hx.toFixed(1)} ${hy.toFixed(1)}) rotate(${sk.headAngle.toFixed(1)})` });
      const ex = face.lx, ey = face.ly;
      const eo = Math.max(0.08, face.eyeOpen * blink);
      set(e.eyeL, { cx: (-2.3 + ex).toFixed(2), cy: (-0.8 + ey).toFixed(2), ry: (1.15 * eo).toFixed(2) });
      set(e.eyeR, { cx: (2.3 + ex).toFixed(2), cy: (-0.8 + ey).toFixed(2), ry: (1.15 * eo).toFixed(2) });
      const brow = (cx, raise, dir) => {
        const yo = -3.9 - raise * 1.1 + ey * 0.25;
        const xo = cx - dir * 1.4 + ex * 0.5, xi = cx + dir * 1.4 + ex * 0.5;
        return `M${xo.toFixed(2)} ${(yo - face.bAng * 0.25).toFixed(2)} L${xi.toFixed(2)} ${(yo + face.bAng * 0.9).toFixed(2)}`;
      };
      set(e.brows, { d: `${brow(-2.4, face.bL, 1)} ${brow(2.4, face.bR, -1)}` });
      const mx = ex * 0.5, my = 2.9 + ey * 0.2, mw = 2.3, c = face.curve * 1.8, o = face.open * 2.4;
      set(e.mouth, {
        d: o > 0.15 ? `M${mx - mw} ${my} Q${mx} ${my + c + o} ${mx + mw} ${my} Q${mx} ${my + c - o * 0.35} ${mx - mw} ${my} Z` : `M${mx - mw} ${my} Q${mx} ${my + c} ${mx + mw} ${my}`,
        fill: o > 0.15 ? INK : 'none',
      });

      if (st.mark) {
        set(e.mark, { x: hx + 9 * Math.sign(f), y: hy - 9 + Math.sin(s * 6), opacity: 1 });
        if (e.mark.textContent !== st.mark) e.mark.textContent = st.mark;
      } else set(e.mark, { opacity: 0 });
      if (st.sparkle) set(e.sparkle, { transform: `translate(${(logo.left + logo.w * 0.5).toFixed(1)} ${(logo.top + 10).toFixed(1)}) scale(${(0.6 + Math.sin(s * 9) * 0.4).toFixed(2)})`, opacity: 1 });
      else set(e.sparkle, { opacity: 0 });

      // polvere all'atterraggio
      if (st.impact && st.impact !== lastImpact) { lastImpact = st.impact; dust = { x: st.x, y: st.ground, t: s }; }
      if (dust && s - dust.t < 0.55) {
        const k = (s - dust.t) / 0.55;
        set(e.dust1, { cx: dust.x - 3 - 7 * k, cy: dust.y - 1 - k, rx: 1.4 + 2 * k, ry: 0.8 + 0.7 * k, opacity: ((1 - k) * 0.7).toFixed(2) });
        set(e.dust2, { cx: dust.x + 3 + 7 * k, cy: dust.y - 1 - k, rx: 1.4 + 2 * k, ry: 0.8 + 0.7 * k, opacity: ((1 - k) * 0.7).toFixed(2) });
      } else { set(e.dust1, { opacity: 0 }); set(e.dust2, { opacity: 0 }); }

      // pesca
      let rod = '', lineD = '', starAt = null;
      if (st.fish) {
        const hand = sk.handR, tip = [hand[0] + 24, hand[1] - 17];
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
      if (st.star) starAt = { cx: sk.handL[0] + 2 * Math.sign(f), cy: sk.handL[1] + 2, r: 5.5 };
      if (starAt) {
        const sp = 1 + Math.sin(s * 8) * 0.1;
        set(e.star, { points: starPoints(starAt.cx, starAt.cy, starAt.r * sp), opacity: 1 });
        set(e.glow, { cx: starAt.cx, cy: starAt.cy, r: starAt.r * 2.4, opacity: 0.55 });
      } else { set(e.star, { opacity: 0 }); set(e.glow, { opacity: 0 }); }
      if (st.bulb) {
        const pos = st.bulb === 'above' ? [hx, hy - 15 - (st.bulbK || 0) * 2] : [sk.handR[0], sk.handR[1] - 4];
        set(e.bulb, { opacity: st.bulb === 'above' ? (st.bulbK ?? 1) : 1, transform: `translate(${pos[0].toFixed(1)} ${pos[1].toFixed(1)})` });
        set(e.bulbGlow, { opacity: 0.5 + Math.sin(s * 9) * 0.25 });
      } else set(e.bulb, { opacity: 0 });

      drawBubble(st, s, dt, hx, hy);
      return true;
    }

    let raf, t0 = null, last = 0;
    function frame(now) {
      const s = (now - t0) / 1000, dt = Math.min(0.05, Math.max(0.001, (now - last) / 1000)); last = now;
      if (draw(scene(s), s, dt)) raf = requestAnimationFrame(frame);
    }
    const start = setTimeout(() => { measure(); build(); t0 = performance.now(); last = t0; raf = requestAnimationFrame(frame); }, 700);
    window.addEventListener('resize', measure);
    return () => { clearTimeout(start); cancelAnimationFrame(raf); window.removeEventListener('resize', measure); };
  }, [containerRef]);

  const r = (k) => (el) => { els.current[k] = el; };
  const cloud = [[-8, 1, 6], [-2, -4, 7], [6, -3, 6.5], [10, 2, 5], [1, 4, 6.2], [-11, -2, 4.5]];
  return (
    <svg aria-hidden="true" className="pointer-events-none absolute inset-0 w-full h-full" style={{ zIndex: 5, overflow: 'visible' }}>
      <defs>
        <radialGradient id="buddyStarGlow"><stop offset="0%" stopColor="#f6d36b" stopOpacity="0.9" /><stop offset="100%" stopColor="#f6d36b" stopOpacity="0" /></radialGradient>
        <radialGradient id="buddyBulbGlow"><stop offset="0%" stopColor="#ffe27a" stopOpacity="1" /><stop offset="100%" stopColor="#ffe27a" stopOpacity="0" /></radialGradient>
        <linearGradient id="labBg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#0b1033" /><stop offset="100%" stopColor="#2b0f55" /></linearGradient>
        <radialGradient id="labGlow" cx="0.5" cy="0.55" r="0.6"><stop offset="0%" stopColor="#7c3aed" stopOpacity="0.55" /><stop offset="100%" stopColor="#7c3aed" stopOpacity="0" /></radialGradient>
        <linearGradient id="labSpill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#22d3ee" stopOpacity="0.55" /><stop offset="100%" stopColor="#e879f9" stopOpacity="0" /></linearGradient>
        <clipPath id="buddyClip"><rect ref={r('clip')} x="-2000" y="-2000" width="6000" height="6000" /></clipPath>
        <clipPath id="labClip"><rect x="0" y="0" width="24" height="42" /></clipPath>
      </defs>

      {/* interno della porta: laboratorio tecnologico */}
      <g ref={r('doorBack')} opacity="0">
        <polygon ref={r('spill')} points="0,42 24,42 36,52 -12,52" fill="url(#labSpill)" opacity="0" />
        <g clipPath="url(#labClip)">
          <rect width="24" height="42" fill="url(#labBg)" />
          <rect width="24" height="42" fill="url(#labGlow)" />
          <polygon points="0,31 24,31 24,42 0,42" fill="#140a3a" />
          <path d="M12 27 L-8 42 M12 27 L3 42 M12 27 L12 42 M12 27 L21 42 M12 27 L32 42 M0 34 L24 34 M0 38 L24 38" stroke="#22d3ee" strokeWidth="0.3" opacity="0.55" />
          <rect ref={r('scr1')} x="2.5" y="6" width="8" height="5.5" rx="0.6" fill="#22d3ee" />
          <path d="M3.6 8 L7 8 M3.6 9.6 L9 9.6" stroke="#0b1033" strokeWidth="0.45" />
          <rect ref={r('scr2')} x="13.5" y="5" width="8" height="6.5" rx="0.6" fill="#e879f9" />
          <path d="M14.5 10 L16 8 L17.5 9 L19.5 6.5 L20.6 7.5" fill="none" stroke="#2b0f55" strokeWidth="0.5" />
          <rect x="3.5" y="14" width="4.5" height="3" rx="0.4" fill="#a3e635" opacity="0.85" />
          <rect x="16" y="14" width="5" height="3" rx="0.4" fill="#fbbf24" opacity="0.85" />
          <rect x="0.6" y="18" width="3.2" height="13" fill="#1e293b" stroke="#38bdf8" strokeWidth="0.25" />
          <rect x="20.4" y="18" width="3.2" height="13" fill="#1e293b" stroke="#f472b6" strokeWidth="0.25" />
          {[0, 1, 2, 3, 4].map((i) => (
            <circle key={i} ref={r(`led${i}`)} cx={i < 3 ? 2.2 : 22} cy={20.5 + (i % 3) * 3.5} r="0.55" fill={['#22d3ee', '#a3e635', '#f472b6', '#fbbf24', '#22d3ee'][i]} />
          ))}
          <polygon points="9,31 15,31 13.6,22.5 10.4,22.5" fill="#22d3ee" opacity="0.22" />
          <circle cx="12" cy="21.5" r="3.2" fill="none" stroke="#67e8f9" strokeWidth="0.4" />
          <ellipse ref={r('holo')} cx="12" cy="21.5" rx="3.2" ry="3.2" fill="none" stroke="#67e8f9" strokeWidth="0.35" />
          <ellipse cx="12" cy="21.5" rx="3.2" ry="1" fill="none" stroke="#67e8f9" strokeWidth="0.35" />
          <ellipse cx="12" cy="31" rx="4.2" ry="0.9" fill="#22d3ee" opacity="0.7" />
        </g>
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
        <path ref={r('armF')} fill="none" stroke={INK} strokeWidth="1.15" strokeLinecap="round" strokeLinejoin="round" />
        <circle ref={r('glow')} r="14" fill="url(#buddyStarGlow)" opacity="0" />
        <polygon ref={r('star')} fill={GOLD} stroke="#c9952a" strokeWidth="0.6" opacity="0" />
        <g ref={r('bulb')} opacity="0">
          <circle ref={r('bulbGlow')} r="12" fill="url(#buddyBulbGlow)" />
          <circle r="4" cy="-1" fill="#ffd84a" stroke={INK} strokeWidth="0.6" />
          <rect x="-1.7" y="2.6" width="3.4" height="2.4" rx="0.6" fill="#c9ccd3" stroke={INK} strokeWidth="0.5" />
          <path d="M-7 -6 L-9 -8 M7 -6 L9 -8 M0 -8 L0 -11" stroke={GOLD} strokeWidth="0.8" strokeLinecap="round" />
        </g>
        <text ref={r('mark')} fontSize="10" fontWeight="800" fontFamily="'Plus Jakarta Sans', sans-serif" fill={INK} textAnchor="middle" opacity="0">!</text>
      </g>

      {/* telaio e anta della porta (davanti all'omino) */}
      <g ref={r('doorFront')} opacity="0">
        <polygon ref={r('doorPanel')} fill="#ffffff" stroke={INK} strokeWidth="0.8" strokeLinejoin="round" />
        <circle ref={r('doorKnob')} r="0.95" fill={INK} />
        <rect x="0" y="0" width="24" height="42" fill="none" stroke={INK} strokeWidth="1" rx="1" />
      </g>

      <ellipse ref={r('dust1')} fill="#c9ccd3" opacity="0" />
      <ellipse ref={r('dust2')} fill="#c9ccd3" opacity="0" />

      {/* nuvoletta dei pensieri */}
      <g ref={r('bubble')} opacity="0">
        <circle ref={r('tail1')} r="1.3" fill="#fff" stroke={INK} strokeWidth="0.7" />
        <circle ref={r('tail2')} r="2" fill="#fff" stroke={INK} strokeWidth="0.7" />
        {cloud.map(([x, y, rr]) => <circle key={`o${x}`} cx={x} cy={y} r={rr} fill="#fff" stroke={INK} strokeWidth="0.8" />)}
        {cloud.map(([x, y, rr]) => <circle key={`i${x}`} cx={x} cy={y} r={rr - 0.75} fill="#fff" />)}
        <g ref={r('ic_idea')} opacity="0">
          <circle cy="-1.5" r="3.8" fill="#ffd84a" stroke={INK} strokeWidth="0.5" />
          <rect x="-1.6" y="2.2" width="3.2" height="2.2" rx="0.5" fill="#c9ccd3" stroke={INK} strokeWidth="0.4" />
          <path d="M-6.5 -5.5 L-8 -7 M6.5 -5.5 L8 -7 M0 -6.6 L0 -8.6" stroke={GOLD} strokeWidth="0.8" strokeLinecap="round" />
        </g>
        <g ref={r('ic_gear')} opacity="0">
          <g transform="translate(-1.5 -0.5)"><path ref={r('gear')} d={gearPath(4.4, 8)} fill={BLUE} /></g>
          <circle cx="-1.5" cy="-0.5" r="1.4" fill="#fff" />
          <path ref={r('gear2')} d={gearPath(2.6, 6)} fill={GOLD} />
        </g>
        <g ref={r('ic_scribble')} opacity="0">
          <path ref={r('scribble')} d="M-9 1 C-7 -6 -4 6 -2 -1 S2 -6 3 1 S6 4 8 -2 S10 0 9 3" fill="none" stroke={INK} strokeWidth="0.75" strokeLinecap="round" strokeDasharray="40 10" />
        </g>
        <g ref={r('ic_people')} opacity="0">
          <g ref={r('people')}>
            <path d="M-8 -0.6 L8 -0.6" stroke={INK} strokeWidth="0.5" />
            {[[-5.5, BLUE], [0, GOLD], [5.5, INK]].map(([x, col]) => (
              <g key={x} transform={`translate(${x} 0)`}>
                <circle cy="-4.3" r="1.5" fill={col} />
                <path d="M0 -2.7 L0 1.6 M0 1.6 L-1.4 4.6 M0 1.6 L1.4 4.6" stroke={col} strokeWidth="0.7" strokeLinecap="round" />
              </g>
            ))}
          </g>
        </g>
        <g ref={r('ic_flags')} opacity="0">
          <rect x="-10" y="-3.6" width="9" height="6.2" rx="0.4" fill={BLUE} />
          {Array.from({ length: 12 }, (_, i) => <circle key={i} cx={-5.5 + Math.cos((i / 12) * Math.PI * 2) * 2} cy={-0.5 + Math.sin((i / 12) * Math.PI * 2) * 2} r="0.38" fill="#ffd84a" />)}
          <rect x="1" y="-3.6" width="3" height="6.2" fill="#169b62" />
          <rect x="4" y="-3.6" width="3" height="6.2" fill="#ffffff" stroke="#e5e7eb" strokeWidth="0.2" />
          <rect x="7" y="-3.6" width="3" height="6.2" fill="#cd212a" />
        </g>
        <g ref={r('ic_rocket')} opacity="0" transform="rotate(40)">
          <g transform="translate(0 4.6)"><path ref={r('flame')} d="M-1.3 0 L0 4 L1.3 0 Z" fill="#f97316" /></g>
          <path d="M0 -6 C2.2 -3.5 2.2 1.5 1.5 4.6 L-1.5 4.6 C-2.2 1.5 -2.2 -3.5 0 -6 Z" fill="#fff" stroke={INK} strokeWidth="0.6" />
          <circle cy="-1.5" r="1" fill={BLUE} />
          <path d="M-1.6 2.5 L-3.2 5 L-1.5 4.6 Z M1.6 2.5 L3.2 5 L1.5 4.6 Z" fill="#cd212a" />
        </g>
        <g ref={r('ic_star')} opacity="0">
          <path d="M-3 -8.5 Q-3 -3 1 -3" fill="none" stroke="#9aa3b5" strokeWidth="0.5" />
          <g ref={r('icStar')}><polygon points={starPoints(0, 1, 5)} fill={GOLD} stroke="#c9952a" strokeWidth="0.5" /></g>
        </g>
      </g>

      <g ref={r('sparkle')} opacity="0">
        <path d="M0 -6 L1.3 -1.3 L6 0 L1.3 1.3 L0 6 L-1.3 1.3 L-6 0 L-1.3 -1.3 Z" fill={GOLD} />
      </g>
    </svg>
  );
}
