console.log('Testando importações...');

try {
  console.log('1. Importando dashboardController...');
  const dashboardController = require('./controllers/dashboardController');
  console.log('   ✓ dashboardController importado com sucesso');

  console.log('2. Importando dashboardRoutes...');
  const dashboardRoutes = require('./routes/dashboardRoutes');
  console.log('   ✓ dashboardRoutes importado com sucesso');

  console.log('3. Importando clientsController...');
  const clientsController = require('./controllers/clientsController');
  console.log('   ✓ clientsController importado com sucesso');

  console.log('4. Importando clientRoutes...');
  const clientRoutes = require('./routes/clientRoutes');
  console.log('   ✓ clientRoutes importado com sucesso');

  console.log('5. Importando ordersController...');
  const ordersController = require('./controllers/ordersController');
  console.log('   ✓ ordersController importado com sucesso');

  console.log('6. Importando orderRoutes...');
  const orderRoutes = require('./routes/orderRoutes');
  console.log('   ✓ orderRoutes importado com sucesso');

  console.log('7. Importando productsController...');
  const productsController = require('./controllers/productsController');
  console.log('   ✓ productsController importado com sucesso');

  console.log('8. Importando productsRoutes...');
  const productsRoutes = require('./routes/productsRoutes');
  console.log('   ✓ productsRoutes importado com sucesso');

  console.log('9. Importando app.js...');
  const app = require('./app');
  console.log('   ✓ app.js importado com sucesso');

  console.log('\n✅ Todas as importações foram bem-sucedidas!');
  
} catch (error) {
  console.error('❌ Erro durante a importação:', error.message);
  console.error('Stack trace:', error.stack);
}
