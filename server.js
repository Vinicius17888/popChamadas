const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const sql = require('mssql');
const { v4: uuidv4 } = require('uuid');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Configuração do banco de dados SQL Server
const dbConfig = {
  user: "PMSP\44620", //usuario
  password: '', //senha
  server: 'PMSP02-DEV', //servidor
  database: 'BDViniTest', //banco de dados
  options: {
    encrypt: true,
    trustServerCertificate: true,
  },
};

// Conexão com o banco de dados
sql.connect(dbConfig).then(() => {
  console.log('Conexão com o banco de dados bem-sucedida!');
}).catch(err => {
  console.error('Erro ao conectar ao banco de dados:', err);
});

app.use(express.static('public'));
app.use(express.json());

// Rota principal
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

// Rota para criar uma nova sala
app.post('/create-room', async (req, res) => {
  const { hostName } = req.body;
  if (!hostName) {
    console.error('Nome do host é obrigatório.');
    return res.status(400).json({ success: false, message: 'Nome do host é obrigatório.' });
  }

  const roomId = uuidv4();
  const roomLink = `http://localhost:3000/room/${roomId}`;

  try {
    const pool = await sql.connect(dbConfig);
    await pool.request()
      .input('name', sql.VarChar, hostName)
      .input('link', sql.VarChar, roomLink)
      .query('INSERT INTO Calls (Name, Link) VALUES (@name, @link)');

    console.log(`Sala criada com sucesso: ${roomLink}`);
    res.json({ success: true, link: roomLink });
  } catch (err) {
    console.error('Erro ao salvar a sala no banco de dados:', err);
    res.status(500).json({ success: false, message: 'Erro ao criar a sala' });
  }
});

// Rota para acessar uma sala específica
app.get('/room/:roomId', (req, res) => {
  res.sendFile(__dirname + '/public/room.html');
});

// WebSocket para chat e eventos da sala
io.on('connection', (socket) => {
  console.log('Usuário conectado:', socket.id);

  socket.on('join-room', ({ roomId, userName }) => {
    socket.join(roomId);
    console.log(`${userName} entrou na sala ${roomId}`);
    io.to(roomId).emit('user-joined', `${userName} entrou na sala.`);

    socket.on('chat message', (msg) => {
      io.to(roomId).emit('chat message', { user: userName, text: msg });
    });

    socket.on('disconnect', () => {
      io.to(roomId).emit('user-left', `${userName} saiu da sala.`);
      console.log(`${userName} desconectado da sala ${roomId}`);
    });
  });
});

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
