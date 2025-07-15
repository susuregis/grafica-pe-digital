const express = require('express');
const router = express.Router();
const materialsController = require('../controllers/materialsController');

// Criar novo material
router.post('/', materialsController.createMaterial);

// Listar todos os materiais
router.get('/', materialsController.getAllMaterials);

// Buscar material por ID
router.get('/:id', materialsController.getMaterialById);

// Atualizar material
router.put('/:id', materialsController.updateMaterial);

// Deletar material
router.delete('/:id', materialsController.deleteMaterial);

// Atualizar estoque (adicionar/remover)
router.patch('/:id/stock', materialsController.updateMaterialStock);

module.exports = router;
