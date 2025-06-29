const express = require('express');
const router = express.Router();
const productsController = require('../controllers/productsController');

// Criar novo material no estoque
router.post('/', productsController.createItem);

// Listar todos os materiais do estoque
router.get('/', productsController.getAllItems);

// Buscar item por ID
router.get('/:id', productsController.getItemById);

// Atualizar item do estoque (ex: quantidade, nome)
router.put('/:id', productsController.updateItem);

// Deletar item do estoque
router.delete('/:id', productsController.deleteItem);

module.exports = router;
