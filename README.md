<<<<<<< HEAD
# Sistema Interno de Gerenciamento para Gráfica PE Digital

Este sistema oferece uma plataforma completa para gerenciamento interno de gráficas, incluindo:
- Cadastro e gerenciamento de clientes
- Cadastro e controle de estoque de produtos
- Gerenciamento de pedidos
- Geração de PDF para pedidos
- Dashboard com métricas e estatísticas

## Estrutura do Projeto

- `client/` - Frontend desenvolvido em React.js
- `controllers/` - Controladores para lógica de negócios
- `routes/` - Rotas da API
- `models/` - Modelos para interação com o banco de dados
- `config/` - Configurações do Firebase e outros serviços
- `assets/` - Recursos como imagens e arquivos estáticos

## Tecnologias Utilizadas

### Backend
- Node.js
- Express
- Firebase Firestore
- PDFKit (para geração de PDFs)

### Frontend
- React.js
- Material-UI
- Chart.js
- React Router
- Axios

## Instalação

### Pré-requisitos
- Node.js (versão 14.x ou superior)
- NPM (versão 6.x ou superior)
- Firebase (conta e projeto configurado)

### Configuração do Firebase

1. Crie um projeto no [Firebase Console](https://console.firebase.google.com/)
2. Na seção "Configurações do Projeto", gere uma nova chave privada para contas de serviço
3. Salve o arquivo JSON gerado como `firebase-key.json` na pasta `config/`
4. Crie um arquivo `.env` na raiz do projeto com a seguinte estrutura:

```
FIREBASE_PROJECT_ID=seu-projeto-id
```

### Instalação das dependências

```bash
# Instalar dependências do backend
npm install

# Instalar dependências do frontend
npm run client-install
```

## Execução

### Desenvolvimento

Para executar o backend e o frontend em paralelo:

```bash
npm run dev
```

Para executar apenas o backend:

```bash
npm run server
```

Para executar apenas o frontend:

```bash
npm run client
```

### Produção

Para construir o frontend para produção:

```bash
npm run build
```

Para iniciar o servidor em modo de produção:

```bash
npm start
```

## Acessando o Sistema

- **Desenvolvimento:**
  - Frontend: http://localhost:3000
  - Backend API: http://localhost:3001

- **Produção:**
  - Aplicação completa: http://localhost:3001

## Funcionalidades

### Dashboard
- Visão geral das métricas: pedidos, clientes, produtos
- Gráfico de pedidos por período
- Produtos mais vendidos

### Clientes
- Cadastro de novos clientes
- Edição e exclusão de clientes
- Busca e filtragem de clientes

### Produtos
- Cadastro de produtos com preço e estoque
- Controle de estoque automático ao criar pedidos
- Categorização de produtos

### Pedidos
- Criação de pedidos com múltiplos itens
- Geração de PDF para impressão
- Acompanhamento de status do pedido
- Histórico de pedidos por cliente

## Licença

Este projeto é distribuído sob a licença MIT.
=======
# grafica-pe-digital
>>>>>>> f01866624dbe506c360da85bbfcfd5a6a825c94a
