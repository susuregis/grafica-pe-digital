const db = require('../config/firebase');

// Criar material no estoque
exports.createMaterial = async (req, res) => {
  try {
    console.log('Requisição para criar material recebida:', req.body);
    
    if (!req.body || Object.keys(req.body).length === 0) {
      console.log('Corpo da requisição vazio');
      return res.status(400).json({ message: 'Dados do material não fornecidos' });
    }
    
    if (!req.body.nome) {
      console.log('Nome do material não fornecido');
      return res.status(400).json({ message: 'Nome do material é obrigatório' });
    }
    
    const data = req.body;
    console.log('Adicionando material ao Firestore:', data);
    
    const newMaterial = await db.collection('materials').add(data);
    console.log('Material criado com ID:', newMaterial.id);
    
    res.status(201).json({ message: 'Material criado com sucesso', id: newMaterial.id });
  } catch (error) {
    console.error('Erro ao criar material:', error);
    res.status(500).json({ error: error.message, stack: error.stack });
  }
};

// Listar todos os materiais
exports.getAllMaterials = async (req, res) => {
  try {
    console.log('Requisição para listar materiais recebida');
    
    const snapshot = await db.collection('materials').get();
    console.log('Número de documentos recuperados:', snapshot.size);
    
    const materials = [];
    snapshot.forEach(doc => {
      materials.push({ id: doc.id, ...doc.data() });
    });
    
    console.log('Materiais recuperados:', materials.length);
    res.status(200).json(materials);
  } catch (error) {
    console.error('Erro ao listar materiais:', error);
    res.status(500).json({ error: error.message, stack: error.stack });
  }
};

// Buscar material por ID
exports.getMaterialById = async (req, res) => {
  try {
    const id = req.params.id;
    const materialDoc = await db.collection('materials').doc(id).get();

    if (!materialDoc.exists) {
      return res.status(404).json({ message: 'Material não encontrado' });
    }

    res.status(200).json({ id: materialDoc.id, ...materialDoc.data() });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Atualizar material
exports.updateMaterial = async (req, res) => {
  try {
    const id = req.params.id;
    const data = req.body;
    const materialRef = db.collection('materials').doc(id);
    const materialDoc = await materialRef.get();

    if (!materialDoc.exists) {
      return res.status(404).json({ message: 'Material não encontrado' });
    }

    await materialRef.update(data);
    res.status(200).json({ message: 'Material atualizado com sucesso' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Deletar material
exports.deleteMaterial = async (req, res) => {
  try {
    const id = req.params.id;
    const materialRef = db.collection('materials').doc(id);
    const materialDoc = await materialRef.get();

    if (!materialDoc.exists) {
      return res.status(404).json({ message: 'Material não encontrado' });
    }

    // Verificar se o material está sendo usado em algum produto
    const productsSnapshot = await db.collection('products').where('materialId', '==', id).get();
    
    if (!productsSnapshot.empty) {
      return res.status(400).json({ 
        message: 'Este material está sendo usado em produtos e não pode ser excluído.',
        usedInProducts: productsSnapshot.size
      });
    }

    await materialRef.delete();
    res.status(200).json({ message: 'Material deletado com sucesso' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Atualizar estoque do material
exports.updateMaterialStock = async (req, res) => {
  try {
    const id = req.params.id;
    const { quantidade, operacao } = req.body;
    
    if (!quantidade || !['adicionar', 'remover'].includes(operacao)) {
      return res.status(400).json({ 
        message: 'Requisição inválida. Informe a quantidade e operação (adicionar/remover).'
      });
    }

    const materialRef = db.collection('materials').doc(id);
    const materialDoc = await materialRef.get();

    if (!materialDoc.exists) {
      return res.status(404).json({ message: 'Material não encontrado' });
    }

    const materialData = materialDoc.data();
    let novoEstoque = materialData.estoque || 0;
    
    if (operacao === 'adicionar') {
      novoEstoque += parseInt(quantidade);
    } else {
      novoEstoque -= parseInt(quantidade);
      if (novoEstoque < 0) {
        return res.status(400).json({ 
          message: 'Estoque insuficiente para esta operação.',
          estoqueAtual: materialData.estoque
        });
      }
    }

    await materialRef.update({ estoque: novoEstoque });
    
    res.status(200).json({ 
      message: `Estoque ${operacao === 'adicionar' ? 'adicionado' : 'removido'} com sucesso`,
      estoqueAnterior: materialData.estoque,
      estoqueAtual: novoEstoque
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
