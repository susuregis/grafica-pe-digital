const express = require('express');
const router = express.Router();
const ordersController = require('../controllers/ordersController');

// Criar pedido
router.post('/', ordersController.createOrder);

// Listar todos os pedidos
router.get('/', ordersController.getAllOrders);

// Gerar PDF de pedido (coloque antes do /:id!)
router.get('/:id/pdf', ordersController.generateOrderPDF);

// Buscar pedido por ID
router.get('/:id', ordersController.getOrderById);

// Atualizar pedido
router.put('/:id', ordersController.updateOrder);

// Atualizar status do pedido
router.patch('/:id/status', ordersController.updateOrderStatus);

// Deletar pedido
router.delete('/:id', ordersController.deleteOrder);

module.exports = router;
