import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { FaChartPie, FaTasks, FaFilePdf, FaImage, FaPlus } from 'react-icons/fa';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import html2canvas from 'html2canvas';
import './App.css';

// ... imports igual que antes

// --- COMPONENTE ACTIVIDADES ACTUALIZADO ---
const Actividades = ({ actividades, refresh }) => {
  const tableRef = useRef();
  
  // Estado para el Modal y el Formulario
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    tipo: 'INSTALACION', // Valor por defecto
    direccion: '',
    servicio: 'FIBRA',
    costo: '',
    horario: '10-6',
    telefono: ''
  });

  // Manejar cambios en los inputs
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // ENVIAR DATOS AL BACKEND
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:3001/api/actividades', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      if (response.ok) {
        alert("¡Actividad Agregada!");
        setShowModal(false); // Cerrar modal
        setFormData({ ...formData, direccion: '', telefono: '', costo: '' }); // Limpiar campos clave
        refresh(); // Recargar la lista automáticamente
      } else {
        alert("Error al guardar");
      }
    } catch (error) {
      console.error(error);
    }
  };

  // ... (Tus funciones generatePDF y generateImage se quedan IGUAL) ...
  // Solo copialas aquí adentro como las tenías
  const generatePDF = () => { /* ... tu código de PDF ... */ };
  const generateImage = async () => { /* ... tu código de Imagen ... */ };

  return (
    <div>
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap: 'wrap', gap: '10px'}}>
        <h1 className="header-title">Actividades del Día</h1>
        <div className="btn-group">
          {/* BOTÓN NUEVO PARA AGREGAR */}
          <button onClick={() => setShowModal(true)} className="btn" style={{background: '#10b981', color:'white'}}>
            <FaPlus /> Nueva Actividad
          </button>
          <button onClick={generatePDF} className="btn btn-pdf"><FaFilePdf /> PDF</button>
          <button onClick={generateImage} className="btn btn-img"><FaImage /> Imagen</button>
        </div>
      </div>

      {/* TABLA (Con scroll horizontal en móvil) */}
      <div className="table-container" style={{overflowX: 'auto'}}> 
        <div ref={tableRef} style={{background: 'white', padding: '10px', minWidth: '700px'}}> 
          {/* El minWidth asegura que al generar la imagen NO salga aplastada */}
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
              {actividades.length > 0 ? actividades.map((act) => (
                <tr key={act._id}>
                  <td style={{fontWeight:'bold'}}>{act.tipo || "INSTALACION"}</td>
                  <td>{act.direccion}</td>
                  <td>{act.servicio}</td>
                  <td>{act.costo ? `$${act.costo}` : <span style={{color:'red'}}>SIN COSTO</span>}</td>
                  <td>{act.horario}</td>
                  <td>
                    <span className={`status-badge status-${act.estado ? act.estado.toLowerCase() : 'pendiente'}`}>
                      {act.estado}
                    </span>
                  </td>
                  <td>{act.telefono}</td>
                </tr>
              )) : (
                <tr><td colSpan="7" style={{textAlign:'center', padding:'20px'}}>No hay actividades hoy. ¡Agrega una!</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- MODAL FORMULARIO --- */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2 style={{marginTop:0}}>Nueva Actividad</h2>
            <form onSubmit={handleSubmit}>
              
              <div className="form-group">
                <label className="form-label">Tipo de Actividad</label>
                <select name="tipo" className="form-input" value={formData.tipo} onChange={handleChange}>
                  <option value="INSTALACION">INSTALACION</option>
                  <option value="MIGRACIÓN">MIGRACIÓN</option>
                  <option value="SOPORTE">SOPORTE</option>
                  <option value="RETIRO">RETIRO</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Servicio</label>
                <select name="servicio" className="form-input" value={formData.servicio} onChange={handleChange}>
                  <option value="FIBRA">FIBRA</option>
                  <option value="ANTENA">ANTENA</option>
                  <option value="CÁMARAS">CÁMARAS</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Dirección</label>
                <input required name="direccion" placeholder="Ej: Andromeda 313" className="form-input" onChange={handleChange} value={formData.direccion} />
              </div>

              <div className="form-group">
                <label className="form-label">Teléfono</label>
                <input required name="telefono" type="tel" placeholder="10 dígitos" className="form-input" onChange={handleChange} value={formData.telefono} />
              </div>

              <div className="form-group">
                <div style={{display:'flex', gap:'10px'}}>
                  <div style={{flex:1}}>
                    <label className="form-label">Horario</label>
                    <input name="horario" className="form-input" value={formData.horario} onChange={handleChange} />
                  </div>
                  <div style={{flex:1}}>
                    <label className="form-label">Costo</label>
                    <input name="costo" type="number" placeholder="Ej: 500" className="form-input" onChange={handleChange} value={formData.costo} />
                  </div>
                </div>
              </div>

              <div className="modal-actions">
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary">Cancelar</button>
                <button type="submit" className="btn" style={{background: 'var(--accent)', color:'white'}}>Guardar</button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};