const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController_simple');

// Rota para obter dados de resumo do dashboard
router.get('/summary', (req, res) => {
  try {
    return dashboardController.getSummary(req, res);
  } catch (error) {
    console.error('Erro na rota summary:', error);
    res.status(500).json({ error: 'Erro interno na rota summary' });
  }
});

// Rota para obter dados de pedidos por dia
router.get('/orders-per-day', (req, res) => {
  try {
    return dashboardController.getOrdersPerDay(req, res);
  } catch (error) {
    console.error('Erro na rota orders-per-day:', error);
    res.status(500).json({ error: 'Erro interno na rota orders-per-day' });
  }
});

// Rota para obter os produtos mais vendidos
router.get('/top-products', (req, res) => {
  try {
    return dashboardController.getTopProducts(req, res);
  } catch (error) {
    console.error('Erro na rota top-products:', error);
    res.status(500).json({ error: 'Erro interno na rota top-products' });
  }
});

// Rota para obter dados de faturamento diário
router.get('/daily-revenue', (req, res) => {
  try {
    return dashboardController.getDailyRevenue(req, res);
  } catch (error) {
    console.error('Erro na rota daily-revenue:', error);
    res.status(500).json({ error: 'Erro interno na rota daily-revenue' });
  }
});

// Rota para obter dados de faturamento mensal
router.get('/monthly-revenue', (req, res) => {
  try {
    return dashboardController.getMonthlyRevenue(req, res);
  } catch (error) {
    console.error('Erro na rota monthly-revenue:', error);
    res.status(500).json({ error: 'Erro interno na rota monthly-revenue' });
  }
});

// Certifique-se de exportar o router
module.exports = router;
