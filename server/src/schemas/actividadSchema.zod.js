const { z } = require('zod');

const actividadSchema = z.object({
    body: z.object({
        cliente: z.string({ required_error: "El cliente es requerido" }),
        servicio: z.string().optional(),
        horario: z.string().optional(),
        direccion: z.string().optional(),
        telefono: z.string().optional(),
        costo: z.string().optional(),
        tipo: z.enum(['SOPORTE', 'INSTALACION', 'MIGRACION', 'FIBRA', 'ANTENA']),
        estado: z.enum(['PENDIENTE', 'EN_RUTA', 'FINALIZADO', 'VALIDANDO']).optional(),
        assigned_to: z.enum(['Jairo', 'Armando', 'Por Asignar']).optional(),
        created_by: z.string().optional(),
        notas: z.string().optional().nullable(), // Allow null or empty string explicitly if needed
        fecha: z.union([z.string(), z.date()]).optional() // Allow string or date object
    })
});

module.exports = actividadSchema;
