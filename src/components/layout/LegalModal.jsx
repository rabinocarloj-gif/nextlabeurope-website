import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

const translations = {
  it: {
    privacyTitle: 'Privacy Policy',
    privacyBody: [
      'Il Titolare del trattamento dei dati raccolti tramite questo sito è NEXT LAB EUROPE APS, Piazza Baracca 10, c/o Fondazione del Monte di Bologna e Ravenna, 48022 Lugo (RA), C.F. 92105040395.',
      "Questo sito non utilizza cookie di profilazione né raccoglie dati di navigazione dei visitatori a fini statistici o pubblicitari. I soli dati personali trattati sono quelli forniti volontariamente dall'utente tramite il modulo di contatto (nome, email, messaggio), utilizzati esclusivamente per rispondere alla richiesta inviata.",
      "I dati non vengono ceduti a terzi e sono conservati per il tempo strettamente necessario a evadere la richiesta. In qualsiasi momento è possibile richiedere accesso, rettifica o cancellazione dei propri dati scrivendo a info@nextlabeurope.eu, ai sensi degli artt. 15-22 del Regolamento UE 2016/679 (GDPR).",
    ],
    cookieTitle: 'Cookie Policy',
    cookieBody: [
      'Questo sito utilizza esclusivamente cookie tecnici, strettamente necessari al funzionamento delle pagine, e non utilizza cookie di profilazione, di terze parti o di tracciamento a fini statistici o pubblicitari.',
      "Non viene quindi raccolto alcun dato di navigazione riconducibile ai visitatori del sito tramite cookie. Per qualsiasi informazione è possibile scrivere a info@nextlabeurope.eu.",
    ],
    close: 'Chiudi',
  },
  en: {
    privacyTitle: 'Privacy Policy',
    privacyBody: [
      'The Data Controller for data collected through this site is NEXT LAB EUROPE APS, Piazza Baracca 10, c/o Fondazione del Monte di Bologna e Ravenna, 48022 Lugo (RA), Italy, Tax Code 92105040395.',
      "This site does not use profiling cookies and does not collect visitor browsing data for statistical or advertising purposes. The only personal data processed is what users voluntarily provide through the contact form (name, email, message), used solely to respond to the request sent.",
      "Data is not shared with third parties and is kept only for as long as strictly necessary to handle the request. You may request access, correction or deletion of your data at any time by writing to info@nextlabeurope.eu, under Articles 15-22 of EU Regulation 2016/679 (GDPR).",
    ],
    cookieTitle: 'Cookie Policy',
    cookieBody: [
      'This site uses only technical cookies, strictly necessary for the pages to function, and does not use profiling, third-party, or tracking cookies for statistical or advertising purposes.',
      "No browsing data linked to site visitors is therefore collected via cookies. For any information, please write to info@nextlabeurope.eu.",
    ],
    close: 'Close',
  },
};

export default function LegalModal({ lang, type, onClose }) {
  const t = translations[lang];
  if (!type) return null;

  const title = type === 'privacy' ? t.privacyTitle : t.cookieTitle;
  const body = type === 'privacy' ? t.privacyBody : t.cookieBody;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-[100] flex items-center justify-center p-6"
        style={{ backgroundColor: 'rgba(12,12,12,0.6)' }}
      >
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 20, scale: 0.98 }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-lg max-h-[80vh] overflow-y-auto bg-white rounded-2xl p-8 lg:p-10"
        >
          <button onClick={onClose} aria-label={t.close}
            className="absolute top-6 right-6 w-9 h-9 rounded-full flex items-center justify-center"
            style={{ backgroundColor: '#f3f4f6' }}>
            <X className="w-4 h-4" />
          </button>
          <h3 className="font-heading font-extrabold text-2xl mb-6 pr-10" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            {title}
          </h3>
          <div className="space-y-4">
            {body.map((p, i) => (
              <p key={i} className="text-sm leading-relaxed" style={{ color: '#6b7280' }}>{p}</p>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
