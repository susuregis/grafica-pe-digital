const app = require('./app');
const path = require('path');
const express = require('express');
const PORT = process.env.PORT || 3001;

// Configuração para servir os arquivos estáticos do React em produção
if (process.env.NODE_ENV === 'production') {
  // Serve os arquivos estáticos da pasta build
  app.use(express.static(path.join(__dirname, 'client/build')));
  
  // Para qualquer requisição que não seja das rotas da API, retorna o index.html
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
