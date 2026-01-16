// src/App.jsx
import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

function App() {
  const [actividades, setActividades] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Esta es la referencia "mágica" al div que vamos a imprimir
  const printRef = useRef(); 

  useEffect(() => {
    // Pedimos los datos al backend que ya tienes funcionando
    axios.get('https://verkkom-api.onrender.com/api/actividades-manana')
      .then(res => {
        setActividades(res.data.actividades || []);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error cargando datos:", err);
        setLoading(false);
      });
  }, []);

  // --- FUNCIÓN QUE GENERA IMAGEN Y PDF ---
  const handleDownload = async () => {
    const element = printRef.current;
    // Usamos la fecha de hoy para el nombre del archivo
    const fechaHoy = new Date().toLocaleDateString().replace(/\//g, '-');
    const fileName = `Reporte_Verkkom_${fechaHoy}`;

    // 1. Generar la "foto" de alta calidad (scale: 2)
    const canvas = await html2canvas(element, { 
      scale: 2, 
      useCORS: true,
      backgroundColor: '#ffffff' // Asegura fondo blanco
    });
    const imgData = canvas.toDataURL('image/png');

    // 2. DESCARGAR COMO IMAGEN (PNG)
    const link = document.createElement('a');
    link.href = imgData;
    link.download = `${fileName}.png`;
    link.click();

    // 3. DESCARGAR COMO PDF
    // 'p' = portrait (vertical), 'mm' = milímetros, 'a4' = tamaño hoja
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth(); // Ancho A4 (210mm)
    // Calculamos la altura proporcional para que la imagen no se estire
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    
    // Añadimos la imagen al PDF (x:0, y:0, ancho, alto calculado)
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save(`${fileName}.pdf`);
  };
  // ---------------------------------------


  if (loading) return <div style={{padding:30}}>Cargando agenda...</div>;

  return (
    <div className="container">
      {/* Botón de acción (No saldrá en la impresión) */}
      <div className="actions">
        <button onClick={handleDownload} className="btn-export">
          📸 📄 Descargar Imagen y PDF
        </button>
      </div>

      {/* ÁREA IMPRIMIBLE (Todo lo que esté dentro de este div saldrá en la imagen) */}
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
            <p style={{textAlign: 'center', color: '#999'}}>No se encontraron actividades en la hoja.</p>
          ) : (
            actividades.map((act, index) => (
              <div key={index} className="activity-card">
                {/* Columna 1: Horario */}
                <div className="time-slot">
                  {act.horario}
                </div>

                {/* Columna 2: Información Principal */}
                <div className="info-slot">
                  <h3>{act.actividad} - {act.servicio}</h3>
                  <div className="details">
                    <div>📍 <strong>Dirección:</strong> {act.direccion}</div>
                    {act.telefono && <div>📞 <strong>Tel:</strong> {act.telefono}</div>}
                  </div>
                </div>

                {/* Columna 3: Meta info */}
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