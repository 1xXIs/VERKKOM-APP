import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { FaChartPie, FaTasks, FaFilePdf, FaImage, FaPlus, FaTrash } from 'react-icons/fa';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import html2canvas from 'html2canvas';
import './App.css';
import logo from './assets/logo.png';

const API_URL = 'http://localhost:3001/api/actividades';

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
      const response = await fetch(API_URL, {
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

  const handleStatusChange = async (id, newStatus) => {
    try {
      await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado: newStatus })
      });
      refresh();
    } catch (error) { console.error("Error updating status:", error); }
  };

  const handleDelete = async (id) => {
    if (!confirm("¿Estás seguro de eliminar esta actividad?")) return;
    try {
      await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
      refresh();
    } catch (error) { console.error("Error deleting:", error); }
  };

  const generatePDF = () => {
    const doc = new jsPDF();

    // Logo
    const imgProps = doc.getImageProperties(logo);
    const pdfWidth = doc.internal.pageSize.getWidth();
    const imgHeight = (imgProps.height * 40) / imgProps.width; // 40mm width
    doc.addImage(logo, 'PNG', 14, 10, 40, imgHeight);

    // Header Text
    doc.setFontSize(18);
    doc.text("Reporte Diario de Operaciones", pdfWidth - 14, 20, { align: 'right' });
    doc.setFontSize(11);
    doc.text(new Date().toLocaleDateString(), pdfWidth - 14, 28, { align: 'right' });

    const rows = actividades.map(a => [
      a.tipo,
      a.direccion + '\n' + a.telefono,
      a.servicio,
      `$${a.costo}`,
      a.horario,
      a.estado
    ]);

    doc.autoTable({
      head: [["Actividad", "Dirección / Tel", "Servicio", "Costo", "Horario", "Estado"]],
      body: rows,
      startY: 40,
      theme: 'grid',
      headStyles: { fillColor: [22, 163, 74] } // Green color
    });
    doc.save(`Reporte_Verkkom_${new Date().toLocaleDateString().replace(/\//g, '-')}.pdf`);
  };

  const generateImage = async () => {
    // Capturamos el container específico que tiene el header visual
    const element = document.getElementById('export-container');
    const canvas = await html2canvas(element, { scale: 2 });
    const link = document.createElement('a');
    link.href = canvas.toDataURL('image/png');
    link.download = `Reporte_Verkkom_${new Date().toLocaleDateString().replace(/\//g, '-')}.png`;
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
          <div id="export-container" style={{ background: 'white', padding: '15px' }}>
            {/* Header visible solo para impresión/exportación o si se desea */}
            <div className="report-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', borderBottom: '2px solid #eee', paddingBottom: '10px' }}>
              <img src={logo} alt="Verkkom Logo" style={{ height: '60px' }} />
              <div style={{ textAlign: 'right' }}>
                <h2 style={{ margin: 0, color: '#333' }}>REPORTE DIARIO</h2>
                <p style={{ margin: 0, color: '#666' }}>{new Date().toLocaleDateString()}</p>
              </div>
            </div>

            <table className="custom-table">
              <thead>
                <tr><th>Actividad</th><th>Dirección</th><th>Servicio</th><th>Costo</th><th>Horario</th><th>Estado</th><th>Acciones</th></tr>
              </thead>
              <tbody>
                {actividades.map(act => (
                  <tr key={act._id}>
                    <td style={{ fontWeight: 'bold' }}>{act.tipo || "INSTALACION"}</td>
                    <td>{act.direccion}<br /><small style={{ color: '#888' }}>{act.telefono}</small></td>
                    <td>{act.servicio}</td>
                    <td>${act.costo}</td>
                    <td>{act.horario}</td>
                    <td>
                      <select
                        className={`status-badge status-${act.estado.toLowerCase()}`}
                        value={act.estado}
                        onChange={(e) => handleStatusChange(act._id, e.target.value)}
                        style={{ border: 'none', cursor: 'pointer', padding: '5px' }}
                      >
                        <option value="PENDIENTE">PENDIENTE</option>
                        <option value="TERMINADO">TERMINADO</option>
                        <option value="CANCELADO">CANCELADO</option>
                      </select>
                    </td>
                    <td>
                      <button onClick={() => handleDelete(act._id)} style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.1rem' }}>
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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
    try {
      // Filtramos por fecha de hoy por defecto (el backend lo maneja si no enviamos nada, pero explícitamente es mejor)
      const today = new Date().toLocaleDateString();
      const res = await fetch(`${API_URL}?fecha=${today}`);
      setActividades(await res.json());
    } catch (e) { console.error(e); }
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