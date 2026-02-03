const express = require('express');
const router = express.Router();
const ActividadController = require('../controllers/ActividadController');

const validate = require('../middlewares/validateResource');
const actividadSchema = require('../schemas/actividadSchema.zod');

router.get('/', ActividadController.getActividades);
router.post('/', validate(actividadSchema), ActividadController.createActividad);
router.put('/:id', validate(actividadSchema), ActividadController.updateActividad);
router.delete('/:id', ActividadController.deleteActividad);

module.exports = router;
