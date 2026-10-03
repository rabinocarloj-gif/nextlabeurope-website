// Funzione Vercel: riceve i messaggi del modulo "Scrivici" e li inoltra a info@nextlabeurope.eu
// tramite la casella Aruba dell'associazione.
//
// Variabili d'ambiente da impostare su Vercel (Settings -> Environment Variables):
//   SMTP_USER  = info@nextlabeurope.eu
//   SMTP_PASS  = password della casella email Aruba
// Facoltative: SMTP_HOST (default smtps.aruba.it), SMTP_PORT (default 465), MAIL_TO (default = SMTP_USER)

import nodemailer from 'nodemailer';

const REASONS = {
  socio: 'Diventare socio o volontario',
  collaborazione: 'Collaborazioni e partnership',
  altro: 'Altro',
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const clean = (s, max) => String(s ?? '').replace(/\r/g, '').trim().slice(0, max);

export function validate(body) {
  const data = {
    name: clean(body?.name, 120).replace(/\n/g, ' '),
    email: clean(body?.email, 200).replace(/\s/g, ''),
    reason: REASONS[body?.reason] ? body.reason : 'altro',
    message: clean(body?.message, 5000),
    lang: body?.lang === 'en' ? 'en' : 'it',
  };
  // Trappole anti-spam: campo nascosto compilato o invio troppo rapido (meno di 3 secondi)
  const bot = Boolean(body?.website) || (Number(body?.startedAt) > 0 && Date.now() - Number(body.startedAt) < 3000);
  const errors = [];
  if (data.name.length < 2) errors.push('name');
  if (!EMAIL_RE.test(data.email)) errors.push('email');
  if (data.message.length < 10) errors.push('message');
  return { data, bot, errors };
}

export function buildMail(data, from, to) {
  const reason = REASONS[data.reason];
  const text = [
    `Nuovo messaggio dal sito www.nextlabeurope.eu`,
    ``,
    `Nome: ${data.name}`,
    `Email: ${data.email}`,
    `Motivo: ${reason}`,
    `Lingua del sito: ${data.lang.toUpperCase()}`,
    ``,
    `Messaggio:`,
    data.message,
    ``,
    `— Per rispondere basta premere "Rispondi": la risposta andrà direttamente a ${data.email}.`,
  ].join('\n');
  const html = `
    <div style="font-family:Arial,sans-serif;font-size:15px;color:#111;line-height:1.5">
      <p style="color:#1a4fc4;font-weight:bold;margin:0 0 12px">Nuovo messaggio dal sito www.nextlabeurope.eu</p>
      <table style="border-collapse:collapse;margin-bottom:16px">
        <tr><td style="padding:4px 12px 4px 0;color:#666">Nome</td><td style="padding:4px 0"><b>${esc(data.name)}</b></td></tr>
        <tr><td style="padding:4px 12px 4px 0;color:#666">Email</td><td style="padding:4px 0"><a href="mailto:${esc(data.email)}">${esc(data.email)}</a></td></tr>
        <tr><td style="padding:4px 12px 4px 0;color:#666">Motivo</td><td style="padding:4px 0">${esc(reason)}</td></tr>
        <tr><td style="padding:4px 12px 4px 0;color:#666">Lingua</td><td style="padding:4px 0">${data.lang.toUpperCase()}</td></tr>
      </table>
      <div style="white-space:pre-wrap;border-left:3px solid #1a4fc4;padding:8px 14px;background:#f5f7ff">${esc(data.message)}</div>
      <p style="color:#888;font-size:13px;margin-top:16px">Per rispondere basta premere "Rispondi": la risposta andrà direttamente a ${esc(data.email)}.</p>
    </div>`;
  return {
    from: `"Sito Next Lab Europe" <${from}>`,
    to,
    replyTo: `"${data.name.replace(/"/g, '')}" <${data.email}>`,
    subject: `[Sito] ${reason} – ${data.name}`,
    text,
    html,
  };
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ ok: false, error: 'method' });
  }

  let body = req.body;
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch { body = {}; }
  }

  const { data, bot, errors } = validate(body || {});
  if (bot) return res.status(200).json({ ok: true }); // il bot crede di aver inviato, ma non parte nulla
  if (errors.length) return res.status(400).json({ ok: false, error: 'invalid', fields: errors });

  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  if (!user || !pass) {
    console.error('Modulo contatti: variabili SMTP_USER / SMTP_PASS non impostate su Vercel');
    return res.status(500).json({ ok: false, error: 'config' });
  }

  const port = Number(process.env.SMTP_PORT || 465);
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtps.aruba.it',
    port,
    secure: port === 465,
    auth: { user, pass },
  });

  try {
    await transporter.sendMail(buildMail(data, user, process.env.MAIL_TO || user));
    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('Modulo contatti: invio fallito', err?.message);
    return res.status(502).json({ ok: false, error: 'send' });
  }
}
