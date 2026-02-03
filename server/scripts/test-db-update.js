require('dotenv').config();
const mongoose = require('mongoose');

// Define Schema EXACTLY as in models/Actividad.js
const ActividadSchema = new mongoose.Schema({
    tipo: {
        type: String,
        enum: ['INSTALACION', 'SOPORTE', 'MIGRACION', 'FIBRA', 'ANTENA'],
        default: 'SOPORTE'
    },
    horario: String,
    cliente: String,
    servicio: String,
    direccion: String,
    telefono: String,
    costo: String,
    estado: {
        type: String,
        enum: ['PENDIENTE', 'EN_RUTA', 'FINALIZADO', 'VALIDANDO'],
        default: 'PENDIENTE'
    },
    created_by: { type: String, default: 'OFICINA' },
    assigned_to: { type: String, enum: ['Jairo', 'Armando', 'Por Asignar'], default: 'Por Asignar' },
    fecha: { type: String, default: () => new Date().toLocaleDateString() },
    notas: String
}, { strict: false });

const Actividad = mongoose.model('Actividad', ActividadSchema);

async function testPersistence() {
    console.log("-----------------------------------------");
    console.log("🧪 STARTING DATABASE PERSISTENCE TEST");
    console.log("-----------------------------------------");

    if (!process.env.MONGO_URI) {
        console.error("❌ ERROR: MONGO_URI not found in .env");
        return;
    }

    try {
        console.log("🔌 Connecting to MongoDB...");
        await mongoose.connect(process.env.MONGO_URI);
        console.log("✅ Connected.");

        // 1. Create Test Document
        const testDoc = await Actividad.create({
            cliente: "TEST_CLIENT_USER_DEBUG",
            direccion: "123 Test St",
            assigned_to: "Por Asignar",
            created_by: "OFICINA",
            notas: "Initial Note"
        });
        console.log("📝 Created Document ID:", testDoc._id);
        console.log("   Initial Data:", {
            assigned_to: testDoc.assigned_to,
            created_by: testDoc.created_by,
            notas: testDoc.notas
        });

        // 2. Perform UPDATE (SImulating the Service Logic)
        const updatePayload = {
            assigned_to: "Armando",
            created_by: "Brayan",
            notas: "UPDATED NOTE - TEST"
        };

        console.log("🔄 Attempting Update with:", updatePayload);

        const updatedDoc = await Actividad.findByIdAndUpdate(
            testDoc._id,
            { $set: updatePayload },
            { new: true, strict: false }
        );

        console.log("✅ Update Completed.");
        console.log("   Updated Data in Memory:", {
            assigned_to: updatedDoc.assigned_to,
            created_by: updatedDoc.created_by,
            notas: updatedDoc.notas
        });

        // 3. Verify Fetch from DB (Double Check)
        const checkDoc = await Actividad.findById(testDoc._id);
        console.log("🔍 Refetched from DB:", {
            assigned_to: checkDoc.assigned_to,
            created_by: checkDoc.created_by,
            notas: checkDoc.notas
        });

        if (checkDoc.assigned_to === "Armando" && checkDoc.created_by === "Brayan") {
            console.log("🎉 SUCCESS: Fields persisted correctly locally.");
        } else {
            console.error("❌ FAILURE: Fields did NOT persist.");
        }

        // Cleanup
        await Actividad.findByIdAndDelete(testDoc._id);
        console.log("🧹 Cleanup done.");

    } catch (error) {
        console.error("❌ FATAL ERROR:", error);
    } finally {
        await mongoose.disconnect();
        process.exit();
    }
}

testPersistence();
