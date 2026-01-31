require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// --- 1. CONEXIÓN A MONGODB ---
// Aquí está tu link real con la contraseña que me pasaste:
const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error("❌ FATAL ERROR: No se encontró la variable MONGO_URI.");
}

mongoose.connect(MONGO_URI)
  .then(() => console.log("✅ Conectado a la Base de Datos MongoDB"))
  .catch(err => console.error("❌ Error de conexión:", err));

// --- 2. DEFINIR EL MODELO (La estructura de tus datos) ---
// En tu index.js (Backend)
// --- 2. DEFINIR EL MODELO ---
const ActividadSchema = new mongoose.Schema({
  tipo: String,      // <--- NUEVO: Para guardar "Instalación", "Soporte", etc.
  horario: String,
  cliente: String,
  servicio: String,  // Fibra, Antena
  direccion: String,
  telefono: String,
  costo: String,
  estado: { type: String, default: 'PENDIENTE' },
  fecha: { type: String, default: () => new Date().toLocaleDateString() }
});

const Actividad = mongoose.model('Actividad', ActividadSchema);

// --- 3. RUTAS (API) ---

// GET: Obtener actividades (Filtro diario)
app.get('/api/actividades', async (req, res) => {
  try {
    const { fecha } = req.query;
    let query = {};

    // Si no se especifica fecha, usar la de HOY (ajustada a string local)
    // Nota: Para producción idealmente usar ISO, pero mantenemos compatibilidad con Schema actual
    if (!fecha) {
      const today = new Date().toLocaleDateString();
      query.fecha = today;
    } else if (fecha !== 'all') {
      query.fecha = fecha;
    }

    // Ordenar: Pendientes primero, luego Terminados
    const actividades = await Actividad.find(query).sort({ _id: -1 });
    res.json(actividades);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST: Crear una nueva actividad
app.post('/api/actividades', async (req, res) => {
  try {
    // Asegurar que tenga fecha si no viene
    if (!req.body.fecha) {
      req.body.fecha = new Date().toLocaleDateString();
    }
    const nuevaActividad = new Actividad(req.body);
    const guardada = await nuevaActividad.save();
    res.status(201).json(guardada);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// PUT: Actualizar actividad (Estado, datos, etc)
app.put('/api/actividades/:id', async (req, res) => {
  try {
    const actualizada = await Actividad.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true } // Devolver el objeto actualizado
    );
    res.json(actualizada);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// DELETE: Borrar actividad
app.delete('/api/actividades/:id', async (req, res) => {
  try {
    await Actividad.findByIdAndDelete(req.params.id);
    res.json({ message: "Actividad eliminada" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Configuración del puerto para Render
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});