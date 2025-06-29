// routes/dashboardRoutes.js
const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');

router.get('/summary', dashboardController.getSummary);
router.get('/orders-per-day', dashboardController.getOrdersPerDay);
router.get('/top-products', dashboardController.getTopProducts);
router.get('/daily-revenue', dashboardController.getDailyRevenue);
router.get('/monthly-revenue', dashboardController.getMonthlyRevenue);


module.exports = router;