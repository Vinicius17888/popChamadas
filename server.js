const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const app = express();

// Configuração do CORS para permitir todas as origens
app.use(cors());

// Middleware para interpretar JSON e servir arquivos estáticos
app.use(express.json());
app.use(express.static('public'));

// Rota principal para servir a página inicial
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

// Rota para criar uma nova sala
app.post('/create-room', (req, res) => {
  const { hostName } = req.body;

  if (!hostName || hostName.trim() === '') {
    return res.status(400).json({ success: false, message: 'Nome do host é obrigatório.' });
  }

  const roomId = uuidv4(); // Gerar um UUID para a sala
  const roomLink = `https://popchamadas.netlify.app/room/${roomId}`; // Atualize para o domínio do seu frontend

  console.log(`Sala criada pelo host "${hostName}": ${roomLink}`);
  res.json({ success: true, link: roomLink });
});

// Inicializar o servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
