const ActividadService = require('../services/ActividadService');

const getActividades = async (req, res) => {
    try {
        const filters = req.query; // Pasa fecha, assigned_to, created_by
        const actividades = await ActividadService.getAll(filters);
        res.json(actividades);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const createActividad = async (req, res) => {
    try {
        const guardada = await ActividadService.create(req.body);
        res.status(201).json(guardada);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const updateActividad = async (req, res) => {
    try {
        const actualizada = await ActividadService.update(req.params.id, req.body);
        if (!actualizada) {
            return res.status(404).json({ message: "Actividad no encontrada" });
        }
        res.json(actualizada);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const deleteActividad = async (req, res) => {
    try {
        await ActividadService.remove(req.params.id);
        res.json({ message: "Actividad eliminada" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getActividades,
    createActividad,
    updateActividad,
    deleteActividad
};
