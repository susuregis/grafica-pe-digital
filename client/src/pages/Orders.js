import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Typography, 
  Box, 
  Button, 
  Paper, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  TablePagination,
  Chip,
  TextField,
  InputAdornment,
  IconButton,
  Grid,
  Alert,
  CircularProgress,
  Stack,
  FormControl,
  Select,
  MenuItem
} from '@mui/material';
import { 
  Add as AddIcon, 
  Search as SearchIcon,
  Visibility as ViewIcon,
  Delete as DeleteIcon,
  PictureAsPdf as PdfIcon,
  Edit as EditIcon
} from '@mui/icons-material';
import { orderService, clientService, productService } from '../services/api';
import FormDialog, { ConfirmationDialog } from '../components/FormDialog';






// Componente para criar pedido
const OrderForm = ({ 
  formData, 
  setFormData, 
  clients, 
  products, 
  clientsLoading, 
  productsLoading 
}) => {
  const [items, setItems] = useState(formData.items || [{ produto: '', quantidade: 1, precoUnitario: 0 }]);

  useEffect(() => {
    setFormData(prev => ({ ...prev, items }));
  }, [items, setFormData]);

  const handleItemChange = (index, field, value) => {
    const updatedItems = [...items];
    
    // Se for alteração de produto, busca o preço
    if (field === 'produto') {
      const selectedProduct = products.find(p => p.nome === value);
      if (selectedProduct) {
        updatedItems[index] = {
          ...updatedItems[index],
          produto: value,
          precoUnitario: selectedProduct.preco || 0
        };
      } else {
        updatedItems[index][field] = value;
      }
    } else {
      updatedItems[index][field] = value;
    }
    
    setItems(updatedItems);
  };

  const addItem = () => {
    setItems([...items, { produto: '', quantidade: 1, precoUnitario: 0 }]);
  };

  const removeItem = (index) => {
    if (items.length > 1) {
      const updatedItems = items.filter((_, i) => i !== index);
      setItems(updatedItems);
    }
  };

  const calculateTotal = () => {
    return items.reduce((sum, item) => {
      return sum + (Number(item.quantidade) * Number(item.precoUnitario));
    }, 0);
  };

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <TextField
          select
          fullWidth
          label="Cliente"
          value={formData.clientId || ''}
          onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
          disabled={clientsLoading}
          required
        >
          {clients.map((client) => (
            <option key={client.id} value={client.id}>
              {client.name}
            </option>
          ))}
        </TextField>
      </Grid>
      
      <Grid item xs={12}>
        <TextField
          select
          fullWidth
          label="Status"
          value={formData.status || 'Pendente'}
          onChange={(e) => setFormData({ ...formData, status: e.target.value })}
          required
        >
          <option value="Pendente">Pendente</option>
          <option value="Em Produção">Em Produção</option>
          <option value="Finalizado">Finalizado</option>
          <option value="Entregue">Entregue</option>
          <option value="Cancelado">Cancelado</option>
        </TextField>
      </Grid>
      
      <Grid item xs={12}>
        <Typography variant="h6" gutterBottom>
          Itens do Pedido
        </Typography>
        
        {items.map((item, index) => (
          <Box key={index} sx={{ mb: 2, p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={5}>
                <TextField
                  select
                  fullWidth
                  label="Produto"
                  value={item.produto}
                  onChange={(e) => handleItemChange(index, 'produto', e.target.value)}
                  disabled={productsLoading}
                  required
                >
                  {products.map((product) => (
                    <option key={product.id} value={product.nome}>
                      {product.nome}
                    </option>
                  ))}
                </TextField>
              </Grid>
              
              <Grid item xs={6} sm={2}>
                <TextField
                  fullWidth
                  type="number"
                  label="Quantidade"
                  value={item.quantidade}
                  onChange={(e) => handleItemChange(index, 'quantidade', parseInt(e.target.value) || 1)}
                  inputProps={{ min: 1 }}
                  required
                />
              </Grid>
              
              <Grid item xs={6} sm={3}>
                <TextField
                  fullWidth
                  type="number"
                  label="Preço Unitário"
                  value={item.precoUnitario}
                  onChange={(e) => handleItemChange(index, 'precoUnitario', parseFloat(e.target.value) || 0)}
                  inputProps={{ min: 0, step: 0.01 }}
                  required
                />
              </Grid>
              
              <Grid item xs={12} sm={2} sx={{ display: 'flex', alignItems: 'center' }}>
                <Button 
                  color="error" 
                  onClick={() => removeItem(index)}
                  disabled={items.length <= 1}
                >
                  Remover
                </Button>
              </Grid>
            </Grid>
          </Box>
        ))}
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
          <Button 
            startIcon={<AddIcon />} 
            onClick={addItem}
          >
            Adicionar Item
          </Button>
          
          <Typography variant="h6">
            Total: R$ {calculateTotal().toFixed(2)}
          </Typography>
        </Box>
      </Grid>
    </Grid>
  );
};

const Orders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Estado para formulário e dialogs
  const [openOrderForm, setOpenOrderForm] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [formData, setFormData] = useState({ status: 'Pendente', items: [] });
  const [isEditMode, setIsEditMode] = useState(false); // Novo estado para controlar se está em modo de edição
  
  // Estado para clientes e produtos
  const [clients, setClients] = useState([]);
  const [products, setProducts] = useState([]);
  const [clientsLoading, setClientsLoading] = useState(false);
  const [productsLoading, setProductsLoading] = useState(false);
  
  // Paginação e filtros
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Carregar pedidos
  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await orderService.getAll();
      setOrders(response.data);
    } catch (err) {
      console.error('Erro ao carregar pedidos:', err);
      setError('Não foi possível carregar os pedidos. Tente novamente mais tarde.');
    } finally {
      setLoading(false);
    }
  };
  
  // Carregar clientes e produtos
  const fetchClientsAndProducts = async () => {
    try {
      setClientsLoading(true);
      setProductsLoading(true);
      
      const [clientsResponse, productsResponse] = await Promise.all([
        clientService.getAll(),
        productService.getAll()
      ]);
      
      setClients(clientsResponse.data);
      setProducts(productsResponse.data);
    } catch (err) {
      console.error('Erro ao carregar dados para formulário:', err);
      setError('Não foi possível carregar clientes e produtos. Tente novamente mais tarde.');
    } finally {
      setClientsLoading(false);
      setProductsLoading(false);
    }
  };
  
  // Efeito para carregar pedidos na inicialização
  useEffect(() => {
    fetchOrders();
  }, []);
  
  // Lidar com criação de pedido
  const handleCreateOrder = async (e) => {
    e.preventDefault();
    try {
      await orderService.create(formData);
      setOpenOrderForm(false);
      fetchOrders();
      setFormData({ status: 'Pendente', items: [] });
    } catch (err) {
      console.error('Erro ao criar pedido:', err);
      setError('Não foi possível criar o pedido. Verifique os dados e tente novamente.');
    }
  };
  
  // Lidar com edição de pedido
  const handleEditOrder = async (e) => {
    e.preventDefault();
    try {
      await orderService.update(selectedOrder.id, formData);
      setOpenOrderForm(false);
      fetchOrders();
      setFormData({ status: 'Pendente', items: [] });
      setSelectedOrder(null);
    } catch (err) {
      console.error('Erro ao editar pedido:', err);
      setError('Não foi possível editar o pedido. Verifique os dados e tente novamente.');
    }
  };
  
  // Lidar com exclusão de pedido
  const handleDeleteOrder = async () => {
    if (!selectedOrder) return;
    
    try {
      await orderService.delete(selectedOrder.id);
      setOpenDeleteDialog(false);
      setSelectedOrder(null);
      fetchOrders();
    } catch (err) {
      console.error('Erro ao excluir pedido:', err);
      setError('Não foi possível excluir o pedido. Tente novamente mais tarde.');
    }
  };
  
  // Gerar PDF do pedido
  const handleGeneratePDF = async (orderId) => {
    try {
      setError(null); // Limpar mensagens de erro anteriores
      
      // Feedback visual para o usuário
      setLoading(true);
      console.log(`Solicitando geração de PDF para o pedido: ${orderId}`);
      
      // Fazer a requisição com timeout aumentado
      const response = await orderService.generatePDF(orderId);
      
      if (!response.data || response.data.size === 0) {
        throw new Error('O PDF gerado está vazio ou inválido');
      }
      
      // Criar blob e abrir/baixar PDF
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      
      // Abrir em nova janela
      const pdfWindow = window.open(url, '_blank');
      
      // Verificar se o popup não foi bloqueado
      if (!pdfWindow || pdfWindow.closed || typeof pdfWindow.closed === 'undefined') {
        console.warn('Pop-up bloqueado. Tentando fazer download direto.');
        
        // Criar link para download direto
        const link = document.createElement('a');
        link.href = url;
        link.download = `pedido-${orderId}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
      
      // Limpar URL do objeto após uso
      setTimeout(() => window.URL.revokeObjectURL(url), 100);
      
    } catch (err) {
      console.error('Erro ao gerar PDF:', err);
      
      // Mensagem de erro mais específica
      if (err.response) {
        if (err.response.status === 404) {
          setError('Pedido não encontrado. Verifique se o pedido ainda existe no sistema.');
        } else {
          setError(`Erro ao gerar PDF: ${err.response.data?.message || err.response.status}`);
        }
      } else if (err.request) {
        setError('Não foi possível conectar ao servidor. Verifique sua conexão e tente novamente.');
      } else {
        setError(`Erro ao gerar PDF: ${err.message}`);
      }
    } finally {
      setLoading(false);
    }
  };
  
  // Abrir formulário de pedido
  const openCreateOrderForm = () => {
    fetchClientsAndProducts();
    setFormData({ status: 'Pendente', items: [{ produto: '', quantidade: 1, precoUnitario: 0 }] });
    setIsEditMode(false);
    setSelectedOrder(null);
    setOpenOrderForm(true);
  };
  
  // Abrir formulário para editar pedido
  const openEditOrderForm = (order) => {
    fetchClientsAndProducts();
    
    // Formatar os itens do pedido para o formulário
    const formattedItems = order.items.map(item => ({
      produto: item.produto,
      quantidade: item.quantidade || 1,
      precoUnitario: item.precoUnitario || 0
    }));
    
    setSelectedOrder(order);
    setFormData({
      clientId: order.clientId,
      status: order.status || 'Pendente',
      items: formattedItems
    });
    setIsEditMode(true);
    setOpenOrderForm(true);
  };
  
  // Filtrar pedidos pelo termo de busca
  const filteredOrders = orders.filter(order => {
    return (
      (order.clientName && order.clientName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (order.id && order.id.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (order.status && order.status.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  });
  
  // Controles de paginação
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };
  
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  
  // Cor do chip de status
  const getStatusColor = (status) => {
    switch (status) {
      case 'Pendente': return 'warning';
      case 'Em Produção': return 'info';
      case 'Finalizado': return 'success';
      case 'Entregue': return 'success';
      case 'Cancelado': return 'error';
      default: return 'default';
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Gerenciamento de Pedidos
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={8}>
          <TextField
            fullWidth
            placeholder="Buscar pedidos por cliente, id ou status..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Button
            fullWidth
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={openCreateOrderForm}
          >
            Novo Pedido
          </Button>
        </Grid>
      </Grid>
      
      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            <TableContainer sx={{ maxHeight: '60vh' }}>
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell>ID</TableCell>
                    <TableCell>Cliente</TableCell>
                    <TableCell>Data</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Itens</TableCell>
                    <TableCell align="right">Valor Total</TableCell>
                    <TableCell align="center">Ações</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredOrders
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((order) => {
                      // Calcular valor total do pedido
                      const total = order.items.reduce((sum, item) => {
                        return sum + (item.quantidade * item.precoUnitario);
                      }, 0);
                      
                      return (
                        <TableRow hover key={order.id}>
                          <TableCell>{order.id.substring(0, 8)}...</TableCell>
                          <TableCell>{order.clientName}</TableCell>
                          <TableCell>
                            {new Date(order.dataPedido).toLocaleDateString('pt-BR')}
                          </TableCell>
                          <TableCell>
                            <FormControl variant="standard" size="small">
                              <Select
                                value={order.status}
                                onChange={(e) => {
                                  const newStatus = e.target.value;
                                  orderService.updateStatus(order.id, newStatus)
                                    .then(() => {
                                      // Atualiza o status na lista local
                                      const updatedOrders = orders.map(o => 
                                        o.id === order.id ? {...o, status: newStatus} : o
                                      );
                                      setOrders(updatedOrders);
                                    })
                                    .catch(err => {
                                      console.error('Erro ao atualizar status:', err);
                                      setError('Não foi possível atualizar o status do pedido.');
                                    });
                                }}
                                renderValue={(selected) => (
                                  <Chip 
                                    label={selected} 
                                    color={getStatusColor(selected)}
                                    size="small"
                                  />
                                )}
                                sx={{ 
                                  minWidth: '120px',
                                  '& .MuiSelect-select': { 
                                    padding: 0,
                                    paddingRight: '24px' 
                                  },
                                  '&:before, &:after': { display: 'none' },
                                  '& .MuiSelect-icon': { right: 0 }
                                }}
                              >
                                <MenuItem value="Pendente">Pendente</MenuItem>
                                <MenuItem value="Em Produção">Em Produção</MenuItem>
                                <MenuItem value="Finalizado">Finalizado</MenuItem>
                                <MenuItem value="Entregue">Entregue</MenuItem>
                                <MenuItem value="Cancelado">Cancelado</MenuItem>
                              </Select>
                            </FormControl>
                          </TableCell>
                          <TableCell>{order.items.length} itens</TableCell>
                          <TableCell align="right">
                            R$ {total.toFixed(2)}
                          </TableCell>
                          <TableCell>
                            <Stack direction="row" spacing={1} justifyContent="center">
                              <IconButton 
                                size="small" 
                                color="primary"
                                onClick={() => navigate(`/orders/${order.id}`)}
                                title="Ver detalhes"
                              >
                                <ViewIcon />
                              </IconButton>
                              <IconButton 
                                size="small"
                                color="info"
                                onClick={() => openEditOrderForm(order)}
                                title="Editar pedido"
                              >
                                <EditIcon />
                              </IconButton>
                              <IconButton 
                                size="small"
                                color="secondary"
                                onClick={() => handleGeneratePDF(order.id)}
                                title="Gerar PDF"
                              >
                                <PdfIcon />
                              </IconButton>
                              <IconButton 
                                size="small" 
                                color="error"
                                onClick={() => {
                                  setSelectedOrder(order);
                                  setOpenDeleteDialog(true);
                                }}
                                title="Excluir pedido"
                              >
                                <DeleteIcon />
                              </IconButton>
                            </Stack>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  
                  {filteredOrders.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} align="center">
                        Nenhum pedido encontrado
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={filteredOrders.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              labelRowsPerPage="Itens por página:"
              labelDisplayedRows={({ from, to, count }) => 
                `${from}-${to} de ${count}`
              }
            />
          </>
        )}
      </Paper>
      
      {/* Diálogo de criação/edição de pedido */}
      <FormDialog
        open={openOrderForm}
        handleClose={() => {
          setOpenOrderForm(false);
          setIsEditMode(false);
          setSelectedOrder(null);
        }}
        title={isEditMode ? "Editar Pedido" : "Novo Pedido"}
        onSubmit={isEditMode ? handleEditOrder : handleCreateOrder}
        submitButtonText={isEditMode ? "Salvar Alterações" : "Criar Pedido"}
      >
        <OrderForm
          formData={formData}
          setFormData={setFormData}
          clients={clients}
          products={products}
          clientsLoading={clientsLoading}
          productsLoading={productsLoading}
        />
      </FormDialog>
      
      {/* Diálogo de confirmação de exclusão */}
      <ConfirmationDialog
        open={openDeleteDialog}
        handleClose={() => setOpenDeleteDialog(false)}
        title="Confirmar Exclusão"
        message={`Tem certeza que deseja excluir o pedido ${selectedOrder?.id}? Esta ação não pode ser desfeita.`}
        onConfirm={handleDeleteOrder}
        confirmButtonText="Excluir"
        confirmButtonColor="error"
      />
    </Box>
  );
};

export default Orders;
