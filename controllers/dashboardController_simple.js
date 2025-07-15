// Implementação completa para o controller do dashboard
console.log('Carregando dashboardController...');

try {
  // Carregar Firebase
  const db = require('../config/firebase');
  console.log('Firebase carregado:', typeof db);

  // Função para obter dados de resumo do dashboard
  exports.getSummary = async (req, res) => {
    console.log('getSummary chamada!');
    try {
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
      console.error('Erro em getSummary:', error);
      res.status(500).json({ error: error.message });
    }
  };

  // Função para obter dados de pedidos por dia
  exports.getOrdersPerDay = async (req, res) => {
    try {
      const today = new Date();
      const dates = [];
      
      // Gerar datas dos últimos 7 dias
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(today.getDate() - i);
        const formattedDate = date.toISOString().split('T')[0];
        dates.push(formattedDate);
      }
      
      // Buscar pedidos dos últimos 7 dias no banco de dados
      const ordersSnapshot = await db.collection('orders').get();
      const orders = [];
      ordersSnapshot.forEach(doc => {
        orders.push({ id: doc.id, ...doc.data() });
      });
      
      // Calcular contagem de pedidos por dia
      const result = dates.map(date => {
        const count = orders.filter(order => {
          // Verificar se o pedido tem data e se está no formato timestamp
          if (!order.dataPedido) return false;
          
          let orderDate;
          if (order.dataPedido instanceof Date) {
            orderDate = order.dataPedido;
          } else if (order.dataPedido.toDate && typeof order.dataPedido.toDate === 'function') {
            // Firebase Timestamp
            orderDate = order.dataPedido.toDate();
          } else if (order.dataPedido.seconds) {
            // Firebase Timestamp em formato de objeto
            orderDate = new Date(order.dataPedido.seconds * 1000);
          } else if (typeof order.dataPedido === 'string') {
            // String de data
            orderDate = new Date(order.dataPedido);
          }
          
          return orderDate && orderDate.toISOString().split('T')[0] === date;
        }).length;
        
        return {
          date: date,
          count: count
        };
      });
      
      res.status(200).json(result);
    } catch (error) {
      console.error('Erro em getOrdersPerDay:', error);
      res.status(500).json({ error: error.message });
    }
  };

  // Função para obter os produtos mais vendidos
  exports.getTopProducts = async (req, res) => {
    try {
      // Buscar todos os pedidos
      const ordersSnapshot = await db.collection('orders').get();
      const orders = [];
      ordersSnapshot.forEach(doc => {
        orders.push({ id: doc.id, ...doc.data() });
      });
      
      // Contar ocorrências de cada produto nos pedidos
      const productCounts = {};
      
      orders.forEach(order => {
        if (order.items && Array.isArray(order.items)) {
          order.items.forEach(item => {
            // Verificar se o item tem produto e quantidade
            const productName = item.produto || (item.product && item.product.name) || 'Produto sem nome';
            const quantity = item.quantidade || item.quantity || 1;
            
            if (!productCounts[productName]) {
              productCounts[productName] = 0;
            }
            
            productCounts[productName] += quantity;
          });
        }
      });
      
      // Transformar em array e ordenar
      const topProducts = Object.entries(productCounts)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);
      
      res.status(200).json(topProducts);
    } catch (error) {
      console.error('Erro em getTopProducts:', error);
      res.status(500).json({ error: error.message });
    }
  };

  // Função auxiliar para calcular o valor total de um pedido
  const calculateOrderTotal = (order) => {
    try {
      // Se o total já está calculado no pedido, use-o
      if (order.total && !isNaN(parseFloat(order.total))) {
        return parseFloat(order.total);
      }
      
      // Se não tiver items, retorne 0
      if (!order.items || !Array.isArray(order.items) || order.items.length === 0) {
        return 0;
      }
      
      // Calcular soma de (quantidade * precoUnitario) para cada item
      return order.items.reduce((total, item) => {
        const quantidade = Number(item.quantidade) || 0;
        const precoUnitario = Number(item.precoUnitario) || 0;
        return total + (quantidade * precoUnitario);
      }, 0);
    } catch (error) {
      console.error('Erro ao calcular total do pedido:', error);
      return 0;
    }
  };

  // Função para obter faturamento diário
  exports.getDailyRevenue = async (req, res) => {
    try {
      const date = req.query.date || new Date().toISOString().split('T')[0];
      console.log(`Buscando faturamento para a data: ${date}`);
      
      // Buscar todos os pedidos
      const ordersSnapshot = await db.collection('orders').get();
      const allOrders = [];
      ordersSnapshot.forEach(doc => {
        allOrders.push({ id: doc.id, ...doc.data() });
      });
      
      // Filtrar pedidos da data solicitada
      const dayOrders = allOrders.filter(order => {
        // Verificar se o pedido tem data e se está no formato timestamp
        if (!order.dataPedido) return false;  // Usando dataPedido em vez de date
        
        let orderDate;
        if (order.dataPedido instanceof Date) {
          orderDate = order.dataPedido;
        } else if (order.dataPedido.toDate && typeof order.dataPedido.toDate === 'function') {
          // Firebase Timestamp
          orderDate = order.dataPedido.toDate();
        } else if (order.dataPedido.seconds) {
          // Firebase Timestamp em formato de objeto
          orderDate = new Date(order.dataPedido.seconds * 1000);
        } else if (typeof order.dataPedido === 'string') {
          // String de data
          orderDate = new Date(order.dataPedido);
        }
        
        return orderDate && orderDate.toISOString().split('T')[0] === date;
      });
      
      // Calcular o faturamento total
      let totalRevenue = 0;
      const ordersWithDetails = [];
      
      // Para cada pedido, obter informações do cliente
      for (const order of dayOrders) {
        const total = calculateOrderTotal(order);  // Usando a função auxiliar
        totalRevenue += total;
        
        let clientName = 'Cliente não identificado';
        
        // Obter nome do cliente se houver clientId
        if (order.clientId) {
          try {
            const clientDoc = await db.collection('clients').doc(order.clientId).get();
            if (clientDoc.exists) {
              const clientData = clientDoc.data();
              clientName = clientData.name || clientData.companyName || 'Cliente sem nome';
            }
          } catch (error) {
            console.error(`Erro ao buscar cliente ${order.clientId}:`, error);
          }
        }
        
        ordersWithDetails.push({
          id: order.id,
          clientName,
          total: total
        });
      }
      
      res.status(200).json({
        date: date,
        revenue: totalRevenue,
        ordersCount: dayOrders.length,
        orders: ordersWithDetails
      });
    } catch (error) {
      console.error('Erro em getDailyRevenue:', error);
      res.status(500).json({ error: error.message });
    }
  };

  // Função para obter faturamento mensal
  exports.getMonthlyRevenue = async (req, res) => {
    try {
      const month = req.query.month || new Date().toISOString().slice(0, 7);
      console.log(`Buscando faturamento para o mês: ${month}`);
      
      // Extrair ano e mês
      const [year, monthNum] = month.split('-').map(Number);
      
      // Buscar todos os pedidos
      const ordersSnapshot = await db.collection('orders').get();
      const allOrders = [];
      ordersSnapshot.forEach(doc => {
        allOrders.push({ id: doc.id, ...doc.data() });
      });
      
      // Filtrar pedidos do mês solicitado
      const monthOrders = allOrders.filter(order => {
        // Verificar se o pedido tem data e se está no formato timestamp
        if (!order.dataPedido) return false;  // Usando dataPedido em vez de date
        
        let orderDate;
        if (order.dataPedido instanceof Date) {
          orderDate = order.dataPedido;
        } else if (order.dataPedido.toDate && typeof order.dataPedido.toDate === 'function') {
          // Firebase Timestamp
          orderDate = order.dataPedido.toDate();
        } else if (order.dataPedido.seconds) {
          // Firebase Timestamp em formato de objeto
          orderDate = new Date(order.dataPedido.seconds * 1000);
        } else if (typeof order.dataPedido === 'string') {
          // String de data
          orderDate = new Date(order.dataPedido);
        }
        
        return orderDate && 
               orderDate.getFullYear() === year && 
               orderDate.getMonth() + 1 === monthNum;
      });
      
      // Calcular o faturamento total
      let totalRevenue = 0;
      monthOrders.forEach(order => {
        totalRevenue += calculateOrderTotal(order);  // Usando a função auxiliar
      });
      
      // Calcular faturamento por dia no mês
      const dailyRevenue = {};
      
      // Inicializar com todos os dias do mês
      const daysInMonth = new Date(year, monthNum, 0).getDate();
      for (let day = 1; day <= daysInMonth; day++) {
        const formattedDate = `${month}-${day.toString().padStart(2, '0')}`;
        dailyRevenue[formattedDate] = 0;
      }
      
      // Somar faturamento por dia
      monthOrders.forEach(order => {
        if (!order.dataPedido) return;  // Usando dataPedido em vez de date
        
        let orderDate;
        if (order.dataPedido instanceof Date) {
          orderDate = order.dataPedido;
        } else if (order.dataPedido.toDate && typeof order.dataPedido.toDate === 'function') {
          orderDate = order.dataPedido.toDate();
        } else if (order.dataPedido.seconds) {
          orderDate = new Date(order.dataPedido.seconds * 1000);
        } else if (typeof order.dataPedido === 'string') {
          orderDate = new Date(order.dataPedido);
        }
        
        if (!orderDate) return;
        
        const formattedDate = orderDate.toISOString().split('T')[0];
        if (dailyRevenue[formattedDate] !== undefined) {
          dailyRevenue[formattedDate] += calculateOrderTotal(order);  // Usando a função auxiliar
        }
      });
      
      // Converter para o formato de array esperado pela API
      const dailyData = Object.entries(dailyRevenue)
        .map(([date, revenue]) => ({ date, revenue }))
        .sort((a, b) => a.date.localeCompare(b.date));
      
      res.status(200).json({
        month: month,
        revenue: totalRevenue,
        ordersCount: monthOrders.length,
        dailyData: dailyData
      });
    } catch (error) {
      console.error('Erro em getMonthlyRevenue:', error);
      res.status(500).json({ error: error.message });
    }
  };

  console.log('Todas as funções do controller exportadas com sucesso!');

} catch (error) {
  console.error('Erro ao carregar controller:', error);
}
