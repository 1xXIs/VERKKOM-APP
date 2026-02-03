import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import AgendaDiaria from './pages/AgendaDiaria';
import ActividadesSoporte from './pages/ActividadesSoporte';
import Configuracion from './pages/Configuracion';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/agenda" element={<AgendaDiaria />} />
          <Route path="/soporte" element={<ActividadesSoporte />} />
          <Route path="/config" element={<Configuracion />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;