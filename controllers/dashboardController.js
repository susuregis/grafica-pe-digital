// controllers/dashboardController.js
const db = require('../config/firebase');

// Função auxiliar para formatar uma data para o formato YYYY-MM-DD
const formatDate = (date) => {
  try {
    if (!date) return null;
    
    if (typeof date === 'string') {
      // Se já for uma string, extrai apenas a parte da data (YYYY-MM-DD)
      return date.split('T')[0];
    }
    
    if (date instanceof Date) {
      // Se for um objeto Date, converte para ISO e extrai a parte da data
      return date.toISOString().split('T')[0];
    }
    
    if (typeof date.toDate === 'function') {
      // Se for um timestamp do Firestore, converte para Date e depois para string
      const dateObj = date.toDate();
      return dateObj.toISOString().split('T')[0];
    }
    
    // Tenta converter para Date se for outro formato
    return new Date(date).toISOString().split('T')[0];
  } catch (error) {
    console.error('Erro ao formatar data:', error);
    return null;
  }
};

// Função auxiliar para extrair o mês e ano de uma data
const getMonthYear = (date) => {
  try {
    if (!date) return null;
    
    let dateObj;
    
    if (typeof date === 'string') {
      dateObj = new Date(date);
    } else if (date instanceof Date) {
      dateObj = date;
    } else if (typeof date.toDate === 'function') {
      dateObj = date.toDate();
    } else {
      dateObj = new Date(date);
    }
    
    // Retorna no formato YYYY-MM
    return `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}`;
  } catch (error) {
    console.error('Erro ao extrair mês e ano:', error);
    return null;
  }
};

// Função auxiliar para calcular o valor total de um pedido
const calculateOrderTotal = (order) => {
  if (!order.products || !Array.isArray(order.products)) {
    return 0;
  }
  
  return order.products.reduce((total, product) => {
    const price = parseFloat(product.price) || 0;
    const quantity = parseInt(product.quantity) || 0;
    return total + (price * quantity);
  }, 0);
};

// Retorna um resumo dos principais números
exports.getSummary = async (req, res) => {
  try {
    console.log('Buscando dados de resumo do dashboard...');
    
    // Buscar contagem total de pedidos
    const ordersSnapshot = await db.collection('orders').get();
    const totalOrders = ordersSnapshot.size;
    
    // Contar pedidos pendentes
    let pendingOrders = 0;
    ordersSnapshot.forEach(doc => {
      const order = doc.data();
      if (order.status === 'Pendente' || order.status === 'Em produção') {
        pendingOrders++;
      }
    });
    
    // Buscar contagem total de clientes
    const clientsSnapshot = await db.collection('clients').get();
    const totalClients = clientsSnapshot.size;
    
    // Buscar contagem total de produtos
    const productsSnapshot = await db.collection('products').get();
    const totalProducts = productsSnapshot.size;
    
    console.log('Dados de resumo recuperados com sucesso');
    
    res.status(200).json({
      totalOrders,
      totalClients,
      totalProducts,
      pendingOrders
    });
  } catch (error) {
    console.error('Erro ao buscar resumo do dashboard:', error);
    res.status(500).json({ error: error.message });
  }
};

// Retorna dados para o gráfico de pedidos por dia
exports.getOrdersPerDay = async (req, res) => {
  try {
    console.log('Buscando dados de pedidos por dia...');
    
    // Buscar todos os pedidos
    const ordersSnapshot = await db.collection('orders').get();
    
    // Agrupar pedidos por data
    const ordersByDate = {};
    
    // Obter a data de hoje e dos últimos 6 dias (para ter uma semana completa)
    const today = new Date();
    const dates = [];
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(today.getDate() - i);
      const formattedDate = formatDate(date);
      dates.push(formattedDate);
      ordersByDate[formattedDate] = 0;
    }
    
    // Contar pedidos para cada data
    ordersSnapshot.forEach(doc => {
      const order = doc.data();
      let orderDate = null;
      
      // Tratamento para diferentes formatos de data
      if (typeof order.dataPedido === 'string') {
        orderDate = order.dataPedido.split('T')[0];
      } else if (order.dataPedido instanceof Date) {
        orderDate = formatDate(order.dataPedido);
      } else if (order.dataPedido && typeof order.dataPedido.toDate === 'function') {
        // Timestamp do Firestore
        const date = order.dataPedido.toDate();
        orderDate = formatDate(date);
      }
      
      if (orderDate && ordersByDate.hasOwnProperty(orderDate)) {
        ordersByDate[orderDate]++;
      }
    });
    
    // Formatar dados para o gráfico
    const result = dates.map(date => ({
      date: date,
      count: ordersByDate[date] || 0
    }));
    
    console.log('Dados de pedidos por dia recuperados com sucesso');
    
    res.status(200).json(result);
  } catch (error) {
    console.error('Erro ao buscar pedidos por dia:', error);
    res.status(500).json({ error: error.message });
  }
};

// Retorna dados dos produtos mais vendidos
exports.getTopProducts = async (req, res) => {
  try {
    console.log('Buscando dados dos produtos mais vendidos...');
    
    // Buscar todos os pedidos
    const ordersSnapshot = await db.collection('orders').get();
    
    // Contar ocorrências de cada produto
    const productCounts = {};
    
    ordersSnapshot.forEach(doc => {
      const order = doc.data();
      if (order.products && Array.isArray(order.products)) {
        order.products.forEach(product => {
          const productId = product.id || product.name;
          if (!productCounts[productId]) {
            productCounts[productId] = {
              id: productId,
              name: product.name || 'Produto sem nome',
              count: 0,
              revenue: 0
            };
          }
          productCounts[productId].count += (product.quantity || 1);
          productCounts[productId].revenue += ((product.price || 0) * (product.quantity || 1));
        });
      }
    });
    
    // Transformar em array e ordenar por contagem (decrescente)
    let topProducts = Object.values(productCounts)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);  // Apenas os 5 mais vendidos
    
    console.log('Dados dos produtos mais vendidos recuperados com sucesso');
    
    res.status(200).json(topProducts);
  } catch (error) {
    console.error('Erro ao buscar produtos mais vendidos:', error);
    res.status(500).json({ error: error.message });
  }
};

// Retorna o faturamento diário
exports.getDailyRevenue = async (req, res) => {
  try {
    console.log('Buscando dados de faturamento diário...');
    
    // Obter data específica da query ou usar a data atual
    let targetDate = req.query.date ? new Date(req.query.date) : new Date();
    const formattedTargetDate = formatDate(targetDate);
    
    // Buscar todos os pedidos
    const ordersSnapshot = await db.collection('orders').get();
    
    // Filtrar pedidos pela data e calcular faturamento
    let dailyRevenue = 0;
    let ordersCount = 0;
    let ordersList = [];
    
    ordersSnapshot.forEach(doc => {
      const order = doc.data();
      const orderDate = formatDate(order.dataPedido);
      
      if (orderDate === formattedTargetDate) {
        const orderTotal = calculateOrderTotal(order);
        dailyRevenue += orderTotal;
        ordersCount++;
        
        // Adicionar informações do pedido para exibição
        ordersList.push({
          id: doc.id,
          clientName: order.clientName || 'Cliente não especificado',
          total: orderTotal,
          status: order.status || 'Pendente'
        });
      }
    });
    
    console.log(`Faturamento diário para ${formattedTargetDate} calculado com sucesso`);
    
    res.status(200).json({
      date: formattedTargetDate,
      revenue: dailyRevenue,
      ordersCount: ordersCount,
      orders: ordersList
    });
  } catch (error) {
    console.error('Erro ao buscar faturamento diário:', error);
    res.status(500).json({ error: error.message });
  }
};

// Retorna o faturamento mensal
exports.getMonthlyRevenue = async (req, res) => {
  try {
    console.log('Buscando dados de faturamento mensal...');
    
    // Obter mês específico da query ou usar o mês atual
    let targetDate = req.query.month ? new Date(req.query.month + '-01') : new Date();
    const targetMonthYear = getMonthYear(targetDate);
    
    // Buscar todos os pedidos
    const ordersSnapshot = await db.collection('orders').get();
    
    // Filtrar pedidos pelo mês e calcular faturamento
    let monthlyRevenue = 0;
    let ordersCount = 0;
    let dailyBreakdown = {};
    
    ordersSnapshot.forEach(doc => {
      const order = doc.data();
      const orderDate = order.dataPedido;
      const orderMonthYear = getMonthYear(orderDate);
      
      if (orderMonthYear === targetMonthYear) {
        const orderTotal = calculateOrderTotal(order);
        monthlyRevenue += orderTotal;
        ordersCount++;
        
        // Adicionar ao detalhamento diário
        const dayStr = formatDate(orderDate);
        if (!dailyBreakdown[dayStr]) {
          dailyBreakdown[dayStr] = {
            revenue: 0,
            count: 0
          };
        }
        dailyBreakdown[dayStr].revenue += orderTotal;
        dailyBreakdown[dayStr].count += 1;
      }
    });
    
    // Converter o detalhamento diário para um array
    const dailyData = Object.keys(dailyBreakdown).map(date => ({
      date,
      revenue: dailyBreakdown[date].revenue,
      count: dailyBreakdown[date].count
    })).sort((a, b) => a.date.localeCompare(b.date));
    
    console.log(`Faturamento mensal para ${targetMonthYear} calculado com sucesso`);
    
    res.status(200).json({
      month: targetMonthYear,
      revenue: monthlyRevenue,
      ordersCount: ordersCount,
      dailyData: dailyData
    });
  } catch (error) {
    console.error('Erro ao buscar faturamento mensal:', error);
    res.status(500).json({ error: error.message });
  }
};


