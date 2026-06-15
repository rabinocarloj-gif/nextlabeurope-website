import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';

export default function SiteLayout() {
  const [lang, setLang] = useState('it');
  return (
    <div className="min-h-screen bg-background lattice-line">
      <Navbar lang={lang} setLang={setLang} />
      <main><Outlet context={{ lang }} /></main>
      <Footer lang={lang} />
    </div>
  );
}
