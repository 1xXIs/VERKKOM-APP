const { google } = require('googleapis');
const credenciales = require('./credentials.json'); // Cargamos el archivo directo

async function probarConexion() {
    console.log("1. Iniciando prueba de conexión...");
    console.log("   - Usando el correo del robot:", credenciales.client_email);

    try {
        const auth = new google.auth.GoogleAuth({
            keyFile: 'credentials.json',
            scopes: 'https://www.googleapis.com/auth/spreadsheets',
        });

        const client = await auth.getClient();
        const googleSheets = google.sheets({ version: 'v4', auth: client });
        const SPREADSHEET_ID = '1LYqIIong6BWh354qunGMmJ1ItqXj9gGA8JTcKzlFfjo';

        console.log("2. Intentando acceder a la hoja de cálculo...");
        
        // Intentamos leer los metadatos primero (es la prueba más fácil)
        const metaData = await googleSheets.spreadsheets.get({
            auth,
            spreadsheetId: SPREADSHEET_ID,
        });

        console.log("✅ ¡CONEXIÓN EXITOSA!");
        console.log("   - Título del Excel:", metaData.data.properties.title);
        console.log("   - Pestañas encontradas:");
        
        metaData.data.sheets.forEach(sheet => {
            console.log(`     -> "${sheet.properties.title}"`);
        });

    } catch (error) {
        console.log("\n❌ LA PRUEBA FALLÓ. Aquí está la razón exacta:");
        console.log("------------------------------------------------");
        console.error(error.message); // Muestra el mensaje corto
        console.log("------------------------------------------------");
        
        if (error.message.includes('403') || error.message.includes('permission')) {
            console.log("💡 SOLUCIÓN: Tienes que compartir el Excel con el correo del robot.");
            console.log("   Copia este correo: " + credenciales.client_email);
            console.log("   Ve a tu Excel -> Botón Compartir -> Pégalo y dale permisos de Editor.");
        }
        
        if (error.message.includes('API has not been used') || error.message.includes('enable')) {
            console.log("💡 SOLUCIÓN: No has habilitado la API en Google Cloud.");
            console.log("   Ve a la consola de Google Cloud, busca 'Google Sheets API' y dale al botón HABILITAR.");
        }
    }
}

probarConexion();