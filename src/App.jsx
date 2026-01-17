import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { FaChartPie, FaTasks, FaFilePdf, FaImage, FaPlus } from 'react-icons/fa';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import html2canvas from 'html2canvas';
import './App.css';

// --- MENU LATERAL ---
const Sidebar = () => {
  const location = useLocation();
  return (
    <div className="sidebar">
      <div className="brand">VERKKOM APP</div>
      <nav>
        <Link to="/" className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}>
          <FaChartPie /> <span>Dashboard</span>
        </Link>
        <Link to="/actividades" className={`nav-link ${location.pathname === '/actividades' ? 'active' : ''}`}>
          <FaTasks /> <span>Actividades</span>
        </Link>
      </nav>
    </div>
  );
};

// --- VISTA DASHBOARD ---
const Dashboard = ({ actividades }) => {
  const terminados = actividades.filter(a => a.estado === 'TERMINADO').length;
  const pendientes = actividades.filter(a => a.estado === 'PENDIENTE').length;
  return (
    <div>
      <h1 className="header-title">Resumen General</h1>
      <div className="stats-grid">
        <div className="card" style={{ borderLeftColor: '#3b82f6' }}>
          <h3>Total Actividades</h3><p>{actividades.length}</p>
        </div>
        <div className="card" style={{ borderLeftColor: '#10b981' }}>
          <h3>Terminados</h3><p>{terminados}</p>
        </div>
        <div className="card" style={{ borderLeftColor: '#ef4444' }}>
          <h3>Pendientes</h3><p>{pendientes}</p>
        </div>
      </div>
    </div>
  );
};

// --- VISTA ACTIVIDADES ---
const Actividades = ({ actividades, refresh }) => {
  const tableRef = useRef();
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    tipo: 'INSTALACION', direccion: '', servicio: 'FIBRA', costo: '', horario: '10-6', telefono: ''
  });

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 1. Validación: Que no envíe cosas vacías
    if (!formData.direccion || !formData.costo) {
      alert("⚠️ Faltan datos: Por favor completa Dirección y Costo.");
      return;
    }

    try {
      const response = await fetch('https://verkkom-api.onrender.com/api/actividades', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!response.ok) throw new Error('Error al conectar con el servidor');

      alert("✅ ¡Actividad guardada correctamente!");
      setShowModal(false);
      refresh(); // Actualiza la tabla automáticamente

      // 2. Limpiar formulario (dejando valores útiles por defecto)
      setFormData({
        tipo: 'INSTALACION',
        direccion: '',
        servicio: 'FIBRA',
        costo: '',
        horario: '10:00 - 18:00',
        telefono: ''
      });

    } catch (error) {
      console.error(error);
      alert("❌ Error: Asegúrate de que el archivo 'index.js' (Backend) esté corriendo en la terminal.");
    }
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    doc.text("VERKKOM - Reporte Diario", 14, 20);
    const rows = actividades.map(a => [a.tipo, a.direccion, a.servicio, a.costo, a.horario, a.estado, a.telefono]);
    doc.autoTable({ head: [["Actividad", "Dirección", "Servicio", "Costo", "Horario", "Estado", "Tel"]], body: rows, startY: 30 });
    doc.save(`Reporte_${new Date().toLocaleDateString().replace(/\//g, '-')}.pdf`);
  };

  const generateImage = async () => {
    const canvas = await html2canvas(tableRef.current);
    const link = document.createElement('a');
    link.href = canvas.toDataURL('image/png');
    link.download = 'Reporte_Verkkom.png';
    link.click();
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
        <h1 className="header-title">Actividades del Día</h1>
        <div className="btn-group">
          <button onClick={() => setShowModal(true)} className="btn" style={{ background: '#10b981' }}><FaPlus /> Nuevo</button>
          <button onClick={generatePDF} className="btn btn-pdf"><FaFilePdf /> PDF</button>
          <button onClick={generateImage} className="btn btn-img"><FaImage /> IMG</button>
        </div>
      </div>

      <div className="table-container" style={{ overflowX: 'auto' }}>
        <div ref={tableRef} style={{ background: 'white', padding: '15px', minWidth: '700px' }}>
          <div style={{ fontWeight: 'bold', fontSize: '1.2rem', marginBottom: '10px' }}>REPORTE DIARIO - VERKKOM</div>
          <table className="custom-table">
            <thead>
              <tr><th>Actividad</th><th>Dirección</th><th>Servicio</th><th>Costo</th><th>Horario</th><th>Estado</th><th>Tel</th></tr>
            </thead>
            <tbody>
              {actividades.map(act => (
                <tr key={act._id}>
                  <td style={{ fontWeight: 'bold' }}>{act.tipo || "INSTALACION"}</td>
                  <td>{act.direccion}</td><td>{act.servicio}</td><td>${act.costo}</td><td>{act.horario}</td>
                  <td><span className={`status-badge status-${act.estado.toLowerCase()}`}>{act.estado}</span></td>
                  <td>{act.telefono}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Nueva Actividad</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group"><label className="form-label">Tipo</label>
                <select name="tipo" className="form-input" onChange={handleChange}><option>INSTALACION</option><option>SOPORTE</option></select>
              </div>
              <div className="form-group"><label className="form-label">Servicio</label>
                <select name="servicio" className="form-input" onChange={handleChange}><option>FIBRA</option><option>ANTENA</option></select>
              </div>
              <div className="form-group"><label className="form-label">Dirección</label><input required name="direccion" className="form-input" onChange={handleChange} /></div>
              <div className="form-group"><label className="form-label">Teléfono</label><input required name="telefono" className="form-input" onChange={handleChange} /></div>
              <div className="form-group"><label className="form-label">Horario</label><input name="horario" className="form-input" value={formData.horario} onChange={handleChange} placeholder="Ej: 10:00 AM" /></div>
              <div className="form-group"><label className="form-label">Costo</label><input name="costo" type="number" className="form-input" onChange={handleChange} /></div>
              <div className="modal-actions">
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary">Cancelar</button>
                <button type="submit" className="btn" style={{ background: 'var(--accent)' }}>Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

function App() {
  const [actividades, setActividades] = useState([]);
  const fetchActividades = async () => {
    try { const res = await fetch('https://verkkom-api.onrender.com/api/actividades'); setActividades(await res.json()); } catch (e) { console.error(e); }
  };
  useEffect(() => { fetchActividades(); }, []);

  return (
    <Router>
      <div className="layout">
        <Sidebar />
        <div className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard actividades={actividades} />} />
            <Route path="/actividades" element={<Actividades actividades={actividades} refresh={fetchActividades} />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}
export default App;