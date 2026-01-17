import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
// import './index.css'; // (Opcional si usas estilos externos)

// Tu URL de Render (API nueva)
const API_URL = 'https://verkkom-api.onrender.com/api/actividades';

function App() {
  const [actividades, setActividades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    horario: '', cliente: '', servicio: '', direccion: '', telefono: '', costo: ''
  });
  
  const printRef = useRef();

  // Cargar actividades al iniciar
  useEffect(() => {
    fetchActividades();
  }, []);

  const fetchActividades = async () => {
    try {
      const res = await axios.get(API_URL);
      setActividades(res.data);
      setLoading(false);
    } catch (error) {
      console.error("Error cargando datos:", error);
      setLoading(false);
    }
  };

  // Manejar formulario
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Guardar nueva actividad (POST)
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(API_URL, form);
      fetchActividades(); // Recargar la lista
      setForm({ horario: '', cliente: '', servicio: '', direccion: '', telefono: '', costo: '' }); // Limpiar
    } catch (error) {
      console.error("Error guardando:", error);
      alert("Error al guardar. Revisa la consola.");
    }
  };

  // Borrar actividad (DELETE)
  const handleDelete = async (id) => {
    if(!confirm("¿Borrar esta actividad?")) return;
    try {
      await axios.delete(`${API_URL}/${id}`);
      fetchActividades();
    } catch (error) {
      console.error("Error borrando:", error);
    }
  };

  // Generar PDF e Imagen
  const handleDownload = async () => {
    const element = printRef.current;
    const canvas = await html2canvas(element, { scale: 2, useCORS: true, backgroundColor: '#ffffff' });
    const imgData = canvas.toDataURL('image/png');
    
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save(`Reporte_Verkkom_${new Date().toLocaleDateString().replace(/\//g, '-')}.pdf`);
  };

  if (loading) return <div style={{padding:30}}>Cargando sistema...</div>;

  return (
    <div className="container">
      
      {/* --- PANEL DE ADMINISTRACIÓN (NUEVO) --- */}
      <div className="admin-panel" style={{marginBottom: '20px', padding: '20px', background: '#f8f9fa', borderRadius: '8px'}}>
        <h2 style={{marginTop:0}}>🛠️ Agregar Actividad</h2>
        <form onSubmit={handleSubmit} style={{display: 'flex', flexWrap: 'wrap', gap: '10px'}}>
          <input name="horario" placeholder="Horario (10:00 AM)" value={form.horario} onChange={handleChange} required style={{padding:'8px'}} />
          <input name="cliente" placeholder="Cliente / Tarea" value={form.cliente} onChange={handleChange} required style={{padding:'8px', flexGrow:1}} />
          <input name="servicio" placeholder="Tipo Servicio" value={form.servicio} onChange={handleChange} style={{padding:'8px'}} />
          <input name="direccion" placeholder="Dirección" value={form.direccion} onChange={handleChange} required style={{padding:'8px', flexGrow:1}} />
          <input name="telefono" placeholder="Teléfono" value={form.telefono} onChange={handleChange} style={{padding:'8px'}} />
          <input name="costo" placeholder="Costo" value={form.costo} onChange={handleChange} style={{padding:'8px'}} />
          <button type="submit" style={{background:'#28a745', color:'white', border:'none', padding:'8px 15px', cursor:'pointer', borderRadius:'4px'}}>
            ➕ Agregar
          </button>
        </form>
      </div>

      <div className="actions">
        <button onClick={handleDownload} className="btn-export">
          📸 📄 Descargar Reporte
        </button>
      </div>

      {/* --- ÁREA IMPRIMIBLE --- */}
      <div ref={printRef} className="printable-area">
        <header className="header">
          <div>
            <h1>VERKKOM</h1>
            <p>Agenda de Servicios Técnicos</p>
          </div>
          <div style={{textAlign: 'right'}}>
            <p>Fecha de emisión:</p>
            <strong>{new Date().toLocaleDateString()}</strong>
          </div>
        </header>

        <div className="activity-list">
          {actividades.length === 0 ? (
            <p style={{textAlign: 'center', color: '#999'}}>No hay actividades para hoy.</p>
          ) : (
            actividades.map((act) => (
              <div key={act._id} className="activity-card" style={{position: 'relative'}}>
                {/* Botón Borrar (Solo visible en pantalla) */}
                <button 
                  onClick={() => handleDelete(act._id)} 
                  data-html2canvas-ignore="true" // Esto hace que el botón NO salga en el PDF
                  style={{position:'absolute', right:'5px', top:'5px', background:'none', border:'none', cursor:'pointer', fontSize:'16px'}}
                  title="Borrar actividad"
                >
                  🗑️
                </button>

                <div className="time-slot">{act.horario}</div>

                <div className="info-slot">
                  <h3>{act.cliente} <span style={{fontSize:'0.8em', color:'#666', background:'#eee', padding:'2px 5px', borderRadius:'4px'}}>{act.servicio}</span></h3>
                  <div className="details">
                    <div>📍 <strong>Dirección:</strong> {act.direccion}</div>
                    {act.telefono && <div>📞 <strong>Tel:</strong> {act.telefono}</div>}
                  </div>
                </div>

                <div className="meta-slot">
                  <span className="status-badge">{act.estado}</span>
                  <span className="cost-badge">{act.costo}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default App;