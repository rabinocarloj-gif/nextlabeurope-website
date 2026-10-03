import React from 'react';
import { motion } from 'framer-motion';

const projects = [
  {
    num: '01',
    title: {
      it: 'Orientamento Imprenditoria e Lavoro',
      en: 'Entrepreneurship & Career Orientation',
    },
    tags: { it: ['Scuole superiori', 'Università', 'Orientamento'], en: ['Secondary schools', 'University', 'Orientation'] },
    icon: 'compass',
    desc: {
      it: "Un percorso di orientamento rivolto a studenti delle scuole secondarie di secondo grado e dell'università, pensato per avvicinare i giovani al mondo dell'imprenditoria e del lavoro. Attraverso incontri, testimonianze e attività pratiche, il progetto aiuta i ragazzi a orientarsi tra le opportunità formative e professionali disponibili sul territorio e a sviluppare competenze imprenditoriali e trasversali utili per il proprio futuro.",
      en: "An orientation programme for upper secondary school and university students, designed to introduce young people to entrepreneurship and the world of work. Through meetings, testimonials and hands-on activities, the project helps students navigate the educational and professional opportunities available in their region, while developing entrepreneurial and transferable skills for their future.",
    },
  },
  {
    num: '02',
    title: {
      it: 'Esperienza Nautica per Diversamente Abili',
      en: 'Sailing Experience for People with Disabilities',
    },
    tags: { it: ['Inclusione sociale', 'Barca', 'Mare'], en: ['Social inclusion', 'Boat', 'Sea'] },
    icon: 'sail',
    desc: {
      it: "Un progetto di inclusione sociale che offre a persone con disabilità l'opportunità di vivere un'esperienza nautica, in un contesto sicuro e accogliente. L'iniziativa favorisce l'inclusione, l'autonomia e il benessere dei partecipanti, promuovendo al tempo stesso una cultura del mare e dello sport accessibile a tutti.",
      en: "A social inclusion project that gives people with disabilities the opportunity to experience sailing in a safe and welcoming setting. The initiative fosters inclusion, independence and wellbeing among participants, while promoting a culture of the sea and sport that is accessible to everyone.",
    },
  },
];

const ICONS = {
  compass: (
    <g fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="32" cy="32" r="22" />
      <path d="M32 6v4M32 54v4M6 32h4M54 32h4" />
      <g className="cmp-needle">
        <path d="M41 23l-5.5 12.5L23 41l5.5-12.5z" />
        <path d="M41 23l-12.5 5.5L32 32z" fill="currentColor" fillOpacity="0.25" />
      </g>
      <circle cx="32" cy="32" r="2" fill="currentColor" />
    </g>
  ),
  sail: (
    <g fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <g className="boat-bob">
        <path d="M31 10v32M31 12L15 40h16M33 16l14 24H33" />
        <path d="M12 46h40l-5 7H17z" />
      </g>
      <clipPath id="seaClip"><rect x="4" y="52" width="56" height="10" /></clipPath>
      <g clipPath="url(#seaClip)">
        <path className="sea-flow" d="M-8 58c4 0 4-2 8-2s4 2 8 2 4-2 8-2 4 2 8 2 4-2 8-2 4 2 8 2 4-2 8-2 4 2 8 2 4-2 8-2 4 2 8 2" />
      </g>
    </g>
  ),
};

const translations = {
  it: {
    label: '03 / PROGETTI',
    title: 'I nostri ',
    titleAccent: 'progetti.',
  },
  en: {
    label: '03 / PROJECTS',
    title: 'Our ',
    titleAccent: 'projects.',
  },
};

export default function ProgramsSection({ lang }) {
  const t = translations[lang];
  return (
    <section id="progetti" className="py-32 lg:py-44 bg-white">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
          className="font-mono text-[10px] uppercase tracking-[0.4em] mb-8" style={{ color: '#1a4fc4', fontFamily: "'JetBrains Mono', monospace" }}>
          {t.label}
        </motion.p>
        <motion.h2 initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="font-heading font-extrabold text-4xl lg:text-5xl leading-tight mb-20"
          style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
          {t.title}<span className="text-blue-gradient">{t.titleAccent}</span>
        </motion.h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10">
          {projects.map((project, i) => (
            <motion.article key={project.num} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ delay: i * 0.15, duration: 0.6 }}
              className="card-glow group relative rounded-3xl overflow-hidden bg-white transition-all duration-500 hover:-translate-y-1.5 hover:shadow-[0_30px_60px_-30px_rgba(26,79,196,0.35)]"
              style={{ border: '1px solid #ececf1' }}>
              <div className="relative h-44 overflow-hidden" style={{ background: 'linear-gradient(135deg, #eaf1ff 0%, #f6f9ff 55%, #ffffff 100%)' }}>
                <div aria-hidden="true" className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(rgba(26,79,196,0.12) 1px, transparent 1px)', backgroundSize: '18px 18px', maskImage: 'linear-gradient(to right, transparent, #000 60%)', WebkitMaskImage: 'linear-gradient(to right, transparent, #000 60%)' }} />
                <div aria-hidden="true" className="absolute -right-16 -top-16 w-64 h-64 rounded-full transition-transform duration-700 group-hover:scale-110"
                  style={{ background: 'radial-gradient(circle, rgba(74,144,226,0.28) 0%, rgba(74,144,226,0) 70%)' }} />
                <svg viewBox="0 0 64 64" className="absolute right-8 top-1/2 -translate-y-1/2 w-28 h-28 text-[#1a4fc4] opacity-80 transition-transform duration-700 group-hover:scale-110 group-hover:rotate-6">
                  {ICONS[project.icon]}
                </svg>
                <div className="absolute left-8 top-8">
                  <span className="font-mono text-[10px] uppercase tracking-[0.4em]" style={{ color: '#1a4fc4', fontFamily: "'JetBrains Mono', monospace" }}>
                    {lang === 'it' ? 'Progetto' : 'Project'} {project.num}
                  </span>
                </div>
                <span className="absolute left-8 bottom-6 font-heading font-extrabold leading-none select-none"
                  style={{ fontSize: '3.5rem', color: '#ffffff', textShadow: '0 6px 18px rgba(26,79,196,0.22)', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{project.num}</span>
              </div>
              <div className="p-8 lg:p-10">
                <h3 className="font-heading font-bold text-2xl mb-4 transition-colors duration-500 group-hover:text-[#1a4fc4]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                  {project.title[lang]}
                </h3>
                <div className="flex flex-wrap gap-2 mb-5">
                  {project.tags[lang].map((tag) => (
                    <span key={tag} className="px-3 py-1 rounded-full text-xs" style={{ backgroundColor: '#eff4ff', color: '#1a4fc4' }}>{tag}</span>
                  ))}
                </div>
                <p className="leading-relaxed text-sm" style={{ color: '#6b7280' }}>
                  {project.desc[lang]}
                </p>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
