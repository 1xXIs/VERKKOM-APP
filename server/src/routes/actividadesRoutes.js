const express = require('express');
const router = express.Router();
const ActividadController = require('../controllers/ActividadController');

router.get('/', ActividadController.getActividades);
router.post('/', ActividadController.createActividad);
router.put('/:id', ActividadController.updateActividad);
router.delete('/:id', ActividadController.deleteActividad);

module.exports = router;
