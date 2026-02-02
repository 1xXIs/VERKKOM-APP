const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
    try {
        const MONGO_URI = process.env.MONGO_URI;
        if (!MONGO_URI) {
            console.error("❌ FATAL ERROR: No se encontró la variable MONGO_URI.");
            process.exit(1);
        }

        await mongoose.connect(MONGO_URI);
        console.log("✅ Conectado a la Base de Datos MongoDB");
    } catch (error) {
        console.error("❌ Error de conexión:", error);
        process.exit(1);
    }
};

module.exports = connectDB;
