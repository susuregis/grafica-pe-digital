console.log('Verificando exports do dashboardController...');

const dashboardController = require('./controllers/dashboardController');

console.log('dashboardController:', dashboardController);
console.log('Tipo de getSummary:', typeof dashboardController.getSummary);
console.log('Tipo de getOrdersPerDay:', typeof dashboardController.getOrdersPerDay);
console.log('Tipo de getTopProducts:', typeof dashboardController.getTopProducts);
console.log('Tipo de getDailyRevenue:', typeof dashboardController.getDailyRevenue);
console.log('Tipo de getMonthlyRevenue:', typeof dashboardController.getMonthlyRevenue);

// Verificar se todas são funções
const methods = ['getSummary', 'getOrdersPerDay', 'getTopProducts', 'getDailyRevenue', 'getMonthlyRevenue'];
methods.forEach(method => {
  if (typeof dashboardController[method] === 'function') {
    console.log(`✅ ${method} é uma função válida`);
  } else {
    console.log(`❌ ${method} NÃO é uma função válida (tipo: ${typeof dashboardController[method]})`);
  }
});
