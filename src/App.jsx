import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import SiteLayout from './components/layout/SiteLayout';
import Home from './pages/Home';
import Contatti from './pages/Contatti';

function App() {
  return (
    <Router>
      <Routes>
        <Route element={<SiteLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/contatti" element={<Contatti />} />
        </Route>
        <Route path="*" element={<div className="p-20 text-center text-2xl">404 – Pagina non trovata</div>} />
      </Routes>
    </Router>
  )
}

export default App
