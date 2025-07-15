console.log('Iniciando servidor de teste...');

try {
  const app = require('./app');
  const PORT = process.env.PORT || 3002;

  app.listen(PORT, () => {
    console.log(`✅ Servidor rodando na porta ${PORT}`);
    console.log(`🌐 Acesse: http://localhost:${PORT}`);
    console.log(`🔧 API Test: http://localhost:${PORT}/api/test`);
  });

} catch (error) {
  console.error('❌ Erro ao iniciar servidor:', error.message);
  console.error('Stack trace:', error.stack);
}
