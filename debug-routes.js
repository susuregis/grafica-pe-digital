console.log('Verificando dashboardRoutes...');

const dashboardRoutes = require('./routes/dashboardRoutes');

console.log('Tipo do dashboardRoutes:', typeof dashboardRoutes);
console.log('É função?', typeof dashboardRoutes === 'function');
console.log('dashboardRoutes:', dashboardRoutes);

if (typeof dashboardRoutes === 'function') {
  console.log('✅ dashboardRoutes é uma função válida do Express router');
} else {
  console.log('❌ dashboardRoutes NÃO é uma função válida do Express router');
}
