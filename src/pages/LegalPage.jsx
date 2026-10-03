import React, { useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { privacy, cookie, UPDATED } from './legalContent';

const HEADING_FONT = { fontFamily: "'Plus Jakarta Sans', sans-serif" };
const MONO_FONT = { color: '#1a4fc4', fontFamily: "'JetBrains Mono', monospace" };

export default function LegalPage({ type }) {
  const { lang } = useOutletContext();
  const doc = (type === 'cookie' ? cookie : privacy)[lang];

  useEffect(() => { window.scrollTo(0, 0); }, [type]);

  return (
    <section className="pt-36 pb-28 lg:pb-36">
      <div className="max-w-3xl mx-auto px-6 lg:px-8">
        <p className="font-mono text-[12px] uppercase tracking-[0.4em] mb-6" style={MONO_FONT}>Next Lab Europe APS</p>
        <h1 className="font-heading font-extrabold tracking-tight leading-[1.05] mb-4"
          style={{ ...HEADING_FONT, fontSize: 'clamp(2.25rem, 5vw, 3.5rem)' }}>
          {doc.title}
        </h1>
        <p className="text-sm mb-10" style={{ color: '#6b7280' }}>
          {lang === 'it' ? 'Ultimo aggiornamento: ' : 'Last updated: '}{UPDATED[lang]}
        </p>
        <p className="text-lg leading-relaxed mb-12" style={{ color: '#374151' }}>{doc.intro}</p>

        <div className="space-y-10">
          {doc.sections.map((s) => (
            <div key={s.h}>
              <h2 className="font-heading font-bold text-xl mb-4" style={HEADING_FONT}>{s.h}</h2>
              {s.p?.map((t) => <p key={t} className="leading-relaxed mb-3" style={{ color: '#374151' }}>{t}</p>)}
              {s.ul && (
                <ul className="list-disc pl-5 space-y-2 mb-3" style={{ color: '#374151' }}>
                  {s.ul.map((t) => <li key={t} className="leading-relaxed">{t}</li>)}
                </ul>
              )}
              {s.p2?.map((t) => <p key={t} className="leading-relaxed mt-3" style={{ color: '#374151' }}>{t}</p>)}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
