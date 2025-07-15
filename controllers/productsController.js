const db = require('../config/firebase');

// Criar produto
exports.createItem = async (req, res) => {
  try {
    const data = req.body;
    
    // Verifica se o produto tem materiais associados
    if (data.materiais && Array.isArray(data.materiais) && data.materiais.length > 0) {
      // Verificar se todos os materiais existem
      for (const material of data.materiais) {
        if (!material.id) continue;
        
        const materialRef = db.collection('materials').doc(material.id);
        const materialDoc = await materialRef.get();
        
        if (!materialDoc.exists) {
          return res.status(400).json({ 
            message: `Material ID ${material.id} não encontrado` 
          });
        }
      }
    }
    
    const newItem = await db.collection('products').add(data);
    res.status(201).json({ message: 'Produto criado com sucesso', id: newItem.id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Listar todos os itens do estoque
exports.getAllItems = async (req, res) => {
  try {
    const snapshot = await db.collection('products').get();
    const items = [];
    snapshot.forEach(doc => {
      items.push({ id: doc.id, ...doc.data() });
    });
    res.status(200).json(items);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Buscar item por ID
exports.getItemById = async (req, res) => {
  try {
    const id = req.params.id;
    const itemDoc = await db.collection('products').doc(id).get();

    if (!itemDoc.exists) {
      return res.status(404).json({ message: 'Item não encontrado' });
    }

    res.status(200).json({ id: itemDoc.id, ...itemDoc.data() });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Atualizar item do estoque
exports.updateItem = async (req, res) => {
  try {
    const id = req.params.id;
    const data = req.body;
    const itemRef = db.collection('products').doc(id);
    const itemDoc = await itemRef.get();

    if (!itemDoc.exists) {
      return res.status(404).json({ message: 'Item não encontrado' });
    }

    await itemRef.update(data);
    res.status(200).json({ message: 'Item de estoque atualizado com sucesso' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Deletar item do estoque
exports.deleteItem = async (req, res) => {
  try {
    const id = req.params.id;
    const itemRef = db.collection('products').doc(id);
    const itemDoc = await itemRef.get();

    if (!itemDoc.exists) {
      return res.status(404).json({ message: 'Item não encontrado' });
    }

    await itemRef.delete();
    res.status(200).json({ message: 'Item deletado com sucesso' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
