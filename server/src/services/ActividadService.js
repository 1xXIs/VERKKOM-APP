const Actividad = require('../models/Actividad');

const getAll = async (filters = {}) => {
    let query = {};
    const { fecha, assigned_to, created_by } = filters;

    // Date Logic
    if (!fecha) {
        query.fecha = new Date().toLocaleDateString();
    } else if (fecha !== 'all') {
        query.fecha = fecha;
    }

    // Role Logic
    if (assigned_to) query.assigned_to = assigned_to;
    if (created_by) query.created_by = created_by;

    return await Actividad.find(query).sort({ _id: -1 });
};

const create = async (data) => {
    if (!data.fecha) {
        data.fecha = new Date().toLocaleDateString();
    }
    const nuevaActividad = new Actividad(data);
    return await nuevaActividad.save();
};

const update = async (id, data) => {
    // SECURITY PATCH: Force fields to be recognized
    const updatePayload = {
        ...data,
        notas: data.notas, // Explicitly touch these fields
        assigned_to: data.assigned_to,
        created_by: data.created_by
    };
    console.log("SERVICE UPDATE PAYLOAD (PRE-MONGOOSE):", JSON.stringify(updatePayload, null, 2));
    return await Actividad.findByIdAndUpdate(id, updatePayload, { new: true });
};

const remove = async (id) => {
    return await Actividad.findByIdAndDelete(id);
};

module.exports = {
    getAll,
    create,
    update,
    remove
};
