const db = require('./config/firebase');

async function testCollections() {
  try {
    console.log('Testando coleções do Firebase...');
    
    // Testar coleção de clientes
    console.log('\n--- Testando coleção "clients" ---');
    const clientsRef = db.collection('clients');
    const clientsSnapshot = await clientsRef.limit(5).get();
    console.log(`Encontrados ${clientsSnapshot.size} clientes.`);
    if (clientsSnapshot.size > 0) {
      console.log('Exemplo de cliente:');
      const clientSample = clientsSnapshot.docs[0].data();
      console.log(JSON.stringify(clientSample, null, 2));
    }
    
    // Testar coleção de produtos
    console.log('\n--- Testando coleção "products" ---');
    const productsRef = db.collection('products');
    const productsSnapshot = await productsRef.limit(5).get();
    console.log(`Encontrados ${productsSnapshot.size} produtos.`);
    if (productsSnapshot.size > 0) {
      console.log('Exemplo de produto:');
      const productSample = productsSnapshot.docs[0].data();
      console.log(JSON.stringify(productSample, null, 2));
    }
    
    // Testar coleção de pedidos
    console.log('\n--- Testando coleção "orders" ---');
    const ordersRef = db.collection('orders');
    const ordersSnapshot = await ordersRef.limit(5).get();
    console.log(`Encontrados ${ordersSnapshot.size} pedidos.`);
    if (ordersSnapshot.size > 0) {
      console.log('Exemplo de pedido:');
      const orderSample = ordersSnapshot.docs[0].data();
      console.log(JSON.stringify(orderSample, null, 2));
      
      // Verificar formato da data de pedido
      if (orderSample.dataPedido) {
        console.log('\nFormato da data do pedido:');
        console.log(`Tipo: ${typeof orderSample.dataPedido}`);
        if (typeof orderSample.dataPedido === 'object' && orderSample.dataPedido.toDate) {
          console.log('É um Timestamp do Firestore');
          console.log('Data convertida:', orderSample.dataPedido.toDate());
        } else if (typeof orderSample.dataPedido === 'string') {
          console.log('É uma string');
        }
      }
    }
    
  } catch (error) {
    console.error('Erro ao testar coleções:', error);
  }
}

testCollections();
