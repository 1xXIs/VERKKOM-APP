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

const logToFile = require('../utils/logger');

const createActividad = async (req, res) => {
    try {
        logToFile("CREATE PAYLOAD RECEIVED:", req.body);
        const guardada = await ActividadService.create(req.body);
        logToFile("CREATE RESULT:", guardada);
        res.status(201).json(guardada);
    } catch (error) {
        logToFile("CREATE ERROR:", error.message);
        res.status(400).json({ message: error.message });
    }
};

const updateActividad = async (req, res) => {
    try {
        logToFile("UPDATE PAYLOAD RECEIVED:", req.body);
        const actualizada = await ActividadService.update(req.params.id, req.body);
        if (!actualizada) {
            return res.status(404).json({ message: "Actividad no encontrada" });
        }
        // DEBUG: Return received payload to verify what the server sees
        res.json({
            result: "SUCCESS",
            data_saved: actualizada,
            debug_payload_received: req.body
        });
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
