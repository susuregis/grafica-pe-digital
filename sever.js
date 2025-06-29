const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 3002;

// Habilitar CORS
app.use(cors());

// Parse JSON
app.use(express.json());

// Dados mock
const mockClients = [
  { id: '1', name: 'Cliente Teste 1', email: 'cliente1@teste.com', phone: '(11) 99999-1111', document: '123.456.789-00', address: 'Rua Teste, 123' },
  { id: '2', name: 'Cliente Teste 2', email: 'cliente2@teste.com', phone: '(11) 99999-2222', document: '234.567.890-00', address: 'Av. Teste, 456' },
  { id: '3', name: 'Empresa ABC', email: 'contato@empresaabc.com', phone: '(11) 3333-3333', document: '11.222.333/0001-44', address: 'Rua Comercial, 789' }
];

// Rota de teste
app.get('/test', (req, res) => {
  res.json({ message: 'API está funcionando!' });
});

// Rota para listar clientes
app.get('/clients', (req, res) => {
  res.json(mockClients);
});

// Iniciar o servidor
app.listen(PORT, () => {
  console.log(`Servidor mock simples rodando na porta ${PORT}`);
  console.log('Rotas disponíveis:');
  console.log('- GET /test');
  console.log('- GET /clients');
});
