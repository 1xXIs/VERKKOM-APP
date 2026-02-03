const mongoose = require('mongoose');

const ActividadSchema = new mongoose.Schema({
    tipo: {
        type: String,
        enum: ['INSTALACION', 'SOPORTE', 'MIGRACION', 'FIBRA', 'ANTENA'], // Expanded for backward compatibility
        default: 'SOPORTE'
    },
    horario: String,
    cliente: String,
    servicio: String,
    direccion: String,
    telefono: String,
    costo: String,
    estado: {
        type: String,
        enum: ['PENDIENTE', 'EN_RUTA', 'FINALIZADO', 'VALIDANDO'],
        default: 'PENDIENTE'
    },
    created_by: { type: String, default: 'OFICINA' }, // Agente de Soporte (Luz, Dina, Brayan)
    assigned_to: { type: String, enum: ['Jairo', 'Armando', 'Por Asignar'], default: 'Por Asignar' }, // Técnico
    fecha: { type: String, default: () => new Date().toLocaleDateString() },
    notas: String // Bitácora interna
});

module.exports = mongoose.model('Actividad', ActividadSchema);
