const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const db = require('../config/firebase');

// Função auxiliar para obter o nome do mês em português
function getMonthName(monthIndex) {
  const months = [
    'JANEIRO', 'FEVEREIRO', 'MARÇO', 'ABRIL', 'MAIO', 'JUNHO',
    'JULHO', 'AGOSTO', 'SETEMBRO', 'OUTUBRO', 'NOVEMBRO', 'DEZEMBRO'
  ];
  return months[monthIndex];
}

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
    
    // Buscar cliente
    let clientData = {};
    if (order.clientId) {
      const clientDoc = await db.collection('clients').doc(order.clientId).get();
      if (clientDoc.exists) {
        clientData = clientDoc.data();
      }
    }
    
    const filename = `pedido-${orderId}.pdf`;
    // Usando caminho absoluto para evitar problemas relativos
    const pdfDir = path.resolve(__dirname, '../pdfs');
    let filepath = path.join(pdfDir, filename);
    
    console.log('Diretório para PDFs:', pdfDir);
    console.log('Caminho completo do arquivo:', filepath);

    // Cria a pasta "pdfs" se não existir
    let useTempDir = false;
    try {
      if (!fs.existsSync(pdfDir)) {
        console.log('Criando diretório para PDFs:', pdfDir);
        fs.mkdirSync(pdfDir, { recursive: true });
      }
    } catch (dirError) {
      console.error('Erro ao criar diretório para PDFs:', dirError);
      useTempDir = true;
    }
    
    // Se houve problema com o diretório principal, tenta usar o diretório temporário
    if (useTempDir) {
      try {
        const tempDir = path.join(require('os').tmpdir(), 'grafica-pdfs');
        if (!fs.existsSync(tempDir)) {
          fs.mkdirSync(tempDir, { recursive: true });
        }
        // Redefine o caminho do arquivo para usar o diretório temporário
        const originalFilepath = filepath;
        filepath = path.join(tempDir, filename);
        console.log(`Usando diretório temporário como fallback. Original: ${originalFilepath}, Novo: ${filepath}`);
      } catch (tempDirError) {
        console.error('Erro ao criar diretório temporário:', tempDirError);
        throw new Error('Não foi possível criar diretório para salvar o PDF');
      }
    }

    // Criando documento PDF - Papel A4
    let doc;
    let stream;
    
    try {
      doc = new PDFDocument({ 
        margins: { top: 30, bottom: 30, left: 30, right: 30 },
        size: 'A4',
        bufferPages: true,  // Permitir acesso a todas as páginas
        autoFirstPage: true, // Criar primeira página automaticamente
        info: {
          Title: `Pedido ${orderId}`,
          Author: 'Copiadora Pernambuco Digital',
          Subject: 'Orçamento',
          Producer: 'Copiadora Pernambuco Digital'
        }
      });
      
      // Cria o stream para o arquivo
      stream = fs.createWriteStream(filepath);
      
      // Tratamento para erros de escrita
      stream.on('error', (err) => {
        console.error('Erro na escrita do arquivo PDF:', err);
        if (!res.headersSent) {
          return res.status(500).json({ error: 'Erro ao escrever arquivo PDF' });
        }
      });
      
    } catch (pdfInitError) {
      console.error('Erro ao inicializar o documento PDF:', pdfInitError);
      return res.status(500).json({ 
        error: `Erro ao inicializar PDF: ${pdfInitError.message}`,
        details: pdfInitError.stack 
      });
    }

    // Pipe do documento para o stream de arquivo
    doc.pipe(stream);

    // ----- CABEÇALHO (Baseado no modelo da Copiadora Pernambuco) -----
    // Borda ao redor de todo o documento
    doc.rect(30, 30, doc.page.width - 60, doc.page.height - 60)
       .strokeColor('#000000')
       .lineWidth(0.5)
       .stroke();
    
    // Área do cabeçalho
    const headerBox = {
      x: 30,
      y: 30,
      width: doc.page.width - 60,
      height: 80
    };
    
    // Logo da empresa (posicionada sem sobrepor texto)
    const logoPath = path.join(__dirname, '../assets/logo.png');
    if (fs.existsSync(logoPath)) {
      console.log('Logo encontrada:', logoPath);
      doc.image(logoPath, 45, 40, { 
        width: 65, 
        height: 65,
        align: 'left',
        valign: 'top'
      });
    } else {
      console.warn('Logo não encontrada em:', logoPath);
      // Desenhar um hexágono simples como placeholder
      doc.polygon([70, 50], [85, 60], [85, 80], [70, 90], [55, 80], [55, 60])
         .fillAndStroke('#007C3E', '#000000');
    }
    
    // Nome da empresa em verde
    doc.fillColor('#2e7d32')
       .font('Helvetica-Bold')
       .fontSize(18)
       .text('COPIADORA', 125, 45);
       
    doc.fillColor('#2e7d32')
       .font('Helvetica-Bold')
       .fontSize(18)
       .text('PERNAMBUCO', 125, 65);
       
    // Sub-título menor
    doc.fillColor('#333333')
       .font('Helvetica-Bold')
       .fontSize(8)
       .text('COPIADORA & GRÁFICA RÁPIDA', 125, 85);
       
    // Email no subtítulo (com letras minúsculas conforme solicitado)
    doc.fillColor('#333333')
       .font('Helvetica')
       .fontSize(8)
       .text('copiadorapernambucodigital@hotmail.com', 125, 95);
    
    // Caixa de endereço no canto direito
    const addressBox = {
      x: headerBox.x + headerBox.width - 210,
      y: 40,
      width: 200,
      height: 60
    };
    
    doc.rect(addressBox.x, addressBox.y, addressBox.width, addressBox.height)
       .strokeColor('#000000')
       .lineWidth(0.5)
       .stroke();
       
    // Endereço e informações de contato
    doc.fillColor('black')
       .font('Helvetica')
       .fontSize(8)
       .text('End.: Rua do Príncipe, nº 307', addressBox.x + 5, addressBox.y + 5)
       .text('Soledade - Recife-PE  CEP: 50050-035', addressBox.x + 5, addressBox.y + 15)
       .text('Fone: (81) 3037-6012 / 98609-6243 ', addressBox.x + 5, addressBox.y + 25)
       .text('C.N.P.J.: 53.453.389/0001-97', addressBox.x + 5, addressBox.y + 35)
       .text('Insc. Municipal: 824610-6', addressBox.x + 5, addressBox.y + 45);
    
    // Linha horizontal abaixo do cabeçalho
    doc.moveTo(30, 110).lineTo(doc.page.width - 30, 110)
       .strokeColor('#000000')
       .lineWidth(0.5)
       .stroke();
    
    // ----- ÁREA DO CLIENTE E ORÇAMENTO -----
    // Seção do cliente
    const clientBox = {
      x: 30,
      y: 110,
      width: doc.page.width - 60,
      height: 40
    };
    
    doc.rect(clientBox.x, clientBox.y, clientBox.width, clientBox.height)
       .strokeColor('#000000')
       .lineWidth(0.5)
       .stroke();
    
    // Linha vertical separando cliente da data
    const dateBoxX = clientBox.x + clientBox.width - 160;
    doc.moveTo(dateBoxX, clientBox.y).lineTo(dateBoxX, clientBox.y + clientBox.height)
       .stroke();
    
    // Área do cliente
    doc.fillColor('black')
       .font('Helvetica')
       .fontSize(9);
    
    try {
      // Mostrar empresa se existir nos dados do cliente
      let empresaNome = '';
      let temEmpresa = false;
      
      if (clientData && clientData.empresa && typeof clientData.empresa === 'string') {
        empresaNome = clientData.empresa;
        temEmpresa = true;
      } else if (order.clientCompany && typeof order.clientCompany === 'string') {
        empresaNome = order.clientCompany;
        temEmpresa = true;
      }
      
      if (temEmpresa) {
        doc.text(`Ilm°(s)/Sr(s) (${empresaNome.toUpperCase()})`, clientBox.x + 10, clientBox.y + 8);
        
        // Nome do cliente (em negrito) - posição ajustada
        doc.font('Helvetica-Bold')
           .fontSize(10)
           .text(`${order.clientName || (clientData ? clientData.name : '') || 'Cliente'}`, clientBox.x + 10, clientBox.y + 22);
      } else {
        // Formato padrão quando não há empresa
        doc.text('Ilm°(s)/Sr(s) (CONSTRUTORA TENDA)', clientBox.x + 10, clientBox.y + 10);
        
        // Nome do cliente (em negrito)
        doc.font('Helvetica-Bold')
           .fontSize(10)
           .text(`${order.clientName || (clientData ? clientData.name : '') || 'Cliente'}`, clientBox.x + 10, clientBox.y + 25);
      }
    } catch (clientError) {
      // Em caso de erro, exibe formato padrão
      console.error('Erro ao processar dados do cliente:', clientError);
      doc.text('Ilm°(s)/Sr(s) (CONSTRUTORA TENDA)', clientBox.x + 10, clientBox.y + 10);
      doc.font('Helvetica-Bold')
         .fontSize(10)
         .text('Cliente', clientBox.x + 10, clientBox.y + 25);
    }
    
    // Texto padrão lado direito - número do orçamento com formato numérico sequencial
    // Usando os últimos 3 dígitos do ID ou gerando um número baseado em timestamp
    const orcamentoNum = order.orderNumber || (order.id ? 
        order.id.substring(order.id.length - 3).padStart(3, '0') : 
        String(Math.floor(Date.now() % 1000)).padStart(3, '0'));
    
    doc.font('Helvetica-Bold')
       .fontSize(10)
       .text(`ORÇAMENTO N° ${orcamentoNum}`, dateBoxX + 10, clientBox.y + 10);
    
    // Data formatada
    let dataDia, dataMes, dataAno;
    try {
      let dataObj;
      if (typeof order.dataPedido === 'string') {
        dataObj = new Date(order.dataPedido);
      } else if (order.dataPedido && typeof order.dataPedido.toDate === 'function') {
        dataObj = order.dataPedido.toDate();
      } else {
        dataObj = new Date();
      }
      
      dataDia = dataObj.getDate().toString().padStart(2, '0');
      dataMes = getMonthName(dataObj.getMonth());
      dataAno = dataObj.getFullYear();
    } catch (e) {
      console.error('Erro ao formatar data:', e);
      const today = new Date();
      dataDia = today.getDate().toString().padStart(2, '0');
      dataMes = getMonthName(today.getMonth());
      dataAno = today.getFullYear();
    }
    
    // Texto da data - formato mais limpo e melhor alinhado
    doc.font('Helvetica-Bold')
       .fontSize(9)
       .text('Data :', dateBoxX + 10, clientBox.y + 25);
    
    doc.font('Helvetica')
       .fontSize(9)
       .text(`${dataDia} de ${dataMes} de ${dataAno}`, dateBoxX + 30, clientBox.y + 25);
    
    // Texto de apresentação - abaixo da caixa do cliente (centralizado usando opção de alinhamento)
    const textoCompleto = 'Atendendo a solicitação de V. S°(a) apresentamos nossas melhores condições para execução dos serviços abaixo discriminados:';
    
    // Usando opções nativas de PDFKit para centralizar texto
    doc.font('Helvetica')
       .fontSize(8)
       .text(textoCompleto, 
           clientBox.x, 
           clientBox.y + clientBox.height + 15, 
           { 
              width: clientBox.width, 
              align: 'center',
              lineBreak: true
           });
    
    // ----- CABEÇALHO DA TABELA -----
    const tableStartY = 175; // Ajustado para ficar abaixo do texto de apresentação
    const tableWidth = doc.page.width - 60;
    const tableX = 30;
    
    // Definir larguras das colunas conforme o modelo
    const colWidths = {
      item: 40,
      quant: 50,
      desc: 290,
      unit: 70,
      total: 70
    };
    
    // Calcular as posições X das colunas
    const colX = {
      item: tableX,
      quant: tableX + colWidths.item,
      desc: tableX + colWidths.item + colWidths.quant,
      unit: tableX + colWidths.item + colWidths.quant + colWidths.desc,
      total: tableX + colWidths.item + colWidths.quant + colWidths.desc + colWidths.unit
    };
    
    // Linha para o cabeçalho da tabela
    doc.rect(tableX, tableStartY, tableWidth, 18)
       .lineWidth(0.5)
       .stroke();
    
    // Divisórias verticais do cabeçalho
    doc.moveTo(colX.quant, tableStartY).lineTo(colX.quant, tableStartY + 18).stroke();
    doc.moveTo(colX.desc, tableStartY).lineTo(colX.desc, tableStartY + 18).stroke();
    doc.moveTo(colX.unit, tableStartY).lineTo(colX.unit, tableStartY + 18).stroke();
    doc.moveTo(colX.total, tableStartY).lineTo(colX.total, tableStartY + 18).stroke();
    
    // Texto do cabeçalho (centralizado por coluna usando opções de alinhamento do PDFKit)
    doc.fillColor('black')
       .font('Helvetica-Bold')
       .fontSize(9)
       .text('Item', tableX, tableStartY + 5, { 
           width: colWidths.item, 
           align: 'center' 
       })
       .text('Quant.', colX.quant, tableStartY + 5, { 
           width: colWidths.quant, 
           align: 'center' 
       })
       .text('Discriminação', colX.desc, tableStartY + 5, { 
           width: colWidths.desc, 
           align: 'center' 
       })
       .text('Valor Unit.', colX.unit, tableStartY + 5, { 
           width: colWidths.unit, 
           align: 'center' 
       })
       .text('PreçoTotal', colX.total, tableStartY + 5, { 
           width: colWidths.total, 
           align: 'center' 
       });
    
    // ----- ITENS DO PEDIDO -----
    let y = tableStartY + 18;
    let total = 0;
    let desconto = 0;
    
    // Criar linhas vazias para a tabela (conforme o modelo original)
    const rowHeight = 15;
    const numRows = 20;
    
    for (let i = 0; i < numRows; i++) {
      // Linha horizontal para cada linha da tabela
      doc.rect(tableX, y, tableWidth, rowHeight)
         .lineWidth(0.5)
         .stroke();
      
      // Divisórias verticais
      doc.moveTo(colX.quant, y).lineTo(colX.quant, y + rowHeight).stroke();
      doc.moveTo(colX.desc, y).lineTo(colX.desc, y + rowHeight).stroke();
      doc.moveTo(colX.unit, y).lineTo(colX.unit, y + rowHeight).stroke();
      doc.moveTo(colX.total, y).lineTo(colX.total, y + rowHeight).stroke();
      
      y += rowHeight;
    }
    
    // Resetar y para começar a preencher os itens
    y = tableStartY + 18;
    
    // Verificar se há itens no pedido
    if (order.items && Array.isArray(order.items)) {
      try {
        order.items.forEach((item, i) => {
          if (!item) return; // Pular itens null ou undefined
          
          // Garantir que valores sejam números
          const quantidade = Number(item.quantidade) || 0;
          const precoUnitario = Number(item.precoUnitario) || 0;
          const subtotal = quantidade * precoUnitario;
          
          total += subtotal;
          
          // Formatar valores com vírgula decimal (padrão BR)
          const precoFormatado = precoUnitario.toFixed(2).replace('.', ',');
          const subtotalFormatado = subtotal.toFixed(2).replace('.', ',');
          
          // Preencher dados nas colunas
          doc.fillColor('black')
             .font('Helvetica')
             .fontSize(8);
             
          // Número do item (centralizado)
          doc.text(`${i + 1}`, colX.item, y + 4, { 
              width: colWidths.item,
              align: 'center'
          });
          
          // Quantidade (centralizado)
          doc.text(`${quantidade}`, colX.quant, y + 4, {
              width: colWidths.quant,
              align: 'center'
          });
          
          // Descrição do produto (com verificação de segurança)
          const descricaoProduto = (item.produto && typeof item.produto === 'string') 
              ? item.produto 
              : 'Produto sem nome';
          doc.text(descricaoProduto, colX.desc + 5, y + 4);
          
          // Preço unitário (alinhado à direita)
          doc.text(`R$ ${precoFormatado}`, colX.unit, y + 4, {
              width: colWidths.unit - 5,
              align: 'right'
          });
          
          // Subtotal (alinhado à direita)
          doc.text(`R$ ${subtotalFormatado}`, colX.total, y + 4, {
              width: colWidths.total - 5,
              align: 'right'
          });
          
          y += rowHeight;
          
          // Limitar a quantidade de itens na primeira página
          if (i >= numRows - 1) {
            return; // Não mostrar mais que o número de linhas disponíveis
          }
        });
      } catch (itemError) {
        console.error('Erro ao processar itens do pedido:', itemError);
        // Continua a execução para gerar o PDF mesmo com erro nos itens
      }
      
      // Se tiver um desconto aplicado
      if (order.desconto) {
        desconto = Number(order.desconto) || 0;
        
        // Pular uma linha antes do desconto
        const descontoY = Math.min(y, tableStartY + (numRows * rowHeight));
        
        doc.fillColor('black')
           .font('Helvetica-Bold')
           .fontSize(8)
           .text('DESCONTO ESPECIAL', colX.desc + 5, descontoY - rowHeight + 4)
           .text(`R$ ${desconto.toFixed(2).replace('.', ',')}`, colX.total + 5, descontoY - rowHeight + 4);
      }
    } else {
      doc.fillColor('black')
         .font('Helvetica')
         .fontSize(8)
         .text('Nenhum item encontrado no pedido', colX.desc + 5, y + 4);
    }

    // ----- TOTAL -----

// Calcular a posição do total
const totalY = tableStartY + (numRows * rowHeight) + 10;

// Caixa do total - usando apenas as duas últimas colunas (Valor Unit. + PreçoTotal)
const totalBoxX = colX.unit;
const totalBoxWidth = colWidths.unit + colWidths.total;
const totalBoxHeight = 25;

doc.rect(totalBoxX, totalY, totalBoxWidth, totalBoxHeight)
   .strokeColor('#000000')
   .lineWidth(0.5)
   .stroke();

// Divisória vertical no meio da caixa do total
const divisorX = colX.total;
doc.moveTo(divisorX, totalY).lineTo(divisorX, totalY + totalBoxHeight).stroke();

// Valor final calculado
const valorFinal = total - desconto;

// Preparar fonte e estilo
doc.fillColor('black')
   .fontSize(9)
   .font('Helvetica-Bold');

// Calcular posição vertical central da caixa
const centerY = totalY + (totalBoxHeight / 2) - 4;

// Preparar o texto combinado TOTAL + valor
const valorTexto = valorFinal.toFixed(2).replace('.', ',');
const combinedText = `TOTAL : R$ ${valorTexto}`;
const combinedTextWidth = doc.widthOfString(combinedText);

// Calcular centro horizontal da caixa total
const centerX = totalBoxX + (totalBoxWidth / 2);

// Escrever texto centralizado
doc.text(combinedText, centerX - (combinedTextWidth / 2), centerY);
    
    // ----- ÁREA DE INFORMAÇÕES ADICIONAIS -----
    const infoY = totalY + 40;
    
    // Área do rodapé - dividido proporcionalmente
    const footerWidth = tableWidth;
    const footerX = tableX;
    const halfWidth = footerWidth / 2;
    
    // Caixa de condições de pagamento (altura ajustada)
    doc.rect(footerX, infoY, halfWidth, 25)
       .lineWidth(0.5)
       .stroke();
    
    // Caixa de prazo de entrega
    doc.rect(footerX + halfWidth, infoY, halfWidth, 25)
       .lineWidth(0.5)
       .stroke();
    
    doc.fillColor('black')
       .fontSize(9)
       .font('Helvetica-Bold')
       .text('Cond. de Pagamento', footerX + 10, infoY + 5)
       .font('Helvetica')
       .fontSize(9)
       .text('A COMBINAR', footerX + 10, infoY + 15);
       
    doc.font('Helvetica-Bold')
       .fontSize(9)
       .text('Prazo de Entrega', footerX + halfWidth + 10, infoY + 5)
       .font('Helvetica')
       .fontSize(9)
       .text('A COMBINAR', footerX + halfWidth + 10, infoY + 15);
      
    
    // Caixa de observações (altura ajustada)
    doc.rect(footerX, infoY + 25, footerWidth, 30)
       .lineWidth(0.5)
       .stroke();
       
    doc.font('Helvetica-Bold')
       .fontSize(9)
       .text('Observações:', footerX + 10, infoY + 30)
       .font('Helvetica')
       .fontSize(9)
       .text('CONTATOS: ROBERTO 81 3037-6012 / 98805-6012', footerX + 10, infoY + 42);
    
    // Assinatura (altura ajustada)
    doc.rect(footerX, infoY + 55, footerWidth, 30)
       .lineWidth(0.5)
       .stroke();
       
    doc.font('Helvetica')
       .fontSize(9)
       .text('Sem Mais', footerX + footerWidth - 100, infoY + 65)
       .text('atenciosamente', footerX + footerWidth - 115, infoY + 75);

    // Finalizar documento
    doc.end();

    // Esperar o documento terminar de ser gerado
    stream.on('finish', () => {
      console.log('PDF gerado com sucesso:', filepath);
      
      try {
        // Verifica se o arquivo existe antes de enviar
        if (fs.existsSync(filepath)) {
          // Ler o arquivo em um buffer para garantir que ele é válido
          const fileBuffer = fs.readFileSync(filepath);
          if (fileBuffer.length === 0) {
            throw new Error('Arquivo PDF está vazio');
          }
          
          // Enviar arquivo para download
          res.setHeader('Content-Type', 'application/pdf');
          res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
          
          // Criar novo stream para enviar o arquivo
          const readStream = fs.createReadStream(filepath);
          
          // Lidar com erro no stream de leitura
          readStream.on('error', (err) => {
            console.error('Erro ao ler o arquivo PDF para envio:', err);
            if (!res.headersSent) {
              res.status(500).json({ error: 'Erro ao enviar o PDF' });
            }
          });
          
          // Pipe o stream para a resposta
          readStream.pipe(res);
        } else {
          console.error('Arquivo PDF não encontrado após geração:', filepath);
          res.status(500).json({ error: 'Erro ao gerar PDF: arquivo não encontrado' });
        }
      } catch (streamError) {
        console.error('Erro ao processar o arquivo PDF gerado:', streamError);
        res.status(500).json({ error: `Erro ao processar PDF: ${streamError.message}` });
      }
    });
    
    // Adicionar tratamento para erro no stream
    stream.on('error', (err) => {
      console.error('Erro no stream durante a geração do PDF:', err);
      if (!res.headersSent) {
        res.status(500).json({ error: 'Erro na gravação do PDF' });
      }
    });
    
  } catch (error) {
    console.error('Erro ao gerar PDF:', error);
    console.error('Stack trace:', error.stack);
    
    // Enviar resposta mais detalhada para debugging
    res.status(500).json({ 
      error: `Erro ao gerar PDF: ${error.message}`, 
      details: error.stack,
      location: 'generateOrderPDF'
    });
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

    // Atualizar estoque de todos os produtos e materiais
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

      // Atualiza o estoque do produto
      await db.collection('products').doc(productDoc.id).update({
        estoque: productData.estoque - item.quantidade
      });

      // Verificar e atualizar os materiais associados ao produto
      if (productData.materiais && Array.isArray(productData.materiais) && productData.materiais.length > 0) {
        // Para cada material associado ao produto
        for (const material of productData.materiais) {
          if (!material.id || !material.quantidade) continue;
          
          const materialRef = db.collection('materials').doc(material.id);
          const materialDoc = await materialRef.get();
          
          if (!materialDoc.exists) {
            return res.status(400).json({ 
              message: `Material ${material.nome || material.id} não encontrado para o produto "${item.produto}"` 
            });
          }
          
          const materialData = materialDoc.data();
          const materialNecessario = material.quantidade * item.quantidade;
          
          if (materialData.estoque < materialNecessario) {
            return res.status(400).json({
              message: `Estoque insuficiente do material "${materialData.nome}" para produzir "${item.produto}". 
                        Necessário: ${materialNecessario}, 
                        Disponível: ${materialData.estoque}`
            });
          }
          
          // Atualiza o estoque do material
          await materialRef.update({
            estoque: materialData.estoque - materialNecessario
          });
        }
      }
      // Para compatibilidade com a versão anterior
      else if (productData.materialId && productData.quantidadeMaterial > 0) {
        const materialRef = db.collection('materials').doc(productData.materialId);
        const materialDoc = await materialRef.get();
        
        if (!materialDoc.exists) {
          return res.status(400).json({ message: `Material não encontrado para o produto "${item.produto}"` });
        }
        
        const materialData = materialDoc.data();
        const materialNecessario = productData.quantidadeMaterial * item.quantidade;
        
        if (materialData.estoque < materialNecessario) {
          return res.status(400).json({
            message: `Estoque insuficiente do material "${materialData.nome}" para produzir "${item.produto}". Necessário: ${materialNecessario}, Disponível: ${materialData.estoque}`
          });
        }
        
        // Atualiza o estoque do material
        await materialRef.update({
          estoque: materialData.estoque - materialNecessario
        });
      }
    }

    // Monta o pedido com dados do cliente
    const orderData = {
      ...data,
      clientName: clientData.name,
      clientEmail: clientData.email,
      clientCompany: clientData.empresa || data.clientCompany || null, // Adiciona empresa do cliente
      status: data.status || 'Pendente',
      dataPedido: data.dataPedido || new Date().toISOString()
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
