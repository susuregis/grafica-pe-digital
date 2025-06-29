const db = require('../config/firebase');

exports.createClient = async (req, res) => {
  try {
    const data = req.body;
    const newClient = await db.collection('clients').add(data);
    res.status(201).json({ message: 'Cliente criado com sucesso', id: newClient.id });
  } catch (error) {
    console.error('Erro ao criar cliente:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.getAllClients = async (req, res) => {
  try {
    console.log('Recebida solicitação para buscar todos os clientes');
    const clientsRef = db.collection('clients');
    const snapshot = await clientsRef.get();

    const clients = [];
    snapshot.forEach(doc => {
      clients.push({ id: doc.id, ...doc.data() });
    });

    console.log(`Retornando ${clients.length} clientes encontrados`);
    res.status(200).json(clients);
  } catch (error) {
    console.error('Erro ao buscar clientes:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.getClientById = async (req, res) => {
  try {
    const id = req.params.id;
    const clientDoc = await db.collection('clients').doc(id).get();

    if (!clientDoc.exists) {
      return res.status(404).json({ message: 'Cliente não encontrado' });
    }

    res.status(200).json({ id: clientDoc.id, ...clientDoc.data() });
  } catch (error) {
    console.error('Erro ao buscar cliente:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.updateClient = async (req, res) => {
  try {
    const id = req.params.id;
    const data = req.body;
    const clientRef = db.collection('clients').doc(id);
    const clientDoc = await clientRef.get();

    if (!clientDoc.exists) {
      return res.status(404).json({ message: 'Cliente não encontrado' });
    }

    await clientRef.update(data);
    res.status(200).json({ message: 'Cliente atualizado com sucesso' });
  } catch (error) {
    console.error('Erro ao atualizar cliente:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.deleteClient = async (req, res) => {
  try {
    const id = req.params.id;
    const clientRef = db.collection('clients').doc(id);
    const clientDoc = await clientRef.get();

    if (!clientDoc.exists) {
      return res.status(404).json({ message: 'Cliente não encontrado' });
    }

    await clientRef.delete();
    res.status(200).json({ message: 'Cliente deletado com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir cliente:', error);
    res.status(500).json({ error: error.message });
  }
};
