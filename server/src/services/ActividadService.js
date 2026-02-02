const Actividad = require('../models/Actividad');

const getAll = async (fecha) => {
    let query = {};
    if (!fecha) {
        const today = new Date().toLocaleDateString();
        query.fecha = today;
    } else if (fecha !== 'all') {
        query.fecha = fecha;
    }

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
    return await Actividad.findByIdAndUpdate(id, data, { new: true });
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
