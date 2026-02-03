const logToFile = require('../utils/logger');

const validate = (schema) => (req, res, next) => {
    try {
        logToFile("VALIDATION MIDDLEWARE INPUT:", req.body);
        schema.parse({
            body: req.body,
            query: req.query,
            params: req.params,
        });
        next();
    } catch (e) {
        logToFile("VALIDATION ERROR:", e.errors);
        return res.status(400).send(e.errors);
    }
};

module.exports = validate;
