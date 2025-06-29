const db = require('./config/firebase');

async function testFirebase() {
  try {
    console.log('Testando conexão com Firestore...');
    
    // Tenta acessar a coleção 'clients'
    const clientsRef = db.collection('clients');
    const snapshot = await clientsRef.limit(1).get();
    
    console.log(`Conexão bem-sucedida! Encontrados ${snapshot.size} documentos.`);
    
    // Tenta criar um documento de teste
    const testDoc = await db.collection('test').add({
      timestamp: new Date(),
      message: 'Test connection'
    });
    
    console.log('Documento de teste criado com ID:', testDoc.id);
    console.log('O Firebase está funcionando corretamente!');
    
  } catch (error) {
    console.error('Erro ao testar Firebase:', error);
  }
}

testFirebase();