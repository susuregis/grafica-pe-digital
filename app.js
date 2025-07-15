const express = require('express');
const path = require('path');
const cors = require('cors');
const app = express();

// Carregar variáveis de ambiente
require('dotenv').config();

// Apenas uma rota de teste simples para verificar se a API está funcionando
app.get('/api/test', (req, res) => {
  res.json({ message: 'API funcionando!' });
});

// Rota de teste para materiais
app.get('/api/materials-test', async (req, res) => {
  try {
    const db = require('./config/firebase');
    const snapshot = await db.collection('materials').get();
    res.json({ 
      message: 'Teste de materiais realizado com sucesso', 
      count: snapshot.size,
      firebaseOk: true
    });
  } catch (error) {
    console.error('Erro no teste de materiais:', error);
    res.status(500).json({ 
      message: 'Erro no teste de materiais', 
      error: error.message,
      stack: error.stack,
      firebaseOk: false
    });
  }
});



// Middleware para CORS - permitindo todas as origens para desenvolvimento
app.use(cors({
  origin: '*', // Permite qualquer origem durante o desenvolvimento
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true
}));

// Middleware para parsing de JSON
app.use(express.json());

// Diretório para servir arquivos estáticos (PDFs, uploads, etc.)
app.use(express.static(path.join(__dirname, 'public')));
app.use('/pdfs', express.static(path.join(__dirname, 'pdfs')));
app.use('/assets', express.static(path.join(__dirname, 'assets')));

// Importando rotas com prefixo API
const clientRoutes = require('./routes/clientRoutes');
app.use('/api/clients', clientRoutes);
app.use('/clients', clientRoutes); // Mantendo compatibilidade

const orderRoutes = require('./routes/orderRoutes');
app.use('/api/orders', orderRoutes);
app.use('/orders', orderRoutes); // Mantendo compatibilidade

const productsRoutes = require('./routes/productsRoutes');
app.use('/api/products', productsRoutes);
app.use('/products', productsRoutes); // Mantendo compatibilidade

const materialsRoutes = require('./routes/materialsRoutes');
app.use('/api/materials', materialsRoutes);
app.use('/materials', materialsRoutes); // Mantendo compatibilidade

// Use o arquivo de rotas do dashboard com dados reais
const dashboardRoutes = require('./routes/dashboard');
app.use('/api/dashboard', dashboardRoutes);
app.use('/dashboard', dashboardRoutes); // Mantendo compatibilidade

// Rota principal para servir o frontend
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

module.exports = app;