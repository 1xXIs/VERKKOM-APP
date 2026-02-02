require('dotenv').config();
const app = require('./src/app');

// Configuración del puerto para Render
const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});
