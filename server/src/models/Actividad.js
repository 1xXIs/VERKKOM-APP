const mongoose = require('mongoose');

const ActividadSchema = new mongoose.Schema({
    tipo: String,      // "Instalación", "Soporte", etc.
    horario: String,
    cliente: String,
    servicio: String,  // Fibra, Antena
    direccion: String,
    telefono: String,
    costo: String,
    estado: { type: String, default: 'PENDIENTE' },
    fecha: { type: String, default: () => new Date().toLocaleDateString() }
});

module.exports = mongoose.model('Actividad', ActividadSchema);
