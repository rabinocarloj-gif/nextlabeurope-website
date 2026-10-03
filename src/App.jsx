import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import SiteLayout from './components/layout/SiteLayout';
import Home from './pages/Home';
import Contatti from './pages/Contatti';
import LegalPage from './pages/LegalPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route element={<SiteLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/contatti" element={<Contatti />} />
          <Route path="/privacy" element={<LegalPage type="privacy" />} />
          <Route path="/cookie-policy" element={<LegalPage type="cookie" />} />
        </Route>
        <Route path="*" element={<div className="p-20 text-center text-2xl">404 – Pagina non trovata</div>} />
      </Routes>
    </Router>
  )
}

export default App
