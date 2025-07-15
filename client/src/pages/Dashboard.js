import React, { useState, useEffect } from 'react';
import { Typography, Grid, Box, Alert, CircularProgress, TextField, Button, Card, CardContent, CardHeader } from '@mui/material';
import { AssignmentOutlined, ShoppingCartOutlined, PersonOutlineOutlined, InventoryOutlined, CalendarToday, CalendarMonth, Refresh } from '@mui/icons-material';
import { DashboardCard, OrdersChart } from '../components/DashboardComponents';  // named import, sem default
import { Bar } from 'react-chartjs-2';  // importe Bar aqui!
import { dashboardService, materialService } from '../services/api';
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
  console.log('Componente Dashboard renderizado!');
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [summaryData, setSummaryData] = useState({
    totalOrders: 0,
    totalClients: 0,
    totalMaterials: 0,
    pendingOrders: 0
  });
  const [chartData, setChartData] = useState({ labels: [], datasets: [] });
  const [dailyRevenueChart, setDailyRevenueChart] = useState(null);
  const [monthlyRevenueChart, setMonthlyRevenueChart] = useState(null);
  
  // Estados para controlar a seleção de data/mês
  const today = new Date().toISOString().split('T')[0];
  const currentMonth = new Date().toISOString().slice(0, 7);
  const [selectedDate, setSelectedDate] = useState(today);
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [dailyLoading, setDailyLoading] = useState(false);
  const [monthlyLoading, setMonthlyLoading] = useState(false);

  // Função para buscar o faturamento diário
  const fetchDailyRevenue = async (date) => {
    try {
      setDailyLoading(true);
      const response = await dashboardService.getDailyRevenue(date);
      
      console.log('Resposta de faturamento diário:', response.data);
      
      if (response.data && response.data.orders && Array.isArray(response.data.orders) && response.data.orders.length > 0) {
        // Depurar valores do gráfico
        console.log('Valores para o gráfico diário:', 
          response.data.orders.map(order => ({
            cliente: order.clientName,
            valor: order.total,
            tipo: typeof order.total
          }))
        );
        
        // Garantir que todos os valores sejam numéricos e formatá-los para exibição
        const validOrders = response.data.orders.filter(order => order.total !== undefined && order.total !== null);
        
        const chartData = {
          labels: validOrders.map(order => {
            // Limitar o nome do cliente para não deixar o gráfico muito poluído
            const clientName = order.clientName || 'Cliente';
            return clientName.length > 15 ? clientName.substring(0, 15) + '...' : clientName;
          }),
          datasets: [{
            label: 'Total por Pedido (R$)',
            data: validOrders.map(order => {
              const value = Number(order.total);
              console.log(`Convertendo valor: ${order.total} => ${value} (${typeof value})`);
              return isNaN(value) ? 0 : value;
            }),
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

  const fetchMonthlyRevenue = async (month) => {
    try {
      setMonthlyLoading(true);
      const response = await dashboardService.getMonthlyRevenue(month);
      
      console.log('Resposta de faturamento mensal:', response.data);
      
      if (response.data && response.data.dailyData && Array.isArray(response.data.dailyData) && response.data.dailyData.length > 0) {
        // Depurar valores do gráfico
        console.log('Valores para o gráfico mensal:', 
          response.data.dailyData.map(day => ({
            data: day.date,
            valor: day.revenue,
            tipo: typeof day.revenue
          }))
        );
        
        // Filtrar dados inválidos
        const validDays = response.data.dailyData.filter(day => day.revenue !== undefined && day.revenue !== null);
        
        // Formatar as datas para exibição (DD/MM)
        const formatDateLabel = (dateString) => {
          try {
            const date = new Date(dateString);
            return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}`;
          } catch(e) {
            console.error('Erro ao formatar data:', e);
            return dateString;
          }
        };
        
        // Garantir que todos os valores sejam numéricos
        const chartData = {
          labels: validDays.map(day => formatDateLabel(day.date)),
          datasets: [{
            label: 'Faturamento por Dia (R$)',
            data: validDays.map(day => {
              const value = Number(day.revenue);
              console.log(`Convertendo valor: ${day.revenue} => ${value} (${typeof value})`);
              return isNaN(value) ? 0 : value;
            }),
            backgroundColor: 'rgba(255, 193, 7, 0.6)'
          }]
        };
        
        console.log('Chart data formatado:', chartData);
        setMonthlyRevenueChart(chartData);
      } else {
        setMonthlyRevenueChart({
          labels: ['Nenhum dado encontrado'],
          datasets: [{
            label: 'Faturamento por Dia (R$)',
            data: [0],
            backgroundColor: 'rgba(255, 193, 7, 0.6)'
          }]
        });
      }
    } catch (err) {
      console.error('Erro ao carregar faturamento mensal:', err);
      setError('Erro ao carregar dados de faturamento mensal.');
    } finally {
      setMonthlyLoading(false);
    }
  };

  useEffect(() => {
    console.log('Dashboard useEffect executado!');
    
    const fetchDashboardData = async () => {
      try {
        console.log('Iniciando fetch dos dados do dashboard...');
        setLoading(true);
        setError(null);

        console.log('Fazendo chamadas para API...');
        const [summaryRes, ordersPerDayRes, materialsRes] = await Promise.all([
          dashboardService.getSummary(),
          dashboardService.getOrdersPerDay(),
          materialService.getAll()
        ]);

        console.log('Dados recebidos:', { 
          summaryRes: summaryRes.data, 
          ordersPerDayRes: ordersPerDayRes.data,
          materialsRes: materialsRes.data
        });

        // Calcular o total de materiais em estoque
        const totalMaterials = materialsRes.data.reduce((total, material) => {
          return total + (material.estoque || 0);
        }, 0);

        // Atualizar o summaryData com a contagem de materiais
        setSummaryData({
          ...summaryRes.data,
          totalMaterials: totalMaterials
        });

        setChartData({
          labels: ordersPerDayRes.data.map(item => item.date),
          datasets: [{
            label: 'Pedidos',
            data: ordersPerDayRes.data.map(item => item.count),
            backgroundColor: 'rgba(25, 118, 210, 0.6)'
          }]
        });
        
        // Carregar os dados de faturamento diário e mensal
        await fetchDailyRevenue(selectedDate);
        await fetchMonthlyRevenue(selectedMonth);

      } catch (err) {
        console.error('Erro ao carregar dados do dashboard:', err);
        console.error('Erro detalhado:', err.response?.data || err.message);
        setError('Não foi possível carregar os dados do dashboard. Verifique o console para mais detalhes.');
      } finally {
        console.log('Finalizando carregamento...');
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [selectedDate, selectedMonth]);
  
  // Handler para atualizar a data selecionada para o faturamento diário
  const handleDateChange = (event) => {
    setSelectedDate(event.target.value);
  };
  
  // Handler para buscar dados do faturamento diário
  const handleFetchDailyRevenue = () => {
    fetchDailyRevenue(selectedDate);
  };
  
  // Handler para atualizar o mês selecionado para o faturamento mensal
  const handleMonthChange = (event) => {
    setSelectedMonth(event.target.value);
  };
  
  // Handler para buscar dados do faturamento mensal
  const handleFetchMonthlyRevenue = () => {
    fetchMonthlyRevenue(selectedMonth);
  };

  const renderDailyRevenueChart = () => (
    <Card sx={{ height: '100%', minHeight: 400 }}>
      <CardHeader 
        title="Faturamento Diário" 
        action={
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <TextField
              type="date"
              size="small"
              value={selectedDate}
              onChange={handleDateChange}
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
        }
      />
      <CardContent>
        <Box sx={{ height: 300 }}>
          {dailyLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
              <CircularProgress />
            </Box>
          ) : (
            <Bar
              data={dailyRevenueChart}
              options={{
                responsive: true,
                plugins: {
                  legend: { display: false }
                },
                scales: {
                  y: { 
                    beginAtZero: true,
                    title: {
                      display: true,
                      text: 'Valor (R$)'
                    }
                  }
                }
              }}
            />
          )}
        </Box>
      </CardContent>
    </Card>
  );
  
  const renderMonthlyRevenueChart = () => (
    <Card sx={{ height: '100%', minHeight: 400 }}>
      <CardHeader 
        title="Faturamento Mensal" 
        action={
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <TextField
              type="month"
              size="small"
              value={selectedMonth}
              onChange={handleMonthChange}
              InputProps={{ 
                startAdornment: <CalendarMonth fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} /> 
              }}
            />
            <Button 
              variant="contained" 
              color="primary" 
              size="small" 
              startIcon={<Refresh />}
              onClick={handleFetchMonthlyRevenue}
              disabled={monthlyLoading}
            >
              Atualizar
            </Button>
          </Box>
        }
      />
      <CardContent>
        <Box sx={{ height: 300 }}>
          {monthlyLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
              <CircularProgress />
            </Box>
          ) : (
            <Bar
              data={monthlyRevenueChart}
              options={{
                responsive: true,
                plugins: {
                  legend: { display: false }
                },
                scales: {
                  y: { 
                    beginAtZero: true,
                    title: {
                      display: true,
                      text: 'Valor (R$)'
                    }
                  }
                }
              }}
            />
          )}
        </Box>
      </CardContent>
    </Card>
  );

  return (
    <Box sx={{ 
      width: '100%',
      padding: 0
    }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 3, textAlign: 'center' }}>
        Dashboard - PE Digital
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      <Grid 
        container 
        spacing={3} 
        justifyContent="center" 
        alignItems="stretch"
        sx={{ mb: 4 }}
      >
        <Grid item xs={12} sm={6} md={3} sx={{ display: 'flex' }}>
          <DashboardCard 
            title="Total de Pedidos" 
            value={summaryData.totalOrders} 
            loading={loading} 
            icon={<ShoppingCartOutlined />} 
            color="primary" 
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3} sx={{ display: 'flex' }}>
          <DashboardCard 
            title="Total de Clientes" 
            value={summaryData.totalClients} 
            loading={loading} 
            icon={<PersonOutlineOutlined />} 
            color="success" 
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3} sx={{ display: 'flex' }}>
          <DashboardCard 
            title="Materiais em Estoque" 
            value={summaryData.totalMaterials} 
            loading={loading} 
            icon={<InventoryOutlined />} 
            color="info" 
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3} sx={{ display: 'flex' }}>
          <DashboardCard 
            title="Pedidos Pendentes" 
            value={summaryData.pendingOrders} 
            loading={loading} 
            icon={<AssignmentOutlined />} 
            color="warning" 
          />
        </Grid>
      </Grid>

      {/* Gráficos */}
      <Grid 
        container 
        spacing={3} 
        justifyContent="center"
        sx={{ mt: 4 }}
      >
        <Grid item xs={12} md={6}>
          <OrdersChart data={chartData} loading={loading} />
        </Grid>

        <Grid item xs={12} md={6}>
          {renderDailyRevenueChart()}
        </Grid>

        <Grid item xs={12}>
          {renderMonthlyRevenueChart()}
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
