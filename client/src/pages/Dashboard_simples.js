import React, { useState, useEffect } from 'react';
import { Typography, Grid, Box, Alert, CircularProgress, Card, CardContent, TextField, Button } from '@mui/material';
import { AssignmentOutlined, ShoppingCartOutlined, PersonOutlineOutlined, InventoryOutlined, CalendarToday, Refresh } from '@mui/icons-material';
import { dashboardService } from '../services/api';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// Registrar componentes do Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const Dashboard = () => {
  console.log('Dashboard renderizado!');
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [summaryData, setSummaryData] = useState({
    totalOrders: 0,
    totalClients: 0,
    totalProducts: 0,
    pendingOrders: 0
  });
  
  // Estados para o faturamento diário
  const today = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState(today);
  const [dailyLoading, setDailyLoading] = useState(false);
  const [dailyRevenueData, setDailyRevenueData] = useState(null);
  const [dailyRevenueChart, setDailyRevenueChart] = useState(null);
  
  // Estados para pedidos por dia
  const [ordersPerDayLoading, setOrdersPerDayLoading] = useState(false);
  const [ordersPerDayData, setOrdersPerDayData] = useState(null);

  // Função para buscar o faturamento diário
  const fetchDailyRevenue = async (date) => {
    try {
      setDailyLoading(true);
      const response = await dashboardService.getDailyRevenue(date);
      
      console.log('Resposta de faturamento diário:', response.data);
      setDailyRevenueData(response.data);
      
      if (response.data && response.data.orders && Array.isArray(response.data.orders) && response.data.orders.length > 0) {
        // Garantir que todos os valores sejam numéricos
        const chartData = {
          labels: response.data.orders.map(order => order.clientName),
          datasets: [{
            label: 'Total por Pedido (R$)',
            data: response.data.orders.map(order => Number(order.total) || 0),
            backgroundColor: 'rgba(40, 167, 69, 0.6)'
          }]
        };
        
        console.log('Chart data formatado:', chartData);
        setDailyRevenueChart(chartData);
      } else {
        setDailyRevenueChart({
          labels: ['Nenhum pedido encontrado'],
          datasets: [{
            label: 'Total por Pedido (R$)',
            data: [0],
            backgroundColor: 'rgba(40, 167, 69, 0.6)'
          }]
        });
      }
    } catch (err) {
      console.error('Erro ao carregar faturamento diário:', err);
      setError('Erro ao carregar dados de faturamento diário.');
    } finally {
      setDailyLoading(false);
    }
  };
  
  // Handler para atualizar a data selecionada para o faturamento diário
  const handleDateChange = (event) => {
    setSelectedDate(event.target.value);
  };
  
  // Handler para buscar dados do faturamento diário
  const handleFetchDailyRevenue = () => {
    fetchDailyRevenue(selectedDate);
  };

  useEffect(() => {
    console.log('Dashboard useEffect executado!');
    
    const fetchData = async () => {
      try {
        console.log('Iniciando fetch...');
        setLoading(true);
        setError(null);

        const response = await dashboardService.getSummary();
        console.log('Dados recebidos:', response.data);
        
        setSummaryData(response.data);
        
        // Carregar os dados de faturamento diário para a data atual
        fetchDailyRevenue(selectedDate);
      } catch (err) {
        console.error('Erro:', err);
        setError('Erro ao carregar dados: ' + (err.message || 'Erro desconhecido'));
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
        <Typography variant="h6" sx={{ ml: 2 }}>Carregando dashboard...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box>
        <Alert severity="error">{error}</Alert>
        <Typography variant="body1" sx={{ mt: 2 }}>
          Verifique se o backend está rodando na porta 3001 e tente novamente.
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Dashboard - PE Digital
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <AssignmentOutlined color="primary" sx={{ mr: 2, fontSize: 40 }} />
                <Box>
                  <Typography variant="h6">Total de Pedidos</Typography>
                  <Typography variant="h4">{summaryData.totalOrders}</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <PersonOutlineOutlined color="secondary" sx={{ mr: 2, fontSize: 40 }} />
                <Box>
                  <Typography variant="h6">Total de Clientes</Typography>
                  <Typography variant="h4">{summaryData.totalClients}</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <InventoryOutlined color="success" sx={{ mr: 2, fontSize: 40 }} />
                <Box>
                  <Typography variant="h6">Total de Produtos</Typography>
                  <Typography variant="h4">{summaryData.totalProducts}</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <ShoppingCartOutlined color="warning" sx={{ mr: 2, fontSize: 40 }} />
                <Box>
                  <Typography variant="h6">Pedidos Pendentes</Typography>
                  <Typography variant="h4">{summaryData.pendingOrders}</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      {/* Seção de Faturamento Diário */}
      <Box mt={4}>
        <Card>
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6">
                Faturamento Diário
              </Typography>
              <Box display="flex" alignItems="center">
                <TextField
                  type="date"
                  size="small"
                  value={selectedDate}
                  onChange={handleDateChange}
                  sx={{ mr: 1 }}
                  InputProps={{ 
                    startAdornment: <CalendarToday fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} /> 
                  }}
                />
                <Button 
                  variant="contained" 
                  color="primary" 
                  size="small" 
                  startIcon={<Refresh />}
                  onClick={handleFetchDailyRevenue}
                  disabled={dailyLoading}
                >
                  Atualizar
                </Button>
              </Box>
            </Box>
            
            {dailyLoading ? (
              <Box display="flex" justifyContent="center" p={3}>
                <CircularProgress />
              </Box>
            ) : (
              <>
                {dailyRevenueData && (
                  <Box mb={3}>
                    <Typography variant="h5" color="primary">
                      Total do dia: R$ {dailyRevenueData.revenue ? dailyRevenueData.revenue.toFixed(2) : '0.00'}
                    </Typography>
                    <Typography variant="subtitle1">
                      {dailyRevenueData.date} - {dailyRevenueData.ordersCount || 0} pedidos
                    </Typography>
                  </Box>
                )}
                
                {dailyRevenueChart && (
                  <Box sx={{ height: 300 }}>
                    <Bar
                      data={dailyRevenueChart}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: { display: false },
                          title: { display: true, text: 'Valor dos pedidos do dia' }
                        },
                        scales: {
                          y: { 
                            beginAtZero: true,
                            title: { display: true, text: 'Valor (R$)' }
                          }
                        }
                      }}
                    />
                  </Box>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
};

export default Dashboard;
