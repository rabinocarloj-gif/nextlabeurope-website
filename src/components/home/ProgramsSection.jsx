import React from 'react';
import { motion } from 'framer-motion';

const projects = [
  {
    num: '01',
    title: {
      it: 'Orientamento Imprenditoria e Lavoro',
      en: 'Entrepreneurship & Career Orientation',
    },
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
    desc: {
      it: "Un progetto di inclusione sociale che offre a persone con disabilità l'opportunità di vivere un'esperienza nautica, in un contesto sicuro e accogliente. L'iniziativa favorisce l'inclusione, l'autonomia e il benessere dei partecipanti, promuovendo al tempo stesso una cultura del mare e dello sport accessibile a tutti.",
      en: "A social inclusion project that gives people with disabilities the opportunity to experience sailing in a safe and welcoming setting. The initiative fosters inclusion, independence and wellbeing among participants, while promoting a culture of the sea and sport that is accessible to everyone.",
    },
  },
];

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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {projects.map((project, i) => (
            <motion.div key={project.num} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ delay: i * 0.15 }}
              className="p-10 lg:p-12 rounded-2xl" style={{ border: '1.5px solid #f3f4f6' }}>
              <p className="font-mono text-[10px] uppercase tracking-[0.4em] mb-6" style={{ color: '#1a4fc4', fontFamily: "'JetBrains Mono', monospace" }}>
                {project.num}
              </p>
              <h3 className="font-heading font-bold text-2xl mb-5" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                {project.title[lang]}
              </h3>
              <p className="leading-relaxed text-sm" style={{ color: '#6b7280' }}>
                {project.desc[lang]}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
