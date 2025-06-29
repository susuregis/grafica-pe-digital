const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const db = require('../config/firebase');

// Gerar PDF do pedido
exports.generateOrderPDF = async (req, res) => {
  try {
    console.log('Gerando PDF para o pedido:', req.params.id);
    const orderId = req.params.id;
    
    // Buscar pedido no Firestore
    const orderDoc = await db.collection('orders').doc(orderId).get();

    if (!orderDoc.exists) {
      console.error('Pedido não encontrado:', orderId);
      return res.status(404).json({ message: 'Pedido não encontrado' });
    }

    // Dados do pedido e configuração do PDF
    const order = { id: orderId, ...orderDoc.data() };
    console.log('Dados do pedido recuperados:', order);
    
    const filename = `pedido-${orderId}.pdf`;
    const pdfDir = path.join(__dirname, '../pdfs');
    const filepath = path.join(pdfDir, filename);

    // Cria a pasta "pdfs" se não existir
    if (!fs.existsSync(pdfDir)) {
      console.log('Criando diretório para PDFs:', pdfDir);
      fs.mkdirSync(pdfDir, { recursive: true });
    }

    // Criando documento PDF
    const doc = new PDFDocument({ margin: 50 });
    const stream = fs.createWriteStream(filepath);

    // Tratamento para erros de escrita
    stream.on('error', (err) => {
      console.error('Erro na escrita do arquivo PDF:', err);
      return res.status(500).json({ error: 'Erro ao escrever arquivo PDF' });
    });

    // Pipe do documento para o stream de arquivo
    doc.pipe(stream);

    // ----- CABEÇALHO -----
    // Fundo branco para garantir contraste com o logo colorido
    doc.rect(30, 30, 535, 100).fill('#FFFFFF');
    
    // Logo da empresa com posicionamento mais destacado no topo
    const logoPath = path.join(__dirname, '../assets/logo.png');
    if (fs.existsSync(logoPath)) {
      console.log('Logo encontrada:', logoPath);
      // Posicionando o logo à esquerda como elemento principal com tamanho otimizado
      doc.image(logoPath, 50, 40, { 
        width: 170, 
        align: 'left',
        valign: 'center'
      });
    } else {
      console.warn('Logo não encontrada em:', logoPath);
      // Se não houver logo, adiciona texto como fallback
      doc.font('Helvetica-Bold').fontSize(24).text('Gráfica PE Digital', 50, 60);
    }

    // Informações da empresa à direita com melhor organização
    doc.font('Helvetica-Bold')
       .fontSize(20)
       .text('Gráfica PE Digital', 250, 45)
       .font('Helvetica')
       .fontSize(13)
       .text('Impressão e Serviços Gráficos', 250, 70)
       .fontSize(11)
       .text('Contato: (81) 3333-4444', 250, 90)
       .text('Email: contato@graficapedigital.com.br', 250, 105);
    
    // Linha horizontal para separar o cabeçalho do conteúdo
    doc.strokeColor('#333333')
       .lineWidth(1.5)
       .moveTo(50, 140)
       .lineTo(550, 140)
       .stroke();
    
    // Título do Pedido - ajustando posição para ficar abaixo da linha do cabeçalho
    doc.font('Helvetica-Bold')
       .fontSize(16)
       .fillColor('#000')
       .text(`Pedido #${order.id.substring(0, 8)}`, 50, 160);

    // Data e Status - ajustando posições também
    doc.font('Helvetica')
       .fontSize(12);

    let dataFormatada;
    try {
      if (typeof order.dataPedido === 'string') {
        dataFormatada = new Date(order.dataPedido).toLocaleDateString('pt-BR');
      } else if (order.dataPedido && typeof order.dataPedido.toDate === 'function') {
        // É um timestamp do Firestore
        dataFormatada = order.dataPedido.toDate().toLocaleDateString('pt-BR');
      } else {
        dataFormatada = '(data não disponível)';
      }
    } catch (e) {
      console.error('Erro ao formatar data:', e);
      dataFormatada = '(data não disponível)';
    }

    doc.text(`Data: ${dataFormatada}`, 50, 185);
    doc.text(`Status: ${order.status || 'Pendente'}`, 50, 205);

    // ----- DADOS DO CLIENTE -----
    doc.font('Helvetica-Bold')
       .fontSize(14)
       .text('Dados do Cliente', 50, 235);

    doc.font('Helvetica')
       .fontSize(12)
       .text(`Nome: ${order.clientName || '---'}`, 50, 255)
       .text(`E-mail: ${order.clientEmail || '---'}`, 50, 270);

    // ----- ITENS DO PEDIDO -----
    doc.font('Helvetica-Bold')
       .fontSize(14)
       .text('Itens do Pedido', 50, 300);

    // Cabeçalho da tabela
    doc.font('Helvetica-Bold')
       .fontSize(12)
       .text('Item', 50, 320)
       .text('Quantidade', 280, 320)
       .text('Preço Unit.', 360, 320)
       .text('Subtotal', 460, 320);

    doc.moveTo(50, 335).lineTo(550, 335).stroke();

    // Listagem de itens
    let y = 355;  // Ajustando posição inicial dos itens
    let total = 0;
    
    // Verificar se há itens no pedido
    if (order.items && Array.isArray(order.items)) {
      order.items.forEach((item, i) => {
        // Garantir que valores sejam números
        const quantidade = Number(item.quantidade) || 0;
        const precoUnitario = Number(item.precoUnitario) || 0;
        const subtotal = quantidade * precoUnitario;
        
        total += subtotal;
        
        doc.font('Helvetica')
           .fontSize(12)
           .text(`${i + 1}. ${item.produto || 'Produto sem nome'}`, 50, y)
           .text(`${quantidade}`, 280, y)
           .text(`R$ ${precoUnitario.toFixed(2)}`, 360, y)
           .text(`R$ ${subtotal.toFixed(2)}`, 460, y);
        
        y += 20;
        
        // Se a lista ficar muito grande, adiciona nova página
        if (y > 700) {
          doc.addPage();
          y = 50;
        }
      });
    } else {
      doc.font('Helvetica')
         .fontSize(12)
         .text('Nenhum item encontrado no pedido', 50, y);
    }

    // ----- TOTAL -----
    y += 20;
    doc.moveTo(50, y).lineTo(550, y).stroke();
    y += 20;

    doc.font('Helvetica-Bold')
       .fontSize(14)
       .text('Total:', 400, y)
       .text(`R$ ${total.toFixed(2)}`, 460, y);

    // ----- RODAPÉ -----
    doc.font('Helvetica')
       .fontSize(10)
       .text('Obrigado pela preferência!', 50, 700)
       .text('Gráfica PE Digital - Todos os direitos reservados', 50, 715)
       .text(`Documento gerado em ${new Date().toLocaleDateString('pt-BR')}`, 50, 730);

    // Finalizar documento
    doc.end();

    // Esperar o documento terminar de ser gerado
    stream.on('finish', () => {
      console.log('PDF gerado com sucesso:', filepath);
      
      // Enviar arquivo para download
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
      
      // Verifica se o arquivo existe antes de enviar
      if (fs.existsSync(filepath)) {
        fs.createReadStream(filepath).pipe(res);
      } else {
        console.error('Arquivo PDF não encontrado após geração:', filepath);
        res.status(500).json({ error: 'Erro ao gerar PDF: arquivo não encontrado' });
      }
    });
    
  } catch (error) {
    console.error('Erro ao gerar PDF:', error);
    res.status(500).json({ error: `Erro ao gerar PDF: ${error.message}` });
  }
};

// Criar pedido
exports.createOrder = async (req, res) => {
  try {
    const data = req.body;

    // Buscar cliente
    const clientRef = db.collection('clients').doc(data.clientId);
    const clientDoc = await clientRef.get();

    if (!clientDoc.exists) {
      return res.status(404).json({ message: 'Cliente não encontrado' });
    }

    const clientData = clientDoc.data();

    // Atualizar estoque de todos os produtos
    for (const item of data.items) {
      const productQuery = await db.collection('products')
        .where('nome', '==', item.produto)
        .limit(1)
        .get();

      if (productQuery.empty) {
        return res.status(400).json({ message: `Produto "${item.produto}" não encontrado no estoque` });
      }

      const productDoc = productQuery.docs[0];
      const productData = productDoc.data();

      if (productData.estoque < item.quantidade) {
        return res.status(400).json({
          message: `Estoque insuficiente para o produto "${item.produto}". Disponível: ${productData.estoque}`
        });
      }

      // Atualiza o estoque
      await db.collection('products').doc(productDoc.id).update({
        estoque: productData.estoque - item.quantidade
      });
    }

    // Monta o pedido com dados do cliente
    const orderData = {
      ...data,
      clientName: clientData.name,
      clientEmail: clientData.email,
      status: data.status || 'Pendente',
      dataPedido: new Date().toISOString()
    };

    const newOrder = await db.collection('orders').add(orderData);

    res.status(201).json({
      message: 'Pedido criado e estoque atualizado com sucesso',
      id: newOrder.id
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Criar produto
exports.createProduct = async (req, res) => {
  try {
    const data = req.body;
    const newProduct = await db.collection('products').add(data);
    res.status(201).json({ message: 'Produto criado com sucesso', id: newProduct.id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Listar todos os produtos
exports.getAllProducts = async (req, res) => {
  try {
    const snapshot = await db.collection('products').get();
    const products = [];
    snapshot.forEach(doc => {
      products.push({ id: doc.id, ...doc.data() });
    });
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Buscar produto por ID
exports.getProductById = async (req, res) => {
  try {
    const id = req.params.id;
    const productDoc = await db.collection('products').doc(id).get();

    if (!productDoc.exists) {
      return res.status(404).json({ message: 'Produto não encontrado' });
    }

    res.status(200).json({ id: productDoc.id, ...productDoc.data() });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Atualizar produto
exports.updateProduct = async (req, res) => {
  try {
    const id = req.params.id;
    const data = req.body;
    const productRef = db.collection('products').doc(id);
    const productDoc = await productRef.get();

    if (!productDoc.exists) {
      return res.status(404).json({ message: 'Produto não encontrado' });
    }

    await productRef.update(data);
    res.status(200).json({ message: 'Produto atualizado com sucesso' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Deletar produto
exports.deleteProduct = async (req, res) => {
  try {
    const id = req.params.id;
    const productRef = db.collection('products').doc(id);
    const productDoc = await productRef.get();

    if (!productDoc.exists) {
      return res.status(404).json({ message: 'Produto não encontrado' });
    }

    await productRef.delete();
    res.status(200).json({ message: 'Produto deletado com sucesso' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Listar todos os pedidos
exports.getAllOrders = async (req, res) => {
  try {
    const snapshot = await db.collection('orders').get();
    const orders = [];
    snapshot.forEach(doc => {
      orders.push({ id: doc.id, ...doc.data() });
    });
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Buscar pedido por ID
exports.getOrderById = async (req, res) => {
  try {
    const id = req.params.id;
    const orderDoc = await db.collection('orders').doc(id).get();

    if (!orderDoc.exists) {
      return res.status(404).json({ message: 'Pedido não encontrado' });
    }

    res.status(200).json({ id: orderDoc.id, ...orderDoc.data() });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Atualizar pedido
exports.updateOrder = async (req, res) => {
  try {
    const id = req.params.id;
    const data = req.body;
    const orderRef = db.collection('orders').doc(id);
    const orderDoc = await orderRef.get();

    if (!orderDoc.exists) {
      return res.status(404).json({ message: 'Pedido não encontrado' });
    }

    await orderRef.update(data);
    res.status(200).json({ message: 'Pedido atualizado com sucesso' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Atualizar status do pedido
exports.updateOrderStatus = async (req, res) => {
  try {
    const id = req.params.id;
    const { status } = req.body;
    
    if (!status) {
      return res.status(400).json({ message: 'Status não informado' });
    }
    
    const orderRef = db.collection('orders').doc(id);
    const orderDoc = await orderRef.get();

    if (!orderDoc.exists) {
      return res.status(404).json({ message: 'Pedido não encontrado' });
    }

    await orderRef.update({ status });
    res.status(200).json({ message: 'Status do pedido atualizado com sucesso' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Deletar pedido
exports.deleteOrder = async (req, res) => {
  try {
    const id = req.params.id;
    const orderRef = db.collection('orders').doc(id);
    const orderDoc = await orderRef.get();

    if (!orderDoc.exists) {
      return res.status(404).json({ message: 'Pedido não encontrado' });
    }

    await orderRef.delete();
    res.status(200).json({ message: 'Pedido deletado com sucesso' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
