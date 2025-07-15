console.log('Verificando productsController...');

try {
  const productsController = require('./controllers/productsController');
  console.log('productsController:', productsController);
  console.log('Tipo:', typeof productsController);
  
  const methods = ['createItem', 'getAllItems', 'getItemById', 'updateItem', 'deleteItem'];
  methods.forEach(method => {
    console.log(`${method}:`, typeof productsController[method]);
  });
} catch (error) {
  console.error('Erro ao importar productsController:', error.message);
}
