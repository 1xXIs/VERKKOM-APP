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
        notas: data.notas,
        assigned_to: data.assigned_to,
        created_by: data.created_by
    };

    // FORCE $set to ensure fields are written even if schema ignores them
    return await Actividad.findByIdAndUpdate(
        id,
        { $set: updatePayload },
        { new: true, strict: false }
    );
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
