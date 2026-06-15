import React from 'react';
import { useOutletContext } from 'react-router-dom';
import HeroSection from '../components/home/HeroSection';
import AboutSection from '../components/home/AboutSection';
import WhatWeDoSection from '../components/home/WhatWeDoSection';
import ProgramsSection from '../components/home/ProgramsSection';
import PartnersSection from '../components/home/PartnersSection';

const HERO_IMG = 'https://media.base44.com/images/public/6a22d208947a03fa34e3238c/47aa69a3d_generated_f7d19376.png';
const ABOUT_IMG = 'https://media.base44.com/images/public/6a22d208947a03fa34e3238c/f4c660419_generated_72439d0c.png';

export default function Home() {
  const { lang } = useOutletContext();
  return (
    <>
      <HeroSection lang={lang} heroImage={HERO_IMG} />
      <AboutSection lang={lang} aboutImage={ABOUT_IMG} />
      <WhatWeDoSection lang={lang} />
      <ProgramsSection lang={lang} />
      <PartnersSection lang={lang} />
    </>
  );
}
