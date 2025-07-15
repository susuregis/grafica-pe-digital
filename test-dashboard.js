console.log('Testando rotas do dashboard...');

const express = require('express');
const app = express();
app.use(express.json());

// Importar as rotas
const dashboardRoutes = require('./routes/dashboardRoutes');
app.use('/api/dashboard', dashboardRoutes);

// Rota de teste
app.get('/test', (req, res) => {
  res.json({ message: 'Servidor funcionando!' });
});

const PORT = 3002;

app.listen(PORT, () => {
  console.log(`✅ Servidor de teste rodando na porta ${PORT}`);
  console.log(`🌐 Teste: http://localhost:${PORT}/test`);
  console.log(`📊 Dashboard: http://localhost:${PORT}/api/dashboard/summary`);
});
