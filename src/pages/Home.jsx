import React from 'react';
import { useOutletContext } from 'react-router-dom';
import HeroSection from '../components/home/HeroSection';
import AboutSection from '../components/home/AboutSection';
import WhatWeDoSection from '../components/home/WhatWeDoSection';
import ProgramsSection from '../components/home/ProgramsSection';
import PartnersSection from '../components/home/PartnersSection';
// import HomeBuddy from '../components/home/HomeBuddy'; // omino della home: disattivato per ora

const HERO_IMG = '/images/home-sfondo.jpg';
const ABOUT_IMG = '/images/chi-siamo.jpg';

export default function Home() {
  const { lang } = useOutletContext();
  return (
    <>
      <HeroSection lang={lang} heroImage={HERO_IMG} />
      <AboutSection lang={lang} aboutImage={ABOUT_IMG} />
      <WhatWeDoSection lang={lang} />
      <ProgramsSection lang={lang} />
      <PartnersSection lang={lang} />
      {/* <HomeBuddy /> */}
    </>
  );
}
