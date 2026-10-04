import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

// Omino guida della home page.
// Segue lo scorrimento della pagina e accompagna il visitatore sezione per sezione:
// saluta nel titolo, accende l'anello di stelle, presenta il pulsante, scende in paracadute,
// mostra i pilastri, sfoglia il direttivo, si teletrasporta, fa partire il razzo, scende in teleferica
// sui progetti, arriva in ombrello sui partner, fa il saluto militare e sparisce teletrasportandosi.
// Parte una sola volta per caricamento del sito.

let homeBuddyPlayed = false;

const INK = '#141414';
const GOLD = '#e3b53f';
const BLUE = '#1a4fc4';
const D = Math.PI / 180;
const LEN = { thigh: 6.6, shin: 6.6, torso: 11, neck: 1.6, head: 7, upper: 6, fore: 5.8 };

const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const lerp = (a, b, t) => a + (b - a) * t;
const ease = (t) => { const k = clamp(t, 0, 1); return k * k * (3 - 2 * k); };
const easeOut = (t) => 1 - Math.pow(1 - clamp(t, 0, 1), 3);
const backOut = (t) => { const k = clamp(t, 0, 1) - 1; return 1 + 2.4 * k * k * k + 1.4 * k * k; };
const trap = (t, a = 0.22) => {
  const k = clamp(t, 0, 1), vm = 1 / (1 - a);
  if (k < a) return (vm * k * k) / (2 * a);
  if (k < 1 - a) return vm * (k - a / 2);
  return 1 - (vm * (1 - k) * (1 - k)) / (2 * a);
};
const pulse = (u, t0, dur) => { const k = (u - t0) / dur; return k > 0 && k < 1 ? Math.sin(k * Math.PI) : 0; };

// ---------- pose (gradi; 0 = verso il basso, + = in avanti) ----------
const BASE = { torso: 3, head: 0, hipL: 4, kneeL: -6, hipR: -4, kneeR: -4, shL: 6, elL: 14, shR: -6, elR: 12 };
const KEYS = Object.keys(BASE);
const ARM = new Set(['shL', 'elL', 'shR', 'elR']);
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
  flail: (s) => ({ torso: 4, head: -6, hipL: 20 + Math.sin(s * 14) * 25, kneeL: -40, hipR: -10 - Math.sin(s * 14) * 25, kneeR: -50, shL: 150 + Math.sin(s * 16) * 30, elL: 30, shR: 120 - Math.sin(s * 16) * 30, elR: 40 }),
  land: { torso: 34, head: -18, hipL: 88, kneeL: -126, hipR: 76, kneeR: -118, shL: 72, elL: 18, shR: 56, elR: 24 },
  tuck: { torso: 42, head: 22, hipL: 122, kneeL: -152, hipR: 114, kneeR: -150, shL: 84, elL: 92, shR: 72, elR: 100 },
  hang: (s) => ({ torso: 0, head: -4, hipL: 10 + Math.sin(s * 2.6) * 7, kneeL: -12, hipR: -2 - Math.sin(s * 2.6) * 7, kneeR: -18, shL: 166, elL: 8, shR: 158, elR: 12 }),
  zip: (s) => ({ torso: 4, head: -2, hipL: 26 + Math.sin(s * 3) * 4, kneeL: -24, hipR: 18 - Math.sin(s * 3) * 4, kneeR: -34, shL: 176, elL: 0, shR: 172, elR: 2 }),
  umbrella: (s) => ({ torso: -2, head: -4, hipL: 14 + Math.sin(s * 2.2) * 10, kneeL: -16, hipR: -6 - Math.sin(s * 2.2) * 10, kneeR: -22, shL: 70, elL: 40, shR: 174, elR: 2 }),
  cheer: { torso: -4, head: -8, shL: 168, elL: 10, shR: 160, elR: 16 },
  shrug: { torso: 2, head: 10, shL: 22, elL: 78, shR: 26, elR: 74 },
  tada: { torso: -4, head: -6, shL: 120, elL: 14, shR: 140, elR: 10 },
  book: { shL: 58, elL: 58, shR: 62, elR: 50 },
  stand: { torso: -3, head: -2, hipL: 2, kneeL: -2, hipR: -2, kneeR: -2, shL: 2, elL: 6 },
  sit: (sw) => ({ torso: -4, head: 4, hipL: 88, kneeL: -84 + sw, hipR: 92, kneeR: -96 - sw, shL: 30, elL: 30, shR: 20, elR: 40 }),
  thumbs: { shR: 78, elR: 98 },
};

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
function skeleton(p, hx, hy, f, rot) {
  const cr = Math.cos(rot * D), sr = Math.sin(rot * D);
  const local = localSkeleton(p), out = {};
  for (const k in local) { const pt = local[k]; out[k] = [hx + f * (pt[0] * cr - pt[1] * sr), hy + (pt[0] * sr + pt[1] * cr)]; }
  out.headAngle = (p.torso + p.head + rot) * f;
  return out;
}
function armIK(sh, target) {
  const dx = target[0] - sh[0], dy = target[1] - sh[1], l1 = LEN.upper, l2 = LEN.fore;
  const n = Math.hypot(dx, dy) || 1, d = clamp(n, 0.5, l1 + l2 - 0.05);
  const base = Math.atan2(dx, dy) / D;
  const alpha = Math.acos(clamp((l1 * l1 + d * d - l2 * l2) / (2 * l1 * d), -1, 1)) / D;
  const tx = sh[0] + (dx / n) * d, ty = sh[1] + (dy / n) * d;
  let best = null;
  for (const sg of [1, -1]) {
    const a = base + sg * alpha;
    const elb = [sh[0] + Math.sin(a * D) * l1, sh[1] + Math.cos(a * D) * l1];
    const fa = Math.atan2(tx - elb[0], ty - elb[1]) / D;
    if (!best || elb[1] > best.y) best = { y: elb[1], sh: a, el: fa - a };
  }
  return best;
}
function starPoints(cx, cy, r) {
  const pts = [];
  for (let k = 0; k < 10; k++) {
    const rad = k % 2 === 0 ? r : r * 0.45, a = (k / 10) * Math.PI * 2 - Math.PI / 2;
    pts.push(`${(cx + Math.cos(a) * rad).toFixed(2)},${(cy + Math.sin(a) * rad).toFixed(2)}`);
  }
  return pts.join(' ');
}
function gearPath(r, teeth) {
  let d = '';
  for (let i = 0; i < teeth * 2; i++) {
    const a0 = (i / (teeth * 2)) * Math.PI * 2, a1 = ((i + 1) / (teeth * 2)) * Math.PI * 2, rr = i % 2 === 0 ? r : r * 0.74;
    d += `${i === 0 ? 'M' : 'L'}${(Math.cos(a0) * rr).toFixed(2)} ${(Math.sin(a0) * rr).toFixed(2)} L${(Math.cos(a1) * rr).toFixed(2)} ${(Math.sin(a1) * rr).toFixed(2)} `;
  }
  return `${d}Z`;
}

const FACE = {
  neutral: { bL: 0, bR: 0, bAng: 0, eyeOpen: 1, curve: 0.3, open: 0 },
  curious: { bL: 0.9, bR: 0.6, bAng: -0.2, eyeOpen: 1.1, curve: 0.1, open: 0.15 },
  happy: { bL: 0.5, bR: 0.5, bAng: -0.3, eyeOpen: 0.9, curve: 1, open: 0.25 },
  joy: { bL: 0.8, bR: 0.8, bAng: -0.5, eyeOpen: 0.6, curve: 1.2, open: 0.6 },
  wow: { bL: 1.2, bR: 1.2, bAng: -0.3, eyeOpen: 1.25, curve: 0.2, open: 0.7 },
  thinking: { bL: -0.2, bR: 0.5, bAng: 0.4, eyeOpen: 0.85, curve: -0.1, open: 0 },
  focused: { bL: -0.3, bR: -0.3, bAng: 0.6, eyeOpen: 0.9, curve: 0.1, open: 0 },
  proud: { bL: 0.6, bR: 0.6, bAng: -0.4, eyeOpen: 0.55, curve: 0.9, open: 0 },
  shrug: { bL: 1.1, bR: 0.7, bAng: -0.6, eyeOpen: 1, curve: -0.2, open: 0.1 },
  yawn: { bL: 0.4, bR: 0.4, bAng: -0.4, eyeOpen: 0.1, curve: 0, open: 1 },
  determined: { bL: -0.2, bR: -0.2, bAng: 0.7, eyeOpen: 0.85, curve: 0.6, open: 0 },
};
const ICONS = ['idea', 'gear', 'people', 'flags', 'rocket', 'down', 'heart', 'boat'];

export default function HomeBuddy() {
  const els = useRef({});
  const holder = typeof document !== 'undefined' ? document.body : null;

  useEffect(() => {
    if (homeBuddyPlayed) return undefined;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;
    homeBuddyPlayed = true;
    const e = els.current;
    const set = (el, attrs) => { if (!el) return; for (const k in attrs) el.setAttribute(k, attrs[k]); };

    // ---------- misure della pagina ----------
    const $ = (n) => document.querySelector(`[data-buddy="${n}"]`);
    const docRect = (el) => {
      const r = el.getBoundingClientRect(), sx = window.scrollX, sy = window.scrollY;
      return { l: r.left + sx, t: r.top + sy, r: r.right + sx, b: r.bottom + sy, w: r.width, h: r.height, cx: r.left + sx + r.width / 2, cy: r.top + sy + r.height / 2 };
    };
    const R = (n) => { const el = $(n); return el ? docRect(el) : null; };
    const range = document.createRange();
    // righe di testo di un elemento, con la linea delle maiuscole (dove l'omino appoggia i piedi)
    const lines = (n) => {
      const el = $(n); if (!el) return [];
      range.selectNodeContents(el);
      const fs = parseFloat(getComputedStyle(el).fontSize) || 16;
      const sx = window.scrollX, sy = window.scrollY, out = [];
      for (const r of range.getClientRects()) {
        if (r.width < 2) continue;
        const row = out.find((o) => Math.abs(o.t - (r.top + sy)) < fs * 0.4);
        if (row) { row.l = Math.min(row.l, r.left + sx); row.r = Math.max(row.r, r.right + sx); row.b = Math.max(row.b, r.bottom + sy); }
        else out.push({ l: r.left + sx, r: r.right + sx, t: r.top + sy, b: r.bottom + sy });
      }
      return out.map((o) => {
        const h = o.b - o.t, base = o.b - h * 0.16;
        return { ...o, w: o.r - o.l, cx: (o.l + o.r) / 2, cy: base - fs * 0.36, cap: base - fs * 0.71, fs };
      });
    };
    const VW = () => window.innerWidth, VH = () => window.innerHeight;
    const K = VW() < 640 ? 1.2 : 1.75; // scala dell'omino
    const viewer = () => [window.scrollX + VW() / 2, window.scrollY + VH() * 0.55];

    // ---------- costruttore di sequenze ----------
    const seq = () => { const S = []; let t = 0; return { S, add(d, fn) { S.push({ a: t, d, fn }); t += d; }, get T() { return t; } }; };
    const fx = (ex, u, k, s) => (typeof ex === 'function' ? ex(u, k, s) : ex);
    const stand = (q, d, x, y, f, ex = {}) => q.add(d, (u, k, s) => ({ x, ground: y, f, p: P.idle(s), ...fx(ex, u, k, s) }));
    const walk = (q, x0, x1, y, speed, ex = {}) => {
      const d = Math.max(0.5, Math.abs(x1 - x0) / (speed * K));
      q.add(d, (u, k, s) => ({ x: lerp(x0, x1, trap(k)), ground: y, f: x1 >= x0 ? 1 : -1, gait: 'walk', p: P.idle(s), ...fx(ex, u, k, s) }));
    };
    let impactId = 0, floatToggle = 0;
    const SP = 1.3; // velocità generale delle scene
    const topY = () => window.scrollY + 70 + 55 * K; // subito sotto la barra in alto
    const offTop = (pt) => pt.y < window.scrollY + 20;
    // teletrasporto: colonna di luce, l'omino si assottiglia e scompare / ricompare
    const beamOut = (q, a, f, quick) => {
      q.add(quick ? 0.6 : 0.85, (u, k) => ({ x: a.x, ground: a.y, f, p: P.stand, arms: { shR: 40, elR: 30 }, w: 12, expr: 'happy', look: [0, 0.1], beam: ease(k / 0.4), sx: lerp(1, 0.06, ease((k - 0.25) / 0.75)), sy: lerp(1, 1.5, ease((k - 0.25) / 0.75)), flicker: k > 0.3 }));
      q.add(quick ? 0.2 : 0.35, (u, k) => ({ gone: true, beamAt: a, beam: 1 - ease(k) }));
    };
    const beamIn = (q, b, f, quick) => {
      q.add(quick ? 0.2 : 0.3, (u, k) => ({ gone: true, beamAt: b, beam: ease(k) }));
      q.add(quick ? 0.6 : 0.8, (u, k, s) => ({ x: b.x, ground: b.y, f, p: P.idle(s), w: 12, expr: 'wow', look: [0.6, 0], beam: 1 - ease((k - 0.3) / 0.7), sx: lerp(0.06, 1, backOut(k / 0.8)), sy: lerp(1.5, 1, backOut(k / 0.8)), flicker: k < 0.45 }));
    };
    const holdChute = (s) => ({ ...P.idle(s), shL: 166, elL: 8, shR: 158, elR: 12 });
    const holdUmb = (s) => ({ ...P.idle(s), shR: 174, elR: 2, shL: 50, elL: 30 });

    // profilo di velocità con accelerazione e frenata indipendenti (a0 = quota di avvio, a1 = quota di frenata)
    const glide = (t, a0, a1) => {
      const k = clamp(t, 0, 1), vm = 1 / (1 - a0 / 2 - a1 / 2);
      if (a0 > 0 && k < a0) return (vm * k * k) / (2 * a0);
      if (k < 1 - a1) return vm * (k - a0 / 2);
      return 1 - (vm * (1 - k) * (1 - k)) / (2 * a1);
    };
    // paracadute / ombrello: guarda giù, apre, sente la presa del vento, un passo oltre il bordo,
    // scende accelerando e frenando, prepara le gambe, atterra ammortizzando mentre la vela si affloscia
    function float(q, a, b, um) {
      const f = b.x >= a.x ? 1 : -1;
      const top = topY();
      let sx, sy, enter = false;
      const can = (v, ex = {}) => (um ? { umbrella: v, ...ex } : { chute: v, ...ex });
      const hold = um ? holdUmb : holdChute;
      if (offTop(a) || (a.y < top && b.y - top > 60 * K)) { enter = true; sx = b.x - f * 46 * K; sy = Math.max(top, Math.min(a.y, b.y - 40 * K)); }
      else {
        q.add(0.4, (u, k, s) => ({ x: a.x, ground: a.y, f, p: { ...P.idle(s), torso: 14, head: 16 }, w: 9, expr: 'curious', lookAt: [b.x, b.y] }));
        q.add(0.6, (u, k, s) => ({ x: a.x, ground: a.y, f, p: hold(s), w: 11, ...can(easeOut(k / 0.8)), lift: pulse(u, 0.32, 0.28) * 2.5 * K, expr: k < 0.4 ? 'curious' : 'joy', lookAt: [a.x, a.y - 70 * K] }));
        q.add(0.42, (u, k, s) => ({ x: lerp(a.x, a.x + f * 12 * K, ease(k)), ground: a.y + k * k * 6 * K, f, gait: 'walk', p: hold(s), w: 12, ...can(1), expr: 'joy', look: [1, 1] }));
        sx = a.x + f * 12 * K; sy = a.y + 6 * K;
      }
      const dd = clamp((b.y - sy) / ((um ? 110 : 135) * K), 1.1, um ? 3.6 : 3.2);
      q.add(dd, (u, k, s) => {
        const p = glide(k, enter ? 0 : 0.18, 0.24);
        const amp = (1 - k) * (1 - k * 0.5);
        const sway = Math.sin(u * (um ? 2.4 : 2.9) + 0.6) * amp;
        const tug = enter ? 0 : Math.sin(clamp(u / 0.45, 0, 1) * Math.PI) * 4 * K; // la vela "prende" l'aria
        const base = um ? P.umbrella(s) : P.hang(s);
        const flare = k > 0.78 ? { ...base, hipL: 32, kneeL: -18, hipR: 22, kneeR: -30, torso: -4 } : base;
        return { x: lerp(sx, b.x, ease(k)) + sway * 7 * K, ground: lerp(sy, b.y, p) - tug, f, rot: sway * (um ? 10 : 7), p: flare, w: k > 0.78 ? 9 : 7, ...can(1), expr: k < 0.7 ? 'joy' : 'focused', lookAt: k < 0.45 ? viewer() : [b.x + f * 10 * K, b.y + 30 * K] };
      });
      const id = ++impactId;
      q.add(0.34, (u, k, s) => ({ x: b.x, ground: b.y, f, p: P.land, w: 22, impact: id, ...can(um ? 1 - 0.5 * ease(k) : 1, um ? {} : { chuteDrop: 0.45 * ease(k) }), expr: 'happy', look: [1, 0.5] }));
      q.add(0.6, (u, k, s) => ({ x: b.x, ground: b.y, f, p: um ? { ...P.idle(s), shR: lerp(120, -6, ease(k)), elR: 10 } : P.idle(s), w: 9, ...can(um ? 0.5 * (1 - ease(k)) : 1, um ? {} : { chuteDrop: 0.45 + 0.55 * ease(k) }), expr: 'happy', look: [1, 0] }));
      return { ...b, f };
    }
    // corda: compare il cavo, ci si aggrappa con le mani (il corpo pende dalle mani), scivola con
    // l'inerzia che fa oscillare le gambe, rallenta, si lascia andare e atterra
    const ZL = localSkeleton({ ...BASE, ...P.zip(0) });
    const REACH = Math.max(ZL.footL[1], ZL.footR[1]) - (ZL.handL[1] + ZL.handR[1]) / 2;
    const HANDX = (ZL.handL[0] + ZL.handR[0]) / 2;
    function rope(q, a, b) {
      let f = b.x >= a.x ? 1 : -1;
      const top = topY(), H = (REACH + 3) * K;
      let xs = a.x, ys = a.y;
      const enter = offTop(a);
      if (enter) { xs = b.x - f * Math.max(110 * K, Math.min(260 * K, (b.y - top) * 0.7)); if (xs < window.scrollX + 10) { f = -f; xs = b.x - f * 110 * K; } ys = Math.min(top, b.y - 10 * K); }
      const hx = HANDX * K * f;
      const A0 = [xs + hx, ys - H], B0 = [b.x + hx, b.y - H], zip = { a: A0, b: B0 };
      if (!enter) {
        q.add(0.45, (u, k, s) => ({ x: a.x, ground: a.y, f, p: P.idle(s), w: 10, zip, zipK: ease(k), expr: 'curious', lookAt: [lerp(A0[0], B0[0], 0.35 * k), lerp(A0[1], B0[1], 0.35 * k)] }));
        q.add(0.32, (u, k, s) => ({ x: a.x, ground: a.y, f, p: { ...P.zip(s), hipL: 4, kneeL: -6, hipR: -4, kneeR: -4 }, w: 13, zip, zipK: 1, expr: 'determined', look: [0.4, -1.3] }));
        q.add(0.2, (u, k, s) => ({ x: a.x, ground: a.y - 3 * K * ease(k), f, p: P.zip(s), w: 16, zip, zipK: 1, expr: 'joy', look: [1, -0.6] }));
      }
      const ds = clamp(Math.hypot(B0[0] - A0[0], B0[1] - A0[1]) / (330 * K), 0.8, 2.4);
      let endRot = 0;
      q.add(ds, (u, k, s) => {
        const p = enter ? glide(k, 0, 0.45) : glide(k, 0.35, 0.35);
        const acc = enter ? (k < 0.55 ? 0 : -1) : (k < 0.35 ? 1 : k < 0.65 ? 0 : -1);
        const rot = acc * 9 + Math.sin(u * 6) * 2.5 * (1 - k);
        endRot = rot;
        const hp = [lerp(A0[0], B0[0], p), lerp(A0[1], B0[1], p)];
        return { x: hp[0] - hx, ground: hp[1] + H, hangPt: hp, f, rot, p: P.zip(s), w: 12, zip, zipK: 1, expr: 'joy', lookAt: k < 0.6 ? viewer() : [b.x, b.y], trolley: true };
      });
      q.add(0.16, (u, k, s) => ({ x: b.x, ground: b.y - 3 * K * (1 - k * k), f, rot: endRot * (1 - k), p: { ...P.zip(s), shL: lerp(176, 120, k), shR: lerp(172, 110, k) }, w: 14, zip, zipK: 1, expr: 'joy', look: [1, 0.8] }));
      const id = ++impactId;
      q.add(0.32, (u, k) => ({ x: b.x, ground: b.y, f, p: P.land, w: 22, impact: id, zip, zipK: 1, zipFade: k, expr: 'happy', look: [1, 0.4] }));
      q.add(0.35, (u, k, s) => ({ x: b.x, ground: b.y, f, p: P.idle(s), w: 9, expr: 'happy', look: [1, 0] }));
      return { ...b, f };
    }
    function move(q, a, b, mode = 'auto', opt = {}) {
      if (!a) { beamIn(q, b, b.f ?? 1); return { ...b, f: b.f ?? 1 }; }
      const dx = b.x - a.x, dy = b.y - a.y;
      if (mode === 'walk' && (Math.abs(dy) > 12 * K || offTop(a))) mode = 'auto';
      if (mode !== 'teleport' && dy < -12 * K) mode = 'teleport';
      if ((mode === 'parachute' || mode === 'umbrella') && dy < 40 * K) mode = 'rope';
      if (mode === 'auto') {
        if (Math.abs(dy) <= 12 * K && opt.walk && !offTop(a)) mode = 'walk';
        else if (dy < 150 * K && !offTop(a)) mode = 'rope';
        else mode = (floatToggle++ % 2) ? 'umbrella' : 'parachute';
      }
      if (mode === 'walk') { walk(q, a.x, b.x, a.y, 38); return { ...b, f: dx >= 0 ? 1 : -1 }; }
      if (mode === 'teleport') { if (!offTop(a)) beamOut(q, a, a.f, opt.quick ?? true); beamIn(q, b, b.f ?? (dx >= 0 ? 1 : -1), opt.quick ?? true); return { ...b, f: b.f ?? (dx >= 0 ? 1 : -1) }; }
      if (mode === 'rope') return rope(q, a, b);
      return float(q, a, b, mode === 'umbrella');
    }

    // ---------- gesti ricorrenti ----------
    const stomp = (u, t0) => { const b = pulse(u, t0, 0.38); return { hipR: 58 * b, kneeR: -78 * b }; };
    const waveHand = (s) => ({ rel: 'head', x: 5.5 + Math.sin(s * 11) * 2.6, y: -9 });
    const heart = { rel: 'sh', x: 1.6, y: 3.2 };
    // posto a sedere sulla barca del progetto 2 (segue il dondolio dell'icona)
    const boatSeat = () => {
      const icon = $('project-icon-1'); if (!icon) return null;
      const r = docRect(icon), sc = r.w / 64, g = icon.querySelector('.boat-bob');
      let m = [1, 0, 0, 1, 0, 0];
      const tr = g && getComputedStyle(g).transform;
      if (tr && tr.startsWith('matrix(')) m = tr.slice(7, -1).split(',').map(Number);
      const px = 41 - 32, py = 46 - 48;
      return { x: r.l + (32 + m[0] * px + m[2] * py + m[4]) * sc, y: r.t + (48 + m[1] * px + m[3] * py + m[5]) * sc, rot: Math.atan2(m[1], m[0]) / D };
    };

    // ---------- atti, uno per sezione ----------
    const ACTS = [
      { // 0 — si affaccia dal logo, saluta, si presenta; poi titolo, stelle e pulsante
        anchor: 'hero-t1', mode: 'none',
        entry() {
          const img = document.querySelector('nav a[aria-label="Home"] img'); if (!img) return null;
          const r = docRect(img), edge = r.l + r.w * 0.612;
          return { x: edge - 13 * K, y: r.t + r.h * 0.985, f: 1, edge };
        },
        build(q, a) {
          const edge = a.edge, hid = a.x, ly = a.y, out = edge + 16 * K;
          const L1 = lines('hero-t1')[0], L3 = lines('hero-t3')[0], cta = R('hero-cta'), ring = R('hero-ring');
          const title = L1 ? [L1.cx, L1.cy] : viewer();
          const lean = (k0, k1, h0, h1) => (u, k, s) => ({ p: { ...P.idle(s), torso: lerp(k0, k1, ease(k)), head: lerp(h0, h1, ease(k)) } });
          stand(q, 0.5, hid, ly, 1, { clip: edge, expr: 'neutral', look: [1, 0] });
          stand(q, 0.7, hid, ly, 1, (u, k, s) => ({ ...lean(3, 44, 0, -18)(u, k, s), w: 12, clip: edge, expr: 'curious', lookAt: title }));
          stand(q, 1.3, hid, ly, 1, (u, k, s) => ({ p: { ...P.idle(s), torso: 44, head: -18 }, clip: edge, expr: u < 0.8 ? 'curious' : 'wow', lookAt: u < 0.6 ? title : viewer() }));
          stand(q, 0.3, hid, ly, 1, (u, k, s) => ({ ...lean(44, 3, -18, 0)(u, k, s), w: 20, clip: edge, expr: 'wow', look: [-1, 0] }));
          stand(q, 0.4, hid, ly, 1, { clip: edge, expr: 'neutral', look: [-0.5, 0] });
          stand(q, 0.5, hid, ly, 1, (u, k, s) => ({ ...lean(3, 36, 0, -14)(u, k, s), w: 12, clip: edge, expr: 'happy', lookAt: viewer() }));
          walk(q, hid, out, ly, 30, { clip: edge, expr: 'happy', lookAt: viewer() });
          // saluta e si presenta
          stand(q, 1.6, out, ly, 1, (u, k, s) => ({ ikR: u > 0.15 && u < 1.5 ? waveHand(s) : null, expr: 'joy', look: [0, 0.2] }));
          stand(q, 1.7, out, ly, 1, (u, k, s) => {
            const bow = pulse(u, 0.45, 0.9);
            return { p: { ...P.stand, torso: -3 + bow * 38, head: bow * 12 }, ikR: heart, w: 12, expr: bow > 0.3 ? 'proud' : 'happy', look: [0, 0.2] };
          });
          stand(q, 1.0, out, ly, 1, (u, k, s) => ({ p: { ...P.idle(s), ...P.tada }, expr: 'joy', look: [0, 0.1] }));
          let p = { x: out, y: ly, f: 1 };
          if (!L1) return p;
          // giù sul titolo con l'ombrello
          p = move(q, p, { x: L1.l + L1.w * 0.28, y: L1.cap }, 'umbrella');
          const endX = L1.l + L1.w * 0.86;
          walk(q, p.x, endX, p.y, 34, (u, k) => ({ ikR: k < 0.45 ? { rel: 'head', x: 4.6, y: 5.4 } : null, expr: k < 0.45 ? 'thinking' : 'curious', lookAt: [lerp(p.x, endX, k) + 30 * K, p.y + 30 * K] }));
          const t3 = L3 ? [L3.cx, L3.cy] : viewer();
          stand(q, 1.2, endX, p.y, -1, (u) => ({ ikR: u > 0.25 ? { world: t3 } : null, expr: u < 0.4 ? 'wow' : 'happy', lookAt: t3 }));
          p = { x: endX, y: p.y, f: -1 };
          if (L3) {
            p = move(q, p, { x: L3.l + L3.w * 0.55, y: L3.cap }, 'rope');
            stand(q, 1.5, p.x, p.y, p.f, (u, k, s) => ({ p: { ...P.idle(s), ...P.cheer }, lift: Math.abs(Math.sin(u * Math.PI * 2.6)) * 6 * K * (1 - k * 0.6), expr: 'joy', look: [0, -0.3] }));
          }
          const rc = ring ? [ring.cx, ring.cy] : [VW() - 60, p.y];
          stand(q, 2.0, p.x, p.y, rc[0] >= p.x ? 1 : -1, (u) => ({ ikR: u > 0.15 && u < 1.3 ? { world: rc } : null, fire: u > 0.4 ? { key: 'ring', ev: 'buddy:ring' } : null, expr: u < 1 ? 'wow' : 'joy', lookAt: rc }));
          if (cta) {
            const c = { x: cta.l + cta.w * 0.74, y: cta.t };
            p = move(q, p, c, 'parachute');
            stand(q, 1.9, c.x, c.y, -1, (u, k, s) => ({ p: { ...P.idle(s), torso: 14, head: 6 }, ikR: { world: [cta.cx - cta.w * 0.15, cta.cy] }, hl: 'hero-cta', expr: 'happy', lookAt: u < 1 ? [cta.cx, cta.cy] : viewer() }));
            stand(q, 1.2, c.x, c.y, 1, () => ({ ikR: { rel: 'hip', x: 9, y: 10 }, expr: 'happy', look: [0.5, 1.2] }));
            return { x: c.x, y: c.y, f: 1 };
          }
          return p;
        },
      },
      { // 1 — "Una nuova generazione per l'Europa."
        anchor: 'about-title', mode: 'parachute',
        entry() { const L = lines('about-title')[0]; return L && { x: L.l + L.w * 0.32, y: L.cap, f: 1 }; },
        build(q, a) {
          const acc = lines('about-accent'), A = acc[acc.length - 1];
          const at = A ? [A.cx, A.cy] : [a.x + 80, a.y + 30];
          stand(q, 2.0, a.x, a.y, at[0] >= a.x ? 1 : -1, (u) => ({ ikR: u > 0.25 ? { world: at } : null, expr: 'happy', lookAt: u < 1.2 ? at : viewer() }));
          stand(q, 1.3, a.x, a.y, 1, () => ({ p: P.stand, ikR: heart, expr: 'proud', look: [0.4, -0.6] }));
          return { x: a.x, y: a.y, f: 1 };
        },
      },
      { // 2 — i tre pilastri (unica sezione con la nuvoletta dei pensieri)
        anchor: 'pillars', mode: 'auto',
        entry() { const r = R('pillar-icon-0'); return r && { x: r.cx, y: r.t, f: 1 }; },
        build(q, a) {
          const ic = [0, 1, 2].map((i) => R(`pillar-icon-${i}`));
          stand(q, 2.4, a.x, a.y, 1, (u, k, s) => {
            const g = clamp((u - 0.3) / 1.4, 0, 1), st = g + Math.sin(g * Math.PI * 6) * 0.05;
            return { p: { ...P.idle(s), torso: lerp(10, -6, g), head: lerp(4, -12, g) }, ikR: { rel: 'hip', x: lerp(-2, 9, st), y: lerp(2, -27, st) }, hl: 'pillar-0', expr: u < 0.5 ? 'curious' : u < 1.7 ? 'determined' : 'joy', look: [0.8, lerp(0.6, -1.3, g)], bubble: u > 1.5 ? ['rocket'] : null };
          });
          let p = move(q, a, { x: ic[1].cx, y: ic[1].t });
          stand(q, 2.6, p.x, p.y, 1, (u) => ({ arms: P.book, book: u < 2.0 ? 1 : 0, hl: 'pillar-1', expr: u < 1.8 ? 'focused' : 'wow', look: u < 1.8 ? [Math.sin(u * 5) * 0.9, 1] : [0.6, -0.8], bubble: u > 1.9 ? ['idea'] : null }));
          p = move(q, p, { x: ic[2].cx, y: ic[2].t });
          stand(q, 2.6, p.x, p.y, 1, (u) => ({ p: P.stand, ikR: heart, orbit: true, hl: 'pillar-2', expr: 'proud', look: [0.5, -1], bubble: u > 1.2 ? ['flags'] : null }));
          return p;
        },
      },
      { // 3 — il direttivo
        anchor: 'team-row', mode: 'umbrella',
        entry() { const c = R('team-0'); return c && { x: c.l + c.w * 0.4, y: c.t, f: 1 }; },
        build(q, a) {
          const cards = [0, 1, 2].map((i) => R(`team-${i}`));
          const allVisible = cards.every((c) => c && c.l >= 0 && c.r <= VW());
          const name = (i) => { const r = R(`team-name-${i}`); return r ? [r.l + Math.min(r.w, 160) * 0.5, r.cy] : [a.x, a.y + 60]; };
          if (allVisible) {
            let p = a;
            const gestures = ['present', 'tada', 'thumbs'];
            cards.forEach((c, i) => {
              const x = c.l + c.w * 0.4;
              if (i > 0) p = move(q, p, { x, y: c.t }, 'rope');
              const g = gestures[i];
              stand(q, 1.9, x, c.t, -1, (u, k, s) => ({
                p: g === 'tada' && u > 0.5 ? { ...P.idle(s), ...P.tada } : { ...P.idle(s), torso: 12, head: 8 },
                arms: g === 'thumbs' && u > 0.7 ? P.thumbs : null,
                ikR: g === 'present' || (g === 'tada' && u <= 0.5) || (g === 'thumbs' && u <= 0.7) ? { world: name(i) } : null,
                hl: `team-${i}`, expr: 'happy', lookAt: u < 1 ? name(i) : viewer(),
              }));
              p = { x, y: c.t, f: -1 };
            });
            return p;
          }
          const visibleCard = () => {
            let best = 0, bd = 1e9;
            for (let i = 0; i < 3; i++) { const r = R(`team-${i}`); if (!r) continue; const d = Math.abs(r.cx - (window.scrollX + VW() / 2)); if (d < bd) { bd = d; best = i; } }
            return best;
          };
          const cardTarget = () => { const i = visibleCard(), r = R(`team-${i}`); return { i, pt: [r.l + r.w * 0.4, r.t + r.h * 0.35] }; };
          stand(q, 1.9, a.x, a.y, -1, (u, k, s) => ({ p: { ...P.idle(s), torso: 12, head: 8 }, ikR: { world: name(0) }, hl: 'team-0', expr: 'happy', lookAt: u < 1 ? name(0) : viewer() }));
          const nb = R('team-next');
          if (!nb) return a;
          let p = move(q, a, { x: nb.cx, y: nb.t });
          for (let n = 1; n <= 2; n++) {
            stand(q, 0.9, p.x, p.y, -1, (u) => ({ p: { ...BASE, ...stomp(u, 0.2) }, click: u > 0.4 ? { key: `next${n}`, name: 'team-next' } : null, expr: 'determined', look: [0.6, 1.2] }));
            stand(q, 1.9, p.x, p.y, -1, (u) => { const c = cardTarget(); return { ikR: u > 0.3 ? { world: c.pt } : null, hl: `team-${c.i}`, expr: u < 0.5 ? 'curious' : 'happy', lookAt: u < 1.1 ? c.pt : viewer() }; });
          }
          return p;
        },
      },
      { // 4 — missione 1: il razzo
        anchor: 'mission-0', mode: 'teleport',
        entry() { const r = R('mission-icon-0'); return r && { x: r.cx, y: r.t, f: 1 }; },
        build(q, a) {
          const ic = R('mission-icon-0');
          stand(q, 0.5, a.x, a.y, 1, { hl: 'mission-0', expr: 'curious', look: [0.6, 1.3] });
          stand(q, 1.0, a.x, a.y, 1, (u) => ({ p: { ...BASE, ...stomp(u, 0.05), ...stomp(u, 0.5) }, hl: 'mission-0', fire: u > 0.75 ? { key: 'rocket', ev: 'buddy:mission', detail: 0 } : null, expr: 'determined', look: [0.6, 1.3] }));
          // il razzo si carica sotto i suoi piedi: si ripara, poi esulta guardandolo partire
          stand(q, 1.1, a.x, a.y, 1, (u, k, s) => ({ x: a.x + Math.sin(s * 60) * 0.6 * K, p: { ...P.land, shL: 165, elL: 120, shR: 160, elR: 125, head: 10 }, w: 16, hl: 'mission-0', expr: 'wow', look: [0.3, 1.2] }));
          const sky = [ic.r + 60 * K, ic.t - 80 * K];
          stand(q, 1.9, a.x, a.y, 1, (u, k, s) => ({ p: { ...P.idle(s), ...P.cheer }, lift: Math.abs(Math.sin(u * Math.PI * 2.4)) * 5 * K, hl: 'mission-0', expr: 'joy', lookAt: sky }));
          return { ...a, f: 1 };
        },
      },
      { // 5 — missione 2: formazione, dal cappello alla lampadina
        anchor: 'mission-1', mode: 'auto',
        entry() { const r = R('mission-icon-1'); return r && { x: r.cx, y: r.t, f: 1 }; },
        build(q, p) {
          const faces = ['curious', 'thinking', 'focused'];
          for (let n = 0; n < 3; n++) stand(q, 0.8, p.x, p.y, 1, (u) => ({ p: { ...BASE, ...stomp(u, 0.08) }, hl: 'mission-1', fire: u > 0.3 ? { key: `edu${n}`, ev: 'buddy:mission', detail: 1 } : null, expr: faces[n], look: [0.6, 1.3] }));
          stand(q, 1.8, p.x, p.y, 1, (u) => ({ hl: 'mission-1', bulb: u < 1.5 ? ease(u / 0.35) : 0, expr: u < 0.4 ? 'wow' : 'joy', look: [0, -1.3], bubble: u > 0.7 ? ['idea'] : null }));
          return { ...p, f: 1 };
        },
      },
      { // 6 — missione 3: il mondo diventa una persona, e lui la saluta
        anchor: 'mission-2', mode: 'auto',
        entry() { const r = R('mission-icon-2'); return r && { x: r.cx, y: r.t, f: 1 }; },
        build(q, p) {
          stand(q, 0.8, p.x, p.y, 1, (u) => ({ p: { ...BASE, ...stomp(u, 0.1) }, hl: 'mission-2', fire: u > 0.35 ? { key: 'civic', ev: 'buddy:mission', detail: 2 } : null, expr: 'determined', look: [0.6, 1.3] }));
          stand(q, 2.0, p.x, p.y, 1, (u, k, s) => ({ ikR: u > 0.5 ? waveHand(s) : null, hl: 'mission-2', expr: u < 0.5 ? 'wow' : 'joy', look: u < 0.8 ? [0.4, 1.3] : [0, 0.2] }));
          return { ...p, f: 1 };
        },
      },
      { // 7 — progetto 1: la bussola
        anchor: 'project-0', mode: 'rope',
        entry() { const c = R('project-0'), i = R('project-icon-0'); return c && i && { x: i.cx, y: c.t, f: 1 }; },
        build(q, a) {
          const i0 = R('project-icon-0');
          const far = (d) => [a.x + d * 400 * K, a.y - 20 * K];
          stand(q, 3.6, a.x, a.y, 1, (u) => {
            const f = u < 1 ? 1 : u < 2 ? -1 : 1;
            return { f, p: { ...BASE, torso: 8, head: -4 }, ikR: u < 2.4 ? { rel: 'head', x: 3.2, y: -4.4 } : u > 2.7 ? { world: far(1) } : null, hl: 'project-0', expr: u < 2.1 ? 'focused' : u < 2.7 ? 'wow' : 'determined', lookAt: u < 2 ? far(f) : u < 2.5 ? [i0.cx, i0.cy] : far(1) };
          });
          return { ...a, f: 1 };
        },
      },
      { // 8 — progetto 2: rema seduto sulla barca
        anchor: 'project-1', mode: 'auto',
        entry() { const b = boatSeat(); return b && { x: b.x, y: b.y, f: 1 }; },
        build(q, p) {
          const seat0 = { x: p.x, y: p.y };
          const inBoat = (ex) => (u, k, s) => { const b = boatSeat() || seat0; return { x: b.x, ground: b.y, f: 1, hl: 'project-1', ...ex(u, k, s, b) }; };
          q.add(0.6, inBoat((u, k, s, b) => ({ sit: true, sitK: ease(k), rot: b.rot, p: P.sit(0), w: 10, expr: 'happy', look: [1, 0.8] })));
          q.add(4.0, inBoat((u, k, s, b) => ({ sit: true, sitK: 1, rot: b.rot, p: { ...P.sit(4), shR: 50 + Math.sin(s * 3.6) * 32, elR: 40 + Math.cos(s * 3.6) * 26, shL: 40 + Math.sin(s * 3.6) * 30, elL: 46 + Math.cos(s * 3.6) * 24, torso: -4 + Math.sin(s * 3.6) * 8 }, w: 14, oar: true, expr: 'joy', look: [u < 2 ? 1 : 0, Math.sin(s) * 0.3] })));
          q.add(0.6, inBoat((u, k, s, b) => ({ sit: true, sitK: 1 - ease(k), rot: b.rot, p: P.idle(s), w: 10, expr: 'happy', look: [0.6, 0] })));
          q.add(1.4, inBoat((u, k, s, b) => ({ rot: b.rot, p: P.stand, ikR: heart, expr: 'proud', look: [0.2, 0.1] })));
          return { ...seat0, f: 1 };
        },
      },
      { // 9 — partner: bussa sulle schede "Coming soon", indica "Contattaci", saluto militare, sparisce
        anchor: 'partner-0', mode: 'umbrella',
        entry() { const c = R('partner-0'); return c && { x: c.l + c.w * 0.5, y: c.t, f: 1 }; },
        build(q, a) {
          const c0 = R('partner-0'), c1 = R('partner-1'), cta = lines('partners-cta')[0];
          stand(q, 1.2, a.x, a.y, 1, (u) => ({ p: { ...BASE, ...stomp(u, 0.1), ...stomp(u, 0.55) }, hl: 'partner-0', ripple: [c0.cx, c0.cy], expr: 'curious', look: [0.6, 1.3] }));
          stand(q, 1.2, a.x, a.y, 1, () => ({ p: { ...BASE, torso: 40, head: 14 }, w: 10, ikR: { rel: 'head', x: 3.2, y: -4.4 }, hl: 'partner-0', expr: 'curious', lookAt: [c0.cx, c0.cy] }));
          stand(q, 1.3, a.x, a.y, 1, (u, k, s) => ({ p: { ...P.idle(s), ...P.shrug }, expr: 'shrug', look: [0, 0.1] }));
          let p = a;
          if (c1 && Math.abs(c1.t - c0.t) < 10) {
            p = move(q, a, { x: c1.l + c1.w * 0.5, y: c1.t }, 'rope');
            stand(q, 1.0, p.x, p.y, 1, (u) => ({ p: { ...BASE, ...stomp(u, 0.12) }, hl: 'partner-1', ripple: [c1.cx, c1.cy], expr: 'happy', look: [0.6, 1.3] }));
          }
          if (cta) {
            const t = { x: cta.l + cta.w * 0.5, y: cta.cap - 2 * K };
            p = move(q, p, t);
            stand(q, 2.3, t.x, t.y, 1, (u, k, s) => ({ p: u < 1.1 ? { ...P.idle(s), torso: 14, head: 10 } : { ...P.idle(s), ...P.tada }, ikR: u < 1.1 ? { world: [cta.cx, cta.cy + cta.fs * 0.2] } : null, expr: 'joy', lookAt: u < 1.1 ? [cta.cx, cta.cy] : viewer() }));
          }
          // saluto militare, contento, e via col teletrasporto
          q.add(0.3, (u, k) => ({ x: p.x, ground: p.y, f: 1, p: P.stand, w: 14, lift: Math.sin(k * Math.PI) * 3 * K, expr: 'happy', look: [0, 0.1] }));
          q.add(1.7, () => ({ x: p.x, ground: p.y, f: 1, p: P.stand, ikR: { rel: 'head', x: 4.4, y: -3.4 }, w: 22, expr: 'proud', look: [0, 0.1] }));
          q.add(0.35, () => ({ x: p.x, ground: p.y, f: 1, p: P.stand, w: 14, expr: 'joy', look: [0, 0.1] }));
          beamOut(q, p, 1);
          q.add(0.2, () => ({ gone: true, finished: true }));
          return null;
        },
      },
    ];

    // ---------- regia: segue lo scorrimento ----------
    let act = -1, run = null, pos = null, waitFrom = 0, pending = null, done = false, lastXY = null, offSince = null, grace = 0;
    const anchorRect = (i) => { const el = $(ACTS[i].anchor); return el ? el.getBoundingClientRect() : null; };
    const passed = (i) => { const r = anchorRect(i); return !r || r.bottom < VH() * 0.1; };
    const nextAct = () => { for (let i = act + 1; i < ACTS.length; i++) if (!passed(i)) return i; return -1; };
    function startAct(i, s) {
      const entry = ACTS[i].entry();
      if (!entry) { act = i; return; }
      const q = seq();
      let arrived = entry;
      if (!(i === 0 && act < 0)) {
        const from = act < 0 ? null : (lastXY ? { x: lastXY[0], y: lastXY[1], f: pos?.f ?? 1 } : pos);
        arrived = move(q, from, entry, i > act + 1 ? 'teleport' : ACTS[i].mode);
      }
      const exit = ACTS[i].build(q, arrived);
      act = i; run = { q, s0: s }; pos = exit; lastXY = null; offSince = null; grace = s + 0.8;
      if (e.svg) e.svg.dataset.state = `act-${i}`;
    }
    function waitState(u, s) {
      const c = u % 9;
      if (act + 1 < ACTS.length && c > 3 && c < 5) return { x: pos.x, ground: pos.y, f: pos.f, p: P.idle(s), ikR: { rel: 'hip', x: 9, y: 10 }, expr: 'happy', look: [0.5, 1.2] };
      const pts = [viewer(), [pos.x + 300 * pos.f, pos.y + 200], [pos.x - 200 * pos.f, pos.y - 120], viewer()];
      return { x: pos.x, ground: pos.y, f: pos.f, p: { ...P.idle(s), hipR: c > 6 && c < 7.6 ? Math.max(0, Math.sin(s * 9)) * 10 : BASE.hipR }, expr: c < 2 ? 'happy' : 'neutral', lookAt: pts[Math.floor(c / 2.25) % pts.length] };
    }
    function scene(s) {
      // appena l'omino esce dallo schermo verso l'alto, passa subito alla sezione che si sta guardando
      const j = nextAct();
      const off = lastXY && lastXY[1] < window.scrollY + 20 && s > grace;
      if (off) { if (offSince == null) offSince = s; } else offSince = null;
      if (j >= 0 && offSince != null && s - offSince > 0.25) { const r = anchorRect(j); if (r && r.top < VH() * 0.95) { startAct(j, s); return scene(s); } }
      if (run) {
        const u = (s - run.s0) * SP;
        if (u < run.q.T) {
          const S = run.q.S;
          let lo = 0, hi = S.length - 1;
          while (lo < hi) { const mid = (lo + hi + 1) >> 1; if (S[mid].a <= u) lo = mid; else hi = mid - 1; }
          const g = S[lo];
          return g.fn(u - g.a, (u - g.a) / g.d, s);
        }
        run = null; waitFrom = s;
        if (act === ACTS.length - 1) { done = true; return { gone: true, finished: true }; }
      }
      if (j >= 0) {
        const r = anchorRect(j);
        if (r && r.top < VH() * 0.72) {
          if (pending == null) pending = s + 0.25;
          else if (s >= pending) { pending = null; startAct(j, s); return scene(s); }
        } else pending = null;
      }
      if (e.svg && e.svg.dataset.state !== `wait-${act}`) e.svg.dataset.state = `wait-${act}`;
      return pos ? waitState(s - waitFrom, s) : { gone: true };
    }


    // ---------- stato fluido dello scheletro ----------
    const cur = { ...BASE }, vel = {}; for (const k of KEYS) vel[k] = 0;
    let fS = 1, fV = 0, fTarget = 1, prevX = null, speed = 0, phase = 0, gaitAmt = 0, curGait = 'walk', hipYPrev = -13;
    const face = { ...FACE.neutral, lx: 0.6, ly: 0 };
    let lastDrop = 0, nextBlink = 2, blinkUntil = 0, bubbleK = 0, lastImpact = 0, dust = null, chuteK = 0, umbK = 0, bookK = 0, bulbK = 0, orbitK = 0;
    const iconOp = {}; for (const id of ICONS) iconOp[id] = 0;
    const fired = new Set();
    let hlEl = null, hlName = null;
    const setHL = (name) => {
      if (name === hlName) return;
      if (hlEl) hlEl.classList.remove('buddy-on');
      hlName = name; hlEl = name ? $(name) : null;
      if (hlEl) hlEl.classList.add('buddy-on');
    };
    const spring = (dt, target, w) => {
      const steps = Math.ceil(dt / 0.008), h = dt / steps;
      for (let i = 0; i < steps; i++) {
        for (const k of KEYS) {
          let diff = target[k] - cur[k];
          if (ARM.has(k)) diff = ((diff + 540) % 360) - 180;
          vel[k] += (w * w * diff - 2 * w * vel[k]) * h; cur[k] += vel[k] * h;
        }
        for (const k of ARM) cur[k] = ((cur[k] + 540) % 360) - 180;
        fV += (144 * (fTarget - fS) - 24 * fV) * h; fS += fV * h;
      }
    };
    const smooth = (v, t, dt, r) => v + (t - v) * Math.min(1, dt * r);

    function draw(st, s, dt) {
      const menuOpen = !!document.querySelector('[data-mobile-menu]');
      if (e.svg) e.svg.style.opacity = menuOpen ? '0' : '1';
      if (!st.gone && st.x != null) lastXY = [st.x, st.ground];
      set(e.clip, { x: st.clip != null ? st.clip : -1e6 });
      set(e.world, { transform: `translate(${(-window.scrollX).toFixed(1)} ${(-window.scrollY).toFixed(1)})` });
      // eventi verso il sito
      if (st.fire && !fired.has(st.fire.key)) { fired.add(st.fire.key); window.dispatchEvent(new CustomEvent(st.fire.ev, { detail: st.fire.detail })); }
      if (st.click && !fired.has(st.click.key)) { fired.add(st.click.key); $(st.click.name)?.click(); }
      setHL(st.gone ? null : st.hl || null);

      // teletrasporto: colonna di luce
      const bAt = st.beamAt || (st.gone ? null : { x: st.x, y: st.ground });
      if (st.beam > 0.01 && bAt) {
        set(e.beam, { opacity: st.beam.toFixed(2), transform: `translate(${bAt.x.toFixed(1)} ${bAt.y.toFixed(1)}) scale(${K})` });
        for (let i = 0; i < 9; i++) {
          const ph = (s * 0.9 + i / 9) % 1;
          set(e[`spark${i}`], { cx: (Math.sin(i * 2.3 + s * 3) * 9).toFixed(2), cy: (-ph * 66).toFixed(2), opacity: (Math.sin(ph * Math.PI) * 0.9).toFixed(2) });
        }
      } else set(e.beam, { opacity: 0 });

      // teleferica
      if (st.zip) {
        const zk = st.zipK ?? 1, fade = 1 - (st.zipFade ?? 0);
        const [ax, ay] = st.zip.a, [bx, by] = st.zip.b;
        set(e.zipLine, { x1: ax, y1: ay, x2: lerp(ax, bx, zk), y2: lerp(ay, by, zk), opacity: fade.toFixed(2) });
        set(e.zipA, { cx: ax, cy: ay, opacity: fade.toFixed(2) });
        set(e.zipB, { cx: bx, cy: by, opacity: (zk > 0.98 ? fade : 0).toFixed(2) });
      } else { set(e.zipLine, { opacity: 0 }); set(e.zipA, { opacity: 0 }); set(e.zipB, { opacity: 0 }); }

      // increspature quando bussa
      if (st.ripple) {
        for (let i = 0; i < 2; i++) { const ph = (s * 1.6 + i * 0.5) % 1; set(e[`rip${i}`], { cx: st.ripple[0], cy: st.ripple[1], r: (4 + ph * 26) * K, opacity: ((1 - ph) * 0.5).toFixed(2) }); }
      } else { set(e.rip0, { opacity: 0 }); set(e.rip1, { opacity: 0 }); }

      // polvere all'atterraggio
      if (st.impact && st.impact !== lastImpact) { lastImpact = st.impact; dust = { x: st.x, y: st.ground, t: s }; }
      if (dust && s - dust.t < 0.55) {
        const k = (s - dust.t) / 0.55;
        set(e.dust1, { cx: dust.x - (3 + 8 * k) * K, cy: dust.y - (1 + k) * K, rx: (1.6 + 2.4 * k) * K, ry: (0.9 + 0.8 * k) * K, opacity: ((1 - k) * 0.7).toFixed(2) });
        set(e.dust2, { cx: dust.x + (3 + 8 * k) * K, cy: dust.y - (1 + k) * K, rx: (1.6 + 2.4 * k) * K, ry: (0.9 + 0.8 * k) * K, opacity: ((1 - k) * 0.7).toFixed(2) });
      } else { set(e.dust1, { opacity: 0 }); set(e.dust2, { opacity: 0 }); }

      if (st.gone) { set(e.fig, { opacity: 0 }); return; }

      // ---- posa ----
      const target = { ...BASE, ...(st.p || {}) };
      if (st.arms) Object.assign(target, st.arms);
      target.head += clamp(face.ly, -1.4, 1.4) * 8;
      const fixed = new Set(st.arms ? Object.keys(st.arms) : []);
      fTarget = st.f || 1;
      const fNow = Math.abs(fS) < 0.3 ? (fS < 0 ? -0.3 : 0.3) : fS;
      if (st.ikR) {
        const ls = localSkeleton(target);
        let pt;
        if (st.ikR.world) pt = [(st.ikR.world[0] - st.x) / (K * fNow), (st.ikR.world[1] - st.ground) / K - hipYPrev];
        else { const ref = st.ikR.rel === 'head' ? ls.headC : st.ikR.rel === 'sh' ? ls.sh : ls.hip; pt = [ref[0] + st.ikR.x, ref[1] + st.ikR.y]; }
        const sol = armIK(ls.sh, pt);
        target.shR = sol.sh; target.elR = sol.el; fixed.add('shR'); fixed.add('elR');
      }
      spring(dt, target, st.w || 12);

      if (prevX == null) prevX = st.x;
      const dxl = (st.x - prevX) / K; prevX = st.x;
      speed = smooth(speed, Math.abs(dxl) / Math.max(dt, 0.001), dt, 10);
      if (st.gait) curGait = st.gait;
      phase += (Math.abs(dxl) / (curGait === 'run' ? 44 : 23)) * Math.PI * 2;
      gaitAmt = smooth(gaitAmt, st.gait ? clamp(speed / (curGait === 'run' ? 40 : 18), 0, 1) : 0, dt, 8);
      let pose = cur;
      if (gaitAmt > 0.01) {
        const gp = curGait === 'run' ? P.run(phase) : P.walk(phase);
        pose = {}; for (const k of KEYS) pose[k] = fixed.has(k) ? cur[k] : lerp(cur[k], gp[k], gaitAmt);
      }
      const f = Math.abs(fS) < 0.04 ? (fS < 0 ? -0.04 : 0.04) : fS;
      const rot = st.rot || 0;
      let hipY, X = st.x, G = st.ground - (st.lift || 0);
      if (st.hangPt) {
        // appeso: il corpo pende dalle mani, che restano sul cavo
        const pr = skeleton(pose, 0, 0, f, rot);
        const hxx = (pr.handL[0] + pr.handR[0]) / 2, hyy = (pr.handL[1] + pr.handR[1]) / 2;
        X = st.hangPt[0] - hxx * K; G = st.hangPt[1]; hipY = -hyy;
      } else if (st.sit) hipY = lerp(-13, -1, st.sitK ?? 1);
      else {
        const pr = skeleton(pose, 0, 0, f, rot);
        hipY = -Math.max(pr.footL[1], pr.footR[1], pr.kneeL[1], pr.kneeR[1], pr.hip[1], pr.neck[1], pr.headC[1] + LEN.head * 0.92);
      }
      hipYPrev = hipY;
      const sk = skeleton(pose, 0, hipY, f, rot);
      const ln = (a, b) => `M${a[0].toFixed(2)} ${a[1].toFixed(2)} L${b[0].toFixed(2)} ${b[1].toFixed(2)}`;
      set(e.body, { d: [ln(sk.hip, sk.kneeL), ln(sk.kneeL, sk.footL), ln(sk.hip, sk.kneeR), ln(sk.kneeR, sk.footR), ln(sk.hip, sk.neck), ln(sk.sh, sk.elbL), ln(sk.elbL, sk.handL)].join(' ') });
      set(e.armF, { d: `${ln(sk.sh, sk.elbR)} ${ln(sk.elbR, sk.handR)}` });

      const sx = st.sx ?? 1, sy = st.sy ?? 1;
      const op = st.flicker ? 0.55 + Math.random() * 0.45 : 1;
      lastXY = [X, st.hangPt ? G + REACH * K : G];
      set(e.fig, { opacity: op.toFixed(2), transform: `translate(${X.toFixed(1)} ${G.toFixed(1)}) scale(${(K * sx).toFixed(3)} ${(K * sy).toFixed(3)})` });

      // ---- viso ----
      const [hx, hy] = sk.headC;
      const hw = [X + hx * K * sx, G + hy * K * sy];
      const tgt = FACE[st.expr || 'neutral'];
      for (const k in tgt) face[k] = smooth(face[k], tgt[k], dt, 5);
      let lx, ly;
      if (st.lookAt) { const ddx = st.lookAt[0] - hw[0], ddy = st.lookAt[1] - hw[1], n = Math.hypot(ddx, ddy) || 1; lx = (ddx / n) * 1.5; ly = (ddy / n) * 1.3; }
      else { const lk = st.look || [0.7, 0.1]; lx = lk[0] * Math.sign(st.f || 1); ly = lk[1]; }
      face.lx = smooth(face.lx, lx, dt, 6); face.ly = smooth(face.ly, ly, dt, 6);
      if (s > nextBlink) { blinkUntil = s + 0.14; nextBlink = s + 2.2 + Math.random() * 2.8; }
      const eo = Math.max(0.08, face.eyeOpen * (s < blinkUntil ? 0.1 : 1));
      set(e.headG, { transform: `translate(${hx.toFixed(2)} ${hy.toFixed(2)}) rotate(${sk.headAngle.toFixed(1)})` });
      const ex = face.lx, ey = face.ly;
      set(e.eyeL, { cx: (-2.3 + ex).toFixed(2), cy: (-0.8 + ey).toFixed(2), ry: (1.15 * eo).toFixed(2) });
      set(e.eyeR, { cx: (2.3 + ex).toFixed(2), cy: (-0.8 + ey).toFixed(2), ry: (1.15 * eo).toFixed(2) });
      const brow = (cx, raise, dir) => {
        const yo = -3.9 - raise * 1.1 + ey * 0.25, xo = cx - dir * 1.4 + ex * 0.5, xi = cx + dir * 1.4 + ex * 0.5;
        return `M${xo.toFixed(2)} ${(yo - face.bAng * 0.25).toFixed(2)} L${xi.toFixed(2)} ${(yo + face.bAng * 0.9).toFixed(2)}`;
      };
      set(e.brows, { d: `${brow(-2.4, face.bL, 1)} ${brow(2.4, face.bR, -1)}` });
      const mx = ex * 0.5, my = 2.9 + ey * 0.2, mw = 2.3, c = face.curve * 1.8, o = face.open * 2.4;
      set(e.mouth, { d: o > 0.15 ? `M${mx - mw} ${my} Q${mx} ${my + c + o} ${mx + mw} ${my} Q${mx} ${my + c - o * 0.35} ${mx - mw} ${my} Z` : `M${mx - mw} ${my} Q${mx} ${my + c} ${mx + mw} ${my}`, fill: o > 0.15 ? INK : 'none' });

      // ---- oggetti ----
      const headTop = [hx, hy - LEN.head];
      chuteK = st.chute != null ? st.chute : (lastDrop > 0.9 ? 0 : smooth(chuteK, 0, dt, 6));
      lastDrop = st.chuteDrop != null ? st.chuteDrop : st.chute != null ? 0 : lastDrop;
      if (chuteK > 0.01) {
        // la vela si gonfia con un piccolo rimbalzo e, all'atterraggio, si affloscia di lato
        const d = clamp(st.chuteDrop || 0, 0, 1);
        const cy = headTop[1] - 30 + d * 34, cx = headTop[0] - Math.sin(rot * D) * 26 + f * d * 26;
        const scx = 1.5 * (0.12 + 0.88 * backOut(chuteK)) * (1 - 0.15 * d), scy = 1.5 * (0.08 + 0.92 * easeOut(chuteK)) * (1 - 0.78 * d);
        const cop = Math.min(1, chuteK * 3) * Math.pow(1 - d, 0.6);
        set(e.chute, { opacity: cop.toFixed(2), transform: `translate(${cx.toFixed(2)} ${cy.toFixed(2)}) rotate(${(rot * 0.6 + f * d * 55).toFixed(1)}) scale(${scx.toFixed(3)} ${scy.toFixed(3)})` });
        const edgeL = [cx - 20 * scx, cy + 4 * scy], edgeR = [cx + 20 * scx, cy + 4 * scy];
        set(e.strings, { d: `${ln(edgeL, sk.handL)} ${ln(edgeR, sk.handR)} ${ln(edgeL, sk.handR)} ${ln(edgeR, sk.handL)}`, opacity: (Math.min(1, chuteK * 3) * Math.max(0, 1 - d * 2.5)).toFixed(2) });
      } else { set(e.chute, { opacity: 0 }); set(e.strings, { opacity: 0 }); }
      umbK = st.umbrella != null ? st.umbrella : smooth(umbK, 0, dt, 6);
      if (umbK > 0.01) set(e.umb, { opacity: Math.min(1, umbK * 3).toFixed(2), transform: `translate(${sk.handR[0].toFixed(2)} ${sk.handR[1].toFixed(2)}) rotate(${(rot * 0.8).toFixed(1)}) scale(${(1.3 * (0.14 + 0.86 * Math.pow(clamp(umbK, 0, 1.2), 0.7))).toFixed(3)} ${(1.3 * (0.6 + 0.4 * clamp(umbK, 0, 1))).toFixed(3)})` });
      else set(e.umb, { opacity: 0 });
      if (st.trolley) set(e.trolley, { opacity: 1, transform: `translate(${((sk.handL[0] + sk.handR[0]) / 2).toFixed(2)} ${(Math.min(sk.handL[1], sk.handR[1]) - 1).toFixed(2)})` });
      else set(e.trolley, { opacity: 0 });
      bookK = smooth(bookK, st.book ? 1 : 0, dt, 8);
      if (bookK > 0.01) set(e.book, { opacity: bookK.toFixed(2), transform: `translate(${((sk.handL[0] + sk.handR[0]) / 2).toFixed(2)} ${((sk.handL[1] + sk.handR[1]) / 2 - 1).toFixed(2)}) scale(${bookK.toFixed(2)})` });
      else set(e.book, { opacity: 0 });
      bulbK = st.bulb != null ? st.bulb : smooth(bulbK, 0, dt, 6);
      if (bulbK > 0.01) set(e.bulb, { opacity: bulbK.toFixed(2), transform: `translate(${headTop[0].toFixed(2)} ${(headTop[1] - 8 - bulbK * 2).toFixed(2)})` });
      else set(e.bulb, { opacity: 0 });
      if (st.oar) {
        const oa = 32 + Math.sin(s * 3.6) * 20, hnd = sk.handR, dir = [Math.sin(oa * D) * Math.sign(f), Math.cos(oa * D)];
        set(e.oar, { opacity: 1, d: `M${(hnd[0] - dir[0] * 4).toFixed(2)} ${(hnd[1] - dir[1] * 4).toFixed(2)} L${(hnd[0] + dir[0] * 17).toFixed(2)} ${(hnd[1] + dir[1] * 17).toFixed(2)}` });
        set(e.blade, { opacity: 1, cx: (hnd[0] + dir[0] * 17).toFixed(2), cy: (hnd[1] + dir[1] * 17).toFixed(2), transform: `rotate(${(-oa * Math.sign(f)).toFixed(1)} ${(hnd[0] + dir[0] * 17).toFixed(2)} ${(hnd[1] + dir[1] * 17).toFixed(2)})` });
      } else { set(e.oar, { opacity: 0 }); set(e.blade, { opacity: 0 }); }
      orbitK = smooth(orbitK, st.orbit ? 1 : 0, dt, 4);
      for (let i = 0; i < 6; i++) {
        if (orbitK < 0.01) { set(e[`orb${i}`], { opacity: 0 }); continue; }
        const a = s * 1.8 + (i / 6) * Math.PI * 2;
        set(e[`orb${i}`], { opacity: (orbitK * (0.55 + 0.45 * Math.sin(a))).toFixed(2), points: starPoints(hx + Math.cos(a) * 14 * orbitK, hy + Math.sin(a) * 5 - 2, 1.8) });
      }

      // ---- nuvoletta dei pensieri ----
      bubbleK = smooth(bubbleK, st.bubble ? 1 : 0, dt, 6);
      if (bubbleK > 0.01) {
        const list = st.bubble || [], active = list.length ? list[Math.floor(s / 1.6) % list.length] : null;
        for (const id of ICONS) { iconOp[id] = smooth(iconOp[id], id === active ? 1 : 0, dt, 7); set(e[`ic_${id}`], { opacity: iconOp[id].toFixed(2) }); }
        const bx = -5 * Math.sign(f);
        set(e.bubble, { opacity: bubbleK.toFixed(2), transform: `translate(${headTop[0].toFixed(2)} ${headTop[1].toFixed(2)}) scale(${bubbleK.toFixed(3)}) translate(${bx} -21)` });
        set(e.tail1, { cx: (-bx * 0.75).toFixed(1) }); set(e.tail2, { cx: (-bx * 0.45).toFixed(1) });
        set(e.gear, { transform: `rotate(${(s * 90) % 360})` });
        set(e.flame, { transform: `scale(1 ${(0.8 + Math.sin(s * 30) * 0.25).toFixed(2)})` });
        set(e.arrow, { transform: `translate(0 ${(Math.sin(s * 7) * 1.4).toFixed(2)})` });
        set(e.heart, { transform: `scale(${(1 + Math.max(0, Math.sin(s * 8)) * 0.15).toFixed(3)})` });
        set(e.boatG, { transform: `rotate(${(Math.sin(s * 3) * 8).toFixed(1)})` });
      } else set(e.bubble, { opacity: 0 });
    }

    let raf, t0 = 0, last = 0;
    function frame(now) {
      const s = (now - t0) / 1000, dt = Math.min(0.05, Math.max(0.001, (now - last) / 1000)); last = now;
      const st = scene(s);
      draw(st, s, dt);
      if (done || st.finished) { setHL(null); set(e.fig, { opacity: 0 }); return; }
      raf = requestAnimationFrame(frame);
    }
    // parte dopo l'entrata del titolo; se il visitatore ha già scorso, entra direttamente nella sezione giusta
    const start = setTimeout(() => {
      t0 = performance.now(); last = t0;
      const j = window.scrollY < 80 ? 0 : Math.max(0, nextAct());
      startAct(j, 0);
      raf = requestAnimationFrame(frame);
    }, 900);
    return () => { clearTimeout(start); cancelAnimationFrame(raf); setHL(null); };
  }, []);

  if (!holder) return null;
  const r = (k) => (el) => { els.current[k] = el; };
  const cloud = [[-8, 1, 6], [-2, -4, 7], [6, -3, 6.5], [10, 2, 5], [1, 4, 6.2], [-11, -2, 4.5]];
  return createPortal(
    <svg ref={r('svg')} aria-hidden="true" style={{ position: 'fixed', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 55, overflow: 'visible' }}>
      <defs>
        <linearGradient id="hbBeam" x1="0" y1="1" x2="0" y2="0"><stop offset="0%" stopColor="#67e8f9" stopOpacity="0.75" /><stop offset="60%" stopColor="#a78bfa" stopOpacity="0.3" /><stop offset="100%" stopColor="#a78bfa" stopOpacity="0" /></linearGradient>
        <clipPath id="hbClip" clipPathUnits="userSpaceOnUse"><rect ref={r('clip')} x="-1000000" y="-1000000" width="3000000" height="3000000" /></clipPath>
        <radialGradient id="hbBulbGlow"><stop offset="0%" stopColor="#ffe27a" stopOpacity="1" /><stop offset="100%" stopColor="#ffe27a" stopOpacity="0" /></radialGradient>
      </defs>
      <g ref={r('world')}>
        <line ref={r('zipLine')} stroke="#5b6475" strokeWidth="1.2" strokeLinecap="round" opacity="0" />
        <circle ref={r('zipA')} r="2.4" fill="#ffffff" stroke={INK} strokeWidth="1" opacity="0" />
        <circle ref={r('zipB')} r="2.4" fill="#ffffff" stroke={INK} strokeWidth="1" opacity="0" />
        <circle ref={r('rip0')} fill="none" stroke={BLUE} strokeWidth="1" opacity="0" />
        <circle ref={r('rip1')} fill="none" stroke={BLUE} strokeWidth="1" opacity="0" />
        <ellipse ref={r('dust1')} fill="#c9ccd3" opacity="0" />
        <ellipse ref={r('dust2')} fill="#c9ccd3" opacity="0" />
        <g ref={r('beam')} opacity="0">
          <rect x="-13" y="-70" width="26" height="70" rx="6" fill="url(#hbBeam)" />
          <ellipse cx="0" cy="0" rx="14" ry="2.6" fill="#67e8f9" opacity="0.7" />
          {Array.from({ length: 9 }, (_, i) => <circle key={i} ref={r(`spark${i}`)} r={i % 3 === 0 ? 1.1 : 0.7} fill={i % 2 ? '#a78bfa' : '#22d3ee'} />)}
        </g>

        <g clipPath="url(#hbClip)">
        <g ref={r('fig')} data-hb="fig" opacity="0">
          {/* paracadute */}
          <path ref={r('strings')} fill="none" stroke="#9aa3b5" strokeWidth="0.35" opacity="0" />
          <g ref={r('chute')} opacity="0">
            <path d="M-21 4 Q-21 -14 0 -15 Q21 -14 21 4 Q15.75 1 10.5 4 Q5.25 1 0 4 Q-5.25 1 -10.5 4 Q-15.75 1 -21 4 Z" fill="#ffffff" stroke={INK} strokeWidth="0.8" strokeLinejoin="round" />
            <path d="M-10.5 4 Q-11 -12 0 -15 Q-5 -6 -5.25 2.5 Z M10.5 4 Q11 -12 0 -15 Q5 -6 5.25 2.5 Z" fill={BLUE} opacity="0.9" />
            <path d="M-21 4 Q-20 -8 -10 -13.5 Q-15 -4 -15.75 2.5 Z M21 4 Q20 -8 10 -13.5 Q15 -4 15.75 2.5 Z" fill={GOLD} opacity="0.9" />
          </g>
          {/* ombrello */}
          <g ref={r('umb')} opacity="0">
            <path d="M0 2 L0 -20" stroke={INK} strokeWidth="0.9" strokeLinecap="round" />
            <path d="M0 2 Q0 5 2.6 5" fill="none" stroke={INK} strokeWidth="0.9" strokeLinecap="round" />
            <path d="M-15 -18 Q-14 -31 0 -32 Q14 -31 15 -18 Q11.25 -20.5 7.5 -18 Q3.75 -20.5 0 -18 Q-3.75 -20.5 -7.5 -18 Q-11.25 -20.5 -15 -18 Z" fill={GOLD} stroke={INK} strokeWidth="0.8" strokeLinejoin="round" />
            <path d="M-7.5 -18 Q-6 -28 0 -32 Q-2.5 -25 -3.75 -19.5 Z M7.5 -18 Q6 -28 0 -32 Q2.5 -25 3.75 -19.5 Z" fill={BLUE} />
          </g>
          <g ref={r('trolley')} opacity="0">
            <path d="M-3 0 L3 0 M0 0 L0 -3" stroke={INK} strokeWidth="0.8" strokeLinecap="round" />
            <circle cy="-4" r="1.6" fill="#fff" stroke={INK} strokeWidth="0.7" />
          </g>
          <path ref={r('body')} fill="none" stroke={INK} strokeWidth="1.15" strokeLinecap="round" strokeLinejoin="round" />
          <g ref={r('headG')}>
            <circle r={LEN.head} fill="#ffffff" stroke={INK} strokeWidth="1.1" />
            <ellipse ref={r('eyeL')} rx="0.95" ry="1.15" fill={INK} />
            <ellipse ref={r('eyeR')} rx="0.95" ry="1.15" fill={INK} />
            <path ref={r('brows')} fill="none" stroke={INK} strokeWidth="0.75" strokeLinecap="round" />
            <path ref={r('mouth')} fill="none" stroke={INK} strokeWidth="0.75" strokeLinecap="round" strokeLinejoin="round" />
          </g>
          <path ref={r('oar')} fill="none" stroke="#8a5a2b" strokeWidth="1.2" strokeLinecap="round" opacity="0" />
          <ellipse ref={r('blade')} rx="1.6" ry="3.2" fill="#8a5a2b" opacity="0" />
          <g ref={r('book')} opacity="0">
            <path d="M-6 -3 L0 -2 L6 -3 L6 3 L0 4 L-6 3 Z" fill="#ffffff" stroke={BLUE} strokeWidth="0.8" strokeLinejoin="round" />
            <path d="M0 -2 L0 4 M-4.5 -1 L-1.5 -0.6 M-4.5 0.8 L-1.5 1.2 M1.5 -0.6 L4.5 -1 M1.5 1.2 L4.5 0.8" stroke={BLUE} strokeWidth="0.45" />
          </g>
          <path ref={r('armF')} fill="none" stroke={INK} strokeWidth="1.15" strokeLinecap="round" strokeLinejoin="round" />
          <g ref={r('bulb')} opacity="0">
            <circle r="11" fill="url(#hbBulbGlow)" />
            <circle r="3.8" cy="-1" fill="#ffd84a" stroke={INK} strokeWidth="0.6" />
            <rect x="-1.6" y="2.4" width="3.2" height="2.2" rx="0.5" fill="#c9ccd3" stroke={INK} strokeWidth="0.45" />
            <path d="M-6.5 -5.5 L-8.2 -7.2 M6.5 -5.5 L8.2 -7.2 M0 -7 L0 -9.6" stroke={GOLD} strokeWidth="0.8" strokeLinecap="round" />
          </g>
          {Array.from({ length: 6 }, (_, i) => <polygon key={i} ref={r(`orb${i}`)} fill={GOLD} opacity="0" />)}

          {/* nuvoletta dei pensieri */}
          <g ref={r('bubble')} opacity="0">
            <circle ref={r('tail1')} cy="14" r="1.3" fill="#fff" stroke={INK} strokeWidth="0.7" />
            <circle ref={r('tail2')} cy="10.4" r="2" fill="#fff" stroke={INK} strokeWidth="0.7" />
            {cloud.map(([x, y, rr]) => <circle key={`o${x}`} cx={x} cy={y} r={rr} fill="#fff" stroke={INK} strokeWidth="0.8" />)}
            {cloud.map(([x, y, rr]) => <circle key={`i${x}`} cx={x} cy={y} r={rr - 0.75} fill="#fff" />)}
            <g ref={r('ic_idea')} opacity="0">
              <circle cy="-1.5" r="3.8" fill="#ffd84a" stroke={INK} strokeWidth="0.5" />
              <rect x="-1.6" y="2.2" width="3.2" height="2.2" rx="0.5" fill="#c9ccd3" stroke={INK} strokeWidth="0.4" />
              <path d="M-6.5 -5.5 L-8 -7 M6.5 -5.5 L8 -7 M0 -6.6 L0 -8.6" stroke={GOLD} strokeWidth="0.8" strokeLinecap="round" />
            </g>
            <g ref={r('ic_gear')} opacity="0"><path ref={r('gear')} d={gearPath(4.4, 8)} fill={BLUE} /><circle r="1.4" fill="#fff" /></g>
            <g ref={r('ic_people')} opacity="0">
              <path d="M-8 -0.6 L8 -0.6" stroke={INK} strokeWidth="0.5" />
              {[[-5.5, BLUE], [0, GOLD], [5.5, INK]].map(([x, col]) => (
                <g key={x} transform={`translate(${x} 0)`}>
                  <circle cy="-4.3" r="1.5" fill={col} />
                  <path d="M0 -2.7 L0 1.6 M0 1.6 L-1.4 4.6 M0 1.6 L1.4 4.6" stroke={col} strokeWidth="0.7" strokeLinecap="round" />
                </g>
              ))}
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
            <g ref={r('ic_down')} opacity="0">
              <g ref={r('arrow')}><path d="M0 -6 L0 4 M-4 0.5 L0 4.5 L4 0.5" fill="none" stroke={BLUE} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" /></g>
            </g>
            <g ref={r('ic_heart')} opacity="0">
              <g ref={r('heart')}><path d="M0 4.5 C-7 0 -6 -6 -2.6 -5.4 C-1.2 -5.2 -0.4 -4 0 -3.2 C0.4 -4 1.2 -5.2 2.6 -5.4 C6 -6 7 0 0 4.5 Z" fill="#e5484d" /></g>
            </g>
            <g ref={r('ic_boat')} opacity="0">
              <g ref={r('boatG')}>
                <path d="M-0.5 -7 L-0.5 1 M-0.5 -6 L-5.5 0.5 L-0.5 0.5 M0.5 -5 L4.5 0.5 L0.5 0.5" fill="none" stroke={BLUE} strokeWidth="0.7" strokeLinejoin="round" />
                <path d="M-7 2 L7 2 L5.2 4.6 L-5.2 4.6 Z" fill={BLUE} />
              </g>
              <path d="M-9 6.2 Q-6.75 5 -4.5 6.2 T0 6.2 T4.5 6.2 T9 6.2" fill="none" stroke="#4a90e2" strokeWidth="0.6" />
            </g>
          </g>
        </g>
        </g>
      </g>
    </svg>,
    holder,
  );
}
