const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');

// Rota de teste simples
router.get('/test', (req, res) => {
    res.json({ message: 'Dashboard routes funcionando!' });
});

// Teste apenas getSummary
router.get('/summary', (req, res) => {
    try {
        return dashboardController.getSummary(req, res);
    } catch (error) {
        console.error('Erro na rota summary:', error);
        res.status(500).json({ error: 'Erro interno' });
    }
});

// Teste getDailyRevenue
router.get('/daily-revenue', (req, res) => {
    try {
        return dashboardController.getDailyRevenue(req, res);
    } catch (error) {
        console.error('Erro na rota daily-revenue:', error);
        res.status(500).json({ error: 'Erro interno' });
    }
});

// Teste getMonthlyRevenue
router.get('/monthly-revenue', (req, res) => {
    try {
        return dashboardController.getMonthlyRevenue(req, res);
    } catch (error) {
        console.error('Erro na rota monthly-revenue:', error);
        res.status(500).json({ error: 'Erro interno' });
    }
});

module.exports = router;
