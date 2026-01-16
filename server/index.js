const express = require('express');
const { google } = require('googleapis');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const SPREADSHEET_ID = '1LYqIIong6BWh354qunGMmJ1ItqXj9gGA8JTcKzlFfjo';
const SHEET_NAME = 'AGENDA_'; // Confirmado por tu prueba

app.get('/api/actividades-manana', async (req, res) => {
    try {
        console.log("1. Frontend pidió datos...");
        
        const auth = new google.auth.GoogleAuth({
            keyFile: 'credentials.json',
            scopes: 'https://www.googleapis.com/auth/spreadsheets',
        });

        const client = await auth.getClient();
        const googleSheets = google.sheets({ version: 'v4', auth: client });

        // LEEMOS UN RANGO FIJO Y PEQUEÑO PARA PROBAR
        // Leemos desde B5 hasta H20 de la hoja "AGENDA_"
        const rango = `'${SHEET_NAME}'!B5:H20`;
        console.log(`2. Consultando a Google en rango: ${rango}`);

        const getRows = await googleSheets.spreadsheets.values.get({
            auth,
            spreadsheetId: SPREADSHEET_ID,
            range: rango, 
        });

        const rawRows = getRows.data.values;
        console.log("3. Respuesta cruda de Google:", rawRows); // <--- ESTO ES LO IMPORTANTE

        if (!rawRows || rawRows.length === 0) {
            console.log("❌ Google dice que esas celdas están vacías.");
            return res.json({ actividades: [] });
        }

        // Mapeo simple sin filtros raros
        const actividades = rawRows.map((row, index) => {
            // Si la fila está totalmente vacía, la saltamos
            if (row.length === 0) return null;

            return {
                id: index,
                actividad: row[0] || "---", // Columna B
                direccion: row[1] || "---", // Columna C
                servicio: row[2]  || "---", // Columna D
                costo: row[3]     || "$0",  // Columna E
                horario: row[4]   || "---", // Columna F
                estado: row[5]    || "---", // Columna G
                telefono: row[6]  || "---"  // Columna H
            };
        }).filter(item => item !== null);

        console.log(`4. Enviando ${actividades.length} actividades al Frontend.`);
        res.json({ fecha: "Prueba Directa", actividades });

    } catch (error) {
        console.error("❌ ERROR:", error.message);
        res.status(500).json({ error: error.message });
    }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Servidor Detective corriendo en http://localhost:${PORT}`);
});