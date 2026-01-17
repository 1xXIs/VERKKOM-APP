import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { FaChartPie, FaTasks, FaFilePdf, FaImage, FaPlus } from 'react-icons/fa';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import html2canvas from 'html2canvas';
import './App.css';

// --- COMPONENTE MENU LATERAL ---
const Sidebar = () => {
  const location = useLocation();
  return (
    <div className="sidebar">
      <div className="brand">VERKKOM APP</div>
      <nav>
        <Link to="/" className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}>
          <FaChartPie /> Dashboard
        </Link>
        <Link to="/actividades" className={`nav-link ${location.pathname === '/actividades' ? 'active' : ''}`}>
          <FaTasks /> Actividades
        </Link>
      </nav>
    </div>
  );
};

// --- PAGINA DASHBOARD ---
const Dashboard = ({ actividades }) => {
  const terminados = actividades.filter(a => a.estado === 'TERMINADO').length;
  const pendientes = actividades.filter(a => a.estado === 'PENDIENTE').length;
  const total = actividades.length;

  return (
    <div>
      <h1 className="header-title">Resumen General</h1>
      <div className="stats-grid">
        <div className="card" style={{ borderLeftColor: '#3b82f6' }}>
          <h3>Total Actividades</h3>
          <p>{total}</p>
        </div>
        <div className="card" style={{ borderLeftColor: '#10b981' }}>
          <h3>Terminados</h3>
          <p>{terminados}</p>
        </div>
        <div className="card" style={{ borderLeftColor: '#ef4444' }}>
          <h3>Pendientes</h3>
          <p>{pendientes}</p>
        </div>
      </div>
    </div>
  );
};

// --- PAGINA ACTIVIDADES (TABLA + PDF/IMG) ---
const Actividades = ({ actividades, refresh }) => {
  const tableRef = useRef(); // Referencia para la foto

  // GENERAR PDF (Estilo Reporte)
  const generatePDF = () => {
    const doc = new jsPDF();
    const fechaHoy = new Date().toLocaleDateString();

    // Encabezado similar al PDF de referencia
    doc.setFontSize(22);
    doc.text("VERKKOM", 14, 20);
    doc.setFontSize(12);
    doc.text("Agenda de Servicios Técnicos", 14, 28);
    doc.text(`Fecha de emisión: ${fechaHoy}`, 14, 34);

    // Tabla
    const tableColumn = ["Actividad", "Dirección", "Servicio", "Costo", "Horario", "Estado", "Teléfono"];
    const tableRows = [];

    actividades.forEach(act => {
      const actividadData = [
        act.tipo || "Instalación", // Usamos el nuevo campo 'tipo' o default
        act.direccion,
        act.servicio,
        act.costo ? `$${act.costo}` : "SIN COSTO",
        act.horario,
        act.estado,
        act.telefono
      ];
      tableRows.push(actividadData);
    });

    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 40,
      theme: 'grid',
      headStyles: { fillColor: [71, 85, 105] }, // Color gris oscuro como tu header
      styles: { fontSize: 10 }
    });

    doc.save(`Reporte_Verkkom_${fechaHoy.replace(/\//g, '-')}.pdf`);
  };

  // GENERAR IMAGEN
  const generateImage = async () => {
    const element = tableRef.current;
    const canvas = await html2canvas(element);
    const data = canvas.toDataURL('image/png');
    
    const link = document.createElement('a');
    link.href = data;
    link.download = 'Reporte_Verkkom.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div>
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
        <h1 className="header-title">Actividades del Día</h1>
        <div className="btn-group">
          <button onClick={generatePDF} className="btn btn-pdf"><FaFilePdf /> Generar PDF</button>
          <button onClick={generateImage} className="btn btn-img"><FaImage /> Descargar Imagen</button>
        </div>
      </div>

      {/* Tabla Container (Lo que se convertirá en imagen) */}
      <div className="table-container" ref={tableRef}>
        <div style={{ padding: '10px 0', fontWeight: 'bold', fontSize: '1.2rem', color: '#0f172a' }}>
           REPORTE DIARIO - VERKKOM
        </div>
        <table className="custom-table">
          <thead>
            <tr>
              <th>Actividad</th>
              <th>Dirección</th>
              <th>Servicio</th>
              <th>Costo</th>
              <th>Horario</th>
              <th>Estado</th>
              <th>Teléfono</th>
            </tr>
          </thead>
          <tbody>
            {actividades.map((act) => (
              <tr key={act._id}>
                <td style={{fontWeight:'bold'}}>{act.tipo || "INSTALACION"}</td>
                <td>{act.direccion}</td>
                <td>{act.servicio}</td>
                <td>{act.costo ? `$${act.costo}` : <span style={{color:'red'}}>SIN COSTO</span>}</td>
                <td>{act.horario}</td>
                <td>
                  <span className={`status-badge status-${act.estado.toLowerCase()}`}>
                    {act.estado}
                  </span>
                </td>
                <td>{act.telefono}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// --- MAIN APP COMPONENT ---
function App() {
  const [actividades, setActividades] = useState([]);

  // Fetch de datos al cargar
  const fetchActividades = async () => {
    try {
      const res = await fetch('http://localhost:3001/api/actividades'); // Tu puerto del index.js
      const data = await res.json();
      setActividades(data);
    } catch (error) {
      console.error("Error cargando datos:", error);
    }
  };

  useEffect(() => {
    fetchActividades();
  }, []);

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