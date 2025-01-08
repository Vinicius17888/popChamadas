const express = require('express');
const app = express();

// Servir os arquivos da pasta 'public'
app.use(express.static('public'));

// Iniciar o servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
