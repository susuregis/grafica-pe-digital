import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Typography, 
  Box, 
  Paper, 
  Grid,
  Chip,
  Button,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import { 
  ArrowBack as ArrowBackIcon,
  PictureAsPdf as PdfIcon,
} from '@mui/icons-material';
import { orderService } from '../services/api';

const OrderDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statusLoading, setStatusLoading] = useState(false);
  const [error, setError] = useState(null);
  const [status, setStatus] = useState('');
    // Buscar detalhes do pedido
  const fetchOrderDetails = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await orderService.getById(id);
      setOrder(response.data);
      setStatus(response.data.status);
    } catch (err) {
      console.error('Erro ao carregar detalhes do pedido:', err);
      setError('Não foi possível carregar os detalhes do pedido. Tente novamente mais tarde.');
    } finally {
      setLoading(false);
    }
  }, [id]);
    // Carregar pedido ao inicializar
  useEffect(() => {
    if (id) {
      fetchOrderDetails();
    }
  }, [id, fetchOrderDetails]);
  
  // Atualizar status do pedido
  const handleStatusChange = async (e) => {
    const newStatus = e.target.value;
    try {
      setStatusLoading(true);
      await orderService.updateStatus(id, newStatus);
      setStatus(newStatus);
      setOrder({ ...order, status: newStatus });
    } catch (err) {
      console.error('Erro ao atualizar status:', err);
      setError('Não foi possível atualizar o status do pedido.');
    } finally {
      setStatusLoading(false);
    }
  };
  
  // Gerar PDF do pedido
  const handleGeneratePDF = async () => {
    try {
      const response = await orderService.generatePDF(id);
      
      // Criar blob e abrir/baixar PDF
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      window.open(url);
    } catch (err) {
      console.error('Erro ao gerar PDF:', err);
      setError('Não foi possível gerar o PDF. Tente novamente mais tarde.');
    }
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
  
  // Calcular valor total do pedido
  const calculateTotal = (items) => {
    return items.reduce((sum, item) => {
      const quantidade = item.quantidade || 0;
      const precoUnitario = item.precoUnitario || 0;
      return sum + (quantidade * precoUnitario);
    }, 0);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Button 
          startIcon={<ArrowBackIcon />} 
          onClick={() => navigate('/orders')}
          sx={{ mr: 2 }}
        >
          Voltar
        </Button>
        <Typography variant="h4">
          Detalhes do Pedido
        </Typography>
      </Box>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      ) : order ? (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={12} sm={6}>
                    <Typography variant="overline">ID do Pedido</Typography>
                    <Typography variant="h6">{order.id}</Typography>
                  </Grid>
                  
                  <Grid item xs={12} sm={3}>
                    <Typography variant="overline">Data</Typography>
                    <Typography variant="body1">
                      {new Date(order.dataPedido).toLocaleDateString('pt-BR')}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={12} sm={3} sx={{ display: 'flex', justifyContent: { xs: 'flex-start', sm: 'flex-end' } }}>
                    <Button 
                      variant="outlined" 
                      startIcon={<PdfIcon />}
                      onClick={handleGeneratePDF}
                    >
                      Gerar PDF
                    </Button>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Informações do Cliente
                </Typography>
                
                <Typography variant="body1" sx={{ mb: 1 }}>
                  <strong>Nome:</strong> {order.clientName}
                </Typography>
                
                <Typography variant="body1">
                  <strong>Email:</strong> {order.clientEmail}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Status do Pedido
                </Typography>
                
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Chip 
                    label={status} 
                    color={getStatusColor(status)} 
                    sx={{ mr: 2 }} 
                  />
                  
                  <FormControl variant="outlined" size="small" sx={{ minWidth: 200 }}>
                    <InputLabel>Atualizar Status</InputLabel>
                    <Select
                      value={status}
                      onChange={handleStatusChange}
                      label="Atualizar Status"
                      disabled={statusLoading}
                    >
                      <MenuItem value="Pendente">Pendente</MenuItem>
                      <MenuItem value="Em Produção">Em Produção</MenuItem>
                      <MenuItem value="Finalizado">Finalizado</MenuItem>
                      <MenuItem value="Entregue">Entregue</MenuItem>
                      <MenuItem value="Cancelado">Cancelado</MenuItem>
                    </Select>
                  </FormControl>
                  
                  {statusLoading && (
                    <CircularProgress size={20} sx={{ ml: 2 }} />
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Itens do Pedido
                </Typography>
                
                <TableContainer component={Paper} sx={{ boxShadow: 'none' }}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Produto</TableCell>
                        <TableCell align="right">Qtd</TableCell>
                        <TableCell align="right">Preço Unit.</TableCell>
                        <TableCell align="right">Subtotal</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {order.items.map((item, index) => {
                        const quantidade = item.quantidade || 0;
                        const precoUnitario = item.precoUnitario || 0;
                        const subtotal = quantidade * precoUnitario;
                        
                        return (
                          <TableRow key={index}>
                            <TableCell>{item.produto}</TableCell>
                            <TableCell align="right">{quantidade}</TableCell>
                            <TableCell align="right">R$ {precoUnitario.toFixed(2)}</TableCell>
                            <TableCell align="right">R$ {subtotal.toFixed(2)}</TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
                
                <Divider sx={{ my: 2 }} />
                
                <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <Typography variant="h6">
                    Total: R$ {calculateTotal(order.items).toFixed(2)}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      ) : (
        <Alert severity="warning">
          Pedido não encontrado
        </Alert>
      )}
    </Box>
  );
};

export default OrderDetails;
