import React, { useState, useRef, useEffect } from 'react';
import { Link, useOutletContext, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';

const CONTACT_IMG = '/images/contatti.jpg';

const translations = {
  it: {
    label: 'CONTATTI',
    title: 'Entra in Next Lab Europe.',
    subtitle: "Che tu voglia proporre un progetto, diventare partner o semplicemente conoscerci meglio — siamo qui.",
    formTitle: 'Scrivici',
    formIntro: 'Raccontaci chi sei e cosa ti interessa: ti risponderemo via email il prima possibile.',
    nameLabel: 'Nome e cognome',
    emailLabel: 'Email',
    reasonLabel: 'Motivo del contatto',
    reasons: [['socio', 'Diventare socio o volontario'], ['informazioni', 'Richiesta informazioni'], ['collaborazione', 'Collaborazioni e partnership'], ['altro', 'Altro']],
    messageLabel: 'Messaggio',
    messagePlaceholder: 'Scrivi qui il tuo messaggio...',
    messageHint: { socio: 'Raccontaci qualcosa di te: età, studi o lavoro, città e cosa ti piacerebbe fare con noi. Ti invieremo noi il modulo di adesione.', informazioni: 'Scrivici cosa vorresti sapere: le nostre attività, i progetti o le iniziative in corso.', collaborazione: "Indicaci l'ente o l'organizzazione che rappresenti e l'idea di collaborazione.", altro: '' },
    submit: 'Invia messaggio',
    sending: 'Invio in corso…',
    sentTitle: 'Ti ringraziamo per il tuo messaggio',
    sentText: 'Risponderemo alla tua email il prima possibile.',
    sentMore: "Per ulteriori informazioni, contattaci all'email:",
    sendAnother: 'Nuovo messaggio',
    errorText: "Non siamo riusciti a inviare il messaggio. Riprova tra poco oppure scrivici direttamente a",
    errorFields: 'Controlla i campi evidenziati: nome, email valida e un messaggio di almeno 10 caratteri.',
    infoTitle: 'Dove siamo',
    email: 'info@nextlabeurope.eu',
    joinTitle: 'Vuoi far parte di Next Lab Europe?',
    joinDesc: "Siamo alla ricerca di giovani motivati che vogliano contribuire a costruire qualcosa di significativo per l'Europa.",
    joinCta: 'Candidati ora',
  },
  en: {
    label: 'CONTACT',
    title: 'Join Next Lab Europe.',
    subtitle: "Whether you want to propose a project, become a partner, or simply get to know us better — we're here.",
    formTitle: 'Write to us',
    formIntro: "Tell us who you are and what you're interested in: we'll reply by email as soon as possible.",
    nameLabel: 'Full name',
    emailLabel: 'Email',
    reasonLabel: 'Reason for contact',
    reasons: [['socio', 'Become a member or volunteer'], ['informazioni', 'Request information'], ['collaborazione', 'Collaborations and partnerships'], ['altro', 'Other']],
    messageLabel: 'Message',
    messagePlaceholder: 'Write your message here...',
    messageHint: { socio: "Tell us a bit about yourself: age, studies or job, city and what you'd like to do with us. We'll send you the membership form.", informazioni: 'Tell us what you would like to know: our activities, projects or current initiatives.', collaborazione: 'Tell us which organisation you represent and your idea for a collaboration.', altro: '' },
    submit: 'Send message',
    sending: 'Sending…',
    sentTitle: 'Thank you for your message',
    sentText: "We'll reply to your email as soon as possible.",
    sentMore: 'For further information, contact us at:',
    sendAnother: 'New message',
    errorText: "We couldn't send your message. Please try again shortly or write to us directly at",
    errorFields: 'Please check the highlighted fields: name, a valid email and a message of at least 10 characters.',
    infoTitle: 'Where we are',
    email: 'info@nextlabeurope.eu',
    joinTitle: 'Want to be part of Next Lab Europe?',
    joinDesc: 'We are looking for motivated young people who want to contribute to building something meaningful for Europe.',
    joinCta: 'Apply now',
  },
};

export default function Contatti() {
  const { lang } = useOutletContext();
  const t = translations[lang];
  const [params] = useSearchParams();
  const initialReason = ['socio', 'informazioni', 'collaborazione', 'altro'].includes(params.get('motivo')) ? params.get('motivo') : 'socio';
  const [form, setForm] = useState({ name: '', email: '', reason: initialReason, message: '', website: '' });
  const [status, setStatus] = useState('idle'); // idle | sending | sent | error | invalid
  const [badFields, setBadFields] = useState([]);
  const startedAt = useRef(Date.now());
  const formRef = useRef(null);
  const messageRef = useRef(null);

  useEffect(() => {
    if (params.get('motivo')) formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [params]);

  const update = (field) => (e) => {
    setForm((f) => ({ ...f, [field]: e.target.value }));
    setBadFields((b) => b.filter((x) => x !== field));
  };

  const chooseJoin = () => {
    setForm((f) => ({ ...f, reason: 'socio' }));
    setStatus((s) => (s === 'sent' ? 'idle' : s));
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setTimeout(() => messageRef.current?.focus({ preventScroll: true }), 600);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('sending');
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, lang, startedAt: startedAt.current }),
      });
      const out = await res.json().catch(() => ({}));
      if (res.ok && out.ok) {
        setStatus('sent');
        setForm({ name: '', email: '', reason: 'socio', message: '', website: '' });
        startedAt.current = Date.now();
      } else if (out.error === 'invalid') {
        setBadFields(out.fields || []);
        setStatus('invalid');
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }
  };

  const fieldStyle = (name) => ({
    border: `1.5px solid ${badFields.includes(name) ? '#ef4444' : '#e5e7eb'}`,
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    backgroundColor: '#fff',
  });
  const labelCls = 'block font-mono text-[11px] uppercase tracking-[0.2em] mb-2';
  const labelStyle = { color: '#6b7280', fontFamily: "'JetBrains Mono', monospace" };

  return (
    <>
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0">
          <img src={CONTACT_IMG} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(252,252,252,0.95), rgba(252,252,252,0.9), rgba(252,252,252,1))' }} />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 pt-16">
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="font-mono text-[10px] uppercase tracking-[0.4em] mb-8" style={{ color: '#1a4fc4', fontFamily: "'JetBrains Mono', monospace" }}>
            {t.label}
          </motion.p>
          <motion.h1 initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="font-heading font-extrabold leading-[0.95] tracking-tight mb-6"
            style={{ fontSize: 'clamp(2.5rem, 6.5vw, 5.75rem)', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            {t.title}
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="text-lg leading-relaxed max-w-xl" style={{ color: '#6b7280' }}>
            {t.subtitle}
          </motion.p>
        </div>
      </section>

      <section className="pb-32 lg:pb-44">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 lg:gap-32">
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
              <h2 ref={formRef} className="font-heading font-extrabold text-3xl mb-3 scroll-mt-32" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{t.formTitle}</h2>
              <p className="text-sm leading-relaxed mb-8" style={{ color: '#6b7280' }}>{t.formIntro}</p>
              {status === 'sent' ? (
                <motion.div role="status" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                  className="relative overflow-hidden p-8 sm:p-10 rounded-3xl"
                  style={{ background: 'linear-gradient(140deg, rgba(255,255,255,0.72) 0%, rgba(255,255,255,0.6) 60%, rgba(239,244,255,0.55) 100%)', backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)', border: '1px solid rgba(26,79,196,0.12)', boxShadow: '0 16px 40px -28px rgba(26,79,196,0.3)' }}>
                  <div aria-hidden="true" className="absolute -top-24 -right-24 w-64 h-64 rounded-full"
                    style={{ background: 'radial-gradient(circle, rgba(26,79,196,0.06) 0%, rgba(26,79,196,0) 70%)' }} />
                  <div className="relative">
                    <p className="font-heading font-extrabold text-2xl leading-tight mb-3" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: '#0F1B3D' }}>{t.sentTitle}</p>
                    <p className="leading-relaxed mb-6" style={{ color: '#374151' }}>{t.sentText}</p>
                    <div className="h-px w-full mb-6" style={{ background: 'linear-gradient(to right, rgba(26,79,196,0.25), rgba(26,79,196,0))' }} />
                    <p className="text-sm leading-relaxed mb-8" style={{ color: '#4b5563' }}>
                      {t.sentMore}{' '}
                      <a href="mailto:info@nextlabeurope.eu" className="transition-opacity hover:opacity-70" style={{ color: '#1a4fc4' }}>info@nextlabeurope.eu</a>
                    </p>
                    <button type="button" onClick={() => setStatus('idle')}
                      className="text-sm transition-opacity hover:opacity-70"
                      style={{ color: '#1a4fc4', fontWeight: 400, textDecoration: 'none' }}>
                      {t.sendAnother}
                    </button>
                  </div>
                </motion.div>
              ) : (
              <form onSubmit={handleSubmit} className="space-y-5" noValidate={false}>
                <div>
                  <label htmlFor="cf-name" className={labelCls} style={labelStyle}>{t.nameLabel}</label>
                  <input id="cf-name" type="text" autoComplete="name" required minLength={2} maxLength={120}
                    value={form.name} onChange={update('name')}
                    className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all focus:ring-2 focus:ring-blue-200"
                    style={fieldStyle('name')} />
                </div>
                <div>
                  <label htmlFor="cf-email" className={labelCls} style={labelStyle}>{t.emailLabel}</label>
                  <input id="cf-email" type="email" autoComplete="email" required maxLength={200}
                    value={form.email} onChange={update('email')}
                    className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all focus:ring-2 focus:ring-blue-200"
                    style={fieldStyle('email')} />
                </div>
                <div>
                  <span className={labelCls} style={labelStyle}>{t.reasonLabel}</span>
                  <div className="flex flex-wrap gap-2" role="radiogroup" aria-label={t.reasonLabel}>
                    {t.reasons.map(([key, label]) => (
                      <button key={key} type="button" role="radio" aria-checked={form.reason === key}
                        onClick={() => setForm((f) => ({ ...f, reason: key }))}
                        className="px-4 py-2 rounded-full text-sm transition-all"
                        style={form.reason === key
                          ? { backgroundColor: '#1a4fc4', color: '#fff', border: '1.5px solid #1a4fc4' }
                          : { backgroundColor: '#fff', color: '#374151', border: '1.5px solid #e5e7eb' }}>
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label htmlFor="cf-message" className={labelCls} style={labelStyle}>{t.messageLabel}</label>
                  {t.messageHint[form.reason] && (
                    <p className="text-xs leading-relaxed mb-2" style={{ color: '#6b7280' }}>{t.messageHint[form.reason]}</p>
                  )}
                  <textarea id="cf-message" ref={messageRef} rows={6} required minLength={10} maxLength={5000}
                    placeholder={t.messagePlaceholder} value={form.message} onChange={update('message')}
                    className="w-full px-4 py-3 rounded-xl text-sm outline-none resize-y transition-all focus:ring-2 focus:ring-blue-200"
                    style={fieldStyle('message')} />
                </div>
                {/* Campo trappola per i bot: invisibile alle persone */}
                <div aria-hidden="true" style={{ position: 'absolute', left: '-10000px', width: 1, height: 1, overflow: 'hidden' }}>
                  <label>Website<input type="text" tabIndex={-1} autoComplete="off" value={form.website} onChange={update('website')} /></label>
                </div>
                {status === 'invalid' && <p className="text-sm" style={{ color: '#b91c1c' }} role="alert">{t.errorFields}</p>}
                {status === 'error' && (
                  <p className="text-sm" style={{ color: '#b91c1c' }} role="alert">
                    {t.errorText} <a href="mailto:info@nextlabeurope.eu" className="underline font-semibold">info@nextlabeurope.eu</a>.
                  </p>
                )}
                <button type="submit" disabled={status === 'sending'}
                  className="w-full py-4 font-heading font-bold text-sm tracking-wide rounded-full text-white transition-all disabled:opacity-70"
                  style={{ backgroundColor: '#1a4fc4', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                  {status === 'sending' ? t.sending : t.submit}
                </button>
                <p className="text-xs leading-relaxed" style={{ color: '#6b7280' }}>
                  {lang === 'it' ? 'Inviando il modulo dichiari di aver letto l\'' : 'By sending this form you confirm you have read the '}
                  <Link to="/privacy" className="underline hover:text-black">{lang === 'it' ? 'informativa sulla privacy' : 'Privacy Policy'}</Link>.
                </p>
              </form>
              )}
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
              <h2 className="font-heading font-extrabold text-3xl mb-8" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{t.infoTitle}</h2>
              <div className="space-y-6 mb-10">
                <div className="flex gap-4">
                  <span className="text-xl" style={{ color: '#1a4fc4' }}>✉</span>
                  <div>
                    <strong className="block text-xs uppercase tracking-widest mb-1" style={{ color: '#9ca3af', fontFamily: "'JetBrains Mono', monospace" }}>Email</strong>
                    <a href={`mailto:${t.email}`} className="hover:underline">{t.email}</a>
                  </div>
                </div>
                <div className="flex gap-4">
                  <span className="text-xl" style={{ color: '#1a4fc4' }}>◎</span>
                  <div>
                    <strong className="block text-xs uppercase tracking-widest mb-1" style={{ color: '#9ca3af', fontFamily: "'JetBrains Mono', monospace" }}>
                      {lang === 'it' ? 'Sede' : 'Location'}
                    </strong>
                    <p>{lang === 'it'
                      ? 'Piazza Baracca 10, c/o Fondazione del Monte di Bologna e Ravenna, Scala A, Piano Secondo, 48022 Lugo (RA)'
                      : 'Piazza Baracca 10, c/o Fondazione del Monte di Bologna e Ravenna, Staircase A, Second Floor, 48022 Lugo (RA), Italy'}</p>
                  </div>
                </div>
              </div>
              <div className="p-7 rounded-2xl" style={{ backgroundColor: '#eff4ff', borderLeft: '4px solid #1a4fc4' }}>
                <h3 className="font-heading font-bold text-xl mb-3" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{t.joinTitle}</h3>
                <p className="text-sm leading-relaxed mb-5" style={{ color: '#6b7280' }}>{t.joinDesc}</p>
                <button type="button" onClick={chooseJoin} className="px-6 py-3 font-heading font-bold text-sm rounded-full text-white"
                  style={{ backgroundColor: '#1a4fc4', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                  {t.joinCta}
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </>
  );
}
